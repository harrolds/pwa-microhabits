import React, { useCallback, useEffect, useSyncExternalStore } from 'react';
import ReactDOM from 'react-dom/client';
import { AppBootstrap, type AppBootstrapContext } from './src/app/bootstrap/AppBootstrap';
import ShellRoot from './src/app/Shell/ShellRoot';
import type { StateMachine } from './src/app/StateMachine/dispatch';
import type { PWAFactoryState } from './src/app/StateMachine/globalState';
import { selectCurrentRoute, selectLifecycle } from './src/app/StateMachine/selectors';
import { FALLBACK_ROUTE_ID } from './src/app/Navigation/routes';
import { WidgetRegistryProvider, WidgetStage } from './src/app/Widgets/WidgetRegistry';
import { NavigationBlueprintPanel } from './src/app/bootstrap/LinkNavigation';

const bootstrap = new AppBootstrap();

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

const RuntimeViewport: React.FC<{ context: AppBootstrapContext }> = ({ context }) => {
  const lifecycle = useStateMachineSelector(context.stateMachine, selectLifecycle);
  const currentRoute = useStateMachineSelector(context.stateMachine, selectCurrentRoute) ?? FALLBACK_ROUTE_ID;

  useEffect(() => {
    void context.moduleLoader.preloadRoute(currentRoute);
  }, [context.moduleLoader, currentRoute]);

  const footerManifest = context.moduleLoader.manifest;

  return (
    <ShellRoot
      title="Shell v2.0"
      navigation={<NavigationBlueprintPanel link={context.navigationLink} />}
      footerStatus={<span>Lifecycle: {lifecycle.phase}</span>}
      footerContent={
        <span>
          Manifest v{footerManifest.version} • {footerManifest.registry.modules.length} modules •{' '}
          {footerManifest.registry.widgets.length} widgets
        </span>
      }
      onShellReady={bootstrap.attachShell}
    >
      <WidgetStage routeId={currentRoute} />
    </ShellRoot>
  );
};

const mount = async () => {
  const context = await bootstrap.start();
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Kon root-element niet vinden');
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <WidgetRegistryProvider moduleLoader={context.moduleLoader} stateMachine={context.stateMachine}>
        <RuntimeViewport context={context} />
      </WidgetRegistryProvider>
    </React.StrictMode>,
  );
};

void mount();
