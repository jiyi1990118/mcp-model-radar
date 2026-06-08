import { getModelsBySize } from '../db/queries-sqlite.js';

interface GetModelsBySizeArgs {
  minParams?: string;
  maxParams?: string;
  limit?: number;
}

export default async function getModelsBySizeHandler(args: GetModelsBySizeArgs) {
  console.error(`[get_models_by_size] Fetching models with size range [${args.minParams || 'any'}, ${args.maxParams || 'any'}], limit ${args.limit || 20}...`);

  const models = getModelsBySize(args.minParams || null, args.maxParams || null, args.limit || 20);

  console.error(`[get_models_by_size] Successfully returned ${models.length} models`);

  return {
    success: true,
    count: models.length,
    data: models,
    metadata: {
      minParams: args.minParams || null,
      maxParams: args.maxParams || null,
      limit: args.limit || 20,
      timestamp: new Date().toISOString()
    }
  };
}
