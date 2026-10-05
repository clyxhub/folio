import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/caveat";
import "@fontsource/space-mono";
import "@fontsource/space-mono/700.css";
import "@fontsource/bebas-neue";
import "@fontsource/great-vibes";
import "./styles/global.css";
import "./styles/document.css";
import App from "./App";
import { ToastProvider } from "./components/Toast";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

const nativePlatform = (() => {
  try {
    return window.Capacitor?.isNativePlatform?.() || false;
  } catch {
    return false;
  }
})();

if ("serviceWorker" in navigator && !nativePlatform) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {
        /* offline support is best-effort */
      });
  });
}
