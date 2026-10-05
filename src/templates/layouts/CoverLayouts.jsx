// Folio — nine cover compositions, recreated from Canva's real template
// genres (original code / assets only).

import {
  Avatar,
  Contacts,
  Qr,
  Divider,
  CornerMeta,
  Rule,
  Sparkle,
  ImageBox,
  firstImage,
} from "./parts";
import { placeholderStyle } from "../../utils/helpers";

const year = () => String(new Date().getFullYear());

/* 1 — Minimalist: dark full-bleed photo, oversized lowercase display type. */
export function CoverMinimalist({ artist, artworks, qrDataUrl }) {
  const hero = firstImage(artworks);
  const big = (artist.name || "portfolio").toLowerCase();
  return (
    <div className="pf-cover--minimalist">
      {hero ? (
        <div className="pf-hero" style={{ backgroundImage: `url(${hero})` }} />
      ) : (
        <div className="pf-hero pf-hero--empty" />
      )}
      <div className="pf-hero-scrim" />
      <CornerMeta
        topLeft="Portfolio"
        topRight={year()}
        bottomLeft={artist.name}
        bottomRight={artist.website || artist.instagram}
      />
      <div className="pf-minimalist__center">
        <h1 className="pf-display">{big}</h1>
        {artist.tagline ? (
          <p className="pf-minimalist__sub">{artist.tagline}</p>
        ) : null}
      </div>
      <Qr artist={artist} qrDataUrl={qrDataUrl} className="pf-qr--corner" />
    </div>
  );
}

/* 2 — Aesthetic: soft textured page, large framed image, bold title. */
export function CoverAesthetic({ artist, artworks, qrDataUrl }) {
  const hero = firstImage(artworks);
  return (
    <div className="pf-cover--aesthetic">
      <div className="pf-aesthetic__image">
        {hero ? (
          <ImageBox src={hero} fit="cover" />
        ) : (
          <div className="pf-placeholder" style={placeholderStyle("aesthetic")} />
        )}
      </div>
      <h1 className="pf-aesthetic__title">{artist.name || "Portfolio"}.</h1>
      <div className="pf-aesthetic__sub">
        {artist.tagline || "Selected works"}
      </div>
      <div className="pf-aesthetic__foot">
        <span>editor</span>
        <Sparkle size={18} />
        <span>{year()}</span>
      </div>
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 3 — Simple Professional: black-and-white editorial lockup. */
export function CoverSimple({ artist, artworks, qrDataUrl }) {
  const words = (artist.name || "Your Name").split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ") || "Portfolio";
  return (
    <div className="pf-cover--simple">
      <div className="pf-simple__label">Personal Presentation</div>
      <h1 className="pf-simple__title">
        <span className="pf-simple__serif">{first}</span>
        <span className="pf-simple__sans">{rest}</span>
      </h1>
      <Rule className="pf-simple__rule" />
      <div className="pf-simple__foot">
        <span>{artist.name}</span>
        <span>{artist.tagline}</span>
      </div>
      <Contacts artist={artist} />
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 4 — Classic: huge italic serif with small-caps corner labels. */
export function CoverClassic({ artist, artworks, qrDataUrl }) {
  return (
    <div className="pf-cover--classic">
      <CornerMeta
        topLeft={artist.name || "Studio"}
        topRight="Portfolio"
        bottomLeft={artist.location}
        bottomRight={year()}
      />
      <div className="pf-classic__center">
        <h1 className="pf-classic__title">Portfolio</h1>
        <div className="pf-classic__sub">
          {artist.tagline || "Selected works"}
        </div>
      </div>
      <Contacts artist={artist} className="pf-contacts--center" />
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 5 — Vintage: ornate double frame, engraved display type, name plaque. */
export function CoverVintage({ artist, artworks, qrDataUrl }) {
  return (
    <div className="pf-cover--vintage">
      <div className="pf-vintage__frame">
        <div className="pf-vintage__inner">
          <div className="pf-vintage__eyebrow">Creative</div>
          <h1 className="pf-vintage__title">Portfolio</h1>
          <span className="pf-vintage__flourish">✳</span>
          <div className="pf-vintage__plaque">{artist.name || "Your Name"}</div>
          {artist.tagline ? (
            <p className="pf-vintage__tag">{artist.tagline}</p>
          ) : null}
        </div>
      </div>
      <Contacts artist={artist} className="pf-contacts--center" />
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 6 — Modern Creative: clean header, large colourful bleed photo. */
export function CoverModern({ artist, artworks, qrDataUrl }) {
  const hero = firstImage(artworks);
  return (
    <div className="pf-cover--modern">
      <header className="pf-modern__head">
        <h1 className="pf-modern__name">{artist.name || "Your Name"}</h1>
        <div className="pf-modern__tag">
          {artist.tagline || "Modern & colourful portfolio"}
        </div>
      </header>
      <div className="pf-modern__photo">
        {hero ? (
          <ImageBox src={hero} fit="cover" />
        ) : (
          <div className="pf-placeholder" style={placeholderStyle("modern")} />
        )}
      </div>
      <footer className="pf-modern__foot">
        <Contacts artist={artist} />
        <Qr artist={artist} qrDataUrl={qrDataUrl} />
      </footer>
    </div>
  );
}

/* 7 — Typographic: coloured stripes, giant serif + script, sparkles. */
export function CoverTypographic({ artist, artworks, qrDataUrl }) {
  const words = (artist.name || "Creative").split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ") || "Portfolio";
  return (
    <div className="pf-cover--typographic">
      <CornerMeta
        topLeft={artist.name}
        topRight={year()}
        bottomLeft={artist.email}
        bottomRight={artist.website || artist.instagram}
      />
      <Sparkle size={22} className="pf-sparkle--a" />
      <Sparkle size={13} className="pf-sparkle--b" />
      <div className="pf-typo__lockup">
        <h1 className="pf-typo__serif">{first}</h1>
        <div className="pf-typo__script">{rest}</div>
      </div>
      {artist.bio || artist.tagline ? (
        <div className="pf-typo__blurb">{artist.bio || artist.tagline}</div>
      ) : null}
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 8 — Scrapbook / Collage: layered rotated photos, tape, handwriting. */
export function CoverCollage({ artist, artworks, qrDataUrl }) {
  const tiles = artworks.filter((a) => a.primaryImage).slice(0, 3);
  const rotations = [-7, 4, -3];
  return (
    <div className="pf-cover--collage">
      <div className="pf-collage">
        {(tiles.length ? tiles : [null, null, null]).map((a, i) => (
          <div
            className={`pf-collage__tile pf-collage__tile--${i}`}
            key={a ? a.id : i}
            style={{ transform: `rotate(${rotations[i % 3]}deg)` }}
          >
            {a ? (
              <>
                <ImageBox src={a.primaryImage} fit="cover" />
                <span className="pf-collage__label">
                  {a.title || "Untitled"}
                </span>
              </>
            ) : (
              <div
                className="pf-placeholder"
                style={placeholderStyle("collage" + i)}
              />
            )}
            <span className="pf-collage__tape" />
            {i === 1 ? (
              <span className="pf-collage__tape pf-collage__tape--side" />
            ) : null}
          </div>
        ))}
      </div>
      <div className="pf-collage__caption">
        <h1 className="pf-collage__name">{artist.name || "Your Name"}</h1>
        {artist.tagline ? (
          <div className="pf-collage__tag">{artist.tagline}</div>
        ) : null}
      </div>
      <Contacts artist={artist} className="pf-contacts--center" />
      <Qr artist={artist} qrDataUrl={qrDataUrl} />
    </div>
  );
}

/* 9 — Bold Neon: black, top nav, giant type + script over photo columns. */
export function CoverBold({ artist, artworks, qrDataUrl }) {
  const images = artworks.filter((a) => a.primaryImage).slice(0, 3);
  return (
    <div className="pf-cover--bold">
      <div className="pf-bold__nav">
        <span>Portfolio / {year()}</span>
        <span>{artist.website || artist.location || ""}</span>
      </div>
      <div className="pf-bold__strip">
        {[0, 1, 2].map((i) =>
          images[i] ? (
            <div className="pf-bold__col" key={i}>
              <ImageBox src={images[i].primaryImage} fit="cover" />
            </div>
          ) : (
            <div className="pf-bold__col pf-bold__col--empty" key={i}>
              <div
                className="pf-placeholder"
                style={placeholderStyle("bold" + i)}
              />
            </div>
          )
        )}
      </div>
      <div className="pf-bold__scrim" />
      <div className="pf-bold__type">
        <h1 className="pf-bold__big">Portfolio</h1>
        <div className="pf-bold__script">{artist.name || "Photography"}</div>
      </div>
      <Sparkle size={20} className="pf-sparkle--a" />
      <Sparkle size={15} className="pf-sparkle--b" />
      <div className="pf-bold__meta">
        <Contacts artist={artist} />
        <Qr artist={artist} qrDataUrl={qrDataUrl} />
      </div>
    </div>
  );
}
