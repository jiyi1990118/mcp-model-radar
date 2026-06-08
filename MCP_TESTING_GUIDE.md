# MCP 测试指南 / MCP Testing Guide

> 🌏 中文 | [English](#english)

## 中文

### 快速测试步骤

#### 1. 确保项目已构建

```bash
cd /path/to/modelRadar
npm run build
npm run insert-test  # 确保有测试数据
```

#### 2. 配置 Claude Desktop

编辑配置文件：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/Users/jary/Desktop/tempDocs/modelRadar/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "./modelradar.db",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

⚠️ **重要**: 将路径改为你的实际项目路径！

#### 3. 重启 Claude Desktop

完全退出并重启 Claude Desktop 应用。

#### 4. 测试 MCP 工具

在 Claude Desktop 对话中输入以下测试查询：

**测试 1: 获取热门模型**
```
获取当前最热门的5个AI模型
```

**期望结果**: Claude 会调用 `get_hot_models` 工具，返回5个模型的详细信息，包括趋势评分、下载量、点赞数等。

**测试 2: 搜索模型**
```
搜索名称中包含"qwen"的模型
```

**期望结果**: Claude 会调用 `search_models` 工具，返回匹配的模型列表。

**测试 3: 获取最新模型**
```
显示过去24小时发布的模型
```

**期望结果**: Claude 会调用 `get_latest_models` 工具，返回新发布的模型。

**测试 4: 获取模型详情**
```
显示 Qwen/Qwen3-235B 的详细信息
```

**期望结果**: Claude 会调用 `get_model_detail` 工具，返回完整的模型信息。

**测试 5: 对比模型**
```
对比 Qwen/Qwen3-235B 和 deepseek-ai/DeepSeek-V3 这两个模型
```

**期望结果**: Claude 会调用 `compare_models` 工具，返回详细的对比数据。

### 查看日志

#### Claude Desktop 日志位置

**macOS**:
```bash
# 查看最新日志
tail -f ~/Library/Logs/Claude/mcp-server-ai-model-intelligence.log

# 查看所有MCP日志
ls -la ~/Library/Logs/Claude/mcp*.log
```

**Windows**:
```
%APPDATA%\Claude\logs\mcp-server-ai-model-intelligence.log
```

#### 工具执行日志

当工具被调用时，你会看到类似的日志：

```
[get_hot_models] Fetching top 5 trending models...
[get_hot_models] Successfully returned 5 models
```

### 故障排查

#### 问题：工具未出现

**解决步骤：**
1. 检查配置文件JSON格式是否正确
2. 确认路径是绝对路径
3. 验证 `dist/server.js` 文件存在
4. 完全重启 Claude Desktop
5. 查看日志文件中的错误信息

#### 问题：工具返回错误

**解决步骤：**
```bash
# 确保数据库有数据
npm run insert-test

# 手动测试服务器
node dist/server.js
```

#### 问题：数据为空

**解决步骤：**
```bash
# 检查数据库
ls -lh modelradar.db

# 重新插入测试数据
npm run insert-test

# 运行完整测试
npm run test
```

---

<a name="english"></a>
## English

### Quick Testing Steps

#### 1. Ensure Project is Built

```bash
cd /path/to/modelRadar
npm run build
npm run insert-test  # Ensure test data exists
```

#### 2. Configure Claude Desktop

Edit config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "node",
      "args": ["/Users/jary/Desktop/tempDocs/modelRadar/dist/server.js"],
      "env": {
        "DB_TYPE": "sqlite",
        "SQLITE_DB_PATH": "./modelradar.db",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

⚠️ **Important**: Change path to your actual project path!

#### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop app.

#### 4. Test MCP Tools

Enter these test queries in Claude Desktop:

**Test 1: Get Hot Models**
```
Get the top 5 hottest AI models right now
```

**Expected**: Claude calls `get_hot_models` tool, returns 5 models with trend scores, downloads, likes, etc.

**Test 2: Search Models**
```
Search for models with "qwen" in the name
```

**Expected**: Claude calls `search_models` tool, returns matching models.

**Test 3: Get Latest Models**
```
Show models released in the last 24 hours
```

**Expected**: Claude calls `get_latest_models` tool, returns newly released models.

**Test 4: Get Model Detail**
```
Show details for Qwen/Qwen3-235B
```

**Expected**: Claude calls `get_model_detail` tool, returns complete model information.

**Test 5: Compare Models**
```
Compare Qwen/Qwen3-235B with deepseek-ai/DeepSeek-V3
```

**Expected**: Claude calls `compare_models` tool, returns detailed comparison data.

### View Logs

#### Claude Desktop Log Location

**macOS**:
```bash
# View latest logs
tail -f ~/Library/Logs/Claude/mcp-server-ai-model-intelligence.log

# List all MCP logs
ls -la ~/Library/Logs/Claude/mcp*.log
```

**Windows**:
```
%APPDATA%\Claude\logs\mcp-server-ai-model-intelligence.log
```

#### Tool Execution Logs

When tools are called, you'll see logs like:

```
[get_hot_models] Fetching top 5 trending models...
[get_hot_models] Successfully returned 5 models
```

### Troubleshooting

#### Issue: Tools Not Appearing

**Steps:**
1. Check config file JSON format is valid
2. Confirm path is absolute
3. Verify `dist/server.js` exists
4. Fully restart Claude Desktop
5. Check log files for errors

#### Issue: Tools Return Errors

**Steps:**
```bash
# Ensure database has data
npm run insert-test

# Test server manually
node dist/server.js
```

#### Issue: Empty Data

**Steps:**
```bash
# Check database
ls -lh modelradar.db

# Re-insert test data
npm run insert-test

# Run full tests
npm run test
```
