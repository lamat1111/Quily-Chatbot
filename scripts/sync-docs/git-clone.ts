import { spawn } from 'child_process';
import { rm, readdir, stat, readFile, mkdir, copyFile } from 'fs/promises';
import { join, relative } from 'path';
import { tmpdir } from 'os';
import type { SyncConfig, GitHubFile } from './types.js';
import { computeContentHash } from './manifest.js';

/**
 * Clone the repository to a temp directory and extract markdown files
 * This is much more efficient than the API as it's a single request
 */
export async function cloneAndExtractDocs(
  config: SyncConfig,
  onProgress?: (message: string) => void
): Promise<GitHubFile[]> {
  const tempDir = join(tmpdir(), `quily-docs-sync-${Date.now()}`);

  try {
    // Clone with depth 1 (only latest commit) and sparse checkout
    if (onProgress) onProgress('Cloning repository...');

    const repoUrl = `https://github.com/${config.owner}/${config.repo}.git`;

    await execCommand('git', [
      'clone',
      '--depth', '1',
      '--filter=blob:none',
      '--sparse',
      repoUrl,
      tempDir,
    ]);

    // Set up sparse checkout to only get the docs directory
    if (onProgress) onProgress('Setting up sparse checkout...');
    await execCommand('git', ['-C', tempDir, 'sparse-checkout', 'set', config.sourcePath]);

    // Find all markdown files
    if (onProgress) onProgress('Scanning for markdown files...');
    const sourcePath = join(tempDir, config.sourcePath);
    const files = await findMarkdownFiles(sourcePath, config.sourcePath);

    return files;
  } finally {
    // Cleanup temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Sync using git clone - downloads all files efficiently in one go
 */
export async function syncViaGitClone(
  config: SyncConfig,
  onProgress?: (message: string) => void
): Promise<{ files: GitHubFile[]; contents: Map<string, string> }> {
  const tempDir = join(tmpdir(), `quily-docs-sync-${Date.now()}`);
  const contents = new Map<string, string>();

  try {
    // Clone with depth 1 (only latest commit)
    if (onProgress) onProgress('Cloning repository (shallow)...');

    const repoUrl = `https://github.com/${config.owner}/${config.repo}.git`;

    await execCommand('git', [
      'clone',
      '--depth', '1',
      '--branch', config.branch,
      repoUrl,
      tempDir,
    ]);

    // Find all markdown files and read their contents
    if (onProgress) onProgress('Reading markdown files...');
    const sourcePath = join(tempDir, config.sourcePath);

    const files: GitHubFile[] = [];
    await walkDirectory(sourcePath, async (filePath) => {
      if (!filePath.endsWith('.md')) return;
      if (filePath.includes('/_')) return; // Skip underscore files

      const relativePath = relative(sourcePath, filePath);
      const fileName = relativePath.split(/[/\\]/).pop() || '';
      if (fileName.startsWith('_')) return;

      const content = await readFile(filePath, 'utf-8');
      const stats = await stat(filePath);

      // Compute SHA-like hash from content
      const sha = computeContentHash(content);

      files.push({
        name: fileName,
        path: relativePath.replace(/\\/g, '/'),
        sha: sha,
        size: stats.size,
        type: 'file',
        download_url: null,
      });

      contents.set(relativePath.replace(/\\/g, '/'), content);
    });

    return { files, contents };
  } finally {
    // Cleanup temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Execute a command and return promise
 */
function execCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'pipe', shell: true });

    let stderr = '';
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 * Recursively find all markdown files
 */
async function findMarkdownFiles(
  dir: string,
  basePath: string
): Promise<GitHubFile[]> {
  const files: GitHubFile[] = [];

  await walkDirectory(dir, async (filePath) => {
    if (!filePath.endsWith('.md')) return;

    const relativePath = relative(dir, filePath);
    const fileName = relativePath.split(/[/\\]/).pop() || '';

    // Skip underscore-prefixed files
    if (fileName.startsWith('_')) return;

    const stats = await stat(filePath);
    const content = await readFile(filePath, 'utf-8');

    files.push({
      name: fileName,
      path: relativePath.replace(/\\/g, '/'),
      sha: computeContentHash(content),
      size: stats.size,
      type: 'file',
      download_url: null,
    });
  });

  return files;
}

/**
 * Walk a directory recursively
 */
async function walkDirectory(
  dir: string,
  callback: (filePath: string) => Promise<void>
): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(fullPath, callback);
      } else if (entry.isFile()) {
        await callback(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}
