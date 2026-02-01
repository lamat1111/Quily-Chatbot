'use client';

import { Icon } from '@/src/components/ui/Icon';

export interface ThinkingStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed';
  icon?: 'search' | 'docs' | 'generate';
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isVisible: boolean;
}

/**
 * Simple thinking process indicator showing current status.
 * Displays the active step with an animated spinner.
 */
export function ThinkingProcess({ steps, isVisible }: ThinkingProcessProps) {
  if (!isVisible || steps.length === 0) {
    return null;
  }

  const activeStep = steps.find(s => s.status === 'active');

  // If no active step, don't show anything (all done or not started)
  if (!activeStep) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[95%] sm:max-w-[80%] bg-surface/10 dark:bg-surface/15 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Animated spinner */}
          <Icon name="loader" size={16} className="text-accent animate-spin shrink-0" />

          {/* Status label and description */}
          <div className="min-w-0">
            <span className="text-sm text-text-primary">{activeStep.label}</span>
            {activeStep.description && (
              <span className="text-sm text-text-muted ml-2">
                — {activeStep.description}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
