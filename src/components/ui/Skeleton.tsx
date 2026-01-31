interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element with pulse animation.
 * Use className to set dimensions and shape.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse bg-skeleton rounded ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton for message list - mimics chat message layout.
 * Shows alternating user/assistant message shapes.
 */
export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* User message skeleton */}
      <div className="flex justify-start">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>

      {/* Assistant message skeleton - multiple lines */}
      <div className="flex justify-start">
        <div className="space-y-2 max-w-[80%]">
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Another user message */}
      <div className="flex justify-start">
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* Another assistant response */}
      <div className="flex justify-start">
        <div className="space-y-2 max-w-[80%]">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for sidebar conversation list.
 */
export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for the main chat area during initial load.
 * Mimics the centered welcome state with title and quick action buttons.
 */
export function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-bg-base">
      {/* Welcome area skeleton - centered like the actual empty state */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Title skeleton */}
          <Skeleton className="h-8 w-40 mx-auto mb-2 rounded" />
          {/* Subtitle skeleton */}
          <Skeleton className="h-5 w-72 mx-auto mb-6 rounded" />
          {/* Quick action buttons skeleton */}
          <div className="flex flex-wrap justify-center gap-2">
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
