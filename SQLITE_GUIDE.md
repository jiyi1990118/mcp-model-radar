# SQLite使用指南 / SQLite Usage Guide

## 中文

### 为什么选择SQLite？

✅ **零配置** - 无需安装数据库服务器  
✅ **开箱即用** - 运行项目即自动创建数据库  
✅ **轻量级** - 单文件数据库，易于备份和分享  
✅ **快速开始** - 适合本地开发和测试

### 快速开始

1. **配置使用SQLite**（默认已配置）

编辑 `.env` 文件：
```bash
DB_TYPE=sqlite
SQLITE_DB_PATH=./modelradar.db
```

2. **安装依赖**
```bash
npm install
```

3. **构建项目**
```bash
npm run build
```

4. **插入测试数据**
```bash
npx tsx src/insert-test-data.ts
```

5. **启动MCP服务器**
```bash
npm start
```

### 测试所有功能

运行功能测试脚本：
```bash
node dist/test-tools.js
```

---

## English

### Why SQLite?

✅ **Zero Configuration** - No database server installation required  
✅ **Ready to Use** - Database created automatically  
✅ **Lightweight** - Single file database, easy backup and sharing  
✅ **Quick Start** - Perfect for local development and testing

### Quick Start

1. **Configure SQLite** (default configuration)

Edit `.env` file:
```bash
DB_TYPE=sqlite
SQLITE_DB_PATH=./modelradar.db
```

2. **Install dependencies**
```bash
npm install
```

3. **Build project**
```bash
npm run build
```

4. **Insert test data**
```bash
npx tsx src/insert-test-data.ts
```

5. **Start MCP server**
```bash
npm start
```

### Test All Features

Run function tests:
```bash
node dist/test-tools.js
```

---

## 切换到PostgreSQL / Switch to PostgreSQL

如果需要使用PostgreSQL，修改 `.env`：
```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar
```

If you need PostgreSQL, modify `.env`:
```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://postgres:password@localhost:5432/modelradar
```
