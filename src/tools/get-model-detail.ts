import { getModelById } from '../db/index.js';
import { getModelVersions } from './get-model-versions.js';

function estimateVRAM(params: string | null): any {
  if (!params) return null;
  const match = params.match(/(\d+\.?\d*)/);
  if (!match) return null;
  const size = parseFloat(match[1]);
  return {
    fp16_gb: Math.round(size * 2 * 10) / 10,
    int8_gb: Math.round(size * 1 * 10) / 10,
    int4_gb: Math.round(size * 0.5 * 10) / 10
  };
}

export async function getModelDetail(args: any) {
  const model_id = args.model_id;

  console.log(`[get_model_detail] Fetching details for model: "${model_id}"`);

  try {
    const model = await getModelById(model_id);

    if (!model) {
      console.warn(`[get_model_detail] Model not found: "${model_id}"`);
      throw new Error(`Model not found: ${model_id}`);
    }

    // Get quantized versions
    let versions = null;
    try {
      const versionResult = await getModelVersions({ model_id });
      versions = versionResult.data;
    } catch (e) {
      console.warn('[get_model_detail] Failed to fetch versions:', e);
    }

    const detail = {
      model_id: model.model_id,
      name: model.name,
      author: model.author,
      base_model: model.base_model,
      params: model.params,
      license: model.license,
      context_length: model.context_length,
      tags: model.tags,
      metrics: {
        downloads: model.downloads,
        likes: model.likes,
        trend_score: model.trend_score || 0
      },
      pricing: model.provider ? {
        provider: model.provider,
        input_cost: model.input_cost,
        output_cost: model.output_cost,
        currency: 'USD per 1M tokens'
      } : null,
      vram_estimate: estimateVRAM(model.params),
      quantized_versions: versions,
      timestamps: {
        created_at: model.created_at,
        updated_at: model.updated_at
      }
    };

    console.log(`[get_model_detail] Successfully fetched details for "${model.name}" by ${model.author}`);

    return {
      success: true,
      data: detail,
      metadata: {
        query_time: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error(`[get_model_detail] Error:`, error.message);
    throw new Error(`Failed to fetch model details: ${error.message}`);
  }
}
