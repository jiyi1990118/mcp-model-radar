// src/api/arena-api.ts

const ARENA_LEADERBOARD_URL = 'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard/raw/main/data/leaderboard_table.csv';

interface ArenaModel {
  model: string;
  elo: number;
  rank: number;
  organization: string;
}

let cachedData: ArenaModel[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 3600000; // 1 hour

export async function fetchArenaLeaderboard(): Promise<ArenaModel[]> {
  const now = Date.now();
  if (cachedData && (now - cacheTime) < CACHE_TTL) {
    console.log('[arena-api] Using cached leaderboard');
    return cachedData;
  }

  console.log('[arena-api] Fetching Arena leaderboard');

  try {
    const response = await fetch(ARENA_LEADERBOARD_URL);
    if (!response.ok) {
      throw new Error(`Arena API error: ${response.status}`);
    }

    const csv = await response.text();
    const models = parseArenaCSV(csv);

    cachedData = models;
    cacheTime = now;

    console.log(`[arena-api] Fetched ${models.length} models`);
    return models;
  } catch (error: any) {
    console.error('[arena-api] Fetch failed:', error.message);
    return cachedData || [];
  }
}

function parseArenaCSV(csv: string): ArenaModel[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const models: ArenaModel[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');

    if (parts.length < 3) continue;

    const rank = parseInt(parts[0]);
    const model = parts[1].trim();
    const elo = parseInt(parts[2]);
    const org = parts[3]?.trim() || 'Unknown';

    if (!isNaN(rank) && model && !isNaN(elo)) {
      models.push({ model, elo, rank, organization: org });
    }
  }

  return models;
}

export async function getModelELO(modelName: string): Promise<number | null> {
  const leaderboard = await fetchArenaLeaderboard();
  const normalized = modelName.toLowerCase().replace(/[-_]/g, ' ');

  const match = leaderboard.find(m =>
    m.model.toLowerCase().replace(/[-_]/g, ' ').includes(normalized) ||
    normalized.includes(m.model.toLowerCase().replace(/[-_]/g, ' '))
  );

  return match ? match.elo : null;
}
