#!/usr/bin/env node
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
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
import { getGithubTrendingHandler } from './tools/get-github-trending.js';
import { getDarkhorseModelsHandler } from './tools/get-darkhorse-models.js';
import { getModelReportHandler } from './tools/get-model-report.js';
import { getCommunityHeatHandler } from './tools/get-community-heat.js';
import { startScheduler } from './scheduler/collector-jobs.js';
import { triggerSyncIfNeeded } from './utils/sync-manager.js';

const server = new Server(
  {
    name: 'ai-model-intelligence',
    version: '3.0.0'
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
              default: ['performance', 'cost', 'context']
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
      },
      {
        name: 'get_github_trending',
        description: 'Get trending AI-related GitHub repositories sorted by stars',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of repos to return', default: 20 },
            language: { type: 'string', description: 'Filter by programming language (e.g., Python)' },
            topic: { type: 'string', description: 'Filter by topic (e.g., llm, transformer)' }
          }
        }
      },
      {
        name: 'get_darkhorse_models',
        description: 'Detect unexpectedly surging "dark horse" models with high breakout potential',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of dark horse candidates to return', default: 10 }
          }
        }
      },
      {
        name: 'get_model_report',
        description: 'Generate a weekly or monthly AI model ecosystem trend report',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['weekly', 'monthly'],
              description: 'Report period',
              default: 'weekly'
            }
          }
        }
      },
      {
        name: 'get_community_heat',
        description: 'Analyze community discussions and sentiment about AI models across Reddit',
        inputSchema: {
          type: 'object',
          properties: {
            model_id: { type: 'string', description: 'Specific model ID to analyze (optional, defaults to top trending)' },
            subreddit: { type: 'string', description: 'Specific subreddit (optional, defaults to all AI subreddits)' },
            days: { type: 'number', description: 'Days to look back', default: 7 },
            limit: { type: 'number', description: 'Max posts to analyze', default: 25 }
          }
        }
      }
    ]
  };
});

// Tool handler registry — O(1) lookup instead of if/else chain
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  get_hot_models: (a) => getHotModels(a),
  get_latest_models: (a) => getLatestModels(a),
  search_models: (a) => searchModels(a),
  get_model_detail: (a) => getModelDetail(a),
  compare_models: (a) => compareModels(a),
  get_models_by_type: (a) => getModelsByTypeHandler(a),
  get_models_by_size: (a) => getModelsBySizeHandler(a),
  get_models_by_license: (a) => getModelsByLicenseHandler(a),
  get_models_by_author: (a) => getModelsByAuthorHandler(a),
  get_model_versions: (a) => getModelVersions(a),
  get_model_ecosystem: (a) => getModelEcosystem(a),
  compare_models_batch: (a) => compareModelsBatch(a),
  recommend_for_task: (a) => recommendForTask(a),
  get_deployment_guide: (a) => getDeploymentGuide(a),
  get_model_benchmarks: (a) => getModelBenchmarks(a),
  get_trending_changes: (a) => getTrendingChanges(a),
  get_github_trending: (a) => getGithubTrendingHandler(a),
  get_darkhorse_models: (a) => getDarkhorseModelsHandler(a),
  get_model_report: (a) => getModelReportHandler(a),
  get_community_heat: (a) => getCommunityHeatHandler(a),
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const safeArgs = args || {};

  try {
    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const result = await handler(safeArgs);

    // Fire-and-forget background sync (must not affect the response)
    triggerSyncIfNeeded().catch(() => {});

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
});

/**
 * Determine transport mode:
 * - "http": Streamable HTTP (shared process, multi-client) — triggered by -p/--port flag
 * - "stdio": Standard I/O (default, one process per client)
 *
 * Usage:
 *   mcp-model-radar              → stdio mode (default)
 *   mcp-model-radar -p 3100      → HTTP mode on port 3100
 *   mcp-model-radar --port 3100  → HTTP mode on port 3100
 */
function parseCliArgs(): { mode: 'http' | 'stdio'; port: number } {
  const args = process.argv.slice(2);
  const portIdx = args.findIndex(a => a === '-p' || a === '--port');

  if (portIdx !== -1) {
    const port = parseInt(args[portIdx + 1], 10) || 3100;
    return { mode: 'http', port };
  }

  // Fallback: env vars for backward compatibility
  if (process.env.MCP_TRANSPORT === 'http') {
    return { mode: 'http', port: parseInt(process.env.MCP_PORT || '3100', 10) };
  }

  return { mode: 'stdio', port: 0 };
}

async function main() {
  const { mode, port } = parseCliArgs();

  if (mode === 'http') {
    // Streamable HTTP mode — shared process for multiple MCP clients
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    // Connect the MCP server to the transport
    await server.connect(transport);

    const httpServer = http.createServer(async (req, res) => {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
        });
        res.end();
        return;
      }

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error('[HTTP] Request handling error:', error);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      }
    });

    httpServer.listen(port, () => {
      console.error(`AI Model Intelligence MCP Server (HTTP) listening on http://localhost:${port}`);
      startScheduler();
    });

    // Graceful shutdown for HTTP
    const shutdown = () => {
      console.error('Shutting down HTTP server...');
      httpServer.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } else {
    // Stdio mode — traditional one-process-per-client (default)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('AI Model Intelligence MCP Server running on stdio');
    startScheduler();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down...');
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      console.error('Shutting down...');
      process.exit(0);
    });
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
