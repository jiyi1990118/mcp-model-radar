import { getHotModels } from './tools/get-hot-models.js';
import { getLatestModels } from './tools/get-latest-models.js';
import { searchModels } from './tools/search-models.js';
import { getModelDetail } from './tools/get-model-detail.js';
import { compareModels } from './tools/compare-models.js';
import getModelsByTypeHandler from './tools/get-models-by-type.js';
import getModelsBySizeHandler from './tools/get-models-by-size.js';
import getModelsByLicenseHandler from './tools/get-models-by-license.js';
import getModelsByAuthorHandler from './tools/get-models-by-author.js';

console.log('🧪 Testing AI Model Intelligence MCP Tools\n');
console.log('⚠️  Note: Database connection required for actual data\n');

async function testTools() {
  const tests = [
    {
      name: 'get_hot_models',
      fn: () => getHotModels({ limit: 5 }),
      desc: '获取前5个热门模型'
    },
    {
      name: 'get_latest_models',
      fn: () => getLatestModels({ hours: 24 }),
      desc: '获取过去24小时的新模型'
    },
    {
      name: 'search_models',
      fn: () => searchModels({ keyword: 'qwen' }),
      desc: '搜索包含"qwen"的模型'
    },
    {
      name: 'get_model_detail',
      fn: () => getModelDetail({ model_id: 'Qwen/Qwen3-235B' }),
      desc: '获取Qwen3-235B详情'
    },
    {
      name: 'compare_models',
      fn: () => compareModels({ model_a: 'Qwen/Qwen3-235B', model_b: 'deepseek-ai/DeepSeek-V3' }),
      desc: '对比两个模型'
    },
    {
      name: 'get_models_by_type',
      fn: () => getModelsByTypeHandler({ type: 'text-generation', limit: 3 }),
      desc: '按类型筛选模型(text-generation)'
    },
    {
      name: 'get_models_by_author',
      fn: () => getModelsByAuthorHandler({ author: 'Qwen', limit: 3 }),
      desc: '按作者筛选模型(Qwen)'
    },
    {
      name: 'get_models_by_license',
      fn: () => getModelsByLicenseHandler({ license: 'Apache', limit: 3 }),
      desc: '按许可证筛选模型(Apache)'
    },
    {
      name: 'get_models_by_size',
      fn: () => getModelsBySizeHandler({ minParams: '7B', maxParams: '70B', limit: 3 }),
      desc: '按参数规模筛选模型(7B-70B)'
    }
  ];

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   ${test.desc}`);
    try {
      const result = await test.fn();
      console.log(`   ✅ Success - returned ${Array.isArray(result) ? result.length : 'object'} ${Array.isArray(result) ? 'items' : ''}`);
      console.log(`   Result preview: ${JSON.stringify(result).substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }
}

testTools().then(() => {
  console.log('✨ Test completed');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
