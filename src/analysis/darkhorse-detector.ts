// src/analysis/darkhorse-detector.ts
import { getDefaultDbPath } from '../utils/db-path.js';

/**
 * Dark Horse Score = unexpectedly surging models.
 *
 * Formula:
 *   Burst Signal (40%): ratio of 3-day growth rate to 30-day average growth rate
 *   Underdog Factor (30%): 1 - (current downloads / category top-10 median)
 *   Cross-Source Signal (30%): GitHub star velocity + trend consistency
 *
 * Scale: 0-100. Higher = more likely to be a "dark horse" breakout model.
 */

const BURST_WEIGHT = 0.4;
const UNDERDOG_WEIGHT = 0.3;
const CROSS_SOURCE_WEIGHT = 0.3;
const MAX_SCORE = 100;

export interface DarkHorseResult {
  model_id: string;
  name: string;
  author: string;
  darkhorse_score: number;
  burst_signal: number;
  underdog_factor: number;
  cross_source_signal: number;
  current_downloads: number;
  current_trend: number;
  github_stars: number;
}

export async function detectDarkHorseModels(limit: number = 10): Promise<DarkHorseResult[]> {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'sqlite') {
    return detectDarkHorseSQLite(limit);
  } else {
    return detectDarkHorsePostgres(limit);
  }
}

async function detectDarkHorseSQLite(limit: number): Promise<DarkHorseResult[]> {
  const Database = (await import('better-sqlite3')).default;
  const dbPath = process.env.SQLITE_DB_PATH || getDefaultDbPath();
  const db = new Database(dbPath);

  try {
    // Get recent metrics with growth rates
    const rows = db.prepare(`
      SELECT
        m.model_id, m.name, m.author,
        mm.downloads, mm.likes, mm.trend_score,
        COALESCE(gr.stars, 0) as github_stars
      FROM models m
      JOIN model_metrics mm ON mm.model_id = m.model_id
        AND mm.snapshot_date = (SELECT MAX(snapshot_date) FROM model_metrics WHERE model_id = m.model_id)
      LEFT JOIN github_repos gr ON gr.model_id = m.model_id
      WHERE mm.downloads > 0
      ORDER BY mm.downloads DESC
    `).all() as any[];

    if (rows.length === 0) return [];

    // Calculate top-10 median downloads for underdog factor
    const topDownloads = rows.slice(0, 10).map((r: any) => r.downloads).sort((a: number, b: number) => a - b);
    const medianDownloads = topDownloads.length >= 5
      ? topDownloads[Math.floor(topDownloads.length / 2)]
      : topDownloads[topDownloads.length - 1] || 1;

    // Get 3-day and 30-day growth for burst signal
    const recentGrowth = db.prepare(`
      SELECT model_id,
        AVG(downloads) as avg_recent_downloads
      FROM model_metrics
      WHERE snapshot_date >= datetime('now', '-3 days')
      GROUP BY model_id
    `).all() as any[];
    const recentMap = new Map(recentGrowth.map((r: any) => [r.model_id, r.avg_recent_downloads]));

    const monthGrowth = db.prepare(`
      SELECT model_id,
        AVG(downloads) as avg_month_downloads
      FROM model_metrics
      WHERE snapshot_date >= datetime('now', '-30 days')
      GROUP BY model_id
    `).all() as any[];
    const monthMap = new Map(monthGrowth.map((r: any) => [r.model_id, r.avg_month_downloads]));

    const results: DarkHorseResult[] = rows.map((r: any) => {
      const recent = recentMap.get(r.model_id) || r.downloads;
      const month = monthMap.get(r.model_id) || r.downloads || 1;

      // Burst signal: how much faster is recent growth vs monthly average
      const burstSignal = Math.min((recent / Math.max(month, 1)) * 50, 100);

      // Underdog factor: lower downloads relative to top models = higher potential
      const underdogFactor = Math.min((1 - Math.min(r.downloads / Math.max(medianDownloads, 1), 0.95)) * 100, 100);

      // Cross-source signal: trend score + GitHub stars
      const trendNorm = Math.min((r.trend_score || 0) / 100, 1);
      const githubNorm = Math.min((r.github_stars || 0) / 50000, 1);
      const crossSourceSignal = (trendNorm * 50 + githubNorm * 50);

      const score = Math.round(
        Math.min(
          BURST_WEIGHT * burstSignal +
          UNDERDOG_WEIGHT * underdogFactor +
          CROSS_SOURCE_WEIGHT * crossSourceSignal,
          MAX_SCORE
        )
      );

      return {
        model_id: r.model_id,
        name: r.name,
        author: r.author,
        darkhorse_score: score,
        burst_signal: Math.round(burstSignal),
        underdog_factor: Math.round(underdogFactor),
        cross_source_signal: Math.round(crossSourceSignal),
        current_downloads: r.downloads,
        current_trend: r.trend_score || 0,
        github_stars: r.github_stars || 0
      };
    });

    results.sort((a, b) => b.darkhorse_score - a.darkhorse_score);
    return results.slice(0, limit);
  } finally {
    db.close();
  }
}

async function detectDarkHorsePostgres(limit: number): Promise<DarkHorseResult[]> {
  const { default: pool } = await import('../db/connection.js');

  try {
    const { rows } = await pool.query(`
      SELECT
        m.model_id, m.name, m.author,
        mm.downloads, mm.likes, mm.trend_score,
        COALESCE(gr.stars, 0) as github_stars
      FROM models m
      JOIN LATERAL (
        SELECT downloads, likes, trend_score FROM model_metrics
        WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1
      ) mm ON true
      LEFT JOIN github_repos gr ON gr.model_id = m.model_id
      WHERE mm.downloads > 0
      ORDER BY mm.downloads DESC
    `);

    if (rows.length === 0) return [];

    const topDownloads = rows.slice(0, 10).map((r: any) => r.downloads).sort((a: number, b: number) => a - b);
    const medianDownloads = topDownloads.length >= 5
      ? topDownloads[Math.floor(topDownloads.length / 2)]
      : topDownloads[topDownloads.length - 1] || 1;

    const { rows: recentRows } = await pool.query(`
      SELECT model_id, AVG(downloads) as avg_recent
      FROM model_metrics
      WHERE snapshot_date >= NOW() - INTERVAL '3 days'
      GROUP BY model_id
    `);
    const recentMap = new Map(recentRows.map((r: any) => [r.model_id, r.avg_recent]));

    const { rows: monthRows } = await pool.query(`
      SELECT model_id, AVG(downloads) as avg_month
      FROM model_metrics
      WHERE snapshot_date >= NOW() - INTERVAL '30 days'
      GROUP BY model_id
    `);
    const monthMap = new Map(monthRows.map((r: any) => [r.model_id, r.avg_month]));

    const results: DarkHorseResult[] = rows.map((r: any) => {
      const recent = recentMap.get(r.model_id) || r.downloads;
      const month = monthMap.get(r.model_id) || r.downloads || 1;

      const burstSignal = Math.min((recent / Math.max(month, 1)) * 50, 100);
      const underdogFactor = Math.min((1 - Math.min(r.downloads / Math.max(medianDownloads, 1), 0.95)) * 100, 100);
      const trendNorm = Math.min((r.trend_score || 0) / 100, 1);
      const githubNorm = Math.min((r.github_stars || 0) / 50000, 1);
      const crossSourceSignal = (trendNorm * 50 + githubNorm * 50);

      const score = Math.round(
        Math.min(
          BURST_WEIGHT * burstSignal +
          UNDERDOG_WEIGHT * underdogFactor +
          CROSS_SOURCE_WEIGHT * crossSourceSignal,
          MAX_SCORE
        )
      );

      return {
        model_id: r.model_id, name: r.name, author: r.author,
        darkhorse_score: score,
        burst_signal: Math.round(burstSignal),
        underdog_factor: Math.round(underdogFactor),
        cross_source_signal: Math.round(crossSourceSignal),
        current_downloads: r.downloads,
        current_trend: r.trend_score || 0,
        github_stars: r.github_stars || 0
      };
    });

    results.sort((a, b) => b.darkhorse_score - a.darkhorse_score);
    return results.slice(0, limit);
  } finally {
    // Don't close pool — it's shared
  }
}
