import dotenv from 'dotenv';
dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';

let queries: {
  upsertModel: Function;
  insertMetrics: Function;
  upsertPricing: Function;
  getModels: Function;
  getModelById: Function;
  searchModels: Function;
  getModelsByType: Function;
  getModelsBySize: Function;
  getModelsByLicense: Function;
  getModelsByAuthor: Function;
  recordMetricsSnapshot: Function;
  getTrendingChanges: Function;
  upsertGithubRepo: Function;
  getGithubTrending: Function;
};

if (dbType === 'sqlite') {
  queries = await import('./queries-sqlite.js');
} else {
  queries = await import('./queries.js');
}

export const {
  upsertModel,
  insertMetrics,
  upsertPricing,
  getModels,
  getModelById,
  searchModels,
  getModelsByType,
  getModelsBySize,
  getModelsByLicense,
  getModelsByAuthor,
  recordMetricsSnapshot,
  getTrendingChanges,
  upsertGithubRepo,
  getGithubTrending,
} = queries;
