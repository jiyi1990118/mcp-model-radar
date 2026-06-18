import axios from 'axios';
import { upsertModel, insertMetrics } from '../db/index.js';

const HF_API_BASE = 'https://huggingface.co/api';
const PRIORITY_ORGS = (process.env.HF_PRIORITY_ORGS || 'unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithRetry(url: string, params: any): Promise<any> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, { params, timeout: REQUEST_TIMEOUT_MS });
      return response.data;
    } catch (error: any) {
      if (attempt === MAX_RETRIES) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[HF Collector] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export async function collectHuggingFaceModels() {
  console.error('Starting HuggingFace collection...');

  for (const org of PRIORITY_ORGS) {
    try {
      const models = await fetchWithRetry(`${HF_API_BASE}/models`, {
        author: org, sort: 'downloads', limit: 20
      });

      for (const model of models) {
        try {
          await upsertModel({
            model_id: model.id,
            name: model.id.split('/').pop() || model.id,
            author: model.author || org,
            base_model: model.cardData?.base_model || null,
            params: model.cardData?.model_size || null,
            license: model.cardData?.license || null,
            context_length: null,
            tags: model.tags || [],
            created_at: model.createdAt || new Date()
          });

          await insertMetrics(model.id, model.downloads || 0, model.likes || 0);
          console.error(`Collected: ${model.id}`);
        } catch (err: any) {
          console.error(`Error saving model ${model.id}:`, err.message);
        }
      }
    } catch (error: any) {
      console.error(`Error fetching from org ${org}:`, error.message);
    }
  }

  console.error('HuggingFace collection complete');
}
