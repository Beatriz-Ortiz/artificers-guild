/**
 * generate-sprites.mjs
 *
 * Programmatically generates top-down pixel-art sprites for Artificer's Guild.
 * All buildings are 48×48 px native; character is 24×36 px.
 * Perspective matches the existing tile set (pure orthographic top-down).
 *
 * Usage: node scripts/generate-sprites.mjs
 */

import { Jimp } from '../node_modules/jimp/dist/esm/index.js';
import { writeFileSync } from 'fs';

// ─── Palette ─────────────────────────────────────────────────────────────────
// Warm-dark outline matches path tile outline; stone is cool-gray;
// wood is warm tan matching the path tile surface.
const C = {
  T:  [0,   0,   0,   0  ], // transparent
  O:  [32,  24,  12,  255], // dark warm outline (matches tile outlines)
  SD: [70,  76,  90,  255], // stone dark
  SM: [105, 114, 132, 255], // stone mid
  SL: [142, 152, 168, 255], // stone light
  WD: [110, 76,  32,  255], // wood dark (roof eaves / shadow)
  WM: [155, 115, 58,  255], // wood mid  (main roof — matches path brown)
  WL: [195, 158, 90,  255], // wood light (ridge highlight)
  RD: [65,  80,  92,  255], // slate dark  (forge roof)
  RM: [90,  108, 122, 255], // slate mid
  RL: [120, 140, 155, 255], // slate light
  TD: [18,  95,  85,  255], // teal dark
  TM: [48,  168, 152, 255], // teal mid
  TL: [108, 228, 208, 255], // teal bright
  TW: [200, 248, 240, 255], // teal white (core glow)
  FD: [155, 65,  12,  255], // fire dark
  FM: [225, 108, 22,  255], // fire mid
  FL: [255, 196, 52,  255], // fire / glow light
  GM: [195, 152, 52,  255], // gold mid
  GL: [232, 200, 92,  255], // gold light
  SH: [0,   0,   0,   80 ], // shadow (semi-transparent)
  HR: [110, 48,  18,  255], // hair red-brown
  SK: [204, 124, 82,  255], // skin
  AR: [55,  65,  78,  255], // armour dark blue-grey
  AB: [28,  32,  42,  255], // armour very dark (outline equiv)
};

// ─── Image factory ────────────────────────────────────────────────────────────
function img(w, h) {
  return new Jimp({ width: w, height: h });
}

// ─── Drawing primitives ───────────────────────────────────────────────────────
function sp(im, x, y, c) {
  if (x < 0 || y < 0 || x >= im.width || y >= im.height) return;
  const i = (y * im.width + x) * 4;
  const d = im.bitmap.data;
  d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3] ?? 255;
}

function fr(im, x, y, w, h, c) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      sp(im, x + dx, y + dy, c);
}

function sr(im, x, y, w, h, c, t = 1) {
  fr(im, x,         y,         w, t, c);
  fr(im, x,         y + h - t, w, t, c);
  fr(im, x,         y,         t, h, c);
  fr(im, x + w - t, y,         t, h, c);
}

function fc(im, cx, cy, r, c) {
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) sp(im, cx + dx, cy + dy, c);
}

function ring(im, cx, cy, r, c) {
  const r2 = r * r;
  const r2i = (r - 1) * (r - 1);
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2 && d2 > r2i) sp(im, cx + dx, cy + dy, c);
    }
}

function line(im, x1, y1, x2, y2, c) {
  let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    sp(im, x1, y1, c);
    if (x1 === x2 && y1 === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x1 += sx; }
    if (e2 < dx)  { err += dx; y1 += sy; }
  }
}

// ─── Shared building shell ────────────────────────────────────────────────────
// bx,by = top-left of building; bw,bh = size; wt = wall thickness
function buildingShell(im, bx, by, bw, bh, wt) {
  // Drop shadow (offset SE by 2px)
  fr(im, bx + 2, by + 2, bw, bh, C.SH);

  // 1px dark outline
  sr(im, bx, by, bw, bh, C.O);

  // Stone walls — light on N+W faces, dark on S+E faces (faux lighting)
  fr(im, bx + 1, by + 1,     bw - 2, wt,         C.SM); // N wall
  fr(im, bx + 1, by + 1,     wt,     bh - 2,      C.SM); // W wall
  fr(im, bx + 1, by + bh - 1 - wt, bw - 2, wt,   C.SM); // S wall
  fr(im, bx + bw - 1 - wt, by + 1,  wt,     bh - 2, C.SM); // E wall

  // Highlights (lighter pixel on outer edge of N+W)
  fr(im, bx + 1, by + 1, bw - 2, 1, C.SL); // N highlight
  fr(im, bx + 1, by + 1, 1, bh - 2, C.SL); // W highlight

  // Shadows (darker pixel on inner edge of S+E)
  fr(im, bx + 1, by + bh - 2, bw - 2, 1, C.SD); // S shadow
  fr(im, bx + bw - 2, by + 1, 1, bh - 2, C.SD); // E shadow

  // Inner roof outline (1px dark border where wall meets roof)
  const rx = bx + wt, ry = by + wt;
  const rw = bw - wt * 2, rh = bh - wt * 2;
  sr(im, rx, ry, rw, rh, C.O);

  return { rx, ry, rw, rh };
}

// ─── Guild Hall ───────────────────────────────────────────────────────────────
function buildGuildHall() {
  const W = 48, H = 48;
  const im = img(W, H);

  // Building shell: 40×38, walls 4px
  const { rx, ry, rw, rh } = buildingShell(im, 3, 4, 40, 38, 4);
  // rx=7, ry=8, rw=32, rh=30

  // ── Wooden roof ──
  fr(im, rx + 1, ry + 1, rw - 2, rh - 2, C.WM);

  // Eaves shadow (inside edge of roof boundary)
  fr(im, rx + 1, ry + 1, rw - 2, 1, C.WD); // N eave
  fr(im, rx + 1, ry + 1, 1, rh - 2, C.WD); // W eave
  fr(im, rx + rw - 2, ry + 1, 1, rh - 2, C.WD); // E eave (darker)
  fr(im, rx + 1, ry + rh - 2, rw - 2, 1, C.WD); // S eave

  // Central ridge — runs N–S through exact centre
  const ridge = rx + Math.floor(rw / 2);
  fr(im, ridge, ry + 1, 2, rh - 2, C.WL);

  // Wood-plank grain lines (horizontal, every 4px)
  for (let y = ry + 4; y < ry + rh - 2; y += 4)
    fr(im, rx + 2, y, rw - 4, 1, C.WD);

  // East-side slightly lighter (sun from east)
  for (let y = ry + 2; y < ry + rh - 2; y++)
    for (let x = ridge + 2; x < rx + rw - 2; x++) {
      const i = (y * W + x) * 4;
      const d = im.bitmap.data;
      d[i] = Math.min(255, d[i] + 12);
      d[i + 1] = Math.min(255, d[i + 1] + 8);
    }

  // ── Flag at top-centre ──
  sp(im, 22, 2, C.O); sp(im, 22, 3, C.O); sp(im, 22, 4, C.O); // pole
  sp(im, 23, 2, C.GM); sp(im, 24, 2, C.GM); sp(im, 25, 2, C.GM);
  sp(im, 23, 3, C.GL); sp(im, 24, 3, C.GL);

  // ── Door notch (bottom wall, centre) ──
  fr(im, 18, 38, 8, 3, C.SL);
  fr(im, 19, 39, 6, 1, C.WL); // warm wood hint inside door

  // ── Window glow spots (4 corners of roof) ──
  const gw = [[rx + 2, ry + 2], [rx + rw - 4, ry + 2],
               [rx + 2, ry + rh - 4], [rx + rw - 4, ry + rh - 4]];
  for (const [gx, gy] of gw) {
    sp(im, gx, gy, C.FL); sp(im, gx + 1, gy, C.FL);
    sp(im, gx, gy + 1, C.FL);
  }

  return im;
}

// ─── Spellbook / Arcane Tower ─────────────────────────────────────────────────
function buildSpellbook() {
  const W = 48, H = 48;
  const im = img(W, H);
  const cx = 24, cy = 24;

  // Drop shadow
  fc(im, cx + 2, cy + 2, 21, C.SH);

  // Outer stone wall (filled circle)
  fc(im, cx, cy, 22, C.SM);
  ring(im, cx, cy, 22, C.O);   // outline

  // Wall thickness: outer ring SL/SD lighting
  ring(im, cx, cy, 21, C.SL);  // NW highlight
  ring(im, cx, cy, 20, C.SD);  // SE shadow (drawn after, partial override)
  // Manual NW highlight on the ring
  for (let a = 200; a <= 360; a++) {
    const rad = a * Math.PI / 180;
    const x = Math.round(cx + 20 * Math.cos(rad));
    const y = Math.round(cy + 20 * Math.sin(rad));
    sp(im, x, y, C.SD);
  }

  // Inner dark floor/roof
  fc(im, cx, cy, 17, C.RD);
  ring(im, cx, cy, 17, C.O);

  // Magic circle rings
  ring(im, cx, cy, 14, C.TM);
  ring(im, cx, cy, 10, C.TD);
  ring(im, cx, cy, 6,  C.TM);

  // Cross ticks on outer magic ring
  sp(im, cx,      cy - 14, C.TL); // N
  sp(im, cx,      cy + 14, C.TL); // S
  sp(im, cx - 14, cy,      C.TL); // W
  sp(im, cx + 14, cy,      C.TL); // E

  // Diagonal rune marks
  sp(im, cx - 10, cy - 10, C.TM);
  sp(im, cx + 10, cy - 10, C.TM);
  sp(im, cx - 10, cy + 10, C.TM);
  sp(im, cx + 10, cy + 10, C.TM);

  // Inner glow
  fc(im, cx, cy, 4, C.TL);
  fc(im, cx, cy, 2, C.TW);
  sp(im, cx, cy, C.TW);

  return im;
}

// ─── Forge / Smithy ───────────────────────────────────────────────────────────
function buildForge() {
  const W = 48, H = 48;
  const im = img(W, H);

  // Slightly wider/squatter than guild hall
  const { rx, ry, rw, rh } = buildingShell(im, 2, 4, 44, 38, 4);
  // rx=6, ry=8, rw=36, rh=30

  // ── Slate roof ──
  fr(im, rx + 1, ry + 1, rw - 2, rh - 2, C.RM);

  // Eave shadows
  fr(im, rx + 1, ry + 1,     rw - 2, 1, C.RD);
  fr(im, rx + 1, ry + 1,     1, rh - 2, C.RD);
  fr(im, rx + rw - 2, ry + 1, 1, rh - 2, C.RD);
  fr(im, rx + 1, ry + rh - 2, rw - 2, 1, C.RD);

  // Slate tile lines (horizontal every 3px)
  for (let y = ry + 3; y < ry + rh - 2; y += 3)
    fr(im, rx + 2, y, rw - 4, 1, C.RD);

  // ── Chimney (NE corner, 6×6) ──
  const chx = rx + rw - 8, chy = ry + 1;
  sr(im, chx, chy, 7, 7, C.O);
  fr(im, chx + 1, chy + 1, 5, 5, C.SD);
  fr(im, chx + 2, chy + 2, 3, 3, C.SM); // cap lighter centre
  // Smoke wisps (single pixels above chimney)
  sp(im, chx + 3, chy - 1, [160, 165, 170, 160]);
  sp(im, chx + 4, chy - 2, [160, 165, 170, 110]);

  // ── Forge pit / fire glow (S-centre of roof) ──
  const fx = rx + Math.floor(rw / 2) - 5;
  const fy = ry + rh - 12;
  sr(im, fx, fy, 11, 9, C.O);       // pit outline
  fr(im, fx + 1, fy + 1, 9, 7, C.FD); // dark base
  fr(im, fx + 2, fy + 2, 7, 5, C.FM); // mid fire
  fr(im, fx + 3, fy + 3, 5, 3, C.FL); // bright core
  sp(im, fx + 5, fy + 4, [255, 240, 180, 255]); // hottest point

  // ── Anvil shape (N-centre of roof) ──
  // Simple cross/T silhouette
  const ax = rx + Math.floor(rw / 2) - 3, ay = ry + 5;
  fr(im, ax,     ay + 2, 6, 2, C.O); // anvil top
  fr(im, ax + 2, ay,     2, 6, C.O); // anvil stem
  fr(im, ax,     ay + 4, 6, 2, C.SD); // base
  // Highlight edge
  sp(im, ax, ay + 2, C.SL);
  sp(im, ax, ay + 3, C.SL);

  return im;
}

// ─── Portal ────────────────────────────────────────────────────────────────────
function buildPortal() {
  const W = 48, H = 48;
  const im = img(W, H);

  // Drop shadow
  fr(im, 2, 2, W - 2, H - 2, C.SH);

  // Outer stone frame (full 48×48, 7px thick walls)
  const wt = 7;
  sr(im, 0, 0, W, H, C.O);
  fr(im, 1, 1, W - 2, wt,         C.SM); // N wall
  fr(im, 1, H - 1 - wt, W - 2, wt, C.SM); // S wall
  fr(im, 1, 1, wt, H - 2,          C.SM); // W wall
  fr(im, W - 1 - wt, 1, wt, H - 2, C.SM); // E wall

  // Wall lighting
  fr(im, 1, 1, W - 2, 1, C.SL); // N highlight
  fr(im, 1, 1, 1, H - 2, C.SL); // W highlight
  fr(im, 1, H - 2, W - 2, 1, C.SD); // S shadow
  fr(im, W - 2, 1, 1, H - 2, C.SD); // E shadow

  // Corner stone blocks (heavier look)
  fr(im, 1, 1, wt, wt, C.SD);
  fr(im, W - 1 - wt, 1, wt, wt, C.SD);
  fr(im, 1, H - 1 - wt, wt, wt, C.SD);
  fr(im, W - 1 - wt, H - 1 - wt, wt, wt, C.SD);

  // Corner outlines
  sr(im, 1, 1, wt, wt, C.O);
  sr(im, W - 1 - wt, 1, wt, wt, C.O);
  sr(im, 1, H - 1 - wt, wt, wt, C.O);
  sr(im, W - 1 - wt, H - 1 - wt, wt, wt, C.O);

  // Inner portal surface
  const px = wt, py = wt;
  const pw = W - wt * 2, ph = H - wt * 2;
  const pcx = Math.floor(W / 2), pcy = Math.floor(H / 2);

  fr(im, px, py, pw, ph, C.TD);           // dark teal base
  sr(im, px, py, pw, ph, C.O);            // inner border

  // Swirling glow rings (concentric)
  fc(im, pcx, pcy, 14, C.TM);
  fc(im, pcx, pcy, 10, C.TL);
  fc(im, pcx, pcy, 6,  C.TW);
  fc(im, pcx, pcy, 3,  C.TW);
  sp(im, pcx, pcy, C.TW);

  // Rune marks at cardinal points on frame
  sp(im, pcx, 3,      C.TM);  // N
  sp(im, pcx, H - 4,  C.TM);  // S
  sp(im, 3,   pcy,    C.TM);  // W
  sp(im, W - 4, pcy,  C.TM);  // E

  // Step detail at bottom (lighter strip)
  fr(im, px + 1, py + ph - 3, pw - 2, 2, C.SL);
  fr(im, px + 1, py + ph - 2, pw - 2, 1, C.SM);

  return im;
}

// ─── Artificer (top-down character, 24×36) ────────────────────────────────────
function buildArtificer() {
  const W = 24, H = 36;
  const im = img(W, H);

  // Shadow
  fc(im, 11, 19, 9, C.SH);

  // ── Head (rows 1–9, centred at x=11) ──
  fc(im, 11, 5, 5, C.HR);          // hair mass
  fc(im, 11, 5, 3, C.SK);          // face/skin inside hair
  ring(im, 11, 5, 5, C.AB);        // outline

  // Face details: eyes (two dark dots) and subtle mouth
  sp(im, 10, 4, [40, 28, 20, 255]);
  sp(im, 12, 4, [40, 28, 20, 255]);
  sp(im, 11, 6, [170, 95, 60, 255]); // mouth hint

  // ── Shoulders (rows 8–14) ──
  fr(im, 3,  9,  18, 6, C.AR);  // wide shoulder plate
  sr(im, 3,  9,  18, 6, C.AB);  // outline
  // Pauldron highlights (left + right bumps)
  fr(im, 3, 9, 4, 3, C.SM);
  fr(im, 17, 9, 4, 3, C.SM);
  // Gold trim on shoulders
  sp(im, 4, 9, C.GM); sp(im, 5, 9, C.GM);
  sp(im, 18, 9, C.GM); sp(im, 19, 9, C.GM);

  // ── Torso / chest armour (rows 14–24) ──
  fr(im, 7, 14, 10, 11, C.AR);
  sr(im, 7, 14, 10, 11, C.AB);
  // Gold clasp at centre
  sp(im, 11, 18, C.GM); sp(im, 12, 18, C.GM);
  sp(im, 11, 19, C.GL); sp(im, 12, 19, C.GL);
  // Belt line
  fr(im, 7, 23, 10, 1, C.O);
  fr(im, 7, 24, 10, 1, C.WD);

  // ── Legs (rows 25–34) ──
  fr(im, 7,  25, 4, 10, C.AR);   // L leg
  fr(im, 13, 25, 4, 10, C.AR);   // R leg
  sr(im, 7,  25, 4, 10, C.AB);
  sr(im, 13, 25, 4, 10, C.AB);
  // Boots (darker bottom 3 rows)
  fr(im, 7,  32, 4, 3, C.O);
  fr(im, 13, 32, 4, 3, C.O);
  fr(im, 8,  33, 2, 2, C.WD);    // boot highlight L
  fr(im, 14, 33, 2, 2, C.WD);    // boot highlight R

  // ── Teal orb (right side, rows 11–18) ──
  fc(im, 19, 14, 3, C.TM);
  fc(im, 19, 14, 2, C.TL);
  sp(im, 19, 14, C.TW);
  ring(im, 19, 14, 3, C.AB);

  return im;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const sprites = [
    ['public/assets/building_guildhall.png', buildGuildHall()],
    ['public/assets/building_spellbook.png', buildSpellbook()],
    ['public/assets/building_forge.png',     buildForge()],
    ['public/assets/building_portal.png',    buildPortal()],
    ['public/assets/artificer_idle.png',     buildArtificer()],
  ];

  for (const [path, im] of sprites) {
    const buf = await im.getBuffer('image/png');
    writeFileSync(path, buf);
    console.log(`✓ ${path}  (${im.width}×${im.height} px, ${(buf.length / 1024).toFixed(1)} KB)`);
  }
  console.log('\nAll sprites generated.');
}

main().catch((e) => { console.error(e); process.exit(1); });
