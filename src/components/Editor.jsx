// Folio — canvas-first editor.
// Desktop: rail + panel + always-visible live canvas.
// Mobile: full-screen canvas with a bottom dock and slide-up sheets.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadPortfolio, persistPortfolio } from "../store/portfolioStore";
import { getTemplate, resolveColors, resolveFont } from "../templates";
import { resolveQRTarget, generateQRDataUrl } from "../utils/qr";
import { registerBackHandler, onAppPause } from "../utils/native";
import PortfolioDocument from "./PortfolioDocument";
import ScaledDocument from "./ScaledDocument";
import ExportMenu from "./ExportMenu";
import ThemeToggle from "./ThemeToggle";
import ProfileTab from "./ProfileTab";
import WorksTab from "./WorksTab";
import CVTab from "./CVTab";
import StyleTab from "./StyleTab";
import {
  IconArrowLeft,
  IconProfile,
  IconWorks,
  IconCV,
  IconStyle,
  IconUndo,
  IconRedo,
  IconX,
} from "./Icons";

const TOOLS = [
  { id: "profile", label: "Profile", Icon: IconProfile },
  { id: "works", label: "Works", Icon: IconWorks },
  { id: "cv", label: "CV", Icon: IconCV },
  { id: "style", label: "Style", Icon: IconStyle },
];

function SaveStatus({ status }) {
  const labels = { saving: "Saving…", saved: "Saved", error: "Couldn't save" };
  return (
    <span className={`save-status ${status}`}>
      <span className="save-status__dot" />
      {labels[status] || ""}
    </span>
  );
}

export default function Editor({
  portfolioId,
  onBack,
  theme,
  onToggleTheme,
  onSaved,
}) {
  const [portfolio, setPortfolio] = useState(null);
  const [tool, setTool] = useState("profile");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const loadedRef = useRef(false);
  const lastCommitted = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await loadPortfolio(portfolioId);
      if (!alive) return;
      setPortfolio(p);
      lastCommitted.current = p;
      setStatus(p ? "saved" : "");
      loadedRef.current = true;
    })();
    return () => {
      alive = false;
    };
  }, [portfolioId]);

  useEffect(() => {
    if (!portfolio || !loadedRef.current) return;
    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await persistPortfolio(portfolio);
        setStatus("saved");
        onSaved?.();
      } catch {
        setStatus("error");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [portfolio, onSaved]);

  // Undo/redo: snapshot settled edits (after a short idle).
  useEffect(() => {
    if (!portfolio) return undefined;
    const current = portfolio;
    const t = setTimeout(() => {
      if (lastCommitted.current && lastCommitted.current !== current) {
        setUndoStack((s) => [...s, lastCommitted.current].slice(-60));
        setRedoStack([]);
      }
      lastCommitted.current = current;
    }, 500);
    return () => clearTimeout(t);
  }, [portfolio]);

  const update = useCallback((patch) => {
    setPortfolio((prev) => {
      if (!prev) return prev;
      return typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
    });
  }, []);

  const undo = useCallback(() => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack((r) => [...r, portfolio].slice(-60));
    lastCommitted.current = prev;
    setPortfolio(prev);
  }, [undoStack, portfolio]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack((u) => [...u, portfolio].slice(-60));
    lastCommitted.current = next;
    setPortfolio(next);
  }, [redoStack, portfolio]);

  const artist = portfolio?.artist;
  useEffect(() => {
    if (!artist) return undefined;
    if (!artist.showQR) {
      setQrDataUrl("");
      return undefined;
    }
    let alive = true;
    generateQRDataUrl(resolveQRTarget(artist), 320).then((u) => {
      if (alive) setQrDataUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [
    artist?.showQR,
    artist?.qrTarget,
    artist?.website,
    artist?.instagram,
    artist?.email,
  ]);

  const template = useMemo(
    () => (portfolio ? getTemplate(portfolio.theme) : null),
    [portfolio]
  );
  const colors = useMemo(
    () => (template ? resolveColors(template, portfolio.templateColors) : null),
    [template, portfolio?.templateColors]
  );
  const font = useMemo(
    () => (template ? resolveFont(template, portfolio.templateFont) : null),
    [template, portfolio?.templateFont]
  );

  // Ctrl/Cmd+Z / Shift+Z
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const handleBack = useCallback(async () => {
    if (portfolio) {
      try {
        await persistPortfolio(portfolio);
      } catch {
        /* ignore */
      }
    }
    onBack();
  }, [portfolio, onBack]);

  // Android back button: close the tool sheet, otherwise leave the editor.
  useEffect(() => {
    const unregister = registerBackHandler(() => {
      if (sheetOpen) {
        setSheetOpen(false);
        return true;
      }
      handleBack();
      return true;
    });
    return unregister;
  }, [sheetOpen, handleBack]);

  // Flush a pending autosave when the app goes to the background.
  useEffect(() => {
    let cleanup = () => {};
    onAppPause(async () => {
      if (!portfolio) return;
      try {
        await persistPortfolio(portfolio);
      } catch {
        /* ignore */
      }
    }).then((fn) => {
      cleanup = fn;
    });
    return () => cleanup();
  }, [portfolio]);

  if (!portfolio || !template) {
    return (
      <>
        <header className="appbar">
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <IconArrowLeft />
          </button>
          <span className="appbar__title">Loading…</span>
        </header>
        <div className="loading">
          <div className="spinner" />
        </div>
      </>
    );
  }

  const renderPanel = () => {
    switch (tool) {
      case "works":
        return <WorksTab portfolio={portfolio} update={update} />;
      case "cv":
        return <CVTab portfolio={portfolio} update={update} />;
      case "style":
        return <StyleTab portfolio={portfolio} update={update} />;
      case "profile":
      default:
        return <ProfileTab portfolio={portfolio} update={update} />;
    }
  };

  const activeLabel = TOOLS.find((t) => t.id === tool)?.label || "";

  return (
    <>
      <header className="appbar">
        <button
          className="icon-btn"
          onClick={handleBack}
          aria-label="Back to portfolios"
        >
          <IconArrowLeft />
        </button>
        <div className="appbar__titles">
          <input
            className="appbar__rename"
            value={portfolio.name}
            onChange={(e) => update({ name: e.target.value })}
            aria-label="Portfolio name"
            spellCheck={false}
          />
          <SaveStatus status={status} />
        </div>
        <div className="appbar__actions">
          <button
            className="icon-btn"
            onClick={undo}
            disabled={!undoStack.length}
            aria-label="Undo"
            title="Undo"
          >
            <IconUndo />
          </button>
          <button
            className="icon-btn"
            onClick={redo}
            disabled={!redoStack.length}
            aria-label="Redo"
            title="Redo"
          >
            <IconRedo />
          </button>
          <span className="appbar__theme">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </span>
          <ExportMenu
            artist={portfolio.artist}
            artworks={portfolio.artworks}
            portfolio={portfolio}
            template={template}
            colors={colors}
            font={font}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </header>

      <div className="editor">
        <nav className="rail" role="tablist" aria-label="Editor sections">
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tool === id}
              className={`rail__btn${tool === id ? " active" : ""}`}
              onClick={() => {
                setTool(id);
                setSheetOpen(true);
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className={`editor__panel${sheetOpen ? " is-open" : ""}`}>
          <div className="editor__panel-head">
            <span className="editor__panel-title">{activeLabel}</span>
            <button
              type="button"
              className="icon-btn editor__panel-close"
              onClick={() => setSheetOpen(false)}
              aria-label="Close panel"
            >
              <IconX />
            </button>
          </div>
          <div className="editor__panel-body">{renderPanel()}</div>
        </section>

        <div className="editor__canvas">
          <div className="canvas__stage">
            <ScaledDocument>
              <PortfolioDocument
                artist={portfolio.artist}
                artworks={portfolio.artworks}
                portfolio={portfolio}
                template={template}
                colors={colors}
                font={font}
                qrDataUrl={qrDataUrl}
                mode="preview"
              />
            </ScaledDocument>
          </div>
        </div>

        <div
          className={`editor__backdrop${sheetOpen ? " is-open" : ""}`}
          onClick={() => setSheetOpen(false)}
        />
      </div>
    </>
  );
}
