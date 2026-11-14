'use strict';
// Bunker survivors for BlackoutPad, built from cubes in a 32 x 48 x 32 grid from a server secret.
// Eight original human characters in two teams. Preppers have stocked up (gas-mask survivor, hazmat worker, soldier, medic).
// Doomers keep the lights on, or try to (radio operator, miner, electrician, lamplighter). Even slots are preppers and odd slots are doomers,
// so the teams stay level. The same model drives the 3D views and the flat logos.
const crypto = require('crypto');

const W = 32, H = 48, D = 32, CX = 15.5, CZ = 16;
const TEAR = '#bfe3ff', INK = '#1d1d2e', METAL = '#b9c0cc', METALD = '#98a1b0';

// ---- looks: each species has a few colour sets ----
const SPECIES = {
  prepper: {
    gasmask: { name: 'Gas-mask survivor', w: 14, looks: [
      { n: 'Olive', a: '#6b7a4a', b: '#4f5a38', c: '#3a3f35', d: '#8d9b6b', skin: '#e8c4a0' }, { n: 'Charcoal', a: '#4b505c', b: '#353944', c: '#272a33', d: '#7b8396', skin: '#c99774' },
      { n: 'Desert', a: '#b79a63', b: '#8f7747', c: '#5b4a2c', d: '#d3bb86', skin: '#f0cfae' }, { n: 'Navy', a: '#3d5a86', b: '#2b4266', c: '#1e2d47', d: '#6f8fc0', skin: '#8d5a3a' }] },
    hazmat: { name: 'Hazmat worker', w: 14, looks: [
      { n: 'Yellow', a: '#f2c230', b: '#d6a31c', c: '#5b5f66', d: '#8a8e96' }, { n: 'Orange', a: '#f2812e', b: '#d1651a', c: '#4e4f57', d: '#8a8e96' },
      { n: 'White', a: '#eef0f4', b: '#cfd3dc', c: '#5b5f66', d: '#a9afbb' }, { n: 'Green', a: '#74c26a', b: '#58a24f', c: '#444b52', d: '#8a8e96' }] },
    soldier: { name: 'Soldier', w: 14, looks: [
      { n: 'Woodland', a: '#5d6b3f', b: '#475233', c: '#3f4a2c', d: '#6f6a4a', skin: '#e8c4a0', hair: '#5a3a1e' }, { n: 'Desert', a: '#b39a62', b: '#8f7a4a', c: '#7a6a42', d: '#9a8458', skin: '#c99774', hair: '#2b2118' },
      { n: 'Urban grey', a: '#6a7078', b: '#4d525a', c: '#3a3e45', d: '#585e68', skin: '#8d5a3a', hair: '#222222' }, { n: 'Arctic', a: '#d9dee6', b: '#aeb6c4', c: '#c4cbd8', d: '#8e97a8', skin: '#f0cfae', hair: '#d9b35f' }] },
    medic: { name: 'Medic', w: 14, looks: [
      { n: 'White coat', a: '#f2f4f8', b: '#4a5a78', c: '#ffffff', d: '#8fd0e6', skin: '#e8c4a0', hair: '#5a3a1e' }, { n: 'Mint scrubs', a: '#8fd6c2', b: '#6fb8a4', c: '#e8f6f2', d: '#8fd0e6', skin: '#c99774', hair: '#2b2118' },
      { n: 'Blue scrubs', a: '#4f86d9', b: '#3b6bb8', c: '#dbe8fb', d: '#8fd0e6', skin: '#8d5a3a', hair: '#222222' }, { n: 'Green scrubs', a: '#4fae7a', b: '#3d8a5f', c: '#e6f6ee', d: '#8fd0e6', skin: '#f0cfae', hair: '#b5472a' }] },
  },
  doomer: {
    radioop: { name: 'Radio operator', w: 14, looks: [
      { n: 'Olive jacket', a: '#6f7d4f', b: '#3e4630', c: '#2a2d33', d: '#4a5260', skin: '#e8c4a0', hair: '#5a3a1e' }, { n: 'Orange jacket', a: '#e8742c', b: '#3a3f4a', c: '#2a2d33', d: '#5a6270', skin: '#c99774', hair: '#2b2118' },
      { n: 'Grey jacket', a: '#7a808c', b: '#3d424d', c: '#d9b35f', d: '#4a5260', skin: '#8d5a3a', hair: '#222222' }, { n: 'Red jacket', a: '#c24a4a', b: '#2e3340', c: '#2a2d33', d: '#4a5260', skin: '#f0cfae', hair: '#b5472a' }] },
    miner: { name: 'Miner', w: 14, looks: [
      { n: 'Orange coverall', a: '#e8832e', b: '#c96a1e', c: '#f2c230', d: '#3a3f46', skin: '#e8c4a0', hair: '#5a3a1e' }, { n: 'Blue coverall', a: '#4f6fa8', b: '#3d5a8a', c: '#f2c230', d: '#3a3f46', skin: '#8d5a3a', hair: '#222222' },
      { n: 'Grey coverall', a: '#7a808c', b: '#5d636e', c: '#e8832e', d: '#3a3f46', skin: '#c99774', hair: '#2b2118' }, { n: 'Green coverall', a: '#5f8a4f', b: '#4a7040', c: '#f2c230', d: '#3a3f46', skin: '#f0cfae', hair: '#d9b35f' }] },
    electrician: { name: 'Electrician', w: 14, looks: [
      { n: 'Blue overalls', a: '#3d6fc9', b: '#2f56a0', c: '#ffffff', d: '#f08a30', skin: '#e8c4a0', hair: '#5a3a1e' }, { n: 'Red overalls', a: '#d04a4a', b: '#a83a3a', c: '#f2c230', d: '#f08a30', skin: '#c99774', hair: '#2b2118' },
      { n: 'Grey overalls', a: '#6f7682', b: '#555c68', c: '#ffffff', d: '#f08a30', skin: '#8d5a3a', hair: '#222222' }, { n: 'Green overalls', a: '#4f9a6a', b: '#3d7a53', c: '#f2c230', d: '#f08a30', skin: '#f0cfae', hair: '#b5472a' }] },
    lamplighter: { name: 'Lamplighter', w: 14, looks: [
      { n: 'Brown coat', a: '#7a5a3c', b: '#3a2e24', c: '#4a3a2a', d: '#b5472a', skin: '#e8c4a0', hair: '#cfcfcf' }, { n: 'Green coat', a: '#4a6a4f', b: '#2a3a2e', c: '#2e3a30', d: '#d9b35f', skin: '#c99774', hair: '#e6e6e6' },
      { n: 'Navy coat', a: '#3a4a6a', b: '#252e44', c: '#2a3248', d: '#c24a4a', skin: '#8d5a3a', hair: '#cfcfcf' }, { n: 'Grey coat', a: '#6a6e76', b: '#3a3d44', c: '#4a4d54', d: '#6fa8d9', skin: '#f0cfae', hair: '#ffffff' }] },
  },
};
const ACCS = [['none', 30], ['plaster', 24], ['glowstick', 20], ['scarf', 26]];
const ACC_COL = ['#e6544f', '#3a7ae6', '#3ae68a', '#e6c13a', '#b03ae6', '#ff7aa8', '#ff8a3a'];
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
      key = [k, look, t.acc, t.acc === 'scarf' ? t.accColor : 0].join('|');
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
// the shared human body: boots, legs, torso, arms, neck, head with hair and a worried face
function human(v, P, o) {
  o = o || {};
  v.pv.leg = 10; v.pv.arm = 21;
  v.mb(17, 3, 14, 19, 9, 17, P.b, 0, 1, 2); v.mb(16, 0, 12, 20, 2, 21, o.boot || '#2b2b2b', 0, 1, 2);
  v.mb(16, 10, 12, 21, 22, 19, P.a);
  v.mb(22, 11, 14, 24, 21, 17, P.a, 0, 3, 4); v.mb(22, 9, 14, 24, 10, 17, o.glove || P.skin, 0, 3, 4);
  v.mb(16, 22, 13, 19, 23, 18, P.skin);
  v.mb(16, 24, 11, 22, 36, 21, P.skin);
  if (!o.nohair) { v.mb(16, 35, 11, 22, 37, 21, P.hair); v.mb(16, 28, 11, 22, 36, 13, P.hair); v.mb(22, 32, 12, 22, 36, 20, P.hair); }
  face(v, { zf: 21, ex: 2, ey: 30, my: 26, tl: 2, mouth: INK, mw: 1, pupil: INK });
}
function buildSoldier(v, P) {
  human(v, P, { nohair: true });
  v.mb(16, 35, 10, 23, 39, 22, P.c); v.mb(16, 34, 10, 23, 34, 22, P.c); v.mb(23, 32, 12, 23, 36, 20, P.c);
  for (let k = 0; k < 14; k++) v.set(16 + ((k * 5) % 7), 35 + (k % 5), 10 + ((k * 3) % 12), P.d, 0);
  v.mb(16, 13, 20, 21, 21, 20, P.d); v.mb(17, 14, 21, 19, 16, 21, P.c);
  v.mb(17, 12, 9, 21, 23, 11, P.d); v.mb(17, 24, 9, 21, 25, 11, P.c);
  v.mb(20, 29, 21, 21, 29, 21, '#2a2a1a');
  return { top: 39, hw: 7, z0: 10, z1: 22, zf: 21, cheek: [6, 31] };
}
function buildMedic(v, P) {
  human(v, P, { nohair: true, glove: '#dfe8f2', boot: '#e9edf3' });
  v.mb(16, 4, 12, 21, 9, 19, P.a); v.mb(16, 3, 12, 21, 3, 19, P.a);
  v.mb(16, 35, 11, 22, 36, 21, P.hair); v.mb(16, 28, 11, 22, 35, 13, P.hair);
  v.mb(16, 36, 10, 22, 39, 22, P.c);
  v.box(15, 37, 22, 16, 38, 22, '#d6332b'); v.box(14, 37, 22, 17, 38, 22, '#d6332b'); v.box(15, 36, 22, 16, 39, 22, '#d6332b');
  v.box(15, 13, 20, 16, 19, 20, '#d6332b'); v.box(13, 15, 20, 18, 17, 20, '#d6332b');
  v.mb(16, 24, 22, 21, 28, 22, P.d);
  v.mb(22, 27, 12, 22, 28, 21, P.d);
  return { top: 39, hw: 6, z0: 10, z1: 22, zf: 21, cheek: [6, 31] };
}
function buildRadioOp(v, P) {
  human(v, P);
  v.mb(23, 29, 14, 24, 34, 18, P.c); v.mb(16, 38, 14, 23, 38, 18, P.c); v.mb(23, 35, 15, 23, 37, 17, P.c);
  v.box(22, 27, 20, 24, 27, 22, P.c); v.box(21, 26, 22, 22, 27, 23, '#111111');
  v.mb(17, 12, 8, 21, 23, 11, P.d); v.mb(17, 20, 8, 18, 21, 8, '#ffb347', 1);
  v.box(21, 24, 9, 22, 42, 10, '#cfd6e3'); v.box(21, 43, 9, 22, 43, 10, '#ff3b30', 1);
  return { top: 38, hw: 6, z0: 11, z1: 21, zf: 21, cheek: [6, 31] };
}
function buildMiner(v, P) {
  human(v, P, { nohair: true });
  v.mb(16, 35, 10, 23, 38, 22, P.c); v.mb(16, 35, 10, 24, 35, 23, P.c); v.box(15, 39, 12, 16, 39, 20, P.c);
  v.box(14, 36, 22, 17, 37, 22, P.d); v.box(14, 36, 23, 17, 37, 24, '#fff3a0', 1);
  v.mb(20, 28, 21, 21, 29, 21, '#3a2e24');
  v.mb(16, 13, 20, 21, 13, 20, '#ffd23f'); v.mb(16, 18, 20, 21, 18, 20, '#ffd23f');
  v.mb(16, 24, 11, 22, 24, 13, P.hair);
  return { top: 39, hw: 7, z0: 10, z1: 22, zf: 21, cheek: [6, 31] };
}
function buildElectrician(v, P) {
  human(v, P, { nohair: true, glove: P.d });
  v.mb(16, 35, 10, 23, 38, 22, P.c); v.mb(16, 35, 10, 24, 35, 23, P.c); v.box(15, 39, 12, 16, 39, 20, P.c);
  v.mb(17, 33, 22, 21, 35, 22, '#2a2f36'); v.mb(18, 34, 23, 20, 34, 23, '#7fe8ff', 1);
  v.mb(16, 10, 20, 21, 11, 20, '#6b4a2a'); v.mb(17, 9, 21, 18, 11, 21, '#8a5a2a'); v.set(20, 11, 21, '#e63946', 0);
  for (const [x, y] of [[16, 20], [16, 19], [15, 18], [15, 17], [14, 16], [14, 15], [15, 14]]) v.set(x, y, 20, '#ffd23f', 1);
  v.mb(16, 24, 11, 22, 24, 13, P.hair);
  return { top: 39, hw: 7, z0: 10, z1: 22, zf: 21, cheek: [6, 31] };
}
function buildLamplighter(v, P) {
  human(v, P, { nohair: true });
  v.mb(16, 3, 12, 22, 9, 19, P.a);
  v.mb(16, 35, 11, 22, 36, 21, P.hair); v.mb(16, 28, 11, 22, 36, 12, P.hair); v.mb(22, 28, 12, 22, 35, 20, P.hair);
  v.mb(16, 37, 10, 22, 38, 22, P.c); v.mb(17, 37, 22, 21, 37, 23, P.c);
  v.mb(16, 22, 12, 21, 23, 19, P.d);
  v.mb(17, 24, 22, 21, 25, 22, P.hair);
  v.g = 3; v.box(24, 4, 14, 27, 10, 17, '#2a2d33'); v.box(25, 5, 15, 26, 9, 16, '#ffb347', 1); v.box(25, 11, 15, 26, 11, 16, '#2a2d33'); v.g = 0;
  return { top: 38, hw: 6, z0: 10, z1: 22, zf: 21, cheek: [6, 31] };
}
const BUILD = { gasmask: buildGasmask, hazmat: buildHazmat, soldier: buildSoldier, medic: buildMedic, radioop: buildRadioOp, miner: buildMiner, electrician: buildElectrician, lamplighter: buildLamplighter };

// accessories sit on the head top (or the face) of whichever character it is
function accessory(v, a, acc, col) {
  const zm = (a.z0 + a.z1) >> 1;
  if (acc === 'plaster') { const x = 16 + a.cheek[0] - 3, y = a.cheek[1] - 3; v.box(x, y, a.zf + 1, x + 2, y + 1, a.zf + 1, '#f3d9b5'); v.set(x + 1, y, a.zf + 1, '#c99b6a'); v.set(x + 1, y + 1, a.zf + 1, '#c99b6a'); }
  else if (acc === 'glowstick') { v.box(15, a.top + 1, zm, 16, a.top + 6, zm, '#7dff6a', 1); v.box(17, a.top + 5, zm, 18, a.top + 6, zm, '#7dff6a', 1); }
  else if (acc === 'scarf') { v.mb(16, 22, 12, 21, 23, 19, col); v.mb(17, 16, 20, 18, 22, 20, col); }
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
