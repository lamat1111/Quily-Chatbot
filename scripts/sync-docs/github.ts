import type { GitHubFile, SyncConfig } from './types.js';

// Get GitHub token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Build headers for GitHub API requests
 */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'quily-chatbot-docs-sync',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry and rate limit handling
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Handle rate limiting
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');

        if (rateLimitRemaining === '0' && rateLimitReset) {
          const resetTime = parseInt(rateLimitReset, 10) * 1000;
          const waitTime = Math.max(0, resetTime - Date.now()) + 1000;

          if (waitTime < 60000 && attempt < maxRetries - 1) {
            console.warn(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)}s...`);
            await sleep(waitTime);
            continue;
          }
        }

        // Check if this is rate limiting without auth
        const body = await response.text();
        if (body.includes('rate limit')) {
          if (!GITHUB_TOKEN) {
            throw new Error(
              'GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env.local for higher limits.\n' +
                'Create a token at https://github.com/settings/tokens (no scopes needed for public repos)'
            );
          }
          throw new Error(`GitHub API rate limit exceeded: ${body}`);
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}

/**
 * Fetch contents of a directory from GitHub API
 */
export async function fetchGitHubDirectory(
  config: SyncConfig,
  subPath: string = ''
): Promise<GitHubFile[]> {
  const fullPath = subPath
    ? `${config.sourcePath}/${subPath}`
    : config.sourcePath;

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${config.branch}`;

  const response = await fetchWithRetry(url, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Path not found: ${fullPath}`);
    }
    const body = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}\n${body}`);
  }

  const data = await response.json();

  // GitHub returns an object for single files, array for directories
  if (!Array.isArray(data)) {
    return [data as GitHubFile];
  }

  return data as GitHubFile[];
}

/**
 * Recursively fetch all markdown files from a GitHub directory
 */
export async function fetchAllMarkdownFiles(
  config: SyncConfig,
  subPath: string = '',
  onProgress?: (path: string) => void
): Promise<GitHubFile[]> {
  const allFiles: GitHubFile[] = [];

  const contents = await fetchGitHubDirectory(config, subPath);

  for (const item of contents) {
    // Calculate relative path from sourcePath
    const relativePath = item.path.replace(`${config.sourcePath}/`, '');

    if (item.type === 'dir') {
      // Recursively fetch subdirectories
      if (onProgress) onProgress(`Scanning: ${relativePath}/`);

      // Small delay between directory fetches to avoid rate limiting
      await sleep(100);

      const subFiles = await fetchAllMarkdownFiles(config, relativePath, onProgress);
      allFiles.push(...subFiles);
    } else if (item.type === 'file' && item.name.endsWith('.md')) {
      // Skip files starting with underscore (draft/hidden)
      if (!item.name.startsWith('_')) {
        allFiles.push({
          ...item,
          // Store relative path for consistency
          path: relativePath,
        });
      }
    }
  }

  return allFiles;
}

/**
 * Download a file's content from GitHub raw endpoint
 * Raw endpoint has much higher rate limits than API
 */
export async function downloadFileContent(
  downloadUrl: string
): Promise<string> {
  const response = await fetchWithRetry(downloadUrl, {
    headers: {
      'User-Agent': 'quily-chatbot-docs-sync',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return response.text();
}

/**
 * Build the raw download URL for a file
 * Raw URLs don't count against API rate limits
 */
export function buildRawUrl(config: SyncConfig, filePath: string): string {
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.sourcePath}/${filePath}`;
}

/**
 * Check API rate limit status
 */
export async function checkRateLimit(): Promise<{
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const response = await fetch('https://api.github.com/rate_limit', {
    headers: buildHeaders(),
  });

  const data = await response.json();
  return {
    limit: data.resources.core.limit,
    remaining: data.resources.core.remaining,
    reset: new Date(data.resources.core.reset * 1000),
  };
}
