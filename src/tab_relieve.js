/* ===================== 9 · CURVAS DE NIVEL Y PERFIL ===================== */
H.tab({
  id: 'relieve', nav: 'Curvas de nivel', title: 'Altimetría: curvas de nivel',
  init(el) {
    el.append(H.intro('Mapa · apartado 3.3', 'La representación del relieve: curvas de nivel',
      'Las curvas de nivel (isohipsas) unen puntos de igual altitud: es como cortar el relieve con planos horizontales separados por una distancia constante, la equidistancia. Su forma y separación revelan las formas del terreno y permiten medir altitudes, pendientes y perfiles.',
      'Manual: 3.3<br>Figura 1.17'));

    const s = { seed: 7, eq: 20, contours: true, hypso: true, shade: true, steps: false, A: [0.12, 0.62], B: [0.88, 0.3], ve: 2, hover: null };
    let T = H.TERR.make(s.seed, 220, 10), rng = H.TERR.range(T), img = null, imgKey = '';
    const cv = H.h('canvas'); const tip = H.h('div', { class: 'tooltip' });
    const cs = H.autoCanvas(cv, (w) => Math.min(w, 560), (ctx, w, h) => {
      const key = [s.seed, s.hypso, s.shade, s.steps ? s.eq : 0, Math.round(w)].join('|');
      if (key !== imgKey) { img = H.TERR.render(T, Math.round(w), Math.round(h), { hypso: s.hypso, shade: s.shade, steps: s.steps ? s.eq : null }); imgKey = key; }
      ctx.drawImage(img, 0, 0, w, h);
      const sx = w / (T.N - 1), sy = h / (T.N - 1);
      if (s.contours) {
        const master = s.eq * 5;
        for (let L = Math.ceil(rng[0] / s.eq) * s.eq; L < rng[1]; L += s.eq) {
          const m = L % master === 0; ctx.strokeStyle = m ? 'rgba(110,55,20,.95)' : 'rgba(110,55,20,.55)'; ctx.lineWidth = m ? 1.4 : 0.7;
          ctx.beginPath(); for (const [p, q] of H.TERR.iso(T, L)) { ctx.moveTo(p[0] * sx, p[1] * sy); ctx.lineTo(q[0] * sx, q[1] * sy); } ctx.stroke();
          if (m) { // rótulo en un segmento de la curva maestra
            const segs = H.TERR.iso(T, L); if (segs.length > 30) { const sg = segs[Math.floor(segs.length * ((L / master) % 3 + 1) / 4)]; const x = sg[0][0] * sx, y = sg[0][1] * sy; ctx.font = 'bold 10px system-ui'; ctx.fillStyle = 'rgba(255,253,248,.85)'; const tw = ctx.measureText(L).width; ctx.fillRect(x - tw / 2 - 2, y - 7, tw + 4, 12); ctx.fillStyle = '#6e3714'; ctx.textAlign = 'center'; ctx.fillText(L, x, y + 3); }
          }
        }
      }
      ctx.strokeStyle = '#2b78b8'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = 0; y <= 1.001; y += 0.01) { const x = T.river(y); y ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h); } ctx.stroke();
      // línea de perfil
      const A = [s.A[0] * w, s.A[1] * h], B = [s.B[0] * w, s.B[1] * h];
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke();
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.stroke();
      for (const [P, l] of [[A, 'A'], [B, 'B']]) { ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P[0], P[1], 9, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(l, P[0], P[1] + 4); }
      if (s.hover != null) { const t = s.hover; const P = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.arc(P[0], P[1], 5, 0, 7); ctx.fill(); }
      // escala gráfica 2 km
      const km = w / T.km; ctx.fillStyle = 'rgba(255,253,248,.9)'; ctx.fillRect(8, h - 30, km * 2 + 24, 22); ctx.fillStyle = '#1c2836'; ctx.fillRect(16, h - 16, km, 5); ctx.strokeStyle = '#1c2836'; ctx.strokeRect(16 + km, h - 16, km, 5); ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('0', 16, h - 19); ctx.fillText('1', 16 + km, h - 19); ctx.fillText('2 km', 16 + 2 * km, h - 19);
      ctx.fillStyle = '#1c2836'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'right'; ctx.fillText('N ↑', w - 10, 20);
    });
    // arrastrar A y B
    let drag = null;
    H.drag(cv, {
      down: (e) => { const [x, y] = cs.pos(e); const dA = Math.hypot(x - s.A[0] * cs.w, y - s.A[1] * cs.h), dB = Math.hypot(x - s.B[0] * cs.w, y - s.B[1] * cs.h); drag = dA < 18 ? 'A' : dB < 18 ? 'B' : 'new'; if (drag === 'new') { s.A = [x / cs.w, y / cs.h]; s.B = [x / cs.w, y / cs.h]; drag = 'B'; } },
      move: (e) => { const [x, y] = cs.pos(e); s[drag] = [H.clamp(x / cs.w, 0, 1), H.clamp(y / cs.h, 0, 1)]; cs.redraw(); updProfile(); }, up: () => { drag = null; },
    });
    cv.addEventListener('mousemove', (e) => { const [x, y] = cs.pos(e); const z = H.TERR.at(T, x / cs.w, y / cs.h); tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${H.f(z)} m`; });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

    /* perfil */
    const pch = H.chart(H.h('canvas'), 0.36);
    const pro = { dh: H.ro('Distancia horizontal'), dr: H.ro('Distancia sobre el terreno'), des: H.ro('Desnivel A → B', 'hl'), pm: H.ro('Pendiente media', 'hl'), pmax: H.ro('Pendiente máxima', 'bl'), z: H.ro('Cota máx. / mín.') };
    let prof = [];
    const updProfile = () => {
      const n = 220, L = Math.hypot((s.B[0] - s.A[0]) * T.km, (s.B[1] - s.A[1]) * T.km);
      prof = []; for (let i = 0; i <= n; i++) { const t = i / n; prof.push([t * L, H.TERR.at(T, s.A[0] + (s.B[0] - s.A[0]) * t, s.A[1] + (s.B[1] - s.A[1]) * t)]); }
      let real = 0, smax = 0; for (let i = 1; i <= n; i++) { const dx = (prof[i][0] - prof[i - 1][0]) * 1000, dz = prof[i][1] - prof[i - 1][1]; real += Math.hypot(dx, dz); if (dx > 0) smax = Math.max(smax, Math.abs(dz / dx)); }
      const zs = prof.map((p) => p[1]), zmin = Math.min(...zs), zmax = Math.max(...zs);
      // escala vertical con exageración: la relación de aspecto del gráfico define la exageración
      const span = Math.max(L, 0.2);
      const ratio = pch.st.w ? (pch.st.h - 52) / (pch.st.w - 68) : 0.3; // alto/ancho del área de dibujo
      const vRangeM = span * 1000 * ratio / s.ve; // metros que caben en vertical con la exageración elegida
      const mid = (zmin + zmax) / 2; let lo = Math.max(0, mid - vRangeM / 2), hi = lo + vRangeM;
      if (zmax > hi) { hi = zmax + 20; lo = hi - vRangeM; } if (zmin < lo) { lo = zmin - 20; hi = lo + vRangeM; }
      const stp = [10, 20, 50, 100, 200, 500, 1000].find((v) => (hi - lo) / v <= 8) || 1000;
      const yT = []; for (let v = Math.ceil(lo / stp) * stp; v <= hi; v += stp) yT.push({ v, label: H.f(v) + ' m' });
      const xs = [0.1, 0.2, 0.25, 0.5, 1, 2].find((v) => span / v <= 10) || 2; const xT = []; for (let v = 0; v <= span + 1e-9; v += xs) xT.push({ v, label: H.f(v, xs < 1 ? 2 : 0) + ' km' });
      pch.draw({ xMin: 0, xMax: span, yMin: lo, yMax: hi, xTicks: xT, yTicks: yT, series: [{ pts: prof, color: '#6e3714', width: 2, fill: 'rgba(200,158,106,.45)' }], markers: [{ x: 0, y: prof[0][1], label: 'A', color: '#b4531d' }, { x: L, y: prof[n][1], label: 'B', color: '#b4531d', align: 'right' }],
        after: (ctx, X, Y, w, h) => { ctx.fillStyle = '#5a6878'; ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.fillText(`Exageración vertical ×${s.ve}`, w - 18, 24); } });
      pro.dh.v.innerHTML = `${H.f(L, 2)} <small>km</small>`; pro.dr.v.innerHTML = `${H.f(real / 1000, 2)} <small>km</small>`;
      const des = prof[n][1] - prof[0][1]; pro.des.v.innerHTML = `${H.fs(des)} <small>m</small>`;
      pro.pm.v.innerHTML = L > 0 ? `${H.f(Math.abs(des) / (L * 10), 1)} % <small>(${H.f(Math.atan(Math.abs(des) / (L * 1000)) * H.R2D, 1)}°)</small>` : '—';
      pro.pmax.v.innerHTML = `${H.f(smax * 100, 0)} % <small>(${H.f(Math.atan(smax) * H.R2D, 1)}°)</small>`;
      pro.z.v.innerHTML = `${H.f(zmax)} / ${H.f(zmin)} <small>m</small>`;
    };
    pch.st.canvas.addEventListener('mousemove', (e) => { if (!prof.length) return; const x = pch.xAt(e); s.hover = H.clamp(x / prof[prof.length - 1][0], 0, 1); cs.redraw(); });
    pch.st.canvas.addEventListener('mouseleave', () => { s.hover = null; cs.redraw(); });

    const chk = (k, l) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, l); };
    const eqSeg = H.seg([[10, '10 m'], [20, '20 m'], [50, '50 m'], [100, '100 m']], s.eq, (v) => { s.eq = v; cs.redraw(); });
    const veSeg = H.seg([[1, '×1 (real)'], [2, '×2'], [5, '×5'], [10, '×10']], s.ve, (v) => { s.ve = v; updProfile(); });
    const regen = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Otro terreno');
    regen.onclick = () => { s.seed = (s.seed * 7 + 13) % 997; T = H.TERR.make(s.seed, 220, 10); rng = H.TERR.range(T); imgKey = ''; cs.redraw(); updProfile(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Mapa topográfico y perfil'),
      H.h('p', { class: 'sub' }, 'Terreno simulado de 10 × 10 km con una sierra, un río, un cerro cónico y una meseta. Arrastra A o B para trazar el perfil, o haz clic y arrastra en otro lugar para trazar uno nuevo. Las curvas gruesas son las maestras (cada cinco equidistancias), con su cota.'),
      H.h('div', { class: 'grid2' },
        H.h('div', {}, H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cv, tip)),
        H.h('div', {},
          H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)' } }, 'Equidistancia'), eqSeg,
          H.h('div', { style: { margin: '10px 0' } }, chk('contours', 'Curvas de nivel'), chk('hypso', 'Tintas hipsométricas'), chk('steps', 'Tintas por intervalos'), chk('shade', 'Sombreado (luz del NO)')),
          regen,
          H.h('div', { class: 'card', style: { background: 'var(--soft)', marginTop: '12px' } },
            H.html(`<p class="small" style="color:var(--ink);margin:0"><b>Leer las curvas.</b> Curvas juntas: pendiente fuerte; separadas: suave. Las curvas en forma de V apuntan aguas arriba en los valles y aguas abajo en las divisorias (espolones). Círculos concéntricos crecientes: cerro; decrecientes: depresión. Para escalas pequeñas, las tintas hipsométricas sustituyen a las curvas.</p>`)))),
      H.h('div', { style: { marginTop: '14px' } }, H.h('div', { class: 'row' }, H.h('h4', { style: { flex: 2 } }, 'Perfil topográfico A–B'), H.h('div', { style: { flex: 'none' } }, veSeg)), H.h('div', { class: 'viz' }, pch.st.canvas), H.h('p', { class: 'hint' }, 'Pasa el ratón por el perfil para ver el punto en el mapa.'),
        H.h('div', { class: 'readouts' }, pro.dh, pro.dr, pro.des, pro.pm, pro.pmax, pro.z)),
      H.html('<p class="small">Pendiente (%) = desnivel / distancia horizontal × 100. Un 100 % equivale a 45°. La exageración vertical se usa porque, a escala real, el relieve suele parecer casi plano.</p>')));
    cs.redraw(); updProfile(); setTimeout(updProfile, 80);

    /* ---------- formas del relieve ---------- */
    const FORMS = {
      'Cerro': (x, y) => 1000 - 560 * Math.hypot(x * 1.1, y) + 30 * Math.sin(x * 3),
      'Collado': (x, y) => 700 + 300 * y * y - 230 * x * x,
      'Valle': (x, y) => 500 + 320 * Math.abs(x + 0.08 * Math.sin(y * 3)) + 260 * y,
      'Espolón (divisoria)': (x, y) => 950 - 320 * Math.abs(x) + 260 * y,
      'Ladera convexa': (x, y) => { const t = (1 - y) / 2; return 900 - 620 * t * t; },
      'Ladera cóncava': (x, y) => { const t = (1 - y) / 2; return 900 - 620 * (1 - (1 - t) * (1 - t)); },
      'Meseta con escarpe': (x, y) => 400 + 380 / (1 + Math.exp((Math.hypot(x * 1.05, y * 0.9) - 0.5) * 22)) + 15 * x,
    };
    const names = Object.keys(FORMS);
    const formBox = H.h('div', { class: 'grid3', style: { gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' } });
    const res = H.h('p');
    let order = [], selects = [];
    const drawForm = (fn, c) => {
      const N = 70, t = { N, z: new Float32Array(N * N), km: 1, cell: 20 }; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) t.z[j * N + i] = fn(i / (N - 1) * 2 - 1, 1 - j / (N - 1) * 2);
      const W = 200, Hh = 160, x = c.getContext('2d'); c.width = W; c.height = Hh;
      x.drawImage(H.TERR.render(t, W, Hh, { hypso: true, shade: false }), 0, 0);
      const [a, b] = H.TERR.range(t); x.strokeStyle = '#6e3714'; x.lineWidth = 1; x.beginPath();
      for (let L = Math.ceil(a / 50) * 50; L < b; L += 50) for (const [p, q] of H.TERR.iso(t, L)) { x.moveTo(p[0] * W / (N - 1), p[1] * Hh / (N - 1)); x.lineTo(q[0] * W / (N - 1), q[1] * Hh / (N - 1)); }
      x.stroke();
      // cotas extremas
      let im = 0, iM = 0; t.z.forEach((v, i) => { if (v < t.z[im]) im = i; if (v > t.z[iM]) iM = i; });
      const lab = (i, v) => { const px = (i % N) * W / (N - 1), py = Math.floor(i / N) * Hh / (N - 1); x.font = 'bold 10px system-ui'; x.fillStyle = 'rgba(255,253,248,.9)'; x.fillRect(H.clamp(px - 16, 0, W - 34), H.clamp(py - 8, 0, Hh - 13), 34, 13); x.fillStyle = '#1c2836'; x.textAlign = 'center'; x.fillText(Math.round(v), H.clamp(px, 17, W - 17), H.clamp(py + 3, 11, Hh - 2)); };
      lab(iM, t.z[iM]); lab(im, t.z[im]);
    };
    const newForms = () => {
      order = [...names].sort(() => Math.random() - 0.5).slice(0, 6); formBox.innerHTML = ''; selects = []; res.innerHTML = '';
      order.forEach((nm, i) => {
        const c = H.h('canvas', { style: { width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid var(--line)' } }); drawForm(FORMS[nm], c);
        const sel = H.h('select', {}, H.h('option', { value: '' }, '¿Qué forma es?'), ...names.map((n) => H.h('option', { value: n }, n)));
        selects.push(sel); formBox.append(H.h('div', {}, c, sel));
      });
    };
    const chkF = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar');
    chkF.onclick = () => { let ok = 0; selects.forEach((s_, i) => { const g = s_.value === order[i]; if (g) ok++; s_.style.borderColor = g ? 'var(--ok)' : 'var(--bad)'; s_.style.background = g ? 'var(--ok-soft)' : 'var(--bad-soft)'; }); res.innerHTML = `${ok} de ${order.length} correctas. ${ok < order.length ? 'Fíjate en las cotas: en un valle la V de las curvas apunta hacia las cotas altas; en un espolón, hacia las bajas. En una ladera convexa las curvas se juntan abajo; en una cóncava, arriba.' : 'Excelente lectura del relieve.'}`; };
    newForms();
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Reconoce las formas del relieve'), H.h('p', { class: 'sub' }, 'Cada recuadro muestra un relieve con curvas cada 50 m y sus cotas máxima y mínima. El norte está arriba.'), formBox,
      H.h('div', { class: 'row', style: { marginTop: '10px', justifyContent: 'flex-start' } }, H.h('span', { style: { flex: '0 0 auto' } }, chkF), H.h('span', { style: { flex: '0 0 auto' } }, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newForms }, 'Otras formas'))), res));

    el.append(H.info('<b>Planimetría.</b> Además del relieve, el mapa topográfico representa con signos convencionales la hidrografía, la vegetación y los usos del suelo, las vías de comunicación, los núcleos de población y los límites administrativos, junto con la toponimia. Consulta la leyenda de una hoja del MTN25 o MTN50 en el visor del Instituto Geográfico Nacional (IGN).'));
    el.append(H.fix('apartado 3.3', ['La equidistancia es de <b>20 m en el MTN50</b> (1:50.000) y de <b>10 m en el MTN25</b> (1:25.000), que es hoy la serie básica del Mapa Topográfico Nacional.']));
    el.append(H.selfCheck([
      { q: 'En un mapa, las curvas de nivel aparecen muy juntas en una zona. Eso indica…', opts: ['Una zona llana', 'Una pendiente fuerte', 'Una zona de baja altitud', 'Un error de la equidistancia'], a: 1, ex: 'Si para salvar el mismo desnivel (la equidistancia) basta poca distancia horizontal, la pendiente es fuerte.' },
      { q: 'Las curvas de nivel forman una V cuyo vértice apunta hacia las cotas más altas. Se trata de…', opts: ['Un espolón o divisoria', 'Un valle o vaguada', 'Un collado', 'Una meseta'], a: 1, ex: 'En los valles la V señala aguas arriba (hacia lo alto). En los espolones apunta aguas abajo.' },
      { q: 'Entre dos puntos hay 150 m de desnivel y 1,5 km de distancia horizontal. La pendiente media es…', opts: ['1 %', '10 %', '15 %', '100 %'], a: 1, ex: '150 / 1.500 × 100 = 10 %.' },
      { q: '¿Qué es la equidistancia?', opts: ['La distancia horizontal entre dos curvas', 'La diferencia de altitud constante entre dos curvas consecutivas', 'La altitud de la curva maestra', 'La escala vertical del perfil'], a: 1, ex: 'Es constante en todo el mapa (p. ej., 20 m en el MTN50). La distancia horizontal entre curvas, en cambio, varía con la pendiente.' },
    ]));
  },
});
