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
