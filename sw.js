const C='tff-v7-final-auto-machine-20260826-1';const A=['/','/index.html','/logo-transparent.png','/app-icon-192.png','/app-icon-512.png','/manifest.webmanifest','/supabase-config.js','/tff-v6-runtime.js','/tff-v7-smart-experience.js','/tff-final-auto-machine.js','/app-version.json'];self.addEventListener('install',e=>e.waitUntil(
  caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())
));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('/api/')||e.request.url.includes('supabase.co'))return;e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request)))})
self.addEventListener('push',e=>{
 let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'Tarakeswar Fresh Fish',body:e.data?e.data.text():'New update'}};
 e.waitUntil(self.registration.showNotification(d.title||'Tarakeswar Fresh Fish',{body:d.body||'',icon:d.icon||'/logo-transparent.png',badge:d.badge||'/logo-transparent.png',data:d.data||{}}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'/';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate(url);return c.focus()}}return clients.openWindow(url)}))});
