/* ============================================================
   Núcleo del hub · Tema 1 · Geografía General I (UNED)
   Utilidades, astronomía, máscara de tierras, municipio,
   gráficos, autoevaluación y enrutado de pestañas.
   ============================================================ */
const H = (() => {
  const H = {};
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  H.D2R = D2R; H.R2D = R2D;
  H.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  H.$ = (s, r = document) => r.querySelector(s);
  H.$$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* creación de elementos: H.h('div',{class:'x',onclick:fn}, 'texto', otroNodo) */
  H.h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v === true ? (k.startsWith('aria-') ? 'true' : '') : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  };
  /* plantilla HTML -> nodo */
  H.html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };

  /* ---------- formato (es-ES) ---------- */
  H.f = (x, d = 0) => Number(x).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: true });
  H.fs = (x, d = 0) => (x > 0 ? '+' : x < 0 ? '−' : '') + H.f(Math.abs(x), d);
  H.dms = (deg, pos = 'N', neg = 'S', secs = true) => {
    const s = deg < 0 ? neg : pos; let a = Math.abs(deg);
    let d = Math.floor(a), m = Math.floor((a - d) * 60), sc = Math.round(((a - d) * 60 - m) * 60);
    if (sc === 60) { sc = 0; m++; } if (m === 60) { m = 0; d++; }
    return secs ? `${d}° ${String(m).padStart(2, '0')}′ ${String(sc).padStart(2, '0')}″ ${s}` : `${d}° ${String(Math.round((a - Math.floor(a)) * 60)).padStart(2, '0')}′ ${s}`;
  };
  H.dm = (deg) => { const a = Math.abs(deg); let d = Math.floor(a), m = Math.round((a - d) * 60); if (m === 60) { d++; m = 0; } return `${deg < 0 ? '−' : ''}${d}° ${String(m).padStart(2, '0')}′`; };
  H.hm = (h) => { if (!isFinite(h)) return '—'; let hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh++; mm = 0; } return `${hh} h ${String(mm).padStart(2, '0')} min`; };
  H.clock = (h, sec = false) => {
    if (!isFinite(h)) return '—';
    h = ((h % 24) + 24) % 24; let tot = Math.round(h * (sec ? 3600 : 60));
    if (sec) { const hh = Math.floor(tot / 3600) % 24, mm = Math.floor(tot / 60) % 60, ss = tot % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; }
    const hh = Math.floor(tot / 60) % 24, mm = tot % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };
  H.MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  H.MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  H.fdate = (d) => `${d.getUTCDate()} de ${H.MESES[d.getUTCMonth()]}`;
  H.year = new Date().getFullYear();
  H.dateFromDoy = (doy, year = H.year) => new Date(Date.UTC(year, 0, 1, 12) + (doy - 1) * 864e5);
  H.doyOf = (d) => Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1;
  H.daysInYear = (y = H.year) => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
  H.todayDoy = () => { const n = new Date(); return H.doyOf(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), 12))); };

  /* ---------- constantes físicas (valores actuales) ---------- */
  H.K = {
    eps: 23.4362,           // oblicuidad de la eclíptica (2026), ≈ 23° 26′
    a: 6378.137, b: 6356.752, Rm: 6371.0, f: 1 / 298.257223563, // WGS84 / IUGG
    S0: 1361,               // constante solar (W/m²)
    omega: 7.2921159e-5,    // velocidad angular de rotación (rad/s)
    sidDay: '23 h 56 min 4,09 s', tropYear: '365 d 5 h 48 min 45 s', sidYear: '365 d 6 h 9 min 10 s',
    ecc: 0.0167, AU: 149.598,
  };

  /* ---------- astronomía solar (precisión ~1′, suficiente para docencia) ---------- */
  H.sun = (ms, eps = H.K.eps) => {
    const d = ms / 864e5 + 2440587.5 - 2451545.0;
    const g = (357.529 + 0.98560028 * d) * D2R;
    const q = 280.459 + 0.98564736 * d;
    const L = q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    const R = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
    const e = eps * D2R, Lr = L * D2R;
    const decl = Math.asin(Math.sin(e) * Math.sin(Lr)) * R2D;
    let RA = Math.atan2(Math.cos(e) * Math.sin(Lr), Math.cos(Lr)) * R2D;
    let E = (q - RA) % 360; if (E > 180) E -= 360; if (E < -180) E += 360;
    E = ((E + 540) % 360) - 180;
    return { decl, R, L: ((L % 360) + 360) % 360, eot: 4 * E, d };
  };
  /* semiarco diurno (horas) */
  H.halfDay = (lat, decl, h0 = 0) => {
    const c = (Math.sin(h0 * D2R) - Math.sin(lat * D2R) * Math.sin(decl * D2R)) / (Math.cos(lat * D2R) * Math.cos(decl * D2R));
    if (c <= -1) return 12; if (c >= 1) return 0;
    return Math.acos(c) * R2D / 15;
  };
  H.dayLength = (lat, decl, h0 = 0) => 2 * H.halfDay(lat, decl, h0);
  H.noonAlt = (lat, decl) => 90 - Math.abs(lat - decl);
  H.riseAzimuth = (lat, decl) => { const c = Math.sin(decl * D2R) / Math.cos(lat * D2R); if (c >= 1) return 0; if (c <= -1) return 180; return Math.acos(c) * R2D; };
  H.toaInsolation = (lat, decl, R = 1) => {
    const p = lat * D2R, dd = decl * D2R;
    let c = -Math.tan(p) * Math.tan(dd); c = H.clamp(c, -1, 1);
    const h = Math.acos(c);
    const q = (H.K.S0 / Math.PI) / (R * R) * (h * Math.sin(p) * Math.sin(dd) + Math.cos(p) * Math.cos(dd) * Math.sin(h));
    return Math.max(0, q);
  };
  /* equinoccios, solsticios, perihelio y afelio del año (fechas en UTC) */
  H.events = (year = H.year) => {
    const t0 = Date.UTC(year, 0, 1);
    const Lat = (ms) => H.sun(ms).L;
    const find = (target) => {
      let prev = null;
      for (let h = 0; h < 366 * 24; h += 6) {
        const ms = t0 + h * 36e5; let diff = ((Lat(ms) - target + 540) % 360) - 180;
        if (prev && prev.diff < 0 && diff >= 0) {
          let a = prev.ms, b = ms;
          for (let i = 0; i < 30; i++) { const m = (a + b) / 2; const dm = ((Lat(m) - target + 540) % 360) - 180; if (dm < 0) a = m; else b = m; }
          return new Date((a + b) / 2);
        }
        prev = { ms, diff };
      }
    };
    let minR = { R: 9 }, maxR = { R: 0 };
    for (let h = 0; h < 366 * 24; h += 3) { const ms = t0 + h * 36e5; const R = H.sun(ms).R; if (R < minR.R) minR = { R, ms }; if (R > maxR.R) maxR = { R, ms }; }
    return { mar: find(0), jun: find(90), sep: find(180), dic: find(270), peri: new Date(minR.ms), periR: minR.R, afe: new Date(maxR.ms), afeR: maxR.R };
  };
  H.EV = H.events();
  /* perihelio y afelio verificados (la fórmula simple no recoge el efecto de la Luna, que desplaza la fecha hasta 1–2 días) */
  const PA = { 2026: ['2026-01-03T17:16:00Z', 0.983301, '2026-07-06T17:31:00Z', 1.016643] };
  if (PA[H.year]) { const [p, pr, a, ar] = PA[H.year]; Object.assign(H.EV, { peri: new Date(p), periR: pr, afe: new Date(a), afeR: ar, verified: true }); }

  /* hora oficial en España (UTC+1 / UTC+0 en Canarias, + horario de verano UE) */
  H.lastSunday = (y, m) => { const d = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, d.getUTCDate() - d.getUTCDay(), 1); };
  H.isSummerTime = (ms) => { const y = new Date(ms).getUTCFullYear(); return ms >= H.lastSunday(y, 2) && ms < H.lastSunday(y, 9); };
  H.officialOffset = (place, ms) => {
    if (!place || !place.es) return null;
    return (place.can ? 0 : 1) + (H.isSummerTime(ms) ? 1 : 0);
  };
  H.haversine = (la1, lo1, la2, lo2) => {
    const p1 = la1 * D2R, p2 = la2 * D2R, dp = p2 - p1, dl = (lo2 - lo1) * D2R;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * H.K.Rm * Math.asin(Math.min(1, Math.sqrt(a)));
  };

  /* ---------- máscara de tierras emergidas (equirectangular 0,25°) ---------- */
  const MW = 1440, MH = 720;
  let MASK = null;
  H.buildMask = () => {
    if (MASK) return MASK;
    const c = document.createElement('canvas'); c.width = MW; c.height = MH;
    const x = c.getContext('2d'); x.fillStyle = '#000';
    for (const poly of LAND) {
      for (const off of [-360, 0, 360]) {
        x.beginPath();
        for (const ring of poly) {
          for (let i = 0; i < ring.length; i += 2) {
            const px = (ring[i] + off + 180) * 4, py = (90 - ring[i + 1]) * 4;
            i ? x.lineTo(px, py) : x.moveTo(px, py);
          }
          x.closePath();
        }
        x.fill('evenodd');
      }
    }
    const d = x.getImageData(0, 0, MW, MH).data;
    MASK = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) MASK[i] = d[i * 4 + 3];
    return MASK;
  };
  /* fracción de tierra 0..1 con interpolación bilineal (bordes suaves) */
  H.land = (lat, lon) => {
    const m = MASK || H.buildMask();
    let fx = ((lon + 180) % 360 + 360) % 360 * 4 - 0.5, fy = (90 - lat) * 4 - 0.5;
    if (fy < 0) fy = 0; if (fy > MH - 1) fy = MH - 1;
    const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const xa = (x0 + MW) % MW, xb = (x0 + 1) % MW, y1 = Math.min(MH - 1, y0 + 1);
    const v = m[y0 * MW + xa] * (1 - tx) * (1 - ty) + m[y0 * MW + xb] * tx * (1 - ty) + m[y1 * MW + xa] * (1 - tx) * ty + m[y1 * MW + xb] * tx * ty;
    return v / 255;
  };
  H.COL = { ocean: [207, 224, 234], land: [228, 211, 168], landD: [176, 160, 120], oceanD: [150, 178, 196], ink: '#1c2836', accent: '#b4531d', blue: '#1f6f8b', grid: 'rgba(28,40,54,.22)' };
  H.mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  H.surface = (lat, lon) => H.mix(H.COL.ocean, H.COL.land, H.land(lat, lon));

  /* ---------- canvas adaptativo con alta densidad ---------- */
  H.autoCanvas = (canvas, aspect, draw, opts = {}) => {
    const st = { canvas, ctx: canvas.getContext('2d'), w: 0, h: 0, dpr: 1 };
    const fit = () => {
      const w = Math.max(200, Math.round(canvas.parentElement.clientWidth));
      if (!canvas.parentElement.clientWidth) return false;
      const h = Math.round(typeof aspect === 'function' ? aspect(w) : w * aspect);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== st.w || h !== st.h || dpr !== st.dpr) {
        st.w = w; st.h = h; st.dpr = dpr;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        canvas.style.height = h + 'px';
        st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      return false;
    };
    st.redraw = () => { if (!canvas.parentElement) return; if (!st.w) fit(); if (st.w) { st.ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); draw(st.ctx, st.w, st.h, st); } };
    const attach = () => { if (!canvas.parentElement) return setTimeout(attach, 20); new ResizeObserver(() => { if (fit()) st.redraw(); }).observe(canvas.parentElement); };
    attach();
    st.pos = (e) => { const r = canvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * st.w / r.width, (t.clientY - r.top) * st.h / r.height]; };
    return st;
  };
  /* arrastre con ratón y táctil */
  H.drag = (el, { down, move, up }) => {
    let on = false;
    const dn = (e) => { on = true; down && down(e); if (e.cancelable && e.type === 'touchstart') e.preventDefault(); };
    const mv = (e) => { if (on) { move && move(e); if (e.cancelable && e.type === 'touchmove') e.preventDefault(); } };
    const u = (e) => { if (on) { on = false; up && up(e); } };
    el.addEventListener('mousedown', dn); window.addEventListener('mousemove', mv); window.addEventListener('mouseup', u);
    el.addEventListener('touchstart', dn, { passive: false }); el.addEventListener('touchmove', mv, { passive: false }); el.addEventListener('touchend', u);
  };

  /* ---------- gráfico de líneas genérico ---------- */
  H.chart = (canvas, aspect = 0.42) => {
    const ch = { opts: null, hover: null };
    const P = { l: 54, r: 14, t: 14, b: 38 };
    const st = H.autoCanvas(canvas, aspect, (ctx, w, h) => {
      const o = ch.opts; if (!o) return;
      Object.assign(P, { l: 54, r: 14, t: 14, b: 38 }, o.pad || {});
      ctx.clearRect(0, 0, w, h);
      const X = (v) => P.l + (v - o.xMin) / (o.xMax - o.xMin) * (w - P.l - P.r);
      const Y = (v) => h - P.b - (v - o.yMin) / (o.yMax - o.yMin) * (h - P.t - P.b);
      ch.X = X; ch.Y = Y; ch.P = P; ch.w = w; ch.h = h;
      ctx.font = '11px system-ui,sans-serif'; ctx.textBaseline = 'middle';
      // bandas
      for (const b of o.bands || []) { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), P.t, X(b.x1) - X(b.x0), h - P.t - P.b); }
      // rejilla y
      ctx.strokeStyle = 'rgba(28,40,54,.1)'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right';
      for (const t of o.yTicks || []) { const y = Y(t.v); ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w - P.r, y); ctx.stroke(); ctx.fillText(t.label ?? t.v, P.l - 6, y); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (const t of o.xTicks || []) { const x = X(t.v); ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, h - P.b); ctx.stroke(); ctx.fillText(t.label ?? t.v, x, h - P.b + 5); }
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, h - P.b); ctx.lineTo(w - P.r, h - P.b); ctx.stroke();
      if (o.xLabel) { ctx.fillStyle = '#5a6878'; ctx.fillText(o.xLabel, (P.l + w - P.r) / 2, h - 15); }
      if (o.yLabel) { ctx.save(); ctx.translate(13, (P.t + h - P.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText(o.yLabel, 0, 0); ctx.restore(); }
      // líneas verticales/horizontales de referencia
      for (const v of o.vlines || []) { const x = X(v.x); ctx.strokeStyle = v.color || '#b4531d'; ctx.setLineDash(v.dash || [4, 4]); ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, h - P.b); ctx.stroke(); ctx.setLineDash([]); if (v.label) { ctx.fillStyle = v.color || '#b4531d'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(v.label, x + 3, P.t + 2); } }
      for (const v of o.hlines || []) { const y = Y(v.y); ctx.strokeStyle = v.color || '#888'; ctx.setLineDash(v.dash || [4, 4]); ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w - P.r, y); ctx.stroke(); ctx.setLineDash([]); if (v.label) { ctx.fillStyle = v.color || '#888'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(v.label, w - P.r - 2, y - 2); } }
      // series
      ctx.save(); ctx.beginPath(); ctx.rect(P.l, P.t - 2, w - P.l - P.r, h - P.t - P.b + 4); ctx.clip();
      for (const s of o.series) {
        if (s.fill) { ctx.fillStyle = s.fill; ctx.beginPath(); ctx.moveTo(X(s.pts[0][0]), Y(o.yMin)); for (const p of s.pts) ctx.lineTo(X(p[0]), Y(p[1])); ctx.lineTo(X(s.pts[s.pts.length - 1][0]), Y(o.yMin)); ctx.fill(); }
        ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []); ctx.beginPath();
        let first = true; for (const p of s.pts) { if (p[1] == null || !isFinite(p[1])) { first = true; continue; } first ? ctx.moveTo(X(p[0]), Y(p[1])) : ctx.lineTo(X(p[0]), Y(p[1])); first = false; }
        ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.restore();
      for (const m of o.markers || []) { ctx.fillStyle = m.color || '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), m.r || 5, 0, 7); ctx.fill(); ctx.stroke(); if (m.label) { ctx.fillStyle = m.color || '#b4531d'; ctx.textAlign = m.align || 'left'; ctx.textBaseline = 'bottom'; ctx.font = 'bold 11px system-ui'; ctx.fillText(m.label, X(m.x) + (m.align === 'right' ? -8 : 8), Y(m.y) - 4); ctx.font = '11px system-ui'; } }
      if (o.after) o.after(ctx, X, Y, w, h);
    });
    ch.draw = (o) => { ch.opts = o; st.redraw(); };
    ch.st = st;
    ch.xAt = (e) => { const [x] = st.pos(e); const o = ch.opts; return o.xMin + (x - P.l) / (st.w - P.l - P.r) * (o.xMax - o.xMin); };
    return ch;
  };
  H.monthTicks = () => H.MES3.map((m, i) => ({ v: H.doyOf(new Date(Date.UTC(H.year, i, 15))), label: m }));

  /* ---------- notas de corrección del manual ---------- */
  H.fix = (title, items) => H.html(`<div class="fix"><div class="fh">Corrección respecto al manual${title ? ' · ' + title : ''}</div><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`);
  H.info = (html) => H.html(`<div class="info">${html}</div>`);

  /* ---------- autoevaluación ---------- */
  H.selfCheck = (qs, title = 'Autoevaluación') => {
    const box = H.h('div', { class: 'selfcheck' });
    const score = H.h('span', { class: 'score' }, `0 / ${qs.length}`);
    box.append(H.h('h3', {}, title, score));
    let ok = 0, done = 0;
    qs.forEach((q, i) => {
      const fb = H.h('div', { class: 'fb' });
      const opts = H.h('div', { class: 'opts' });
      q.opts.forEach((o, j) => {
        const b = H.h('button', { class: 'opt', type: 'button', html: `<span class="l">${'abcd'[j]})</span><span>${o}</span>` });
        b.onclick = () => {
          H.$$('.opt', opts).forEach((x, k) => { x.disabled = true; if (k === q.a) x.classList.add('ok'); });
          const good = j === q.a; if (!good) b.classList.add('ko');
          done++; if (good) ok++;
          score.textContent = `${ok} / ${qs.length}`;
          fb.className = 'fb show ' + (good ? 'ok' : 'ko');
          fb.innerHTML = `<b>${good ? 'Correcto.' : 'No es correcto.'}</b>${q.ex}`;
          if (H.onAnswer) H.onAnswer();
        };
        opts.append(b);
      });
      box.append(H.h('div', { class: 'q' }, H.h('div', { class: 'qt', html: `<span class="n">${i + 1}.</span>${q.q}` }), opts, fb));
    });
    const reset = H.h('button', { class: 'btn ghost sm', type: 'button', style: { marginTop: '8px' } }, 'Reiniciar preguntas');
    reset.onclick = () => { const n = H.selfCheck(qs, title); box.replaceWith(n); };
    box.append(reset);
    return box;
  };
  H.openQ = (q, ans) => H.html(`<details class="open-q"><summary>${q}</summary><div class="ans">${ans}</div></details>`);

  /* ---------- municipio (estado global) ---------- */
  const PROVS = MUN.p;
  const CAN = new Set(['Las Palmas', 'Santa Cruz de Tenerife']);
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const MUNI = MUN.m.map(([n, p, la, lo, al]) => ({ name: n, prov: PROVS[p], lat: la, lon: lo, alt: al, es: true, can: CAN.has(PROVS[p]), k: norm(n) }));
  H.MUNI = MUNI;
  H.findMuni = (name) => MUNI.find((m) => m.name === name);
  const DEF = Object.assign({}, H.findMuni('Madrid'), { def: true });
  H.place = DEF;
  try { const s = JSON.parse(localStorage.getItem('geo-place') || localStorage.getItem('t1-place') || 'null'); if (s && isFinite(s.lat)) H.place = s; } catch (e) { }
  const subs = [];
  H.onPlace = (fn) => { subs.push(fn); };
  H.setPlace = (p) => { H.place = p; try { localStorage.setItem('geo-place', JSON.stringify(p)); } catch (e) { } subs.forEach((f) => f(p)); updatePill(); };
  H.placeLabel = (p = H.place) => p.es ? `${p.name}${p.prov && p.prov !== p.name ? ' (' + p.prov + ')' : ''}` : (p.name || 'Punto personalizado');
  const updatePill = () => { const b = H.$('#place-name'); if (b) b.textContent = H.placeLabel() + (H.place.def ? ' · por defecto' : ''); };

  H.searchMuni = (q, n = 10) => {
    const k = norm(q.trim()); if (k.length < 2) return [];
    const a = [], b = [];
    for (const m of MUNI) { const i = m.k.indexOf(k); if (i === 0) a.push(m); else if (i > 0) b.push(m); }
    a.sort((x, y) => x.k.length - y.k.length); b.sort((x, y) => x.k.length - y.k.length);
    return a.concat(b).slice(0, n);
  };
  H.nearestMuni = (lat, lon) => { let best = null, bd = 1e9; for (const m of MUNI) { const d = H.haversine(lat, lon, m.lat, m.lon); if (d < bd) { bd = d; best = m; } } return { m: best, d: bd }; };

  H.openPlacePicker = () => {
    const bg = H.$('#place-modal'); bg.classList.add('show');
    const inp = H.$('#mun-q', bg); inp.value = ''; H.$('#mun-list', bg).innerHTML = ''; H.$('#geo-msg', bg).textContent = '';
    setTimeout(() => inp.focus(), 30);
  };
  const buildModal = () => {
    const bg = H.html(`<div class="modal-bg" id="place-modal" role="dialog" aria-modal="true" aria-labelledby="pm-t">
      <div class="modal">
        <h3 id="pm-t">¿Desde dónde estudias?</h3>
        <p class="small" style="margin-top:0">Varios interactivos (duración del día, altura del Sol, hora solar…) calculan los valores para tu municipio. Escribe su nombre: hay 8.132 municipios españoles.</p>
        <input type="text" id="mun-q" placeholder="p. ej. Logroño, Vigo, Arrecife…" autocomplete="off">
        <ul class="sugg" id="mun-list"></ul>
        <div class="alt">
          <button class="btn ghost sm" id="geo-btn" type="button">📍 Usar mi ubicación</button>
          <div><label class="small">Latitud (°, N +)</label><input type="number" id="c-lat" step="0.01" min="-89.9" max="89.9" placeholder="43,25"></div>
          <div><label class="small">Longitud (°, E +)</label><input type="number" id="c-lon" step="0.01" min="-180" max="180" placeholder="-2,93"></div>
          <button class="btn sm" id="c-ok" type="button">Usar coordenadas</button>
        </div>
        <p class="small" id="geo-msg"></p>
        <div style="text-align:right;margin-top:6px"><button class="btn ghost sm" id="pm-close" type="button">Cerrar</button></div>
      </div></div>`);
    document.body.append(bg);
    const inp = H.$('#mun-q', bg), list = H.$('#mun-list', bg);
    let res = [], sel = 0;
    const render = () => { list.innerHTML = ''; res.forEach((m, i) => { const li = H.h('li', { class: i === sel ? 'sel' : '' }, H.h('span', {}, m.name), H.h('small', {}, `${m.prov} · ${H.f(m.lat, 2)}°, ${H.f(m.lon, 2)}°`)); li.onclick = () => pick(m); list.append(li); }); };
    const pick = (m) => { const { k, ...p } = m; H.setPlace(p); bg.classList.remove('show'); };
    inp.addEventListener('input', () => { res = H.searchMuni(inp.value); sel = 0; render(); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(res.length - 1, sel + 1); render(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); } if (e.key === 'Enter' && res[sel]) pick(res[sel]); if (e.key === 'Escape') bg.classList.remove('show'); });
    H.$('#pm-close', bg).onclick = () => bg.classList.remove('show');
    bg.addEventListener('click', (e) => { if (e.target === bg) bg.classList.remove('show'); });
    H.$('#c-ok', bg).onclick = () => {
      const la = parseFloat(H.$('#c-lat', bg).value), lo = parseFloat(H.$('#c-lon', bg).value);
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) >= 90 || Math.abs(lo) > 180) { H.$('#geo-msg', bg).textContent = 'Introduce una latitud entre −89,9 y 89,9 y una longitud entre −180 y 180.'; return; }
      const nm = H.nearestMuni(la, lo);
      if (nm.d < 8) pick(nm.m); else { H.setPlace({ name: `${H.dm(la)}, ${H.dm(lo)}`, lat: la, lon: lo, es: false }); bg.classList.remove('show'); }
    };
    H.$('#geo-btn', bg).onclick = () => {
      const msg = H.$('#geo-msg', bg);
      if (!navigator.geolocation) { msg.textContent = 'Tu navegador no permite la geolocalización.'; return; }
      msg.textContent = 'Buscando tu posición…';
      navigator.geolocation.getCurrentPosition((p) => {
        const nm = H.nearestMuni(p.coords.latitude, p.coords.longitude);
        if (nm.d < 15) pick(nm.m); else { H.setPlace({ name: `${H.dm(p.coords.latitude)}, ${H.dm(p.coords.longitude)}`, lat: p.coords.latitude, lon: p.coords.longitude, es: false }); bg.classList.remove('show'); }
      }, () => { msg.textContent = 'No se pudo obtener la ubicación (permiso denegado o sin conexión). Escribe el municipio.'; }, { timeout: 10000 });
    };
  };

  /* ---------- pestañas ---------- */
  H.TABS = [];
  H.tab = (def) => H.TABS.push(def);
  H.GROUPS = [['', H.TABS.map((t) => t.id)]];
  H.go = (id) => { location.hash = '#' + id; };
  const show = (id) => {
    const t = H.TABS.find((x) => x.id === id) || H.TABS[0];
    H.$$('section.tab').forEach((s) => s.classList.toggle('active', s.id === 'tab-' + t.id));
    H.$$('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.id === t.id));
    if (!t._init) { t._init = true; t.init(H.$('#tab-' + t.id)); }
    t.show && t.show();
    const btn = H.$(`nav.tabs button[data-id="${t.id}"]`); if (btn) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    window.scrollTo({ top: 0 });
  };
  H.start = () => {
    const nav = H.$('nav.tabs'), main = H.$('main');
    H.GROUPS.forEach(([g, ids0], gi) => {
      const ids = ids0.filter((id) => H.TABS.find((x) => x.id === id)); if (!ids.length) return;
      if (gi) nav.append(H.h('div', { class: 'sep' }));
      const btns = H.h('div', { class: 'grp-btns' });
      ids.forEach((id) => { const t = H.TABS.find((x) => x.id === id); btns.append(H.h('button', { 'data-id': id, role: 'tab', onclick: () => H.go(id) }, t.nav || t.title)); });
      nav.append(H.h('div', { class: 'grp' }, H.h('span', { class: 'grp-name' }, g || ' '), btns));
    });
    for (const t of H.TABS) main.append(H.h('section', { class: 'tab', id: 'tab-' + t.id, role: 'tabpanel' }));
    buildModal();
    H.$('#place-pill').onclick = H.openPlacePicker;
    updatePill();
    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    show(location.hash.slice(1) || 'inicio');
  };
  /* cabecera estándar de pestaña */
  H.intro = (eyebrow, title, lead, ref) => H.html(`<div class="intro"><div><div class="eyebrow">${eyebrow}</div><h2>${title}</h2><p class="lead">${lead}</p></div><div class="ref">${ref}</div></div>`);
  /* control deslizante con salida */
  H.slider = (label, min, max, step, val, fmt, oninput) => {
    const out = H.h('output', {}, fmt(val));
    const inp = H.h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
    inp.addEventListener('input', () => { out.textContent = fmt(+inp.value); oninput(+inp.value); });
    const w = H.h('div', { class: 'ctrl' }, H.h('label', {}, H.h('span', {}, label), out), inp);
    w.set = (v, fire = false) => { inp.value = v; out.textContent = fmt(+inp.value); if (fire) oninput(+inp.value); };
    w.input = inp; return w;
  };
  H.seg = (opts, val, onchange) => {
    const w = H.h('div', { class: 'seg', role: 'group' });
    const btns = opts.map(([v, l]) => { const b = H.h('button', { type: 'button', 'aria-pressed': v === val }, l); b.onclick = () => { btns.forEach((x) => x.setAttribute('aria-pressed', x === b)); onchange(v); }; w.append(b); return b; });
    w.set = (v) => btns.forEach((x, i) => x.setAttribute('aria-pressed', opts[i][0] === v));
    return w;
  };
  H.ro = (k, cls = '') => { const v = H.h('div', { class: 'v' }, '—'); const e = H.h('div', { class: 'ro ' + cls }, H.h('div', { class: 'k' }, k), v); e.v = v; return e; };

  /* ---------- globo ortográfico (render por píxel) ---------- */
  /* rot = {lat0, lon0}; devuelve funciones de proyección e inversa */
  H.ortho = (lat0, lon0) => {
    const p0 = lat0 * D2R, sp0 = Math.sin(p0), cp0 = Math.cos(p0);
    return {
      fwd: (lat, lon) => { const p = lat * D2R, l = (lon - lon0) * D2R; const cosc = sp0 * Math.sin(p) + cp0 * Math.cos(p) * Math.cos(l); return [Math.cos(p) * Math.sin(l), cp0 * Math.sin(p) - sp0 * Math.cos(p) * Math.cos(l), cosc]; },
      inv: (x, y) => { const rho = Math.hypot(x, y); if (rho > 1) return null; const c = Math.asin(rho); const sc = Math.sin(c), cc = Math.cos(c); const lat = rho ? Math.asin(cc * sp0 + y * sc * cp0 / rho) * R2D : lat0; const lon = lon0 + Math.atan2(x * sc, rho * cp0 * cc - y * sp0 * sc) * R2D; return [lat, ((lon + 540) % 360) - 180]; },
    };
  };
  return H;
})();
