/**
 * Client-side Chutes API Key Management
 *
 * Utilities for storing and retrieving external Chutes API keys in localStorage.
 * Uses "last action wins" logic: whichever auth method was set most recently is active.
 */

const STORAGE_KEY = 'chutes-external-api-key';
const AUTH_PREFERENCE_KEY = 'chutes-auth-preference';

export type ChutesAuthPreference = 'apiKey' | 'oauth' | null;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Get the stored external Chutes API key
 * @returns The API key or null if not set
 */
export function getChutesExternalApiKey(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store an external Chutes API key
 * @param key - The API key to store (should start with cpk_)
 */
export function setChutesExternalApiKey(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    console.warn('Failed to store Chutes API key in localStorage');
  }
}

/**
 * Remove the stored external Chutes API key
 */
export function removeChutesExternalApiKey(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn('Failed to remove Chutes API key from localStorage');
  }
}

/**
 * Validate Chutes API key format
 * Chutes API keys start with 'cpk_' prefix
 * @param key - The key to validate
 * @returns true if the key has valid format
 */
export function isValidChutesKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return key.startsWith('cpk_') && key.length > 10;
}

/**
 * Get a masked version of the API key for display
 * Shows only the last 6 characters
 * @param key - The full API key
 * @returns Masked key like "••••••abc123"
 */
export function getMaskedApiKey(key: string): string {
  if (!key || key.length < 6) return '••••••';
  return `••••••${key.slice(-6)}`;
}

/**
 * Get the current auth preference (which method was used most recently)
 * @returns 'apiKey' | 'oauth' | null
 */
export function getChutesAuthPreference(): ChutesAuthPreference {
  if (!isBrowser()) return null;
  try {
    const pref = localStorage.getItem(AUTH_PREFERENCE_KEY);
    if (pref === 'apiKey' || pref === 'oauth') {
      return pref;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the auth preference to indicate which method should be active
 * @param preference - 'apiKey' or 'oauth'
 */
export function setChutesAuthPreference(preference: ChutesAuthPreference): void {
  if (!isBrowser()) return;
  try {
    if (preference) {
      localStorage.setItem(AUTH_PREFERENCE_KEY, preference);
    } else {
      localStorage.removeItem(AUTH_PREFERENCE_KEY);
    }
  } catch {
    console.warn('Failed to store Chutes auth preference in localStorage');
  }
}

/**
 * Clear the auth preference (used during full logout)
 */
export function clearChutesAuthPreference(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(AUTH_PREFERENCE_KEY);
  } catch {
    console.warn('Failed to clear Chutes auth preference from localStorage');
  }
}
