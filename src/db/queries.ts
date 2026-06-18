import pool from './connection.js';

export async function upsertModel(model: any) {
  const query = `
    INSERT INTO models (model_id, name, author, base_model, params, license, context_length, tags, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (model_id) DO UPDATE SET
      name = EXCLUDED.name,
      author = EXCLUDED.author,
      updated_at = NOW(),
      last_synced = NOW()
    RETURNING *;
  `;
  const values = [model.model_id, model.name, model.author, model.base_model, model.params, model.license, model.context_length, model.tags, model.created_at];
  return (await pool.query(query, values)).rows[0];
}

export async function insertMetrics(model_id: string, downloads: number, likes: number, trend_score: number = 0) {
  const query = `INSERT INTO model_metrics (model_id, downloads, likes, trend_score) VALUES ($1, $2, $3, $4) RETURNING *;`;
  return (await pool.query(query, [model_id, downloads, likes, trend_score])).rows[0];
}

export async function upsertPricing(model_id: string, provider: string, input_cost: number, output_cost: number, context_length: number) {
  const query = `
    INSERT INTO model_pricing (model_id, provider, input_cost, output_cost, context_length)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET input_cost = EXCLUDED.input_cost, output_cost = EXCLUDED.output_cost, updated_at = NOW()
    RETURNING *;
  `;
  return (await pool.query(query, [model_id, provider, input_cost, output_cost, context_length])).rows[0];
}

export async function getModels(limit: number = 20, orderBy: string = 'updated_at DESC') {
  const query = `SELECT m.*, mm.downloads, mm.likes, mm.trend_score FROM models m LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true ORDER BY ${orderBy} LIMIT $1;`;
  return (await pool.query(query, [limit])).rows;
}

export async function getModelById(model_id: string) {
  const query = `SELECT m.*, mm.downloads, mm.likes, mm.trend_score, mp.provider, mp.input_cost, mp.output_cost FROM models m LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true LEFT JOIN model_pricing mp ON m.model_id = mp.model_id WHERE m.model_id = $1;`;
  return (await pool.query(query, [model_id])).rows[0];
}

export async function searchModels(keyword: string, limit: number = 50) {
  const query = `SELECT m.*, mm.downloads, mm.likes, mm.trend_score FROM models m LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true WHERE m.model_id ILIKE $1 OR m.name ILIKE $1 OR m.author ILIKE $1 OR $1 = ANY(m.tags) ORDER BY mm.trend_score DESC NULLS LAST LIMIT $2;`;
  return (await pool.query(query, [`%${keyword}%`, limit])).rows;
}

export async function getModelsByType(type: string, limit: number = 20) {
  const query = `
    SELECT m.*, mm.downloads, mm.likes, mm.trend_score 
    FROM models m 
    LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true 
    WHERE $1 = ANY(m.tags) 
    ORDER BY mm.trend_score DESC NULLS LAST 
    LIMIT $2;
  `;
  return (await pool.query(query, [type, limit])).rows;
}

export async function getModelsBySize(minParams: string | null, maxParams: string | null, limit: number = 20) {
  let whereClause = '';
  if (minParams && maxParams) {
    whereClause = 'WHERE m.params IS NOT NULL';
  }
  
  const query = `
    SELECT m.*, mm.downloads, mm.likes, mm.trend_score 
    FROM models m 
    LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true 
    ${whereClause}
    ORDER BY mm.trend_score DESC NULLS LAST 
    LIMIT $1;
  `;
  return (await pool.query(query, [limit])).rows;
}

export async function getModelsByLicense(license: string, limit: number = 20) {
  const query = `
    SELECT m.*, mm.downloads, mm.likes, mm.trend_score 
    FROM models m 
    LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true 
    WHERE m.license ILIKE $1 
    ORDER BY mm.trend_score DESC NULLS LAST 
    LIMIT $2;
  `;
  return (await pool.query(query, [`%${license}%`, limit])).rows;
}

export async function getModelsByAuthor(author: string, limit: number = 20) {
  const query = `
    SELECT m.*, mm.downloads, mm.likes, mm.trend_score 
    FROM models m 
    LEFT JOIN LATERAL (SELECT * FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) mm ON true 
    WHERE m.author = $1 
    ORDER BY mm.trend_score DESC NULLS LAST 
    LIMIT $2;
  `;
  return (await pool.query(query, [author, limit])).rows;
}

// === GitHub Repos ===

export async function upsertGithubRepo(repo: any) {
  const query = `
    INSERT INTO github_repos (repo_full_name, model_id, stars, forks, open_issues, description, language, topics, pushed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (repo_full_name) DO UPDATE SET
      model_id = EXCLUDED.model_id,
      stars = EXCLUDED.stars,
      forks = EXCLUDED.forks,
      open_issues = EXCLUDED.open_issues,
      description = EXCLUDED.description,
      language = EXCLUDED.language,
      topics = EXCLUDED.topics,
      pushed_at = EXCLUDED.pushed_at,
      collected_at = NOW()
    RETURNING *;
  `;
  const values = [repo.repo_full_name, repo.model_id, repo.stars, repo.forks, repo.open_issues, repo.description, repo.language, repo.topics, repo.pushed_at];
  return (await pool.query(query, values)).rows[0];
}

export async function getGithubTrending(limit: number = 20, language?: string, topic?: string) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (language) {
    conditions.push(`language = $${paramIdx++}`);
    params.push(language);
  }
  if (topic) {
    conditions.push(`$${paramIdx++} = ANY(topics)`);
    params.push(topic);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT *
    FROM github_repos
    ${whereClause}
    ORDER BY stars DESC
    LIMIT $${paramIdx}
  `;
  params.push(limit);

  return (await pool.query(query, params)).rows;
}

export async function recordMetricsSnapshot(db: any) {
  const query = `
    INSERT INTO metrics_history (model_id, downloads, likes, trend_score, arena_rank)
    SELECT m.model_id, mm.downloads, mm.likes, mm.trend_score, NULL
    FROM models m
    JOIN LATERAL (
      SELECT downloads, likes, trend_score FROM model_metrics
      WHERE model_id = m.model_id
      ORDER BY snapshot_date DESC LIMIT 1
    ) mm ON true
  `;
  return db.query(query);
}

export async function getTrendingChanges(period: string = '7d', metric: string = 'trend_score') {
  const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
  const allowedMetrics = ['downloads', 'likes', 'trend_score'];
  const safeMetric = allowedMetrics.includes(metric) ? metric : 'trend_score';

  const query = `
    WITH recent AS (
      SELECT m.model_id, mm.${safeMetric} as current_value
      FROM models m
      JOIN LATERAL (
        SELECT ${safeMetric} FROM model_metrics
        WHERE model_id = m.model_id
        ORDER BY snapshot_date DESC LIMIT 1
      ) mm ON true
    ),
    historical AS (
      SELECT model_id, AVG(${safeMetric}) as past_value
      FROM metrics_history
      WHERE recorded_at BETWEEN NOW() - INTERVAL '1 day' * $1 AND NOW() - INTERVAL '1 day' * $2
      GROUP BY model_id
    )
    SELECT r.model_id, m.name, m.author,
      r.current_value, COALESCE(h.past_value, r.current_value) as past_value,
      ROUND(((r.current_value - COALESCE(h.past_value, r.current_value)) / NULLIF(COALESCE(h.past_value, 1), 0)) * 100, 2) as growth_rate,
      (r.current_value - COALESCE(h.past_value, r.current_value)) as absolute_change
    FROM recent r
    LEFT JOIN historical h ON r.model_id = h.model_id
    JOIN models m ON r.model_id = m.model_id
    WHERE r.current_value > 0
    ORDER BY absolute_change DESC LIMIT 50
  `;
  return (await pool.query(query, [days + 1, days])).rows;
}
