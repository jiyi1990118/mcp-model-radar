import axios from 'axios';
import { upsertPricing } from '../db/index.js';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export async function collectOpenRouterPricing() {
  console.log('Starting OpenRouter collection...');

  try {
    const headers: any = {};
    if (process.env.OPENROUTER_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    }

    const response = await axios.get(`${OPENROUTER_API_BASE}/models`, { headers });

    for (const model of response.data.data || []) {
      try {
        const modelId = model.id.replace(':', '/');
        await upsertPricing(
          modelId,
          'openrouter',
          parseFloat(model.pricing?.prompt || '0'),
          parseFloat(model.pricing?.completion || '0'),
          model.context_length || 0
        );
        console.log(`Collected pricing: ${modelId}`);
      } catch (err) {
        console.error(`Error saving pricing for ${model.id}:`, err);
      }
    }

    console.log('OpenRouter collection complete');
  } catch (error) {
    console.error('Error fetching from OpenRouter:', error);
  }
}
