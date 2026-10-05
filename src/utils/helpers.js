// Folio — small shared helpers.

let idCounter = 0;
export const makeId = () =>
  `id_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function instagramUrl(handle = "") {
  const clean = String(handle)
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "");
  return clean ? `https://instagram.com/${clean}` : "";
}

export function websiteUrl(site = "") {
  const trimmed = String(site).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function slugify(str = "") {
  return (
    String(str)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "portfolio"
  );
}

// html2canvas (used for PDF export) cannot parse `color-mix()`, so translucent
// accents are pre-computed into rgba() and exposed as CSS variables.
export function hexToRgba(hex, alpha = 1) {
  const h = String(hex || "").replace("#", "").trim();
  let r = 0;
  let g = 0;
  let b = 0;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length >= 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function padNo(n) {
  return String(n).padStart(3, "0");
}

export function joinMeta(a) {
  const parts = [];
  if (a?.medium) parts.push(a.medium);
  if (a?.year) parts.push(a.year);
  let meta = parts.join(", ");
  if (a?.dimensions) meta += `${meta ? " · " : ""}${a.dimensions}`;
  if (a?.price) meta += `${meta ? " · " : ""}${a.price}`;
  return meta;
}

const PLACEHOLDER_PAIRS = [
  ["#B08A4E", "#5B2A32"],
  ["#7C6A4F", "#2A2620"],
  ["#8A9A82", "#3A4436"],
  ["#4C5B6B", "#1D2429"],
  ["#A97C50", "#432D20"],
  ["#6E5B4F", "#231D18"],
];

function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function placeholderColors(seed) {
  return PLACEHOLDER_PAIRS[hashStr(seed || "untitled") % PLACEHOLDER_PAIRS.length];
}

export function placeholderStyle(seed) {
  const [c1, c2] = placeholderColors(seed);
  return {
    backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 7px), linear-gradient(135deg, ${c1}, ${c2})`,
  };
}
