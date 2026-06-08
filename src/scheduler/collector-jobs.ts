import cron from 'node-cron';
import { collectHuggingFaceModels } from '../collectors/huggingface.js';
import { collectOpenRouterPricing } from '../collectors/openrouter.js';
import { calculateTrendScores } from '../analysis/trend-score.js';

export function startScheduler() {
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('Scheduler disabled');
    return;
  }

  console.log('Starting scheduler...');

  // Hourly collection at :00
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly collection...');
    await collectHuggingFaceModels();
    await collectOpenRouterPricing();
  });

  // Daily trend calculation at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily trend calculation...');
    await calculateTrendScores();
  });

  console.log('Scheduler started');
}
