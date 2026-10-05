import { useCallback, useEffect, useMemo, useState } from "react";
import Onboarding from "./components/Onboarding";
import PortfolioPicker from "./components/PortfolioPicker";
import Editor from "./components/Editor";
import { useToast } from "./components/Toast";
import { TEMPLATES } from "./templates";
import { initMedia } from "./utils/media";
import { initNative } from "./utils/native";
import {
  initStorage,
  loadPortfolioIndex,
  loadSettings,
  createPortfolio,
  loadPortfolio,
  deletePortfolio,
  persistPortfolio,
  duplicatePortfolio,
  setLastOpened,
} from "./store/portfolioStore";

const THEME_KEY = "folio-ui-theme";

function TemplateStyles() {
  const css = useMemo(() => TEMPLATES.map((t) => t.templateCSS).join("\n"), []);
  return <style>{css}</style>;
}

export default function App() {
  const toast = useToast();
  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState("picker");
  const [index, setIndex] = useState([]);
  const [portfolioId, setPortfolioId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const refreshIndex = useCallback(async () => {
    setIndex(await loadPortfolioIndex());
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await initStorage();
      await initMedia();
      initNative();
      const [idx, s] = await Promise.all([loadPortfolioIndex(), loadSettings()]);
      if (!alive) return;
      setIndex(idx);
      setSettings(s);
      setScreen(idx.length === 0 ? "onboarding" : "picker");
      setBooting(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openPortfolio = useCallback(async (id) => {
    await setLastOpened(id);
    setPortfolioId(id);
    setScreen("editor");
  }, []);

  const handleCreate = useCallback(
    async (name) => {
      const created = await createPortfolio(name);
      if (settings?.defaultTemplate && created.theme !== settings.defaultTemplate) {
        created.theme = settings.defaultTemplate;
        await persistPortfolio(created);
      }
      await refreshIndex();
      return created;
    },
    [settings, refreshIndex]
  );

  const handleDuplicate = useCallback(
    async (p) => {
      const copy = await duplicatePortfolio(p.id);
      await refreshIndex();
      if (copy) toast(`Duplicated “${p.name}”`);
    },
    [refreshIndex, toast]
  );

  const handleDelete = useCallback(
    async (p) => {
      const snapshot = await loadPortfolio(p.id);
      await deletePortfolio(p.id);
      await refreshIndex();
      toast(`Deleted “${p.name}”`, async () => {
        if (snapshot) {
          await persistPortfolio(snapshot);
          await refreshIndex();
        }
      });
    },
    [refreshIndex, toast]
  );

  if (booting) {
    return (
      <div className="app">
        <div className="app-shell">
          <div className="loading">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateStyles />
      <div className="app">
        <div className="app-shell">
          {screen === "onboarding" ? (
            <Onboarding
              theme={theme}
              onToggleTheme={toggleTheme}
              onCreate={async (name) => {
                const created = await handleCreate(name);
                await openPortfolio(created.id);
              }}
            />
          ) : null}

          {screen === "picker" ? (
            <PortfolioPicker
              portfolios={index}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpen={openPortfolio}
              onCreate={handleCreate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ) : null}

          {screen === "editor" && portfolioId ? (
            <Editor
              portfolioId={portfolioId}
              theme={theme}
              onToggleTheme={toggleTheme}
              onBack={async () => {
                await refreshIndex();
                setScreen("picker");
              }}
              onSaved={refreshIndex}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
