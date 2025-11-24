/**
 * LinkNavigation.ts
 * Clean bootstrap-level navigation helpers for panel routing.
 * No JSX. No UI. Pure logic. Fully TS-safe.
 */

export type PanelTarget = 'left' | 'right' | 'none';
export type PanelRule = 'open-left' | 'open-right' | 'close-all';

export interface NavigationAction {
  path: string;
  panel: PanelTarget;
}

/**
 * Determine which panel should open based on a route pattern.
 */
export function resolvePanelRule(rule: PanelRule | undefined): PanelTarget {
  switch (rule) {
    case 'open-left':
      return 'left';
    case 'open-right':
      return 'right';
    case 'close-all':
    default:
      return 'none';
  }
}

/**
 * Basic route navigation merger.
 * In a real app this will integrate with your router (React Router / TanStack).
 */
export function navigateTo(
  path: string,
  rule?: PanelRule
): NavigationAction {
  return {
    path,
    panel: resolvePanelRule(rule),
  };
}

/**
 * Returns true if the given path matches the current location.
 * Placeholder only — replace with router integration later.
 */
export function isActive(current: string, target: string): boolean {
  return current === target;
}
