import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
      "recharts",
      "@supabase/supabase-js",
    ],
    exclude: [],
    force: true,
    esbuildOptions: {
      target: "esnext",
      format: "esm",
    },
  },
  plugins: [react(), tempo()],
  resolve: {
    preserveSymlinks: false,
    dedupe: [
      "@supabase/supabase-js",
      "@supabase/postgrest-js",
      "@supabase/realtime-js",
      "@supabase/storage-js",
      "@supabase/functions-js",
      "@supabase/gotrue-js",
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
    module: {},
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    timeout: 120000,
    fs: {
      allow: [".."],
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        format: "es",
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["lucide-react"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
      requireReturnsDefault: "auto",
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
