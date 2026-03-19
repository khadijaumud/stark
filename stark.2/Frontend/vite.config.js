import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  cacheDir: process.env.VITE_CACHE_DIR || "node_modules/.vite",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        signin: resolve(__dirname, "signin/index.html"),
        signup: resolve(__dirname, "signup/index.html"),
        hacker: resolve(__dirname, "hacker/index.html"),
        company: resolve(__dirname, "company/index.html"),
        dashboard: resolve(__dirname, "dashboard/index.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
});
