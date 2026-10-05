import { useState } from "react";
import Mark from "./Mark";
import ThemeToggle from "./ThemeToggle";
import { IconSparkle } from "./Icons";

const FEATURES = [
  "8 gallery templates",
  "Export real PDFs",
  "QR code on the cover",
  "Works offline",
];

export default function Onboarding({ onCreate, theme, onToggleTheme }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await onCreate(name.trim() || "My Portfolio");
  }

  return (
    <div className="onboarding">
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="onboarding__hero">
        <Mark size={92} className="onboarding__mark" />
        <h1 className="onboarding__title">Folio</h1>
        <p className="onboarding__lead">
          Build a beautiful artist portfolio from your photos, then export it as
          a shareable PDF — right from your phone.
        </p>
        <div className="onboarding__features">
          {FEATURES.map((f) => (
            <span className="pill" key={f}>
              <IconSparkle size={13} />
              {f}
            </span>
          ))}
        </div>
      </div>

      <form className="card onboarding__card" onSubmit={submit}>
        <div className="field">
          <label htmlFor="first-portfolio">Name your first portfolio</label>
          <input
            id="first-portfolio"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Painting 2026, Gallery Submission…"
            autoComplete="off"
          />
          <p className="hint">
            You can rename it later, and keep as many portfolios as you like.
          </p>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Creating…" : "Start building"}
        </button>
      </form>
    </div>
  );
}
