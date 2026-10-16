const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ (-1)) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function mosqueIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background rounded square or circle with dark emerald gradient
  if (dist > 0.95) return [0, 0, 0, 0];

  // Base background gradient: Deep emerald teal #064e3b to #022c22
  const bgT = (ny + 1) / 2;
  let r = Math.round(6 + (2 - 6) * bgT);
  let g = Math.round(78 + (44 - 78) * bgT);
  let b = Math.round(59 + (34 - 59) * bgT);
  let a = 255;

  // Gold accent border
  if (dist > 0.88 && dist <= 0.95) {
    return [234, 179, 8, Math.round(255 * (1 - (dist - 0.88) / 0.07))];
  }

  // Draw Crescent Moon in top right
  // Crescent center (0.2, -0.3)
  const cx1 = nx - 0.15;
  const cy1 = ny - (-0.3);
  const d1 = Math.sqrt(cx1 * cx1 + cy1 * cy1);
  const cx2 = nx - 0.28;
  const cy2 = ny - (-0.38);
  const d2 = Math.sqrt(cx2 * cx2 + cy2 * cy2);

  if (d1 < 0.28 && d2 > 0.22) {
    // Gold crescent
    return [250, 204, 21, 255];
  }

  // Small star next to crescent
  const sx = nx - 0.38;
  const sy = ny - (-0.2);
  const starDist = Math.sqrt(sx * sx + sy * sy);
  if (starDist < 0.06) {
    return [254, 240, 138, 255];
  }

  // Dome and Minaret silhouette at bottom/middle
  // Dome centered at (0, 0.25)
  const dx = nx;
  const dy = ny - 0.15;
  if (dy >= 0 && dy <= 0.5 && Math.abs(dx) <= 0.45) {
    // Dome curve
    const domeRadius = 0.45;
    const domeY = Math.sqrt(Math.max(0, domeRadius * domeRadius - dx * dx));
    if (dy < domeY * 0.85) {
      return [245, 245, 244, 240];
    }
  }

  // Central Minaret finial / spire
  if (Math.abs(nx) < 0.04 && ny < 0.15 && ny > -0.15) {
    return [250, 204, 21, 255];
  }
  // Finial crescent top
  const fx = nx;
  const fy = ny - (-0.17);
  if (Math.sqrt(fx * fx + fy * fy) < 0.05) {
    return [250, 204, 21, 255];
  }

  // Base building
  if (ny >= 0.35 && ny <= 0.75 && Math.abs(nx) <= 0.6) {
    // White/gold arched portal
    if (Math.abs(nx) <= 0.15 && ny >= 0.45) {
      // Arched doorway
      const doorTop = 0.52;
      if (ny > doorTop || (Math.sqrt(nx * nx + (ny - doorTop) * (ny - doorTop)) < 0.15)) {
        return [2, 44, 34, 255]; // Dark doorway
      }
    }
    return [245, 245, 244, 240];
  }

  // Side minarets
  if ((Math.abs(nx - 0.55) < 0.06 || Math.abs(nx + 0.55) < 0.06) && ny > -0.05 && ny < 0.75) {
    return [245, 245, 244, 240];
  }
  // Minaret caps
  if ((Math.abs(nx - 0.55) < 0.08 || Math.abs(nx + 0.55) < 0.08) && ny <= -0.05 && ny > -0.2) {
    return [250, 204, 21, 255];
  }

  return [r, g, b, a];
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPng(256, 256, mosqueIcon));
fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), createPng(32, 32, mosqueIcon));
console.log('Icons generated successfully!');
