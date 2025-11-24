import React, { useEffect, useMemo, useState } from 'react';
import type { ShellControllers } from '../Shell/ShellRoot';
import { buildNavigationMap, type ManifestNavigationSpecV2, type NavigationNode } from '../Navigation/NavigationMap';
import { createRouteResolver, type RouteMatch } from '../Navigation/RouteResolver';
import type { PanelRule, RouteId } from '../Navigation/routes';
import { FALLBACK_ROUTE_ID } from '../Navigation/routes';
import type { StateMachine } from '../StateMachine/dispatch';

export interface LinkNavigationOptions {
  stateMachine: StateMachine;
  manifest?: ManifestNavigationSpecV2 | null;
  initialRoute?: RouteId | string;
}

export interface NavigationLink {
  map: NavigationNode[];
  navigate: (target: RouteId | string, options?: { replace?: boolean; silent?: boolean }) => RouteMatch;
  getActiveRoute: () => RouteId;
  subscribe: (listener: (routeId: RouteId) => void) => () => void;
  attachShell: (controllers: ShellControllers) => void;
  dispose: () => void;
}

const normalizePanelRules = (rules?: PanelRule[]) => {
  if (!rules?.length) {
    return {};
  }
  return {
    left: rules.find((rule) => rule.target === 'left'),
    right: rules.find((rule) => rule.target === 'right'),
  };
};

const syncHistory = (match: RouteMatch, options?: { replace?: boolean }) => {
  if (typeof window === 'undefined' || !window.history) {
    return;
  }
  if (options?.replace) {
    window.history.replaceState({ routeId: match.route.id }, '', match.path);
  } else {
    window.history.pushState({ routeId: match.route.id }, '', match.path);
  }
};

const readLocation = () => {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location?.pathname ?? '/';
};

export const linkNavigation = (options: LinkNavigationOptions): NavigationLink => {
  const map = buildNavigationMap(options.manifest ?? null);
  const resolver = createRouteResolver(map);
  let shell: ShellControllers | undefined;

  const listeners = new Set<(routeId: RouteId) => void>();
  let activeMatch = resolver.resolve(options.initialRoute ?? readLocation() ?? FALLBACK_ROUTE_ID);

  const notify = () => {
    listeners.forEach((listener) => listener(activeMatch.route.id));
  };

  const applyPanelRules = (match: RouteMatch) => {
    if (!shell) {
      return;
    }
    const normalized = normalizePanelRules(match.route.panelRules);
    (['left', 'right'] as const).forEach((position) => {
      const controller = shell?.panels[position];
      if (!controller) {
        return;
      }
      const rule = normalized[position];
      if (!rule) {
        controller.close();
        return;
      }
      controller.configure({
        mode: rule.mode ?? controller.state.mode,
        ariaLabel: rule.label ?? controller.state.ariaLabel,
      });
      if (rule.defaultState === 'open') {
        controller.open();
      } else if (rule.defaultState === 'closed') {
        controller.close();
      }
    });
  };

  const resolveAndDispatch = async (match: RouteMatch, silent?: boolean, replace?: boolean) => {
    activeMatch = match;
    await options.stateMachine.dispatch({
      type: 'NAVIGATION/SET_PENDING',
      payload: { routeId: match.route.id },
    });
    await options.stateMachine.dispatch({
      type: 'NAVIGATION/RESOLVE_ROUTE',
      payload: { routeId: match.route.id },
    });
    if (!silent) {
      syncHistory(match, { replace });
      console.info(`[Navigation Blueprint v2.0] route -> ${match.route.id}`);
    }
    applyPanelRules(match);
    notify();
  };

  const navigate: NavigationLink['navigate'] = (target, navOptions) => {
    const match = resolver.resolve(target);
    void resolveAndDispatch(match, navOptions?.silent, navOptions?.replace);
    return match;
  };

  const handlePopState = () => {
    const nextMatch = resolver.resolve(readLocation());
    void resolveAndDispatch(nextMatch, true, true);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
  }

  void resolveAndDispatch(activeMatch, true, true);

  console.info('[Navigation Blueprint v2.0] gekoppeld');

  return {
    map,
    navigate,
    getActiveRoute: () => activeMatch.route.id,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(activeMatch.route.id);
      return () => listeners.delete(listener);
    },
    attachShell: (controllers) => {
      shell = controllers;
      applyPanelRules(activeMatch);
    },
    dispose: () => {
      listeners.clear();
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    },
  };
};

interface FlattenedNode {
  node: NavigationNode;
  depth: number;
}

const flattenMap = (nodes: NavigationNode[], depth = 0): FlattenedNode[] => {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children?.length ? flattenMap(node.children, depth + 1) : []),
  ]);
};

export const NavigationBlueprintPanel: React.FC<{ link: NavigationLink }> = ({ link }) => {
  const [activeRoute, setActiveRoute] = useState<RouteId>(link.getActiveRoute());

  useEffect(() => link.subscribe(setActiveRoute), [link]);

  const items = useMemo(() => flattenMap(link.map), [link.map]);

  const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  };

  const buttonStyle = (depth: number, isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: isActive ? 'rgba(79, 122, 254, 0.18)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(79, 122, 254, 0.65)' : 'rgba(255,255,255,0.05)'}`,
    borderRadius: 12,
    padding: '10px 14px',
    color: '#F5F7FF',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background 0.2s ease',
    marginLeft: depth * 8,
  });

  return (
    <nav style={navStyle} aria-label="Navigation blueprint">
      {items.map(({ node, depth }) => {
        const isActive = node.id === activeRoute;
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => link.navigate(node.id)}
            style={buttonStyle(depth, isActive)}
          >
            <span>{node.label}</span>
            <span style={{ fontSize: 12, opacity: 0.72 }}>{node.category}</span>
          </button>
        );
      })}
    </nav>
  );
};


