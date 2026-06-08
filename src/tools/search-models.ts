import { searchModels as dbSearchModels } from '../db/index.js';
import { searchHFModels } from '../api/huggingface-api.js';
import { isDatabaseAvailable } from '../utils/db-check.js';
import { upsertModel, insertMetrics } from '../db/index.js';

export async function searchModels(args: any) {
  const keyword = args.keyword;
  const filters = args.filters || {};
  const sortBy = args.sort_by || 'trend_score';
  const limit = args.limit || 50;
  let source = 'database';
  let models: any[] = [];

  console.log(`[search_models] Searching: "${keyword}", filters: ${JSON.stringify(filters)}, sort: ${sortBy}, limit: ${limit}`);

  const dbAvailable = isDatabaseAvailable();

  // Try database first
  if (dbAvailable) {
    try {
      models = await dbSearchModels(keyword, filters, sortBy, limit);
      if (models.length > 0) {
        console.log(`[search_models] Found ${models.length} models in database`);
      } else {
        console.log(`[search_models] No results in database, trying HuggingFace API...`);
        source = 'api';
      }
    } catch (error: any) {
      console.log(`[search_models] Database query failed, trying API...`);
      source = 'api';
    }
  } else {
    console.log(`[search_models] Database not configured, using API mode`);
    source = 'api';
  }

  // API fallback
  if (source === 'api') {
    try {
      models = await searchHFModels(keyword, limit);
      console.log(`[search_models] Found ${models.length} models from HuggingFace API`);
      source = 'huggingface';

      // Sync to database if available
      if (dbAvailable && models.length > 0) {
        console.log(`[search_models] Syncing ${models.length} models to database...`);
        await Promise.all(models.map(async (model) => {
          try {
            await upsertModel(model);
            await insertMetrics(model.model_id, model.downloads, model.likes, 0);
          } catch (e) {
            // Ignore sync errors
          }
        }));
      }
    } catch (error: any) {
      console.error(`[search_models] HuggingFace API failed:`, error.message);
      throw new Error(`Failed to search models: ${error.message}`);
    }
  }

  const result = models.map((m: any) => ({
    model_id: m.model_id,
    name: m.name,
    author: m.author,
    downloads: m.downloads,
    likes: m.likes,
    trend_score: m.trend_score || 0,
    license: m.license,
    context_length: m.context_length,
    tags: m.tags,
    created_at: m.created_at
  }));

  console.log(`[search_models] Returning ${result.length} models (source: ${source})`);

  return {
    success: true,
    keyword: keyword,
    count: result.length,
    source: source,
    data: result,
    metadata: {
      query_time: new Date().toISOString(),
      limit: limit
    }
  };
}
