# AI Model Intelligence MCP

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/jiyi1990118/mcp-model-radar)
[![npm](https://img.shields.io/npm/v/@npm_xiyuan/mcp-model-radar)](https://www.npmjs.com/package/@npm_xiyuan/mcp-model-radar)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-1.29.0-orange.svg)](https://modelcontextprotocol.io)

> 🌏 [中文文档](./README.zh-CN.md) | English

A Model Context Protocol (MCP) server that provides real-time intelligence about the global AI model ecosystem. Track trends, compare models, and discover the next breakthrough AI model.

## 🌟 Why AI Model Intelligence?

In the rapidly evolving AI landscape, staying updated on model trends is crucial but time-consuming. This MCP server solves that by:

- ✅ **Zero Configuration** - SQLite-based, runs out of the box
- ✅ **Real-time Intelligence** - Track downloads, likes, and trend scores
- ✅ **17 Powerful Tools** - Core tools + Advanced features (search filters, quantization versions, ecosystem analysis, batch comparison, task recommendations, deployment guides, benchmarks, trend tracking)
- ✅ **Multi-dimensional Analysis** - Compare models across metrics
- ✅ **Smart Mirror Selection** - Auto-selects fastest HuggingFace mirror
- ✅ **Open Source** - Customize and extend as needed

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [MCP Tools](#mcp-tools)
- [Usage Examples](#usage-examples)
- [Architecture](#architecture)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## ✨ Features

### 17 Powerful MCP Tools

| Category | Tool | Description | Use Case |
|----------|------|-------------|----------|
| 🔥 **Discovery** | `get_hot_models` | Track trending models by growth rate | "What are the hottest models this week?" |
| 🆕 **Discovery** | `get_latest_models` | Discover recently released models | "Show me newly released models" |
| 🔍 **Search** | `search_models` | Advanced search with filters (type, license, author, sorting) | "Find Apache-2.0 licensed coding models" |
| 📊 **Details** | `get_model_detail` | Comprehensive model info with VRAM estimates | "Tell me about Qwen2.5-Coder-32B" |
| ⚖️ **Comparison** | `compare_models` | Compare two models across dimensions | "Compare Llama-3.3-70B vs DeepSeek-V3" |
| 🔄 **Comparison** | `compare_models_batch` | Compare 2-5 models simultaneously | "Compare top 3 coding models" |
| 🎯 **Recommendation** | `recommend_for_task` | Task-based recommendations with constraints | "Best model for coding on 24GB GPU" |
| 🚀 **Deployment** | `get_deployment_guide` | Hardware-aware feasibility analysis | "Can I run Qwen2.5-72B on 32GB VRAM?" |
| 📊 **Benchmarks** | `get_model_benchmarks` | Arena ELO ratings and benchmark scores | "Show benchmark scores for Claude-3.5" |
| 📈 **Analytics** | `get_trending_changes` | Track rank and metric changes over time | "Which models are rising in popularity?" |
| 📦 **Quantization** | `get_model_versions` | Find GGUF/AWQ/GPTQ/MLX variants | "Show quantized versions of Llama-3.3" |
| 🌳 **Ecosystem** | `get_model_ecosystem` | Explore base models and derivatives | "What models are based on Llama-3?" |
| 🏷️ **Filter** | `get_models_by_type` | Filter models by type/tags | "Show all text-to-image models" |
| 📏 **Filter** | `get_models_by_size` | Filter by parameter count range | "Models between 7B and 13B parameters" |
| 📜 **Filter** | `get_models_by_license` | Filter by license type | "Show all MIT licensed models" |
| 👤 **Filter** | `get_models_by_author` | Get models from specific author/org | "All models by Qwen team" |

### Data Sources

| Source | Data Provided |
|--------|---------------|
| 🤗 **HuggingFace** | Downloads, likes, metadata, tags, licenses, model cards |
| 🔄 **OpenRouter** | Real-time pricing, context length, provider availability |
| 🏆 **LMSYS Arena** | ELO ratings, rankings, benchmark scores *(Coming Soon)* |

## 🚀 Quick Start

### Step 1: Install via npm (Recommended)

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

### Step 2: Configure Claude Desktop

Edit your Claude Desktop configuration file:

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

### Step 3: Restart Claude Desktop

After restarting, you'll have access to **17 powerful AI model intelligence tools**! 🎉

---

## 💡 Usage Examples

### 🔥 Find Hot Trending Models

Ask Claude:
```
What are the trending AI models right now?
```

Claude will use the `get_hot_models` tool to show you models with the highest growth rates.

### 🔍 Search for Specific Models

Ask Claude:
```
Find me coding models with Apache 2.0 license
```

Claude will use `search_models` with filters to find matching models.

### ⚖️ Compare Multiple Models

Ask Claude:
```
Compare Qwen2.5-Coder-32B, DeepSeek-V3, and Llama-3.3-70B
```

Claude will use `compare_models_batch` to show a detailed comparison across metrics.

### 🎯 Get Task Recommendations

Ask Claude:
```
Recommend a coding model that can run on my 24GB VRAM GPU
```

Claude will use `recommend_for_task` to suggest suitable models based on your constraints.

### 🚀 Check Deployment Feasibility

Ask Claude:
```
Can I run Qwen2.5-72B on my system with 32GB VRAM?
```

Claude will use `get_deployment_guide` to analyze hardware requirements and suggest quantization options.

---

## 🔧 Supported MCP Clients

This MCP server works with any application that supports the Model Context Protocol. Here's a comprehensive list:

### 🤖 AI Assistants

| Client | Platform | Configuration |
|--------|----------|---------------|
| **Claude Desktop** | macOS, Windows | Add to `claude_desktop_config.json` |
| **Claude Code** | CLI, Desktop, Web, IDE Extensions | Built-in MCP support |
| **Cherry Studio** | Cross-platform | Built-in MCP support |
| **Open WebUI** | Web-based | MCP integration via settings |

### 🛠️ AI Coding Agents

| Agent | Platform | Description |
|-------|----------|-------------|
| **Aider** | Terminal/CLI | AI pair programming in terminal, supports MCP |
| **OpenHands** | Web/Self-hosted | Open-source AI software engineer (formerly OpenDevin) |
| **Void** | Desktop IDE | AI-first code editor with MCP support |
| **Aide** | VS Code | AI development assistant with MCP integration |
| **Devin** | Web-based | AI software engineer by Cognition AI |

### 💻 IDEs & Editors

| IDE/Editor | Platform | Extension/Integration |
|------------|----------|----------------------|
| **Cursor** | macOS, Windows, Linux | Built-in MCP support |
| **Windsurf** | macOS, Windows, Linux | Native MCP integration |
| **Zed** | macOS, Linux | Built-in MCP support |
| **VS Code** | Cross-platform | Via Cline or Continue extensions |
| **JetBrains IDEs** | Cross-platform | Via Continue plugin |

### 🔌 VS Code Extensions

| Extension | Description | MCP Config |
|-----------|-------------|------------|
| **Cline** | AI coding assistant | Add to Cline settings |
| **Continue** | AI code assistant | Add to `continue/config.json` |
| **RooCode** | AI pair programmer | MCP server configuration |

### 📖 Configuration Examples

<details>
<summary><b>Claude Desktop</b></summary>

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
</details>

<details>
<summary><b>Cursor</b></summary>

Open Cursor Settings → Features → Enable MCP

Add to MCP servers list:
```json
{
  "model-radar": {
    "command": "npx",
    "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
  }
}
```
</details>

<details>
<summary><b>Cline (VS Code)</b></summary>

Open Cline settings → MCP Servers

Add configuration:
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
</details>

<details>
<summary><b>Continue (VS Code/JetBrains)</b></summary>

**Location**: `~/.continue/config.json` (macOS/Linux) or `%USERPROFILE%\.continue\config.json` (Windows)

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
</details>

<details>
<summary><b>Zed Editor</b></summary>

Add to Zed settings:
```json
{
  "context_servers": {
    "model-radar": {
      "command": "npx",
      "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
    }
  }
}
```
</details>

📖 **For detailed configuration guides**, see [MCP Configuration Guide](./MCP_CONFIG_GUIDE.md)

---

## 📖 Complete Configuration Guide

### For Other MCP Clients

**Cursor, Cline, Continue, Zed**: See [MCP Configuration Guide](./MCP_CONFIG_GUIDE.md)

### Alternative: Install from Source

If you prefer to build from source:

```bash
# Clone the repository
git clone https://github.com/jiyi1990118/mcp-model-radar.git
cd mcp-model-radar

# Install and build
npm install
npm run build

# Configure Claude Desktop
{
  "mcpServers": {
    "model-radar": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"]
    }
  }
}
```

## 📦 Installation

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **pnpm**
- **SQLite** (recommended, built-in) OR **PostgreSQL 14+** (optional)

### Option 1: SQLite (Recommended)

Zero configuration, perfect for local development and testing.

```bash
# Clone the repository
git clone https://github.com/jiyi1990118/mcp-model-radar.git
cd mcp-model-radar

# Install dependencies
npm install

# Build the project
npm run build

# Insert test data (5 popular models)
npm run insert-test

# Verify everything works
npm run test
```

Your database is automatically created at `./modelradar.db` (48 KB with test data).

### Option 2: PostgreSQL

For production deployments or larger datasets.

```bash
# Install dependencies
npm install

# Create database
psql -U postgres -c "CREATE DATABASE modelradar;"

# Run schema
psql -U postgres -d modelradar -f src/db/schema.sql

# Configure environment
cp .env.example .env
# Edit .env and set:
# DB_TYPE=postgresql
# DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar

# Build and seed
npm run build
npm run seed
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database Type: sqlite or postgresql
DB_TYPE=sqlite

# SQLite Configuration (when DB_TYPE=sqlite)
SQLITE_DB_PATH=./modelradar.db

# PostgreSQL Configuration (when DB_TYPE=postgresql)
DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar

# API Keys (optional for V1)
OPENROUTER_API_KEY=your_api_key_here

# Collector Settings
HF_COLLECTION_LIMIT=100
HF_PRIORITY_ORGS=unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama

# Scheduler (set to true to enable hourly data collection)
ENABLE_SCHEDULER=false

# Logging
LOG_LEVEL=info
```

### Database Switching

Switch between SQLite and PostgreSQL anytime by changing `DB_TYPE` in `.env`:

```bash
# Use SQLite (default)
DB_TYPE=sqlite

# Use PostgreSQL
DB_TYPE=postgresql
```

No code changes needed - the database adapter handles everything.

## 🛠️ MCP Tools

All tools are accessible through MCP clients like Claude Desktop, Cursor, etc.

### 1. `get_hot_models`

Get trending models sorted by trend score.

**Parameters:**
- `limit` (optional): Number of models to return (default: 20)

**Returns:** Array of models with trend scores, downloads, and likes

**Example Usage:**
```
"Get the top 10 hottest AI models right now"
"Show me the 5 most trending models"
```

**Sample Response:**
```json
[
  {
    "model": "Qwen/Qwen3-235B",
    "trend_score": 98,
    "downloads": 5000000,
    "likes": 12000
  },
  {
    "model": "deepseek-ai/DeepSeek-V3",
    "trend_score": 95,
    "downloads": 3000000,
    "likes": 8000
  }
]
```

### 2. `get_latest_models`

Get recently released models.

**Parameters:**
- `hours` (optional): Hours to look back (default: 24)

**Returns:** Array of models released within the specified timeframe

**Example Usage:**
```
"Show me models released in the last 48 hours"
"What are the newest AI models?"
```

**Sample Response:**
```json
[
  {
    "model": "mistralai/Mistral-Large-2",
    "name": "Mistral-Large-2",
    "author": "mistralai",
    "created_at": "2026-06-07T10:30:00Z",
    "downloads": 1500000,
    "likes": 5000
  }
]
```

### 3. `search_models`

Search models by keyword across name, author, and metadata.

**Parameters:**
- `keyword` (required): Search term
- `limit` (optional): Max results (default: 50)

**Returns:** Array of matching models

**Example Usage:**
```
"Search for models with 'qwen' in the name"
"Find all deepseek models"
```

**Sample Response:**
```json
[
  {
    "model": "Qwen/Qwen3-235B",
    "name": "Qwen3-235B",
    "author": "Qwen",
    "downloads": 5000000,
    "likes": 12000,
    "trend_score": 98
  }
]
```

### 4. `get_model_detail`

Get comprehensive information about a specific model.

**Parameters:**
- `model_id` (required): Full model ID (e.g., "Qwen/Qwen3-235B")

**Returns:** Detailed model object with all metadata

**Example Usage:**
```
"Show me details for Qwen/Qwen3-235B"
"Get full information about deepseek-ai/DeepSeek-V3"
```

**Sample Response:**
```json
{
  "model_id": "Qwen/Qwen3-235B",
  "name": "Qwen3-235B",
  "author": "Qwen",
  "base_model": null,
  "params": null,
  "license": "Apache-2.0",
  "context_length": 32768,
  "tags": ["text-generation"],
  "created_at": "2026-06-08T02:00:00Z",
  "downloads": 5000000,
  "likes": 12000,
  "trend_score": 98
}
```

### 5. `compare_models`

Compare two models across multiple dimensions.

**Parameters:**
- `model_a` (required): First model ID
- `model_b` (required): Second model ID

**Returns:** Comparison result showing which model wins in each dimension

**Example Usage:**
```
"Compare Qwen/Qwen3-235B with deepseek-ai/DeepSeek-V3"
"Which is better: model A or model B?"
```

**Sample Response:**
```json
{
  "downloads": "A",
  "likes": "A",
  "trend_score": "A",
  "cost": "B",
  "context": "B"
}
```

Keys: `"A"` = first model wins, `"B"` = second model wins, `"tie"` = equal

## 📚 Usage Examples

### Example 1: Finding Trending Models

**User Query:** "What are the hottest AI models right now?"

**Tool Called:** `get_hot_models` with `limit: 5`

**Result:** List of 5 models with highest trend scores, showing which models are gaining traction fastest.

### Example 2: Discovering New Releases

**User Query:** "Show me models released today"

**Tool Called:** `get_latest_models` with `hours: 24`

**Result:** All models released in the last 24 hours, perfect for staying updated.

### Example 3: Finding Specific Models

**User Query:** "Find all Qwen models"

**Tool Called:** `search_models` with `keyword: "qwen"`

**Result:** All models matching "qwen" in name or metadata.

### Example 4: Model Comparison

**User Query:** "Compare Qwen3-235B vs DeepSeek-V3"

**Tool Called:** `compare_models` with both model IDs

**Result:** Head-to-head comparison showing strengths of each model.

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         MCP Server (stdio)          │
│    5 Tools exposed via MCP SDK      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Tools Layer                 │
│  get_hot_models, search_models...   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    Database Abstraction Layer       │
│   Unified interface for queries     │
└─────────────┬───────────┬───────────┘
              │           │
       ┌──────▼──┐   ┌────▼──────┐
       │ SQLite  │   │PostgreSQL │
       └─────────┘   └───────────┘
                  │
┌─────────────────▼───────────────────┐
│       Data Collectors               │
│  HuggingFace, OpenRouter APIs       │
└─────────────────────────────────────┘
```

### Key Components

- **MCP Server** (`src/server.ts`) - Entry point, registers tools
- **Tools** (`src/tools/`) - 5 MCP tool implementations
- **Database Layer** (`src/db/`) - Abstraction for SQLite/PostgreSQL
- **Collectors** (`src/collectors/`) - Data collection from external APIs
- **Analysis** (`src/analysis/`) - Trend score calculation

### Trend Score Algorithm

V1 Formula:
```
Trend Score = (0.6 × Download Growth) + (0.4 × Like Growth)
Scale: 0-100
Growth Period: 7 days
```

Higher scores indicate faster-growing models with strong community engagement.

## 💻 Development

### Project Structure

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
│   ├── db/                    # Database layer
│   │   ├── index.ts          # Database adapter
│   │   ├── connection.ts     # PostgreSQL connection
│   │   ├── connection-sqlite.ts  # SQLite connection
│   │   ├── queries.ts        # PostgreSQL queries
│   │   ├── queries-sqlite.ts # SQLite queries
│   │   ├── schema.sql        # PostgreSQL schema
│   │   └── schema-sqlite.sql # SQLite schema
│   ├── collectors/            # Data collectors
│   │   ├── huggingface.ts
│   │   └── openrouter.ts
│   ├── analysis/              # Analysis logic
│   │   └── trend-score.ts
│   └── scheduler/             # Cron jobs
│       └── collector-jobs.ts
├── dist/                      # Compiled JavaScript
├── docs/                      # Documentation
├── package.json
├── tsconfig.json
└── .env                       # Environment config
```

### Available Scripts

```bash
# Development
npm run dev          # Start with hot reload using tsx

# Build
npm run build        # Compile TypeScript + copy SQL files

# Production
npm start            # Start the MCP server

# Testing
npm run test         # Run all tool tests
npm run insert-test  # Insert test data quickly

# Data seeding
npm run seed         # Seed with real data (requires API access)
```

### Adding a New Tool

1. Create tool file in `src/tools/your-tool.ts`:

```typescript
import { getModels } from '../db/index.js';

export async function yourTool(args: any) {
  // Implementation
  const results = await getModels(args.limit, 'ORDER_CLAUSE');
  return results;
}
```

2. Register in `src/server.ts`:

```typescript
server.tool({
  name: 'your_tool',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    }
  }
}, async (request) => {
  const result = await yourTool(request.params.arguments);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});
```

3. Test it:

```bash
npm run build
npm start
# Use the tool in Claude Desktop
```

## 🐛 Troubleshooting

### Database Issues

**Problem:** "ENOENT: no such file or directory, open './modelradar.db'"

**Solution:**
```bash
npm run build
npm run insert-test
```

The database is auto-created on first run. Make sure to build first.

---

**Problem:** "PostgreSQL connection refused"

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -U postgres -l`

### MCP Configuration Issues

**Problem:** "Tools not showing in Claude Desktop"

**Solution:**
1. Verify config path is **absolute**, not relative
2. Check `dist/server.js` exists after `npm run build`
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

**macOS logs:** `~/Library/Logs/Claude/mcp*.log`

---

**Problem:** "No data returned from tools"

**Solution:**
```bash
# Insert test data first
npm run insert-test

# Verify tools work
npm run test
```

### Build Issues

**Problem:** "Cannot find module './db/schema-sqlite.sql'"

**Solution:**
The build script automatically copies SQL files. If it fails:
```bash
npm run copy-sql
```

Or manually:
```bash
mkdir -p dist/db
cp src/db/*.sql dist/db/
```

### Common Questions

**Q: Can I use both SQLite and PostgreSQL?**

A: Yes, switch anytime by changing `DB_TYPE` in `.env`. The database adapter handles everything.

**Q: How do I add more models?**

A: Enable the scheduler (`ENABLE_SCHEDULER=true`) or run collectors manually:
```bash
npm run seed
```

**Q: Can I deploy this to production?**

A: Yes! Use PostgreSQL for production:
```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## 🤝 Contributing

Contributions are welcome! This project follows standard open source practices.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/mcp-model-radar.git`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Make changes** and test thoroughly
5. **Commit**: `git commit -m "Add: your feature description"`
6. **Push**: `git push origin feature/your-feature`
7. **Open a Pull Request** with a clear description

### Development Guidelines

- Write TypeScript with strict type checking
- Follow existing code style (2 spaces, semicolons)
- Add tests for new features
- Update documentation for user-facing changes
- Use meaningful commit messages

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Report issues with clear reproduction steps

### Areas for Contribution

- 🌟 New data sources (Arena, GitHub, Reddit)
- 🔧 Additional MCP tools
- 📊 Enhanced analytics and scoring
- 🐛 Bug fixes and optimizations
- 📚 Documentation improvements
- 🌐 Translations

## 🗺️ Roadmap

### ✅ V1.0 (Completed)

- HuggingFace data collection
- OpenRouter pricing integration
- 5 core MCP tools
- SQLite support (zero-config)
- PostgreSQL support (production)
- Trend score calculation
- Database abstraction layer

### 🔜 V2.0 (Planned)

- LMSYS Arena integration (ELO ratings)
- GitHub trending/stars tracking
- Reddit community sentiment analysis
- Enhanced trend algorithm (4 factors)
- Model recommendation engine
- Dark horse detection (unexpectedly surging models)
- Weekly/monthly trend reports

### 🚀 V3.0 (Future)

- AI analysis agent (automated insights)
- Predictive modeling (which models will trend)
- Ecosystem analysis (base models + derivatives)
- Agent-specific recommendations
- Multi-language model support
- Real-time WebSocket updates

## 📄 License

ISC License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Model Context Protocol** - MCP SDK and protocol specification
- **HuggingFace** - Model metadata and community data
- **OpenRouter** - Pricing and availability data
- **Anthropic** - Claude Desktop integration

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/jiyi1990118/mcp-model-radar/discussions)
- 📧 **Email**: your-email@example.com

---

Made with ❤️ by the AI Model Intelligence community

⭐ Star this repo if you find it useful!
