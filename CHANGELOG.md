# Changelog / 更新日志

## [1.0.0] - 2026-06-08

### ✅ V1 MVP 完成 / V1 MVP Completed

#### 新增功能 / Added
- **5个核心MCP工具** / **5 Core MCP Tools**
  - `get_hot_models`: 获取热门模型 / Get trending models
  - `get_latest_models`: 获取最新模型 / Get latest models
  - `search_models`: 搜索模型 / Search models
  - `get_model_detail`: 获取模型详情 / Get model details
  - `compare_models`: 对比模型 / Compare models

- **数据库支持** / **Database Support**
  - ✅ SQLite（推荐，零配置）/ SQLite (recommended, zero-config)
  - ✅ PostgreSQL（可选）/ PostgreSQL (optional)
  - 数据库抽象层，轻松切换 / Database abstraction layer for easy switching

- **数据采集器** / **Data Collectors**
  - HuggingFace API 集成 / HuggingFace API integration
  - OpenRouter API 集成 / OpenRouter API integration

- **趋势评分算法** / **Trend Score Algorithm**
  - 基于下载量和点赞数增长率 / Based on downloads and likes growth rate
  - 7天增长周期 / 7-day growth period

#### 优化 / Optimizations
- 构建流程自动复制SQL文件 / Build process auto-copies SQL files
- 新增测试脚本 `npm run test` / Added test script
- 新增快速插入测试数据脚本 `npm run insert-test` / Added quick test data insertion
- 完善的双语文档（中英文）/ Complete bilingual documentation

#### 文档 / Documentation
- ✅ README.md - 完整的项目介绍 / Complete project introduction
- ✅ SQLITE_GUIDE.md - SQLite快速开始指南 / SQLite quick start guide
- ✅ CLAUDE.md - AI助手开发指南 / AI assistant development guide
- ✅ 实现计划文档 / Implementation plan documentation

---

## 即将推出 / Coming Soon

### V2 计划 / V2 Roadmap
- LMSYS Arena集成（ELO评分）/ LMSYS Arena integration (ELO ratings)
- GitHub趋势追踪 / GitHub trending tracking
- Reddit社区情绪分析 / Reddit community sentiment
- 增强的趋势算法 / Enhanced trend algorithm
- 模型推荐引擎 / Model recommendation engine
