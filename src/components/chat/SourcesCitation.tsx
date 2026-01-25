'use client';

import { useState } from 'react';

interface Source {
  sourceId: string;
  url: string;
  title?: string;
}

interface SourcesCitationProps {
  sources: Source[];
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
    <div className="border-t border-gray-300 dark:border-gray-700 pt-3 mt-3 text-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
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
        <ul className="mt-2 space-y-1">
          {sources.map((source, index) => (
            <li key={source.sourceId || index}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span className="text-gray-400 dark:text-gray-500">
                  [{index + 1}]
                </span>
                <span className="truncate max-w-md">
                  {source.title || source.url}
                </span>
                <svg
                  className="w-3 h-3 flex-shrink-0"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
