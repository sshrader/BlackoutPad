'use strict';
// Poop characters for PooPad: eight originals, drawn as 32 x 32 pixel sprites with a worried face.
// Generators are the swirl, pile, nugget and soft serve; distributors are the log, puddle, pellet and splat.
// Even slots are generators and odd slots are distributors, so the teams stay level.
// Everything is drawn here with a tiny rasterizer and a PNG encoder, so there are no dependencies and no image files.
const crypto = require('crypto');
const { encodePng } = require('./isorender');

const N = 32;
const INK = '#14141a', FACE_TEAR = '#1ff2ff', STEEL = '#9aa4ba', DARKBASE = '#15183a';

// ---- looks: each asset has four colour sets ----
const SPECIES = {
  generator: {
    swirl: { name: 'Swirl', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    pile: { name: 'Pile', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    nugget: { name: 'Nugget', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    softserve: { name: 'Soft serve', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
  },
  distributor: {
    log: { name: 'Log', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    puddle: { name: 'Puddle', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    pellet: { name: 'Pellet', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
    splat: { name: 'Splat', w: 14, looks: [
      { n: 'Classic', body: '#8a5a34', shade: '#6a4226', hi: '#b07a4c' }, { n: 'Dark roast', body: '#5a3a22', shade: '#412716', hi: '#7a5234' },
      { n: 'Tan', body: '#b08a5a', shade: '#8a6a40', hi: '#d0aa78' }, { n: 'Toxic', body: '#6aa84a', shade: '#4a8234', hi: '#8ed06a' }] },
  },
};
const ACCS = [['none', 30], ['plaster', 24], ['beacon', 20], ['flag', 26]];
const ACC_COL = ['#ff3d6e', '#1ff2ff', '#39ff88', '#ffd24a', '#b08aff', '#ff8ad6', '#ff9a3c'];
const BGS = { generator: ['#06141c', '#071722', '#08131f', '#06161a'], distributor: ['#07160f', '#08180f', '#0a1812', '#06140e'] };
const NAMES = {
  generator: ['PLOP', 'SPLORT', 'TURDLE', 'DOOKIE', 'SQUISH', 'FLUSH', 'GRUMBLE', 'STINKY', 'PHEW', 'WHIFF', 'TOOT', 'BRAPP', 'SMUDGE', 'GLOOP', 'SQUELCH', 'MUSHY', 'CLOG', 'STEAMER', 'RIPPLE', 'BUBBLES', 'HONK', 'WIGGLE', 'BLOOP', 'PLUNGE', 'LOAF', 'SOGGY', 'CRINGE', 'OOPS', 'YIKES', 'GASSY', 'FUNK', 'NUMBER2'],
  distributor: ['STAIN', 'WHOOPS', 'MESS', 'SPILL', 'SMEAR', 'GROSS', 'YUCK', 'EWW', 'ICK', 'SLOP', 'GUNK', 'GOOP', 'SLIME', 'MUCK', 'DRIP', 'SPLISH', 'DAMP', 'SQUIRT', 'LEAK', 'OOZE', 'RUNNY', 'PANIC', 'URGENT', 'HURRY', 'BRACE', 'OOF', 'NOPE', 'TRAPPED', 'CORNERED', 'DOOMED', 'REGRET', 'SPLOSH'],
};

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  SWIRL: { team: 'generator', fn: 'SCOUT', blurb: 'Swirls round every wallet holding the coin and counts them.' },
  PILE: { team: 'generator', fn: 'ARCHIVIST', blurb: 'Piles up each milestone the coin passes along its curve.' },
  NUGGET: { team: 'generator', fn: 'HUNTER', blurb: 'Sniffs out the wallets that rushed in during the launch block.' },
  SOFTSERVE: { team: 'generator', fn: 'COURIER', blurb: 'Keeps the coin’s best days on record, like a good cone.' },
  LOG: { team: 'distributor', fn: 'SENTRY', blurb: 'Keeps watch on the dev wallet and never moves.' },
  PUDDLE: { team: 'distributor', fn: 'ANALYST', blurb: 'Tracks the market cap and how far it has run since the peak.' },
  PELLET: { team: 'distributor', fn: 'AUDITOR', blurb: 'Trusts nothing until the mint and freeze authority are revoked.' },
  SPLAT: { team: 'distributor', fn: 'WARDEN', blurb: 'Works out how big a mess a large sale would make.' },
};
const ABILITIES = {
  SWIRL: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  PILE: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  NUGGET: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  SOFTSERVE: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  LOG: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  PUDDLE: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  PELLET: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  SPLAT: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other character’s ability on the coin at once and reports the headline from each.' },
};
const TEAM_ROLES = { generator: Object.keys(ROLES).filter((k) => ROLES[k].team === 'generator'), distributor: Object.keys(ROLES).filter((k) => ROLES[k].team === 'distributor') };

function prng(seedBytes) {
  let a = seedBytes.readUInt32LE(0) ^ seedBytes.readUInt32LE(4);
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickW(list, r) { const tot = list.reduce((a, x) => a + x[1], 0); let t = r * tot; for (const x of list) { t -= x[1]; if (t < 0) return x; } return list[list.length - 1]; }

// ---- traits: the same look is never handed out twice in one set ----
const traitCache = new Map();
function traitsFor(slot, secret) {
  const ck = String(secret);
  let list = traitCache.get(ck);
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('grid').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  while (list.items.length <= slot) {
    const idx = list.items.length, team = idx % 2 === 0 ? 'generator' : 'distributor', sp = SPECIES[team], keys = Object.keys(sp);
    let t, key, tries = 0;
    do {
      const k = pickW(keys.map((x) => [x, sp[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * sp[k].looks.length);
      t = { team, species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      key = [k, look, t.acc, t.acc === 'none' || t.acc === 'plaster' ? 0 : t.accColor].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look);
    let nm, nt = 0;
    do { nm = NAMES[team][Math.floor(list.rnd() * NAMES[team].length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = k2role(t.species);
    list.items.push(t);
  }
  return list.items[slot];
}
const k2role = (species) => species.toUpperCase();
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species];
  return { name: t.name, role: t.role, team: t.team === 'generator' ? 'GENERATOR' : 'DISTRIBUTOR', blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, accessory: t.acc === 'none' ? null : t.acc };
}

// ---- a tiny rasterizer: 32 x 32 pixels, no anti-aliasing, so every edge stays crisp ----
const rgbOf = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
class Canvas {
  constructor(bg) { this.px = Buffer.alloc(N * N * 3); const c = rgbOf(bg); for (let i = 0; i < N * N; i++) { this.px[i * 3] = c[0]; this.px[i * 3 + 1] = c[1]; this.px[i * 3 + 2] = c[2]; } }
  put(x, y, c, a) {
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const i = (y * N + x) * 3;
    if (a == null || a >= 1) { this.px[i] = c[0]; this.px[i + 1] = c[1]; this.px[i + 2] = c[2]; return; }
    for (let k = 0; k < 3; k++) this.px[i + k] = Math.round(this.px[i + k] * (1 - a) + c[k] * a);
  }
  // fill every pixel whose centre passes the test
  fill(test, col, a) { const c = rgbOf(col); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (test(x + 0.5, y + 0.5)) this.put(x, y, c, a); }
  rect(x, y, w, h, col, a) { this.fill((px, py) => px >= x && px < x + w && py >= y && py < y + h, col, a); }
  circle(cx, cy, r, col, a) { this.fill((px, py) => (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r, col, a); }
  poly(pts, col, a) {
    this.fill((px, py) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }, col, a);
  }
  line(x1, y1, x2, y2, wd, col) {
    const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy, h = wd / 2;
    this.fill((px, py) => { let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const qx = x1 + t * dx, qy = y1 + t * dy; return (px - qx) * (px - qx) + (py - qy) * (py - qy) <= h * h; }, col);
  }
  // a rectangle turned about (cx, cy)
  spin(x, y, w, h, cx, cy, deg, col) {
    const r = deg * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([a, b]) => [cx + (a - cx) * cs - (b - cy) * sn, cy + (a - cx) * sn + (b - cy) * cs]), col);
  }
}

// the worried face: 12 x 10, eyes looking down, brows tilted up in the middle, a frown and one sweat drop
function face(c, x, y, o) {
  o = o || {};
  const R = (a, b, w, h, col) => c.rect(x + a, y + b, w, h, col);
  R(1, 2, 3, 3, '#ffffff'); R(8, 2, 3, 3, '#ffffff'); R(2, 3, 1, 2, INK); R(9, 3, 1, 2, INK);
  R(2, 0, 2, 1, INK); R(1, 1, 1, 1, INK); R(8, 0, 2, 1, INK); R(10, 1, 1, 1, INK);
  R(3, 7, 6, 1, INK); R(2, 8, 1, 1, INK); R(9, 8, 1, 1, INK);
  R(11, 4, 1, 2, o.tear || FACE_TEAR);
}

// ---- the eight assets, as drawn in the mockup ----
const DRAW = {
  swirl(c, L) {
    c.poly([[3, 29], [4, 22], [9, 20], [23, 20], [28, 22], [29, 29]], L.body); c.rect(4, 27, 25, 2, L.shade);
    c.poly([[7, 21], [9, 14], [14, 12], [18, 12], [23, 14], [25, 21]], L.body); c.rect(9, 20, 15, 1, L.shade);
    c.poly([[11, 13], [13, 9], [16, 6], [19, 9], [21, 13]], L.body); c.poly([[14, 7], [17, 2], [18, 7]], L.body); c.rect(10, 15, 3, 1, L.hi); face(c, 10, 15);
  },
  pile(c, L) {
    c.poly([[2, 29], [3, 22], [8, 18], [24, 18], [29, 22], [30, 29]], L.body); c.rect(3, 27, 27, 2, L.shade);
    c.poly([[8, 19], [11, 13], [21, 13], [24, 19]], L.body); c.rect(10, 14, 3, 1, L.hi); face(c, 10, 16);
  },
  nugget(c, L) {
    c.circle(16, 19, 12, L.body); c.fill((x, y) => (x - 16) * (x - 16) + (y - 19) * (y - 19) <= 144 && y > 26, L.shade); c.circle(9.5, 11.5, 1.8, L.hi); face(c, 10, 14);
  },
  softserve(c, L) {
    c.poly([[7, 20], [25, 20], [16, 31]], '#d9a860'); c.line(10, 21, 18, 29, 1, '#b8863e'); c.line(22, 21, 14, 29, 1, '#b8863e');
    c.poly([[4, 20], [5, 11], [27, 11], [28, 20]], L.body); c.rect(5, 18, 23, 2, L.shade);
    c.poly([[9, 12], [11, 7], [21, 7], [23, 12]], L.body); c.poly([[13, 8], [16, 1], [19, 8]], L.body); c.rect(8, 12, 3, 1, L.hi); face(c, 10, 10);
  },
  log(c, L) {
    c.circle(10, 19, 8, L.body); c.circle(22, 19, 8, L.body); c.rect(10, 11, 12, 16, L.body); c.rect(6, 25, 20, 2, L.shade); c.rect(8, 13, 4, 1, L.hi); face(c, 10, 14);
  },
  puddle(c, L) {
    c.poly([[8, 22], [10, 13], [22, 13], [24, 22]], L.body);
    c.fill((x, y) => ((x - 16) / 14) * ((x - 16) / 14) + ((y - 23) / 6) * ((y - 23) / 6) <= 1, L.body); c.rect(5, 26, 2, 4, L.body); c.rect(25, 26, 2, 3, L.body); c.rect(12, 27, 2, 3, L.shade); c.rect(11, 14, 3, 1, L.hi); face(c, 10, 13);
  },
  pellet(c, L) {
    c.circle(16, 17, 10, L.body); c.circle(5, 26, 3.5, L.body); c.circle(27, 27, 3, L.body); c.circle(22, 29, 2.5, L.shade); c.circle(11, 11, 1.6, L.hi); face(c, 10, 12);
  },
  splat(c, L) {
    c.circle(16, 17, 9, L.body); c.circle(7, 9, 3, L.body); c.circle(26, 10, 2.5, L.body); c.circle(4, 21, 2.5, L.body); c.circle(28, 23, 3, L.body); c.circle(10, 27, 2, L.body); c.circle(23, 28, 2, L.body);
    c.rect(15, 24, 3, 6, L.shade); c.circle(16.5, 30, 1.5, L.shade); c.circle(11, 12, 1.6, L.hi); face(c, 10, 12);
  },
};
function flagship(c) {
  const B = '#8a5a34', D = '#6a4226', H = '#b07a4c';
  c.poly([[3, 28], [4, 21], [9, 19], [23, 19], [28, 21], [29, 28]], B); c.rect(4, 26, 25, 2, D);
  c.poly([[7, 20], [9, 13], [14, 11], [18, 11], [23, 13], [25, 20]], B); c.rect(9, 14, 3, 1, H);
  c.rect(9, 19, 15, 1, D); c.rect(12, 12, 9, 1, D);
  c.poly([[11, 12], [13, 8], [16, 5.5], [19, 8], [21, 12]], B);
  c.poly([[10, 6], [11, 1], [13, 3.5], [16, 0], [19, 3.5], [21, 1], [22, 6]], '#3dff9a'); c.rect(15, 2, 2, 2, '#ff4d4d');
  face(c, 10, 14, { tear: '#9dffc4' });
}
// small extras on the corner of an asset, so two of the same kind still look different
function accessory(c, acc, col) {
  if (acc === 'plaster') { c.poly([[1, 25], [3, 23], [9, 29], [7, 31]], '#f0d2a8'); c.rect(4.5, 26, 1, 1, '#c89a68'); c.rect(5.5, 27, 1, 1, '#c89a68'); }
  else if (acc === 'beacon') { c.circle(3.5, 3.5, 3.4, col, 0.25); c.rect(2, 2, 3, 3, col); c.rect(3, 3, 1, 1, '#ffffff'); }
  else if (acc === 'flag') { c.rect(2, 1, 1, 9, '#9aa4ba'); c.poly([[3, 1], [8, 2.5], [3, 5]], col); }
}

function bgFor(c, team, bgIdx) {
  c.rect(0, 0, N, N, BGS[team][bgIdx]);
  for (let i = 8; i < N; i += 8) { c.rect(i, 0, 1, N, '#ffffff', 0.04); c.rect(0, i, N, 1, '#ffffff', 0.04); }
}

function paint(slot, secret) {
  const t = traitsFor(slot, secret), L = SPECIES[t.team][t.species].looks[t.look];
  const c = new Canvas(BGS[t.team][t.bg]); bgFor(c, t.team, t.bg);
  DRAW[t.species](c, L);
  accessory(c, t.acc, ACC_COL[t.accColor]);
  return c;
}
function paintFlagship() { const c = new Canvas('#04050c'); c.rect(0, 0, N, N, '#04050c'); for (let i = 8; i < N; i += 8) { c.rect(i, 0, 1, N, '#39ff88', 0.07); c.rect(0, i, N, 1, '#39ff88', 0.07); } flagship(c); return c; }

// ---- flat pictures for logos and tiles: the 32 x 32 sprite scaled up with no smoothing, cached ----
const picCache = new Map();
function scaled(c, size) {
  size = Math.max(N, Math.min(2048, Math.round(size) || 512));
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) { const sy = Math.floor(y * N / size); for (let x = 0; x < size; x++) { const sx = Math.floor(x * N / size), s = (sy * N + sx) * 3, o = (y * size + x) * 3; out[o] = c.px[s]; out[o + 1] = c.px[s + 1]; out[o + 2] = c.px[s + 2]; } }
  return encodePng(out, size, size);
}
function cached(key, size, make) {
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = scaled(make(), size); picCache.set(k, b); if (picCache.size > 160) picCache.delete(picCache.keys().next().value); }
  return b;
}
const png = (slot, secret, size) => cached('a' + secret + ':' + slot, size || 512, () => paint(slot, secret));
const founderPng = (size) => cached('prime', size || 512, paintFlagship);

// a lightning bolt, as runs of squares on a 64 x 64 grid, for the locked tiles and the logo
const BOLT = [[38, 3], [14, 36], [29, 36], [22, 61], [52, 25], [35, 25], [47, 3]];
const SHAPE_ON = (x, y) => {
  const px = x + 0.5, py = y + 0.5; let inside = false;
  for (let i = 0, j = BOLT.length - 1; i < BOLT.length; j = i++) {
    const [xi, yi] = BOLT[i], [xj, yj] = BOLT[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
function silhouette() {
  const runs = [];
  for (let y = 0; y < 64; y++) { let x = 0; while (x < 64) { if (!SHAPE_ON(x, y)) { x++; continue; } let n = 1; while (x + n < 64 && SHAPE_ON(x + n, y)) n++; runs.push([y, x, n]); x += n; } }
  return runs;
}

module.exports = { png, founderPng, silhouette, traitsFor, agentFor, ROLES, ABILITIES, SPECIES, N };
