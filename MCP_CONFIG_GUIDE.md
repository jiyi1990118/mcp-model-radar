# MCP 客户端配置指南 / MCP Client Configuration Guide

> 🌏 中文 | [English](#english)

## 中文

本指南介绍如何在各种 MCP 客户端中配置 AI Model Intelligence MCP 服务器。

### 📦 推荐方式：npm 安装（零配置）

**最简单的方式**是通过 npm 全局安装：

```bash
npm install -g @npm_xiyuan/mcp-model-radar
```

然后在客户端配置中使用 `npx` 命令：

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

✅ **优点**：
- 零配置，开箱即用
- 自动管理依赖
- 无需手动构建或指定路径
- 自动使用最新版本

### 🔧 备选方式：从源码安装

如果你需要修改源码或本地开发，可以从源码构建：

1. 确保项目已构建：
```bash
npm run build
```

2. 确保数据库已初始化：
```bash
npm run insert-test
```

3. 记录项目的**绝对路径**（非常重要）

---

## Claude Desktop

### 方式 1：使用 npm（推荐）

### 方式 1：使用 npm（推荐）

**配置位置**：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**配置内容**：
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

### 方式 2：从源码运行

**配置内容**：
```json
{
  "mcpServers": {
    "model-radar": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "~/.mcp-model-radar/modelradar.db"
      }
    }
  }
}
```

⚠️ **重要**：将 `/absolute/path/to/mcp-model-radar` 替换为实际路径！

### 验证

1. 保存配置文件
2. 重启 Claude Desktop
3. 在对话中询问："获取热门AI模型"
4. Claude 应该能调用 `get_hot_models` 工具

---

## Cursor

### 方式 1：使用 npm（推荐）

**配置位置**：
- **macOS/Linux**: `~/.cursor/mcp_config.json`
- **Windows**: `%USERPROFILE%\.cursor\mcp_config.json`

**配置内容**：
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

### 方式 2：从源码运行

**配置内容**：
```json
{
  "mcpServers": {
    "model-radar": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"]
    }
  }
}
```

### 使用

在 Cursor 中使用 AI 功能时，可以直接要求：
- "搜索qwen模型"
- "对比两个模型"
- "显示最新发布的模型"

---

## Cline (VS Code Extension)

### 方式 1：使用 npm（推荐）

1. 打开 VS Code
2. 安装 Cline 扩展
3. 打开设置：`Cline: MCP Settings`
4. 添加服务器配置：

```json
{
  "model-radar": {
    "command": "npx",
    "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
  }
}
```

### 方式 2：从源码运行

```json
{
  "model-radar": {
    "command": "node",
    "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"],
    "env": {
      "DB_TYPE": "sqlite"
    }
  }
}
```

---

## Continue (VS Code Extension)

### 方式 1：使用 npm（推荐）

**配置位置**：`~/.continue/config.json`

**配置内容**：
```json
{
  "mcpServers": [
    {
      "name": "model-radar",
      "command": "npx",
      "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
    }
  ]
}
```

### 方式 2：从源码运行

```json
{
  "mcpServers": [
    {
      "name": "model-radar",
      "command": "node",
      "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"]
    }
  ]
}
```

---

## Zed Editor

### 方式 1：使用 npm（推荐）

**配置位置**：
- **macOS**: `~/Library/Application Support/Zed/mcp.json`
- **Linux**: `~/.config/zed/mcp.json`

**配置内容**：
```json
{
  "servers": {
    "model-radar": {
      "command": "npx",
      "args": ["-y", "@npm_xiyuan/mcp-model-radar"]
    }
  }
}
```

### 方式 2：从源码运行

```json
{
  "servers": {
    "model-radar": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-model-radar/dist/server.js"]
    }
  }
}
```

---

## 环境变量配置

所有 MCP 客户端都支持通过 `env` 字段传递环境变量：

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/path/to/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "~/.mcp-model-radar/modelradar.db",
        "LOG_LEVEL": "info",
        "ENABLE_SCHEDULER": "false"
      }
    }
  }
}
```

### 可用环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DB_TYPE` | 数据库类型 | `sqlite` |
| `SQLITE_DB_PATH` | SQLite数据库路径 | `~/.mcp-model-radar/modelradar.db` |
| `DATABASE_URL` | PostgreSQL连接URL | - |
| `LOG_LEVEL` | 日志级别 | `info` |
| `ENABLE_SCHEDULER` | 启用定时采集 | `false` |

---

## 常见问题

### Q: MCP 服务器未出现在客户端

**检查清单：**
1. ✅ 路径是绝对路径，不是相对路径
2. ✅ `dist/server.js` 文件存在
3. ✅ 已重启客户端应用
4. ✅ 配置文件JSON格式正确

**调试：**
```bash
# 手动运行服务器测试
node /absolute/path/to/modelRadar/dist/server.js
```

### Q: 工具调用返回错误

**可能原因：**
- 数据库文件不存在
- 数据库为空

**解决方案：**
```bash
npm run insert-test
```

### Q: 如何查看日志

**Claude Desktop日志位置：**
- **macOS**: `~/Library/Logs/Claude/mcp*.log`
- **Windows**: `%APPDATA%\Claude\logs\mcp*.log`

---

## 使用 npx 简化配置

如果使用 npx，配置更简单：

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "npx",
      "args": ["-y", "modelradar", "start"],
      "cwd": "/absolute/path/to/modelRadar"
    }
  }
}
```

---

<a name="english"></a>
## English

This guide shows how to configure AI Model Intelligence MCP server in various MCP clients.

### Prerequisites

1. Build the project:
```bash
npm run build
```

2. Initialize database:
```bash
npm run insert-test
```

3. Note the **absolute path** to the project (very important)

---

## Claude Desktop

### Configuration Location

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Configuration

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/modelRadar/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "~/.mcp-model-radar/modelradar.db"
      }
    }
  }
}
```

⚠️ **Important**: Replace `/absolute/path/to/modelRadar` with your actual path!

### Verification

1. Save config file
2. Restart Claude Desktop
3. Ask: "Get hot AI models"
4. Claude should invoke `get_hot_models` tool

---

## Cursor

### Configuration Location

- **macOS/Linux**: `~/.cursor/mcp_config.json`
- **Windows**: `%USERPROFILE%\.cursor\mcp_config.json`

### Configuration

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

### Usage

In Cursor AI features, you can ask:
- "Search for qwen models"
- "Compare two models"
- "Show latest released models"

---

## Cline (VS Code Extension)

### Setup

1. Open VS Code
2. Install Cline extension
3. Open settings: `Cline: MCP Settings`
4. Add server configuration:

```json
{
  "ai-model-intelligence": {
    "command": "node",
    "args": ["/absolute/path/to/modelRadar/dist/server.js"],
    "env": {
      "DB_TYPE": "sqlite"
    }
  }
}
```

---

## Continue (VS Code Extension)

### Configuration Location

`~/.continue/config.json`

### Configuration

```json
{
  "mcpServers": [
    {
      "name": "ai-model-intelligence",
      "command": "node",
      "args": ["/absolute/path/to/modelRadar/dist/server.js"]
    }
  ]
}
```

---

## Zed Editor

### Configuration Location

- **macOS**: `~/Library/Application Support/Zed/mcp.json`
- **Linux**: `~/.config/zed/mcp.json`

### Configuration

```json
{
  "servers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/modelRadar/dist/server.js"]
    }
  }
}
```

---

## Environment Variables

All MCP clients support environment variables via `env` field:

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/path/to/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "~/.mcp-model-radar/modelradar.db",
        "LOG_LEVEL": "info",
        "ENABLE_SCHEDULER": "false"
      }
    }
  }
}
```

### Available Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_TYPE` | Database type | `sqlite` |
| `SQLITE_DB_PATH` | SQLite database path | `~/.mcp-model-radar/modelradar.db` |
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `LOG_LEVEL` | Log level | `info` |
| `ENABLE_SCHEDULER` | Enable scheduled collection | `false` |

---

## Troubleshooting

### Q: MCP server not showing in client

**Checklist:**
1. ✅ Path is absolute, not relative
2. ✅ `dist/server.js` file exists
3. ✅ Client application restarted
4. ✅ Config file JSON is valid

**Debug:**
```bash
# Test server manually
node /absolute/path/to/modelRadar/dist/server.js
```

### Q: Tool calls return errors

**Possible causes:**
- Database file doesn't exist
- Database is empty

**Solution:**
```bash
npm run insert-test
```

### Q: How to view logs

**Claude Desktop logs:**
- **macOS**: `~/Library/Logs/Claude/mcp*.log`
- **Windows**: `%APPDATA%\Claude\logs\mcp*.log`

---

## Simplify with npx

If using npx, configuration is simpler:

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "npx",
      "args": ["-y", "modelradar", "start"],
      "cwd": "/absolute/path/to/modelRadar"
    }
  }
}
```
