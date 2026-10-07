/* ===================== C · CIRCULACIÓN GENERAL ATMOSFÉRICA ===================== */
H.tab({
  id: 'circulacion', nav: 'Circulación general', title: 'Circulación general atmosférica',
  init(el) {
    el.append(H.intro('La circulación · apartado 2.2', 'Los centros de acción y los vientos dominantes del planeta',
      'Promediadas a lo largo de un mes, las presiones se ordenan en franjas: bajas ecuatoriales, altas subtropicales hacia 30°, bajas subpolares hacia 60° y altas polares. Los continentes rompen ese esquema, sobre todo en el hemisferio norte: en invierno se cubren de anticiclones fríos y en verano de bajas térmicas. Entre esas franjas soplan los alisios, los vientos del oeste y los vientos polares del este.',
      'Manual: 2.2 y 4<br>Figs. 3.8 a 3.12 y 3.25; ejercicio 4'));

    /* ---------- datos ---------- */
    let G = null;
    if (typeof CLIMA !== 'undefined' && CLIMA && CLIMA.p) {
      const mk = (b, sc, g) => T3.grid(T3.dec(b, sc), g.nx, g.ny, g.lon0, g.lat0, g.res, true);
      const pg = { nx: CLIMA.nx, ny: CLIMA.ny, lon0: CLIMA.lon0, lat0: CLIMA.lat0, res: CLIMA.res }, wg = CLIMA.w;
      G = { p: CLIMA.p.map((b) => mk(b, 0.1, pg)), u: CLIMA.u.map((b) => mk(b, 0.01, wg)), v: CLIMA.v.map((b) => mk(b, 0.01, wg)) };
    }
    const CENT = [
      ['A', 37, -35, 'Azores'], ['A', 33, -145, 'Hawái'], ['A', 49, 100, 'Siberia'], ['A', 50, -105, 'Norteamérica'], ['A', -28, -12, 'Santa Elena'], ['A', -32, -95, 'Pacífico sur'], ['A', -31, 75, 'Mascareñas'], ['A', -28, 130, 'Australia'], ['A', -30, 20, 'Sudáfrica'], ['A', -25, -55, 'Sudamérica'],
      ['B', 62, -30, 'Islandia'], ['B', 52, -175, 'Aleutianas'], ['B', 28, 68, 'baja asiática'], ['B', 32, -112, 'baja norteamericana'], ['B', 22, 5, 'baja sahariana'], ['B', -62, 0, 'bajas subpolares'], ['B', -15, 135, 'baja australiana'], ['B', -15, 25, 'baja africana'], ['B', -12, -60, 'baja sudamericana'],
    ];
    const extrema = (g) => {
      const out = [], R = 5; // ±10° en la rejilla de 2°
      for (let j = 0; j < g.ny; j++) {
        const lat = g.latAt(j); if (Math.abs(lat) > 68) continue;
        for (let i = 0; i < g.nx; i++) {
          const v = g.get(i, j); let mx = true, mn = true;
          for (let dj = -R; dj <= R && (mx || mn); dj++) for (let di = -R; di <= R; di++) { if (!di && !dj) continue; const jj = j + dj; if (jj < 0 || jj >= g.ny) continue; const w = g.get((i + di + g.nx) % g.nx, jj); if (w >= v) mx = false; if (w <= v) mn = false; }
          if (mx && v >= 1017) out.push(['A', lat, g.lonAt(i), v]); else if (mn && v <= 1009) out.push(['B', lat, g.lonAt(i), v]);
        }
      }
      return out.map(([k, la, lo, v]) => { let best = null, bd = 26; for (const c of CENT) { if (c[0] !== k) continue; const d = Math.hypot(la - c[1], ((lo - c[2] + 540) % 360 - 180) * Math.cos(la * H.D2R)); if (d < bd) { bd = d; best = c[3]; } } return [k, la, lo, v, best]; });
    };
    const itcz = (m) => { // latitud donde el viento meridiano pasa de sur (v>0) a norte (v<0)
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 4) { let best = null, bj = 0; for (let lat = -18; lat < 26; lat += 0.5) { const a = G.v[m].at(lat, lon), b = G.v[m].at(lat + 0.5, lon); if (a > 0 && b <= 0 && a - b > bj) { bj = a - b; best = lat + 0.25; } } pts.push([lon, best]); }
      for (let k = 0; k < 2; k++) for (let i = 0; i < pts.length; i++) { const a = pts[(i - 1 + pts.length) % pts.length][1], c = pts[(i + 1) % pts.length][1], b = pts[i][1]; if (b == null && a != null && c != null) pts[i][1] = (a + c) / 2; }
      return pts.map(([lo, la], i) => { if (la == null) return [lo, null]; let s2 = 0, n = 0; for (let k = -2; k <= 2; k++) { const q = pts[(i + k + pts.length) % pts.length][1]; if (q != null) { s2 += q; n++; } } return [lo, s2 / n]; });
    };

    /* ================= A · mapas mundiales ================= */
    const s = { m: 0, fill: true, arr: true, lab: true, itcz: true, pick: null };
    const cv = H.h('canvas'), tip = H.h('div', { class: 'tooltip' });
    let raster = null, rk = '';
    const cs = H.autoCanvas(cv, (w) => w * 0.5, (ctx, w, h) => {
      const P = T3.proj([-180, 180, -90, 90], w, h); cs.P = P;
      const key = [s.m, Math.round(w), s.fill, !!G].join('|');
      if (key !== rk) { raster = T3.landRaster(P, w, h, (lat, lon) => { const base = H.mix([222, 233, 241], [238, 230, 210], H.land(lat, lon)); return G && s.fill ? H.mix(T3.pColor(G.p[s.m].at(lat, lon)), base, 0.3) : base; }); rk = key; }
      ctx.drawImage(raster, 0, 0, w, h);
      T3.drawCoast(ctx, P);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(28,40,54,.3)'; for (const la of [0, 30, -30, 60, -60]) { ctx.beginPath(); ctx.moveTo(0, P.Y(la)); ctx.lineTo(w, P.Y(la)); ctx.stroke(); } ctx.setLineDash([]);
      if (!G) return;
      const levels = []; for (let L = 980; L <= 1044; L += 4) levels.push(L);
      T3.contour(ctx, T3.refine(G.p[s.m], 2), levels, P, { color: 'rgba(28,40,54,.65)', width: 0.9, fmt: (L) => H.f(L) });
      if (s.arr) T3.arrows(ctx, G.u[s.m], G.v[s.m], P, { step: 8, scale: 1.4, base: 5, maxLen: 20, color: 'rgba(28,40,54,.8)', min: 1 });
      if (s.itcz) { const pts = itcz(s.m); ctx.strokeStyle = '#b0393a'; ctx.lineWidth = 2.5; ctx.setLineDash([7, 4]); ctx.beginPath(); let f = true; for (const [lo, la] of pts) { if (la == null) { f = true; continue; } const x = P.X(lo), y = P.Y(la); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; } ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; const q = pts.find((p) => p[0] >= -150 && p[1] != null); if (q) { ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#b0393a'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText('ZCIT', P.X(q[0]), P.Y(q[1]) - 7); ctx.fillText('ZCIT', P.X(q[0]), P.Y(q[1]) - 7); } }
      if (s.lab) for (const [k, la, lo, v, nm] of extrema(G.p[s.m])) { const x = P.X(lo), y = P.Y(la); ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(k, x, y); ctx.fillStyle = k === 'A' ? '#b4531d' : '#1f6f8b'; ctx.fillText(k, x, y); if (nm) { ctx.font = 'bold 10px system-ui'; ctx.lineWidth = 3; ctx.strokeText(nm, x, y + 15); ctx.fillStyle = '#1c2836'; ctx.fillText(nm, x, y + 15); } }
      if (s.pick) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.X(s.pick[1]), P.Y(s.pick[0]), 6, 0, 7); ctx.stroke(); }
    });
    const ro = { pos: H.ro('Posición'), p: H.ro('Presión media a nivel del mar', 'hl'), w: H.ro('Viento medio a 10 m', 'bl') };
    const pick = (lat, lon) => { s.pick = [lat, lon]; ro.pos.v.innerHTML = `${H.dm(Math.abs(lat))} ${lat >= 0 ? 'N' : 'S'}, ${H.dm(Math.abs(lon))} ${lon >= 0 ? 'E' : 'O'}`; if (G) { ro.p.v.innerHTML = `${H.f(G.p[s.m].at(lat, lon), 1)} <small>hPa</small>`; const u = G.u[s.m].at(lat, lon), v = G.v[s.m].at(lat, lon), sp = Math.hypot(u, v); ro.w.v.innerHTML = sp < 0.5 ? '<small>calma o variable</small>' : `del ${T3.dirName(T3.windFrom(u, v))} <small>${H.f(sp * 3.6)} km/h</small>`; } cs.redraw(); };
    cv.addEventListener('click', (e) => { const [x, y] = cs.pos(e), [lat, lon] = cs.P.inv(x, y); pick(lat, lon); });
    cv.addEventListener('mousemove', (e) => { if (!G) return; const [x, y] = cs.pos(e), [lat, lon] = cs.P.inv(x, y); tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${H.f(G.p[s.m].at(lat, lon), 1)} hPa`; });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    cv.style.cursor = 'crosshair';
    const mSeg = H.seg([[0, 'Enero (fig. 3.8)'], [6, 'Julio (fig. 3.9)']], s.m, (v) => { s.m = v; mS.set(v); upd(); });
    const mS = H.slider('Mes', 0, 11, 1, s.m, (v) => H.MESES[v], (v) => { s.m = v; mSeg.set(v); upd(); });
    const chk = (k, l) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, l); };
    const upd = () => { cs.redraw(); if (s.pick) pick(...s.pick); drawZ(); };
    const mapCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Presión media a nivel del mar y vientos dominantes'));
    if (!G) mapCard.append(H.info('<b>Capa en rejilla pendiente.</b> Los mapas mensuales de presión y viento (reanálisis ERA5, 1991–2020) se añadirán en cuanto se exporten desde Google Earth Engine.'));
    mapCard.append(H.h('p', { class: 'sub' }, 'Isobaras cada 4 hPa y flechas del viento medio a 10 m. Las letras señalan los centros de acción de cada mes; la línea roja discontinua es la convergencia intertropical (ZCIT), donde se encuentran los alisios de ambos hemisferios.'),
      H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cv, tip),
      H.h('div', { style: { marginTop: '4px' } }, T3.legend(T3.pColor, 984, 1038, [990, 1000, 1013, 1020, 1030], (v) => H.f(v) + (v === 1030 ? ' hPa' : ''), 360)),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, H.h('span', { style: { flex: 'none' } }, mSeg)), H.h('div', { style: { height: '6px' } }), mS, H.h('div', {}, chk('fill', 'Colores'), chk('arr', 'Viento'), chk('lab', 'Centros de acción'), chk('itcz', 'ZCIT'))),
        H.h('div', { class: 'readouts' }, ro.pos, ro.p, ro.w)),
      H.html('<p class="small">Datos: reanálisis ERA5 (Copernicus/ECMWF), medias mensuales 1991–2020 (julio–diciembre, 1991–2019). Sobre las grandes altiplanicies (Tíbet, Antártida, Groenlandia) la presión «a nivel del mar» es una extrapolación poco fiable.</p>'));
    el.append(mapCard);

    /* ================= B · perfiles por latitud ================= */
    const zp = H.chart(H.h('canvas'), 0.36), zu = H.chart(H.h('canvas'), 0.36);
    const drawZ = () => {
      if (!G) return;
      const pp = [], po = [], uu = [];
      for (let lat = -80; lat <= 80; lat += 2) { let a = 0, n = 0, o = 0, no = 0, u = 0; for (let lon = -179; lon < 180; lon += 2) { const v = G.p[s.m].at(lat, lon); a += v; n++; if (H.land(lat, lon) < 0.3) { o += v; no++; } u += G.u[s.m].at(lat, lon); } pp.push([lat, a / n]); po.push([lat, no > 10 ? o / no : null]); uu.push([lat, u / n * 3.6]); }
      const xT = [-80, -60, -30, 0, 30, 60, 80].map((v) => ({ v, label: v === 0 ? '0°' : Math.abs(v) + '°' + (v < 0 ? 'S' : 'N') }));
      zp.draw({ xMin: -80, xMax: 80, yMin: 995, yMax: 1025, xTicks: xT, yTicks: [1000, 1005, 1010, 1015, 1020, 1025].map((v) => ({ v, label: H.f(v) })), yLabel: 'hPa', hlines: [{ y: 1013.25, color: '#8a96a3', label: '1.013,25' }], series: [{ pts: po, color: '#1f6f8b', width: 2 }, { pts: pp, color: '#1c2836', width: 2.5 }],
        after: (ctx, X, Y) => { ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; [[0, 'bajas ecuatoriales', 1007], [30, 'altas subtropicales', 1022], [-30, 'altas subtropicales', 1022], [-62, 'bajas subpolares', 997], [60, 'bajas subpolares', 1004]].forEach(([x, t, y]) => ctx.fillText(t, X(x), Y(y))); } });
      zu.draw({ xMin: -80, xMax: 80, yMin: -25, yMax: 35, xTicks: xT, yTicks: [-20, -10, 0, 10, 20, 30].map((v) => ({ v, label: v })), yLabel: 'km/h', hlines: [{ y: 0, color: '#1c2836', dash: [] }], series: [{ pts: uu, color: '#b4531d', width: 2.5, fill: 'rgba(180,83,29,.12)' }],
        after: (ctx, X, Y) => { ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; [[15, 'alisios (del este)', -18], [-15, 'alisios (del este)', -18], [47, 'vientos del oeste', 26], [-50, 'vientos del oeste', 30], [-72, 'polares del este', -12]].forEach(([x, t, y]) => ctx.fillText(t, X(x), Y(y))); } });
    };
    if (G) {
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El esquema zonal, paralelo a paralelo'),
        H.h('p', { class: 'sub' }, 'Medias de cada paralelo para el mes elegido. Arriba, la presión (negro: todo el paralelo; azul: solo océanos). Abajo, el viento del oeste (positivo) o del este (negativo) a 10 m.'),
        H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'viz' }, zp.st.canvas), H.h('div', { class: 'viz' }, zu.st.canvas))));
      drawZ();
    }

    /* ================= C · modelo tricelular ================= */
    const c = { season: 0, rot: true, t: 0 };
    const cvM = H.h('canvas');
    const csM = H.autoCanvas(cvM, (w) => Math.min(w * 0.52, 470), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const sh = c.season * 7; // desplazamiento de las franjas (° de latitud): + en julio
      /* --- globo con franjas y vientos --- */
      const R = Math.min(w * 0.22, h * 0.44), gx = w * 0.25, gy = h * 0.5;
      const Yl = (lat) => gy - R * Math.sin(lat * H.D2R), half = (lat) => R * Math.cos(lat * H.D2R);
      ctx.fillStyle = '#e8f0f6'; ctx.beginPath(); ctx.arc(gx, gy, R, 0, 7); ctx.fill(); ctx.strokeStyle = '#1c2836'; ctx.stroke();
      const belts = c.rot ? [[90, 'A', 'anticiclón polar'], [60 + sh, 'B', 'bajas subpolares · frente polar'], [30 + sh, 'A', 'anticiclones subtropicales'], [0 + sh, 'B', 'bajas ecuatoriales (ZCIT)'], [-30 + sh, 'A', 'anticiclones subtropicales'], [-60 + sh, 'B', 'bajas subpolares'], [-90, 'A', 'anticiclón polar']] : [[90, 'A', 'alta polar'], [sh, 'B', 'baja ecuatorial'], [-90, 'A', 'alta polar']];
      ctx.font = '10.5px system-ui';
      for (const [la, k, n] of belts) { const y = Yl(la), hw = half(la); ctx.strokeStyle = 'rgba(28,40,54,.3)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx - hw, y); ctx.lineTo(gx + hw, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = k === 'A' ? '#b4531d' : '#1f6f8b'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(k, gx - hw * 0.55, y + (Math.abs(la) === 90 ? (la > 0 ? 12 : -12) : 0)); ctx.font = '10.5px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; if (Math.abs(la) < 90) ctx.fillText(n, gx + R + 6, y); }
      // flechas de viento en superficie
      const arrowAt = (lat, dirDeg, col) => { const y = Yl(lat), hw = half(lat); for (const fx of [-0.25, 0.25]) { const x = gx + fx * hw * 1.6, L = 16, a = (dirDeg + 180) * H.D2R, dx = Math.sin(a) * L, dy = -Math.cos(a) * L; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - dx / 2, y - dy / 2); ctx.lineTo(x + dx / 2, y + dy / 2); ctx.stroke(); const an = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(x + dx / 2, y + dy / 2); ctx.lineTo(x + dx / 2 - 7 * Math.cos(an - 0.5), y + dy / 2 - 7 * Math.sin(an - 0.5)); ctx.lineTo(x + dx / 2 - 7 * Math.cos(an + 0.5), y + dy / 2 - 7 * Math.sin(an + 0.5)); ctx.fill(); } ctx.lineWidth = 1; };
      if (c.rot) { arrowAt(15 + sh, 45, '#e0a82e'); arrowAt(-15 + sh, 135, '#e0a82e'); arrowAt(45 + sh, 250, '#9b59b6'); arrowAt(-45 + sh, 290, '#9b59b6'); arrowAt(75, 60, '#5b7fa3'); arrowAt(-75, 120, '#5b7fa3'); }
      else { arrowAt(45, 0, '#5b7fa3'); arrowAt(-45, 180, '#5b7fa3'); arrowAt(15, 0, '#5b7fa3'); arrowAt(-15, 180, '#5b7fa3'); }
      ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center';
      if (c.rot) { ctx.fillText('alisios del NE', gx, Yl(15 + sh) + 16); ctx.fillText('alisios del SE', gx, Yl(-15 + sh) - 10); ctx.fillText('vientos del oeste', gx, Yl(45 + sh) + 15); ctx.fillText('vientos del oeste', gx, Yl(-45 + sh) - 9); }
      /* --- corte meridiano con las células --- */
      const x0 = w * 0.55, x1 = w - 12, zb = h - 26, zt = 22, X = (lat) => x0 + (lat + 90) / 180 * (x1 - x0);
      const trop = (lat) => zb - (zb - zt) * (0.55 + 0.4 * Math.exp(-Math.pow((lat - sh * 0.6) / 32, 2))); // tropopausa más alta en el ecuador
      ctx.fillStyle = '#f2f6fa'; ctx.beginPath(); ctx.moveTo(X(-90), zb); for (let la = -90; la <= 90; la += 2) ctx.lineTo(X(la), trop(la)); ctx.lineTo(X(90), zb); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(28,40,54,.45)'; ctx.setLineDash([4, 3]); ctx.beginPath(); for (let la = -90; la <= 90; la += 2) { const y = trop(la); la > -90 ? ctx.lineTo(X(la), y) : ctx.moveTo(X(la), y); } ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#5a6878'; ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.fillText('tropopausa', X(-88), trop(-88) - 4);
      ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(X(-90), zb); ctx.lineTo(X(90), zb); ctx.stroke();
      ctx.textAlign = 'center'; for (const la of [-90, -60, -30, 0, 30, 60, 90]) ctx.fillText(la === 0 ? '0°' : Math.abs(la) + '°' + (la < 0 ? 'S' : 'N'), X(la), zb + 12);
      const cells = c.rot ? [[sh, 30 + sh, 'Hadley', 1], [30 + sh, 60 + sh, 'Ferrel', -1], [60 + sh, 90, 'polar', 1], [-30 + sh, sh, 'Hadley', -1], [-60 + sh, -30 + sh, 'Ferrel', 1], [-90, -60 + sh, 'polar', -1]] : [[sh, 90, 'una sola célula', 1], [-90, sh, 'una sola célula', -1]];
      // sentido: +1 = sube por el lado de menor latitud absoluta del HN… se resuelve por célula
      cells.forEach(([a, b, n, dir]) => {
        const xa = X(a), xb = X(b), ztop = Math.min(trop(a), trop(b)) + 12, cx = (xa + xb) / 2, cy = (zb - 6 + ztop) / 2, rx = (xb - xa) / 2 - 6, ry = (zb - 6 - ztop) / 2;
        ctx.strokeStyle = n === 'Ferrel' ? 'rgba(155,89,182,.8)' : 'rgba(31,111,139,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(4, rx), Math.max(4, ry), 0, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
        // partículas que recorren la célula
        for (let k = 0; k < 6; k++) { const ph = (c.t * 0.6 * dir + k / 6 * 2 * Math.PI); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(cx + rx * Math.cos(ph), cy + ry * Math.sin(ph), 3, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#1c2836'; ctx.font = '10.5px system-ui'; ctx.fillText(n, cx, cy + 3);
      });
      if (c.rot) { // corrientes en chorro (hacia dentro del papel: del oeste)
        for (const [la, z, n] of [[30 + sh, 0.86, 'chorro subtropical'], [60 + sh, 0.62, 'chorro polar'], [-30 + sh, 0.86, ''], [-60 + sh, 0.62, '']]) { const x = X(la), y = zb - (zb - zt) * z; ctx.strokeStyle = '#b0393a'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); ctx.lineWidth = 1; if (n) { ctx.fillStyle = '#b0393a'; ctx.font = 'bold 10px system-ui'; ctx.fillText(n, x, y - 11); } }
      }
      ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(c.rot ? 'Corte meridiano: tres células por hemisferio' : 'Sin rotación: una célula por hemisferio', x0, 12);
    });
    let rafM = null; const tickM = () => { c.t += 0.03; csM.redraw(); rafM = requestAnimationFrame(tickM); };
    new IntersectionObserver((en) => en.forEach((e) => { cancelAnimationFrame(rafM); if (e.isIntersecting) tickM(); })).observe(cvM);
    const seasS = H.slider('Época del año', -1, 1, 0.05, c.season, (v) => (v < -0.6 ? 'enero' : v > 0.6 ? 'julio' : Math.abs(v) < 0.15 ? 'equinoccios' : v < 0 ? 'hacia enero' : 'hacia julio'), (v) => { c.season = v; csM.redraw(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El esquema de la circulación general'),
      H.h('p', { class: 'sub' }, 'El modelo de tres células por hemisferio (figs. 3.10 a 3.12). En la célula de Hadley el aire sube en el ecuador, viaja en altura hacia los polos, se hunde hacia los 30° y vuelve al ecuador en superficie como alisio, desviado por Coriolis. Las franjas se desplazan hacia el hemisferio en verano.'),
      H.h('div', { class: 'viz framed' }, cvM),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, seasS, H.h('div', {}, H.seg([[true, 'Tierra que gira'], [false, 'Si la Tierra no girase']], true, (v) => { c.rot = v; csM.redraw(); }))),
      H.html('<p class="small">Los círculos con aspa son las corrientes en chorro: vientos del oeste muy rápidos (de 100 a más de 300 km/h) en la parte alta de la troposfera, en el límite entre células. El chorro polar ondula y en esas ondas se forman las borrascas de latitudes medias (fig. 3.13).</p>')));

    el.append(H.openQ('Ejercicio 4 del manual: compara la distribución de presiones de enero y julio en los dos hemisferios', 'En el <b>hemisferio norte</b> el contraste es enorme porque hay mucha tierra: en enero dominan los anticiclones térmicos continentales (Siberia, Norteamérica) y se refuerzan las bajas oceánicas (Islandia, Aleutianas); en julio los continentes se cubren de bajas térmicas (la baja asiática, que llega hasta el Sahara, y la de Norteamérica) y los anticiclones oceánicos (Azores, Hawái) se refuerzan y suben de latitud. En el <b>hemisferio sur</b>, casi todo océano, el esquema es mucho más zonal y estable: un cinturón continuo de altas subtropicales hacia 30° y otro de bajas hacia 60–65°, que apenas cambian; solo sobre Australia, Sudáfrica y Sudamérica se alternan altas en invierno (julio) y bajas en verano (enero). Todo el conjunto, con la ZCIT, se desplaza hacia el norte en julio y hacia el sur en enero. (El manual dice «enero y junio», pero sus mapas son de enero y julio.)'));
    el.append(H.html(`<div class="card"><h3>Las zonas climáticas</h3><p>La circulación general y la insolación dividen la Tierra en tres grandes zonas (fig. 3.25): la <b>cálida</b>, entre los trópicos, con la franja ecuatorial de convergencia y lluvias y las franjas tropicales de alisios y desiertos; las <b>templadas</b>, de los vientos del oeste y las borrascas del frente polar; y las <b>frías</b>, dominadas por las altas polares, que son desiertos fríos. Sus límites astronómicos (trópicos y círculos polares) se estudian en el <a href="${H.T1}#estaciones">Tema 1 · Traslación y estaciones</a>.</p></div>`));
    el.append(H.fix('Circulación general', [
      'Los anticiclones subtropicales son <b>dinámicos</b>: se deben al aire que desciende en la rama de la célula de Hadley y se calienta por compresión, no a «aire frío y denso que se acumula contra la superficie» (apartado 4).',
      'El origen de la corriente en chorro no es «incierto»: el contraste de temperatura entre el ecuador y los polos hace que el viento del oeste aumente con la altura (viento térmico), y el aire que viaja hacia los polos en la célula de Hadley conserva su momento angular y se acelera hacia el este (chorro subtropical).',
      'Velocidades típicas del chorro: de 100 a 250 km/h en su núcleo, con máximos que superan los 400 km/h. Lo identificó el japonés Wasaburo Ōishi en los años veinte; en la Segunda Guerra Mundial lo «descubrieron» los aviadores.',
      'En la fig. 3.13, la curvatura <b>ciclónica</b> es la que en meteorología se considera positiva (sentido antihorario en el hemisferio norte), al revés de lo que dice el texto.',
    ]));
    el.append(H.selfCheck([
      { q: 'Los alisios soplan desde…', opts: ['Las bajas ecuatoriales hacia las altas subtropicales', 'Las altas subtropicales hacia las bajas ecuatoriales', 'Los polos hacia el ecuador', 'El oeste hacia el este'], a: 1, ex: 'Desviados por Coriolis: del noreste en el hemisferio norte y del sureste en el sur.' },
      { q: 'El anticiclón de Siberia es…', opts: ['Dinámico y permanente', 'Térmico e invernal', 'Una baja de verano', 'Oceánico'], a: 1, ex: 'Se forma por el intenso enfriamiento invernal del continente y desaparece en verano y en altura.' },
      { q: 'En julio la ZCIT se encuentra…', opts: ['Siempre sobre el ecuador', 'Desplazada hacia el hemisferio norte, sobre todo sobre los continentes', 'En el hemisferio sur', 'Junto al círculo polar'], a: 1, ex: 'Sigue al Sol con retraso; sobre Asia meridional llega a más de 20° N (monzón).' },
      { q: 'Las bajas presiones subpolares están mejor definidas…', opts: ['En el hemisferio norte', 'En el hemisferio sur, como un cinturón casi continuo', 'Sobre los continentes', 'En verano'], a: 1, ex: 'El océano Antártico rodea toda la Tierra sin interrupción.' },
      { q: 'Si la Tierra no girase, en superficie el aire iría…', opts: ['Del ecuador a los polos', 'De los polos al ecuador, sin desviarse', 'Del oeste al este', 'No habría viento'], a: 1, ex: 'Sería una única célula por hemisferio: ascenso en el ecuador y descenso en los polos.' },
    ]));
  },
});
