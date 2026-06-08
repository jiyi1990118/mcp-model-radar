// src/tools/get-model-benchmarks.ts
import { getModelById } from '../db/index.js';
import { fetchArenaLeaderboard } from '../api/arena-api.js';

export async function getModelBenchmarks(args: any) {
  const modelId = args.model_id;

  if (!modelId) {
    throw new Error('model_id is required');
  }

  console.log(`[get_model_benchmarks] Fetching benchmarks for: ${modelId}`);

  const model = await getModelById(modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  // Get Arena data
  const leaderboard = await fetchArenaLeaderboard();
  const modelName = model.name.toLowerCase();

  const arenaMatch = leaderboard.find(m => {
    const name = m.model.toLowerCase();
    return name.includes(modelName) || modelName.includes(name);
  });

  const benchmarks: any = {
    model_id: model.model_id,
    model_name: model.name,
    benchmarks: {}
  };

  if (arenaMatch) {
    benchmarks.benchmarks.arena = {
      elo_rating: arenaMatch.elo,
      rank: arenaMatch.rank,
      organization: arenaMatch.organization,
      source: 'LMSYS Chatbot Arena'
    };
  } else {
    benchmarks.benchmarks.arena = {
      status: 'not_found',
      note: 'Model not found in Arena leaderboard'
    };
  }

  // Placeholder for future benchmark sources
  benchmarks.benchmarks.note = 'Additional benchmarks (MMLU, HumanEval, GSM8K) coming in future updates';

  return {
    success: true,
    data: benchmarks
  };
}
