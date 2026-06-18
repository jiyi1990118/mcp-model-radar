# AI Model Intelligence MCP

[![Version](https://img.shields.io/badge/version-2.0.2-blue.svg)](https://github.com/jiyi1990118/mcp-model-radar)
[![npm](https://img.shields.io/npm/v/@npm_xiyuan/mcp-model-radar)](https://www.npmjs.com/package/@npm_xiyuan/mcp-model-radar)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-1.29.0-orange.svg)](https://modelcontextprotocol.io)

> 🌏 [中文文档](./README.zh-CN.md) | English

A Model Context Protocol (MCP) server that provides real-time intelligence about the global AI model ecosystem. Track trends, compare models, and discover the next breakthrough AI model.

## 🌟 Why AI Model Intelligence?

In the rapidly evolving AI landscape, staying updated on model trends is crucial but time-consuming. This MCP server solves that by:

- ✅ **Zero Configuration** — SQLite-based, runs out of the box. DB auto-creates at `~/.mcp-model-radar/modelradar.db`
- ✅ **Dual-Mode Transport** — Stdio (default, 1 process per client) or Streamable HTTP (shared process, `-p PORT`)
- ✅ **20 Powerful Tools** — Discovery, search, comparison, recommendation, deployment analysis, benchmarks, trend tracking, dark horse detection, community sentiment, reports
- ✅ **Multi-dimensional Analysis** — Compare models across downloads, likes, trend scores, cost, context length
- ✅ **Smart Mirror Selection** — Auto-selects fastest HuggingFace mirror with health checks
- ✅ **SQLite + PostgreSQL** — Zero-config SQLite for local dev, PostgreSQL for production
- ✅ **Open Source** — ISC licensed, customize and extend as needed

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [HTTP Mode (Shared Process)](#-http-mode-shared-process)
- [Supported MCP Clients](#-supported-mcp-clients)
- [Installation (from Source)](#-installation-from-source)
- [Configuration](#-configuration)
- [MCP Tools](#-mcp-tools)
- [Architecture](#-architecture)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)

## 🚀 Quick Start

### Step 1: Install via npm

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

### Step 2: Configure Your MCP Client

Edit your MCP client configuration. Here are the most common ones:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

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

**Claude Code / Cursor / Cline / Continue / Zed** — same `command` + `args` pattern, see [MCP Configuration Guide](./MCP_CONFIG_GUIDE.md) for details.

### Step 3: Restart Your Client

You'll have access to **16 AI model intelligence tools**! 🎉

Try asking: *"What are the hottest AI models right now?"* or *"Compare Qwen3-235B vs DeepSeek-V3"*

---

## 🌐 HTTP Mode (Shared Process)

By default, each MCP client spawns its own `npx` process. For multi-client environments, start a **single shared HTTP server** instead:

```bash
# Start shared MCP server
mcp-model-radar -p 3100
# or: npm run start:http
```

Then configure ALL clients to connect to the same URL:

```json
{
  "mcpServers": {
    "model-radar": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

**Benefits:** single process, shared database connection, zero startup latency, unified scheduler.

> **Note:** Stdio mode (`command: "npx"`) is still the default and works everywhere. HTTP mode requires clients that support the `url` field (Claude Desktop, Claude Code, Cline, Continue, Zed).

---

## 💡 Usage Examples

Ask your AI assistant:

| What to ask | Tool Used |
|-------------|-----------|
| *"What are the hottest AI models right now?"* | `get_hot_models` |
| *"Show me models released in the last 48 hours"* | `get_latest_models` |
| *"Find Apache-2.0 licensed coding models"* | `search_models` |
| *"Tell me about Qwen3-235B"* | `get_model_detail` |
| *"Compare Llama-3.3-70B vs DeepSeek-V3 vs Qwen3-235B"* | `compare_models_batch` |
| *"Best model for coding on a 24GB GPU?"* | `recommend_for_task` |
| *"Can I run Qwen2.5-72B on 32GB VRAM?"* | `get_deployment_guide` |
| *"Which models are rising in popularity?"* | `get_trending_changes` |
| *"Show me all models by Qwen"* | `get_models_by_author` |
| *"Models between 7B and 70B parameters"* | `get_models_by_size` |
| *"Show all MIT licensed models"* | `get_models_by_license` |
| *"Show all text-to-image models"* | `get_models_by_type` |
| *"Show quantized versions of Llama-3.3"* | `get_model_versions` |
| *"What models are based on Llama-3?"* | `get_model_ecosystem` |
| *"Show benchmark scores for Claude 3.5"* | `get_model_benchmarks` |

---

## 🔧 Supported MCP Clients

This MCP server works with any MCP-compatible application:

### AI Assistants
**Claude Desktop**, **Claude Code**, **Cherry Studio**, **Open WebUI**

### AI Coding Agents
**Aider**, **OpenHands**, **Void**, **Aide**, **Devin**

### IDEs & Editors
**Cursor**, **Windsurf**, **Zed**, **VS Code** (via Cline/Continue), **JetBrains** (via Continue)

### VS Code Extensions
**Cline**, **Continue**, **RooCode**

📖 Full configuration examples for each client: [MCP Configuration Guide](./MCP_CONFIG_GUIDE.md)

---

## 📦 Installation (from Source)

### Prerequisites

- **Node.js** 18.0.0+
- **SQLite** (built-in, recommended) or **PostgreSQL 14+** (optional)

### SQLite (Recommended)

Zero configuration, single-file database at `~/.mcp-model-radar/modelradar.db`.

```bash
git clone https://github.com/jiyi1990118/mcp-model-radar.git
cd mcp-model-radar
npm install
npm run build
npm run insert-test   # 5 popular models with real params
npm run test          # verify all 9 tests pass
```

### PostgreSQL (Production)

```bash
npm install
psql -U postgres -c "CREATE DATABASE modelradar;"
psql -U postgres -d modelradar -f src/db/schema.sql
cp .env.example .env
# Edit .env: DB_TYPE=postgresql, DATABASE_URL=...
npm run build
npm run seed
```

### Available Scripts

```bash
npm run build         # Compile TypeScript
npm start             # Start MCP server (stdio mode)
npm run start:http    # Start MCP server (HTTP mode, port 3100)
npm run dev           # Dev mode with hot reload (stdio)
npm run dev:http      # Dev mode with hot reload (HTTP)
npm run test          # Run all tool tests
npm run insert-test   # Insert 5 test models
npm run seed          # Seed with real API data
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Database
DB_TYPE=sqlite                            # sqlite or postgresql
# SQLITE_DB_PATH=~/.mcp-model-radar/modelradar.db   # default, auto-created
# DATABASE_URL=postgresql://user:pass@localhost:5432/modelradar

# Transport
# MCP_TRANSPORT=http                      # force HTTP mode (alternative to -p flag)
# MCP_PORT=3100                           # HTTP port (default: 3100)

# API Keys (optional)
OPENROUTER_API_KEY=

# Collectors
HF_COLLECTION_LIMIT=100
HF_PRIORITY_ORGS=unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama

# Scheduler (enable hourly data collection)
ENABLE_SCHEDULER=false

# Logging
LOG_LEVEL=info
```

### Database Switching

Change `DB_TYPE` in `.env` anytime — no code changes needed.

---

## 🛠️ MCP Tools

All 20 tools are accessible through any MCP client. See the tool list and parameters below.

### Discovery Tools

#### `get_hot_models`
Get trending models sorted by trend score.
- `limit` (optional, default 20) — Number of models to return

#### `get_latest_models`
Get recently released models.
- `hours` (optional, default 24) — Hours to look back

### Search & Detail Tools

#### `search_models`
Search models by keyword with advanced filters.
- `keyword` (required) — Search term
- `filters` (optional) — `{ type, license, author }`
- `sort_by` (optional) — `downloads | likes | trend_score | created_at`
- `limit` (optional, default 50)

#### `get_model_detail`
Get comprehensive model info including VRAM estimates.
- `model_id` (required) — Full model ID, e.g. `"Qwen/Qwen3-235B"`

### Comparison Tools

#### `compare_models`
Compare two models across downloads, likes, trend score, context length, and cost.
- `model_a` (required) — First model ID
- `model_b` (required) — Second model ID

#### `compare_models_batch`
Compare 2–5 models simultaneously across multiple dimensions.
- `model_ids` (required) — Array of 2–5 model IDs
- `dimensions` (optional) — `["performance", "cost", "context"]`

### Filter Tools

#### `get_models_by_type`
Filter by type/tag, e.g. `text-generation`, `text-to-image`.
- `type` (required)
- `limit` (optional, default 20)

#### `get_models_by_size`
Filter by parameter count range, e.g. `"7B"` to `"70B"`.
- `minParams` (optional) — e.g. `"7B"`
- `maxParams` (optional) — e.g. `"70B"`
- `limit` (optional, default 20)

#### `get_models_by_license`
Filter by license type, e.g. `Apache-2.0`, `MIT`.
- `license` (required)
- `limit` (optional, default 20)

#### `get_models_by_author`
Get all models from a specific organization.
- `author` (required)
- `limit` (optional, default 20)

### Advanced Tools

#### `get_model_versions`
Find quantized versions (GGUF, AWQ, GPTQ, MLX) of a model.
- `model_id` (required)

#### `get_model_ecosystem`
Explore base model and all derivative models (fine-tunes, variants).
- `model_id` (required)

#### `recommend_for_task`
Get AI model recommendations for a specific task with constraints.
- `task` (required) — `code-generation | translation | chat | summarization | reasoning`
- `constraints` (optional) — `{ max_vram_gb, max_cost_per_1m, min_context, license }`
- `top_n` (optional, default 3)

#### `get_deployment_guide`
Hardware-aware deployment feasibility analysis.
- `model_id` (required)
- `hardware` (optional) — `{ gpu, vram_gb, ram_gb, cpu_cores }`

#### `get_model_benchmarks`
Arena ELO ratings and benchmark scores.
- `model_id` (required)

#### `get_trending_changes`
Track rank and metric changes over time (rising/falling models).
- `period` (optional, default `"7d"`) — `24h | 7d | 30d`
- `metric` (optional, default `"trend_score"`) — `downloads | likes | trend_score`

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              MCP Server (Dual-Mode)               │
│                                                   │
│  StdioServerTransport (default, 1 process/client) │
│  StreamableHTTPServerTransport (-p PORT, shared)  │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│              Tools Layer (16 tools)               │
│  Discovery │ Search │ Comparison │ Filter │ Advanced │ V3 │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│         Database Abstraction Layer                │
│    Unified interface (SQLite + PostgreSQL)        │
└──────────┬─────────────────────┬──────────────────┘
           │                     │
    ┌──────▼──────┐      ┌──────▼──────┐
    │   SQLite    │      │ PostgreSQL  │
    │ (WAL mode)  │      │             │
    └─────────────┘      └─────────────┘
           │
┌──────────▼────────────────────────────────────────┐
│              Data Collectors                      │
│  HuggingFace (models, downloads)                  │
│  OpenRouter (pricing, context)                    │
│  LMSYS Arena (ELO ratings)                        │
└───────────────────────────────────────────────────┘
```

### Key Components

| Component | Location | Description |
|-----------|----------|-------------|
| MCP Server | `src/server.ts` | Dual-mode entry point, 16 tools |
| Tools | `src/tools/` | 20 MCP tool implementations |
| Database | `src/db/` | SQLite/PostgreSQL abstraction |
| Collectors | `src/collectors/` | HuggingFace, OpenRouter data collection |
| API Clients | `src/api/` | HuggingFace API, Arena leaderboard |
| Analysis | `src/analysis/` | Trend score calculation |
| Scheduler | `src/scheduler/` | Cron jobs with file-lock dedup |
| Utilities | `src/utils/` | Mirror pool, sync manager, recommendations |

### Trend Score Algorithm

```
Trend Score = 0.6 × Download Growth + 0.4 × Like Growth
Scale: 0–100, Growth Period: 7 days
```

### Data Sources

| Source | Data |
|--------|------|
| 🤗 **HuggingFace** | Downloads, likes, metadata, tags, licenses |
| 🔄 **OpenRouter** | Real-time pricing, context length, providers |
| 🏆 **LMSYS Arena** | ELO ratings, rankings |
| 🐙 **GitHub** | AI repo stars, forks, topics |
| 💬 **Reddit** | Community discussions, sentiment |
| 🐙 **GitHub** | AI repo stars, forks, topics |
| 💬 **Reddit** | Community discussions, sentiment (r/LocalLLaMA, r/MachineLearning, r/OpenAI) |

---

## 💻 Development

### Project Structure

```
mcp-model-radar/
├── src/
│   ├── server.ts                # MCP server (dual-mode entry)
│   ├── cli.ts                   # CLI wrapper (modelradar command)
│   ├── insert-test-data.ts      # Test data seeder
│   ├── test-tools.ts            # Tool test runner
│   ├── tools/                   # 20 MCP tool implementations
│   │   ├── get-hot-models.ts
│   │   ├── get-latest-models.ts
│   │   ├── search-models.ts
│   │   ├── get-model-detail.ts
│   │   ├── compare-models.ts
│   │   ├── compare-models-batch.ts
│   │   ├── get-models-by-type.ts
│   │   ├── get-models-by-size.ts
│   │   ├── get-models-by-license.ts
│   │   ├── get-models-by-author.ts
│   │   ├── get-model-versions.ts
│   │   ├── get-model-ecosystem.ts
│   │   ├── recommend-for-task.ts
│   │   ├── get-deployment-guide.ts
│   │   ├── get-model-benchmarks.ts
│   │   └── get-trending-changes.ts
│   ├── db/                      # Database abstraction
│   │   ├── index.ts             # Adapter (auto-selects SQLite/PG)
│   │   ├── connection-sqlite.ts # SQLite (better-sqlite3, WAL mode)
│   │   ├── connection.ts        # PostgreSQL (pg Pool)
│   │   ├── queries-sqlite.ts    # SQLite queries
│   │   ├── queries.ts           # PostgreSQL queries
│   │   ├── schema-sqlite.sql    # SQLite schema
│   │   └── schema.sql           # PostgreSQL schema
│   ├── collectors/              # Data collectors (with retry + timeout)
│   │   ├── huggingface.ts
│   │   ├── openrouter.ts
│   │   └── metrics-tracker.ts
│   ├── api/                     # External API clients
│   │   ├── huggingface-api.ts   # HF search/detail with retry
│   │   └── arena-api.ts         # LMSYS Arena CSV parser
│   ├── analysis/
│   │   └── trend-score.ts       # Trend calculation (SQLite + PG)
│   ├── scheduler/
│   │   └── collector-jobs.ts    # Cron jobs with PID file lock
│   └── utils/
│       ├── db-path.ts           # ~/.mcp-model-radar path helper
│       ├── db-check.ts          # DB availability check
│       ├── mirror-pool.ts       # Fastest mirror selection
│       ├── sync-manager.ts      # Background sync coordinator
│       └── recommendation-engine.ts
├── dist/                        # Compiled output
├── package.json
└── tsconfig.json
```

### Adding a New Tool

1. Create `src/tools/your-tool.ts`:

```typescript
export async function yourTool(args: any) {
  // Implementation
  return { success: true, data: [] };
}
```

2. Import and add to `toolHandlers` in `src/server.ts`:

```typescript
import { yourTool } from './tools/your-tool.js';

const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  // ... existing handlers
  your_tool: (a) => yourTool(a),
};
```

3. Add the tool definition to `ListToolsRequestSchema` with `inputSchema`.

4. Build and test: `npm run build && npm run test`

---

## 🐛 Troubleshooting

### Database

| Problem | Solution |
|---------|----------|
| `ENOENT: no such file, open '.../modelradar.db'` | `npm run build && npm run insert-test` |
| PostgreSQL connection refused | Check `pg_isready`, verify `DATABASE_URL` in `.env` |
| SQLITE_BUSY errors | DB is in WAL mode with 5s busy_timeout; reduce concurrent writes |

### MCP Configuration

| Problem | Solution |
|---------|----------|
| Tools not showing in client | Use **absolute** paths in config; check `dist/server.js` exists; restart client |
| HTTP mode: `ECONNREFUSED` | Ensure server is running: `mcp-model-radar -p 3100` |
| HTTP mode: `Bad Request: Server not initialized` | Client must send `initialize` request first (MCP protocol requirement) |
| No data returned | Run `npm run insert-test` to seed test data |

**Claude Desktop logs (macOS):** `~/Library/Logs/Claude/mcp*.log`

---

## 🗺️ Roadmap

### ✅ V1.0 (Completed)
- HuggingFace + OpenRouter data collection
- 9 core MCP tools (discovery, search, detail, compare, filter)
- SQLite + PostgreSQL support with abstraction layer
- Trend score calculation (0.6 × downloads + 0.4 × likes)

### ✅ V2.0 (Completed)
- 7 additional tools: batch compare, recommendations, deployment guide, benchmarks, trend changes, versions, ecosystem
- **Total: 16 tools**
- Streamable HTTP transport (shared process mode)
- SQLite WAL mode + scheduler file lock
- Mirror pool with health checks
- Collectors with retry + timeout
- Quote-aware Arena CSV parser

### ✅ V3.0 (Completed)
- GitHub trending stars tracking (`get_github_trending`)
- Dark horse detection algorithm (`get_darkhorse_models`)
- Community sentiment analysis (`get_community_heat`)
- Weekly/monthly ecosystem reports (`get_model_report`)
- **Total: 20 tools**
- Reddit JSON API integration (r/LocalLLaMA, r/MachineLearning, r/OpenAI)
- Lightweight sentiment analysis engine (keyword-based)
- Report generator with multi-section output

### 🚀 V4.0 (Future)
- AI analysis agent with automated insights
- WebSocket real-time updates
- Predictive modeling (which models will trend)
- Agent-specific recommendations
- Multi-language model support

---

## 📄 License

ISC License — See [LICENSE](LICENSE)

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/jiyi1990118/mcp-model-radar/discussions)
- 📧 **Email**: xiyuan@gmail.com

---

Made with ❤️ by the AI Model Intelligence community

⭐ Star this repo if you find it useful!
