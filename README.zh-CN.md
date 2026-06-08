# AI 模型情报中心

[![版本](https://img.shields.io/badge/版本-2.0.0-blue.svg)](https://github.com/jiyi1990118/mcp-model-radar)
[![npm](https://img.shields.io/npm/v/@npm_xiyuan/mcp-model-radar)](https://www.npmjs.com/package/@npm_xiyuan/mcp-model-radar)
[![许可证](https://img.shields.io/badge/许可证-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-1.29.0-orange.svg)](https://modelcontextprotocol.io)

> 🌏 中文 | [English](./README.md)

基于模型上下文协议（MCP）的服务器，提供全球 AI 模型生态的实时情报。追踪趋势、对比模型、发现下一个突破性的 AI 模型。

## 🌟 为什么选择 AI 模型情报中心？

在快速发展的 AI 领域，及时了解模型趋势至关重要但耗时。本 MCP 服务器通过以下方式解决这个问题：

- ✅ **零配置** - 基于 SQLite，开箱即用
- ✅ **实时情报** - 追踪下载量、点赞数和趋势评分
- ✅ **17个强大工具** - 核心工具 + 高级功能（搜索过滤、量化版本、生态分析、批量对比、任务推荐、部署指南、基准测试、趋势追踪）
- ✅ **多维度分析** - 跨指标对比模型
- ✅ **智能镜像选择** - 自动选择最快的 HuggingFace 镜像
- ✅ **开源** - 可根据需求定制和扩展

## 📋 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [安装](#安装)
- [配置](#配置)
- [MCP 工具](#mcp-工具)
- [使用示例](#使用示例)
- [架构设计](#架构设计)
- [开发指南](#开发指南)
- [故障排查](#故障排查)
- [参与贡献](#参与贡献)
- [开发路线图](#开发路线图)
- [许可证](#许可证)

## ✨ 功能特性

### 17个强大的MCP工具

| 分类 | 工具 | 描述 | 使用场景 |
|------|------|------|---------|
| 🔥 **发现** | `get_hot_models` | 按增长率追踪趋势模型 | "本周最火的模型有哪些？" |
| 🆕 **发现** | `get_latest_models` | 发现最近发布的模型 | "展示新发布的模型" |
| 🔍 **搜索** | `search_models` | 高级搜索（类型、许可证、作者、排序） | "查找Apache-2.0许可的编程模型" |
| 📊 **详情** | `get_model_detail` | 完整模型信息及显存估算 | "告诉我Qwen2.5-Coder-32B的详细信息" |
| ⚖️ **对比** | `compare_models` | 跨维度对比两个模型 | "对比Llama-3.3-70B和DeepSeek-V3" |
| 🔄 **对比** | `compare_models_batch` | 同时对比2-5个模型 | "对比排名前3的编程模型" |
| 🎯 **推荐** | `recommend_for_task` | 基于任务和约束的智能推荐 | "24GB显卡上最适合编程的模型" |
| 🚀 **部署** | `get_deployment_guide` | 基于硬件的可行性分析 | "32GB显存能运行Qwen2.5-72B吗？" |
| 📊 **基准** | `get_model_benchmarks` | Arena ELO评分和基准测试 | "显示Claude-3.5的基准分数" |
| 📈 **分析** | `get_trending_changes` | 追踪排名和指标变化 | "哪些模型正在快速上升？" |
| 📦 **量化** | `get_model_versions` | 查找GGUF/AWQ/GPTQ/MLX版本 | "显示Llama-3.3的量化版本" |
| 🌳 **生态** | `get_model_ecosystem` | 探索基础模型及衍生版本 | "有哪些模型基于Llama-3？" |
| 🏷️ **筛选** | `get_models_by_type` | 按类型/标签筛选模型 | "显示所有文生图模型" |
| 📏 **筛选** | `get_models_by_size` | 按参数量范围筛选 | "7B到13B参数的模型" |
| 📜 **筛选** | `get_models_by_license` | 按许可证类型筛选 | "显示所有MIT许可的模型" |
| 👤 **筛选** | `get_models_by_author` | 获取特定作者/组织的模型 | "Qwen团队的所有模型" |

### 数据源

| 数据源 | 提供的数据 |
|--------|-----------|
| 🤗 **HuggingFace** | 下载量、点赞数、元数据、标签、许可证、模型卡片 |
| 🔄 **OpenRouter** | 实时定价、上下文长度、提供商可用性 |
| 🏆 **LMSYS Arena** | ELO评分、排名、基准分数 *（即将推出）* |

## 🚀 快速开始

### 步骤1：通过npm安装（推荐）

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

### 步骤2：配置Claude Desktop

编辑Claude Desktop配置文件：

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

### 步骤3：重启Claude Desktop

重启后，你将拥有**17个强大的AI模型情报工具**！🎉

---

## 💡 使用示例

### 🔥 查找热门趋势模型

问Claude：
```
现在有哪些热门的AI模型？
```

Claude会使用`get_hot_models`工具展示增长率最高的模型。

### 🔍 搜索特定模型

问Claude：
```
找一些Apache 2.0许可的编程模型
```

Claude会使用`search_models`工具进行筛选搜索。

### ⚖️ 对比多个模型

问Claude：
```
对比Qwen2.5-Coder-32B、DeepSeek-V3和Llama-3.3-70B
```

Claude会使用`compare_models_batch`工具展示详细对比。

### 🎯 获取任务推荐

问Claude：
```
推荐一个能在24GB显卡上运行的编程模型
```

Claude会使用`recommend_for_task`工具根据约束条件推荐合适的模型。

### 🚀 检查部署可行性

问Claude：
```
32GB显存能运行Qwen2.5-72B吗？
```

Claude会使用`get_deployment_guide`工具分析硬件需求并建议量化方案。

---

## 🔧 支持的MCP客户端

本MCP服务器可与任何支持模型上下文协议（MCP）的应用程序配合使用。以下是完整列表：

### 🤖 AI助手

| 客户端 | 平台 | 配置方式 |
|--------|------|----------|
| **Claude Desktop** | macOS, Windows | 添加到 `claude_desktop_config.json` |
| **Claude Code** | CLI, 桌面, 网页, IDE扩展 | 内置MCP支持 |
| **Cherry Studio** | 跨平台 | 内置MCP支持 |
| **Open WebUI** | 网页版 | 通过设置集成MCP |

### 🛠️ AI编码代理

| 代理工具 | 平台 | 描述 |
|---------|------|------|
| **Aider** | 终端/CLI | 终端中的AI结对编程，支持MCP |
| **OpenHands** | 网页/自托管 | 开源AI软件工程师（原名OpenDevin） |
| **Void** | 桌面IDE | AI优先的代码编辑器，支持MCP |
| **Aide** | VS Code | AI开发助手，集成MCP |
| **Devin** | 网页版 | Cognition AI的AI软件工程师 |

### 💻 IDE与编辑器

| IDE/编辑器 | 平台 | 扩展/集成方式 |
|-----------|------|-------------|
| **Cursor** | macOS, Windows, Linux | 内置MCP支持 |
| **Windsurf** | macOS, Windows, Linux | 原生MCP集成 |
| **Zed** | macOS, Linux | 内置MCP支持 |
| **VS Code** | 跨平台 | 通过Cline或Continue扩展 |
| **JetBrains IDEs** | 跨平台 | 通过Continue插件 |

### 🔌 VS Code扩展

| 扩展 | 描述 | MCP配置 |
|------|------|---------|
| **Cline** | AI编程助手 | 添加到Cline设置 |
| **Continue** | AI代码助手 | 添加到 `continue/config.json` |
| **RooCode** | AI结对编程 | MCP服务器配置 |

### 📖 配置示例

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

打开Cursor设置 → Features → 启用MCP

添加到MCP服务器列表：
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

打开Cline设置 → MCP服务器

添加配置：
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

**位置**: `~/.continue/config.json` (macOS/Linux) 或 `%USERPROFILE%\.continue\config.json` (Windows)

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
<summary><b>Zed编辑器</b></summary>

添加到Zed设置：
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

📖 **详细配置指南**，请查看[MCP配置指南](./MCP_CONFIG_GUIDE.md)

---

---

## 📖 完整配置指南

### 其他MCP客户端

**Cursor、Cline、Continue、Zed**: 查看[MCP配置指南](./MCP_CONFIG_GUIDE.md)

### 备选方案：从源码安装

如果你更喜欢从源码构建：

```bash
# 克隆仓库
git clone https://github.com/jiyi1990118/mcp-model-radar.git
cd mcp-model-radar

# 安装并构建
npm install
npm run build

# 配置Claude Desktop
{
  "mcpServers": {
    "model-radar": {
      "command": "node",
      "args": ["/绝对路径/到/mcp-model-radar/dist/server.js"]
    }
  }
}
```

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 插入测试数据
npm run insert-test

# 4. 启动 MCP 服务器
npm start
```

✅ 完成！数据库自动创建在 `./modelradar.db`

### 连接到 Claude Desktop

添加到 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/modelRadar/dist/server.js"]
    }
  }
}
```

⚠️ **重要**：将 `/absolute/path/to/modelRadar` 替换为你的实际项目路径！

重启 Claude Desktop，即可看到 5 个新工具可用。

📖 **其他 MCP 客户端配置**（Cursor、Cline、Continue、Zed），请查看完整的 [MCP 配置指南](./MCP_CONFIG_GUIDE.md)

## 📦 安装

### 前置要求

- **Node.js** 18.0.0 或更高版本
- **npm** 或 **pnpm**
- **SQLite**（推荐，内置）或 **PostgreSQL 14+**（可选）

### 方式一：SQLite（推荐）

零配置，适合本地开发和测试。

```bash
# 克隆仓库
git clone https://github.com/yourusername/modelradar.git
cd modelradar

# 安装依赖
npm install

# 构建项目
npm run build

# 插入测试数据（5个热门模型）
npm run insert-test

# 验证一切正常
npm run test
```

数据库自动创建在 `./modelradar.db`（包含测试数据时为 48 KB）。

### 方式二：PostgreSQL

用于生产部署或大型数据集。

```bash
# 安装依赖
npm install

# 创建数据库
psql -U postgres -c "CREATE DATABASE modelradar;"

# 运行数据库架构
psql -U postgres -d modelradar -f src/db/schema.sql

# 配置环境
cp .env.example .env
# 编辑 .env 并设置：
# DB_TYPE=postgresql
# DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar

# 构建和初始化
npm run build
npm run seed
```

## ⚙️ 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```bash
# 数据库类型：sqlite 或 postgresql
DB_TYPE=sqlite

# SQLite 配置（当 DB_TYPE=sqlite 时）
SQLITE_DB_PATH=./modelradar.db

# PostgreSQL 配置（当 DB_TYPE=postgresql 时）
DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar

# API 密钥（V1 可选）
OPENROUTER_API_KEY=your_api_key_here

# 采集器设置
HF_COLLECTION_LIMIT=100
HF_PRIORITY_ORGS=unsloth,Qwen,deepseek-ai,microsoft,google,mistralai,meta-llama

# 调度器（设置为 true 启用每小时数据采集）
ENABLE_SCHEDULER=false

# 日志
LOG_LEVEL=info
```

### 数据库切换

随时通过修改 `.env` 中的 `DB_TYPE` 切换数据库：

```bash
# 使用 SQLite（默认）
DB_TYPE=sqlite

# 使用 PostgreSQL
DB_TYPE=postgresql
```

无需修改代码 - 数据库适配器会处理一切。

## 🛠️ MCP 工具

所有工具可通过 Claude Desktop、Cursor 等 MCP 客户端访问。

### 1. `get_hot_models`

获取按趋势评分排序的热门模型。

**参数：**
- `limit`（可选）：返回的模型数量（默认：20）

**返回：** 包含趋势评分、下载量和点赞数的模型数组

**使用示例：**
```
"获取当前最热门的 10 个 AI 模型"
"显示 5 个最热门的模型"
```

**示例响应：**
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

获取最近发布的模型。

**参数：**
- `hours`（可选）：回溯的小时数（默认：24）

**返回：** 在指定时间范围内发布的模型数组

**使用示例：**
```
"显示过去 48 小时发布的模型"
"最新的 AI 模型有哪些？"
```

**示例响应：**
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

通过关键词搜索模型名称、作者和元数据。

**参数：**
- `keyword`（必需）：搜索关键词
- `limit`（可选）：最大结果数（默认：50）

**返回：** 匹配的模型数组

**使用示例：**
```
"搜索名称中包含 'qwen' 的模型"
"找出所有 deepseek 模型"
```

**示例响应：**
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

获取特定模型的完整信息。

**参数：**
- `model_id`（必需）：完整的模型 ID（例如："Qwen/Qwen3-235B"）

**返回：** 包含所有元数据的详细模型对象

**使用示例：**
```
"显示 Qwen/Qwen3-235B 的详细信息"
"获取 deepseek-ai/DeepSeek-V3 的完整信息"
```

**示例响应：**
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

多维度对比两个模型。

**参数：**
- `model_a`（必需）：第一个模型 ID
- `model_b`（必需）：第二个模型 ID

**返回：** 对比结果，显示每个维度哪个模型获胜

**使用示例：**
```
"对比 Qwen/Qwen3-235B 和 deepseek-ai/DeepSeek-V3"
"哪个更好：模型 A 还是模型 B？"
```

**示例响应：**
```json
{
  "downloads": "A",
  "likes": "A",
  "trend_score": "A",
  "cost": "B",
  "context": "B"
}
```

键值：`"A"` = 第一个模型获胜，`"B"` = 第二个模型获胜，`"tie"` = 平局

## 📚 使用示例

### 示例 1：查找热门模型

**用户查询：** "当前最热门的 AI 模型有哪些？"

**调用工具：** `get_hot_models` 参数 `limit: 5`

**结果：** 返回趋势评分最高的 5 个模型，显示哪些模型增长最快。

### 示例 2：发现新发布的模型

**用户查询：** "显示今天发布的模型"

**调用工具：** `get_latest_models` 参数 `hours: 24`

**结果：** 返回过去 24 小时内发布的所有模型，便于及时了解最新动态。

### 示例 3：查找特定模型

**用户查询：** "找出所有 Qwen 模型"

**调用工具：** `search_models` 参数 `keyword: "qwen"`

**结果：** 返回名称或元数据中匹配 "qwen" 的所有模型。

### 示例 4：模型对比

**用户查询：** "对比 Qwen3-235B 和 DeepSeek-V3"

**调用工具：** `compare_models` 使用两个模型 ID

**结果：** 返回正面对比结果，显示每个模型的优势。

## 🏗️ 架构设计

```
┌─────────────────────────────────────┐
│      MCP 服务器 (stdio)             │
│   通过 MCP SDK 暴露 5 个工具        │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         工具层                      │
│  get_hot_models, search_models...   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      数据库抽象层                   │
│     统一的查询接口                  │
└─────────────┬───────────┬───────────┘
              │           │
       ┌──────▼──┐   ┌────▼──────┐
       │ SQLite  │   │PostgreSQL │
       └─────────┘   └───────────┘
                  │
┌─────────────────▼───────────────────┐
│       数据采集器                    │
│  HuggingFace、OpenRouter API        │
└─────────────────────────────────────┘
```

### 核心组件

- **MCP 服务器**（`src/server.ts`）- 入口点，注册工具
- **工具层**（`src/tools/`）- 5 个 MCP 工具实现
- **数据库层**（`src/db/`）- SQLite/PostgreSQL 抽象
- **采集器**（`src/collectors/`）- 从外部 API 采集数据
- **分析**（`src/analysis/`）- 趋势评分计算

### 趋势评分算法

V1 公式：
```
趋势评分 = (0.6 × 下载量增长率) + (0.4 × 点赞数增长率)
范围：0-100
增长周期：7天
```

分数越高表示模型增长越快，社区参与度越高。

## 💻 开发指南

### 项目结构

```
modelRadar/
├── src/
│   ├── server.ts              # MCP 服务器入口
│   ├── tools/                 # MCP 工具实现
│   │   ├── get-hot-models.ts
│   │   ├── get-latest-models.ts
│   │   ├── search-models.ts
│   │   ├── get-model-detail.ts
│   │   └── compare-models.ts
│   ├── db/                    # 数据库层
│   │   ├── index.ts          # 数据库适配器
│   │   ├── connection.ts     # PostgreSQL 连接
│   │   ├── connection-sqlite.ts  # SQLite 连接
│   │   ├── queries.ts        # PostgreSQL 查询
│   │   ├── queries-sqlite.ts # SQLite 查询
│   │   ├── schema.sql        # PostgreSQL 架构
│   │   └── schema-sqlite.sql # SQLite 架构
│   ├── collectors/            # 数据采集器
│   │   ├── huggingface.ts
│   │   └── openrouter.ts
│   ├── analysis/              # 分析逻辑
│   │   └── trend-score.ts
│   └── scheduler/             # 定时任务
│       └── collector-jobs.ts
├── dist/                      # 编译后的 JavaScript
├── docs/                      # 文档
├── package.json
├── tsconfig.json
└── .env                       # 环境配置
```

### 可用脚本

```bash
# 开发
npm run dev          # 使用 tsx 热重载启动

# 构建
npm run build        # 编译 TypeScript + 复制 SQL 文件

# 生产
npm start            # 启动 MCP 服务器

# 测试
npm run test         # 运行所有工具测试
npm run insert-test  # 快速插入测试数据

# 数据初始化
npm run seed         # 使用真实数据初始化（需要 API 访问）
```

### 添加新工具

1. 在 `src/tools/your-tool.ts` 创建工具文件：

```typescript
import { getModels } from '../db/index.js';

export async function yourTool(args: any) {
  // 实现逻辑
  const results = await getModels(args.limit, 'ORDER_CLAUSE');
  return results;
}
```

2. 在 `src/server.ts` 中注册：

```typescript
server.tool({
  name: 'your_tool',
  description: '工具描述',
  inputSchema: {
    type: 'object',
    properties: {
      // 定义参数
    }
  }
}, async (request) => {
  const result = await yourTool(request.params.arguments);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});
```

3. 测试：

```bash
npm run build
npm start
# 在 Claude Desktop 中使用工具
```

## 🐛 故障排查

### 数据库问题

**问题：** "ENOENT: no such file or directory, open './modelradar.db'"

**解决方案：**
```bash
npm run build
npm run insert-test
```

数据库在首次运行时自动创建。确保先构建项目。

---

**问题：** "PostgreSQL connection refused"

**解决方案：**
1. 确保 PostgreSQL 正在运行：`pg_isready`
2. 检查 `.env` 中的 `DATABASE_URL`
3. 验证数据库存在：`psql -U postgres -l`

### MCP 配置问题

**问题：** "Claude Desktop 中看不到工具"

**解决方案：**
1. 验证配置路径是**绝对路径**，不是相对路径
2. 检查 `npm run build` 后 `dist/server.js` 存在
3. 完全重启 Claude Desktop
4. 检查 Claude Desktop 日志查看错误

**macOS 日志位置：** `~/Library/Logs/Claude/mcp*.log`

---

**问题：** "工具返回空数据"

**解决方案：**
```bash
# 先插入测试数据
npm run insert-test

# 验证工具正常
npm run test
```

### 构建问题

**问题：** "Cannot find module './db/schema-sqlite.sql'"

**解决方案：**
构建脚本会自动复制 SQL 文件。如果失败：
```bash
npm run copy-sql
```

或手动复制：
```bash
mkdir -p dist/db
cp src/db/*.sql dist/db/
```

### 常见问题

**问：可以同时使用 SQLite 和 PostgreSQL 吗？**

答：可以，随时通过修改 `.env` 中的 `DB_TYPE` 切换。数据库适配器会处理一切。

**问：如何添加更多模型？**

答：启用调度器（`ENABLE_SCHEDULER=true`）或手动运行采集器：
```bash
npm run seed
```

**问：可以部署到生产环境吗？**

答：可以！生产环境使用 PostgreSQL：
```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## 🤝 参与贡献

欢迎贡献！本项目遵循标准的开源实践。

### 如何贡献

1. **Fork** 本仓库
2. **克隆** 你的 fork：`git clone https://github.com/yourusername/modelradar.git`
3. **创建分支**：`git checkout -b feature/your-feature`
4. **进行修改**并充分测试
5. **提交**：`git commit -m "Add: 你的功能描述"`
6. **推送**：`git push origin feature/your-feature`
7. **提交 Pull Request** 并附上清晰的描述

### 开发指南

- 使用严格类型检查的 TypeScript
- 遵循现有代码风格（2 空格缩进，使用分号）
- 为新功能添加测试
- 更新面向用户的文档
- 使用有意义的提交信息

### 行为准则

- 尊重他人，包容多样性
- 专注于建设性反馈
- 帮助新手学习和贡献
- 报告问题时提供清晰的复现步骤

### 贡献方向

- 🌟 新数据源（Arena、GitHub、Reddit）
- 🔧 额外的 MCP 工具
- 📊 增强的分析和评分
- 🐛 Bug 修复和优化
- 📚 文档改进
- 🌐 翻译

## 🗺️ 开发路线图

### ✅ V1.0（已完成）

- HuggingFace 数据采集
- OpenRouter 定价集成
- 5 个核心 MCP 工具
- SQLite 支持（零配置）
- PostgreSQL 支持（生产环境）
- 趋势评分计算
- 数据库抽象层

### 🔜 V2.0（计划中）

- LMSYS Arena 集成（ELO 评分）
- GitHub 趋势/星标追踪
- Reddit 社区情绪分析
- 增强的趋势算法（4 个因素）
- 模型推荐引擎
- 黑马检测（意外激增的模型）
- 每周/每月趋势报告

### 🚀 V3.0（未来）

- AI 分析 Agent（自动化洞察）
- 预测建模（哪些模型将成为趋势）
- 生态系统分析（基础模型 + 衍生模型）
- Agent 专用推荐
- 多语言模型支持
- 实时 WebSocket 更新

## 📄 许可证

ISC 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- **Model Context Protocol** - MCP SDK 和协议规范
- **HuggingFace** - 模型元数据和社区数据
- **OpenRouter** - 定价和可用性数据
- **Anthropic** - Claude Desktop 集成

## 📞 支持

- 🐛 **Bug 报告**：[提交 Issue](https://github.com/yourusername/modelradar/issues)
- 💡 **功能请求**：[提交 Issue](https://github.com/yourusername/modelradar/issues)
- 💬 **讨论**：[GitHub Discussions](https://github.com/yourusername/modelradar/discussions)
- 📧 **邮箱**：your-email@example.com

---

用 ❤️ 由 AI 模型情报社区制作

⭐ 如果觉得有用，请给本仓库点个 Star！
