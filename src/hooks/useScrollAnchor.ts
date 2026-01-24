'use client';

import { useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Hook for managing scroll behavior in chat interfaces.
 *
 * Returns refs and utilities for auto-scrolling to bottom when new messages arrive,
 * while respecting user scroll position.
 *
 * Usage:
 * ```tsx
 * const { scrollRef, anchorRef, isAtBottom, scrollToBottom } = useScrollAnchor();
 *
 * return (
 *   <div ref={scrollRef} className="overflow-y-auto">
 *     {messages.map(...)}
 *     <div ref={anchorRef} /> {/* Invisible anchor at bottom *\/}
 *   </div>
 * );
 * ```
 */
export function useScrollAnchor() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track if user is at the bottom of the scroll container
  const { ref: anchorRef, inView: isAtBottom } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 150px 0px', // Consider "at bottom" if within 150px
  });

  // Scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // Scroll to bottom immediately (no animation)
  const scrollToBottomImmediate = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return {
    scrollRef,
    anchorRef,
    isAtBottom,
    scrollToBottom,
    scrollToBottomImmediate,
  };
}
