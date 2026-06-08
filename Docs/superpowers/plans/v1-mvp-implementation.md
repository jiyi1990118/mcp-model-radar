# AI Model Intelligence MCP - V1 MVP Implementation Plan

## Project Overview

Build an MCP (Model Context Protocol) server that provides real-time AI model intelligence by aggregating data from HuggingFace and OpenRouter, with ranking/trend analysis capabilities.

**Target Timeline**: 1-2 weeks  
**Language**: TypeScript (Node.js)  
**Database**: PostgreSQL  
**Protocol**: MCP (Model Context Protocol)

---

## Success Criteria

- [ ] MCP server successfully connects to Claude Desktop/Cursor
- [ ] Data collection from HuggingFace (downloads, likes, metadata)
- [ ] Data collection from OpenRouter (pricing, availability)
- [ ] 5 core MCP tools functional and tested
- [ ] Trend score calculation working with real data
- [ ] PostgreSQL schema deployed and data persisted
- [ ] Hourly data collection scheduler running
- [ ] Basic error handling and logging

---

## Technology Stack

### Core
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Database**: PostgreSQL 14+
- **ORM**: Prisma or pg (node-postgres)

### Data Collection
- **HTTP Client**: axios or fetch
- **Rate Limiting**: bottleneck
- **Scheduling**: node-cron or node-schedule

### Development
- **Package Manager**: npm or pnpm
- **Build Tool**: tsc (TypeScript compiler)
- **Linting**: ESLint
- **Testing**: Jest (optional for MVP)

---

## Architecture Decisions

### 1. Project Structure
```
modelRadar/
├── src/
│   ├── server.ts              # MCP server entry point
│   ├── tools/                 # MCP tool implementations
│   │   ├── get-hot-models.ts
│   │   ├── get-latest-models.ts
│   │   ├── search-models.ts
│   │   ├── get-model-detail.ts
│   │   └── compare-models.ts
│   ├── collectors/            # Data collection modules
│   │   ├── huggingface.ts
│   │   └── openrouter.ts
│   ├── analysis/              # Analysis and ranking logic
│   │   └── trend-score.ts
│   ├── db/                    # Database layer
│   │   ├── schema.sql
│   │   └── queries.ts
│   └── scheduler/             # Cron jobs
│       └── collector-jobs.ts
├── package.json
├── tsconfig.json
└── .env.example
```

### 2. Database Schema Design
Core tables:
- `models`: Base model information
- `model_metrics`: Time-series metrics (downloads, likes)
- `model_pricing`: OpenRouter pricing data
- `model_snapshots`: Daily/hourly snapshots for trend calculation

### 3. Data Collection Strategy
- **HuggingFace**: Use HF Hub API (no auth required for public data)
- **OpenRouter**: Use OpenRouter API (may need API key)
- **Rate Limiting**: Respect API limits, implement exponential backoff
- **Incremental Updates**: Track last_updated timestamps

### 4. Trend Score Calculation
```
Trend Score = 
  40% × download_growth_7d +
  20% × like_growth_7d +
  20% × community_growth_7d (V2) +
  20% × arena_growth_7d (V2)

For V1: Use 60% downloads + 40% likes
```

---

## Phase 1: Project Setup & Foundation (Day 1)

### 1.1 Initialize Project
- [ ] Create Node.js project with TypeScript
- [ ] Install core dependencies:
  - `@modelcontextprotocol/sdk`
  - `typescript`, `@types/node`
  - `dotenv`
- [ ] Setup `tsconfig.json` with strict mode
- [ ] Create `.env.example` with required env vars
- [ ] Setup `.gitignore` (node_modules, .env, dist/)

### 1.2 PostgreSQL Setup
- [ ] Install PostgreSQL locally or use Docker
- [ ] Install `pg` and `@types/pg`
- [ ] Create database: `modelradar`
- [ ] Design initial schema (see schema below)
- [ ] Create migration script or SQL file

**Schema V1**:
```sql
-- models table
CREATE TABLE models (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  base_model VARCHAR(255),
  params VARCHAR(50),
  license VARCHAR(100),
  context_length INTEGER,
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP DEFAULT NOW()
);

-- model_metrics table (time-series)
CREATE TABLE model_metrics (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) REFERENCES models(model_id),
  downloads BIGINT DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trend_score DECIMAL(5,2) DEFAULT 0,
  snapshot_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(model_id, snapshot_date)
);

-- model_pricing table
CREATE TABLE model_pricing (
  id SERIAL PRIMARY KEY,
  model_id VARCHAR(255) REFERENCES models(model_id),
  provider VARCHAR(100),
  input_cost DECIMAL(10,6),
  output_cost DECIMAL(10,6),
  context_length INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- indexes
CREATE INDEX idx_models_author ON models(author);
CREATE INDEX idx_models_updated ON models(updated_at DESC);
CREATE INDEX idx_metrics_snapshot ON model_metrics(snapshot_date DESC);
CREATE INDEX idx_metrics_trend ON model_metrics(trend_score DESC);
```

### 1.3 MCP Server Skeleton
- [ ] Create `src/server.ts` with basic MCP server setup
- [ ] Implement server lifecycle (start, stop)
- [ ] Add stdio transport for Claude Desktop
- [ ] Test connection with Claude Desktop

---

## Phase 2: Data Collectors (Day 2-3)

### 2.1 HuggingFace Collector
- [ ] Create `src/collectors/huggingface.ts`
- [ ] Implement API client for HF Hub API
- [ ] Fetch trending models (focus on key orgs: unsloth, Qwen, deepseek-ai, etc.)
- [ ] Parse model metadata (downloads, likes, tags, license)
- [ ] Store in PostgreSQL with upsert logic
- [ ] Add error handling and retry logic

**Key API Endpoints**:
```
GET https://huggingface.co/api/models
GET https://huggingface.co/api/models/{model_id}
```

**Priority Organizations**:
- unsloth, Qwen, deepseek-ai, microsoft, google, mistralai, meta-llama

### 2.2 OpenRouter Collector
- [ ] Create `src/collectors/openrouter.ts`
- [ ] Get API key (if required) and add to .env
- [ ] Fetch model list with pricing
- [ ] Parse pricing data (input_cost, output_cost)
- [ ] Match models to HF models by name
- [ ] Store pricing in `model_pricing` table

**API Endpoint**:
```
GET https://openrouter.ai/api/v1/models
```

### 2.3 Database Layer
- [ ] Create `src/db/connection.ts` for PostgreSQL pool
- [ ] Create `src/db/queries.ts` with typed queries:
  - `upsertModel()`
  - `insertMetrics()`
  - `upsertPricing()`
  - `getModels()`
  - `getModelById()`

---

## Phase 3: MCP Tools Implementation (Day 4-5)

### 3.1 Tool: get_hot_models
- [ ] Create `src/tools/get-hot-models.ts`
- [ ] Accept parameter: `limit` (default: 20)
- [ ] Query models ordered by trend_score DESC
- [ ] Return JSON array with model name and trend_score
- [ ] Register tool in server.ts

**Expected Output**:
```json
[
  {"model": "Qwen/Qwen3-235B", "trend_score": 98},
  {"model": "deepseek-ai/DeepSeek-V3", "trend_score": 95}
]
```

### 3.2 Tool: get_latest_models
- [ ] Create `src/tools/get-latest-models.ts`
- [ ] Accept parameter: `hours` (default: 24)
- [ ] Query models where created_at > NOW() - hours
- [ ] Order by created_at DESC
- [ ] Return model list with metadata

### 3.3 Tool: search_models
- [ ] Create `src/tools/search-models.ts`
- [ ] Accept parameter: `keyword`
- [ ] Search in model name, author, tags (use ILIKE or full-text search)
- [ ] Return matching models with relevance score
- [ ] Limit to 50 results

### 3.4 Tool: get_model_detail
- [ ] Create `src/tools/get-model-detail.ts`
- [ ] Accept parameter: `model_id`
- [ ] Query model with all metadata
- [ ] Join with metrics and pricing
- [ ] Return comprehensive model info

**Expected Output**:
```json
{
  "model_id": "Qwen/Qwen3-235B",
  "author": "Qwen",
  "params": "235B",
  "license": "Apache-2.0",
  "downloads": 5000000,
  "likes": 12000,
  "trend_score": 98,
  "pricing": {
    "input_cost": 0.0001,
    "output_cost": 0.0003
  }
}
```

### 3.5 Tool: compare_models
- [ ] Create `src/tools/compare-models.ts`
- [ ] Accept parameters: `model_a`, `model_b`
- [ ] Fetch both models with metrics
- [ ] Compare: downloads, likes, pricing, context_length
- [ ] Return comparison object

**Expected Output**:
```json
{
  "downloads": "A",
  "likes": "B",
  "cost": "A",
  "context": "B"
}
```

---

## Phase 4: Trend Score Calculation (Day 6)

### 4.1 Analysis Engine
- [ ] Create `src/analysis/trend-score.ts`
- [ ] Implement growth rate calculation:
  - Compare current metrics with 7-day-ago snapshot
  - Calculate percentage growth for downloads and likes
- [ ] Implement trend score formula:
  - `trend_score = (0.6 × download_growth) + (0.4 × like_growth)`
  - Normalize to 0-100 scale
- [ ] Store calculated scores in `model_metrics` table

### 4.2 Batch Calculation
- [ ] Create function to calculate scores for all models
- [ ] Run on all models with sufficient history (>7 days)
- [ ] Update trend_score column
- [ ] Add logging for tracking calculation results

### 4.3 Growth Rate Logic
```typescript
// Pseudocode
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

function calculateTrendScore(model: Model): number {
  const downloadGrowth = calculateGrowth(model.downloads, model.downloads_7d_ago);
  const likeGrowth = calculateGrowth(model.likes, model.likes_7d_ago);
  
  const score = (0.6 * downloadGrowth) + (0.4 * likeGrowth);
  return Math.min(Math.max(score, 0), 100); // clamp to 0-100
}
```

---

## Phase 5: Scheduler & Automation (Day 7)

### 5.1 Collector Jobs
- [ ] Install `node-cron`
- [ ] Create `src/scheduler/collector-jobs.ts`
- [ ] Schedule hourly HuggingFace collection
- [ ] Schedule hourly OpenRouter collection
- [ ] Schedule daily trend score calculation
- [ ] Add job logging and error tracking

**Cron Schedule**:
```typescript
// Every hour at :00
cron.schedule('0 * * * *', async () => {
  await collectHuggingFace();
  await collectOpenRouter();
});

// Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await calculateTrendScores();
});
```

### 5.2 Initial Data Seeding
- [ ] Create `src/scripts/seed-initial-data.ts`
- [ ] Fetch top 100 models from priority organizations
- [ ] Store in database
- [ ] Create baseline metrics snapshot
- [ ] Run this script before first MCP server start

---

## Phase 6: Testing & Integration (Day 8)

### 6.1 Manual Testing
- [ ] Test MCP server connection with Claude Desktop
- [ ] Test each tool with sample queries:
  - `get_hot_models` with limit 10
  - `get_latest_models` for last 24 hours
  - `search_models` with keyword "qwen"
  - `get_model_detail` for specific model
  - `compare_models` between two popular models
- [ ] Verify database queries return correct data
- [ ] Check trend score calculations are reasonable

### 6.2 Error Handling
- [ ] Add try-catch blocks in all collectors
- [ ] Add validation for tool parameters
- [ ] Add database connection error handling
- [ ] Add API rate limit handling
- [ ] Log errors to file or console

### 6.3 MCP Configuration
- [ ] Create MCP server config for Claude Desktop
- [ ] Test in `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/path/to/modelRadar/dist/server.js"]
    }
  }
}
```

---

## Implementation Order & Dependencies

### Critical Path
1. **Database Setup** → Must be completed first
2. **MCP Server Skeleton** → Needed for testing tools
3. **Data Collectors** → Required for populating database
4. **Initial Data Seeding** → Must run before trend calculation
5. **MCP Tools** → Can be developed in parallel after DB is ready
6. **Trend Score Engine** → Requires 7+ days of historical data
7. **Scheduler** → Final integration piece

### Parallel Work Opportunities
- While collectors are being built, MCP tools can use mock data
- Database queries can be developed alongside collectors
- Tool implementations are independent and can be parallelized

---

## Key Technical Decisions

### 1. Why PostgreSQL over MongoDB?
- Structured data with clear relationships
- Need for complex queries and joins
- Time-series metrics require efficient indexing
- Strong ACID guarantees for data consistency

### 2. Why TypeScript over Python?
- Native MCP SDK support
- Better integration with Node.js ecosystem
- Easier deployment for MCP servers
- Strong typing for API responses

### 3. Data Collection Frequency
- **Hourly** for HF/OpenRouter: Balance freshness vs API limits
- **Daily** for trend calculation: Need 7-day windows, daily is sufficient
- Can be adjusted based on API rate limits and costs

### 4. Trend Score V1 Simplification
- V1 uses only HF data (60% downloads, 40% likes)
- V2 will add Arena (requires separate API integration)
- V2 will add community data (Reddit/GitHub)
- This allows faster MVP delivery

---

## Risks & Mitigation

### Risk 1: API Rate Limits
**Impact**: High  
**Mitigation**: 
- Implement exponential backoff
- Cache responses for 1 hour
- Prioritize top organizations/models
- Add request throttling with `bottleneck`

### Risk 2: Insufficient Historical Data
**Impact**: Medium  
**Mitigation**:
- Trend scores require 7 days of data
- Run initial seeding, then wait 7 days for accurate trends
- Use absolute metrics (downloads, likes) until then
- Document this limitation clearly

### Risk 3: Model Name Matching (HF ↔ OpenRouter)
**Impact**: Medium  
**Mitigation**:
- OpenRouter may use different naming conventions
- Implement fuzzy matching algorithm
- Manual mapping table for common mismatches
- Log unmatched models for review

### Risk 4: Database Performance
**Impact**: Low  
**Mitigation**:
- Proper indexing on frequently queried columns
- Use connection pooling
- Implement query result caching
- Monitor query performance

---

## API Details & Endpoints

### HuggingFace Hub API
**Base URL**: `https://huggingface.co/api`

**Key Endpoints**:
```
GET /models?sort=trending&limit=100
GET /models/{model_id}
GET /models?author={author}&sort=downloads
```

**Rate Limits**: No auth required for public data, ~100 req/min recommended

**Response Format**:
```json
{
  "id": "Qwen/Qwen3-235B",
  "author": "Qwen",
  "downloads": 5000000,
  "likes": 12000,
  "tags": ["text-generation", "transformers"],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### OpenRouter API
**Base URL**: `https://openrouter.ai/api/v1`

**Key Endpoints**:
```
GET /models
```

**Authentication**: May require API key in header: `Authorization: Bearer $OPENROUTER_API_KEY`

**Response Format**:
```json
{
  "data": [
    {
      "id": "qwen/qwen-3-235b",
      "pricing": {
        "prompt": "0.0001",
        "completion": "0.0003"
      },
      "context_length": 32768
    }
  ]
}
```

---

## Environment Variables

Create `.env` file with:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/modelradar

# API Keys (optional for V1)
OPENROUTER_API_KEY=your_key_here

# Collector Settings
HF_COLLECTION_LIMIT=100
HF_PRIORITY_ORGS=unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama

# Scheduler
ENABLE_SCHEDULER=true
COLLECTION_INTERVAL_HOURS=1

# Logging
LOG_LEVEL=info
```

---

## Post-MVP Considerations (V2 Planning)

### What's NOT in V1
- LMSYS Arena integration (ELO ratings)
- GitHub trending/stars tracking
- Reddit community sentiment
- Ecosystem analysis (derivative models)
- Recommendation engine
- Model news aggregation
- Advanced ranking categories (coding, reasoning, vision)

### V2 Priorities
1. Add Arena API for ELO rankings
2. GitHub API for star/release tracking
3. Community heat score from Reddit
4. Enhanced trend algorithm with all 4 factors
5. Recommendation tools (recommend_model, recommend_local_model)

---

## V1 MVP Verification Checklist

Before considering V1 complete, verify:

### Data Collection
- [ ] HuggingFace collector runs without errors
- [ ] At least 100 models collected from priority orgs
- [ ] OpenRouter pricing data collected for 50+ models
- [ ] Data persisted correctly in PostgreSQL
- [ ] Hourly scheduler executing collectors
- [ ] Metrics snapshots created for trend calculation

### MCP Tools
- [ ] All 5 tools registered and discoverable
- [ ] `get_hot_models` returns sorted results
- [ ] `get_latest_models` filters by time correctly
- [ ] `search_models` finds relevant models
- [ ] `get_model_detail` returns complete info
- [ ] `compare_models` provides accurate comparison

### Integration
- [ ] MCP server connects to Claude Desktop
- [ ] Tools callable from Claude Desktop chat
- [ ] Results display correctly in chat interface
- [ ] Error messages are user-friendly

### Performance
- [ ] Tool responses return within 2 seconds
- [ ] Database queries optimized with indexes
- [ ] No memory leaks in long-running scheduler

---

## Summary

This V1 MVP implementation plan delivers a functional AI Model Intelligence MCP server in 1-2 weeks with:

**Core Capabilities**:
- Real-time model discovery from HuggingFace (100+ models from key orgs)
- Pricing intelligence from OpenRouter
- Trend scoring based on download/like growth
- 5 essential MCP tools for agents
- Automated hourly data collection

**Technical Foundation**:
- TypeScript + Node.js for reliability
- PostgreSQL for structured data and time-series metrics
- MCP SDK for Claude Desktop integration
- Scheduled collectors for continuous updates

**Next Steps After V1**:
1. Run initial data seeding
2. Wait 7 days to accumulate trend data
3. Launch V1 to users
4. Gather feedback
5. Plan V2 with Arena, GitHub, Reddit integration

**Success Metric**: AI agents can successfully discover, compare, and track AI models using natural language queries through Claude Desktop.

---

## Quick Start Commands

```bash
# Setup
npm install
cp .env.example .env
# Edit .env with database credentials

# Database
psql -U postgres -c "CREATE DATABASE modelradar;"
psql -U postgres -d modelradar -f src/db/schema.sql

# Initial data seeding
npm run seed

# Build
npm run build

# Start MCP server
npm start

# Configure Claude Desktop
# Add to ~/.claude/claude_desktop_config.json
```

---

**Plan Status**: Ready for implementation  
**Created**: 2026-06-05  
**Version**: V1 MVP
