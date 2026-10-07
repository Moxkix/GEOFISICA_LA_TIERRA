/* ============================================================
   Tema 2 · utilidades compartidas: estaciones, atmósfera tipo,
   humedad, radiación, ciclo diario y armónicos.
   ============================================================ */
const T2 = (() => {
  const T = {};
  const D2R = H.D2R;

  /* ---------- estaciones (normales OMM 1991-2020) ---------- */
  const tenth = (a) => (a ? a.map((v) => (v == null ? null : v / 10)) : null);
  T.ST = ST.s.map(([id, name, country, lat, lon, elev, cat, ta, tx, tn]) => ({ id, name, country, lat, lon, elev, cat, es: country === 'España', ta: tenth(ta), tx: tenth(tx), tn: tenth(tn) }));
  T.CATS = { es: 'España', ecu: 'Ecuatorial', mon: 'Ecuatorial de montaña', tro: 'Tropical', mzn: 'Monzónico', des: 'Desértico / árido', med: 'Mediterráneo', sbt: 'Subtropical húmedo', oce: 'Oceánico', sub: 'Subpolar oceánico', con: 'Continental', sba: 'Subártico', pol: 'Polar' };
  T.byId = (id) => T.ST.find((s) => s.id === id);
  T.nearest = (lat, lon, spainOnly = true) => {
    let best = null, bd = 1e9;
    for (const s of T.ST) { if (spainOnly && !s.es) continue; const d = H.haversine(lat, lon, s.lat, s.lon); if (d < bd) { bd = d; best = s; } }
    return { s: best, d: bd };
  };
  T.myStation = () => T.nearest(H.place.lat, H.place.lon, !!H.place.es);
  T.stLabel = (s) => `${s.name}${s.es || s.name.startsWith(s.country) ? '' : ' (' + s.country + ')'}`;
  T.stationSelect = (value, onchange, opts = {}) => {
    const sel = H.h('select', { 'aria-label': 'Estación' });
    const groups = {};
    for (const s of T.ST) { const g = s.es ? 'España' : T.CATS[s.cat]; (groups[g] = groups[g] || []).push(s); }
    const order = ['España', 'Ecuatorial', 'Ecuatorial de montaña', 'Tropical', 'Desértico / árido', 'Mediterráneo', 'Subtropical húmedo', 'Oceánico', 'Subpolar oceánico', 'Continental', 'Subártico', 'Polar'];
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
  T.amp = (s) => Math.max(...s.ta.slice(0, 12)) - Math.min(...s.ta.slice(0, 12));
  T.MID = [15, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]; // día central de cada mes

  /* ---------- primer armónico: día del máximo y amplitud ---------- */
  T.harmonic = (vals, days) => {
    let a = 0, b = 0; const n = vals.length;
    vals.forEach((v, i) => { const w = 2 * Math.PI * days[i] / 365; a += v * Math.cos(w); b += v * Math.sin(w); });
    a *= 2 / n; b *= 2 / n;
    let ph = Math.atan2(b, a); if (ph < 0) ph += 2 * Math.PI;
    return { amp: Math.hypot(a, b), dayMax: ph / (2 * Math.PI) * 365 };
  };
  /* insolación diaria en el techo de la atmósfera (W/m²) para el día central de cada mes */
  T.monthlyTOA = (lat) => T.MID.map((d) => { const s = H.sun(H.dateFromDoy(d).getTime()); return H.toaInsolation(lat, s.decl, s.R); });

  /* ---------- atmósfera: perfiles tipo ---------- */
  /* Nodos [altitud geométrica km, T en K]. Latitudes medias = Atmósfera Estándar EE. UU. 1976;
     resto: perfiles tipo AFGL (Anderson et al., 1986), aproximados. */
  const UP = [[86, 186.87], [91, 186.87], [100, 195.08], [110, 240], [120, 360]];
  T.PROFILES = {
    std: { name: 'Latitudes medias (atmósfera estándar)', o3: 22, pts: [[0, 288.15], [11.02, 216.65], [20.06, 216.65], [32.16, 228.65], [47.35, 270.65], [51.41, 270.65], [71.8, 214.65], ...UP] },
    tro: { name: 'Trópicos', o3: 26, pts: [[0, 299.7], [17, 195], [20, 203], [32, 230], [47, 270], [51, 270], [71.8, 215], ...UP] },
    saw: { name: 'Subártico, invierno', o3: 18, pts: [[0, 257.2], [1, 259.1], [8.5, 218], [25, 213], [47, 260], [52, 260], [71.8, 213], ...UP] },
    sas: { name: 'Subártico, verano', o3: 19, pts: [[0, 287], [10, 225], [23, 225], [47, 277], [51, 277], [71.8, 216], ...UP] },
  };
  const g0 = 9.80665, Rd = 287.05;
  const cache = {};
  T.atmTable = (key) => {
    if (cache[key]) return cache[key];
    const pts = T.PROFILES[key].pts, dz = 0.05, N = Math.round(120 / dz) + 1;
    const z = new Float64Array(N), Tk = new Float64Array(N), P = new Float64Array(N);
    let j = 0;
    for (let i = 0; i < N; i++) {
      const zz = i * dz; z[i] = zz;
      while (j < pts.length - 2 && zz > pts[j + 1][0]) j++;
      const [z0, t0] = pts[j], [z1, t1] = pts[j + 1];
      Tk[i] = t0 + (t1 - t0) * (zz - z0) / (z1 - z0);
      if (i === 0) P[i] = 101325; else { const tm = (Tk[i] + Tk[i - 1]) / 2; P[i] = P[i - 1] * Math.exp(-g0 * dz * 1000 / (Rd * tm)); }
    }
    // estratopausa: máximo entre 40 y 60 km; mesopausa: mínimo entre 75 y 95 km
    let trop = 0, strat = 0, meso = 0;
    // tropopausa (criterio OMM simplificado): primer nivel por encima de 5 km con gradiente menor de 2 °C/km
    for (let i = Math.round(5 / dz); i < N - 1; i++) if ((Tk[i] - Tk[i + 1]) / dz < 2) { trop = z[i]; break; }
    let mx = -1; for (let i = Math.round(40 / dz); i <= Math.round(60 / dz); i++) if (Tk[i] > mx) { mx = Tk[i]; strat = z[i]; }
    let mn = 1e9; for (let i = Math.round(75 / dz); i <= Math.round(95 / dz); i++) if (Tk[i] < mn) { mn = Tk[i]; meso = z[i]; }
    // la estratopausa y la mesopausa son mesetas: se toma su punto medio
    const plateau = (z0, test) => { let a = z0, b = z0; while (a > 0 && test(Math.round((a - dz) / dz))) a -= dz; while (b < 120 && test(Math.round((b + dz) / dz))) b += dz; return (a + b) / 2; };
    strat = plateau(strat, (i) => Math.abs(Tk[i] - mx) < 0.01);
    meso = plateau(meso, (i) => Math.abs(Tk[i] - mn) < 0.01);
    return (cache[key] = { z, T: Tk, P, dz, trop, strat, meso });
  };
  T.atmAt = (key, zkm) => {
    const t = T.atmTable(key), i = Math.max(0, Math.min(t.z.length - 1, Math.round(zkm / t.dz)));
    const Tk = t.T[i], P = t.P[i];
    return { T: Tk, P, rho: P / (Rd * Tk), mass: 1 - P / 101325, trop: t.trop, strat: t.strat, meso: t.meso };
  };
  T.layerName = (key, zkm) => {
    const t = T.atmTable(key);
    if (zkm < t.trop) return 'Troposfera'; if (zkm < t.strat) return 'Estratosfera'; if (zkm < t.meso) return 'Mesosfera'; return 'Termosfera';
  };

  /* ---------- humedad ---------- */
  /* Presión de vapor de saturación (hPa), fórmula de Magnus (OMM, 2018): sobre agua (T ≥ 0) y sobre hielo (T < 0) */
  T.es = (t) => (t >= 0 ? 6.112 * Math.exp(17.62 * t / (243.12 + t)) : 6.112 * Math.exp(22.46 * t / (272.62 + t)));
  /* Humedad absoluta de saturación (g/m³) */
  T.rhoSat = (t) => T.es(t) * 100 / (461.5 * (t + 273.15)) * 1000;
  T.rhoV = (e, t) => e * 100 / (461.5 * (t + 273.15)) * 1000;
  /* temperatura de rocío para una humedad absoluta dada (g/m³), por bisección */
  T.dewPointRho = (rho) => { let a = -60, b = 50; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (T.rhoSat(m) > rho) b = m; else a = m; } return (a + b) / 2; };
  T.Rv = 461.5; T.Rd = Rd;

  /* ---------- radiación ---------- */
  T.SIGMA = 5.670374e-8;
  T.planck = (lamUm, Tk) => { const l = lamUm * 1e-6, h = 6.62607015e-34, c = 2.99792458e8, k = 1.380649e-23; return 2 * h * c * c / (l ** 5) / (Math.exp(h * c / (l * k * Tk)) - 1); };
  T.bandFraction = (Tk, a, b) => { // fracción de la emisión de un cuerpo negro entre a y b µm
    const f = (x) => T.planck(x, Tk); let s = 0, tot = 0;
    for (let x = 0.05; x < 1000; x *= 1.002) { const dx = x * 0.002, v = f(x) * dx; tot += v; if (x >= a && x < b) s += v; }
    return s / tot;
  };
  T.LANGLEY = 0.48426; // 1 cal/cm²·día = 0,484 W/m²

  /* ---------- ciclo diario (modelo de Parton y Logan, 1981, adaptado) ---------- */
  /* t: hora solar; rise/set: orto y ocaso en hora solar; lag: desfase de la máxima respecto al mediodía (h) */
  T.daily = (t, tmin, tmax, rise, set, lag = 2.5, b = 2.2) => {
    const D = set - rise;
    if (D >= 23.9 || D <= 0.1) { // día o noche polar: onda simple
      const amp = (tmax - tmin) / 2; return (tmax + tmin) / 2 + amp * Math.cos(2 * Math.PI * (t - 12 - lag) / 24);
    }
    const day = (tt) => { const m = tt - rise; const per = 2 * (12 + lag - rise); return tmin + (tmax - tmin) * Math.sin(Math.PI * m / per); };
    const Tset = day(set), N = 24 - D;
    const night = (n) => tmin + (Tset - tmin) * (Math.exp(-b * n / N) - Math.exp(-b)) / (1 - Math.exp(-b));
    t = ((t % 24) + 24) % 24;
    if (t >= rise && t <= set) return day(t);
    const n = t > set ? t - set : t + 24 - set;
    return night(n);
  };
  /* radiación global aproximada con cielo despejado (W/m²): Meinel con masa de aire de Kasten y Young */
  T.clearSky = (lat, decl, tSolar) => {
    const H0 = (tSolar - 12) * 15 * D2R, p = lat * D2R, d = decl * D2R;
    const cz = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H0);
    if (cz <= 0) return 0;
    const z = Math.acos(cz) / D2R, am = 1 / (cz + 0.50572 * Math.pow(96.07995 - z, -1.6364));
    return 1361 * 1.1 * cz * Math.pow(0.7, Math.pow(am, 0.678)) ;
  };

  /* ---------- color de temperatura ---------- */
  const TS = [[-50, [44, 27, 107]], [-35, [43, 78, 162]], [-20, [63, 143, 197]], [-8, [140, 200, 214]], [0, [226, 238, 226]], [8, [236, 232, 176]], [16, [246, 205, 118]], [23, [240, 150, 70]], [30, [200, 70, 45]], [38, [110, 15, 26]]];
  T.tColor = (t) => {
    if (t <= TS[0][0]) return TS[0][1]; if (t >= TS[TS.length - 1][0]) return TS[TS.length - 1][1];
    for (let i = 1; i < TS.length; i++) if (t <= TS[i][0]) { const u = (t - TS[i - 1][0]) / (TS[i][0] - TS[i - 1][0]); return H.mix(TS[i - 1][1], TS[i][1], u); }
  };
  T.tCss = (t) => `rgb(${T.tColor(t).map(Math.round).join(',')})`;
  T.legendBar = (min, max, step, w = 300) => {
    const c = H.h('canvas', { width: w, height: 12, style: { width: '100%', maxWidth: w + 'px', height: '12px', borderRadius: '3px', display: 'block' } });
    const x = c.getContext('2d'); for (let i = 0; i < w; i++) { x.fillStyle = T.tCss(min + (max - min) * i / (w - 1)); x.fillRect(i, 0, 1, 12); }
    const lab = H.h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--muted)', maxWidth: w + 'px' } });
    for (let v = min; v <= max + 1e-9; v += step) lab.append(H.h('span', {}, H.f(v) + '°'));
    return H.h('div', { class: 'tlegend' }, c, lab);
  };

  /* ---------- formato ---------- */
  T.fT = (v, d = 1) => (v == null || !isFinite(v) ? '—' : H.f(v, d).replace('-', '−') + ' °C');
  T.fNum = (v, d = 1) => (v == null || !isFinite(v) ? '—' : H.f(v, d).replace('-', '−'));
  return T;
})();
