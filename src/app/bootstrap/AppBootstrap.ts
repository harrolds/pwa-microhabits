import type { ShellControllers } from '../Shell/ShellRoot';
import type { ModuleLoader } from '../Modules/ModuleLoader';
import type { StateMachine } from '../StateMachine/dispatch';
import type { WidgetLoader } from './RegisterLoaders';
import { registerLoaders } from './RegisterLoaders';
import { initializeStateMachine } from './InitializeStateMachine';
import { linkNavigation, type NavigationLink } from './LinkNavigation';

export interface AppBootstrapContext {
  stateMachine: StateMachine;
  moduleLoader: ModuleLoader;
  widgetLoader: WidgetLoader;
  navigationLink: NavigationLink;
}

export class AppBootstrap {
  private contextPromise: Promise<AppBootstrapContext> | null = null;
  private context: AppBootstrapContext | null = null;
  private shell: ShellControllers | null = null;
  private attachLoaderShell?: (controllers: ShellControllers) => void;

  async start(): Promise<AppBootstrapContext> {
    if (this.context) {
      return this.context;
    }
    if (this.contextPromise) {
      return this.contextPromise;
    }

    this.contextPromise = (async () => {
      const { stateMachine } = initializeStateMachine();
      const loaderBindings = registerLoaders({ stateMachine });
      this.attachLoaderShell = loaderBindings.attachShell;

      const navigationLink = linkNavigation({
        stateMachine,
        manifest: loaderBindings.moduleLoader.navigationSpec,
      });

      if (this.shell) {
        this.attachLoaderShell?.(this.shell);
        navigationLink.attachShell(this.shell);
      }

      await stateMachine.dispatch({
        type: 'LIFECYCLE/SET_PHASE',
        payload: { phase: 'ready' },
      });

      console.info('PWA Factory Bootstrap v2.0 initialized');

      this.context = {
        stateMachine,
        moduleLoader: loaderBindings.moduleLoader,
        widgetLoader: loaderBindings.widgetLoader,
        navigationLink,
      };

      this.contextPromise = null;
      return this.context;
    })();

    return this.contextPromise;
  }

  attachShell = (controllers: ShellControllers) => {
    this.shell = controllers;
    this.attachLoaderShell?.(controllers);
    this.context?.navigationLink.attachShell(controllers);
  };
}


