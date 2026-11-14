'use strict';
// Grid assets for BlackoutPad: eight original pieces of the power grid, drawn as 32 x 32 pixel sprites with a worried face.
// Generators make power (wind turbine, solar array, cooling tower, diesel generator). Distributors move it (substation, pole transformer,
// pylon, battery bank). Even slots are generators and odd slots are distributors, so the teams stay level.
// Everything is drawn here with a tiny rasterizer and a PNG encoder, so there are no dependencies and no image files.
const crypto = require('crypto');
const { encodePng } = require('./isorender');

const N = 32;
const INK = '#14141a', FACE_TEAR = '#1ff2ff', STEEL = '#9aa4ba', DARKBASE = '#15183a';

// ---- looks: each asset has four colour sets ----
const SPECIES = {
  generator: {
    turbine: { name: 'Wind turbine', w: 14, looks: [
      { n: 'White', body: '#e8ecf4', blade: '#cfd6e6', tower: '#9aa4ba' }, { n: 'Ice', body: '#c9eaf5', blade: '#a8d6ea', tower: '#8aa6c0' },
      { n: 'Mint', body: '#c9f2e2', blade: '#a6e6cd', tower: '#8ab0a4' }, { n: 'Lilac', body: '#dcd6f5', blade: '#c0b8ee', tower: '#9a98c0' }] },
    solar: { name: 'Solar array', w: 14, looks: [
      { n: 'Navy', panel: '#1f3a6a', edge: '#1ff2ff' }, { n: 'Indigo', panel: '#2a2f78', edge: '#7b86ff' },
      { n: 'Teal', panel: '#124a5a', edge: '#39ff88' }, { n: 'Violet', panel: '#3a2a78', edge: '#c08aff' }] },
    cooling: { name: 'Cooling tower', w: 14, looks: [
      { n: 'Periwinkle', body: '#7b86d0', steam: '#cfd6e6' }, { n: 'Concrete', body: '#8a90a8', steam: '#e0e4ee' },
      { n: 'Slate', body: '#56608f', steam: '#b8c0dc' }, { n: 'Sky', body: '#6aa6d6', steam: '#e0f0ff' }] },
    diesel: { name: 'Diesel generator', w: 14, looks: [
      { n: 'Violet', body: '#7a3cff', stripe: '#39ff88' }, { n: 'Cobalt', body: '#2f5ae0', stripe: '#1ff2ff' },
      { n: 'Magenta', body: '#b53cd6', stripe: '#39ff88' }, { n: 'Plum', body: '#5a2fa0', stripe: '#ff8ad6' }] },
  },
  distributor: {
    substation: { name: 'Substation', w: 14, looks: [
      { n: 'Slate', body: '#2a3158', trim: '#4a54a0', lamp: '#39ff88' }, { n: 'Steel', body: '#3a4468', trim: '#6a76b8', lamp: '#1ff2ff' },
      { n: 'Midnight', body: '#1f2548', trim: '#3a4590', lamp: '#39ff88' }, { n: 'Graphite', body: '#33363f', trim: '#5a5f70', lamp: '#9dffc4' }] },
    transformer: { name: 'Pole transformer', w: 14, looks: [
      { n: 'Indigo', body: '#4a54a0', pole: '#3b3f7a', arm: '#5560b0', lid: '#7b86d0' }, { n: 'Grey', body: '#6a7088', pole: '#4a4f66', arm: '#7a8098', lid: '#9aa0b8' },
      { n: 'Teal', body: '#2f7a86', pole: '#2a4a58', arm: '#4a9aa6', lid: '#6ac2cc' }, { n: 'Plum', body: '#6a4a98', pole: '#4a3a70', arm: '#8a66b8', lid: '#a888d8' }] },
    pylon: { name: 'Pylon', w: 14, looks: [
      { n: 'Lattice', steel: '#7b86d0', box: '#2a3158', cap: '#39ff88' }, { n: 'Silver', steel: '#aab2c8', box: '#3a4060', cap: '#1ff2ff' },
      { n: 'Rust', steel: '#b8704a', box: '#3a2a38', cap: '#39ff88' }, { n: 'Blue', steel: '#5a8ad6', box: '#202f58', cap: '#9dffc4' }] },
    battery: { name: 'Battery bank', w: 14, looks: [
      { n: 'Slate', body: '#2a3158', term: '#39ff88' }, { n: 'Steel', body: '#3a4468', term: '#1ff2ff' },
      { n: 'Charcoal', body: '#2e3038', term: '#39ff88' }, { n: 'Navy', body: '#1f3a6a', term: '#9dffc4' }] },
  },
};
const ACCS = [['none', 30], ['plaster', 24], ['beacon', 20], ['flag', 26]];
const ACC_COL = ['#ff3d6e', '#1ff2ff', '#39ff88', '#ffd24a', '#b08aff', '#ff8ad6', '#ff9a3c'];
const BGS = { generator: ['#06141c', '#071722', '#08131f', '#06161a'], distributor: ['#07160f', '#08180f', '#0a1812', '#06140e'] };
const NAMES = {
  generator: ['SPIN', 'GUST', 'BREEZE', 'SUNUP', 'DAWN', 'STEAM', 'PLUME', 'DRAFT', 'ROTOR', 'BLADE', 'FLARE', 'RADIANT', 'TURBO', 'HUM', 'COIL', 'BURN', 'CRANK', 'IDLE', 'REVVED', 'SOLSTICE', 'HALO', 'RAY', 'BEAM', 'GLINT', 'SPARKLE', 'ZEPHYR', 'MISTRAL', 'DYNAMO', 'KILN', 'FURNACE', 'REACTOR', 'DRIFT'],
  distributor: ['RELAY', 'SWITCH', 'FEEDER', 'TAP', 'BUSBAR', 'BREAKER', 'LOAD', 'RING', 'MAINS', 'SPAN', 'NODE', 'TIE', 'SHUNT', 'PHASE', 'SAG', 'DROP', 'LINE', 'CABLE', 'CONDUIT', 'FUSE', 'VOLT', 'AMP', 'WATT', 'OHM', 'RESERVE', 'SPARE', 'BACKUP', 'STANDBY', 'FLOW', 'TRUNK', 'RIDGE', 'CROSSING'],
};

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  TURBINE: { team: 'generator', fn: 'SCOUT', blurb: 'Spins up a count of every wallet holding the coin.' },
  SOLAR: { team: 'generator', fn: 'ARCHIVIST', blurb: 'Soaks up each milestone the coin passes along its curve.' },
  COOLING: { team: 'generator', fn: 'HUNTER', blurb: 'Watches for the wallets that rushed in during the launch block.' },
  DIESEL: { team: 'generator', fn: 'COURIER', blurb: 'Keeps the coin’s best days on record, in case the lights stay off.' },
  SUBSTATION: { team: 'distributor', fn: 'SENTRY', blurb: 'Keeps watch on the dev wallet around the clock.' },
  TRANSFORMER: { team: 'distributor', fn: 'ANALYST', blurb: 'Steps the market cap up and down and tracks how far it is from the peak.' },
  PYLON: { team: 'distributor', fn: 'AUDITOR', blurb: 'Trusts nothing until the mint and freeze authority are revoked.' },
  BATTERY: { team: 'distributor', fn: 'WARDEN', blurb: 'Works out how hard a big sale would hit the curve.' },
};
const ABILITIES = {
  TURBINE: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  SOLAR: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  COOLING: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  DIESEL: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  SUBSTATION: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  TRANSFORMER: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  PYLON: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  BATTERY: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other asset’s ability on the coin at once and reports the headline from each.' },
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
  turbine(c, L) {
    for (const a of [10, 130, 250]) c.spin(15, 0, 2, 14, 16, 14, a, L.blade);
    c.rect(15, 19, 2, 11, L.tower); c.rect(11, 29, 10, 2, DARKBASE);
    c.rect(7, 8, 18, 12, L.body); face(c, 10, 9);
  },
  solar(c, L) {
    const P = [[3, 6], [29, 6], [25, 22], [7, 22]];
    c.poly(P, L.panel);
    for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; c.line(a[0], a[1], b[0], b[1], 1, L.edge); }
    c.rect(15, 22, 2, 6, STEEL); c.rect(8, 28, 16, 2, DARKBASE); face(c, 10, 8);
  },
  cooling(c, L) {
    c.circle(14, 3, 2.5, L.steam, 0.6); c.circle(19, 2, 2, L.steam, 0.5);
    c.poly([[7, 6], [25, 6], [22, 17], [26, 29], [6, 29], [10, 17]], L.body); face(c, 10, 16);
  },
  diesel(c, L) {
    c.circle(26, 3, 2, STEEL, 0.6); c.rect(24, 5, 3, 8, DARKBASE);
    c.rect(3, 26, 26, 3, DARKBASE); c.rect(4, 13, 24, 13, L.body); c.rect(4, 12, 24, 1, L.stripe); face(c, 8, 14);
  },
  substation(c, L) {
    c.rect(2, 27, 28, 3, DARKBASE); c.rect(6, 12, 20, 15, L.body); c.rect(5, 11, 22, 2, L.trim);
    for (const x of [9, 15, 21]) c.rect(x, 6, 2, 5, L.trim);
    for (const x of [8, 14, 20]) c.rect(x, 4, 4, 2, L.lamp);
    face(c, 10, 14);
  },
  transformer(c, L) {
    c.rect(14, 2, 4, 28, L.pole); c.rect(5, 5, 22, 2, L.arm); c.rect(8, 10, 16, 15, L.body); c.rect(7, 9, 18, 2, L.lid); face(c, 10, 12);
  },
  pylon(c, L) {
    for (const [a, b, d, e] of [[16, 2, 5, 30], [16, 2, 27, 30], [8, 22, 24, 22], [10.5, 16, 21.5, 16], [13, 10, 19, 10]]) c.line(a, b, d, e, 1.4, L.steel);
    c.rect(3, 8, 26, 1.5, L.steel); c.rect(4, 9.5, 2, 2, L.cap); c.rect(26, 9.5, 2, 2, L.cap); c.rect(9, 12, 14, 12, L.box); face(c, 10, 13);
  },
  battery(c, L) {
    c.rect(8, 7, 4, 3, L.term); c.rect(20, 7, 4, 3, L.term); c.rect(3, 10, 26, 17, L.body);
    c.rect(6, 23, 20, 2, INK); c.rect(6, 23, 4, 2, '#ff3d6e'); face(c, 10, 11);
  },
};
function flagship(c) {
  c.rect(2, 27, 28, 3, INK); c.rect(6, 10, 20, 17, '#1a1f4a'); c.rect(5, 9, 22, 2, '#3a4590');
  c.poly([[8, 9], [9, 3], [12, 6], [16, 2], [20, 6], [23, 3], [24, 9]], '#3dff9a'); c.rect(15, 3, 2, 2, '#ff4d4d');
  face(c, 10, 13, { tear: '#9dffc4' });
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
