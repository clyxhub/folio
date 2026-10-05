// Folio — "Take photo" control.
// Native: opens the camera via @capacitor/camera. Web: uses a capture file
// input. The picked result is a data URL on native or a File on web, so callers
// should process it with `processImageInput`.

import { useRef, useState } from "react";
import { capturePhoto } from "../utils/media";
import { IconCamera } from "./Icons";

export default function TakePhotoButton({ onPick, className = "upload-btn" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const dataUrl = await capturePhoto("camera");
      if (dataUrl) {
        await onPick(dataUrl);
        return;
      }
      inputRef.current?.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={busy}>
        <IconCamera size={16} />
        {busy ? "Opening…" : "Take photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}
