import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getRouteDefinition, listRoutes, matchRouteByPath, RouteDefinition, RouteId } from './routes';

type LoadedRoute = {
  definition: RouteDefinition;
  component: ComponentType | null;
};

export const useNavigation = () => {
  const [current, setCurrent] = useState<LoadedRoute>(() => ({
    definition: matchRouteByPath(window.location.pathname),
    component: null,
  }));

  useEffect(() => {
    let active = true;
    current.definition.loader().then((module) => {
      if (active) {
        setCurrent((prev) => ({
          ...prev,
          component: module.default,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [current.definition]);

  useEffect(() => {
    const handler = () => {
      setCurrent({
        definition: matchRouteByPath(window.location.pathname),
        component: null,
      });
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const goTo = (routeId: RouteId) => {
    const definition = getRouteDefinition(routeId);
    window.history.pushState({ routeId }, definition.title, definition.path);
    setCurrent({
      definition,
      component: null,
    });
  };

  return {
    current: current.definition,
    CurrentComponent: current.component,
    goTo,
    routes: useMemo(() => listRoutes(), []),
  };
};

