/* Whereabouts service worker - OFFLINE app shell (Forever Apps standard,
   distilled from MenuCaptain's sw.js).
   ===========================================================================
   Goal: the app reliably OPENS with a poor or missing connection, and is a
   real installable PWA.

   The one rule that matters most: never trap a user on a stale build.
   - The app document (index.html) is NETWORK-FIRST: online users always get
     the freshest file, so the in-app version checker keeps working; the cached
     copy is only served when the network truly fails.
   - Cache names are tied to VERSION, and `activate` deletes every cache that
     does not match, so each deploy cleanly rolls the cache.
   - VERSION is bumped together with BUILD in index.html, which changes this
     file's bytes and makes the browser install the new worker.

   Path-agnostic: SHELL is derived from this file's own directory, so it works
   both as a project Pages site (/whereabouts-app/) and later on a root domain.

   Scope by request type:
   - app document          -> network-first, fall back to cached shell
   - version check (?_= / ?u=) -> query'd non-navigation, NOT intercepted (real network)
   - GET /api/collection/* -> network-first, fall back to cached data (offline reads;
                              PUT writes are never intercepted)
   - immutable assets (cdnjs / jsdelivr libs, Google Fonts, our own icons) -> cache-first
   - everything else -> default network
*/

const VERSION = "2026-07-23.2";                 // keep in lockstep with BUILD in index.html
const SHELL_CACHE = "wa-shell-" + VERSION;
const ASSET_CACHE = "wa-assets-" + VERSION;
const DATA_CACHE  = "wa-data-v1";               // user collections; UN-versioned so it
                                                // survives app updates (only a manual
                                                // clearCache / logout wipes it)
const SHELL_URL = new URL("./", self.location).pathname;   // the app root (dir of sw.js)

// Primed on install so even the very first offline open works.
// The cdnjs libs are Requests with SRI (integrity) + CORS mode, mirroring the
// <script> tags in index.html - a tampered CDN response fails the hash check
// and is skipped (Promise.allSettled) instead of being cached. The supabase-js
// URL is unpinned (@2 floats), so it cannot carry a stable hash.
const CRITICAL_ASSETS = [
  new Request("https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js", {
    integrity: "sha384-tMH8h3BGESGckSAVGZ82T9n90ztNXxvdwvdM6UoR56cYcf+0iGXBliJ29D+wZ/x8",
    mode: "cors",
  }),
  new Request("https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js", {
    integrity: "sha384-bm7MnzvK++ykSwVJ2tynSE5TRdN+xL418osEVF2DE/L/gfWHj91J2Sphe582B1Bh",
    mode: "cors",
  }),
  new Request("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js", {
    integrity: "sha384-1qlE7MZPM2pHD/pBZCU/yB8UCP52RYL8bge/qNdfNBCWToySp8/M+JL2waXU4hjJ",
    mode: "cors",
  }),
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  new URL("icon-192.png", self.location).href,
  new URL("icon-512.png", self.location).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const assets = await caches.open(ASSET_CACHE);
    await Promise.allSettled(CRITICAL_ASSETS.map((u) => assets.add(u)));
    try {
      const shell = await caches.open(SHELL_CACHE);
      const r = await fetch(SHELL_URL, { cache: "no-store" });
      if (r && r.ok) await shell.put(SHELL_URL, r.clone());
    } catch (e) { /* offline at install time - fine, fill on first online load */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Lets the app force a full cache wipe (e.g. on a manual "Check for updates").
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "clearCache" || (data && data.type === "clearCache")) {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    })());
  }
});

function isImmutableAsset(url) {
  if (url.hostname === "cdnjs.cloudflare.com") return true;   // versioned libs
  if (url.hostname === "cdn.jsdelivr.net") return true;       // supabase-js
  if (url.hostname === "fonts.googleapis.com") return true;   // font css
  if (url.hostname === "fonts.gstatic.com") return true;      // font files
  if (url.origin === self.location.origin &&
      /\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname)) return true;  // our icons/images
  return false;
}

async function shellNetworkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(SHELL_URL, fresh.clone());   // store under canonical key
    return fresh;
  } catch (e) {
    const cached = await cache.match(SHELL_URL);
    return cached || Response.error();
  }
}

async function dataNetworkFirst(req) {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(req);
  try {
    const fresh = cached
      ? await Promise.race([
          fetch(req),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ])
      : await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    if (cached) return cached;
    throw e;
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return cached || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;              // never cache writes
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  const isAppDoc = url.origin === self.location.origin &&
                   (url.pathname === SHELL_URL || url.pathname === SHELL_URL + "index.html");

  // App document: network-first. A navigation always counts; a plain (query-less)
  // GET of the doc counts too. The version check (?_= / ?u=) is query'd + non-navigation,
  // so it is excluded here and hits the network.
  if (isAppDoc && (req.mode === "navigate" || !url.search)) {
    event.respondWith(shellNetworkFirst(req));
    return;
  }

  if (url.pathname.indexOf("/api/collection/") !== -1) {
    event.respondWith(dataNetworkFirst(req));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }
  // Everything else -> default network.
});
