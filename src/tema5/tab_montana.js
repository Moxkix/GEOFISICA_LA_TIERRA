/* ===================== M · CLIMAS DE MONTAÑA ===================== */
H.tab({
  id: 'montana', nav: 'Climas de montaña', title: 'Los climas de montaña',
  init(el) {
    el.append(H.intro('Los climas azonales · apartado 2.2', 'Los climas de montaña: subir es como viajar hacia el polo',
      'Con la altura baja la temperatura (unos 0,65 °C cada 100 m), aumentan la insolación y la radiación ultravioleta y, hasta cierta altitud, la precipitación. Pero la montaña conserva los rasgos de su zona: en el ecuador apenas hay estaciones a ninguna altura, y en las latitudes medias la orientación de las laderas lo cambia todo. Aquí simulas los pisos, compruebas los gradientes con estaciones reales y mides la diferencia entre solana y umbría.',
      'Manual: 2.2<br>Cuadro 5.3<br>Figs. 5.8 y 5.10'));
    el.append(T5.optCtrl());

    /* ================= A · simulador de pisos ================= */
    const CALDAS = [[24, 'Cálido', '0-1.000 m'], [17.5, 'Templado', '1.000-2.000 m'], [12, 'Frío', '2.000-3.000 m'], [7, 'Páramo bajo', '3.000-3.700 m'], [-99, 'Páramo alto', '3.700-4.200 m']];
    const caldas = (t) => CALDAS.find((c) => t >= c[0]);
    /* pisos de vegetación aproximados por la temperatura del mes más cálido (latitudes medias, fig. 5.10) */
    const BELTS = [[18, 'Basal o colino: frondosas, cultivos'], [14, 'Montano: hayas, robles, abetos'], [10, 'Subalpino: coníferas (pino negro, alerce); límite del bosque'], [0, 'Alpino: prados y matorral, sin árboles'], [-99, 'Nival: nieves perpetuas']];
    const belt = (tmax) => BELTS.find((b) => tmax >= b[0]);
    const BASES = { ecu: { id: '82331', n: 'Ecuador (Manaos)' }, pir: { id: '8094', n: 'Pirineo (Huesca)' } };
    const S = { base: 'pir', z: 2000, lr: 0.65 };
    const card = H.h('div', { class: 'card' });
    card.append(H.h('h3', {}, 'Simulador de pisos'), H.h('p', { class: 'sub' }, 'Partimos del clima de un lugar bajo y subimos por una ladera imaginaria: cada 100 m la temperatura de todos los meses baja según el gradiente elegido. La precipitación se deja igual, para aislar el efecto de la temperatura. Las columnas muestran el tipo de Köppen a cada altitud en la montaña ecuatorial y en la elegida.'));
    const base = () => {
      if (S.base === 'mun') { const c = T5.placeClimate(); const alt = T3.placeAlt(); return { T: c.T, P: c.P, lat: H.place.lat, z0: alt != null ? alt : c.st ? c.st.elev : 0, name: H.placeLabel() }; }
      const s = T5.byId(BASES[S.base].id); return { T: s.ta.slice(0, 12), P: s.pr.slice(0, 12), lat: s.lat, z0: s.elev, name: T5.stLabel(s) };
    };
    const ecuB = () => { const s = T5.byId(BASES.ecu.id); return { T: s.ta.slice(0, 12), P: s.pr.slice(0, 12), lat: s.lat, z0: s.elev, name: 'Montaña ecuatorial (base: Manaos)' }; };
    const at = (b, z) => b.T.map((t) => t - S.lr * (z - b.z0) / 100);
    const seg = H.seg([['ecu', 'Ecuador (Manaos, 61 m)'], ['pir', 'Pirineo (Huesca, 541 m)'], ['mun', 'Tu municipio']], S.base, (v) => { S.base = v; upd(); });
    const sz = H.slider('Altitud', 0, 6500, 50, S.z, (v) => H.f(v) + ' m', (v) => { S.z = v; upd(); });
    const sl = H.slider('Gradiente térmico vertical', 0.4, 0.9, 0.01, S.lr, (v) => H.f(v, 2) + ' °C / 100 m', (v) => { S.lr = v; upd(); });
    const cvP = H.h('canvas'), cvC = H.h('canvas'), clC = T3.climo(cvC, (w) => Math.min(w * 0.58, 280));
    const ro = H.h('div', { class: 'readouts' });
    const profile = (ctx, x0, w, h, b, title, Y, zMax, tropical) => {
      const STEP = 25, segs = [], pis = [];
      for (let z = b.z0; z <= zMax; z += STEP) {
        const Tz = at(b, z), t = KG.type(Tz, b.P, b.lat, T5.opt);
        const lab = tropical ? caldas(Tz.reduce((a, c) => a + c, 0) / 12)[1] : belt(Math.max(...Tz))[1].split(':')[0];
        if (!segs.length || segs[segs.length - 1].t !== t) segs.push({ t, z0: z, z1: z + STEP }); else segs[segs.length - 1].z1 = z + STEP;
        if (!pis.length || pis[pis.length - 1].t !== lab) pis.push({ t: lab, z0: z, z1: z + STEP }); else pis[pis.length - 1].z1 = z + STEP;
      }
      const yy = (z) => Math.round(Y(Math.min(z, zMax)));
      const PCOL = tropical ? { 'Cálido': '#e8d7a5', 'Templado': '#d6dca4', 'Frío': '#b7d1a8', 'Páramo bajo': '#c9d2c7', 'Páramo alto': '#e2e4e6' }
        : { 'Basal o colino': '#d6dca4', 'Montano': '#b9d3a0', 'Subalpino': '#9cc39e', 'Alpino': '#dfe4d0', 'Nival': '#f2f4f6' };
      const w1 = Math.round(w * 0.5), x2 = Math.round(x0 + w * 0.52), w2 = Math.round(w * 0.46);
      for (const g of segs) { ctx.fillStyle = KG.css(g.t); ctx.fillRect(Math.round(x0), yy(g.z1), w1, yy(g.z0) - yy(g.z1)); }
      for (const g of pis) { ctx.fillStyle = PCOL[g.t] || '#eee'; ctx.fillRect(x2, yy(g.z1), w2, yy(g.z0) - yy(g.z1)); }
      // rótulos al pie de cada tramo, si caben
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      for (const g of segs) { if (yy(g.z0) - yy(g.z1) < 12) continue; ctx.fillStyle = KG.ink(g.t); ctx.font = 'bold 10.5px ui-monospace,monospace'; ctx.fillText(g.t, Math.round(x0) + 4, yy(g.z0) - 2); }
      for (const g of pis) { if (yy(g.z0) - yy(g.z1) < 12) continue; ctx.fillStyle = '#1c2836'; ctx.font = '10px system-ui'; let t = g.t; while (ctx.measureText(t).width > w2 - 6 && t.length > 4) t = t.slice(0, -2) + '…'; ctx.fillText(t, x2 + 3, yy(g.z0) - 2); }
      ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(title, x0 + w / 2, 4);
      ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.fillText(`Köppen  ·  ${tropical ? 'pisos de Caldas' : 'pisos de vegetación'}`, x0 + w / 2, 18);
    };
    const stP = H.autoCanvas(cvP, (w) => Math.min(Math.max(w * 0.7, 360), 520), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const zMax = 6500, L = 58, top = 36, bot = 14, Y = (z) => h - bot - z / zMax * (h - top - bot);
      ctx.fillStyle = '#5a6878'; ctx.font = '10.5px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(28,40,54,.1)';
      for (let z = 0; z <= zMax; z += 1000) { ctx.fillText(H.f(z) + ' m', L - 5, Y(z)); ctx.beginPath(); ctx.moveTo(L, Y(z)); ctx.lineTo(w - 6, Y(z)); ctx.stroke(); }
      const cw = (w - L - 16) / 2;
      const b1 = ecuB(), b2 = base();
      profile(ctx, L + 4, cw - 6, h, b1, 'Montaña ecuatorial', Y, zMax, true);
      profile(ctx, L + 10 + cw, cw - 6, h, b2, S.base === 'ecu' ? 'La misma, otra vez' : b2.name.length > 26 ? b2.name.slice(0, 25) + '…' : b2.name, Y, zMax, Math.abs(b2.lat) < 23.44);
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.beginPath(); ctx.moveTo(L, Y(S.z)); ctx.lineTo(w - 6, Y(S.z)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = '#b4531d'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.font = 'bold 11px system-ui'; ctx.fillText(H.f(S.z) + ' m', L + 4, Y(S.z) - 2);
    });
    const upd = () => {
      const b = base(), z = Math.max(S.z, b.z0), Tz = at(b, z), P = b.P, r = KG.classify(Tz, P, b.lat, T5.opt), tr = Math.abs(b.lat) < 23.44;
      const tann = Tz.reduce((a, c) => a + c, 0) / 12, tmax = Math.max(...Tz), tmin = Math.min(...Tz);
      clC.draw(T5.asStation(Tz, P, b.lat), { title: `A ${H.f(z)} m sobre ${b.name}`, sub: `modelo · ${T5.fT(tann)} de media` });
      ro.innerHTML = `<div class="ro hl"><div class="k">Köppen a ${H.f(z)} m</div><div class="v">${T5.chip(r.type)} <small>${KG.NAME[r.type]}</small></div></div>
        <div class="ro"><div class="k">Temperatura media anual</div><div class="v">${T5.fT(tann)}</div></div>
        <div class="ro"><div class="k">Mes más cálido / más frío</div><div class="v">${T5.fT(tmax, 1)} / ${T5.fT(tmin, 1)}</div></div>
        <div class="ro bl"><div class="k">${tr ? 'Piso térmico de Caldas' : 'Piso de vegetación (aprox.)'}</div><div class="v"><small>${tr ? caldas(tann)[1] + ' (' + caldas(tann)[2] + ' según Caldas)' : belt(tmax)[1]}</small></div></div>`;
      if (S.z < b.z0) sz.set(b.z0);
      stP.redraw();
    };
    card.append(H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '2 1 320px' } }, H.h('div', { class: 'small' }, 'Montaña que se compara con la ecuatorial'), seg)),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvP)), H.h('div', {}, sz, sl, H.h('div', { class: 'viz framed' }, cvC), H.h('div', { style: { height: '8px' } }), ro)),
      H.html('<p class="hint">Fíjate en la amplitud anual: en la montaña ecuatorial sigue siendo de 1-2 °C a cualquier altura (los pisos se definen por la temperatura media, como hace Caldas), mientras que en el Pirineo los inviernos se vuelven largos y fríos. Es un modelo sencillo: en la realidad el límite del bosque está más alto en los trópicos (3.500-4.000 m) que en el Pirineo (2.200-2.400 m), y las nieves perpetuas dependen también de cuánta nieve cae.</p>'));
    H.onPlace(() => { if (S.base === 'mun') upd(); });
    T5.onOpt(upd);
    el.append(card);
    upd();

    /* ================= B · montaña y llano: datos reales ================= */
    const PAIRS = [['8215', '8222', 'Navacerrada y Madrid'], ['60010', '60020', 'Izaña y Santa Cruz de Tenerife'], ['60010', '60015', 'Izaña y Tenerife Norte']];
    const R = { a: T5.byId('8215'), b: T5.byId('8222') };
    const rCard = H.h('div', { class: 'card' });
    rCard.append(H.h('h3', {}, 'Montaña y llano con datos reales'), H.h('p', { class: 'sub' }, 'La actividad del manual: comparar una estación de montaña con otra próxima y más baja. El gráfico muestra el gradiente térmico real de cada mes (cuántos grados baja la temperatura cada 100 m) entre las dos estaciones.'));
    const cA = H.h('canvas'), cB = H.h('canvas'), lA = T3.climo(cA, (w) => Math.min(w * 0.62, 260)), lB = T3.climo(cB, (w) => Math.min(w * 0.62, 260));
    const cG = H.h('canvas'), chG = H.chart(cG, (w) => Math.min(w * 0.4, 230));
    const rRo = H.h('div', { class: 'info' });
    const pairSeg = H.seg(PAIRS.map(([a, b, n], i) => [i, n]), 0, (i) => { R.a = T5.byId(PAIRS[i][0]); R.b = T5.byId(PAIRS[i][1]); selA.set(R.a.id); selB.set(R.b.id); updR(); });
    const selA = T5.stationSelect(R.a.id, (s) => { R.a = s; updR(); }), selB = T5.stationSelect(R.b.id, (s) => { R.b = s; updR(); });
    const updR = () => {
      const hi = R.a.elev >= R.b.elev ? R.a : R.b, lo = hi === R.a ? R.b : R.a, dz = hi.elev - lo.elev;
      lA.draw(hi, { title: T5.stLabel(hi), sub: H.f(hi.elev) + ' m · ' + T5.type(hi) }); lB.draw(lo, { title: T5.stLabel(lo), sub: H.f(lo.elev) + ' m · ' + T5.type(lo) });
      if (dz < 100) { rRo.innerHTML = 'Elige dos estaciones con al menos 100 m de desnivel.'; chG.draw({ xMin: 0, xMax: 1, yMin: 0, yMax: 1, series: [] }); return; }
      const g = hi.ta.slice(0, 12).map((t, i) => (lo.ta[i] - t) / dz * 100), gm = (lo.ta[12] - hi.ta[12]) / dz * 100;
      chG.draw({ xMin: 0.5, xMax: 12.5, yMin: 0, yMax: Math.max(1, Math.ceil(Math.max(...g) * 10 + 1) / 10), pad: { l: 46 },
        xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ v, label: H.f(v, 1) })), yLabel: '°C / 100 m',
        hlines: [{ y: 0.65, color: '#b4531d', label: '0,65 (valor medio)' }],
        series: [{ pts: g.map((v, i) => [i + 1, v]), color: '#1f6f8b', width: 2.5 }], markers: g.map((v, i) => ({ x: i + 1, y: v, r: 3.5, color: '#1f6f8b' })) });
      const iMx = g.indexOf(Math.max(...g)), iMn = g.indexOf(Math.min(...g));
      rRo.innerHTML = `Desnivel: <b>${H.f(dz)} m</b>. Gradiente medio anual: <b>${H.f(gm, 2)} °C/100 m</b>; máximo en ${H.MESES[iMx]} (${H.f(g[iMx], 2)}) y mínimo en ${H.MESES[iMn]} (${H.f(g[iMn], 2)}). Precipitación: ${H.f(hi.pr[12])} mm arriba y ${H.f(lo.pr[12])} mm abajo.`;
    };
    rCard.append(pairSeg, H.h('div', { class: 'row', style: { margin: '8px 0' } }, H.h('div', {}, H.h('label', { class: 'small' }, 'Estación 1'), selA), H.h('div', {}, H.h('label', { class: 'small' }, 'Estación 2'), selB)),
      H.h('div', { class: 'vs' }, H.h('div', { class: 'viz framed' }, cA), H.h('div', { class: 'viz framed' }, cB)), H.h('div', { style: { height: '10px' } }), H.h('div', { class: 'viz framed' }, cG), rRo,
      H.html('<p class="hint">Entre Navacerrada y Madrid el gradiente es mayor en primavera y verano (0,73-0,77 °C/100 m) que en invierno (0,49-0,54), como dice el cuadro 5.3, y arriba llueve tres veces más. En Tenerife ocurre lo contrario: en verano Izaña queda por encima de la inversión del alisio, en aire cálido y seco, y el gradiente cae a 0,3 °C/100 m; por encima del mar de nubes llueve menos que en Tenerife Norte.</p>'));
    el.append(rCard);
    updR();

    /* ================= C · solana y umbría ================= */
    const O = { lat: Math.round(H.place.lat), beta: 30 };
    const sCard = H.h('div', { class: 'card' });
    sCard.append(H.h('h3', {}, 'Solana y umbría'), H.h('p', { class: 'sub' }, 'Radiación solar diaria con cielo despejado sobre una ladera orientada al ecuador (solana), otra orientada al polo (umbría) y el llano, a lo largo del año. El manual afirma que en los trópicos la diferencia casi se anula y que en latitudes altas es enorme: compruébalo moviendo la latitud.'));
    const cS = H.h('canvas'), chS = H.chart(cS, (w) => Math.min(w * 0.45, 300));
    const sRo = H.h('div', { class: 'readouts' });
    /* radiación (MJ/m²·día) sobre una pendiente beta orientada al ecuador (dir = +1) o al polo (−1) */
    const rad = (lat, doy, beta, dir) => {
      const phi = Math.abs(lat) * H.D2R, sgn = lat >= 0 ? 1 : -1;
      const dec = sgn * 23.44 * Math.sin(2 * Math.PI * (284 + doy) / 365) * H.D2R, E0 = 1 + 0.033 * Math.cos(2 * Math.PI * doy / 365), b = beta * H.D2R;
      let sum = 0;
      for (let m = 0; m < 1440; m += 10) {
        const hA = (m / 60 - 12) * 15 * H.D2R, cz = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hA);
        if (cz <= 0.01) continue;
        const zen = Math.acos(cz) / H.D2R, am = 1 / (cz + 0.50572 * Math.pow(96.07995 - zen, -1.6364)), dni = 1361 * E0 * Math.pow(0.7, Math.pow(am, 0.678));
        const pe = phi - dir * b, ci = dir === 0 ? cz : Math.sin(dec) * Math.sin(pe) + Math.cos(dec) * Math.cos(pe) * Math.cos(hA);
        const diff = 0.1 * dni * cz * (dir === 0 ? 1 : (1 + Math.cos(b)) / 2);
        sum += (Math.max(0, ci) * dni + diff) * 600;
      }
      return sum / 1e6;
    };
    const slat = H.slider('Latitud', -75, 75, 1, O.lat, (v) => `${H.f(Math.abs(v))}° ${v >= 0 ? 'N' : 'S'}`, (v) => { O.lat = v; updS(); });
    const sb = H.slider('Pendiente de las laderas', 10, 45, 1, O.beta, (v) => H.f(v) + '°', (v) => { O.beta = v; updS(); });
    const updS = () => {
      const days = Array.from({ length: 73 }, (_, i) => 1 + i * 5);
      const so = days.map((d) => [d, rad(O.lat, d, O.beta, 1)]), um = days.map((d) => [d, rad(O.lat, d, O.beta, -1)]), ll = days.map((d) => [d, rad(O.lat, d, 0, 0)]);
      const mx = Math.max(...so.map((p) => p[1]), ...ll.map((p) => p[1]));
      chS.draw({ xMin: 1, xMax: 365, yMin: 0, yMax: Math.ceil(mx / 5) * 5, pad: { l: 46 }, xTicks: H.monthTicks(), yTicks: Array.from({ length: Math.ceil(mx / 5) + 1 }, (_, i) => ({ v: i * 5, label: H.f(i * 5) })), yLabel: 'MJ/m² · día',
        series: [{ pts: ll, color: '#5a6878', width: 1.6, dash: [5, 3] }, { pts: so, color: '#e8590c', width: 2.6 }, { pts: um, color: '#1f6f8b', width: 2.6 }] });
      const wd = O.lat >= 0 ? 355 : 172, sd = O.lat >= 0 ? 172 : 355;
      const rw = rad(O.lat, wd, O.beta, -1) / Math.max(1e-6, rad(O.lat, wd, O.beta, 1)), rs = rad(O.lat, sd, O.beta, -1) / rad(O.lat, sd, O.beta, 1);
      const zero = days.filter((d) => rad(O.lat, d, O.beta, -1) < 0.6 && rad(O.lat, d, O.beta, 1) > 1.5).length * 5;
      const yr = (d) => d.reduce((x, p) => x + p[1], 0), ry = yr(um) / yr(so);
      sRo.innerHTML = `<div class="ro hl"><div class="k">Umbría / solana en todo el año</div><div class="v">${H.f(ry * 100)} <small>%</small></div></div><div class="ro bl"><div class="k">Umbría / solana en el solsticio de invierno</div><div class="v">${H.f(rw * 100)} <small>%</small></div></div>
        <div class="ro"><div class="k">Umbría / solana en el de verano</div><div class="v">${H.f(rs * 100)} <small>%</small></div></div>
        <div class="ro"><div class="k">Días en que la umbría apenas recibe sol directo</div><div class="v">${zero ? 'unos ' + H.f(zero) : 'ninguno'}</div></div>`;
    };
    const myLat = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Latitud de mi municipio'); myLat.onclick = () => { O.lat = Math.round(H.place.lat); slat.set(O.lat); updS(); };
    sCard.append(H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cS), H.html('<div class="legend"><span><i style="background:#e8590c"></i>solana (orientada al ecuador)</span><span><i style="background:#1f6f8b"></i>umbría (orientada al polo)</span><span><i style="background:#5a6878"></i>llano</span></div>')),
      H.h('div', {}, slat, sb, myLat, H.h('div', { style: { height: '10px' } }), sRo)),
      H.html('<p class="hint">En el ecuador, sumando todo el año, las dos laderas reciben lo mismo: cada una hace de «solana» durante medio año, porque el Sol pasa al norte o al sur del cenit. A 43° y en pleno invierno, una umbría de 30° recibe un 4 % de lo que recibe la solana (con 15° de pendiente, un 22 %); más allá de 60°, en invierno no le llega el sol directo. Cálculo con la posición del Sol cada 10 minutos y una atmósfera despejada tipo (fórmula de Meinel).</p>'));
    el.append(sCard);
    updS();

    /* ================= D · Caldas ================= */
    const cal = H.h('div', { class: 'card' });
    const bog = T5.byId('21205791');
    cal.innerHTML = `<h3>Los pisos térmicos del trópico americano (Caldas)</h3>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th>Piso</th><th>Altitud</th><th>Temperatura media anual</th><th>Ejemplo</th></tr></thead><tbody>
      ${CALDAS.map(([t, n, z], i) => `<tr><td><b>${n}</b></td><td>${z}</td><td>${i === 0 ? 'T ≥ 24 °C' : i === 4 ? 'T < 7 °C' : `${H.f(CALDAS[i - 1][0], 1)} °C > T ≥ ${H.f(t, 1)} °C`}</td><td>${n === 'Frío' && bog ? `Bogotá (2.547 m): ${T5.fT(bog.ta[12])}` : n === 'Cálido' ? 'Llanos y costas: Manaos, 27,4 °C' : ''}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="small">El manual añade los pisos «macrotérmico» (0-1 km), «mesotérmico» (1-3 km), «microtérmico» (3-4,7 km) y «gélido» (más de 4,7 km), con temperaturas por debajo de 0 °C en este último.</p>`;
    el.append(cal);

    el.append(H.fix('apartados 1.2.2 y 2.2.2', [
      'Pisos térmicos (p. 14): el piso gélido tiene temperaturas «menores de 0 °C», no «de −0 °C».',
      'Tabla de Caldas: el piso frío es 17,5 °C > T ≥ 12 °C (falta el signo).',
      'Köppen no distingue climas de montaña «G» ni de alta montaña «H»: Navacerrada (Csb), Izaña (Csb) o Bogotá (Cfb) reciben tipos ordinarios según sus temperaturas y precipitaciones. La «H» solo aparece en la leyenda del mapa de Geiger y Pohl.']));
    el.append(H.selfCheck([
      { q: 'Por término medio, la temperatura baja con la altura unos…', opts: ['0,1 °C cada 100 m', '0,65 °C cada 100 m', '1 °C cada 10 m', '6,5 °C cada 100 m'], a: 1, ex: 'Es el gradiente medio de la troposfera; en las estaciones reales varía con la estación y las inversiones.' },
      { q: 'En una montaña ecuatorial, a 3.000 m…', opts: ['Hay inviernos muy fríos', 'La temperatura apenas cambia a lo largo del año, pero es mucho más baja que en el llano', 'Llueve menos que en el desierto', 'La solana recibe el triple que la umbría'], a: 1, ex: 'La montaña conserva los rasgos de su zona: amplitud anual mínima.' },
      { q: 'Entre Navacerrada y Madrid el gradiente térmico es mayor…', opts: ['En invierno', 'En primavera y verano', 'Igual todo el año', 'Solo en otoño'], a: 1, ex: 'En invierno las inversiones en la meseta reducen la diferencia.' },
      { q: 'A 65° de latitud, en invierno, la ladera orientada al polo…', opts: ['Recibe lo mismo que la solana', 'Apenas recibe sol directo durante semanas o meses', 'Recibe más que en verano', 'Recibe el doble que el llano'], a: 1, ex: 'Con el Sol tan bajo, la ladera de umbría queda en sombra todo el día.' },
      { q: 'Por encima del mar de nubes de Tenerife (Izaña) llueve…', opts: ['Mucho más que abajo', 'Menos que en Tenerife Norte, porque la estación queda sobre la inversión del alisio', 'Igual', 'Solo nieve'], a: 1, ex: 'La precipitación no siempre aumenta con la altura: depende de dónde se condensa la humedad.' },
    ]));
  },
});
