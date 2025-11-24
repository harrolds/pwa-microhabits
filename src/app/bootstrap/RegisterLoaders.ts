import type { ShellControllers } from '../Shell/ShellRoot';
import type { ModuleLoader } from '../Modules/ModuleLoader';
import { createModuleLoader } from '../Modules/ModuleLoader';
import type { StateMachine } from '../StateMachine/dispatch';
import type { RouteId } from '../Navigation/routes';

type WidgetModuleShape = Record<string, unknown>;

const widgetSources = import.meta.glob('../Widgets/runtime/**/*.widget.{ts,tsx}');

export interface WidgetLoader {
  load: (componentName: string) => Promise<WidgetModuleShape>;
  preload: (componentNames: string[]) => Promise<void>;
}

const normalizeComponentName = (componentName: string) => componentName.replace(/\.(tsx|ts)$/, '');

const createWidgetLoader = (stateMachine: StateMachine): WidgetLoader => {
  const resolveSource = (componentName: string) => {
    const normalized = normalizeComponentName(componentName);
    const entry = Object.entries(widgetSources).find(([path]) =>
      path.endsWith(`${normalized}.widget.tsx`) || path.endsWith(`${normalized}.widget.ts`),
    );
    return entry?.[1];
  };

  const toggleLoadingToken = async (componentName: string, active: boolean) => {
    await stateMachine.dispatch({
      type: 'UX/SET_LOADING',
      payload: { token: `widget:${componentName}`, active },
    });
  };

  const load = async (componentName: string) => {
    const importer = resolveSource(componentName);
    if (!importer) {
      throw new Error(`[WidgetLoader v2.0] geen bron gevonden voor ${componentName}`);
    }
    await toggleLoadingToken(componentName, true);
    try {
      const module = await importer();
      console.info(`[WidgetLoader v2.0] ${componentName} geladen`);
      return module as WidgetModuleShape;
    } finally {
      await toggleLoadingToken(componentName, false);
    }
  };

  const preload = async (componentNames: string[]) => {
    await Promise.all(componentNames.map((name) => load(name).catch(() => undefined)));
  };

  return {
    load,
    preload,
  };
};

export interface RegisterLoadersOptions {
  stateMachine: StateMachine;
  navigate?: (routeId: RouteId, params?: Record<string, unknown>) => void;
}

export interface RegisterLoadersResult {
  moduleLoader: ModuleLoader;
  widgetLoader: WidgetLoader;
  attachShell: (controllers: ShellControllers) => void;
}

export const registerLoaders = (options: RegisterLoadersOptions): RegisterLoadersResult => {
  let shell: ShellControllers | undefined;

  const emitToast = (title: string, description?: string) => {
    if (!shell) {
      return;
    }
    shell.toasts.push({
      title,
      description,
      kind: 'neutral',
      autoDismissAfter: 4800,
      dismissible: true,
    });
  };

  const baseModuleLoader = createModuleLoader({
    stateMachine: options.stateMachine,
    navigate: options.navigate,
  });

  const moduleLoader: ModuleLoader = {
    ...baseModuleLoader,
    loadModule: async (moduleId) => {
      const loaded = await baseModuleLoader.loadModule(moduleId);
      emitToast('Module geladen', moduleId);
      return loaded;
    },
    preloadRoute: async (routeId) => {
      const loaded = await baseModuleLoader.preloadRoute(routeId);
      if (loaded.length) {
        emitToast('Route voorbereid', `${routeId} • ${loaded.length} module(s)`);
      }
      return loaded;
    },
  };

  const widgetLoader = createWidgetLoader(options.stateMachine);

  const attachShell = (controllers: ShellControllers) => {
    shell = controllers;
    console.info('[Shell v2.0] loader-events gekoppeld');
  };

  return {
    moduleLoader,
    widgetLoader,
    attachShell,
  };
};


