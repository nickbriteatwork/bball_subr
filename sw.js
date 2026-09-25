const CACHE = 'sub-planner-v3';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// pages: try the network first so updates show up straight away, fall back to the saved copy when offline
// everything else: saved copy first, refreshed in the background
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(c => {
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; });
    if (isPage) return net.catch(() => c.match(e.request, {ignoreSearch: true}).then(h => h || c.match('index.html')));
    return c.match(e.request, {ignoreSearch: true}).then(hit => hit || net.catch(() => hit));
  }));
});
