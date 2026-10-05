// Generate Android icon + splash source images from public/icon.svg, with no
// native image dependencies — a tiny pure-JS PNG encoder + a thick-line
// rasteriser draw the golden-ratio spiral.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const out = path.join(root, "resources");
fs.mkdirSync(out, { recursive: true });

const NAVY = [16, 27, 45, 255]; // #101b2d
const GOLD = [201, 168, 76, 255]; // #c9a84c

// ---- PNG encoder ----
const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1)
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePng(width, height, rgba) {
  const rowSize = width * 4;
  const raw = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (rowSize + 1)] = 0;
    rgba.copy(raw, y * (rowSize + 1) + 1, y * rowSize, y * rowSize + rowSize);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- rasteriser ----
function fill(width, height, color) {
  const buf = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    buf[i * 4] = color[0];
    buf[i * 4 + 1] = color[1];
    buf[i * 4 + 2] = color[2];
    buf[i * 4 + 3] = color[3];
  }
  return buf;
}
function disc(buf, w, h, cx, cy, r, color) {
  const r2 = r * r;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(h - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = (y * w + x) * 4;
        buf[i] = color[0];
        buf[i + 1] = color[1];
        buf[i + 2] = color[2];
        buf[i + 3] = color[3];
      }
    }
  }
}
function stroke(buf, w, h, pts, scale, ox, oy, thickness, color) {
  const r = Math.max(1, thickness / 2);
  for (let i = 1; i < pts.length; i += 1) {
    const x1 = ox + pts[i - 1][0] * scale;
    const y1 = oy + pts[i - 1][1] * scale;
    const x2 = ox + pts[i][0] * scale;
    const y2 = oy + pts[i][1] * scale;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(dist / (r * 0.6)));
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      disc(buf, w, h, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r, color);
    }
  }
}

// ---- spiral points from public/icon.svg ----
const svg = fs.readFileSync(path.join(root, "public", "icon.svg"), "utf8");
const d = /d="([^"]+)"/.exec(svg)[1];
const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
const pts = [];
for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);

const write = (name, buf) => fs.writeFileSync(path.join(out, name), buf);

// Full icon (navy square + spiral, 1024)
{
  const S = 1024;
  const b = fill(S, S, NAVY);
  stroke(b, S, S, pts, S / 100, 0, 0, 2.6 * (S / 100), GOLD);
  write("icon.png", encodePng(S, S, b));
}
// Adaptive background (solid navy)
{
  const S = 1024;
  write("icon-background.png", encodePng(S, S, fill(S, S, NAVY)));
}
// Adaptive foreground (transparent, spiral at ~64% centred)
{
  const S = 1024;
  const inner = 660;
  const b = fill(S, S, [0, 0, 0, 0]);
  stroke(b, S, S, pts, inner / 100, (S - inner) / 2, (S - inner) / 2, 2.8 * (inner / 100), GOLD);
  write("icon-foreground.png", encodePng(S, S, b));
}
// Splash (navy, centred spiral)
for (const name of ["splash.png", "splash-dark.png"]) {
  const S = 2732;
  const inner = 820;
  const b = fill(S, S, NAVY);
  stroke(b, S, S, pts, inner / 100, (S - inner) / 2, (S - inner) / 2, 2.8 * (inner / 100), GOLD);
  write(name, encodePng(S, S, b));
}

console.log("resources generated:", fs.readdirSync(out).join(", "));
