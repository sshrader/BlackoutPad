'use strict';
// HeistPad's moving backdrops, plain 2D canvas. GridBg is the dim night city behind the pages; GridIntro is the intro: a city skyline with
// searchlights, police lights and a line-up of crooks in front of a height chart. Both stop when the page is hidden and respect reduced motion.
(function (root) {
  var PINK = '#ff2d95', TEAL = '#19e3d0', RED = '#ff3b4e', BLUE = '#3b7bff';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.caveReduce = reduce;

  // the skyline is laid out on a 1280 wide board: [x, width, height]
  var BLD = [[0, 70, 250], [70, 90, 320], [160, 60, 220], [220, 100, 360], [320, 70, 270], [390, 80, 390], [470, 90, 250], [560, 70, 310], [630, 100, 370], [730, 70, 240], [800, 90, 340], [890, 80, 280], [970, 100, 380], [1070, 70, 250], [1140, 140, 320]];
  var LOGS = ['> city on alert ... 5 stars', '> 4 suspects in custody', '> 8 still at large', '> searchlight sweep ... ok', '> sirens on 5th street', '> everybody is a suspect'];

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
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) root.cancelAnimationFrame(raf); } else if (on) { raf = root.requestAnimationFrame(tick); } });
  }
  function star(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var rr = i % 2 ? r * 0.4 : r, a = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? 'lineTo' : 'moveTo'](cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
    ctx.closePath();
  }
  function skyline(ctx, base, dim, t) {
    BLD.forEach(function (b, i) {
      ctx.fillStyle = '#07060f'; ctx.fillRect(b[0], base - b[2], b[1], b[2]);
      // windows: most are dark, a few are lit and blink slowly
      for (var y = base - b[2] + 22; y < base - 20; y += 30) for (var x = b[0] + 10; x < b[0] + b[1] - 14; x += 24) {
        var h = (x * 7 + y * 13 + i * 5) % 11;
        if (h > 2) continue;
        var blink = h === 0 && Math.sin(t * 1.3 + x) < -0.55;
        ctx.fillStyle = blink ? 'rgba(255,210,74,.12)' : (h === 1 ? 'rgba(25,227,208,' + dim + ')' : 'rgba(255,210,74,' + dim + ')');
        ctx.fillRect(x, y, 8, 10);
      }
    });
  }

  // ---- the quiet backdrop: night sky, a dim skyline, a faint searchlight ----
  function GridBg(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, fps = o.fps || 10;
    function draw(t) {
      var s = sizeCanvas(cv), W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0c0a18'); g.addColorStop(0.7, '#1a0b30'); g.addColorStop(1, '#3a0f40');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var sc = Math.max(W / 1280, H / 720) * 0.9;
      ctx.setTransform(sc, 0, 0, sc, 0, H - 720 * sc);
      var a = Math.sin(t * 0.35) * 0.18;
      ctx.save(); ctx.translate(330, 720); ctx.rotate(a); ctx.fillStyle = 'rgba(244,238,255,.05)'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-55, -780); ctx.lineTo(55, -780); ctx.lineTo(8, 0); ctx.fill(); ctx.restore();
      skyline(ctx, 720, 0.18, t);
    }
    loop(self, fps, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }

  // ---- the intro ----
  function GridIntro(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, faces = o.faces || [], t0 = 0;
    function draw(t) {
      if (!t0) t0 = t;
      var e = t - t0, s = sizeCanvas(cv), W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0c0a18'); g.addColorStop(0.45, '#24093f'); g.addColorStop(0.72, '#8a1f6a'); g.addColorStop(1, '#ff6a3d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var sc = Math.max(W / 1280, H / 720), ox = (W - 1280 * sc) * 0.5, oy = (H - 720 * sc);
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      ctx.fillStyle = 'rgba(255,138,61,.25)'; ctx.beginPath(); ctx.arc(980, 430, 150, 0, 7); ctx.fill();
      // two searchlights sweeping the sky
      [[300, 0], [760, -3]].forEach(function (L, i) {
        ctx.save(); ctx.translate(L[0], 720); ctx.rotate(Math.sin(e * 0.5 + i * 2 + L[1]) * 0.17);
        ctx.fillStyle = 'rgba(244,238,255,' + (i ? 0.06 : 0.07) + ')'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-45, -820); ctx.lineTo(45, -820); ctx.lineTo(10, 0); ctx.fill(); ctx.restore();
      });
      skyline(ctx, 720, 0.8, e);
      // the street and the siren bar
      ctx.fillStyle = '#07060f'; ctx.fillRect(0, 690, 1280, 30);
      var on = Math.floor(e * 1.6) % 2 === 0;
      ctx.fillStyle = on ? RED : 'rgba(255,59,78,.15)'; ctx.fillRect(0, 690, 640, 30);
      ctx.fillStyle = on ? 'rgba(59,123,255,.15)' : BLUE; ctx.fillRect(640, 690, 640, 30);
      ctx.fillStyle = on ? 'rgba(255,59,78,.10)' : 'rgba(59,123,255,.10)'; ctx.fillRect(0, 0, 1280, 720);
      // the line-up: a height chart and four crooks
      ctx.fillStyle = 'rgba(241,232,212,.16)'; ctx.fillRect(740, 296, 500, 320);
      ctx.strokeStyle = 'rgba(241,232,212,.5)'; ctx.lineWidth = 2;
      for (var y = 300; y <= 600; y += 60) { ctx.beginPath(); ctx.moveTo(740, y); ctx.lineTo(1240, y); ctx.stroke(); }
      ctx.imageSmoothingEnabled = false;
      var xs = [746, 866, 986, 1106], plates = ['0412', '0415', '0416', '0413'];
      xs.forEach(function (x, i) {
        var im = faces[i]; if (im && im.complete && im.naturalWidth) ctx.drawImage(im, x, 396, 118, 118);
        ctx.fillStyle = '#f1e8d4'; ctx.fillRect(x + 14, 526, 90, 28); ctx.fillStyle = '#1a1626'; ctx.font = '600 18px "Special Elite", monospace'; ctx.fillText(plates[i], x + 24, 547);
      });
      // the wanted level fills up star by star, then holds at five
      var lit = Math.min(5, 2 + Math.floor(e / 1.2));
      for (var k = 0; k < 5; k++) { star(ctx, 1030 + k * 42, 70, 17); ctx.fillStyle = k < lit ? PINK : 'rgba(255,255,255,.15)'; ctx.fill(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var v = ctx.createRadialGradient(W * 0.6, H * 0.5, Math.min(W, H) * 0.3, W * 0.6, H * 0.5, Math.max(W, H) * 0.85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,3,12,.7)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    loop(self, o.fps || 30, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }
  GridIntro.LOGS = LOGS;
  GridIntro.create = function (cv, o) { return new GridIntro(cv, o); };

  root.GridBg = GridBg; root.GridIntro = GridIntro;
})(window);
