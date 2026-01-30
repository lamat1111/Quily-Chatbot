/**
 * Get the time group for a given timestamp.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time group: "Today", "Past 7 days", "Past 30 days", or "Older"
 */
export function getTimeGroup(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const DAY = 24 * 60 * 60 * 1000;

  // Check if same calendar day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timestampDate = new Date(timestamp);
  timestampDate.setHours(0, 0, 0, 0);

  if (timestampDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (diff < 7 * DAY) {
    return 'Past 7 days';
  }

  if (diff < 30 * DAY) {
    return 'Past 30 days';
  }

  return 'Older';
}
