# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Model Intelligence MCP** is an MCP (Model Context Protocol) server that provides real-time intelligence about the global AI model ecosystem. It aggregates data from multiple sources (HuggingFace, OpenRouter, LMSYS Arena, GitHub, Reddit) to help AI agents and developers discover, track, analyze, and compare models.

**npm Package**: `@npm_xiyuan/mcp-model-radar`  
**Version**: 2.0.2  
**GitHub**: https://github.com/jiyi1990118/mcp-model-radar

This is NOT just a model search tool—it's a comprehensive model intelligence platform that answers:
- Which models are trending?
- Which models are growing fastest?
- Which models are best for agents/local deployment/specific tasks?
- Which models might become the next breakthrough?

## Quick Start

### Installation

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

### Configuration (Claude Desktop)

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "model-radar": {
      "command": "npx",
      "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
    }
  }
}
```

Restart Claude Desktop and you'll have access to **17 powerful AI model intelligence tools**.

### HTTP Mode (Shared Process — Recommended for Multiple Clients)

For multi-client environments, start the server in HTTP mode:

```bash
# Start shared MCP server
npm run start:http
# or: MCP_TRANSPORT=http node dist/server.js
```

Then configure clients to connect via URL instead of spawning separate processes:

```json
{
  "mcpServers": {
    "model-radar": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

Benefits: single process shared across all clients, zero startup latency, unified scheduler and sync state.

## Architecture

```
┌──────────────────────────────────────────────┐
│              MCP Server (Dual-Mode)          │
│                                              │
│  --mode=stdio → StdioServerTransport         │
│       (default, 1 process per client)        │
│  --mode=http  → StreamableHTTPServerTransport│
│       (shared process, multi-client)         │
└──────────────────┬───────────────────────────┘
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

**Total: 20 Tools** organized in 5 categories (Core, Filter, Advanced, Analytics, V3)

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

### V3 Tools (✅ Implemented)
- `get_github_trending`: Trending AI repositories on GitHub sorted by stars
- `get_darkhorse_models`: Unexpectedly surging "dark horse" models with breakout potential
- `get_community_heat`: Community discussion sentiment across Reddit (r/LocalLLaMA, r/MachineLearning, r/OpenAI)
- `get_model_report`: Weekly/monthly AI model ecosystem trend reports with 4 sections

### Future Tools (V4+)
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
- 5 core MCP tools
- 4 filter tools
- Trend score calculation
- SQLite support (recommended)
- PostgreSQL support (optional)
- Database abstraction layer

**V1.1 (✅ Completed)**
- 2 advanced tools (versions & ecosystem)

**V2 (✅ Completed)**
- 5 analytics tools (batch compare, recommendations, deployment, benchmarks, trending changes)
- Total: 17 tools implemented

**V3 (Completed)**
- GitHub trending stars tracking + Reddit community sentiment
- Dark horse detection algorithm (burst signal × underdog factor × cross-source)
- Community sentiment analysis engine (keyword-based, no NLP deps)
- Weekly/monthly report generator with 4-section output
- **Total: 20 MCP tools**

**V4 (Future)**
- AI analysis agent
- Daily/weekly reports
- Automated recommendations
- Model predictions

## Key Organizations to Track

HuggingFace organizations:
- unsloth, Qwen, deepseek-ai, microsoft, google, mistralai, meta-llama

## Technical Notes

### Database
- **SQLite** (recommended for local development): Zero-config, auto-creates `~/.mcp-model-radar/modelradar.db`
- **PostgreSQL** (optional): Production-grade option for scaling
- Database abstraction layer in `src/db/index.ts` allows easy switching via `DB_TYPE` env var
- Both databases share the same query interface
- **WAL mode**: SQLite uses Write-Ahead Logging for concurrent read access (required for HTTP mode)
- **Scheduler lock**: In multi-process scenarios, only one process runs the data collection scheduler

### Transport Modes
- **Stdio** (default): Traditional MCP transport — one process per client, auto-launched by `npx`
- **Streamable HTTP**: Shared process mode — start via `npm run start:http`, clients connect via `url` field
- Set via `MCP_TRANSPORT` env var or `--http` CLI flag
- Default port: `3100` (override with `MCP_PORT`)

### Quick Start Commands
```bash
# Build project
npm run build

# Start in stdio mode (default, 1 process per client)
npm start

# Start in HTTP mode (shared process, multi-client)
npm run start:http
# or: MCP_TRANSPORT=http node dist/server.js

# Development (stdio)
npm run dev

# Development (HTTP)
npm run dev:http

# Insert test data (SQLite default)
npm run insert-test

# Run all tool tests
npm run test
```

### Other Notes
- Design for hourly data collection from primary sources
- Calculate trend scores based on growth rates, not absolute values
- Support multiple quantization formats (GGUF, AWQ, GPTQ, MLX)

### Supported MCP Clients
**AI Assistants:** Claude Desktop, Claude Code, Cherry Studio, Open WebUI
**AI Coding Agents:** Aider, OpenHands, Void, Aide, Devin
**IDEs & Editors:** Cursor, Windsurf, Zed, VS Code (via Cline/Continue), JetBrains (via Continue)
**VS Code Extensions:** Cline, Continue, RooCode

## Documentation

Comprehensive design documentation is in `Docs/design.md` (Chinese).
