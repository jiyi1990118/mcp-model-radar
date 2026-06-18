import axios from 'axios';
import { upsertPricing } from '../db/index.js';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithRetry(url: string, headers: any): Promise<any> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, { headers, timeout: REQUEST_TIMEOUT_MS });
      return response.data;
    } catch (error: any) {
      if (attempt === MAX_RETRIES) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[OR Collector] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export async function collectOpenRouterPricing() {
  console.error('Starting OpenRouter collection...');

  try {
    const headers: any = {};
    if (process.env.OPENROUTER_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    }

    const data = await fetchWithRetry(`${OPENROUTER_API_BASE}/models`, headers);

    for (const model of data.data || []) {
      try {
        const modelId = model.id.replace(':', '/');
        const promptCost = parseFloat(model.pricing?.prompt || '0');
        const completionCost = parseFloat(model.pricing?.completion || '0');

        await upsertPricing(
          modelId,
          'openrouter',
          isNaN(promptCost) ? 0 : promptCost,
          isNaN(completionCost) ? 0 : completionCost,
          model.context_length || 0
        );
        console.error(`Collected pricing: ${modelId}`);
      } catch (err: any) {
        console.error(`Error saving pricing for ${model.id}:`, err.message);
      }
    }

    console.error('OpenRouter collection complete');
  } catch (error: any) {
    console.error('Error fetching from OpenRouter:', error.message);
  }
}
