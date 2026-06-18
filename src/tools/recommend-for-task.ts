// src/tools/recommend-for-task.ts
import { searchModels as dbSearch } from '../db/index.js';
import { scoreModelForTask, explainRecommendation } from '../utils/recommendation-engine.js';

export async function recommendForTask(args: any) {
  const task = args.task;
  const constraints = args.constraints || {};
  const topN = args.top_n || 3;

  if (!task) {
    throw new Error('task parameter is required');
  }

  const validTasks = ['code-generation', 'translation', 'chat', 'summarization', 'reasoning'];
  if (!validTasks.includes(task)) {
    throw new Error(`Invalid task. Must be one of: ${validTasks.join(', ')}`);
  }

  console.error(`[recommend_for_task] Finding models for task: ${task}`);

  // Get candidate models (top 100 by trend score)
  const candidates = await dbSearch('', {}, 'trend_score', 100);

  // Score each model
  const scored = candidates
    .map((model: any) => ({
      model,
      score: scoreModelForTask(model, task, constraints),
      reason: ''
    }))
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, topN);

  // Add explanations
  scored.forEach((item: any) => {
    item.reason = explainRecommendation(item.model, task, item.score);
  });

  return {
    success: true,
    task,
    constraints,
    recommendations: scored.map((item: any) => ({
      model_id: item.model.model_id,
      name: item.model.name,
      author: item.model.author,
      score: Math.round(item.score),
      reason: item.reason,
      metrics: {
        downloads: item.model.downloads,
        likes: item.model.likes,
        trend_score: item.model.trend_score || 0
      },
      deployment: {
        params: item.model.params,
        context_length: item.model.context_length,
        license: item.model.license
      },
      pricing: item.model.input_cost ? {
        input_cost: item.model.input_cost,
        output_cost: item.model.output_cost
      } : null
    }))
  };
}
