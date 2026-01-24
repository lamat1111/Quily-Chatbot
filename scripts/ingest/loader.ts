import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import type { LoadedDocument } from './types.js';

/**
 * Parse frontmatter from markdown content
 * Returns content without frontmatter and parsed frontmatter object
 */
function parseFrontmatter(content: string): {
  content: string;
  frontmatter: Record<string, unknown> | undefined;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { content, frontmatter: undefined };
  }

  // Simple YAML-like parsing (key: value pairs)
  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return {
    content: content.slice(match[0].length),
    frontmatter,
  };
}

/**
 * Load all markdown files from a directory
 * @param docsPath - Path to documentation directory
 * @returns Array of loaded documents with path and content
 */
export async function loadDocuments(docsPath: string): Promise<LoadedDocument[]> {
  // Find all markdown files recursively
  const pattern = join(docsPath, '**/*.md');
  const files = await glob(pattern, { nodir: true });

  if (files.length === 0) {
    throw new Error(`No markdown files found in ${docsPath}`);
  }

  const documents: LoadedDocument[] = [];

  for (const filePath of files) {
    const rawContent = await readFile(filePath, 'utf-8');
    const { content, frontmatter } = parseFrontmatter(rawContent);
    const relativePath = relative(docsPath, filePath);

    documents.push({
      path: relativePath,
      content,
      frontmatter,
    });
  }

  return documents;
}
