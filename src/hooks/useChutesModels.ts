/**
 * Client hook for loading Chutes models from server API.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export type ChutesModelOption = {
  id: string;
  name: string;
  description?: string;
  template?: string | null;
  slug?: string;
  chuteId?: string;
  isOpenSource?: boolean;
  isRecommended?: boolean;
};

type UseChutesModelsResult = {
  models: ChutesModelOption[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useChutesModels(
  type: 'llm' | 'embedding' = 'llm',
  enabled: boolean = true
): UseChutesModelsResult {
  const [models, setModels] = useState<ChutesModelOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chutes/models?type=${encodeURIComponent(type)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data?.error || `Failed to load Chutes models (${res.status})`;
        setError(message);
        setModels([]);
      } else {
        const data = await res.json();
        setModels(Array.isArray(data.models) ? data.models : []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Chutes models';
      setError(message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { models, loading, error, refresh };
}
