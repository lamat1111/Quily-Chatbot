'use client';

import { useEffect, useRef, useCallback } from 'react';

/** Development mode flag for verbose logging */
const isDev = process.env.NODE_ENV === 'development';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          appearance?: 'always' | 'execute' | 'interaction-only';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    __turnstileScriptLoaded?: boolean;
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile widget component.
 * Renders invisibly and calls onVerify with the token when verification succeeds.
 * Token expires after 300 seconds (5 minutes).
 */
export function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const cleanupWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Widget may already be removed
      }
      widgetIdRef.current = null;
    }
    // Also clear any existing children in container (for HMR)
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    // Clean up any existing widget first (handles HMR and re-renders)
    cleanupWidget();

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          if (isDev) console.log('[Turnstile] Verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('[Turnstile] Widget error occurred');
          onError?.();
        },
        'expired-callback': () => {
          if (isDev) console.log('[Turnstile] Token expired');
          onExpire?.();
        },
        theme: 'auto',
        size: 'flexible',
        appearance: 'interaction-only',
      });
      if (isDev) console.log('[Turnstile] Widget rendered with ID:', widgetIdRef.current);
    } catch (err) {
      console.error('[Turnstile] Failed to render widget:', err);
    }
  }, [siteKey, onVerify, onError, onExpire, cleanupWidget]);

  useEffect(() => {
    if (!siteKey) {
      console.warn('[Turnstile] Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY');
      return;
    }

    // Check if script already loaded (globally tracked to survive HMR)
    if (window.turnstile && window.__turnstileScriptLoaded) {
      renderWidget();
      return cleanupWidget;
    }

    // Check if script element already exists
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkLoaded);
          window.__turnstileScriptLoaded = true;
          renderWidget();
        }
      }, 100);
      return () => {
        clearInterval(checkLoaded);
        cleanupWidget();
      };
    }

    // Load the Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
      if (isDev) console.log('[Turnstile] Script loaded');
      window.__turnstileScriptLoaded = true;
      // Small delay to ensure turnstile object is available
      setTimeout(renderWidget, 100);
    };
    script.onerror = () => {
      console.error('[Turnstile] Failed to load script');
    };
    document.head.appendChild(script);

    return cleanupWidget;
  }, [siteKey, renderWidget, cleanupWidget]);

  // Container for the invisible widget - must not use display:none
  // Using sr-only (screen-reader only) keeps it in the DOM but visually hidden
  return <div ref={containerRef} className="sr-only" />;
}
