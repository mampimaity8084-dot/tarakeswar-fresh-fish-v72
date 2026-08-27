const CACHE='tff-v6.2-final-launch-20260823-ALL-IN-ONE';
const ASSETS=['/admin.html','/admin-manifest.webmanifest','/tff-v6-runtime.js','/master-v4.css','/logo-transparent.png','/app-icon-192.png','/app-icon-512.png','/supabase-config.js','/app-version.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(x=>x.put(e.request,copy)).catch(()=>{});return r}).catch(()=>c)))})
