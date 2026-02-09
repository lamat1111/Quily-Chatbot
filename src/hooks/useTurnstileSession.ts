'use client';

import { useEffect, useState } from 'react';

/**
 * Checks if the user already has a verified Turnstile session cookie.
 *
 * The turnstile_verified cookie is HttpOnly, so the client can't read it
 * directly. This hook calls a lightweight server endpoint to check.
 *
 * When the cookie exists, the Turnstile widget can be skipped entirely,
 * avoiding repeated Cloudflare challenges on page reload.
 */
export function useTurnstileSession(): { verified: boolean; loading: boolean } {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No site key = Turnstile disabled, no need to check
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch('/api/auth/turnstile/status', { cache: 'no-store' });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setVerified(Boolean(data.verified));
        }
      } catch {
        // On error, assume not verified — Turnstile widget will handle it
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { verified, loading };
}
