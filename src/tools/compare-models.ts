import { getModelById } from '../db/index.js';

export async function compareModels(args: any) {
  const model_a_id = args.model_a;
  const model_b_id = args.model_b;

  console.error(`[compare_models] Comparing "${model_a_id}" vs "${model_b_id}"`);

  try {
    const model_a = await getModelById(model_a_id);
    const model_b = await getModelById(model_b_id);

    if (!model_a) throw new Error(`Model not found: ${model_a_id}`);
    if (!model_b) throw new Error(`Model not found: ${model_b_id}`);

    const comparison = {
      model_a: {
        id: model_a.model_id,
        name: model_a.name,
        author: model_a.author
      },
      model_b: {
        id: model_b.model_id,
        name: model_b.name,
        author: model_b.author
      },
      metrics: {
        downloads: {
          winner: (model_a.downloads || 0) > (model_b.downloads || 0) ? 'A' : (model_a.downloads || 0) < (model_b.downloads || 0) ? 'B' : 'tie',
          model_a: model_a.downloads || 0,
          model_b: model_b.downloads || 0,
          difference: Math.abs((model_a.downloads || 0) - (model_b.downloads || 0))
        },
        likes: {
          winner: (model_a.likes || 0) > (model_b.likes || 0) ? 'A' : (model_a.likes || 0) < (model_b.likes || 0) ? 'B' : 'tie',
          model_a: model_a.likes || 0,
          model_b: model_b.likes || 0,
          difference: Math.abs((model_a.likes || 0) - (model_b.likes || 0))
        },
        trend_score: {
          winner: (model_a.trend_score || 0) > (model_b.trend_score || 0) ? 'A' : (model_a.trend_score || 0) < (model_b.trend_score || 0) ? 'B' : 'tie',
          model_a: model_a.trend_score || 0,
          model_b: model_b.trend_score || 0,
          difference: Math.abs((model_a.trend_score || 0) - (model_b.trend_score || 0))
        },
        context_length: {
          winner: (model_a.context_length || 0) > (model_b.context_length || 0) ? 'A' : (model_a.context_length || 0) < (model_b.context_length || 0) ? 'B' : 'tie',
          model_a: model_a.context_length || 0,
          model_b: model_b.context_length || 0
        },
        cost: (() => {
          const aHasCost = model_a.input_cost != null || model_a.output_cost != null;
          const bHasCost = model_b.input_cost != null || model_b.output_cost != null;
          const aTotal = (model_a.input_cost || 0) + (model_a.output_cost || 0);
          const bTotal = (model_b.input_cost || 0) + (model_b.output_cost || 0);

          if (!aHasCost && !bHasCost) {
            return {
              winner: 'tie',
              model_a_input: null,
              model_b_input: null,
              model_a_output: null,
              model_b_output: null
            };
          }

          return {
            winner: aTotal < bTotal ? 'A' : bTotal < aTotal ? 'B' : 'tie',
            model_a_input: model_a.input_cost || null,
            model_b_input: model_b.input_cost || null,
            model_a_output: model_a.output_cost || null,
            model_b_output: model_b.output_cost || null
          };
        })()
      },
      summary: {
        model_a_wins: 0,
        model_b_wins: 0,
        ties: 0
      }
    };

    // Calculate summary
    Object.values(comparison.metrics).forEach((metric: any) => {
      if (metric.winner === 'A') comparison.summary.model_a_wins++;
      else if (metric.winner === 'B') comparison.summary.model_b_wins++;
      else comparison.summary.ties++;
    });

    console.error(`[compare_models] Comparison complete - A wins: ${comparison.summary.model_a_wins}, B wins: ${comparison.summary.model_b_wins}, Ties: ${comparison.summary.ties}`);

    return {
      success: true,
      comparison,
      metadata: {
        query_time: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error(`[compare_models] Error:`, error.message);
    throw new Error(`Failed to compare models: ${error.message}`);
  }
}
