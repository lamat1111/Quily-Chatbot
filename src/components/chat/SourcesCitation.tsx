'use client';

import { useState } from 'react';

interface Source {
  sourceId: string;
  url: string | null;
  title?: string;
}

interface SourcesCitationProps {
  sources: Source[];
}

/**
 * Determine the source type based on URL
 */
function getSourceType(url: string | null): 'video' | 'docs' | 'internal' {
  if (!url) return 'internal';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('docs.quilibrium.com')) return 'docs';
  return 'internal';
}

/**
 * Get display label for source type
 */
function getSourceLabel(type: 'video' | 'docs' | 'internal'): string {
  switch (type) {
    case 'video':
      return 'video';
    case 'docs':
      return 'official docs';
    case 'internal':
      return 'internal';
  }
}

/**
 * Expandable citation footer for message sources.
 *
 * Displays a clickable "N sources" text that toggles
 * an expanded list of source links.
 */
export function SourcesCitation({ sources }: SourcesCitationProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 cursor-pointer"
      >
        <span>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <ul className="mt-2 space-y-1 pl-1">
          {sources.map((source, index) => {
            const sourceType = getSourceType(source.url);
            const sourceLabel = getSourceLabel(sourceType);
            const hasLink = source.url && source.url.length > 0;

            return (
              <li key={source.sourceId || index}>
                {hasLink ? (
                  <a
                    href={source.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1"
                  >
                    <span className="text-gray-400 dark:text-gray-500">
                      [{index + 1}]
                    </span>
                    <span className="truncate max-w-md">
                      {source.title || source.url}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic shrink-0">
                      ({sourceLabel})
                    </span>
                    <svg
                      className="w-3 h-3 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-gray-400 dark:text-gray-500">
                      [{index + 1}]
                    </span>
                    <span className="truncate max-w-md">
                      {source.title || 'Local document'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      ({sourceLabel})
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
