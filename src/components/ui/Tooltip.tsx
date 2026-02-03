'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

/**
 * Tooltip provider - wrap your app or component tree with this
 * to enable tooltips with shared delay settings.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Simple tooltip component for displaying hints on hover.
 *
 * Usage:
 * <Tooltip content="New chat">
 *   <button>+</button>
 * </Tooltip>
 */
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
}

export function Tooltip({
  children,
  content,
  side = 'right',
  sideOffset = 12,
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          className="
            z-50 px-3 py-1.5
            text-sm font-medium
            bg-bg-elevated text-text-base
            rounded-lg shadow-lg
            border border-border
            animate-in fade-in-0 zoom-in-95
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
          "
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
