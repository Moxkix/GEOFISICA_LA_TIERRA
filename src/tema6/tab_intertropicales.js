/* ===================== A · CLIMAS INTERTROPICALES ===================== */
H.tab({
  id: 'intertropicales', nav: 'Climas intertropicales', title: 'Climas intertropicales',
  init(el) {
    el.append(H.intro('La zona cálida · apartado 1', 'Calor constante, lluvias con ritmo',
      'En la zona intertropical el Sol pasa por el cenit una o dos veces al año y todos los meses superan los 18 °C: las estaciones no las marca la temperatura, sino la lluvia. Köppen distingue tres climas según lo que llueve el mes más seco: el ecuatorial o de selva (Af), el monzónico (Am) y el tropical con estación seca o de sabana (Aw). La estación de lluvias sigue al Sol, con la zona de convergencia intertropical (ZCIT).',
      'Manual: apartado 1<br>Cuadros 6.1-6.4; figs. 6.2-6.8'));
    el.append(T5.optCtrl());
    const W = T6.W(), L = T6.layers(), D2R = H.D2R;
    if (!W || !L) { el.append(H.info('Esta pestaña necesita el mapa mundial de TerraClimate.')); return; }

    /* =============== 1 · el diagrama de Köppen (fig. 6.2) =============== */
    const AST = T5.ST.filter((s) => !s.es && T5.type(s)[0] === 'A');
    const S = { st: T5.byId('48698') };
    const cloud = []; const KA = T6.K();
    for (let k = 0; k < KA.length; k++) { const v = KA[k]; if (v >= 1 && v <= 3) cloud.push([L.pann[k], L.pdry[k], v]); }
    const XMAX = 5000, YMAX = 320;
    const dcv = H.h('canvas');
    const dst = H.autoCanvas(dcv, (w) => Math.min(Math.max(w * 0.62, 320), 470), (ctx, w, h) => {
      const P = { l: 52, r: 14, t: 12, b: 40 }, X = (v) => P.l + Math.min(v, XMAX) / XMAX * (w - P.l - P.r), Y = (v) => h - P.b - Math.sqrt(H.clamp(v, 0, YMAX) / YMAX) * (h - P.t - P.b); // escala de raíz cuadrada: separa los meses casi secos
      dst.X = X; dst.Y = Y;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      // regiones
      ctx.fillStyle = 'rgba(0,0,255,.05)'; ctx.fillRect(P.l, P.t, w - P.l - P.r, Y(60) - P.t);
      ctx.fillStyle = 'rgba(0,120,255,.07)'; ctx.beginPath(); ctx.moveTo(X(1000), Y(60)); ctx.lineTo(X(XMAX), Y(60)); ctx.lineTo(X(XMAX), Y(0)); ctx.lineTo(X(2500), Y(0)); ctx.closePath(); ctx.fill();
      // nube de celdas
      const COL = { 1: 'rgba(0,0,255,.13)', 2: 'rgba(0,120,255,.16)', 3: 'rgba(70,170,250,.2)' };
      for (const [x, y, v] of cloud) { ctx.fillStyle = COL[v]; ctx.fillRect(X(x) - 1, Y(y) - 1, 2, 2); }
      // rejilla
      ctx.font = '10.5px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.1)'; ctx.fillStyle = '#5a6878';
      for (let v = 0; v <= XMAX; v += 1000) { ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), h - P.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(H.f(v), X(v), h - P.b + 5); }
      for (const v of [0, 5, 20, 60, 100, 150, 200, 300]) { ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(w - P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(H.f(v), P.l - 5, Y(v)); }
      ctx.textAlign = 'center'; ctx.fillText('precipitación anual (mm)', (P.l + w - P.r) / 2, h - 14);
      ctx.save(); ctx.translate(13, (P.t + h - P.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('mes más seco (mm)', 0, 0); ctx.restore();
      // umbrales
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(P.l, Y(60)); ctx.lineTo(w - P.r, Y(60)); ctx.stroke();
      ctx.setLineDash([6, 4]); ctx.beginPath(); for (let pv = 1000; pv <= 2500; pv += 25) { const x = X(pv), y = Y(Math.max(0, 100 - pv / 25)); pv === 1000 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.font = 'bold 15px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Af', X(4300), Y(180)); ctx.fillText('Am', X(4300), Y(25)); ctx.fillText('Aw', X(500), Y(30));
      ctx.font = '10px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#5a6878';
      ctx.fillText('60 mm', P.l + 4, Y(60) - 8); ctx.fillText('100 − P/25', X(1950) + 6, Y(22));
      // estaciones (las etiquetas que se solaparían se omiten; la elegida siempre se rotula)
      dst.pts = [];
      const boxes = [];
      const order = AST.slice().sort((a, b2) => (S.st && a.id === S.st.id ? -1 : S.st && b2.id === S.st.id ? 1 : 0));
      for (const s of order) {
        const x = X(s.pr[12]), y = Y(Math.min(...s.pr.slice(0, 12))), t = T5.type(s), on = S.st && s.id === S.st.id;
        ctx.fillStyle = KG.css(t); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = on ? 2.4 : 1; ctx.beginPath(); ctx.arc(x, y, on ? 7 : 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
        dst.pts.push([x, y, s]);
        ctx.font = (on ? 'bold ' : '') + '10.5px system-ui'; const name = s.name.replace(/ \(.*\)/, ''), tw = ctx.measureText(name).width;
        for (const [dx, dy, al] of [[8, -1, 'left'], [-8, -1, 'right'], [0, -12, 'center'], [0, 12, 'center']]) {
          const bx = al === 'left' ? x + dx : al === 'right' ? x + dx - tw : x - tw / 2, by = y + dy - 7;
          if (bx < P.l || bx + tw > w - P.r || by < P.t || by + 13 > h - P.b + 6) continue;
          if (boxes.some(([ax, ay, aw]) => bx < ax + aw + 3 && bx + tw + 3 > ax && by < ay + 13 && by + 13 > ay)) continue;
          boxes.push([bx, by, tw]); ctx.fillStyle = '#1c2836'; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(name, x + dx, y + dy); break;
        }
      }
    });
    dcv.addEventListener('click', (e) => { const [x, y] = dst.pos(e); let b = null, bd = 18; for (const [px, py, s] of dst.pts || []) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = s; } } if (b) { S.st = b; stSel.set(b.id); updA(); } });
    const stSel = T5.stationSelect(S.st.id, (s) => { S.st = s; updA(); }, (s) => !s.es && T5.type(s)[0] === 'A');
    const aCard = T6.climoCard(), aWhy = H.h('div');
    const updA = () => {
      const s = S.st, c = T6.fromSt(s); aCard.set(c); dst.redraw();
      const st = T6.stats(c.T, c.P, c.lat), lim = 100 - st.Pann / 25, t = aCard.res.type;
      aWhy.innerHTML = `<p class="small"><b>Mes más frío:</b> ${T5.fT(st.Tmin)} (≥ 18 °C: clima A). <b>Mes más seco:</b> ${H.MESES[st.iPdry]}, ${T5.fMM(st.Pdry)}. ${st.Pdry >= 60 ? 'Llega a 60 mm: <b>Af</b>.' : `No llega a 60 mm; el umbral del monzónico es 100 − ${H.f(st.Pann)}/25 = ${T5.fMM(Math.max(0, lim))}: ${st.Pdry >= lim ? '<b>Am</b>, la lluvia del año compensa la estación seca.' : '<b>Aw</b>, la estación seca pesa más.'}`} Meses con menos de 60 mm: ${st.dry60}.</p>`;
      void t;
    };
    const dCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Af, Am o Aw: el diagrama de Köppen (fig. 6.2) con datos reales'),
      H.h('p', { class: 'sub' }, 'Cada punto pequeño es una celda de medio grado con clima A (TerraClimate 1991-2020); los círculos, estaciones de la OMM. El eje vertical está en escala de raíz cuadrada para separar los meses casi secos. Por encima de 60 mm en el mes más seco, selva (Af); por debajo, la línea discontinua separa el monzónico (Am), en el que la lluvia anual compensa la estación seca, del tropical con estación seca (Aw). Pulsa una estación.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, dcv), H.h('div', {}, stSel, H.h('div', { style: { height: '8px' } }), aCard, aWhy)));
    updA(); T5.onOpt(() => { stSel.set(S.st.id); updA(); });

    /* =============== 2 · las lluvias siguen al Sol =============== */
    const REG = { afr: ['África', [-20, 55, -36, 30]], sam: ['Sudamérica', [-85, -32, -36, 14]], asi: ['Asia y Australia', [65, 155, -36, 32]] };
    const R = { reg: 'afr', mode: 'dry', sel: T5.cell(9.3, 2.6) };
    const DRYC = T4.ramp([[0, [20, 70, 160]], [2, [60, 140, 200]], [4, [140, 200, 160]], [6, [230, 220, 140]], [8, [235, 180, 100]], [10, [215, 130, 70]], [12, [170, 80, 50]]]);
    const MC = [[52, 90, 170], [40, 140, 200], [60, 180, 170], [110, 190, 110], [180, 200, 80], [235, 200, 60], [240, 150, 50], [220, 90, 60], [190, 60, 110], [140, 70, 160], [90, 70, 170], [60, 70, 170]];
    const rColor = (lat, lon) => {
      const k = T6.idx(lat, lon); if (k < 0 || !(L.warm[k] === L.warm[k])) return null;
      return R.mode === 'dry' ? DRYC(L.dry60[k]) : MC[L.wet[k]];
    };
    const rcv = H.h('canvas');
    const rmp = T4.map(rcv, { bbox: REG.afr[1], regional: false, grid: 10, key: () => R.mode + R.reg, land: (lat, lon) => rColor(lat, lon) || T4.LAND, color: rColor,
      after: (ctx, P) => {
        ctx.save(); ctx.strokeStyle = 'rgba(28,40,54,.7)'; ctx.setLineDash([5, 4]); ctx.font = '10px system-ui'; ctx.fillStyle = '#1c2836';
        for (const lat of [23.44, 0, -23.44]) { const y = P.Y(lat); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(P.w, y); ctx.stroke(); }
        ctx.restore();
        if (R.sel) { const x = P.X(R.sel.lon), y = P.Y(R.sel.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1; }
      } });
    T4.hover(rcv, rmp, (lat, lon) => { const k = T6.idx(lat, lon); if (k < 0 || !(L.warm[k] === L.warm[k])) return null; return R.mode === 'dry' ? `${L.dry60[k]} meses con menos de 60 mm` : `más lluvia en ${H.MESES[L.wet[k]]}`; });
    rcv.addEventListener('click', (e) => { if (!rmp.P) return; const [x, y] = rmp.pos(e); const [lat, lon] = rmp.P.inv(x, y); const c = T5.cell(lat, lon); if (c) { R.sel = c; rmp.redraw(); updR(); } });
    const rLeg = H.h('div');
    const drawRLeg = () => {
      rLeg.innerHTML = R.mode === 'dry'
        ? `<div class="zleg">${Array.from({ length: 13 }, (_, n) => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:.78rem"><i style="display:inline-block;width:14px;height:12px;border-radius:2px;background:rgb(${DRYC(n).map(Math.round).join(',')})"></i>${n}</span>`).join('')}</div><p class="hint">Número de meses con menos de 60 mm de precipitación (TerraClimate 1991-2020).</p>`
        : `<div class="zleg">${H.MES3.map((m, i) => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:.78rem"><i style="display:inline-block;width:14px;height:12px;border-radius:2px;background:rgb(${MC[i].join(',')})"></i>${m}</span>`).join('')}</div><p class="hint">Mes más lluvioso del año (TerraClimate 1991-2020).</p>`;
    };
    const regSeg = H.seg(Object.entries(REG).map(([k, [n]]) => [k, n]), R.reg, (v) => { R.reg = v; rmp.setBBox(REG[v][1]); });
    const modeSeg = H.seg([['dry', 'Meses secos'], ['wet', 'Mes más lluvioso']], R.mode, (v) => { R.mode = v; drawRLeg(); rmp.invalidate(); });
    const rCard = T6.climoCard(), rTxt = H.h('div');
    const updR = () => {
      const c = R.sel; if (!c) return;
      const z = T6.zenith(c.lat), marks = z.map((d) => ({ m: T6.doyToMonth(d), label: 'Sol en el cenit, ' + H.fdate(H.dateFromDoy(Math.round(d))) }));
      rCard.set(Object.assign(T6.fromCell(c), { marks }));
      const st = rCard.st;
      rTxt.innerHTML = `<p class="small">${z.length ? `A ${T4.latName(c.lat)} el Sol pasa por el cenit ${z.length === 2 ? 'dos veces' : 'una vez'} al año (puntos naranjas). ` : 'Fuera de los trópicos el Sol nunca pasa por el cenit. '}${st.dry60 === 0 ? 'Llueve todo el año.' : `Hay ${st.dry60} ${st.dry60 === 1 ? 'mes' : 'meses'} con menos de 60 mm; el más lluvioso es ${H.MESES[c.P.indexOf(Math.max(...c.P))]}.`} Las lluvias llegan con la ZCIT, que sigue al Sol con algunas semanas de retraso; cerca del ecuador puede haber dos máximos y, hacia los trópicos, uno solo y una estación seca cada vez más larga.</p>`;
    };
    drawRLeg();
    const rCardBox = H.h('div', { class: 'card' }, H.h('h3', {}, 'Las lluvias siguen al Sol: de la selva a la sabana'),
      H.h('p', { class: 'sub' }, 'Al alejarse del ecuador, la estación seca se alarga: es el paso de la selva (Af) a la sabana (Aw) y, más allá, a la estepa y al desierto (Tema 5). Cambia el mapa entre los meses secos y el mes más lluvioso, y pulsa un punto para ver su climograma con los días en que el Sol pasa por el cenit.'),
      H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '2 1 300px' } }, regSeg), H.h('div', { style: { flex: '1 1 220px' } }, modeSeg)),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, rcv), rLeg), H.h('div', {}, rCard, rTxt)));
    updR();

    /* =============== 3 · el monzón (fig. 6.7) =============== */
    const V = typeof VIENTOS !== 'undefined' ? VIENTOS : null;
    const mCard = H.h('div', { class: 'card' });
    if (V && V.u) {
      const WU = V.u.map((a) => T4.grid(a, V.w)), WV = V.v.map((a) => T4.grid(a, V.w));
      const { nx, ny, lon0, lat0, res } = V.w;
      const mon = new Uint8Array(nx * ny), ang = new Float32Array(nx * ny);
      for (let k = 0; k < nx * ny; k++) {
        const u1 = V.u[0][k], v1 = V.v[0][k], u7 = V.u[6][k], v7 = V.v[6][k], a = Math.hypot(u1, v1), b = Math.hypot(u7, v7);
        if (!(a === a && b === b)) continue;
        const an = Math.acos(H.clamp((u1 * u7 + v1 * v7) / (a * b || 1), -1, 1)) / D2R; ang[k] = an;
        const lat = lat0 - (Math.floor(k / nx) + 0.5) * res;
        if (an >= 120 && a >= 2 && b >= 2 && Math.abs(lat) <= 40) mon[k] = 1;
      }
      const M = { m: 'jul' };
      const mcv = H.h('canvas');
      const mmp = T4.map(mcv, { bbox: [-30, 170, -40, 45], grid: 20, key: () => 'm', land: [232, 224, 204], color: null,
        after: (ctx, P) => {
          ctx.fillStyle = 'rgba(214,120,40,.30)';
          for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { if (!mon[j * nx + i]) continue; const lo = lon0 + i * res, la = lat0 - j * res; ctx.fillRect(P.X(lo), P.Y(la), P.X(lo + res) - P.X(lo), P.Y(la - res) - P.Y(la)); }
          if (M.m !== 'jul') T3.arrows(ctx, WU[0], WV[0], P, { step: M.m === 'both' ? 8 : 4, scale: 1.6, maxLen: 24, color: 'rgba(31,90,170,.9)', width: 1.3, min: 1 });
          if (M.m !== 'ene') T3.arrows(ctx, WU[6], WV[6], P, { step: M.m === 'both' ? 8 : 4, scale: 1.6, maxLen: 24, color: 'rgba(176,57,58,.9)', width: 1.3, min: 1 });
        } });
      T4.hover(mcv, mmp, (lat, lon) => { const i = Math.floor((lon - lon0) / res), j = Math.floor((lat0 - lat) / res); if (i < 0 || j < 0 || i >= nx || j >= ny) return null; const k = j * nx + i; return ang[k] ? `giro del viento entre enero y julio: ${H.f(ang[k])}°${mon[k] ? ' · monzónica' : ''}` : null; });
      const mSeg = H.seg([['jul', 'Julio'], ['ene', 'Enero'], ['both', 'Los dos']], M.m, (v) => { M.m = v; mmp.redraw(); });
      const pa = T6.climoCard(), pb = T6.climoCard();
      pa.set(T6.fromSt(T5.byId('43003'))); pb.set(T6.fromSt(T5.byId('42515')));
      mCard.append(H.h('h3', {}, 'El monzón: el viento cambia de rumbo (fig. 6.7)'),
        H.h('p', { class: 'sub' }, 'Chromow llamó monzónicas a las regiones en las que el viento dominante gira al menos 120° entre las estaciones. Aquí se aplica el criterio a los vientos medios a 10 m de ERA5 (1991-2020) de enero (azul) y julio (rojo), con al menos 2 m/s en ambos meses; las celdas que lo cumplen están sombreadas.'),
        mSeg, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, mcv),
        H.html(`<div class="grid2 even" style="margin-top:10px"><div><p class="small"><b>En verano</b> el continente asiático se calienta mucho más que el océano Índico; la ZCIT sube hasta 20°-25° N sobre la India y el alisio del hemisferio sur cruza el ecuador: al pasarlo, la fuerza de Coriolis lo desvía y llega como un viento del suroeste, cálido y cargado de humedad (la corriente en chorro de Somalia, frente a África oriental). Las montañas (Ghats, Himalaya, Arakan) lo obligan a ascender: lluvias torrenciales de junio a septiembre. La meseta del Tíbet, que se calienta en altura, refuerza la circulación.</p></div>
        <div><p class="small"><b>En invierno</b> el anticiclón térmico siberiano y la ZCIT, desplazada al sur, hacen soplar el monzón del nordeste: aire continental, frío y seco, que da la estación seca. Solo las costas que lo reciben después de cruzar el mar (el sureste de la India, el este de Sri Lanka, el centro de Vietnam, el este de Filipinas) tienen su máximo de lluvias en otoño e invierno. El mismo mecanismo, más débil, existe en África occidental, el norte de Australia y Sudamérica.</p></div></div>`),
        H.h('div', { class: 'pairs', style: { marginTop: '8px' } }, pa, pb),
        H.html('<p class="hint">Bombay (Am, 2.500 mm, casi todo de junio a septiembre) y Cherrapunji, a 1.313 m en las colinas de Khasi (más de 11.000 mm): el ascenso orográfico multiplica la lluvia del monzón. Con su temperatura de altura, Cherrapunji ya no es tropical para Köppen (Cwb).</p>'));
    } else mCard.append(H.info('Faltan los vientos de ERA5.'));

    /* =============== 4 · los climogramas del manual =============== */
    const PAIRS = {
      f63: ['Fig. 6.3 · Belém y Singapur', '82191', '48698', 'Dos variedades del clima de selva (Af). Belém (desembocadura del Amazonas) recibe más de 3.300 mm, con una temporada menos lluviosa de julio a noviembre en la que ningún mes baja de 120 mm. Singapur, insular, tiene una lluvia más regular. La amplitud térmica es mínima en ambas: 1,3 °C en Belém y 1,8 °C en Singapur (no «menos de 0,5 °C»).'],
      f65: ['Fig. 6.5 · Arauca y San Salvador', '37055010', '78663', 'Dos variedades del tropical con estación seca (Aw). Arauca, a 7° N en los llanos del Orinoco, tiene ocho meses de lluvias y una estación seca de diciembre a marzo. San Salvador (624 m, en lugar de Tegucigalpa, que no figura en las normales de la OMM), a 14° N, tiene una estación seca más larga y marcada: de diciembre a abril, con meses de 1 o 2 mm.'],
      f68: ['Fig. 6.8 · Rangún y Manaos', '48097', '82331', 'Las dos son Am, pero por razones distintas. Rangún es un monzón típico: 2.800 mm, casi todo de mayo a octubre, con el viento del suroeste, y una estación seca invernal acusada. Manaos tiene una temporada menos lluviosa de junio a octubre, con un solo mes por debajo de 60 mm (agosto), que la lluvia del año compensa; su régimen lo marca la ZCIT y el sistema monzónico sudamericano, más débil que el asiático.'],
    };
    const fCard = H.h('div', { class: 'card' });
    const fa = T6.climoCard(), fb = T6.climoCard(), fTxt = H.h('p', { class: 'small' });
    const setPair = (k) => { const [, a, b, t] = PAIRS[k]; fa.set(T6.fromSt(T5.byId(a))); fb.set(T6.fromSt(T5.byId(b))); fTxt.textContent = t; };
    fCard.append(H.h('h3', {}, 'Los climogramas del manual, con 1991-2020'),
      H.seg(Object.entries(PAIRS).map(([k, [n]]) => [k, n]), 'f63', setPair), H.h('div', { class: 'pairs', style: { marginTop: '10px' } }, fa, fb), fTxt);
    setPair('f63');

    /* =============== 5 · rasgos biogeográficos =============== */
    const bio = H.h('div', { class: 'card' });
    bio.innerHTML = `<h3>Ríos, vegetación y suelos</h3>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:16%">Clima</th><th>Ríos</th><th>Vegetación</th><th>Suelos</th></tr></thead><tbody>
      <tr><td>${T6.chip('ecu')}</td><td>Caudalosos y regulares (Amazonas, Congo)</td><td>Selva siempre verde, muy rica en especies, en varios estratos de hasta 50-60 m, con lianas y epífitas; manglares en las costas cálidas</td><td>Muy alterados y lavados, pobres en nutrientes, rojos y amarillos por los óxidos de hierro y aluminio: ferralsoles y acrisoles (los «lateríticos» del manual)</td></tr>
      <tr><td>${T6.chip('sab')}</td><td>Crecidas en la estación lluviosa y estiaje, o cauces secos, en la seca</td><td>Del bosque tropical seco, en parte caducifolio, a la sabana: hierbas altas con árboles dispersos resistentes al fuego; bosques galería en los valles</td><td>Parecidos, con costras ferruginosas («lateritas») donde la estación seca es larga</td></tr>
      <tr><td>${T6.chip('mzn')}</td><td>Fuertes crecidas de verano (Ganges, Irawadi)</td><td>Bosque monzónico, alto y denso, con especies que pierden la hoja en la estación seca (teca)</td><td>Como los de la sabana</td></tr>
      </tbody></table></div><p class="small"><a href="#vegetacion">Ver la pestaña «Vegetación y suelos» →</a></p>`;

    el.append(dCard, rCardBox, mCard, fCard, bio,
      H.fix('cuadros 6.1 y 6.2, figs. 6.3-6.8', [
        'Cuadro 6.1: Köppen solo usa el mes más frío (≥ 18 °C) y la lluvia del mes más seco. La amplitud anual («inferior a 5 °C» o «a 10 °C») no es un criterio, y «un mes precipita menos de 60 mm» no basta para Aw: también ocurre en Am. El límite es la línea 100 − P/25 de la fig. 6.2.',
        'Cuadro 6.2: la selva no suele recibir «entre 1.500 y 2.000 mm»: la mitad de las celdas Af reciben entre 2.200 y 3.200 mm al año (mediana, 2.650 mm; TerraClimate 1991-2020).',
        'Isotermia insular: Singapur tiene una amplitud anual de 1,8 °C, no inferior a 0,5 °C.',
        'Monzón viene del árabe <i>mawsim</i>, «estación».',
        'Fig. 6.5: Tegucigalpa no figura en las normales de la OMM; se usa San Salvador (Ilopango, 624 m), de clima parecido.',
      ]),
      H.selfCheck([
        { q: 'Lo que separa el clima ecuatorial (Af) del tropical con estación seca (Aw) es…', opts: ['La temperatura del mes más frío', 'La precipitación del mes más seco', 'La amplitud térmica anual', 'La altitud sobre el nivel del mar'], a: 1, ex: 'Los dos tienen todos los meses por encima de 18 °C; el Af no baja de 60 mm en ningún mes.' },
        { q: 'Una estación con 2.800 mm al año y 20 mm en el mes más seco es…', opts: ['Af, porque llueve mucho', 'Am, porque 20 mm supera 100 − 2.800/25', 'Aw, porque un mes baja de 60 mm', 'BSh, porque tiene un mes seco'], a: 1, ex: '100 − 2.800/25 = −12 mm: cualquier mes seco queda compensado. Es el caso de Rangún.' },
        { q: 'Cerca del ecuador la lluvia suele tener dos máximos porque…', opts: ['Hay dos monzones', 'El Sol pasa dos veces por el cenit y la ZCIT con él', 'Hay dos estaciones frías', 'Los alisios soplan dos veces'], a: 1, ex: 'Hacia los trópicos los dos pasos se acercan y queda un solo máximo, con una estación seca más larga.' },
        { q: 'El monzón de verano de la India es un viento…', opts: ['Del nordeste, frío y seco', 'Del suroeste, cálido y húmedo', 'Del norte, que baja del Himalaya', 'De levante, que llega del Pacífico'], a: 1, ex: 'Es el alisio austral que cruza el ecuador y, desviado por la fuerza de Coriolis, llega del suroeste.' },
      ]));
  },
});
