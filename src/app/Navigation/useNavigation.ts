import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildNavigationMap, type ManifestNavigationSpecV2, type NavigationNode } from './NavigationMap';
import { createRouteResolver, type RouteMatch } from './RouteResolver';
import type { RouteId, PanelRule } from './routes';
import { useShellControllers } from '../Shell/ShellRoot';

export interface UseNavigationOptions {
  manifest?: ManifestNavigationSpecV2 | null;
  initialTarget?: RouteId | string;
}

export interface NavigateOptions {
  replace?: boolean;
  silent?: boolean;
  via?: 'click' | 'keyboard' | 'programmatic';
}

export interface NavigationAPI {
  map: NavigationNode[];
  activeRoute: RouteMatch;
  navigate: (target: RouteId | string, options?: NavigateOptions) => RouteMatch;
  resolve: (target: RouteId | string) => RouteMatch;
}

const getInitialPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location?.pathname ?? '/';
};

const emitShellEvent = (match: RouteMatch, options?: NavigateOptions) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('pwa-factory:navigation', {
      detail: {
        route: match.route,
        path: match.path,
        options,
      },
    }),
  );
};

const syncHistory = (match: RouteMatch, options?: NavigateOptions) => {
  if (typeof window === 'undefined' || !window.history) return;
  if (options?.replace) {
    window.history.replaceState({ routeId: match.route.id }, '', match.path);
  } else {
    window.history.pushState({ routeId: match.route.id }, '', match.path);
  }
};

const normalizePanelRules = (rules?: PanelRule[]) => {
  if (!rules || !rules.length) {
    return {
      left: undefined,
      right: undefined,
    };
  }
  return {
    left: rules.find((rule) => rule.target === 'left'),
    right: rules.find((rule) => rule.target === 'right'),
  };
};

export const useNavigation = (options?: UseNavigationOptions): NavigationAPI => {
  const controllers = useShellControllers();
  const map = useMemo(() => buildNavigationMap(options?.manifest ?? null), [options?.manifest]);
  const resolver = useMemo(() => createRouteResolver(map), [map]);
  const initialMatch = useMemo(
    () => resolver.resolve(options?.initialTarget ?? getInitialPath()),
    [resolver, options?.initialTarget],
  );
  const [activeRoute, setActiveRoute] = useState<RouteMatch>(initialMatch);

  const applyPanelRules = useCallback(
    (rules?: PanelRule[]) => {
      const normalized = normalizePanelRules(rules);
      (['left', 'right'] as const).forEach((position) => {
        const controller = controllers.panels[position];
        const rule = normalized[position];
        if (!rule) {
          controller.close();
          return;
        }
        const nextMode = rule.mode ?? controller.state.mode;
        if (controller.state.mode !== nextMode || controller.state.ariaLabel !== rule.label) {
          controller.configure({
            mode: nextMode,
            ariaLabel: rule.label ?? controller.state.ariaLabel,
          });
        }
        if (rule.defaultState === 'open') {
          controller.open();
        } else if (rule.defaultState === 'closed') {
          controller.close();
        }
      });
    },
    [controllers.panels],
  );

  useEffect(() => {
    applyPanelRules(activeRoute.route.panelRules);
  }, [activeRoute, applyPanelRules]);

  useEffect(() => {
    const handlePopState = () => {
      const match = resolver.resolve(getInitialPath());
      setActiveRoute(match);
      applyPanelRules(match.route.panelRules);
    };

    if (typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [resolver, applyPanelRules]);

  useEffect(() => {
    const nextMatch = resolver.resolve(activeRoute.route.id);
    setActiveRoute(nextMatch);
  }, [resolver]);

  const navigate = useCallback(
    (target: RouteId | string, navOptions?: NavigateOptions) => {
      const match = resolver.resolve(target);
      setActiveRoute(match);
      if (!navOptions?.silent) {
        syncHistory(match, navOptions);
        emitShellEvent(match, navOptions);
      }
      applyPanelRules(match.route.panelRules);
      return match;
    },
    [resolver, applyPanelRules],
  );

  const resolve = useCallback((target: RouteId | string) => resolver.resolve(target), [resolver]);

  return {
    map,
    activeRoute,
    navigate,
    resolve,
  };
};

