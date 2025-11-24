declare const __PWA_BUILD_TIME__: string | undefined;

type RegisterOptions = {
  immediate?: boolean;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onReady?: (registration: ServiceWorkerRegistration) => void;
};

const getBuildRevision = () =>
  import.meta.env?.VITE_PWA_BUILD_ID ?? __PWA_BUILD_TIME__ ?? new Date().toISOString();

const SW_URL = `/service-worker.js?v=${encodeURIComponent(getBuildRevision())}`;

const isSupported = () => 'serviceWorker' in navigator && window.isSecureContext;

const watchForUpdates = (
  registration: ServiceWorkerRegistration,
  onUpdate?: (registration: ServiceWorkerRegistration) => void,
) => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) {
      return;
    }

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        onUpdate?.(registration);
      }
    });
  });

  if (registration.waiting && navigator.serviceWorker.controller) {
    onUpdate?.(registration);
  }
};

export const registerSW = (options: RegisterOptions = {}) => {
  if (!isSupported()) {
    return;
  }

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(SW_URL, { type: 'module', scope: '/' });
      options.onReady?.(registration);
      watchForUpdates(registration, options.onUpdate);
      return registration;
    } catch (error) {
      console.error('[PWA] Failed to register Service Worker', error);
      return undefined;
    }
  };

  if (options.immediate) {
    void register();
  } else {
    window.addEventListener(
      'load',
      () => {
        void register();
      },
      { once: true },
    );
  }
};

export const reloadWithUpdatedSW = async (registration?: ServiceWorkerRegistration | null) => {
  const activeRegistration = registration ?? (await navigator.serviceWorker.getRegistration());
  const waitingWorker = activeRegistration?.waiting;
  if (!waitingWorker) {
    return false;
  }

  waitingWorker.postMessage('SKIP_WAITING');
  waitingWorker.addEventListener('statechange', () => {
    if (waitingWorker.state === 'activated') {
      window.location.reload();
    }
  });
  return true;
};

