import cron from 'node-cron';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';
import { collectGithubRepos } from '../collectors/github.js';
import { calculateTrendScores } from '../analysis/trend-score.js';

const DATA_DIR = join(homedir(), '.mcp-model-radar');
const LOCK_FILE = join(DATA_DIR, '.scheduler.lock');

function isProcessRunning(pid: number): boolean {
  try {
    // Signal 0 checks if the process exists without killing it
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tryAcquireSchedulerLock(): boolean {
  try {
    if (existsSync(LOCK_FILE)) {
      const content = readFileSync(LOCK_FILE, 'utf-8').trim();
      const existingPid = parseInt(content, 10);
      if (!isNaN(existingPid) && isProcessRunning(existingPid)) {
        console.error(`[Scheduler] Another instance is running (PID: ${existingPid}), skipping scheduler`);
        return false;
      }
      // Stale lock — remove it
      unlinkSync(LOCK_FILE);
    }
    writeFileSync(LOCK_FILE, String(process.pid));
    return true;
  } catch (error) {
    console.error('[Scheduler] Failed to acquire lock:', error);
    return false;
  }
}

function releaseSchedulerLock() {
  try {
    if (existsSync(LOCK_FILE)) {
      const content = readFileSync(LOCK_FILE, 'utf-8').trim();
      if (parseInt(content, 10) === process.pid) {
        unlinkSync(LOCK_FILE);
      }
    }
  } catch {}
}

export function startScheduler() {
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.error('Scheduler disabled');
    return;
  }

  // In HTTP mode, only one process should run the scheduler
  if (!tryAcquireSchedulerLock()) {
    return;
  }

  console.error('Starting scheduler (PID: ' + process.pid + ')...');

  // Hourly collection at :00
  cron.schedule('0 * * * *', () => {
    console.error('Running hourly collection...');
    Promise.all([collectHuggingFaceModels(), collectOpenRouterPricing()])
      .catch(err => console.error('Hourly collection failed:', err.message));
  });

  // Daily trend calculation at 2 AM
  cron.schedule('0 2 * * *', () => {
    console.error('Running daily trend calculation...');
    calculateTrendScores()
      .catch(err => console.error('Trend calculation failed:', err.message));
  });

  // Daily GitHub collection at 3 AM
  cron.schedule('0 3 * * *', () => {
    console.error('Running GitHub collection...');
    collectGithubRepos()
      .catch(err => console.error('GitHub collection failed:', err.message));
  });

  console.error('Scheduler started');

  // Release lock on exit
  process.on('exit', releaseSchedulerLock);
  process.on('SIGINT', () => {
    releaseSchedulerLock();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    releaseSchedulerLock();
    process.exit(0);
  });
}
