// src/collectors/github.ts
import { searchAIModelRepos, matchRepoToModel } from '../api/github-api.js';
import { upsertGithubRepo } from '../db/index.js';

export async function collectGithubRepos() {
  console.error('[GitHub Collector] Starting collection...');

  try {
    const repos = await searchAIModelRepos(50);

    for (const repo of repos) {
      try {
        const modelId = matchRepoToModel(repo);

        await upsertGithubRepo({
          repo_full_name: repo.repo_full_name,
          model_id: modelId,
          stars: repo.stars,
          forks: repo.forks,
          open_issues: repo.open_issues,
          description: repo.description,
          language: repo.language,
          topics: repo.topics,
          pushed_at: repo.pushed_at
        });

        console.error(`[GitHub] ${repo.repo_full_name} (${repo.stars}★)${modelId ? ' → ' + modelId : ''}`);
      } catch (err: any) {
        console.error(`[GitHub] Error saving ${repo.repo_full_name}:`, err.message);
      }
    }

    console.error(`[GitHub Collector] Collected ${repos.length} repos`);
  } catch (error: any) {
    console.error('[GitHub Collector] Failed:', error.message);
  }
}
