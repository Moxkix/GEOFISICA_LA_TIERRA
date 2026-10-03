/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario final', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 2 completo'));
    const BANK = [
      ['estructura', '¿Cuál es el gas más abundante del aire seco?', ['Oxígeno', 'Nitrógeno', 'Argón', 'Dióxido de carbono'], 1, 'El nitrógeno supone ≈ 78 % del volumen del aire seco; el oxígeno, ≈ 21 %.'],
      ['estructura', 'La proporción actual de CO₂ en la atmósfera es de unos…', ['0,0325 % (325 ppm)', '0,042 % (425 ppm)', '0,4 % (4.000 ppm)', '4 %'], 1, 'Ronda los 425 ppm (2025). El valor del manual, 325 ppm, corresponde a comienzos de la década de 1970.'],
      ['estructura', 'En la troposfera, la temperatura desciende por término medio…', ['0,65 °C cada 100 m', '1 °C cada 1.000 m', '6,5 °C cada 100 m', 'No desciende'], 0, 'Es el gradiente vertical medio: 6,5 °C por kilómetro.'],
      ['estructura', 'El calentamiento de la estratosfera se debe a…', ['La absorción del ultravioleta por el ozono', 'El calor que asciende desde el suelo', 'La condensación del vapor de agua', 'La compresión del aire'], 0, 'El ozono absorbe el UV solar; por eso la temperatura aumenta con la altura en esta capa.'],
      ['estructura', 'La tropopausa se encuentra más alta…', ['Sobre los polos', 'Sobre el ecuador', 'En latitudes medias', 'Sobre los océanos'], 1, 'Unos 16–17 km sobre el ecuador frente a 8–9 km sobre los polos.'],
      ['estructura', 'Por debajo de unos 5,5 km de altitud se concentra…', ['La décima parte de la masa del aire', 'La mitad de la masa del aire', 'Casi toda la masa del aire', 'La cuarta parte'], 1, 'A esa altura la presión es ≈ 500 hPa, la mitad de la del nivel del mar.'],
      ['aire', 'Una masa de aire a 20 °C con 12 g/m³ de vapor tiene una humedad relativa de aproximadamente…', ['12 %', '50 %', '69 %', '100 %'], 2, 'La saturación a 20 °C es ≈ 17,3 g/m³: 12 / 17,3 ≈ 69 %.'],
      ['aire', 'Si una masa de aire se enfría sin cambiar su contenido de vapor, su humedad relativa…', ['Disminuye', 'Aumenta', 'No cambia', 'Se anula'], 1, 'Disminuye la cantidad máxima de vapor admisible, así que la relativa sube hasta saturarse en el punto de rocío.'],
      ['aire', 'Por unidad de masa, el calor específico del agua es, respecto al del aire, unas…', ['2 veces mayor', '4 veces mayor', '10 veces mayor', '3.500 veces mayor'], 1, '4,18 frente a 1,005 J/g·°C. Por unidad de volumen la diferencia es de unas 3.500 veces.'],
      ['aire', '1.013,25 hPa equivalen a…', ['1 atm y 760 mmHg', '1 bar y 1.000 mmHg', '10 atm', '101 Pa'], 0, 'Es la presión normal a nivel del mar; 1 hPa = 1 mb = 100 Pa.'],
      ['aire', '¿Qué aire tiende a ascender?', ['El frío y seco', 'El caliente y húmedo', 'El frío y húmedo', 'Cualquiera, por igual'], 1, 'El calentamiento y el vapor de agua reducen la densidad del aire.'],
      ['balance', 'La energía solar llega a la Tierra principalmente como…', ['Onda larga (infrarrojo térmico)', 'Onda corta (visible, infrarrojo cercano y ultravioleta)', 'Rayos X', 'Ondas de radio'], 1, 'El Sol, a ≈ 5.500 °C, emite sobre todo hacia 0,5 µm; la Tierra, a ≈ 15 °C, hacia 10 µm.'],
      ['balance', 'El albedo planetario actual es de aproximadamente…', ['2 %', '10 %', '30 %', '60 %'], 2, 'La Tierra refleja ≈ 30 % de la radiación solar, sobre todo por las nubes.'],
      ['balance', 'El efecto invernadero se debe a que la atmósfera…', ['Refleja la radiación solar', 'Deja pasar la onda corta y absorbe buena parte de la onda larga que emite el suelo', 'Produce calor por sí misma', 'Bloquea la radiación ultravioleta'], 1, 'Los gases como el vapor de agua o el CO₂ absorben el infrarrojo terrestre y reemiten parte hacia el suelo.'],
      ['balance', 'Sin atmósfera, con el mismo albedo, la temperatura media de la superficie sería de unos…', ['+15 °C', '0 °C', '−18 °C', '−50 °C'], 2, 'Es la temperatura de equilibrio radiativo; el efecto invernadero añade ≈ 33 °C.'],
      ['balance', 'La mayor insolación en la superficie terrestre se registra…', ['En el ecuador', 'En los desiertos subtropicales', 'En los polos en verano', 'En latitudes medias'], 1, 'Cielos despejados y Sol alto: en el ecuador la nubosidad reduce mucho la energía que llega al suelo.'],
      ['tierramar', 'La amplitud térmica diaria es menor sobre el mar porque…', ['El mar recibe menos radiación', 'El agua almacena mucho calor, lo reparte en profundidad y cambia de temperatura despacio', 'El mar tiene un albedo muy alto', 'Sobre el mar no hay día ni noche'], 1, 'Capacidad calorífica, penetración de la luz y mezcla dan al mar una gran inercia térmica.'],
      ['tierramar', 'A una misma latitud, la amplitud térmica anual es mayor…', ['En la costa occidental de un continente', 'En el interior de un continente', 'En una isla', 'En pleno océano'], 1, 'Es la continentalidad: inviernos muy fríos y veranos cálidos.'],
      ['tierramar', 'En latitudes medias, las costas occidentales de los continentes tienen inviernos más suaves que las orientales por…', ['La mayor altitud', 'Los vientos del oeste de origen oceánico y las corrientes cálidas', 'La menor nubosidad', 'La rotación de la Tierra'], 1, 'Compárese A Coruña (11 °C en enero) con Vladivostok (−12 °C), a la misma latitud.'],
      ['diario', 'La temperatura máxima diaria se produce normalmente…', ['A mediodía solar', 'Unas 2–3 horas después del mediodía solar', 'Al ponerse el Sol', 'A medianoche'], 1, 'El suelo y el aire siguen ganando energía hasta primera hora de la tarde.'],
      ['diario', 'La temperatura mínima diaria suele registrarse…', ['A medianoche', 'Hacia la salida del Sol', 'A mediodía', 'Al ponerse el Sol'], 1, 'El enfriamiento por radiación continúa toda la noche.'],
      ['diario', 'Con una máxima de 28 °C y una mínima de 12 °C, la amplitud y la media diarias son…', ['16 °C y 20 °C', '40 °C y 20 °C', '16 °C y 16 °C', '20 °C y 16 °C'], 0, 'Amplitud = 28 − 12 = 16 °C; media ≈ (28 + 12)/2 = 20 °C.'],
      ['anual', 'El régimen térmico de un lugar se define con…', ['La temperatura de un día cualquiera', 'Las temperaturas medias mensuales de un periodo de al menos 30 años', 'La máxima absoluta registrada', 'La temperatura media anual'], 1, 'El periodo de referencia vigente es 1991–2020.'],
      ['anual', 'En el hemisferio norte, el mes más cálido en el interior de los continentes suele ser…', ['Junio', 'Julio', 'Septiembre', 'Diciembre'], 1, 'Hay un retraso de unas cuatro semanas respecto al solsticio; junto al mar, el máximo llega en agosto.'],
      ['anual', 'La amplitud térmica anual es mínima…', ['En Siberia', 'En el ecuador', 'En el Mediterráneo', 'En los polos'], 1, 'En el ecuador la insolación apenas cambia a lo largo del año: amplitudes de 1–3 °C.'],
      ['isotermas', 'Una isoterma es una línea que une puntos de igual…', ['Presión', 'Precipitación', 'Temperatura', 'Altitud'], 2, 'Isobaras, isoyetas e isohipsas son las de presión, precipitación y altitud.'],
      ['isotermas', 'Una estación a 800 m de altitud registra 13 °C. Su temperatura reducida al nivel del mar es…', ['13 °C', '18,2 °C', '7,8 °C', '21 °C'], 1, '13 + 0,65 × 8 = 18,2 °C (ejemplo del manual).'],
      ['isotermas', 'El ecuador térmico…', ['Coincide siempre con el ecuador geográfico', 'Se desplaza hacia el hemisferio en verano, sobre todo sobre los continentes', 'Está siempre en el hemisferio sur', 'Sigue el trópico de Cáncer todo el año'], 1, 'En julio se adentra mucho en el hemisferio norte por el recalentamiento del Sahara, Arabia y Asia.'],
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
