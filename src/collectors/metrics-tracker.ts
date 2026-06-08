// src/collectors/metrics-tracker.ts
import db from '../db/connection-sqlite.js';
import { recordMetricsSnapshot } from '../db/queries-sqlite.js';

export async function captureMetricsSnapshot() {
  console.log('[metrics-tracker] Capturing metrics snapshot');

  try {
    recordMetricsSnapshot(db);
    console.log('[metrics-tracker] Snapshot saved');
  } catch (error: any) {
    console.error('[metrics-tracker] Failed:', error.message);
  }
}

// Schedule daily snapshots
export function startMetricsTracking() {
  const INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  setInterval(() => {
    captureMetricsSnapshot();
  }, INTERVAL);

  // Initial capture
  captureMetricsSnapshot();
}
