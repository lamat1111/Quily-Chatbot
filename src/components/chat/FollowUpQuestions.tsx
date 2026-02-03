'use client';

import { memo, useState, useCallback } from 'react';

interface FollowUpQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

/**
 * Displays follow-up question suggestions as clickable buttons.
 * Styled consistently with quick action buttons in MessageList.
 *
 * Features:
 * - Horizontal row with wrap for multiple questions
 * - Disables clicked button to prevent spam
 * - Memoized to prevent unnecessary re-renders
 */
export const FollowUpQuestions = memo(function FollowUpQuestions({
  questions,
  onSelect,
}: FollowUpQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const handleClick = useCallback(
    (question: string) => {
      if (selectedQuestion) return; // Already selected one
      setSelectedQuestion(question);
      onSelect(question);
    },
    [selectedQuestion, onSelect]
  );

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-base sm:text-sm text-text-muted mb-2">Follow-up questions:</p>
      <div className="flex flex-col gap-2">
        {questions.map((question, index) => {
          const isSelected = selectedQuestion === question;
          const isDisabled = selectedQuestion !== null;

          return (
            <button
              key={`followup-${index}`}
              onClick={() => handleClick(question)}
              disabled={isDisabled}
              className={`
                px-4 py-3 sm:py-2.5 min-h-11 sm:min-h-0 text-base sm:text-sm rounded-lg border transition-colors text-left
                ${
                  isSelected
                    ? 'bg-accent/10 border-accent text-accent cursor-default'
                    : isDisabled
                    ? 'border-border text-text-muted opacity-50 cursor-not-allowed'
                    : 'border-border hover:bg-hover hover:border-border-strong text-text-muted cursor-pointer'
                }
              `}
            >
              {question}
            </button>
          );
        })}
      </div>
    </div>
  );
});
