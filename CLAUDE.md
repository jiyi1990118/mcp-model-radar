# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Model Intelligence MCP** is an MCP (Model Context Protocol) server that provides real-time intelligence about the global AI model ecosystem. It aggregates data from multiple sources (HuggingFace, OpenRouter, LMSYS Arena, GitHub, Reddit) to help AI agents and developers discover, track, analyze, and compare models.

This is NOT just a model search tool—it's a comprehensive model intelligence platform that answers:
- Which models are trending?
- Which models are growing fastest?
- Which models are best for agents/local deployment/specific tasks?
- Which models might become the next breakthrough?

## Architecture

```
MCP Server
    ↓
Analysis Layer
    ↓
Ranking Engine
    ↓
Database (SQLite/PostgreSQL)
    ↓
Collector Layer
    ↓
Data Sources (HuggingFace, OpenRouter, Arena, GitHub, Reddit)
```

**Key Components:**
- **MCP Server**: Exposes tools to AI agents via Model Context Protocol
- **Analysis Layer**: Processes and analyzes model data
- **Ranking Engine**: Calculates trend scores, ecosystem scores, agent scores
- **Collector Layer**: Fetches data from multiple sources on scheduled intervals
- **Database**: Stores model metadata, metrics, deployment info, pricing
  - **SQLite** (recommended): Zero-config, single-file database for local development
  - **PostgreSQL**: Production-grade option for scalability

## Data Sources

### Primary Sources
- **HuggingFace**: Model discovery, downloads, likes, tags, licenses
- **OpenRouter**: Pricing, context length, providers, availability
- **LMSYS Arena**: ELO ratings, rankings, rank changes
- **GitHub**: Releases, trending repos, stars, issues
- **Reddit**: Community sentiment (r/LocalLlama, r/MachineLearning, r/OpenAI)

### Collection Schedule
- Hourly: HuggingFace, OpenRouter, Arena
- Daily: GitHub, Reddit, news sources
- Weekly: Ecosystem analysis, trend analysis, ranking recalculation

## Core Data Models

### Model
```json
{
  "id": "",
  "name": "",
  "author": "",
  "base_model": "",
  "params": "",
  "license": "",
  "context_length": 0,
  "created_at": "",
  "updated_at": ""
}
```

### Model Metrics
```json
{
  "downloads": 0,
  "likes": 0,
  "arena_rank": 0,
  "arena_score": 0,
  "trend_score": 0
}
```

### Deployment Info
```json
{
  "fp16_vram": "",
  "int8_vram": "",
  "int4_vram": "",
  "gguf": true,
  "awq": true,
  "gptq": true,
  "mlx": true
}
```

### Pricing
```json
{
  "input_cost": 0,
  "output_cost": 0,
  "provider": ""
}
```

## MCP Tools

### V1 Core Tools (✅ Implemented)
- `get_hot_models`: Get trending models with trend scores
- `get_latest_models`: Get recently released models
- `search_models`: Search models by keyword with advanced filters (type, license, author) and sorting
- `get_model_detail`: Get detailed model information with VRAM estimates and quantization versions
- `compare_models`: Compare two models across dimensions

### V1 Filter Tools (✅ Implemented)
- `get_models_by_type`: Filter models by type/tags (e.g., text-generation, text-to-image)
- `get_models_by_size`: Filter models by parameter count range
- `get_models_by_license`: Filter models by license type (e.g., Apache-2.0, MIT)
- `get_models_by_author`: Get all models from a specific author/organization

### V1.1 Advanced Tools (✅ Implemented)
- `get_model_versions`: Query quantized versions (GGUF, AWQ, GPTQ, MLX)
- `get_model_ecosystem`: Base model and derivatives info

### V2 Tools (✅ Implemented)
- `compare_models_batch`: Compare 2-5 models simultaneously across multiple dimensions
- `recommend_for_task`: Task-based recommendations with scoring engine and constraints
- `get_deployment_guide`: Deployment feasibility analysis based on hardware constraints
- `get_model_benchmarks`: Arena ELO ratings and benchmark scores
- `get_trending_changes`: Track rank and metric changes over time (rising/falling models)

### Future Tools (V3+)
- `get_darkhorse_models`: Unexpectedly surging models
- `get_community_heat`: Community discussion metrics
- `get_model_news`: Related news and announcements
- `recommend_agent_model`: Agent-optimized model recommendations
- `get_model_ranking`: Rankings by category (coding, reasoning, vision, etc.)

## Ranking Algorithms

### Trend Score (0-100)
```
40% Download Growth
+ 20% Like Growth
+ 20% Community Growth
+ 20% Arena Rank Growth
```

### Ecosystem Score
```
Derivative model count
+ Community activity
+ GitHub activity
```

### Agent Score (0-100)
Evaluates: Tool calling, function calling, structured output, long context, reliability

## Development Priority

**V1 (✅ Completed)**
- HuggingFace data collection
- OpenRouter data collection
- Basic MCP tools (5 core tools)
- Trend score calculation
- SQLite support (recommended)
- PostgreSQL support (optional)
- Database abstraction layer

**V2**
- Add Arena, GitHub, Reddit sources
- Community heat tracking
- Darkhorse detection
- Ecosystem analysis

**V3**
- AI analysis agent
- Daily/weekly reports
- Automated recommendations
- Model predictions

## Key Organizations to Track

HuggingFace organizations:
- unsloth, Qwen, deepseek-ai, microsoft, google, mistralai, meta-llama

## Technical Notes

### Database
- **SQLite** (recommended for local development): Zero-config, auto-creates `./modelradar.db`
- **PostgreSQL** (optional): Production-grade option for scaling
- Database abstraction layer in `src/db/index.ts` allows easy switching via `DB_TYPE` env var
- Both databases share the same query interface

### Quick Start Commands
```bash
# Build project
npm run build

# Insert test data (SQLite default)
npm run insert-test

# Run all tool tests
npm run test

# Start MCP server
npm start
```

### Other Notes
- Design for hourly data collection from primary sources
- Calculate trend scores based on growth rates, not absolute values
- Support multiple quantization formats (GGUF, AWQ, GPTQ, MLX)
- Target MCP clients: Claude Desktop, Cursor, Cherry Studio, Open WebUI, Cline, RooCode

## Documentation

Comprehensive design documentation is in `Docs/design.md` (Chinese).
