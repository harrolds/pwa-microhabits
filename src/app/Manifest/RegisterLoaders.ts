import manifest from './module-manifest.json';
import { moduleLoader } from './ModuleLoader';
import { appStore } from '../StateMachine/state';
import { pushToast } from '../StateMachine/actions';

export const initializeLoaders = () => {
  manifest.routes.forEach((route) => {
    moduleLoader.loadModule(route.moduleId).catch((error) => {
      console.error(`[Manifest] Failed to preload ${route.id}`, error);
      appStore.dispatch(pushToast(`Module ${route.title} failed to load`, 'error'));
    });
  });
};

