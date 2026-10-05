// Folio — shared building blocks and ornaments used by every template layout.

import { STATUS_LABEL } from "../../store/portfolioStore";
import { frameHeight } from "../index";
import { resolveOrientation } from "../../utils/image";
import { resolveMedia } from "../../utils/media";
import {
  joinMeta,
  padNo,
  placeholderStyle,
  escapeHtml,
  instagramUrl,
  websiteUrl,
} from "../../utils/helpers";

/* ---------- ornaments ---------- */

export function Sparkle({ size = 18, className = "" }) {
  return (
    <svg
      className={`pf-sparkle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5c.5 4.1 1.5 6 3.3 7.8 1.8 1.8 3.7 2.8 7.7 3.3-4 .5-5.9 1.5-7.7 3.3-1.8 1.8-2.8 3.7-3.3 7.7-.5-4-1.5-5.9-3.3-7.7-1.8-1.8-3.7-2.8-7.7-3.3 4-.5 5.9-1.5 7.7-3.3C10.5 7.5 11.5 5.6 12 1.5Z" />
    </svg>
  );
}

// Micro-type pinned to the page corners (name, email, phone, year…).
export function CornerMeta({ topLeft, topRight, bottomLeft, bottomRight }) {
  const slots = { topLeft, topRight, bottomLeft, bottomRight };
  return (
    <div className="pf-corners" aria-hidden="true">
      {Object.entries(slots).map(([slot, value]) =>
        value ? (
          <span className={`pf-corner pf-corner--${slot}`} key={slot}>
            {value}
          </span>
        ) : null
      )}
    </div>
  );
}

export function Rule({ className = "" }) {
  return <span className={`pf-rule ${className}`} aria-hidden="true" />;
}

// Images are painted as CSS backgrounds rather than <img object-fit>, because
// html2canvas (used for PDF export) ignores object-fit and would stretch them.
export function ImageBox({ src, fit = "cover", className = "", style }) {
  const url = resolveMedia(src);
  if (!url) return null;
  return (
    <div
      className={`pf-img ${className}`}
      style={{
        backgroundImage: `url("${url}")`,
        backgroundSize: fit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...style,
      }}
    />
  );
}

/* ---------- content blocks ---------- */

export function Avatar({ artist, className = "" }) {
  if (!artist.avatar) return null;
  return (
    <div className={`pf-avatar ${className}`}>
      <ImageBox src={artist.avatarThumbnail || artist.avatar} fit="cover" />
    </div>
  );
}

export function Statement({ artist, label = "Artist statement" }) {
  if (!artist.statement) return null;
  return (
    <div className="pf-statement">
      <span className="pf-eyebrow">{label}</span>
      <p>{artist.statement}</p>
    </div>
  );
}

export function Contacts({ artist, className = "" }) {
  const items = [
    artist.location && `<span>${escapeHtml(artist.location)}</span>`,
    artist.email &&
      `<a href="mailto:${escapeHtml(artist.email)}">${escapeHtml(artist.email)}</a>`,
    artist.instagram &&
      `<a href="${instagramUrl(artist.instagram)}">@${escapeHtml(
        artist.instagram.replace(/^@/, "").trim()
      )}</a>`,
    artist.website &&
      `<a href="${websiteUrl(artist.website)}">${escapeHtml(artist.website)}</a>`,
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div
      className={`pf-contacts ${className}`}
      dangerouslySetInnerHTML={{ __html: items.join("") }}
    />
  );
}

export function Qr({ artist, qrDataUrl, className = "" }) {
  if (!artist.showQR || !qrDataUrl) return null;
  return (
    <div className={`pf-qr ${className}`}>
      <img src={qrDataUrl} alt="QR code" />
    </div>
  );
}

export function Divider({ label = "Portfolio", count }) {
  return (
    <div className="pf-divider">
      <span className="pf-divider__label">{label}</span>
      <span>
        {count} {count === 1 ? "work" : "works"}
      </span>
    </div>
  );
}

export function StatusChip({ status }) {
  if (!status || status === "available") return null;
  return (
    <span className={`pf-status pf-status--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ---------- image frames ---------- */

export function Frame({
  artwork,
  template,
  height,
  className = "",
  fit = "contain",
  style,
}) {
  const h = height ?? frameHeight(template, resolveOrientation(artwork));
  return (
    <div className={`pf-frame ${className}`} style={{ height: h, ...style }}>
      {artwork.primaryImage ? (
        <ImageBox src={artwork.primaryImage} fit={fit} />
      ) : (
        <div
          className="pf-placeholder"
          style={placeholderStyle((artwork.title || "") + (artwork.medium || ""))}
        />
      )}
    </div>
  );
}

export function Mount({ children, className = "" }) {
  return <div className={`pf-mount ${className}`}>{children}</div>;
}

export function Secondary({ artwork, height = 120 }) {
  return (
    <div className="pf-secondary" style={{ height }}>
      {artwork.secondaryImage ? (
        <ImageBox src={artwork.secondaryImage} fit="contain" />
      ) : (
        <div
          className="pf-placeholder"
          style={placeholderStyle("detail" + (artwork.title || ""))}
        />
      )}
    </div>
  );
}

export function Extras({ artwork }) {
  if (!artwork.extraImages || !artwork.extraImages.length) return null;
  return (
    <div className="pf-extras">
      {artwork.extraImages.map((src, ei) => (
        <div className="pf-extra" key={ei}>
          <ImageBox src={artwork.extraThumbnails?.[ei] || src} fit="cover" />
        </div>
      ))}
    </div>
  );
}

export function Details({ artwork, no, showNo = true, showMeta = true }) {
  return (
    <div className="pf-details">
      <div className="pf-plaque">
        <span className="pf-title">{artwork.title || "Untitled"}</span>
        <StatusChip status={artwork.status} />
      </div>
      {showMeta && joinMeta(artwork) ? (
        <div className="pf-meta">{joinMeta(artwork)}</div>
      ) : null}
      {artwork.series ? <div className="pf-series">{artwork.series}</div> : null}
      {artwork.description ? (
        <p className="pf-desc">{artwork.description}</p>
      ) : null}
      {showNo && no ? <div className="pf-no">No. {padNo(no)}</div> : null}
    </div>
  );
}

export function RuledDetails({ artwork }) {
  const rows = [
    ["Medium", artwork.medium],
    ["Year", artwork.year],
    ["Dimensions", artwork.dimensions],
    ["Series", artwork.series],
    ["Price", artwork.price],
    [
      "Status",
      artwork.status && artwork.status !== "available"
        ? STATUS_LABEL[artwork.status]
        : "",
    ],
  ].filter(([, v]) => v);
  return (
    <div className="pf-ruled">
      <div className="pf-ruled__row">
        <span>{artwork.title || "Untitled"}</span>
        <span>{artwork.year || ""}</span>
      </div>
      {rows.map(([k, v]) => (
        <div className="pf-ruled__row pf-ruled__row--soft" key={k}>
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
      {artwork.description ? (
        <p className="pf-desc pf-ruled__desc">{artwork.description}</p>
      ) : null}
    </div>
  );
}

/* First available image from a set of works — used by hero covers. */
export function firstImage(artworks) {
  const found = artworks.find((a) => a.primaryImage);
  return found ? resolveMedia(found.primaryImage) : "";
}

export function artistInitial(name) {
  return (name || "F").trim().charAt(0).toUpperCase();
}
