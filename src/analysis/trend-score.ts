import { getDefaultDbPath } from '../utils/db-path.js';

// Trend score weights
const DOWNLOAD_WEIGHT = 0.6;
const LIKE_WEIGHT = 0.4;
const MAX_SCORE = 100;

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

export async function calculateTrendScores() {
  console.error('Calculating trend scores...');

  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'sqlite') {
    await calculateTrendScoresSQLite();
  } else {
    await calculateTrendScoresPostgres();
  }
}

async function calculateTrendScoresSQLite() {
  const Database = (await import('better-sqlite3')).default;
  const dbPath = process.env.SQLITE_DB_PATH || getDefaultDbPath();
  const db = new Database(dbPath);

  try {
    const rows = db.prepare(`
      SELECT
        m.model_id,
        mm_current.downloads as current_downloads,
        mm_current.likes as current_likes,
        mm_week_ago.downloads as week_ago_downloads,
        mm_week_ago.likes as week_ago_likes
      FROM models m
      JOIN model_metrics mm_current ON mm_current.model_id = m.model_id
        AND mm_current.snapshot_date = (SELECT MAX(snapshot_date) FROM model_metrics WHERE model_id = m.model_id)
      LEFT JOIN model_metrics mm_week_ago ON mm_week_ago.model_id = m.model_id
        AND mm_week_ago.snapshot_date = (
          SELECT MAX(snapshot_date) FROM model_metrics
          WHERE model_id = m.model_id AND snapshot_date < datetime('now', '-7 days')
        )
      WHERE mm_current.downloads IS NOT NULL
    `).all() as any[];

    const updateStmt = db.prepare(`
      UPDATE model_metrics SET trend_score = ?
      WHERE model_id = ? AND snapshot_date = (
        SELECT MAX(snapshot_date) FROM model_metrics WHERE model_id = ?
      )
    `);

    const updateMany = db.transaction((models: any[]) => {
      for (const row of models) {
        const downloadGrowth = calculateGrowth(
          row.current_downloads || 0,
          row.week_ago_downloads || row.current_downloads || 0
        );
        const likeGrowth = calculateGrowth(
          row.current_likes || 0,
          row.week_ago_likes || row.current_likes || 0
        );

        const trendScore = Math.min(Math.max((DOWNLOAD_WEIGHT * downloadGrowth) + (LIKE_WEIGHT * likeGrowth), 0), MAX_SCORE);
        updateStmt.run(trendScore.toFixed(2), row.model_id, row.model_id);
      }
    });

    updateMany(rows);
    console.error(`Trend scores calculated for ${rows.length} models (SQLite)`);
  } finally {
    db.close();
  }
}

async function calculateTrendScoresPostgres() {
  const { default: pool } = await import('../db/connection.js');

  try {
    const query = `
      SELECT
        m.model_id,
        mm_current.downloads as current_downloads,
        mm_current.likes as current_likes,
        mm_week_ago.downloads as week_ago_downloads,
        mm_week_ago.likes as week_ago_likes
      FROM models m
      LEFT JOIN LATERAL (
        SELECT downloads, likes FROM model_metrics
        WHERE model_id = m.model_id
        ORDER BY snapshot_date DESC LIMIT 1
      ) mm_current ON true
      LEFT JOIN LATERAL (
        SELECT downloads, likes FROM model_metrics
        WHERE model_id = m.model_id
        AND snapshot_date < NOW() - INTERVAL '7 days'
        ORDER BY snapshot_date DESC LIMIT 1
      ) mm_week_ago ON true
      WHERE mm_current.downloads IS NOT NULL;
    `;

    const result = await pool.query(query);

    for (const row of result.rows) {
      const downloadGrowth = calculateGrowth(
        row.current_downloads || 0,
        row.week_ago_downloads || row.current_downloads || 0
      );
      const likeGrowth = calculateGrowth(
        row.current_likes || 0,
        row.week_ago_likes || row.current_likes || 0
      );

      const trendScore = Math.min(Math.max((DOWNLOAD_WEIGHT * downloadGrowth) + (LIKE_WEIGHT * likeGrowth), 0), MAX_SCORE);

      await pool.query(
        'UPDATE model_metrics SET trend_score = $1 WHERE model_id = $2 AND snapshot_date = (SELECT MAX(snapshot_date) FROM model_metrics WHERE model_id = $2)',
        [trendScore.toFixed(2), row.model_id]
      );
    }

    console.error(`Trend scores calculated for ${result.rows.length} models (PostgreSQL)`);
  } catch (error) {
    console.error('Trend score calculation failed:', error);
  }
}
