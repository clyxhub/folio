// Folio — backup export / import.
//
// Internally images may be file refs (native) or data URLs (web). A backup is
// always self-contained: on export every ref is read back to a data URL, and on
// import every data URL is written back to a file ref on native.

import { isNativeApp } from "./storage";
import { persistImage, readImageAsDataUrl, isMediaRef } from "./media";

const IMAGE_FIELDS = [
  "primaryImage",
  "primaryThumbnail",
  "secondaryImage",
  "secondaryThumbnail",
];
const EXTRA_FIELDS = ["extraImages", "extraThumbnails"];
const ARTIST_FIELDS = ["avatar", "avatarThumbnail"];

function isDataUrl(v) {
  return typeof v === "string" && v.startsWith("data:");
}

// Build a portable JSON backup (images inlined as data URLs).
export async function exportPortfolioForBackup(portfolio) {
  const clone = JSON.parse(JSON.stringify(portfolio));
  const tasks = [];

  (clone.artworks || []).forEach((a) => {
    IMAGE_FIELDS.forEach((f) => {
      if (isMediaRef(a[f])) {
        tasks.push(
          readImageAsDataUrl(a[f]).then((d) => {
            a[f] = d;
          })
        );
      }
    });
    EXTRA_FIELDS.forEach((f) => {
      if (!Array.isArray(a[f])) return;
      a[f].forEach((v, i) => {
        if (isMediaRef(v)) {
          tasks.push(
            readImageAsDataUrl(v).then((d) => {
              a[f][i] = d;
            })
          );
        }
      });
    });
  });

  const av = clone.artist || {};
  ARTIST_FIELDS.forEach((f) => {
    if (isMediaRef(av[f])) {
      tasks.push(
        readImageAsDataUrl(av[f]).then((d) => {
          av[f] = d;
        })
      );
    }
  });

  await Promise.all(tasks);
  return JSON.stringify(
    {
      format: "folio-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      ...clone,
    },
    null,
    2
  );
}

// Normalise a parsed backup for the current device: on native, write any
// inlined data-URL images to files and swap in refs.
export async function importPortfolioFromBackup(data, id) {
  const clone = JSON.parse(JSON.stringify(data));
  if (!isNativeApp()) return clone;
  const tasks = [];

  (clone.artworks || []).forEach((a, ai) => {
    IMAGE_FIELDS.forEach((f) => {
      if (isDataUrl(a[f])) {
        tasks.push(
          persistImage(a[f], id, `aw${ai}-${f}`).then((r) => {
            a[f] = r;
          })
        );
      }
    });
    EXTRA_FIELDS.forEach((f) => {
      if (!Array.isArray(a[f])) return;
      a[f].forEach((v, i) => {
        if (isDataUrl(v)) {
          tasks.push(
            persistImage(v, id, `aw${ai}-${f}${i}`).then((r) => {
              a[f][i] = r;
            })
          );
        }
      });
    });
  });

  const av = clone.artist || {};
  ARTIST_FIELDS.forEach((f) => {
    if (isDataUrl(av[f])) {
      tasks.push(
        persistImage(av[f], id, f).then((r) => {
          av[f] = r;
        })
      );
    }
  });

  await Promise.all(tasks);
  return clone;
}
