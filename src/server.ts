#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getHotModels } from './tools/get-hot-models.js';
import { getLatestModels } from './tools/get-latest-models.js';
import { searchModels } from './tools/search-models.js';
import { getModelDetail } from './tools/get-model-detail.js';
import { compareModels } from './tools/compare-models.js';
import getModelsByTypeHandler from './tools/get-models-by-type.js';
import getModelsBySizeHandler from './tools/get-models-by-size.js';
import getModelsByLicenseHandler from './tools/get-models-by-license.js';
import getModelsByAuthorHandler from './tools/get-models-by-author.js';
import { getModelVersions } from './tools/get-model-versions.js';
import { getModelEcosystem } from './tools/get-model-ecosystem.js';
import { compareModelsBatch } from './tools/compare-models-batch.js';
import { recommendForTask } from './tools/recommend-for-task.js';
import { getDeploymentGuide } from './tools/get-deployment-guide.js';
import { getModelBenchmarks } from './tools/get-model-benchmarks.js';
import { getTrendingChanges } from './tools/get-trending-changes.js';
import { startScheduler } from './scheduler/collector-jobs.js';
import { triggerSyncIfNeeded } from './utils/sync-manager.js';

const server = new Server(
  {
    name: 'ai-model-intelligence',
    version: '0.1.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_hot_models',
        description: 'Get trending models sorted by trend score',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of models to return', default: 20 }
          }
        }
      },
      {
        name: 'get_latest_models',
        description: 'Get recently released models',
        inputSchema: {
          type: 'object',
          properties: {
            hours: { type: 'number', description: 'Hours to look back', default: 24 }
          }
        }
      },
      {
        name: 'search_models',
        description: 'Search models by keyword with advanced filters and sorting',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Search keyword' },
            filters: {
              type: 'object',
              description: 'Optional filters',
              properties: {
                type: { type: 'string', description: 'Model type/tag (e.g., text-generation)' },
                license: { type: 'string', description: 'License type (e.g., apache-2.0)' },
                author: { type: 'string', description: 'Author/organization name' }
              }
            },
            sort_by: {
              type: 'string',
              description: 'Sort field (downloads, likes, trend_score, created_at)',
              enum: ['downloads', 'likes', 'trend_score', 'created_at']
            },
            limit: { type: 'number', description: 'Number of results', default: 50 }
          },
          required: ['keyword']
        }
      },
      {
        name: 'get_model_detail',
        description: 'Get detailed information about a specific model',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Model ID' }
          },
          required: ['model_id']
        }
      },
      {
        name: 'compare_models',
        description: 'Compare two models',
        inputSchema: {
          type: 'object',
          properties: {
            model_a: { type: 'string', description: 'First model ID' },
            model_b: { type: 'string', description: 'Second model ID' }
          },
          required: ['model_a', 'model_b']
        }
      },
      {
        name: 'get_models_by_type',
        description: 'Filter models by type/tags (e.g., text-generation, text-to-image, text-to-video)',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Model type or tag to filter by' },
            limit: { type: 'number', description: 'Number of models to return', default: 20 }
          },
          required: ['type']
        }
      },
      {
        name: 'get_models_by_size',
        description: 'Filter models by parameter count range',
        inputSchema: {
          type: 'object',
          properties: {
            minParams: { type: 'string', description: 'Minimum parameter count (e.g., "7B", "13B")' },
            maxParams: { type: 'string', description: 'Maximum parameter count (e.g., "70B", "405B")' },
            limit: { type: 'number', description: 'Number of models to return', default: 20 }
          }
        }
      },
      {
        name: 'get_models_by_license',
        description: 'Filter models by license type (e.g., Apache-2.0, MIT, GPL)',
        inputSchema: {
          type: 'object',
          properties: {
            license: { type: 'string', description: 'License type to filter by' },
            limit: { type: 'number', description: 'Number of models to return', default: 20 }
          },
          required: ['license']
        }
      },
      {
        name: 'get_models_by_author',
        description: 'Get all models from a specific author/organization',
        inputSchema: {
          type: 'object',
          properties: {
            author: { type: 'string', description: 'Author or organization name' },
            limit: { type: 'number', description: 'Number of models to return', default: 20 }
          },
          required: ['author']
        }
      },
      {
        name: 'get_model_versions',
        description: 'Get quantized versions of a model (GGUF, AWQ, GPTQ, MLX)',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Base model ID' }
          },
          required: ['model_id']
        }
      },
      {
        name: 'get_model_ecosystem',
        description: 'Get base model and all derivative models (fine-tunes, variants)',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Model ID to query ecosystem for' }
          },
          required: ['model_id']
        }
      },
      {
        name: 'compare_models_batch',
        description: 'Compare 2-5 models across multiple dimensions (downloads, likes, cost, context, performance)',
        inputSchema: {
          type: 'object',
          properties: {
            model_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of 2-5 model IDs to compare',
              minItems: 2,
              maxItems: 5
            },
            dimensions: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['downloads', 'likes', 'cost', 'context', 'performance']
              },
              description: 'Dimensions to compare (default: all)',
              default: ['performance', 'cost', 'vram', 'context']
            }
          },
          required: ['model_ids']
        }
      },
      {
        name: 'recommend_for_task',
        description: 'Get AI model recommendations for a specific task with optional constraints',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              enum: ['code-generation', 'translation', 'chat', 'summarization', 'reasoning'],
              description: 'The task to find models for'
            },
            constraints: {
              type: 'object',
              description: 'Optional constraints',
              properties: {
                max_vram_gb: { type: 'number', description: 'Maximum VRAM in GB' },
                max_cost_per_1m: { type: 'number', description: 'Maximum cost per 1M tokens' },
                min_context: { type: 'number', description: 'Minimum context length' },
                license: { type: 'string', enum: ['commercial', 'any'], description: 'License requirement' }
              }
            },
            top_n: { type: 'number', description: 'Number of recommendations', default: 3 }
          },
          required: ['task']
        }
      },
      {
        name: 'get_deployment_guide',
        description: 'Get deployment guidance and feasibility analysis based on hardware constraints',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Model ID to analyze' },
            hardware: {
              type: 'object',
              description: 'Hardware specifications',
              properties: {
                gpu: { type: 'string', description: 'GPU model (e.g., RTX 4090)' },
                vram_gb: { type: 'number', description: 'VRAM in GB' },
                ram_gb: { type: 'number', description: 'System RAM in GB' },
                cpu_cores: { type: 'number', description: 'CPU core count' }
              }
            }
          },
          required: ['model_id']
        }
      },
      {
        name: 'get_model_benchmarks',
        description: 'Get benchmark scores and rankings for a model (Arena ELO, MMLU, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Model ID to get benchmarks for' }
          },
          required: ['model_id']
        }
      },
      {
        name: 'get_trending_changes',
        description: 'Track rank and metric changes over time (rising/falling models)',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['24h', '7d', '30d'],
              description: 'Time period to analyze',
              default: '7d'
            },
            metric: {
              type: 'string',
              enum: ['downloads', 'likes', 'trend_score'],
              description: 'Metric to track changes for',
              default: 'trend_score'
            }
          }
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    if (name === 'get_hot_models') {
      result = await getHotModels(args || {});
    } else if (name === 'get_latest_models') {
      result = await getLatestModels(args || {});
    } else if (name === 'search_models') {
      result = await searchModels(args || {});
    } else if (name === 'get_model_detail') {
      result = await getModelDetail(args || {});
    } else if (name === 'compare_models') {
      result = await compareModels(args || {});
    } else if (name === 'get_models_by_type') {
      result = await getModelsByTypeHandler(args as any);
    } else if (name === 'get_models_by_size') {
      result = await getModelsBySizeHandler(args as any);
    } else if (name === 'get_models_by_license') {
      result = await getModelsByLicenseHandler(args as any);
    } else if (name === 'get_models_by_author') {
      result = await getModelsByAuthorHandler(args as any);
    } else if (name === 'get_model_versions') {
      result = await getModelVersions(args || {});
    } else if (name === 'get_model_ecosystem') {
      result = await getModelEcosystem(args || {});
    } else if (name === 'compare_models_batch') {
      result = await compareModelsBatch(args || {});
    } else if (name === 'recommend_for_task') {
      result = await recommendForTask(args || {});
    } else if (name === 'get_deployment_guide') {
      result = await getDeploymentGuide(args || {});
    } else if (name === 'get_model_benchmarks') {
      result = await getModelBenchmarks(args || {});
    } else if (name === 'get_trending_changes') {
      result = await getTrendingChanges(args || {});
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Trigger background sync if needed (non-blocking)
    triggerSyncIfNeeded();

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Model Intelligence MCP Server running on stdio');
  startScheduler();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
