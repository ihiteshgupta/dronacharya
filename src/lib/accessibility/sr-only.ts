/**
 * Screen Reader Only Utilities
 *
 * Utilities for creating accessible, screen-reader-friendly content
 */

/**
 * Generate screen reader announcement for dynamic content updates
 */
export function createSRLiveRegion(id: string, politeness: 'polite' | 'assertive' = 'polite'): HTMLDivElement {
  const existing = document.getElementById(id);
  if (existing) {
    return existing as HTMLDivElement;
  }

  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);

  return region;
}

/**
 * Announce message to screen readers
 */
export function announceToSR(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  const regionId = `sr-live-${politeness}`;
  const region = createSRLiveRegion(regionId, politeness);

  // Clear and announce
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 100);
}

/**
 * Generate accessible label for icon-only buttons
 */
export function iconButtonLabel(action: string, context?: string): string {
  return context ? `${action} ${context}` : action;
}

/**
 * Format count for screen readers (e.g., notifications)
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  if (count === 0) return `No ${plural || singular}`;
  if (count === 1) return `1 ${singular}`;
  return `${count > 99 ? '99+' : count} ${plural || singular}`;
}

/**
 * Generate loading state announcement
 */
export function loadingAnnouncement(isLoading: boolean, context?: string): string | undefined {
  if (!isLoading) return undefined;
  return context ? `Loading ${context}` : 'Loading';
}

/**
 * Create accessible error message
 */
export function errorAnnouncement(error: string | null | undefined): string | undefined {
  if (!error) return undefined;
  return `Error: ${error}`;
}

/**
 * Format XP/points for screen readers
 */
export function formatXPForSR(xp: number): string {
  return `${xp.toLocaleString()} experience points`;
}

/**
 * Format streak for screen readers
 */
export function formatStreakForSR(streak: number): string {
  const suffix = streak === 1 ? 'day' : 'days';
  return `${streak} ${suffix} learning streak`;
}

/**
 * Format level for screen readers
 */
export function formatLevelForSR(level: number, progress?: number): string {
  if (progress !== undefined) {
    return `Level ${level}, ${Math.round(progress)}% progress to next level`;
  }
  return `Level ${level}`;
}
