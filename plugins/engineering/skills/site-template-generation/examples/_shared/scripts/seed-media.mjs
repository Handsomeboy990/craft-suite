// Writes obviously artificial placeholder images into the data directory, so a
// fresh instance renders its layout before the client has uploaded anything.
//
//   npm run seed-media
//
// They are flat colour fields with a diagonal band: nobody could mistake one
// for a photograph, which is the point. No stock photograph of a stranger ships
// with this template, and none is presented as the client.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const table = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(width, height, paint) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = paint(x, y, width, height);
      raw[rowStart + 1 + x * 3] = r;
      raw[rowStart + 2 + x * 3] = g;
      raw[rowStart + 3 + x * 3] = b;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const band = (base, stripe) => (x, y, width, height) =>
  ((x / width + y / height) * 6) % 2 < 1 ? base : stripe;

const FILES = [
  ['placeholder-hero.png', 1280, 720, band([24, 26, 32], [40, 44, 54])],
  ['placeholder-portrait.png', 720, 900, band([32, 30, 28], [52, 48, 44])],
  ['placeholder-gallery-1.png', 600, 800, band([28, 34, 40], [44, 52, 62])],
  ['placeholder-gallery-2.png', 600, 800, band([36, 30, 30], [56, 48, 46])],
  ['placeholder-gallery-3.png', 600, 800, band([30, 36, 34], [48, 58, 54])],
  ['placeholder-gallery-4.png', 600, 800, band([34, 32, 40], [54, 50, 62])],
  ['placeholder-og.png', 1200, 630, band([217, 59, 0], [184, 50, 0])],
  ['icon-192.png', 192, 192, band([217, 59, 0], [184, 50, 0])],
  ['icon-512.png', 512, 512, band([217, 59, 0], [184, 50, 0])],
];

const target = join(resolve(process.env.DATA_DIR ?? 'data'), 'uploads');
mkdirSync(target, { recursive: true });
for (const [name, width, height, paint] of FILES) {
  writeFileSync(join(target, name), png(width, height, paint));
  console.log(`wrote ${join(target, name)}`);
}
console.log('\nPlaceholders only. Replace them from the back office, Images, with the client own files.');
