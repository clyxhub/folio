// Folio — renders a document at a fixed page width and scales it to fit the
// available space, so the live preview is truly WYSIWYG (no clipping of the
// large display type on narrow screens).

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function ScaledDocument({
  pageWidth = 760,
  className = "",
  children,
}) {
  const hostRef = useRef(null);
  const innerRef = useRef(null);
  const [view, setView] = useState({ scale: 1, height: 0 });

  const measure = () => {
    const host = hostRef.current;
    const inner = innerRef.current;
    if (!host || !inner) return;
    const parent = host.parentElement;
    const avail = parent ? parent.clientWidth : host.clientWidth;
    const scale = Math.min(1, avail / pageWidth) || 1;
    setView({ scale, height: inner.scrollHeight * scale });
  };

  useLayoutEffect(measure, [pageWidth]);

  useEffect(() => {
    const host = hostRef.current;
    const inner = innerRef.current;
    if (!host || !inner || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    if (host.parentElement) ro.observe(host.parentElement);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className={`scaled-doc ${className}`}
      style={{ width: pageWidth * view.scale, height: view.height }}
    >
      <div
        ref={innerRef}
        className="scaled-doc__inner"
        style={{ width: pageWidth, transform: `scale(${view.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
