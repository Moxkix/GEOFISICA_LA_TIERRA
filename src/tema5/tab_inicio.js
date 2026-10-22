/* ===================== INICIO · TEMA 5 ===================== */
H.CORRECCIONES = [
  ['Köppen: letras s y w (p. 10)', 'Según que el invierno reciba más del 70 % o menos del 30 % de la lluvia', 's: el mes más seco del verano recibe menos de 30 mm (40 en los mapas actuales) y menos de 1/3 del más lluvioso del invierno; w: el mes más seco del invierno, menos de 1/10 del más lluvioso del verano. El 70 % solo cuenta para el umbral de aridez', 'koppen'],
  ['Umbral de aridez (cuadro 5.1)', 'e = 20t + 490 − 7·PPW es la «evapotranspiración potencial»', 'La fórmula es correcta (con PPW entre 30 y 70 %), pero e es un umbral empírico, no la ETP: en Riad e ≈ 540 mm y la ETP supera los 2.000 mm', 'secos'],
  ['Climas secos (cuadro 5.1)', 'Solo BS y BW', 'Falta la tercera letra: h (temperatura media anual ≥ 18 °C) y k (menor): BWh, BWk, BSh, BSk', 'koppen'],
  ['Grupos G y H (pp. 9 y 30)', 'Climas de montaña (G) y de alta montaña, a más de 3.000 m (H)', 'No forman parte de Köppen-Geiger: las montañas se clasifican con sus propios datos; «H» solo aparece en la leyenda del mapa de Geiger y Pohl', 'montana'],
  ['Ejemplos del apartado 1.3', 'Sevilla y Tananarive, 18,5 °C; Aberdeen y Chicago, 832 mm', 'Con las normales 1991-2020: Sevilla 19,3 °C y Antananarivo 19,6 °C; Aberdeen 833 mm, pero Chicago 962 mm', 'clasificar'],
  ['Climogramas', 'Series 1961-1990 y 1971-2000', 'La normal vigente es 1991-2020, unos 0,5 °C más cálida en el conjunto del planeta', 'tiempo'],
  ['Cronología (p. 15)', 'Filas descolocadas («Islandia: hielo en el Nilo»…); termina en 1960 con un «descenso de la temperatura a escala mundial»', 'Cronología rehecha; desde 1975 la temperatura global sube unos 0,2 °C por década', 'tiempo'],
  ['Fig. 5.3', 'El clima hace 18.000 años (CLIMAP, 1976)', 'Último Máximo Glaciar hace unos 21.000 años de calendario (18.000 de radiocarbono), 6-7 °C más frío que la era preindustrial', 'tiempo'],
  ['Cuadro 5.2', 'Desiertos templados: amplitudes diarias «hasta 90 °C»', 'Lo habitual son 15-25 °C; la que ronda los 30-40 °C es la amplitud anual', 'secos'],
  ['Cuadro 5.2', 'Desiertos costeros: «vegetación bastante densa»', 'Atacama y el Namib están entre los desiertos más pobres en vegetación, salvo las formaciones de niebla', 'secos'],
  ['Desiertos templados (2.1.1)', '«No existen en el hemisferio Sur»', 'La Patagonia (BSk y BWk), a sotavento de los Andes, entre 40° y 50° S', 'secos'],
  ['Pisos térmicos (p. 14) y tabla de Caldas', 'Piso gélido «menor de −0 °C»; piso frío «17,5 > T 12»', 'Menor de 0 °C; 17,5 °C > T ≥ 12 °C', 'montana'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Diagrama conceptual del tema', 'La diversidad climática I. Clasificación de los climas. Los climas azonales',
      'Interactivos organizados según el diagrama conceptual del tema: cómo se clasifican los climas, la clasificación de Köppen aplicada a cualquier lugar del mundo y a los 8.132 municipios españoles, los climas secos y los de montaña, y el cambio del clima en el tiempo. Usan datos reales: las normales 1991-2020 de la OMM, TerraClimate (1961-1990 y 1991-2020), el reanálisis ERA5 y reconstrucciones del clima desde la última glaciación.',
      'Geografía General I<br>UNED · Tema 5<br>Material de tutoría'));

    /* ---------- diagrama conceptual ---------- */
    const N = {
      fis: [215, 40, 190, 'Criterios fisionómicos', 'clasificar'], root: [500, 40, 210, 'Clasificación de los climas', 'koppen'], gen: [790, 40, 180, 'Criterios genéticos', 'clasificar'],
      alg: [100, 115, 170, 'Algebraicas o climáticas', 'koppen'], bio: [265, 115, 140, 'Biogeográficas', 'clasificar'], geo: [405, 115, 120, 'Geográficas', 'clasificar'],
      ele: [270, 185, 180, 'Elementos del clima', 'T2'], fac: [790, 115, 170, 'Factores del clima', 'T3'],
      div: [500, 250, 200, 'La diversidad climática', 'mapa'], esp: [790, 250, 190, 'Köppen en España', 'espana'],
      zon: [110, 330, 130, 'Escala zonal', 'clasificar'], reg: [265, 330, 140, 'Escala regional', 'clasificar'], loc: [415, 330, 125, 'Escala local', 'clasificar'], mic: [570, 330, 150, 'Microclimática', 'clasificar'], tie: [790, 330, 170, 'Escala temporal', 'tiempo'],
      dz: [200, 410, 175, 'Distribución zonal', 'T6'], daz: [560, 410, 190, 'Distribución azonal', 'secos'],
      sec: [470, 490, 190, 'Climas secos (BS, BW)', 'secos'], mon: [720, 490, 170, 'Climas de montaña', 'montana'],
    };
    const E = [['fis', 'root'], ['gen', 'root'], ['alg', 'fis'], ['bio', 'fis'], ['geo', 'fis'], ['ele', 'alg'], ['ele', 'geo'], ['fac', 'gen'], ['root', 'div'], ['ele', 'div'], ['fac', 'div'], ['div', 'esp'],
      ['div', 'zon'], ['div', 'reg'], ['div', 'loc'], ['div', 'mic'], ['div', 'tie'], ['zon', 'dz'], ['zon', 'daz'], ['daz', 'sec'], ['daz', 'mon']];
    let s = `<svg viewBox="0 0 1000 520" role="img" aria-label="Diagrama conceptual del Tema 5"><defs><marker id="ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a96a3"/></marker></defs>`;
    for (const [a, b] of E) {
      const [x1, y1, w1] = N[a], [x2, y2, w2] = N[b];
      if (y1 === y2) { const d = x2 > x1 ? 1 : -1; s += `<path class="edge" d="M${x1 + d * w1 / 2} ${y1} L ${x2 - d * (w2 / 2 + 2)} ${y2}" marker-end="url(#ar5)"/>`; continue; }
      const dy = y2 > y1 ? 15 : -15; s += `<path class="edge" d="M${x1} ${y1 + dy} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - dy - 2 * Math.sign(dy)}" marker-end="url(#ar5)"/>`;
    }
    const EXT = { T2: 'TEMA 2', T3: 'TEMA 3', T6: 'TEMA 6' };
    for (const [k, [x, y, w, label, tab]] of Object.entries(N)) {
      const ext = EXT[tab], dis = tab === 'T6', cls = k === 'root' ? 'root' : k === 'div' ? 'hub' : '';
      s += `<g class="node ${cls} ${ext ? 'ext' : ''} ${dis ? 'dis' : ''}" ${dis ? '' : `data-tab="${tab}" tabindex="0" role="link"`} aria-label="${label}${ext ? ' (' + ext.toLowerCase() + ')' : ''}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="8"/><text x="${x}" y="${y + 4.5}" text-anchor="middle">${label}</text>${ext ? `<text class="tag" x="${x + w / 2 + 4}" y="${y - 19}" text-anchor="end">${ext}${dis ? ' · PRÓXIMAMENTE' : ' ↗'}</text>` : ''}</g>`;
    }
    s += '</svg>';
    const cmap = H.h('div', { class: 'card cmap wide-svg', html: s });
    H.$$('.node[data-tab]', cmap).forEach((n) => { const t = n.dataset.tab; const go = () => { if (H[t]) location.href = H[t]; else H.go(t); }; n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); });
    cmap.append(H.html('<p class="hint">Diagrama del manual simplificado, con dos nodos añadidos: «Köppen en España» y «Escala temporal». Pulsa un nodo para abrir su interactivo; los elementos y los factores del clima llevan a los Temas 2 y 3, y la distribución zonal será el Tema 6.</p>'));

    /* ---------- tu municipio ---------- */
    const card = H.h('div', { class: 'card' });
    const cv = H.h('canvas'), cl = T3.climo(cv, (w) => Math.min(w * 0.62, 240));
    const info = H.h('div');
    const upd = () => {
      const c = T5.placeClimate(), r = KG.classify(c.T, c.P, c.lat, T5.opt);
      const t61 = c.T61 ? KG.type(c.T61, c.P61, c.lat, T5.opt) : null;
      cl.draw(T5.asStation(c.T, c.P, c.lat), { small: true });
      const src = c.src === 'tc' ? 'TerraClimate 1991-2020' : c.src === 'grid' ? 'TerraClimate 1991-2020 (celda de 0,5°)' : `estación de ${T5.stLabel(c.st)} (a ${H.f(c.d)} km), normales OMM 1991-2020`;
      info.innerHTML = `<p style="font-family:var(--serif);font-size:1.2rem;margin:.2em 0">${H.placeLabel()}</p>
        <div style="display:flex;gap:10px;align-items:center;margin:6px 0">${T5.chip(r.type, 'big')}<div><b>${KG.NAME[r.type]}</b><div class="kletters">${T5.letters(r.type)}</div></div></div>
        <p class="small">${src}.${t61 ? ` Con la normal 1961-1990: ${T5.chip(t61)}${t61 !== r.type ? ' — ha cambiado de tipo.' : '.'}` : ''}</p>`;
      const row = H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } });
      const b1 = H.h('button', { class: 'btn acc sm', type: 'button', style: { flex: 'none' } }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio'); b1.onclick = H.openPlacePicker;
      const b2 = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Ver la clasificación paso a paso →'); b2.onclick = () => H.go('koppen');
      row.append(b1, b2); info.append(row);
    };
    card.append(H.h('h3', {}, 'El clima de tu municipio'), H.h('div', { class: 'viz framed' }, cv), info);
    upd(); H.onPlace(upd); T5.onOpt(upd);

    const items = [
      ['clasificar', 'C', 'Clasificar el clima', 'Escalas, climas con los mismos números y distinto régimen, Blair y la cuadrícula de temperaturas.'],
      ['koppen', 'K', 'Clasificador de Köppen', 'El árbol de decisiones con los datos de tu municipio, de una estación o los tuyos; reto de climogramas.'],
      ['mapa', 'M', 'Mapa mundial de Köppen', 'Los climas del mundo con datos de 1991-2020, el climograma de cualquier punto y los cambios desde 1961-1990.'],
      ['espana', 'E', 'Köppen en España', 'Los 8.132 municipios clasificados, el mapa de España y qué ha cambiado desde 1961-1990.'],
      ['secos', 'S', 'Climas secos', 'El umbral de aridez, el índice de aridez y las causas de ocho desiertos.'],
      ['montana', 'Mo', 'Climas de montaña', 'Simulador de pisos, gradientes reales, solana y umbría, Caldas.'],
      ['tiempo', 'T', 'El clima en el tiempo', 'De la última glaciación a hoy: temperatura global, mapa glaciar, normales y cronología.'],
      ['cuestionario', '✓', 'Cuestionario final', '20 preguntas de repaso de todo el tema.'],
    ];
    const toc = H.h('div', { class: 'toc toc3' });
    for (const [id, i, t, d] of items) toc.append(H.html(`<a href="#${id}"><span class="i">${i}</span><span><b>${t}</b><br><span class="d">${d}</span></span></a>`));
    el.append(cmap, H.h('div', { class: 'hero' }, card, toc));

    const tbl = H.h('div', { class: 'card' });
    tbl.innerHTML = `<h3>Valores corregidos respecto al manual</h3>
      <p class="sub">Los interactivos usan valores y criterios actuales. Esta tabla recoge las diferencias con el texto de la Unidad Didáctica y por qué; cada pestaña repite las que le afectan.</p>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:18%">Cuestión</th><th style="width:26%">Manual</th><th>Valor o formulación correcta</th><th style="width:9%">Ver</th></tr></thead><tbody>
      ${H.CORRECCIONES.map(([a, b, c, t]) => `<tr><td><b>${a}</b></td><td class="bad">${b}</td><td>${c}</td><td><a href="#${t}">abrir →</a></td></tr>`).join('')}
      </tbody></table></div>
      <p class="small">El límite entre los climas C y D a −3 °C (Köppen, 1936, y el manual) es correcto, pero muchos mapas actuales usan 0 °C; y para el verano seco (s) el manual usa 30 mm y los mapas actuales 40 mm. Los interactivos aplican por defecto los criterios del manual y permiten cambiarlos en «Criterios de la clasificación».</p>`;
    el.append(tbl);

    const D = T5.DATA();
    const src = ['normales climatológicas 1991-2020 de la OMM (NOAA NCEI)', D.KMUNDO || D.KES ? 'TerraClimate (Abatzoglou y otros, 2018), normales 1961-1990 y 1991-2020' : null,
      'presión y precipitación: reanálisis ERA5 (Copernicus/ECMWF)', 'temperatura del mar: NOAA OISST v2.1', D.HADCRUT ? 'temperatura global: HadCRUT5 (Met Office Hadley Centre y Climatic Research Unit)' : null,
      D.LGMR ? 'paleoclima: Last Glacial Maximum Reanalysis (Osman y otros, 2021)' : null, 'relieve: NOAA ETOPO1', 'clasificación: Köppen (1936), Kottek y otros (2006), Peel y otros (2007), Beck y otros (2018)'].filter(Boolean);
    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: ${src.join('; ')}. Datos procesados con Google Earth Engine. Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
