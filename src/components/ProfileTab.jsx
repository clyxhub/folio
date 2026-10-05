import { useState } from "react";
import { processImageInput } from "../utils/image";
import { persistImage, resolveMedia } from "../utils/media";
import TakePhotoButton from "./TakePhotoButton";
import { IconCamera, IconTrash } from "./Icons";

export default function ProfileTab({ portfolio, update }) {
  const artist = portfolio.artist;
  const [busy, setBusy] = useState(false);

  const set = (field, value) =>
    update((p) => ({ ...p, artist: { ...p.artist, [field]: value } }));

  async function handleAvatar(input) {
    if (!input) return;
    setBusy(true);
    try {
      const { full, thumbnail } = await processImageInput(input, {
        maxDim: 500,
        quality: 0.85,
        thumbMaxDim: 150,
      });
      const [avatar, avatarThumbnail] = await Promise.all([
        persistImage(full, portfolio.id, "avatar"),
        persistImage(thumbnail, portfolio.id, "avatar-thumb"),
      ]);
      update((p) => ({
        ...p,
        artist: { ...p.artist, avatar, avatarThumbnail },
      }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <section className="section">
        <div className="section__title">Profile photo</div>
        <div className="avatar-field">
          <label className="avatar-field__circle" title="Upload a photo">
            {artist.avatar ? (
              <img
                src={resolveMedia(artist.avatarThumbnail || artist.avatar)}
                alt=""
              />
            ) : (
              <IconCamera size={26} />
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                handleAvatar(file);
              }}
            />
          </label>
          <div className="avatar-field__actions">
            <TakePhotoButton onPick={handleAvatar} />
            <label className="upload-btn">
              {busy
                ? "Processing…"
                : artist.avatar
                ? "Replace photo"
                : "Choose photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  handleAvatar(file);
                }}
              />
            </label>
            {artist.avatar ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  update((p) => ({
                    ...p,
                    artist: { ...p.artist, avatar: "", avatarThumbnail: "" },
                  }))
                }
              >
                <IconTrash size={16} /> Remove
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <hr className="divider-line" />

      <section className="section">
        <div className="field">
          <label htmlFor="artist-name">Artist name</label>
          <input
            id="artist-name"
            className="input"
            value={artist.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="artist-tagline">Tagline</label>
          <input
            id="artist-tagline"
            className="input"
            value={artist.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="One line about your practice"
          />
        </div>
      </section>

      <hr className="divider-line" />

      <section className="section">
        <div className="field">
          <label htmlFor="artist-bio">Bio</label>
          <textarea
            id="artist-bio"
            className="textarea"
            rows={4}
            value={artist.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="A short bio about you and your work"
          />
        </div>
        <div className="field">
          <label htmlFor="artist-statement">Artist statement</label>
          <textarea
            id="artist-statement"
            className="textarea"
            rows={5}
            value={artist.statement}
            onChange={(e) => set("statement", e.target.value)}
            placeholder="A broader statement about your practice, themes or intent"
          />
        </div>
      </section>

      <hr className="divider-line" />

      <section className="section">
        <div className="section__title">Contact</div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="artist-email">Email</label>
            <input
              id="artist-email"
              className="input"
              type="email"
              value={artist.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="artist-location">Location</label>
            <input
              id="artist-location"
              className="input"
              value={artist.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="artist-instagram">Instagram</label>
            <input
              id="artist-instagram"
              className="input"
              value={artist.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="handle (no @)"
            />
          </div>
          <div className="field">
            <label htmlFor="artist-website">Website</label>
            <input
              id="artist-website"
              className="input"
              value={artist.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="yoursite.com"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
