/* ===================== INICIO · TEMA 6 ===================== */
H.CORRECCIONES = [
  ['Zona intertropical (apartado 1)', 'Comprende «el 20 por 100 de las tierras emergidas»', 'Más de un tercio: en torno al 35 % de las tierras emergidas con la Antártida (38 % sin ella)', 'mosaico'],
  ['Cuadro 6.1', 'Af: amplitud anual < 5 °C; Aw: «un mes precipita menos de 60 mm»', 'Köppen solo usa el mes más frío (≥ 18 °C) y la lluvia del mes más seco: Af, 60 mm o más; Am, al menos 100 − P/25; Aw, menos. La amplitud no interviene, y Am también tiene meses con menos de 60 mm', 'intertropicales'],
  ['Cuadro 6.2', 'Selva tropical: lluvia anual «entre 1.500 y 2.000 mm»', 'La mitad de las celdas Af reciben entre 2.200 y 3.200 mm al año (mediana, 2.650 mm; TerraClimate 1991-2020)', 'intertropicales'],
  ['Manglares (1.1.3)', 'Se dan en la costa oeste y «no en la costa Este donde hay corrientes frías»', 'Al revés: las corrientes frías bañan las fachadas occidentales tropicales, y allí los manglares faltan o escasean (Perú, norte de Chile, Namibia, Baja California)', 'vegetacion'],
  ['Cuadro 6.5', 'Cs: el mes más seco, «muy inferior a 30 mm»; Cf: el mes más seco, «superior a 30 mm»', 's: el mes más seco del verano recibe menos de 30 mm (40 en los mapas actuales) y menos de 1/3 del más lluvioso del invierno; f es simplemente ni s ni w', 'subtropicales'],
  ['Csa y Csb (2.2.2)', 'Csa, la cuenca del Mediterráneo; Csb, las costas con corrientes frías', 'Los separa el mes más cálido (≥ 22 °C: a; menos: b). En la cuenca mediterránea también hay Csb: 1.302 municipios españoles, casi todos del interior', 'subtropicales'],
  ['Cuadro 6.7', '«Beta dálmata», «chehili», «shirocco»', 'Bora dálmata; el «chehili» es el siroco local del Magreb (chergui en Marruecos, chili en Túnez); siroco', 'subtropicales'],
  ['Fig. 6.12', 'Lyon, ejemplo de clima oceánico; «Innsbruk»', 'Con 1991-2020 Lyon es Cfa (julio, 22,6 °C). Innsbruck es Cfb con el umbral de −3 °C y Dfb con el de 0 °C', 'oceanico'],
  ['Climas microtérmicos (2.4)', 'En el hemisferio sur, «una parte de la Pampa Argentina»', 'La Pampa es Cfa y BSk: en el hemisferio sur no hay climas D salvo enclaves de montaña en los Andes', 'oceanico'],
  ['Fig. 6.15', 'Ulán Bator, Dwb', 'Con 1991-2020 es BSk (estepa fría): 273 mm al año, por debajo de su umbral de aridez', 'oceanico'],
  ['Taiga (2.4.3)', 'Coníferas de hoja caduca: «el alerce o el ciprés pelado»', 'El ciprés pelado (Taxodium) vive en los pantanos del sureste de EE. UU., de clima Cfa; la conífera caducifolia de la taiga es el alerce', 'polares'],
  ['Climas polares (apartado 3)', 'En el hemisferio norte, «por encima del paralelo 70° en las regiones continentales»', 'La isoterma de 10 °C del mes más cálido baja hasta unos 52-58° N en el mar de Bering, la bahía de Hudson y el Labrador, como muestra la propia fig. 6.17', 'polares'],
  ['Cuadro 6.11', 'Tundra: precipitaciones «inferiores a 250 mm»', 'Solo en la variedad continental; la oceánica recibe mucho más: Nuuk, 874 mm', 'polares'],
  ['Cuadro 6.10', '«EB, clima seco de alta montaña»', 'No existe en Köppen-Geiger: las montañas se clasifican con sus propios datos (Tema 5)', 'polares'],
  ['Hielo perpetuo (3.2.1)', 'El casquete antártico, «heredado de las glaciaciones cuaternarias», no se volvería a formar', 'El casquete antártico se formó hace unos 34 millones de años; lo de que no se volvería a formar con el clima actual se ha calculado para el de Groenlandia', 'polares'],
  ['Climogramas', 'Series 1961-1990 y 1971-2000', 'Normal vigente 1991-2020. Tegucigalpa no figura en las normales de la OMM: se usa San Salvador; Oporto, tampoco: se usa San Francisco', 'intertropicales'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Diagrama conceptual del tema', 'La diversidad climática II. Los climas zonales: intertropicales, templados y polares',
      'Interactivos organizados según el diagrama conceptual del tema: las tres zonas climáticas, los climas de cada una, sus causas y sus paisajes. Usan datos reales: las normales 1991-2020 de la OMM, los mapas de Köppen de TerraClimate del Tema 5, los vientos y las temperaturas del reanálisis ERA5 y los biomas de RESOLVE.',
      'Geografía General I<br>UNED · Tema 6<br>Material de tutoría'));

    /* ---------- diagrama conceptual ---------- */
    const N = {
      kop: [190, 40, 230, 'Clasificación de Köppen', 'T5'], root: [500, 40, 210, 'Los climas zonales', 'mosaico'],
      zc: [165, 115, 220, 'Zona intertropical', 'intertropicales'], zt: [547, 115, 200, 'Zona templada', 'mosaico'], zf: [882, 115, 150, 'Zona polar', 'polares'],
      fc: [165, 190, 250, 'Sol cenital · alisios y ZCIT', 'T3'], ft: [547, 190, 300, 'Vientos del oeste · tierras y mares', 'mosaico'], ff: [882, 190, 190, 'Sol oblicuo · hielo', 'polares'],
      ecu: [62, 265, 104, 'Ecuatorial', 'intertropicales'], sab: [166, 265, 88, 'Sabana', 'intertropicales'], mzn: [268, 265, 104, 'Monzónico', 'intertropicales'],
      chi: [382, 265, 72, 'Chino', 'subtropicales'], med: [484, 265, 124, 'Mediterráneo', 'subtropicales'], oce: [596, 265, 98, 'Oceánico', 'oceanico'], con: [706, 265, 108, 'Continental', 'oceanico'],
      tun: [815, 265, 86, 'Tundra', 'polares'], hie: [929, 265, 134, 'Hielo perpetuo', 'polares'],
      veg: [330, 350, 270, 'Vegetación, suelos y ríos', 'vegetacion'], ide: [690, 350, 200, 'Identifica el clima', 'identifica'],
    };
    const E = [['kop', 'root'], ['root', 'zc'], ['root', 'zt'], ['root', 'zf'], ['zc', 'fc'], ['zt', 'ft'], ['zf', 'ff'],
      ['fc', 'ecu'], ['fc', 'sab'], ['fc', 'mzn'], ['ft', 'chi'], ['ft', 'med'], ['ft', 'oce'], ['ft', 'con'], ['ff', 'tun'], ['ff', 'hie'],
      ['ecu', 'veg'], ['sab', 'veg'], ['mzn', 'veg'], ['chi', 'veg'], ['med', 'veg'], ['oce', 'veg'], ['con', 'veg'], ['tun', 'veg'], ['hie', 'veg']];
    const ZK = { ecu: 'ecu', sab: 'sab', mzn: 'mzn', chi: 'chi', med: 'med', oce: 'oce', con: 'con', tun: 'tun', hie: 'hie' };
    let s = `<svg viewBox="0 0 1000 380" role="img" aria-label="Diagrama conceptual del Tema 6"><defs><marker id="ar6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a96a3"/></marker></defs>`;
    for (const [a, b] of E) {
      const [x1, y1, w1] = N[a], [x2, y2, w2] = N[b];
      if (y1 === y2) { const d = x2 > x1 ? 1 : -1; s += `<path class="edge" d="M${x1 + d * w1 / 2} ${y1} L ${x2 - d * (w2 / 2 + 2)} ${y2}" marker-end="url(#ar6)"/>`; continue; }
      const dy = y2 > y1 ? 15 : -15; s += `<path class="edge${b === 'veg' ? ' thin' : ''}" d="M${x1} ${y1 + dy} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - dy - 2 * Math.sign(dy)}" marker-end="url(#ar6)"/>`;
    }
    const EXT = { T3: 'TEMA 3', T5: 'TEMA 5' };
    for (const [k, [x, y, w, label, tab]] of Object.entries(N)) {
      const ext = EXT[tab], cls = k === 'root' ? 'root' : k[0] === 'z' && k.length === 2 ? 'hub' : '';
      const sw = ZK[k] ? `<rect x="${x - w / 2 + 6}" y="${y - 5}" width="10" height="10" rx="2" style="fill:${T6.css(ZK[k])};stroke:rgba(28,40,54,.4)"/>` : '';
      s += `<g class="node ${cls} ${ext ? 'ext' : ''}" data-tab="${tab}" tabindex="0" role="link" aria-label="${label}${ext ? ' (' + ext.toLowerCase() + ')' : ''}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="8"/>${sw}<text x="${x + (sw ? 7 : 0)}" y="${y + 4.5}" text-anchor="middle">${label}</text>${ext ? `<text class="tag" x="${x + w / 2 + 4}" y="${y - 19}" text-anchor="end">${ext} ↗</text>` : ''}</g>`;
    }
    s += '</svg>';
    const cmap = H.h('div', { class: 'card cmap wide-svg', html: s });
    H.$$('.node[data-tab]', cmap).forEach((n) => { const t = n.dataset.tab; const go = () => { if (H[t]) location.href = H[t] + (t === 'T5' ? '#koppen' : t === 'T3' ? '#circulacion' : ''); else H.go(t); }; n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); });
    cmap.append(H.html('<p class="hint">Diagrama del manual simplificado. Cada zona tiene sus factores y sus climas, y todos desembocan en sus rasgos biogeográficos. Pulsa un nodo para abrir su interactivo; la clasificación de Köppen y la circulación general llevan a los Temas 5 y 3.</p>'));

    /* ---------- tu municipio ---------- */
    const card = H.h('div', { class: 'card' });
    const cv = H.h('canvas'), cl = T3.climo(cv, (w) => Math.min(w * 0.62, 240));
    const info = H.h('div');
    const VAR = {
      med: 'Verano seco por el anticiclón subtropical e invierno suave y lluvioso con los vientos del oeste.',
      chi: 'Sin estación seca y con verano caluroso. En España aparece en el valle del Ebro, el Prepirineo y el interior de Cataluña, donde las tormentas de verano evitan la sequía estival.',
      oce: 'Lluvia repartida todo el año y amplitud térmica moderada: los vientos del oeste llegan del mar.',
      sec: 'La precipitación no alcanza el umbral de aridez: es un clima azonal (Tema 5).',
      con: 'Inviernos fríos, por debajo del umbral C/D: en España, solo en cumbres.', sba: 'Verano corto y fresco: en España, solo en cumbres.', tun: 'El mes más cálido no llega a 10 °C: en España, solo en las cumbres más altas.',
    };
    const upd = () => {
      const c = T5.placeClimate(), r = KG.classify(c.T, c.P, c.lat, T5.opt), z = T6.zonal(r.type), Z = T6.ZON[z];
      cl.draw(T5.asStation(c.T, c.P, c.lat), { small: true });
      const src = c.src === 'tc' ? 'TerraClimate 1991-2020' : c.src === 'grid' ? 'TerraClimate 1991-2020 (celda de 0,5°)' : `estación de ${T5.stLabel(c.st)} (a ${H.f(c.d)} km), normales OMM 1991-2020`;
      info.innerHTML = `<p style="font-family:var(--serif);font-size:1.2rem;margin:.2em 0">${H.placeLabel()}</p>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0">${T5.chip(r.type, 'big')}<div><b>${Z.n}</b><div class="small">${T6.ZONA[Z.z]} · ${KG.NAME[r.type]}</div></div></div>
        <p class="small">${VAR[z] || ''} <span style="color:var(--muted)">(${src})</span></p>`;
      const row = H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } });
      const b1 = H.h('button', { class: 'btn acc sm', type: 'button', style: { flex: 'none' } }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio'); b1.onclick = H.openPlacePicker;
      const b2 = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, Z.tab === 'T5' ? 'Climas secos (Tema 5) →' : `Ver «${T6.TABNAME[Z.tab]}» →`);
      b2.onclick = () => { if (Z.tab === 'T5') location.href = H.T5 + '#secos'; else H.go(Z.tab); };
      row.append(b1, b2); info.append(row);
    };
    card.append(H.h('h3', {}, 'El clima de tu municipio'), H.h('div', { class: 'viz framed' }, cv), info);
    upd(); H.onPlace(upd); T5.onOpt(upd);

    const items = [
      ['mosaico', 'Z', 'El mosaico zonal', 'Los climas del manual en el mapa del mundo, su reparto por latitudes y el «continente ideal» calculado con datos.'],
      ['intertropicales', 'A', 'Climas intertropicales', 'Af, Am y Aw con estaciones reales; las lluvias siguen al Sol; las regiones monzónicas con ERA5; climogramas del manual.'],
      ['subtropicales', 'Cs', 'Mediterráneo y chino', 'Misma latitud, fachadas opuestas; Nagasaki, Nueva Orleans y Porto Alegre; vientos del Mediterráneo; balance hídrico.'],
      ['oceanico', 'D', 'Oceánico y continental', 'Lyon e Innsbruck; la continentalidad de Brest a Chitá; Helsinki y Ulán Bator.'],
      ['polares', 'E', 'Climas polares', 'Mapa polar de las isotermas de 10 °C y 0 °C, el Sol en el polo, tundra y hielo perpetuo.'],
      ['vegetacion', 'V', 'Vegetación y suelos', 'Qué bioma hay en cada clima, perfiles de vegetación y de suelo, manglares.'],
      ['identifica', '?', 'Identifica el clima', 'Climogramas sin nombre (ejercicio 4) y las vacaciones en Innsbruck, El Cairo o Nueva Orleans.'],
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
      <p class="small">Los tipos de Köppen se calculan con los criterios del manual (límite C/D a −3 °C y 30 mm para el verano seco), que se pueden cambiar en «Criterios de la clasificación», igual que en el Tema 5.</p>`;
    el.append(tbl);

    const D = T6.DATA();
    const src = ['normales climatológicas 1991-2020 de la OMM (NOAA NCEI)', 'TerraClimate (Abatzoglou y otros, 2018), normales 1961-1990 y 1991-2020',
      'vientos y temperatura: reanálisis ERA5 (Copernicus/ECMWF)', 'Polo Sur: normales 1991-2020 de la estación Amundsen-Scott (pogoda.ru.net)', D.BIOMAS ? 'biomas: RESOLVE Ecoregions 2017 (Dinerstein y otros, 2017; CC BY 4.0)' : null,
      'relieve: NOAA ETOPO1', 'clasificación: Köppen (1936), Kottek y otros (2006), Peel y otros (2007), Beck y otros (2018)'].filter(Boolean);
    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: ${src.join('; ')}. Datos procesados con Google Earth Engine. Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
