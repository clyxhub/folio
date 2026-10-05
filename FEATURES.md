# Folio — Features & Change Log

> **Folio** — *Build your artist portfolio.* A mobile-first app for artists to
> build a portfolio from their photos and export it as a shareable PDF.

- **Icon:** golden-ratio spiral, gold on navy (`public/icon.svg`)
- **Platforms:** Web PWA + Android (Capacitor)
- **Build:** GitHub Actions (web → GitHub Pages, Android → APK/AAB)

This is a ground-up rebuild of the original single-file
`artist-portfolio-builder.html` prototype, redesigned with a new visual system
and **nine** templates.

---

## 1. Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + Vite 6 |
| Native shell | Capacitor 7 (`core`, `camera`, `share`, `filesystem`, `preferences`, `haptics`, `app`, `android`) |
| PDF | html2pdf.js (jsPDF + html2canvas), dynamically imported |
| QR | `qrcode`, dynamically imported |
| Storage | Capacitor Preferences + Filesystem on device; `localStorage` on web |
| Fonts | Fraunces, Inter, Space Mono (Google Fonts, cached by the service worker) |

### Project structure

```
src/
  App.jsx                    screen routing, portfolio CRUD, toasts, theme
  main.jsx                   entry + service-worker registration
  components/
    Onboarding.jsx           first-run
    PortfolioPicker.jsx      home list + create sheet + About
    Editor.jsx               tab shell, autosave, TabBoundary
    ProfileTab.jsx           artist profile
    WorksTab.jsx             artwork list + drag reorder + search
    ArtworkEditor.jsx        full-screen artwork sheet
    CVTab.jsx                collapsible CV editor (5 sections)
    StyleTab.jsx             templates, palettes, fonts, QR, PDF, backup
    PreviewTab.jsx           live preview + PDF export
    PortfolioDocument.jsx    document dispatcher (recipe → layouts)
    ScaledDocument.jsx       fixed-width, auto-scaled live canvas
    ExportMenu.jsx           real PDF export + share
    CoverThumb.jsx           live cover thumbnail for Home
    layouts/
      CoverLayouts.jsx       nine cover compositions
      WorkLayouts.jsx        nine work-page layouts
      PageLayouts.jsx        TOC + CV page variants
      parts.jsx              shared frames / details / ornaments
    Toast.jsx                toast + undo provider
    Icons.jsx, Mark.jsx, ThemeToggle.jsx
  store/portfolioStore.js    data model, CRUD, backup
  templates/index.js         nine templates: recipes, palettes, fonts, CSS
  utils/
    helpers.js               ids, escaping, URL normalising, placeholders
    image.js                 compression, thumbnails, orientation
    paginate.js              chunk works into pages
    storage.js               Preferences + Filesystem wrappers
    qr.js                    QR target resolution + generation
    haptics.js               native haptic feedback
  styles/
    global.css               application UI design system
    document.css             portfolio document base styles
public/icon.svg, public/sw.js, public/manifest.webmanifest
.github/workflows/           deploy-web.yml, build-android.yml
capacitor.config.json        appId studio.folio.app, webDir dist
```

---

## 2. Design system (new)

A premium **light/dark “editorial studio”** theme replaces the previous dark
navy/brass scheme. Light is the default; a toggle in the app bar switches to
dark, and the preference is remembered.

- **Palette:** warm paper background, white surfaces, near-black ink, muted
  warm-grey text and a single terracotta accent.
- **Type:** Fraunces for headings, Inter for UI, Space Mono for labels and meta.
- **Layout:** mobile-first bottom tab bar that becomes a horizontal top nav at
  ≥900px; sticky blurred app bar; rounded surfaces with soft layered shadows.
- **Motion:** tasteful press-scaling, fade-up list entries, animated sheets,
  pulsing save dot — all disabled under `prefers-reduced-motion`.
- **Polish:** safe-area insets, focus rings, ARIA roles/labels, live toasts.

---

## 3. Data model & storage

- **Portfolio index** → Preferences key `folio-portfolio-index`
  (`[{ id, name, created, updated }]`), plus `folio-last-opened`.
- **Portfolio JSON** → device: `Filesystem portfolios/{id}/portfolio.json`;
  web: `localStorage['folio-portfolio-{id}']`.
- **Settings** → `folio-settings` (`{ compressionQuality, defaultTemplate }`).
- **UI theme** → `localStorage['folio-ui-theme']`.
- Images are compressed on import and stored as data/thumbnail pairs inside the
  portfolio document, so no separate asset store is needed.

**Artwork fields:** `title, medium, year, dimensions, description, status, price,
series, orientation, primaryImage, primaryThumbnail, secondaryImage,
secondaryThumbnail, extraImages[], extraThumbnails[]`

**Artist fields:** `name, tagline, bio, statement, email, location, instagram,
website, avatar, avatarThumbnail, showQR, qrTarget`

**Status values:** `available, sold, nfs, exhibiting, consignment`.

**CV rows:** driven by `CV_SECTIONS` — Education, Exhibitions, Awards, Press,
Collections — each with its own title/sub field mapping and placeholder.

---

## 4. Screens & navigation

- **Onboarding** — first launch; names the first portfolio, theme toggle.
- **Home** — portfolio grid with **live cover thumbnails**; create (sheet),
  duplicate, delete with undo, and an About sheet.
- **Editor** — **canvas-first**: the live portfolio is always visible. Desktop
  shows a left tool rail + panel beside the canvas; mobile shows the full-canvas
  with a bottom dock and slide-up sheets. The header has back, an inline-editable
  name, a live autosave indicator, **undo/redo**, theme toggle and **Export**.
- **Artwork Editor** — bottom sheet for one work.
- **Live canvas** — `ScaledDocument` renders the document at a fixed 760px page
  width and scales it to fit, so the preview is truly WYSIWYG (the large display
  type never clips) and matches the PDF.

---

## 5. Features

### 5.1 Multi-portfolio support
Create, load, rename, duplicate, delete (with undo) and resume the last-opened
portfolio. Keep different portfolios for different shows or submissions.

### 5.2 Autosave
Writes are debounced **700 ms** after any edit; the header shows
**Saving… / Saved / Save failed**. Work is never lost — close and resume anytime.

### 5.3 Image capture & optimisation
- `compressImage(file, maxDim, quality)` — canvas resize.
- `generateThumbnail(dataUrl, maxDim)` — small JPEG for lists.
- `detectOrientation(dataUrl)` — portrait / landscape / square.
- Primary/secondary max 1800px, extra shots 1600px, avatar 500px.

### 5.4 Orientation-aware layout
Each artwork stores its `orientation` (auto-detected on upload). Portfolio frames
scale by shape: **portrait tall (×1.37), square mid (×1.13), landscape base**,
so portrait work gets vertical space and landscape work stays wide.

### 5.5 Drag-to-reorder
Pointer-based drag (`pointermove/up/cancel`) that works with mouse, touch and
pen. Order sets the catalogue numbers; up/down buttons are kept as an accessible
fallback. Works can be searched when there are more than three.

### 5.6 Artwork management
Add from photos, edit in a sheet, duplicate, delete with toast + Undo, and add
multiple extra detail shots per work.

### 5.7 CV section
Five collapsible sections rendered as a dedicated **Curriculum vitae** page in
both the preview and the PDF. Removing an entry offers Undo.

### 5.8 QR code on cover
`showQR` toggle plus target select (`auto / website / instagram / email`).
`resolveQRTarget()` resolves the link and `generateQRDataUrl()` renders it at
high resolution for print.

### 5.9 Templates — nine distinct designs
Recreated from reference designs read from Canva's public template gallery
(genre/style research only — all layouts, palettes, fonts and CSS here are
original; no Canva assets, images or fonts are used). Each is a **layout
recipe**, not a colour swap: it picks a cover composition, a work-page layout,
how many works share a page, and a TOC/CV style — plus its own 4–5 colour
palettes and 2–3 font pairings. The Style tab groups them with **category chips**
(Minimal · Professional · Classic · Creative · Bold) and shows a **live
mini-preview** of each.

| Template | Category | Cover | Work pages | Per page | TOC / CV |
|----------|----------|-------|-----------|----------|----------|
| Minimalist | Minimal | dark full-bleed photo, oversized lowercase type | large image + caption bar | 1 | list / list |
| Aesthetic | Minimal | soft page, large framed image, bold title | mounted image + caption | 1 | list / list |
| Simple Professional | Professional | b/w typed lockup (italic serif + sans), rule | monochrome image + ruled specs | 1 | list / columns |
| Classic | Classic | huge italic serif, small-caps corner labels | bordered plate | 1 | list / columns |
| Vintage | Classic | ornate double frame, display type, plaque | ornamental frame | 1 | list / list |
| Modern Creative | Creative | clean header + large bleed photograph | 2-column photo grid | 2 | thumbs / columns |
| Typographic | Creative | striped ground, giant serif + script | 2-up oversized numbers | 2 | index / list |
| Scrapbook / Collage | Creative | rotated photo collage with tape | rotated masonry | 3 | thumbs / list |
| Bold Neon | Bold | black hero, giant type + script, photo columns | full-bleed + overlay | 1 | list / list |

`PortfolioDocument` dispatches to the recipe's layout components and chunks the
works with `utils/paginate.js`.

### 5.10 Real PDF export
An off-screen paginated document is rendered through **html2pdf.js**. Options:
A4, portrait/landscape, and an image-quality slider. On device it writes to the
cache and opens the OS share sheet; on the web it downloads a `.pdf` (or uses
the Web Share API when the browser supports sharing files).

### 5.11 Backup export / import
`buildBackup`, `parseBackup`, `applyParsedPortfolio`. Download a `.json` backup,
restore it on another device, or recover after clearing storage.

### 5.12 Toast notifications with Undo
`showToast(message, undoAction)` replaces `window.confirm` for work deletion,
CV entry removal, “clear all” and portfolio deletion.

### 5.13 Back-to-top + empty placeholder
A floating “↑ Top” appears after 240px of scroll; empty portfolios show a clear
dashed placeholder that links straight to adding a work.

### 5.14 Light / dark theme
A remembered theme toggle, using CSS custom properties throughout.

### 5.15 Polish
- **Animations:** fade-up, press-scale, animated sheets, pulsing save state.
- **Haptics:** light/medium feedback on native for create/delete/duplicate.
- **Offline:** `public/sw.js` network-first with cache fallback and a dedicated
  Google Fonts cache; installable PWA manifest.
- **Accessibility:** `role=tablist/tab/dialog`, `aria-live` toasts, labelled
  inputs and icon buttons, `.sr-only` utility.

---

## 6. Build & deployment

- **`deploy-web.yml`** — on push to `main`: build → deploy the PWA to GitHub Pages.
- **`build-android.yml`** — on tag `v*` or manual: JDK 17 + Android SDK, add the
  platform if missing, `cap sync`, then `assembleDebug` + `bundleDebug`; uploads
  the **APK** and **AAB**.
- **`capacitor.config.json`** — appId `studio.folio.app`, webDir `dist`, and
  `@capacitor/camera` configured with the Android CAMERA permission.

### Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

---

## 7. Verification

A headless **system Edge** (Playwright) smoke run created a portfolio, added
three works (landscape, portrait, square), and verified: **9 templates / 6
category chips / 9 live mini-previews**, **9 distinct cover compositions and 9
distinct work-page layouts**, correct multi-work pagination (3 / 2 / 1 work
pages), a valid exported **PDF (`%PDF-`, ~230 KB)**, and a clean console. The
canvas renders at a fixed page width and scales to fit, so the oversized display
type no longer clips on mobile.
