# AI 模型情报中心

[![版本](https://img.shields.io/badge/版本-2.0.2-blue.svg)](https://github.com/jiyi1990118/mcp-model-radar)
[![npm](https://img.shields.io/npm/v/@npm_xiyuan/mcp-model-radar)](https://www.npmjs.com/package/@npm_xiyuan/mcp-model-radar)
[![许可证](https://img.shields.io/badge/许可证-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-1.29.0-orange.svg)](https://modelcontextprotocol.io)

> 🌏 中文 | [English](./README.md)

基于 MCP（模型上下文协议）的服务器，提供全球 AI 模型生态的实时情报。追踪趋势、对比模型、发现下一个突破性的 AI 模型。

## 🌟 为什么选择 AI 模型情报中心？

在快速发展的 AI 领域，及时了解模型趋势至关重要但耗时。本 MCP 服务器通过以下方式解决：

- ✅ **零配置** — 基于 SQLite，开箱即用，数据库自动创建在 `~/.mcp-model-radar/modelradar.db`
- ✅ **双模式传输** — Stdio（默认，每个客户端独立进程）或 Streamable HTTP（共享进程，`-p PORT`）
- ✅ **16 个强大工具** — 发现、搜索、对比、推荐、部署分析、基准测试、趋势追踪
- ✅ **多维度分析** — 跨下载量、点赞数、趋势评分、成本、上下文长度对比模型
- ✅ **智能镜像选择** — 自动选择最快的 HuggingFace 镜像，带健康检查
- ✅ **SQLite + PostgreSQL** — 零配置 SQLite 用于本地开发，PostgreSQL 用于生产
- ✅ **开源** — ISC 许可证，可自由定制和扩展

## 📋 目录

- [快速开始](#-快速开始)
- [HTTP 模式（共享进程）](#-http-模式共享进程)
- [支持的 MCP 客户端](#-支持的-mcp-客户端)
- [从源码安装](#-从源码安装)
- [配置](#-配置)
- [MCP 工具](#-mcp-工具)
- [架构设计](#-架构设计)
- [开发指南](#-开发指南)
- [故障排查](#-故障排查)
- [开发路线图](#-开发路线图)

## 🚀 快速开始

### 步骤 1：通过 npm 安装

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

### 步骤 2：配置 MCP 客户端

编辑 MCP 客户端配置。以下是最常见的几种：

**Claude Desktop**（macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`，Windows: `%APPDATA%\Claude\claude_desktop_config.json`）：

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

**Claude Code / Cursor / Cline / Continue / Zed** — 使用相同的 `command` + `args` 模式，详见 [MCP 配置指南](./MCP_CONFIG_GUIDE.md)。

### 步骤 3：重启客户端

即可获得 **16 个 AI 模型情报工具**！🎉

试试问：*"现在有哪些热门的 AI 模型？"* 或 *"对比 Qwen3-235B 和 DeepSeek-V3"*

---

## 🌐 HTTP 模式（共享进程）

默认情况下，每个 MCP 客户端会启动一个独立的 `npx` 进程。在多客户端环境中，可以启动一个**共享的 HTTP 服务器**：

```bash
# 启动共享 MCP 服务
mcp-model-radar -p 3100
# 或者: npm run start:http
```

然后所有客户端配置为连接同一个 URL：

```json
{
  "mcpServers": {
    "model-radar": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

**优势：** 单一进程、共享数据库连接、零启动延迟、统一调度器。

> **注意：** Stdio 模式（`command: "npx"`）仍是默认方式，兼容所有客户端。HTTP 模式需要客户端支持 `url` 字段（Claude Desktop、Claude Code、Cline、Continue、Zed 均支持）。

---

## 💡 使用示例

向 AI 助手提问：

| 问题 | 调用的工具 |
|------|-----------|
| *"现在有哪些热门的 AI 模型？"* | `get_hot_models` |
| *"显示过去 48 小时发布的模型"* | `get_latest_models` |
| *"找一些 Apache-2.0 许可的编程模型"* | `search_models` |
| *"介绍一下 Qwen3-235B"* | `get_model_detail` |
| *"对比 Llama-3.3-70B、DeepSeek-V3 和 Qwen3-235B"* | `compare_models_batch` |
| *"24GB 显卡上最适合编程的模型？"* | `recommend_for_task` |
| *"32GB 显存能运行 Qwen2.5-72B 吗？"* | `get_deployment_guide` |
| *"哪些模型正在快速上升？"* | `get_trending_changes` |
| *"显示 Qwen 团队的所有模型"* | `get_models_by_author` |
| *"7B 到 70B 参数之间的模型"* | `get_models_by_size` |
| *"显示所有 MIT 许可的模型"* | `get_models_by_license` |
| *"显示所有文生图模型"* | `get_models_by_type` |
| *"显示 Llama-3.3 的量化版本"* | `get_model_versions` |
| *"有哪些模型基于 Llama-3？"* | `get_model_ecosystem` |
| *"显示 Claude 3.5 的基准分数"* | `get_model_benchmarks` |

---

## 🔧 支持的 MCP 客户端

本服务器兼容任何支持 MCP 协议的应用程序：

### AI 助手
**Claude Desktop**、**Claude Code**、**Cherry Studio**、**Open WebUI**

### AI 编码代理
**Aider**、**OpenHands**、**Void**、**Aide**、**Devin**

### IDE 与编辑器
**Cursor**、**Windsurf**、**Zed**、**VS Code**（通过 Cline/Continue）、**JetBrains**（通过 Continue）

### VS Code 扩展
**Cline**、**Continue**、**RooCode**

📖 每个客户端的详细配置示例：[MCP 配置指南](./MCP_CONFIG_GUIDE.md)

---

## 📦 从源码安装

### 前置要求

- **Node.js** 18.0.0+
- **SQLite**（内置，推荐）或 **PostgreSQL 14+**（可选）

### SQLite（推荐）

零配置，单文件数据库，存储在 `~/.mcp-model-radar/modelradar.db`。

```bash
git clone https://github.com/jiyi1990118/mcp-model-radar.git
cd mcp-model-radar
npm install
npm run build
npm run insert-test   # 插入 5 个热门模型（含真实参数量）
npm run test          # 验证 9 个测试全部通过
```

### PostgreSQL（生产环境）

```bash
npm install
psql -U postgres -c "CREATE DATABASE modelradar;"
psql -U postgres -d modelradar -f src/db/schema.sql
cp .env.example .env
# 编辑 .env: DB_TYPE=postgresql, DATABASE_URL=...
npm run build
npm run seed
```

### 可用脚本

```bash
npm run build         # 编译 TypeScript
npm start             # 启动 MCP 服务器（stdio 模式）
npm run start:http    # 启动 MCP 服务器（HTTP 模式，端口 3100）
npm run dev           # 开发模式热重载（stdio）
npm run dev:http      # 开发模式热重载（HTTP）
npm run test          # 运行所有工具测试
npm run insert-test   # 插入 5 个测试模型
npm run seed          # 从真实 API 采集数据
```

---

## ⚙️ 配置

### 环境变量

创建 `.env` 文件（从 `.env.example` 复制）：

```bash
# 数据库
DB_TYPE=sqlite                            # sqlite 或 postgresql
# SQLITE_DB_PATH=~/.mcp-model-radar/modelradar.db   # 默认路径，自动创建
# DATABASE_URL=postgresql://user:pass@localhost:5432/modelradar

# 传输模式
# MCP_TRANSPORT=http                      # 强制 HTTP 模式（替代 -p 参数）
# MCP_PORT=3100                           # HTTP 端口（默认 3100）

# API 密钥（可选）
OPENROUTER_API_KEY=

# 采集器
HF_COLLECTION_LIMIT=100
HF_PRIORITY_ORGS=unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama

# 调度器（设为 true 启用每小时数据采集）
ENABLE_SCHEDULER=false

# 日志
LOG_LEVEL=info
```

### 数据库切换

随时修改 `.env` 中的 `DB_TYPE` 即可切换 — 无需修改代码。

---

## 🛠️ MCP 工具

全部 20 个工具可通过任何 MCP 客户端访问。

### 发现工具

#### `get_hot_models`
按趋势评分排序获取热门模型。
- `limit`（可选，默认 20）— 返回数量

#### `get_latest_models`
获取最近发布的模型。
- `hours`（可选，默认 24）— 回溯小时数

### 搜索与详情工具

#### `search_models`
按关键词搜索模型，支持高级筛选。
- `keyword`（必需）— 搜索关键词
- `filters`（可选）— `{ type, license, author }`
- `sort_by`（可选）— `downloads | likes | trend_score | created_at`
- `limit`（可选，默认 50）

#### `get_model_detail`
获取模型完整信息，包括显存估算。
- `model_id`（必需）— 完整模型 ID，如 `"Qwen/Qwen3-235B"`

### 对比工具

#### `compare_models`
跨维度对比两个模型（下载量、点赞、趋势分、上下文长度、成本）。
- `model_a`（必需）— 第一个模型 ID
- `model_b`（必需）— 第二个模型 ID

#### `compare_models_batch`
同时对比 2–5 个模型。
- `model_ids`（必需）— 2–5 个模型 ID 数组
- `dimensions`（可选）— `["performance", "cost", "context"]`

### 筛选工具

#### `get_models_by_type`
按类型/标签筛选，如 `text-generation`、`text-to-image`。
- `type`（必需）
- `limit`（可选，默认 20）

#### `get_models_by_size`
按参数量范围筛选，如 `"7B"` 到 `"70B"`。
- `minParams`（可选）— 如 `"7B"`
- `maxParams`（可选）— 如 `"70B"`
- `limit`（可选，默认 20）

#### `get_models_by_license`
按许可证类型筛选，如 `Apache-2.0`、`MIT`。
- `license`（必需）
- `limit`（可选，默认 20）

#### `get_models_by_author`
获取特定组织的所有模型。
- `author`（必需）
- `limit`（可选，默认 20）

### 高级工具

#### `get_model_versions`
查找模型的量化版本（GGUF、AWQ、GPTQ、MLX）。
- `model_id`（必需）

#### `get_model_ecosystem`
探索基础模型及所有衍生模型。
- `model_id`（必需）

#### `recommend_for_task`
基于任务和约束条件获取模型推荐。
- `task`（必需）— `code-generation | translation | chat | summarization | reasoning`
- `constraints`（可选）— `{ max_vram_gb, max_cost_per_1m, min_context, license }`
- `top_n`（可选，默认 3）

#### `get_deployment_guide`
基于硬件的部署可行性分析。
- `model_id`（必需）
- `hardware`（可选）— `{ gpu, vram_gb, ram_gb, cpu_cores }`

#### `get_model_benchmarks`
Arena ELO 评分和基准测试分数。
- `model_id`（必需）

#### `get_trending_changes`
追踪排名和指标随时间的变化（上升/下降模型）。
- `period`（可选，默认 `"7d"`）— `24h | 7d | 30d`
- `metric`（可选，默认 `"trend_score"`）— `downloads | likes | trend_score`

---

## 🏗️ 架构设计

```
┌──────────────────────────────────────────────────┐
│              MCP Server（双模式）                 │
│                                                   │
│  StdioServerTransport（默认，1 进程/客户端）       │
│  StreamableHTTPServerTransport（-p PORT，共享）   │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│              工具层（20 个工具）                   │
│  发现 │ 搜索 │ 对比 │ 筛选 │ 高级                 │
└────────────────────┬──────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│              数据库抽象层                          │
│     统一接口（SQLite + PostgreSQL）               │
└──────────┬─────────────────────┬──────────────────┘
           │                     │
    ┌──────▼──────┐      ┌──────▼──────┐
    │   SQLite    │      │ PostgreSQL  │
    │ (WAL 模式)  │      │             │
    └─────────────┘      └─────────────┘
           │
┌──────────▼────────────────────────────────────────┐
│              数据采集器                            │
│  HuggingFace（模型、下载量）                       │
│  OpenRouter（定价、上下文长度）                    │
│  LMSYS Arena（ELO 评分）                          │
└───────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 位置 | 描述 |
|------|------|------|
| MCP 服务器 | `src/server.ts` | 双模式入口，20 个工具 |
| 工具层 | `src/tools/` | 20 个 MCP 工具实现 |
| 数据库层 | `src/db/` | SQLite/PostgreSQL 抽象 |
| 采集器 | `src/collectors/` | HuggingFace、OpenRouter 数据采集 |
| API 客户端 | `src/api/` | HuggingFace API、Arena 排行榜 |
| 分析 | `src/analysis/` | 趋势评分计算 |
| 调度器 | `src/scheduler/` | 定时任务，文件锁防重复 |
| 工具库 | `src/utils/` | 镜像池、同步管理、推荐引擎 |

### 趋势评分算法

```
趋势评分 = 0.6 × 下载量增长率 + 0.4 × 点赞数增长率
范围：0–100，增长周期：7 天
```

### 数据源

| 数据源 | 提供的数据 |
|--------|-----------|
| 🤗 **HuggingFace** | 下载量、点赞、元数据、标签、许可证 |
| 🔄 **OpenRouter** | 实时定价、上下文长度、提供商 |
| 🏆 **LMSYS Arena** | ELO 评分、排名 |
| 🐙 **GitHub** | AI 仓库星标、复刻、话题 |
| 💬 **Reddit** | 社区讨论、情绪分析（r/LocalLLaMA, r/MachineLearning, r/OpenAI） |

---

## 💻 开发指南

### 项目结构

```
mcp-model-radar/
├── src/
│   ├── server.ts                # MCP 服务器入口（双模式）
│   ├── cli.ts                   # CLI 包装器（modelradar 命令）
│   ├── insert-test-data.ts      # 测试数据种子
│   ├── test-tools.ts            # 工具测试运行器
│   ├── tools/                   # 20 个 MCP 工具实现
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
│   ├── db/                      # 数据库抽象
│   │   ├── index.ts             # 适配器（自动选择 SQLite/PG）
│   │   ├── connection-sqlite.ts # SQLite（better-sqlite3, WAL 模式）
│   │   ├── connection.ts        # PostgreSQL（pg Pool）
│   │   ├── queries-sqlite.ts    # SQLite 查询
│   │   ├── queries.ts           # PostgreSQL 查询
│   │   ├── schema-sqlite.sql    # SQLite 表结构
│   │   └── schema.sql           # PostgreSQL 表结构
│   ├── collectors/              # 数据采集器（含重试 + 超时）
│   │   ├── huggingface.ts
│   │   ├── openrouter.ts
│   │   └── metrics-tracker.ts
│   ├── api/                     # 外部 API 客户端
│   │   ├── huggingface-api.ts   # HF 搜索/详情（含重试）
│   │   └── arena-api.ts         # LMSYS Arena CSV 解析器
│   ├── analysis/
│   │   └── trend-score.ts       # 趋势计算（SQLite + PG）
│   ├── scheduler/
│   │   └── collector-jobs.ts    # 定时任务，PID 文件锁
│   └── utils/
│       ├── db-path.ts           # ~/.mcp-model-radar 路径工具
│       ├── db-check.ts          # 数据库可用性检查
│       ├── mirror-pool.ts       # 最快镜像选择
│       ├── sync-manager.ts      # 后台同步协调器
│       └── recommendation-engine.ts
├── dist/                        # 编译输出
├── package.json
└── tsconfig.json
```

### 添加新工具

1. 创建 `src/tools/your-tool.ts`：

```typescript
export async function yourTool(args: any) {
  // 实现逻辑
  return { success: true, data: [] };
}
```

2. 在 `src/server.ts` 中导入并添加到 `toolHandlers`：

```typescript
import { yourTool } from './tools/your-tool.js';

const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  // ... 已有 handler
  your_tool: (a) => yourTool(a),
};
```

3. 在 `ListToolsRequestSchema` 中添加工具定义和 `inputSchema`。

4. 构建并测试：`npm run build && npm run test`

---

## 🐛 故障排查

### 数据库

| 问题 | 解决方案 |
|------|---------|
| `ENOENT: no such file, open '.../modelradar.db'` | `npm run build && npm run insert-test` |
| PostgreSQL 连接被拒绝 | 检查 `pg_isready`，验证 `.env` 中的 `DATABASE_URL` |
| SQLITE_BUSY 错误 | 数据库已启用 WAL 模式，busy_timeout 为 5 秒；减少并发写入 |

### MCP 配置

| 问题 | 解决方案 |
|------|---------|
| 客户端中看不到工具 | 使用**绝对路径**配置；检查 `dist/server.js` 是否存在；重启客户端 |
| HTTP 模式：`ECONNREFUSED` | 确保服务器已启动：`mcp-model-radar -p 3100` |
| HTTP 模式：`Bad Request: Server not initialized` | 客户端必须先发送 `initialize` 请求（MCP 协议要求） |
| 工具返回空数据 | 运行 `npm run insert-test` 插入测试数据 |

**Claude Desktop 日志（macOS）：** `~/Library/Logs/Claude/mcp*.log`

---

## 🗺️ 开发路线图

### ✅ V1.0（已完成）
- HuggingFace + OpenRouter 数据采集
- 9 个核心 MCP 工具（发现、搜索、详情、对比、筛选）
- SQLite + PostgreSQL 支持，含抽象层
- 趋势评分计算（0.6 × 下载量 + 0.4 × 点赞数）

### ✅ V2.0（已完成）
- 7 个附加工具：批量对比、推荐、部署指南、基准测试、趋势变化、版本、生态
- **共计 20 个工具**
- Streamable HTTP 传输（共享进程模式）
- SQLite WAL 模式 + 调度器文件锁
- 镜像池健康检查
- 采集器重试 + 超时机制
- 引号感知 Arena CSV 解析器

### ✅ V3.0（已完成）
- GitHub 趋势星标追踪（`get_github_trending`）
- 黑马检测算法（`get_darkhorse_models`）
- 社区情绪分析（`get_community_heat`）
- 每周/每月生态报告（`get_model_report`）
- **共计 20 个工具**
- Reddit JSON API 集成（r/LocalLLaMA, r/MachineLearning, r/OpenAI）
- 轻量级情感分析引擎（关键词匹配）
- 多板块报告生成器

### 🚀 V4.0（未来）
- AI 分析代理，自动生成洞察
- WebSocket 实时更新
- 预测建模（哪些模型将成为趋势）
- Agent 专用推荐
- 多语言模型支持

---

## 📄 许可证

ISC 许可证 — 详见 [LICENSE](LICENSE)

## 📞 支持

- 🐛 **Bug 报告**：[提交 Issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💡 **功能请求**：[提交 Issue](https://github.com/jiyi1990118/mcp-model-radar/issues)
- 💬 **讨论**：[GitHub Discussions](https://github.com/jiyi1990118/mcp-model-radar/discussions)
- 📧 **邮箱**：xiyuan@gmail.com

---

用 ❤️ 由 AI 模型情报社区制作

⭐ 如果觉得有用，请给本仓库点个 Star！
