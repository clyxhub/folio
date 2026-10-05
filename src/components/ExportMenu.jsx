// Folio — PDF export controls (real html2pdf render of an off-screen document).

import { useEffect, useRef, useState } from "react";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import PortfolioDocument from "./PortfolioDocument";
import { isNativeApp } from "../store/portfolioStore";
import { useToast } from "./Toast";
import { slugify } from "../utils/helpers";

// A4 printable area with the [8,6,8,6]mm margins (198×281mm). Every design page
// is sized to that aspect so one design page maps to exactly one PDF page.
const PDF_PAGE_H = 1078;
const PDF_PORTRAIT_WIDTH = 760;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ExportMenu({
  artist,
  artworks,
  portfolio,
  template,
  colors,
  font,
  qrDataUrl,
  compact = false,
}) {
  const toast = useToast();
  const pdfRef = useRef(null);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    if (!mode) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const el = pdfRef.current;
        if (!el) throw new Error("PDF document not ready");
        if (document.fonts?.ready) await document.fonts.ready;
        await Promise.all(
          Array.from(el.querySelectorAll("img")).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => {
                  img.onload = res;
                  img.onerror = res;
                })
          )
        );

        const { default: html2pdf } = await import("html2pdf.js");
        const filename = `${slugify(portfolio.name)}.pdf`;
        const options = {
          margin: [8, 6, 8, 6],
          filename,
          image: { type: "jpeg", quality: portfolio.pdfQuality || 0.85 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: colors.wall,
            logging: false,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["css", "legacy"] },
        };

        if (isNativeApp()) {
          const blob = await html2pdf().set(options).from(el).outputPdf("blob");
          const base64 = await blobToBase64(blob);
          const fileName = `folio-${Date.now()}.pdf`;
          await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Cache,
            recursive: true,
          });
          const { uri } = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Cache,
          });
          await Share.share({
            title: portfolio.name,
            text: `${portfolio.name} — Portfolio`,
            files: [uri],
          });
        } else if (mode === "share") {
          const blob = await html2pdf().set(options).from(el).outputPdf("blob");
          const file = new File([blob], filename, { type: "application/pdf" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: portfolio.name,
              text: `${portfolio.name} — Portfolio`,
            });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }
        } else {
          await html2pdf().set(options).from(el).save();
        }
        if (!cancelled) toast("PDF exported");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        if (!cancelled) toast("Couldn't export the PDF — please try again");
      } finally {
        if (!cancelled) setMode(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => setMode("download")}
        disabled={!!mode}
      >
        {mode ? "Preparing…" : "Export"}
      </button>
      {!compact ? (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setMode("share")}
          disabled={!!mode}
        >
          Share
        </button>
      ) : null}

      {mode ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: -10000,
            top: 0,
            width: PDF_PORTRAIT_WIDTH,
            zIndex: -1,
            pointerEvents: "none",
            "--pdf-page-h": `${PDF_PAGE_H}px`,
          }}
        >
          <PortfolioDocument
            rootRef={pdfRef}
            artist={artist}
            artworks={artworks}
            portfolio={portfolio}
            template={template}
            colors={colors}
            font={font}
            qrDataUrl={qrDataUrl}
            mode="pdf"
          />
        </div>
      ) : null}
    </>
  );
}
