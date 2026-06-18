// src/analysis/report-generator.ts
import { getModels } from '../db/index.js';
import { getTrendingChanges } from '../db/index.js';
import { getGithubTrending } from '../db/index.js';
import { detectDarkHorseModels } from './darkhorse-detector.js';

export async function generateModelReport(period: 'weekly' | 'monthly' = 'weekly'): Promise<any> {
  console.error(`[report-generator] Generating ${period} report...`);

  const periodDays = period === 'weekly' ? 7 : 30;
  const periodLabel = period === 'weekly' ? 'week' : 'month';

  const [
    topModels,
    trendingChanges,
    githubTrending,
    darkHorses
  ] = await Promise.all([
    getModels(20, 'trend_score DESC'),
    getTrendingChanges(`${periodDays}d`, 'trend_score'),
    getGithubTrending(10),
    detectDarkHorseModels(5)
  ]);

  // Extract rising and falling models
  const rising = (trendingChanges as any[])
    .filter((c: any) => c.absolute_change > 0)
    .slice(0, 10);

  const falling = (trendingChanges as any[])
    .filter((c: any) => c.absolute_change < 0)
    .sort((a: any, b: any) => a.absolute_change - b.absolute_change)
    .slice(0, 10);

  const summary = generateSummary(topModels, rising, darkHorses, periodLabel);

  return {
    success: true,
    period: periodLabel,
    generated_at: new Date().toISOString(),
    summary,
    sections: {
      top_models: topModels.slice(0, 10).map((m: any) => ({
        model_id: m.model_id,
        name: m.name,
        author: m.author,
        downloads: m.downloads,
        trend_score: m.trend_score,
        params: m.params
      })),
      rising,
      falling,
      dark_horses: darkHorses,
      github_trending: githubTrending.slice(0, 10).map((r: any) => ({
        repo: r.repo_full_name,
        stars: r.stars,
        description: r.description,
        language: r.language
      }))
    }
  };
}

function generateSummary(
  topModels: any[],
  rising: any[],
  darkHorses: any[],
  period: string
): string {
  const parts: string[] = [];

  if (topModels.length > 0) {
    parts.push(`Top model this ${period}: ${topModels[0].name} by ${topModels[0].author}`);
  }

  if (rising.length > 0) {
    const topRiser = rising[0];
    parts.push(`Fastest riser: ${topRiser.name} (${topRiser.growth_rate} growth)`);
  }

  if (darkHorses.length > 0) {
    const topDark = darkHorses[0];
    parts.push(`Dark horse pick: ${topDark.name} (score: ${topDark.darkhorse_score}/100)`);
  }

  return parts.join('. ') + '.';
}
