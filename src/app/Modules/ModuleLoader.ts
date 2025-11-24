import manifestJson from './module-manifest.json';
import type { ManifestNavigationSpecV2 } from '../Navigation/NavigationMap';
import type { RouteId } from '../Navigation/routes';
import type { StateMachine } from '../StateMachine/dispatch';

export type ModuleId = `factory.${string}`;
export type WidgetKey = `factory.widgets.${string}`;
export type ModuleCategory = 'core' | 'runtime' | 'control' | 'integration';
export type ModuleActivationMode = 'boot' | 'route' | 'lazy';

export interface ModuleDescriptor<TConfig = Record<string, unknown>> {
  id: ModuleId;
  name: string;
  summary: string;
  version: string;
  category: ModuleCategory;
  entryPoint: string;
  activationMode: ModuleActivationMode;
  routes: RouteId[];
  widgets?: WidgetKey[];
  defaultConfig?: TConfig;
}

export type WidgetMountPoint = 'navigation' | 'panel' | 'context' | 'sheet' | 'manifest';

export interface WidgetDescriptor {
  key: WidgetKey;
  type: 'navigation' | 'panel' | 'context' | 'sheet';
  moduleId: ModuleId;
  component: string;
  mountPoint: WidgetMountPoint;
  routes: RouteId[];
  description: string;
}

export interface RouteBindingDescriptor {
  routeId: RouteId;
  modules: ModuleId[];
  widgets?: WidgetKey[];
  fallbackWidgets?: WidgetKey[];
  autoActivate?: boolean;
}

export interface ModuleManifestV2 {
  schema: 'pwa-factory.manifest/2.0';
  version: string;
  generatedAt: string;
  compatibility: {
    navigation: string;
    stateMachine: string;
    minimumRuntime: string;
  };
  registry: {
    modules: ModuleDescriptor[];
    widgets: WidgetDescriptor[];
  };
  integration: {
    routes: RouteBindingDescriptor[];
    navigation: ManifestNavigationSpecV2;
  };
}

export interface ModuleRuntimeContext<TState = Record<string, unknown>, TConfig = Record<string, unknown>> {
  module: ModuleDescriptor<TConfig>;
  config: TConfig;
  dispatch: StateMachine['dispatch'];
  getState: StateMachine['getState'];
  navigate: (routeId: RouteId, params?: Record<string, unknown>) => void;
}

export interface ModuleRuntime<TState = Record<string, unknown>, TConfig = Record<string, unknown>> {
  id: ModuleId;
  activate?: (
    context: ModuleRuntimeContext<TState, TConfig>,
  ) => Promise<Partial<TState> | void> | Partial<TState> | void;
  deactivate?: (context: ModuleRuntimeContext<TState, TConfig>) => Promise<void> | void;
}

type RuntimeModuleModule = { default?: ModuleRuntime } & Record<string, unknown>;

const manifest = manifestJson as ModuleManifestV2;

const moduleSources = import.meta.glob<RuntimeModuleModule>('./**/*.module.ts');

export interface ModuleLoaderOptions {
  stateMachine: StateMachine;
  navigate?: (routeId: RouteId, params?: Record<string, unknown>) => void;
}

export interface LoadedModule<TState = Record<string, unknown>> {
  descriptor: ModuleDescriptor;
  runtime: ModuleRuntime<TState>;
}

export interface ModuleLoader {
  manifest: ModuleManifestV2;
  navigationSpec: ManifestNavigationSpecV2;
  loadModule: (moduleId: ModuleId) => Promise<LoadedModule>;
  preloadRoute: (routeId: RouteId) => Promise<LoadedModule[]>;
  getModuleDescriptor: (moduleId: ModuleId) => ModuleDescriptor | undefined;
  getWidgetDescriptor: (key: WidgetKey) => WidgetDescriptor | undefined;
  getRouteBinding: (routeId: RouteId) => RouteBindingDescriptor | undefined;
  listModules: () => ModuleDescriptor[];
  listWidgets: () => WidgetDescriptor[];
}

const normalizeRuntime = (module: RuntimeModuleModule | undefined): ModuleRuntime | null => {
  if (!module) {
    return null;
  }
  const candidate = (module as RuntimeModuleModule).default ?? module;
  if (candidate && typeof candidate === 'object' && 'id' in candidate) {
    return candidate as ModuleRuntime;
  }
  return null;
};

const createFallbackRuntime = (descriptor: ModuleDescriptor, reason: string): ModuleRuntime => ({
  id: descriptor.id,
  async activate() {
    if (import.meta.env?.DEV) {
      console.warn(`[ModuleLoader] fallback module active for ${descriptor.id}: ${reason}`);
    }
    return undefined;
  },
});

export const createModuleLoader = (options: ModuleLoaderOptions): ModuleLoader => {
  const moduleMap = new Map<ModuleId, ModuleDescriptor>();
  const widgetMap = new Map<WidgetKey, WidgetDescriptor>();
  const bindingMap = new Map<RouteId, RouteBindingDescriptor>();

  manifest.registry.modules.forEach((entry) => moduleMap.set(entry.id, entry));
  manifest.registry.widgets.forEach((entry) => widgetMap.set(entry.key, entry));
  manifest.integration.routes.forEach((binding) => bindingMap.set(binding.routeId, binding));

  const navigate = options.navigate ?? (() => undefined);

  const ensureRegistered = async (descriptor: ModuleDescriptor) => {
    const current = options.stateMachine.getState().manifest.modules[descriptor.id];
    if (current) {
      return;
    }
    await options.stateMachine.dispatch({
      type: 'MANIFEST/REGISTER_MODULE',
      payload: {
        module: {
          id: descriptor.id,
          status: 'registered',
          version: descriptor.version,
          state: descriptor.defaultConfig ?? {},
        },
      },
    });
  };

  const updateStatus = async (
    descriptor: ModuleDescriptor,
    patch: Record<string, unknown> | undefined,
    status: 'activated' | 'error',
    lastError?: string,
  ) => {
    await options.stateMachine.dispatch({
      type: 'MANIFEST/UPDATE_MODULE',
      payload: {
        moduleId: descriptor.id,
        patch,
        status,
        lastError,
      },
    });
  };

  const resolveRuntime = async (descriptor: ModuleDescriptor): Promise<ModuleRuntime> => {
    const importer = moduleSources[descriptor.entryPoint];
    if (!importer) {
      return createFallbackRuntime(descriptor, 'entry-point-not-found');
    }
    const loaded = await importer().catch(() => undefined);
    return normalizeRuntime(loaded) ?? createFallbackRuntime(descriptor, 'invalid-module-shape');
  };

  const loadModule = async (moduleId: ModuleId): Promise<LoadedModule> => {
    const descriptor = moduleMap.get(moduleId);
    if (!descriptor) {
      throw new Error(`[ModuleLoader] onbekende module-id: ${moduleId}`);
    }

    const loadingToken = `module:${moduleId}`;
    await options.stateMachine.dispatch({
      type: 'UX/SET_LOADING',
      payload: { token: loadingToken, active: true },
    });

    try {
      const runtime = await resolveRuntime(descriptor);
      await ensureRegistered(descriptor);

      if (runtime.activate) {
        const activationState =
          (await runtime.activate({
            module: descriptor,
            config: (descriptor.defaultConfig ?? {}) as Record<string, unknown>,
            dispatch: options.stateMachine.dispatch,
            getState: options.stateMachine.getState,
            navigate,
          })) ?? undefined;

        if (activationState && typeof activationState === 'object') {
          await updateStatus(descriptor, activationState, 'activated');
        } else {
          await updateStatus(descriptor, undefined, 'activated');
        }
      }

      return { descriptor, runtime };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await updateStatus(descriptor, undefined, 'error', message);
      return { descriptor, runtime: createFallbackRuntime(descriptor, message) };
    } finally {
      await options.stateMachine.dispatch({
        type: 'UX/SET_LOADING',
        payload: { token: loadingToken, active: false },
      });
    }
  };

  const preloadRoute = async (routeId: RouteId): Promise<LoadedModule[]> => {
    const binding = bindingMap.get(routeId);
    if (!binding) {
      return [];
    }

    const modules = binding.modules ?? [];
    const results: LoadedModule[] = [];

    for (const moduleId of modules) {
      try {
        const loaded = await loadModule(moduleId);
        results.push(loaded);
      } catch (error) {
        const descriptor = moduleMap.get(moduleId);
        if (descriptor) {
          const message = error instanceof Error ? error.message : String(error);
          await updateStatus(descriptor, undefined, 'error', message);
          results.push({ descriptor, runtime: createFallbackRuntime(descriptor, message) });
        }
      }
    }

    return results;
  };

  manifest.registry.modules
    .filter((module) => module.activationMode === 'boot')
    .forEach((module) => {
      void loadModule(module.id);
    });

  return {
    manifest,
    navigationSpec: manifest.integration.navigation,
    loadModule,
    preloadRoute,
    getModuleDescriptor: (moduleId) => moduleMap.get(moduleId),
    getWidgetDescriptor: (key) => widgetMap.get(key),
    getRouteBinding: (routeId) => bindingMap.get(routeId),
    listModules: () => Array.from(moduleMap.values()),
    listWidgets: () => Array.from(widgetMap.values()),
  };
};

export const moduleManifest = manifest;
