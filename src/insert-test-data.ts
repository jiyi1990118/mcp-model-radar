import db from './db/connection-sqlite.js';
import { upsertModel, insertMetrics } from './db/index.js';

console.log('插入测试数据...');

const testModels = [
  { model_id: 'Qwen/Qwen3-235B', name: 'Qwen3-235B', author: 'Qwen', downloads: 5000000, likes: 12000, trend_score: 98 },
  { model_id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3', author: 'deepseek-ai', downloads: 3000000, likes: 8000, trend_score: 95 },
  { model_id: 'microsoft/Phi-4', name: 'Phi-4', author: 'microsoft', downloads: 2000000, likes: 6000, trend_score: 88 },
  { model_id: 'meta-llama/Llama-3.3-70B', name: 'Llama-3.3-70B', author: 'meta-llama', downloads: 4000000, likes: 10000, trend_score: 92 },
  { model_id: 'mistralai/Mistral-Large-2', name: 'Mistral-Large-2', author: 'mistralai', downloads: 1500000, likes: 5000, trend_score: 85 }
];

for (const model of testModels) {
  upsertModel({
    model_id: model.model_id,
    name: model.name,
    author: model.author,
    base_model: null,
    params: null,
    license: 'Apache-2.0',
    context_length: 32768,
    tags: ['text-generation'],
    created_at: new Date().toISOString()
  });

  insertMetrics(model.model_id, model.downloads, model.likes, model.trend_score);
  console.log(`✅ ${model.model_id}`);
}

console.log(`\n✨ 成功插入 ${testModels.length} 个测试模型！`);
db.close();
