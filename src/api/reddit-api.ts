// src/api/reddit-api.ts

const REDDIT_BASE = 'https://www.reddit.com';
const SUBREDDITS = ['LocalLLaMA', 'MachineLearning', 'OpenAI', 'artificial'];
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 15000;

export interface RedditPost {
  title: string;
  subreddit: string;
  url: string;
  score: number;
  num_comments: number;
  selftext: string;
  created_utc: number;
  permalink: string;
}

async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ModelRadar/3.0' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
      if (response.ok) return response;
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 2000;
        console.error(`[Reddit API] Rate limited, retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw new Error(`Reddit API error: ${response.status}`);
    } catch (error: any) {
      if (attempt === MAX_RETRIES || error.message?.includes('Reddit API error')) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Search Reddit for posts mentioning a specific model name.
 */
export async function searchReddit(query: string, subreddit?: string, limit: number = 25): Promise<RedditPost[]> {
  const sr = subreddit || SUBREDDITS.join('+');
  const url = `${REDDIT_BASE}/r/${sr}/search.json?q=${encodeURIComponent(query)}&sort=new&restrict_sr=on&limit=${limit}&raw_json=1`;

  console.error(`[Reddit API] Searching: ${query} in r/${sr}`);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json() as any;

    return (data.data?.children || []).map((child: any) => ({
      title: child.data.title || '',
      subreddit: child.data.subreddit || '',
      url: `https://reddit.com${child.data.permalink || ''}`,
      score: child.data.score || 0,
      num_comments: child.data.num_comments || 0,
      selftext: child.data.selftext || '',
      created_utc: child.data.created_utc || 0,
      permalink: child.data.permalink || ''
    }));
  } catch (error: any) {
    console.error(`[Reddit API] Search failed for "${query}":`, error.message);
    return [];
  }
}

/**
 * Search across multiple subreddits for AI model mentions.
 */
export async function searchAllSubreddits(query: string, limit: number = 25): Promise<RedditPost[]> {
  const results: RedditPost[] = [];

  for (const sr of SUBREDDITS) {
    try {
      const posts = await searchReddit(query, sr, Math.ceil(limit / SUBREDDITS.length));
      results.push(...posts);
    } catch {
      // Skip failed subreddits
    }
  }

  // Deduplicate by URL and sort by score
  const seen = new Set<string>();
  return results
    .filter(p => {
      if (seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
