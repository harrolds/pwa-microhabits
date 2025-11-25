import type { ComponentType } from 'react';

const routeModules = import.meta.glob('../modules/**/Route.tsx');

type RouteLoader = () => Promise<{ default: ComponentType }>;

export type RouteId = string;

export type RouteDefinition = {
  id: RouteId;
  path: string;
  title: string;
  loader: () => Promise<{ default: ComponentType }>;
};

const normalizeTitle = (id: string) => id.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const buildRoutePath = (id: string) => (id === 'dashboard' ? '/' : `/${id}`);

const buildDefinitions = (): RouteDefinition[] => {
  return (Object.entries(routeModules) as [string, RouteLoader][]).map(([key, loader]) => {
    const id = key.replace('../modules/', '').replace('/Route.tsx', '');
    return {
      id,
      path: buildRoutePath(id),
      title: normalizeTitle(id),
      loader,
    };
  });
};

const routeDefinitions = buildDefinitions();

const routeMap: Record<RouteId, RouteDefinition> = routeDefinitions.reduce(
  (acc, definition) => {
    acc[definition.id] = definition;
    return acc;
  },
  {} as Record<RouteId, RouteDefinition>,
);

export const getRouteDefinition = (routeId: RouteId) => routeMap[routeId];
export const listRoutes = () => routeDefinitions;

export const matchRouteByPath = (path: string): RouteDefinition => {
  const normalized =
    path === '/' ? '/' : path.replace(/\/+$/, '').replace(/\/{2,}/g, '/').toLowerCase();
  return (
    routeDefinitions.find((route) => route.path === normalized) ??
    routeDefinitions.find((route) => route.path === '/')!
  );
};

