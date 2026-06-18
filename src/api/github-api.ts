// src/api/github-api.ts
const GITHUB_API_BASE = 'https://api.github.com';
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 15000;

const AI_TOPICS = [
  'llm', 'large-language-model', 'ai-model', 'transformer',
  'text-generation', 'chatgpt', 'gpt', 'llama', 'mistral',
  'deep-learning', 'machine-learning', 'nlp', 'generative-ai'
];

const AI_KEYWORDS = [
  'llm', 'gpt', 'llama', 'mistral', 'qwen', 'deepseek',
  'phi-', 'gemma', 'claude', 'falcon', 'mixtral', 'yi-',
  'chatglm', 'baichuan', 'openchat', 'zephyr', 'solar',
  'command-r', 'dbrx', 'olmo', 'mamba', 'jamba', 'arctic'
];

async function fetchWithRetry(url: string, headers: Record<string, string>): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (response.ok) return response;
      if (response.status === 403 && attempt < MAX_RETRIES) {
        // Rate limited — wait and retry
        const delay = Math.pow(2, attempt) * 3000;
        console.error(`[GitHub API] Rate limited, retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`[GitHub API] Server error ${response.status}, retry ${attempt + 1}/${MAX_RETRIES}`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    } catch (error: any) {
      if (attempt === MAX_RETRIES || error.message?.includes('GitHub API error')) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[GitHub API] Retry ${attempt + 1}/${MAX_RETRIES}: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'ModelRadar/3.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export interface GitHubRepo {
  repo_full_name: string;
  stars: number;
  forks: number;
  open_issues: number;
  description: string | null;
  language: string | null;
  topics: string[];
  pushed_at: string;
}

/**
 * Search GitHub for AI-related repositories, sorted by stars.
 */
export async function searchAIModelRepos(limit: number = 50): Promise<GitHubRepo[]> {
  const query = AI_TOPICS.map(t => `topic:${t}`).join('+');
  const url = `${GITHUB_API_BASE}/search/repositories?q=${query}&sort=stars&order=desc&per_page=${Math.min(limit, 100)}`;

  console.error(`[GitHub API] Searching repos...`);
  const response = await fetchWithRetry(url, getHeaders());
  const data = await response.json() as any;

  return (data.items || []).map((item: any) => ({
    repo_full_name: item.full_name,
    stars: item.stargazers_count || 0,
    forks: item.forks_count || 0,
    open_issues: item.open_issues_count || 0,
    description: item.description || null,
    language: item.language || null,
    topics: item.topics || [],
    pushed_at: item.pushed_at
  }));
}

/**
 * Get a single repo by full name.
 */
export async function getRepo(fullName: string): Promise<GitHubRepo | null> {
  const url = `${GITHUB_API_BASE}/repos/${fullName}`;

  try {
    const response = await fetchWithRetry(url, getHeaders());
    const item = await response.json() as any;
    return {
      repo_full_name: item.full_name,
      stars: item.stargazers_count || 0,
      forks: item.forks_count || 0,
      open_issues: item.open_issues_count || 0,
      description: item.description || null,
      language: item.language || null,
      topics: item.topics || [],
      pushed_at: item.pushed_at
    };
  } catch (error: any) {
    console.error(`[GitHub API] Failed to get repo ${fullName}:`, error.message);
    return null;
  }
}

/**
 * Try to match a GitHub repo to a model_id in our database.
 * Returns the model_id if found, null otherwise.
 */
export function matchRepoToModel(repo: GitHubRepo): string | null {
  const repoLower = repo.repo_full_name.toLowerCase();
  const descLower = (repo.description || '').toLowerCase();
  const topicsLower = repo.topics.map(t => t.toLowerCase());

  for (const kw of AI_KEYWORDS) {
    if (repoLower.includes(kw) || descLower.includes(kw) || topicsLower.some(t => t.includes(kw))) {
      // Try common patterns: org/model-name
      const parts = repo.repo_full_name.split('/');
      if (parts.length === 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    }
  }
  return null;
}
