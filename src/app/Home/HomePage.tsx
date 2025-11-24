import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import ShellRoot from '../Shell/ShellRoot';
import type { StateMachine } from '../StateMachine/dispatch';
import { createStateMachine } from '../StateMachine/dispatch';
import { selectCurrentRoute, selectLifecycle } from '../StateMachine/selectors';
import type { AppLifecyclePhase, PWAFactoryState } from '../StateMachine/globalState';
import { createModuleLoader } from '../Modules/ModuleLoader';
import type { RouteBindingDescriptor } from '../Modules/ModuleLoader';
import type { RouteId } from '../Navigation/routes';
import { FALLBACK_ROUTE_ID } from '../Navigation/routes';
import {
  WidgetRegistryProvider,
  WidgetStage,
  useWidgetRegistry,
} from '../Widgets/WidgetRegistry';

const useBootstrapLifecycle = (stateMachine: StateMachine) => {
  useEffect(() => {
    const state = stateMachine.getState();

    if (state.lifecycle.phase === 'booting') {
      void stateMachine.dispatch({
        type: 'LIFECYCLE/SET_PHASE',
        payload: { phase: 'ready' },
      });
    }

    if (!state.navigation.currentRoute) {
      void stateMachine.dispatch({
        type: 'NAVIGATION/RESOLVE_ROUTE',
        payload: { routeId: FALLBACK_ROUTE_ID },
      });
    }
  }, [stateMachine]);
};

const useStateMachineSelector = <T,>(
  stateMachine: StateMachine,
  selector: (state: PWAFactoryState) => T,
): T => {
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      stateMachine.subscribe(() => {
        onStoreChange();
      }),
    [stateMachine],
  );

  const getSnapshot = useCallback(() => selector(stateMachine.getState()), [selector, stateMachine]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

const RouteSelector: React.FC<{
  routes: RouteBindingDescriptor[];
  activeRoute: RouteId;
  onRouteChange: (routeId: RouteId) => void;
}> = ({ routes, activeRoute, onRouteChange }) => {
  const selectStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: '8px 12px',
    color: '#F5F7FF',
    minWidth: 220,
  };

  return (
    <select
      aria-label="Route selecteren"
      value={activeRoute}
      onChange={(event) => onRouteChange(event.target.value as RouteId)}
      style={selectStyle}
    >
      {routes.map((route) => (
        <option key={route.routeId} value={route.routeId}>
          {route.routeId}
        </option>
      ))}
    </select>
  );
};

const LifecycleBadge: React.FC<{ phase: AppLifecyclePhase }> = ({ phase }) => (
  <span style={{ opacity: 0.72 }}>Lifecycle phase: {phase}</span>
);

const ManifestFooter: React.FC = () => {
  const { manifest } = useWidgetRegistry();
  const widgetCount = manifest.registry.widgets.length;
  const moduleCount = manifest.registry.modules.length;

  return (
    <span>
      Manifest v{manifest.version} • {moduleCount} modules • {widgetCount} widgets
    </span>
  );
};

const RuntimeSurface: React.FC<{ stateMachine: StateMachine }> = ({ stateMachine }) => {
  const { manifest, moduleLoader } = useWidgetRegistry();
  const lifecycle = useStateMachineSelector(stateMachine, selectLifecycle);
  const currentRoute = useStateMachineSelector(stateMachine, selectCurrentRoute) ?? FALLBACK_ROUTE_ID;
  const routes = manifest.integration.routes;

  const handleRouteChange = useCallback(
    (routeId: RouteId) => {
      void stateMachine.dispatch({
        type: 'NAVIGATION/SET_PENDING',
        payload: { routeId },
      });
      void stateMachine.dispatch({
        type: 'NAVIGATION/RESOLVE_ROUTE',
        payload: { routeId },
      });
    },
    [stateMachine],
  );

  useEffect(() => {
    void moduleLoader.preloadRoute(currentRoute);
  }, [currentRoute, moduleLoader]);

  const title = 'Widget Loader v2.0';

  return (
    <ShellRoot
      title={title}
      navigation={<RouteSelector routes={routes} activeRoute={currentRoute} onRouteChange={handleRouteChange} />}
      footerStatus={<LifecycleBadge phase={lifecycle.phase} />}
      footerContent={<ManifestFooter />}
    >
      <WidgetStage routeId={currentRoute} />
    </ShellRoot>
  );
};

const HomePage: React.FC = () => {
  const stateMachine = useMemo(() => createStateMachine(), []);
  const moduleLoader = useMemo(
    () =>
      createModuleLoader({
        stateMachine,
        navigate: (routeId: RouteId, params?: Record<string, unknown>) => {
          void stateMachine.dispatch({
            type: 'NAVIGATION/SET_PENDING',
            payload: { routeId, params },
          });
          void stateMachine.dispatch({
            type: 'NAVIGATION/RESOLVE_ROUTE',
            payload: { routeId, params },
          });
        },
      }),
    [stateMachine],
  );

  useBootstrapLifecycle(stateMachine);

  return (
    <WidgetRegistryProvider moduleLoader={moduleLoader} stateMachine={stateMachine}>
      <RuntimeSurface stateMachine={stateMachine} />
    </WidgetRegistryProvider>
  );
};

export default HomePage;
