const PER_USER_COOLDOWN_MS = 15_000;
const userLastRequest = new Map<string, number>();
let dailyCount = 0;
let dailyResetDate = getTodayUTC();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function resetDailyIfNeeded(): void {
  const today = getTodayUTC();
  if (today !== dailyResetDate) {
    dailyCount = 0;
    dailyResetDate = today;
  }
}

export function checkRateLimit(userId: string): 'ok' | 'user_cooldown' | 'daily_cap' {
  resetDailyIfNeeded();
  const dailyLimit = parseInt(process.env.DISCORD_DAILY_LIMIT || '200', 10);
  if (dailyCount >= dailyLimit) return 'daily_cap';
  const now = Date.now();
  const lastRequest = userLastRequest.get(userId);
  if (lastRequest && now - lastRequest < PER_USER_COOLDOWN_MS) return 'user_cooldown';
  return 'ok';
}

export function recordRequest(userId: string): void {
  resetDailyIfNeeded();
  userLastRequest.set(userId, Date.now());
  dailyCount++;
  const now = Date.now();
  for (const [id, timestamp] of userLastRequest) {
    if (now - timestamp > PER_USER_COOLDOWN_MS * 2) userLastRequest.delete(id);
  }
}
