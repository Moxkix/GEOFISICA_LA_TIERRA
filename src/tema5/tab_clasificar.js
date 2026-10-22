/* ===================== C · CLASIFICAR EL CLIMA ===================== */
H.tab({
  id: 'clasificar', nav: 'Clasificar el clima', title: 'Clasificar el clima',
  init(el) {
    el.append(H.intro('Clasificación de los climas · apartados 1.1-1.3', 'Por qué y cómo se clasifican los climas',
      'El tiempo es el estado de la atmósfera en un momento; el clima, la síntesis de los tipos de tiempo de un lugar durante al menos 30 años. Para clasificarlo hacen falta datos (temperatura, precipitación…), un criterio (fisionómico o genético) y una escala. Aquí comparas climas con los mismos números y distinto régimen, pruebas las clasificaciones de una sola variable y recorres las escalas del clima.',
      'Manual: 1.1-1.3<br>Clasificaciones de una sola variable'));

    /* ================= A · escalas del clima ================= */
    const SC = [
      { k: 'micro', name: 'Microclima', a: 0, b: 2, range: 'metros a decenas de metros', what: 'El suelo, la vegetación, los edificios, la orientación de una pared: la circulación del aire a ras de suelo.', ex: 'La cara sur de una tapia, el interior de un hayedo, un invernadero, una calle estrecha en sombra.' },
      { k: 'local', name: 'Clima local o topoclima', a: 2, b: 4, range: '100 m a 10 km (y unos 100 m en la vertical)', what: 'La configuración del relieve: un valle, una ladera, la orientación (solana y umbría), una ciudad (isla de calor), la costa (brisas).', ex: 'El fondo de un valle con nieblas de inversión, la solana de un monte, el centro de Madrid frente a su periferia.' },
      { k: 'prov', name: 'Provincia climática', a: 4, b: 5.3, range: 'decenas a cientos de km', what: 'El medio físico matiza los rasgos de la región: una cuenca rodeada de montañas, una fachada costera.', ex: 'Dentro del dominio mediterráneo, el clima de la Meseta norte o el del valle del Ebro (Viers distingue el «heleno», el «portugués»…).' },
      { k: 'reg', name: 'Escala regional o mesoclima', a: 5.3, b: 6.3, range: '200 a 2.000 km', what: 'Contrastes tierra-mar, grandes relieves, fachada oriental u occidental, circulaciones de escala continental.', ex: 'La España atlántica frente a la mediterránea; el monzón de la India; la región mediterránea.' },
      { k: 'zon', name: 'Escala zonal o macroclima', a: 6.3, b: 7.6, range: 'miles de km: la zona entera', what: 'La latitud (insolación) y la circulación general de la atmósfera.', ex: 'La zona intertropical, la templada y la polar: Tema 6.' },
    ];
    const scCard = H.h('div', { class: 'card' });
    scCard.append(H.h('h3', {}, 'Las escalas del clima'), H.h('p', { class: 'sub' }, 'Desliza la extensión del espacio que estudias (escala logarítmica: cada marca multiplica por 10). A cada escala la dominan factores distintos.'));
    const scSvg = H.h('div', { class: 'viz' });
    const scInfo = H.h('div', { class: 'readouts', style: { marginTop: '8px' } });
    const fmtL = (lg) => { const m = Math.pow(10, lg); return m < 1000 ? H.f(m, m < 10 ? 1 : 0) + ' m' : H.f(m / 1000, m < 1e4 ? 1 : 0) + ' km'; };
    let lg = 3;
    const drawSc = () => {
      const W = 1000, X = (v) => 20 + v / 7.6 * (W - 40);
      let s = `<svg viewBox="0 0 ${W} 92" role="img" aria-label="Escalas del clima">`;
      SC.forEach((c, i) => { const on = lg >= c.a && lg < c.b; s += `<rect x="${X(c.a)}" y="18" width="${X(c.b) - X(c.a)}" height="34" fill="${on ? '#b4531d' : ['#f1e7d4', '#ecdcc0', '#e6d1ad', '#e0c69a', '#d9bb88'][i]}" stroke="#fffdf8" stroke-width="2"/><text x="${(X(c.a) + X(c.b)) / 2}" y="40" text-anchor="middle" font-size="13" fill="${on ? '#fff' : '#1c2836'}" font-family="system-ui">${c.name.split(' o ')[0]}</text>`; });
      for (let e = 0; e <= 7; e++) s += `<line x1="${X(e)}" y1="52" x2="${X(e)}" y2="60" stroke="#5a6878"/><text x="${X(e)}" y="74" text-anchor="middle" font-size="11" fill="#5a6878" font-family="system-ui">${['1 m', '10 m', '100 m', '1 km', '10 km', '100 km', '1.000 km', '10.000 km'][e]}</text>`;
      s += `<path d="M${X(lg)} 4 l-7 -1 7 13 7 -13z" fill="#1c2836"/></svg>`;
      scSvg.innerHTML = s;
      const c = SC.find((x) => lg >= x.a && lg < x.b) || SC[SC.length - 1];
      scInfo.innerHTML = `<div class="ro hl"><div class="k">Extensión</div><div class="v">${fmtL(lg)}</div></div><div class="ro bl" style="grid-column:span 2"><div class="k">Escala</div><div class="v">${c.name} <small>(${c.range})</small></div></div>
        <div class="ro wide"><div class="k">Qué decide el clima a esta escala</div><div class="v"><small>${c.what}</small></div></div><div class="ro wide"><div class="k">Ejemplos</div><div class="v"><small>${c.ex}</small></div></div>`;
    };
    const scSl = H.slider('Extensión del espacio estudiado', 0, 7.5, 0.05, lg, fmtL, (v) => { lg = v; drawSc(); });
    scCard.append(scSl, scSvg, scInfo, H.html('<p class="hint">Además de estas escalas espaciales, el manual menciona el piso climático (la altitud: pestaña «Climas de montaña») y la escala temporal (pestaña «El clima en el tiempo»).</p>'));
    drawSc();

    /* ================= B · mismos números, climas distintos ================= */
    const twCard = H.h('div', { class: 'card' });
    twCard.append(H.h('h3', {}, 'Mismos números, climas distintos'),
      H.h('p', { class: 'sub' }, 'Las medias y los totales anuales no bastan para clasificar un clima: hay que mirar cómo se reparten a lo largo del año. Elige una estación y busca otra, a más de 2.000 km, con casi la misma temperatura media anual (o la misma precipitación anual) pero de otro grupo climático.'));
    let mode = 'T', A = T5.byId('8391'), twins = [], ti = 0;
    const annual = (s) => ({ t: s.ta.slice(0, 12).reduce((a, b) => a + b, 0) / 12, p: s.pr.slice(0, 12).reduce((a, b) => a + b, 0) });
    const findTwins = () => {
      const a = annual(A), ga = T5.type(A)[0];
      twins = T5.ST.filter((b) => b !== A && T5.type(b)[0] !== ga && H.haversine(A.lat, A.lon, b.lat, b.lon) > 2000)
        .map((b) => { const x = annual(b); return [b, mode === 'T' ? Math.abs(x.t - a.t) : Math.abs(Math.log(x.p / a.p))]; })
        .sort((x, y) => x[1] - y[1]).slice(0, 6).map((x) => x[0]);
      ti = 0;
    };
    const cvA = H.h('canvas'), cvB = H.h('canvas'), clA = T3.climo(cvA, (w) => Math.min(w * 0.62, 300)), clB = T3.climo(cvB, (w) => Math.min(w * 0.62, 300));
    const roA = H.h('div', { class: 'readouts' }), roB = H.h('div', { class: 'readouts' });
    const verdict = H.h('div', { class: 'info' });
    const selA = T5.stationSelect(A.id, (s) => { A = s; findTwins(); updTw(); });
    const segM = H.seg([['T', 'Misma temperatura media anual'], ['P', 'Misma precipitación anual']], mode, (v) => { mode = v; findTwins(); updTw(); });
    const next = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Otra pareja');
    next.onclick = () => { ti = (ti + 1) % twins.length; updTw(); };
    const ro = (s) => { const a = annual(s), t = T5.type(s); return `<div class="ro"><div class="k">Temperatura media anual</div><div class="v">${T5.fT(a.t)}</div></div><div class="ro"><div class="k">Precipitación anual</div><div class="v">${H.f(a.p)} <small>mm</small></div></div><div class="ro"><div class="k">Amplitud anual</div><div class="v">${T5.fT(T2.amp(s))}</div></div><div class="ro hl"><div class="k">Köppen</div><div class="v">${T5.chip(t)} <small>${KG.NAME[t]}</small></div></div>`; };
    const updTw = () => {
      const B = twins[ti]; if (!B) return;
      const sub = (s) => `${H.f(Math.abs(s.lat), 1)}° ${s.lat >= 0 ? 'N' : 'S'} · ${H.f(s.elev)} m`;
      clA.draw(A, { title: T5.stLabel(A), sub: sub(A) }); clB.draw(B, { title: T5.stLabel(B), sub: sub(B) });
      roA.innerHTML = ro(A); roB.innerHTML = ro(B);
      const a = annual(A), b = annual(B);
      verdict.innerHTML = mode === 'T'
        ? `<b>${T5.stLabel(A)}</b> y <b>${T5.stLabel(B)}</b> tienen casi la misma temperatura media anual (${T5.fT(a.t)} y ${T5.fT(b.t)}), pero ${Math.abs(T2.amp(A) - T2.amp(B)) > 5 ? `una amplitud anual muy distinta (${H.f(T2.amp(A), 1)} y ${H.f(T2.amp(B), 1)} °C) y ` : ''}${Math.abs(a.p - b.p) > 200 ? `muy distinta precipitación (${H.f(a.p)} y ${H.f(b.p)} mm)` : 'distinto reparto de la lluvia'}: Köppen las sitúa en grupos diferentes (${T5.chip(T5.type(A))} y ${T5.chip(T5.type(B))}).`
        : `<b>${T5.stLabel(A)}</b> y <b>${T5.stLabel(B)}</b> reciben casi la misma lluvia al año (${H.f(a.p)} y ${H.f(b.p)} mm), pero ${Math.abs(a.t - b.t) > 4 ? `con temperaturas muy distintas (${T5.fT(a.t)} y ${T5.fT(b.t)} de media), lo que cambia la evaporación, y ` : ''}repartida de otro modo a lo largo del año: ${T5.chip(T5.type(A))} frente a ${T5.chip(T5.type(B))}.`;
      selA.set(A.id);
    };
    findTwins();
    twCard.append(H.h('div', { class: 'row', style: { marginBottom: '10px' } }, H.h('div', { style: { flex: '1 1 260px' } }, H.h('label', { class: 'small' }, 'Estación'), selA), H.h('div', { style: { flex: '2 1 300px' } }, segM), H.h('div', { style: { flex: 'none' } }, next)),
      H.h('div', { class: 'vs' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvA), roA), H.h('div', {}, H.h('div', { class: 'viz framed' }, cvB), roB)), verdict,
      H.fix('apartado 1.3', ['Con las normales 1991-2020 los ejemplos del manual dejan de cuadrar: Sevilla (aeropuerto) tiene 19,3 °C de media, no 18,5; Chicago recibe 962 mm, no 832. Por eso aquí se buscan las parejas con los datos actuales.']));
    T5.onOpt(() => { findTwins(); updTw(); });
    updTw();

    /* ================= C · una sola variable ================= */
    const BLAIR = [[0, 250, 'Árido', '#f3dfb8'], [250, 500, 'Semiárido', '#eadfa0'], [500, 1000, 'Subhúmedo', '#cfe2a6'], [1000, 2000, 'Húmedo', '#a8d2b4'], [2000, 20000, 'Muy húmedo', '#8fc0d6']];
    const blairOf = (p) => BLAIR.find((b) => p >= b[0] && p < b[1])[2];
    const GRID_X = [-1, 10, 21], GRID_Y = [-12, -1, 10, 21];
    const CELLS = { '4,4': 'Ecuatorial', '3,3': 'Tropical o ecuatorial de tierras altas', '3,4': 'Tropical', '2,2': 'Marítimo isotérmico de latitud alta', '2,3': 'Marítimo de latitud media', '2,4': 'Subtropical',
      '1,1': 'Polar oceánico', '1,2': 'Tundra', '1,3': 'Latitud media-alta continental', '1,4': 'Templado continental', '0,1': 'Casquete polar', '0,2': 'Tundra fría', '0,3': 'Continental frío', '0,4': 'Continental' };
    const gridOf = (s) => { const tx = Math.max(...s.ta.slice(0, 12)), tn = Math.min(...s.ta.slice(0, 12)); const c = GRID_X.filter((v) => tx >= v).length + 1, r = GRID_Y.filter((v) => tn >= v).length; return CELLS[r + ',' + c] || '—'; };
    const GCOL = { A: '#1f4fd0', B: '#d9480f', C: '#2f9e44', D: '#0b7285', E: '#6c757d' };
    let sel = T5.byId('24959'); // Yakutsk
    const oneCard = H.h('div', { class: 'card' });
    oneCard.append(H.h('h3', {}, 'Clasificaciones de una sola variable'),
      H.h('p', { class: 'sub' }, 'Dos clasificaciones del recuadro del manual aplicadas a todas las estaciones: la de Blair, solo con la precipitación anual, y la cuadrícula que cruza la temperatura del mes más cálido con la del más frío. Cada punto es una estación, coloreada según su grupo de Köppen. Pulsa un punto para seleccionarlo.'));
    const cvBl = H.h('canvas'), cvGr = H.h('canvas');
    const pts = { bl: [], gr: [] };
    const stBl = H.autoCanvas(cvBl, (w) => Math.min(150, Math.max(120, w * 0.2)), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const L = 14, R = 14, X = (p) => L + (Math.log10(Math.max(p, 20)) - Math.log10(20)) / (Math.log10(12000) - Math.log10(20)) * (w - L - R), y0 = 26, y1 = h - 34;
      BLAIR.forEach(([a, b, n, c]) => { ctx.fillStyle = c; ctx.fillRect(X(Math.max(a, 20)), y0, X(Math.min(b, 12000)) - X(Math.max(a, 20)), y1 - y0); ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(n, (X(Math.max(a, 20)) + X(Math.min(b, 12000))) / 2, 6); });
      ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textBaseline = 'top';
      for (const v of [20, 50, 100, 250, 500, 1000, 2000, 5000, 10000]) { ctx.fillText(H.f(v), X(v), y1 + 4); ctx.fillRect(X(v), y1, 1, 3); }
      ctx.fillText('precipitación anual (mm, escala logarítmica)', w / 2, y1 + 18);
      pts.bl = [];
      T5.ST.forEach((s, i) => { const p = annual(s).p, x = X(p), y = y0 + 6 + ((i * 37) % 97) / 97 * (y1 - y0 - 12), g = T5.type(s)[0]; pts.bl.push([x, y, s]); ctx.fillStyle = GCOL[g]; ctx.globalAlpha = s === sel ? 1 : 0.75; ctx.beginPath(); ctx.arc(x, y, s === sel ? 6 : 3.4, 0, 7); ctx.fill(); if (s === sel) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; } });
      ctx.globalAlpha = 1;
    });
    const stGr = H.autoCanvas(cvGr, (w) => Math.min(w * 0.75, 460), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const P = { l: 46, r: 12, t: 12, b: 38 }, X = (v) => P.l + (v + 10) / 50 * (w - P.l - P.r), Y = (v) => h - P.b - (v + 50) / 80 * (h - P.t - P.b);
      // celdas de la cuadrícula del manual
      const xs = [-10, -1, 10, 21, 40], ys = [-50, -12, -1, 10, 21, 30];
      for (let r = 0; r < 5; r++) for (let c = 1; c <= 4; c++) {
        const n = CELLS[r + ',' + c]; if (!n) continue;
        const x0 = X(xs[c - 1]), x1 = X(xs[c]), yA = Y(ys[r]), yB = Y(ys[r + 1]);
        ctx.fillStyle = (r + c) % 2 ? '#f6f1e6' : '#fbf8f1'; ctx.fillRect(x0, yB, x1 - x0, yA - yB);
        ctx.fillStyle = 'rgba(90,104,120,.85)'; ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        const words = n.split(' '); let line = '', ly = yB + 3; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > x1 - x0 - 6 && line) { ctx.fillText(line, x0 + 3, ly); ly += 11; line = wd; } else line = t; } ctx.fillText(line, x0 + 3, ly);
      }
      // diagonal (el mes más frío no puede superar al más cálido)
      ctx.strokeStyle = 'rgba(28,40,54,.25)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(-10), Y(-10)); ctx.lineTo(X(30), Y(30)); ctx.stroke(); ctx.setLineDash([]);
      // umbrales de Köppen
      const kl = [['v', 10, 'E | 10 °C'], ['v', 22, 'a | 22 °C'], ['h', 18, 'A | 18 °C'], ['h', T5.opt.cd, `C/D | ${T5.opt.cd === 0 ? '0' : '−3'} °C`], ['h', -38, 'd | −38 °C']];
      ctx.strokeStyle = '#b4531d'; ctx.fillStyle = '#b4531d'; ctx.font = 'bold 10px system-ui';
      for (const [o, v, t] of kl) { ctx.beginPath(); if (o === 'v') { ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), h - P.b); ctx.stroke(); ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(t, X(v) + 2, h - P.b - 2); } else { ctx.moveTo(P.l, Y(v)); ctx.lineTo(w - P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(t, w - P.r - 2, Y(v) - 1); } }
      // ejes
      ctx.fillStyle = '#5a6878'; ctx.font = '10.5px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let v = -10; v <= 40; v += 10) ctx.fillText(v + '°', X(v), h - P.b + 4);
      ctx.fillText('temperatura media del mes más cálido', (P.l + w - P.r) / 2, h - 16);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; for (let v = -50; v <= 30; v += 10) ctx.fillText(v + '°', P.l - 5, Y(v));
      ctx.save(); ctx.translate(11, (P.t + h - P.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('mes más frío', 0, 0); ctx.restore();
      pts.gr = [];
      T5.ST.forEach((s) => { const tx = Math.max(...s.ta.slice(0, 12)), tn = Math.min(...s.ta.slice(0, 12)), x = X(tx), y = Y(tn), g = T5.type(s)[0]; pts.gr.push([x, y, s]); ctx.fillStyle = GCOL[g]; ctx.globalAlpha = s === sel ? 1 : 0.8; ctx.beginPath(); ctx.arc(x, y, s === sel ? 6 : 3.6, 0, 7); ctx.fill(); if (s === sel) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; } });
      ctx.globalAlpha = 1;
    });
    const pick = (st, arr) => (e) => { const [x, y] = st.pos(e); let b = null, bd = 14; for (const [px, py, s] of arr()) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = s; } } if (b) { sel = b; updOne(); } };
    cvBl.addEventListener('click', pick(stBl, () => pts.bl)); cvGr.addEventListener('click', pick(stGr, () => pts.gr));
    const tipFn = (arr) => (lat, lon, x, y) => { let b = null, bd = 12; for (const [px, py, s] of arr()) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = s; } } return b ? `${T5.stLabel(b)} · ${T5.type(b)}` : null; };
    stBl.P = { inv: () => [0, 0] }; stGr.P = { inv: () => [0, 0] };
    T4.hover(cvBl, stBl, tipFn(() => pts.bl)); T4.hover(cvGr, stGr, tipFn(() => pts.gr));
    const roOne = H.h('div', { class: 'readouts' });
    const selOne = T5.stationSelect(sel.id, (s) => { sel = s; updOne(); });
    const updOne = () => {
      stBl.redraw(); stGr.redraw(); selOne.set(sel.id);
      const a = annual(sel), t = T5.type(sel);
      roOne.innerHTML = `<div class="ro bl"><div class="k">Blair</div><div class="v">${blairOf(a.p)} <small>(${H.f(a.p)} mm)</small></div></div>
        <div class="ro bl"><div class="k">Cuadrícula de temperaturas</div><div class="v"><small>${gridOf(sel)} (${T5.fT(Math.max(...sel.ta.slice(0, 12)))} / ${T5.fT(Math.min(...sel.ta.slice(0, 12)))})</small></div></div>
        <div class="ro hl"><div class="k">Köppen (dos variables)</div><div class="v">${T5.chip(t)} <small>${KG.NAME[t]}</small></div></div>`;
    };
    const legend = H.html(`<div class="legend">${Object.entries(GCOL).map(([g, c]) => `<span><i style="background:${c};height:10px;width:10px;border-radius:50%"></i>${g} · ${KG.GROUP[g].replace(/ \(.*\)/, '')}</span>`).join('')}</div>`);
    oneCard.append(H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '1 1 260px' } }, H.h('label', { class: 'small' }, 'Estación seleccionada'), selOne), H.h('div', { style: { flex: '2 1 300px' } }, legend)),
      H.h('div', { class: 'viz framed' }, cvBl), H.h('div', { style: { height: '10px' } }), H.h('div', { class: 'viz framed' }, cvGr), H.h('div', { style: { height: '10px' } }), roOne,
      H.html('<p class="hint">Prueba con Yakutsk (233 mm), Riad (100 mm) y Utqiaġvik (137 mm): para Blair los tres son «áridos»; para Köppen, que compara la lluvia con la temperatura, solo Riad es un desierto. Y en la cuadrícula, Jartum (desierto) cae en la misma casilla «Ecuatorial» que Singapur (selva), y A Coruña y Santander en la de Bogotá, «tropical o ecuatorial de tierras altas»: la temperatura sola no distingue el desierto de la selva ni el océano de la montaña ecuatorial.</p>'));
    T5.onOpt(updOne);
    updOne();

    /* ================= D · tipos de clasificación ================= */
    const typesCard = H.h('div', { class: 'card' });
    typesCard.innerHTML = `<h3>Fisionómicas y genéticas</h3>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th>Planteamiento</th><th>Parte de…</th><th>Ejemplos del manual</th><th>Ventaja / límite</th></tr></thead><tbody>
      <tr><td><b>Fisionómica · climática (algebraica)</b></td><td>Umbrales numéricos de temperatura y precipitación</td><td>Köppen, Thornthwaite (balance hídrico, fines agrícolas), Bagnouls-Gaussen</td><td>Objetiva y aplicable con datos de cualquier estación / los umbrales son empíricos</td></tr>
      <tr><td><b>Fisionómica · biogeográfica (ecológica)</b></td><td>Las exigencias de las plantas</td><td>Papadakis (cultivos tipo: avena, maíz, arroz, café…)</td><td>Útil para la agricultura / depende de las especies elegidas</td></tr>
      <tr><td><b>Fisionómica · geográfica</b></td><td>Un territorio prototípico que da nombre al clima</td><td>De Martonne y Viers: «portugués», «heleno», «californiano», «chino»</td><td>Expresiva / los límites son imprecisos</td></tr>
      <tr><td><b>Genética</b></td><td>Las causas: masas de aire y circulación general</td><td>Hettner, Flohn, Petterssen (fig. 5.1, mapa inferior), Alisov</td><td>Explica el clima / difícil de cartografiar con datos de estaciones</td></tr>
      </tbody></table></div>
      <p class="small">Köppen es fisionómica pero no arbitraria: buscó umbrales que coincidieran con los grandes límites de la vegetación (18 °C, la palmera y la selva; 10 °C en el mes más cálido, el límite del árbol). Por eso el manual la usa como referencia.</p>`;

    el.append(scCard, twCard, oneCard, typesCard, H.selfCheck([
      { q: 'El clima de un lugar se define con…', opts: ['Las observaciones de un año', 'Los valores medios de una serie larga, de al menos 30 años', 'El tiempo de un día representativo', 'Los récords absolutos'], a: 1, ex: 'La OMM actualiza cada diez años la normal climatológica de referencia: hoy, 1991-2020.' },
      { q: 'Una clasificación genética se basa en…', opts: ['Umbrales de temperatura y precipitación', 'Las masas de aire y la circulación general que causan el clima', 'Las exigencias de los cultivos', 'El nombre de una región tipo'], a: 1, ex: 'Como la de Petterssen que reproduce la fig. 5.1.' },
      { q: 'La clasificación de Blair, solo con la precipitación anual, falla porque…', opts: ['Usa milímetros', 'No tiene en cuenta la temperatura, que decide cuánta agua se evapora', 'Tiene demasiados tipos', 'Solo vale para España'], a: 1, ex: 'Yakutsk recibe menos de 250 mm y no es un desierto: hace tanto frío que apenas evapora.' },
      { q: 'Un estudio del clima de un valle y sus laderas es de escala…', opts: ['Zonal', 'Regional', 'Local (topoclima)', 'Microclimática'], a: 2, ex: 'De 100 m a 10 km: el relieve concreto matiza la circulación regional.' },
      { q: 'Thornthwaite clasificó los climas con fines…', opts: ['Turísticos', 'Agrícolas, a partir del balance hídrico del suelo', 'Militares', 'Genéticos'], a: 1, ex: 'Usa la evapotranspiración potencial, el déficit y el exceso de agua.' },
    ]));
  },
});
