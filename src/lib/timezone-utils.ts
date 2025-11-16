/**
 * Server-side timezone utilities for daily usage tracking
 * All date calculations use the user's stored timezone (set once on signup, locked)
 */

/**
 * Get the current date string (YYYY-MM-DD) in the user's timezone
 * This is used as the key for DailyUsage records
 */
export function getUserDateString(userTimezone: string = 'UTC'): string {
  const now = new Date();
  
  // Format the current date in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD format
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(now);
}

/**
 * Get a Date object for the user's current date (midnight in their timezone)
 * Used for database date comparisons
 */
export function getUserDate(userTimezone: string = 'UTC'): Date {
  const dateString = getUserDateString(userTimezone);
  // Parse YYYY-MM-DD and create a date at midnight UTC
  // We store dates as UTC midnight, but the date value represents their local date
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Get the next reset time (midnight) in the user's timezone
 * Returns an ISO string that can be used for countdown calculations
 */
export function getNextResetTime(userTimezone: string = 'UTC'): string {
  const now = new Date();
  
  // Get current time components in user's timezone
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const timeParts = timeFormatter.formatToParts(now);
  const currentHour = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0');
  const currentMinute = parseInt(timeParts.find(p => p.type === 'minute')?.value || '0');
  const currentSecond = parseInt(timeParts.find(p => p.type === 'second')?.value || '0');
  const currentMs = now.getMilliseconds();
  
  // Calculate total milliseconds elapsed today in user's timezone
  const msElapsedToday = 
    (currentHour * 60 * 60 * 1000) +
    (currentMinute * 60 * 1000) +
    (currentSecond * 1000) +
    currentMs;
  
  // Calculate milliseconds until next midnight
  const msInDay = 24 * 60 * 60 * 1000;
  const msUntilMidnight = msInDay - msElapsedToday;
  
  // Add to current time to get next midnight
  const nextMidnight = new Date(now.getTime() + msUntilMidnight);
  
  return nextMidnight.toISOString();
}

/**
 * Detect timezone from browser (client-side only)
 * Returns IANA timezone string (e.g., "America/New_York")
 */
export function detectTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC'; // Server-side fallback
  }
  
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC';
  }
}

