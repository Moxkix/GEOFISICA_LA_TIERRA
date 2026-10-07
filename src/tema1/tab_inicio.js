/* ===================== INICIO ===================== */
H.CORRECCIONES = [
  ['Radios terrestres (1.1)', 'Ecuatorial 6.378,16 km; polar 6.356,77 km; medio 6.367,75 km', 'WGS84: ecuatorial 6.378,137 km; polar 6.356,752 km. Radio medio (UGGI): 6.371,0 km', 'forma'],
  ['Medición de Eratóstenes (1.1)', '7° y 800 km ⇒ «sobre 45.000 km»', 'Ángulo 7° 12′ (1/50 de la circunferencia) y 5.000 estadios ⇒ 250.000 estadios ≈ 39.000–46.000 km según el valor del estadio. Con 7° y 800 km saldrían ≈ 41.100 km. Valor real: 40.075 km', 'forma'],
  ['Expedición Magallanes-Elcano (1.1)', 'Fallecimiento de Magallanes «año 1522»', 'Magallanes murió en 1521 (Mactán, Filipinas); Elcano completó la vuelta en septiembre de 1522', 'forma'],
  ['La Luna (1)', 'Masa «la … parte» (cifra omitida); eje «aproximadamente paralelo» al terrestre', 'Masa ≈ 1/81 de la terrestre; diámetro ≈ 27 % del terrestre. Su eje forma 1,5° con la normal a la eclíptica; el terrestre, 23,4°: no son paralelos', 'forma'],
  ['Meridiano de Greenwich (2.1.1)', '«situado al oeste de Londres»', 'El Real Observatorio de Greenwich está al sureste del centro de Londres', 'coordenadas'],
  ['Sentido de la rotación (2.1.1)', '«inverso al de las agujas del reloj»', 'Solo si se observa desde encima del polo norte; vista desde el polo sur, la rotación es horaria. Lo invariable es que es de oeste a este', 'coordenadas'],
  ['Latitud (2.1.1)', 'Definida con la recta al centro de la Tierra', 'Esa es la latitud geocéntrica. La cartografía usa la latitud geodésica (normal al elipsoide); difieren hasta ≈ 11,5′ a 45°', 'coordenadas'],
  ['Zonas horarias (2.1.1)', 'Fleming en 1870; 27 países en 1884; la Conferencia fijó la línea de cambio de fecha; GMT', 'Fleming propuso su sistema hacia 1876–1879; en Washington (1884) participaron 25 países; la Conferencia adoptó Greenwich como meridiano origen, pero no definió la línea de cambio de fecha, que es convencional (Kiribati la desplazó en 1995, Samoa en 2011). La referencia actual es UTC. Hoy hay más de 24 horas oficiales (desfases de 30 y 45 min, hasta UTC+14)', 'hora'],
  ['Hora oficial de España (2.1.1)', '«corresponde al huso +1»', 'La España peninsular está geográficamente casi entera en el huso 0 (Galicia occidental, en el −1), pero usa UTC+1 desde 1940 (UTC+2 en verano). Canarias: UTC+0 (UTC+1 en verano)', 'hora'],
  ['Efecto de Coriolis (2.1.1)', '«Afecta a los fluidos»', 'Afecta a todo cuerpo que se mueve sobre la Tierra; es apreciable en fluidos (vientos, corrientes) y proyectiles por las grandes distancias y tiempos implicados. Es nulo en el Ecuador y máximo en los polos', 'coriolis'],
  ['Año sidéreo (2.1.2)', '«365, 6 horas, 4 minutos y 9 segundos»', '365 d 6 h 9 min 10 s. El año trópico (365 d 5 h 48 min 45 s) sí es correcto', 'estaciones'],
  ['Órbita (2.1.2)', '930 millones de km; 106.000 km/h; 29,5 km/s; perihelio 147,5 y afelio 152,6 millones de km', '≈ 940 millones de km; velocidad media 29,8 km/s ≈ 107.000 km/h; perihelio ≈ 147,1 millones de km (2–5 de enero); afelio ≈ 152,1 millones de km (3–7 de julio); distancia media 149,6 millones de km (1 ua)', 'estaciones'],
  ['Oblicuidad de la eclíptica (2.1.2)', '23° 27′; círculos polares a 66° 33′', '23° 26′ (23,44°; disminuye ≈ 0,47″ al año). Trópicos a 23° 26′; círculos polares a 66° 34′', 'estaciones'],
  ['Fechas de solsticios y equinoccios (2.1.2)', '22 de marzo, junio, septiembre y diciembre', 'Equinoccio de marzo: 20 (a veces 21); solsticio de junio: 20–21; equinoccio de septiembre: 22–23; solsticio de diciembre: 21–22', 'estaciones'],
  ['Duración del día en los equinoccios (2.1.2)', '12 horas en todas las latitudes', '12 h es el valor geométrico. Por la refracción atmosférica y el tamaño del disco solar, el día real dura unos 7–10 min más (algo más hacia los polos)', 'estaciones'],
  ['Solsticio de diciembre y perihelio (2.1.2)', 'Se presentan como coincidentes', 'Están separados unas dos semanas (21–22 de diciembre frente a 2–5 de enero) y la fecha del perihelio se desplaza lentamente', 'estaciones'],
  ['Proyecciones cilíndricas (3.1)', '«los paralelos se van espaciando según se asciende»', 'Solo en las conformes (Mercator). En la cilíndrica equivalente (Lambert, Gall-Peters) los paralelos se aproximan hacia los polos', 'proyecciones'],
  ['UTM (3.1)', 'Cilindro tangente; «utilizada mucho tiempo» en el MTN', 'Cilindro transverso secante (factor 0,9996) en husos de 6°. Sigue siendo la proyección del MTN, hoy sobre el sistema ETRS89', 'proyecciones'],
  ['Proyección «de Peters» (3.1)', 'Presentada como nueva y fiel en superficie, eje y posición', 'Es la cilíndrica equivalente que J. Gall publicó en 1855 (Gall-Peters). Conserva las superficies, pero deforma mucho las formas en latitudes bajas y altas', 'proyecciones'],
  ['Planos (3.2)', '«a partir de en torno a 1:10.000 para abajo»', 'Se llaman planos los documentos a escala 1:10.000 o mayor (denominador ≤ 10.000)', 'escala'],
  ['Equidistancia del MTN (3.3)', '20 m en el mapa topográfico nacional', '20 m en el MTN50 (1:50.000); 10 m en el MTN25 (1:25.000)', 'relieve'],
];

H.tab({
  id: 'inicio', nav: 'Inicio', title: 'Inicio',
  init(el) {
    el.append(H.intro('Mapa conceptual del tema', 'La Tierra planeta: movimientos y representación',
      'Nueve interactivos agrupados según el mapa conceptual con el que abre el tema. Cada uno incluye preguntas de autoevaluación; el cuestionario final repasa el conjunto. Haz clic en cualquier nodo para ir a su interactivo.',
      'Geografía General I<br>UNED · Tema 1<br>Material de tutoría'));

    const cols = [
      { h: 'Planeta', x: 125, items: [['Forma esférica (geoide)', 'forma'], ['Tamaño: atmósfera y vida', 'forma'], ['Fuerza de gravedad', 'forma'], ['Luna: mareas y eclipses', 'forma'], ['Sol: esfericidad e insolación', 'insolacion']] },
      { h: 'Rotación', x: 375, items: [['Orientación: puntos cardinales', 'coordenadas'], ['Situación: red geográfica', 'coordenadas'], ['Día y noche', 'hora'], ['Hora y husos horarios', 'hora'], ['F. centrífuga y Coriolis', 'coriolis']] },
      { h: 'Traslación', x: 625, items: [['Eje inclinado 23° 26′', 'estaciones'], ['Solsticios y equinoccios', 'estaciones'], ['Estaciones del año', 'estaciones'], ['Zonas terrestres', 'estaciones'], ['Rayos oblicuos', 'insolacion']] },
      { h: 'Mapa', x: 875, items: [['Base geodésica', 'forma'], ['Base matemática: proyección', 'proyecciones'], ['Base matemática: escala', 'escala'], ['Altimetría: relieve', 'relieve'], ['Planimetría', 'relieve']] },
    ];
    const W = 1000, Hh = 420;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Mapa conceptual del tema 1">`;
    const node = (x, y, w, label, tab, cls = '') => `<g class="node ${cls}" data-tab="${tab}" tabindex="0" role="link" aria-label="${label}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="8"/><text x="${x}" y="${y + 4.5}" text-anchor="middle">${label}</text></g>`;
    s += `<path class="edge" d="M500 47 V 72 H 125 V 88 M500 72 H 875 V 88 M375 72 V 88 M625 72 V 88"/>`;
    for (const c of cols) {
      const y0 = 140, dy = 52;
      s += `<path class="edge" d="M${c.x} 118 V ${y0 + (c.items.length - 1) * dy}"/>`;
      c.items.forEach((it, i) => { s += node(c.x, y0 + i * dy, 236, it[0], it[1]); });
      s += node(c.x, 103, 150, c.h, c.items[0][1], 'hub');
    }
    s += node(500, 32, 230, 'La Tierra, planeta', 'forma', 'root');
    s += `</svg>`;
    const cmap = H.h('div', { class: 'card cmap', html: s });
    H.$$('.node', cmap).forEach((n) => { const go = () => H.go(n.dataset.tab); n.addEventListener('click', go); n.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); });

    const items = [
      ['forma', '1', 'Forma y dimensiones', 'Eratóstenes, esfera, elipsoide y geoide; la Luna.'],
      ['insolacion', '2', 'Esfericidad e insolación', 'Por qué la energía recibida depende de la latitud.'],
      ['coordenadas', '3', 'Orientación y coordenadas', 'Globo con latitud y longitud; reto de localización.'],
      ['hora', '4', 'Hora y husos horarios', 'Hora solar y oficial en tu municipio; día y noche.'],
      ['coriolis', '5', 'Efecto de Coriolis', 'Plataforma giratoria y desviación según la latitud.'],
      ['estaciones', '6', 'Traslación y estaciones', 'Simulador de órbita, iluminación y zonas terrestres.'],
      ['proyecciones', '7', 'Proyecciones', 'Diez proyecciones con indicatrices de Tissot y tamaño real.'],
      ['escala', '8', 'Escala', 'Conversor, escala gráfica, superficies y ordenación.'],
      ['relieve', '9', 'Curvas de nivel', 'Isohipsas, tintas hipsométricas y perfil topográfico.'],
      ['cuestionario', '✓', 'Cuestionario final', '20 preguntas de repaso de todo el tema.'],
    ];
    const toc = H.h('div', { class: 'toc toc3' });
    for (const [id, i, t, d] of items) toc.append(H.html(`<a href="#${id}"><span class="i">${i}</span><span><b>${t}</b><br><span class="d">${d}</span></span></a>`));

    const placeCard = H.h('div', { class: 'card' });
    const updP = () => {
      placeCard.innerHTML = `<h3>Tu municipio</h3><p class="small" style="margin-top:0">Se usa para calcular la duración del día, la altura del Sol a mediodía y la hora solar.</p>
        <p style="font-family:var(--serif);font-size:1.25rem;margin:.2em 0">${H.placeLabel()}</p>
        <p class="small num">${H.dms(H.place.lat, 'N', 'S')} · ${H.dms(H.place.lon, 'E', 'O')}</p>`;
      const b = H.h('button', { class: 'btn acc sm', type: 'button' }, H.place.def ? 'Elegir mi municipio' : 'Cambiar municipio');
      b.onclick = H.openPlacePicker; placeCard.append(b);
    };
    updP(); H.onPlace(updP);

    el.append(cmap, H.h('div', { class: 'hero' }, placeCard, toc));

    const tbl = H.h('div', { class: 'card' });
    tbl.innerHTML = `<h3>Valores corregidos respecto al manual</h3>
      <p class="sub">Los interactivos usan valores actuales. Esta tabla recoge las diferencias con el texto de la Unidad Didáctica para que el estudiante sepa qué ha cambiado y por qué. Cada pestaña repite las que le afectan.</p>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:18%">Cuestión</th><th style="width:27%">Manual</th><th>Valor o formulación correcta</th><th style="width:9%">Ver</th></tr></thead><tbody>
      ${H.CORRECCIONES.map(([a, b, c, t]) => `<tr><td><b>${a}</b></td><td class="bad">${b}</td><td>${c}</td><td><a href="#${t}">abrir →</a></td></tr>`).join('')}
      </tbody></table></div>`;
    el.append(tbl);

    const ev = H.EV, fe = (d) => `${d.getUTCDate()} ${H.MES3[d.getUTCMonth()]}, ${H.clock(d.getUTCHours() + d.getUTCMinutes() / 60)} UTC`;
    el.append(H.html(`<div class="card"><h3>Calendario astronómico de ${H.year} (calculado)</h3>
      <div class="readouts">
        <div class="ro"><div class="k">Perihelio</div><div class="v">${fe(ev.peri)}</div><small>${H.f(ev.periR * H.K.AU, 1)} millones de km</small></div>
        <div class="ro"><div class="k">Equinoccio de marzo</div><div class="v">${fe(ev.mar)}</div></div>
        <div class="ro"><div class="k">Solsticio de junio</div><div class="v">${fe(ev.jun)}</div></div>
        <div class="ro"><div class="k">Afelio</div><div class="v">${fe(ev.afe)}</div><small>${H.f(ev.afeR * H.K.AU, 1)} millones de km</small></div>
        <div class="ro"><div class="k">Equinoccio de septiembre</div><div class="v">${fe(ev.sep)}</div></div>
        <div class="ro"><div class="k">Solsticio de diciembre</div><div class="v">${fe(ev.dic)}</div></div>
      </div><p class="hint">Solsticios y equinoccios calculados con las fórmulas solares de baja precisión del <i>Astronomical Almanac</i> (error de pocos minutos). Perihelio y afelio: ${H.EV.verified ? 'valores publicados para ' + H.year : 'cálculo aproximado (puede desviarse 1–2 días)'}; su fecha oscila de un año a otro por la influencia de la Luna. Ninguna de estas fechas cae fija el día 22.</p></div>`));

    el.append(H.html(`<footer>Material de apoyo a la tutoría de Geografía General I (Geografía Física), Grado en Geografía e Historia, UNED. Datos: líneas de costa Natural Earth (dominio público, vía world-atlas); municipios con coordenadas del paquete <i>spanish-cities-info</i> (ISC), verificados con el INE. Geoide: modelo EGM96 (NGA). Parámetros: elipsoide WGS84, oblicuidad 23,44°, constante solar 1.361 W/m². Funciona sin conexión salvo la geolocalización.</footer>`));
  },
});
