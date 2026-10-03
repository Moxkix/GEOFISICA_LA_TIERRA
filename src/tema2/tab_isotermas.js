/* ===================== T · DISTRIBUCIÓN MUNDIAL: ISOTERMAS ===================== */
H.tab({
  id: 'isotermas', nav: 'Isotermas', title: 'Distribución mundial de la temperatura',
  init(el) {
    el.append(H.intro('La temperatura · apartado 6.1.3', 'La distribución de las temperaturas sobre el globo',
      'Las isotermas unen puntos con la misma temperatura. En los mapas mundiales se suelen reducir al nivel del mar (sumando 0,65 °C por cada 100 m de altitud) para que el relieve no oculte el efecto de la latitud, de los continentes y de las corrientes marinas. El ecuador térmico, la línea de máxima temperatura, se desplaza con las estaciones y mucho más sobre los continentes.',
      'Manual: 6.1.3<br>Figs. 2.14 y 2.15; ejercicio 4'));

    /* ---------- datos en rejilla ---------- */
    let G = null;
    if (GRID) {
      const dec = (b64) => { const bin = atob(b64), n = bin.length / 2, dv = new DataView(new ArrayBuffer(bin.length)); for (let i = 0; i < bin.length; i++) dv.setUint8(i, bin.charCodeAt(i)); const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = dv.getInt16(i * 2, true) / 10; return a; };
      G = { nx: GRID.nx, ny: GRID.ny, res: GRID.res, lon0: GRID.lon0, lat0: GRID.lat0, t: GRID.t.map(dec), e: dec(GRID.e).map((v) => v * 10), src: GRID.src };
      G.amp = new Float32Array(G.nx * G.ny); for (let k = 0; k < G.nx * G.ny; k++) { let mx = -999, mn = 999; for (let m = 0; m < 12; m++) { const v = G.t[m][k]; if (v > mx) mx = v; if (v < mn) mn = v; } G.amp[k] = mx - mn; }
    }
    const LAPSE = 0.0065;
    const s = { m: 0, varb: 'temp', red: true, step: 5, lines: true, stations: true, cur: false, eq: true, lat: 50, pick: null };
    const val = (k) => s.varb === 'amp' ? G.amp[k] : G.t[s.m][k] + (s.red ? LAPSE * G.e[k] : 0);
    const at = (lat, lon) => { // interpolación bilineal en la rejilla
      const fx = ((lon - G.lon0) / G.res - 0.5 + G.nx) % G.nx, fy = H.clamp((G.lat0 - lat) / G.res - 0.5, 0, G.ny - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = (x0 + 1) % G.nx, y1 = Math.min(G.ny - 1, y0 + 1), u = fx - x0, v = fy - y0;
      return val(y0 * G.nx + x0) * (1 - u) * (1 - v) + val(y0 * G.nx + x1) * u * (1 - v) + val(y1 * G.nx + x0) * (1 - u) * v + val(y1 * G.nx + x1) * u * v;
    };
    const ampColor = (a) => { const t = H.clamp(a / 50, 0, 1); return H.mix([247, 244, 232], [120, 40, 90], Math.pow(t, 0.8)); };

    /* ---------- corrientes marinas (esquema) ---------- */
    const CUR = [
      ['c', 'Golfo', [[-80, 25], [-79, 30], [-75, 35], [-68, 38.5], [-58, 41], [-48, 43]]], ['c', 'Deriva noratlántica', [[-48, 43], [-38, 47], [-28, 51], [-18, 54], [-8, 58], [2, 62], [10, 66], [16, 70]]],
      ['c', 'Kuroshio', [[123, 22], [127, 27], [132, 31], [140, 35], [150, 37.5], [162, 40]]], ['c', 'Alaska', [[-172, 45], [-158, 48], [-145, 53], [-140, 57], [-148, 59.5]]],
      ['c', 'Brasil', [[-35, -8], [-38, -15], [-40, -22], [-45, -28], [-51, -36]]], ['c', 'Agujas', [[41, -14], [36, -24], [31, -31], [24, -36]]], ['c', 'Australia oriental', [[155, -15], [155, -25], [154, -31], [152, -38]]],
      ['f', 'California', [[-131, 46], [-127, 40], [-122, 33], [-117, 26], [-113, 20]]], ['f', 'Canarias', [[-14, 41], [-17, 31], [-20, 23], [-21, 15]]], ['f', 'Humboldt', [[-78, -45], [-75, -35], [-73, -25], [-76, -15], [-82, -5]]],
      ['f', 'Benguela', [[16, -34], [13, -28], [11, -20], [9, -12]]], ['f', 'Labrador', [[-61, 66], [-58, 58], [-53, 52], [-50, 46]]], ['f', 'Oyashio', [[162, 56], [156, 50], [149, 45], [145, 40]]], ['f', 'Australia occidental', [[111, -36], [112, -28], [113, -21]]],
    ];

    /* ---------- mapa ---------- */
    const cv = H.h('canvas'); const tip = H.h('div', { class: 'tooltip' });
    let raster = null, rasterKey = '';
    const P = { t: 0, b: 0 };
    const cs = H.autoCanvas(cv, (w) => w * 0.5, (ctx, w, h) => {
      const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h;
      cs.X = X; cs.Y = Y;
      if (G) {
        const key = [s.m, s.varb, s.red, Math.round(w)].join('|');
        if (key !== rasterKey) {
          const RW = Math.min(720, Math.round(w)), RH = Math.round(RW / 2), img = new ImageData(RW, RH);
          for (let j = 0; j < RH; j++) for (let i = 0; i < RW; i++) {
            const lat = 90 - (j + 0.5) * 180 / RH, lon = -180 + (i + 0.5) * 360 / RW, v = at(lat, lon);
            let c = s.varb === 'amp' ? ampColor(v) : T2.tColor(v); const ld = H.land(lat, lon); c = c.map((q) => q * (1 - 0.1 * ld));
            const k = (j * RW + i) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
          }
          raster = document.createElement('canvas'); raster.width = RW; raster.height = RH; raster.getContext('2d').putImageData(img, 0, 0); rasterKey = key;
        }
        ctx.imageSmoothingEnabled = true; ctx.drawImage(raster, 0, 0, w, h);
      } else {
        const key = 'base|' + Math.round(w);
        if (key !== rasterKey) {
          const RW = Math.min(720, Math.round(w)), RH = Math.round(RW / 2), img = new ImageData(RW, RH);
          for (let j = 0; j < RH; j++) for (let i = 0; i < RW; i++) { const c = H.mix([226, 236, 242], [243, 236, 217], H.land(90 - (j + 0.5) * 180 / RH, -180 + (i + 0.5) * 360 / RW)); const k = (j * RW + i) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255; }
          raster = document.createElement('canvas'); raster.width = RW; raster.height = RH; raster.getContext('2d').putImageData(img, 0, 0); rasterKey = key;
        }
        ctx.drawImage(raster, 0, 0, w, h);
      }
      // costas (se corta el trazo al cruzar el antimeridiano)
      ctx.strokeStyle = G ? 'rgba(28,40,54,.55)' : '#9aa7b3'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const poly of LAND) for (const ring of poly) { let pl = null; for (let i = 0; i < ring.length; i += 2) { const lon = ((ring[i] + 540) % 360) - 180, x = X(lon), y = Y(ring[i + 1]); if (pl == null || Math.abs(lon - pl) > 180) ctx.moveTo(x, y); else ctx.lineTo(x, y); pl = lon; } }
      ctx.stroke();
      // paralelos de referencia
      ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.lineWidth = 1;
      for (const la of [0, 23.44, -23.44, 66.56, -66.56]) { ctx.beginPath(); ctx.moveTo(0, Y(la)); ctx.lineTo(w, Y(la)); ctx.stroke(); }
      ctx.setLineDash([]);
      if (G && s.lines) drawIso(ctx, X, Y);
      if (G && s.eq && s.varb === 'temp') drawEq(ctx, X, Y, w);
      if (s.cur) drawCur(ctx, X, Y);
      if (s.stations || !G) drawSt(ctx, X, Y);
      // paralelo del perfil
      if (G) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, Y(s.lat)); ctx.lineTo(w, Y(s.lat)); ctx.stroke(); ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`perfil ${H.f(Math.abs(s.lat))}° ${s.lat >= 0 ? 'N' : 'S'}`, 4, Y(s.lat) - 4); }
      if (s.pick) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s.pick[1]), Y(s.pick[0]), 6, 0, 7); ctx.stroke(); }
    });
    const drawIso = (ctx, X, Y) => {
      const nx = G.nx, ny = G.ny, F = new Float32Array(nx * ny); for (let k = 0; k < nx * ny; k++) F[k] = val(k);
      const step = s.varb === 'amp' ? 10 : s.step;
      let mn = Infinity, mx = -Infinity; for (const v of F) { if (v < mn) mn = v; if (v > mx) mx = v; }
      const cx = (i) => X(G.lon0 + (i + 0.5) * G.res), cy = (j) => Y(G.lat0 - (j + 0.5) * G.res);
      ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(28,40,54,.7)';
      const labels = [];
      for (let L = Math.ceil(mn / step) * step; L <= mx; L += step) {
        const major = s.varb === 'temp' && L % 10 === 0; ctx.lineWidth = major ? 1.3 : 0.7;
        ctx.beginPath(); let first = null, bd = 1e9; const target = ((L / step) % 2 === 0 ? -35 : 165);
        for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
          const a = F[j * nx + i], b = F[j * nx + i + 1], c = F[(j + 1) * nx + i + 1], d = F[(j + 1) * nx + i];
          const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0); if (k === 0 || k === 15) continue;
          const t = (p, q) => (L - p) / (q - p);
          const top = [i + t(a, b), j], right = [i + 1, j + t(b, c)], bot = [i + t(d, c), j + 1], left = [i, j + t(a, d)];
          const S = { 1: [[left, bot]], 2: [[bot, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bot, right]], 6: [[top, bot]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bot]], 10: [[top, right], [left, bot]], 11: [[top, right]], 12: [[left, right]], 13: [[bot, right]], 14: [[left, bot]] }[k];
          for (const [p, q] of S) { const px = cx(p[0]), py = cy(p[1]); ctx.moveTo(px, py); ctx.lineTo(cx(q[0]), cy(q[1])); const dd = Math.abs(G.lon0 + (p[0] + 0.5) * G.res - target); if (dd < bd) { bd = dd; first = [px, py]; } }
        }
        ctx.stroke();
        if (first) labels.push([first, L]);
      }
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [[x, y], L] of labels) { const t = H.f(L) + '°'; const tw = ctx.measureText(t).width + 4; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(x - tw / 2, y - 6, tw, 12); ctx.fillStyle = '#1c2836'; ctx.fillText(t, x, y); }
    };
    const eqLine = () => { // latitud de la temperatura máxima (reducida) entre 30° S y 30° N, suavizada
      const pts = []; const red0 = s.red; s.red = true;
      for (let lon = -180; lon <= 180; lon += 2) { let best = -999, bl = 0; for (let lat = -30; lat <= 30; lat += 0.5) { const v = at(lat, lon); if (v > best) { best = v; bl = lat; } } pts.push([lon, bl]); }
      s.red = red0;
      const sm = pts.map((p, i) => { let a = 0, n = 0; for (let k = -4; k <= 4; k++) { const q = pts[(i + k + pts.length) % pts.length]; a += q[1]; n++; } return [p[0], a / n]; });
      return sm;
    };
    const drawEq = (ctx, X, Y, w) => { const e = eqLine(); ctx.strokeStyle = '#b0393a'; ctx.lineWidth = 2.5; ctx.setLineDash([8, 5]); ctx.beginPath(); e.forEach(([lo, la], i) => (i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la)))); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#b0393a'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; const p = e[Math.round(e.length * 0.83)]; ctx.fillText('ecuador térmico', X(p[0]) + 4, Y(p[1]) - 7); };
    const drawCur = (ctx, X, Y) => {
      for (const [k, n, pts] of CUR) {
        const col = k === 'c' ? '#c0392b' : '#1f5fa8'; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.6;
        ctx.beginPath(); pts.forEach(([lo, la], i) => (i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la)))); ctx.stroke();
        const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]], x2 = X(b[0]), y2 = Y(b[1]), ang = Math.atan2(y2 - Y(a[1]), x2 - X(a[0]));
        ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(ang - 0.45), y2 - 9 * Math.sin(ang - 0.45)); ctx.lineTo(x2 - 9 * Math.cos(ang + 0.45), y2 - 9 * Math.sin(ang + 0.45)); ctx.fill();
        const m = pts[Math.floor(pts.length / 2)]; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(n, X(m[0]) + 5, Y(m[1])); ctx.fillText(n, X(m[0]) + 5, Y(m[1]));
      }
    };
    const stVal = (st) => s.varb === 'amp' ? T2.amp(st) : st.ta[s.m] + (s.red ? LAPSE * st.elev : 0);
    const drawSt = (ctx, X, Y) => {
      for (const st of T2.ST) { const v = stVal(st); ctx.fillStyle = s.varb === 'amp' ? `rgb(${ampColor(v).map(Math.round)})` : T2.tCss(v); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(st.lon), Y(st.lat), st.es ? 2.5 : 4, 0, 7); ctx.fill(); ctx.stroke(); }
    };

    /* ---------- lecturas y perfil ---------- */
    const ro = { pos: H.ro('Posición'), t: H.ro('Temperatura', 'hl'), tr: H.ro('Reducida al nivel del mar'), el: H.ro('Altitud media de la celda'), st: H.ro('Estación más próxima', 'bl') };
    const pick = (lat, lon) => {
      s.pick = [lat, lon];
      ro.pos.v.innerHTML = `${H.dm(Math.abs(lat))} ${lat >= 0 ? 'N' : 'S'}, ${H.dm(Math.abs(lon))} ${lon >= 0 ? 'E' : 'O'}`;
      if (G) {
        const r0 = s.red, v0 = s.varb; s.varb = 'temp'; s.red = false; const t = at(lat, lon); s.red = true; const tr = at(lat, lon); s.red = r0; s.varb = v0;
        ro.t.v.innerHTML = `${T2.fT(t)} <small>${H.MESES[s.m]}</small>`; ro.tr.v.textContent = T2.fT(tr); ro.el.v.innerHTML = `${H.f((tr - t) / LAPSE)} <small>m</small>`;
      }
      const n = T2.nearest(lat, lon, false); ro.st.v.innerHTML = n.d < 600 ? `${n.s.name}: ${T2.fT(n.s.ta[s.m])} <small>(${H.f(n.d)} km)</small>` : '<small>ninguna a menos de 600 km</small>';
      cs.redraw();
    };
    cv.addEventListener('click', (e) => { const [x, y] = cs.pos(e); pick(90 - y / cs.h * 180, x / cs.w * 360 - 180); });
    cv.addEventListener('mousemove', (e) => { const [x, y] = cs.pos(e); const lat = 90 - y / cs.h * 180, lon = x / cs.w * 360 - 180; if (!G) { tip.style.display = 'none'; return; } tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${H.f(Math.abs(lat))}° ${lat >= 0 ? 'N' : 'S'} · ${H.f(Math.abs(lon))}° ${lon >= 0 ? 'E' : 'O'} · ${s.varb === 'amp' ? 'amplitud ' : ''}${T2.fT(at(lat, lon))}`; });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    cv.style.cursor = 'crosshair';

    const pch = H.chart(H.h('canvas'), 0.32);
    const drawProf = () => {
      if (!G) return;
      const pts = [], land = []; for (let lon = -180; lon <= 180; lon += 1) { pts.push([lon, at(s.lat, lon)]); land.push(H.land(s.lat, lon) > 0.5); }
      const ys = pts.map((p) => p[1]), lo = Math.floor(Math.min(...ys) / 5) * 5 - 5, hi = Math.ceil(Math.max(...ys) / 5) * 5 + 5;
      const bands = []; let st = null; land.forEach((l, i) => { if (l && st == null) st = i - 180; if ((!l || i === land.length - 1) && st != null) { bands.push({ x0: st, x1: i - 180, color: 'rgba(200,170,110,.28)' }); st = null; } });
      const yt = []; for (let v = lo; v <= hi; v += hi - lo > 40 ? 10 : 5) yt.push({ v, label: v + '°' });
      pch.draw({ xMin: -180, xMax: 180, yMin: lo, yMax: hi, xTicks: [-180, -120, -60, 0, 60, 120, 180].map((v) => ({ v, label: v === 0 ? '0°' : Math.abs(v) + '°' + (v < 0 ? 'O' : 'E') })), yTicks: yt, yLabel: s.varb === 'amp' ? 'Amplitud (°C)' : '°C', bands, series: [{ pts, color: '#b4531d', width: 2.5 }] });
    };

    /* ---------- controles ---------- */
    const mSeg = H.seg([[0, 'Enero'], [6, 'Julio']], s.m, (v) => { s.m = v; mS.set(v); upd(); });
    const mS = H.slider('Mes', 0, 11, 1, s.m, (v) => H.MESES[v], (v) => { s.m = v; mSeg.set(v); upd(); });
    const vSeg = H.seg([['temp', 'Temperatura media del mes'], ['amp', 'Amplitud térmica anual']], s.varb, (v) => { s.varb = v; upd(); });
    const rSeg = H.seg([[true, 'Reducida al nivel del mar'], [false, 'Real (a la altitud del terreno)']], s.red, (v) => { s.red = v; upd(); });
    const stepSeg = H.seg([[5, 'Isotermas cada 5 °C'], [10, 'cada 10 °C']], s.step, (v) => { s.step = v; cs.redraw(); });
    const chk = (k, l) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, l); };
    const latS = H.slider('Latitud del perfil', -70, 80, 1, s.lat, (v) => `${Math.abs(v)}° ${v >= 0 ? 'N' : 'S'}`, (v) => { s.lat = v; cs.redraw(); drawProf(); });
    const legend = H.h('div');
    const upd = () => { legend.innerHTML = ''; legend.append(s.varb === 'amp' ? (() => { const c = H.h('canvas', { width: 300, height: 12, style: { width: '100%', maxWidth: '300px', height: '12px', borderRadius: '3px', display: 'block' } }); const x = c.getContext('2d'); for (let i = 0; i < 300; i++) { x.fillStyle = `rgb(${ampColor(i / 299 * 50).map(Math.round)})`; x.fillRect(i, 0, 1, 12); } return H.h('div', { class: 'tlegend' }, c, H.html('<div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--muted);max-width:300px"><span>0 °C</span><span>25</span><span>50 °C</span></div>')); })() : T2.legendBar(-40, 35, 15)); cs.redraw(); drawProf(); if (s.pick) pick(...s.pick); };

    const mapCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Mapa mundial de temperaturas medias'));
    if (!G) mapCard.append(H.info('<b>Capa en rejilla pendiente.</b> El mapa continuo de temperaturas (reanálisis ERA5, 1991–2020) se añadirá en cuanto se exporte desde Google Earth Engine. Mientras tanto, los puntos muestran las temperaturas medias de las estaciones disponibles.'));
    mapCard.append(H.h('p', { class: 'sub' }, G ? 'Haz clic en el mapa para leer valores. Las líneas discontinuas son el ecuador, los trópicos y los círculos polares; la roja, el ecuador térmico (máximo de temperatura reducida entre 30° S y 30° N).' : 'Cada punto es una estación con normales 1991–2020; el color indica su temperatura media del mes elegido.'),
      H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cv, tip), legend,
      H.h('div', { class: 'grid2', style: { marginTop: '12px' } },
        H.h('div', {}, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '8px' } }, H.h('span', { style: { flex: 'none' } }, mSeg)), H.h('div', { style: { height: '6px' } }), mS, vSeg, H.h('div', { style: { height: '8px' } }), rSeg, H.h('div', { style: { height: '8px' } }), G ? stepSeg : '',
          H.h('div', { style: { marginTop: '8px' } }, G ? chk('lines', 'Isotermas') : '', G ? chk('eq', 'Ecuador térmico') : '', chk('cur', 'Corrientes marinas (esquema)'), G ? chk('stations', 'Estaciones') : '')),
        H.h('div', {}, H.h('div', { class: 'readouts' }, ...(G ? [ro.pos, ro.t, ro.tr, ro.el, ro.st] : [ro.pos, ro.st])), H.h('p', { class: 'small' }, 'Reducción al nivel del mar: T + 0,65 °C × (altitud / 100 m). En las estaciones se usa su altitud; en la rejilla, la altitud media de cada celda.'))));
    el.append(mapCard);
    if (G) el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Perfil a lo largo de un paralelo'),
      H.h('p', { class: 'sub' }, 'Temperatura a lo largo del paralelo elegido; en ocre, los tramos sobre tierra. En enero, a 50° N, el océano es mucho más templado que los continentes; en julio ocurre lo contrario.'),
      latS, H.h('div', { class: 'viz' }, pch.st.canvas), H.h('div', { class: 'chipbar' }, ...[['50° N en enero', 50, 0], ['50° N en julio', 50, 6], ['60° N en enero', 60, 0], ['20° S en julio', -20, 6]].map(([l, la, m]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { s.lat = la; latS.set(la); s.m = m; mS.set(m); mSeg.set(m); s.varb = 'temp'; vSeg.set('temp'); upd(); }; return b; }))));
    upd(); pick(H.place.lat, H.place.lon);

    el.append(H.h('div', { class: 'card', style: { background: 'var(--soft)' } }, H.h('h4', {}, 'Ejercicio de autoevaluación 4 del manual'),
      H.openQ('¿Cuál es el efecto que producen las corrientes marinas sobre la horizontalidad de las isotermas a escala mundial?', 'Las corrientes desvían las isotermas de los paralelos. Las <b>cálidas</b> (Golfo y deriva noratlántica, Kuroshio, Brasil, Agujas) las empujan hacia los polos: frente a Noruega la isoterma de 0 °C de enero llega más allá del círculo polar. Las <b>frías</b> (Canarias, California, Humboldt, Benguela, Labrador, Oyashio) las empujan hacia el ecuador. En latitudes medias y altas las costas occidentales de los continentes quedan así más templadas que las orientales; en la zona tropical la disimetría se invierte, porque las corrientes frías bañan las fachadas occidentales. Activa «Corrientes marinas» en el mapa para comprobarlo.')));
    el.append(H.selfCheck([
      { q: '¿Por qué las isotermas de los mapas mundiales suelen reducirse al nivel del mar?', opts: ['Para que el mapa ocupe menos espacio', 'Para eliminar el efecto de la altitud y comparar lugares', 'Porque los termómetros están siempre a nivel del mar', 'Para corregir el efecto de las corrientes'], a: 1, ex: 'Sin la reducción, las montañas (Tíbet, Andes) dominarían el mapa y ocultarían los efectos de la latitud y de la distribución de tierras y mares.' },
      { q: 'En enero, en latitudes medias del hemisferio norte, las isotermas se curvan…', opts: ['Hacia el sur sobre los continentes y hacia el norte sobre los océanos', 'Hacia el norte sobre los continentes', 'No se curvan', 'Siempre hacia el ecuador'], a: 0, ex: 'Los continentes están más fríos que el mar en invierno: a igual latitud, la temperatura es menor en tierra.' },
      { q: '¿Por qué el ecuador térmico se desplaza más hacia el norte en julio que hacia el sur en enero?', opts: ['Por la excentricidad de la órbita', 'Porque en el hemisferio norte hay mucha más superficie continental, que se calienta más', 'Por las corrientes marinas frías', 'Por la inclinación del eje'], a: 1, ex: 'Las grandes masas continentales del hemisferio norte (Sahara, Arabia, Asia central) se recalientan en verano.' },
      { q: '¿Dónde se registran las temperaturas medias de enero más bajas del hemisferio norte?', opts: ['En el polo norte', 'En el nordeste de Siberia', 'En Groenlandia', 'En Alaska'], a: 1, ex: 'Verjoyansk y Oymyakón superan los −45 °C de media en enero: es el efecto de la continentalidad.' },
    ]));
  },
});
