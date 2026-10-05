import { useEffect, useMemo, useRef, useState } from "react";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplate,
  resolveColors,
  resolveFont,
} from "../templates";
import PortfolioDocument from "./PortfolioDocument";
import { useToast } from "./Toast";
import {
  isNativeApp,
  parseBackup,
  applyParsedPortfolio,
  CV_KEYS,
} from "../store/portfolioStore";
import {
  exportPortfolioForBackup,
  importPortfolioFromBackup,
} from "../utils/backup";
import { slugify } from "../utils/helpers";
import { IconCheck, IconDownload, IconShare, IconTrash } from "./Icons";

function MiniPreview({ template, colors, font, portfolio }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    const update = () => setScale(el.clientWidth / 760);
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="template-card__preview" ref={hostRef}>
      <div
        className="template-card__scaled"
        style={{ transform: `scale(${scale})` }}
      >
        <PortfolioDocument
          artist={portfolio.artist}
          artworks={portfolio.artworks}
          portfolio={portfolio}
          template={template}
          colors={colors}
          font={font}
          mode="mini"
        />
      </div>
    </div>
  );
}

export default function StyleTab({ portfolio, update }) {
  const toast = useToast();
  const template = getTemplate(portfolio.theme);
  const colors = resolveColors(template, portfolio.templateColors);
  const font = resolveFont(template, portfolio.templateFont);
  const [importError, setImportError] = useState("");
  const [category, setCategory] = useState("All");

  const miniPortfolio = useMemo(
    () => ({
      ...portfolio,
      showTOC: false,
      education: [],
      exhibitions: [],
      awards: [],
      press: [],
      collections: [],
      artworks: portfolio.artworks.slice(0, 1),
    }),
    [portfolio]
  );

  function selectTemplate(id) {
    update((p) => ({
      ...p,
      theme: id,
      templateColors: null,
      templateFont: null,
    }));
  }

  const visibleTemplates = useMemo(
    () =>
      category === "All"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.category === category),
    [category]
  );

  function downloadBackup() {
    return saveBackup(false);
  }

  const native = isNativeApp();

  async function saveBackup(share) {
    try {
      const json = await exportPortfolioForBackup(portfolio);
      const fileName = `${slugify(portfolio.name)}-folio.json`;
      if (!native) {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast("Backup downloaded");
        return;
      }
      if (share) {
        await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        const { uri } = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });
        await Share.share({
          title: `${portfolio.name} backup`,
          text: `${portfolio.name} — Folio backup`,
          files: [uri],
        });
      } else {
        await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        toast("Backup saved to Documents");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast("Couldn't create the backup");
    }
  }

  function importBackup(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = parseBackup(String(reader.result));
        const hydrated = await importPortfolioFromBackup(data, portfolio.id);
        const applied = applyParsedPortfolio(hydrated, portfolio.id);
        update(() => applied);
        setImportError("");
        toast("Backup restored");
      } catch (err) {
        setImportError(err.message || "Couldn't read that backup file.");
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    const snapshot = portfolio;
    update((p) => ({
      ...p,
      artist: {
        ...p.artist,
        name: p.artist.name,
        tagline: "",
        bio: "",
        statement: "",
        email: "",
        location: "",
        instagram: "",
        website: "",
        avatar: "",
        avatarThumbnail: "",
      },
      artworks: [],
      ...Object.fromEntries(CV_KEYS.map((k) => [k, []])),
    }));
    toast("Cleared profile, works and CV", () => update(() => snapshot));
  }

  return (
    <div className="panel">
      <section className="section">
        <div className="section__title">Template</div>
        <div className="chips" role="tablist" aria-label="Template categories">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`chip-filter${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="template-grid">
          {visibleTemplates.map((t) => {
            const active = t.id === portfolio.theme;
            const tColors = active ? colors : t.colors[0];
            const tFont = active ? font : t.fonts[0];
            return (
              <button
                type="button"
                key={t.id}
                className={`template-card${active ? " active" : ""}`}
                onClick={() => selectTemplate(t.id)}
                aria-pressed={active}
              >
                <MiniPreview
                  template={t}
                  colors={tColors}
                  font={tFont}
                  portfolio={miniPortfolio}
                />
                <div className="template-card__meta">
                  <div className="template-card__name">
                    <span>{t.name}</span>
                    {active ? (
                      <span className="template-card__check">
                        <IconCheck size={11} />
                      </span>
                    ) : null}
                  </div>
                  <div className="template-card__desc">{t.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__title">Palette</div>
        <div className="swatches">
          {template.colors.map((c) => {
            const active = colors.id === c.id;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  className={`swatch${active ? " active" : ""}`}
                  style={{
                    background: `linear-gradient(140deg, ${c.paper} 0 46%, ${c.wall} 46% 72%, ${c.accent} 72% 100%)`,
                  }}
                  onClick={() => update((p) => ({ ...p, templateColors: c.id }))}
                  title={c.name}
                  aria-label={c.name}
                >
                  {active ? (
                    <span
                      className="swatch__check"
                      style={{ color: c.ink }}
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
                <span className="swatch__label">{c.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__title">Type pairing</div>
        <div className="font-options">
          {template.fonts.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`font-option${font.id === f.id ? " active" : ""}`}
              onClick={() => update((p) => ({ ...p, templateFont: f.id }))}
            >
              <div
                className="font-option__sample"
                style={{ fontFamily: f.heading, color: colors.ink }}
              >
                Aa
              </div>
              <div className="font-option__name">{f.name}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__title">Cover</div>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={portfolio.showTOC !== false}
            onChange={(e) => update({ showTOC: e.target.checked })}
          />
          Table of contents page
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={!!portfolio.artist.showQR}
            onChange={(e) =>
              update((p) => ({
                ...p,
                artist: { ...p.artist, showQR: e.target.checked },
              }))
            }
          />
          QR code on the cover
        </label>
        {portfolio.artist.showQR ? (
          <div className="field">
            <label htmlFor="qr-target">QR links to</label>
            <select
              id="qr-target"
              className="select"
              value={portfolio.artist.qrTarget || "auto"}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  artist: { ...p.artist, qrTarget: e.target.value },
                }))
              }
            >
              <option value="auto">Auto (website → Instagram → email)</option>
              <option value="website">Website</option>
              <option value="instagram">Instagram</option>
              <option value="email">Email</option>
            </select>
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="section__title">PDF</div>
        <p className="hint">
          Exports as a print-ready A4 portrait PDF.
        </p>
        <div className="field">
          <label htmlFor="pdf-quality">
            Image quality — {Math.round((portfolio.pdfQuality || 0.85) * 100)}%
          </label>
          <input
            id="pdf-quality"
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={portfolio.pdfQuality || 0.85}
            onChange={(e) =>
              update({ pdfQuality: Number(e.target.value) })
            }
          />
        </div>
      </section>

      <section className="section">
        <div className="section__title">Data & backup</div>
        <p className="hint">
          Everything autosaves to this device. Download a backup to keep it
          safe, move it to another device, or restore after clearing your
          browser.
        </p>
        <div className="backup-row">
          <button className="btn btn-secondary btn-sm" onClick={downloadBackup}>
            <IconDownload size={16} />{" "}
            {native ? "Save backup" : "Download backup"}
          </button>
          {native ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => saveBackup(true)}
            >
              <IconShare size={16} /> Share backup
            </button>
          ) : null}
          <label className="btn btn-secondary btn-sm">
            Restore backup
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={importBackup}
            />
          </label>
        </div>
        {importError ? (
          <p className="hint" style={{ color: "var(--danger)" }}>
            {importError}
          </p>
        ) : null}
        <button className="btn btn-danger btn-sm" onClick={clearAll}>
          <IconTrash size={16} /> Clear profile, works & CV
        </button>
      </section>
    </div>
  );
}
