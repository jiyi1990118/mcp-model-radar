// src/collectors/metrics-tracker.ts
import db from '../db/connection-sqlite.js';
import { recordMetricsSnapshot } from '../db/index.js';

export async function captureMetricsSnapshot() {
  console.error('[metrics-tracker] Capturing metrics snapshot');

  try {
    if (process.env.DB_TYPE === 'postgresql') {
      const { default: pool } = await import('../db/connection.js');
      recordMetricsSnapshot(pool);
    } else {
      recordMetricsSnapshot(db);
    }
    console.error('[metrics-tracker] Snapshot saved');
  } catch (error: any) {
    console.error('[metrics-tracker] Failed:', error.message);
  }
}
