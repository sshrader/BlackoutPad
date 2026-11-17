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

// ---- a tiny rasterizer: 48 x 48 pixels, no anti-aliasing, so every edge stays crisp ----
const rgbOf = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
class Canvas {
  constructor(bg) { this.px = Buffer.alloc(N * N * 3); const c = rgbOf(bg); for (let i = 0; i < N * N; i++) { this.px[i * 3] = c[0]; this.px[i * 3 + 1] = c[1]; this.px[i * 3 + 2] = c[2]; } }
  put(x, y, c, a) {
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const i = (y * N + x) * 3;
    if (a == null || a >= 1) { this.px[i] = c[0]; this.px[i + 1] = c[1]; this.px[i + 2] = c[2]; return; }
    for (let k = 0; k < 3; k++) this.px[i + k] = Math.round(this.px[i + k] * (1 - a) + c[k] * a);
  }
  fill(test, col, a) { if (a == null && col.length === 9) a = parseInt(col.slice(7, 9), 16) / 255; const c = rgbOf(col); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (test(x + 0.5, y + 0.5)) this.put(x, y, c, a); }
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
}

// ---- the parts every crook shares: body, neck, head, ears, nose, eyes and mouth ----
const HEAD = [[15, 9], [33, 9], [35, 14], [35, 24], [31, 31], [17, 31], [13, 24], [13, 14]];
function body(c, cloth, shade, wide) {
  const x0 = wide ? 0 : 4, x1 = wide ? 48 : 44;
  c.poly([[x0, 48], [x0 + 2, 39], [14, 35], [34, 35], [x1 - 2, 39], [x1, 48]], cloth);
  c.rect(x0 + 2, 44, x1 - x0 - 4, 4, shade);
}
function neck(c, sk, wide) { c.rect(wide ? 18 : 20, 29, wide ? 12 : 8, 8, sk[1]); c.rect(wide ? 18 : 20, 29, wide ? 12 : 8, 2, sk[1]); }
function head(c, sk, o) {
  o = o || {};
  c.poly(HEAD, sk[0]);
  c.rect(12, 17, 2, 6, sk[1]); c.rect(34, 17, 2, 6, sk[1]);   // ears
  c.rect(17, 30, 14, 1, sk[1]);                                 // jaw shade
  c.rect(23, 21, 2, 4, sk[1]);                                  // nose
  if (!o.noEyes) eyes(c, o.shade, o.look);
  c.rect(20, 27, 8, 1, '#7a3a3a'); c.rect(21, 28, 6, 1, sk[1]); // mouth
}
function eyes(c, shaded, look) {
  const lx = look === 'side' ? 1 : 0;
  c.rect(17, 17, 5, 3, '#ffffff'); c.rect(26, 17, 5, 3, '#ffffff');
  c.rect(19 + lx, 17, 2, 3, INK); c.rect(28 + lx, 17, 2, 3, INK);
  c.rect(17, 15, 5, 1, shaded || '#3a2a1e'); c.rect(26, 15, 5, 1, shaded || '#3a2a1e');
}
function hairCut(c, col) { c.poly([[14, 12], [16, 8], [24, 6], [32, 8], [34, 12], [34, 15], [32, 12], [16, 12], [14, 15]], col); }

// ---- the eight crooks ----
const DRAW = {
  robber(c, L, sk) {
    body(c, L.shirt, '#00000022', false);
    for (let y = 38; y < 48; y += 4) c.rect(4, y, 40, 2, L.stripe);
    neck(c, sk); c.poly([[13, 29], [14, 8], [34, 8], [35, 29], [31, 33], [17, 33]], L.mask);
    c.rect(15, 15, 18, 7, sk[0]); eyes(c, '#3a2a1e'); c.rect(19, 26, 10, 4, sk[0]); c.rect(20, 27, 8, 1, '#7a3a3a');
    c.rect(23, 21, 2, 3, sk[1]);
  },
  driver(c, L, sk) {
    body(c, L.jacket, '#00000033', false); c.poly([[18, 35], [24, 42], [30, 35]], '#e8e8f0');
    neck(c, sk); head(c, sk, { noEyes: true, shade: L.hair });
    c.poly([[13, 15], [15, 6], [33, 6], [35, 15]], L.cap); c.rect(12, 14, 26, 3, L.brim);
    c.rect(15, 18, 18, 4, INK); c.rect(16, 18, 4, 1, '#ffffff55'); c.rect(27, 18, 4, 1, '#ffffff55'); c.rect(23, 19, 2, 1, INK);
  },
  safecracker(c, L, sk) {
    body(c, L.shirt, '#00000033', false); c.rect(19, 35, 10, 4, sk[1]);
    neck(c, sk); head(c, sk, { shade: L.hair });
    c.rect(17, 25, 14, 6, L.hair, 0.5);
    c.poly([[13, 14], [14, 5], [34, 5], [35, 14]], L.beanie); c.rect(22, 2, 4, 4, L.beanie); c.rect(13, 12, 22, 2, '#00000033');
    c.rect(14, 9, 20, 3, '#cfd6e6'); c.rect(15, 10, 6, 1, '#ffffff'); c.rect(27, 10, 6, 1, '#ffffff');
  },
  hacker(c, L, sk) {
    body(c, L.hood, '#00000044', false); c.rect(17, 37, 1, 8, '#e8e8f0'); c.rect(30, 37, 1, 8, '#e8e8f0');
    neck(c, sk); c.poly([[10, 30], [11, 11], [17, 5], [31, 5], [37, 11], [38, 30], [33, 36], [15, 36]], L.hood);
    c.poly([[15, 12], [33, 12], [34, 22], [31, 30], [17, 30], [14, 22]], sk[0]); c.rect(23, 21, 2, 4, sk[1]);
    c.rect(16, 16, 7, 5, L.lens); c.rect(25, 16, 7, 5, L.lens); c.rect(23, 17, 2, 1, L.lens); c.rect(17, 17, 3, 1, '#ffffff'); c.rect(26, 17, 3, 1, '#ffffff');
    c.rect(20, 27, 8, 1, '#7a3a3a');
  },
  boss(c, L, sk) {
    body(c, L.suit, '#00000033', false); c.poly([[18, 35], [24, 47], [30, 35]], '#f1e8d4'); c.poly([[22, 36], [26, 36], [27, 46], [24, 48], [21, 46]], L.tie);
    neck(c, sk); head(c, sk, { shade: L.hair }); hairCut(c, L.hair); c.rect(15, 11, 18, 2, L.hair);
    c.rect(18, 25, 12, 2, L.hair);
  },
  lookout(c, L, sk) {
    body(c, L.jacket, '#00000033', false); c.rect(14, 35, 4, 8, '#00000033'); c.rect(30, 35, 4, 8, '#00000033');
    neck(c, sk); head(c, sk, { shade: L.hair, look: 'side' });
    c.poly([[13, 15], [14, 8], [34, 8], [35, 15]], L.band); c.rect(13, 13, 22, 2, '#00000026'); c.poly([[33, 10], [41, 7], [42, 14], [34, 14]], L.band);
    c.rect(16, 10, 16, 1, '#ffffff55');
  },
  muscle(c, L, sk) {
    c.rect(0, 40, 6, 8, sk[1]); c.rect(42, 40, 6, 8, sk[1]);
    c.poly([[0, 48], [2, 39], [12, 35], [36, 35], [46, 39], [48, 48]], sk[1]); c.poly([[7, 48], [9, 38], [16, 35], [32, 35], [39, 38], [41, 48]], L.tank);
    neck(c, sk, true); head(c, sk, { shade: L.hair });
    c.rect(18, 10, 6, 2, '#ffffff33'); c.rect(30, 17, 1, 8, '#8a3a3a'); c.rect(29, 19, 3, 1, '#8a3a3a');
    c.rect(17, 25, 14, 2, '#00000022');
  },
  accountant(c, L, sk) {
    body(c, L.shirt, '#00000022', false); c.poly([[10, 48], [12, 39], [19, 36], [20, 48]], L.vest); c.poly([[38, 48], [36, 39], [29, 36], [28, 48]], L.vest);
    c.poly([[22, 36], [26, 36], [27, 46], [24, 48], [21, 46]], L.tie); c.rect(14, 40, 3, 1, '#ffffff'); c.rect(15, 38, 1, 3, '#1a1626');
    neck(c, sk); head(c, sk, { noEyes: true });
    c.poly([[14, 12], [16, 8], [24, 6], [32, 8], [34, 12], [34, 14], [28, 11], [18, 11], [14, 14]], L.hair);
    c.rect(16, 16, 7, 6, '#ffffff22'); c.rect(25, 16, 7, 6, '#ffffff22');
    for (const x of [16, 25]) { c.rect(x, 16, 7, 1, INK); c.rect(x, 21, 7, 1, INK); c.rect(x, 16, 1, 6, INK); c.rect(x + 6, 16, 1, 6, INK); }
    c.rect(23, 17, 2, 1, INK); c.rect(19, 18, 2, 3, INK); c.rect(28, 18, 2, 3, INK);
    c.rect(17, 14, 5, 1, L.hair); c.rect(26, 14, 5, 1, L.hair);
  },
};
function kingpin(c) {
  const sk = SKINS[2];
  body(c, '#101018', '#00000044', false); c.poly([[18, 35], [24, 47], [30, 35]], '#f1e8d4');
  c.rect(15, 38, 18, 2, '#ffd24a'); c.rect(23, 40, 2, 4, '#ffd24a'); c.rect(22, 44, 4, 3, '#ffd24a');
  neck(c, sk); head(c, sk, { noEyes: true });
  c.rect(18, 25, 12, 2, '#141018');
  c.rect(15, 16, 18, 5, '#ffd24a'); c.rect(15, 16, 18, 1, '#fff2a8'); c.rect(23, 17, 2, 1, '#ffd24a'); c.rect(17, 20, 4, 1, '#00000033'); c.rect(27, 20, 4, 1, '#00000033');
  c.rect(8, 12, 32, 3, '#1a1626'); c.poly([[14, 12], [16, 3], [32, 3], [34, 12]], '#1a1626'); c.rect(14, 9, 20, 2, '#ff2d95');
}

// small extras on a face, so two of the same crook still look different
function accessory(c, acc, col) {
  if (acc === 'plaster') { c.poly([[26, 22], [32, 20], [33, 23], [27, 25]], '#f0d2a8'); c.rect(29, 21, 1, 3, '#c89a68'); }
  else if (acc === 'earring') { c.rect(11, 21, 2, 3, col); c.rect(11, 24, 2, 1, '#00000033'); }
  else if (acc === 'cig') { c.rect(25, 26, 11, 1, '#f4f4f4'); c.rect(34, 26, 2, 1, '#ff8a3d'); c.circle(38, 22, 2, '#cfd6e6', 0.3); c.circle(40, 18, 2.5, '#cfd6e6', 0.2); }
}

function bgFor(c, team, bgIdx) {
  c.rect(0, 0, N, N, BGS[team][bgIdx]);
  for (let y = 6; y < N; y += 8) c.rect(0, y, N, 1, '#ffffff', 0.07);
}
function paint(slot, secret) {
  const t = traitsFor(slot, secret), L = SPECIES[t.team][t.species].looks[t.look], sk = SKINS[L.skin];
  const c = new Canvas(BGS[t.team][t.bg]); bgFor(c, t.team, t.bg);
  DRAW[t.species](c, L, sk);
  accessory(c, t.acc, ACC_COL[t.accColor]);
  return c;
}
function paintFlagship() { const c = new Canvas('#14091f'); for (let y = 6; y < N; y += 8) c.rect(0, y, N, 1, '#ffd24a', 0.12); kingpin(c); return c; }

// ---- flat pictures for logos and tiles: the sprite scaled up with no smoothing, cached ----
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
