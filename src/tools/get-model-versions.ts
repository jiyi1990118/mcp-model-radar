import { searchHFModels } from '../api/huggingface-api.js';

export async function getModelVersions(args: any) {
  const modelId = args.model_id;
  if (!modelId) throw new Error('model_id is required');

  const baseAuthor = modelId.split('/')[0];
  const baseName = modelId.split('/')[1] || modelId;

  const allModels = await searchHFModels(baseName, 100);

  const versions = allModels
    .filter(m => m.model_id.toLowerCase().includes(baseName.toLowerCase()))
    .map(m => {
      const tags = m.tags || [];
      const quantTypes = tags.filter((t: string) =>
        /gguf|awq|gptq|mlx|int4|int8|fp16|q4|q5|q8/i.test(t)
      );

      return {
        model_id: m.model_id,
        name: m.name,
        downloads: m.downloads,
        likes: m.likes,
        quantization_type: quantTypes.length > 0 ? quantTypes.join(', ') : 'base',
        tags: tags
      };
    });

  return {
    success: true,
    base_model: modelId,
    versions_count: versions.length,
    data: versions
  };
}
