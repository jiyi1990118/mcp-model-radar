import pool from '../db/connection.js';

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

export async function calculateTrendScores() {
  console.log('Calculating trend scores...');

  const query = `
    SELECT
      m.model_id,
      mm_current.downloads as current_downloads,
      mm_current.likes as current_likes,
      mm_week_ago.downloads as week_ago_downloads,
      mm_week_ago.likes as week_ago_likes
    FROM models m
    LEFT JOIN LATERAL (
      SELECT downloads, likes FROM model_metrics
      WHERE model_id = m.model_id
      ORDER BY snapshot_date DESC LIMIT 1
    ) mm_current ON true
    LEFT JOIN LATERAL (
      SELECT downloads, likes FROM model_metrics
      WHERE model_id = m.model_id
      AND snapshot_date < NOW() - INTERVAL '7 days'
      ORDER BY snapshot_date DESC LIMIT 1
    ) mm_week_ago ON true
    WHERE mm_current.downloads IS NOT NULL;
  `;

  const result = await pool.query(query);

  for (const row of result.rows) {
    const downloadGrowth = calculateGrowth(
      row.current_downloads || 0,
      row.week_ago_downloads || row.current_downloads || 0
    );
    const likeGrowth = calculateGrowth(
      row.current_likes || 0,
      row.week_ago_likes || row.current_likes || 0
    );

    const trendScore = Math.min(Math.max((0.6 * downloadGrowth) + (0.4 * likeGrowth), 0), 100);

    await pool.query(
      'UPDATE model_metrics SET trend_score = $1 WHERE model_id = $2 AND snapshot_date = (SELECT MAX(snapshot_date) FROM model_metrics WHERE model_id = $2)',
      [trendScore.toFixed(2), row.model_id]
    );
  }

  console.log(`Trend scores calculated for ${result.rows.length} models`);
}
