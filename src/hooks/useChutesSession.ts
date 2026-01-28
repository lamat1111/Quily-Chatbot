/**
 * Chutes Session Hook
 *
 * React hook for managing Chutes OAuth session state on the client.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

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

type UseChutesSessionReturn = {
  /** Whether the user is currently signed in */
  isSignedIn: boolean;
  /** The authenticated user's profile, if signed in */
  user: ChutesUser | null | undefined;
  /** Whether the session is currently being loaded */
  loading: boolean;
  /** URL to redirect users to for login */
  loginUrl: string;
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

  /**
   * Fetch the current session state from the server.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/chutes/session', {
        cache: 'no-store',
      });
      if (!res.ok) {
        setSession({ signedIn: false });
      } else {
        const data = (await res.json()) as ChutesSession;
        setSession({ signedIn: Boolean(data.signedIn), user: data.user });
      }
    } catch {
      setSession({ signedIn: false });
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

  // Load session on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isSignedIn: session.signedIn,
    user: session.user,
    loading,
    loginUrl: '/api/auth/chutes/login',
    refresh,
    logout,
  };
}
