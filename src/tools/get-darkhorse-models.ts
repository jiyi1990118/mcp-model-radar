// src/tools/get-darkhorse-models.ts
import { detectDarkHorseModels } from '../analysis/darkhorse-detector.js';

export async function getDarkhorseModelsHandler(args: any) {
  const limit = args.limit || 10;

  console.error(`[get_darkhorse_models] Detecting dark horse models (limit: ${limit})`);

  try {
    const models = await detectDarkHorseModels(limit);

    console.error(`[get_darkhorse_models] Found ${models.length} dark horse candidates`);

    return {
      success: true,
      count: models.length,
      description: 'Unexpectedly surging models with high growth potential',
      data: models,
      metadata: {
        query_time: new Date().toISOString(),
        limit,
        algorithm: {
          burst_signal: '40% — ratio of 3-day to 30-day growth rate',
          underdog_factor: '30% — low base relative to top models',
          cross_source_signal: '30% — trend score + GitHub stars'
        }
      }
    };
  } catch (error: any) {
    console.error(`[get_darkhorse_models] Error:`, error.message);
    throw new Error(`Failed to detect dark horse models: ${error.message}`);
  }
}
