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
        className="block text-sm font-medium text-gray-700"
      >
        Model
      </label>

      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3 py-2 text-sm
          border border-gray-300 rounded-lg
          bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          cursor-pointer
        "
      >
        {RECOMMENDED_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
