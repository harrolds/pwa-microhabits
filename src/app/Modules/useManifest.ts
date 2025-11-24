import { useCallback, useMemo } from 'react';
import manifestJson from './module-manifest.json';
import type {
  ModuleDescriptor,
  ModuleId,
  ModuleManifestV2,
  RouteBindingDescriptor,
  WidgetDescriptor,
  WidgetKey,
} from './ModuleLoader';
import type { ManifestNavigationSpecV2 } from '../Navigation/NavigationMap';
import type { RouteId } from '../Navigation/routes';

const manifest = manifestJson as ModuleManifestV2;

export interface ManifestAccessResult<
  TModule extends ModuleId = ModuleId,
  TWidget extends WidgetKey = WidgetKey,
> {
  manifest: ModuleManifestV2;
  navigationSpec: ManifestNavigationSpecV2;
  getModule: (moduleId: TModule) => ModuleDescriptor | undefined;
  getWidget: (widgetKey: TWidget) => WidgetDescriptor | undefined;
  getRouteBinding: (routeId: RouteId) => RouteBindingDescriptor | undefined;
  getModulesForRoute: (routeId: RouteId) => ModuleDescriptor[];
  getWidgetsForRoute: (routeId: RouteId) => WidgetDescriptor[];
  listModules: () => ModuleDescriptor[];
  listWidgets: () => WidgetDescriptor[];
}

export const useManifest = <
  TModule extends ModuleId = ModuleId,
  TWidget extends WidgetKey = WidgetKey,
>(): ManifestAccessResult<TModule, TWidget> => {
  const moduleMap = useMemo(
    () => new Map<TModule, ModuleDescriptor>(manifest.registry.modules.map((entry) => [entry.id as TModule, entry])),
    [],
  );
  const widgetMap = useMemo(
    () => new Map<TWidget, WidgetDescriptor>(manifest.registry.widgets.map((entry) => [entry.key as TWidget, entry])),
    [],
  );
  const bindingMap = useMemo(
    () => new Map<RouteId, RouteBindingDescriptor>(manifest.integration.routes.map((binding) => [binding.routeId, binding])),
    [],
  );

  const getModule = useCallback((moduleId: TModule) => moduleMap.get(moduleId), [moduleMap]);
  const getWidget = useCallback((widgetKey: TWidget) => widgetMap.get(widgetKey), [widgetMap]);
  const getRouteBinding = useCallback((routeId: RouteId) => bindingMap.get(routeId), [bindingMap]);

  const getModulesForRoute = useCallback(
    (routeId: RouteId) => {
      const binding = bindingMap.get(routeId);
      if (!binding) {
        return [];
      }
      return binding.modules
        .map((moduleId) => moduleMap.get(moduleId as TModule))
        .filter((value): value is ModuleDescriptor => Boolean(value));
    },
    [bindingMap, moduleMap],
  );

  const getWidgetsForRoute = useCallback(
    (routeId: RouteId) => {
      const binding = bindingMap.get(routeId);
      if (!binding?.widgets?.length) {
        return [];
      }
      return binding.widgets
        .map((widgetKey) => widgetMap.get(widgetKey as TWidget))
        .filter((value): value is WidgetDescriptor => Boolean(value));
    },
    [bindingMap, widgetMap],
  );

  const listModules = useCallback(() => Array.from(moduleMap.values()), [moduleMap]);
  const listWidgets = useCallback(() => Array.from(widgetMap.values()), [widgetMap]);

  return {
    manifest,
    navigationSpec: manifest.integration.navigation,
    getModule,
    getWidget,
    getRouteBinding,
    getModulesForRoute,
    getWidgetsForRoute,
    listModules,
    listWidgets,
  };
};

