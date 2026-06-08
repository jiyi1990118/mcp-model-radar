import { getModelsByAuthor } from '../db/queries-sqlite.js';

interface GetModelsByAuthorArgs {
  author: string;
  limit?: number;
}

export default async function getModelsByAuthorHandler(args: GetModelsByAuthorArgs) {
  console.error(`[get_models_by_author] Fetching models by author "${args.author}", limit ${args.limit || 20}...`);

  const models = getModelsByAuthor(args.author, args.limit || 20);

  console.error(`[get_models_by_author] Successfully returned ${models.length} models`);

  return {
    success: true,
    count: models.length,
    data: models,
    metadata: {
      author: args.author,
      limit: args.limit || 20,
      timestamp: new Date().toISOString()
    }
  };
}
