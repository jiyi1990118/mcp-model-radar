import dotenv from 'dotenv';
dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';

let queries: any;

if (dbType === 'sqlite') {
  queries = await import('./queries-sqlite.js');
} else {
  queries = await import('./queries.js');
}

export const { upsertModel, insertMetrics, upsertPricing, getModels, getModelById, searchModels } = queries;
