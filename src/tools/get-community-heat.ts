// src/tools/get-community-heat.ts
import { searchAllSubreddits } from '../api/reddit-api.js';
import { aggregateSentiment, analyzeSentiment } from '../analysis/sentiment.js';
import { getModels } from '../db/index.js';

const AI_MODEL_KEYWORDS = [
  'qwen', 'deepseek', 'llama', 'mistral', 'phi-', 'gemma', 'claude',
  'mixtral', 'falcon', 'yi-', 'chatglm', 'baichuan', 'openchat',
  'zephyr', 'solar', 'command-r', 'dbrx', 'olmo', 'mamba', 'jamba',
  'gpt-4', 'gpt-3', 'chatgpt'
];

export async function getCommunityHeatHandler(args: any) {
  const modelId = args.model_id || undefined;
  const subreddit = args.subreddit || undefined;
  const days = args.days || 7;
  const limit = args.limit || 25;

  console.error(`[get_community_heat] Searching discussions${modelId ? ` for ${modelId}` : ''}`);

  try {
    let queries: string[];

    if (modelId) {
      queries = [modelId];
    } else {
      // Get top trending models and search for them
      const topModels = await getModels(10, 'trend_score DESC');
      queries = (topModels as any[]).map((m: any) => m.name || m.model_id);
    }

    const cutoffDate = Date.now() / 1000 - days * 24 * 60 * 60;

    const allPosts: any[] = [];
    for (const query of queries.slice(0, 5)) {
      const posts = await searchAllSubreddits(query, Math.ceil(limit / 5));
      const recentPosts = posts.filter(p => p.created_utc > cutoffDate);
      allPosts.push(...recentPosts);
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniquePosts = allPosts.filter(p => {
      if (seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    }).slice(0, limit);

    // Analyze sentiment
    const texts = uniquePosts.map(p => `${p.title} ${p.selftext}`);
    const sentiment = aggregateSentiment(texts);

    // Per-post analysis
    const postsWithSentiment = uniquePosts.map(p => {
      const s = analyzeSentiment(`${p.title} ${p.selftext}`);
      return {
        title: p.title,
        subreddit: p.subreddit,
        url: p.url,
        score: p.score,
        num_comments: p.num_comments,
        sentiment_score: s.score,
        sentiment_label: s.label,
        created: new Date(p.created_utc * 1000).toISOString()
      };
    });

    console.error(`[get_community_heat] Found ${postsWithSentiment.length} posts, sentiment: ${sentiment.score}`);

    return {
      success: true,
      model_id: modelId || null,
      total_posts: postsWithSentiment.length,
      sentiment: {
        aggregate_score: sentiment.score,
        label: sentiment.label,
        positive_count: sentiment.positive_count,
        negative_count: sentiment.negative_count,
        neutral_count: sentiment.neutral_count
      },
      posts: postsWithSentiment,
      metadata: {
        query_time: new Date().toISOString(),
        days,
        subreddits: ['LocalLLaMA', 'MachineLearning', 'OpenAI', 'artificial']
      }
    };
  } catch (error: any) {
    console.error(`[get_community_heat] Error:`, error.message);
    throw new Error(`Failed to analyze community discussions: ${error.message}`);
  }
}
