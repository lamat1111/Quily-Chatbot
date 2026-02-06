'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

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
          'refresh-expired'?: 'auto' | 'manual' | 'never';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    __turnstileLoaded?: boolean;
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile widget component.
 *
 * Uses 'interaction-only' appearance:
 * - Normal users: Verification happens automatically in background, callback fires immediately
 * - Suspicious users (VPN, etc): Checkbox appears, callback fires after they complete it
 *
 * The widget is positioned at the bottom of the chat area and only visible when
 * Cloudflare requires user interaction.
 */
export function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // Already rendered

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          console.log('[Turnstile] Verification successful');
          setIsVisible(false); // Hide widget after success
          onVerify(token);
        },
        'error-callback': () => {
          console.error('[Turnstile] Widget error');
          onError?.();
        },
        'expired-callback': () => {
          console.log('[Turnstile] Token expired');
          setIsVisible(true); // Show widget again if token expires
          onExpire?.();
        },
        theme: 'auto',
        size: 'normal',
        appearance: 'interaction-only',
        'refresh-expired': 'auto',
      });
      console.log('[Turnstile] Widget rendered:', widgetIdRef.current);
    } catch (err) {
      console.error('[Turnstile] Render failed:', err);
    }
  }, [siteKey, onVerify, onError, onExpire]);

  useEffect(() => {
    if (!siteKey) {
      console.warn('[Turnstile] No site key configured');
      // No site key = no protection needed, call onVerify with empty token
      // Server will skip verification if TURNSTILE_SECRET_KEY is also missing
      onVerify('');
      setIsVisible(false);
      return;
    }

    // Script already loaded
    if (window.turnstile && window.__turnstileLoaded) {
      renderWidget();
      return;
    }

    // Script element already exists (e.g., from previous mount)
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkReady);
          window.__turnstileLoaded = true;
          renderWidget();
        }
      }, 50);
      return () => clearInterval(checkReady);
    }

    // Load script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
      window.__turnstileLoaded = true;
      setTimeout(renderWidget, 50);
    };
    script.onerror = () => {
      console.error('[Turnstile] Failed to load script');
      // On script load failure, allow through (fail open for UX)
      onVerify('');
      setIsVisible(false);
    };
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget, onVerify]);

  // Don't render anything if not visible or no site key
  if (!isVisible || !siteKey) {
    return null;
  }

  // Position at bottom center of chat area
  return (
    <div
      ref={containerRef}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50"
      aria-label="Security verification"
    />
  );
}
