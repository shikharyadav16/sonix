import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/search": {
        target: "https://music-api.albatross0071.workers.dev",
        changeOrigin: true,
        secure: true,
        headers: {
          origin: "https://listenfree.in",
          referer: "https://listenfree.in/",
          accept: "*/*",
        },
      },
      "/api/songs": {
        target: "https://music-api.albatross0071.workers.dev",
        changeOrigin: true,
        secure: true,
        headers: {
          origin: "https://listenfree.in",
          referer: "https://listenfree.in/",
          accept: "*/*",
        },
      },
      "/api/lrclib": {
        target: "https://lrclib.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/lrclib/, "/api"),
        headers: {
          accept: "*/*",
        },
      },
    },
  },
});
