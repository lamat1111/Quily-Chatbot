/**
 * Chutes Session Hook
 *
 * React hook for managing Chutes OAuth session state on the client.
 * Supports both OAuth and external API key authentication methods.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { getChutesExternalApiKey } from '@/src/lib/chutesApiKey';

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
  /** The authenticated user's profile, if signed in */
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
  /** Which auth method is active: 'oauth' | 'apiKey' | null */
  authMethod: ChutesAuthMethod;
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

  /**
   * Fetch the current session state from the server.
   * Checks for external API key first (takes priority over OAuth).
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Check for external API key first (it takes priority)
      const externalApiKey = getChutesExternalApiKey();
      if (externalApiKey) {
        setSession({ signedIn: true });
        setAuthMethod('apiKey');
        setLoading(false);
        return;
      }

      // Fall back to OAuth session check
      const res = await fetch('/api/auth/chutes/session', {
        cache: 'no-store',
      });
      if (!res.ok) {
        setSession({ signedIn: false });
        setAuthMethod(null);
      } else {
        const data = (await res.json()) as ChutesSession;
        setSession({ signedIn: Boolean(data.signedIn), user: data.user });
        setAuthMethod(data.signedIn ? 'oauth' : null);
      }
    } catch {
      setSession({ signedIn: false });
      setAuthMethod(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
    refresh,
    logout,
  };
}
