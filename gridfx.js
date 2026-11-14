'use strict';
// BlackoutPad's moving backdrops, plain 2D canvas: GridBg is the dim control-room grid behind the pages, and GridIntro is the intro, a map
// of the power grid that is going dark. Both stop on their own when the page is hidden and respect reduced motion.
(function (root) {
  var CYAN = '#1ff2ff', GREEN = '#39ff88', RED = '#ff3d6e', DARKLINE = '#161a3a', DARKNODE = '#0b0c1a', DARKRING = '#1f2350';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.caveReduce = reduce;

  // the map is laid out on a 1280 x 720 board and scaled to fit
  var NODES = [[120, 140], [300, 220], [480, 150], [620, 300], [250, 420], [430, 520], [640, 560], [180, 600], [820, 180], [980, 120], [1120, 260], [900, 400], [1100, 480], [820, 590], [1000, 630], [1180, 600]];
  var LIT = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6], [3, 6], [4, 7], [5, 7]];
  var FLICKER = [[3, 8, 0], [6, 13, 0.6], [2, 9, 0.6]];
  var DARK = [[8, 9], [9, 10], [8, 11], [10, 12], [11, 12], [11, 13], [13, 14], [14, 15], [12, 15], [10, 11]];
  var TRIPPED = [8, 13, 11];
  var LOGS = ['> boot blackoutpad', '> grid load 97% ... warning', '> region 7 tripped ... offline', '> region 9 tripped ... offline', '> line 14 flickering', '> backup power engaged ... ok', '> keep a light on'];

  function sizeCanvas(cv) {
    var dpr = Math.min(root.devicePixelRatio || 1, 2), w = cv.clientWidth || root.innerWidth, h = cv.clientHeight || root.innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w: w, h: h, dpr: dpr };
  }
  function loop(self, fps, draw) {
    var last = 0, raf = 0, on = false;
    function tick(t) {
      if (!on) return;
      raf = root.requestAnimationFrame(tick);
      if (t - last < 1000 / fps) return;
      last = t;
      draw(t / 1000);
    }
    self.start = function () { if (on) return; on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) { root.cancelAnimationFrame(raf); } } else if (on) { raf = root.requestAnimationFrame(tick); } });
  }
  function glow(ctx, color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function noGlow(ctx) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

  // ---- the quiet backdrop: a faint grid, a few lit lines, a few nodes that blink ----
  function GridBg(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, fps = o.fps || 12;
    function draw(t) {
      var s = sizeCanvas(cv), k = s.dpr, w = cv.width, h = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#030304'; ctx.fillRect(0, 0, w, h);
      var g = ctx.createRadialGradient(w * 0.22, h * 0.15, 0, w * 0.22, h * 0.15, Math.max(w, h) * 0.6);
      g.addColorStop(0, 'rgba(31,242,255,.10)'); g.addColorStop(1, 'rgba(3,3,4,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      var step = 80 * k; ctx.strokeStyle = 'rgba(70,80,170,.10)'; ctx.lineWidth = 1; ctx.beginPath();
      for (var x = step; x < w; x += step) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, h); }
      for (var y = step; y < h; y += step) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(w, Math.round(y) + .5); }
      ctx.stroke();
      // the map, drawn big and dim, anchored to the top left
      var sc = Math.max(w, h) / 1280 * 1.1;
      ctx.save(); ctx.scale(sc, sc);
      ctx.lineCap = 'round'; ctx.lineWidth = 2;
      LIT.forEach(function (e) { var a = NODES[e[0]], b = NODES[e[1]]; ctx.strokeStyle = 'rgba(31,242,255,.16)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
      FLICKER.forEach(function (e, i) { var a = NODES[e[0]], b = NODES[e[1]], on = Math.sin(t * 1.7 + i * 2.1) > -0.2 && Math.sin(t * 9 + i) > -0.7; ctx.strokeStyle = on ? 'rgba(31,242,255,.14)' : 'rgba(31,242,255,.02)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
      NODES.forEach(function (n, i) { ctx.fillStyle = i < 8 ? 'rgba(31,242,255,.28)' : 'rgba(40,46,110,.22)'; ctx.beginPath(); ctx.arc(n[0], n[1], 7, 0, 7); ctx.fill(); });
      ctx.restore();
    }
    loop(self, fps, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }

  // ---- the intro: the grid map, the right half going dark, tripped breakers pulsing ----
  function GridIntro(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, faces = o.faces || [], t0 = 0;
    function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    function draw(t) {
      if (!t0) t0 = t;
      var s = sizeCanvas(cv), k = s.dpr, W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#020203'; ctx.fillRect(0, 0, W, H);
      // fit 1280 x 720 to cover the screen, shifted so the lit side stays on screen
      var sc = Math.max(W / 1280, H / 720), ox = (W - 1280 * sc) * 0.2, oy = (H - 720 * sc) * 0.5;
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      var lit = ctx.createRadialGradient(281, 396, 0, 281, 396, 520); lit.addColorStop(0, 'rgba(6,58,68,.55)'); lit.addColorStop(1, 'rgba(2,2,3,0)');
      ctx.fillStyle = lit; ctx.fillRect(-400, -300, 2100, 1400);
      ctx.strokeStyle = '#0a0b16'; ctx.lineWidth = 1; ctx.beginPath();
      for (var gx = -480; gx <= 1760; gx += 160) { ctx.moveTo(gx, -400); ctx.lineTo(gx, 1200); }
      for (var gy = -480; gy <= 1200; gy += 120) { ctx.moveTo(-600, gy); ctx.lineTo(1900, gy); }
      ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineWidth = 3;
      // dark lines
      ctx.strokeStyle = DARKLINE; DARK.forEach(function (e) { line(NODES[e[0]], NODES[e[1]]); });
      // lit lines
      glow(ctx, CYAN, 8); ctx.strokeStyle = CYAN; LIT.forEach(function (e) { line(NODES[e[0]], NODES[e[1]]); });
      // lines that flicker and then give out
      FLICKER.forEach(function (e, i) {
        var ph = (t - t0) * (i === 0 ? 0.52 : 0.37) + e[2], on = (ph % 1) < 0.42 || (ph % 1) > 0.6 && (ph % 1) < 0.72;
        if (on) { ctx.strokeStyle = CYAN; line(NODES[e[0]], NODES[e[1]]); }
      });
      noGlow(ctx);
      // rings, nodes
      ctx.lineWidth = 2;
      NODES.forEach(function (n, i) {
        if (i < 8) {
          glow(ctx, CYAN, 8); ctx.fillStyle = CYAN; ctx.beginPath(); ctx.arc(n[0], n[1], 9, 0, 7); ctx.fill(); noGlow(ctx);
          if (i !== 3 && i !== 6) { ctx.globalAlpha = 0.35; ctx.strokeStyle = CYAN; ctx.beginPath(); ctx.arc(n[0], n[1], 17, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        } else { ctx.fillStyle = DARKNODE; ctx.strokeStyle = DARKRING; ctx.beginPath(); ctx.arc(n[0], n[1], 8, 0, 7); ctx.fill(); ctx.stroke(); }
      });
      // tripped breakers: a red cross and a ring that keeps pulsing outward
      TRIPPED.forEach(function (ni, i) {
        var n = NODES[ni], p = (((t - t0) * 0.45 + i * 0.4) % 1);
        ctx.strokeStyle = RED; ctx.globalAlpha = 0.55 * (1 - p); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n[0], n[1], 10 + 24 * p, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(n[0] - 8, n[1] - 8); ctx.lineTo(n[0] + 8, n[1] + 8); ctx.moveTo(n[0] + 8, n[1] - 8); ctx.lineTo(n[0] - 8, n[1] + 8); ctx.stroke();
      });
      // a few asset faces sit on the lit nodes; the last one has gone dim
      ctx.imageSmoothingEnabled = false;
      [[0, 66, 78], [5, 438, 392]].forEach(function (f, i) { var im = faces[i]; if (im && im.complete && im.naturalWidth) ctx.drawImage(im, f[1], f[2], 54, 54); });
      if (faces[2] && faces[2].complete && faces[2].naturalWidth) { ctx.globalAlpha = 0.28; ctx.drawImage(faces[2], 1040, 470, 54, 54); ctx.globalAlpha = 1; }
      // vignette
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var v = ctx.createRadialGradient(W * 0.24, H * 0.55, Math.min(W, H) * 0.2, W * 0.24, H * 0.55, Math.max(W, H) * 0.85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    loop(self, o.fps || 30, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }
  GridIntro.LOGS = LOGS;
  GridIntro.create = function (cv, o) { return new GridIntro(cv, o); };

  root.GridBg = GridBg; root.GridIntro = GridIntro;
  // names the pages used before
  root.Cave = GridBg;
})(window);
