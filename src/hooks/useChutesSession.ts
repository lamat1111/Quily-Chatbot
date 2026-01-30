/**
 * Chutes Session Hook
 *
 * React hook for managing Chutes OAuth session state on the client.
 * Supports both OAuth and external API key authentication methods.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getChutesExternalApiKey,
  getChutesAuthPreference,
  setChutesAuthPreference,
  type ChutesAuthPreference,
} from '@/src/lib/chutesApiKey';

// ============================================================================
// Types
// ============================================================================

export type ChutesUser = {
  sub?: string;
  username?: string;
  email?: string;
  name?: string;
  created_at?: string;
  [key: string]: unknown;
};

type ChutesSession = {
  signedIn: boolean;
  user?: ChutesUser | null;
};

/** Reason why Chutes is unavailable */
type ChutesUnavailableReason = 'disabled' | 'not_configured' | null;

/** Which authentication method is currently active */
type ChutesAuthMethod = 'oauth' | 'apiKey' | null;

type UseChutesSessionReturn = {
  /** Whether the user is currently signed in (via OAuth or API key) */
  isSignedIn: boolean;
  /** The authenticated user's profile, if signed in via OAuth */
  user: ChutesUser | null | undefined;
  /** Whether the session is currently being loaded */
  loading: boolean;
  /** URL to redirect users to for login */
  loginUrl: string;
  /** Whether Chutes OAuth is configured and enabled on the server */
  isAvailable: boolean;
  /** Reason why Chutes is unavailable: 'disabled' | 'not_configured' | null */
  unavailableReason: ChutesUnavailableReason;
  /** Message explaining why Chutes is unavailable */
  unavailableMessage: string | null;
  /** Which auth method is currently active: 'oauth' | 'apiKey' | null */
  authMethod: ChutesAuthMethod;
  /** Whether both OAuth and API key are available (user can choose) */
  hasBothMethods: boolean;
  /** Whether OAuth session exists (independent of which is active) */
  hasOAuthSession: boolean;
  /** Whether API key exists (independent of which is active) */
  hasApiKey: boolean;
  /** Function to switch the active auth method (only works when both exist) */
  setActiveMethod: (method: 'oauth' | 'apiKey') => void;
  /** Function to refresh the session state */
  refresh: () => Promise<void>;
  /** Function to log out the current user */
  logout: () => Promise<void>;
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useChutesSession(): UseChutesSessionReturn {
  const [session, setSession] = useState<ChutesSession>({ signedIn: false });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [unavailableReason, setUnavailableReason] = useState<ChutesUnavailableReason>(null);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<ChutesAuthMethod>(null);
  const [hasOAuthSession, setHasOAuthSession] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  /**
   * Fetch the current session state from the server.
   * Simple logic:
   * - If only API key exists → use API key
   * - If only OAuth exists → use OAuth
   * - If both exist → use the user's preference (stored in localStorage)
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const externalApiKey = getChutesExternalApiKey();
      setHasApiKey(Boolean(externalApiKey));

      // Always check OAuth session to know if it exists
      let oauthValid = false;
      let oauthUser: ChutesUser | null = null;

      try {
        const res = await fetch('/api/auth/chutes/session', {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = (await res.json()) as ChutesSession;
          oauthValid = Boolean(data.signedIn);
          oauthUser = data.user || null;
        }
      } catch {
        // OAuth check failed, continue
      }

      setHasOAuthSession(oauthValid);

      // Determine which method to use
      const hasBoth = Boolean(externalApiKey) && oauthValid;

      if (hasBoth) {
        // Both exist - use preference, default to OAuth
        const preference = getChutesAuthPreference();
        if (preference === 'apiKey') {
          setSession({ signedIn: true });
          setAuthMethod('apiKey');
        } else {
          setSession({ signedIn: true, user: oauthUser });
          setAuthMethod('oauth');
        }
      } else if (oauthValid) {
        // Only OAuth exists
        setSession({ signedIn: true, user: oauthUser });
        setAuthMethod('oauth');
      } else if (externalApiKey) {
        // Only API key exists
        setSession({ signedIn: true });
        setAuthMethod('apiKey');
      } else {
        // No auth at all
        setSession({ signedIn: false });
        setAuthMethod(null);
      }
    } catch {
      // On error, try API key fallback
      const externalApiKey = getChutesExternalApiKey();
      if (externalApiKey) {
        setSession({ signedIn: true });
        setAuthMethod('apiKey');
        setHasApiKey(true);
      } else {
        setSession({ signedIn: false });
        setAuthMethod(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Switch the active auth method (only meaningful when both methods exist)
   */
  const setActiveMethod = useCallback((method: 'oauth' | 'apiKey') => {
    setChutesAuthPreference(method);
    refresh();
  }, [refresh]);

  /**
   * Log out the current user and refresh session state.
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/chutes/logout', { method: 'POST' });
    } finally {
      await refresh();
    }
  }, [refresh]);

  // Check if Chutes OAuth is enabled and configured
  useEffect(() => {
    async function checkAvailability() {
      try {
        const res = await fetch('/api/auth/chutes/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsAvailable(data.available);
          setUnavailableReason(data.reason === 'ready' ? null : data.reason);
          setUnavailableMessage(data.message || null);
        }
      } catch {
        // If we can't check, assume available and let login fail naturally
        setIsAvailable(true);
        setUnavailableReason(null);
      }
    }
    checkAvailability();
  }, []);

  // Load session on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isSignedIn: session.signedIn,
    user: session.user,
    loading,
    loginUrl: '/api/auth/chutes/login',
    isAvailable,
    unavailableReason,
    unavailableMessage,
    authMethod,
    hasBothMethods: hasOAuthSession && hasApiKey,
    hasOAuthSession,
    hasApiKey,
    setActiveMethod,
    refresh,
    logout,
  };
}
