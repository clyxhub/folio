import { useState } from "react";
import { CV_SECTIONS } from "../store/portfolioStore";
import { useToast } from "./Toast";
import { makeId } from "../utils/helpers";
import { IconChevronRight, IconX } from "./Icons";

function emptyDraft() {
  return { title: "", sub: "", year: "", type: "Solo" };
}

export default function CVTab({ portfolio, update }) {
  const toast = useToast();
  const [open, setOpen] = useState(() => {
    const initial = {};
    CV_SECTIONS.forEach((s, i) => {
      initial[s.key] = (portfolio[s.key] || []).length > 0 || i === 0;
    });
    return initial;
  });
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(CV_SECTIONS.map((s) => [s.key, emptyDraft()]))
  );

  const setList = (key, updater) =>
    update((p) => ({ ...p, [key]: updater(p[key] || []) }));

  function addRow(section) {
    const draft = drafts[section.key];
    if (!draft.title.trim()) return;
    const row = {
      id: makeId(),
      [section.titleKey]: draft.title.trim(),
      [section.subKey]: draft.sub.trim(),
      year: draft.year.trim(),
    };
    if (section.withType) row.type = draft.type;
    setList(section.key, (list) => [...list, row]);
    setDrafts((d) => ({ ...d, [section.key]: emptyDraft() }));
  }

  function updateRow(section, id, field, value) {
    setList(section.key, (list) =>
      list.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function removeRow(section, row) {
    const snapshot = portfolio[section.key] || [];
    const label = row[section.titleKey] || "entry";
    setList(section.key, (list) => list.filter((r) => r.id !== row.id));
    toast(`Removed “${label}”`, () =>
      setList(section.key, () => snapshot)
    );
  }

  const total = CV_SECTIONS.reduce(
    (n, s) => n + (portfolio[s.key] || []).length,
    0
  );

  return (
    <div className="panel">
      <p className="hint">
        Your CV becomes its own page in the portfolio and the PDF. Fill in as
        much or as little as you like — empty sections are skipped.
      </p>

      {CV_SECTIONS.map((section) => {
        const rows = portfolio[section.key] || [];
        const isOpen = open[section.key];
        const draft = drafts[section.key];
        return (
          <div className={`collapse${isOpen ? " open" : ""}`} key={section.key}>
            <button
              type="button"
              className="collapse__head"
              onClick={() =>
                setOpen((o) => ({ ...o, [section.key]: !o[section.key] }))
              }
              aria-expanded={isOpen}
            >
              <IconChevronRight />
              <span className="collapse__label">{section.label}</span>
              <span className="collapse__count">{rows.length}</span>
            </button>

            {isOpen ? (
              <div className="collapse__body">
                {rows.map((row) => (
                  <div className="cv-edit-row" key={row.id}>
                    <input
                      className="input"
                      value={row[section.titleKey] || ""}
                      onChange={(e) =>
                        updateRow(
                          section,
                          row.id,
                          section.titleKey,
                          e.target.value
                        )
                      }
                      placeholder={section.titlePlaceholder}
                    />
                    <input
                      className="input"
                      value={row[section.subKey] || ""}
                      onChange={(e) =>
                        updateRow(
                          section,
                          row.id,
                          section.subKey,
                          e.target.value
                        )
                      }
                      placeholder={section.subPlaceholder}
                    />
                    {section.withType ? (
                      <select
                        className="select"
                        value={row.type || "Solo"}
                        onChange={(e) =>
                          updateRow(section, row.id, "type", e.target.value)
                        }
                      >
                        <option value="Solo">Solo</option>
                        <option value="Group">Group</option>
                      </select>
                    ) : null}
                    <input
                      className="input year-input"
                      value={row.year || ""}
                      onChange={(e) =>
                        updateRow(section, row.id, "year", e.target.value)
                      }
                      placeholder="Year"
                    />
                    <button
                      type="button"
                      className="row-remove"
                      aria-label="Remove entry"
                      onClick={() => removeRow(section, row)}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                ))}

                <div className="cv-add-row">
                  <input
                    className="input"
                    value={draft.title}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [section.key]: { ...d[section.key], title: e.target.value },
                      }))
                    }
                    placeholder={section.titlePlaceholder}
                  />
                  <input
                    className="input"
                    value={draft.sub}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [section.key]: { ...d[section.key], sub: e.target.value },
                      }))
                    }
                    placeholder={section.subPlaceholder}
                  />
                  {section.withType ? (
                    <select
                      className="select"
                      value={draft.type}
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [section.key]: {
                            ...d[section.key],
                            type: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="Solo">Solo</option>
                      <option value="Group">Group</option>
                    </select>
                  ) : null}
                  <input
                    className="input year-input"
                    value={draft.year}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [section.key]: { ...d[section.key], year: e.target.value },
                      }))
                    }
                    placeholder="Year"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => addRow(section)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}

      {total > 0 ? (
        <p className="hint">
          {total} CV {total === 1 ? "entry" : "entries"} will appear on the
          curriculum vitae page.
        </p>
      ) : null}
    </div>
  );
}
