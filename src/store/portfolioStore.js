// Folio — data model, persistence and portfolio CRUD.

import { makeId } from "../utils/helpers";
import {
  isNativeApp,
  setNativeMode,
  isNative,
  getPref,
  setPref,
  removePref,
  writePortfolioFile,
  readPortfolioFile,
  deletePortfolioDir,
} from "../utils/storage";

const INDEX_KEY = "folio-portfolio-index";
const SETTINGS_KEY = "folio-settings";
const LAST_OPENED_KEY = "folio-last-opened";

export const ARTWORK_DEFAULTS = {
  title: "",
  medium: "",
  year: "",
  dimensions: "",
  description: "",
  status: "available",
  price: "",
  series: "",
  orientation: "auto",
  primaryImage: "",
  primaryThumbnail: "",
  secondaryImage: "",
  secondaryThumbnail: "",
  extraImages: [],
  extraThumbnails: [],
};

export const ARTIST_DEFAULTS = {
  name: "",
  tagline: "",
  bio: "",
  statement: "",
  email: "",
  location: "",
  instagram: "",
  website: "",
  avatar: "",
  avatarThumbnail: "",
  showQR: false,
  qrTarget: "auto",
};

export const STATUS_LABEL = {
  available: "Available",
  sold: "Sold",
  nfs: "Not for sale",
  exhibiting: "Currently exhibiting",
  consignment: "On consignment",
};

// Drives the generic CV editor and the CV page renderer.
export const CV_SECTIONS = [
  {
    key: "education",
    label: "Education / Qualifications",
    heading: "Education / Qualifications",
    titleKey: "degree",
    subKey: "institution",
    titlePlaceholder: "Degree / qualification",
    subPlaceholder: "Institution",
  },
  {
    key: "exhibitions",
    label: "Exhibitions / Experience",
    heading: "Exhibitions / Experience",
    titleKey: "title",
    subKey: "venue",
    titlePlaceholder: "Exhibition title",
    subPlaceholder: "Venue, city",
    withType: true,
  },
  {
    key: "awards",
    label: "Awards",
    heading: "Awards",
    titleKey: "title",
    subKey: "issuer",
    titlePlaceholder: "Award name",
    subPlaceholder: "Awarded by",
  },
  {
    key: "press",
    label: "Press / Publications",
    heading: "Press / Publications",
    titleKey: "title",
    subKey: "outlet",
    titlePlaceholder: "Article / feature title",
    subPlaceholder: "Publication",
  },
  {
    key: "collections",
    label: "Collections",
    heading: "Collections",
    titleKey: "title",
    subKey: "holder",
    titlePlaceholder: "Work title",
    subPlaceholder: "Collection / holder",
  },
];

export const CV_KEYS = CV_SECTIONS.map((s) => s.key);

export const DEFAULT_SETTINGS = {
  compressionQuality: 0.85,
  defaultTemplate: "minimal",
};

function normalizeArtwork(a) {
  const merged = { ...ARTWORK_DEFAULTS, ...(a || {}) };
  merged.extraImages = Array.isArray(a?.extraImages) ? a.extraImages : [];
  merged.extraThumbnails = Array.isArray(a?.extraThumbnails)
    ? a.extraThumbnails
    : [];
  if (!merged.primaryThumbnail) merged.primaryThumbnail = merged.primaryImage;
  if (!merged.secondaryThumbnail)
    merged.secondaryThumbnail = merged.secondaryImage;
  return merged;
}

function normalizeArtist(a) {
  return { ...ARTIST_DEFAULTS, ...(a || {}) };
}

function normalizeList(list) {
  return Array.isArray(list) ? list.map((e) => ({ ...e, id: e?.id || makeId() })) : [];
}

export function normalizePortfolio(p) {
  const data = p || {};
  const portfolio = {
    id: data.id || makeId(),
    name: data.name || "Untitled Portfolio",
    created: data.created || new Date().toISOString(),
    updated: data.updated || new Date().toISOString(),
    artist: normalizeArtist(data.artist),
    artworks: (data.artworks || []).map(normalizeArtwork),
    theme: data.theme || "minimal",
    templateColors: data.templateColors || null,
    templateFont: data.templateFont || null,
    showTOC: data.showTOC !== false,
    pdfQuality: typeof data.pdfQuality === "number" ? data.pdfQuality : 0.85,
    pdfFormat: data.pdfFormat === "landscape" ? "landscape" : "portrait",
  };
  CV_KEYS.forEach((key) => {
    portfolio[key] = normalizeList(data[key]);
  });
  return portfolio;
}

export function emptyPortfolio(name) {
  return normalizePortfolio({
    id: makeId(),
    name: name || "Untitled Portfolio",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });
}

export { isNativeApp };

// ---------- Storage init ----------

export async function initStorage() {
  setNativeMode(isNativeApp());
}

export async function loadSettings() {
  const settings = await getPref(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

export async function saveSettings(settings) {
  await setPref(SETTINGS_KEY, settings);
}

// ---------- Index & last opened ----------

export async function loadPortfolioIndex() {
  const index = await getPref(INDEX_KEY);
  return Array.isArray(index) ? index : [];
}

export async function savePortfolioIndex(index) {
  await setPref(INDEX_KEY, index);
}

export async function getLastOpened() {
  return await getPref(LAST_OPENED_KEY);
}

export async function setLastOpened(id) {
  await setPref(LAST_OPENED_KEY, id);
}

async function touchIndex(portfolio) {
  const index = await loadPortfolioIndex();
  const entry = index.find((e) => e.id === portfolio.id);
  if (entry) {
    entry.name = portfolio.name;
    entry.updated = portfolio.updated;
  } else {
    index.push({
      id: portfolio.id,
      name: portfolio.name,
      created: portfolio.created,
      updated: portfolio.updated,
    });
  }
  await savePortfolioIndex(index);
}

// ---------- CRUD ----------

export async function createPortfolio(name) {
  const portfolio = emptyPortfolio(name);
  await persistPortfolio(portfolio);
  return portfolio;
}

export async function loadPortfolio(id) {
  if (!id) return null;
  try {
    const json = isNative()
      ? await readPortfolioFile(id)
      : localStorage.getItem(`folio-portfolio-${id}`);
    if (!json) return null;
    return normalizePortfolio(JSON.parse(json));
  } catch {
    return null;
  }
}

export async function persistPortfolio(portfolio) {
  portfolio.updated = new Date().toISOString();
  const json = JSON.stringify(portfolio);
  if (isNative()) {
    await writePortfolioFile(portfolio.id, json);
  } else {
    localStorage.setItem(`folio-portfolio-${portfolio.id}`, json);
  }
  await touchIndex(portfolio);
}

export async function deletePortfolio(id) {
  if (isNative()) {
    await deletePortfolioDir(id);
  } else {
    localStorage.removeItem(`folio-portfolio-${id}`);
  }
  const index = await loadPortfolioIndex();
  await savePortfolioIndex(index.filter((e) => e.id !== id));
  const lastOpened = await getLastOpened();
  if (lastOpened === id) await removePref(LAST_OPENED_KEY);
}

export async function duplicatePortfolio(id, newName) {
  const portfolio = await loadPortfolio(id);
  if (!portfolio) return null;
  const copy = normalizePortfolio({
    ...portfolio,
    id: makeId(),
    name: newName || `${portfolio.name} (copy)`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    artworks: portfolio.artworks.map((a) => ({ ...a, id: makeId() })),
  });
  CV_KEYS.forEach((key) => {
    copy[key] = portfolio[key].map((e) => ({ ...e, id: makeId() }));
  });
  await persistPortfolio(copy);
  return copy;
}

export async function renamePortfolio(id, newName) {
  const portfolio = await loadPortfolio(id);
  if (!portfolio) return;
  portfolio.name = newName;
  await persistPortfolio(portfolio);
}

// ---------- Backup / restore ----------

export function buildBackup(portfolio) {
  return JSON.stringify(
    { format: "folio-backup", version: 1, exportedAt: new Date().toISOString(), ...portfolio },
    null,
    2
  );
}

export function parseBackup(json) {
  const data = JSON.parse(json);
  if (!data || typeof data !== "object" || !Array.isArray(data.artworks)) {
    throw new Error("This file isn't a Folio backup.");
  }
  return data;
}

// Merge a parsed backup into the given portfolio id (keeping that id).
export function applyParsedPortfolio(data, id) {
  return normalizePortfolio({ ...data, id });
}
