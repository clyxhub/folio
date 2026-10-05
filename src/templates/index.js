// Folio — nine portfolio templates, recreated from Canva's real template
// genres. Each entry is a full system: a category, a layout recipe (cover /
// work / TOC / CV layouts + works-per-page), colour palettes, font pairings,
// and `templateCSS` that gives the shared layouts their character.

const FONTS = {
  sans: { id: "sans", name: "Inter", heading: `"Inter", system-ui, sans-serif`, body: `"Inter", system-ui, sans-serif` },
  serif: { id: "serif", name: "Fraunces / Inter", heading: `"Fraunces", Georgia, serif`, body: `"Inter", system-ui, sans-serif` },
  serifBody: { id: "serifBody", name: "Fraunces (all)", heading: `"Fraunces", Georgia, serif`, body: `"Fraunces", Georgia, serif` },
  mono: { id: "mono", name: "Space Mono / Inter", heading: `"Space Mono", ui-monospace, monospace`, body: `"Inter", system-ui, sans-serif` },
  condensed: { id: "condensed", name: "Bebas Neue / Inter", heading: `"Bebas Neue", "Inter", sans-serif`, body: `"Inter", system-ui, sans-serif` },
  hand: { id: "hand", name: "Caveat / Inter", heading: `"Caveat", cursive`, body: `"Inter", system-ui, sans-serif` },
  display: { id: "display", name: "Playfair Display / Inter", heading: `"Playfair Display", Georgia, serif`, body: `"Inter", system-ui, sans-serif` },
};

const P = (id, name, wall, paper, ink, muted, accent, line) => ({ id, name, wall, paper, ink, muted, accent, line });

export const TEMPLATE_CATEGORIES = [
  "All",
  "Minimal",
  "Professional",
  "Classic",
  "Creative",
  "Bold",
];

export const TEMPLATES = [
  {
    id: "minimalist",
    name: "Minimalist",
    category: "Minimal",
    description: "Dark full-bleed photo with oversized lowercase display type.",
    cover: "minimalist",
    works: "airy",
    worksPerPage: 1,
    toc: "list",
    cv: "list",
    headingSize: "40px",
    taglineSize: "12px",
    bodySize: "14px",
    spacing: "56px",
    imageHeight: 420,
    colors: [
      P("noir", "Noir", "#0E0E0E", "#131313", "#F4F4F4", "#9A9A9A", "#EDEDED", "rgba(255,255,255,0.16)"),
      P("charcoal", "Charcoal", "#17181A", "#1E2023", "#F0F1F2", "#99A0A6", "#C9A227", "rgba(255,255,255,0.16)"),
      P("mono", "Mono Light", "#F2F2F0", "#FFFFFF", "#101010", "#6E6E6A", "#111111", "rgba(0,0,0,0.12)"),
      P("forest-night", "Forest Night", "#0D1512", "#12201B", "#E6F0EC", "#86988F", "#4FB98A", "rgba(255,255,255,0.16)"),
    ],
    fonts: [FONTS.sans, FONTS.condensed, FONTS.mono],
    templateCSS: `
      .tm-minimalist { --page-pad: 52px; }
      .tm-minimalist .pf-display { font-weight: 300; }
      .tm-minimalist .pf-title { font-style: normal; font-weight: 600; }
      .tm-minimalist .pf-airy__bar .pf-title { font-weight: 700; font-size: 18px; }
    `,
  },

  {
    id: "aesthetic",
    name: "Aesthetic",
    category: "Minimal",
    description: "Soft textured page, a large framed image and a bold title.",
    cover: "aesthetic",
    works: "framed",
    worksPerPage: 1,
    toc: "list",
    cv: "list",
    headingSize: "38px",
    taglineSize: "15px",
    bodySize: "14px",
    spacing: "58px",
    imageHeight: 460,
    colors: [
      P("beige-green", "Beige Green", "#E9EDE2", "#F7F9F2", "#23271D", "#7E8770", "#2F6B4F", "rgba(35,39,29,0.10)"),
      P("blue-white", "Blue White", "#E6ECF3", "#F7FAFD", "#1D2733", "#6F7C8C", "#2C6CA6", "rgba(29,39,51,0.10)"),
      P("sage-pink", "Sage Pink", "#EFE7E6", "#FBF5F4", "#2A2223", "#907F82", "#C98B9A", "rgba(42,34,35,0.10)"),
      P("sand", "Sand", "#F0EADF", "#FBF7EF", "#2E271C", "#8C8068", "#C2A05B", "rgba(46,39,28,0.10)"),
      P("lavender", "Lavender", "#ECE8F2", "#F8F6FC", "#262232", "#7E7890", "#8E7CC3", "rgba(38,34,50,0.10)"),
    ],
    fonts: [FONTS.sans, FONTS.serifBody, FONTS.serif],
    templateCSS: `
      .tm-aesthetic { --page-pad: 52px; }
      .tm-aesthetic .pf-frame { border-radius: 0; }
      .tm-aesthetic .pf-title { font-style: normal; font-weight: 600; }
      .tm-aesthetic .pf-mount { padding: 14px; }
    `,
  },

  {
    id: "simple",
    name: "Simple Professional",
    category: "Professional",
    description: "Black-and-white editorial lockup with ruled specifications.",
    cover: "simple",
    works: "editorial",
    worksPerPage: 1,
    toc: "list",
    cv: "columns",
    headingSize: "40px",
    taglineSize: "14px",
    bodySize: "13.5px",
    spacing: "52px",
    imageHeight: 440,
    colors: [
      P("almost-white", "Almost White", "#F4F4F2", "#FFFFFF", "#101010", "#6E6E6A", "#8A6A2F", "rgba(0,0,0,0.10)"),
      P("navy", "Navy", "#E8EBEF", "#FBFCFD", "#141B24", "#66707D", "#2F4B6E", "rgba(20,27,36,0.10)"),
      P("warm-gray", "Warm Gray", "#EFEDE9", "#FFFFFF", "#1C1A17", "#7A756C", "#8A6D48", "rgba(28,26,23,0.10)"),
      P("slate", "Slate", "#EAEBEC", "#FAFBFB", "#1B1E21", "#6C7278", "#3E5A78", "rgba(27,30,33,0.10)"),
    ],
    fonts: [FONTS.serif, FONTS.serifBody, FONTS.sans],
    templateCSS: `
      .tm-simple { --page-pad: 54px; }
      .tm-simple .pf-simple__serif { letter-spacing: -0.01em; }
      .tm-simple .pf-title { font-style: normal; font-weight: 600; }
      .tm-simple .pf-cv--cols { column-rule: 1px solid var(--line); }
    `,
  },

  {
    id: "classic",
    name: "Classic",
    category: "Classic",
    description: "Huge italic serif with small-caps corner labels.",
    cover: "classic",
    works: "plate",
    worksPerPage: 1,
    toc: "list",
    cv: "columns",
    headingSize: "38px",
    taglineSize: "15px",
    bodySize: "14px",
    spacing: "60px",
    imageHeight: 470,
    colors: [
      P("black-beige", "Black & Beige", "#EDE6DA", "#FAF6EE", "#171412", "#7C766C", "#8A6D3B", "rgba(23,20,18,0.12)"),
      P("ivory", "Ivory", "#F0EBE1", "#FCFAF4", "#2A2419", "#857A66", "#9A7B45", "rgba(42,36,25,0.12)"),
      P("museum", "Museum", "#E7E7E4", "#F6F6F4", "#1D1D1B", "#77776F", "#6B7280", "rgba(29,29,27,0.12)"),
      P("navy-tan", "Navy & Tan", "#E5E7EA", "#F7F8FA", "#1A2230", "#6D7686", "#A67C52", "rgba(26,34,48,0.12)"),
    ],
    fonts: [FONTS.display, FONTS.serif, FONTS.serifBody],
    templateCSS: `
      .tm-classic { --page-pad: 54px; }
      .tm-classic .pf-classic__title { font-weight: 400; }
      .tm-classic .pf-title { font-size: 19px; }
      .tm-classic .pf-cv__row { border-bottom-style: dotted; }
      .tm-classic .pf-section-head { justify-content: center; }
      .tm-classic .pf-toc__heading, .tm-classic .pf-cv__heading { text-align: center; }
    `,
  },

  {
    id: "vintage",
    name: "Vintage",
    category: "Classic",
    description: "Ornate double frame, engraved display and a name plaque.",
    cover: "vintage",
    works: "ornate",
    worksPerPage: 1,
    toc: "list",
    cv: "list",
    headingSize: "38px",
    taglineSize: "15px",
    bodySize: "14px",
    spacing: "58px",
    imageHeight: 460,
    colors: [
      P("burgundy", "Burgundy", "#4A1E22", "#F0E4D0", "#2A1A12", "#8A7461", "#7A2E1E", "rgba(42,26,18,0.20)"),
      P("sepia", "Sepia", "#E9DDC9", "#FBF5E8", "#34291A", "#8A795C", "#A0642E", "rgba(52,41,26,0.16)"),
      P("olive", "Olive", "#3B3B1E", "#F2EFD8", "#262417", "#7C7A63", "#6E7A3F", "rgba(38,36,23,0.18)"),
      P("mustard", "Mustard", "#5A4415", "#F7EFD8", "#2A2413", "#8A7D5A", "#B8860B", "rgba(42,36,19,0.18)"),
    ],
    fonts: [FONTS.serifBody, FONTS.serif, FONTS.display],
    templateCSS: `
      .tm-vintage { --page-pad: 42px; }
      .tm-vintage .pf-page { background-image: radial-gradient(circle at 15% 10%, rgba(0,0,0,0.04), transparent 40%), radial-gradient(circle at 85% 90%, rgba(0,0,0,0.04), transparent 40%); }
      .tm-vintage .pf-eyebrow, .tm-vintage .pf-cv__heading, .tm-vintage .pf-toc__heading { font-variant: small-caps; text-transform: none; letter-spacing: 0.08em; }
      .tm-vintage .pf-title { font-variant: small-caps; font-style: normal; font-size: 19px; letter-spacing: 0.03em; }
    `,
  },

  {
    id: "modern",
    name: "Modern Creative",
    category: "Creative",
    description: "Clean header with a large, colourful bleed photograph.",
    cover: "modern",
    works: "columns",
    worksPerPage: 1,
    toc: "thumbs",
    cv: "columns",
    headingSize: "40px",
    taglineSize: "12px",
    bodySize: "14px",
    spacing: "52px",
    imageHeight: 440,
    colors: [
      P("teal", "Teal", "#E6F0F0", "#FFFFFF", "#12211F", "#6E837B", "#2C7A7B", "rgba(18,33,31,0.12)"),
      P("pink", "Pink", "#FBEAF0", "#FFFFFF", "#241A20", "#8A737F", "#E0526E", "rgba(36,26,32,0.12)"),
      P("cobalt", "Cobalt", "#E7ECF5", "#FFFFFF", "#0B1220", "#64748B", "#2563EB", "rgba(11,18,32,0.12)"),
      P("coral", "Coral", "#FBEDE6", "#FFFFFF", "#241712", "#8A7268", "#E06A3B", "rgba(36,23,18,0.12)"),
      P("blackout", "Blackout", "#1B1B1D", "#121214", "#F4F4F5", "#9A9AA0", "#FF5C39", "rgba(255,255,255,0.14)"),
    ],
    fonts: [FONTS.display, FONTS.serif, FONTS.sans],
    templateCSS: `
      .tm-modern { --page-pad: 44px; }
      .tm-modern .pf-title { font-style: normal; font-weight: 600; }
      .tm-modern .pf-section-head { border-top-width: 2px; border-bottom: none; }
      .tm-modern .pf-toc__heading, .tm-modern .pf-cv__heading { color: var(--ink); border-bottom: 2px solid var(--accent); padding-bottom: 6px; }
    `,
  },

  {
    id: "typographic",
    name: "Typographic",
    category: "Creative",
    description: "Giant serif + script lockup over a striped, coloured ground.",
    cover: "typographic",
    works: "numbered",
    worksPerPage: 2,
    toc: "index",
    cv: "list",
    bioOnCover: true,
    headingSize: "36px",
    taglineSize: "13px",
    bodySize: "13.5px",
    spacing: "50px",
    imageHeight: 400,
    colors: [
      P("deep-red", "Deep Red", "#5E0E18", "#6E1220", "#F5E9D6", "#E0B9A8", "#F5E9D6", "rgba(245,233,214,0.28)"),
      P("ink", "Ink", "#101010", "#141414", "#F4F4F4", "#9A9A9A", "#E8C547", "rgba(255,255,255,0.16)"),
      P("cobalt", "Cobalt", "#123A6B", "#0F3160", "#EAF1FB", "#A9C0DF", "#F2C94C", "rgba(255,255,255,0.20)"),
      P("olive", "Olive", "#3B3B1E", "#44441F", "#F1F0DA", "#C9C79A", "#D8C24A", "rgba(255,255,255,0.20)"),
    ],
    fonts: [FONTS.serifBody, FONTS.display, FONTS.sans],
    templateCSS: `
      .tm-typographic { --page-pad: 46px; }
      .tm-typographic .pf-typo__serif { font-weight: 500; }
      .tm-typographic .pf-title { font-style: normal; font-weight: 600; }
      .tm-typographic .pf-section-head { border-bottom-width: 3px; border-color: var(--accent); }
      .tm-typographic .pf-cv__heading, .tm-typographic .pf-toc__heading { color: var(--accent); }
      .tm-typographic .pf-cv__title, .tm-typographic .pf-toc__title, .tm-typographic .pf-index-title { font-style: normal; }
    `,
  },

  {
    id: "scrapbook",
    name: "Scrapbook / Collage",
    category: "Creative",
    description: "Layered, rotated photographs with tape and handwriting.",
    cover: "collage",
    works: "masonry",
    worksPerPage: 3,
    toc: "thumbs",
    cv: "list",
    headingSize: "34px",
    taglineSize: "16px",
    bodySize: "14px",
    spacing: "54px",
    imageHeight: 430,
    colors: [
      P("kraft", "Kraft", "#E6D8C3", "#F7EEDF", "#2C2115", "#8B7960", "#A9702E", "rgba(44,33,21,0.16)"),
      P("green-collage", "Green Collage", "#E2E8DA", "#F4F7EE", "#1E271A", "#74806A", "#5E7D4F", "rgba(30,39,26,0.16)"),
      P("mustard", "Mustard", "#F1E5C8", "#FBF5E6", "#2A2413", "#8A7D5A", "#D6A62B", "rgba(42,36,19,0.16)"),
      P("pastel", "Pastel", "#F0E7EC", "#FAF4F7", "#241A20", "#887A82", "#C98BB0", "rgba(36,26,32,0.16)"),
      P("burgundy", "Burgundy", "#E9D8D2", "#F9EFEA", "#2A1A16", "#8A706A", "#A63D2F", "rgba(42,26,22,0.16)"),
    ],
    fonts: [FONTS.hand, FONTS.serifBody, FONTS.sans],
    templateCSS: `
      .tm-scrapbook { --page-pad: 48px; }
      .tm-scrapbook .pf-page { background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 27px); }
      .tm-scrapbook .pf-section-head { border-style: dashed; }
      .tm-scrapbook .pf-frame { border: 6px solid var(--paper); box-shadow: 0 12px 24px rgba(0,0,0,0.16); }
      .tm-scrapbook .pf-title { font-family: "Caveat", cursive; font-style: normal; font-size: 25px; }
      .tm-scrapbook .pf-toc__title, .tm-scrapbook .pf-cv__title, .tm-scrapbook .pf-index-title { font-family: "Caveat", cursive; font-style: normal; font-size: 18px; }
    `,
  },

  {
    id: "bold",
    name: "Bold Neon",
    category: "Bold",
    description: "Black, dramatic and image-forward with neon accents.",
    cover: "bold",
    works: "fullBleed",
    worksPerPage: 1,
    toc: "list",
    cv: "list",
    headingSize: "44px",
    taglineSize: "12px",
    bodySize: "14px",
    spacing: "50px",
    imageHeight: 500,
    colors: [
      P("neon-yellow", "Neon Yellow", "#0A0A0B", "#101012", "#F5F5F5", "#9A9A9A", "#F5E003", "rgba(255,255,255,0.16)"),
      P("neon-pink", "Neon Pink", "#120A12", "#180D18", "#F7EDF5", "#A98FA3", "#FF3D9A", "rgba(255,255,255,0.16)"),
      P("neon-cyan", "Neon Cyan", "#07131A", "#0A1A24", "#E9F6FC", "#86A6B5", "#22D3EE", "rgba(255,255,255,0.16)"),
      P("neon-lime", "Neon Lime", "#0B120A", "#101A0E", "#EFF7EC", "#8FA68A", "#A3E635", "rgba(255,255,255,0.16)"),
      P("neon-orange", "Neon Orange", "#140D08", "#1C120B", "#FBF0E8", "#B5998A", "#FF6B2C", "rgba(255,255,255,0.16)"),
    ],
    fonts: [FONTS.sans, FONTS.condensed, FONTS.serif],
    templateCSS: `
      .tm-bold { --page-pad: 44px; }
      .tm-bold .pf-workspage { padding: 0; }
      .tm-bold .pf-fullbleed { min-height: 980px; }
      .tm-bold .pf-title { font-style: normal; text-transform: uppercase; font-weight: 600; letter-spacing: 0.02em; }
      .tm-bold .pf-section-head, .tm-bold .pf-divider { border-color: var(--accent); }
      .tm-bold .pf-divider__label { color: var(--accent); }
      .tm-bold .pf-toc__heading, .tm-bold .pf-cv__heading { color: var(--accent); }
      .tm-bold .pf-back { margin: 0 0 24px 44px; }
      .tm-bold .pf-corner { color: rgba(255,255,255,0.85); }
    `,
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export function getDefaultColors(templateId) {
  return getTemplate(templateId).colors[0];
}

export function getDefaultFont(templateId) {
  return getTemplate(templateId).fonts[0];
}

export function resolveColors(template, value) {
  if (value && value.wall) return value;
  return template.colors.find((c) => c.id === value) || template.colors[0];
}

export function resolveFont(template, value) {
  if (value && value.heading) return value;
  return template.fonts.find((f) => f.id === value) || template.fonts[0];
}

const ORIENTATION_FACTOR = { portrait: 1.37, square: 1.13, landscape: 1 };

export function frameHeight(template, orientation) {
  const base = template?.imageHeight || 420;
  const factor = ORIENTATION_FACTOR[orientation] || 1;
  return Math.round(base * factor);
}
