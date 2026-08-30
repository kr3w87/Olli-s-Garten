const CACHE = "beetbuch-v38";
const ASSETS = ["./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(res=>{
        if(res && res.status===200){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("periodicsync", e=>{
  if(e.tag==="water-check"){
    e.waitUntil(
      self.registration.showNotification("🌱 Beetbuch",{
        body:"Kurz nachsehen, ob eine Pflanze Wasser braucht.",
        icon:"icon-192.png",
        badge:"icon-192.png"
      })
    );
  }
});

self.addEventListener("notificationclick", e=>{
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:"window"}).then(list=>{
      if(list.length>0) return list[0].focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
