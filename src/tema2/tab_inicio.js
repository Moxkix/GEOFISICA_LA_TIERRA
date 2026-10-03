/* ===================== INICIO · TEMA 2 ===================== */
H.CORRECCIONES = [
  ['Cuadro 1 · dióxido de carbono', '0,0325 %', '≈ 0,042 % (≈ 425 ppm en 2025). El 0,0325 % (325 ppm) corresponde a 1969–1970', 'estructura'],
  ['Cuadro 1 · hidrógeno', '0,0018 %', '≈ 0,00005 % (0,5 ppm). El 0,0018 % (18 ppm) es la proporción del neón', 'estructura'],
  ['Cuadro 1 · N₂O', '«Anhídrido nitroso», gas tóxico', 'Es el óxido nitroso (óxido de dinitrógeno), un gas de efecto invernadero que también destruye ozono. Los óxidos contaminantes de la combustión son el NO y el NO₂ (NOx)', 'estructura'],
  ['Tropopausa polar (2.1, fig. 2.2)', 'A unos 6 km', 'Matiz: la media anual ronda los 8–9 km; los 6 km son el mínimo del invierno polar', 'estructura'],
  ['Estratosfera (2.2)', '«Puede alcanzar los 100 °C»', 'En la estratopausa la temperatura ronda los 0 °C (−2,5 °C en la atmósfera estándar)', 'estructura'],
  ['Estratosfera (2.2)', 'Aumenta 3 °C por km a partir de 18–20 km', 'Isoterma (≈ −56,5 °C) hasta unos 20 km; después +1 °C/km hasta 32 km y +2,8 °C/km hasta 47 km', 'estructura'],
  ['Estratosfera (2.2)', '«Termina donde acaba la capa de ozono»', 'El ozono es más abundante entre 20 y 25 km. La estratopausa (≈ 50 km) es donde más calienta su absorción de UV por unidad de masa de aire', 'estructura'],
  ['Mesopausa (2.3)', 'A unos 80 km', 'A unos 85–90 km, con ≈ −90 °C: el nivel más frío de toda la atmósfera', 'estructura'],
  ['Presión (Medida 1)', 'Unidad: el milibar', 'Hoy se usa el hectopascal (1 hPa = 1 mb). La presión normal a nivel del mar es 1.013,25 hPa', 'aire'],
  ['Escala Celsius (Medida 1)', 'Celsius fijó 0 °C en la fusión y 100 °C en la ebullición', 'Su escala de 1742 era inversa (100 en la fusión, 0 en la ebullición); la escala directa se impuso hacia 1743–1745 (Christin, Linneo)', 'aire'],
  ['Escala Fahrenheit (Medida 1)', '100 °F a la temperatura del cuerpo humano', 'Fahrenheit asignó 96 °F al cuerpo humano; con la escala actual son ≈ 98,6 °F', 'aire'],
  ['Escala Kelvin (Medida 1)', 'Cero absoluto −273 °C; T = C + 273; «°K»', 'Cero absoluto −273,15 °C; T = C + 273,15. El kelvin se escribe K, sin símbolo de grado', 'aire'],
  ['Calor específico (3)', 'El del agua es cinco veces el del aire', 'Unas 4 veces por unidad de masa (4,18 frente a 1,005 J/g·°C). Por unidad de volumen, unas 3.500 veces: ese es el dato que explica la inercia térmica del mar', 'aire'],
  ['Densidad (3)', 'Equivale al peso específico; «20 g de masa pesan 20 g»', 'Densidad = masa/volumen (kg/m³); peso específico = peso/volumen (N/m³). Masa y peso son magnitudes distintas', 'aire'],
  ['Temperatura del Sol (4)', 'Unos 5.700 °C', 'La temperatura efectiva de la fotosfera es de 5.772 K, unos 5.500 °C', 'balance'],
  ['Balance energético (4, fig. 2.4)', 'Albedo 35 %; el suelo absorbe 45 %; evaporación 20 %; convección 10 %', 'Estimaciones actuales (Trenberth y otros, 2009): albedo ≈ 30 %; absorción en superficie ≈ 47 %; calor latente ≈ 23 %; calor sensible ≈ 5 %', 'balance'],
  ['Fig. 2.7', '«Ángulo de los planos de la eclíptica y el ecuador de 20°»', 'Ese ángulo es fijo (23° 26′). Lo que vale 20° en el ejemplo es la declinación solar, la latitud donde el Sol está en el cénit', 'balance'],
  ['Ciclo diario (6.1.1)', 'Máxima entre las 12 y las 18 h; mínima hacia las 6', 'Máxima hacia las 14–16 h solares (16–18 h oficiales en verano en España); mínima hacia la salida del Sol, entre las 5 y las 8 h solares según la estación', 'diario'],
  ['Temperatura media diaria (recuadro)', 'Sin termómetros de máxima y mínima, la lectura de las 9 h', 'La media de 24 lecturas horarias es la más precisa; para las normales, la OMM recomienda (máx. + mín.)/2, que permite comparar estaciones de todo el mundo. La lectura de las 9 h no es un procedimiento estándar', 'diario'],
  ['Normales climatológicas (recuadro)', '«Series de 30 años»', 'Correcto; el periodo de referencia vigente de la OMM es 1991–2020', 'anual'],
  ['Erratas', 'Aphelio; Farenheit; «elíptica» (fig. 2.7); Yangami; gr; °K; SO₄H₂', 'Afelio; Fahrenheit; eclíptica; Yangambi; g; K; H₂SO₄', 'inicio'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Mapa conceptual del tema', 'Elementos y factores climáticos I: la temperatura',
      'Interactivos agrupados según los tres mapas conceptuales con que abre el tema: la atmósfera, la insolación terrestre y la temperatura. Cada uno incluye preguntas de autoevaluación y el cuestionario final repasa el conjunto. Los nodos que remiten a la posición de la Tierra respecto al Sol enlazan con el Tema 1.',
      'Geografía General I<br>UNED · Tema 2<br>Material de tutoría'));

    /* ---------- mapa conceptual ---------- */
    const cols = [
      { h: 'La atmósfera', x: 170, items: [['Composición', 'estructura'], ['Estructura: troposfera, estratosfera, altas capas', 'estructura'], ['Propiedades: presión y densidad', 'aire'], ['Humedad', 'aire'], ['Comportamiento térmico', 'aire']] },
      { h: 'La insolación terrestre', x: 500, items: [['Absorción, reflexión, dispersión, albedo', 'balance'], ['Emisión, evaporación, movimiento del aire', 'balance'], ['Distancia Sol–Tierra', 'T1:estaciones'], ['Altura solar: latitud y estacionalidad', 'T1:insolacion'], ['Efecto de la atmósfera', 'balance'], ['Tierras y mares', 'tierramar'], ['Topografía del terreno', null]] },
      { h: 'La temperatura', x: 830, items: [['Oscilación diaria', 'diario'], ['Variaciones estacionales', 'anual'], ['Régimen térmico', 'anual'], ['Distribución superficial: isotermas', 'isotermas'], ['Estructura térmica en altura', 'estructura']] },
    ];
    const W = 1000, y0 = 142, dy = 48, Hh = y0 + 6.6 * dy;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Mapa conceptual del Tema 2">`;
    const node = (x, y, w, label, tab, cls = '') => {
      const ext = tab && tab.startsWith('T1:'), dis = !tab;
      const lines = label.length > 36 ? (() => { const k = label.lastIndexOf(' ', 34); return [label.slice(0, k), label.slice(k + 1)]; })() : [label];
      const hh = lines.length > 1 ? 36 : 28;
      return `<g class="node ${cls} ${dis ? 'dis' : ''} ${ext ? 'ext' : ''}" ${tab ? `data-tab="${tab}" tabindex="0" role="link"` : ''} aria-label="${label}${ext ? ' (Tema 1)' : ''}"><rect x="${x - w / 2}" y="${y - hh / 2}" width="${w}" height="${hh}" rx="8"/>${lines.map((l, i) => `<text x="${x}" y="${y + 4.5 + (i - (lines.length - 1) / 2) * 14}" text-anchor="middle">${l}</text>`).join('')}${ext ? `<text class="tag" x="${x + w / 2 - 6}" y="${y - hh / 2 + 10}" text-anchor="end">TEMA 1 ↗</text>` : ''}</g>`;
    };
    s += `<path class="edge" d="M500 46 V 70 H 170 V 84 M500 70 H 830 V 84 M500 70 V 84"/>`;
    for (const c of cols) {
      s += `<path class="edge" d="M${c.x} 112 V ${y0 + (c.items.length - 1) * dy}"/>`;
      c.items.forEach((it, i) => { s += node(c.x, y0 + i * dy, 300, it[0], it[1]); });
      s += node(c.x, 98, 220, c.h, c.items[0][1], 'hub');
    }
    s += node(500, 30, 290, 'Elementos y factores climáticos', 'estructura', 'root');
    s += `</svg>`;
    const cmap = H.h('div', { class: 'card cmap', html: s });
    H.$$('.node[data-tab]', cmap).forEach((n) => {
      const t = n.dataset.tab;
      const go = () => { if (t.startsWith('T1:')) location.href = H.T1 + '#' + t.slice(3); else H.go(t); };
      n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    });
    cmap.append(H.html('<p class="hint">Los nodos marcados «Tema 1» abren el interactivo correspondiente del tema anterior. La topografía (altitud, solana y umbría) no tiene todavía interactivo propio.</p>'));

    /* ---------- tu estación ---------- */
    const stCard = H.h('div', { class: 'card' });
    const updSt = () => {
      const { s: st, d } = T2.myStation();
      const ta = st.ta, jan = ta[0], jul = ta[6], amp = T2.amp(st);
      stCard.innerHTML = `<h3>Tu municipio y su estación</h3>
        <p class="small" style="margin-top:0">Los regímenes térmicos y los ciclos diarios usan las normales 1991–2020 de la estación meteorológica principal más cercana.</p>
        <p style="font-family:var(--serif);font-size:1.2rem;margin:.2em 0">${H.placeLabel()}</p>
        <p class="small">Estación: <b style="color:var(--ink)">${T2.stLabel(st)}</b> · a ${H.f(d)} km · ${H.f(st.elev)} m</p>
        <div class="readouts" style="margin:8px 0">
          <div class="ro"><div class="k">Media anual</div><div class="v">${T2.fT(ta[12])}</div></div>
          <div class="ro bl"><div class="k">Enero</div><div class="v">${T2.fT(jan)}</div></div>
          <div class="ro hl"><div class="k">Julio</div><div class="v">${T2.fT(jul)}</div></div>
          <div class="ro"><div class="k">Amplitud anual</div><div class="v">${T2.fNum(amp)} °C</div></div>
        </div>`;
      const row = H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } });
      const b1 = H.h('button', { class: 'btn acc sm', type: 'button', style: { flex: 'none' } }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio'); b1.onclick = H.openPlacePicker;
      const b2 = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Ver su régimen térmico →'); b2.onclick = () => H.go('anual');
      row.append(b1, b2); stCard.append(row);
    };
    updSt(); H.onPlace(updSt);

    const items = [
      ['estructura', 'A', 'Estructura vertical', 'Composición del aire y capas de la atmósfera: temperatura, presión y masa.'],
      ['aire', 'A', 'Propiedades del aire', 'Humedad absoluta y relativa, punto de rocío, unidades, calor específico y densidad.'],
      ['balance', 'I', 'Balance energético', 'Onda corta y larga, efecto invernadero y filtro de las nubes.'],
      ['tierramar', 'I', 'Tierras y mares', 'Inercia térmica y continentalidad con estaciones reales.'],
      ['diario', 'T', 'Ciclo diario', 'Insolación y temperatura a lo largo del día en tu estación.'],
      ['anual', 'T', 'Régimen térmico', 'Ciclo anual, amplitud y retraso; comparador mundial.'],
      ['isotermas', 'T', 'Isotermas', 'Distribución mundial de la temperatura en enero y julio.'],
      ['cuestionario', '✓', 'Cuestionario final', '20 preguntas de repaso de todo el tema.'],
    ];
    const toc = H.h('div', { class: 'toc toc3' });
    for (const [id, i, t, d] of items) toc.append(H.html(`<a href="#${id}"><span class="i">${i}</span><span><b>${t}</b><br><span class="d">${d}</span></span></a>`));
    el.append(cmap, H.h('div', { class: 'hero' }, stCard, toc));

    const tbl = H.h('div', { class: 'card' });
    tbl.innerHTML = `<h3>Valores corregidos respecto al manual</h3>
      <p class="sub">Los interactivos usan valores actuales. Esta tabla recoge las diferencias con el texto de la Unidad Didáctica y por qué; cada pestaña repite las que le afectan.</p>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:18%">Cuestión</th><th style="width:26%">Manual</th><th>Valor o formulación correcta</th><th style="width:9%">Ver</th></tr></thead><tbody>
      ${H.CORRECCIONES.map(([a, b, c, t]) => `<tr><td><b>${a}</b></td><td class="bad">${b}</td><td>${c}</td><td>${t === 'inicio' ? '' : `<a href="#${t}">abrir →</a>`}</td></tr>`).join('')}
      </tbody></table></div>`;
    el.append(tbl);

    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: normales climatológicas OMM 1991–2020 (NOAA NCEI, accesión 0253808, v6.6; ${T2.ST.length} estaciones); reanálisis ERA5 1991–2020 (Copernicus/ECMWF, vía Google Earth Engine); Atmósfera Estándar de EE. UU. (1976) y perfiles tipo AFGL (Anderson y otros, 1986); balance energético de Trenberth, Fasullo y Kiehl (2009); presión de vapor de saturación por la fórmula de Magnus (OMM, 2018); costas de Natural Earth; municipios del paquete <i>spanish-cities-info</i> (ISC), verificados con el INE. Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
