import { useEffect, useState } from "react";
import Mark from "./Mark";
import CoverThumb from "./CoverThumb";
import ThemeToggle from "./ThemeToggle";
import { useToast } from "./Toast";
import { loadPortfolio } from "../store/portfolioStore";
import {
  IconPlus,
  IconInfo,
  IconCopy,
  IconTrash,
  IconX,
  IconWorks,
} from "./Icons";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function AboutSheet({ onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="About Folio">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__header">
          <span className="sheet__title">About</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>
        <div className="sheet__body">
          <div className="about">
            <div className="about__head">
              <Mark size={56} className="about__mark" />
              <div>
                <div className="about__name">Folio</div>
                <div className="about__tag">Build your artist portfolio.</div>
              </div>
            </div>
            <ul className="about-list">
              <li>Keep separate portfolios for different submissions or shows.</li>
              <li>Add works straight from your camera roll and let each one lay itself out by its orientation.</li>
              <li>Write your profile, statement and a full CV across five sections.</li>
              <li>Choose from eight distinct gallery templates, each with its own palettes and type pairings.</li>
              <li>Drop a scannable QR code onto the cover.</li>
              <li>Export a real, shareable PDF or back the whole thing up as a file.</li>
            </ul>
            <p className="hint">
              Everything autosaves to this device as you type — close the app and
              pick up right where you left off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPicker({
  portfolios,
  onOpen,
  onCreate,
  onDuplicate,
  onDelete,
  theme,
  onToggleTheme,
}) {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [full, setFull] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        portfolios.map(async (p) => [p.id, await loadPortfolio(p.id)])
      );
      if (alive) setFull(Object.fromEntries(entries.filter(([, v]) => v)));
    })();
    return () => {
      alive = false;
    };
  }, [portfolios]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const created = await onCreate(name.trim() || "Untitled Portfolio");
      setName("");
      setCreating(false);
      if (created) onOpen(created.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="appbar">
        <div className="brand">
          <Mark size={32} />
          <div className="brand__text">
            <span className="brand__name">Folio</span>
            <span className="brand__tag">Build your artist portfolio</span>
          </div>
        </div>
        <div className="appbar__actions" style={{ marginLeft: "auto" }}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className="icon-btn"
            onClick={() => setAbout(true)}
            aria-label="About Folio"
          >
            <IconInfo />
          </button>
        </div>
      </header>

      <div className="scroll">
        <div className="picker-head">
          <div>
            <h2 className="picker-head__title">Your portfolios</h2>
            <div className="picker-head__count">
              {portfolios.length}{" "}
              {portfolios.length === 1 ? "portfolio" : "portfolios"}
            </div>
          </div>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => setCreating(true)}
          >
            <IconPlus size={17} /> New
          </button>
        </div>

        <div className="picker-list">
          {portfolios.length === 0 ? (
            <div className="empty">
              <IconWorks className="empty__icon" />
              <div className="empty__title">No portfolios yet</div>
              <p className="empty__text">
                Create your first portfolio and start adding your work.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setCreating(true)}
              >
                <IconPlus size={17} /> New portfolio
              </button>
            </div>
          ) : (
            portfolios.map((p, i) => (
              <div
                className="portfolio-card"
                key={p.id}
                role="button"
                tabIndex={0}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => onOpen(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen(p.id);
                  }
                }}
              >
                {full[p.id] ? (
                  <CoverThumb portfolio={full[p.id]} />
                ) : (
                  <div className="portfolio-card__mark">
                    {(p.name || "F").trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="portfolio-card__body">
                  <div className="portfolio-card__name">{p.name}</div>
                  <div className="portfolio-card__meta">
                    Edited {formatDate(p.updated)}
                  </div>
                </div>
                <div className="portfolio-card__actions">
                  <button
                    className="icon-btn"
                    aria-label={`Duplicate ${p.name}`}
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(p);
                    }}
                  >
                    <IconCopy size={19} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label={`Delete ${p.name}`}
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p);
                    }}
                  >
                    <IconTrash size={19} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {creating ? (
        <div
          className="sheet-backdrop"
          onClick={() => setCreating(false)}
          role="dialog"
          aria-modal="true"
          aria-label="New portfolio"
        >
          <form
            className="sheet"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
          >
            <div className="sheet__header">
              <span className="sheet__title">New portfolio</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setCreating(false)}
                aria-label="Close"
              >
                <IconX />
              </button>
            </div>
            <div className="sheet__body">
              <div className="field">
                <label htmlFor="new-portfolio-name">Portfolio name</label>
                <input
                  id="new-portfolio-name"
                  className="input"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Landscape Series 2026"
                />
              </div>
            </div>
            <div className="sheet__footer">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={busy}
              >
                {busy ? "Creating…" : "Create portfolio"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {about ? <AboutSheet onClose={() => setAbout(false)} /> : null}
    </>
  );
}
