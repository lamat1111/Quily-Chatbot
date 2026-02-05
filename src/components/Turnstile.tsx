'use client';

import { useEffect, useRef, useCallback } from 'react';

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
          size?: 'normal' | 'compact' | 'invisible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
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
  const scriptLoadedRef = useRef(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // Already rendered

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme: 'auto',
      size: 'invisible', // Runs in background, no visible widget
    });
  }, [siteKey, onVerify, onError, onExpire]);

  useEffect(() => {
    if (!siteKey) {
      console.warn('[Turnstile] Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY');
      return;
    }

    // Check if script already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script is already being loaded
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    // Load the Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
      // Small delay to ensure turnstile object is available
      setTimeout(renderWidget, 100);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget]);

  // Hidden container for the widget
  return <div ref={containerRef} className="hidden" />;
}
