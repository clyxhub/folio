// Folio — QR code resolution and generation.
// `qrcode` is imported dynamically so it stays out of the initial bundle.

import { instagramUrl, websiteUrl } from "./helpers";

export function resolveQRTarget(artist) {
  const pref = artist?.qrTarget || "auto";
  if (pref === "website" && artist.website) return websiteUrl(artist.website);
  if (pref === "instagram" && artist.instagram)
    return instagramUrl(artist.instagram);
  if (pref === "email" && artist.email) return `mailto:${artist.email}`;
  if (artist?.website) return websiteUrl(artist.website);
  if (artist?.instagram) return instagramUrl(artist.instagram);
  if (artist?.email) return `mailto:${artist.email}`;
  return "";
}

export async function generateQRDataUrl(text, size = 160) {
  if (!text) return "";
  try {
    const { default: QRCode } = await import("qrcode");
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1C1A16", light: "#FFFFFF" },
    });
  } catch {
    return "";
  }
}
