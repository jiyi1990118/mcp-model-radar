import fs from 'fs';
import path from 'path';
import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';
import { calculateTrendScores } from '../analysis/trend-score.js';

const SYNC_STATE_FILE = '.sync-state.json';
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

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
    console.log('[Sync] Recently synced, skipping');
    return;
  }

  console.log('[Sync] Starting background sync...');

  // Run in background, don't block
  setImmediate(async () => {
    try {
      // Sync HuggingFace data
      if (shouldSync(state.lastHFSync)) {
        await collectHuggingFaceModels();
        state.lastHFSync = new Date().toISOString();
      }

      // Sync OpenRouter pricing
      if (shouldSync(state.lastOpenRouterSync)) {
        await collectOpenRouterPricing();
        state.lastOpenRouterSync = new Date().toISOString();
      }

      // Calculate trends
      if (shouldSync(state.lastTrendCalc)) {
        await calculateTrendScores();
        state.lastTrendCalc = new Date().toISOString();
      }

      state.lastSyncTime = new Date().toISOString();
      saveSyncState(state);
      console.log('[Sync] Background sync completed');
    } catch (error: any) {
      console.error('[Sync] Background sync failed:', error.message);
    }
  });
}
