import { getModelsByType } from '../db/index.js';

interface GetModelsByTypeArgs {
  type: string;
  limit?: number;
}

export default async function getModelsByTypeHandler(args: GetModelsByTypeArgs) {
  console.error(`[get_models_by_type] Fetching models with type "${args.type}", limit ${args.limit || 20}...`);

  const models = await getModelsByType(args.type, args.limit || 20);

  console.error(`[get_models_by_type] Successfully returned ${models.length} models`);

  return {
    success: true,
    count: models.length,
    data: models,
    metadata: {
      type: args.type,
      limit: args.limit || 20,
      timestamp: new Date().toISOString()
    }
  };
}
