/**
 * remove-bg.mjs
 * Removes the solid dark background (~#2a2d33) from pixel-art assets
 * using a flood-fill from all 4 corners. Outputs PNG with alpha channel.
 *
 * Usage: node scripts/remove-bg.mjs
 */

import { Jimp } from '../node_modules/jimp/dist/esm/index.js';
import { writeFileSync } from 'fs';

const TOLERANCE = 28; // color distance threshold
const ASSETS = [
  'public/assets/building_guildhall.png',
  'public/assets/building_forge.png',
  'public/assets/building_spellbook.png',
  'public/assets/building_portal.png',
  'public/assets/artificer_idle.png',
  'public/assets/artificer_portrait.png',
];

/** Euclidean color distance (RGB only) */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

/**
 * BFS flood-fill from seed pixels.
 * Marks any pixel within TOLERANCE of the sampled background as transparent.
 */
function removeBg(img, tolerance) {
  const w = img.width;
  const h = img.height;
  const data = img.bitmap.data; // RGBA flat array

  const getPixel = (x, y) => {
    const i = (y * w + x) * 4;
    return { r: data[i], g: data[i+1], b: data[i+2], i };
  };

  // Sample background color from the 4 corners (average)
  const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1],[1,1],[w-2,1],[1,h-2],[w-2,h-2]];
  let sr = 0, sg = 0, sb = 0;
  for (const [x,y] of corners) {
    const p = getPixel(x, y);
    sr += p.r; sg += p.g; sb += p.b;
  }
  sr = Math.round(sr / corners.length);
  sg = Math.round(sg / corners.length);
  sb = Math.round(sb / corners.length);
  console.log(`  Background seed: rgb(${sr},${sg},${sb})`);

  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed from all 4 edges (top/bottom rows, left/right columns)
  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = getPixel(x, y);
    if (colorDistance(p.r, p.g, p.b, sr, sg, sb) <= tolerance) {
      visited[idx] = 1;
      queue.push(x, y);
    }
  };

  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h-1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w-1, y); }

  // BFS
  let qi = 0;
  while (qi < queue.length) {
    const x = queue[qi++];
    const y = queue[qi++];

    // Make transparent
    const pi = (y * w + x) * 4;
    data[pi+3] = 0;

    // Expand to 4 neighbors
    for (const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const nidx = ny * w + nx;
      if (visited[nidx]) continue;
      const p = getPixel(nx, ny);
      if (colorDistance(p.r, p.g, p.b, sr, sg, sb) <= tolerance) {
        visited[nidx] = 1;
        queue.push(nx, ny);
      }
    }
  }

  const removed = visited.reduce((a, v) => a + v, 0);
  console.log(`  Removed ${removed.toLocaleString()} / ${(w*h).toLocaleString()} pixels`);
}

for (const assetPath of ASSETS) {
  console.log(`\nProcessing: ${assetPath}`);
  try {
    const img = await Jimp.read(assetPath);
    removeBg(img, TOLERANCE);
    const buffer = await img.getBuffer('image/png');
    writeFileSync(assetPath, buffer);
    console.log(`  ✓ Saved (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
  }
}

console.log('\nDone.');
