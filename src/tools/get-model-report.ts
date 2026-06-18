// src/tools/get-model-report.ts
import { generateModelReport } from '../analysis/report-generator.js';

export async function getModelReportHandler(args: any) {
  const period = args.period === 'monthly' ? 'monthly' : 'weekly';

  console.error(`[get_model_report] Generating ${period} report`);

  try {
    const report = await generateModelReport(period);

    console.error(`[get_model_report] Report generated successfully`);

    return report;
  } catch (error: any) {
    console.error(`[get_model_report] Error:`, error.message);
    throw new Error(`Failed to generate model report: ${error.message}`);
  }
}
