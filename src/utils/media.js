// Folio — image storage.
//
// On the device, images live as files under `Directory.Data` and the model
// stores a lightweight `folio-file:` reference; on the web they stay as data
// URLs. `resolveMedia()` turns either form into something the WebView can
// display (via Capacitor.convertFileSrc on native).

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isNativeApp } from "./storage";

const REF_PREFIX = "folio-file:";
let baseDir = null;

export function isMediaRef(value) {
  return typeof value === "string" && value.startsWith(REF_PREFIX);
}

// Resolve the absolute base of Directory.Data once at startup.
export async function initMedia() {
  if (!isNativeApp()) return;
  try {
    const { uri } = await Filesystem.getUri({
      path: "",
      directory: Directory.Data,
    });
    baseDir = uri.replace(/\/$/, "");
  } catch {
    baseDir = null;
  }
}

// Sync: data URLs / http URLs pass through; refs become WebView-loadable URLs.
export function resolveMedia(value) {
  if (!value) return "";
  if (!isMediaRef(value)) return value;
  const rel = value.slice(REF_PREFIX.length);
  const abs = baseDir ? `${baseDir}/${rel}` : rel;
  try {
    return Capacitor.convertFileSrc(abs);
  } catch {
    return abs;
  }
}

let seq = 0;

// Persist a processed image. Native → file + ref; web → the data URL unchanged.
export async function persistImage(dataUrl, portfolioId, kind = "img") {
  if (!dataUrl) return "";
  if (!isNativeApp()) return dataUrl;
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i.exec(dataUrl);
  if (!match) return dataUrl;
  const ext = /png/i.test(match[1]) ? "png" : "jpg";
  const rel = `portfolios/${portfolioId}/images/${kind}-${Date.now()}-${seq++}.${ext}`;
  try {
    await Filesystem.mkdir({
      path: `portfolios/${portfolioId}/images`,
      directory: Directory.Data,
      recursive: true,
    }).catch(() => {});
    await Filesystem.writeFile({
      path: rel,
      data: match[2],
      directory: Directory.Data,
      recursive: true,
    });
    return REF_PREFIX + rel;
  } catch {
    return dataUrl;
  }
}

export async function removeImage(value) {
  if (!isMediaRef(value) || !isNativeApp()) return;
  try {
    await Filesystem.deleteFile({
      path: value.slice(REF_PREFIX.length),
      directory: Directory.Data,
    });
  } catch {
    /* already gone */
  }
}

// Read a stored image back as a data URL (used when building a backup).
export async function readImageAsDataUrl(value) {
  if (!value) return "";
  if (!isMediaRef(value)) return value;
  const rel = value.slice(REF_PREFIX.length);
  try {
    const { data } = await Filesystem.readFile({
      path: rel,
      directory: Directory.Data,
      encoding: undefined,
    });
    const mime = rel.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${data}`;
  } catch {
    return "";
  }
}

export async function clearPortfolioImages(portfolioId) {
  if (!isNativeApp()) return;
  try {
    await Filesystem.rmdir({
      path: `portfolios/${portfolioId}/images`,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    /* none */
  }
}

// Native camera / gallery capture → data URL (async). Web returns "" so callers
// can fall back to a file input.
export async function capturePhoto(source = "camera") {
  if (!isNativeApp()) return "";
  try {
    const photo = await Camera.getPhoto({
      quality: 92,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source:
        source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      correctOrientation: true,
    });
    return photo.dataUrl || "";
  } catch {
    return "";
  }
}

export { Directory, Encoding };
