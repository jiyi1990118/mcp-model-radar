import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';
import { calculateTrendScores } from '../analysis/trend-score.js';

const DATA_DIR = join(homedir(), '.mcp-model-radar');
const SYNC_STATE_FILE = join(DATA_DIR, '.sync-state.json');
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface SyncState {
  lastSyncTime: string;
  lastHFSync: string;
  lastOpenRouterSync: string;
  lastTrendCalc: string;
}

let cachedState: SyncState | null = null;

function loadSyncState(): SyncState {
  if (cachedState) return cachedState;
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      const data = fs.readFileSync(SYNC_STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore errors
  }

  const now = new Date().toISOString();
  return {
    lastSyncTime: now,
    lastHFSync: now,
    lastOpenRouterSync: now,
    lastTrendCalc: now
  };
}

function saveSyncState(state: SyncState) {
  cachedState = state;
  try {
    fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[Sync] Failed to save sync state:', e);
  }
}

function shouldSync(lastSync: string): boolean {
  const lastTime = new Date(lastSync).getTime();
  const now = Date.now();
  return (now - lastTime) > SYNC_INTERVAL_MS;
}

export async function triggerSyncIfNeeded() {
  const state = loadSyncState();

  if (!shouldSync(state.lastSyncTime)) {
    console.error('[Sync] Recently synced, skipping');
    return;
  }

  console.error('[Sync] Starting background sync...');

  // Run in background, don't block
  setImmediate(async () => {
    try {
      const tasks: Promise<void>[] = [];

      // Sync HuggingFace data
      if (shouldSync(state.lastHFSync)) {
        tasks.push(
          collectHuggingFaceModels().then(() => {
            state.lastHFSync = new Date().toISOString();
          })
        );
      }

      // Sync OpenRouter pricing
      if (shouldSync(state.lastOpenRouterSync)) {
        tasks.push(
          collectOpenRouterPricing().then(() => {
            state.lastOpenRouterSync = new Date().toISOString();
          })
        );
      }

      // Run independent collections in parallel
      await Promise.all(tasks);

      // Calculate trends (depends on fresh data from both sources)
      if (shouldSync(state.lastTrendCalc)) {
        await calculateTrendScores();
        state.lastTrendCalc = new Date().toISOString();
      }

      state.lastSyncTime = new Date().toISOString();
      saveSyncState(state);
      console.error('[Sync] Background sync completed');
    } catch (error: any) {
      console.error('[Sync] Background sync failed:', error.message);
    }
  });
}
