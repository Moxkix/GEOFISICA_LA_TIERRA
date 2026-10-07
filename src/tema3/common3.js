/* ============================================================
   Tema 3 · utilidades: estaciones con precipitación, rejillas,
   mapas (costas, isolíneas, flechas de viento), escalas de color
   y física del aire que asciende.
   Reutiliza T2 (common2.js): humedad, color de temperatura, estaciones.
   ============================================================ */
const T3 = (() => {
  const T = {};
  const D2R = H.D2R;

  /* ---------- estaciones: precipitación y tensión de vapor ---------- */
  const tenth = (a) => (a ? a.map((v) => (v == null ? null : v / 10)) : null);
  T.ST = T2.ST;
  ST.s.forEach((r, i) => { T.ST[i].pr = tenth(r[10]); T.ST[i].vp = tenth(r[11]); });
  T.byId = T2.byId;
  T.nearestPr = (lat, lon, spainOnly = true) => {
    let best = null, bd = 1e9;
    for (const s of T.ST) { if (!s.pr || (spainOnly && !s.es)) continue; const d = H.haversine(lat, lon, s.lat, s.lon); if (d < bd) { bd = d; best = s; } }
    return { s: best, d: bd };
  };
  T.myStation = () => T.nearestPr(H.place.lat, H.place.lon, !!H.place.es);
  T.stLabel = T2.stLabel;
  T.stationSelect = (value, onchange, filter = (s) => s.pr) => {
    const sel = H.h('select', { 'aria-label': 'Estación' });
    const groups = {};
    for (const s of T.ST) { if (!filter(s)) continue; const g = s.es ? 'España' : T2.CATS[s.cat]; (groups[g] = groups[g] || []).push(s); }
    const order = ['España', 'Ecuatorial', 'Ecuatorial de montaña', 'Tropical', 'Monzónico', 'Desértico / árido', 'Mediterráneo', 'Subtropical húmedo', 'Oceánico', 'Subpolar oceánico', 'Continental', 'Subártico', 'Polar'];
    for (const g of order) {
      if (!groups[g]) continue;
      const og = H.h('optgroup', { label: g === 'España' ? 'España' : 'Mundo · ' + g });
      groups[g].sort((a, b) => a.name.localeCompare(b.name, 'es')).forEach((s) => og.append(H.h('option', { value: s.id, selected: s.id === value }, T.stLabel(s))));
      sel.append(og);
    }
    sel.onchange = () => onchange(T.byId(sel.value));
    sel.set = (id) => { sel.value = id; };
    return sel;
  };

  /* ---------- altitud del municipio (si la tabla de altitudes está disponible) ---------- */
  T.placeAlt = () => {
    if (H.place.alt != null) return H.place.alt;
    const m = H.place.es && H.findMuni(H.place.name);
    return m && m.alt != null ? m.alt : null;
  };

  /* ---------- rejillas codificadas ----------
     cadena: base64 de int16 little-endian (valor = entero × scale)
     objeto {q, o, s, f}: base64 de uint8 cuantificado; f = 'sq' → valor = s·q², si no → o + s·q */
  T.dec = (b64, scale = 1) => {
    if (typeof b64 === 'object') {
      const bin = atob(b64.q), n = bin.length, a = new Float32Array(n), o = b64.o || 0, s = b64.s;
      if (b64.f === 'sq') for (let i = 0; i < n; i++) { const q = bin.charCodeAt(i); a[i] = s * q * q; }
      else for (let i = 0; i < n; i++) a[i] = o + s * bin.charCodeAt(i);
      return a;
    }
    const bin = atob(b64), n = bin.length >> 1, a = new Float32Array(n);
    for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v > 32767) v -= 65536; a[i] = v * scale; }
    return a;
  };
  /* rejilla con celdas centradas: lon0/lat0 = esquina superior izquierda */
  T.grid = (data, nx, ny, lon0, lat0, res, wrap = false) => {
    const g = { data, nx, ny, lon0, lat0, res, wrap };
    g.lonAt = (i) => lon0 + (i + 0.5) * res; g.latAt = (j) => lat0 - (j + 0.5) * res;
    g.get = (i, j) => data[j * nx + i];
    g.at = (lat, lon) => {
      let fx = (lon - lon0) / res - 0.5; const fy = H.clamp((lat0 - lat) / res - 0.5, 0, ny - 1);
      if (wrap) fx = ((fx % nx) + nx) % nx; else fx = H.clamp(fx, 0, nx - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = wrap ? (x0 + 1) % nx : Math.min(nx - 1, x0 + 1), y1 = Math.min(ny - 1, y0 + 1), u = fx - x0, v = fy - y0;
      return data[y0 * nx + x0] * (1 - u) * (1 - v) + data[y0 * nx + x1] * u * (1 - v) + data[y1 * nx + x0] * (1 - u) * v + data[y1 * nx + x1] * u * v;
    };
    return g;
  };
  /* remuestrea una rejilla a otra más fina (interpolación bilineal) para suavizar isolíneas */
  T.refine = (g, k = 2) => {
    const nx = g.nx * k, ny = g.ny * k, res = g.res / k, d = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) d[j * nx + i] = g.at(g.lat0 - (j + 0.5) * res, g.lon0 + (i + 0.5) * res);
    return T.grid(d, nx, ny, g.lon0, g.lat0, res, g.wrap);
  };

  /* ---------- proyección de un recuadro lon/lat ---------- */
  /* bbox = [lonW, lonE, latS, latN]; en mapas regionales se corrige la escala por cos(latitud media) */
  T.proj = (bbox, w, h) => {
    const [a, b, c, d] = bbox;
    const X = (lon) => (lon - a) / (b - a) * w, Y = (lat) => (d - lat) / (d - c) * h;
    return { X, Y, inv: (x, y) => [d - y / h * (d - c), a + x / w * (b - a)], bbox, w, h };
  };
  T.aspect = (bbox, regional = true) => { const [a, b, c, d] = bbox; return (d - c) / ((b - a) * (regional ? Math.cos((c + d) / 2 * D2R) : 1)); };

  /* ---------- costas ---------- */
  T.drawCoast = (ctx, P, opts = {}) => {
    ctx.save(); ctx.strokeStyle = opts.color || 'rgba(28,40,54,.65)'; ctx.lineWidth = opts.width || 0.9; ctx.beginPath();
    if (opts.regional && typeof COAST !== 'undefined' && COAST) {
      for (const r of COAST) { for (let i = 0; i < r.length; i += 2) { const x = P.X(r[i]), y = P.Y(r[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } }
    } else {
      for (const poly of LAND) for (const ring of poly) { let pl = null; for (let i = 0; i < ring.length; i += 2) { const lon = ((ring[i] + 540) % 360) - 180, x = P.X(lon), y = P.Y(ring[i + 1]); if (pl == null || Math.abs(lon - pl) > 180) ctx.moveTo(x, y); else ctx.lineTo(x, y); pl = lon; } }
    }
    ctx.stroke(); ctx.restore();
  };
  /* relleno de tierra y mar con la máscara de 0,25° */
  T.landRaster = (P, w, h, colFn) => {
    const RW = Math.min(720, Math.round(w)), RH = Math.max(1, Math.round(RW * h / w)), img = new ImageData(RW, RH);
    for (let j = 0; j < RH; j++) for (let i = 0; i < RW; i++) {
      const [lat, lon] = P.inv((i + 0.5) * w / RW, (j + 0.5) * h / RH); const c = colFn(lat, lon);
      const k = (j * RW + i) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
    }
    const cv = document.createElement('canvas'); cv.width = RW; cv.height = RH; cv.getContext('2d').putImageData(img, 0, 0); return cv;
  };
  T.graticule = (ctx, P, step = 10, opts = {}) => {
    const [a, b, c, d] = P.bbox; ctx.save(); ctx.strokeStyle = opts.color || 'rgba(28,40,54,.15)'; ctx.lineWidth = 0.7; ctx.setLineDash(opts.dash || [2, 3]);
    ctx.fillStyle = 'rgba(28,40,54,.55)'; ctx.font = '9.5px system-ui';
    for (let lon = Math.ceil(a / step) * step; lon <= b; lon += step) { const x = P.X(lon); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, P.h); ctx.stroke(); if (opts.labels) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(Math.abs(lon) + '°' + (lon < 0 ? 'O' : lon > 0 ? 'E' : ''), x, P.h - 2); } }
    for (let lat = Math.ceil(c / step) * step; lat <= d; lat += step) { const y = P.Y(lat); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(P.w, y); ctx.stroke(); if (opts.labels) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(Math.abs(lat) + '°' + (lat < 0 ? 'S' : lat > 0 ? 'N' : ''), 3, y); } }
    ctx.restore();
  };

  /* ---------- isolíneas (cuadrados en marcha) con etiquetas sin solapes ---------- */
  T.contour = (ctx, g, levels, P, o = {}) => {
    const { nx, ny } = g, F = g.data, labels = o.labelsOut || [];
    const cx = (i) => P.X(g.lonAt(i)), cy = (j) => P.Y(g.latAt(j));
    const TARGETS = o.targets || [0.2, 0.75, 0.45, 0.9, 0.05, 0.6];
    levels.forEach((L, li) => {
      const st = o.style ? o.style(L) : {}; ctx.strokeStyle = st.color || o.color || 'rgba(28,40,54,.75)'; ctx.lineWidth = st.width || o.width || 1; ctx.setLineDash(st.dash || []);
      ctx.beginPath(); const cand = []; const tx = P.w * TARGETS[li % TARGETS.length];
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = F[j * nx + i], b = F[j * nx + i + 1], c = F[(j + 1) * nx + i + 1], d = F[(j + 1) * nx + i];
        if (!isFinite(a + b + c + d)) continue;
        const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0); if (k === 0 || k === 15) continue;
        const t = (p, q) => (L - p) / (q - p);
        const top = [i + t(a, b), j], right = [i + 1, j + t(b, c)], bot = [i + t(d, c), j + 1], left = [i, j + t(a, d)];
        const S = { 1: [[left, bot]], 2: [[bot, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bot, right]], 6: [[top, bot]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bot]], 10: [[top, right], [left, bot]], 11: [[top, right]], 12: [[left, right]], 13: [[bot, right]], 14: [[left, bot]] }[k];
        for (const [p, q] of S) { const px = cx(p[0]), py = cy(p[1]); ctx.moveTo(px, py); ctx.lineTo(cx(q[0]), cy(q[1])); if (o.label !== false) cand.push([px, py, Math.abs(px - tx)]); }
      }
      ctx.stroke(); ctx.setLineDash([]);
      if (o.label !== false && cand.length) {
        cand.sort((u, v) => u[2] - v[2]);
        const avoid = o.avoid || []; // recuadros [x, y, semiancho, semialto] que las etiquetas no deben tapar
        const ok = cand.find(([x, y]) => x > 22 && x < P.w - 22 && y > 10 && y < P.h - 10 && labels.every(([[lx, ly]]) => Math.abs(lx - x) > 38 || Math.abs(ly - y) > 16) && avoid.every(([ax, ay, hw, hh]) => Math.abs(ax - x) > hw + 19 || Math.abs(ay - y) > hh + 7));
        if (ok) labels.push([[ok[0], ok[1]], L]);
      }
    });
    if (o.label !== false && !o.labelsOut) T.drawLabels(ctx, labels, o.fmt);
    return labels;
  };
  T.drawLabels = (ctx, labels, fmt = (L) => H.f(L)) => {
    ctx.save(); ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [[x, y], L] of labels) { const t = fmt(L); const tw = ctx.measureText(t).width + 5; ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(x - tw / 2, y - 6.5, tw, 13); ctx.fillStyle = '#1c2836'; ctx.fillText(t, x, y); }
    ctx.restore();
  };

  /* ---------- flechas de viento ---------- */
  /* ug, vg: rejillas (m/s); step en grados; escala en px por m/s; las flechas siguen la dirección del viento en el mapa */
  T.arrows = (ctx, ug, vg, P, o = {}) => {
    const [a, b, c, d] = P.bbox, step = o.step || 5, sc = o.scale || 2.2, kx = P.w / (b - a), ky = P.h / (d - c);
    ctx.save(); ctx.strokeStyle = o.color || 'rgba(28,40,54,.85)'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = o.width || 1.1;
    for (let lat = c + step / 2; lat < d; lat += step) for (let lon = a + step / 2; lon < b; lon += step) {
      const u = ug.at(lat, lon), v = vg.at(lat, lon), sp = Math.hypot(u, v); if (!isFinite(sp) || sp < (o.min || 0.3)) continue;
      // dirección en píxeles (corrige la distinta escala de x e y)
      let dx = u / Math.cos(lat * D2R) * kx, dy = -v * ky; const n = Math.hypot(dx, dy); dx /= n; dy /= n;
      const L = Math.min(o.maxLen || 26, (o.base || 4) + sp * sc), x = P.X(lon), y = P.Y(lat);
      const x0 = x - dx * L / 2, y0 = y - dy * L / 2, x1 = x + dx * L / 2, y1 = y + dy * L / 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const hs = Math.min(5, 2 + L * 0.18); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - dx * hs - dy * hs * 0.6, y1 - dy * hs + dx * hs * 0.6); ctx.lineTo(x1 - dx * hs + dy * hs * 0.6, y1 - dy * hs - dx * hs * 0.6); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- escalas de color ---------- */
  const ramp = (stops) => (v) => {
    if (v <= stops[0][0]) return stops[0][1]; if (v >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const u = (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); return H.mix(stops[i - 1][1], stops[i][1], u); }
  };
  T.pColor = ramp([[984, [55, 70, 150]], [996, [96, 140, 200]], [1006, [182, 210, 232]], [1013, [246, 244, 236]], [1020, [246, 212, 168]], [1028, [228, 150, 96]], [1038, [178, 64, 46]]]);
  /* precipitación anual (mm) en escala casi logarítmica */
  T.rColor = ramp([[0, [246, 239, 220]], [150, [240, 228, 190]], [300, [218, 228, 170]], [600, [160, 206, 140]], [1000, [92, 172, 120]], [1700, [42, 140, 160]], [2600, [40, 90, 170]], [4000, [70, 50, 150]], [6000, [60, 20, 90]]]);
  T.t5Color = ramp([[-32, [70, 40, 130]], [-26, [55, 95, 185]], [-20, [120, 185, 215]], [-16, [226, 238, 226]], [-12, [240, 210, 130]], [-8, [230, 130, 70]], [-4, [190, 60, 45]]]);
  T.css = (c) => `rgb(${c.map(Math.round).join(',')})`;
  T.legend = (fn, min, max, ticks, fmt, w = 300) => {
    const c = H.h('canvas', { width: w, height: 12, style: { width: '100%', maxWidth: w + 'px', height: '12px', borderRadius: '3px', display: 'block' } });
    const x = c.getContext('2d'); for (let i = 0; i < w; i++) { x.fillStyle = T.css(fn(min + (max - min) * i / (w - 1))); x.fillRect(i, 0, 1, 12); }
    const lab = H.h('div', { style: { position: 'relative', height: '16px', fontSize: '.75rem', color: 'var(--muted)', maxWidth: w + 'px' } });
    for (const t of ticks) { const f = (t - min) / (max - min); lab.append(H.h('span', { style: { position: 'absolute', left: (f * 100) + '%', transform: `translateX(${f < 0.02 ? 0 : f > 0.98 ? -100 : -50}%)`, whiteSpace: 'nowrap' } }, fmt(t))); }
    return H.h('div', { class: 'tlegend' }, c, lab);
  };

  /* ---------- física del aire húmedo ---------- */
  const Rd = 287.05, Rv = 461.5, EPS = Rd / Rv, CP = 1004.6, G = 9.80665;
  T.esW = (t) => 6.112 * Math.exp(17.62 * t / (243.12 + t)); // sobre agua (hPa)
  T.mixing = (e, p) => EPS * e / (p - e); // kg/kg
  T.tdFromE = (e) => { const l = Math.log(e / 6.112); return 243.12 * l / (17.62 - l); };
  T.tdFromHR = (t, hr) => T.tdFromE(T.esW(t) * hr / 100);
  T.hr = (t, td) => 100 * T.esW(td) / T.esW(t);
  T.Lv = (t) => 2.501e6 - 2370 * t;
  /* gradiente adiabático húmedo (°C por km) a temperatura t (°C) y presión p (hPa) */
  T.malr = (t, p) => { const Tk = t + 273.15, rs = T.mixing(T.esW(t), p), L = T.Lv(t); return G * (1 + L * rs / (Rd * Tk)) / (CP + L * L * rs * EPS / (Rd * Tk * Tk)) * 1000; };
  T.DALR = G / CP * 1000; // 9,76 °C/km
  T.pStd = (z, p0 = 1013.25) => p0 * Math.pow(1 - 0.0065 * z / 288.15, 5.255);
  T.espy = (t, td) => 125 * (t - td); // altura aproximada del nivel de condensación (m)
  /* ascenso de una burbuja: devuelve perfiles cada dz metros */
  T.parcel = ({ t0, td0, z0 = 0, zTop = 12000, dz = 20, p0 = 1013.25, rain = 0 }) => {
    const out = { z: [], t: [], td: [], cond: [], p: [], lcl: null, tLcl: null };
    let t = t0, w = T.mixing(T.esW(td0), T.pStd(z0, p0)), cond = 0, sat = false;
    for (let z = z0; z <= zTop + 1e-6; z += dz) {
      const p = T.pStd(z, p0), ws = T.mixing(T.esW(t), p);
      if (!sat && w >= ws) { sat = true; out.lcl = z; out.tLcl = t; }
      let td;
      if (sat) { const wsNew = ws; cond += Math.max(0, w - wsNew); w = Math.min(w, wsNew); td = t; }
      else { const e = w * p / (EPS + w); td = T.tdFromE(e); }
      out.z.push(z); out.t.push(t); out.td.push(td); out.cond.push(cond * 1000); out.p.push(p);
      t -= (sat ? T.malr(t, p) : T.DALR) * dz / 1000;
    }
    out.w0 = T.mixing(T.esW(td0), T.pStd(z0, p0)) * 1000;
    return out;
  };
  /* densidad del aire (kg/m³) para convertir g/kg en g/m³ */
  T.rho = (t, p) => p * 100 / (Rd * (t + 273.15));

  /* ---------- precipitación: estadísticos de una estación ---------- */
  T.seasons = (s) => { // DEF, MAM, JJA, SON (en el hemisferio sur se rotulan con su estación)
    const p = s.pr; const S = [p[11] + p[0] + p[1], p[2] + p[3] + p[4], p[5] + p[6] + p[7], p[8] + p[9] + p[10]];
    const names = s.lat >= 0 ? ['invierno', 'primavera', 'verano', 'otoño'] : ['verano', 'otoño', 'invierno', 'primavera'];
    return S.map((v, i) => ({ v, name: names[i], pct: v / p[12] * 100 }));
  };
  T.dryMonths = (s) => s.ta ? s.pr.slice(0, 12).filter((p, i) => p < 2 * s.ta[i]).length : null; // criterio de Gaussen (P < 2T)
  T.regime = (s) => {
    const p = s.pr.slice(0, 12), tot = s.pr[12], lat = Math.abs(s.lat);
    const S = T.seasons(s), sum = S.find((x) => x.name === 'verano'), win = S.find((x) => x.name === 'invierno');
    const maxS = S.reduce((a, b) => (b.v > a.v ? b : a));
    const sorted = [...p].sort((a, b) => b - a), top5 = sorted.slice(0, 5).reduce((a, b) => a + b, 0) / tot;
    // máximos relativos (con meses vecinos circulares)
    const peaks = p.map((v, i) => v > p[(i + 11) % 12] && v >= p[(i + 1) % 12] && v > 0.08 * tot ? i : -1).filter((i) => i >= 0);
    if (tot < 250) return { key: 'arido', name: 'Árido', why: `Menos de 250 mm al año; el máximo, escaso, llega en ${maxS.name}.` };
    if (lat < 23.5 || (s.cat === 'mzn')) {
      const sig = peaks.filter((i) => p[i] > 0.1 * tot);
      if (sig.length >= 2 && lat < 10 && Math.min(...p) > 0.02 * tot) return { key: 'ecuatorial', name: 'Ecuatorial', why: `Dos máximos (${sig.map((i) => H.MES3[i]).join(' y ')}), cerca de los equinoccios, y ningún mes realmente seco.` };
      if (top5 > 0.75 && Math.max(...p) > 300) return { key: 'monzonico', name: 'Monzónico', why: `Los cinco meses más lluviosos reúnen el ${H.f(top5 * 100)} % del total, con más de 300 mm en el mes máximo.` };
      return { key: 'tropical', name: 'Tropical', why: `Una estación lluviosa (los cinco meses más húmedos suman el ${H.f(top5 * 100)} %) y otra seca, más larga cuanto más lejos del ecuador.` };
    }
    if (sum.pct < 12 && Math.min(p[5], p[6], p[7], p[11], p[0], p[1]) < 20) return { key: 'mediterraneo', name: 'Mediterráneo', why: `Verano seco: solo el ${H.f(sum.pct)} % de la lluvia cae en verano; el máximo llega en ${maxS.name}.` };
    if (sum.pct >= 33) return { key: 'continental', name: 'Continental', why: `Máximo de verano (${H.f(sum.pct)} % del total), por la inestabilidad convectiva de la estación cálida.` };
    return { key: 'oceanico', name: 'Oceánico', why: `Lluvia repartida todo el año (verano ${H.f(sum.pct)} %, invierno ${H.f(win.pct)} %), con máximo en ${maxS.name}.` };
  };

  /* ---------- climograma (barras de precipitación y línea de temperatura, P = 2T) ---------- */
  T.climo = (canvas, aspect = 0.55) => {
    const c = { s: null, o: {} };
    const st = H.autoCanvas(canvas, typeof aspect === 'function' ? aspect : (w) => w * aspect, (ctx, w, h) => {
      const s = c.s, o = c.o; if (!s) return;
      const P = { l: o.small ? 30 : 46, r: o.small ? 26 : 42, t: o.title ? 22 : 10, b: o.small ? 18 : 26 };
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      // escala de Gaussen (10 °C = 20 mm); por encima de 100 mm, escala reducida si hace falta
      const PM = Math.max(...s.pr.slice(0, 12)), comp = PM > 200, PMr = Math.ceil(PM / 100) * 100;
      const top = comp ? 200 : Math.max(100, Math.ceil(PM / 50) * 50);
      const map = (v) => (!comp || v <= 100 ? v : 100 + (v - 100) / (PMr - 100) * 100);
      const tmin = s.ta ? Math.min(0, Math.floor(Math.min(...s.ta.slice(0, 12)) / 5) * 5) : 0;
      const pw = (w - P.l - P.r) / 12, ylo = tmin < 0 ? tmin * 2 : 0, Yv = (u) => h - P.b - (u - ylo) / (top - ylo) * (h - P.t - P.b);
      ctx.font = (o.small ? 9 : 10.5) + 'px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.08)';
      const ticks = comp ? [0, 50, 100, 150, 200] : Array.from({ length: Math.floor(top / (top > 150 ? 50 : 25)) + 1 }, (_, i) => i * (top > 150 ? 50 : 25));
      for (const u of ticks) {
        const y = Yv(u); ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w - P.r, y); ctx.stroke();
        const pv = comp && u > 100 ? 100 + (u - 100) / 100 * (PMr - 100) : u;
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1f6f8b'; ctx.fillText(H.f(pv), P.l - 4, y);
        if (u <= 100) { ctx.textAlign = 'left'; ctx.fillStyle = '#b0393a'; ctx.fillText(u / 2 + '°', w - P.r + 4, y); }
      }
      if (tmin < 0) for (let v = -10; v >= tmin; v -= 10) { ctx.textAlign = 'left'; ctx.fillStyle = '#b0393a'; ctx.fillText(v + '°', w - P.r + 4, Yv(v * 2)); }
      if (comp) { ctx.strokeStyle = 'rgba(31,111,139,.6)'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(P.l, Yv(100)); ctx.lineTo(w - P.r, Yv(100)); ctx.stroke(); ctx.setLineDash([]); if (!o.small) { ctx.fillStyle = '#1f6f8b'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('por encima de 100 mm, escala reducida', P.l + 4, Yv(100) - 2); } }
      // barras
      s.pr.slice(0, 12).forEach((v, i) => {
        const dry = s.ta && v < 2 * s.ta[i];
        ctx.fillStyle = dry ? 'rgba(212,160,90,.85)' : 'rgba(31,111,139,.78)'; const x = P.l + i * pw + pw * 0.12, y = Yv(map(v));
        ctx.fillRect(x, y, pw * 0.76, Yv(0) - y);
      });
      // temperatura
      if (s.ta) { ctx.strokeStyle = '#b0393a'; ctx.lineWidth = o.small ? 1.8 : 2.4; ctx.beginPath(); s.ta.slice(0, 12).forEach((t, i) => { const x = P.l + (i + 0.5) * pw, y = Yv(t * 2); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1; }
      ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, Yv(ylo)); ctx.lineTo(w - P.r, Yv(ylo)); ctx.lineTo(w - P.r, P.t); ctx.stroke();
      if (ylo < 0) { ctx.strokeStyle = 'rgba(28,40,54,.4)'; ctx.beginPath(); ctx.moveTo(P.l, Yv(0)); ctx.lineTo(w - P.r, Yv(0)); ctx.stroke(); }
      ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const ml = o.small ? 'EFMAMJJASOND'.split('') : H.MES3;
      ml.forEach((m, i) => ctx.fillText(m, P.l + (i + 0.5) * pw, Yv(ylo) + 4));
      if (o.title) { ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(o.title, P.l, 4); ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.fillText(o.sub || '', w - P.r, 5); }
    });
    c.draw = (s, o = {}) => { c.s = s; c.o = o; st.redraw(); };
    c.st = st;
    return c;
  };

  /* ---------- meteograma: cielo y precipitación, temperatura, presión y viento ---------- */
  /* d = { t: [horas], T, Td, p, dir (grados de procedencia), spd (km/h), pr (mm/h), sky: [texto], xTicks, cursor, marks:[{t,label,color}] } */
  T.meteogram = (canvas) => {
    const m = { d: null };
    const st = H.autoCanvas(canvas, (w) => Math.min(Math.max(w * 0.62, 360), 520), (ctx, w, h) => {
      const d = m.d; if (!d) return;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const L = 52, R = 14, t0 = d.t[0], t1 = d.t[d.t.length - 1], X = (t) => L + (t - t0) / (t1 - t0) * (w - L - R);
      const rows = [[0.02, 0.2, 'Precip.'], [0.24, 0.5, '°C'], [0.54, 0.78, 'hPa'], [0.82, 0.93, 'Viento']].map(([a, b, n]) => ({ y0: a * h, y1: b * h, n }));
      ctx.font = '10.5px system-ui';
      for (const tk of d.xTicks || []) { const x = X(tk.v); ctx.strokeStyle = tk.major ? 'rgba(28,40,54,.25)' : 'rgba(28,40,54,.08)'; ctx.beginPath(); ctx.moveTo(x, rows[0].y0); ctx.lineTo(x, rows[3].y1); ctx.stroke(); if (tk.label) { ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(tk.label, x, rows[3].y1 + 4); } }
      for (const mk of d.marks || []) { const x = X(mk.t); ctx.strokeStyle = mk.color || '#b0393a'; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, rows[0].y0); ctx.lineTo(x, rows[3].y1); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; ctx.fillStyle = mk.color || '#b0393a'; ctx.textAlign = mk.align || 'left'; ctx.textBaseline = 'top'; ctx.font = 'bold 10.5px system-ui'; ctx.fillText(mk.label, x + (mk.align === 'right' ? -3 : 3), rows[1].y0 + 2); ctx.font = '10.5px system-ui'; }
      const panel = (r, vals, col, lo, hi, step, fmt, fill, dash) => {
        const Y = (v) => r.y1 - (v - lo) / (hi - lo) * (r.y1 - r.y0);
        ctx.strokeStyle = 'rgba(28,40,54,.12)'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        if (step) for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(w - R, Y(v)); ctx.stroke(); ctx.fillText(fmt(v), L - 5, Y(v)); }
        if (fill) { ctx.fillStyle = col; vals.forEach((v, i) => { if (v > 0.01) { const x = X(d.t[i]), bw = Math.max(1.5, (w - L - R) / d.t.length * 0.8); ctx.fillRect(x - bw / 2, Y(Math.min(v, hi)), bw, r.y1 - Y(Math.min(v, hi))); } }); return; }
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash || []); ctx.beginPath(); let f = true; vals.forEach((v, i) => { if (v == null) { f = true; return; } const x = X(d.t[i]), y = Y(v); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; }); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      };
      rows.forEach((r) => { ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.strokeRect(L, r.y0, w - L - R, r.y1 - r.y0); ctx.save(); ctx.translate(12, (r.y0 + r.y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(r.n, 0, 0); ctx.restore(); });
      const pmax = Math.max(1, Math.ceil(Math.max(...d.pr) * 1.1));
      panel(rows[0], d.pr, 'rgba(31,111,139,.8)', 0, pmax, pmax > 6 ? Math.ceil(pmax / 3) : 1, (v) => H.f(v), true);
      if (d.sky) { ctx.fillStyle = '#1c2836'; ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; let last = '', lx = -1e9; d.sky.forEach((s, i) => { const x = X(d.t[i]); if (s && s !== last && x - lx > 40) { ctx.fillText(s, x + 2, rows[0].y0 + 3); last = s; lx = x; } }); }
      const all = [...d.T, ...(d.Td || [])].filter((v) => v != null), tl = Math.floor(Math.min(...all) / 5) * 5, th = Math.ceil(Math.max(...all) / 5) * 5 + 1;
      if (d.Td) panel(rows[1], d.Td, '#2d7a4c', tl, th, null, null, false, [5, 3]);
      panel(rows[1], d.T, '#b0393a', tl, th, th - tl > 20 ? 10 : 5, (v) => v + '°');
      const pl = Math.floor(Math.min(...d.p) / 4) * 4, ph = Math.ceil((Math.max(...d.p) + 0.5) / 4) * 4;
      panel(rows[2], d.p, '#1c2836', pl, ph, ph - pl > 24 ? 8 : 4, (v) => H.f(v));
      const r = rows[3], ym = (r.y0 + r.y1) / 2, n = d.t.length, every = Math.max(1, Math.round(n / 24));
      for (let i = 0; i < n; i += every) { const a = (d.dir[i] + 180) * H.D2R, sp = d.spd[i], Ln = Math.min(13, 4 + sp / 6), x = X(d.t[i]), dx = Math.sin(a) * Ln, dy = -Math.cos(a) * Ln; ctx.strokeStyle = sp > 50 ? '#b0393a' : '#1c2836'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - dx, ym - dy); ctx.lineTo(x + dx, ym + dy); ctx.stroke(); const an = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(x + dx, ym + dy); ctx.lineTo(x + dx - 5 * Math.cos(an - 0.5), ym + dy - 5 * Math.sin(an - 0.5)); ctx.lineTo(x + dx - 5 * Math.cos(an + 0.5), ym + dy - 5 * Math.sin(an + 0.5)); ctx.fill(); }
      ctx.lineWidth = 1;
      if (d.cursor != null) { const x = X(d.cursor); ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, rows[0].y0); ctx.lineTo(x, rows[3].y1); ctx.stroke(); ctx.lineWidth = 1; }
      if (d.legend) { ctx.font = '10.5px system-ui'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; let x = L + 6; for (const [c, t, dsh] of d.legend) { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(dsh || []); ctx.beginPath(); ctx.moveTo(x, rows[1].y1 - 9); ctx.lineTo(x + 16, rows[1].y1 - 9); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#1c2836'; ctx.fillText(t, x + 20, rows[1].y1 - 9); x += 28 + ctx.measureText(t).width; } ctx.lineWidth = 1; }
      m.X = X; m.t0 = t0; m.t1 = t1; m.L = L; m.R = R;
    });
    m.draw = (d) => { m.d = d; st.redraw(); };
    m.st = st;
    m.tAt = (e) => { const [x] = st.pos(e); return m.t0 + (x - m.L) / (st.w - m.L - m.R) * (m.t1 - m.t0); };
    return m;
  };

  /* ---------- formato ---------- */
  T.fP = (v, d = 1) => (v == null || !isFinite(v) ? '—' : H.f(v, d) + ' hPa');
  T.fMM = (v, d = 0) => (v == null || !isFinite(v) ? '—' : H.f(v, d) + ' mm');
  T.fT = T2.fT;
  T.dirName = (deg) => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'][Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
  /* dirección de donde viene el viento (grados) a partir de u y v */
  T.windFrom = (u, v) => ((Math.atan2(-u, -v) * 180 / Math.PI) + 360) % 360;
  return T;
})();
