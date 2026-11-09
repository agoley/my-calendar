// App shell cached for offline. Calendar data comes from the server (another
// origin) and is never cached here; the app keeps its own last copy.
const CACHE = "my-calendar-v8";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Always check GitHub for a newer copy (no-cache revalidates instead of
  // reusing the browser's 10-minute copy), and fall back to the cache offline.
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

// Push notifications from the calendar server.
self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: "My Calendar", body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(data.title || "My Calendar", {
    body: data.body || "",
    tag: data.tag,
    renotify: !!data.tag,
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: data.url || "./" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL(e.notification.data?.url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    // Meeting links open directly; everything else focuses the app.
    if (!target.startsWith(self.registration.scope)) return clients.openWindow(target);
    const open = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const app = open.find((c) => c.url.startsWith(self.registration.scope));
    if (app) return app.focus();
    return clients.openWindow(target);
  })());
});
