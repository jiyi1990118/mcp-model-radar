# MCP Tools Reference

AI Model Intelligence MCP 提供 **17 个强大的工具**来探索全球 AI 模型生态系统。

## 📑 工具总览

| 类别 | 工具名称 | 功能说明 | 主要用途 |
|------|---------|---------|---------|
| 🔥 核心 | `get_hot_models` | 获取热门模型 | 发现趋势，追踪热门 |
| 🆕 核心 | `get_latest_models` | 获取最新模型 | 了解新发布 |
| 🔍 核心 | `search_models` | 高级搜索（多条件+排序）| 精确筛选模型 |
| 📊 核心 | `get_model_detail` | 详情+VRAM+量化版本 | 评估部署可行性 |
| ⚖️ 核心 | `compare_models` | 对比两个模型 | 选型决策 |
| 🏷️ 筛选 | `get_models_by_type` | 按类型筛选 | 找特定类别模型 |
| 📏 筛选 | `get_models_by_size` | 按参数规模筛选 | 找适合硬件的模型 |
| 📜 筛选 | `get_models_by_license` | 按许可证筛选 | 找商用友好模型 |
| 👤 筛选 | `get_models_by_author` | 按作者筛选 | 追踪特定组织 |
| 📦 高级 | `get_model_versions` | 量化版本查询 | 本地部署优化 |
| 🌳 高级 | `get_model_ecosystem` | 生态系统分析 | 了解模型影响力 |
| 🔀 V2 | `compare_models_batch` | 批量对比2-5个模型 | 多模型选型对比 |
| 🎯 V2 | `recommend_for_task` | 任务推荐引擎 | 根据任务推荐模型 |
| 🚀 V2 | `get_deployment_guide` | 部署指南 | 硬件可行性分析 |
| 📈 V2 | `get_model_benchmarks` | 基准测试数据 | 获取Arena ELO评分 |
| 📊 V2 | `get_trending_changes` | 趋势变化追踪 | 追踪排名变化 |

---

## 详细说明与示例

### 🔥 核心工具

### 1️⃣ get_hot_models - 获取热门模型

**功能**：获取按趋势分数排序的热门模型列表

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `limit` | number | 否 | 20 | 返回的模型数量 |

**使用示例**：

```javascript
// 示例1：获取默认20个热门模型
{
  "limit": 20
}

// 示例2：获取TOP 10热门模型
{
  "limit": 10
}
```

**返回示例**：
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "model_id": "Qwen/Qwen2.5-72B-Instruct",
      "name": "Qwen2.5-72B-Instruct",
      "author": "Qwen",
      "downloads": 1500000,
      "likes": 5200,
      "trend_score": 95.3,
      "license": "apache-2.0"
    }
  ]
}
```

**使用场景**：
- ✅ 快速了解当前最受欢迎的模型
- ✅ 追踪模型趋势变化
- ✅ 寻找社区热门选择进行部署

---

### 2️⃣ get_latest_models - 获取最新模型

**功能**：获取最近发布的模型列表

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `hours` | number | 否 | 24 | 回溯时间（小时） |

**使用示例**：

```javascript
// 示例1：获取24小时内的新模型
{
  "hours": 24
}

// 示例2：获取最近一周的新模型
{
  "hours": 168
}
```

**使用场景**：
- ✅ 及时了解新模型发布
- ✅ 追踪特定组织的更新节奏
- ✅ 发现创新突破

---

### 3️⃣ search_models - 高级搜索 ⭐

**功能**：强大的多条件搜索，支持过滤和排序

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `keyword` | string | ✅是 | - | 搜索关键词 |
| `filters.type` | string | 否 | - | 模型类型（如text-generation） |
| `filters.license` | string | 否 | - | 许可证类型（如apache-2.0） |
| `filters.author` | string | 否 | - | 作者/组织名称 |
| `sort_by` | string | 否 | trend_score | 排序字段：downloads/likes/trend_score/created_at |
| `limit` | number | 否 | 50 | 返回结果数量 |

**使用示例**：

```javascript
// 示例1：基础搜索
{
  "keyword": "llama"
}

// 示例2：多条件筛选 - 找Apache 2.0许可的text-generation模型
{
  "keyword": "llama",
  "filters": {
    "type": "text-generation",
    "license": "apache-2.0"
  },
  "sort_by": "downloads",
  "limit": 20
}

// 示例3：找Meta官方的Llama模型，按最新排序
{
  "keyword": "llama",
  "filters": {
    "author": "meta-llama"
  },
  "sort_by": "created_at",
  "limit": 10
}
```

**使用场景**：
- ✅ 精确筛选符合条件的模型
- ✅ 按下载量/点赞数/趋势分数排序
- ✅ 查找特定作者的模型
- ✅ 寻找商用友好的开源模型

---

### 4️⃣ get_model_detail - 获取模型详情 ⭐

**功能**：获取模型的完整信息，包括量化版本和VRAM估算

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_id` | string | ✅是 | - | 模型ID（如meta-llama/Llama-3.1-8B） |

**使用示例**：

```javascript
// 示例：查询Llama 3.1 8B的详细信息
{
  "model_id": "meta-llama/Llama-3.1-8B-Instruct"
}
```

**返回示例**：
```json
{
  "success": true,
  "data": {
    "model_id": "meta-llama/Llama-3.1-8B-Instruct",
    "name": "Llama-3.1-8B-Instruct",
    "params": "8B",
    "license": "llama3.1",
    "context_length": 128000,
    "vram_estimate": {
      "fp16_gb": 16.0,
      "int8_gb": 8.0,
      "int4_gb": 4.0
    },
    "quantized_versions": [
      {
        "model_id": "bartowski/Llama-3.1-8B-Instruct-GGUF",
        "quantization_type": "gguf, q4_k_m",
        "downloads": 150000
      }
    ],
    "pricing": {
      "provider": "openrouter",
      "input_cost": 0.18,
      "output_cost": 0.18
    }
  }
}
```

**使用场景**：
- ✅ 评估模型是否适合本地部署（查看VRAM需求）
- ✅ 查找量化版本降低硬件要求
- ✅ 了解API调用成本
- ✅ 查看模型许可证和商用限制

---

### 5️⃣ compare_models - 对比模型

**功能**：并排对比两个模型的各项指标

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_a` | string | ✅是 | - | 第一个模型ID |
| `model_b` | string | ✅是 | - | 第二个模型ID |

**使用示例**：

```javascript
// 示例：对比Qwen2.5和Llama 3.1
{
  "model_a": "Qwen/Qwen2.5-72B-Instruct",
  "model_b": "meta-llama/Llama-3.1-70B-Instruct"
}
```

**使用场景**：
- ✅ 选型决策时对比候选模型
- ✅ 了解不同模型的优劣势
- ✅ 对比价格和性能差异

---

## 🏷️ 筛选工具

### 6️⃣ get_models_by_type - 按类型筛选

**功能**：按模型类型或标签筛选模型

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `type` | string | ✅是 | - | 模型类型（如text-generation, text-to-image） |
| `limit` | number | 否 | 20 | 返回结果数量 |

**使用示例**：

```javascript
// 示例1：找文本生成模型
{
  "type": "text-generation",
  "limit": 30
}

// 示例2：找文本转图像模型
{
  "type": "text-to-image",
  "limit": 20
}

// 示例3：找视频生成模型
{
  "type": "text-to-video"
}
```

**使用场景**：
- ✅ 按应用场景快速筛选（文本、图像、视频、音频）
- ✅ 探索特定领域的最新进展
- ✅ 找特定任务的专用模型

---

### 7️⃣ get_models_by_size - 按参数规模筛选

**功能**：按模型参数量筛选

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `minParams` | string | 否 | - | 最小参数量（如"7B", "13B"） |
| `maxParams` | string | 否 | - | 最大参数量（如"70B", "405B"） |
| `limit` | number | 否 | 20 | 返回结果数量 |

**使用示例**：

```javascript
// 示例1：找7B-13B规模的模型（适合消费级GPU）
{
  "minParams": "7B",
  "maxParams": "13B",
  "limit": 30
}

// 示例2：找小于3B的轻量模型（适合移动端）
{
  "maxParams": "3B"
}

// 示例3：找70B以上的大模型
{
  "minParams": "70B",
  "limit": 10
}
```

**使用场景**：
- ✅ 根据硬件配置筛选合适的模型
- ✅ 找轻量级模型用于边缘部署
- ✅ 探索大规模模型的能力边界

---

### 8️⃣ get_models_by_license - 按许可证筛选

**功能**：按开源许可证类型筛选

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `license` | string | ✅是 | - | 许可证类型（如apache-2.0, mit, gpl） |
| `limit` | number | 否 | 20 | 返回结果数量 |

**使用示例**：

```javascript
// 示例1：找Apache 2.0许可的模型（商用友好）
{
  "license": "apache-2.0",
  "limit": 50
}

// 示例2：找MIT许可的模型
{
  "license": "mit"
}

// 示例3：找Llama 3.1许可的模型
{
  "license": "llama3.1"
}
```

**使用场景**：
- ✅ 寻找商用友好的开源模型
- ✅ 了解不同许可证的使用限制
- ✅ 合规性审查

---

### 9️⃣ get_models_by_author - 按作者筛选

**功能**：获取特定作者/组织的所有模型

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `author` | string | ✅是 | - | 作者/组织名称 |
| `limit` | number | 否 | 20 | 返回结果数量 |

**使用示例**：

```javascript
// 示例1：查看Meta的Llama系列
{
  "author": "meta-llama",
  "limit": 30
}

// 示例2：查看阿里通义千问的模型
{
  "author": "Qwen"
}

// 示例3：查看Mistral AI的模型
{
  "author": "mistralai"
}
```

**使用场景**：
- ✅ 追踪特定组织的模型更新
- ✅ 了解某组织的模型矩阵
- ✅ 对比同一作者的不同模型

---

## 📦 高级工具

### 🔟 get_model_versions - 量化版本查询 ⭐

**功能**：查询模型的所有量化版本（GGUF、AWQ、GPTQ、MLX）

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_id` | string | ✅是 | - | 基础模型ID |

**使用示例**：

```javascript
// 示例：查询Llama 3.1 8B的所有量化版本
{
  "model_id": "meta-llama/Llama-3.1-8B-Instruct"
}
```

**返回示例**：
```json
{
  "success": true,
  "base_model": "meta-llama/Llama-3.1-8B-Instruct",
  "versions_count": 12,
  "data": [
    {
      "model_id": "bartowski/Llama-3.1-8B-Instruct-GGUF",
      "name": "Llama-3.1-8B-Instruct-GGUF",
      "quantization_type": "gguf, q4_k_m, q5_k_m, q8_0",
      "downloads": 150000,
      "likes": 280,
      "tags": ["gguf", "quantized", "llama-3.1"]
    },
    {
      "model_id": "casperhansen/llama-3.1-8b-instruct-awq",
      "quantization_type": "awq, int4",
      "downloads": 45000
    }
  ]
}
```

**量化类型说明**：

| 类型 | VRAM占用 | 性能损失 | 推荐场景 |
|------|---------|---------|---------|
| GGUF Q4_K_M | ~50% | 小 | 消费级GPU，性能平衡 |
| GGUF Q8_0 | ~75% | 极小 | 高端GPU，追求精度 |
| AWQ INT4 | ~50% | 小 | NVIDIA GPU加速推理 |
| GPTQ | ~50% | 小 | AMD GPU兼容性好 |

**使用场景**：
- ✅ 本地部署选择合适的量化版本
- ✅ 对比不同量化格式的性能
- ✅ 找到VRAM受限环境的最佳选择
- ✅ 评估量化对模型质量的影响

**实战示例**：
```
场景：24GB显存GPU，想部署Llama 3.1 70B

1. 查询量化版本：
   get_model_versions({ model_id: "meta-llama/Llama-3.1-70B-Instruct" })

2. 分析VRAM需求：
   - FP16: 140GB（超出）
   - Q4_K_M: ~35GB（超出）
   - Q3_K_M: ~26GB（勉强可用）

3. 结论：选择Q3_K_M量化版本或考虑使用8B模型
```

---

### 1️⃣1️⃣ get_model_ecosystem - 生态系统查询 ⭐

**功能**：查询基础模型及其所有衍生版本（微调、变体）

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_id` | string | ✅是 | - | 模型ID（基础模型或衍生模型） |

**使用示例**：

```javascript
// 示例：查询Llama 3.1 8B的生态系统
{
  "model_id": "meta-llama/Llama-3.1-8B"
}
```

**返回示例**：
```json
{
  "success": true,
  "base_model": "meta-llama/Llama-3.1-8B",
  "derivatives_count": 45,
  "data": [
    {
      "model_id": "NousResearch/Hermes-3-Llama-3.1-8B",
      "name": "Hermes-3-Llama-3.1-8B",
      "author": "NousResearch",
      "base_model": "meta-llama/Llama-3.1-8B",
      "downloads": 85000,
      "likes": 420,
      "created_at": "2024-08-15"
    },
    {
      "model_id": "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated",
      "name": "Meta-Llama-3.1-8B-Instruct-abliterated",
      "author": "mlabonne",
      "downloads": 32000
    }
  ]
}
```

**衍生类型说明**：

| 衍生类型 | 说明 | 典型用途 |
|---------|------|---------|
| Instruct微调 | 指令优化版本 | 对话、任务执行 |
| Chat微调 | 对话优化 | 聊天机器人 |
| Code专用 | 代码优化 | 编程助手 |
| Abliterated | 移除内容审查 | 无限制创作 |
| Merge合并 | 多模型混合 | 综合能力提升 |

**使用场景**：
- ✅ 了解模型影响力和社区活跃度
- ✅ 发现基于某基础模型的优秀微调版本
- ✅ 分析模型家族的演化树
- ✅ 找特定场景的专用微调

**实战示例**：
```
场景：寻找Llama 3.1的最佳编程助手版本

1. 查询生态系统：
   get_model_ecosystem({ model_id: "meta-llama/Llama-3.1-8B" })

2. 筛选Code相关衍生：
   - DeepSeek-Coder-V2-Lite-Instruct（代码专用）
   - CodeLlama-70B-Instruct（Meta官方代码版）

3. 对比下载量和评价，选择最适合的版本
```

---

## 🔀 V2 工具

### 1️⃣2️⃣ compare_models_batch - 批量模型对比 ⭐

**功能**：同时对比2-5个模型的多个维度指标

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_ids` | array | ✅是 | - | 模型ID数组（2-5个） |
| `dimensions` | array | 否 | ['performance', 'cost', 'context'] | 对比维度 |

**使用示例**：

```javascript
// 示例1：对比3个热门模型
{
  "model_ids": [
    "Qwen/Qwen2.5-72B-Instruct",
    "meta-llama/Llama-3.1-70B-Instruct",
    "mistralai/Mixtral-8x22B-Instruct-v0.1"
  ],
  "dimensions": ["downloads", "likes", "cost", "context"]
}

// 示例2：快速对比下载量和性能
{
  "model_ids": [
    "deepseek-ai/deepseek-coder-33b-instruct",
    "Qwen/Qwen2.5-Coder-32B-Instruct"
  ],
  "dimensions": ["downloads", "performance"]
}
```

**返回示例**：
```json
{
  "success": true,
  "count": 3,
  "models": [
    {
      "model_id": "Qwen/Qwen2.5-72B-Instruct",
      "name": "Qwen2.5-72B-Instruct",
      "downloads": 1500000,
      "trend_score": 95.3
    }
  ],
  "comparison_matrix": {
    "downloads": [
      {"rank": 1, "model_id": "Qwen/Qwen2.5-72B-Instruct", "value": 1500000, "winner": true},
      {"rank": 2, "model_id": "meta-llama/Llama-3.1-70B-Instruct", "value": 850000, "winner": false}
    ],
    "cost": [
      {"rank": 1, "model_id": "mistralai/Mixtral-8x22B-Instruct-v0.1", "value": "$0.9/$0.9", "winner": true}
    ]
  }
}
```

**使用场景**：
- ✅ 选型时快速对比多个候选模型
- ✅ 生成多维度对比报告
- ✅ 了解每个维度的最佳模型

---

### 1️⃣3️⃣ recommend_for_task - 任务推荐引擎 ⭐

**功能**：根据特定任务和约束条件推荐最合适的模型

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `task` | string | ✅是 | - | 任务类型 |
| `constraints.max_vram_gb` | number | 否 | - | 最大VRAM（GB） |
| `constraints.max_cost_per_1m` | number | 否 | - | 最大成本/百万tokens |
| `constraints.min_context` | number | 否 | - | 最小上下文长度 |
| `constraints.license` | string | 否 | - | 许可证要求（commercial/any） |
| `top_n` | number | 否 | 3 | 返回推荐数量 |

**任务类型**：
- `code-generation`: 代码生成
- `translation`: 翻译
- `chat`: 对话聊天
- `summarization`: 文本摘要
- `reasoning`: 推理任务

**使用示例**：

```javascript
// 示例1：找代码生成模型，限制24GB显存
{
  "task": "code-generation",
  "constraints": {
    "max_vram_gb": 24,
    "license": "commercial"
  },
  "top_n": 3
}

// 示例2：找聊天模型，要求长上下文
{
  "task": "chat",
  "constraints": {
    "min_context": 32000,
    "max_cost_per_1m": 1.0
  }
}

// 示例3：找翻译模型，成本敏感
{
  "task": "translation",
  "constraints": {
    "max_cost_per_1m": 0.5
  },
  "top_n": 5
}
```

**返回示例**：
```json
{
  "success": true,
  "task": "code-generation",
  "recommendations": [
    {
      "model_id": "deepseek-ai/deepseek-coder-33b-instruct",
      "name": "DeepSeek-Coder-33B-Instruct",
      "score": 87,
      "reason": "Excellent match for this task; Highly popular; Cost-effective",
      "metrics": {
        "downloads": 450000,
        "trend_score": 82
      },
      "deployment": {
        "params": "33B",
        "context_length": 16384
      }
    }
  ]
}
```

**使用场景**：
- ✅ 快速找到适合特定任务的模型
- ✅ 根据硬件约束筛选模型
- ✅ 平衡性能、成本和部署难度

---

### 1️⃣4️⃣ get_deployment_guide - 部署指南 ⭐

**功能**：根据硬件配置分析模型部署可行性，提供量化建议

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_id` | string | ✅是 | - | 模型ID |
| `hardware.gpu` | string | 否 | - | GPU型号（如RTX 4090） |
| `hardware.vram_gb` | number | 否 | - | VRAM容量（GB） |
| `hardware.ram_gb` | number | 否 | - | 系统内存（GB） |
| `hardware.cpu_cores` | number | 否 | - | CPU核心数 |

**使用示例**：

```javascript
// 示例1：评估24GB显存能否运行70B模型
{
  "model_id": "meta-llama/Llama-3.1-70B-Instruct",
  "hardware": {
    "gpu": "RTX 4090",
    "vram_gb": 24
  }
}

// 示例2：评估8GB显存的部署方案
{
  "model_id": "Qwen/Qwen2.5-14B-Instruct",
  "hardware": {
    "gpu": "RTX 3060",
    "vram_gb": 8
  }
}
```

**返回示例**：
```json
{
  "success": true,
  "model": {
    "model_id": "meta-llama/Llama-3.1-70B-Instruct",
    "name": "Llama-3.1-70B-Instruct",
    "params": "70B"
  },
  "feasible": true,
  "reason": "2 deployment option(s) available",
  "recommended_option": {
    "method": "INT4 Quantization (GGUF Q4_K_M)",
    "vram_required": 35.0,
    "feasible": false,
    "performance": "Small quality loss (3-5%), 75% memory savings",
    "tools": ["llama.cpp", "GPTQ", "AWQ"],
    "instructions": "Download GGUF Q4_K_M version or use AWQ"
  },
  "all_options": [
    {
      "method": "FP16 Full Precision",
      "vram_required": 140.0,
      "feasible": false
    },
    {
      "method": "INT8 Quantization",
      "vram_required": 70.0,
      "feasible": false
    }
  ],
  "alternative_suggestion": {
    "reason": "Consider using a smaller model",
    "suggested_range": "13B-30B range"
  }
}
```

**使用场景**：
- ✅ 评估硬件是否能运行目标模型
- ✅ 选择合适的量化方案
- ✅ 获取详细的部署指导
- ✅ 了解替代方案建议

---

### 1️⃣5️⃣ get_model_benchmarks - 基准测试数据

**功能**：获取模型的基准测试分数和排名（Arena ELO等）

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `model_id` | string | ✅是 | - | 模型ID |

**使用示例**：

```javascript
// 示例：查询Qwen2.5的Arena排名
{
  "model_id": "Qwen/Qwen2.5-72B-Instruct"
}
```

**返回示例**：
```json
{
  "success": true,
  "data": {
    "model_id": "Qwen/Qwen2.5-72B-Instruct",
    "model_name": "Qwen2.5-72B-Instruct",
    "benchmarks": {
      "arena": {
        "elo_rating": 1285,
        "rank": 8,
        "organization": "Qwen",
        "source": "LMSYS Chatbot Arena"
      },
      "note": "Additional benchmarks (MMLU, HumanEval, GSM8K) coming in future updates"
    }
  }
}
```

**使用场景**：
- ✅ 了解模型在竞技场的表现
- ✅ 对比不同模型的ELO评分
- ✅ 验证模型的实际能力

---

### 1️⃣6️⃣ get_trending_changes - 趋势变化追踪 ⭐

**功能**：追踪模型指标的历史变化，发现上升和下降趋势

**参数表格**：

| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `period` | string | 否 | 7d | 时间周期：24h/7d/30d |
| `metric` | string | 否 | trend_score | 追踪指标：downloads/likes/trend_score |

**使用示例**：

```javascript
// 示例1：查看过去7天趋势分数变化最大的模型
{
  "period": "7d",
  "metric": "trend_score"
}

// 示例2：查看过去24小时下载量变化
{
  "period": "24h",
  "metric": "downloads"
}

// 示例3：查看过去30天点赞数变化
{
  "period": "30d",
  "metric": "likes"
}
```

**返回示例**：
```json
{
  "success": true,
  "period": "7d",
  "metric": "trend_score",
  "rising": [
    {
      "model_id": "Qwen/QwQ-32B-Preview",
      "name": "QwQ-32B-Preview",
      "author": "Qwen",
      "current_value": 88.5,
      "past_value": 45.2,
      "growth_rate": "+95.8%",
      "absolute_change": 43.3
    }
  ],
  "falling": [
    {
      "model_id": "older-model/example",
      "name": "Example Model",
      "current_value": 32.1,
      "past_value": 58.9,
      "growth_rate": "-45.5%",
      "absolute_change": -26.8
    }
  ]
}
```

**使用场景**：
- ✅ 发现快速上升的黑马模型
- ✅ 追踪模型热度变化趋势
- ✅ 识别正在降温的模型
- ✅ 把握模型生态动态

---

## 💡 综合使用场景

### 场景1：寻找适合本地部署的编程助手模型

**目标**：有24GB显存的GPU，想找一个适合本地部署的编程助手模型

**步骤表格**：

| 步骤 | 使用工具 | 参数 | 目的 |
|-----|---------|------|------|
| 1 | `search_models` | keyword="code", filters.type="text-generation", sort_by="downloads" | 找编程相关的热门模型 |
| 2 | `get_model_detail` | model_id="候选模型ID" | 查看VRAM估算和参数规模 |
| 3 | `get_model_versions` | model_id="选定模型" | 查找INT4量化版本 |
| 4 | `compare_models` | model_a/model_b | 对比候选模型性能 |

**执行示例**：
```javascript
// 步骤1：搜索编程模型
search_models({
  keyword: "code",
  filters: { type: "text-generation" },
  sort_by: "downloads",
  limit: 10
})
// 结果：找到DeepSeek-Coder-33B-Instruct

// 步骤2：查看详情
get_model_detail({
  model_id: "deepseek-ai/deepseek-coder-33b-instruct"
})
// VRAM估算：FP16=66GB（超出）, INT4=16.5GB（可用）

// 步骤3：查找量化版本
get_model_versions({
  model_id: "deepseek-ai/deepseek-coder-33b-instruct"
})
// 找到GGUF Q4_K_M版本

// 结论：使用DeepSeek-Coder-33B的INT4量化版本
```

---

### 场景2：追踪Llama生态发展

**目标**：了解Llama 3.1有哪些优秀的衍生模型

**步骤表格**：

| 步骤 | 使用工具 | 参数 | 目的 |
|-----|---------|------|------|
| 1 | `get_model_ecosystem` | model_id="meta-llama/Llama-3.1-8B" | 获取所有衍生模型 |
| 2 | `get_model_detail` | 对热门衍生逐个查询 | 了解详细信息和用途 |
| 3 | `compare_models` | 对比几个候选 | 选出最适合的 |

**执行示例**：
```javascript
// 步骤1：查询生态系统
get_model_ecosystem({
  model_id: "meta-llama/Llama-3.1-8B"
})
// 发现45个衍生模型

// 步骤2：查看热门衍生详情
get_model_detail({
  model_id: "NousResearch/Hermes-3-Llama-3.1-8B"
})
// Hermes-3：对话优化，下载量85K

get_model_detail({
  model_id: "mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated"
})
// Abliterated：移除内容审查，下载量32K

// 结论：Hermes-3更适合对话场景，社区认可度更高
```

---

### 场景3：对比两个热门模型进行选型

**目标**：Qwen2.5和Llama 3.1哪个更适合做对话？

**步骤表格**：

| 步骤 | 使用工具 | 参数 | 目的 |
|-----|---------|------|------|
| 1 | `compare_models` | Qwen2.5 vs Llama 3.1 | 直接对比核心指标 |
| 2 | `get_model_ecosystem` | 分别查询两者生态 | 了解社区活跃度 |
| 3 | `get_model_versions` | 查询量化版本 | 评估部署灵活性 |

**执行示例**：
```javascript
// 步骤1：直接对比
compare_models({
  model_a: "Qwen/Qwen2.5-72B-Instruct",
  model_b: "meta-llama/Llama-3.1-70B-Instruct"
})
// Qwen2.5：下载量更高、context长度更长（128K vs 128K）
// Llama 3.1：社区生态更丰富

// 步骤2：对比生态系统
get_model_ecosystem({ model_id: "Qwen/Qwen2.5-72B" })
// Qwen衍生：18个

get_model_ecosystem({ model_id: "meta-llama/Llama-3.1-70B" })
// Llama衍生：65个（生态更活跃）

// 结论：
// - 选Qwen2.5：追求最新性能和长上下文
// - 选Llama 3.1：需要丰富的微调版本和社区支持
```

---

### 场景4：寻找商用友好的图像生成模型

**目标**：找Apache 2.0许可的文本转图像模型

**步骤表格**：

| 步骤 | 使用工具 | 参数 | 目的 |
|-----|---------|------|------|
| 1 | `search_models` | keyword="stable diffusion", filters.license="apache-2.0", filters.type="text-to-image" | 精确筛选 |
| 2 | `get_model_detail` | 查询候选模型 | 确认许可证和性能 |
| 3 | `get_models_by_author` | 追踪官方发布 | 了解官方版本 |

**执行示例**：
```javascript
// 步骤1：精确搜索
search_models({
  keyword: "stable diffusion",
  filters: {
    license: "apache-2.0",
    type: "text-to-image"
  },
  sort_by: "downloads"
})

// 步骤2：确认许可证
get_model_detail({
  model_id: "stabilityai/stable-diffusion-xl-base-1.0"
})
// 确认：Apache 2.0，可商用

// 结论：SDXL适合商用部署
```

---

### 场景5：追踪特定组织的最新发布

**目标**：关注Mistral AI的模型更新

**步骤表格**：

| 步骤 | 使用工具 | 参数 | 目的 |
|-----|---------|------|------|
| 1 | `get_models_by_author` | author="mistralai" | 获取所有模型 |
| 2 | `get_latest_models` | hours=168 | 查看最近一周的新模型 |
| 3 | 交叉对比 | - | 找出Mistral的最新发布 |

**执行示例**：
```javascript
// 步骤1：查看Mistral所有模型
get_models_by_author({
  author: "mistralai",
  limit: 50
})

// 步骤2：查看最新模型
get_latest_models({
  hours: 168
})

// 交叉对比，找出Mistral的最新发布
// 结果：Mixtral 8x22B Instruct v0.3（发布于3天前）

// 步骤3：查看详情
get_model_detail({
  model_id: "mistralai/Mixtral-8x22B-Instruct-v0.3"
})
```

---

## 📊 数据源说明

| 数据源 | 提供信息 | 更新频率 |
|--------|---------|---------|
| **HuggingFace** | 模型元数据、下载量、标签、许可证 | 实时查询 |
| **OpenRouter** | API定价、上下文长度、提供商 | 小时级同步 |
| **智能镜像** | 自动选择最快镜像（hf-mirror.com/huggingface.co） | 24小时缓存 |

**数据同步机制**：
- 首次查询：如果数据库为空，自动从API获取并同步
- 后台同步：每次工具调用后触发（1小时缓存）
- 镜像选择：首次启动时测速，结果缓存24小时

---

## 🔧 故障排除

### Q: 搜索返回结果为空？
**A**: 首次使用数据库可能为空，系统会自动回退到HuggingFace API并同步数据到数据库。

### Q: 镜像连接超时？
**A**: 系统会自动测试多个镜像并选择最快的，首次可能需要5-10秒。后续访问会使用缓存的最快镜像。

### Q: VRAM估算准确吗？
**A**: 估算基于标准公式（params × quantization_multiplier），实际需求受batch size、context length、并发请求等因素影响。建议预留20%余量。

### Q: 量化版本的性能损失？
**A**: 
- Q8: 几乎无损失（<1%）
- Q5/Q6: 轻微损失（1-3%）
- Q4: 小幅损失（3-5%），最佳性价比
- Q3: 明显损失（5-10%），适合资源受限环境

### Q: 如何选择量化格式？
**A**:
- GGUF：通用兼容性最好，推荐
- AWQ：NVIDIA GPU推理加速
- GPTQ：AMD GPU兼容性好
- MLX：Apple Silicon专用

---

## 📚 相关文档

- [CLAUDE.md](./CLAUDE.md) - AI Agent开发指南
- [README.md](./README.md) - 项目概览和快速开始
- [设计文档](./Docs/design.md) - 完整架构设计（中文）
- [MCP配置指南](./MCP_CONFIG_GUIDE.md) - 多客户端配置

---

**最后更新**: 2026-06-08  
**版本**: V2.0  
**工具数量**: 17个
