import fs from 'fs';

const MIRROR_CACHE_FILE = '.mirror-cache.json';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const MIRROR_POOL = [
  'https://hf-mirror.com/api',
  'https://huggingface.co/api',
  'https://hf.co/api'
];

interface MirrorCache {
  fastest: string;
  timestamp: string;
}

async function testMirror(baseUrl: string): Promise<number> {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}/models?limit=1`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return Infinity;
    await response.json();
    return Date.now() - start;
  } catch {
    return Infinity;
  }
}

function loadCache(): MirrorCache | null {
  try {
    if (fs.existsSync(MIRROR_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(MIRROR_CACHE_FILE, 'utf-8'));
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age < CACHE_TTL_MS) return data;
    }
  } catch {}
  return null;
}

function saveCache(mirror: string) {
  try {
    fs.writeFileSync(MIRROR_CACHE_FILE, JSON.stringify({
      fastest: mirror,
      timestamp: new Date().toISOString()
    }));
  } catch {}
}

export async function getFastestMirror(): Promise<string> {
  const cached = loadCache();
  if (cached) return cached.fastest;

  console.error('[Mirror Pool] Testing mirrors...');
  const results = await Promise.all(
    MIRROR_POOL.map(async (url) => ({
      url,
      time: await testMirror(url)
    }))
  );

  const fastest = results.reduce((a, b) => a.time < b.time ? a : b);
  console.error(`[Mirror Pool] Fastest: ${fastest.url} (${fastest.time}ms)`);

  saveCache(fastest.url);
  return fastest.url;
}
