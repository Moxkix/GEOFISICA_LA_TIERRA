/* ===================== T · CICLO DIARIO ===================== */
H.tab({
  id: 'diario', nav: 'Ciclo diario', title: 'La oscilación térmica diaria',
  init(el) {
    el.append(H.intro('La temperatura · apartado 6.1.1', 'La oscilación térmica diaria',
      'La radiación solar es máxima a mediodía, pero el aire sigue calentándose mientras el suelo reciba más energía de la que pierde: la temperatura máxima llega unas horas después. Por la noche el suelo se enfría por radiación y la mínima se alcanza hacia la salida del Sol. La diferencia entre ambas es la amplitud térmica diaria.',
      'Manual: 6.1.1<br>Fig. 2.12; ejercicio 2'));

    const MID = T2.MID;
    const nowM = new Date().getMonth();
    const s = { st: T2.myStation().s, m: nowM, lag: 2.5, sky: 'normal', clock: 'solar' };
    const SKY = { normal: ['Día normal del mes', 1], desp: ['Despejado', 1.3], cub: ['Cubierto', 0.4] };
    const solarInfo = (st, m) => {
      const d = H.dateFromDoy(MID[m]), sn = H.sun(d.getTime());
      const hd = H.halfDay(st.lat, sn.decl, -0.833);
      const off = st.es ? H.officialOffset({ es: true, can: st.lon < -12 }, d.getTime()) : null;
      return { sn, rise: 12 - hd, set: 12 + hd, off, shift: off == null ? 0 : off - st.lon / 15 - sn.eot / 60 }; // hora oficial = solar + shift
    };
    const curve = (st, m, lag, k = 1) => {
      const i = solarInfo(st, m), tx = st.tx ? st.tx[m] : st.ta[m] + 5, tn = st.tn ? st.tn[m] : st.ta[m] - 5;
      const mid = (tx + tn) / 2, half = (tx - tn) / 2 * k;
      const pts = []; for (let t = 0; t <= 24.001; t += 0.1) pts.push([t, T2.daily(t, mid - half, mid + half, i.rise, i.set, lag)]);
      return { pts, tx: mid + half, tn: mid - half, i };
    };

    /* ---------- A · insolación y temperatura ---------- */
    const rch = H.chart(H.h('canvas'), 0.27), tch = H.chart(H.h('canvas'), 0.42);
    const ro = { mx: H.ro('Máxima', 'hl'), mn: H.ro('Mínima', 'bl'), am: H.ro('Amplitud diaria'), md: H.ro('Media (máx. + mín.) / 2'), m24: H.ro('Media de las 24 h'), hmx: H.ro('Hora de la máxima'), hmn: H.ro('Hora de la mínima'), sol: H.ro('Salida y puesta del Sol') };
    const note = H.h('p', { class: 'small' });
    const draw = () => {
      const c = curve(s.st, s.m, s.lag, SKY[s.sky][1]), i = c.i;
      const sh = s.clock === 'oficial' && i.off != null ? i.shift : 0;
      const X = (t) => ((t + sh) % 24 + 24) % 24;
      const ord = (pts) => pts.map(([t, v]) => [X(t), v]).sort((a, b) => a[0] - b[0]);
      const tp = ord(c.pts);
      const rad = []; for (let t = 0; t <= 24.001; t += 0.1) rad.push([t, T2.clearSky(s.st.lat, i.sn.decl, t) * (s.sky === 'cub' ? 0.3 : 1)]);
      const rp = ord(rad);
      const xt = [0, 3, 6, 9, 12, 15, 18, 21, 24].map((v) => ({ v, label: v + ' h' }));
      const vl = [{ x: X(i.rise), color: 'rgba(226,167,42,.8)', label: 'orto' }, { x: X(i.set), color: 'rgba(226,167,42,.8)', label: 'ocaso' }];
      rch.draw({ xMin: 0, xMax: 24, yMin: 0, yMax: 1100, xTicks: xt, yTicks: [0, 500, 1000].map((v) => ({ v, label: H.f(v) })), yLabel: 'W/m²', series: [{ pts: rp, color: '#e2a72a', width: 2.5, fill: 'rgba(226,167,42,.18)' }], vlines: vl, pad: { b: 22 } });
      const lo = Math.floor((c.tn - 2) / 2) * 2, hi = Math.ceil((c.tx + 2) / 2) * 2, yt = []; for (let v = lo; v <= hi; v += hi - lo > 20 ? 4 : 2) yt.push({ v, label: v + '°' });
      const iMx = tp.reduce((a, p, k) => (p[1] > tp[a][1] ? k : a), 0), iMn = tp.reduce((a, p, k) => (p[1] < tp[a][1] ? k : a), 0);
      const m24 = c.pts.slice(0, 240).reduce((a, p) => a + p[1], 0) / 240, md = (c.tx + c.tn) / 2;
      tch.draw({ xMin: 0, xMax: 24, yMin: lo, yMax: hi, xTicks: xt, yTicks: yt, yLabel: 'Temperatura del aire (°C)', xLabel: s.clock === 'oficial' && i.off != null ? `Hora oficial (UTC+${i.off})` : 'Hora solar',
        series: [{ pts: tp, color: '#b4531d', width: 3 }], vlines: vl,
        hlines: [{ y: md, color: '#1c2836', dash: [6, 4] }, { y: m24, color: '#2d7a4c', dash: [2, 3] }],
        markers: [{ x: tp[iMx][0], y: tp[iMx][1], color: '#b4531d', label: 'máx' }, { x: tp[iMn][0], y: tp[iMn][1], color: '#1f6f8b', label: 'mín' }] });
      ro.mx.v.textContent = T2.fT(c.tx); ro.mn.v.textContent = T2.fT(c.tn); ro.am.v.innerHTML = `${H.f(c.tx - c.tn, 1)} <small>°C</small>`;
      ro.md.v.textContent = T2.fT(md); ro.m24.v.textContent = T2.fT(m24);
      ro.hmx.v.textContent = H.clock(tp[iMx][0]); ro.hmn.v.textContent = H.clock(tp[iMn][0]);
      ro.sol.v.textContent = `${H.clock(X(i.rise))} · ${H.clock(X(i.set))}`;
      note.innerHTML = `Normales 1991–2020 de <b>${T2.stLabel(s.st)}</b> para ${H.MESES[s.m]}: máxima media ${T2.fT(s.st.tx ? s.st.tx[s.m] : null)}, mínima media ${T2.fT(s.st.tn ? s.st.tn[s.m] : null)}.${s.st.tx ? '' : ' Esta estación no tiene normales de máximas y mínimas: se supone una amplitud de 10 °C.'} ${s.clock === 'oficial' && i.off == null ? 'La hora oficial solo se calcula para estaciones españolas.' : ''}`;
    };
    const stSel = T2.stationSelect(s.st.id, (st) => { s.st = st; draw(); });
    const mS = H.slider('Mes', 0, 11, 1, s.m, (v) => H.MESES[v], (v) => { s.m = v; draw(); });
    const lS = H.slider('Retraso de la máxima respecto al mediodía solar', 1, 4, 0.1, s.lag, (v) => H.f(v, 1) + ' h', (v) => { s.lag = v; draw(); });
    const skySeg = H.seg(Object.entries(SKY).map(([k, v]) => [k, v[0]]), s.sky, (v) => { s.sky = v; draw(); });
    const clkSeg = H.seg([['solar', 'Hora solar'], ['oficial', 'Hora oficial']], s.clock, (v) => { s.clock = v; draw(); });
    const meBtn = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Estación de mi municipio');
    meBtn.onclick = () => { s.st = T2.myStation().s; stSel.set(s.st.id); draw(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Insolación y temperatura a lo largo del día'),
      H.h('p', { class: 'sub' }, 'Curva diaria reconstruida a partir de las temperaturas máxima y mínima medias del mes en la estación elegida (modelo de Parton y Logan). Arriba, la radiación solar con cielo despejado; abajo, la temperatura del aire.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz' }, rch.st.canvas), H.h('div', { class: 'viz' }, tch.st.canvas), H.html('<div class="legend"><span><i style="background:#b4531d"></i>Temperatura del aire</span><span><i style="background:#1c2836"></i>(máx. + mín.)/2 (discontinua)</span><span><i style="background:#2d7a4c"></i>Media de las 24 h (punteada)</span></div>')),
        H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Estación'), H.h('div', { class: 'row' }, stSel, meBtn)), mS, lS,
          H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)', margin: '2px 0 4px' } }, 'Tipo de día (aproximado)'), skySeg, H.h('div', { style: { height: '8px' } }), clkSeg,
          H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.mx, ro.mn, ro.am, ro.md, ro.m24, ro.hmx, ro.hmn, ro.sol), note))));
    draw();
    H.onPlace(() => { s.st = T2.myStation().s; stSel.set(s.st.id); draw(); });

    /* ---------- B · ejercicio 2: interior y litoral ---------- */
    const e2 = { a: T2.byId('8221'), b: T2.byId('8001') };
    const c1 = H.chart(H.h('canvas'), 0.62), c2 = H.chart(H.h('canvas'), 0.62);
    const drawE2 = () => {
      const all = [];
      const mk = (st) => [0, 6].map((m) => { const c = curve(st, m, 2.5); all.push(...c.pts.map((p) => p[1])); return c.pts; });
      const A = mk(e2.a), B = mk(e2.b);
      const lo = Math.floor(Math.min(...all) / 5) * 5, hi = Math.ceil(Math.max(...all) / 5) * 5, yt = []; for (let v = lo; v <= hi; v += 5) yt.push({ v, label: v + '°' });
      const xt = [0, 4, 8, 12, 16, 20, 24].map((v) => ({ v, label: v }));
      const opt = (S, st) => ({ xMin: 0, xMax: 24, yMin: lo, yMax: hi, xTicks: xt, yTicks: yt, xLabel: 'Hora solar · ' + st.name, series: [{ pts: S[0], color: '#1f6f8b', width: 2.5 }, { pts: S[1], color: '#b4531d', width: 2.5 }],
        after: (ctx, X, Y) => { ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#b4531d'; ctx.fillText('julio', X(1), Y(S[1][10][1]) - 8); ctx.fillStyle = '#1f6f8b'; ctx.fillText('enero', X(1), Y(S[0][10][1]) - 8); } });
      c1.draw(opt(A, e2.a)); c2.draw(opt(B, e2.b));
    };
    const sa = T2.stationSelect(e2.a.id, (st) => { e2.a = st; drawE2(); }), sb = T2.stationSelect(e2.b.id, (st) => { e2.b = st; drawE2(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Ejercicio de autoevaluación 2 del manual: interior y litoral'),
      H.h('p', { class: 'sub' }, 'Ciclos diarios de enero y julio en una estación del interior y otra del litoral, reconstruidos con sus normales reales. Puedes cambiar las estaciones.'),
      H.h('div', { class: 'grid2 even' }, H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Interior'), sa), H.h('div', { class: 'viz' }, c1.st.canvas)), H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Litoral'), sb), H.h('div', { class: 'viz' }, c2.st.canvas))),
      H.openQ('¿Qué factores determinan las variaciones térmicas observadas?', 'Dos factores. <b>1) La estación del año</b> (altura del Sol y duración del día): en julio las temperaturas son más altas en ambos lugares y la amplitud diaria es mayor en el interior. <b>2) La proximidad del mar (continentalidad)</b>: el litoral tiene oscilaciones diarias y anuales mucho menores, porque el agua se calienta y se enfría despacio y el aire marino suaviza los extremos; en el interior el suelo se calienta y se enfría rápidamente, sobre todo con cielos despejados y aire seco. Además, en el interior la diferencia entre enero y julio (amplitud anual) es mucho mayor.')));
    drawE2();

    /* ---------- C · práctica con un termómetro ---------- */
    const pr = H.h('div');
    const newPr = () => {
      const es = T2.ST.filter((x) => x.es && x.tx), st = es[Math.floor(Math.random() * es.length)], m = Math.floor(Math.random() * 12);
      const c = curve(st, m, 2.5);
      const rd = []; for (let h = 0; h < 24; h++) rd.push(Math.round((c.pts[h * 10][1] + (Math.random() - 0.5) * 0.6) * 10) / 10);
      const mx = Math.max(...rd), mn = Math.min(...rd), md = (mx + mn) / 2, m24 = rd.reduce((a, v) => a + v, 0) / 24;
      pr.innerHTML = '';
      pr.append(H.h('p', {}, `Lecturas horarias de un día de ${H.MESES[m]} en ${st.name} (hora solar):`),
        H.html(`<div style="overflow-x:auto"><table class="t flowtable"><tbody><tr>${rd.slice(0, 12).map((v, h) => `<td class="n"><span class="small">${h} h</span><br>${H.f(v, 1)}</td>`).join('')}</tr><tr>${rd.slice(12).map((v, h) => `<td class="n"><span class="small">${h + 12} h</span><br>${H.f(v, 1)}</td>`).join('')}</tr></tbody></table></div>`));
      const inp = (lab) => { const i = H.h('input', { type: 'number', step: '0.1' }); return [i, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, lab), i)]; };
      const [iA, wA] = inp('Amplitud diaria (°C)'), [iM, wM] = inp('Temperatura media (máx. + mín.)/2 (°C)');
      const res = H.h('p');
      const chk = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar');
      chk.onclick = () => { const a = parseFloat(String(iA.value).replace(',', '.')), b = parseFloat(String(iM.value).replace(',', '.')); const okA = Math.abs(a - (mx - mn)) < 0.06, okM = Math.abs(b - md) < 0.06; res.innerHTML = `${okA ? '<span class="pill ok">Amplitud correcta</span>' : `<span class="pill ko">Amplitud: ${H.f(mx, 1)} − ${H.f(mn, 1)} = ${H.f(mx - mn, 1)} °C</span>`} ${okM ? '<span class="pill ok">Media correcta</span>' : `<span class="pill ko">Media: (${H.f(mx, 1)} + ${H.f(mn, 1)}) / 2 = ${H.f(md, 2)} °C</span>`}<br><span class="small">La media de las 24 lecturas, el método más preciso, sería ${H.f(m24, 2)} °C.</span>`; };
      pr.append(H.h('div', { class: 'grid2 even' }, wA, wM), H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, H.h('span', { style: { flex: 'none' } }, chk), H.h('span', { style: { flex: 'none' } }, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newPr }, 'Otro día'))), res);
    };
    newPr();
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Practica: de las lecturas del termómetro a los valores diarios'), pr));

    el.append(H.fix('apartado 6.1.1', [
      'La máxima suele producirse hacia las <b>14–16 h solares</b>; en España, en verano, eso son las <b>16–18 h oficiales</b> (cambia a «Hora oficial» en el gráfico). La mínima se da hacia la <b>salida del Sol</b>, que según la estación y la latitud ocurre entre las 5 y las 8 h solares, no siempre «hacia las 6».',
      'Temperatura media diaria: la media de las <b>24 lecturas horarias</b> es la más precisa; para las normales climatológicas, la OMM recomienda <b>(máx. + mín.)/2</b>, porque permite comparar estaciones de todo el mundo. Tomar la lectura de las 9 h no es un procedimiento estándar.',
    ]));
    el.append(H.selfCheck([
      { q: '¿Por qué la temperatura máxima del día no coincide con el mediodía solar?', opts: ['Por la refracción atmosférica', 'Porque el suelo sigue ganando más energía de la que pierde durante unas horas', 'Porque el Sol está más cerca por la tarde', 'Por la rotación de la Tierra'], a: 1, ex: 'Mientras el balance del suelo sea positivo, la temperatura sigue subiendo: es la inercia térmica.' },
      { q: '¿Cuándo se suele registrar la temperatura mínima?', opts: ['A medianoche', 'Hacia la salida del Sol', 'Justo después de la puesta del Sol', 'A las 3 h en cualquier estación'], a: 1, ex: 'El suelo pierde calor por radiación durante toda la noche y la mínima llega hacia el amanecer.' },
      { q: 'Una estación registra una máxima de 31 °C y una mínima de 17 °C. Su amplitud y media diarias son…', opts: ['14 °C y 24 °C', '48 °C y 24 °C', '14 °C y 14 °C', '24 °C y 14 °C'], a: 0, ex: 'Amplitud = 31 − 17 = 14 °C; media ≈ (31 + 17)/2 = 24 °C.' },
      { q: '¿Dónde esperarías la mayor amplitud térmica diaria?', opts: ['En una isla tropical', 'En la costa cantábrica en invierno', 'En un desierto subtropical con cielo despejado', 'En el océano Antártico'], a: 2, ex: 'Aire seco, cielo despejado y suelo desnudo: mucha radiación de día y gran pérdida de calor de noche.' },
    ]));
  },
});
