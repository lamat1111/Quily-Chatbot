/** Per-user daily issue creation counts */
const userIssueCounts = new Map<string, { count: number; date: string }>();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Check whether a user can create an issue today.
 * Trusted roles get a higher daily limit.
 */
export function checkIssueRateLimit(
  userId: string,
  memberRoleIds: string[],
): 'ok' | 'rate_limited' {
  const today = getTodayUTC();
  const entry = userIssueCounts.get(userId);
  const count = entry && entry.date === today ? entry.count : 0;

  const trustedRoleIds = (process.env.DISCORD_TRUSTED_ROLE_IDS || '').split(',').filter(Boolean);
  const isTrusted = memberRoleIds.some((id) => trustedRoleIds.includes(id));

  const limit = isTrusted
    ? parseInt(process.env.DISCORD_ISSUE_LIMIT_TRUSTED || '10', 10)
    : parseInt(process.env.DISCORD_ISSUE_LIMIT_DEFAULT || '2', 10);

  return count < limit ? 'ok' : 'rate_limited';
}

/**
 * Record that a user created an issue today.
 */
export function recordIssueCreation(userId: string): void {
  const today = getTodayUTC();
  const entry = userIssueCounts.get(userId);

  if (entry && entry.date === today) {
    entry.count++;
  } else {
    userIssueCounts.set(userId, { count: 1, date: today });
  }

  // Evict stale entries (older than today)
  for (const [id, e] of userIssueCounts) {
    if (e.date !== today) userIssueCounts.delete(id);
  }
}
