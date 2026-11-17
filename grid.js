'use strict';
// The crooks for HeistPad: eight original characters drawn as 48 x 48 pixel mugshots, plus a one-of-one Kingpin for the flagship.
// Street Crew (robber, driver, safecracker, hacker) and the Syndicate (boss, lookout, muscle, accountant). Even slots are crew and odd
// slots are syndicate, so the teams stay level. Everything is drawn here with a tiny rasterizer and a PNG encoder: no libraries, no image files.
const crypto = require('crypto');
const { encodePng } = require('./isorender');

const N = 48;
const INK = '#141018';
const SKINS = [['#f0cfae', '#d9a98a'], ['#e8c4a0', '#c99d78'], ['#c99774', '#a87654'], ['#8d5a3a', '#6f4429']];

// ---- looks: each crook has four, and each look has its own skin tone ----
const mk = (list) => list.map((l, i) => Object.assign({ skin: i }, l));
const SPECIES = {
  crew: {
    robber: { name: 'Robber', w: 14, looks: mk([
      { n: 'Black mask', mask: '#2b2838', shirt: '#e8e8f0', stripe: '#1a1626', hair: '#3a2a1e' }, { n: 'Red mask', mask: '#a8263a', shirt: '#e8e8f0', stripe: '#1a1626', hair: '#2a1a12' },
      { n: 'Navy mask', mask: '#26356a', shirt: '#f0e8d8', stripe: '#26356a', hair: '#1a1410' }, { n: 'Grey mask', mask: '#6a6e7a', shirt: '#e8e8f0', stripe: '#8a1f3a', hair: '#141018' }]) },
    driver: { name: 'Driver', w: 14, looks: mk([
      { n: 'Orange cap', cap: '#ff8a3d', brim: '#c96a1e', jacket: '#3a5a8a', hair: '#4a3020' }, { n: 'Teal cap', cap: '#19a89a', brim: '#11786e', jacket: '#5a3a2a', hair: '#2a1a12' },
      { n: 'Black cap', cap: '#26242e', brim: '#141018', jacket: '#8a1f3a', hair: '#1a1410' }, { n: 'White cap', cap: '#e8e8f0', brim: '#b8b8c4', jacket: '#2a2a38', hair: '#141018' }]) },
    safecracker: { name: 'Safecracker', w: 14, looks: mk([
      { n: 'Teal beanie', beanie: '#19a89a', shirt: '#5a4a3a', hair: '#4a3020' }, { n: 'Grey beanie', beanie: '#6a6e7a', shirt: '#3a4a5a', hair: '#2a1a12' },
      { n: 'Red beanie', beanie: '#a8263a', shirt: '#4a4a3a', hair: '#1a1410' }, { n: 'Mustard beanie', beanie: '#c9a02a', shirt: '#3a2a3a', hair: '#141018' }]) },
    hacker: { name: 'Hacker', w: 14, looks: mk([
      { n: 'Violet hoodie', hood: '#3a2a6a', lens: '#19e3d0', hair: '#4a3020' }, { n: 'Black hoodie', hood: '#1e1c26', lens: '#ff2d95', hair: '#2a1a12' },
      { n: 'Green hoodie', hood: '#1f5a4a', lens: '#ffd24a', hair: '#1a1410' }, { n: 'Grey hoodie', hood: '#555a68', lens: '#19e3d0', hair: '#141018' }]) },
  },
  syndicate: {
    boss: { name: 'Boss', w: 14, looks: mk([
      { n: 'Charcoal suit', suit: '#1c1c2e', tie: '#ff2d95', hair: '#141018' }, { n: 'Navy suit', suit: '#1f2a52', tie: '#ffd24a', hair: '#2a1a12' },
      { n: 'Burgundy suit', suit: '#4a1428', tie: '#19e3d0', hair: '#1a1410' }, { n: 'Cream suit', suit: '#d8cfb8', tie: '#8a1f3a', hair: '#8a8a8a' }]) },
    lookout: { name: 'Lookout', w: 14, looks: mk([
      { n: 'Pink bandana', band: '#ff2d95', jacket: '#2a5a4a', hair: '#4a3020' }, { n: 'Teal bandana', band: '#19e3d0', jacket: '#4a2a5a', hair: '#2a1a12' },
      { n: 'Orange bandana', band: '#ff8a3d', jacket: '#2a3a5a', hair: '#1a1410' }, { n: 'White bandana', band: '#e8e8f0', jacket: '#5a2a2a', hair: '#141018' }]) },
    muscle: { name: 'Muscle', w: 14, looks: mk([
      { n: 'White tank', tank: '#e8e8f0', hair: '#4a3020' }, { n: 'Black tank', tank: '#26242e', hair: '#2a1a12' },
      { n: 'Red tank', tank: '#a8263a', hair: '#1a1410' }, { n: 'Teal tank', tank: '#19a89a', hair: '#141018' }]) },
    accountant: { name: 'Accountant', w: 14, looks: mk([
      { n: 'Grey vest', shirt: '#f1e8d4', vest: '#6a6a7a', tie: '#19e3d0', hair: '#8a8a8a' }, { n: 'Brown vest', shirt: '#f1e8d4', vest: '#6a4a38', tie: '#ff2d95', hair: '#4a3020' },
      { n: 'Navy vest', shirt: '#dfe8f4', vest: '#26356a', tie: '#ffd24a', hair: '#2a1a12' }, { n: 'Green vest', shirt: '#f1e8d4', vest: '#2f6a50', tie: '#a8263a', hair: '#1a1410' }]) },
  },
};
const ACCS = [['none', 30], ['plaster', 22], ['earring', 24], ['cig', 24]];
const ACC_COL = ['#ffd24a', '#19e3d0', '#ff2d95', '#e8e8f0', '#ff8a3d', '#b08aff', '#ff3b4e'];
const BGS = { crew: ['#0b1a22', '#0c1c26', '#0a1822', '#0b1b1f'], syndicate: ['#1e0b1c', '#210c20', '#1a0a1e', '#1d0b18'] };
const NAMES = {
  crew: ['SHADOW', 'DUKE', 'RICO', 'SLICK', 'VEGAS', 'BLAZE', 'GHOST', 'RAZOR', 'DICE', 'JINX', 'SMOKE', 'VIPER', 'NITRO', 'BANDIT', 'FOXY', 'LUCKY', 'CASH', 'MOJO', 'CLUTCH', 'ROOK', 'HUSTLE', 'BISHOP', 'NOVA', 'DRIFTER', 'SPARKS', 'COBRA', 'TEX', 'JUNO', 'PIXEL', 'ECHO', 'FLINT', 'ZERO'],
  syndicate: ['DON', 'MARCO', 'VINNY', 'CAPO', 'TONY', 'SAL', 'GINO', 'LUCA', 'BIGAL', 'ENZO', 'MOE', 'FRANKIE', 'CARMINE', 'PAULIE', 'DANTE', 'NICO', 'ROCCO', 'BRUNO', 'MAURO', 'SILAS', 'OTTO', 'VITO', 'LEO', 'HANK', 'ARLO', 'IGOR', 'DMITRI', 'KAI', 'SONNY', 'BENNY', 'RAFA', 'CLEO'],
};

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  ROBBER: { team: 'crew', fn: 'HUNTER', blurb: 'Cases the launch block and spots the wallets that rushed in first.' },
  DRIVER: { team: 'crew', fn: 'COURIER', blurb: 'Keeps the getaway log: the coin’s best days on record.' },
  SAFECRACKER: { team: 'crew', fn: 'AUDITOR', blurb: 'Won’t touch a coin until the mint and freeze authority are revoked.' },
  HACKER: { team: 'crew', fn: 'SCOUT', blurb: 'Taps into the chain and counts every wallet holding the coin.' },
  BOSS: { team: 'syndicate', fn: 'ARCHIVIST', blurb: 'Keeps the books on every milestone the coin hits.' },
  LOOKOUT: { team: 'syndicate', fn: 'SENTRY', blurb: 'Never takes his eyes off the dev wallet.' },
  MUSCLE: { team: 'syndicate', fn: 'WARDEN', blurb: 'Works out how hard a big sale would hit the curve.' },
  ACCOUNTANT: { team: 'syndicate', fn: 'ANALYST', blurb: 'Tracks the market cap against the start and the peak.' },
};
const ABILITIES = {
  HACKER: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  BOSS: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  ROBBER: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  DRIVER: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  LOOKOUT: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  ACCOUNTANT: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  SAFECRACKER: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  MUSCLE: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other crook’s ability on the coin at once and reports the headline from each.' },
};
const TEAM_ROLES = { crew: Object.keys(ROLES).filter((k) => ROLES[k].team === 'crew'), syndicate: Object.keys(ROLES).filter((k) => ROLES[k].team === 'syndicate') };

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
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('heist').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  while (list.items.length <= slot) {
    const idx = list.items.length, team = idx % 2 === 0 ? 'crew' : 'syndicate', sp = SPECIES[team], keys = Object.keys(sp);
    let t, key, tries = 0;
    do {
      const k = pickW(keys.map((x) => [x, sp[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * sp[k].looks.length);
      t = { team, species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      key = [k, look, t.acc, t.acc === 'earring' ? t.accColor : 0].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look);
    let nm, nt = 0;
    do { nm = NAMES[team][Math.floor(list.rnd() * NAMES[team].length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = t.species.toUpperCase();
    list.items.push(t);
  }
  return list.items[slot];
}
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species];
  return { name: t.name, role: t.role, team: t.team === 'crew' ? 'CREW' : 'SYNDICATE', blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, accessory: t.acc === 'none' ? null : t.acc };
}

// ---- a small vector painter: smooth shapes, soft shadows and gradients, 4 samples per pixel for clean edges ----
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const hx = (h) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dk = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const lt = (c, k) => mix(c, [255, 255, 255], k);
const hash = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function spline(pts, closed) {
  const out = [], n = pts.length, seg = 6;
  const g = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const inPoly = (pts) => (px, py) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const bbox = (pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const p of pts) { if (p[0] < a) a = p[0]; if (p[1] < b) b = p[1]; if (p[0] > c) c = p[0]; if (p[1] > d) d = p[1]; } return [a, b, c, d]; };

class Canvas {
  constructor(bg, R) { this.R = R || 384; this.K = this.R / N; const b = hx(bg); this.px = new Float32Array(this.R * this.R * 3); for (let i = 0; i < this.R * this.R; i++) { this.px[i * 3] = b[0]; this.px[i * 3 + 1] = b[1]; this.px[i * 3 + 2] = b[2]; } }
  // col is a hex string, an [r,g,b] array, or a function (x, y) returning [r,g,b] or [r,g,b,alpha] (null skips the point)
  paint(bb, test, col, a) {
    const K = this.K, R = this.R, fixed = typeof col === 'string' ? hx(col) : Array.isArray(col) ? col : null, A = a == null ? 1 : a;
    const x0 = Math.max(0, Math.floor(bb[0] * K) - 1), y0 = Math.max(0, Math.floor(bb[1] * K) - 1), x1 = Math.min(R - 1, Math.ceil(bb[2] * K) + 1), y1 = Math.min(R - 1, Math.ceil(bb[3] * K) + 1);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      let cov = 0;
      cov += test((px + 0.25) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.25) / K, (py + 0.75) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.75) / K) ? 1 : 0;
      if (!cov) continue;
      let c = fixed, al = A * cov / 4;
      if (!c) { c = col((px + 0.5) / K, (py + 0.5) / K); if (!c) continue; if (c.length > 3) al *= c[3]; }
      const i = (py * R + px) * 3;
      this.px[i] += (c[0] - this.px[i]) * al; this.px[i + 1] += (c[1] - this.px[i + 1]) * al; this.px[i + 2] += (c[2] - this.px[i + 2]) * al;
    }
  }
  rect(x, y, w, h, col, a) { this.paint([x, y, x + w, y + h], (px, py) => px >= x && px < x + w && py >= y && py < y + h, col, a); }
  ell(cx, cy, rx, ry, col, a) { this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) <= 1, col, a); }
  poly(pts, col, a, smooth) { const p = smooth ? spline(pts, true) : pts; this.paint(bbox(p), inPoly(p), col, a); }
  line(x1, y1, x2, y2, w, col, a) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy, h = w / 2;
    this.paint([Math.min(x1, x2) - h, Math.min(y1, y2) - h, Math.max(x1, x2) + h, Math.max(y1, y2) + h], (px, py) => { let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0; t = clamp(t, 0, 1); const qx = x1 + t * dx - px, qy = y1 + t * dy - py; return qx * qx + qy * qy <= h * h; }, col, a);
  }
  curve(pts, w, col, a) { const p = spline(pts, false); for (let i = 0; i < p.length - 1; i++) this.line(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], w, col, a); }
  // a soft shadow or highlight that fades to nothing at its edge
  soft(cx, cy, rx, ry, col, a) {
    const c = typeof col === 'string' ? hx(col) : col;
    this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) < 1, (x, y) => { const d = Math.sqrt(((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry)); return [c[0], c[1], c[2], Math.pow(Math.max(0, 1 - d), 1.4)]; }, null === a ? 1 : a);
  }
  toRgb(size) {
    const R = this.R, out = Buffer.alloc(size * size * 3), s = R / size;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const fx = Math.min(R - 1.001, (x + 0.5) * s - 0.5), fy = Math.min(R - 1.001, (y + 0.5) * s - 0.5), x0 = Math.max(0, Math.floor(fx)), y0 = Math.max(0, Math.floor(fy)), tx = fx - x0, ty = fy - y0;
      for (let ch = 0; ch < 3; ch++) {
        const a = this.px[(y0 * R + x0) * 3 + ch], b = this.px[(y0 * R + x0 + 1) * 3 + ch], c2 = this.px[((y0 + 1) * R + x0) * 3 + ch], d = this.px[((y0 + 1) * R + x0 + 1) * 3 + ch];
        out[(y * size + x) * 3 + ch] = clamp(Math.round((a * (1 - tx) + b * tx) * (1 - ty) + (c2 * (1 - tx) + d * tx) * ty), 0, 255);
      }
    }
    return out;
  }
}

// ---- a face: neck, ears, head, soft shading, eyes, brows, nose and mouth, lit from the top left ----
const HEAD = spline([[24, 8.2], [30.4, 10], [33.6, 15], [33.9, 21.5], [32, 27.4], [28, 31.4], [24, 32.4], [20, 31.4], [16, 27.4], [14.1, 21.5], [14.4, 15], [17.6, 10]], true);
const EYE_COLS = ['#3f6e9e', '#5a3a22', '#4a7a52', '#6a4a2a'];
function face(c, o) {
  const sk = [hx(SKINS[o.skin][0]), hx(SKINS[o.skin][1])], skc = (x, y) => mix(sk[0], sk[1], Math.pow(clamp(0.45 + (x - 24) * 0.055 + (y - 20) * 0.012, 0, 1), 1.2));
  const neckW = o.wide ? 4.4 : 3.6;
  c.poly([[24 - neckW, 27], [24 + neckW, 27], [24 + neckW + 0.8, 40], [24 - neckW - 0.8, 40]], (x, y) => mix(skc(x, y), dk(sk[1], 0.6), clamp(1 - (y - 28) / 7, 0, 1) * 0.9));
  c.ell(14.2, 21.6, 1.5, 2.7, (x, y) => skc(x, y)); c.ell(33.8, 21.6, 1.5, 2.7, (x, y) => skc(x, y));
  c.ell(14.6, 21.8, 0.7, 1.5, dk(sk[1], 0.8), 0.7); c.ell(33.4, 21.8, 0.7, 1.5, dk(sk[1], 0.8), 0.7);
  c.poly(HEAD, skc);
  c.soft(19, 25.6, 3.4, 2.4, [225, 110, 100], 0.16); c.soft(29, 25.6, 3.4, 2.4, [225, 110, 100], 0.14);
  c.soft(30.5, 28, 5, 4, dk(sk[1], 0.6), 0.22); c.soft(22, 12.5, 6, 2.6, [255, 255, 255], 0.1); c.soft(20.6, 23, 2.6, 1.6, [255, 255, 255], 0.08);
  const ey = 19.4, eyeCol = hx(EYE_COLS[(o.eye || 0) % 4]), look = o.side ? 0.7 : 0;
  if (!o.noEyes) for (const cx of [19.8, 28.2]) {
    c.soft(cx, ey, 3.6, 2.4, dk(sk[1], 0.55), 0.24);
    c.ell(cx, ey, 2.3, 1.1, '#f1ece4'); c.ell(cx + look, ey + 0.05, 1.05, 1.05, eyeCol); c.ell(cx + look, ey + 0.05, 0.5, 0.5, '#0c0a10'); c.ell(cx + look - 0.35, ey - 0.35, 0.28, 0.28, '#ffffff');
    c.soft(cx, ey - 0.6, 2.4, 0.9, [0, 0, 0], 0.18);
    c.curve([[cx - 2.5, ey + 0.15], [cx - 1.2, ey - 0.95], [cx + 1.2, ey - 1.05], [cx + 2.5, ey + 0.1]], 0.38, '#17121a'); c.curve([[cx - 2, ey + 0.8], [cx, ey + 1.2], [cx + 2, ey + 0.8]], 0.16, dk(sk[1], 0.7), 0.5);
    c.curve([[cx - 2.3, ey - 1.7], [cx, ey - 2.2], [cx + 2.3, ey - 1.6]], 0.18, dk(sk[1], 0.7), 0.45);
  }
  if (!o.noBrows) {
    const bc = hx(o.brow || '#3a2a1e'), tl = o.tilt || 0;
    c.poly([[17.1, 17.2 - tl], [19.4, 15.7], [22.4, 16.1 + tl], [22.4, 17 + tl], [19.5, 16.5], [17.2, 18]], bc, 0.92, true);
    c.poly([[30.9, 17.2 - tl], [28.6, 15.7], [25.6, 16.1 + tl], [25.6, 17 + tl], [28.5, 16.5], [30.8, 18]], bc, 0.92, true);
  }
  c.soft(25.7, 22, 0.9, 3, dk(sk[1], 0.55), 0.2); c.soft(24, 24.2, 1.4, 0.8, [255, 255, 255], 0.14); c.soft(24, 25.7, 2.4, 0.9, dk(sk[1], 0.5), 0.22);
  c.ell(22.8, 25.2, 0.55, 0.34, dk(sk[1], 0.45), 0.7); c.ell(25.2, 25.2, 0.55, 0.34, dk(sk[1], 0.45), 0.7);
  const lip = mix(hx('#b2615c'), sk[1], 0.35), fr = o.frown ? 0.5 : -0.1, y0 = 28.4;
  c.poly([[21, y0 + fr], [22.8, y0 - 0.8], [24, y0 - 0.45], [25.2, y0 - 0.8], [27, y0 + fr], [24, y0 + 0.25]], dk(lip, 0.85), 1, true);
  c.poly([[21.2, y0 + fr + 0.1], [24, y0 + 0.3], [26.8, y0 + fr + 0.1], [26, y0 + 1.5], [24, y0 + 1.9], [22, y0 + 1.5]], lip, 1, true);
  c.curve([[21, y0 + fr], [24, y0 + 0.35], [27, y0 + fr]], 0.3, '#3a1a1a'); c.soft(24, 31.3, 3, 0.9, dk(sk[1], 0.55), 0.18);
  if (o.stubble) c.paint([14, 24, 34, 32.5], (x, y) => inPoly(HEAD)(x, y) && y > 24.2 && !(x > 20.5 && x < 27.5 && y > 27.4 && y < 30.6), (x, y) => (hash(Math.floor(x * 16), Math.floor(y * 16)) < 0.5 ? [...hx(o.brow || '#3a2a1e'), 0.34] : null), 1);
}
const SH = spline([[1, 48], [2.4, 41.5], [8, 37], [17, 35], [31, 35], [40, 37], [45.6, 41.5], [47, 48]], true);
function torso(c, cloth, o) {
  o = o || {}; const base = hx(cloth), pts = o.pts || SH;
  c.poly(pts, (x, y) => mix(lt(base, 0.1), dk(base, 0.62), clamp((x - 10) / 34 + (y - 36) / 30, 0, 1)));
  c.soft(24, 37, 7, 3, [0, 0, 0], 0.22); c.soft(8, 44, 4, 6, [0, 0, 0], 0.12); c.soft(40, 44, 4, 6, [0, 0, 0], 0.14);
  for (const f of [[12, 40, 15, 48], [35, 40, 33, 48], [19, 44, 17, 48]]) c.line(f[0], f[1], f[2], f[3], 0.35, [0, 0, 0], 0.16);
}
function hairShape(c, pts, col, o) {
  o = o || {}; const base = hx(col), p = spline(pts, true);
  c.paint(bbox(p), inPoly(p), (x, y) => { const s = Math.sin(x * 9 + y * 2.2) * 0.1 + Math.sin(x * 21 - y) * 0.05 + (hash(Math.floor(x * 12), Math.floor(y * 5)) - 0.5) * 0.1; return mix(base, s > 0 ? [255, 255, 255] : [0, 0, 0], Math.abs(s) * (o.shine || 1)); });
  c.soft(o.sx || 20, o.sy || 10, 4, 1.4, [255, 255, 255], o.glint == null ? 0.18 : o.glint);
}
function fabricEdge(c, pts, w, col, a) { c.curve(pts, w, col, a); }

// ---- the eight crooks, then the Kingpin ----
const DRAW = {
  robber(c, L, o) {
    torso(c, L.shirt); for (let y = 38.5; y < 48; y += 3.6) c.paint([2, y, 46, y + 1.6], (x, yy) => yy > y && yy < y + 1.6 && inPoly(SH)(x, yy), L.stripe, 0.9);
    face(c, Object.assign({}, o, { noBrows: true }));
    const mask = hx(L.mask), knit = (x, y) => mix(mask, hash(Math.floor(x * 5), Math.floor(y * 5)) > 0.5 ? [255, 255, 255] : [0, 0, 0], 0.07 + 0.04 * Math.sin(x * 12));
    const eyeHole = spline([[16, 17], [20, 15.6], [28, 15.6], [32, 17], [31.6, 21.4], [28, 22.2], [20, 22.2], [16.4, 21.4]], true), mouthHole = spline([[20.4, 27], [27.6, 27], [28.4, 29.8], [24, 31.2], [19.6, 29.8]], true);
    const inHead = inPoly(HEAD), ih = inPoly(eyeHole), im = inPoly(mouthHole);
    c.paint([13, 6, 35, 33], (x, y) => (inHead(x, y) || (y > 8 && y < 33 && x > 14 && x < 34 && inPoly(HEAD)(x, y))) && !ih(x, y) && !im(x, y), knit);
    c.poly([[20, 27], [20, 40], [28, 40], [28, 27]], knit, 0.0);
    c.soft(24, 20, 9, 7, [0, 0, 0], 0.0); const sk = SKINS[o.skin]; c.poly(eyeHole, (x, y) => mix(hx(sk[0]), hx(sk[1]), 0.3 + (y - 17) * 0.05)); c.poly(mouthHole, hx(sk[0]));
    const sub = Object.assign({}, o, { noBrows: false }); c.soft(24, 19, 10, 3.4, [0, 0, 0], 0.0);
    for (const cx of [19.8, 28.2]) { c.ell(cx, 19.4, 2.3, 1.1, '#f1ece4'); c.ell(cx, 19.45, 1.05, 1.05, hx(EYE_COLS[(o.eye || 0) % 4])); c.ell(cx, 19.45, 0.5, 0.5, '#0c0a10'); c.ell(cx - 0.35, 19.05, 0.28, 0.28, '#fff'); c.curve([[cx - 2.5, 19.5], [cx - 1.2, 18.4], [cx + 1.2, 18.3], [cx + 2.5, 19.4]], 0.4, '#17121a'); }
    c.soft(24, 29.2, 3, 1.6, [0, 0, 0], 0.0); c.curve([[21.4, 28.6], [24, 29.1], [26.6, 28.6]], 0.35, '#7a3a3a');
    c.soft(24, 16.2, 9, 1.4, [0, 0, 0], 0.2);
  },
  driver(c, L, o) {
    torso(c, L.jacket); const jc = hx(L.jacket);
    c.poly([[17, 35], [24, 44], [31, 35], [28, 34.6], [24, 38], [20, 34.6]], '#ecebf2'); c.poly([[14, 35.5], [20, 34.6], [23, 44], [21, 48], [14, 48]], dk(jc, 0.78)); c.poly([[34, 35.5], [28, 34.6], [25, 44], [27, 48], [34, 48]], dk(jc, 0.7));
    c.line(24, 44, 24, 48, 0.4, [20, 20, 20], 0.5);
    face(c, Object.assign({}, o, { noEyes: true }));
    const cap = hx(L.cap);
    c.poly([[13.6, 15.6], [14.8, 9.2], [19, 5.6], [29, 5.6], [33.2, 9.2], [34.4, 15.6]], (x, y) => mix(lt(cap, 0.15), dk(cap, 0.7), clamp((x - 14) / 22 + (y - 6) / 14, 0, 1)), 1, true);
    c.line(24, 5.8, 24, 14.5, 0.25, [0, 0, 0], 0.2); c.ell(24, 5.8, 0.9, 0.5, dk(cap, 0.6));
    c.poly([[12.4, 15.2], [35.6, 15.2], [37, 17.4], [24, 19.4], [11, 17.4]], hx(L.brim), 1, true); c.soft(24, 19.4, 10, 1.8, [0, 0, 0], 0.3);
    for (const cx of [19.6, 28.4]) { c.poly([[cx - 3.2, 18], [cx + 3.2, 18], [cx + 2.8, 21.4], [cx, 22.4], [cx - 2.8, 21.4]], (x, y) => mix([22, 20, 30], [58, 56, 74], clamp((y - 18) / 4.4 + (cx - x) * 0.02, 0, 1)), 1, true); c.line(cx - 2.4, 18.8, cx - 0.6, 18.8, 0.35, [255, 255, 255], 0.5); }
    c.line(22.8, 18.6, 25.2, 18.6, 0.4, '#c9a02a'); c.curve([[16.4, 18.4], [14, 18.8], [13.8, 19.6]], 0.3, '#c9a02a');
  },
  safecracker(c, L, o) {
    torso(c, L.shirt); const sc = hx(L.shirt);
    c.poly([[16, 35], [22, 34.8], [24, 42], [19, 41]], dk(sc, 0.75), 1, false); c.poly([[32, 35], [26, 34.8], [24, 42], [29, 41]], dk(sc, 0.65), 1, false); c.line(24, 40, 24, 48, 0.3, [0, 0, 0], 0.3);
    c.rect(9, 41, 6, 5, dk(sc, 0.8), 0.9); c.line(9, 42, 15, 42, 0.3, [0, 0, 0], 0.25);
    face(c, Object.assign({}, o, { stubble: true, brow: L.hair }));
    const bn = hx(L.beanie);
    c.poly([[13.2, 14], [13.8, 9], [17.5, 5], [24, 3.8], [30.5, 5], [34.2, 9], [34.8, 14]], (x, y) => { const rib = Math.sin(x * 7) * 0.07; return mix(mix(lt(bn, 0.12), dk(bn, 0.7), clamp((x - 14) / 22, 0, 1)), rib > 0 ? [255, 255, 255] : [0, 0, 0], Math.abs(rib)); }, 1, true);
    c.ell(24, 3.4, 1.8, 1.3, lt(bn, 0.2));
    c.poly([[12.8, 14.6], [35.2, 14.6], [35, 11.4], [13, 11.4]], (x, y) => mix(dk(bn, 0.85), dk(bn, 0.65), clamp((x - 13) / 22, 0, 1)), 1, false); c.soft(24, 14.8, 10, 1.4, [0, 0, 0], 0.3);
    c.poly([[13.8, 12.2], [34.2, 12.2], [34.4, 8.2], [13.6, 8.2]], '#3a3a44', 0.0);
    c.curve([[13.4, 10.2], [24, 8.8], [34.6, 10.2]], 0.7, '#4a4a56'); for (const cx of [19.2, 28.8]) { c.ell(cx, 10, 3.1, 2.3, '#2a2a34'); c.ell(cx, 10, 2.5, 1.7, mix(hx('#9fd8e6'), [255, 255, 255], 0.2), 0.85); c.line(cx - 1.6, 9.2, cx - 0.2, 8.8, 0.35, [255, 255, 255], 0.7); }
  },
  hacker(c, L, o) {
    torso(c, L.hood); const hd = hx(L.hood);
    c.line(19, 38, 18, 46, 0.5, '#e8e8f0', 0.9); c.line(29, 38, 30, 46, 0.5, '#e8e8f0', 0.9); c.ell(18, 46.4, 0.55, 0.55, '#e8e8f0'); c.ell(30, 46.4, 0.55, 0.55, '#e8e8f0');
    c.poly([[8, 38], [9, 20], [12, 9], [19, 3.6], [29, 3.6], [36, 9], [39, 20], [40, 38], [31, 40], [17, 40]], (x, y) => mix(lt(hd, 0.1), dk(hd, 0.6), clamp((x - 9) / 30 + (y - 4) / 40, 0, 1)), 1, true);
    c.poly([[14.4, 12], [19, 8.4], [29, 8.4], [33.6, 12], [34.4, 24], [30, 31.8], [24, 33], [18, 31.8], [13.6, 24]], dk(hd, 0.34), 1, true);
    face(c, Object.assign({}, o, { noEyes: true }));
    c.soft(24, 10.5, 12, 3, [0, 0, 0], 0.32); c.soft(14, 22, 2.4, 9, [0, 0, 0], 0.3); c.soft(34, 22, 2.4, 9, [0, 0, 0], 0.3);
    const lens = hx(L.lens);
    for (const cx of [19.6, 28.4]) { c.poly([[cx - 3.1, 17.6], [cx + 3.1, 17.6], [cx + 2.6, 21.2], [cx - 2.6, 21.2]], lens, 0.22, true); c.curve([[cx - 3.2, 17.8], [cx, 17.4], [cx + 3.2, 17.8], [cx + 2.7, 21.3], [cx - 2.7, 21.3], [cx - 3.2, 17.8]], 0.4, '#17121a'); c.line(cx - 2.2, 18.5, cx - 0.4, 18.5, 0.4, lens, 0.9); c.ell(cx + 0.2, 19.6, 1, 1, lens, 0.9); }
    c.line(22.6, 18, 25.4, 18, 0.4, '#17121a'); c.soft(24, 20, 10, 3, lens, 0.12);
  },
  boss(c, L, o) {
    torso(c, L.suit); const su = hx(L.suit);
    c.poly([[17, 35], [24, 48], [31, 35], [28, 34.6], [24, 38], [20, 34.6]], '#f3eee4', 1); c.poly([[22.4, 37], [25.6, 37], [26.4, 40], [24, 48], [21.6, 40]], hx(L.tie), 1, true); c.poly([[22.2, 36.4], [25.8, 36.4], [25.2, 38.4], [22.8, 38.4]], dk(hx(L.tie), 0.7));
    c.poly([[13, 36.5], [20, 34.6], [23.4, 46], [18.6, 48], [12, 48]], dk(su, 0.72), 1, false); c.poly([[35, 36.5], [28, 34.6], [24.6, 46], [29.4, 48], [36, 48]], dk(su, 0.62), 1, false);
    c.rect(33, 41, 4, 1.4, '#f3eee4', 0.9);
    face(c, Object.assign({}, o, { brow: L.hair }));
    const hr = L.hair;
    hairShape(c, [[14, 17], [14.6, 11], [18, 7.2], [24, 6], [30, 7.2], [33.4, 11], [34, 17], [32, 13.6], [27, 11.6], [19, 11.4], [16, 13.6]], hr, { sx: 20, sy: 8.4, glint: 0.28 });
    c.poly([[20.6, 27.2], [22.8, 26.4], [24, 26.8], [25.2, 26.4], [27.4, 27.2], [26, 28.2], [24, 27.8], [22, 28.2]], hx(hr), 1, true);
  },
  lookout(c, L, o) {
    torso(c, L.jacket); const jc = hx(L.jacket);
    c.poly([[13, 36], [18, 34.8], [20, 42], [15, 48], [11, 48]], dk(jc, 0.72)); c.poly([[35, 36], [30, 34.8], [28, 42], [33, 48], [37, 48]], dk(jc, 0.62)); c.rect(23.4, 38, 1.2, 10, [20, 20, 20], 0.45);
    face(c, Object.assign({}, o, { side: true, brow: L.hair }));
    const bd = hx(L.band);
    c.poly([[13.4, 15.2], [14, 9.4], [18, 5.8], [24, 5], [30, 5.8], [34, 9.4], [34.6, 15.2], [24, 12.4]], (x, y) => mix(lt(bd, 0.12), dk(bd, 0.72), clamp((x - 14) / 22, 0, 1)), 1, true);
    c.curve([[13.6, 14.6], [24, 12], [34.4, 14.6]], 0.6, dk(bd, 0.6), 0.5);
    for (let i = 0; i < 14; i++) c.ell(15 + (i % 7) * 3, 8.6 + Math.floor(i / 7) * 2.6 + (i % 2) * 0.6, 0.35, 0.35, '#ffffff', 0.55);
    c.poly([[33.6, 10.6], [41.4, 8], [42.4, 11.2], [38.4, 12.4], [43, 15.6], [39, 17], [35.2, 14.4]], bd, 1, true); c.line(34.4, 12.4, 41, 10.6, 0.3, [0, 0, 0], 0.2);
    c.soft(24, 15.4, 10, 1.2, [0, 0, 0], 0.22);
  },
  muscle(c, L, o) {
    const MS = spline([[0, 48], [0.6, 41.5], [6, 37], [15, 35], [33, 35], [42, 37], [47.4, 41.5], [48, 48]], true), sk = SKINS[o.skin], sc = (x, y) => mix(hx(sk[0]), hx(sk[1]), clamp(0.4 + (x - 24) * 0.04, 0, 1));
    c.poly(MS, sc); c.soft(8, 41, 5, 5, [255, 255, 255], 0.1); c.soft(40, 42, 5, 6, [0, 0, 0], 0.2);
    c.poly([[8, 48], [9.6, 38.6], [15.4, 35.6], [19, 36.4], [21, 42], [18, 48]], hx(L.tank), 1, true); c.poly([[40, 48], [38.4, 38.6], [32.6, 35.6], [29, 36.4], [27, 42], [30, 48]], dk(hx(L.tank), 0.75), 1, true);
    c.poly([[19, 36.4], [24, 40.6], [29, 36.4], [30, 48], [18, 48]], dk(hx(L.tank), 0.88), 1, false);
    c.soft(24, 38, 8, 3, [0, 0, 0], 0.2);
    face(c, Object.assign({}, o, { wide: true, frown: true, tilt: 0.55, stubble: true, brow: L.hair }));
    c.soft(20, 10.4, 5.6, 2.8, [255, 255, 255], 0.2); c.soft(18, 14, 3, 2, [255, 255, 255], 0.08);
    c.curve([[30.2, 14.6], [31, 17.6], [30.4, 21]], 0.36, '#8a4a4a', 0.9); c.line(29.2, 17, 32.2, 18.2, 0.2, '#d8b8b0', 0.8);
  },
  accountant(c, L, o) {
    torso(c, L.shirt); const vs = hx(L.vest);
    c.poly([[10, 48], [11.4, 40], [18, 36], [20, 48]], vs, 1, true); c.poly([[38, 48], [36.6, 40], [30, 36], [28, 48]], dk(vs, 0.85), 1, true);
    c.poly([[22.4, 36.8], [25.6, 36.8], [26.2, 40], [24, 48], [21.8, 40]], hx(L.tie), 1, true); c.poly([[22.2, 36.2], [25.8, 36.2], [25.2, 38.2], [22.8, 38.2]], dk(hx(L.tie), 0.7));
    c.line(14.4, 42, 14.4, 44.6, 0.7, '#d8d8e0'); c.line(14.4, 41.4, 14.4, 42, 0.5, '#ff2d95');
    face(c, Object.assign({}, o, { noBrows: false, brow: L.hair }));
    hairShape(c, [[14.2, 15], [14.8, 10.6], [18.6, 7.4], [24, 6.8], [30, 8], [33.4, 11], [33.8, 14.6], [31, 11.8], [25, 10.4], [18.8, 11.4], [16, 13.6]], L.hair, { sx: 22, sy: 8.4, glint: 0.2 });
    for (const cx of [19.8, 28.2]) { c.ell(cx, 19.4, 3.1, 2.7, [255, 255, 255], 0.1); c.curve([[cx - 3.1, 19.4], [cx - 2, 16.9], [cx + 2, 16.9], [cx + 3.1, 19.4], [cx + 2, 22], [cx - 2, 22], [cx - 3.1, 19.4]], 0.38, '#1a1620'); c.line(cx - 1.8, 17.6, cx - 0.4, 17.4, 0.3, [255, 255, 255], 0.6); }
    c.line(22.9, 19, 25.1, 19, 0.35, '#1a1620'); c.line(16.7, 19.2, 14, 18.6, 0.3, '#1a1620'); c.line(31.3, 19.2, 34, 18.6, 0.3, '#1a1620');
  },
};
function kingpin(c) {
  const o = { skin: 2, eye: 1, brow: '#141018' };
  torso(c, '#101018'); const su = [16, 16, 24];
  c.poly([[17, 35], [24, 48], [31, 35], [28, 34.6], [24, 38], [20, 34.6]], '#f3eee4', 1); c.poly([[13, 36.5], [20, 34.6], [23.4, 46], [18.6, 48], [12, 48]], dk(su, 1.4), 1, false); c.poly([[35, 36.5], [28, 34.6], [24.6, 46], [29.4, 48], [36, 48]], dk(su, 1.1), 1, false);
  c.curve([[17.5, 35.6], [18.5, 41], [24, 44.4], [29.5, 41], [30.5, 35.6]], 0.9, '#e8b82e'); c.curve([[17.5, 35.6], [18.5, 41], [24, 44.4], [29.5, 41], [30.5, 35.6]], 0.3, '#fff2a8', 0.7);
  c.ell(24, 45.6, 1.7, 1.9, '#e8b82e'); c.ell(23.5, 45, 0.5, 0.6, '#fff2a8', 0.8);
  face(c, Object.assign({}, o, { noEyes: true, noBrows: true, stubble: true }));
  c.poly([[20, 26.6], [22.8, 25.8], [24, 26.4], [25.2, 25.8], [28, 26.6], [26.2, 28], [24, 27.4], [21.8, 28]], '#141018', 1, true); c.poly([[22.5, 31.2], [25.5, 31.2], [24.6, 33.4], [23.4, 33.4]], '#141018');
  for (const cx of [19.8, 28.2]) { c.poly([[cx - 3.4, 17.4], [cx + 3.4, 17.4], [cx + 3, 21.4], [cx, 22.2], [cx - 3, 21.4]], (x, y) => mix([255, 214, 90], [190, 130, 20], clamp((y - 17.4) / 4.6 + (x - cx) * 0.03, 0, 1)), 1, true); c.line(cx - 2.6, 18.4, cx - 0.4, 18.4, 0.4, [255, 255, 255], 0.75); c.curve([[cx - 3.4, 17.6], [cx, 17.2], [cx + 3.4, 17.6]], 0.3, '#8a5a10'); }
  c.line(23.2, 18.2, 24.8, 18.2, 0.4, '#8a5a10'); c.soft(24, 20.6, 10, 2.6, [0, 0, 0], 0.18);
  c.poly([[5, 14.6], [14, 13.2], [34, 13.2], [43, 14.6], [40, 16.8], [24, 17.8], [8, 16.8]], '#17131f', 1, true); c.soft(24, 18, 12, 2.2, [0, 0, 0], 0.4);
  c.poly([[13.6, 14], [14.6, 6.4], [19, 3.6], [29, 3.6], [33.4, 6.4], [34.4, 14]], (x, y) => mix([40, 34, 52], [14, 12, 20], clamp((x - 14) / 20 + (y - 4) / 12, 0, 1)), 1, true); c.curve([[22, 4], [24, 6.4], [26, 4]], 0.5, '#0c0a10', 0.7);
  c.poly([[13.8, 11], [34.2, 11], [34.4, 13.2], [13.6, 13.2]], '#ff2d95', 1, false); c.line(14, 11.4, 34, 11.4, 0.3, '#ff8ac0', 0.6);
}

// small extras on a face, so two of the same crook still look different
function accessory(c, acc, col) {
  if (acc === 'plaster') { c.poly([[26.6, 22.6], [32, 20.6], [33.2, 23], [27.8, 25.2]], '#ecc89c', 1, true); c.soft(30, 23, 3, 1.4, [0, 0, 0], 0.14); c.poly([[29, 21.4], [30.6, 21], [31.2, 24], [29.6, 24.4]], '#f6dcb8', 0.9); c.ell(29.8, 22.7, 0.25, 0.25, '#c89a68'); c.ell(30.4, 23.1, 0.25, 0.25, '#c89a68'); }
  else if (acc === 'earring') { const cc = typeof col === 'string' ? col : '#ffd24a'; c.curve([[13.8, 24.2], [12.2, 25.4], [12.6, 27.4], [14, 27.8], [14.8, 26.6]], 0.5, cc); c.soft(13.6, 25.6, 1.6, 1.4, [255, 255, 255], 0.0); c.line(12.6, 25.4, 12.8, 26.6, 0.2, [255, 255, 255], 0.6); }
  else if (acc === 'cig') { c.poly([[24.6, 28.3], [35, 27.6], [35.2, 28.8], [24.8, 29.5]], '#f4f1ea'); c.poly([[34.4, 27.6], [36, 27.5], [36.2, 28.7], [34.6, 28.8]], '#ff6a2a'); c.ell(36.2, 28.1, 0.6, 0.7, '#ffd24a', 0.9); c.soft(38.6, 24, 1.4, 3.6, [220, 224, 235], 0.32); c.soft(40.2, 18.6, 1.8, 3.6, [220, 224, 235], 0.22); }
}

function bgFor(c, team, bgIdx) {
  const b = hx(BGS[team][bgIdx]);
  c.rect(0, 0, N, N, (x, y) => mix(lt(b, 0.06), dk(b, 0.7), clamp(y / 48 * 0.7 + (x - 24) * 0.01, 0, 1)));
  for (let y = 5; y < N; y += 8) c.rect(0, y, N, 0.18, [255, 255, 255], 0.08);
  c.soft(24, 20, 24, 24, [255, 255, 255], 0.05);
}
function paint(slot, secret) {
  const t = traitsFor(slot, secret), L = SPECIES[t.team][t.species].looks[t.look];
  const c = new Canvas(BGS[t.team][t.bg]); bgFor(c, t.team, t.bg);
  DRAW[t.species](c, L, { skin: L.skin, eye: (t.look + t.species.length) % 4, brow: L.hair });
  accessory(c, t.acc, ACC_COL[t.accColor]);
  return c;
}
function paintFlagship() { const c = new Canvas('#14091f'); c.rect(0, 0, N, N, (x, y) => mix([40, 20, 60], [12, 6, 20], clamp(y / 48 + (x - 24) * 0.01, 0, 1))); for (let y = 5; y < N; y += 8) c.rect(0, y, N, 0.18, '#ffd24a', 0.16); c.soft(24, 20, 24, 24, [255, 214, 90], 0.1); kingpin(c); return c; }

// ---- flat pictures for logos and tiles, cached because drawing one takes a moment ----
const picCache = new Map();
function cached(key, size, make) {
  size = Math.max(32, Math.min(2048, Math.round(size) || 512));
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = encodePng(make().toRgb(size), size, size); picCache.set(k, b); if (picCache.size > 160) picCache.delete(picCache.keys().next().value); }
  return b;
}

const png = (slot, secret, size) => cached('a' + secret + ':' + slot, size || 512, () => paint(slot, secret));
const founderPng = (size) => cached('prime', size || 512, paintFlagship);

// a five-point star, as runs of squares on a 64 x 64 grid, for the locked tiles and the logo
const STAR = (() => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 28, a = -Math.PI / 2 + i * Math.PI / 5; p.push([32 + r * Math.cos(a), 34 + r * Math.sin(a)]); } return p; })();
const SHAPE_ON = (x, y) => {
  const px = x + 0.5, py = y + 0.5; let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i], [xj, yj] = STAR[j];
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
