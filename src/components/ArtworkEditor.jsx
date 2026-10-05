import { useEffect, useState } from "react";
import { ARTWORK_DEFAULTS, STATUS_LABEL } from "../store/portfolioStore";
import { processImageInput } from "../utils/image";
import { persistImage, resolveMedia } from "../utils/media";
import { registerBackHandler } from "../utils/native";
import TakePhotoButton from "./TakePhotoButton";
import { IconX, IconImage, IconPlus } from "./Icons";

async function persistPair(full, thumbnail, portfolioId, kind) {
  const [fullRef, thumbRef] = await Promise.all([
    persistImage(full, portfolioId, kind),
    persistImage(thumbnail, portfolioId, `${kind}-thumb`),
  ]);
  return { fullRef, thumbRef };
}

function ImageSlot({ label, image, thumb, onPick, onRemove }) {
  const [busy, setBusy] = useState(false);

  async function handle(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await onPick(file);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="imgfield">
      <span className="field-label">{label}</span>
      <div className="imgfield__row">
        {image ? (
          <div className="imgfield__thumb">
            <img src={resolveMedia(thumb || image)} alt="" />
          </div>
        ) : null}
        <TakePhotoButton
          onPick={async (input) => {
            setBusy(true);
            try {
              await onPick(input);
            } finally {
              setBusy(false);
            }
          }}
        />
        <label className="upload-btn">
          <IconImage size={16} />
          {busy ? "Processing…" : image ? "Choose" : "Choose image"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handle}
          />
        </label>
        {image ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onRemove}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ArtworkEditor({
  artwork,
  portfolioId,
  onSave,
  onClose,
  quality = 0.85,
}) {
  const [draft, setDraft] = useState(() => ({
    ...ARTWORK_DEFAULTS,
    ...(artwork || {}),
  }));
  const [busy, setBusy] = useState(false);

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  // Android back button closes the sheet first.
  useEffect(() => {
    const unregister = registerBackHandler(() => {
      onClose();
      return true;
    });
    return unregister;
  }, [onClose]);

  async function pickPrimary(input) {
    const { full, thumbnail, orientation } = await processImageInput(input, {
      maxDim: 1800,
      quality,
      thumbMaxDim: 200,
    });
    const { fullRef, thumbRef } = await persistPair(
      full,
      thumbnail,
      portfolioId,
      "primary"
    );
    setDraft((d) => ({
      ...d,
      primaryImage: fullRef,
      primaryThumbnail: thumbRef,
      orientation,
    }));
  }

  async function pickSecondary(input) {
    const { full, thumbnail } = await processImageInput(input, {
      maxDim: 1800,
      quality,
      thumbMaxDim: 200,
    });
    const { fullRef, thumbRef } = await persistPair(
      full,
      thumbnail,
      portfolioId,
      "secondary"
    );
    setDraft((d) => ({
      ...d,
      secondaryImage: fullRef,
      secondaryThumbnail: thumbRef,
    }));
  }

  async function addExtra(inputs) {
    const list = Array.isArray(inputs) ? inputs : [inputs];
    if (!list.length) return;
    setBusy(true);
    try {
      const fulls = [];
      const thumbs = [];
      for (const input of list) {
        // eslint-disable-next-line no-await-in-loop
        const { full, thumbnail } = await processImageInput(input, {
          maxDim: 1600,
          quality,
          thumbMaxDim: 120,
        });
        // eslint-disable-next-line no-await-in-loop
        const { fullRef, thumbRef } = await persistPair(
          full,
          thumbnail,
          portfolioId,
          "extra"
        );
        fulls.push(fullRef);
        thumbs.push(thumbRef);
      }
      setDraft((d) => ({
        ...d,
        extraImages: [...d.extraImages, ...fulls],
        extraThumbnails: [...d.extraThumbnails, ...thumbs],
      }));
    } finally {
      setBusy(false);
    }
  }

  function removeExtra(i) {
    setDraft((d) => ({
      ...d,
      extraImages: d.extraImages.filter((_, idx) => idx !== i),
      extraThumbnails: d.extraThumbnails.filter((_, idx) => idx !== i),
    }));
  }

  function submit(e) {
    e.preventDefault();
    onSave(draft);
  }

  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={artwork ? "Edit work" : "Add work"}
    >
      <form
        className="sheet sheet--wide"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="sheet__header">
          <span className="sheet__title">
            {artwork ? "Edit work" : "Add a work"}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX />
          </button>
        </div>

        <div className="sheet__body">
          <ImageSlot
            label="Primary image"
            image={draft.primaryImage}
            thumb={draft.primaryThumbnail}
            onPick={pickPrimary}
            onRemove={() =>
              setDraft((d) => ({
                ...d,
                primaryImage: "",
                primaryThumbnail: "",
                orientation: "auto",
              }))
            }
          />
          <ImageSlot
            label="Detail image (optional)"
            image={draft.secondaryImage}
            thumb={draft.secondaryThumbnail}
            onPick={pickSecondary}
            onRemove={() =>
              setDraft((d) => ({
                ...d,
                secondaryImage: "",
                secondaryThumbnail: "",
              }))
            }
          />

          <div className="field">
            <label htmlFor="aw-title">Title</label>
            <input
              id="aw-title"
              className="input"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Title of the work"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="aw-medium">Medium</label>
              <input
                id="aw-medium"
                className="input"
                value={draft.medium}
                onChange={(e) => set("medium", e.target.value)}
                placeholder="Oil on canvas"
              />
            </div>
            <div className="field">
              <label htmlFor="aw-year">Year</label>
              <input
                id="aw-year"
                className="input"
                value={draft.year}
                onChange={(e) => set("year", e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="aw-dims">Dimensions</label>
              <input
                id="aw-dims"
                className="input"
                value={draft.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                placeholder="30 × 40 in"
              />
            </div>
            <div className="field">
              <label htmlFor="aw-status">Status</label>
              <select
                id="aw-status"
                className="select"
                value={draft.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="aw-price">Price</label>
              <input
                id="aw-price"
                className="input"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="$450 (optional)"
              />
            </div>
            <div className="field">
              <label htmlFor="aw-series">Series / collection</label>
              <input
                id="aw-series"
                className="input"
                value={draft.series}
                onChange={(e) => set("series", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="aw-desc">Description</label>
            <textarea
              id="aw-desc"
              className="textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional — a sentence about the work"
            />
          </div>

          <div className="imgfield">
            <span className="field-label">More detail shots (optional)</span>
            <div className="extra-grid">
              {draft.extraImages.map((src, i) => (
                <div className="extra-thumb" key={i}>
                  <img src={resolveMedia(draft.extraThumbnails?.[i] || src)} alt="" />
                  <button
                    type="button"
                    onClick={() => removeExtra(i)}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="extra-add">
                <span>
                  <IconPlus size={16} />
                  <br />
                  Add
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    addExtra(Array.from(e.target.files || []));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <TakePhotoButton
              onPick={(input) => addExtra(input)}
              className="upload-btn"
            />
          </div>
        </div>

        <div className="sheet__footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary grow" disabled={busy}>
            {busy ? "Processing…" : artwork ? "Save changes" : "Add work"}
          </button>
        </div>
      </form>
    </div>
  );
}
