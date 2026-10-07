/* ===================== P · DISTRIBUCIÓN MUNDIAL DE LA PRECIPITACIÓN ===================== */
H.tab({
  id: 'precipitacion', nav: 'Distribución mundial', title: 'Distribución de las precipitaciones',
  init(el) {
    el.append(H.intro('La precipitación · apartado 3.4.1', 'Dónde llueve y por qué',
      'Las isoyetas unen puntos con la misma precipitación media. Su reparto no es azaroso: llueve mucho donde se combinan un océano cálido cercano, aire inestable o convergente, el paso de perturbaciones y montañas que obligan al aire a subir; y poco bajo los anticiclones subtropicales, lejos del mar, a sotavento de las montañas, junto a corrientes frías o donde el aire es tan frío que apenas lleva vapor.',
      'Manual: 3.1 y 3.4.1<br>Figs. 3.15 y 3.22; ejercicio 2'));

    /* ---------- datos en rejilla ---------- */
    let G = null;
    if (typeof CLIMA !== 'undefined' && CLIMA && CLIMA.r) {
      const mon = CLIMA.r.map((b) => T3.dec(b, 0.1));
      const ann = new Float32Array(mon[0].length); for (const m of mon) for (let k = 0; k < ann.length; k++) ann[k] += m[k];
      const mk = (d) => T3.grid(d, CLIMA.nx, CLIMA.ny, CLIMA.lon0, CLIMA.lat0, CLIMA.res, true);
      G = { mon: mon.map(mk), ann: mk(ann) };
      // media global ponderada por el área
      let a = 0, wsum = 0; for (let j = 0; j < CLIMA.ny; j++) { const w = Math.cos(G.ann.latAt(j) * H.D2R); for (let i = 0; i < CLIMA.nx; i++) { a += ann[j * CLIMA.nx + i] * w; wsum += w; } }
      G.mean = a / wsum;
    }
    const HOT = [
      [-3, -60, 'Amazonia', ['oceano', 'convergencia'], 'La convergencia intertropical y los alisios cargados de humedad del Atlántico mantienen el aire inestable casi todo el año; la selva devuelve a la atmósfera buena parte del agua.'],
      [0, 21, 'Cuenca del Congo', ['convergencia'], 'Bajas presiones ecuatoriales: convección diaria de tarde. Dos máximos anuales al paso de la convergencia intertropical.'],
      [0, 115, 'Indonesia', ['oceano', 'convergencia', 'orografia'], 'El «continente marítimo»: los mares más cálidos del planeta, convergencia y montañas en cada isla.'],
      [4.2, 9.2, 'Monte Camerún', ['oceano', 'orografia'], 'El monzón del golfo de Guinea choca con un volcán de 4.000 m: más de 10.000 mm al año en su ladera de barlovento.'],
      [25.3, 91.7, 'Cherrapunji (India)', ['oceano', 'orografia'], 'El monzón de verano asciende los montes Khasi: 11.176 mm al año en la estación de Cherrapunji (normales 1991–2020).'],
      [-46, -74, 'Sur de Chile', ['perturbaciones', 'orografia'], 'Los vientos del oeste y sus frentes chocan con los Andes, perpendiculares al flujo: más de 3.000 mm en barlovento.'],
      [55, -131, 'Columbia Británica', ['perturbaciones', 'orografia'], 'Frentes del Pacífico frente a las montañas costeras.'],
      [61, 6, 'Noruega occidental', ['perturbaciones', 'orografia'], 'Bergen recibe 2.500 mm: el flujo del oeste remonta los Alpes escandinavos.'],
      [43, -6, 'Cantábrico y Galicia', ['perturbaciones', 'orografia'], 'Las borrascas atlánticas y la cordillera dan 1.150–1.700 mm (Bilbao, Hondarribia, Vigo, Santiago).'],
      [23, 10, 'Sahara', ['anticiclon', 'lejania'], 'Subsidencia del anticiclón subtropical: el aire desciende, se calienta y se seca. Menos de 25 mm en buena parte del desierto.'],
      [-23, -70, 'Atacama', ['anticiclon', 'fria', 'sombra'], 'Anticiclón del Pacífico, corriente fría de Humboldt y sombra de los Andes: Iquique recibe menos de 1 mm al año.'],
      [-23, 15, 'Namib', ['anticiclon', 'fria'], 'La corriente fría de Benguela enfría el aire marino desde abajo y lo estabiliza: nieblas pero casi ninguna lluvia.'],
      [29, -114, 'Desierto de Sonora y Baja California', ['anticiclon', 'fria'], 'Anticiclón del Pacífico norte y corriente fría de California.'],
      [40, 86, 'Taklamakán y Gobi', ['lejania', 'sombra'], 'A miles de kilómetros del mar y rodeados de montañas que cortan el paso al aire húmedo.'],
      [40, -116, 'Gran Cuenca (EE. UU.)', ['sombra'], 'A sotavento de Sierra Nevada y las Cascadas.'],
      [36.9, -2.4, 'Sureste peninsular', ['sombra', 'anticiclon'], 'Almería recibe 198 mm: a sotavento de los frentes atlánticos y bajo la influencia subtropical.'],
      [-80, 40, 'Antártida', ['frio', 'anticiclon'], 'Desierto frío: el aire muy frío apenas contiene vapor y domina el anticiclón polar. Menos de 50 mm en el interior.'],
    ];
    const FT = { oceano: ['Océano cálido cercano', 1], convergencia: ['Inestabilidad y convergencia', 1], perturbaciones: ['Paso de perturbaciones', 1], orografia: ['Montañas en barlovento', 1], anticiclon: ['Anticiclón subtropical (subsidencia)', 0], lejania: ['Lejanía del mar', 0], sombra: ['Sombra pluviométrica (sotavento)', 0], fria: ['Corriente marina fría', 0], frio: ['Aire muy frío', 0] };

    /* ================= A · mapa de isoyetas ================= */
    const s = { m: -1, lines: true, hot: true, st: false, pick: null, sel: null };
    const cv = H.h('canvas'), tip = H.h('div', { class: 'tooltip' });
    let raster = null, rk = '';
    const val = (lat, lon) => (s.m < 0 ? G.ann.at(lat, lon) : G.mon[s.m].at(lat, lon));
    const cs = H.autoCanvas(cv, (w) => w * 0.5, (ctx, w, h) => {
      const P = T3.proj([-180, 180, -90, 90], w, h); cs.P = P;
      const key = [s.m, Math.round(w), !!G].join('|');
      if (key !== rk) { raster = G ? T3.landRaster(P, w, h, (lat, lon) => { const v = val(lat, lon) * (s.m < 0 ? 1 : 12); return T3.rColor(v).map((q) => q * (1 - 0.08 * H.land(lat, lon))); }) : T3.landRaster(P, w, h, (lat, lon) => H.mix([226, 236, 242], [243, 236, 217], H.land(lat, lon))); rk = key; }
      ctx.imageSmoothingEnabled = true; ctx.drawImage(raster, 0, 0, w, h);
      T3.drawCoast(ctx, P);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(28,40,54,.3)'; for (const la of [0, 23.44, -23.44, 66.56, -66.56]) { ctx.beginPath(); ctx.moveTo(0, P.Y(la)); ctx.lineTo(w, P.Y(la)); ctx.stroke(); } ctx.setLineDash([]);
      if (G && s.lines) { const g = T3.refine(s.m < 0 ? G.ann : G.mon[s.m], 2); T3.contour(ctx, g, s.m < 0 ? [250, 500, 1000, 2000, 4000] : [25, 50, 100, 200, 400], P, { color: 'rgba(28,40,54,.7)', width: 1, fmt: (L) => H.f(L) }); }
      if (s.st || !G) for (const st of T3.ST) { if (!st.pr) continue; const v = s.m < 0 ? st.pr[12] : st.pr[s.m] * 12; ctx.fillStyle = T3.css(T3.rColor(v)); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(P.X(st.lon), P.Y(st.lat), st.es ? 2.5 : 4, 0, 7); ctx.fill(); ctx.stroke(); }
      if (s.hot) HOT.forEach((hh, i) => { const x = P.X(hh[1]), y = P.Y(hh[0]), wet = FT[hh[3][0]][1]; ctx.fillStyle = s.sel === i ? '#1c2836' : wet ? '#1f6f8b' : '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, x, y + 0.5); });
      if (s.pick) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.X(s.pick[1]), P.Y(s.pick[0]), 6, 0, 7); ctx.stroke(); }
    });
    const ro = { pos: H.ro('Posición'), v: H.ro('Precipitación (ERA5)', 'bl'), st: H.ro('Estación más próxima') };
    const hotBox = H.h('div', { class: 'info', style: { display: 'none' } });
    const showHot = (i) => {
      s.sel = i; const [la, lo, n, fs, tx] = HOT[i];
      hotBox.style.display = ''; hotBox.innerHTML = `<b>${i + 1}. ${n}</b><br>${tx}<div style="margin-top:6px">${fs.map((k) => `<span class="badge ${FT[k][1] ? 'c' : 'q'}">${FT[k][1] ? '＋' : '−'} ${FT[k][0]}</span>`).join(' ')}</div>`;
      pick(la, lo);
    };
    const pick = (lat, lon) => {
      s.pick = [lat, lon];
      ro.pos.v.innerHTML = `${H.dm(Math.abs(lat))} ${lat >= 0 ? 'N' : 'S'}, ${H.dm(Math.abs(lon))} ${lon >= 0 ? 'E' : 'O'}`;
      ro.v.v.innerHTML = G ? `${H.f(val(lat, lon))} <small>mm ${s.m < 0 ? 'al año' : 'en ' + H.MESES[s.m]}</small>` : '—';
      const n = T3.nearestPr(lat, lon, false); ro.st.v.innerHTML = n.d < 700 ? `${T3.stLabel(n.s)}: ${H.f(s.m < 0 ? n.s.pr[12] : n.s.pr[s.m])} <small>mm (${H.f(n.d)} km)</small>` : '<small>ninguna a menos de 700 km</small>';
      cs.redraw();
    };
    cv.addEventListener('click', (e) => {
      const [x, y] = cs.pos(e), P = cs.P;
      if (s.hot) { const i = HOT.findIndex((hh) => Math.hypot(P.X(hh[1]) - x, P.Y(hh[0]) - y) < 10); if (i >= 0) { showHot(i); return; } }
      const [lat, lon] = P.inv(x, y); s.sel = null; hotBox.style.display = 'none'; pick(lat, lon);
    });
    cv.addEventListener('mousemove', (e) => { if (!G) return; const [x, y] = cs.pos(e), [lat, lon] = cs.P.inv(x, y); tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${H.f(Math.abs(lat))}° ${lat >= 0 ? 'N' : 'S'} · ${H.f(Math.abs(lon))}° ${lon >= 0 ? 'E' : 'O'} · ${H.f(val(lat, lon))} mm`; });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    cv.style.cursor = 'crosshair';
    const legend = H.h('div');
    const updLeg = () => { legend.innerHTML = ''; legend.append(T3.legend(T3.rColor, 0, 4000, [0, 500, 1000, 2000, 3000, 4000], (v) => H.f(s.m < 0 ? v : v / 12), 420), H.h('div', { class: 'small', style: { color: 'var(--muted)' } }, s.m < 0 ? 'mm al año' : 'mm al mes')); };
    const mS = H.slider('Periodo', -1, 11, 1, s.m, (v) => (v < 0 ? 'año completo' : H.MESES[v]), (v) => { s.m = v; updLeg(); cs.redraw(); if (s.pick) pick(...s.pick); drawZ(); });
    const chk = (k, l) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, l); };
    const mapCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Mapa mundial de isoyetas'));
    if (!G) mapCard.append(H.info('<b>Capa en rejilla pendiente.</b> El mapa continuo de precipitación (reanálisis ERA5, 1991–2020) se añadirá en cuanto se exporte desde Google Earth Engine. Mientras tanto, los puntos muestran la precipitación media de las estaciones.'));
    mapCard.append(H.h('p', { class: 'sub' }, 'Pulsa los círculos numerados (azules: lugares muy lluviosos; naranjas: muy secos) para ver qué factores explican su precipitación, o cualquier punto del mapa para leer su valor.'),
      H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cv, tip), legend, hotBox,
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, mS, H.h('div', {}, G ? chk('lines', 'Isoyetas') : '', chk('hot', 'Lugares destacados'), G ? chk('st', 'Estaciones') : '')),
        H.h('div', { class: 'readouts' }, ro.pos, ro.v, ro.st)),
      H.html('<p class="small">Datos: reanálisis ERA5 (Copernicus/ECMWF), precipitación media 1991–2020 (julio–diciembre, 1991–2019), en celdas de 2°. Las estaciones son normales OMM 1991–2020. El reanálisis suaviza los máximos locales de las montañas.</p>'));
    el.append(mapCard);
    updLeg();

    /* ================= B · perfil por latitudes ================= */
    const zc = H.chart(H.h('canvas'), 0.38);
    const drawZ = () => {
      if (!G) return;
      const g = s.m < 0 ? G.ann : G.mon[s.m], f = s.m < 0 ? 1 : 12, all = [], land = [], sea = [];
      for (let j = 0; j < g.ny; j++) { let a = 0, n = 0, l = 0, nl = 0, o = 0, no = 0; const lat = g.latAt(j); for (let i = 0; i < g.nx; i++) { const v = g.get(i, j) * f, lo = g.lonAt(i), ld = H.land(lat, lo) > 0.5; a += v; n++; if (ld) { l += v; nl++; } else { o += v; no++; } } all.push([lat, a / n]); land.push([lat, nl >= 8 ? l / nl : null]); sea.push([lat, no >= 8 ? o / no : null]); /* al menos 16° de longitud de tierra (o mar) en el paralelo */ }
      const mx = Math.max(...all.map((p) => p[1]), ...sea.filter((p) => p[1] != null).map((p) => p[1]));
      zc.draw({ xMin: -90, xMax: 90, yMin: 0, yMax: Math.ceil(mx / 500) * 500, xTicks: [-90, -60, -30, 0, 30, 60, 90].map((v) => ({ v, label: v === 0 ? '0°' : Math.abs(v) + '°' + (v < 0 ? 'S' : 'N') })), yTicks: [0, 500, 1000, 1500, 2000, 2500, 3000].filter((v) => v <= mx + 500).map((v) => ({ v, label: H.f(v) })), yLabel: s.m < 0 ? 'mm al año' : 'mm (anualizados)',
        hlines: [{ y: G.mean, color: '#1c2836', label: `media mundial ${H.f(G.mean)} mm` }],
        series: [{ pts: sea, color: '#1f6f8b', width: 2 }, { pts: land, color: '#b4531d', width: 2 }, { pts: all, color: '#1c2836', width: 3 }] });
    };
    if (G) {
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La precipitación por latitudes'),
        H.h('p', { class: 'sub' }, 'Media de cada paralelo: máximo en la convergencia intertropical, mínimos bajo los anticiclones subtropicales hacia 20–30°, máximos secundarios en las latitudes de los frentes (40–60°) y mínimo en los polos.'),
        H.h('div', { class: 'viz' }, zc.st.canvas),
        H.html('<div class="legend"><span><i style="background:#1c2836"></i>todo el paralelo</span><span><i style="background:#1f6f8b"></i>océanos</span><span><i style="background:#b4531d"></i>continentes</span></div>')));
      drawZ();
    }

    /* ================= C · ciclo hidrológico global ================= */
    const flows = [['Evaporación en los océanos', 413], ['Precipitación en los océanos', 373], ['Precipitación en los continentes', 113], ['Evapotranspiración en los continentes', 73], ['Vapor que los vientos llevan del mar a la tierra', 40], ['Escorrentía de los ríos al mar', 40]];
    const svg = `<svg viewBox="0 0 760 270" role="img" aria-label="Ciclo hidrológico global">
      <rect x="0" y="200" width="430" height="70" fill="#cfe0ea"/><rect x="430" y="185" width="330" height="85" fill="#e4d3a8"/>
      <text x="215" y="250" text-anchor="middle" font-size="15" fill="#1c2836">Océanos</text><text x="595" y="240" text-anchor="middle" font-size="15" fill="#1c2836">Continentes</text>
      <g font-size="12.5" fill="#1c2836" font-family="system-ui">
      <path d="M110 195 V 70" stroke="#b4531d" stroke-width="10" marker-end="url(#ah)"/><text x="122" y="120">evaporación 413</text>
      <path d="M300 60 V 190" stroke="#1f6f8b" stroke-width="9" marker-end="url(#ab)"/><text x="312" y="120">precipitación 373</text>
      <path d="M180 40 H 520" stroke="#8a96a3" stroke-width="4" marker-end="url(#ag)"/><text x="350" y="32" text-anchor="middle">transporte de vapor 40</text>
      <path d="M560 60 V 175" stroke="#1f6f8b" stroke-width="5" marker-end="url(#ab)"/><text x="572" y="130">precipitación 113</text>
      <path d="M700 180 V 90" stroke="#b4531d" stroke-width="4" marker-end="url(#ah)"/><text x="752" y="72" text-anchor="end">evapotranspiración 73</text>
      <path d="M470 228 H 440" stroke="#1f6f8b" stroke-width="4" marker-end="url(#ab)"/><text x="470" y="262">escorrentía 40</text></g>
      <defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#b4531d"/></marker><marker id="ab" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#1f6f8b"/></marker><marker id="ag" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#8a96a3"/></marker></defs></svg>`;
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El ciclo hidrológico en cifras'),
      H.h('p', { class: 'sub' }, 'Flujos anuales medios en miles de km³ (Trenberth y otros, 2007). Sobre los océanos se evapora más de lo que llueve; sobre los continentes, al revés. La diferencia vuelve al mar por los ríos.'),
      H.h('div', { class: 'viz wide-svg', style: { maxWidth: '760px', margin: '0 auto' }, html: svg }),
      H.html(`<p class="small">En total caen unos ${H.f(486)} mil km³ al año: repartidos sobre toda la Tierra (510 millones de km²) equivalen a unos ${H.f(486e3 / 510e6 * 1e6)} mm. Las estimaciones actuales basadas en observaciones van de unos 950 a 1.050 mm al año (2,6–2,9 mm diarios), es decir, unos <b>16 millones de toneladas de agua por segundo</b>.${G ? ` ERA5 da ${H.f(G.mean)} mm para 1991–2020, algo por encima: los reanálisis tienden a exagerar la lluvia sobre los océanos tropicales.` : ''}</p>`)));

    /* ================= D · ejercicio 2: corte de África occidental ================= */
    const TR = ['65344', '65330', '61099', '61052', '61043', '61024', '61017'].map((id) => T3.byId(id));
    const stat = (st) => { const ta = st.ta.slice(0, 12), hr = st.vp ? st.vp.slice(0, 12).reduce((a, e, i) => a + e / T3.esW(ta[i]) * 100, 0) / 12 : null; return { hr, amp: Math.max(...ta) - Math.min(...ta), dry: T3.dryMonths(st) }; };
    const MAN = [['5° 15′', 2144, 85, 3.8, 0], ['9° 30′', 1600, 68, 4, 3], ['12° 21′', 880, 49, 7.2, 5], ['14° 31′', 550, 44, 10.3, 8], ['16° 43′', 225, 36, 11.7, 9]];
    const rows = TR.map((st) => { const x = stat(st); return `<tr><td><b>${st.name}</b> <small>(${st.country})</small></td><td>${H.dm(st.lat)}</td><td class="num">${H.f(st.pr[12])}</td><td class="num">${H.f(x.hr)} %</td><td class="num">${H.f(x.amp, 1)}</td><td class="num">${x.dry}</td></tr>`; }).join('');
    const exCv = H.h('canvas'), exCl = T3.climo(exCv, (w) => Math.min(w * 0.55, 300));
    const exSel = H.h('div', { class: 'chipbar' });
    TR.forEach((st, i) => { const b = H.h('button', { class: 'chip' + (i === 0 ? ' sel' : ''), type: 'button' }, st.name); b.onclick = () => { H.$$('.chip', exSel).forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); exCl.draw(st, { title: st.name, sub: H.dm(st.lat) + ' N' }); }; exSel.append(b); });
    el.append(H.h('div', { class: 'card', style: { background: 'var(--soft)' } }, H.h('h4', {}, 'Ejercicio de autoevaluación 2 del manual, con datos reales'),
      H.h('p', {}, 'El manual da cinco estaciones de la franja intertropical sin nombre. Este es un corte real de sur a norte, del golfo de Guinea al Sahara (Benín y Níger, normales 1991–2020). La humedad relativa media se calcula con la tensión de vapor y la temperatura de cada mes.'),
      H.html(`<div style="overflow-x:auto"><table class="t"><thead><tr><th>Estación</th><th>Latitud</th><th>Precipitación anual (mm)</th><th>Humedad relativa media</th><th>Amplitud térmica anual (°C)</th><th>Meses secos (P &lt; 2T)</th></tr></thead><tbody>${rows}</tbody></table></div>
        <details class="open-q"><summary>Ver la tabla del manual</summary><div class="ans"><table class="t"><thead><tr><th>Latitud</th><th>mm</th><th>HR</th><th>Amplitud</th><th>Meses secos</th></tr></thead><tbody>${MAN.map((r) => `<tr>${r.map((v, i) => `<td>${i === 0 ? v : H.f(v, i === 3 ? 1 : 0) + (i === 2 ? ' %' : '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`),
      H.h('div', { class: 'grid2' }, H.h('div', {}, exSel, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, exCv)),
        H.h('div', {},
          H.openQ('¿Qué relación tiene la latitud con el volumen de precipitaciones? ¿Por qué disminuye?', 'La precipitación cae de unos 1.300 mm junto al golfo de Guinea a apenas 13 mm en Bilma. La franja de lluvias de la convergencia intertropical, que sigue al Sol con retraso, solo llega a las latitudes más altas unas pocas semanas al año (julio–septiembre) y con menos fuerza; el resto del año dominan el harmatán seco del noreste y la subsidencia del anticiclón subtropical.'),
          H.openQ('¿Por qué aumenta la amplitud térmica anual con la latitud?', 'Porque crece la diferencia de insolación entre el verano y el invierno y disminuyen la nubosidad y la humedad, que amortiguan los cambios. Cerca del golfo de Guinea la amplitud es de unos 3 °C; en el Sahara supera los 15 °C.'),
          H.openQ('¿Por qué aumenta el número de meses secos con la latitud?', 'La estación lluviosa dura lo que la convergencia intertropical permanece sobre el lugar: casi todo el año junto al ecuador (con dos máximos), unos pocos meses en el Sahel y prácticamente nada en el desierto. Cotonú tiene algún mes seco porque esa costa, el «corredor de Dahomey», es anómalamente seca para su latitud.')))));
    exCl.draw(TR[0], { title: TR[0].name, sub: H.dm(TR[0].lat) + ' N' });

    el.append(H.fix('Distribución de la precipitación', [
      'Precipitación media mundial: no 900 mm sino unos <b>950–1.050 mm</b> al año según la fuente (≈ 2,7 mm/día), unos 16 millones de toneladas de agua por segundo en lugar de 14.',
      'El ejercicio 4 del manual habla de los mapas de «enero y junio», pero los mapas del tema (figs. 3.8 y 3.9) son de enero y <b>julio</b>.',
      'Monzón: la explicación térmica (calentamiento de Asia en verano) no se ha desechado, sino completado. El contraste tierra–mar, la meseta del Tíbet como barrera y foco de calor en altura y el desplazamiento de la convergencia intertropical y de la corriente en chorro actúan juntos.',
    ]));
    el.append(H.selfCheck([
      { q: 'Una isoyeta une puntos de igual…', opts: ['Presión', 'Temperatura', 'Precipitación', 'Humedad relativa'], a: 2, ex: 'Isobaras (presión), isotermas (temperatura) e isoyetas (precipitación).' },
      { q: 'Los grandes desiertos cálidos se sitúan hacia los 20–30° de latitud por…', opts: ['La lejanía del ecuador', 'La subsidencia de los anticiclones subtropicales', 'Los vientos del oeste', 'La convergencia intertropical'], a: 1, ex: 'El aire que desciende se calienta por compresión y su humedad relativa baja.' },
      { q: 'El desierto de Atacama y el Namib deben su extrema aridez, sobre todo, a…', opts: ['Las corrientes marinas frías y el anticiclón subtropical', 'La altitud', 'La lejanía del mar', 'Los vientos del oeste'], a: 0, ex: 'Humboldt y Benguela enfrían el aire desde abajo y lo estabilizan; además, están bajo los anticiclones del Pacífico y del Atlántico sur.' },
      { q: 'En latitudes medias, las fachadas más lluviosas de los continentes son…', opts: ['Las orientales', 'Las occidentales, sobre todo con montañas perpendiculares al viento', 'Las del interior', 'Las meridionales'], a: 1, ex: 'Los vientos del oeste traen las perturbaciones atlánticas y pacíficas: sur de Chile, Columbia Británica, Noruega.' },
      { q: 'Sobre los océanos, en el balance anual…', opts: ['La precipitación supera a la evaporación', 'La evaporación supera a la precipitación', 'Son iguales', 'No hay evaporación'], a: 1, ex: 'El exceso de vapor viaja a los continentes y vuelve al mar por los ríos.' },
    ]));
  },
});
