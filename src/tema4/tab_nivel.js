/* ===================== MOVIMIENTOS · EL NIVEL DEL MAR ===================== */
H.tab({
  id: 'nivel', nav: 'Nivel del mar', title: 'Movimientos eustáticos y tectónicos: el nivel del mar',
  init(el) {
    el.append(H.intro('Movimientos eustáticos y tectónicos · apartado 2.3', 'El nivel del mar sube y baja: de la última glaciación al siglo XXI',
      'El nivel medio del mar cambia en todo el planeta cuando varía el volumen de agua del océano (sobre todo por el hielo que se acumula o se funde en los continentes y por la dilatación del agua al calentarse): son los movimientos eustáticos. En cada costa se suman los movimientos verticales del terreno: el rebote de las regiones que estuvieron bajo el hielo, la subsidencia de los deltas o los movimientos tectónicos. Hace 21.000 años el mar estaba unos 130 m más bajo que hoy; desde 1900 ha subido unos 20 cm y ahora sube unos 4 mm al año.',
      'Manual: 2.3'));
    const RL = typeof RELIEVE !== 'undefined' && RELIEVE ? RELIEVE : null, NV = typeof NIVEL !== 'undefined' && NIVEL ? NIVEL : null, D2R = H.D2R;

    /* ================= A · simulador del nivel del mar ================= */
    if (RL && RL.mundo) {
      const REG = { mundo: RL.mundo, iberia: RL.iberia, canarias: RL.canarias };
      const G = {}; for (const k in REG) if (REG[k]) G[k] = T4.grid(REG[k].z, REG[k]);
      const BBR = { mundo: [-180, 180, -70, 80], iberia: [-10, 4.5, 35.5, 44], canarias: [-18.3, -13.3, 27.5, 29.5] };
      const sA = { sl: 0, r: 'mundo' };
      const cv = H.h('canvas');
      const colAt = (lat, lon) => {
        const g = G[sA.r]; const z = g.at(lat, lon); if (!(z === z)) return [200, 200, 200];
        const sl = sA.sl;
        if (z < sl) { // mar
          if (z >= 0) return [120, 170, 220]; // tierra actual inundada
          return T4.depthColor(z - sl);
        }
        if (z < 0) return [214, 186, 120]; // fondo actual emergido
        return T4.elevColor(z - Math.max(sl, 0));
      };
      const map = T4.map(cv, { bbox: BBR[sA.r], regional: sA.r !== 'mundo', grid: sA.r === 'mundo' ? 30 : sA.r === 'iberia' ? 2 : 1, coast: true, key: () => sA.r + sA.sl,
        aspect: (w) => Math.min(w * T3.aspect(BBR[sA.r], sA.r !== 'mundo'), 560), land: colAt, color: colAt });
      // en los mapas regionales la máscara de tierras de 0,25° es demasiado gruesa: se pinta todo con el relieve
      map.opts.land = colAt;
      T4.hover(cv, map, (lat, lon) => { const z = G[sA.r].at(lat, lon); return z === z ? `${T4.ll(lat, lon, 2)}<br>${z >= 0 ? 'altitud' : 'profundidad'}: <b>${H.f(Math.abs(z))} m</b>` : null; });
      const ro = { a: H.ro('Tierras emergidas respecto a hoy', 'hl'), b: H.ro('Nivel elegido'), m: H.ro('Tu municipio', 'bl') };
      const area = () => {
        const g = G[sA.r], sl = sA.sl; let up = 0, now = 0;
        for (let j = 0; j < g.ny; j++) { const la = g.latAt(j); if (sA.r === 'mundo' && la < -60) continue; const c = Math.cos(la * D2R) * (111.32 * g.res) ** 2; for (let i = 0; i < g.nx; i++) { const z = g.data[j * g.nx + i]; if (!(z === z)) continue; if (z >= 0) now += c; if (z >= sl) up += c; } }
        return { up, now };
      };
      const upd = () => {
        const { up, now } = area(), d = up - now;
        ro.a.v.innerHTML = `${H.fs(d / now * 100, 1)} <small>% (${H.fs(d / (sA.r === 'mundo' ? 1e6 : 1), sA.r === 'mundo' ? 1 : 0)} ${sA.r === 'mundo' ? 'millones de km²' : 'km²'})</small>`;
        ro.b.v.innerHTML = `${H.fs(sA.sl)} <small>m respecto al actual</small>`;
        const alt = T3.placeAlt();
        ro.m.v.innerHTML = alt == null ? '—' : alt <= sA.sl ? `<b>bajo el mar</b> <small>(${H.placeLabel()}, ${H.f(alt)} m)</small>` : `${H.f(alt - sA.sl)} <small>m sobre ese nivel (${H.placeLabel()})</small>`;
        map.invalidate();
      };
      H.onPlace(upd);
      const sl = H.slider('Nivel del mar', -140, 70, 1, 0, (v) => H.fs(v) + ' m', (v) => { sA.sl = v; upd(); });
      const segR = H.seg([['mundo', 'Mundo'], ['iberia', 'Península y Baleares'], ['canarias', 'Canarias']].filter(([k]) => G[k]), 'mundo', (v) => { sA.r = v; map.opts.regional = v !== 'mundo'; map.opts.grid = v === 'mundo' ? 30 : v === 'iberia' ? 2 : 1; map.setBBox(BBR[v]); upd(); });
      const pre = H.h('div', { class: 'chipbar' });
      [['Máximo glacial (hace 21.000 años)', -130], ['Hace 10.000 años', -40], ['Hoy', 0], ['Escenario alto en 2100', 1], ['Si se fundiera Groenlandia', 7], ['Si se fundiera la Antártida', 58], ['Todo el hielo', 66]].forEach(([n, v]) => { const b = H.h('button', { class: 'chip', type: 'button' }, `${n} (${H.fs(v)} m)`); b.onclick = () => { sA.sl = v; sl.set(v); upd(); }; pre.append(b); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Simulador: sube o baja el nivel del mar'),
        H.h('p', { class: 'sub' }, 'Con el nivel 130 m más bajo de la última glaciación, el mar del Norte era tierra firme (Doggerland), Asia y América estaban unidas por Beringia, Australia y Nueva Guinea formaban un solo continente (Sahul) y el Sudeste asiático, otro (Sunda); la plataforma de la Península se extendía decenas de kilómetros mar adentro. En sentido contrario, cada metro de subida inunda deltas, marismas y llanuras costeras.'),
        segR, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cv),
        H.html('<div class="row small" style="gap:14px;justify-content:flex-start;margin-top:4px"><span style="flex:none"><span style="display:inline-block;width:11px;height:11px;background:#78aadc;margin-right:4px"></span>tierra actual inundada</span><span style="flex:none"><span style="display:inline-block;width:11px;height:11px;background:#d6ba78;margin-right:4px"></span>fondo actual emergido</span><span style="flex:none">línea: costa actual</span></div>'),
        H.h('div', { class: 'grid2', style: { marginTop: '8px' } }, H.h('div', {}, sl, pre), H.h('div', { class: 'readouts' }, ro.a, ro.b, ro.m)),
        H.h('p', { class: 'small' }, `Relieve: ${RL.src}; ${G.iberia ? 'celdas de 0,5° en el mundo y de 0,025° (unos 2,5 km) en la Península y Canarias' : 'celdas de 0,5°'}. El simulador no tiene en cuenta los diques (los pólderes de los Países Bajos, por debajo del nivel del mar, aparecen inundados), ni la erosión, ni los movimientos del terreno.`)));
      upd();
    } else el.append(H.info('<b>Pendiente de datos.</b> El simulador del nivel del mar usará el relieve ETOPO1 (<code>gee/tema4_relieve_ciclones.js</code>) en cuanto esté procesado.'));

    /* ================= B · curvas del nivel del mar ================= */
    const cvB = H.h('canvas'); const chB = H.chart(cvB, 0.45);
    const sB = { v: 'inst', g: 0 };
    const info = H.h('div', {});
    const gSel = H.h('select', { 'aria-label': 'Mareógrafo' });
    if (NV && NV.gauges) NV.gauges.forEach((g, i) => gSel.append(H.h('option', { value: i }, `${g.name} (desde ${g.y0})`)));
    gSel.onchange = () => { sB.g = +gSel.value; updB(); };
    const fit = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; } return sxy / sxx; };
    // ajuste por mínimos cuadrados de y = a + b (x − x0) + c (x − x0)² → [a, b, c] (x0 = media de x)
    const fit2 = (xs, ys) => {
      const n = xs.length, x0 = xs.reduce((a, b) => a + b, 0) / n; const S = Array(5).fill(0), T = [0, 0, 0];
      for (let i = 0; i < n; i++) { const d = xs[i] - x0; let pw = 1; for (let k = 0; k < 5; k++) { S[k] += pw; if (k < 3) T[k] += pw * ys[i]; pw *= d; } }
      const M = [[S[0], S[1], S[2], T[0]], [S[1], S[2], S[3], T[1]], [S[2], S[3], S[4], T[2]]];
      for (let c = 0; c < 3; c++) { for (let r = c + 1; r < 3; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; } }
      const z = [0, 0, 0]; for (let r = 2; r >= 0; r--) { let s = M[r][3]; for (let k = r + 1; k < 3; k++) s -= M[r][k] * z[k]; z[r] = s / M[r][r]; }
      z.x0 = x0; return z;
    };
    // explicación de la tendencia de cada mareógrafo: nota propia (movimientos del terreno conocidos) o lectura según la serie
    const gNote = (g) => {
      if (g.note) return g.note;
      if (g.y0 >= 1985) return `Serie corta (desde ${g.y0}): recoge la subida acelerada de las últimas décadas, más rápida que la media del siglo XX (unos 1,5 mm/año), y la variabilidad de unos años a otros, por eso no se puede comparar con las series largas.`;
      if (g.lon > -6 && g.lon < 36 && g.lat > 30 && g.lat < 46 && g.tr < 1.2) return 'Menos que la media: en el Mediterráneo el nivel apenas subió entre 1960 y 1990, por el aumento de la presión atmosférica y de la salinidad del agua (más densa), y después ha subido al ritmo global.';
      if (g.tr > 3) return 'Algo más que la media global del mismo periodo: puede influir un ligero hundimiento del terreno o del muelle donde está el mareógrafo.';
      return 'Parecido a la media global del mismo periodo: el terreno es bastante estable.';
    };
    const updB = () => {
      gSel.style.display = sB.v === 'gauge' ? '' : 'none';
      if (sB.v === 'inst') {
        const series = [], txt = [];
        if (NV && NV.csiro) { const c = NV.csiro, base = c.v[c.y.indexOf(1993)] ?? 0; series.push({ pts: c.y.map((y, i) => [y + 0.5, (c.v[i] - base) / 10]), color: '#1f6f8b', width: 2 }); }
        let alt = null;
        if (NV && NV.star) { const s = NV.star, b = s.v.slice(0, 6).reduce((a, x) => a + x, 0) / 6; alt = { pts: s.t.map((t, i) => [t, (s.v[i] - b) / 10]) }; } // referencia: primer año (1993)
        else if (NV && NV.noaa) { const s = NV.noaa, b = s.v[0]; alt = { pts: s.y.map((y, i) => [y + 0.5, (s.v[i] - b) / 10]) }; }
        if (alt) series.push({ pts: alt.pts, color: '#b4531d', width: 2 });
        const tmax = alt ? alt.pts[alt.pts.length - 1][0] : 2014;
        chB.draw({ xMin: 1880, xMax: Math.ceil(tmax / 10) * 10, yMin: -22, yMax: 14, xLabel: 'Año', yLabel: 'cm respecto a 1993', xTicks: [1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((v) => ({ v })), yTicks: [-20, -15, -10, -5, 0, 5, 10].map((v) => ({ v })), series,
          after: (ctx, X, Y, w) => { ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#1f6f8b'; ctx.fillText('reconstrucción con mareógrafos (CSIRO)', X(1885), Y(11)); ctx.fillStyle = '#b4531d'; ctx.fillText('altimetría por satélite (NOAA)', X(1885), Y(8)); void w; } });
        if (alt) {
          const p = alt.pts, xs = p.map((q) => q[0]), ys = p.map((q) => q[1] * 10); const r = fit(xs, ys); const r2 = fit(xs.filter((x) => x >= xs[xs.length - 1] - 10), ys.filter((_, i) => xs[i] >= xs[xs.length - 1] - 10));
          const q = fit2(xs, ys), tl = xs[xs.length - 1], rNow = q[1] + 2 * q[2] * (tl - q.x0);
          txt.push(`Altimetría (${Math.round(xs[0])}-${Math.floor(tl)}): subida media de <b>${H.f(r, 1)} mm/año</b> y de <b>${H.f(r2, 1)} mm/año</b> en los últimos diez años. Si se ajusta una parábola, la aceleración es de ${H.f(2 * q[2], 3)} mm/año² y el ritmo al final de la serie, de unos <b>${H.f(rNow, 1)} mm/año</b>: la subida se acelera.`);
        }
        if (NV && NV.csiro) { const c = NV.csiro; const i1 = c.y.indexOf(1900), i2 = c.y.indexOf(1990); txt.push(`Mareógrafos (CSIRO): ${H.f((c.v[c.v.length - 1] - c.v[0]) / 10)} cm entre ${c.y[0]} y ${c.y[c.y.length - 1]}; ${H.f(fit(c.y.slice(i1, i2), c.v.slice(i1, i2)), 1)} mm/año entre 1900 y 1990.`); }
        info.innerHTML = `<p class="small">${txt.join(' ')} Según el IPCC (2021), el nivel medio subió 20 cm entre 1901 y 2018, a 1,3 mm/año hasta 1971 y a 3,7 mm/año entre 2006 y 2018. Un 40 % se debe a la dilatación térmica del agua y el resto a la fusión de glaciares y de los mantos de hielo de Groenlandia y la Antártida. Fuentes: ${[NV && NV.csiro && NV.csiro.src, NV && (NV.star ? NV.star.src : NV.noaa && NV.noaa.src)].filter(Boolean).join('; ')}.</p>`;
      } else if (sB.v === 'paleo') {
        if (NV && NV.paleo) {
          const p = NV.paleo, pts = p.ka.map((k, i) => [-k, p.v[i]]);
          chB.draw({ xMin: -800, xMax: 0, yMin: -140, yMax: 20, xLabel: 'Miles de años antes del presente', yLabel: 'Nivel del mar (m)', xTicks: [-800, -700, -600, -500, -400, -300, -200, -100, 0].map((v) => ({ v, label: H.f(Math.abs(v)) })), yTicks: [-120, -80, -40, 0].map((v) => ({ v })), series: [{ pts, color: '#1f6f8b', width: 1.6 }], hlines: [{ y: 0, color: '#888' }] });
          info.innerHTML = `<p class="small">Ocho ciclos glaciales en 800.000 años: el nivel del mar bajó repetidamente 100-130 m en las glaciaciones, que duraban unos 100.000 años, y volvió a niveles parecidos al actual en los cortos interglaciales. Es una reconstrucción indirecta, a partir de los isótopos de oxígeno de los sedimentos marinos, con una incertidumbre de unos ±10 m: por eso el valor más reciente no coincide con 0 y los máximos de los interglaciales salen suavizados (en el último, hace unos 125.000 años, el mar estuvo entre 5 y 10 m más alto que hoy, según el IPCC). Fuente: ${p.src}.</p>`;
        } else {
          const K = [[-21, -134], [-14.5, null], [-6.7, -4], [-4.2, -1], [0, 0]];
          chB.draw({ xMin: -25, xMax: 0, yMin: -140, yMax: 10, xLabel: 'Miles de años antes del presente', yLabel: 'Nivel del mar (m)', xTicks: [-25, -20, -15, -10, -5, 0].map((v) => ({ v, label: H.f(Math.abs(v)) })), yTicks: [-140, -120, -100, -80, -60, -40, -20, 0].map((v) => ({ v })), series: [],
            markers: K.filter((k) => k[1] != null).map(([x, y]) => ({ x, y, label: `${H.f(y)} m`, align: x > -3 ? 'right' : 'left' })), vlines: [{ x: -14.5, color: '#b4531d', label: 'pulso de deshielo 1A' }, { x: -21, color: '#1f4f8b', label: 'máximo glacial' }] });
          info.innerHTML = '<p class="small">Según Lambeck y otros (2014), el nivel del mar llegó a su mínimo, unos 134 m por debajo del actual, hace unos 21.000 años. Durante el «pulso de agua de deshielo 1A», hace unos 14.500 años, subió unos 20 m en menos de 500 años (40 mm/año o más). Hace 6.700 años estaba a unos 4 m del actual y hace 4.200 años, a menos de 1 m; desde entonces y hasta hace unos 150 años apenas cambió (menos de 20 cm).</p>';
        }
      } else if (sB.v === 'gauge' && NV && NV.gauges && NV.gauges.length) {
        const g = NV.gauges[sB.g], pts = g.y.map((y, i) => [y, g.v[i] / 10]);
        const mn = Math.floor(Math.min(...pts.map((p) => p[1])) / 10) * 10, mx = Math.ceil(Math.max(...pts.map((p) => p[1])) / 10) * 10;
        const ref = NV.csiro ? NV.csiro.y.map((y, i) => [y + 0.5, (NV.csiro.v[i] - NV.csiro.v[NV.csiro.y.indexOf(2000)]) / 10]) : [];
        chB.draw({ xMin: Math.floor(g.y0 / 20) * 20, xMax: 2030, yMin: Math.min(mn, -30), yMax: Math.max(mx, 15), xLabel: 'Año', yLabel: 'cm respecto a 1991-2020', xTicks: Array.from({ length: 12 }, (_, i) => 1800 + i * 20).filter((v) => v >= Math.floor(g.y0 / 20) * 20).map((v) => ({ v })), yTicks: Array.from({ length: 20 }, (_, i) => -100 + i * 10).filter((v) => v >= Math.min(mn, -30) && v <= Math.max(mx, 15)).map((v) => ({ v })),
          series: [{ pts: ref, color: 'rgba(28,40,54,.35)', width: 1.5, dash: [4, 3] }, { pts, color: '#1f6f8b', width: 1.8 }] });
        info.innerHTML = `<p class="small"><b>${g.name}</b>: tendencia de <b>${H.fs(g.tr, 1)} mm/año</b> del nivel relativo del mar (mar respecto a la tierra). En gris, la media global (CSIRO). ${gNote(g)} Fuente: ${NV.gsrc}.</p>`;
      } else if (sB.v === 'proj') {
        const P = [['SSP1-1.9', 0.38, 0.28, 0.55], ['SSP1-2.6', 0.44, 0.32, 0.62], ['SSP2-4.5', 0.56, 0.44, 0.76], ['SSP3-7.0', 0.68, 0.55, 0.90], ['SSP5-8.5', 0.77, 0.63, 1.01]];
        chB.draw({ xMin: -0.5, xMax: 4.5, yMin: 0, yMax: 1.2, xLabel: 'Escenario de emisiones (de menos a más)', yLabel: 'Subida en 2100 (m)', pad: { b: 40 }, xTicks: P.map(([n], i) => ({ v: i, label: n })), yTicks: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2].map((v) => ({ v, label: H.f(v, 1) })), series: [],
          after: (ctx, X, Y) => { P.forEach(([n, m, a, b], i) => { ctx.fillStyle = ['#2d7a4c', '#5b8f3e', '#c08a1e', '#d0582a', '#a3261b'][i]; ctx.fillRect(X(i) - 18, Y(m), 36, Y(0) - Y(m)); ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(X(i), Y(a)); ctx.lineTo(X(i), Y(b)); ctx.moveTo(X(i) - 6, Y(a)); ctx.lineTo(X(i) + 6, Y(a)); ctx.moveTo(X(i) - 6, Y(b)); ctx.lineTo(X(i) + 6, Y(b)); ctx.stroke(); ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(H.f(m, 2) + ' m', X(i), Y(b) - 8); }); } });
        info.innerHTML = '<p class="small">Subida del nivel medio global en 2100 respecto a 1995-2014 según el IPCC (2021): valor central y rango probable. No se pueden descartar subidas de casi 2 m en 2100 y de hasta 15 m en 2300 si los mantos de hielo de la Antártida se desestabilizan. Aunque se detengan las emisiones, el mar seguirá subiendo durante siglos: en 2.000 años, 2-3 m si el calentamiento se limita a 1,5 °C y 19-22 m con 5 °C.</p>';
      }
    };
    const opts = [['inst', 'Desde 1880'], ['paleo', NV && NV.paleo ? '800.000 años' : 'Desde la última glaciación'], ['gauge', 'Mareógrafos'], ['proj', 'Proyecciones para 2100']].filter(([k]) => k !== 'gauge' || (NV && NV.gauges && NV.gauges.length)).filter(([k]) => k !== 'inst' || (NV && (NV.csiro || NV.star)));
    const segB = H.seg(opts, opts[0][0], (v) => { sB.v = v; updB(); }); sB.v = opts[0][0];
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Las medidas: del pasado geológico a los satélites'),
      segB, H.h('div', { class: 'row', style: { marginTop: '8px' } }, gSel), H.h('div', { class: 'viz', style: { marginTop: '8px' } }, cvB), info));
    updB();

    el.append(H.h('div', { class: 'grid2 even' },
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Movimientos del terreno: isostasia y subsidencia'),
        H.html('<p>El nivel del mar que mide un mareógrafo es relativo: cambia si sube el mar o si se mueve la tierra. Las regiones que soportaron grandes mantos de hielo, como Escandinavia o Canadá, se hundieron bajo su peso y siguen elevándose miles de años después de la fusión (rebote isostático), así que allí el mar «baja». Los deltas y las llanuras sobre sedimentos blandos se hunden por compactación y por la extracción de agua subterránea o de hidrocarburos: Venecia, Bangkok, Yakarta o la costa de Luisiana pierden varios milímetros, e incluso centímetros, al año. Los movimientos tectónicos propiamente dichos pueden ser bruscos, como en los grandes terremotos (Chile en 1960 o Japón en 2011 hundieron o levantaron la costa más de un metro), pero también lentos y continuos.</p>')),
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Las huellas de los antiguos niveles'),
        H.html('<p>Las playas y terrazas marinas colgadas por encima del mar actual, las rías y los valles fluviales inundados, las turberas y restos de bosques sumergidos o las cuevas con pinturas hoy bajo el mar (como la cueva Cosquer, en Marsella, con su entrada a 37 m de profundidad) registran los cambios del nivel del mar. Las rías gallegas son valles fluviales que el mar invadió al subir tras la última glaciación.</p><p>Los fósiles marinos en las cumbres, en cambio, no indican que el mar llegara allí: son rocas que se formaron en el fondo del mar y que la orogenia levantó después (ver los temas de geomorfología).</p>'))));

    el.append(H.fix('Nivel del mar', [
      'Las conchas marinas en montañas muy altas no demuestran movimientos eustáticos: el nivel del mar nunca ha estado miles de metros más alto. Son rocas sedimentarias marinas levantadas por la tectónica.',
      'Entre las causas de los movimientos eustáticos falta la dilatación térmica del agua del océano (el agua caliente ocupa más volumen), responsable de cerca del 40 % de la subida actual. La aportación de «aguas juveniles» es despreciable a escala humana.',
      'Los movimientos tectónicos no son siempre «convulsivos» y de alcance local: el rebote isostático de Escandinavia o Canadá afecta a regiones enteras y es lento y continuo.',
      'El manual no recoge la subida actual del nivel del mar: unos 20 cm desde 1900 y, hoy, más de 4 mm/año, con una aceleración clara desde los años noventa.',
    ]));
    el.append(H.selfCheck([
      { q: 'Hace 21.000 años el nivel del mar estaba…', opts: ['unos 10 m más bajo', 'unos 130 m más bajo', 'unos 50 m más alto', 'igual que hoy'], a: 1, ex: ' El agua estaba retenida en los grandes mantos de hielo de América del Norte y Eurasia.' },
      { q: 'En Estocolmo el nivel relativo del mar baja unos 3-4 mm al año porque…', opts: ['el Báltico se está secando', 'el terreno sigue subiendo tras la fusión del hielo de la última glaciación', 'allí no se nota el cambio climático', 'hay mareas muy grandes'], a: 1, ex: ' Es el rebote isostático, más rápido que la subida del mar.' },
      { q: '¿Qué dos causas principales tiene la subida actual del nivel del mar?', opts: ['Los volcanes y los ríos', 'La dilatación térmica del agua y la fusión de glaciares y mantos de hielo', 'La evaporación y la lluvia', 'Las mareas y los tsunamis'], a: 1, ex: ' Más o menos 40 % y 60 % del total, respectivamente.' },
      { q: 'Las rías gallegas son…', opts: ['fallas tectónicas', 'valles fluviales inundados por la subida del mar tras la última glaciación', 'restos de glaciares', 'deltas'], a: 1, ex: ' Son un ejemplo de costa de inmersión.' },
    ]));
  },
});
