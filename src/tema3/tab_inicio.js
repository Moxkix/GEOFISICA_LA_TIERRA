/* ===================== INICIO · TEMA 3 ===================== */
H.CORRECCIONES = [
  ['Presión normal (1.1)', '760 mm = 1.015 milibares', '760 mm de mercurio = 1.013,25 hPa. Hoy se usa el hectopascal (1 hPa = 1 mb)', 'isobaras'],
  ['Reducción al nivel del mar (1.1)', '11 mb por cada 100 m; 980 mb a 200 m → 1.002 mb', 'Cerca del nivel del mar, ≈ 12 hPa/100 m (1 hPa cada 8 m), y menos con la altitud. Con la fórmula hipsométrica el ejemplo da ≈ 1.003,5 hPa', 'isobaras'],
  ['Fig. 3.4', 'Isobara «1.115»', 'Es la de 1.015 hPa', 'isobaras'],
  ['Fuerza de Coriolis (2.1.2, fig. 3.5)', 'Se explica por la distinta velocidad lineal de cada paralelo', 'Esa explicación solo vale para los movimientos norte–sur; Coriolis desvía cualquier movimiento horizontal', 'viento'],
  ['Dirección del viento (2.1.2)', '«Casi siguiendo la dirección de las isobaras»', 'Solo en la atmósfera libre (viento geostrófico). En superficie el rozamiento hace que las cruce con 10–20° sobre el mar y 25–45° sobre tierra', 'viento'],
  ['Origen de los centros de acción (1.3)', 'La corriente en chorro «es la causa» de los principales centros de acción', 'Los anticiclones subtropicales se deben a la subsidencia de la célula de Hadley; el chorro y sus ondas organizan las borrascas de latitudes medias', 'circulacion'],
  ['Corriente en chorro (2.2.2)', 'Hacia los 30°, entre 9.000 y 15.000 m, a 200–400 km/h; «origen incierto»; descubierta en la Segunda Guerra Mundial', 'Hay dos chorros: subtropical (≈ 30°, 12–14 km) y polar (40–60°, 9–11 km), con núcleos de 100–250 km/h y máximos de más de 400 km/h. Se explican por el contraste térmico ecuador–polo (viento térmico) y la conservación del momento angular. Los describió W. Ōishi en los años veinte', 'circulacion'],
  ['Fig. 3.13 (2.2.2)', 'Curvatura positiva (horaria) = anticiclónica', 'En meteorología la curvatura ciclónica (antihoraria en el hemisferio norte) es la positiva', 'circulacion'],
  ['Zonas tropicales (4)', 'Altas presiones subtropicales por «aire frío y denso que se acumula contra la superficie»', 'Son anticiclones dinámicos: el aire que desciende se calienta por compresión', 'circulacion'],
  ['Ejercicio 4', 'Mapas de «enero y junio»', 'Los mapas del tema (figs. 3.8 y 3.9) son de enero y julio', 'circulacion'],
  ['Gradiente adiabático húmedo (3.3.1)', '0,5 °C cada 100 m', 'Varía de ≈ 0,3 °C/100 m en aire cálido y muy húmedo a ≈ 0,9 °C/100 m en aire frío', 'adiabatico'],
  ['Fig. 3.16', 'Aire a 20 °C y 10 g/m³: condensa a 900 m y 11 °C', 'Condensa hacia los 1.080 m y 9,5 °C: el aire se expande al subir y su punto de rocío también baja (≈ 125 m por grado de diferencia entre temperatura y rocío)', 'adiabatico'],
  ['Efecto foehn (3.3.2)', 'El aire se deseca «debido al incremento de presión»', 'El aire se calienta por compresión y por eso baja su humedad relativa; llega más cálido y seco que en barlovento porque perdió agua al precipitar', 'adiabatico'],
  ['Cumulonimbos (recuadro «Los tipos de nubes»)', 'En latitudes templadas alcanzan 5–6 km', 'Su cima llega a la tropopausa: 10–12 km en latitudes medias y 16–18 km en los trópicos', 'frentes'],
  ['Nubes bajas (mismo recuadro)', 'Nimboestratos y estratocúmulos', 'La OMM clasifica el nimbostrato en el piso medio, aunque su base suele estar por debajo de 2 km', 'frentes'],
  ['Gotas de lluvia (recuadro «Tipos y medida»)', 'Hasta 7 mm de diámetro', 'Rara vez superan 5–6 mm: por encima se rompen al caer', 'inicio'],
  ['Aguanieve (mismo recuadro)', 'Copos que se funden y se vuelven a congelar', 'Eso son gránulos de hielo (o lluvia engelante si se congela al tocar el suelo). Para AEMET, aguanieve es la mezcla de lluvia y nieve', 'inicio'],
  ['Nieve y agua (mismo recuadro)', '10 mm de nieve = 1 mm de agua', 'Es solo una media: según el tipo de nieve, la relación va de 5:1 (húmeda) a 30:1 (polvo)', 'inicio'],
  ['Precipitación mundial (3.4)', '900 mm al año; 14 millones de t/s', 'Unos 950–1.050 mm (≈ 2,7 mm/día), unos 16 millones de toneladas por segundo', 'precipitacion'],
  ['Monzón (3.4.1)', 'Se ha desechado la explicación térmica', 'No se ha desechado sino completado: contraste tierra–mar, meseta del Tíbet como barrera y foco de calor en altura, y desplazamiento de la ZCIT y del chorro', 'precipitacion'],
  ['Erratas', 'BuysBallot; estracúmulos; nimboestratos', 'Buys Ballot; estratocúmulos; nimbostratos', 'inicio'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Mapa conceptual del tema', 'Elementos y factores climáticos II: la presión y la humedad',
      'Interactivos agrupados según los dos mapas conceptuales con que abre el tema: la presión atmosférica y la humedad atmosférica. Cada uno incluye preguntas de autoevaluación y el cuestionario final repasa el conjunto. Usan datos reales: normales de estaciones, el reanálisis ERA5 y dos episodios recientes, la DANA de octubre de 2024 y el viento sur de febrero de 2026 en Bilbao.',
      'Geografía General I<br>UNED · Tema 3<br>Material de tutoría'));

    /* ---------- mapa conceptual ---------- */
    const cols = [
      { h: 'La presión atmosférica', x: 255, items: [['Campo de presión en superficie: isobaras', 'isobaras'], ['Campo de presión en altura: isohipsas', 'isobaras'], ['Diferencias de presión: el gradiente', 'viento'], ['Fuerza de Coriolis', 'T1:coriolis'], ['Distribución de presiones en la Tierra', 'circulacion'], ['Circulación general atmosférica', 'circulacion'], ['Circulación en altura: corrientes en chorro', 'circulacion'], ['Vientos locales: el foehn', 'adiabatico']] },
      { h: 'La humedad atmosférica', x: 745, items: [['Ciclo hidrológico del agua', 'precipitacion'], ['Evaporación', 'precipitacion'], ['Saturación por ascendencia (adiabática)', 'adiabatico'], ['Saturación por contacto (nieblas)', null], ['Formación de nubes: convectiva, orográfica, frontal', 'frentes'], ['Mecanismos de precipitación', null], ['Distribución de la precipitación', 'precipitacion'], ['Variaciones estacionales y régimen', 'regimenes']] },
    ];
    const W = 1000, y0 = 142, dy = 46, Hh = y0 + 7.8 * dy;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Mapa conceptual del Tema 3">`;
    const node = (x, y, w, label, tab, cls = '') => {
      const ext = tab && tab.startsWith('T1:'), dis = !tab;
      const lines = label.length > 44 ? (() => { const k = label.lastIndexOf(' ', 42); return [label.slice(0, k), label.slice(k + 1)]; })() : [label];
      const hh = lines.length > 1 ? 36 : 28;
      return `<g class="node ${cls} ${dis ? 'dis' : ''} ${ext ? 'ext' : ''}" ${tab ? `data-tab="${tab}" tabindex="0" role="link"` : ''} aria-label="${label}${ext ? ' (Tema 1)' : ''}"><rect x="${x - w / 2}" y="${y - hh / 2}" width="${w}" height="${hh}" rx="8"/>${lines.map((l, i) => `<text x="${x}" y="${y + 4.5 + (i - (lines.length - 1) / 2) * 14}" text-anchor="middle">${l}</text>`).join('')}${ext ? `<text class="tag" x="${x + w / 2 - 6}" y="${y - hh / 2 + 10}" text-anchor="end">TEMA 1 ↗</text>` : ''}</g>`;
    };
    s += `<path class="edge" d="M500 46 V 70 H 255 V 84 M500 70 H 745 V 84"/>`;
    for (const c of cols) {
      s += `<path class="edge" d="M${c.x} 112 V ${y0 + (c.items.length - 1) * dy}"/>`;
      c.items.forEach((it, i) => { s += node(c.x, y0 + i * dy, 400, it[0], it[1]); });
      s += node(c.x, 98, 260, c.h, c.items[0][1], 'hub');
    }
    s += node(500, 30, 330, 'Elementos y factores climáticos II', 'isobaras', 'root');
    s += `</svg>`;
    const cmap = H.h('div', { class: 'card cmap', html: s });
    H.$$('.node[data-tab]', cmap).forEach((n) => {
      const t = n.dataset.tab;
      const go = () => { if (t.startsWith('T1:')) location.href = H.T1 + '#' + t.slice(3); else H.go(t); };
      n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    });
    cmap.append(H.html('<p class="hint">Los nodos con borde discontinuo gris (saturación por contacto y mecanismos de precipitación) no tienen todavía interactivo propio; el de Coriolis abre el Tema 1.</p>'));

    /* ---------- tu municipio ---------- */
    const card = H.h('div', { class: 'card' });
    const upd = () => {
      const { s: st, d } = T3.myStation(), alt = T3.placeAlt(), reg = T3.regime(st), p = st.pr;
      const iMx = p.slice(0, 12).indexOf(Math.max(...p.slice(0, 12)));
      const pst = alt != null ? 1013.25 * Math.pow(1 - 0.0065 * alt / 288.15, 5.255) : null;
      card.innerHTML = `<h3>Tu municipio</h3>
        <p style="font-family:var(--serif);font-size:1.2rem;margin:.2em 0">${H.placeLabel()}</p>
        <div class="readouts" style="margin:8px 0">
          <div class="ro"><div class="k">Altitud</div><div class="v">${alt != null ? H.f(alt) + ' <small>m</small>' : '<small>pendiente</small>'}</div></div>
          <div class="ro"><div class="k">Presión normal a esa altitud</div><div class="v">${pst != null ? H.f(pst) + ' <small>hPa</small>' : '—'}</div></div>
          <div class="ro bl"><div class="k">Precipitación anual</div><div class="v">${H.f(p[12])} <small>mm</small></div></div>
          <div class="ro hl"><div class="k">Régimen</div><div class="v">${reg.name} <small>· máx. ${H.MES3[iMx]}</small></div></div>
        </div>
        <p class="small">Precipitación de ${T3.stLabel(st)}, a ${H.f(d)} km (normales OMM 1991–2020).${alt != null ? ' Altitud del modelo digital SRTM.' : ''}</p>`;
      const row = H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } });
      const b1 = H.h('button', { class: 'btn acc sm', type: 'button', style: { flex: 'none' } }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio'); b1.onclick = H.openPlacePicker;
      const b2 = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Ver su climograma →'); b2.onclick = () => H.go('regimenes');
      row.append(b1, b2); card.append(row);
    };
    upd(); H.onPlace(upd);

    const items = [
      ['isobaras', 'P', 'Isobaras', 'Individuos isobáricos, reducción al nivel del mar y la DANA de 2024 en superficie y en altura.'],
      ['viento', 'P', 'El viento', 'Gradiente, Coriolis y rozamiento; borrascas y anticiclones; escala de Beaufort.'],
      ['circulacion', 'C', 'Circulación general', 'Mapas mensuales de presión y viento (ERA5) y el modelo de tres células.'],
      ['adiabatico', 'H', 'Ascenso y foehn', 'Enfriamiento adiabático, estabilidad, nubes y el viento sur de Bilbao.'],
      ['frentes', 'H', 'Nubes y frentes', 'Los diez géneros de nubes, el ciclo de una borrasca y un meteograma real.'],
      ['precipitacion', 'P', 'Distribución mundial', 'Isoyetas, factores de la lluvia, ciclo hidrológico y el ejercicio 2.'],
      ['regimenes', 'P', 'Regímenes', 'Climograma de tu estación y los seis regímenes del manual.'],
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

    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: normales climatológicas OMM 1991–2020 (NOAA NCEI, accesión 0253808, v6.6); reanálisis ERA5 (Copernicus/ECMWF, vía Google Earth Engine): medias mensuales 1991–2020 (julio–diciembre, 1991–2019) y datos horarios de la DANA del 28–30 de octubre de 2024 y del viento sur del 23–26 de febrero de 2026, con los niveles de 850, 500 y 250 hPa del reanálisis MERRA-2 (NASA GMAO), porque Earth Engine no tiene esas horas de ERA5 en niveles de presión; observaciones de AEMET citadas en el texto; altitud de los municipios del modelo digital SRTM (NASA/USGS); ciclo hidrológico de Trenberth y otros (2007); presión de vapor de saturación por la fórmula de Magnus (OMM, 2018); costas de Natural Earth; municipios del paquete <i>spanish-cities-info</i> (ISC), verificados con el INE. Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
