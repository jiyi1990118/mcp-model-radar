import { searchHFModels } from '../api/huggingface-api.js';

export async function getModelEcosystem(args: any) {
  const modelId = args.model_id;
  if (!modelId) throw new Error('model_id is required');

  const allModels = await searchHFModels(modelId, 100);
  const derivatives = allModels.filter(m =>
    m.base_model === modelId ||
    (m.base_model && m.base_model.includes(modelId))
  );

  return {
    success: true,
    base_model: modelId,
    derivatives_count: derivatives.length,
    data: derivatives.map(m => ({
      model_id: m.model_id,
      name: m.name,
      author: m.author,
      downloads: m.downloads,
      likes: m.likes,
      base_model: m.base_model,
      created_at: m.created_at
    }))
  };
}
