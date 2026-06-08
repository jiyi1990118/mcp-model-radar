const MS_API_BASE = 'https://www.modelscope.cn/api/v1';

interface MSModel {
  Id: string;
  Name: string;
  Owner?: string;
  Downloads?: number;
  Stars?: number;
  Tags?: string[];
  License?: string;
  GmtCreate?: string;
  GmtModified?: string;
}

export async function searchMSModels(query: string, limit: number = 50): Promise<any[]> {
  const url = `${MS_API_BASE}/models?Name=${encodeURIComponent(query)}&PageSize=${limit}`;

  console.error(`[ModelScope API] Requesting: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ModelRadar/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    console.error(`[ModelScope API] Response status: ${response.status}`);

    if (!response.ok) throw new Error(`ModelScope API error: ${response.status}`);

    const data = await response.json() as { Data?: { Models?: MSModel[] } };
    const models = data.Data?.Models || [];

    return models.map(m => ({
      model_id: m.Id,
      name: m.Name || m.Id.split('/')[1],
      author: m.Owner || m.Id.split('/')[0],
      downloads: m.Downloads || 0,
      likes: m.Stars || 0,
      tags: m.Tags || [],
      license: m.License || null,
      created_at: m.GmtCreate,
      updated_at: m.GmtModified || m.GmtCreate
    }));
  } catch (error: any) {
    console.error('[ModelScope API] Search failed:', error.message);
    throw error;
  }
}

export async function getMSModelDetail(modelId: string): Promise<any> {
  const url = `${MS_API_BASE}/models/${modelId}`;

  console.error(`[ModelScope API] Requesting model detail: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ModelRadar/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    console.error(`[ModelScope API] Response status: ${response.status}`);

    if (!response.ok) throw new Error(`ModelScope API error: ${response.status}`);

    const data = await response.json() as { Data?: MSModel };
    const m = data.Data;

    if (!m) throw new Error('Model not found');

    return {
      model_id: m.Id,
      name: m.Name || m.Id.split('/')[1],
      author: m.Owner || m.Id.split('/')[0],
      downloads: m.Downloads || 0,
      likes: m.Stars || 0,
      tags: m.Tags || [],
      license: m.License || null,
      created_at: m.GmtCreate,
      updated_at: m.GmtModified || m.GmtCreate
    };
  } catch (error: any) {
    console.error('[ModelScope API] Get model failed:', error.message);
    throw error;
  }
}
