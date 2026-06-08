下面这份文档可以直接作为你的 **MCP 项目 README + PRD + 技术设计文档 V1**。

---

# AI Model Intelligence MCP

## 项目定位

AI Model Intelligence MCP 是一个面向 AI Agent、开发者和模型研究者的模型情报中心。

目标不是简单查询 HuggingFace 模型，而是构建一个统一的：

```text
模型搜索引擎
+
模型排行榜
+
模型生态分析平台
+
模型趋势监控系统
+
Agent 决策中心
```

支持：

* Claude Desktop
* Cursor
* Cherry Studio
* Open WebUI
* Cline
* RooCode
* 自定义 Agent

---

# 核心价值

传统模型库只能回答：

```text
有哪些模型？
```

本项目重点回答：

```text
最近什么模型最火？

哪些模型增长最快？

哪些模型值得微调？

哪些模型适合Agent？

哪些模型适合本地部署？

哪些模型生态最活跃？

哪些模型可能成为下一个爆款？
```

---

# 系统架构

```text
┌──────────────────┐
│ MCP Server       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Analysis Layer   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Ranking Engine   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ PostgreSQL       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Collector Layer  │
└────────┬─────────┘
         │
 ┌───────┼────────┐
 ▼       ▼        ▼

HF    OpenRouter  Arena
 │       │         │
 ▼       ▼         ▼

GitHub Reddit  News
```

---

# 数据源

## 一级数据源

### HuggingFace

主要用途：

```text
模型发现
模型更新
下载量
点赞量
Tag
License
```

重点组织：

```text
unsloth
Qwen
deepseek-ai
microsoft
google
mistralai
meta-llama
```

---

### OpenRouter

主要用途：

```text
价格
上下文长度
Provider
可用性
延迟
```

---

### Arena

主要用途：

```text
ELO
排名
排名变化
```

---

### GitHub

主要用途：

```text
Release
Trending
Issue热度
Star增长
```

---

### Reddit

主要用途：

```text
社区热度
用户评价
趋势分析
```

重点社区：

```text
r/LocalLlama
r/MachineLearning
r/OpenAI
```

---

# 数据模型

## Model

```json
{
  "id": "",
  "name": "",
  "author": "",
  "base_model": "",
  "params": "",
  "license": "",
  "context_length": 0,
  "created_at": "",
  "updated_at": ""
}
```

---

## Model Metrics

```json
{
  "downloads": 0,
  "likes": 0,
  "arena_rank": 0,
  "arena_score": 0,
  "trend_score": 0
}
```

---

## Deployment

```json
{
  "fp16_vram": "",
  "int8_vram": "",
  "int4_vram": "",
  "gguf": true,
  "awq": true,
  "gptq": true,
  "mlx": true
}
```

---

## Pricing

```json
{
  "input_cost": 0,
  "output_cost": 0,
  "provider": ""
}
```

---

# MCP Tool设计

---

## get_hot_models

获取热门模型

### 参数

```json
{
  "limit": 20
}
```

### 返回

```json
[
  {
    "model":"Qwen3-235B",
    "trend_score":98
  }
]
```

---

## get_latest_models

获取最新模型

### 参数

```json
{
  "hours":24
}
```

---

## search_models

搜索模型

### 参数

```json
{
  "keyword":"qwen"
}
```

---

## get_model_detail

获取模型详情

### 参数

```json
{
  "model":"Qwen3-235B"
}
```

---

## compare_models

比较模型

### 参数

```json
{
  "model_a":"",
  "model_b":""
}
```

### 返回

```json
{
  "coding":"A",
  "reasoning":"B",
  "cost":"A"
}
```

---

## get_model_ranking

排行榜

### 支持分类

```text
overall
coding
reasoning
vision
multimodal
cheap
agent
local
```

---

## get_model_versions

查询量化版本

### 返回

```json
{
  "gguf":[],
  "awq":[],
  "gptq":[]
}
```

---

## get_model_ecosystem

生态信息

### 返回

```json
{
  "base_model":"Qwen3",
  "children_count":23541,
  "top_derivatives":[]
}
```

---

# 高价值扩展能力

---

## get_trending_models

趋势模型

计算：

```text
下载增长率
+
点赞增长率
+
社区热度增长率
```

返回：

```text
过去7天增长最快模型
```

---

## get_darkhorse_models

黑马模型

规则：

```text
下载量暴增
点赞暴增
Arena暴涨
```

输出：

```text
今日黑马
本周黑马
```

---

## get_community_heat

社区热度

来源：

```text
Reddit
GitHub
X
News
```

返回：

```json
{
  "mentions":235,
  "growth":130
}
```

---

## get_model_news

模型相关新闻

输出：

```json
[
  {
    "title":"",
    "summary":""
  }
]
```

---

# Agent 专用工具

---

## recommend_model

根据需求推荐模型

参数：

```json
{
  "task":"coding",
  "gpu":"24GB",
  "budget":"low"
}
```

返回：

```json
{
  "model":"Qwen3-Coder-32B",
  "reason":"..."
}
```

---

## recommend_local_model

本地部署推荐

参数：

```json
{
  "gpu":"RTX4090"
}
```

返回：

```json
{
  "best_models":[]
}
```

---

## recommend_agent_model

Agent场景推荐

参数：

```json
{
  "need_tool_calling":true,
  "need_long_context":true
}
```

---

# 排名引擎设计

## Trend Score

```text
TrendScore =
40% Download Growth
+
20% Like Growth
+
20% Community Growth
+
20% Arena Growth
```

范围：

```text
0~100
```

---

## Ecosystem Score

```text
EcosystemScore =
衍生模型数量
+
社区热度
+
GitHub活跃度
```

---

## Agent Score

维度：

```text
Tool Calling
Function Calling
Structured Output
Long Context
Reliability
```

输出：

```text
0~100
```

---

# 数据采集计划

## 每小时

```text
HuggingFace
OpenRouter
Arena
```

---

## 每天

```text
GitHub
Reddit
新闻源
```

---

## 每周

```text
生态分析
趋势分析
排行榜重计算
```

---

# V1 MVP范围

仅实现：

```text
HF采集
OpenRouter采集

get_hot_models
get_latest_models
search_models
get_model_detail
compare_models

Trend Score
```

预计：

```text
开发周期
1~2周
```

---

# V2

增加：

```text
Arena
GitHub
Reddit

社区热度
黑马模型
生态分析
```

---

# V3

增加：

```text
AI分析Agent

日报
周报
自动推荐
模型预测
```

最终目标：

```text
AI Model Intelligence MCP
=
大模型行业的 Bloomberg Terminal
```

不仅提供模型数据，更提供模型情报、趋势、生态和决策支持能力。

