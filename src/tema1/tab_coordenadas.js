/* ===================== 3 · ORIENTACIÓN Y COORDENADAS ===================== */
/* Globo ortográfico interactivo reutilizable */
H.globe = (canvas, opts = {}) => {
  const G = { lat0: opts.lat0 ?? 30, lon0: opts.lon0 ?? 0, marks: [], lines: [], grid: opts.grid ?? 15, onClick: null, overlay: null, night: null };
  let cache = null, cacheKey = '';
  G.par = (la) => { const a = []; for (let lo = -180; lo <= 180; lo += 2) a.push([la, lo]); return a; };
  G.mer = (lo) => { const a = []; for (let la = -90; la <= 90; la += 2) a.push([la, lo]); return a; };
  const st = H.autoCanvas(canvas, (w) => Math.min(w, opts.max ?? 520), (ctx, w, h) => {
    const S = Math.min(w, h), r = S / 2 - 6, cx = w / 2, cy = h / 2;
    G.r = r; G.cx = cx; G.cy = cy;
    const pr = H.ortho(G.lat0, G.lon0); G.pr = pr;
    const N = Math.round(2 * r);
    const key = [G.lat0.toFixed(2), G.lon0.toFixed(2), N, G.night ? G.night.join() : ''].join('|');
    if (key !== cacheKey) {
      const img = ctx.createImageData(N, N); const d = img.data;
      const ns = G.night ? (() => { const [la, lo] = G.night; const p = la * H.D2R, l = lo * H.D2R; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; })() : null;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i + 0.5 - r) / r, y = (r - j - 0.5) / r; const ll = pr.inv(x, y); const k = (j * N + i) * 4;
        if (!ll) { d[k + 3] = 0; continue; }
        let c = H.surface(ll[0], ll[1]);
        const shade = 0.78 + 0.22 * Math.sqrt(Math.max(0, 1 - x * x - y * y));
        let f = shade;
        if (ns) { const p = ll[0] * H.D2R, l = ll[1] * H.D2R; const dot = Math.cos(p) * Math.cos(l) * ns[0] + Math.cos(p) * Math.sin(l) * ns[1] + Math.sin(p) * ns[2]; const t = H.clamp((dot + 0.06) / 0.12, 0, 1); f *= 0.42 + 0.58 * t; }
        d[k] = c[0] * f; d[k + 1] = c[1] * f; d[k + 2] = c[2] * f; d[k + 3] = 255;
      }
      const off = document.createElement('canvas'); off.width = N; off.height = N; off.getContext('2d').putImageData(img, 0, 0);
      cache = off; cacheKey = key;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(cache, cx - r, cy - r, 2 * r, 2 * r);
    ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    const P = (la, lo) => { const p = pr.fwd(la, lo); return [cx + p[0] * r, cy - p[1] * r, p[2]]; };
    G.P = P;
    const poly = (pts, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false; for (const [la, lo] of pts) { const p = P(la, lo); if (p[2] < 0) { on = false; continue; } on ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); on = true; } ctx.stroke(); ctx.setLineDash([]); };
    G.poly = poly;
    const par = G.par, mer = G.mer;
    if (G.grid) {
      for (let la = -90 + G.grid; la < 90; la += G.grid) if (la) poly(par(la), H.COL.grid, 0.8);
      for (let lo = -180; lo < 180; lo += G.grid) if (lo) poly(mer(lo), H.COL.grid, 0.8);
      poly(par(0), '#1c2836', 1.6); poly(mer(0), '#1c2836', 1.6);
    }
    for (const L of G.lines) poly(L.pts, L.color, L.width || 2, L.dash);
    if (G.overlay) G.overlay(ctx, P, w, h);
    for (const m of G.marks) {
      const p = P(m.lat, m.lon); if (p[2] < 0) continue;
      ctx.fillStyle = m.color || '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p[0], p[1], m.r || 5, 0, 7); ctx.fill(); ctx.stroke();
      if (m.label) { ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(m.label, p[0] + 7, p[1] - 3); ctx.fillStyle = m.color || '#b4531d'; ctx.fillText(m.label, p[0] + 7, p[1] - 3); }
    }
  });
  G.st = st; G.redraw = st.redraw;
  // arrastrar para girar, clic para seleccionar
  let start = null, moved = false;
  H.drag(canvas, {
    down: (e) => { start = st.pos(e); moved = false; start.push(G.lat0, G.lon0); },
    move: (e) => { const p = st.pos(e); const dx = p[0] - start[0], dy = p[1] - start[1]; if (Math.hypot(dx, dy) > 3) moved = true; if (!moved) return; const k = 90 / G.r; G.lon0 = ((start[3] - dx * k + 540) % 360) - 180; G.lat0 = H.clamp(start[2] + dy * k, -90, 90); st.redraw(); },
    up: (e) => { if (!moved && G.onClick && start) { const x = (start[0] - G.cx) / G.r, y = (G.cy - start[1]) / G.r; const ll = G.pr.inv(x, y); if (ll) G.onClick(ll[0], ll[1]); } },
  });
  canvas.style.cursor = 'grab';
  return G;
};

H.tab({
  id: 'coordenadas', nav: 'Orientación y coordenadas', title: 'Orientación y coordenadas',
  init(el) {
    el.append(H.intro('Rotación · apartado 2.1.1', 'Orientación y situación: la red geográfica',
      'Los polos, extremos del eje de rotación, son las referencias fijas a partir de las que se trazan meridianos y paralelos. Con ellos, la latitud y la longitud localizan cualquier punto sin ambigüedad.',
      'Manual: 2.1.1<br>Figuras 1.4, 1.5 y 1.6'));

    /* ---------- globo ---------- */
    const pt = { lat: H.place.lat, lon: H.place.lon };
    const cv = H.h('canvas');
    const G = H.globe(cv, { lat0: 35, lon0: -10 });
    const ro = { lat: H.ro('Latitud', 'hl'), lon: H.ro('Longitud', 'hl'), dec: H.ro('Notación decimal'), hem: H.ro('Hemisferios'), geo: H.ro('Latitud geocéntrica', 'bl') };
    const latSvg = H.h('div'), lonSvg = H.h('div');
    const sch = (kind, ang) => {
      const a = ang * H.D2R, R = 70, cx = 90, cy = 90;
      if (kind === 'lat') {
        const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
        const sweep = ang >= 0 ? 0 : 1; const ax = cx + 28 * Math.cos(a), ay = cy - 28 * Math.sin(a);
        return `<svg viewBox="0 0 180 185"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef4f7" stroke="#1c2836"/>
          <line x1="${cx - R - 8}" y1="${cy}" x2="${cx + R + 8}" y2="${cy}" stroke="#1c2836" stroke-width="1.5"/><text x="${cx - R - 6}" y="${cy - 5}" font-size="10" fill="#5a6878">Ecuador</text>
          <line x1="${cx}" y1="${cy - R - 8}" x2="${cx}" y2="${cy + R + 8}" stroke="#888" stroke-dasharray="3 3"/><text x="${cx + 3}" y="${cy - R - 2}" font-size="10" fill="#5a6878">PN</text>
          <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#b4531d" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#b4531d"/>
          <path d="M${cx + 28} ${cy} A 28 28 0 0 ${sweep} ${ax} ${ay}" fill="none" stroke="#b4531d" stroke-width="2"/>
          <text x="${cx + 34}" y="${cy - Math.sign(ang) * 10 + 4}" font-size="12" fill="#b4531d" font-weight="700">β</text>
          <text x="90" y="180" font-size="11" text-anchor="middle" fill="#1c2836">Latitud (corte meridiano)</text></svg>`;
      }
      // longitud vista desde encima del polo norte; Greenwich hacia abajo, el este en sentido antihorario
      const g = Math.PI / 2; // Greenwich hacia abajo (ángulo de pantalla)
      const t = g - a; // antihorario visto desde arriba -> este a la derecha
      const x = cx + R * Math.cos(t), y = cy + R * Math.sin(t);
      const ax = cx + 28 * Math.cos(t), ay = cy + 28 * Math.sin(t);
      return `<svg viewBox="0 0 180 185"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#eef4f7" stroke="#1c2836"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="#1c2836"/><text x="${cx + 5}" y="${cy - 4}" font-size="10" fill="#5a6878">PN</text>
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + R}" stroke="#1c2836" stroke-width="1.5"/><text x="${cx + 4}" y="${cy + R - 4}" font-size="10" fill="#1c2836">Greenwich 0°</text>
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#1f6f8b" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#1f6f8b"/>
        <path d="M${cx} ${cy + 28} A 28 28 0 ${Math.abs(ang) > 180 ? 1 : 0} ${ang >= 0 ? 0 : 1} ${ax} ${ay}" fill="none" stroke="#1f6f8b" stroke-width="2"/>
        <text x="${cx + (ang >= 0 ? 16 : -26)}" y="${cy + 48}" font-size="12" fill="#1f6f8b" font-weight="700">α</text>
        <text x="${cx + R + 4}" y="${cy + 4}" font-size="10" fill="#5a6878">E</text><text x="${cx - R - 12}" y="${cy + 4}" font-size="10" fill="#5a6878">O</text>
        <text x="90" y="180" font-size="11" text-anchor="middle" fill="#1c2836">Longitud (vista desde el PN)</text></svg>`;
    };
    const upd = () => {
      G.lines = [{ pts: G.mer(pt.lon), color: '#1f6f8b', width: 2.4 }, { pts: G.par(pt.lat), color: '#b4531d', width: 2.4 }];
      G.marks = [{ lat: pt.lat, lon: pt.lon, color: '#b4531d', label: 'X', r: 6 }];
      if (chal.on && chal.target && chal.answered) G.marks.push({ lat: chal.target[0], lon: chal.target[1], color: '#2d7a4c', label: 'objetivo', r: 6 });
      G.redraw();
      ro.lat.v.textContent = H.dms(pt.lat, 'N', 'S');
      ro.lon.v.textContent = H.dms(pt.lon, 'E', 'O');
      ro.dec.v.innerHTML = `${H.f(pt.lat, 4)}°, ${H.f(pt.lon, 4)}°`;
      ro.hem.v.innerHTML = `${pt.lat >= 0 ? 'Norte' : 'Sur'} · ${pt.lon >= 0 ? 'Oriental' : 'Occidental'}`;
      const psi = Math.atan((1 - H.K.f) ** 2 * Math.tan(pt.lat * H.D2R)) * H.R2D;
      ro.geo.v.innerHTML = `${H.dm(psi)} <small>(${H.f((pt.lat - psi) * 60, 1)}′ menos)</small>`;
      latSvg.innerHTML = sch('lat', pt.lat); lonSvg.innerHTML = sch('lon', pt.lon);
    };
    G.onClick = (la, lo) => { pt.lat = la; pt.lon = lo; if (chal.on) chal.answer(); upd(); };
    const latIn = H.h('input', { type: 'number', step: '0.01', min: -90, max: 90, placeholder: 'lat (N +)' });
    const lonIn = H.h('input', { type: 'number', step: '0.01', min: -180, max: 180, placeholder: 'lon (E +)' });
    const goBtn = H.h('button', { class: 'btn sm', type: 'button' }, 'Situar');
    goBtn.onclick = () => { const la = parseFloat(latIn.value), lo = parseFloat(lonIn.value); if (isFinite(la) && isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180) { pt.lat = la; pt.lon = lo; G.lat0 = H.clamp(la, -60, 60); G.lon0 = lo; upd(); } };
    const meBtn = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Mi municipio');
    meBtn.onclick = () => { pt.lat = H.place.lat; pt.lon = H.place.lon; G.lat0 = 35; G.lon0 = pt.lon; upd(); };

    /* reto de localización */
    const chal = { on: false, n: 0, sum: 0, target: null, answered: false };
    const PLACES = [['Quito', -0.18, -78.47], ['Ciudad del Cabo', -33.92, 18.42], ['Tokio', 35.68, 139.69], ['Reikiavik', 64.15, -21.94], ['Sídney', -33.87, 151.21], ['Nueva York', 40.71, -74.01], ['El Cairo', 30.04, 31.24], ['Lima', -12.05, -77.04], ['Bombay', 19.08, 72.88], ['Anchorage', 61.22, -149.9], ['Buenos Aires', -34.6, -58.38], ['Nairobi', -1.29, 36.82]];
    const chalBox = H.h('div', { class: 'card', style: { background: 'var(--soft)' } });
    const newTarget = () => {
      const useCoord = Math.random() < 0.5;
      if (useCoord) { const la = Math.round((Math.random() * 140 - 70) / 5) * 5, lo = Math.round((Math.random() * 340 - 170) / 5) * 5; chal.target = [la, lo]; chal.label = `${Math.abs(la)}° ${la >= 0 ? 'N' : 'S'}, ${Math.abs(lo)}° ${lo >= 0 ? 'E' : 'O'}`; chal.hintTxt = 'coordenadas'; }
      else { const p = PLACES[Math.floor(Math.random() * PLACES.length)]; chal.target = [p[1], p[2]]; chal.label = `${p[0]} (${H.dm(p[1])}, ${H.dm(p[2])})`; chal.hintTxt = 'ciudad'; }
      chal.answered = false; renderChal();
    };
    chal.answer = () => {
      if (chal.answered) return; chal.answered = true;
      const d = H.haversine(pt.lat, pt.lon, chal.target[0], chal.target[1]); chal.n++; chal.sum += d; chal.last = d; renderChal();
    };
    const renderChal = () => {
      chalBox.innerHTML = '';
      if (!chal.on) { chalBox.append(H.h('h4', {}, 'Reto: localiza el punto'), H.h('p', { class: 'small' }, 'Se te pedirán coordenadas o ciudades. Gira el globo y haz clic donde creas que están. Se mide el error en kilómetros sobre la superficie terrestre.'), H.h('button', { class: 'btn acc sm', type: 'button', onclick: () => { chal.on = true; chal.n = 0; chal.sum = 0; newTarget(); } }, 'Empezar')); return; }
      chalBox.append(H.h('h4', {}, `Reto · ronda ${chal.n + (chal.answered ? 0 : 1)} de 5`), H.h('p', { style: { fontFamily: 'var(--serif)', fontSize: '1.2rem', margin: '4px 0' } }, 'Haz clic en: ', H.h('b', {}, chal.label)));
      if (chal.answered) {
        chalBox.append(H.h('p', { class: 'small' }, `Error: ${H.f(chal.last)} km (${H.f(chal.last / 111.2, 1)}° de arco). Media: ${H.f(chal.sum / chal.n)} km.`));
        if (chal.n < 5) chalBox.append(H.h('button', { class: 'btn sm', type: 'button', onclick: newTarget }, 'Siguiente'));
        else chalBox.append(H.h('p', {}, H.h('b', {}, chal.sum / chal.n < 500 ? 'Excelente orientación.' : chal.sum / chal.n < 1500 ? 'Bien: repasa los signos N/S y E/O.' : 'Revisa qué es latitud y qué es longitud.')), H.h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { chal.on = false; upd(); renderChal(); } }, 'Terminar'));
      } else chalBox.append(H.h('p', { class: 'small' }, 'El objetivo aparecerá en verde al responder.'));
      upd();
    };
    renderChal();

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Latitud y longitud en el globo'),
      H.h('p', { class: 'sub' }, 'Arrastra para girar el globo y haz clic para situar el punto X. En azul, su meridiano (todos sus puntos tienen la misma longitud); en naranja, su paralelo (misma latitud). Las líneas gruesas negras son el Ecuador y el meridiano de Greenwich.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz' }, cv), H.h('p', { class: 'hint' }, 'Red cada 15°. Arrastra para girar; clic para situar.')),
        H.h('div', {}, H.h('div', { class: 'readouts' }, ro.lat, ro.lon, ro.dec, ro.hem),
          H.h('div', { class: 'grid2 even', style: { marginTop: '10px', gap: '6px' } }, latSvg, lonSvg),
          H.h('div', { class: 'row', style: { marginTop: '6px' } }, latIn, lonIn, goBtn, meBtn),
          H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.geo),
          H.h('p', { class: 'small' }, 'La latitud del manual (ángulo con el centro de la Tierra) es la geocéntrica. Los mapas usan la geodésica, medida sobre la perpendicular al elipsoide: es la que dan el GPS y el MTN.'),
          chalBox))));
    upd();

    /* ---------- longitud de un grado ---------- */
    const ch = H.chart(H.h('canvas'), 0.45);
    const roD = { par: H.ro('1° de paralelo', 'hl'), mer: H.ro('1° de meridiano', 'hl'), v: H.ro('Velocidad de rotación', 'bl'), m: H.ro('1′ de latitud ≈ 1 milla náutica') };
    const e2 = H.K.f * (2 - H.K.f);
    const Nf = (p) => H.K.a / Math.sqrt(1 - e2 * Math.sin(p) ** 2), Mf = (p) => H.K.a * (1 - e2) / Math.pow(1 - e2 * Math.sin(p) ** 2, 1.5);
    const updD = () => {
      const pa = [], me = [];
      for (let la = 0; la <= 90; la += 1) { const p = la * H.D2R; pa.push([la, Nf(p) * Math.cos(p) * H.D2R]); me.push([la, Mf(p) * H.D2R]); }
      const L = Math.abs(H.place.lat), p = L * H.D2R;
      const dp = Nf(p) * Math.cos(p) * H.D2R, dm = Mf(p) * H.D2R;
      ch.draw({ xMin: 0, xMax: 90, yMin: 0, yMax: 120, xLabel: 'Latitud (°)', yLabel: 'km por grado', xTicks: [0, 15, 30, 45, 60, 75, 90].map((v) => ({ v, label: v + '°' })), yTicks: [0, 20, 40, 60, 80, 100, 120].map((v) => ({ v })),
        series: [{ pts: pa, color: '#b4531d', width: 2.5 }, { pts: me, color: '#1f6f8b', width: 2.5 }],
        markers: [{ x: L, y: dp, color: '#b4531d', label: `${H.place.name}: ${H.f(dp, 1)} km` }, { x: L, y: dm, color: '#1f6f8b' }] });
      roD.par.v.innerHTML = `${H.f(dp, 2)} <small>km</small>`; roD.mer.v.innerHTML = `${H.f(dm, 2)} <small>km</small>`;
      roD.v.v.innerHTML = `${H.f(H.K.omega * Nf(p) * Math.cos(p) * 3600)} <small>km/h</small>`;
      roD.m.v.innerHTML = `${H.f(dm / 60 * 1000)} <small>m</small>`;
    };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, '¿Cuánto mide un grado?'),
      H.h('p', { class: 'sub' }, 'Los grados de paralelo se acortan hacia los polos (los paralelos son círculos cada vez menores); los de meridiano son casi iguales y crecen un poco hacia los polos por el achatamiento. Valores sobre el elipsoide WGS84 en la latitud de tu municipio.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz' }, ch.st.canvas), H.h('div', { class: 'legend' }, H.h('span', {}, H.h('i', { style: { background: '#b4531d' } }), 'Grado de paralelo (longitud)'), H.h('span', {}, H.h('i', { style: { background: '#1f6f8b' } }), 'Grado de meridiano (latitud)'))),
        H.h('div', {}, H.h('div', { class: 'readouts' }, roD.par, roD.mer, roD.v, roD.m),
          H.h('p', { class: 'small', html: 'Ecuador: 1° de paralelo = 111,32 km; 1° de meridiano = 110,57 km. Polo: 1° de meridiano = 111,69 km. Todos los puntos giran 360° al día, pero la velocidad lineal es máxima en el Ecuador (≈ 1.670 km/h) y nula en los polos.' })))));
    updD();

    /* ---------- rosa de los vientos ---------- */
    const R16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const rose = H.h('div', { class: 'viz' }); const rmsg = H.h('p', { class: 'small' }); let ask = null, rok = 0, rn = 0;
    const drawRose = (hl = {}) => {
      let s = `<svg viewBox="0 0 300 300" style="max-width:340px;margin:auto">`;
      s += `<circle cx="150" cy="150" r="128" fill="#fffdf8" stroke="#ddd5c3"/>`;
      R16.forEach((n, i) => {
        const a = (i * 22.5 - 90) * H.D2R, len = i % 4 === 0 ? 110 : i % 2 === 0 ? 82 : 62, wid = i % 4 === 0 ? 15 : 9;
        const tx = 150 + len * Math.cos(a), ty = 150 + len * Math.sin(a), lx = 150 + wid * Math.cos(a + Math.PI / 2), ly = 150 + wid * Math.sin(a + Math.PI / 2), rx = 150 - wid * Math.cos(a + Math.PI / 2), ry = 150 - wid * Math.sin(a + Math.PI / 2);
        const col = hl[n] || (i % 4 === 0 ? '#1c2836' : i % 2 === 0 ? '#b4531d' : '#d9b48f');
        s += `<path data-r="${n}" d="M${lx} ${ly} L${tx} ${ty} L${rx} ${ry}Z" fill="${col}" stroke="#fff" stroke-width="1" style="cursor:pointer"/>`;
        const qx = 150 + (len + 13) * Math.cos(a), qy = 150 + (len + 13) * Math.sin(a);
        if (!ask) s += `<text x="${qx}" y="${qy + 4}" text-anchor="middle" font-size="${i % 4 === 0 ? 14 : 9}" font-weight="700" fill="#1c2836">${n}</text>`;
      });
      s += `</svg>`; rose.innerHTML = s;
      H.$$('[data-r]', rose).forEach((p) => p.addEventListener('click', () => { if (!ask) return; rn++; const ok = p.dataset.r === ask; if (ok) rok++; rmsg.innerHTML = `${ok ? '<span class="pill ok">Bien</span>' : `<span class="pill ko">No</span> Has marcado ${p.dataset.r}.`} Aciertos: ${rok}/${rn}. `; const h = {}; h[ask] = '#2d7a4c'; if (!ok) h[p.dataset.r] = '#b0393a'; drawRose(h); setTimeout(nextQ, 1100); }));
    };
    const nextQ = () => { ask = R16[1 + Math.floor(Math.random() * 15)]; if (ask === 'N') ask = 'NNO'; qlbl.innerHTML = `Marca el rumbo <b>${ask}</b>`; drawRose(); };
    const qlbl = H.h('p', { style: { fontFamily: 'var(--serif)', fontSize: '1.15rem' } }, '');
    const startR = H.h('button', { class: 'btn acc sm', type: 'button' }, 'Ponerme a prueba');
    startR.onclick = () => { rok = 0; rn = 0; rmsg.textContent = ''; nextQ(); };
    const showR = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Ver nombres');
    showR.onclick = () => { ask = null; qlbl.textContent = ''; drawRose(); };
    drawRose();
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Orientación: la rosa de los vientos'),
      H.h('div', { class: 'grid2' }, rose, H.h('div', {},
        H.h('p', {}, 'Con los brazos en cruz, la mano derecha hacia donde sale el Sol (este) y la izquierda hacia donde se pone (oeste), tenemos delante el norte y detrás el sur. Entre los cuatro puntos cardinales se intercalan los rumbos intermedios (NE, SE, SO, NO) y los de tercer orden (NNE, ENE…), que se nombran empezando por el cardinal más próximo.'),
        H.info('Precisión: el Sol sale exactamente por el este y se pone por el oeste solo en los equinoccios. En verano sale por el NE y en invierno por el SE. Compruébalo con el azimut del orto en la pestaña <a href="#estaciones">Traslación y estaciones</a>.'),
        H.h('div', { class: 'row' }, startR, showR), qlbl, rmsg))));

    H.onPlace(() => { updD(); });
    el.append(H.fix('apartado 2.1.1', [
      'El Real Observatorio de Greenwich no está «al oeste de Londres», sino <b>al sureste</b> de su centro.',
      'La rotación es en sentido contrario a las agujas del reloj <b>vista desde el polo norte</b>; desde el polo sur se ve en sentido horario. Lo invariante es que gira de oeste a este.',
      'La latitud definida en el manual (recta al centro de la Tierra) es la <b>geocéntrica</b>; las coordenadas de mapas y GPS usan la <b>geodésica</b>. La diferencia máxima, a 45°, es de unos 11,5′.',
    ]));
    el.append(H.selfCheck([
      { q: '¿Qué tienen en común todos los puntos situados sobre un mismo meridiano?', opts: ['La misma latitud', 'La misma longitud', 'La misma altitud', 'La misma duración del día durante todo el año'], a: 1, ex: 'Un meridiano une puntos de igual longitud. Los de igual latitud forman un paralelo.' },
      { q: '¿Qué paralelo es un círculo máximo?', opts: ['El trópico de Cáncer', 'El círculo polar ártico', 'El Ecuador', 'Todos los paralelos'], a: 2, ex: 'Solo el Ecuador divide la Tierra en dos mitades iguales. En cambio, cada pareja de meridianos opuestos forma un círculo máximo.' },
      { q: 'Un punto a 60° de latitud. ¿Cuánto mide, aproximadamente, un grado de su paralelo?', opts: ['111 km', '96 km', '56 km', '0 km'], a: 2, ex: '111,3 × cos 60° ≈ 55,8 km. En los polos sería 0.' },
      { q: '¿Cuál es el rango de valores de la longitud?', opts: ['0° a 90° N o S', '0° a 180° E u O', '0° a 360°', '−90° a +90°'], a: 1, ex: 'La longitud se mide a partir del meridiano de Greenwich hasta 180° hacia el este o hacia el oeste. La latitud va de 0° a 90° N o S.' },
      { q: 'Un punto tiene coordenadas 33° 52′ S, 151° 13′ E. ¿En qué hemisferios está?', opts: ['Norte y occidental', 'Sur y oriental', 'Sur y occidental', 'Norte y oriental'], a: 1, ex: 'S indica hemisferio sur; E, al este de Greenwich (hemisferio oriental). Es Sídney.' },
    ]));
  },
});
