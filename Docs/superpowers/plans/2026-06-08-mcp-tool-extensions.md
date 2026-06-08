# MCP Tool Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 powerful MCP tools: batch comparison, task-based recommendations, deployment guides, benchmark data, and trend tracking

**Architecture:** Phase 1 extends existing tools using current data; Phase 2 adds rule-based deployment guidance; Phase 3 integrates Arena API; Phase 4 adds historical tracking with database schema changes

**Tech Stack:** TypeScript, SQLite/PostgreSQL, HuggingFace API, LMSYS Arena API, MCP SDK

---

## File Structure Overview

**Phase 1 - Simple Extensions:**
- `src/tools/compare-models-batch.ts` - NEW: Batch comparison tool
- `src/tools/recommend-for-task.ts` - NEW: Task recommendation engine
- `src/utils/recommendation-engine.ts` - NEW: Recommendation logic

**Phase 2 - Deployment Guide:**
- `src/tools/get-deployment-guide.ts` - NEW: Deployment guidance tool
- `src/utils/deployment-rules.ts` - NEW: Deployment decision rules

**Phase 3 - Benchmarks:**
- `src/tools/get-model-benchmarks.ts` - NEW: Benchmark data tool
- `src/api/arena-api.ts` - NEW: Arena API client
- `src/db/schema-sqlite.sql` - MODIFY: Add benchmarks table
- `src/db/queries-sqlite.ts` - MODIFY: Add benchmark queries

**Phase 4 - Trend Tracking:**
- `src/tools/get-trending-changes.ts` - NEW: Trend change tool
- `src/db/schema-sqlite.sql` - MODIFY: Add metrics_history table
- `src/collectors/metrics-tracker.ts` - NEW: Historical metrics collector

**All Phases:**
- `src/server.ts` - MODIFY: Register 5 new tools
- `MCP_TOOLS.md` - MODIFY: Add documentation for new tools

---

## Phase 1: Simple Extensions Using Existing Data

### Task 1: compare_models_batch - Batch Comparison Core

**Files:**
- Create: `src/tools/compare-models-batch.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Create tool file**

```typescript
import { getModelById } from '../db/index.js';

export async function compareModelsBatch(args: any) {
  const modelIds = args.model_ids;
  const dimensions = args.dimensions || ['performance', 'cost', 'vram', 'context'];
  
  if (!modelIds || !Array.isArray(modelIds)) {
    throw new Error('model_ids must be an array');
  }
  
  if (modelIds.length < 2 || modelIds.length > 5) {
    throw new Error('Must compare between 2 and 5 models');
  }

  console.log(`[compare_models_batch] Comparing ${modelIds.length} models`);

  const models = await Promise.all(
    modelIds.map(id => getModelById(id))
  );

  const missing = models.map((m, i) => m ? null : modelIds[i]).filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Models not found: ${missing.join(', ')}`);
  }

  return {
    success: true,
    count: models.length,
    models: models.map(m => ({
      model_id: m!.model_id,
      name: m!.name,
      author: m!.author,
      params: m!.params,
      downloads: m!.downloads,
      likes: m!.likes,
      trend_score: m!.trend_score || 0,
      license: m!.license,
      context_length: m!.context_length,
      input_cost: m!.input_cost,
      output_cost: m!.output_cost
    })),
    comparison_matrix: buildComparisonMatrix(models as any[], dimensions)
  };
}

function buildComparisonMatrix(models: any[], dimensions: string[]) {
  const matrix: any = {};
  
  if (dimensions.includes('downloads')) {
    const sorted = [...models].sort((a, b) => b.downloads - a.downloads);
    matrix.downloads = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.downloads,
      winner: i === 0
    }));
  }
  
  if (dimensions.includes('likes')) {
    const sorted = [...models].sort((a, b) => b.likes - a.likes);
    matrix.likes = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.likes,
      winner: i === 0
    }));
  }
  
  if (dimensions.includes('cost')) {
    const sorted = [...models].sort((a, b) => {
      const costA = (a.input_cost || 999) + (a.output_cost || 999);
      const costB = (b.input_cost || 999) + (b.output_cost || 999);
      return costA - costB;
    });
    matrix.cost = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: `$${m.input_cost || 'N/A'}/$${m.output_cost || 'N/A'}`,
      winner: i === 0
    }));
  }
  
  if (dimensions.includes('context')) {
    const sorted = [...models].sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
    matrix.context = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.context_length || 'N/A',
      winner: i === 0
    }));
  }
  
  if (dimensions.includes('performance')) {
    const sorted = [...models].sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));
    matrix.performance = sorted.map((m, i) => ({
      rank: i + 1,
      model_id: m.model_id,
      value: m.trend_score || 0,
      winner: i === 0
    }));
  }
  
  return matrix;
}
```

- [ ] **Step 2: Register tool in server.ts**

Add to `src/server.ts` in the `ListToolsRequestSchema` handler:

```typescript
{
  name: 'compare_models_batch',
  description: 'Compare 2-5 models across multiple dimensions (downloads, likes, cost, context, performance)',
  inputSchema: {
    type: 'object',
    properties: {
      model_ids: { 
        type: 'array',
        items: { type: 'string' },
        description: 'Array of 2-5 model IDs to compare',
        minItems: 2,
        maxItems: 5
      },
      dimensions: {
        type: 'array',
        items: { 
          type: 'string',
          enum: ['downloads', 'likes', 'cost', 'context', 'performance']
        },
        description: 'Dimensions to compare (default: all)',
        default: ['performance', 'cost', 'vram', 'context']
      }
    },
    required: ['model_ids']
  }
}
```

- [ ] **Step 3: Add handler in server.ts**

Add to the `CallToolRequestSchema` handler:

```typescript
import { compareModelsBatch } from './tools/compare-models-batch.js';

// In the handler switch/if block:
else if (name === 'compare_models_batch') {
  result = await compareModelsBatch(args || {});
}
```

- [ ] **Step 4: Build and test**

```bash
npm run build
```

Expected: No compilation errors

- [ ] **Step 5: Test with sample data**

Start server and test via Claude Desktop or MCP inspector:
```json
{
  "model_ids": ["Qwen/Qwen2.5-72B-Instruct", "meta-llama/Llama-3.1-70B-Instruct"],
  "dimensions": ["downloads", "likes", "cost"]
}
```

Expected: Comparison matrix with rankings

- [ ] **Step 6: Commit**

```bash
git add src/tools/compare-models-batch.ts src/server.ts
git commit -m "feat: add compare_models_batch tool for 2-5 model comparison"
```

---

### Task 2: recommend_for_task - Recommendation Engine

**Files:**
- Create: `src/utils/recommendation-engine.ts`
- Create: `src/tools/recommend-for-task.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Create recommendation engine**

```typescript
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
  const reasons: string[] = [];

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
  const downloadScore = Math.min(model.downloads / 1000000, 1);
  
  // Trend score (already 0-100, normalize to 0-1)
  const trendScore = (model.trend_score || 0) / 100;
  
  // Cost score (lower is better, normalize to 0-1)
  const totalCost = (model.input_cost || 1) + (model.output_cost || 1);
  const costScore = Math.max(0, 1 - (totalCost / 10));

  // Weighted score
  score = (
    tagScore * 0.3 +
    downloadScore * profile.weight_downloads +
    trendScore * profile.weight_trend +
    costScore * profile.weight_cost
  ) * 100;

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
```

- [ ] **Step 2: Create tool implementation**

```typescript
// src/tools/recommend-for-task.ts
import { searchModels as dbSearch } from '../db/index.js';
import { scoreModelForTask, explainRecommendation } from '../utils/recommendation-engine.js';

export async function recommendForTask(args: any) {
  const task = args.task;
  const constraints = args.constraints || {};
  const topN = args.top_n || 3;

  if (!task) {
    throw new Error('task parameter is required');
  }

  const validTasks = ['code-generation', 'translation', 'chat', 'summarization', 'reasoning'];
  if (!validTasks.includes(task)) {
    throw new Error(`Invalid task. Must be one of: ${validTasks.join(', ')}`);
  }

  console.log(`[recommend_for_task] Finding models for task: ${task}`);

  // Get candidate models (top 100 by trend score)
  const candidates = await dbSearch('', {}, 'trend_score', 100);

  // Score each model
  const scored = candidates
    .map(model => ({
      model,
      score: scoreModelForTask(model, task, constraints),
      reason: ''
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  // Add explanations
  scored.forEach(item => {
    item.reason = explainRecommendation(item.model, task, item.score);
  });

  return {
    success: true,
    task,
    constraints,
    recommendations: scored.map(item => ({
      model_id: item.model.model_id,
      name: item.model.name,
      author: item.model.author,
      score: Math.round(item.score),
      reason: item.reason,
      metrics: {
        downloads: item.model.downloads,
        likes: item.model.likes,
        trend_score: item.model.trend_score || 0
      },
      deployment: {
        params: item.model.params,
        context_length: item.model.context_length,
        license: item.model.license
      },
      pricing: item.model.input_cost ? {
        input_cost: item.model.input_cost,
        output_cost: item.model.output_cost
      } : null
    }))
  };
}
```

- [ ] **Step 3: Register tool in server.ts**

Add tool definition:

```typescript
{
  name: 'recommend_for_task',
  description: 'Get AI model recommendations for a specific task with optional constraints',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        enum: ['code-generation', 'translation', 'chat', 'summarization', 'reasoning'],
        description: 'The task to find models for'
      },
      constraints: {
        type: 'object',
        description: 'Optional constraints',
        properties: {
          max_vram_gb: { type: 'number', description: 'Maximum VRAM in GB' },
          max_cost_per_1m: { type: 'number', description: 'Maximum cost per 1M tokens' },
          min_context: { type: 'number', description: 'Minimum context length' },
          license: { type: 'string', enum: ['commercial', 'any'], description: 'License requirement' }
        }
      },
      top_n: { type: 'number', description: 'Number of recommendations', default: 3 }
    },
    required: ['task']
  }
}
```

- [ ] **Step 4: Add handler**

```typescript
import { recommendForTask } from './tools/recommend-for-task.js';

else if (name === 'recommend_for_task') {
  result = await recommendForTask(args || {});
}
```

- [ ] **Step 5: Build and test**

```bash
npm run build
```

Test query:
```json
{
  "task": "code-generation",
  "constraints": {
    "max_vram_gb": 24,
    "license": "commercial"
  }
}
```

Expected: Top 3 models with scores and reasons

- [ ] **Step 6: Commit**

```bash
git add src/utils/recommendation-engine.ts src/tools/recommend-for-task.ts src/server.ts
git commit -m "feat: add recommend_for_task tool with scoring engine"
```

---

## Phase 2: Deployment Guide with Rules Engine

### Task 3: get_deployment_guide - Deployment Decision Rules

**Files:**
- Create: `src/utils/deployment-rules.ts`
- Create: `src/tools/get-deployment-guide.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Create deployment rules engine**

```typescript
// src/utils/deployment-rules.ts

interface Hardware {
  gpu?: string;
  vram_gb?: number;
  ram_gb?: number;
  cpu_cores?: number;
}

interface DeploymentOption {
  method: string;
  vram_required: number;
  feasible: boolean;
  performance: string;
  tools: string[];
  instructions: string;
}

export function analyzeDeployment(model: any, hardware: Hardware): any {
  const params = extractParamSize(model.params);
  if (!params) {
    return {
      feasible: false,
      reason: 'Unable to determine model size',
      recommendations: []
    };
  }

  const userVRAM = hardware.vram_gb || 0;
  const options: DeploymentOption[] = [];

  // FP16 Full Precision
  const fp16VRAM = params * 2;
  options.push({
    method: 'FP16 Full Precision',
    vram_required: fp16VRAM,
    feasible: fp16VRAM <= userVRAM,
    performance: 'Best quality, no degradation',
    tools: ['vLLM', 'text-generation-webui', 'transformers'],
    instructions: `Load model with torch_dtype=float16`
  });

  // INT8 Quantization
  const int8VRAM = params * 1;
  options.push({
    method: 'INT8 Quantization',
    vram_required: int8VRAM,
    feasible: int8VRAM <= userVRAM,
    performance: 'Minimal quality loss (<2%), 50% memory savings',
    tools: ['llama.cpp', 'bitsandbytes', 'GPTQ'],
    instructions: `Use load_in_8bit=True or GGUF Q8_0 format`
  });

  // INT4 Quantization
  const int4VRAM = params * 0.5;
  options.push({
    method: 'INT4 Quantization (GGUF Q4_K_M)',
    vram_required: int4VRAM,
    feasible: int4VRAM <= userVRAM,
    performance: 'Small quality loss (3-5%), 75% memory savings',
    tools: ['llama.cpp', 'GPTQ', 'AWQ'],
    instructions: `Download GGUF Q4_K_M version or use AWQ`
  });

  // INT3 Quantization
  const int3VRAM = params * 0.375;
  options.push({
    method: 'INT3 Quantization (GGUF Q3_K_M)',
    vram_required: int3VRAM,
    feasible: int3VRAM <= userVRAM,
    performance: 'Noticeable quality loss (5-10%), extreme memory savings',
    tools: ['llama.cpp'],
    instructions: `Download GGUF Q3_K_M version for resource-constrained deployment`
  });

  // Find feasible options
  const feasible = options.filter(o => o.feasible);
  const recommended = feasible.length > 0 ? feasible[0] : null;

  // Alternative: smaller model
  let smallerModelSuggestion = null;
  if (feasible.length === 0) {
    if (params >= 70) smallerModelSuggestion = '13B-30B range';
    else if (params >= 30) smallerModelSuggestion = '7B-13B range';
    else if (params >= 13) smallerModelSuggestion = '3B-7B range';
    else smallerModelSuggestion = '1B-3B range';
  }

  return {
    feasible: feasible.length > 0,
    reason: feasible.length > 0 
      ? `${feasible.length} deployment option(s) available`
      : `Model requires ${fp16VRAM}GB VRAM (FP16), you have ${userVRAM}GB`,
    hardware_summary: {
      provided: hardware,
      model_size: `${params}B parameters`
    },
    recommended_option: recommended,
    all_options: options,
    alternative_suggestion: smallerModelSuggestion ? {
      reason: 'Consider using a smaller model',
      suggested_range: smallerModelSuggestion
    } : null
  };
}

function extractParamSize(params: string | null): number | null {
  if (!params) return null;
  const match = params.match(/(\d+\.?\d*)/);
  if (!match) return null;
  return parseFloat(match[1]);
}
```

- [ ] **Step 2: Create tool implementation**

```typescript
// src/tools/get-deployment-guide.ts
import { getModelById } from '../db/index.js';
import { analyzeDeployment } from '../utils/deployment-rules.js';

export async function getDeploymentGuide(args: any) {
  const modelId = args.model_id;
  const hardware = args.hardware || {};

  if (!modelId) {
    throw new Error('model_id is required');
  }

  console.log(`[get_deployment_guide] Analyzing deployment for: ${modelId}`);

  const model = await getModelById(modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  const analysis = analyzeDeployment(model, hardware);

  return {
    success: true,
    model: {
      model_id: model.model_id,
      name: model.name,
      params: model.params
    },
    ...analysis
  };
}
```

- [ ] **Step 3: Register tool in server.ts**

```typescript
{
  name: 'get_deployment_guide',
  description: 'Get deployment guidance and feasibility analysis based on hardware constraints',
  inputSchema: {
    type: 'object',
    properties: {
      model_id: { type: 'string', description: 'Model ID to analyze' },
      hardware: {
        type: 'object',
        description: 'Hardware specifications',
        properties: {
          gpu: { type: 'string', description: 'GPU model (e.g., RTX 4090)' },
          vram_gb: { type: 'number', description: 'VRAM in GB' },
          ram_gb: { type: 'number', description: 'System RAM in GB' },
          cpu_cores: { type: 'number', description: 'CPU core count' }
        }
      }
    },
    required: ['model_id']
  }
}
```

- [ ] **Step 4: Add handler**

```typescript
import { getDeploymentGuide } from './tools/get-deployment-guide.js';

else if (name === 'get_deployment_guide') {
  result = await getDeploymentGuide(args || {});
}
```

- [ ] **Step 5: Build and test**

```bash
npm run build
```

Test:
```json
{
  "model_id": "meta-llama/Llama-3.1-70B-Instruct",
  "hardware": {
    "gpu": "RTX 4090",
    "vram_gb": 24
  }
}
```

Expected: Deployment options with feasibility

- [ ] **Step 6: Commit**

```bash
git add src/utils/deployment-rules.ts src/tools/get-deployment-guide.ts src/server.ts
git commit -m "feat: add get_deployment_guide tool with rules engine"
```

---

## Phase 3: Benchmarks with Arena API Integration

### Task 4: Arena API Client

**Files:**
- Create: `src/api/arena-api.ts`

- [ ] **Step 1: Create Arena API client**

```typescript
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
```

- [ ] **Step 2: Test Arena API**

```bash
npm run build
node -e "import('./dist/api/arena-api.js').then(m => m.fetchArenaLeaderboard().then(d => console.log(d.slice(0,3))))"
```

Expected: Array of top 3 Arena models with ELO scores

- [ ] **Step 3: Commit**

```bash
git add src/api/arena-api.ts
git commit -m "feat: add Arena API client for ELO ratings"
```

---

### Task 5: get_model_benchmarks Tool

**Files:**
- Create: `src/tools/get-model-benchmarks.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Create tool implementation**

```typescript
// src/tools/get-model-benchmarks.ts
import { getModelById } from '../db/index.js';
import { fetchArenaLeaderboard } from '../api/arena-api.js';

export async function getModelBenchmarks(args: any) {
  const modelId = args.model_id;
  
  if (!modelId) {
    throw new Error('model_id is required');
  }

  console.log(`[get_model_benchmarks] Fetching benchmarks for: ${modelId}`);

  const model = await getModelById(modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  // Get Arena data
  const leaderboard = await fetchArenaLeaderboard();
  const modelName = model.name.toLowerCase();
  
  const arenaMatch = leaderboard.find(m => {
    const name = m.model.toLowerCase();
    return name.includes(modelName) || modelName.includes(name);
  });

  const benchmarks: any = {
    model_id: model.model_id,
    model_name: model.name,
    benchmarks: {}
  };

  if (arenaMatch) {
    benchmarks.benchmarks.arena = {
      elo_rating: arenaMatch.elo,
      rank: arenaMatch.rank,
      organization: arenaMatch.organization,
      source: 'LMSYS Chatbot Arena'
    };
  } else {
    benchmarks.benchmarks.arena = {
      status: 'not_found',
      note: 'Model not found in Arena leaderboard'
    };
  }

  // Placeholder for future benchmark sources
  benchmarks.benchmarks.note = 'Additional benchmarks (MMLU, HumanEval, GSM8K) coming in future updates';

  return {
    success: true,
    data: benchmarks
  };
}
```

- [ ] **Step 2: Register tool**

```typescript
{
  name: 'get_model_benchmarks',
  description: 'Get benchmark scores and rankings for a model (Arena ELO, MMLU, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      model_id: { type: 'string', description: 'Model ID to get benchmarks for' }
    },
    required: ['model_id']
  }
}
```

- [ ] **Step 3: Add handler**

```typescript
import { getModelBenchmarks } from './tools/get-model-benchmarks.js';

else if (name === 'get_model_benchmarks') {
  result = await getModelBenchmarks(args || {});
}
```

- [ ] **Step 4: Build and test**

```bash
npm run build
```

Test with popular model:
```json
{
  "model_id": "Qwen/Qwen2.5-72B-Instruct"
}
```

Expected: Arena ELO and rank if available

- [ ] **Step 5: Commit**

```bash
git add src/tools/get-model-benchmarks.ts src/server.ts
git commit -m "feat: add get_model_benchmarks tool with Arena integration"
```

---

## Phase 4: Trend Tracking with Historical Data

### Task 6: Database Schema for Historical Tracking

**Files:**
- Modify: `src/db/schema-sqlite.sql`

- [ ] **Step 1: Add metrics_history table**

```sql
-- Add to src/db/schema-sqlite.sql

CREATE TABLE IF NOT EXISTS metrics_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score REAL DEFAULT 0,
  arena_rank INTEGER,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(model_id)
);

CREATE INDEX IF NOT EXISTS idx_metrics_history_model ON metrics_history(model_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded ON metrics_history(recorded_at);
```

- [ ] **Step 2: Apply schema changes**

```bash
sqlite3 modelradar.db < src/db/schema-sqlite.sql
```

Expected: Tables created successfully

- [ ] **Step 3: Commit**

```bash
git add src/db/schema-sqlite.sql
git commit -m "feat: add metrics_history table for trend tracking"
```

---

### Task 7: Historical Metrics Collector

**Files:**
- Create: `src/collectors/metrics-tracker.ts`
- Modify: `src/db/queries-sqlite.ts`

- [ ] **Step 1: Add history queries**

```typescript
// Add to src/db/queries-sqlite.ts

export function recordMetricsSnapshot(db: any) {
  const stmt = db.prepare(`
    INSERT INTO metrics_history (model_id, downloads, likes, trend_score, arena_rank)
    SELECT model_id, downloads, likes, trend_score, NULL FROM models
  `);
  return stmt.run();
}

export function getMetricsHistory(db: any, modelId: string, days: number = 30) {
  const stmt = db.prepare(`
    SELECT 
      downloads, likes, trend_score, arena_rank,
      datetime(recorded_at) as recorded_at
    FROM metrics_history
    WHERE model_id = ?
      AND recorded_at >= datetime('now', '-' || ? || ' days')
    ORDER BY recorded_at ASC
  `);
  return stmt.all(modelId, days);
}
```

- [ ] **Step 2: Create metrics tracker**

```typescript
// src/collectors/metrics-tracker.ts
import { getDb } from '../db/index.js';
import { recordMetricsSnapshot } from '../db/queries-sqlite.js';

export async function captureMetricsSnapshot() {
  console.log('[metrics-tracker] Capturing metrics snapshot');
  
  try {
    const db = getDb();
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
```

- [ ] **Step 3: Commit**

```bash
git add src/collectors/metrics-tracker.ts src/db/queries-sqlite.ts
git commit -m "feat: add metrics tracking collector"
```

---

### Task 8: get_trending_changes Tool

**Files:**
- Create: `src/tools/get-trending-changes.ts`
- Modify: `src/db/queries-sqlite.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Add trend analysis queries**

```typescript
// Add to src/db/queries-sqlite.ts

export function getTrendingChanges(db: any, period: string = '7d', metric: string = 'trend_score') {
  const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
  
  const query = `
    WITH recent AS (
      SELECT model_id, ${metric} as current_value
      FROM models
    ),
    historical AS (
      SELECT 
        model_id,
        AVG(${metric === 'trend_score' ? 'trend_score' : metric}) as past_value
      FROM metrics_history
      WHERE recorded_at BETWEEN datetime('now', '-' || ? || ' days') AND datetime('now', '-' || ? || ' days')
      GROUP BY model_id
    )
    SELECT 
      r.model_id,
      m.name,
      m.author,
      r.current_value,
      COALESCE(h.past_value, r.current_value) as past_value,
      ROUND(((r.current_value - COALESCE(h.past_value, r.current_value)) / NULLIF(COALESCE(h.past_value, 1), 0)) * 100, 2) as growth_rate,
      (r.current_value - COALESCE(h.past_value, r.current_value)) as absolute_change
    FROM recent r
    LEFT JOIN historical h ON r.model_id = h.model_id
    JOIN models m ON r.model_id = m.model_id
    WHERE r.current_value > 0
    ORDER BY absolute_change DESC
    LIMIT 50
  `;
  
  return db.prepare(query).all(days + 1, days);
}
```

- [ ] **Step 2: Create tool**

```typescript
// src/tools/get-trending-changes.ts
import { getDb } from '../db/index.js';
import { getTrendingChanges as dbGetChanges } from '../db/queries-sqlite.js';

export async function getTrendingChanges(args: any) {
  const period = args.period || '7d';
  const metric = args.metric || 'trend_score';
  
  const validPeriods = ['24h', '7d', '30d'];
  const validMetrics = ['downloads', 'likes', 'trend_score'];
  
  if (!validPeriods.includes(period)) {
    throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
  }
  
  if (!validMetrics.includes(metric)) {
    throw new Error(`Invalid metric. Must be one of: ${validMetrics.join(', ')}`);
  }

  console.log(`[get_trending_changes] Analyzing ${metric} changes over ${period}`);

  const db = getDb();
  const changes = dbGetChanges(db, period, metric);
  
  const rising = changes
    .filter((c: any) => c.absolute_change > 0)
    .slice(0, 10);
  
  const falling = changes
    .filter((c: any) => c.absolute_change < 0)
    .sort((a: any, b: any) => a.absolute_change - b.absolute_change)
    .slice(0, 10);

  return {
    success: true,
    period,
    metric,
    rising: rising.map((c: any) => ({
      model_id: c.model_id,
      name: c.name,
      author: c.author,
      current_value: c.current_value,
      past_value: c.past_value,
      growth_rate: `${c.growth_rate > 0 ? '+' : ''}${c.growth_rate}%`,
      absolute_change: c.absolute_change
    })),
    falling: falling.map((c: any) => ({
      model_id: c.model_id,
      name: c.name,
      author: c.author,
      current_value: c.current_value,
      past_value: c.past_value,
      growth_rate: `${c.growth_rate}%`,
      absolute_change: c.absolute_change
    }))
  };
}
```

- [ ] **Step 3: Register tool**

```typescript
{
  name: 'get_trending_changes',
  description: 'Track rank and metric changes over time (rising/falling models)',
  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['24h', '7d', '30d'],
        description: 'Time period to analyze',
        default: '7d'
      },
      metric: {
        type: 'string',
        enum: ['downloads', 'likes', 'trend_score'],
        description: 'Metric to track changes for',
        default: 'trend_score'
      }
    }
  }
}
```

- [ ] **Step 4: Add handler**

```typescript
import { getTrendingChanges } from './tools/get-trending-changes.js';

else if (name === 'get_trending_changes') {
  result = await getTrendingChanges(args || {});
}
```

- [ ] **Step 5: Build and test**

```bash
npm run build
```

Note: Will need historical data to see meaningful results

- [ ] **Step 6: Commit**

```bash
git add src/tools/get-trending-changes.ts src/db/queries-sqlite.ts src/server.ts
git commit -m "feat: add get_trending_changes tool for trend analysis"
```

---

## Phase 5: Documentation Updates

### Task 9: Update MCP_TOOLS.md

**Files:**
- Modify: `MCP_TOOLS.md`

- [ ] **Step 1: Add tool entries**

Add 5 new tool entries to the table of contents and detailed sections in MCP_TOOLS.md:

1. `compare_models_batch` - Batch model comparison (2-5 models)
2. `recommend_for_task` - Task-based recommendations with scoring
3. `get_deployment_guide` - Deployment feasibility analysis
4. `get_model_benchmarks` - Arena ELO and benchmark scores
5. `get_trending_changes` - Track metric changes over time

- [ ] **Step 2: Commit documentation**

```bash
git add MCP_TOOLS.md
git commit -m "docs: add documentation for 5 new MCP tools"
```

---

### Task 10: Update README and CLAUDE.md

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update README.md**

Update tool count from 12 to 17 and add new features to the feature list.

- [ ] **Step 2: Update CLAUDE.md**

Move 5 tools from "Future Tools (V2+)" to "V2 Tools (✅ Implemented)".

- [ ] **Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update tool count to 17 and mark V2 tools as implemented"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-08-mcp-tool-extensions.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

