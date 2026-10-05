import { useMemo, useRef, useState } from "react";
import ArtworkEditor from "./ArtworkEditor";
import { useToast } from "./Toast";
import { makeId, placeholderStyle } from "../utils/helpers";
import { resolveMedia } from "../utils/media";
import {
  IconGrip,
  IconPlus,
  IconEdit,
  IconCopy,
  IconTrash,
  IconSearch,
  IconChevronRight,
  IconArrowUp,
  IconWorks,
} from "./Icons";

export default function WorksTab({ portfolio, update, quality = 0.85 }) {
  const toast = useToast();
  const artworks = portfolio.artworks;
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);
  const dragFrom = useRef(null);
  const dragTo = useRef(null);

  const setArtworks = (updater) =>
    update((p) => ({ ...p, artworks: updater(p.artworks) }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter((a) =>
      [a.title, a.medium, a.year, a.series]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [artworks, query]);

  function reorderById(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    setArtworks((list) => {
      const fi = list.findIndex((x) => x.id === fromId);
      const ti = list.findIndex((x) => x.id === toId);
      if (fi < 0 || ti < 0 || fi === ti) return list;
      const next = [...list];
      const [moved] = next.splice(fi, 1);
      next.splice(ti, 0, moved);
      return next;
    });
  }

  function startDrag(e, id) {
    e.preventDefault();
    dragFrom.current = id;
    dragTo.current = id;
    setDragging(id);
    setDragOver(id);

    const rowAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const row = el && el.closest("[data-work-id]");
      return row ? row.getAttribute("data-work-id") : null;
    };
    const onMove = (ev) => {
      const id2 = rowAt(ev.clientX, ev.clientY);
      if (id2 && id2 !== dragTo.current) {
        dragTo.current = id2;
        setDragOver(id2);
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      reorderById(dragFrom.current, dragTo.current);
      dragFrom.current = null;
      dragTo.current = null;
      setDragging(null);
      setDragOver(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function moveWork(id, dir) {
    setArtworks((list) => {
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeWork(a) {
    const snapshot = artworks;
    setArtworks((list) => list.filter((x) => x.id !== a.id));
    toast(`Removed “${a.title || "Untitled"}”`, () =>
      setArtworks(() => snapshot)
    );
  }

  function duplicateWork(a) {
    setArtworks((list) => {
      const i = list.findIndex((x) => x.id === a.id);
      const copy = {
        ...a,
        id: makeId(),
        title: `${a.title || "Untitled"} (copy)`,
      };
      const next = [...list];
      next.splice(i + 1, 0, copy);
      return next;
    });
    toast("Work duplicated");
  }

  function handleSave(draft) {
    if (draft.id) {
      setArtworks((list) => list.map((x) => (x.id === draft.id ? draft : x)));
      toast("Work updated");
    } else {
      setArtworks((list) => [...list, { ...draft, id: makeId() }]);
      toast("Work added");
    }
    setEditing(null);
  }

  return (
    <div className="panel">
      <div className="row row--between">
        <div className="section__title">
          {artworks.length} {artworks.length === 1 ? "work" : "works"}
        </div>
        <button
          className="btn btn-accent btn-sm"
          onClick={() => setEditing({})}
        >
          <IconPlus size={17} /> Add work
        </button>
      </div>

      {artworks.length > 3 ? (
        <div className="search-field">
          <IconSearch />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search works…"
          />
        </div>
      ) : null}

      {artworks.length === 0 ? (
        <div className="empty">
          <IconWorks className="empty__icon" />
          <div className="empty__title">No works yet</div>
          <p className="empty__text">
            Add your first piece — each work gets its own page with a large
            image, a detail shot and its details.
          </p>
          <button className="btn btn-primary" onClick={() => setEditing({})}>
            <IconPlus size={17} /> Add your first work
          </button>
        </div>
      ) : (
        <>
          <p className="hint">
            Drag the handle to reorder — the order sets the catalogue numbers.
          </p>
          <div className="work-list">
            {filtered.map((a, i) => (
              <div
                className={`work-row${
                  dragOver === a.id ? " drag-over" : ""
                }${dragging === a.id ? " dragging" : ""}`}
                key={a.id}
                data-work-id={a.id}
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
                <button
                  type="button"
                  className="drag-handle"
                  aria-label="Drag to reorder"
                  title="Drag to reorder"
                  onPointerDown={(e) => startDrag(e, a.id)}
                >
                  <IconGrip size={18} />
                </button>
                <div className="work-thumb">
                  {a.primaryThumbnail || a.primaryImage ? (
                    <img
                      src={resolveMedia(a.primaryThumbnail || a.primaryImage)}
                      alt=""
                    />
                  ) : (
                    <div
                      className="work-thumb__ph"
                      style={placeholderStyle(
                        (a.title || "") + (a.medium || "")
                      )}
                    />
                  )}
                </div>
                <div className="work-meta">
                  <div className="work-meta__title">
                    {a.title || "Untitled"}
                  </div>
                  <div className="work-meta__sub">
                    {[a.medium, a.year].filter(Boolean).join(", ") ||
                      "No details yet"}
                  </div>
                </div>
                <div className="work-actions">
                  <button
                    className="icon-btn"
                    aria-label="Move up"
                    title="Move up"
                    disabled={artworks[0]?.id === a.id}
                    onClick={() => moveWork(a.id, -1)}
                  >
                    <IconArrowUp size={18} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Duplicate"
                    title="Duplicate"
                    onClick={() => duplicateWork(a)}
                  >
                    <IconCopy size={18} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Edit"
                    title="Edit"
                    onClick={() => setEditing(a)}
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label="Remove"
                    title="Remove"
                    onClick={() => removeWork(a)}
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? (
              <p className="hint">No works match “{query}”.</p>
            ) : null}
          </div>
        </>
      )}

      {editing ? (
        <ArtworkEditor
          artwork={editing.id ? editing : null}
          portfolioId={portfolio.id}
          quality={quality}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
