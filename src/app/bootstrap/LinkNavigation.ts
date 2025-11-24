/**
 * LinkNavigation.ts
 * Pure TS navigation glue for PWA Factory Skeleton.
 * No JSX. No UI. Provides the two exports expected by AppBootstrap.ts:
 * - linkNavigation
 * - NavigationLink
 */

export interface NavigationLink {
  path: string;
  panel: 'left' | 'right' | 'none';
}

export interface NavigationOptions {
  rule?: 'open-left' | 'open-right' | 'close-all';
}

export function linkNavigation(path: string, options?: NavigationOptions): NavigationLink {
  return {
    path,
    panel: resolvePanelRule(options?.rule),
  };
}

export function resolvePanelRule(rule?: NavigationOptions['rule']): 'left' | 'right' | 'none' {
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
