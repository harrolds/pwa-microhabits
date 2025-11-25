import { STATIC_CACHE, RUNTIME_CACHE, OFFLINE_URL } from './src/pwa/sw-config'

self.addEventListener('install', (event:any)=>{
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache=> cache.addAll([
      '/',
      '/offline.html'
    ]))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event:any)=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=> k!==STATIC_CACHE && k!==RUNTIME_CACHE).map(k=> caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event:any)=>{
  if(event.request.method!=='GET') return

  event.respondWith(
    fetch(event.request).catch(()=> caches.match(event.request).then(res=> res || caches.match(OFFLINE_URL)))
  )
})
