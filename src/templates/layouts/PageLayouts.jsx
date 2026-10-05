// Folio — table-of-contents and CV page variants.

import { padNo, placeholderStyle } from "../../utils/helpers";
import { ImageBox } from "./parts";

/* ---------- Table of contents ---------- */

function TocRow({ entry, onJump }) {
  return (
    <div
      className="pf-toc__row"
      role={onJump ? "button" : undefined}
      onClick={onJump ? () => onJump(entry.no) : undefined}
      style={onJump ? { cursor: "pointer" } : undefined}
    >
      <span className="pf-toc__no">{padNo(entry.no)}</span>
      <span className="pf-toc__title">{entry.a.title || "Untitled"}</span>
      <span className="pf-toc__meta">
        {[entry.a.medium, entry.a.year].filter(Boolean).join(", ")}
      </span>
    </div>
  );
}

export function TocList({ groups, onJump }) {
  return (
    <div className="pf-toc">
      {groups.map((g) => (
        <div className="pf-toc__section" key={g.heading}>
          {g.heading ? <div className="pf-toc__heading">{g.heading}</div> : null}
          {g.entries.map((entry) => (
            <TocRow key={entry.no} entry={entry} onJump={onJump} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TocThumbs({ entries, onJump }) {
  return (
    <div className="pf-toc pf-toc--thumbs">
      <div className="pf-toc-grid">
        {entries.map((entry) => (
          <div
            className="pf-toc-card"
            key={entry.no}
            role={onJump ? "button" : undefined}
            onClick={onJump ? () => onJump(entry.no) : undefined}
            style={onJump ? { cursor: "pointer" } : undefined}
          >
            <div className="pf-toc-card__thumb">
              {entry.a.primaryThumbnail || entry.a.primaryImage ? (
                <ImageBox
                  src={entry.a.primaryThumbnail || entry.a.primaryImage}
                  fit="cover"
                />
              ) : (
                <div
                  className="pf-placeholder"
                  style={placeholderStyle(
                    (entry.a.title || "") + (entry.a.medium || "")
                  )}
                />
              )}
            </div>
            <div className="pf-toc-card__no">{padNo(entry.no)}</div>
            <div className="pf-toc-card__title">
              {entry.a.title || "Untitled"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TocIndex({ entries, onJump }) {
  return (
    <div className="pf-toc pf-toc--index">
      {entries.map((entry) => (
        <div
          className="pf-index-row"
          key={entry.no}
          role={onJump ? "button" : undefined}
          onClick={onJump ? () => onJump(entry.no) : undefined}
          style={onJump ? { cursor: "pointer" } : undefined}
        >
          <span className="pf-index-no">{padNo(entry.no)}</span>
          <span className="pf-index-title">{entry.a.title || "Untitled"}</span>
          <span className="pf-index-meta">
            {[entry.a.medium, entry.a.year].filter(Boolean).join(", ")}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- CV ---------- */

function CvRow({ row, section }) {
  return (
    <div className="pf-cv__row">
      <div className="pf-cv__year">{row.year || ""}</div>
      <div className="pf-cv__main">
        <div className="pf-cv__title">
          {row[section.titleKey] || ""}
          {section.withType && row.type ? (
            <span className="pf-cv__badge">{row.type}</span>
          ) : null}
        </div>
        {row[section.subKey] ? (
          <div className="pf-cv__sub">{row[section.subKey]}</div>
        ) : null}
      </div>
    </div>
  );
}

export function CvList({ blocks }) {
  return (
    <div className="pf-cv">
      {blocks.map(({ section, rows }) => (
        <div className="pf-cv__section" key={section.key}>
          <div className="pf-cv__heading">{section.heading}</div>
          {rows.map((row) => (
            <CvRow key={row.id} row={row} section={section} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CvColumns({ blocks }) {
  return (
    <div className="pf-cv pf-cv--cols">
      {blocks.map(({ section, rows }) => (
        <div className="pf-cv__section" key={section.key}>
          <div className="pf-cv__heading">{section.heading}</div>
          {rows.map((row) => (
            <CvRow key={row.id} row={row} section={section} />
          ))}
        </div>
      ))}
    </div>
  );
}
