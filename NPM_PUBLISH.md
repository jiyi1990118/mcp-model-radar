# NPM发布指南

## 📦 发布准备

### 1. 更新package.json信息

**必须修改的字段：**

```json
{
  "name": "@your-npm-username/modelradar",  // 改为你的npm用户名
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "url": "https://github.com/your-github/modelradar.git"  // 改为你的仓库
  }
}
```

### 2. 登录npm账号

```bash
npm login
```

### 3. 发布到npm

```bash
# 首次发布
npm publish --access public

# 后续更新版本
npm version patch  # 2.0.0 -> 2.0.1
npm publish --access public
```

## 🚀 用户使用方式

发布后，用户可通过以下方式使用：

### 方式1：npx直接运行（推荐）

```bash
# 初始化项目（首次运行）
npx @your-npm-username/modelradar init

# 启动MCP服务器
npx @your-npm-username/modelradar start
```

### 方式2：全局安装

```bash
# 全局安装
npm install -g @your-npm-username/modelradar

# 使用
modelradar init
modelradar start
```

### 方式3：项目本地安装

```bash
# 安装
npm install @your-npm-username/modelradar

# 在Claude Desktop配置中使用
{
  "mcpServers": {
    "ai-model-intelligence": {
      "command": "npx",
      "args": ["@your-npm-username/modelradar", "start"]
    }
  }
}
```

## 📋 版本管理

```bash
# 补丁版本 (2.0.0 -> 2.0.1) - 修复bug
npm version patch

# 次要版本 (2.0.0 -> 2.1.0) - 新功能
npm version minor

# 主要版本 (2.0.0 -> 3.0.0) - 破坏性更改
npm version major
```

## ✅ 发布前检查清单

- [ ] 更新 package.json 中的 name/author/repository
- [ ] 运行 `npm run build` 确保编译成功
- [ ] 运行 `npm run test` 确保测试通过
- [ ] 更新 README.md 中的安装说明
- [ ] 创建 git tag: `git tag v2.0.0 && git push --tags`
- [ ] 登录npm: `npm login`
- [ ] 发布: `npm publish --access public`

## 🔍 验证发布

```bash
# 查看包信息
npm view @your-npm-username/modelradar

# 测试安装
npx @your-npm-username/modelradar --help
```

## 📝 更新README安装说明

在 README.md 中添加：

```markdown
## Installation

### Via npx (No Installation Required)

\`\`\`bash
# Initialize and start
npx @your-npm-username/modelradar init
npx @your-npm-username/modelradar start
\`\`\`

### Via Global Install

\`\`\`bash
npm install -g @your-npm-username/modelradar
modelradar init
modelradar start
\`\`\`
```
