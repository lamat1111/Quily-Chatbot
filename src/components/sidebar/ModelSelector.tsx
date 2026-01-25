'use client';

import { RECOMMENDED_MODELS } from '@/src/lib/openrouter';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

/**
 * Model selection dropdown for OpenRouter models.
 *
 * Displays a curated list of recommended models with friendly names.
 */
export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="model-select"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Model
      </label>

      <div className="relative">
        <select
          id="model-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full px-3 py-2 pr-10 text-sm
            border border-gray-300 dark:border-gray-600 rounded-lg
            bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-accent
            cursor-pointer
            appearance-none
          "
        >
          {RECOMMENDED_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
