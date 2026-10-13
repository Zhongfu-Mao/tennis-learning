import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

function collectFiles(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      return collectFiles(fullPath, relativePath);
    }

    if (!entry.isFile()) {
      return [];
    }

    return [relativePath];
  });
}

function tennisPwaServiceWorker() {
  return {
    name: "tennis-pwa-service-worker",
    closeBundle() {
      const distDir = join(process.cwd(), "dist");
      const assetsDir = join(distDir, "assets");
      const assets = collectFiles(assetsDir).map((file) => `/assets/${file.split(sep).join("/")}`);
      const precache = ["/", "/index.html", "/manifest.webmanifest", "/pwa.svg", ...assets];

      writeFileSync(
        join(distDir, "sw.js"),
        `const CACHE_NAME = "tennis-progression-${Date.now()}";
const PRECACHE = ${JSON.stringify(precache, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
`
      );
    }
  };
}

export default defineConfig({
  plugins: [react(), tennisPwaServiceWorker()]
});
