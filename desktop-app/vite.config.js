import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // cleaner imports
    },
  },
  define: {
    'process.env': {} // <--- polyfill for FaceAPI
  },
  build: {
    rollupOptions: {
      // Prevent bundling MediaPipe packages (WASM/JS load at runtime)
      external: ["@mediapipe/holistic", "@mediapipe/hands"],
    },
    chunkSizeWarningLimit: 1000, // optional, prevent warnings for large chunks
  },
  server: {
    fs: {
      // Allow access to project folder and node_modules
      allow: [
        path.resolve(__dirname),           // entire project folder
        path.resolve(__dirname, "node_modules"), // node_modules for MediaPipe
      ],
    },
  },
});
