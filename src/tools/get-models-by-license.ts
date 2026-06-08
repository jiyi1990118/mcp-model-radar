import { getModelsByLicense } from '../db/queries-sqlite.js';

interface GetModelsByLicenseArgs {
  license: string;
  limit?: number;
}

export default async function getModelsByLicenseHandler(args: GetModelsByLicenseArgs) {
  console.error(`[get_models_by_license] Fetching models with license "${args.license}", limit ${args.limit || 20}...`);

  const models = getModelsByLicense(args.license, args.limit || 20);

  console.error(`[get_models_by_license] Successfully returned ${models.length} models`);

  return {
    success: true,
    count: models.length,
    data: models,
    metadata: {
      license: args.license,
      limit: args.limit || 20,
      timestamp: new Date().toISOString()
    }
  };
}
