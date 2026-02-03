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

interface ParsedSource {
  title: string;
  docType: string | null;
  publishedDate: string | null;
}

/**
 * Parse the title field which contains encoded metadata
 * Format: "Title|doc_type|published_date" (pipe-separated)
 */
function parseSourceTitle(title: string | undefined): ParsedSource {
  if (!title) {
    return { title: 'Unknown source', docType: null, publishedDate: null };
  }
  const parts = title.split('|');
  return {
    title: parts[0] || 'Unknown source',
    docType: parts[1] || null,
    publishedDate: parts[2] || null,
  };
}

/**
 * Format date string for display: '2026-01-21' -> 'Jan 21, 2026'
 */
function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get display label for source based on metadata
 */
function getSourceLabel(
  url: string | null,
  docType: string | null,
  publishedDate: string | null
): string {
  const parts: string[] = [];

  // Determine type label
  if (docType === 'livestream_transcript') {
    // For livestreams, type is shown in title as "Livestream"
    // So just show the date
  } else if (docType) {
    // Format doc_type for display: 'some_type' -> 'Some Type'
    const typeLabel = docType
      .replace(/_transcript$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    parts.push(typeLabel);
  } else if (url?.includes('docs.quilibrium.com')) {
    parts.push('Official Docs');
  } else if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
    // Fallback for videos without doc_type
    parts.push('Video');
  }

  // Add formatted date if available
  const formattedDate = formatDate(publishedDate);
  if (formattedDate) {
    parts.push(formattedDate);
  }

  return parts.length > 0 ? parts.join(', ') : 'internal';
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
    <div className="text-base sm:text-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-accent hover:text-accent-hover font-medium flex items-center gap-2 sm:gap-1 cursor-pointer py-2 sm:py-0 min-h-11 sm:min-h-0"
      >
        <span>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
        <svg
          className="w-5 h-5 sm:w-4 sm:h-4 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
        <ul className="mt-1 space-y-0 pl-1">
          {sources.map((source, index) => {
            const parsed = parseSourceTitle(source.title);
            const sourceLabel = getSourceLabel(source.url, parsed.docType, parsed.publishedDate);
            const hasLink = source.url && source.url.length > 0;

            // For livestreams, display as "Livestream" link
            const displayTitle = parsed.docType === 'livestream_transcript'
              ? 'Livestream'
              : parsed.title;

            return (
              <li key={source.sourceId || index}>
                {hasLink ? (
                  <a
                    href={source.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-unstyled text-accent hover:text-accent-hover flex items-center gap-2 sm:gap-1 py-2.5 sm:py-1 min-h-11 sm:min-h-0"
                  >
                    <span className="text-gray-400 dark:text-gray-500 shrink-0">
                      [{index + 1}]
                    </span>
                    <span className="truncate max-w-md">
                      {displayTitle}
                    </span>
                    {sourceLabel && (
                      <span className="text-sm sm:text-xs text-gray-400 dark:text-gray-500 italic shrink-0">
                        ({sourceLabel})
                      </span>
                    )}
                    <svg
                      className="w-4 h-4 sm:w-3 sm:h-3 shrink-0"
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
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 sm:gap-1 py-2.5 sm:py-1 min-h-11 sm:min-h-0">
                    <span className="text-gray-400 dark:text-gray-500 shrink-0">
                      [{index + 1}]
                    </span>
                    <span className="truncate max-w-md">
                      {displayTitle}
                    </span>
                    {sourceLabel && (
                      <span className="text-sm sm:text-xs text-gray-400 dark:text-gray-500 italic">
                        ({sourceLabel})
                      </span>
                    )}
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
