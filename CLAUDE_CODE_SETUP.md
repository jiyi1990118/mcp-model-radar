# Claude Code MCP 配置

## 方法1：项目本地配置（推荐）

在项目根目录创建 `.claude/mcp.json`：

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": [
        "/Users/jary/Desktop/tempDocs/modelRadar/dist/server.js"
      ],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "./modelradar.db"
      }
    }
  }
}
```

## 方法2：全局配置

编辑 `~/.claude.json`，在 `mcpServers` 部分添加：

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": [
        "/Users/jary/Desktop/tempDocs/modelRadar/dist/server.js"
      ]
    }
  }
}
```

## 应用配置

```bash
# 重新加载MCP配置
# 在Claude Code中输入 /mcp 命令查看状态
```
