/* ===================== INICIO · TEMA 4 ===================== */
H.CORRECCIONES = [
  ['Volumen del océano (1)', '1.286 millones de km³', 'Unos 1.335 millones de km³, el 96,5 % del agua de la Tierra', 'salinidad'],
  ['Salinidad media (1.1)', '36 por mil', '34,7 (unos 35 g de sales por kilo); hoy se expresa sin unidades', 'salinidad'],
  ['Cloruro sódico (1.1)', '23 ‰', 'Unos 27 g por kilo de agua de mar (el 78 % de las sales)', 'salinidad'],
  ['Mar Rojo (1.1)', 'Salinidad de 43 ‰', '40-41 en superficie en su mitad norte; 42-43 solo en los golfos de Suez y Áqaba', 'salinidad'],
  ['Hielo marino (1.1)', 'Puede llegar hasta los 65° de latitud', 'En invierno llega a 37-40° N en el golfo de Bohai (China), a 44° N en Hokkaido y a 55-60° S', 'salinidad'],
  ['Densidad máxima (1.2)', 'El agua marina es más densa a −2 °C y luego se dilata', 'Con salinidad mayor de 24,7 no tiene máximo de densidad: se hace más densa hasta congelarse (−1,9 °C)', 'densidad'],
  ['Calor latente (1.2)', 'Mantiene la temperatura cerca del punto de «licuefacción»', 'Cerca del punto de congelación o de fusión; la licuefacción es el paso de gas a líquido', 'densidad'],
  ['Evaporación (1.2)', 'Se produce cuando el aire está 0,3 °C más frío que el agua', 'Depende de la humedad del aire respecto a la saturación junto al mar y del viento', 'densidad'],
  ['Fig. 4.4', 'Densidad en kg/cm³', 'g/cm³ (1,025-1,028); en el fondo, por la compresión, más de 1,05', 'densidad'],
  ['Cuadro 4.1', 'Salinidad de 32 (subárticas) y 30-32 (circumpolares); aguas centrales de 8-15 °C', 'Subárticas: 32,6 en el Pacífico norte, pero más de 35 en el Atlántico norte; circumpolares, cerca de 34. Las aguas centrales superan los 18-20 °C en superficie', 'vertical'],
  ['Masas intermedias (1.3)', 'Se mezclan por difusión molecular', 'Por turbulencia (ondas internas y remolinos); la difusión molecular es mil veces más lenta', 'vertical'],
  ['Aguas profundas (2.1)', 'La corriente circumpolar antártica se origina en los mares de Weddell y Ross', 'Allí se forma el agua de fondo antártica; la corriente circumpolar la mueve el viento del oeste', 'vertical'],
  ['Origen de las mareas (2.2)', 'En la cara opuesta a la Luna la fuerza centrífuga es máxima', 'La aceleración del giro Tierra-Luna es igual en todos los puntos; el abultamiento opuesto se debe a que allí la atracción es menor que en el centro', 'mareas'],
  ['Marea de la Luna sola (2.2)', '«Mareas de algunos centímetros»', 'Una marea de equilibrio de hasta unos 54 cm de carrera; los metros se deben a la resonancia', 'mareas'],
  ['Carrera de marea (2.2)', 'De 15 a 19 m en las bahías', 'Unos 16 m como máximo (bahía de Fundy)', 'mareas'],
  ['Corrientes de marea (2.2)', 'Hasta 18 km/h', 'Más de 30 km/h en los estrechos de la Columbia Británica', 'mareas'],
  ['Olas (2.4.1)', 'No se aprecian más allá de 200 m de profundidad', 'El movimiento desaparece hacia la mitad de la longitud de onda (40 m para olas de 7 s)', 'olas'],
  ['Olas (2.4.1)', 'Las ondas lejanas se llaman «marejada o a veces mar gruesa»', 'Mar de fondo; marejada y mar gruesa son grados de la escala Douglas', 'olas'],
  ['Tsunamis (2.4.1)', 'Más frecuentes en las costas occidentales de Asia', 'En las costas orientales de Asia y en todo el borde del Pacífico', 'olas'],
  ['Monzón (2.4.2)', 'Monzón invernal del noroeste', 'El monzón de invierno del Índico sopla del nordeste', 'corrientes'],
  ['Afloramientos (2.1)', 'Donde los vientos se desvían de la costa', 'Donde el viento sopla paralelo a la costa y el transporte de Ekman aleja el agua de ella', 'ekman'],
  ['Mar y aire (3.2)', 'Cerca del ecuador el mar está 1,2 °C más frío que el aire', 'En las medias por paralelos el mar está 1-2 °C más caliente que el aire en todas las latitudes', 'clima'],
  ['Ciclones tropicales (3.2)', 'Se forman con el mar a 27 °C', 'Umbral de 26,5 °C, además de poca cizalladura, humedad en altura y lejanía del ecuador', 'clima'],
  ['Cuadro 4.2', 'Ivittuut: clima «EH»', 'ET (tundra); las coordenadas de Lima son 12° 05′ S, 77° 03′ O', 'clima'],
  ['Movimientos eustáticos (2.3)', 'Las conchas marinas en montañas muy altas los demuestran', 'Son rocas marinas levantadas por la tectónica: el mar nunca estuvo miles de metros más alto', 'nivel'],
  ['Movimientos eustáticos (2.3)', 'Causas: hielo, cambios de las cuencas y aguas juveniles', 'Falta la dilatación térmica del agua (≈ 40 % de la subida actual) y la propia subida actual: 20 cm desde 1900 y más de 4 mm/año hoy', 'nivel'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Diagrama conceptual del tema', 'Los océanos',
      'Interactivos organizados según el diagrama conceptual con que abre el tema: las propiedades de las aguas marinas, sus movimientos y su relación con la atmósfera. Cada uno incluye preguntas de autoevaluación y el cuestionario final repasa el conjunto. Usan datos reales: temperatura y hielo del mar por satélite, el modelo oceánico HYCOM, los componentes de marea de puertos españoles y de todo el mundo, el reanálisis ERA5 y casos recientes como la borrasca Ciarán.',
      'Geografía General I<br>UNED · Tema 4<br>Material de tutoría'));

    /* ---------- diagrama conceptual (como el del manual, con enlaces) ---------- */
    const N = {
      atm: [500, 42, 150, 'Atmósfera', 'T3'], luna: [100, 92, 130, 'Luna', 'mareas'], tec: [885, 92, 200, 'Movimientos tectónicos', 'nivel'],
      tem: [245, 150, 126, 'Temperatura', 'salinidad'], pre: [397, 150, 130, 'Precipitación', 'salinidad'], pres: [546, 150, 112, 'Presión', 'corrientes'], vie: [690, 150, 112, 'Vientos', 'ekman'],
      sal: [330, 240, 130, 'Salinidad', 'salinidad'], den: [500, 240, 130, 'Densidad', 'densidad'], ola: [640, 240, 110, 'Olas', 'olas'], cli: [800, 240, 110, 'Clima', 'clima'],
      mas: [330, 320, 150, 'Masas de agua', 'vertical'],
      mar: [100, 400, 130, 'Mareas', 'mareas'], mov: [330, 400, 190, 'Movimientos de agua', 'abisal'], cor: [670, 400, 200, 'Corrientes superficiales', 'corrientes'], eus: [885, 400, 200, 'Movimientos eustáticos', 'nivel'],
      oce: [500, 486, 150, 'Océanos', 'salinidad'],
    };
    const E = [['atm', 'tem'], ['atm', 'pre'], ['atm', 'pres'], ['atm', 'vie'], ['tem', 'sal'], ['pre', 'sal'], ['tem', 'den'], ['sal', 'den'], ['sal', 'mas'], ['den', 'mas'], ['tem', 'mov'], ['mas', 'mov'], ['pres', 'mov'], ['vie', 'ola'], ['vie', 'cor'], ['vie', 'cli'], ['cor', 'cli'],
      ['luna', 'mar'], ['tec', 'eus'], ['mar', 'oce'], ['mov', 'oce'], ['ola', 'oce'], ['cor', 'oce'], ['eus', 'oce']];
    let s = `<svg viewBox="0 0 1000 520" role="img" aria-label="Diagrama conceptual del Tema 4"><defs><marker id="ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a96a3"/></marker></defs>`;
    for (const [a, b] of E) { const [x1, y1] = N[a], [x2, y2] = N[b]; const dy = y2 > y1 ? 15 : -15; s += `<path class="edge" d="M${x1} ${y1 + dy} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - dy - 2}" marker-end="url(#ar4)"/>`; }
    for (const [k, [x, y, w, label, tab]] of Object.entries(N)) {
      const ext = tab === 'T3', cls = k === 'oce' ? 'root' : k === 'atm' ? 'hub' : k === 'den' ? 'hub' : '';
      s += `<g class="node ${cls} ${ext ? 'ext' : ''}" data-tab="${tab}" tabindex="0" role="link" aria-label="${label}${ext ? ' (Tema 3)' : ''}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="8"/><text x="${x}" y="${y + 4.5}" text-anchor="middle">${label}</text>${ext ? `<text class="tag" x="${x + w / 2 + 6}" y="${y - 20}" text-anchor="end">TEMA 3 ↗</text>` : ''}</g>`;
    }
    s += `<text x="${(N.tem[0] + N.pre[0]) / 2}" y="154" text-anchor="middle" class="plus">+</text><text x="${(N.pre[0] + N.pres[0]) / 2}" y="154" text-anchor="middle" class="plus">+</text><text x="${(N.pres[0] + N.vie[0]) / 2}" y="154" text-anchor="middle" class="plus">+</text>`;
    s += '</svg>';
    const cmap = H.h('div', { class: 'card cmap wide-svg', html: s });
    H.$$('.node[data-tab]', cmap).forEach((n) => { const t = n.dataset.tab; const go = () => { if (t === 'T3') location.href = H.T3; else H.go(t); }; n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); });
    cmap.append(H.html('<p class="hint">Diagrama del manual con un nodo añadido, «Densidad», que reúne temperatura y salinidad. Pulsa un nodo para abrir su interactivo; «Atmósfera» lleva al Tema 3.</p>'));

    /* ---------- tu municipio ---------- */
    const card = H.h('div', { class: 'card' });
    const O = OCEANO || {};
    const upd = () => {
      const p = H.place, np = T4.nearestPort(p.lat, p.lon, !!p.es), st = np.s;
      let sea = '';
      if (O.sst) {
        const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 }, vals = O.sst.map((a) => T4.grid(a, G1).nearPt(p.lat, p.lon, 5));
        if (vals[0].v === vals[0].v) { const v = vals.map((x) => x.v), mn = Math.min(...v), mx = Math.max(...v); sea = `<div class="ro bl"><div class="k">Mar más cercano (${T4.ll(vals[0].lat, vals[0].lon, 1)})</div><div class="v">${T4.fT(mn, 0)} – ${T4.fT(mx, 0)} <small>(${H.MES3[v.indexOf(mn)]} – ${H.MES3[v.indexOf(mx)]})</small></div></div>`; }
      }
      const alt = T3.placeAlt();
      const F = st ? T4.formF(st) : NaN;
      card.innerHTML = `<h3>Tu municipio</h3>
        <p style="font-family:var(--serif);font-size:1.2rem;margin:.2em 0">${H.placeLabel()}</p>
        <div class="readouts" style="margin:8px 0">
          ${st ? `<div class="ro hl"><div class="k">Puerto de referencia: ${st.name.split(' (')[0]}</div><div class="v">${T4.springRange(st) >= 1 ? H.f(T4.springRange(st), 1) + ' <small>m' : H.f(T4.springRange(st) * 100) + ' <small>cm'} de carrera en vivas · ${T4.tideType(F).name.toLowerCase()} · a ${H.f(np.d)} km</small></div></div>` : ''}
          ${sea}
          <div class="ro"><div class="k">Altitud</div><div class="v">${alt != null ? H.f(alt) + ' <small>m sobre el nivel del mar</small>' : '—'}</div></div></div>
        <p class="small">${alt != null ? (alt < 10 ? 'Tu municipio está a muy poca altitud: mira en «Nivel del mar» qué zonas costeras se inundarían con una subida de uno o pocos metros.' : alt > 66 ? `Ni fundiéndose todo el hielo de la Tierra (unos 66 m) llegaría el mar a tu municipio, pero en la última glaciación la costa estaba 130 m más baja que hoy.` : `Haría falta que el mar subiera ${H.f(alt)} m para llegar a tu municipio: más que si se fundiera Groenlandia (7 m), menos que si se fundiera todo el hielo (66 m).`) : ''}</p>`;
      const row = H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } });
      const b1 = H.h('button', { class: 'btn acc sm', type: 'button', style: { flex: 'none' } }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio'); b1.onclick = H.openPlacePicker;
      const b2 = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Ver la marea de mi puerto →'); b2.onclick = () => { H.go('mareas'); setTimeout(() => { const t = H.$('#puertos'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 300); };
      row.append(b1, b2); card.append(row);
    };
    upd(); H.onPlace(upd);

    const items = [
      ['salinidad', 'S', 'Composición y salinidad', 'Sales, cifras del océano, mapas de temperatura, salinidad y hielo, fig. 4.3.'],
      ['densidad', 'D', 'Densidad', 'Diagrama T-S con la ecuación de estado, hielo y salmuera, el océano como almacén de calor.'],
      ['vertical', 'V', 'En profundidad', 'Perfiles reales, termoclina, masas de agua, cortes del Atlántico, Gibraltar y el Pacífico.'],
      ['mareas', 'M', 'Mareas', 'La fuerza de marea bien explicada, vivas y muertas, y la marea en 65 puertos reales.'],
      ['olas', 'O', 'Olas', 'Órbitas, generador de oleaje, mar de fondo, rompientes, tsunamis y la borrasca Ciarán.'],
      ['corrientes', 'C', 'Corrientes', 'Corrientes, vientos y presión mes a mes; el monzón; el circuito del Atlántico Norte.'],
      ['ekman', 'E', 'Ekman y afloramientos', 'La espiral de Ekman, los afloramientos y la clorofila, la intensificación occidental.'],
      ['botella', 'B', 'Botella a la deriva', 'Lanza botellas y míralas viajar con las corrientes durante años.'],
      ['abisal', 'A', 'Circulación abisal', 'La cinta transportadora y hasta dónde se hunde cada agua.'],
      ['nivel', 'N', 'Nivel del mar', 'Simulador del nivel del mar, glaciaciones, mareógrafos y proyecciones.'],
      ['clima', 'K', 'Océano y clima', 'Mar y aire, el cuadro 4.2 con datos actuales, ciclones tropicales y El Niño.'],
      ['cuestionario', '✓', 'Cuestionario final', '20 preguntas de repaso de todo el tema.'],
    ];
    const toc = H.h('div', { class: 'toc toc3' });
    for (const [id, i, t, d] of items) toc.append(H.html(`<a href="#${id}"><span class="i">${i}</span><span><b>${t}</b><br><span class="d">${d}</span></span></a>`));
    el.append(cmap, H.h('div', { class: 'hero' }, card, toc));

    const tbl = H.h('div', { class: 'card' });
    tbl.innerHTML = `<h3>Valores corregidos respecto al manual</h3>
      <p class="sub">Los interactivos usan valores actuales. Esta tabla recoge las diferencias con el texto de la Unidad Didáctica y por qué; cada pestaña repite las que le afectan.</p>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:18%">Cuestión</th><th style="width:26%">Manual</th><th>Valor o formulación correcta</th><th style="width:9%">Ver</th></tr></thead><tbody>
      ${H.CORRECCIONES.map(([a, b, c, t]) => `<tr><td><b>${a}</b></td><td class="bad">${b}</td><td>${c}</td><td>${t === 'inicio' ? '' : `<a href="#${t}">abrir →</a>`}</td></tr>`).join('')}
      </tbody></table></div>`;
    el.append(tbl);

    const D = T4.DATA();
    const src = ['temperatura del mar y anomalías: NOAA OISST v2.1 (Huang y otros, 2021)', D.OCEANO && D.OCEANO.sss ? 'salinidad, corrientes y perfiles: modelo HYCOM + NCODA, GOFS 3.1 (2014-2023)' : null, D.OCEANO && (D.OCEANO.ep || D.OCEANO.e) ? 'evaporación y precipitación: NASA MERRA-2' : null,
      'clorofila: NASA MODIS-Aqua', 'vientos, presión, temperatura del aire y borrasca Ciarán: reanálisis ERA5 (Copernicus/ECMWF)', D.CIARAN && D.CIARAN.hs ? 'oleaje: NOAA WAVEWATCH III' : null,
      'mareas: constantes armónicas de TICON-4 (Hart-Davis, Dettmering y Seitz, 2025; CC BY 4.0) y NOAA CO-OPS, vía la base de datos Neaps', D.RELIEVE ? 'relieve: NOAA ETOPO1' : null, D.CICLONES ? 'ciclones: NOAA IBTrACS v4' : null,
      'nivel del mar: CSIRO y NOAA (indicador de la EPA)' + (D.NIVEL && D.NIVEL.star ? ', NOAA STAR' : '') + (D.NIVEL && D.NIVEL.gauges ? ', PSMSL' : ''), typeof ENSO !== 'undefined' && ENSO ? 'índice ONI: NOAA CPC' : null,
      'normales climatológicas: OMM 1991-2020 (NOAA NCEI)', 'ecuación de estado del agua del mar: UNESCO (1981)'].filter(Boolean);
    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: ${src.join('; ')}. Datos de satélite y modelos procesados con Google Earth Engine. Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
