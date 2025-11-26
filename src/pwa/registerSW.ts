const SW_PATH = '/service-worker.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.DEV) {
      console.info('Service worker registration skipped in dev mode.')
      return
    }

    try {
      await navigator.serviceWorker.register(SW_PATH)
      console.info('Service worker registered.')
    } catch (error) {
      console.error('Service worker registration failed', error)
    }
  })
}

