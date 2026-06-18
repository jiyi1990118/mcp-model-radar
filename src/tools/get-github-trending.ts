// src/tools/get-github-trending.ts
import { getGithubTrending } from '../db/index.js';

export async function getGithubTrendingHandler(args: any) {
  const limit = args.limit || 20;
  const language = args.language || undefined;
  const topic = args.topic || undefined;

  console.error(`[get_github_trending] Fetching top ${limit} GitHub repos${language ? ` (${language})` : ''}${topic ? ` [${topic}]` : ''}`);

  try {
    const repos = await getGithubTrending(limit, language, topic);

    const data = repos.map((r: any) => ({
      repo: r.repo_full_name,
      model_id: r.model_id,
      stars: r.stars,
      forks: r.forks,
      open_issues: r.open_issues,
      description: r.description,
      language: r.language,
      topics: typeof r.topics === 'string' ? JSON.parse(r.topics) : r.topics,
      pushed_at: r.pushed_at,
      collected_at: r.collected_at
    }));

    console.error(`[get_github_trending] Successfully returned ${data.length} repos`);

    return {
      success: true,
      count: data.length,
      data,
      metadata: {
        query_time: new Date().toISOString(),
        limit,
        language: language || null,
        topic: topic || null
      }
    };
  } catch (error: any) {
    console.error(`[get_github_trending] Error:`, error.message);
    throw new Error(`Failed to fetch GitHub trending repos: ${error.message}`);
  }
}
