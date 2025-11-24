import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ModuleLoader,
  ModuleManifestV2,
  WidgetDescriptor,
  WidgetKey,
  WidgetMountPoint,
} from '../Modules/ModuleLoader';
import type { RouteId } from '../Navigation/routes';
import type { StateMachine } from '../StateMachine/dispatch';

type WidgetStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WidgetRuntimeProps {
  descriptor: WidgetDescriptor;
  routeId: RouteId;
  mountPoint: WidgetMountPoint;
  stateMachine: StateMachine;
  moduleLoader: ModuleLoader;
}

type WidgetComponent = React.ComponentType<WidgetRuntimeProps>;

type WidgetModule = {
  default?: WidgetComponent;
  Widget?: WidgetComponent;
};

type RegistryState = Map<WidgetKey, WidgetRegistration>;

interface WidgetRegistration {
  descriptor: WidgetDescriptor;
  status: WidgetStatus;
  Component?: WidgetComponent;
  error?: string;
}

export interface WidgetInstance {
  key: WidgetKey;
  descriptor: WidgetDescriptor;
  mountPoint: WidgetMountPoint;
  status: WidgetStatus;
  error?: string;
  render: () => React.ReactNode | null;
}

interface ResolveWidgetsOptions {
  mountPoint?: WidgetMountPoint | WidgetMountPoint[];
}

interface WidgetRegistryContextValue {
  manifest: ModuleManifestV2;
  moduleLoader: ModuleLoader;
  stateMachine: StateMachine;
  registry: RegistryState;
  getWidgetsForRoute: (
    routeId: RouteId,
    mountPoint?: WidgetMountPoint | WidgetMountPoint[],
  ) => WidgetDescriptor[];
  ensureWidgets: (descriptors: WidgetDescriptor[]) => Promise<void>;
}

const WidgetRegistryContext = createContext<WidgetRegistryContextValue | null>(null);

const widgetSources = import.meta.glob<WidgetModule>('./runtime/**/*.widget.{ts,tsx}');

const widgetToken = (key: WidgetKey) => `widget:${key}`;

const normalizeComponentName = (filePath: string): string => {
  const fileName = filePath.split('/').pop() ?? '';
  return fileName.replace(/\.(tsx|ts)$/, '').replace(/\.widget$/i, '');
};

const findWidgetSource = (componentName: string) => {
  const entry = Object.entries(widgetSources).find(([path]) => normalizeComponentName(path) === componentName);
  return entry?.[1];
};

const seedRegistry = (loader: ModuleLoader): RegistryState => {
  const map: RegistryState = new Map();
  loader.listWidgets().forEach((descriptor) => {
    map.set(descriptor.key, { descriptor, status: 'idle' });
  });
  return map;
};

export interface WidgetRegistryProviderProps {
  moduleLoader: ModuleLoader;
  stateMachine: StateMachine;
  children: ReactNode;
}

export const WidgetRegistryProvider: React.FC<WidgetRegistryProviderProps> = ({
  moduleLoader,
  stateMachine,
  children,
}) => {
  const [registry, setRegistry] = useState<RegistryState>(() => seedRegistry(moduleLoader));
  const registryRef = useRef(registry);
  const inflight = useRef<Map<WidgetKey, Promise<void>>>(new Map());

  useEffect(() => {
    setRegistry(seedRegistry(moduleLoader));
  }, [moduleLoader]);

  useEffect(() => {
    registryRef.current = registry;
  }, [registry]);

  const updateRegistration = useCallback(
    (key: WidgetKey, updater: (prev: WidgetRegistration | undefined) => WidgetRegistration) => {
      setRegistry((prev) => {
        const next = new Map(prev);
        next.set(key, updater(prev.get(key)));
        return next;
      });
    },
    [],
  );

  const resolveWidgetComponent = useCallback(async (descriptor: WidgetDescriptor): Promise<WidgetComponent> => {
    const source = findWidgetSource(descriptor.component);
    if (!source) {
      throw new Error(`[WidgetRegistry] Bronbestand ontbreekt voor component: ${descriptor.component}`);
    }
    const module = await source();
    const Widget = module.default ?? module.Widget;
    if (!Widget) {
      throw new Error(`[WidgetRegistry] Component-export ontbreekt in widget: ${descriptor.component}`);
    }
    return Widget;
  }, []);

  const loadWidget = useCallback(
    async (descriptor: WidgetDescriptor): Promise<void> => {
      const current = registryRef.current.get(descriptor.key);
      if (current?.status === 'ready' || current?.status === 'loading') {
        return;
      }

      updateRegistration(descriptor.key, (prev) => ({
        descriptor,
        status: 'loading',
        Component: prev?.Component,
      }));

      const token = widgetToken(descriptor.key);

      await stateMachine.dispatch({
        type: 'UX/SET_LOADING',
        payload: { token, active: true },
      });

      try {
        await moduleLoader.loadModule(descriptor.moduleId);
        const Component = await resolveWidgetComponent(descriptor);

        updateRegistration(descriptor.key, () => ({
          descriptor,
          status: 'ready',
          Component,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        updateRegistration(descriptor.key, () => ({
          descriptor,
          status: 'error',
          error: message,
        }));

        if (import.meta.env?.DEV) {
          console.error(`[WidgetRegistry] Laden van widget ${descriptor.key} mislukt:`, error);
        }
      } finally {
        await stateMachine.dispatch({
          type: 'UX/SET_LOADING',
          payload: { token, active: false },
        });
      }
    },
    [moduleLoader, resolveWidgetComponent, stateMachine, updateRegistration],
  );

  const ensureWidgets = useCallback(
    async (descriptors: WidgetDescriptor[]) => {
      await Promise.all(
        descriptors.map(async (descriptor) => {
          const inflightLoad = inflight.current.get(descriptor.key);
          if (inflightLoad) {
            await inflightLoad;
            return;
          }

          const promise = loadWidget(descriptor);
          inflight.current.set(descriptor.key, promise);

          try {
            await promise;
          } finally {
            inflight.current.delete(descriptor.key);
          }
        }),
      );
    },
    [loadWidget],
  );

  const getWidgetsForRoute = useCallback<
    WidgetRegistryContextValue['getWidgetsForRoute']
  >(
    (routeId, mountPoint) => {
      const binding = moduleLoader.getRouteBinding(routeId);
      if (!binding) {
        return [];
      }
      const widgetKeys = binding.widgets?.length
        ? binding.widgets
        : binding.fallbackWidgets?.length
          ? binding.fallbackWidgets
          : [];

      const requestedMountPoints = Array.isArray(mountPoint) ? mountPoint : mountPoint ? [mountPoint] : undefined;

      return widgetKeys
        .map((key) => moduleLoader.getWidgetDescriptor(key))
        .filter((descriptor): descriptor is WidgetDescriptor => Boolean(descriptor))
        .filter((descriptor) =>
          requestedMountPoints ? requestedMountPoints.includes(descriptor.mountPoint) : true,
        );
    },
    [moduleLoader],
  );

  const contextValue = useMemo<WidgetRegistryContextValue>(
    () => ({
      manifest: moduleLoader.manifest,
      moduleLoader,
      stateMachine,
      registry,
      getWidgetsForRoute,
      ensureWidgets,
    }),
    [ensureWidgets, getWidgetsForRoute, moduleLoader, registry, stateMachine],
  );

  return <WidgetRegistryContext.Provider value={contextValue}>{children}</WidgetRegistryContext.Provider>;
};

export const useWidgetRegistry = (): WidgetRegistryContextValue => {
  const context = useContext(WidgetRegistryContext);
  if (!context) {
    throw new Error('useWidgetRegistry moet binnen een WidgetRegistryProvider worden gebruikt.');
  }
  return context;
};

export const useWidgetMounts = (
  routeId: RouteId,
  options?: ResolveWidgetsOptions,
): {
  instances: WidgetInstance[];
  routeId: RouteId;
  isResolving: boolean;
} => {
  const { registry, getWidgetsForRoute, ensureWidgets, moduleLoader, stateMachine } = useWidgetRegistry();

  const descriptors = useMemo(
    () => getWidgetsForRoute(routeId, options?.mountPoint),
    [getWidgetsForRoute, options?.mountPoint, routeId],
  );

  useEffect(() => {
    if (!descriptors.length) {
      return;
    }
    void ensureWidgets(descriptors);
  }, [descriptors, ensureWidgets]);

  const instances = useMemo<WidgetInstance[]>(() => {
    return descriptors.map((descriptor) => {
      const registration = registry.get(descriptor.key);
      const status = registration?.status ?? 'idle';

      return {
        key: descriptor.key,
        descriptor,
        mountPoint: descriptor.mountPoint,
        status,
        error: registration?.error,
        render:
          status === 'ready' && registration?.Component
            ? () => (
                <registration.Component
                  key={descriptor.key}
                  descriptor={descriptor}
                  routeId={routeId}
                  mountPoint={descriptor.mountPoint}
                  moduleLoader={moduleLoader}
                  stateMachine={stateMachine}
                />
              )
            : () => null,
      };
    });
  }, [descriptors, moduleLoader, registry, routeId, stateMachine]);

  const isResolving = instances.some((instance) => instance.status === 'loading');

  return {
    instances,
    routeId,
    isResolving,
  };
};

export interface WidgetContainerProps {
  descriptor: WidgetDescriptor;
  status: WidgetStatus;
  error?: string;
  children?: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ descriptor, status, error, children }) => {
  const baseStyle: React.CSSProperties = {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    background: 'rgba(15, 17, 26, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 180,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: 12,
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.12)',
    textTransform: 'uppercase',
  };

  const statusColor =
    status === 'ready' ? '#2CE59B' : status === 'loading' ? '#FFD166' : status === 'error' ? '#FF6B6B' : '#A7AEC4';

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  };

  const renderBody = () => {
    if (status === 'loading') {
      return <span>Widget wordt geladen…</span>;
    }
    if (status === 'error') {
      return <span>Widget-fout: {error ?? 'onbekende fout'}</span>;
    }
    if (status === 'ready' && children) {
      return children;
    }
    return <span>Widget in wachtrij</span>;
  };

  return (
    <section style={baseStyle} data-widget-key={descriptor.key} aria-busy={status === 'loading'}>
      <div style={headerStyle}>
        <span>{descriptor.component}</span>
        <span style={{ ...badgeStyle, color: statusColor, borderColor: `${statusColor}55` }}>{status}</span>
      </div>
      <div style={contentStyle}>{renderBody()}</div>
    </section>
  );
};

export const WidgetStage: React.FC<{ routeId: RouteId; mountPoint?: WidgetMountPoint | WidgetMountPoint[] }> = ({
  routeId,
  mountPoint,
}) => {
  const { instances, isResolving } = useWidgetMounts(routeId, { mountPoint });

  if (!instances.length && !isResolving) {
    return <p style={{ opacity: 0.64 }}>Geen widgets beschikbaar voor deze route.</p>;
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
    width: '100%',
  };

  return (
    <div style={gridStyle}>
      {instances.map((instance) => (
        <WidgetContainer
          key={instance.key}
          descriptor={instance.descriptor}
          status={instance.status}
          error={instance.error}
        >
          {instance.status === 'ready' ? instance.render() : null}
        </WidgetContainer>
      ))}
    </div>
  );
};


