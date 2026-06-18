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
    console.error('[arena-api] Using cached leaderboard');
    return cachedData;
  }

  console.error('[arena-api] Fetching Arena leaderboard');

  try {
    const response = await fetch(ARENA_LEADERBOARD_URL, {
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
      throw new Error(`Arena API error: ${response.status}`);
    }

    const csv = await response.text();
    const models = parseArenaCSV(csv);

    cachedData = models;
    cacheTime = now;

    console.error(`[arena-api] Fetched ${models.length} models`);
    return models;
  } catch (error: any) {
    console.error('[arena-api] Fetch failed:', error.message);
    // Return stale cache with a warning
    if (cachedData) {
      console.error('[arena-api] Returning stale cached data (age: ' +
        Math.round((now - cacheTime) / 60000) + ' min)');
    }
    return cachedData || [];
  }
}

/**
 * Quote-aware CSV parser.
 * Handles quoted fields containing commas, e.g. "Model Name, v2".
 */
function parseArenaCSV(csv: string): ArenaModel[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const models: ArenaModel[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i]);
    if (fields.length < 3) continue;

    const rank = parseInt(fields[0]);
    const model = fields[1].trim();
    const elo = parseInt(fields[2]);
    const org = fields[3]?.trim() || 'Unknown';

    if (!isNaN(rank) && model && !isNaN(elo)) {
      models.push({ model, elo, rank, organization: org });
    }
  }

  return models;
}

/**
 * Split a CSV line respecting quoted fields.
 */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
