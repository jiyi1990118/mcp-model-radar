// src/utils/fetch-with-retry.ts

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 15000;

export interface FetchWithRetryOptions {
  maxRetries?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
  retryOnStatus?: number[];
}

/**
 * Shared fetch with exponential backoff retry logic.
 * Used by all API clients and collectors.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const headers = options.headers || {};
  const retryOnStatus = options.retryOnStatus || [429, 500, 502, 503, 504];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (response.ok) return response;

      if (retryOnStatus.includes(response.status) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`[Fetch] HTTP ${response.status}, retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      if (error.message?.includes('HTTP error')) throw error;
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[Fetch] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Shared axios-style fetch with retry for collectors that use axios.
 * Returns parsed JSON directly.
 */
export async function fetchJSONWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<any> {
  const response = await fetchWithRetry(url, options);
  return response.json();
}
