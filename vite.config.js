import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Folio — Vite configuration.
// `base: "./"` keeps asset URLs relative so the built bundle works both on
// GitHub Pages (project sub-path) and inside the Capacitor Android shell.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    // html2pdf.js and qrcode are dynamically imported, so they land in their
    // own chunks instead of bloating the initial app bundle.
    chunkSizeWarningLimit: 900,
  },
});
