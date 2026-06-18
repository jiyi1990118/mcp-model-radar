import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';

async function seed() {
  console.log('Starting initial data seeding...');

  const dbType = process.env.DB_TYPE || 'sqlite';

  try {
    await collectHuggingFaceModels();
    await collectOpenRouterPricing();
    console.log('Initial data seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }

  // Close DB connection if PostgreSQL
  if (dbType !== 'sqlite') {
    try {
      const { default: pool } = await import('../db/connection.js');
      await pool.end();
    } catch {}
  }
}

seed();
