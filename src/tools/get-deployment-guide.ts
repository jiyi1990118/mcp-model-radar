// src/tools/get-deployment-guide.ts
import { getModelById } from '../db/index.js';
import { analyzeDeployment } from '../utils/deployment-rules.js';

export async function getDeploymentGuide(args: any) {
  const modelId = args.model_id;
  const hardware = args.hardware || {};

  if (!modelId) {
    throw new Error('model_id is required');
  }

  console.error(`[get_deployment_guide] Analyzing deployment for: ${modelId}`);

  const model = await getModelById(modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  const analysis = analyzeDeployment(model, hardware);

  return {
    success: true,
    model: {
      model_id: model.model_id,
      name: model.name,
      params: model.params
    },
    ...analysis
  };
}
