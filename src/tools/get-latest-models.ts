import { getModels } from '../db/index.js';

export async function getLatestModels(args: any) {
  const hours = args.hours || 24;
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  console.error(`[get_latest_models] Fetching models from last ${hours} hours (since ${cutoffDate})`);

  try {
    // Fetch up to 100 recent models, then filter by date in SQL
    // Note: SQLite stores dates as ISO strings, so string comparison works correctly
    const models = await getModels(100, 'm.created_at DESC');

    const filtered = models.filter((m: any) => m.created_at && m.created_at > cutoffDate);

    const result = filtered.map((m: any) => ({
      model_id: m.model_id,
      name: m.name,
      author: m.author,
      created_at: m.created_at,
      downloads: m.downloads,
      likes: m.likes,
      trend_score: m.trend_score || 0,
      license: m.license,
      context_length: m.context_length,
      tags: m.tags
    }));

    console.error(`[get_latest_models] Found ${result.length} models released in last ${hours} hours`);

    return {
      success: true,
      count: result.length,
      timeframe: `${hours} hours`,
      cutoff_date: cutoffDate,
      data: result,
      metadata: {
        query_time: new Date().toISOString(),
        hours: hours
      }
    };
  } catch (error: any) {
    console.error(`[get_latest_models] Error:`, error.message);
    throw new Error(`Failed to fetch latest models: ${error.message}`);
  }
}
