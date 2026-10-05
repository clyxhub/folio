// Folio — storage abstraction.
//
// On device (Capacitor) we use Preferences for the index/settings and the
// Filesystem for each portfolio JSON document. On the web we fall back to
// localStorage so the PWA works with zero native dependencies.

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

let nativeMode = false;

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function setNativeMode(flag) {
  nativeMode = !!flag;
}

export function isNative() {
  return nativeMode;
}

// ---------- Preferences (index, settings, last opened) ----------

export async function getPref(key) {
  try {
    const { value } = await Preferences.get({ key });
    if (value == null) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function setPref(key, value) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

export async function removePref(key) {
  try {
    await Preferences.remove({ key });
  } catch {
    /* ignore */
  }
}

// ---------- Portfolio documents ----------

const PORTFOLIO_DIR = "portfolios";

async function ensureDir(path) {
  try {
    await Filesystem.mkdir({
      path,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    /* already exists */
  }
}

export async function writePortfolioFile(id, json) {
  await ensureDir(PORTFOLIO_DIR);
  await Filesystem.writeFile({
    path: `${PORTFOLIO_DIR}/${id}/portfolio.json`,
    data: json,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

export async function readPortfolioFile(id) {
  try {
    const { data } = await Filesystem.readFile({
      path: `${PORTFOLIO_DIR}/${id}/portfolio.json`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return typeof data === "string" ? data : null;
  } catch {
    return null;
  }
}

export async function deletePortfolioDir(id) {
  try {
    await Filesystem.rmdir({
      path: `${PORTFOLIO_DIR}/${id}`,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    /* ignore */
  }
}
