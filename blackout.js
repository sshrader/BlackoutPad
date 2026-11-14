'use strict';
// Bunker survivors for BlackoutPad, built from cubes in a 32 x 48 x 32 grid from a server secret.
// Eight original characters in two teams. Preppers have stocked up (gas mask, hazmat suit, canned beans, generator).
// Doomers are running out of power (flashlight, candle, radio, battery). Even slots are preppers and odd slots are doomers,
// so the teams stay level. The same model drives the 3D views and the flat logos.
const crypto = require('crypto');

const W = 32, H = 48, D = 32, CX = 15.5, CZ = 16;
const TEAR = '#bfe3ff', INK = '#1d1d2e', METAL = '#b9c0cc', METALD = '#98a1b0';

// ---- looks: each species has a few colour sets ----
const SPECIES = {
  prepper: {
    gasmask: { name: 'Gas mask', w: 14, looks: [
      { n: 'Olive', a: '#6b7a4a', b: '#4f5a38', c: '#3a3f35', d: '#8d9b6b', skin: '#e8c4a0' }, { n: 'Charcoal', a: '#4b505c', b: '#353944', c: '#272a33', d: '#7b8396', skin: '#d9a98a' },
      { n: 'Desert', a: '#b79a63', b: '#8f7747', c: '#5b4a2c', d: '#d3bb86', skin: '#f0cfae' }, { n: 'Navy', a: '#3d5a86', b: '#2b4266', c: '#1e2d47', d: '#6f8fc0', skin: '#c99774' }] },
    hazmat: { name: 'Hazmat suit', w: 14, looks: [
      { n: 'Yellow', a: '#f2c230', b: '#d6a31c', c: '#5b5f66', d: '#8a8e96' }, { n: 'Orange', a: '#f2812e', b: '#d1651a', c: '#4e4f57', d: '#8a8e96' },
      { n: 'White', a: '#eef0f4', b: '#cfd3dc', c: '#5b5f66', d: '#a9afbb' }, { n: 'Green', a: '#74c26a', b: '#58a24f', c: '#444b52', d: '#8a8e96' }] },
    beans: { name: 'Canned beans', w: 14, looks: [
      { n: 'Red label', a: '#c23b3b', b: '#f2cf4a' }, { n: 'Green label', a: '#3f9a58', b: '#f2e27a' },
      { n: 'Blue label', a: '#3b6fd6', b: '#f0f0f0' }, { n: 'Orange label', a: '#e8832e', b: '#fff0c2' }] },
    generator: { name: 'Generator', w: 14, looks: [
      { n: 'Red', a: '#d84a3a', b: '#b8392c', c: '#33363d' }, { n: 'Yellow', a: '#e6b52e', b: '#c4961f', c: '#33363d' },
      { n: 'Blue', a: '#3d77c9', b: '#2d5ea3', c: '#33363d' }, { n: 'Orange', a: '#e8742c', b: '#c45d1c', c: '#33363d' }] },
  },
  doomer: {
    flashlight: { name: 'Flashlight', w: 14, looks: [
      { n: 'Yellow', a: '#e8c13a', b: '#c9a02a', c: '#4a4f5c' }, { n: 'Red', a: '#d9534f', b: '#b3403c', c: '#3b3f4a' },
      { n: 'Black', a: '#3b4252', b: '#2a303d', c: '#9aa3b5' }, { n: 'Blue', a: '#4f86d9', b: '#3b6bb8', c: '#3b3f4a' }] },
    candle: { name: 'Candle', w: 14, looks: [
      { n: 'Cream', a: '#f3e9d2', b: '#e1d2b0', c: '#c6a24a' }, { n: 'Red', a: '#d6584f', b: '#b8433b', c: '#c6a24a' },
      { n: 'Teal', a: '#6cc3b8', b: '#4fa398', c: '#9aa0a8' }, { n: 'Lavender', a: '#b9a6e6', b: '#9d89cc', c: '#9aa0a8' }] },
    radio: { name: 'Radio', w: 14, looks: [
      { n: 'Army green', a: '#6f7d4f', b: '#8d9b6b', c: '#3e4630' }, { n: 'Orange', a: '#e8742c', b: '#f59a56', c: '#6b3a1a' },
      { n: 'Cream', a: '#e9dfc7', b: '#f7f0de', c: '#8a7d5a' }, { n: 'Red', a: '#cf4a4a', b: '#e87474', c: '#5e2424' }] },
    battery: { name: 'Battery', w: 14, looks: [
      { n: 'Green', a: '#4fae5a', b: '#3d8a48', c: '#2f3a33' }, { n: 'Orange', a: '#f08a30', b: '#cc6e1e', c: '#3a2d22' },
      { n: 'Yellow', a: '#e6c93a', b: '#c4a826', c: '#38342a' }, { n: 'Blue', a: '#4f86d9', b: '#3b6bb8', c: '#2a3447' }] },
  },
};
const ACCS = [['none', 30], ['helmet', 26], ['plaster', 24], ['glowstick', 20]];
const ACC_COL = ['#f2c230', '#ff8a3a', '#e6544f', '#ffffff', '#3a7ae6', '#3ae68a', '#b03ae6'];
const BGS = { prepper: ['#1f2a22', '#222f2a', '#26302a', '#1f2e33'], doomer: ['#33261a', '#2e2a1c', '#3a2c1c', '#2b261f'] };
const NAMES = {
  prepper: ['STOCKPILE', 'BUNKER', 'RATIONS', 'HOARD', 'CANNED', 'PANTRY', 'FALLOUT', 'SHELTER', 'STASH', 'DEHYDRATED', 'MRE', 'VAULT', 'CELLAR', 'BOLTHOLE', 'LOCKDOWN', 'SURVIVOR', 'FORAGE', 'TARP', 'TINNED', 'BASEMENT', 'ARK', 'SILO', 'BERM', 'LARDER', 'JERRYCAN', 'PADLOCK', 'SANDBAG', 'WATERTANK'],
  doomer: ['BLACKOUT', 'FLICKER', 'DIM', 'DUSK', 'OUTAGE', 'BROWNOUT', 'SPARK', 'FUSE', 'VOLT', 'AMP', 'DEADBAT', 'LUMEN', 'WICK', 'EMBER', 'GLOW', 'FADE', 'DARK', 'SURGE', 'GRID', 'WATT', 'TRIPPED', 'CIRCUIT', 'LOWBAT', 'STATIC', 'HUSH', 'SIREN', 'ALERT', 'LASTBAR'],
};

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  SCAVENGER: { team: 'prepper', fn: 'HUNTER', blurb: 'Scavenges for the wallets that grabbed supplies in the launch block.' },
  QUARTERMASTER: { team: 'prepper', fn: 'ARCHIVIST', blurb: 'Keeps the supply log and notes each milestone the coin hits.' },
  LOOKOUT: { team: 'prepper', fn: 'SCOUT', blurb: 'Counts the holders who made it into the shelter.' },
  STOCKTAKER: { team: 'prepper', fn: 'COURIER', blurb: 'Writes down the coin’s best days, in case the lights stay off.' },
  WATCHMAN: { team: 'doomer', fn: 'SENTRY', blurb: 'Keeps watch on the dev wallet around the clock.' },
  PROPHET: { team: 'doomer', fn: 'ANALYST', blurb: 'Tracks the market cap and is sure the end is near.' },
  SIREN: { team: 'doomer', fn: 'WARDEN', blurb: 'Works out exactly how loud the alarm should be if someone dumps.' },
  INSPECTOR: { team: 'doomer', fn: 'AUDITOR', blurb: 'Trusts nothing until the mint and freeze authority are revoked.' },
};
const ABILITIES = {
  SCAVENGER: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  QUARTERMASTER: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  LOOKOUT: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  STOCKTAKER: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  WATCHMAN: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  PROPHET: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  SIREN: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  INSPECTOR: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other character’s ability on the coin at once and reports the headline from each.' },
};
const TEAM_ROLES = { prepper: Object.keys(ROLES).filter((k) => ROLES[k].team === 'prepper'), doomer: Object.keys(ROLES).filter((k) => ROLES[k].team === 'doomer') };

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
const hash3 = (x, y, z) => (Math.imul(x * 73856093 ^ y * 19349663 ^ z * 83492791, 2654435761) >>> 0) % 1000;

// ---- traits: the same look is never handed out twice in one set ----
const traitCache = new Map();
function traitsFor(slot, secret) {
  const ck = String(secret);
  let list = traitCache.get(ck);
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('blackout').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  while (list.items.length <= slot) {
    const idx = list.items.length, team = idx % 2 === 0 ? 'prepper' : 'doomer', sp = SPECIES[team], keys = Object.keys(sp);
    let t, key, tries = 0;
    do {
      const k = pickW(keys.map((x) => [x, sp[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * sp[k].looks.length);
      t = { team, species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      key = [k, look, t.acc, t.acc === 'helmet' ? t.accColor : 0].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look);
    let nm, nt = 0;
    do { nm = NAMES[team][Math.floor(list.rnd() * NAMES[team].length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = TEAM_ROLES[team][Math.floor(list.rnd() * TEAM_ROLES[team].length)];
    list.items.push(t);
  }
  return list.items[slot];
}
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species];
  return { name: t.name, role: t.role, team: t.team === 'prepper' ? 'PREPPER' : 'DOOMER', blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, accessory: t.acc === 'none' ? null : t.acc };
}

// ---- the voxel grid ----
// ---- the voxel grid ----
class Vox {
  constructor() { this.m = new Map(); this.g = 0; this.pv = { leg: 10, arm: 20 }; }
  set(x, y, z, c, e) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    if (x < 0 || x >= W || y < 0 || y >= H || z < 0 || z >= D) return;
    this.m.set((y * D + z) * W + x, { x, y, z, c, e: e ? 1 : 0, g: this.g });
  }
  box(x0, y0, z0, x1, y1, z1, c, e) { for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, typeof c === 'function' ? c(x, y, z) : c, e); }
  // a box and its mirror image across the middle; gR and gL are the swing groups of the two sides
  mb(x0, y0, z0, x1, y1, z1, c, e, gR, gL) {
    const g = this.g;
    if (gR != null) this.g = gR; this.box(x0, y0, z0, x1, y1, z1, c, e);
    if (gL != null) this.g = gL; this.box(W - 1 - x1, y0, z0, W - 1 - x0, y1, z1, typeof c === 'function' ? (x, y, z) => c(W - 1 - x, y, z) : c, e);
    this.g = g;
  }
}

// the worried face, drawn on the front plane z = zf: eyes looking down, brows tilted up in the middle, a frown and sweat drops
function face(v, o) {
  const { zf, ex, ey, my } = o, X = 16 + ex;
  v.face = { y: ey, z: zf, x: X + 1 - CX };
  v.mb(X, ey, zf, X + 1, ey + 1, zf, o.eye || '#ffffff', o.eyeE);
  if (o.pupil !== null) v.mb(X, ey, zf, X, ey, zf, o.pupil || INK, 0);
  v.mb(X, ey + 3, zf, X, ey + 3, zf, o.brow || INK, o.eyeE); v.mb(X + 1, ey + 2, zf, X + 1, ey + 2, zf, o.brow || INK, o.eyeE);
  const mc = o.mouth || INK;
  v.mb(16, my + 1, zf, 16, my + 1, zf, mc, o.eyeE); v.mb(17, my, zf, 17 + (o.mw || 1), my, zf, mc, o.eyeE);
  for (let k = 0; k < (o.tl || 0); k++) v.mb(X + 1, ey - 1 - k, zf, X + 1, ey - 1 - k, zf, TEAR, 1);
}

// ---- the eight characters. Each returns where its head top and face are, for the accessories ----
function buildGasmask(v, P, big) {
  v.pv.leg = 10; v.pv.arm = 21;
  v.mb(17, 3, 14, 19, 9, 17, P.b, 0, 1, 2); v.mb(16, 0, 12, 20, 2, 21, '#2b2b2b', 0, 1, 2);
  v.mb(16, 10, 12, 21, 22, 19, P.a);
  v.mb(16, 17, 20, 21, 18, 20, P.c); v.mb(17, 12, 20, 19, 15, 20, P.d);
  v.mb(22, 11, 14, 24, 21, 17, P.a, 0, 3, 4); v.mb(22, 9, 14, 24, 10, 17, '#2b2b2b', 0, 3, 4);
  v.mb(16, 22, 13, 19, 23, 18, P.skin);
  v.mb(16, 24, 11, 22, 36, 21, P.skin);
  v.mb(16, 34, 11, 22, 38, 21, P.c);
  v.mb(23, 27, 14, 23, 33, 18, P.c);
  v.mb(17, 24, 22, 21, 29, 23, P.d); v.mb(22, 25, 12, 22, 28, 21, '#222222');
  v.box(14, 23, 24, 17, 27, 26, P.c); for (let y = 23; y <= 27; y += 2) v.box(14, y, 27, 17, y, 27, METALD);
  face(v, { zf: 21, ex: 2, ey: 30, my: 26, tl: 1, mouth: INK, mw: 1, pupil: INK });
  return { top: 38, hw: 5, z0: 12, z1: 21, zf: 21, cheek: [6, 31] };
}
function buildHazmat(v, P) {
  v.pv.leg = 10; v.pv.arm = 21;
  v.mb(17, 2, 14, 19, 9, 17, P.b, 0, 1, 2); v.mb(16, 0, 12, 20, 1, 19, P.c, 0, 1, 2);
  v.mb(16, 10, 12, 22, 22, 19, P.a); v.mb(16, 13, 20, 19, 18, 20, P.c); v.mb(16, 15, 20, 16, 16, 20, '#ffd23f', 1);
  v.mb(18, 14, 9, 21, 24, 11, P.d);
  v.mb(16, 23, 14, 18, 24, 17, P.c); v.mb(16, 25, 11, 22, 35, 20, P.a); v.mb(16, 36, 12, 20, 36, 19, P.a);
  v.mb(16, 27, 21, 21, 34, 21, '#10141c');
  v.mb(23, 27, 14, 24, 30, 17, P.c);
  v.mb(23, 12, 14, 25, 21, 17, P.a, 0, 3, 4); v.mb(23, 10, 14, 25, 11, 17, P.c, 0, 3, 4);
  face(v, { zf: 21, ex: 2, ey: 30, my: 27, tl: 2, eye: '#a8f0ff', eyeE: 1, pupil: null, brow: '#a8f0ff', mouth: '#a8f0ff', mw: 1 });
  return { top: 36, hw: 5, z0: 11, z1: 20, zf: 21, cheek: [6, 29] };
}
function buildBeans(v, P) {
  v.pv.leg = 2; v.pv.arm = 19;
  v.mb(17, 0, 13, 19, 1, 18, METALD, 0, 1, 2);
  v.mb(16, 2, 9, 23, 3, 22, METALD); v.mb(16, 25, 9, 23, 26, 22, METALD);
  v.mb(16, 4, 10, 22, 24, 21, (x, y) => (y >= 6 && y <= 22 ? ((y === 6 || y === 22) ? P.b : P.a) : METAL));
  v.box(14, 27, 14, 17, 27, 17, '#cfd6e3'); v.box(14, 28, 17, 17, 28, 17, '#cfd6e3');
  v.mb(23, 10, 13, 25, 17, 17, METAL, 0, 3, 4);
  face(v, { zf: 21, ex: 3, ey: 14, my: 9, tl: 2, mw: 1 });
  return { top: 27, hw: 7, z0: 9, z1: 22, zf: 21, cheek: [7, 13] };
}
function buildGenerator(v, P) {
  v.pv.leg = 3; v.pv.arm = 17;
  v.mb(17, 0, 10, 20, 2, 21, '#2b2b2b', 0, 1, 2);
  v.mb(16, 3, 8, 26, 4, 23, P.c);
  v.mb(16, 5, 9, 25, 22, 22, P.a); v.mb(16, 5, 9, 25, 6, 22, P.b);
  v.mb(16, 23, 10, 24, 28, 21, P.b); v.mb(16, 29, 12, 18, 30, 19, P.c);
  v.box(22, 29, 12, 23, 34, 13, P.c);
  v.mb(26, 11, 14, 27, 18, 17, P.a, 0, 3, 4);
  v.mb(21, 6, 22, 24, 8, 22, '#10141c'); v.set(22, 7, 22, '#ffb347', 1);
  face(v, { zf: 22, ex: 3, ey: 15, my: 10, tl: 3, mw: 1 });
  return { top: 28, hw: 8, z0: 10, z1: 21, zf: 22, cheek: [8, 14] };
}
function buildFlashlight(v, P) {
  v.pv.leg = 3; v.pv.arm = 18;
  v.mb(17, 0, 12, 20, 2, 19, P.c, 0, 1, 2);
  v.mb(16, 3, 11, 20, 26, 20, (x, y) => (y % 7 === 6 ? P.c : P.a));
  v.mb(17, 14, 9, 19, 18, 10, '#e63946');
  v.mb(16, 27, 10, 21, 28, 21, P.c); v.mb(16, 29, 9, 22, 30, 22, P.c); v.mb(16, 31, 8, 23, 32, 23, P.c); v.mb(16, 33, 7, 24, 33, 24, P.b);
  v.mb(16, 34, 10, 21, 34, 21, '#fff6b0', 1);
  for (const [x, z, y] of [[17, 15, 37], [21, 18, 39], [19, 13, 36], [23, 16, 38], [16, 18, 41]]) { v.set(x, y, z, '#fff3a0', 1); v.set(31 - x, y, z, '#fff3a0', 1); }
  v.mb(21, 12, 14, 23, 18, 17, P.a, 0, 3, 4);
  face(v, { zf: 20, ex: 2, ey: 19, my: 14, tl: 2, mw: 1 });
  return { top: 34, hw: 8, z0: 8, z1: 23, zf: 20, cheek: [5, 18] };
}
function buildCandle(v, P) {
  v.pv.leg = 2; v.pv.arm = 15;
  v.mb(16, 0, 8, 24, 1, 23, P.c);
  v.mb(16, 2, 10, 21, 24, 21, P.a); v.mb(16, 25, 11, 20, 25, 20, P.b);
  v.mb(22, 14, 13, 22, 24, 15, P.b); v.mb(17, 19, 22, 17, 24, 22, P.b);
  v.mb(22, 10, 14, 24, 16, 17, P.a, 0, 3, 4);
  v.box(15, 26, 15, 16, 29, 16, '#2b2b2b');
  v.box(15, 30, 15, 16, 34, 16, '#ffb02e', 1); v.box(15, 35, 15, 16, 36, 16, '#fff2a8', 1);
  v.set(14, 31, 15, '#ffb02e', 1); v.set(17, 31, 16, '#ffb02e', 1); v.set(14, 32, 16, '#ff8a3a', 1); v.set(17, 32, 15, '#ff8a3a', 1);
  face(v, { zf: 21, ex: 2, ey: 17, my: 11, tl: 3, mw: 1 });
  return { top: 25, hw: 6, z0: 10, z1: 21, zf: 21, cheek: [6, 16] };
}
function buildRadio(v, P) {
  v.pv.leg = 3; v.pv.arm = 16;
  v.mb(17, 0, 12, 21, 1, 19, P.c, 0, 1, 2);
  v.mb(16, 2, 10, 25, 22, 21, P.a);
  v.mb(16, 3, 21, 24, 3, 21, P.c); v.mb(16, 5, 21, 24, 5, 21, P.c);
  v.mb(16, 23, 13, 21, 23, 18, P.c); v.mb(16, 24, 13, 17, 24, 18, P.c);
  v.mb(20, 19, 21, 22, 21, 22, P.b); v.mb(24, 19, 21, 24, 21, 22, P.b);
  v.box(22, 23, 14, 23, 40, 15, '#cfd6e3'); v.box(22, 41, 14, 23, 41, 15, '#e63946', 1);
  v.mb(26, 8, 14, 27, 14, 17, P.a, 0, 3, 4);
  face(v, { zf: 21, ex: 3, ey: 13, my: 8, tl: 3, mw: 1 });
  return { top: 24, hw: 9, z0: 10, z1: 21, zf: 21, cheek: [8, 12] };
}
function buildBattery(v, P) {
  v.pv.leg = 3; v.pv.arm = 17;
  v.mb(17, 0, 13, 19, 2, 18, P.c, 0, 1, 2);
  v.mb(16, 3, 11, 21, 28, 20, (x, y) => (y <= 4 ? P.c : y >= 22 ? P.b : P.a));
  v.mb(16, 29, 13, 19, 29, 18, P.c); v.mb(16, 30, 14, 17, 31, 17, P.c);
  v.mb(22, 10, 14, 24, 17, 17, P.a, 0, 3, 4);
  face(v, { zf: 20, ex: 2, ey: 14, my: 8, tl: 2, mw: 1 });
  return { top: 31, hw: 5, z0: 11, z1: 20, zf: 20, cheek: [6, 13] };
}
const BUILD = { gasmask: buildGasmask, hazmat: buildHazmat, beans: buildBeans, generator: buildGenerator, flashlight: buildFlashlight, candle: buildCandle, radio: buildRadio, battery: buildBattery };

// accessories sit on the head top (or the face) of whichever character it is
function accessory(v, a, acc, col) {
  const zm = (a.z0 + a.z1) >> 1;
  if (acc === 'helmet') { v.mb(16, a.top + 1, a.z0 - 1, 15 + a.hw, a.top + 1, a.z1 + 1, col); v.mb(16, a.top + 2, a.z0, 14 + a.hw, a.top + 3, a.z1, col); v.box(15, a.top + 4, a.z0 + 1, 16, a.top + 4, a.z1 - 1, col); }
  else if (acc === 'plaster') { const x = 16 + a.cheek[0] - 3, y = a.cheek[1] - 3; v.box(x, y, a.zf + 1, x + 2, y + 1, a.zf + 1, '#f3d9b5'); v.set(x + 1, y, a.zf + 1, '#c99b6a'); v.set(x + 1, y + 1, a.zf + 1, '#c99b6a'); }
  else if (acc === 'glowstick') { v.box(15, a.top + 1, zm, 16, a.top + 6, zm, '#7dff6a', 1); v.box(17, a.top + 5, zm, 18, a.top + 6, zm, '#7dff6a', 1); }
}

const GLOW = '#ffb347';

const mixHex = (hex, k) => { const n = parseInt(hex.slice(1, 7), 16); return '#' + [16, 8, 0].map((sh) => Math.max(0, Math.min(255, Math.round(((n >> sh) & 255) * k))).toString(16).padStart(2, '0')).join(''); };
function finish(v, extra) {
  const palette = [], index = new Map(), cells = [];
  for (const q of v.m.values()) {
    let c = q.c;
    if (!q.e) { const h = Math.imul(q.x * 73856093 ^ q.y * 19349663 ^ q.z * 83492791, 2654435761) >>> 0; c = mixHex(c, 0.93 + (h % 1000) / 1000 * 0.12); }
    let pi = index.get(c); if (pi == null) { pi = palette.length; palette.push(c); index.set(c, pi); }
    cells.push([q.x, q.y, q.z, q.e + 2 * q.g, pi]);
  }
  cells.sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
  return Object.assign({ pet: true, zoom: 0.8, w: W, h: H, d: D, cx: CX, cz: CZ, pivot: [v.pv.leg, v.pv.arm], pz: [16, 16], tailZ: 0, gun: null, muz: [], face: v.face || null, palette, cells }, extra || {});
}
const modelCache = new Map();
function agentVoxels(slot, secret) {
  const key = String(secret) + ':' + slot;
  let m = modelCache.get(key);
  if (!m) {
    const t = traitsFor(slot, secret), sp = SPECIES[t.team][t.species], v = new Vox();
    const a = BUILD[t.species](v, sp.looks[t.look], false);
    accessory(v, a, t.acc, ACC_COL[t.accColor]);
    m = finish(v); m.scheme = BGS[t.team][t.bg]; m.glow = GLOW; modelCache.set(key, m);
  }
  return m;
}


// ---- the flagship: the Bunker Boss, a gas-mask commander in a gold crown, sweating gold. ----
let primeCache = null;
function founderVoxels() {
  if (primeCache) return primeCache;
  const v = new Vox();
  const a = buildGasmask(v, { a: '#2e3340', b: '#232733', c: '#c9a227', d: '#4a5063', skin: '#e8c4a0' }, true);
  for (const q of v.m.values()) if (q.c === TEAR) q.c = '#ffd166';
  const t = a.top;
  v.mb(16, t + 1, 12, 20, t + 1, 20, '#ffc84a');
  for (const x of [16, 18, 20]) for (const z of [12, 16, 20]) { v.set(x, t + 2, z, '#ffc84a'); v.set(31 - x, t + 2, z, '#ffc84a'); }
  v.set(16, t + 2, 20, '#ff4d4d', 1); v.set(15, t + 2, 20, '#ff4d4d', 1);
  v.mb(17, 19, 20, 18, 20, 20, '#ffd166', 1); v.mb(20, 19, 20, 21, 20, 20, '#ffd166', 1);
  primeCache = finish(v); primeCache.scheme = '#1f2230'; primeCache.glow = '#ffd166';
  return primeCache;
}

// ---- flat pictures for logos and tiles, cached because drawing one takes a moment ----
const iso = require('./isorender');
const picCache = new Map();
function pngFor(model, key, size) {
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = iso.renderPng(model, { size }); picCache.set(k, b); if (picCache.size > 120) picCache.delete(picCache.keys().next().value); }
  return b;
}
const png = (slot, secret, size) => pngFor(agentVoxels(slot, secret), 'a' + secret + ':' + slot, size || 512);
const founderPng = (size) => pngFor(founderVoxels(), 'prime', size || 512);

// a lightning bolt, as runs of cubes on a 64 x 64 grid, for the locked tiles and the logo
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

module.exports = { png, founderPng, silhouette, traitsFor, agentFor, agentVoxels, founderVoxels, ROLES, ABILITIES, SPECIES, W, H, D };
