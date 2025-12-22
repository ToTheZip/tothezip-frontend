import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/regions": {
        target: "http://localhost:80",
        changeOrigin: true,
        rewrite: (path) => `/tothezip${path}`,
      },
      "/property": {
        target: "http://localhost:80",
        changeOrigin: true,
        rewrite: (path) => `/tothezip${path}`,
      },
      "/user": {
        target: "http://localhost:80",
        changeOrigin: true,
        rewrite: (path) => `/tothezip${path}`,
      },
    },
  },
});
