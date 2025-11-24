import { FALLBACK_ROUTE_ID, RouteId } from './routes';
import type { NavigationNode } from './NavigationMap';

export interface RouteMatch {
  route: NavigationNode;
  path: string;
  params: Record<string, string>;
}

const sanitizePath = (path: string): string => {
  if (!path) {
    return '/';
  }
  const normalized = path.split('?')[0].replace(/\/{2,}/g, '/');
  if (!normalized.startsWith('/')) {
    return `/${normalized}`;
  }
  return normalized.endsWith('/') && normalized !== '/' ? normalized.slice(0, -1) : normalized;
};

export class RouteResolver {
  private readonly byId = new Map<RouteId, NavigationNode>();
  private readonly byPath = new Map<string, NavigationNode>();
  private readonly fallbackRoute: NavigationNode;

  constructor(nodes: NavigationNode[]) {
    if (!nodes.length) {
      throw new Error('RouteResolver requires at least one route in de navigatieboom.');
    }
    this.index(nodes);
    this.fallbackRoute = this.byId.get(FALLBACK_ROUTE_ID) ?? nodes[0];
  }

  private index(nodes: NavigationNode[]) {
    const stack = [...nodes];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      this.byId.set(node.id, node);
      this.byPath.set(node.path, node);
      if (node.children?.length) {
        stack.push(...node.children);
      }
    }
  }

  resolve(target: RouteId | string): RouteMatch {
    if (target.startsWith('factory.')) {
      return this.fromId(target as RouteId);
    }
    return this.fromPath(target);
  }

  fromId(id: RouteId): RouteMatch {
    const route = this.byId.get(id) ?? this.fallbackRoute;
    return {
      route,
      path: route.path,
      params: {},
    };
  }

  fromPath(pathInput: string): RouteMatch {
    const path = sanitizePath(pathInput);
    const route = this.byPath.get(path) ?? this.fallbackRoute;
    return {
      route,
      path: route.path,
      params: {},
    };
  }
}

export const createRouteResolver = (nodes: NavigationNode[]) => new RouteResolver(nodes);

