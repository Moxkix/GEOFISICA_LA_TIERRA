/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 4 completo'));
    const BANK = [
      ['salinidad', 'La salinidad media del océano es de unos…', ['25', '34,7 (unos 35 g de sales por kilo)', '36', '45'], 1, 'El manual da 36 ‰, pero la media es 34,7.'],
      ['salinidad', 'La salinidad superficial es máxima…', ['En el ecuador', 'En los subtrópicos, bajo los anticiclones', 'En los polos', 'En las desembocaduras de los ríos'], 1, 'Allí la evaporación supera ampliamente a la precipitación.'],
      ['salinidad', 'El mar Báltico es un mar de…', ['Concentración', 'Dilución', 'Afloramiento', 'Marea diurna'], 1, 'Recibe mucha agua de los ríos y poca evaporación.'],
      ['salinidad', 'El ion más abundante del agua del mar es el…', ['Sodio', 'Cloruro', 'Sulfato', 'Calcio'], 1, 'El 55 % de las sales; el sodio, el 31 %.'],
      ['densidad', 'El agua del mar con salinidad 35 al enfriarse…', ['Tiene su máxima densidad a 4 °C', 'Se hace cada vez más densa hasta congelarse hacia −1,9 °C', 'Se congela a 0 °C', 'Se dilata por debajo de 2 °C'], 1, 'Por encima de una salinidad de 24,7 no hay máximo de densidad antes de congelarse.'],
      ['densidad', 'En aguas polares, la densidad depende sobre todo de…', ['La temperatura', 'La salinidad', 'La turbidez', 'La marea'], 1, 'Cerca de la congelación la dilatación térmica es mínima.'],
      ['densidad', 'Al formarse el hielo marino, el agua de debajo…', ['Se vuelve más dulce', 'Se vuelve más salada y densa', 'Se calienta', 'No cambia'], 1, 'El hielo expulsa la sal en forma de salmuera.'],
      ['densidad', 'Los 2,5 m superiores del océano almacenan tanto calor por grado como…', ['Un vaso de agua', 'Toda la atmósfera', 'Todo el océano profundo', 'Los continentes'], 1, 'La atmósfera equivale en masa a 10 m de agua y el agua tiene un calor específico cuatro veces mayor.'],
      ['vertical', 'La termoclina es…', ['La capa de mezcla superficial', 'La capa donde la temperatura baja rápidamente con la profundidad', 'El fondo marino', 'La capa de hielo'], 1, 'Coincide con la picnoclina y separa la capa superficial del océano profundo.'],
      ['vertical', 'Por debajo de 2.000 m, el agua del océano está casi en todas partes…', ['Entre 10 y 15 °C', 'Entre −1 y 4 °C', 'A 20 °C', 'Congelada'], 1, 'Procede del hundimiento de aguas polares.'],
      ['vertical', 'El agua mediterránea sale por el estrecho de Gibraltar…', ['Por la superficie', 'Por el fondo, por ser más salada y densa', 'Solo en invierno', 'No sale'], 1, 'El agua atlántica entra por la superficie.'],
      ['mareas', 'La marea es causada sobre todo por…', ['El viento', 'La diferencia de atracción de la Luna (y del Sol) entre cada punto de la Tierra y su centro', 'La rotación de la Tierra sola', 'La presión atmosférica'], 1, 'La Luna produce algo más del doble que el Sol, por su cercanía.'],
      ['mareas', 'Las mareas vivas coinciden aproximadamente con…', ['Los cuartos creciente y menguante', 'La luna nueva y la luna llena', 'El perigeo solar', 'Los equinoccios únicamente'], 1, 'Luna, Tierra y Sol alineados (sicigias); suelen llegar uno o dos días después.'],
      ['mareas', 'En un día lunar (24 h 50 min) hay en el Cantábrico…', ['Una pleamar', 'Dos pleamares y dos bajamares', 'Cuatro pleamares', 'Ninguna marea apreciable'], 1, 'La marea semidiurna domina en todo el litoral atlántico.'],
      ['mareas', 'En Valencia la marea es…', ['De varios metros', 'De pocos centímetros', 'Igual que en Santander', 'Solo de tipo semidiurno'], 1, 'El Mediterráneo apenas recibe la onda de marea atlántica.'],
      ['mareas', 'Las mayores carreras de marea del mundo, de unos 16 m, se dan en…', ['El Mediterráneo', 'La bahía de Fundy (Canadá)', 'Las islas Hawái', 'El mar Báltico'], 1, 'La forma de la bahía resuena con la onda semidiurna.'],
      ['olas', 'Al pasar una ola en aguas profundas, una partícula de agua…', ['Avanza con la ola', 'Describe una órbita y vuelve casi al mismo sitio', 'Se queda quieta', 'Baja al fondo'], 1, 'La ola transporta energía, no agua.'],
      ['olas', 'El oleaje crece con…', ['La velocidad del viento, su duración y el fetch', 'La temperatura del agua', 'La marea', 'La salinidad'], 0, 'Si el viento sopla lo bastante, el mar llega a estar totalmente desarrollado.'],
      ['olas', 'La mar de fondo es…', ['El oleaje que levanta el viento local', 'Oleaje regular llegado de una tormenta lejana', 'Una corriente profunda', 'Un tsunami'], 1, 'Las ondas largas viajan más rápido y llegan primero.'],
      ['olas', 'Una ola rompe cuando la profundidad es de unas…', ['10 veces su altura', '1,3 veces su altura', 'Media longitud de onda', '200 m'], 1, 'Con media longitud de onda empieza a notar el fondo.'],
      ['olas', 'Un tsunami en un océano de 4.000 m viaja a unos…', ['70 km/h', '700 km/h', '7 km/h', '7.000 km/h'], 1, 'c = √(g·d) ≈ 200 m/s.'],
      ['ekman', 'En el hemisferio norte, el transporte de Ekman va…', ['En la dirección del viento', '90° a la derecha del viento', '90° a la izquierda', 'Contra el viento'], 1, 'La corriente superficial va 45° a la derecha y el conjunto de la capa, 90°.'],
      ['ekman', 'El afloramiento de Galicia en verano se debe a…', ['Las mareas', 'Los vientos del norte, que alejan el agua superficial de la costa', 'Los ríos', 'El deshielo'], 1, 'El transporte de Ekman va hacia el oeste, mar adentro.'],
      ['ekman', 'Las corrientes del borde oeste de los océanos (Golfo, Kuroshio) son estrechas y rápidas por…', ['El relieve submarino', 'La variación de la fuerza de Coriolis con la latitud', 'Las mareas', 'Los ríos'], 1, 'Es la intensificación occidental (Stommel, 1948).'],
      ['corrientes', 'Los giros subtropicales del hemisferio norte giran…', ['En sentido horario', 'En sentido antihorario', 'De norte a sur', 'Cada estación en un sentido'], 0, 'Alrededor de los anticiclones de las Azores y de Hawái.'],
      ['corrientes', 'La corriente que baña las costas de Florida es…', ['La de Canarias', 'La corriente de Florida, comienzo de la del Golfo', 'La del Labrador', 'La de Humboldt'], 1, 'Ejercicio 5 del manual.'],
      ['corrientes', 'La corriente de Canarias es…', ['Cálida', 'Fría para su latitud', 'Una corriente de marea', 'Una corriente profunda'], 1, 'Rama oriental del giro, con afloramiento costero.'],
      ['corrientes', 'En el Índico norte las corrientes…', ['No cambian', 'Cambian de sentido con el monzón', 'Solo existen en invierno', 'Van siempre hacia el este'], 1, 'La corriente de Somalia sube hacia el norte en verano.'],
      ['abisal', 'El agua profunda del Atlántico Norte se forma en…', ['El mar de los Sargazos', 'Los mares de Groenlandia, Noruega y Labrador', 'El golfo de México', 'El Mediterráneo'], 1, 'El agua salada de la deriva noratlántica se enfría y se hunde.'],
      ['abisal', 'El agua más densa del océano procede de…', ['El ecuador', 'Los mares de Weddell y Ross', 'El mar Rojo', 'El Báltico'], 1, 'Es el agua de fondo antártica.'],
      ['abisal', 'El agua de deshielo de Groenlandia puede frenar la circulación de vuelco porque…', ['Es más caliente', 'Es dulce y hace menos densa el agua superficial', 'Es más salada', 'No influye'], 1, 'Dificulta el hundimiento del agua en los mares nórdicos.'],
      ['nivel', 'En la última glaciación el nivel del mar estaba…', ['Unos 130 m más bajo', 'Unos 10 m más alto', 'Igual que hoy', 'Unos 500 m más bajo'], 0, 'Hace unos 21.000 años.'],
      ['nivel', 'Hoy el nivel medio del mar sube unos…', ['0,4 mm al año', '4 mm al año', '4 cm al año', '40 cm al año'], 1, 'Con aceleración: 1,3 mm/año a principios del siglo XX.'],
      ['nivel', 'En Estocolmo el nivel del mar baja porque…', ['Se evapora el Báltico', 'El suelo sube por el rebote isostático', 'Hay menos marea', 'Las mediciones son erróneas'], 1, 'Tras la fusión del manto de hielo escandinavo.'],
      ['clima', 'Por término medio el mar está…', ['Más frío que el aire en todas las latitudes', 'Algo más caliente que el aire a 2 m en casi todas las latitudes', 'A la misma temperatura que el aire', 'Más frío en los trópicos'], 1, 'Según OISST y ERA5, entre 1 y 2 °C en las medias por paralelos.'],
      ['clima', 'Los ciclones tropicales necesitan un mar de al menos…', ['15 °C', '26,5 °C', '35 °C', '0 °C'], 1, 'Además de poca cizalladura y humedad en altura.'],
      ['clima', 'Durante El Niño…', ['Se refuerzan los alisios', 'El Pacífico ecuatorial central y oriental se calienta', 'Se congela el Pacífico', 'No cambia la lluvia'], 1, 'Los alisios se debilitan y el agua cálida refluye hacia el este.'],
      ['clima', 'Las costas occidentales de los continentes en latitudes medias-altas (Europa occidental) son…', ['Más frías que las orientales', 'Más templadas que las orientales', 'Iguales', 'Desérticas'], 1, 'Por la deriva noratlántica y los vientos del oeste: Brest tiene 7 °C más de media que Gander (Terranova).'],
    ];
    const box = H.h('div');
    let qs = [], answers = [];
    const build = () => {
      qs = [...BANK].sort(() => Math.random() - 0.5).slice(0, 20).map(([tab, q, opts, a, ex]) => { const idx = opts.map((_, i) => i).sort(() => Math.random() - 0.5); return { tab, q, opts: idx.map((i) => opts[i]), a: idx.indexOf(a), ex }; });
      answers = new Array(qs.length).fill(null);
      box.innerHTML = '';
      const prog = H.h('p', { class: 'small' }, `0 de ${qs.length} respondidas`);
      const list = H.h('div', { class: 'card' });
      qs.forEach((q, i) => {
        const opts = H.h('div', { class: 'opts' });
        q.opts.forEach((o, j) => { const b = H.h('button', { class: 'opt', type: 'button', html: `<span class="l">${'abcd'[j]})</span><span>${o}</span>` }); b.onclick = () => { if (box.dataset.done) return; answers[i] = j; H.$$('.opt', opts).forEach((x, k) => { x.style.borderColor = k === j ? 'var(--ink)' : ''; x.style.background = k === j ? 'var(--soft)' : ''; }); prog.textContent = `${answers.filter((x) => x !== null).length} de ${qs.length} respondidas`; }; opts.append(b); });
        list.append(H.h('div', { class: 'q' }, H.h('div', { class: 'qt', html: `<span class="n">${i + 1}.</span>${q.q}` }), opts, H.h('div', { class: 'fb' })));
      });
      const corr = H.h('button', { class: 'btn acc', type: 'button' }, 'Corregir');
      const again = H.h('button', { class: 'btn ghost', type: 'button', style: { display: 'none' } }, 'Nuevo cuestionario');
      const result = H.h('div');
      corr.onclick = () => {
        const pend = answers.filter((x) => x === null).length;
        if (pend && !confirm(`Te faltan ${pend} preguntas. ¿Corregir de todos modos?`)) return;
        box.dataset.done = '1'; let ok = 0; const weak = {};
        H.$$('.q', list).forEach((qe, i) => {
          const q = qs[i], good = answers[i] === q.a; if (good) ok++; else weak[q.tab] = (weak[q.tab] || 0) + 1;
          H.$$('.opt', qe).forEach((x, k) => { x.disabled = true; x.style.background = ''; x.style.borderColor = ''; if (k === q.a) x.classList.add('ok'); else if (k === answers[i]) x.classList.add('ko'); });
          const t = H.TABS.find((x) => x.id === q.tab);
          const fb = H.$('.fb', qe); fb.className = 'fb show ' + (good ? 'ok' : 'ko'); fb.innerHTML = `<b>${good ? 'Correcto.' : answers[i] === null ? 'Sin responder.' : 'No es correcto.'}</b>${q.ex} <a href="#${q.tab}">Repasar en «${t.nav}» →</a>`;
        });
        const nota = ok / qs.length * 10;
        const wk = Object.entries(weak).sort((a, b) => b[1] - a[1]).map(([k, n]) => { const t = H.TABS.find((x) => x.id === k); return `<a href="#${k}">${t.nav}</a> (${n})`; });
        result.innerHTML = `<div class="result-box"><div class="big">${H.f(nota, 1)}</div><div>${ok} aciertos de ${qs.length}</div>${wk.length ? `<p class="small">Conviene repasar: ${wk.join(' · ')}</p>` : '<p class="small">Ningún fallo. Tema dominado.</p>'}</div>`;
        corr.style.display = 'none'; again.style.display = ''; result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      again.onclick = () => { delete box.dataset.done; build(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
      box.append(prog, list, result, H.h('div', { class: 'exam-nav' }, corr, again));
    };
    build();
    el.append(box);
  },
});
