/* ===================== AGUAS MARINAS · ESTRUCTURA VERTICAL Y MASAS DE AGUA ===================== */
H.tab({
  id: 'vertical', nav: 'Profundidad', title: 'La estructura vertical del océano y las masas de agua',
  init(el) {
    el.append(H.intro('Las aguas marinas · apartado 1.3', 'Un océano en capas: superficie cálida, fondo frío',
      'Bajo una capa superficial mezclada por el viento, de unas decenas a unos cientos de metros, la temperatura baja deprisa en la termoclina y, por debajo de 1.000 m, el agua está casi en todas partes entre 0 y 4 °C. Cada capa tiene su origen: las aguas profundas y de fondo se hundieron en las regiones polares y conservan durante siglos la temperatura y la salinidad que adquirieron en superficie. Los perfiles y cortes son medias de 2014-2023 del modelo oceánico HYCOM, que asimila las medidas de satélites, boyas Argo y barcos.',
      'Manual: 1.3<br>Fig. 4.4 · Cuadro 4.1 · Fig. 4.10'));
    const PF = typeof PERFILES !== 'undefined' && PERFILES ? PERFILES : null;
    const O = OCEANO || {};
    if (!PF) el.append(H.info('<b>Pendiente de datos.</b> Los perfiles y cortes de esta pestaña se dibujarán con las exportaciones de HYCOM (<code>gee/tema4_hycom.js</code>) en cuanto estén procesadas.'));

    /* ---------- utilidades de corte ---------- */
    // eje de profundidad: 0-1.000 m en la mitad superior y 1.000-zMax en la inferior
    const depthAxis = (zMax, top, bot, split = 0.5) => { if (split >= 1 || zMax <= 1000) return { Y: (z) => top + z / zMax * (bot - top), inv: (y) => (y - top) / (bot - top) * zMax }; const mid = top + (bot - top) * split; return { Y: (z) => (z <= 1000 ? top + z / 1000 * (mid - top) : mid + (z - 1000) / (zMax - 1000) * (bot - mid)), inv: (y) => (y <= mid ? (y - top) / (mid - top) * 1000 : 1000 + (y - mid) / (bot - mid) * (zMax - 1000)) }; };
    const interpZ = (zs, col, z) => { // valor en la profundidad z interpolando en la vertical (NaN bajo el fondo)
      if (z <= zs[0]) return col[0];
      for (let k = 1; k < zs.length; k++) if (z <= zs[k]) { const a = col[k - 1], b = col[k]; if (!(b === b)) return (z - zs[k - 1]) < (zs[k] - zs[k - 1]) * 0.5 ? a : NaN; const t = (z - zs[k - 1]) / (zs[k] - zs[k - 1]); return a + (b - a) * t; }
      return NaN;
    };
    /* corte: xs (n posiciones), zs (niveles), get(i, k) → valor; colorFn; levels para isolíneas */
    const section = (canvas, o) => {
      const PAD = { l: 52, r: 12, t: 12, b: 34 };
      const st = H.autoCanvas(canvas, o.aspect || ((w) => Math.min(w * 0.55, 420)), (ctx, w, h) => {
        const { xs, zs } = o.data(), zMax = o.zMax || zs[zs.length - 1], n = xs.length;
        const ax = depthAxis(zMax, PAD.t, h - PAD.b, o.split ?? (zMax > 1500 ? 0.5 : 1));
        const X = (x) => PAD.l + (x - o.x0) / (o.x1 - o.x0) * (w - PAD.l - PAD.r);
        const iw = Math.round(w - PAD.l - PAD.r), ih = Math.round(h - PAD.t - PAD.b), img = ctx.createImageData(iw, ih);
        const cols = []; for (let i = 0; i < n; i++) { const c = []; for (let k = 0; k < zs.length; k++) c.push(o.get(i, k)); cols.push(c); }
        const vals = new Float32Array(iw * ih);
        for (let px = 0; px < iw; px++) {
          const x = o.x0 + (px + 0.5) / iw * (o.x1 - o.x0); let fi = (x - xs[0]) / (xs[n - 1] - xs[0]) * (n - 1); fi = H.clamp(fi, 0, n - 1);
          const i0 = Math.floor(fi), i1 = Math.min(n - 1, i0 + 1), t = fi - i0;
          for (let py = 0; py < ih; py++) {
            const z = ax.inv(PAD.t + py + 0.5); const a = interpZ(zs, cols[i0], z), b = interpZ(zs, cols[i1], z);
            const v = a === a && b === b ? a + (b - a) * t : (t < 0.5 ? a : b);
            vals[py * iw + px] = v; const c = v === v ? o.color(v) : [176, 160, 120]; const q = (py * iw + px) * 4;
            img.data[q] = c[0]; img.data[q + 1] = c[1]; img.data[q + 2] = c[2]; img.data[q + 3] = 255;
          }
        }
        const cv = document.createElement('canvas'); cv.width = iw; cv.height = ih; cv.getContext('2d').putImageData(img, 0, 0);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(cv, PAD.l, PAD.t);
        // isolíneas sobre la rejilla de píxeles (submuestreada)
        const lv = typeof o.levels === 'function' ? o.levels() : o.levels;
        if (lv) {
          const s = 3, gx = Math.floor(iw / s), gy = Math.floor(ih / s), d = new Float32Array(gx * gy);
          for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) d[j * gx + i] = vals[(j * s) * iw + i * s];
          const g = { nx: gx, ny: gy, data: d, lonAt: (i) => i * s, latAt: (j) => j * s };
          const P = { X: (x) => PAD.l + x, Y: (y) => PAD.t + y, w, h };
          T3.contour(ctx, g, lv, P, { color: 'rgba(28,40,54,.65)', width: 0.9, fmt: o.fmt || ((L) => H.f(L, L % 1 ? 1 : 0)) });
        }
        // ejes
        ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.strokeStyle = 'rgba(28,40,54,.25)'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (const z of (o.zTicks || [0, 200, 400, 600, 800, 1000, 2000, 3000, 4000, 5000]).filter((z) => z <= zMax)) { const y = ax.Y(z); ctx.beginPath(); ctx.moveTo(PAD.l - 4, y); ctx.lineTo(PAD.l, y); ctx.stroke(); ctx.fillText(H.f(z), PAD.l - 6, y); }
        ctx.save(); ctx.translate(12, (PAD.t + h - PAD.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Profundidad (m)', 0, 0); ctx.restore();
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (const [x, l] of o.xTicks) ctx.fillText(l, X(x), h - PAD.b + 4);
        if (o.xLabel) ctx.fillText(o.xLabel, (PAD.l + w - PAD.r) / 2, h - 14);
        if (zMax > 1500 && (o.split ?? 0.5) < 1) { const y = ax.Y(1000); ctx.setLineDash([2, 3]); ctx.strokeStyle = 'rgba(28,40,54,.4)'; ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(w - PAD.r, y); ctx.stroke(); ctx.setLineDash([]); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('cambio de escala', w - PAD.r - 4, y - 2); }
        if (o.after) o.after(ctx, X, ax.Y, w, h);
      });
      return st;
    };
    const tCol = T4.ramp([[-2, [40, 30, 100]], [0, [52, 70, 160]], [2, [70, 120, 190]], [4, [110, 170, 205]], [8, [170, 210, 200]], [12, [230, 230, 160]], [16, [246, 200, 110]], [20, [240, 150, 80]], [25, [214, 80, 50]], [30, [140, 20, 40]]]);
    const sCol = T4.ramp([[33.8, [70, 40, 120]], [34.4, [48, 92, 170]], [34.7, [100, 170, 200]], [34.9, [190, 225, 215]], [35.2, [246, 240, 200]], [35.8, [244, 196, 120]], [36.5, [222, 120, 70]], [37.5, [168, 50, 50]], [38.8, [100, 20, 40]]]);
    const dCol = T4.ramp([[23, [246, 236, 200]], [25, [236, 214, 160]], [26.5, [190, 214, 200]], [27.2, [120, 180, 210]], [27.6, [70, 130, 190]], [27.85, [40, 80, 160]], [28, [30, 40, 110]]]);

    if (PF && PF.prof) {
      /* ================= A · perfiles en un punto ================= */
      const P0 = PF.prof, Z = P0.z, G5 = { nx: P0.nx, ny: P0.ny, lon0: P0.lon0, lat0: P0.lat0, res: P0.res };
      const prof = (mon, i, j) => { const D = P0[mon]; const T = Z.map((_, k) => D.T[k][j * P0.nx + i]), S = Z.map((_, k) => D.S[k][j * P0.nx + i]); return { T, S }; };
      const valid = (i, j) => P0.feb.T[0][j * P0.nx + i] === P0.feb.T[0][j * P0.nx + i];
      const nearestPt = (lat, lon) => { let b = null, bd = 1e9; for (let j = 0; j < P0.ny; j++) for (let i = 0; i < P0.nx; i++) { if (!valid(i, j)) continue; const la = P0.lat0 - (j + 0.5) * P0.res, lo = P0.lon0 + (i + 0.5) * P0.res, d = H.haversine(lat, lon, la, lo); if (d < bd) { bd = d; b = { i, j, lat: la, lon: lo, d }; } } return b; };
      let pt = nearestPt(H.place.lat, H.place.lon);
      const sA = { zMax: 2000 };
      const cvMap = H.h('canvas');
      const mapA = T4.map(cvMap, { bbox: T4.BB.mundo, grid: 30, key: () => 'v', color: () => null,
        after: (ctx, P) => {
          for (let j = 0; j < P0.ny; j++) for (let i = 0; i < P0.nx; i++) { if (!valid(i, j)) continue; const x = P.X(P0.lon0 + (i + 0.5) * P0.res), y = P.Y(P0.lat0 - (j + 0.5) * P0.res); const t = P0.feb.T[0][j * P0.nx + i]; ctx.fillStyle = T3.css(T4.sstColor(t)); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); }
          const x = P.X(pt.lon), y = P.Y(pt.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
        } });
      cvMap.addEventListener('click', (e) => { const [x, y] = mapA.pos(e); const [la, lo] = mapA.P.inv(x, y); const p = nearestPt(la, lo); if (p) { pt = p; updA(); } });
      const cvT = H.h('canvas'), cvS = H.h('canvas'), cvD = H.h('canvas');
      const chT = H.chart(cvT, 1.25), chS = H.chart(cvS, 1.25), chD = H.chart(cvD, 1.25);
      const roA = { sst: H.ro('Superficie (feb · ago)', 'hl'), ml: H.ro('Capa de mezcla (feb · ago)'), th: H.ro('Termoclina (gradiente máximo, ago)', 'bl'), t1: H.ro('A 1.000 m'), bot: H.ro('En el fondo') };
      const drawProf = (ch, key, mn, mx, xl, fmt, A, B, extra) => {
        const zm = sA.zMax, pts = (arr) => Z.map((z, k) => [arr[k], -z]).filter((p) => p[0] === p[0] && -p[1] <= zm);
        const yt = [0, 200, 400, 600, 800, 1000, 1500, 2000, 3000, 4000, 5000].filter((z) => z <= zm).map((z) => ({ v: -z, label: H.f(z) }));
        ch.draw({ xMin: mn, xMax: mx, yMin: -zm, yMax: 0, xLabel: xl, yLabel: 'Profundidad (m)', pad: { l: 50, b: 36 }, xTicks: fmt, yTicks: yt,
          series: [{ pts: pts(A), color: '#1f6f8b', width: 2.2 }, { pts: pts(B), color: '#b4531d', width: 2.2 }].concat(extra || []) });
      };
      const updA = () => {
        const F = prof('feb', pt.i, pt.j), A = prof('ago', pt.i, pt.j);
        const sg = (p) => Z.map((z, k) => (p.T[k] === p.T[k] && p.S[k] === p.S[k] ? T4.sigma(p.S[k], T4.theta(p.S[k], p.T[k], z), 0) : NaN));
        const SF = sg(F), SA = sg(A);
        const finite = (a) => a.filter((v) => v === v);
        const tAll = finite([...F.T, ...A.T]), sAll = finite([...F.S, ...A.S]), dAll = finite([...SF, ...SA]);
        const tmn = Math.floor(Math.min(...tAll)), tmx = Math.ceil(Math.max(...tAll));
        const smn = Math.floor(Math.min(...sAll) * 5) / 5, smx = Math.ceil(Math.max(...sAll) * 5) / 5;
        const dmn = Math.floor(Math.min(...dAll) * 2) / 2, dmx = Math.ceil(Math.max(...dAll) * 2) / 2;
        const ticks = (a, b, n) => { const st = (b - a) / n; return Array.from({ length: n + 1 }, (_, i) => ({ v: a + i * st, label: H.f(a + i * st, st < 1 ? 1 : 0) })); };
        drawProf(chT, 'T', tmn, tmx, 'Temperatura (°C)', ticks(tmn, tmx, 4), F.T, A.T);
        drawProf(chS, 'S', smn, smx, 'Salinidad', ticks(smn, smx, 4), F.S, A.S);
        drawProf(chD, 'D', dmn, dmx, 'Densidad potencial σθ', ticks(dmn, dmx, 4), SF, SA);
        // capa de mezcla: profundidad donde σ supera en 0,03 la de 10 m
        const mld = (s) => { const s10 = s[1]; for (let k = 2; k < Z.length; k++) { if (!(s[k] === s[k])) return Z[k - 1]; if (s[k] - s10 > 0.03) { const t = (s10 + 0.03 - s[k - 1]) / (s[k] - s[k - 1]); return Z[k - 1] + t * (Z[k] - Z[k - 1]); } } return Z[Z.length - 1]; };
        let gmax = 0, zth = null; for (let k = 1; k < Z.length && Z[k] <= 1000; k++) { const g = (A.T[k - 1] - A.T[k]) / (Z[k] - Z[k - 1]); if (g > gmax) { gmax = g; zth = (Z[k] + Z[k - 1]) / 2; } }
        const last = (a) => { for (let k = a.length - 1; k >= 0; k--) if (a[k] === a[k]) return [a[k], Z[k]]; return [NaN, 0]; };
        roA.sst.v.innerHTML = `${T4.fT(F.T[0])} · ${T4.fT(A.T[0])}`;
        roA.ml.v.innerHTML = `${H.f(mld(SF))} · ${H.f(mld(SA))} <small>m</small>`;
        roA.th.v.innerHTML = zth != null && gmax > 0.01 ? `${H.f(zth)} m <small>(${H.f(gmax * 100, 1)} °C cada 100 m)</small>` : '<small>no hay: agua casi homogénea</small>';
        const k1 = Z.indexOf(1000); roA.t1.v.innerHTML = A.T[k1] === A.T[k1] ? `${T4.fT(A.T[k1])} <small>· S = ${H.f(A.S[k1], 2)}</small>` : '—';
        const [tb, zb] = last(A.T); roA.bot.v.innerHTML = `${T4.fT(tb, 2)} <small>a ${H.f(zb)} m</small>`;
        lbl.innerHTML = `Punto: <b>${T4.ll(pt.lat, pt.lon, 1)}</b>${pt.d > 0 && pt === nearest0 ? ` (el más próximo a ${H.placeLabel()}, a ${H.f(pt.d)} km)` : ''} · <span style="color:#1f6f8b">febrero</span> y <span style="color:#b4531d">agosto</span>`;
        mapA.redraw();
      };
      let nearest0 = pt;
      const lbl = H.h('p', { class: 'small' });
      const segZ = H.seg([[500, 'Hasta 500 m'], [2000, 'Hasta 2.000 m'], [5000, 'Hasta el fondo']], 2000, (v) => { sA.zMax = v; updA(); });
      const chips = H.h('div', { class: 'chipbar' });
      [['Tu punto', null], ['Atlántico ecuatorial', [2.5, -27.5]], ['Mar de los Sargazos', [27.5, -62.5]], ['Atlántico subpolar', [57.5, -32.5]], ['Mediterráneo central', [37.5, 17.5]], ['Mar de Weddell', [-62.5, -37.5]], ['Pacífico ecuatorial este', [-2.5, -97.5]]].forEach(([n, ll]) => {
        const b = H.h('button', { class: 'chip', type: 'button' }, n); b.onclick = () => { const p = ll ? nearestPt(ll[0], ll[1]) : nearestPt(H.place.lat, H.place.lon); if (p) { pt = p; if (!ll) nearest0 = p; updA(); } }; chips.append(b);
      });
      H.onPlace(() => { pt = nearest0 = nearestPt(H.place.lat, H.place.lon); updA(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Perfiles verticales: temperatura, salinidad y densidad (fig. 4.4)'),
        H.h('p', { class: 'sub' }, 'Elige un punto en el mapa (rejilla de 5°). En latitudes bajas y medias hay una capa superficial cálida y mezclada, más gruesa en invierno; debajo, la termoclina (descenso rápido de la temperatura) coincide con la picnoclina (aumento rápido de la densidad), una barrera que frena el intercambio vertical. En las regiones polares la columna es casi uniforme y fría: allí el agua superficial puede hundirse hasta el fondo.'),
        H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvMap), chips), H.h('div', {}, segZ, lbl, H.h('div', { class: 'readouts' }, roA.sst, roA.ml, roA.th, roA.t1, roA.bot))),
        H.h('div', { class: 'grid3', style: { marginTop: '10px' } }, H.h('div', { class: 'viz' }, cvT), H.h('div', { class: 'viz' }, cvS), H.h('div', { class: 'viz' }, cvD))));
      updA();
    }

    /* ================= B · el cuadro 4.1 con datos actuales ================= */
    if (O.sst && O.sss) {
      const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 };
      const band = (arrs, la0, la1) => { const vals = arrs.map((a) => { const g = T4.grid(a, G1); let s = 0, n = 0; for (let j = 0; j < g.ny; j++) { const la = g.latAt(j); if (la < la0 || la > la1) continue; for (let i = 0; i < g.nx; i++) { const v = g.data[j * g.nx + i]; if (v === v) { s += v; n++; } } } return s / n; }); return { m: vals.reduce((a, b) => a + b, 0) / vals.length, r: Math.max(...vals) - Math.min(...vals) }; };
      const B = [['Ecuatoriales', '5° S – 5° N', -5, 5, '35 ‰', '22-28 °C', 'en torno a 5 °C'], ['Centrales oceánicas (subtropicales)', '15° – 35° N', 15, 35, '34,5-37,5 ‰', '8-15 °C', 'alta'], ['Subárticas', '45° – 60° N', 45, 60, '32 ‰', '2-4 °C', 'baja'], ['Circumpolares (antárticas)', '55° – 65° S', -65, -55, '30-32 ‰', 'próxima a la congelación', 'débil']];
      const rows = B.map(([n, z, a, b, sM, tM, oM]) => { const t = band(O.sst, a, b), s = band(O.sss, a, b); return `<tr><td><b>${n}</b><br><small>${z}</small></td><td>${H.f(s.m, 2)}<br><small class="bad">manual: ${sM}</small></td><td>${T4.fT(t.m)}<br><small class="bad">manual: ${tM}</small></td><td>${H.f(t.r, 1)} °C<br><small class="bad">manual: ${oM}</small></td></tr>`; }).join('');
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Masas de agua superficiales (cuadro 4.1 con datos actuales)'),
        H.html(`<div style="overflow-x:auto"><table class="t"><thead><tr><th>Masas de agua</th><th>Salinidad media</th><th>Temperatura media anual</th><th>Oscilación anual (media de la banda)</th></tr></thead><tbody>${rows}</tbody></table>
          <p class="small">Medias de todas las celdas de mar de cada banda de latitud: temperatura de OISST (1991-2020) y salinidad de HYCOM (2014-2023). La salinidad del manual en las aguas subárticas y circumpolares es demasiado baja (32 y 30-32): en mar abierto se mantiene en 33-34; los valores más bajos solo se dan junto a las desembocaduras de grandes ríos y en verano junto al hielo. La temperatura de las aguas centrales es mucho mayor que 8-15 °C, que corresponde más bien a su base, hacia 300-500 m.</p></div>`)));
    }

    /* ================= C · corte del Atlántico ================= */
    if (PF && PF.atl) {
      const A = PF.atl, n = A.n, zs = A.z, xs = Array.from({ length: n }, (_, i) => A.lat0 + i * A.dlat);
      const sC = { v: 'S' };
      const cvC = H.h('canvas');
      const get = (i, k) => { const t = A.T[k][i], s = A.S[k][i]; if (sC.v === 'T') return t; if (sC.v === 'S') return s; return t === t && s === s ? T4.sigma(s, T4.theta(s, t, zs[k]), 0) : NaN; };
      const order = xs.map((_, i) => n - 1 - i); // de sur a norte
      const stC = section(cvC, { data: () => ({ xs: order.map((i) => xs[i]), zs }), get: (i, k) => get(order[i], k), x0: -78, x1: 68,
        color: (v) => (sC.v === 'T' ? tCol(v) : sC.v === 'S' ? sCol(v) : dCol(v)),
        levels: () => (sC.v === 'T' ? [0, 2, 4, 10, 20] : sC.v === 'S' ? [34.5, 34.9, 35.5, 36.5] : [26.5, 27.5, 27.8]), xTicks: [-60, -40, -20, 0, 20, 40, 60].map((v) => [v, v === 0 ? '0°' : Math.abs(v) + '° ' + (v < 0 ? 'S' : 'N')]), xLabel: 'Latitud a lo largo de 25° O (Antártida a la izquierda, Islandia a la derecha)', aspect: (w) => Math.min(w * 0.5, 460),
        after: (ctx, X, Y) => {
          if (!showWM) return; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
          [['AABW (agua de fondo antártica)', -30, 4800, '#fff'], ['NADW (agua profunda del Atlántico Norte)', 10, 2800, '#fff'], ['AAIW (intermedia antártica)', -25, 900, '#1c2836'], ['Agua mediterránea', 38, 1100, '#1c2836'], ['Aguas centrales', 20, 250, '#1c2836']].forEach(([t, la, z, c]) => { const x = X(la), y = Y(z); const tw = ctx.measureText(t).width; ctx.fillStyle = c === '#fff' ? 'rgba(28,40,54,.55)' : 'rgba(255,255,255,.75)'; ctx.fillRect(x - tw / 2 - 3, y - 8, tw + 6, 16); ctx.fillStyle = c; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); });
        } });
      let showWM = true;
      const segC = H.seg([['T', 'Temperatura'], ['S', 'Salinidad'], ['D', 'Densidad (σθ)']], 'S', (v) => { sC.v = v; stC.redraw(); updLeg(); });
      const wm = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', checked: true, onchange: (e) => { showWM = e.target.checked; stC.redraw(); } }), ' Nombres de las masas de agua');
      const leg = H.h('div', {});
      const updLeg = () => { leg.innerHTML = ''; leg.append(sC.v === 'T' ? T3.legend(tCol, -2, 30, [-2, 0, 4, 10, 20, 30], (v) => v + (v === 30 ? ' °C' : '')) : sC.v === 'S' ? T3.legend(sCol, 33.8, 38.8, [34, 35, 36, 37, 38], (v) => H.f(v, 0)) : T3.legend(dCol, 23, 28, [24, 26, 27, 27.5, 28], (v) => H.f(v, 1))); };
      el.append(H.h('div', { class: 'card', id: 'corte' }, H.h('h3', {}, 'Las masas de agua del Atlántico (fig. 4.10 con datos actuales)'),
        H.h('p', { class: 'sub' }, 'Corte norte-sur del Atlántico a 25° O, desde la Antártida hasta Islandia. En salinidad se distinguen bien las masas de agua: la intermedia antártica, poco salada, que se hunde en el frente polar y avanza hacia el norte a unos 1.000 m; la lengua salada del agua mediterránea, que sale por Gibraltar y se extiende a la misma profundidad; el agua profunda del Atlántico Norte, formada en los mares de Groenlandia y del Labrador, que fluye hacia el sur entre 1.500 y 4.000 m; y, en el fondo, el agua antártica, la más fría y densa, que llega hasta el hemisferio norte.'),
        H.h('div', { class: 'row', style: { gap: '10px' } }, segC, wm), H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvC), leg));
      updLeg();
    }

    /* ================= D · Gibraltar ================= */
    if (PF && PF.gib) {
      const Gb = PF.gib, xs = Array.from({ length: Gb.n }, (_, i) => Gb.lon0 + i * Gb.dlon);
      const cvG = H.h('canvas');
      section(cvG, { data: () => ({ xs, zs: Gb.z }), get: (i, k) => Gb.S[k][i], x0: -12, x1: -1, zMax: 1600, split: 1, zTicks: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600],
        color: sCol, levels: [36, 36.5, 37, 37.5, 38], xTicks: [-12, -10, -8, -6, -4, -2].map((v) => [v, Math.abs(v) + '° O']), xLabel: 'Longitud a lo largo de 35,95° N (golfo de Cádiz a la izquierda, mar de Alborán a la derecha)', aspect: (w) => Math.min(w * 0.42, 340),
        after: (ctx, X, Y) => { ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.fillText('Estrecho', X(-5.6), Y(0) + 14); ctx.fillStyle = '#7a1c1c'; ctx.fillText('← agua mediterránea, salada y densa, por el fondo', X(-8.6), Y(1000)); ctx.fillStyle = '#1f4f8b'; ctx.fillText('agua atlántica, menos salada, por la superficie →', X(-3.5), Y(60)); } });
      el.append(H.h('div', { class: 'card', id: 'gibraltar' }, H.h('h3', {}, 'El estrecho de Gibraltar: un intercambio en dos capas'),
        H.h('p', { class: 'sub' }, 'El Mediterráneo pierde por evaporación más agua de la que recibe. El déficit se compensa con agua atlántica que entra por la superficie del estrecho (unos 0,8 millones de m³/s). El agua mediterránea, más salada y densa por la evaporación y el enfriamiento invernal, sale por debajo, por encima del umbral de Camarinal (unos 290 m de profundidad), y se hunde por el talud del golfo de Cádiz hasta estabilizarse hacia 1.000 m, donde forma la lengua salada que se ve en el corte del Atlántico.'),
        H.h('div', { class: 'viz framed' }, cvG), T3.legend(sCol, 33.8, 38.8, [35, 36, 37, 38], (v) => H.f(v, 0)),
        H.h('p', { class: 'small' }, 'Salinidad media 2014-2023 de HYCOM (1/12°). El modelo suaviza el umbral, más estrecho en la realidad que la rejilla.')));
    }

    /* ================= E · el Pacífico ecuatorial ================= */
    if (PF && PF.eq) {
      const E = PF.eq, xs = Array.from({ length: E.n }, (_, i) => E.lon0 + i * E.dlon);
      const sE = { k: 'T' };
      const cvE = H.h('canvas');
      const stE = section(cvE, { data: () => ({ xs, zs: E.z }), get: (i, k) => E[sE.k][k][i], x0: 120, x1: 280, zMax: 500, split: 1, zTicks: [0, 100, 200, 300, 400, 500],
        color: tCol, levels: [10, 15, 20, 25, 28], xTicks: [[120, '120° E'], [150, '150° E'], [180, '180°'], [210, '150° O'], [240, '120° O'], [270, '90° O']], xLabel: 'Longitud a lo largo del ecuador (Indonesia a la izquierda, Ecuador y Perú a la derecha)', aspect: (w) => Math.min(w * 0.42, 340),
        after: (ctx, X, Y) => { ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.fillText(sE.k === 'T' ? 'Media 2014-2023: la isoterma de 20 °C (termoclina) se inclina de 160 m a 50 m' : 'Diciembre de 2015 (El Niño): la termoclina casi horizontal', X(125), Y(480)); } });
      const segE = H.seg([['T', 'Situación media'], ['N', 'El Niño, diciembre de 2015']], 'T', (v) => { sE.k = v; stE.redraw(); });
      el.append(H.h('div', { class: 'card', id: 'ecuador' }, H.h('h3', {}, 'El Pacífico ecuatorial: la termoclina inclinada y El Niño'),
        H.html('<p class="sub">Los alisios acumulan agua cálida en el oeste del Pacífico, donde la capa cálida tiene más de 150 m, y hacen aflorar agua fría en el este. Durante El Niño los alisios se debilitan, el agua cálida se extiende hacia el este y la termoclina se aplana: en la costa de Perú se interrumpe el afloramiento. Ver también <a href="#clima">El Niño en la pestaña Océano y clima</a>.</p>'),
        segE, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvE), T3.legend(tCol, -2, 30, [5, 10, 15, 20, 25, 30], (v) => v + (v === 30 ? ' °C' : ''))));
    }

    el.append(H.fix('Estructura vertical', [
      'Las masas de agua superficiales (la capa por encima de la termoclina) tienen de 50 a 200 m de espesor en la mayor parte del océano y hasta 500-700 m solo en el centro de los giros subtropicales en invierno; lo que llega a 300-500 m es la termoclina principal.',
      'Las aguas profundas no están «solo unos grados por encima del punto de congelación» en general: por debajo de 2.000 m tienen entre −0,5 y 3 °C, y el agua de fondo antártica está muy cerca de la congelación (−0,5 a 0 °C).',
      'La mezcla entre capas no se debe a la «difusión molecular», mil veces más lenta, sino a la turbulencia: la rotura de ondas internas sobre el relieve del fondo y los remolinos.',
      'El agua intermedia antártica se forma en el frente polar antártico (hacia 50-55° S), no «en la zona de la corriente del viento del Oeste» en general; y la corriente circumpolar antártica no es una fuente de agua profunda, sino una corriente superficial y profunda empujada por el viento del oeste. El agua de fondo se forma en los mares de Weddell y Ross.',
    ]));
    el.append(H.selfCheck([
      { q: 'La termoclina es…', opts: ['la capa superficial donde el viento mezcla el agua', 'la capa en la que la temperatura desciende rápidamente con la profundidad', 'el fondo del océano', 'la capa de hielo'], a: 1, ex: ' Coincide con la picnoclina, donde la densidad aumenta rápido, y separa la capa superficial del océano profundo.' },
      { q: '¿Por qué la capa de mezcla es más gruesa en invierno?', opts: ['Porque hay más viento y el agua superficial se enfría, se hace más densa y se hunde', 'Porque hay más lluvia', 'Porque el Sol penetra más', 'Porque hay mareas vivas'], a: 0, ex: ' El enfriamiento y el viento destruyen la estratificación; en verano el calentamiento superficial la refuerza.' },
      { q: 'La lengua de agua muy salada que se ve a unos 1.000 m frente a la Península procede…', opts: ['del mar Rojo', 'del Mediterráneo, por el estrecho de Gibraltar', 'del Ártico', 'de la Antártida'], a: 1, ex: ' Es el agua mediterránea, que sale por el fondo del estrecho y se extiende por el Atlántico a esa profundidad.' },
      { q: 'El agua más densa del océano, que ocupa los fondos, se forma…', opts: ['en el ecuador', 'en los mares de Weddell y Ross (Antártida)', 'en el mar de los Sargazos', 'en el Mediterráneo'], a: 1, ex: ' El agua de fondo antártica se forma por enfriamiento y expulsión de salmuera bajo el hielo marino.' },
    ]));
  },
});
