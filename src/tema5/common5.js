/* ============================================================
   Tema 5 · utilidades: criterios de Köppen compartidos por todas
   las pestañas, estaciones con su tipo climático, etiquetas de
   tipo, traza de la clasificación, datos de TerraClimate (mundo,
   España y municipios) y del paleoclima.
   Reutiliza KG (koppen.js), T2, T3 y T4.
   ============================================================ */
const T5 = (() => {
  const T = {};

  /* ---------- datos comprimidos (mismo formato que el Tema 4) ---------- */
  T.DATA = () => ({ KMUNDO: typeof KMUNDO !== 'undefined' ? KMUNDO : null, KES: typeof KES !== 'undefined' ? KES : null,
    LGMR: typeof LGMR !== 'undefined' ? LGMR : null, HADCRUT: typeof HADCRUT !== 'undefined' ? HADCRUT : null });
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

  /* ---------- criterios de la clasificación, comunes a todo el hub ---------- */
  T.opt = Object.assign({}, KG.DEF);
  try { const s = JSON.parse(localStorage.getItem('t5-opt') || 'null'); if (s && (s.cd === 0 || s.cd === -3)) Object.assign(T.opt, s); } catch (e) { }
  const subs = [], ctrls = [];
  T.onOpt = (fn) => subs.push(fn);
  T.setOpt = (o) => {
    Object.assign(T.opt, o); try { localStorage.setItem('t5-opt', JSON.stringify(T.opt)); } catch (e) { }
    ctrls.forEach((c) => c.sync()); subs.forEach((f) => f(T.opt));
  };
  T.isDefault = () => T.opt.cd === KG.DEF.cd && T.opt.sMm === KG.DEF.sMm && T.opt.arid === KG.DEF.arid;
  /* índice de la combinación de criterios en las capas precalculadas de los mapas (0…7) */
  T.combo = (o = T.opt) => (o.cd === 0 ? 4 : 0) + (o.sMm === 40 ? 2 : 0) + (o.arid === 'peel' ? 1 : 0);
  /* panel plegable con los tres criterios discutibles */
  T.optCtrl = () => {
    const a = H.seg([[-3, '−3 °C (manual)'], [0, '0 °C']], T.opt.cd, (v) => T.setOpt({ cd: v }));
    const b = H.seg([[30, '30 mm (manual)'], [40, '40 mm']], T.opt.sMm, (v) => T.setOpt({ sMm: v }));
    const c = H.seg([['patton', 'Fórmula del manual'], ['peel', 'Por tramos']], T.opt.arid, (v) => T.setOpt({ arid: v }));
    const tag = H.h('span', { class: 'badge' });
    const box = H.h('details', { class: 'optbox' }, H.h('summary', {}, 'Criterios de la clasificación ', tag),
      H.h('div', { class: 'optgrid' },
        H.h('div', {}, H.h('div', { class: 'k' }, 'Límite entre C y D (mes más frío)'), a, H.h('p', { class: 'small' }, 'Köppen (1936) y el manual usan −3 °C; muchos mapas actuales (Peel y otros, 2007; Beck y otros, 2018), 0 °C.')),
        H.h('div', {}, H.h('div', { class: 'k' }, 'Verano seco (s): el mes más seco del verano, por debajo de'), b, H.h('p', { class: 'small' }, 'El cuadro 6.5 del manual da 30 mm; Kottek y otros (2006), Peel y otros (2007) y Beck y otros (2018), 40 mm.')),
        H.h('div', {}, H.h('div', { class: 'k' }, 'Umbral de aridez (grupo B)'), c, H.h('p', { class: 'small' }, 'Manual (Patton): e = 20·t + 490 − 7·PPW. Por tramos (Peel y otros, 2007): 20·t + 0, 140 o 280 mm según caiga en invierno el 70 % de la lluvia o más, entre el 30 y el 70 %, o menos del 30 %.'))));
    const sync = () => { a.set(T.opt.cd); b.set(T.opt.sMm); c.set(T.opt.arid); tag.textContent = T.isDefault() ? 'los del manual' : 'modificados'; tag.className = 'badge' + (T.isDefault() ? '' : ' q'); };
    sync(); ctrls.push({ sync });
    return box;
  };

  /* ---------- estaciones con temperatura y precipitación ---------- */
  T.ST = T3.ST.filter((s) => s.ta && s.pr);
  T.byId = (id) => T.ST.find((s) => s.id === id);
  T.cls = (s, o = T.opt) => KG.classify(s.ta.slice(0, 12), s.pr.slice(0, 12), s.lat, o);
  T.type = (s, o = T.opt) => T.cls(s, o).type;
  T.nearest = (lat, lon, spainOnly = true) => {
    let best = null, bd = 1e9;
    for (const s of T.ST) { if (spainOnly && !s.es) continue; const d = H.haversine(lat, lon, s.lat, s.lon); if (d < bd) { bd = d; best = s; } }
    return { s: best, d: bd };
  };
  T.stLabel = T2.stLabel;
  /* selector agrupado por grupo climático (con los criterios vigentes) */
  T.stationSelect = (value, onchange, filter = () => true) => {
    const sel = H.h('select', { 'aria-label': 'Estación' });
    const fill = () => {
      const cur = sel.value || value; sel.innerHTML = '';
      const groups = {};
      for (const s of T.ST) { if (!filter(s)) continue; const g = s.es ? 'es' : T.type(s)[0]; (groups[g] = groups[g] || []).push(s); }
      for (const g of ['es', 'A', 'B', 'C', 'D', 'E']) {
        if (!groups[g]) continue;
        const og = H.h('optgroup', { label: g === 'es' ? 'España' : 'Mundo · ' + KG.GROUP[g] });
        groups[g].sort((a, b) => a.name.localeCompare(b.name, 'es')).forEach((s) => og.append(H.h('option', { value: s.id }, `${T.stLabel(s)} · ${T.type(s)}`)));
        sel.append(og);
      }
      sel.value = cur;
    };
    fill(); T.onOpt(fill);
    sel.onchange = () => onchange(T.byId(sel.value));
    sel.set = (id) => { sel.value = id; };
    return sel;
  };

  /* ---------- etiquetas de tipo ---------- */
  T.chip = (t, cls = '') => `<span class="kchip ${cls}" style="background:${KG.css(t)};color:${KG.ink(t)}">${t}</span>`;
  T.typeLine = (t) => `${T.chip(t)} <span>${KG.NAME[t] || ''}</span>`;
  T.letters = (t) => KG.letters(t).map(([l, d]) => `<b>${l}</b> ${d}`).join(' · ');
  /* traza de la clasificación: lista de preguntas con su respuesta */
  T.trace = (res) => {
    const ol = H.h('ol', { class: 'ktrace' });
    for (const st of res.steps) {
      const li = H.h('li', { class: st.ok ? 'yes' : 'no' }, H.h('div', { class: 'q' }, st.q), H.h('div', { class: 'a' }, H.h('span', { class: 'pill ' + (st.ok ? 'ok' : 'ko') }, st.ok ? 'Sí' : 'No'), ' ', st.a));
      ol.append(li);
    }
    return ol;
  };
  /* leyenda de tipos (los presentes en una lista, o todos) */
  T.legend = (types = KG.CODES, onPick) => {
    const box = H.h('div', { class: 'klegend' });
    const groups = {}; types.forEach((t) => (groups[t[0]] = groups[t[0]] || []).push(t));
    for (const g of ['A', 'B', 'C', 'D', 'E']) {
      if (!groups[g]) continue;
      const row = H.h('div', { class: 'kl-row' }, H.h('span', { class: 'kl-g' }, g));
      groups[g].forEach((t) => { const b = H.h('button', { type: 'button', class: 'kl-i', title: KG.NAME[t], html: `<i style="background:${KG.css(t)}"></i>${t}` }); if (onPick) b.onclick = () => onPick(t, b); else b.disabled = true; row.append(b); });
      box.append(row);
    }
    return box;
  };

  /* ---------- clima de un lugar: municipio (TerraClimate) o estación más próxima ---------- */
  T.placeClimate = (p = H.place) => {
    const K = T.DATA().KES;
    if (p.es && K && K.mun) {
      const i = H.MUNI.findIndex((m) => m.name === p.name && m.prov === p.prov);
      if (i >= 0 && K.mun.T91) {
        const g = (a) => (a ? Array.from({ length: 12 }, (_, k) => a[k][i]) : null);
        return { src: 'tc', i, lat: p.lat, T: g(K.mun.T91), P: g(K.mun.P91), T61: g(K.mun.T61), P61: g(K.mun.P61), E: K.mun.E ? K.mun.E[i] : null };
      }
    }
    const W = T.DATA().KMUNDO;
    if (!p.es && W && W.T) { const c = T.cell(p.lat, p.lon); if (c) return Object.assign({ src: 'grid' }, c); }
    const n = T.nearest(p.lat, p.lon, !!p.es);
    return { src: 'st', st: n.s, d: n.d, lat: n.s.lat, T: n.s.ta.slice(0, 12), P: n.s.pr.slice(0, 12) };
  };
  /* celda del mapa mundial más próxima con datos */
  T.cell = (lat, lon) => {
    const W = T.DATA().KMUNDO; if (!W || !W.T) return null;
    const { nx, ny, lon0, lat0, res } = W;
    const i0 = Math.floor((lon - lon0) / res), j0 = Math.floor((lat0 - lat) / res);
    for (let r = 0; r <= 3; r++) for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) {
      if (j < 0 || j >= ny) continue; const ii = ((i % nx) + nx) % nx, k = j * nx + ii;
      if (W.T[0][k] === W.T[0][k]) return { k, lat: lat0 - (j + 0.5) * res, lon: lon0 + (ii + 0.5) * res, T: W.T.map((a) => a[k]), P: W.P.map((a) => a[k]), Z: W.Z ? W.Z[k] : null, AI: W.AI ? W.AI[k] : null };
    }
    return null;
  };
  /* valor de la celda que contiene el punto (sin interpolar: para mapas de categorías) */
  T.nn = (arr, m) => (lat, lon) => {
    const j = Math.floor((m.lat0 - lat) / m.res); if (j < 0 || j >= m.ny) return NaN;
    let i = Math.floor((lon - m.lon0) / m.res); if (Math.abs(m.nx * m.res - 360) < 1e-6) i = ((i % m.nx) + m.nx) % m.nx; else if (i < 0 || i >= m.nx) return NaN;
    return arr[j * m.nx + i];
  };
  /* objeto «estación» a partir de 12 + 12 valores, para el climograma */
  T.asStation = (Tm, Pm, lat) => ({ ta: Tm.concat([Tm.reduce((a, b) => a + b, 0) / 12]), pr: Pm.concat([Pm.reduce((a, b) => a + b, 0)]), lat });

  /* ---------- formato ---------- */
  T.fT = (v, d = 1) => (v == null || !isFinite(v) ? '—' : H.f(v, d).replace('-', '−') + ' °C');
  T.fMM = (v) => (v == null || !isFinite(v) ? '—' : H.f(v, v < 10 ? 1 : 0) + ' mm');
  return T;
})();
