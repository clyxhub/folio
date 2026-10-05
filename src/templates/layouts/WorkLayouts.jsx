// Folio — work-page layouts, one per template genre.

import {
  Frame,
  Secondary,
  Extras,
  Details,
  RuledDetails,
  ImageBox,
} from "./parts";
import { padNo, placeholderStyle } from "../../utils/helpers";

/* Minimalist — one large image per page, quiet caption bar. */
export function WorkAiry({ items, template }) {
  return (
    <div className="pf-layout pf-layout--airy">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <Frame
            artwork={a}
            template={template}
            fit="cover"
            className="pf-frame--wide"
          />
          <div className="pf-airy__bar">
            <span className="pf-title">{a.title || "Untitled"}</span>
            <span className="pf-meta">
              {[a.medium, a.year].filter(Boolean).join(", ")}
            </span>
            <span className="pf-no">{padNo(no)}</span>
          </div>
          {a.description ? (
            <p className="pf-desc pf-airy__desc">{a.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* Aesthetic — a mounted image with a soft caption. */
export function WorkFramed({ items, template }) {
  return (
    <div className="pf-layout pf-layout--framed">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <div className="pf-mount">
            <Frame artwork={a} template={template} />
          </div>
          <div className="pf-caption">
            <Secondary artwork={a} />
            <Details artwork={a} no={no} />
          </div>
          <Extras artwork={a} />
        </div>
      ))}
    </div>
  );
}

/* Simple Professional — monochrome image with a ruled specification list. */
export function WorkEditorial({ items, template }) {
  return (
    <div className="pf-layout pf-layout--editorial">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <Frame
            artwork={a}
            template={template}
            fit="cover"
            className="pf-frame--bw pf-frame--wide"
          />
          <RuledDetails artwork={a} />
          <Extras artwork={a} />
        </div>
      ))}
    </div>
  );
}

/* Classic — bordered plate with a centred, formal caption. */
export function WorkPlate({ items, template }) {
  return (
    <div className="pf-layout pf-layout--plate">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <div className="pf-plate">
            <Frame artwork={a} template={template} />
          </div>
          <Details artwork={a} no={no} />
        </div>
      ))}
    </div>
  );
}

/* Vintage — double-bordered ornamental frame. */
export function WorkOrnate({ items, template }) {
  return (
    <div className="pf-layout pf-layout--ornate">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <div className="pf-ornate__frame">
            <Frame artwork={a} template={template} />
          </div>
          <Details artwork={a} no={no} />
        </div>
      ))}
    </div>
  );
}

/* Modern Creative — a large single image, or two side by side. */
export function WorkColumns({ items, template }) {
  const single = items.length === 1;
  const h = single
    ? undefined
    : Math.round((template.imageHeight || 420) * 0.66);
  return (
    <div
      className={`pf-layout pf-layout--columns${
        single ? " pf-layout--columns-single" : ""
      }`}
    >
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <Frame
            artwork={a}
            template={template}
            height={h}
            fit="cover"
            className={single ? "pf-frame--wide" : "pf-frame--fill"}
          />
          <Details artwork={a} no={no} showNo={false} />
        </div>
      ))}
    </div>
  );
}

/* Typographic — oversized catalogue numbers. */
export function WorkNumbered({ items, template }) {
  const h = Math.round((template.imageHeight || 420) * 0.58);
  return (
    <div className="pf-layout pf-layout--numbered">
      {items.map(({ a, no }) => (
        <div className="pf-item" key={a.id}>
          <div className="pf-number">{padNo(no)}</div>
          <Frame artwork={a} template={template} height={h} fit="cover" />
          <Details artwork={a} no={no} showNo={false} />
        </div>
      ))}
    </div>
  );
}

/* Scrapbook / Collage — rotated pieces with tape. */
export function WorkMasonry({ items, template }) {
  const base = template.imageHeight || 420;
  const bigH = Math.round(base * 0.82);
  const smallH = Math.round(base * 0.4);
  const [first, ...rest] = items;
  return (
    <div className="pf-layout pf-layout--masonry">
      <div className="pf-item pf-item--big">
        <span className="pf-tape" aria-hidden="true" />
        <Frame artwork={first.a} template={template} height={bigH} fit="cover" />
        <Details artwork={first.a} no={first.no} />
      </div>
      <div className="pf-stack">
        {rest.map(({ a, no }) => (
          <div className="pf-item pf-item--small" key={a.id}>
            <span className="pf-tape" aria-hidden="true" />
            <Frame artwork={a} template={template} height={smallH} fit="cover" />
            <div className="pf-small-caption">
              <span className="pf-title">{a.title || "Untitled"}</span>
              <span className="pf-no">{padNo(no)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Bold Neon — full-bleed image with an overlaid caption. */
export function WorkFullBleed({ items, template }) {
  const h = Math.round((template.imageHeight || 420) * 1.25);
  return (
    <div className="pf-layout pf-layout--fullbleed">
      {items.map(({ a, no }) => (
        <div className="pf-fullbleed" key={a.id} style={{ height: h }}>
          {a.primaryImage ? (
            <ImageBox
              className="pf-fullbleed__img"
              src={a.primaryImage}
              fit="cover"
            />
          ) : (
            <div
              className="pf-placeholder"
              style={placeholderStyle((a.title || "") + (a.medium || ""))}
            />
          )}
          <div className="pf-fullbleed__scrim" aria-hidden="true" />
          <div className="pf-fullbleed__caption">
            <Details artwork={a} no={no} />
          </div>
        </div>
      ))}
    </div>
  );
}
