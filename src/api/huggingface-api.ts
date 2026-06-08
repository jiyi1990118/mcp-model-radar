import { getFastestMirror } from '../utils/mirror-pool.js';

let cachedMirror: string | null = null;

async function getApiBase(): Promise<string> {
  if (process.env.HF_API_BASE) return process.env.HF_API_BASE;
  if (cachedMirror) return cachedMirror;
  cachedMirror = await getFastestMirror();
  return cachedMirror;
}

interface HFModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  createdAt: string;
  lastModified?: string;
  cardData?: {
    license?: string;
    base_model?: string;
  };
}

export async function searchHFModels(query: string, limit: number = 50): Promise<any[]> {
  const apiBase = await getApiBase();
  const url = `${apiBase}/models?search=${encodeURIComponent(query)}&limit=${limit}&sort=downloads`;

  console.error(`[HF API] Requesting: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ModelRadar/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 增加到30秒
    });

    console.error(`[HF API] Response status: ${response.status}`);

    if (!response.ok) throw new Error(`HF API error: ${response.status}`);

    const models = await response.json() as HFModel[];
    return models.map(m => ({
      model_id: m.modelId || m.id,
      name: m.modelId?.split('/')[1] || m.id,
      author: m.author,
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      license: m.cardData?.license || null,
      base_model: m.cardData?.base_model || null,
      created_at: m.createdAt,
      updated_at: m.lastModified || m.createdAt
    }));
  } catch (error: any) {
    console.error('[HF API] Search failed:', error.message);
    console.error('[HF API] Error details:', error.cause || error.stack?.split('\n')[0]);
    throw error;
  }
}

export async function getHFModelDetail(modelId: string): Promise<any> {
  const apiBase = await getApiBase();
  const url = `${apiBase}/models/${modelId}`;

  console.error(`[HF API] Requesting model detail: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ModelRadar/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 增加到30秒
    });

    console.error(`[HF API] Response status: ${response.status}`);

    if (!response.ok) throw new Error(`HF API error: ${response.status}`);

    const m = await response.json() as HFModel;
    return {
      model_id: m.modelId || m.id,
      name: m.modelId?.split('/')[1] || m.id,
      author: m.author,
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      license: m.cardData?.license || null,
      base_model: m.cardData?.base_model || null,
      created_at: m.createdAt,
      updated_at: m.lastModified || m.createdAt
    };
  } catch (error: any) {
    console.error('[HF API] Get model failed:', error.message);
    console.error('[HF API] Error details:', error.cause || error.stack?.split('\n')[0]);
    throw error;
  }
}
