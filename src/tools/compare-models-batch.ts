import { getModelById } from '../db/index.js';

export async function compareModelsBatch(args: any) {
  const modelIds = args.model_ids;
  const dimensions = args.dimensions || ['performance', 'cost', 'vram', 'context'];

  if (!modelIds || !Array.isArray(modelIds)) {
    throw new Error('model_ids must be an array');
  }

  if (modelIds.length < 2 || modelIds.length > 5) {
    throw new Error('Must compare between 2 and 5 models');
  }

  console.log(`[compare_models_batch] Comparing ${modelIds.length} models`);

  const models = await Promise.all(
    modelIds.map(id => getModelById(id))
  );

  const missing = models.map((m, i) => m ? null : modelIds[i]).filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Models not found: ${missing.join(', ')}`);
  }

  return {
    success: true,
    count: models.length,
    models: models.map(m => ({
      model_id: m!.model_id,
      name: m!.name,
      author: m!.author,
      params: m!.params,
      downloads: m!.downloads,
      likes: m!.likes,
      trend_score: m!.trend_score || 0,
      license: m!.license,
      context_length: m!.context_length,
      input_cost: m!.input_cost,
      output_cost: m!.output_cost
    })),
    comparison_matrix: buildComparisonMatrix(models as any[], dimensions)
  };
}

function buildComparisonMatrix(models: any[], dimensions: string[]) {
  const matrix: any = {};

  if (dimensions.includes('downloads')) {
    const sorted = [...models].sort((a, b) => b.downloads - a.downloads);
    matrix.downloads = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.downloads,
      winner: i === 0
    }));
  }

  if (dimensions.includes('likes')) {
    const sorted = [...models].sort((a, b) => b.likes - a.likes);
    matrix.likes = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.likes,
      winner: i === 0
    }));
  }

  if (dimensions.includes('cost')) {
    const sorted = [...models].sort((a, b) => {
      const costA = (a.input_cost || 999) + (a.output_cost || 999);
      const costB = (b.input_cost || 999) + (b.output_cost || 999);
      return costA - costB;
    });
    matrix.cost = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: `$${m.input_cost || 'N/A'}/$${m.output_cost || 'N/A'}`,
      winner: i === 0
    }));
  }

  if (dimensions.includes('context')) {
    const sorted = [...models].sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
    matrix.context = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.context_length || 'N/A',
      winner: i === 0
    }));
  }

  if (dimensions.includes('performance')) {
    const sorted = [...models].sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));
    matrix.performance = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.trend_score || 0,
      winner: i === 0
    }));
  }

  return matrix;
}
