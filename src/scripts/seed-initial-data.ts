import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';
import pool from '../db/connection.js';

async function seed() {
  console.log('Starting initial data seeding...');

  try {
    await collectHuggingFaceModels();
    await collectOpenRouterPricing();
    console.log('Initial data seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
