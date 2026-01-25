'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for persisting state to localStorage with SSR hydration safety.
 * Syncs across components via custom events.
 *
 * @param key - localStorage key
 * @param initialValue - default value used during SSR and before hydration
 * @returns [value, setValue, isHydrated] tuple
 *
 * Usage:
 * ```typescript
 * const [theme, setTheme, isHydrated] = useLocalStorage('theme', 'dark');
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Initialize with initialValue for SSR consistency
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsHydrated(true);
  }, [key]);

  // Listen for changes from other components using the same key
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent<{ key: string; value: T }>) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('local-storage-change', handleStorageChange as EventListener);
    return () => {
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key]);

  // Memoized setter that syncs to localStorage and notifies other components
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch custom event to sync other hook instances
          window.dispatchEvent(
            new CustomEvent('local-storage-change', {
              detail: { key, value: valueToStore },
            })
          );
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue, isHydrated];
}
