/* ===================== I · TIERRAS Y MARES ===================== */
H.tab({
  id: 'tierramar', nav: 'Tierras y mares', title: 'Tierras y mares',
  init(el) {
    el.append(H.intro('La insolación terrestre · apartado 5.1.5', 'El efecto de la desigual distribución de tierras y mares',
      'El mar refleja menos radiación que la tierra, deja que penetre a varios metros de profundidad, la reparte por mezcla y necesita mucho más calor para cambiar de temperatura. Por eso se calienta y se enfría despacio: suaviza las oscilaciones diarias y anuales de las costas y retrasa sus máximos. En el interior de los continentes ocurre lo contrario.',
      'Manual: 5.1.5 y 6.1<br>Ejercicio 2'));

    /* ---------- A · modelo diario ---------- */
    const SOILS = { arena: ['Arena seca', 0.35, 1.28e6, 0.2e-6], humedo: ['Suelo húmedo', 0.15, 2.5e6, 0.6e-6], roca: ['Roca', 0.2, 2.1e6, 1.3e-6] };
    const m = { doy: H.doyOf(H.EV.jun), soil: 'arena', depth: 5 };
    const ch = H.chart(H.h('canvas'), 0.46);
    const ro = { al: H.ro('Amplitud diaria en tierra', 'hl'), am: H.ro('Amplitud diaria en el mar', 'bl'), hl: H.ro('Máximo en tierra (hora solar)'), hm: H.ro('Máximo en el mar (hora solar)') };
    const sim = () => {
      const lat = H.place.lat, sn = H.sun(H.dateFromDoy(m.doy).getTime());
      const G = (h) => T2.clearSky(lat, sn.decl, h);
      let mean = 0; for (let h = 0; h < 24; h += 0.1) mean += G(h) / 240;
      const [, albL, rcL, kL] = SOILS[m.soil], omega = 2 * Math.PI / 86400;
      const dL = Math.sqrt(2 * kL / omega), CL = rcL * dL, CW = 4.18e6 * m.depth, albW = 0.06, BL = 15, BW = 20;
      let TL = 0, TW = 0; const dt = 300, out = [];
      const meanL = (1 - albL) * mean, meanW = (1 - albW) * mean;
      const days = 30;
      for (let i = 0; i < days * 288; i++) {
        const h = (i * dt / 3600) % 24, g = G(h);
        TL += ((1 - albL) * g - meanL - BL * TL) / CL * dt;
        TW += ((1 - albW) * g - meanW - BW * TW) / CW * dt;
        if (i >= (days - 1) * 288) out.push([h, TL, TW, g]);
      }
      return out;
    };
    const drawM = () => {
      const o = sim(), L = o.map((r) => [r[0], r[1]]), W = o.map((r) => [r[0], r[2]]), mx = Math.max(...o.map((r) => r[3]));
      const lim = Math.max(2, Math.ceil(Math.max(...L.map((p) => Math.abs(p[1]))) / 2) * 2 + 2);
      const Gs = o.map((r) => [r[0], -lim + r[3] / Math.max(1, mx) * lim * 0.9]);
      const iL = L.reduce((a, p, i) => (p[1] > L[a][1] ? i : a), 0), iW = W.reduce((a, p, i) => (p[1] > W[a][1] ? i : a), 0);
      const amp = (A) => Math.max(...A.map((p) => p[1])) - Math.min(...A.map((p) => p[1]));
      const yt = []; for (let v = -lim; v <= lim + 1e-9; v += lim > 10 ? 4 : 2) yt.push({ v, label: (v > 0 ? '+' : '') + H.f(v) });
      ch.draw({ xMin: 0, xMax: 24, yMin: -lim, yMax: lim, xTicks: [0, 3, 6, 9, 12, 15, 18, 21, 24].map((v) => ({ v, label: v + ' h' })), yTicks: yt, yLabel: 'Desviación de la media diaria (°C)', xLabel: 'Hora solar',
        series: [{ pts: Gs, color: 'rgba(226,167,42,.9)', width: 1.5, fill: 'rgba(226,167,42,.12)' }, { pts: L, color: '#b4531d', width: 3 }, { pts: W, color: '#1f6f8b', width: 3 }],
        hlines: [{ y: 0, color: 'rgba(28,40,54,.4)', dash: [2, 3] }],
        markers: [{ x: L[iL][0], y: L[iL][1], color: '#b4531d', label: 'tierra' }, { x: W[iW][0], y: W[iW][1], color: '#1f6f8b', label: 'mar' }] });
      ro.al.v.innerHTML = `${H.f(amp(L), 1)} <small>°C</small>`; ro.am.v.innerHTML = `${H.f(amp(W), 2)} <small>°C</small>`;
      ro.hl.v.textContent = H.clock(L[iL][0]); ro.hm.v.textContent = H.clock(W[iW][0]);
    };
    const dS = H.slider('Fecha', 1, H.daysInYear(), 1, m.doy, (v) => H.fdate(H.dateFromDoy(v)), (v) => { m.doy = v; drawM(); });
    const soilSeg = H.seg(Object.entries(SOILS).map(([k, v]) => [k, v[0]]), m.soil, (v) => { m.soil = v; drawM(); });
    const wS = H.slider('Profundidad del agua que se mezcla', 1, 30, 1, m.depth, (v) => v + ' m', (v) => { m.depth = v; drawM(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El mismo Sol sobre tierra y sobre agua'),
      H.h('p', { class: 'sub' }, 'Modelo didáctico de la temperatura de la superficie en la latitud de tu municipio, con cielo despejado. La curva amarilla es la radiación solar. La tierra se calienta solo en una capa de pocos centímetros; el agua reparte el calor en varios metros y refleja menos.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz' }, ch.st.canvas), H.h('div', { class: 'legend' }, H.h('span', {}, H.h('i', { style: { background: '#b4531d' } }), 'Tierra'), H.h('span', {}, H.h('i', { style: { background: '#1f6f8b' } }), 'Mar'), H.h('span', {}, H.h('i', { style: { background: '#e2a72a' } }), 'Radiación solar (escala relativa)'))),
        H.h('div', {}, dS, H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)', margin: '4px 0' } }, 'Tipo de suelo'), soilSeg, H.h('div', { style: { height: '10px' } }), wS,
          H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.al, ro.am, ro.hl, ro.hm),
          H.h('p', { class: 'small' }, 'Supuestos: albedo del agua 6 %; capacidad calorífica del agua 4.180 kJ/m³·°C; en tierra, la capa que se calienta en un día es la profundidad de amortiguamiento térmico del suelo (unos 7–19 cm). Las pérdidas se simplifican como proporcionales a la desviación de temperatura. Es un modelo para comparar, no para predecir valores reales.')))));
    drawM();

    /* ---------- B · continentalidad: transectos reales ---------- */
    const TR = {
      eur: ['Europa y Asia, ≈ 48–56° N', ['3953', '3969', '10381', '12375', '26850', '27612', '27595', '28698', '29430', '30710', '31735', '32583']],
      ame: ['América del Norte, ≈ 44–53° N', ['71783', '72793', '71155', '71508', '71742']],
      esp: ['España: del Atlántico a la Meseta (≈ 41–43° N)', ['8001', '8042', '8008', '8048', '8053', '8055', '8140', '8075']],
      med: ['España: del Mediterráneo al interior (≈ 39–41° N)', ['8285', '8284', '8235', '8231', '8219', '8222', '8202']],
    };
    const t = { k: 'eur', sel: null };
    const ach = H.chart(H.h('canvas'), 0.5), rch = H.chart(H.h('canvas'), 0.5);
    const tInfo = H.h('p', { class: 'small' });
    const grad = (i, n) => { const u = n > 1 ? i / (n - 1) : 0; return `rgb(${Math.round(31 + u * (180 - 31))},${Math.round(111 + u * (83 - 111))},${Math.round(139 + u * (29 - 139))})`; };
    const drawT = () => {
      const st = TR[t.k][1].map(T2.byId);
      const amps = st.map(T2.amp);
      rch.draw({ xMin: 0.5, xMax: 12.5, yMin: Math.floor(Math.min(...st.map((s) => Math.min(...s.ta.slice(0, 12)))) / 5) * 5, yMax: Math.ceil(Math.max(...st.map((s) => Math.max(...s.ta.slice(0, 12)))) / 5) * 5,
        xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: (() => { const a = []; const lo = Math.floor(Math.min(...st.map((s) => Math.min(...s.ta.slice(0, 12)))) / 5) * 5, hi = Math.ceil(Math.max(...st.map((s) => Math.max(...s.ta.slice(0, 12)))) / 5) * 5; const stp = hi - lo > 40 ? 10 : 5; for (let v = lo; v <= hi; v += stp) a.push({ v, label: v + '°' }); return a; })(),
        yLabel: 'Temperatura media (°C)', series: st.map((s, i) => ({ pts: s.ta.slice(0, 12).map((v, j) => [j + 1, v]), color: grad(i, st.length), width: t.sel === s.id ? 4 : 2 })) });
      const ymax = Math.ceil(Math.max(...amps) / 5) * 5 + 5;
      ach.draw({ xMin: -0.5, xMax: st.length - 0.5, yMin: 0, yMax: ymax, xTicks: [], yTicks: (() => { const a = []; for (let v = 0; v <= ymax; v += ymax > 30 ? 10 : 5) a.push({ v, label: v + '°' }); return a; })(), yLabel: 'Amplitud térmica anual (°C)', pad: { b: 70 },
        series: [], after: (ctx, X, Y, w, h) => {
          st.forEach((s, i) => { const x = X(i), bw = Math.min(36, (w - 80) / st.length * 0.7); ctx.fillStyle = grad(i, st.length); if (t.sel && t.sel !== s.id) ctx.globalAlpha = 0.45; ctx.fillRect(x - bw / 2, Y(amps[i]), bw, Y(0) - Y(amps[i])); ctx.globalAlpha = 1; ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(H.f(amps[i], 1), x, Y(amps[i]) - 4);
            ctx.save(); ctx.translate(x, Y(0) + 6); ctx.rotate(-Math.PI / 4); ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a6878'; ctx.fillText(s.name.replace(/ \(.*\)/, ''), 0, 0); ctx.restore(); });
        } });
      const a0 = amps[0], a1 = Math.max(...amps), s1 = st[amps.indexOf(a1)];
      tInfo.innerHTML = `De oeste a este (o de la costa al interior), la amplitud anual pasa de <b>${H.f(a0, 1)} °C</b> en ${st[0].name} a <b>${H.f(a1, 1)} °C</b> en ${s1.name}. Los inviernos se endurecen mucho más de lo que se calientan los veranos.`;
    };
    ach.st.canvas.addEventListener('click', (e) => { const x = ach.xAt(e); const st = TR[t.k][1]; const i = Math.round(x); t.sel = st[i] && t.sel !== st[i] ? st[i] : null; drawT(); });
    const trSeg = H.seg(Object.entries(TR).map(([k, v]) => [k, v[0]]), t.k, (v) => { t.k = v; t.sel = null; drawT(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Continentalidad: la amplitud anual crece hacia el interior'),
      H.h('p', { class: 'sub' }, 'Normales 1991–2020 de estaciones reales en latitudes parecidas, ordenadas de la costa occidental al interior. Pulsa una barra para resaltar su régimen.'),
      trSeg, H.h('div', { class: 'grid2 even', style: { marginTop: '10px' } }, H.h('div', { class: 'viz' }, ach.st.canvas), H.h('div', { class: 'viz' }, rch.st.canvas)), tInfo));
    drawT();

    /* ---------- C · fachadas occidentales y orientales ---------- */
    const PAIRS = [['8001', '31960', 'A Coruña y Vladivostok (≈ 43° N)'], ['3953', '32583', 'Valentia y Petropávlovsk-Kamchatski (≈ 52–53° N)'], ['1317', '25913', 'Bergen y Magadán (≈ 60° N)'], ['71783', '71742', 'Victoria y Gander (≈ 48–49° N)']];
    const pc = H.chart(H.h('canvas'), 0.46); const pInfo = H.h('div', { class: 'readouts' }); const pTxt = H.h('p', { class: 'small' });
    let pk = 0;
    const drawP = () => {
      const [a, b] = [T2.byId(PAIRS[pk][0]), T2.byId(PAIRS[pk][1])];
      const lo = Math.floor(Math.min(...a.ta.slice(0, 12), ...b.ta.slice(0, 12)) / 5) * 5, hi = Math.ceil(Math.max(...a.ta.slice(0, 12), ...b.ta.slice(0, 12)) / 5) * 5;
      const yt = []; for (let v = lo; v <= hi; v += 5) yt.push({ v, label: v + '°' });
      pc.draw({ xMin: 0.5, xMax: 12.5, yMin: lo, yMax: hi, xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: yt, yLabel: 'Temperatura media (°C)', hlines: [{ y: 0, color: 'rgba(31,111,139,.5)' }],
        series: [{ pts: a.ta.slice(0, 12).map((v, j) => [j + 1, v]), color: '#1f6f8b', width: 3 }, { pts: b.ta.slice(0, 12).map((v, j) => [j + 1, v]), color: '#b4531d', width: 3 }] });
      const card = (s, cls, side) => `<div class="ro ${cls}"><div class="k">${side} · ${s.name}</div><div class="v">${T2.fT(s.ta[0])} / ${T2.fT(s.ta[6])}</div><small>enero / julio · amplitud ${H.f(T2.amp(s), 1)} °C · ${H.f(Math.abs(s.lat), 1)}° ${s.lat >= 0 ? 'N' : 'S'}</small></div>`;
      pInfo.innerHTML = card(a, 'bl', 'Fachada occidental') + card(b, 'hl', 'Fachada oriental');
      pTxt.innerHTML = `A la misma latitud, el mes más frío es <b>${H.f(a.ta[0] - b.ta[0], 1)} °C</b> más cálido en la fachada occidental. Allí llegan los vientos del oeste cargados de aire oceánico y, en el Atlántico Norte y el Pacífico Norte, las aguas templadas de la deriva noratlántica y de la corriente de Alaska. Las costas orientales reciben aire continental y corrientes frías (Oyashio, Labrador).`;
    };
    const pSeg = H.seg(PAIRS.map((p, i) => [i, p[2]]), 0, (v) => { pk = v; drawP(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Fachadas occidentales y orientales'),
      H.h('p', { class: 'sub' }, 'En latitudes medias y altas, las costas occidentales de los continentes son mucho más templadas en invierno que las orientales.'),
      pSeg, H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', { class: 'viz' }, pc.st.canvas), H.h('div', {}, pInfo, pTxt))));
    drawP();

    H.onPlace(drawM);
    el.append(H.info('El ciclo diario en una estación del interior y otra de la costa (ejercicio 2 del manual) está en la pestaña <a href="#diario">Ciclo diario</a>.'));
    el.append(H.selfCheck([
      { q: '¿Por qué la amplitud térmica diaria es mucho menor sobre el mar que sobre la tierra?', opts: ['Porque el mar recibe menos radiación', 'Porque el agua reparte el calor en varios metros y necesita mucha energía para cambiar de temperatura', 'Porque el mar está siempre nublado', 'Porque el agua tiene más albedo'], a: 1, ex: 'Penetración, mezcla y elevada capacidad calorífica: el mismo calor se reparte en mucha más masa.' },
      { q: 'En el modelo, ¿qué ocurre con la hora del máximo térmico en el mar?', opts: ['Se adelanta respecto a la tierra', 'Se retrasa respecto a la tierra', 'Coincide con el mediodía', 'No hay máximo'], a: 1, ex: 'Cuanto mayor es la inercia térmica, más se retrasa el máximo respecto al de la radiación.' },
      { q: 'A lo largo del paralelo 52–56° N, de Irlanda a Siberia, la amplitud térmica anual…', opts: ['Disminuye hacia el este', 'Se mantiene casi igual', 'Aumenta hacia el interior y vuelve a bajar cerca del Pacífico', 'Es máxima en la costa atlántica'], a: 2, ex: 'Crece de ≈ 8 °C en Valentia a más de 35 °C en Siberia, y vuelve a bajar en la costa de Kamchatka, aunque allí el mar es frío.' },
      { q: '¿Por qué los inviernos son más suaves en las fachadas occidentales de los continentes en latitudes medias?', opts: ['Porque reciben más radiación solar', 'Por los vientos del oeste de origen oceánico y las corrientes cálidas', 'Porque están a menor altitud', 'Por la rotación de la Tierra en sí misma'], a: 1, ex: 'Los vientos dominantes del oeste llevan aire marítimo templado al interior; en el Atlántico Norte se suma la deriva noratlántica.' },
    ]));
  },
});
