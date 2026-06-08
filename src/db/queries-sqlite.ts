import db from './connection-sqlite.js';

export function upsertModel(model: any) {
  const stmt = db.prepare(`
    INSERT INTO models (model_id, name, author, base_model, params, license, context_length, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(model_id) DO UPDATE SET
      name = excluded.name,
      author = excluded.author,
      updated_at = CURRENT_TIMESTAMP,
      last_synced = CURRENT_TIMESTAMP
  `);

  return stmt.run(
    model.model_id,
    model.name,
    model.author,
    model.base_model,
    model.params,
    model.license,
    model.context_length,
    JSON.stringify(model.tags || []),
    model.created_at
  );
}

export function insertMetrics(model_id: string, downloads: number, likes: number, trend_score: number = 0) {
  const stmt = db.prepare(`INSERT INTO model_metrics (model_id, downloads, likes, trend_score) VALUES (?, ?, ?, ?)`);
  return stmt.run(model_id, downloads, likes, trend_score);
}

export function upsertPricing(model_id: string, provider: string, input_cost: number, output_cost: number, context_length: number) {
  const stmt = db.prepare(`
    INSERT INTO model_pricing (model_id, provider, input_cost, output_cost, context_length)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET input_cost = excluded.input_cost, output_cost = excluded.output_cost, updated_at = CURRENT_TIMESTAMP
  `);
  return stmt.run(model_id, provider, input_cost, output_cost, context_length);
}

export function getModels(limit: number = 20, orderBy: string = 'updated_at DESC') {
  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    ORDER BY ${orderBy.includes('mm.') ? orderBy.replace('mm.', '') : orderBy}
    LIMIT ?
  `;
  return db.prepare(query).all(limit);
}

export function getModelById(model_id: string) {
  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score,
           mp.provider, mp.input_cost, mp.output_cost
    FROM models m
    LEFT JOIN model_pricing mp ON m.model_id = mp.model_id
    WHERE m.model_id = ?
  `;
  return db.prepare(query).get(model_id);
}

export function searchModels(keyword: string, filters?: any, sortBy?: string, limit: number = 50) {
  const conditions = ['(m.model_id LIKE ? OR m.name LIKE ? OR m.author LIKE ? OR m.tags LIKE ?)'];
  const params: any[] = [];
  const pattern = `%${keyword}%`;
  params.push(pattern, pattern, pattern, pattern);

  if (filters?.type) {
    conditions.push('m.tags LIKE ?');
    params.push(`%${filters.type}%`);
  }
  if (filters?.license) {
    conditions.push('m.license LIKE ?');
    params.push(`%${filters.license}%`);
  }
  if (filters?.author) {
    conditions.push('m.author = ?');
    params.push(filters.author);
  }

  const orderMap: any = {
    downloads: 'downloads DESC',
    likes: 'likes DESC',
    trend_score: 'trend_score DESC',
    created_at: 'm.created_at DESC'
  };
  const orderBy = orderMap[sortBy || 'trend_score'] || 'trend_score DESC';

  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy} NULLS LAST
    LIMIT ?
  `;
  params.push(limit);
  return db.prepare(query).all(...params);
}

// 新增：按类型/标签过滤模型
export function getModelsByType(type: string, limit: number = 20) {
  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    WHERE m.tags LIKE ?
    ORDER BY trend_score DESC NULLS LAST
    LIMIT ?
  `;
  const pattern = `%${type}%`;
  return db.prepare(query).all(pattern, limit);
}

// 新增：按参数规模过滤
export function getModelsBySize(minParams: string | null, maxParams: string | null, limit: number = 20) {
  let whereClause = '';
  if (minParams && maxParams) {
    whereClause = 'WHERE m.params IS NOT NULL';
  }

  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    ${whereClause}
    ORDER BY trend_score DESC NULLS LAST
    LIMIT ?
  `;
  return db.prepare(query).all(limit);
}

// 新增：按许可证过滤
export function getModelsByLicense(license: string, limit: number = 20) {
  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    WHERE m.license LIKE ?
    ORDER BY trend_score DESC NULLS LAST
    LIMIT ?
  `;
  const pattern = `%${license}%`;
  return db.prepare(query).all(pattern, limit);
}

// 新增：按作者查询
export function getModelsByAuthor(author: string, limit: number = 20) {
  const query = `
    SELECT m.*,
           (SELECT downloads FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as downloads,
           (SELECT likes FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as likes,
           (SELECT trend_score FROM model_metrics WHERE model_id = m.model_id ORDER BY snapshot_date DESC LIMIT 1) as trend_score
    FROM models m
    WHERE m.author = ?
    ORDER BY trend_score DESC NULLS LAST
    LIMIT ?
  `;
  return db.prepare(query).all(author, limit);
}

export function recordMetricsSnapshot(db: any) {
  const stmt = db.prepare(`
    INSERT INTO metrics_history (model_id, downloads, likes, trend_score, arena_rank)
    SELECT model_id, downloads, likes, trend_score, NULL FROM models
  `);
  return stmt.run();
}

export function getMetricsHistory(db: any, modelId: string, days: number = 30) {
  const stmt = db.prepare(`
    SELECT
      downloads, likes, trend_score, arena_rank,
      datetime(recorded_at) as recorded_at
    FROM metrics_history
    WHERE model_id = ?
      AND recorded_at >= datetime('now', '-' || ? || ' days')
    ORDER BY recorded_at ASC
  `);
  return stmt.all(modelId, days);
}

export function getTrendingChanges(db: any, period: string = '7d', metric: string = 'trend_score') {
  const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;

  const query = `
    WITH recent AS (
      SELECT model_id, ${metric} as current_value
      FROM models
    ),
    historical AS (
      SELECT
        model_id,
        AVG(${metric === 'trend_score' ? 'trend_score' : metric}) as past_value
      FROM metrics_history
      WHERE recorded_at BETWEEN datetime('now', '-' || ? || ' days') AND datetime('now', '-' || ? || ' days')
      GROUP BY model_id
    )
    SELECT
      r.model_id,
      m.name,
      m.author,
      r.current_value,
      COALESCE(h.past_value, r.current_value) as past_value,
      ROUND(((r.current_value - COALESCE(h.past_value, r.current_value)) / NULLIF(COALESCE(h.past_value, 1), 0)) * 100, 2) as growth_rate,
      (r.current_value - COALESCE(h.past_value, r.current_value)) as absolute_change
    FROM recent r
    LEFT JOIN historical h ON r.model_id = h.model_id
    JOIN models m ON r.model_id = m.model_id
    WHERE r.current_value > 0
    ORDER BY absolute_change DESC
    LIMIT 50
  `;

  return db.prepare(query).all(days + 1, days);
}
