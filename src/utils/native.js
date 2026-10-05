// Folio — native device integration (back button, app-state saves).

import { Capacitor } from "@capacitor/core";

const backHandlers = [];

// A registered handler returns true if it consumed the back press.
export function registerBackHandler(fn) {
  backHandlers.push(fn);
  return () => {
    const i = backHandlers.indexOf(fn);
    if (i >= 0) backHandlers.splice(i, 1);
  };
}

export async function initNative() {
  if (!Capacitor.isNativePlatform()) return undefined;
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", () => {
      for (let i = backHandlers.length - 1; i >= 0; i -= 1) {
        if (backHandlers[i]()) return;
      }
      App.exitApp();
    });
    return App;
  } catch {
    return undefined;
  }
}

// Run a callback when the app is backgrounded (to flush pending saves).
export async function onAppPause(cb) {
  if (!Capacitor.isNativePlatform()) return () => {};
  try {
    const { App } = await import("@capacitor/app");
    const handle = await App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) cb();
    });
    return () => handle.remove();
  } catch {
    return () => {};
  }
}
