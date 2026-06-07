import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import obfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Apply heavy security masking to security scripts
    obfuscator({
      include: [/security-lock\.js$/, /advanced-protection\.js$/], 
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        // 1. Your primary web app entry point
        main: path.resolve(__dirname, "index.html"),
        // 2. ISOLATED ENTRY: Compiles your script independently from React/Tailwind
        "security-lock": path.resolve(__dirname, "./src/advanced-protection.js"), 
      },
      output: {
        // Keeps names unpredictable for general app files, while keeping a clean target for your SW whitelist
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "security-lock" 
            ? "assets/security-lock.js" 
            : "assets/[hash].js";
        },
        chunkFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash][extname]",
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
