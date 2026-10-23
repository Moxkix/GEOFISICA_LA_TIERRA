/* ============================================================
   Tema 6 · utilidades: los climas «zonales» del manual a partir
   de los tipos de Köppen, capas derivadas del mapa mundial de
   TerraClimate (mes más cálido y más frío, precipitación, meses
   secos), datos polares de ERA5, biomas, climogramas con ficha,
   balance hídrico de Thornthwaite, pasos del Sol por el cenit e
   isolíneas en cualquier proyección.
   Reutiliza KG (koppen.js), T2, T3, T4 y T5 (common5.js).
   ============================================================ */
const T6 = (() => {
  const T = {};
  const D2R = H.D2R;

  /* ---------- datos propios del tema (comprimidos como en el Tema 4) ---------- */
  T.DATA = () => ({ POLAR: typeof POLAR !== 'undefined' ? POLAR : null, BIOMAS: typeof BIOMAS !== 'undefined' ? BIOMAS : null });
  const walk = async (o) => {
    if (!o || typeof o !== 'object' || ArrayBuffer.isView(o)) return o;
    if (typeof o.z === 'string') return T4.unz(o);
    for (const k of Object.keys(o)) o[k] = await walk(o[k]);
    return o;
  };
  const prevStart = H.start;
  H.start = () => {
    if (typeof DecompressionStream === 'undefined') return prevStart();
    Promise.all(Object.values(T.DATA()).map(walk)).then(prevStart).catch((err) => {
      console.error(err);
      document.querySelector('main').innerHTML = `<div class="card"><h3>No se han podido cargar los datos</h3><p class="small">${err}</p></div>`;
    });
  };

  /* ---------- los climas zonales del manual ---------- */
  /* clave → nombre, nombre corto, zona, tipo de Köppen de referencia (color) y pestaña */
  T.ZON = {
    ecu: { n: 'Ecuatorial (de selva tropical)', s: 'Ecuatorial', z: 'calida', k: 'Af', tab: 'intertropicales' },
    mzn: { n: 'Monzónico', s: 'Monzónico', z: 'calida', k: 'Am', tab: 'intertropicales' },
    sab: { n: 'Tropical con estación seca (de sabana)', s: 'Tropical (sabana)', z: 'calida', k: 'Aw', tab: 'intertropicales' },
    sec: { n: 'Seco: estepa y desierto (azonal, Tema 5)', s: 'Seco (azonal)', z: 'azonal', k: 'BSh', tab: 'T5' },
    chi: { n: 'Chino (subtropical húmedo)', s: 'Chino', z: 'templada', k: 'Cfa', tab: 'subtropicales' },
    med: { n: 'Mediterráneo', s: 'Mediterráneo', z: 'templada', k: 'Csa', tab: 'subtropicales' },
    cw: { n: 'Templado de invierno seco, de altura', s: 'Templado de altura', z: 'templada', k: 'Cwb', tab: 'subtropicales' },
    oce: { n: 'Oceánico', s: 'Oceánico', z: 'templada', k: 'Cfb', tab: 'oceanico' },
    con: { n: 'Continental húmedo', s: 'Continental', z: 'templada', k: 'Dfb', tab: 'oceanico' },
    sba: { n: 'Subártico (de bosque boreal)', s: 'Subártico', z: 'templada', k: 'Dfc', tab: 'oceanico' },
    tun: { n: 'Tundra', s: 'Tundra', z: 'fria', k: 'ET', tab: 'polares' },
    hie: { n: 'Hielo perpetuo', s: 'Hielo perpetuo', z: 'fria', k: 'EF', tab: 'polares' },
  };
  T.KEYS = Object.keys(T.ZON);
  T.TABNAME = { mosaico: 'El mosaico zonal', intertropicales: 'Climas intertropicales', subtropicales: 'Mediterráneo y chino', oceanico: 'Oceánico y continental', polares: 'Climas polares', vegetacion: 'Vegetación y suelos', identifica: 'Identifica el clima' };
  T.ZONA = { calida: 'Zona cálida (intertropical)', templada: 'Zona templada (latitudes medias)', fria: 'Zona fría (polar)', azonal: 'Climas azonales' };
  T.zonal = (t) => {
    if (!t) return null;
    const g = t[0];
    if (g === 'A') return t === 'Af' ? 'ecu' : t === 'Am' ? 'mzn' : 'sab';
    if (g === 'B') return 'sec';
    if (g === 'E') return t === 'EF' ? 'hie' : 'tun';
    if (g === 'C') return t[1] === 's' ? 'med' : t === 'Cfa' || t === 'Cwa' ? 'chi' : t[1] === 'w' ? 'cw' : 'oce';
    return t[2] === 'a' || t[2] === 'b' ? 'con' : 'sba';
  };
  const OWN = { sec: [232, 196, 130], cw: [150, 185, 130], con: [170, 145, 225] }; // colores propios donde los de Köppen se confunden
  T.col = (key) => OWN[key] || KG.COL[T.ZON[key].k];
  T.css = (key) => `rgb(${T.col(key).join(',')})`;
  T.ink = (key) => { const c = T.col(key); return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 150 ? '#1c2836' : '#fff'; };
  T.chip = (key, txt) => `<span class="kchip zchip" style="background:${T.css(key)};color:${T.ink(key)}">${txt || T.ZON[key].s}</span>`;
  /* leyenda de climas zonales agrupada por zonas; onPick(key) resalta uno */
  T.legend = (onPick, isOn = () => false, keys = T.KEYS) => {
    const box = H.h('div', { class: 'zleg' });
    for (const z of ['calida', 'templada', 'fria', 'azonal']) {
      const ks = keys.filter((k) => T.ZON[k].z === z); if (!ks.length) continue;
      box.append(H.h('span', { class: 'zg' }, T.ZONA[z]));
      ks.forEach((k) => { const b = H.h('button', { type: 'button', class: isOn(k) ? 'on' : '', title: T.ZON[k].n, html: `<i style="background:${T.css(k)}"></i>${T.ZON[k].s}` }); b.onclick = () => onPick && onPick(k); box.append(b); });
    }
    return box;
  };
  /* ficha breve: tipo de Köppen + clima zonal */
  T.both = (t) => `${T5.chip(t)} ${T.chip(T.zonal(t))}`;

  /* ---------- capas derivadas del mapa mundial (TerraClimate 1991-2020, 0,5°) ---------- */
  T.W = () => T5.DATA().KMUNDO;
  let LAY = null;
  T.layers = () => {
    if (LAY) return LAY;
    const W = T.W(); if (!W || !W.T) return null;
    const N = W.nx * W.ny, warm = new Float32Array(N), cold = new Float32Array(N), pann = new Float32Array(N), pdry = new Float32Array(N), dry60 = new Uint8Array(N), wet = new Int8Array(N);
    for (let k = 0; k < N; k++) {
      let mx = -999, mn = 999, s = 0, dmin = 1e9, n60 = 0, imx = -1, pmx = -1;
      for (let m = 0; m < 12; m++) {
        const t = W.T[m][k], p = W.P[m][k];
        if (t > mx) mx = t; if (t < mn) mn = t; s += p; if (p < dmin) dmin = p; if (p < 60) n60++; if (p > pmx) { pmx = p; imx = m; }
      }
      if (!(mx > -999) || mx !== mx) { warm[k] = cold[k] = pann[k] = pdry[k] = NaN; wet[k] = -1; continue; }
      warm[k] = mx; cold[k] = mn; pann[k] = s; pdry[k] = dmin; dry60[k] = n60; wet[k] = imx;
    }
    LAY = { warm, cold, pann, pdry, dry60, wet, W };
    return LAY;
  };
  /* capa de tipos (código 1…30) con los criterios vigentes y su clima zonal */
  const CAT = {};
  T.K = (per = '91') => T.W().K[per][T5.combo()];
  T.cats = (per = '91') => {
    const key = per + '|' + T5.combo(); if (CAT[key]) return CAT[key];
    const K = T.K(per), c = new Int8Array(K.length).fill(-1);
    for (let k = 0; k < K.length; k++) { const v = K[k]; if (v > 0) c[k] = T.KEYS.indexOf(T.zonal(KG.CODES[Math.round(v) - 1])); }
    return (CAT[key] = c);
  };
  T.idx = (lat, lon) => {
    const W = T.W(); const j = Math.floor((W.lat0 - lat) / W.res), i = ((Math.floor((lon - W.lon0) / W.res) % W.nx) + W.nx) % W.nx;
    return j < 0 || j >= W.ny ? -1 : j * W.nx + i;
  };
  T.typeAt = (lat, lon, per = '91') => { const k = T.idx(lat, lon); if (k < 0) return null; const v = T.K(per)[k]; return v > 0 ? KG.CODES[Math.round(v) - 1] : null; };
  T.catAt = (lat, lon) => { const t = T.typeAt(lat, lon); return t ? T.zonal(t) : null; };

  /* ---------- estadísticos de un climograma ---------- */
  /* p: {ta|T, pr|P, lat}; devuelve amplitud, % de lluvia de mayo-agosto (o de noviembre-febrero en el sur), meses secos… */
  T.stats = (Tm, Pm, lat) => {
    const s = KG.stats(Tm, Pm, lat), su4 = lat >= 0 ? [4, 5, 6, 7] : [10, 11, 0, 1];
    const pSum = s.Pann > 0 ? s.Psum / s.Pann * 100 : 0, p4 = s.Pann > 0 ? su4.reduce((a, i) => a + Pm[i], 0) / s.Pann * 100 : 0;
    return Object.assign(s, { amp: s.Tmax - s.Tmin, pSum, p4, gaussen: Pm.filter((p, i) => p < 2 * Tm[i]).length, dry60: Pm.filter((p) => p < 60).length });
  };
  /* ficha de climograma: título, canvas y línea de tipo; c = {T, P, lat, title, sub} */
  T.climoCard = (opts = {}) => {
    const box = H.h('div', { class: 'ccard' });
    const cv = H.h('canvas'), cl = T3.climo(cv, opts.aspect || ((w) => Math.min(w * 0.62, 260)));
    const info = H.h('div', { class: 'cc-info' });
    box.append(H.h('div', { class: 'viz framed' }, cv), info);
    box.set = (c) => {
      if (!c) { info.innerHTML = '<p class="small">Sin datos.</p>'; return; }
      const r = KG.classify(c.T, c.P, c.lat, T5.opt), s = T.stats(c.T, c.P, c.lat);
      cl.draw(T5.asStation(c.T, c.P, c.lat), { title: c.title, sub: c.sub || '', marks: c.marks });
      info.innerHTML = `<div class="cc-type">${T.both(r.type)}</div>
        <div class="cc-num">${T5.fT(s.Tann)} · ${H.f(s.Pann)} mm · amplitud ${H.f(s.amp, 1)} °C${c.extra ? ' · ' + c.extra(s) : ''}</div>`;
      box.res = r; box.st = s;
    };
    return box;
  };
  /* datos de una estación de las normales OMM en formato {T, P, lat, title, sub} */
  T.fromSt = (s, sub) => (s ? { T: s.ta.slice(0, 12), P: s.pr.slice(0, 12), lat: s.lat, lon: s.lon, title: T5.stLabel(s), sub: sub || `${H.f(s.elev)} m · ${T4.latName(s.lat)} · OMM 1991-2020`, st: s } : null);
  T.st = (id) => T5.byId(id);
  /* celda del mapa mundial en el mismo formato */
  T.fromCell = (c, title) => (c ? { T: c.T, P: c.P, lat: c.lat, lon: c.lon, title: title || T4.ll(c.lat, c.lon, 1), sub: (c.Z != null && c.Z === c.Z ? `altitud media ${H.f(Math.max(0, c.Z))} m · ` : '') + 'TerraClimate 1991-2020' } : null);

  /* ---------- pasos del Sol por el cenit (días del año en que la declinación iguala la latitud) ---------- */
  T.zenith = (lat) => {
    if (Math.abs(lat) > H.K.eps) return [];
    const out = []; let prev = null;
    for (let d = 1; d <= 366; d++) {
      const decl = H.sun(H.dateFromDoy(d).getTime()).decl, v = decl - lat;
      if (prev != null && Math.sign(v) !== Math.sign(prev.v)) out.push(prev.d + prev.v / (prev.v - v));
      prev = { d, v };
    }
    return out; // días del año (fraccionarios)
  };
  T.doyToMonth = (d) => { const dt = H.dateFromDoy(Math.round(d)); return dt.getUTCMonth() + (dt.getUTCDate() - 0.5) / new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate(); };

  /* ---------- balance hídrico de Thornthwaite (reserva útil del suelo, 100 mm por defecto) ---------- */
  T.thornthwaite = (Tm, Pm, lat, cap = 100) => {
    const I = Tm.reduce((s, t) => s + (t > 0 ? Math.pow(t / 5, 1.514) : 0), 0);
    const a = 6.75e-7 * I ** 3 - 7.71e-5 * I ** 2 + 1.792e-2 * I + 0.49239;
    const DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const etp = Tm.map((t, m) => {
      let e = t <= 0 ? 0 : t >= 26.5 ? -415.85 + 32.24 * t - 0.43 * t * t : 16 * Math.pow(10 * t / I, a);
      const decl = H.sun(H.dateFromDoy(T2.MID[m]).getTime()).decl, N = H.dayLength(lat, decl);
      return Math.max(0, e * (N / 12) * (DAYS[m] / 30));
    });
    // reserva: se recorre el año dos veces para partir de un estado de equilibrio
    let R = cap; const out = [];
    for (let pass = 0; pass < 2; pass++) for (let m = 0; m < 12; m++) {
      const p = Pm[m], e = etp[m]; let etr, def = 0, exc = 0, dR;
      if (p >= e) { const R1 = Math.min(cap, R + (p - e)); exc = p - e - (R1 - R); dR = R1 - R; R = R1; etr = e; }
      else { const tk = Math.min(R, e - p); dR = -tk; R -= tk; etr = p + tk; def = e - etr; } // método directo: el suelo cede su reserva hasta agotarla
      if (pass === 1) out.push({ m, p, etp: e, etr, def, exc, R, dR });
    }
    const sum = (k) => out.reduce((s, o) => s + o[k], 0);
    return { months: out, ETP: sum('etp'), ETR: sum('etr'), DEF: sum('def'), EXC: sum('exc'), I };
  };

  /* ---------- isolíneas de una rejilla en cualquier proyección ---------- */
  /* g = {data, nx, ny, lon0, lat0, res}; proj(lat, lon) → [x, y] o null (cara oculta) */
  T.contourProj = (ctx, g, L, proj, style = {}) => {
    const { nx, ny, data: F } = g, lonAt = (i) => g.lon0 + (i + 0.5) * g.res, latAt = (j) => g.lat0 - (j + 0.5) * g.res;
    ctx.save(); ctx.strokeStyle = style.color || '#1c2836'; ctx.lineWidth = style.width || 1.6; ctx.setLineDash(style.dash || []);
    ctx.beginPath();
    const P = (fi, fj) => proj(g.lat0 - (fj + 0.5) * g.res, g.lon0 + (fi + 0.5) * g.res);
    const wrap = Math.abs(nx * g.res - 360) < 1e-6;
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - (wrap ? 0 : 1); i++) {
      const i1 = (i + 1) % nx;
      const a = F[j * nx + i], b = F[j * nx + i1], c = F[(j + 1) * nx + i1], d = F[(j + 1) * nx + i];
      if (!(a === a && b === b && c === c && d === d)) continue;
      const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0); if (k === 0 || k === 15) continue;
      const t = (p, q) => (L - p) / (q - p);
      const top = [i + t(a, b), j], right = [i + 1, j + t(b, c)], bot = [i + t(d, c), j + 1], left = [i, j + t(a, d)];
      const S = { 1: [[left, bot]], 2: [[bot, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bot, right]], 6: [[top, bot]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bot]], 10: [[top, right], [left, bot]], 11: [[top, right]], 12: [[left, right]], 13: [[bot, right]], 14: [[left, bot]] }[k];
      for (const [p, q] of S) { const A = P(p[0], p[1]), B = P(q[0], q[1]); if (!A || !B) continue; ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }
      void lonAt; void latAt;
    }
    ctx.stroke(); ctx.restore();
  };

  /* ---------- biomas (RESOLVE Ecoregions 2017) ---------- */
  T.BIOME = {
    1: ['Bosques tropicales húmedos', [16, 110, 50]], 2: ['Bosques tropicales secos', [150, 165, 60]], 3: ['Bosques tropicales de coníferas', [90, 150, 70]],
    4: ['Bosques templados de frondosas y mixtos', [70, 170, 110]], 5: ['Bosques templados de coníferas', [40, 115, 95]], 6: ['Bosque boreal (taiga)', [60, 110, 150]],
    7: ['Sabanas y herbazales tropicales', [225, 190, 80]], 8: ['Praderas y estepas templadas', [240, 220, 150]], 9: ['Sabanas inundables', [120, 180, 200]],
    10: ['Herbazales de montaña', [185, 150, 200]], 11: ['Tundra', [175, 205, 220]], 12: ['Bosque y matorral mediterráneo', [205, 120, 60]],
    13: ['Desiertos y matorrales xerófilos', [244, 200, 160]], 14: ['Manglares', [200, 40, 60]], 98: ['Roca y hielo', [235, 240, 245]],
  };
  T.biomeName = (v) => (T.BIOME[v] ? T.BIOME[v][0] : T.BIOME[98][0]);
  T.biomeCol = (v) => (T.BIOME[v] ? T.BIOME[v][1] : T.BIOME[98][1]);

  /* ---------- etiquetas sin solapes: items = [{x, y, t, bold}]; prueba cuatro posiciones y omite las que no caben ---------- */
  T.labels = (ctx, items, box, font = '10.5px system-ui') => {
    const placed = [];
    for (const it of items) {
      ctx.font = (it.bold ? 'bold ' : '') + font; const tw = ctx.measureText(it.t).width;
      for (const [dx, dy, al] of [[7, -6, 'left'], [-7, -6, 'right'], [7, 7, 'left'], [-7, 7, 'right'], [0, -13, 'center']]) {
        const bx = al === 'left' ? it.x + dx : al === 'right' ? it.x + dx - tw : it.x - tw / 2, by = it.y + dy - 7;
        if (box && (bx < box[0] || bx + tw > box[2] || by < box[1] || by + 13 > box[3])) continue;
        if (placed.some(([ax, ay, aw]) => bx < ax + aw + 3 && bx + tw + 3 > ax && by < ay + 13 && by + 13 > ay)) continue;
        placed.push([bx, by, tw]);
        if (it.bg) { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(bx - 2, by, tw + 4, 13); }
        ctx.fillStyle = it.color || '#1c2836'; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(it.t, it.x + dx, it.y + dy); break;
      }
    }
  };

  /* ---------- formato ---------- */
  T.pct = (v, d = 0) => H.f(v, d) + ' %';
  T.minus = (s) => String(s).replace(/-/g, '−');
  return T;
})();
