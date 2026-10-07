/* ===================== P · REGÍMENES DE PRECIPITACIÓN ===================== */
H.tab({
  id: 'regimenes', nav: 'Regímenes', title: 'Regímenes de precipitación',
  init(el) {
    el.append(H.intro('La precipitación · apartado 3.4.2', 'Cómo se reparte la lluvia a lo largo del año',
      'Tan importante como la cantidad anual es su reparto entre los meses: el régimen de precipitación. Se representa con un histograma de las medias mensuales de un periodo largo (aquí, las normales 1991–2020). Junto a la temperatura forma el climograma: con la escala de Gaussen (10 °C = 20 mm), los meses en que la barra de lluvia queda por debajo de la curva de temperatura son meses secos.',
      'Manual: 3.4.2<br>Figs. 3.23 y 3.24'));

    /* ================= A · tu estación ================= */
    const s = { st: T3.myStation().s };
    const cv = H.h('canvas'), cl = T3.climo(cv, (w) => Math.min(w * 0.5, 360));
    const ro = { p: H.ro('Precipitación anual', 'bl'), mx: H.ro('Mes más lluvioso'), mn: H.ro('Mes más seco'), dry: H.ro('Meses secos (P < 2T)', 'hl'), seas: H.ro('Reparto por estaciones'), reg: H.ro('Régimen', 'hl wide') };
    const sel = T3.stationSelect(s.st.id, (st) => { s.st = st; upd(); });
    const info = H.h('p', { class: 'small' });
    const upd = () => {
      const st = s.st, p = st.pr.slice(0, 12), iMx = p.indexOf(Math.max(...p)), iMn = p.indexOf(Math.min(...p));
      cl.draw(st, { title: T3.stLabel(st), sub: `${H.f(st.elev)} m · ${H.f(Math.abs(st.lat), 1)}° ${st.lat >= 0 ? 'N' : 'S'}` });
      ro.p.v.innerHTML = `${H.f(st.pr[12])} <small>mm</small>`;
      ro.mx.v.innerHTML = `${H.MESES[iMx]} <small>${H.f(p[iMx])} mm</small>`;
      ro.mn.v.innerHTML = `${H.MESES[iMn]} <small>${H.f(p[iMn], p[iMn] < 10 ? 1 : 0)} mm</small>`;
      const dm = T3.dryMonths(st); ro.dry.v.innerHTML = dm == null ? '—' : `${dm} <small>de 12</small>`;
      ro.seas.v.innerHTML = '<small>' + T3.seasons(st).map((x) => `${x.name} ${H.f(x.pct)} %`).join(' · ') + '</small>';
      const r = T3.regime(st); ro.reg.v.innerHTML = `${r.name}<br><small>${r.why}</small>`;
      info.innerHTML = st.es && !H.place.def ? `Estación más próxima a ${H.placeLabel()}.` : 'Elige tu municipio en la parte superior para ver su estación.';
      sel.set(st.id);
    };
    H.onPlace(() => { s.st = T3.myStation().s; upd(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El climograma de tu estación'),
      H.h('p', { class: 'sub' }, 'Barras azules: precipitación media mensual; en ocre, los meses secos. Línea roja: temperatura media. Puedes elegir cualquier otra estación.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('label', {}, H.h('span', {}, 'Estación')), sel), info, H.h('div', { class: 'readouts' }, ro.p, ro.mx, ro.mn, ro.dry, ro.seas, ro.reg)))));
    upd();

    /* ================= B · los regímenes del manual ================= */
    const TYPES = [['tropical', 'Tropical', '61052'], ['ecuatorial', 'Ecuatorial', '64456'], ['monzonico', 'Monzónico', '43003'], ['mediterraneo', 'Mediterráneo', '8482'], ['continental', 'Continental', '27612'], ['oceanico', 'Oceánico', '7110']];
    const grid = H.h('div', { class: 'grid3' });
    for (const [k, n, id] of TYPES) {
      const st = T3.byId(id), c = H.h('canvas'), cc = T3.climo(c, 0.62);
      grid.append(H.h('div', {}, H.h('div', { class: 'viz framed' }, c), H.h('p', { class: 'small', style: { margin: '4px 0 0' }, html: `<b style="color:var(--ink)">${n}</b> · ${T3.stLabel(st)} · ${H.f(st.pr[12])} mm` })));
      setTimeout(() => cc.draw(st, { small: true }), 0);
    }
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Los seis regímenes del manual, con estaciones reales'),
      H.h('p', { class: 'sub' }, 'Las figs. 3.23 y 3.24 son esquemas sin datos. Estas son estaciones reales de cada tipo (normales OMM 1991–2020).'), grid,
      H.html(`<div class="small" style="margin-top:10px"><b>Tropical</b>: una estación lluviosa con el Sol alto y otra seca, más larga cuanto más lejos del ecuador. <b>Ecuatorial</b>: dos máximos hacia los equinoccios, sin mes realmente seco. <b>Monzónico</b>: lluvias torrenciales concentradas en verano. <b>Mediterráneo</b>: verano seco, máximo en otoño-invierno. <b>Continental</b>: máximo de verano por la convección. <b>Oceánico</b>: lluvia todo el año, máximo en otoño-invierno.</div>`)));

    /* juego: ¿qué régimen es? */
    const POOL = [['61052', 'tropical'], ['65330', 'tropical'], ['61099', 'tropical'], ['94120', 'tropical'], ['83377', 'tropical'], ['64456', 'ecuatorial'], ['21205791', 'ecuatorial'], ['43003', 'monzonico'], ['42515', 'monzonico'], ['8482', 'mediterraneo'], ['8391', 'mediterraneo'], ['85577', 'mediterraneo'], ['94608', 'mediterraneo'], ['72295', 'mediterraneo'], ['27612', 'continental'], ['12375', 'continental'], ['30710', 'continental'], ['44292', 'continental'], ['71155', 'continental'], ['7110', 'oceanico'], ['3953', 'oceanico'], ['1317', 'oceanico'], ['3969', 'oceanico']];
    const g = { i: -1, ok: 0, n: 0, done: false };
    const gc = H.h('canvas'), gcl = T3.climo(gc, (w) => Math.min(w * 0.5, 320));
    const gHint = H.h('p', { class: 'small' }), gFb = H.h('div', { class: 'fb' }), gScore = H.h('span', { class: 'pill ok' }, '0 / 0');
    const gBtns = H.h('div', { class: 'chipbar' });
    const next = () => { let k; do { k = Math.floor(Math.random() * POOL.length); } while (k === g.i); g.i = k; g.done = false; const st = T3.byId(POOL[k][0]); gcl.draw(st, {}); gHint.innerHTML = `Hemisferio ${st.lat >= 0 ? 'norte' : '<b>sur</b> (las estaciones van al revés)'} · ${H.f(st.pr[12])} mm al año`; gFb.className = 'fb'; H.$$('button', gBtns).forEach((b) => { b.disabled = false; b.className = 'chip'; }); };
    for (const [k, n] of TYPES) {
      const b = H.h('button', { class: 'chip', type: 'button' }, n);
      b.onclick = () => { if (g.done) return; g.done = true; g.n++; const [id, ans] = POOL[g.i], st = T3.byId(id), good = ans === k; if (good) g.ok++; gScore.textContent = `${g.ok} / ${g.n}`; b.classList.add(good ? 'ok' : 'ko'); H.$$('button', gBtns).forEach((x, j) => { if (TYPES[j][0] === ans) x.classList.add('ok'); x.disabled = true; }); gFb.className = 'fb show ' + (good ? 'ok' : 'ko'); gFb.innerHTML = `<b>${good ? 'Correcto.' : 'No es correcto.'}</b>Es ${T3.stLabel(st)}: régimen ${TYPES.find((t) => t[0] === ans)[1].toLowerCase()}. ${T3.regime(st).why}`; };
      gBtns.append(b);
    }
    const nb = H.h('button', { class: 'btn sm', type: 'button' }, 'Otra estación →'); nb.onclick = next;
    el.append(H.h('div', { class: 'card', style: { background: 'var(--soft)' } }, H.h('h4', {}, 'Practica: ¿qué régimen es?  ', gScore),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, gc), H.h('div', {}, gHint, gBtns, gFb, H.h('div', { style: { marginTop: '10px' } }, nb)))));
    next();

    /* ================= C · el Sol en el cénit y las lluvias tropicales ================= */
    const z = { lat: 0 };
    const decl = (doy) => H.sun(H.dateFromDoy(doy).getTime()).decl;
    const belt = (doy) => 2.5 + 10 * Math.cos(2 * Math.PI * (doy - 225) / 365); // franja de lluvias sobre África occidental (modelo)
    const rainAt = (lat, doy) => Math.exp(-Math.pow((lat - belt(doy)) / 5, 2));
    const zc = H.chart(H.h('canvas'), 0.42);
    const mc = H.h('canvas'), mcl = T3.climo(mc, (w) => Math.min(w * 0.55, 300));
    const zro = { pass: H.ro('Paso del Sol por el cénit', 'hl'), seas: H.ro('Estaciones lluviosas (modelo)', 'bl'), st: H.ro('Estación real comparable') };
    const TRANS = [['64456', 0], ['65344', 6], ['65330', 9], ['61099', 12], ['61052', 13.5], ['61043', 15], ['61024', 17], ['61017', 18.7]];
    const updZ = () => {
      const pts1 = [], pts2 = []; for (let d = 1; d <= 365; d += 2) { pts1.push([d, decl(d)]); pts2.push([d, belt(d)]); }
      const bands = []; let st = null; for (let d = 1; d <= 366; d++) { const r = d <= 365 && rainAt(z.lat, d) > 0.5; if (r && st == null) st = d; if (!r && st != null) { bands.push({ x0: st, x1: d, color: 'rgba(31,111,139,.13)' }); st = null; } }
      zc.draw({ xMin: 1, xMax: 365, yMin: -26, yMax: 30, xTicks: H.monthTicks(), yTicks: [-20, -10, 0, 10, 20].map((v) => ({ v, label: v + '°' })), yLabel: 'Latitud', bands,
        hlines: [{ y: z.lat, color: '#1c2836', dash: [6, 3], label: `tu latitud: ${z.lat}° N` }, { y: 23.44, color: 'rgba(28,40,54,.35)', label: 'trópico de Cáncer' }],
        series: [{ pts: pts1, color: '#e0a82e', width: 2.5 }, { pts: pts2, color: '#1f6f8b', width: 2.5, dash: [6, 4] }],
        after: (ctx, X, Y) => { ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#b07c12'; ctx.fillText('— Sol en el cénit (declinación)', X(8), Y(27)); ctx.fillStyle = '#1f6f8b'; ctx.fillText('- - franja de lluvias (sigue al Sol con retraso)', X(8), Y(24)); } });
      const ds = []; for (let d = 1; d < 365; d++) if ((decl(d) - z.lat) * (decl(d + 1) - z.lat) <= 0) ds.push(d);
      zro.pass.v.innerHTML = ds.length ? ds.map((d) => H.fdate(H.dateFromDoy(d))).join(' y ') : '<small>nunca (fuera de los trópicos)</small>';
      zro.seas.v.innerHTML = bands.length ? `${bands.length === 2 || (bands.length === 3 && bands[0].x0 === 1) ? 'dos' : 'una'} <small>(${bands.map((b) => H.MES3[H.dateFromDoy(b.x0).getUTCMonth()] + '–' + H.MES3[H.dateFromDoy(Math.min(365, b.x1 - 1)).getUTCMonth()]).join(', ')})</small>` : 'ninguna';
      const near = TRANS.reduce((a, b) => (Math.abs(b[1] - z.lat) < Math.abs(a[1] - z.lat) ? b : a)), sst = T3.byId(near[0]);
      zro.st.v.innerHTML = `${T3.stLabel(sst)} <small>${H.f(sst.lat, 1)}° N · ${H.f(sst.pr[12])} mm</small>`;
      mcl.draw(sst, { title: T3.stLabel(sst), sub: `${H.f(sst.lat, 1)}° N` });
    };
    const zS = H.slider('Latitud (África occidental)', 0, 20, 0.5, z.lat, (v) => H.f(v, 1) + '° N', (v) => { z.lat = v; updZ(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El Sol en el cénit y las lluvias de la zona intertropical'),
      H.h('p', { class: 'sub' }, 'Entre los trópicos, la franja de lluvias de la convergencia intertropical sigue al Sol en el cénit con unas semanas de retraso. Cerca del ecuador pasa dos veces al año (dos estaciones lluviosas); cerca de los trópicos, una sola. Mueve la latitud y compara con las estaciones reales del corte de Benín y Níger.'),
      zS, H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, zc.st.canvas), H.h('div', {}, H.h('div', { class: 'readouts' }, zro.pass, zro.seas, zro.st), H.h('div', { class: 'viz framed', style: { marginTop: '10px' } }, mc))),
      H.html(`<p class="small">Modelo didáctico de la franja de lluvias sobre África occidental: llega a unos 12° N en agosto y baja al hemisferio sur en enero. Para la posición del Sol a lo largo del año, ver <a href="${H.T1}#estaciones">Tema 1 · Traslación y estaciones</a>.</p>`)));
    updZ();

    el.append(H.selfCheck([
      { q: 'En un climograma de Gaussen, un mes es seco cuando…', opts: ['Llueve menos de 100 mm', 'La precipitación (mm) es menor que el doble de la temperatura (°C)', 'La temperatura supera los 20 °C', 'No llueve nada'], a: 1, ex: 'P < 2T: la barra queda por debajo de la curva de temperatura.' },
      { q: 'Cerca del ecuador suele haber dos estaciones lluviosas porque…', opts: ['Hay dos monzones', 'El Sol pasa dos veces por el cénit y la convergencia intertropical cruza el lugar dos veces', 'Hay dos frentes polares', 'Llueve todo el año por igual'], a: 1, ex: 'Hacia los equinoccios; los mínimos relativos coinciden con los solsticios.' },
      { q: 'El régimen mediterráneo se caracteriza por…', opts: ['Máximo de verano', 'Verano seco y máximo de otoño-invierno', 'Lluvia uniforme', 'Dos máximos en los equinoccios'], a: 1, ex: 'En verano domina el anticiclón subtropical (de las Azores).' },
      { q: 'En el interior de los continentes de latitudes medias (Moscú, Irkutsk) el máximo de lluvia llega…', opts: ['En invierno', 'En verano', 'En otoño', 'No hay máximo'], a: 1, ex: 'El calentamiento estival favorece la convección; en invierno domina el anticiclón continental frío.' },
      { q: 'Bombay recibe más de 2.500 mm al año, casi todos…', opts: ['Entre diciembre y marzo', 'Entre junio y septiembre', 'Repartidos en todos los meses', 'En dos estaciones'], a: 1, ex: 'Es el monzón de verano: aire húmedo del océano Índico hacia la convergencia intertropical, muy desplazada al norte.' },
    ]));
  },
});
