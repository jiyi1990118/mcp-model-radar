import { getTrendingChanges as dbGetChanges } from '../db/index.js';

export async function getTrendingChanges(args: any) {
  const period = args.period || '7d';
  const metric = args.metric || 'trend_score';

  const validPeriods = ['24h', '7d', '30d'];
  const validMetrics = ['downloads', 'likes', 'trend_score'];

  if (!validPeriods.includes(period)) {
    throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
  }

  if (!validMetrics.includes(metric)) {
    throw new Error(`Invalid metric. Must be one of: ${validMetrics.join(', ')}`);
  }

  console.error(`[get_trending_changes] Analyzing ${metric} changes over ${period}`);

  const changes = await dbGetChanges(period, metric);

  const rising = changes
    .filter((c: any) => c.absolute_change > 0)
    .slice(0, 10);

  const falling = changes
    .filter((c: any) => c.absolute_change < 0)
    .sort((a: any, b: any) => a.absolute_change - b.absolute_change)
    .slice(0, 10);

  return {
    success: true,
    period,
    metric,
    rising: rising.map((c: any) => ({
      model_id: c.model_id,
      name: c.name,
      author: c.author,
      current_value: c.current_value,
      past_value: c.past_value,
      growth_rate: `${c.growth_rate > 0 ? '+' : ''}${c.growth_rate}%`,
      absolute_change: c.absolute_change
    })),
    falling: falling.map((c: any) => ({
      model_id: c.model_id,
      name: c.name,
      author: c.author,
      current_value: c.current_value,
      past_value: c.past_value,
      growth_rate: `${c.growth_rate}%`,
      absolute_change: c.absolute_change
    }))
  };
}
