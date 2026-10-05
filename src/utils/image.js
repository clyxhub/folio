// Folio — image capture, compression, thumbnails and orientation detection.

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawToDataUrl(img, maxDim, mime, quality) {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(mime, quality);
}

// Resize + compress an uploaded image so storage and PDFs stay reasonable.
export async function compressImage(file, maxDim = 1800, quality = 0.85) {
  const raw = await readFileAsDataURL(file);
  try {
    const img = await loadImage(raw);
    if (img.width <= maxDim && img.height <= maxDim && file.size < 900000) {
      return raw;
    }
    const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
    return drawToDataUrl(img, maxDim, mime, quality);
  } catch {
    return raw;
  }
}

export async function generateThumbnail(dataUrl, maxDim = 200) {
  try {
    const img = await loadImage(dataUrl);
    return drawToDataUrl(img, maxDim, "image/jpeg", 0.7);
  } catch {
    return dataUrl;
  }
}

export async function detectOrientation(dataUrl) {
  try {
    const img = await loadImage(dataUrl);
    const ratio = img.width / img.height;
    if (ratio > 1.05) return "landscape";
    if (ratio < 0.95) return "portrait";
    return "square";
  } catch {
    return "auto";
  }
}

// One-shot helper used by every image upload field.
export async function processImageFile(
  file,
  { maxDim = 1800, quality = 0.85, thumbMaxDim = 200 } = {}
) {
  const full = await compressImage(file, maxDim, quality);
  const thumbnail = await generateThumbnail(full, thumbMaxDim);
  const orientation = await detectOrientation(full);
  return { full, thumbnail, orientation };
}

export function resolveOrientation(artwork) {
  const o = artwork?.orientation;
  if (o === "portrait" || o === "landscape" || o === "square") return o;
  return "landscape";
}

// Resize/compress an already-loaded data URL (used for native camera captures).
export async function compressImageDataUrl(
  dataUrl,
  maxDim = 1800,
  quality = 0.85
) {
  if (!dataUrl) return "";
  try {
    const img = await loadImage(dataUrl);
    if (img.width <= maxDim && img.height <= maxDim) return dataUrl;
    return drawToDataUrl(img, maxDim, "image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}

export async function processImageDataUrl(
  input,
  { maxDim = 1800, quality = 0.85, thumbMaxDim = 200 } = {}
) {
  const full = await compressImageDataUrl(input, maxDim, quality);
  const thumbnail = await generateThumbnail(full, thumbMaxDim);
  const orientation = await detectOrientation(full);
  return { full, thumbnail, orientation };
}

// Accepts either a File (file input) or a data URL (native camera capture).
export async function processImageInput(input, opts) {
  if (typeof input === "string") return processImageDataUrl(input, opts);
  return processImageFile(input, opts);
}
