// Folio — a live, scaled cover thumbnail of a portfolio (used on the Home grid).

import { useEffect, useRef, useState } from "react";
import PortfolioDocument from "./PortfolioDocument";
import { getTemplate, resolveColors, resolveFont } from "../templates";

export default function CoverThumb({ portfolio }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.2);
  const template = getTemplate(portfolio.theme);
  const colors = resolveColors(template, portfolio.templateColors);
  const font = resolveFont(template, portfolio.templateFont);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setScale(el.clientWidth / 760);
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const trimmed = {
    ...portfolio,
    showTOC: false,
    education: [],
    exhibitions: [],
    awards: [],
    press: [],
    collections: [],
    artworks: portfolio.artworks.slice(0, 1),
  };

  return (
    <div className="cover-thumb" ref={ref}>
      <div
        className="cover-thumb__scaled"
        style={{ transform: `scale(${scale})` }}
      >
        <PortfolioDocument
          artist={portfolio.artist}
          artworks={trimmed.artworks}
          portfolio={trimmed}
          template={template}
          colors={colors}
          font={font}
          mode="mini"
        />
      </div>
    </div>
  );
}
