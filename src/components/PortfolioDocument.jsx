// Folio — the portfolio document dispatcher.
// Picks the template's cover / work / TOC / CV layouts and chunks the works
// into pages. Rendered by the live preview, the PDF export and mini-previews.

import { useMemo } from "react";
import { CV_SECTIONS } from "../store/portfolioStore";
import { chunkWorks } from "../utils/paginate";
import { hexToRgba } from "../utils/helpers";
import {
  COVERS,
  WORK_LAYOUTS,
  TOC_LAYOUTS,
  CV_LAYOUTS,
} from "../templates/layouts";

function PageBack({ mode, onBack }) {
  if (mode !== "preview" || !onBack) return null;
  return (
    <button className="pf-back" onClick={onBack}>
      ↑ Back to profile
    </button>
  );
}

export default function PortfolioDocument({
  artist,
  artworks,
  portfolio,
  template,
  colors,
  font,
  qrDataUrl,
  mode = "preview",
  onJump,
  onBack,
  rootRef,
}) {
  const Cover = COVERS[template.cover] || COVERS.minimal;
  const WorkLayout = WORK_LAYOUTS[template.works] || WORK_LAYOUTS.airy;
  const TocLayout = TOC_LAYOUTS[template.toc] || TOC_LAYOUTS.list;
  const CvLayout = CV_LAYOUTS[template.cv] || CV_LAYOUTS.list;

  const showTOC = portfolio?.showTOC !== false && artworks.length > 1;
  const showBio = !!artist.bio && !template.bioOnCover;
  const showStatement = !!artist.statement;
  const showBioPage = showBio || showStatement;
  const cvBlocks = CV_SECTIONS.map((section) => ({
    section,
    rows: portfolio?.[section.key] || [],
  })).filter((b) => b.rows.length);
  const hasCV = cvBlocks.length > 0;

  const entries = useMemo(
    () => artworks.map((a, i) => ({ a, no: i + 1 })),
    [artworks]
  );

  const groups = useMemo(() => {
    const bySeries = {};
    const order = [];
    const noSeries = [];
    entries.forEach((e) => {
      if (e.a.series && e.a.series.trim()) {
        if (!bySeries[e.a.series]) {
          bySeries[e.a.series] = [];
          order.push(e.a.series);
        }
        bySeries[e.a.series].push(e);
      } else {
        noSeries.push(e);
      }
    });
    const g = order.map((s) => ({ heading: s, entries: bySeries[s] }));
    if (noSeries.length) {
      g.push({
        heading: order.length ? "Other works" : "",
        entries: noSeries,
      });
    }
    return g;
  }, [entries]);

  const pages = useMemo(
    () => chunkWorks(artworks, template.worksPerPage || 1),
    [artworks, template.worksPerPage]
  );

  const styleVars = {
    "--wall": colors.wall,
    "--paper": colors.paper,
    "--ink": colors.ink,
    "--muted": colors.muted,
    "--accent": colors.accent,
    "--line": colors.line,
    "--accent-soft": hexToRgba(colors.accent, 0.4),
    "--heading-font": font.heading,
    "--body-font": font.body,
    "--cover-size": template.headingSize,
    "--tagline-size": template.taglineSize,
    "--body-size": template.bodySize,
    "--space": template.spacing,
  };

  return (
    <div
      ref={rootRef}
      className={`folio-doc ${template.cssClass}${
        mode === "pdf" ? " folio-doc--pdf" : ""
      }${mode === "mini" ? " mini-doc" : ""}`}
      style={styleVars}
    >
      <section className="pf-page pf-coverpage" data-page="cover">
        <Cover
          artist={artist}
          artworks={artworks}
          qrDataUrl={qrDataUrl}
          template={template}
        />
      </section>

      {showBioPage ? (
        <section className="pf-page pf-biopage" data-page="bio">
          <div className="pf-bio">
            {showBio ? (
              <div className="pf-bio__block">
                <span className="pf-bio__eyebrow">Biography</span>
                <p className="pf-bio__text">{artist.bio}</p>
              </div>
            ) : null}
            {showStatement ? (
              <div className="pf-bio__block">
                <span className="pf-bio__eyebrow">Artist statement</span>
                <p className="pf-bio__text">{artist.statement}</p>
              </div>
            ) : null}
          </div>
          <PageBack mode={mode} onBack={onBack} />
        </section>
      ) : null}

      {showTOC ? (
        <section className="pf-page pf-tocpage" data-page="toc">
          <div className="pf-section-head">
            <span className="pf-divider__label">Contents</span>
          </div>
          <TocLayout groups={groups} entries={entries} onJump={onJump} />
          <PageBack mode={mode} onBack={onBack} />
        </section>
      ) : null}

      {hasCV ? (
        <section className="pf-page pf-cvpage" data-page="cv">
          <div className="pf-section-head">
            <span className="pf-divider__label">Curriculum vitae</span>
          </div>
          <CvLayout blocks={cvBlocks} />
          <PageBack mode={mode} onBack={onBack} />
        </section>
      ) : null}

      {pages.map((items, pi) => (
        <section
          className="pf-page pf-workspage"
          key={pi}
          data-page="work"
          data-work-nos={items.map((i) => i.no).join(" ")}
        >
          <WorkLayout items={items} template={template} mode={mode} />
          <PageBack mode={mode} onBack={onBack} />
        </section>
      ))}
    </div>
  );
}
