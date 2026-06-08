import { getModels } from '../db/index.js';

export async function getHotModels(args: any) {
  const limit = args.limit || 20;

  console.log(`[get_hot_models] Fetching top ${limit} trending models...`);

  try {
    const models = await getModels(limit, 'mm.trend_score DESC NULLS LAST');

    const result = models.map((m: any) => ({
      model_id: m.model_id,
      name: m.name,
      author: m.author,
      trend_score: m.trend_score || 0,
      downloads: m.downloads,
      likes: m.likes,
      license: m.license,
      context_length: m.context_length,
      tags: m.tags,
      created_at: m.created_at
    }));

    console.log(`[get_hot_models] Successfully returned ${result.length} models`);

    return {
      success: true,
      count: result.length,
      data: result,
      metadata: {
        query_time: new Date().toISOString(),
        sort_by: 'trend_score',
        limit: limit
      }
    };
  } catch (error: any) {
    console.error(`[get_hot_models] Error:`, error.message);
    throw new Error(`Failed to fetch hot models: ${error.message}`);
  }
}
