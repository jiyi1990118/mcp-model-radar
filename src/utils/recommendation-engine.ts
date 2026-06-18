// src/utils/recommendation-engine.ts

interface TaskConstraints {
  max_vram_gb?: number;
  max_cost_per_1m?: number;
  min_context?: number;
  license?: string;
  min_params?: string;
  max_params?: string;
}

interface TaskProfile {
  preferred_tags: string[];
  min_downloads?: number;
  weight_downloads: number;
  weight_trend: number;
  weight_cost: number;
}

const TASK_PROFILES: Record<string, TaskProfile> = {
  'code-generation': {
    preferred_tags: ['text-generation', 'code'],
    min_downloads: 50000,
    weight_downloads: 0.3,
    weight_trend: 0.4,
    weight_cost: 0.3
  },
  'translation': {
    preferred_tags: ['text-generation', 'translation'],
    min_downloads: 30000,
    weight_downloads: 0.4,
    weight_trend: 0.3,
    weight_cost: 0.3
  },
  'chat': {
    preferred_tags: ['text-generation', 'conversational'],
    min_downloads: 100000,
    weight_downloads: 0.4,
    weight_trend: 0.4,
    weight_cost: 0.2
  },
  'summarization': {
    preferred_tags: ['text-generation', 'summarization'],
    min_downloads: 30000,
    weight_downloads: 0.3,
    weight_trend: 0.3,
    weight_cost: 0.4
  },
  'reasoning': {
    preferred_tags: ['text-generation', 'reasoning'],
    min_downloads: 50000,
    weight_downloads: 0.3,
    weight_trend: 0.5,
    weight_cost: 0.2
  }
};

export function scoreModelForTask(model: any, task: string, constraints: TaskConstraints): number {
  const profile = TASK_PROFILES[task];
  if (!profile) return 0;

  let score = 0;

  // Check hard constraints
  if (constraints.max_vram_gb) {
    const vramNeeded = estimateVRAM(model.params);
    if (vramNeeded && vramNeeded > constraints.max_vram_gb) return -1;
  }

  if (constraints.max_cost_per_1m) {
    const totalCost = (model.input_cost || 0) + (model.output_cost || 0);
    if (totalCost > constraints.max_cost_per_1m) return -1;
  }

  if (constraints.min_context && model.context_length < constraints.min_context) {
    return -1;
  }

  if (constraints.license) {
    const isCommercial = constraints.license === 'commercial';
    const commercialLicenses = ['apache-2.0', 'mit', 'cc-by-4.0'];
    if (isCommercial && !commercialLicenses.includes(model.license?.toLowerCase())) {
      return -1;
    }
  }

  // Tag matching
  const modelTags = (model.tags || '').toLowerCase();
  const matchingTags = profile.preferred_tags.filter(tag => modelTags.includes(tag));
  const tagScore = matchingTags.length / profile.preferred_tags.length;

  // Downloads score (normalized to 0-1)
  const downloadScore = Math.min((model.downloads || 0) / 1000000, 1);

  // Trend score (already 0-100, normalize to 0-1)
  const trendScore = (model.trend_score || 0) / 100;

  // Cost score (lower is better, normalize to 0-1)
  // Models without pricing data get a neutral score (0.5) instead of being penalized
  const hasCost = model.input_cost != null || model.output_cost != null;
  const totalCost = (model.input_cost || 0) + (model.output_cost || 0);
  const costScore = hasCost ? Math.max(0, 1 - (totalCost / 10)) : 0.5;

  // Weighted score: tag matching is 30%, downloads/trend/cost use profile weights
  // Normalize so total always sums to 1.0
  const TAG_WEIGHT = 0.3;
  const profileWeightSum = profile.weight_downloads + profile.weight_trend + profile.weight_cost;
  const totalWeight = TAG_WEIGHT + profileWeightSum;

  score = (
    tagScore * TAG_WEIGHT +
    downloadScore * profile.weight_downloads +
    trendScore * profile.weight_trend +
    costScore * profile.weight_cost
  ) / totalWeight * 100;

  return score;
}

function estimateVRAM(params: string | null): number | null {
  if (!params) return null;
  const match = params.match(/(\d+\.?\d*)/);
  if (!match) return null;
  const size = parseFloat(match[1]);
  return size * 2; // FP16 estimate
}

export function explainRecommendation(model: any, task: string, score: number): string {
  const reasons: string[] = [];

  if (score > 80) reasons.push('Excellent match for this task');
  else if (score > 60) reasons.push('Good match for this task');
  else reasons.push('Moderate match for this task');

  if (model.downloads > 500000) reasons.push('Highly popular');
  if (model.trend_score > 70) reasons.push('Currently trending');
  if ((model.input_cost || 0) < 0.5) reasons.push('Cost-effective');
  if (model.context_length > 30000) reasons.push('Large context window');

  return reasons.join('; ');
}
