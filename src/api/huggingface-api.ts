import { getFastestMirror } from '../utils/mirror-pool.js';

let cachedMirror: string | null = null;
const MAX_RETRIES = 2;

async function getApiBase(): Promise<string> {
  if (process.env.HF_API_BASE) return process.env.HF_API_BASE;
  if (cachedMirror) return cachedMirror;
  cachedMirror = await getFastestMirror();
  return cachedMirror;
}

async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ModelRadar/2.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000)
      });
      if (response.ok) return response;
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`[HF API] Server error ${response.status}, retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw new Error(`HF API error: ${response.status}`);
    } catch (error: any) {
      if (attempt === MAX_RETRIES || error.message?.includes('HF API error')) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[HF API] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
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
  cardData?: { license?: string; base_model?: string; };
}

function mapHFModel(m: HFModel) {
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
}

export async function searchHFModels(query: string, limit: number = 50): Promise<any[]> {
  const apiBase = await getApiBase();
  const url = `${apiBase}/models?search=${encodeURIComponent(query)}&limit=${limit}&sort=downloads`;

  console.error(`[HF API] Requesting: ${url}`);

  try {
    const response = await fetchWithRetry(url);
    console.error(`[HF API] Response status: ${response.status}`);

    const models = await response.json() as HFModel[];
    return models.map(mapHFModel);
  } catch (error: any) {
    console.error('[HF API] Search failed:', error.message);
    throw error;
  }
}

export async function getHFModelDetail(modelId: string): Promise<any> {
  const apiBase = await getApiBase();
  const url = `${apiBase}/models/${modelId}`;

  console.error(`[HF API] Requesting model detail: ${url}`);

  try {
    const response = await fetchWithRetry(url);
    console.error(`[HF API] Response status: ${response.status}`);

    const m = await response.json() as HFModel;
    return mapHFModel(m);
  } catch (error: any) {
    console.error('[HF API] Get model failed:', error.message);
    throw error;
  }
}
