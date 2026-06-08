import axios from 'axios';
import { upsertModel, insertMetrics } from '../db/index.js';

const HF_API_BASE = 'https://huggingface.co/api';
const PRIORITY_ORGS = (process.env.HF_PRIORITY_ORGS || 'unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama').split(',');

export async function collectHuggingFaceModels() {
  console.log('Starting HuggingFace collection...');

  for (const org of PRIORITY_ORGS) {
    try {
      const response = await axios.get(`${HF_API_BASE}/models`, {
        params: { author: org.trim(), sort: 'downloads', limit: 20 }
      });

      for (const model of response.data) {
        try {
          await upsertModel({
            model_id: model.id,
            name: model.id.split('/').pop() || model.id,
            author: model.author || org.trim(),
            base_model: model.cardData?.base_model || null,
            params: model.cardData?.model_size || null,
            license: model.cardData?.license || null,
            context_length: null,
            tags: model.tags || [],
            created_at: model.createdAt || new Date()
          });

          await insertMetrics(model.id, model.downloads || 0, model.likes || 0);
          console.log(`Collected: ${model.id}`);
        } catch (err) {
          console.error(`Error saving model ${model.id}:`, err);
        }
      }
    } catch (error) {
      console.error(`Error fetching from org ${org}:`, error);
    }
  }

  console.log('HuggingFace collection complete');
}
