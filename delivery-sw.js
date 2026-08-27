const CACHE='tff-v6.2-final-launch-20260823-ALL-IN-ONE';
const ASSETS=['delivery.html','logo-transparent.png','app-icon-192.png','app-icon-512.png','delivery-manifest.webmanifest','/tff-v6-runtime.js','app-version.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin){
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>cached)));
 }
});
