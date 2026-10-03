/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario final', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 1 completo'));
    const BANK = [
      ['forma', '¿Qué científico calculó la circunferencia terrestre en el siglo III a. C. a partir de la sombra de un gnomon?', ['Aristóteles', 'Eratóstenes', 'Ptolomeo', 'Copérnico'], 1, 'Eratóstenes comparó la sombra en Alejandría con la ausencia de sombra en Siena el día del solsticio de verano.'],
      ['forma', 'El radio medio terrestre adoptado internacionalmente es de unos…', ['6.357 km', '6.371 km', '6.378 km', '12.742 km'], 1, '6.371,0 km (UGGI). 6.378 km es el semieje ecuatorial y 6.357 km el polar; 12.742 km es el diámetro medio.'],
      ['forma', 'La superficie de referencia para medir las altitudes sobre el nivel del mar es…', ['La esfera', 'El elipsoide', 'El geoide', 'El plano del horizonte'], 2, 'El geoide coincide con el nivel medio del mar en calma prolongado bajo los continentes.'],
      ['insolacion', 'La razón principal por la que las latitudes altas reciben menos energía solar por unidad de superficie es…', ['Que están más lejos del Sol', 'Que los rayos llegan más oblicuos', 'Que tienen más nubes', 'Que giran más despacio'], 1, 'Un mismo haz se reparte sobre más superficie y atraviesa más atmósfera cuanto más oblicuo llega.'],
      ['insolacion', 'La Tierra pasa por el perihelio (máxima proximidad al Sol)…', ['A comienzos de enero', 'En el solsticio de junio', 'A comienzos de julio', 'En el equinoccio de marzo'], 0, 'Entre el 2 y el 5 de enero, en pleno invierno boreal: la distancia no explica las estaciones.'],
      ['coordenadas', 'La latitud de un punto puede tomar valores…', ['De 0° a 180° E u O', 'De 0° a 90° N o S', 'De 0° a 360°', 'De 0° a 66° 34′'], 1, 'La latitud se mide desde el Ecuador (0°) hasta los polos (90° N o S).'],
      ['coordenadas', 'Todos los puntos de un mismo paralelo tienen igual…', ['Longitud', 'Latitud', 'Hora solar', 'Altitud'], 1, 'Un paralelo une puntos de igual latitud; un meridiano, puntos de igual longitud y, por tanto, igual hora solar.'],
      ['coordenadas', '¿Cuánto mide aproximadamente un grado de un paralelo en el Ecuador?', ['55,8 km', '96,5 km', '111,3 km', '1.670 km'], 2, '111,32 km. Se acorta con el coseno de la latitud hasta 0 en los polos.'],
      ['hora', 'Un lugar situado a 30° E de Greenwich tiene, respecto a Greenwich, una hora solar…', ['2 horas más temprana', '2 horas más tardía', '30 minutos más tardía', 'Igual'], 1, '30° / 15° por hora = 2 h. Hacia el este es más tarde.'],
      ['hora', '¿Qué hora oficial tiene la España peninsular en invierno?', ['UTC+0', 'UTC+1', 'UTC+2', 'UTC−1'], 1, 'UTC+1 desde 1940, aunque geográficamente está casi entera en el huso 0. En verano usa UTC+2.'],
      ['hora', 'La línea internacional de cambio de fecha sigue aproximadamente el meridiano…', ['0°', '90° E', '180°', '90° O'], 2, 'Sigue el meridiano 180° con quiebros acordados por los Estados del Pacífico.'],
      ['coriolis', 'El efecto de Coriolis desvía los cuerpos en movimiento en el hemisferio sur…', ['Hacia la derecha', 'Hacia la izquierda', 'Hacia el Ecuador', 'No los desvía'], 1, 'A la izquierda en el hemisferio sur y a la derecha en el norte.'],
      ['estaciones', '¿Cuál es el valor actual de la inclinación del eje terrestre respecto a la perpendicular al plano de la eclíptica?', ['21° 30′', '23° 26′', '24° 30′', '66° 34′'], 1, '23° 26′ (23,44°). 66° 34′ es el ángulo entre el eje y el plano de la órbita, y la latitud de los círculos polares.'],
      ['estaciones', 'En los equinoccios, el Sol está en la vertical de…', ['El trópico de Cáncer', 'El Ecuador', 'El trópico de Capricornio', 'Los polos'], 1, 'La declinación es 0° y el círculo de iluminación pasa por los polos.'],
      ['estaciones', 'En el solsticio de diciembre, ¿qué ocurre en el círculo polar antártico?', ['Noche de 24 horas', 'Día de 24 horas', 'Día y noche de 12 horas', 'El Sol está en el cénit'], 1, 'Es verano austral: al sur del círculo polar antártico el Sol no se pone.'],
      ['estaciones', 'La zona intertropical se caracteriza porque…', ['Hay seis meses de día y seis de noche', 'El Sol llega a la vertical al menos una vez al año', 'Las estaciones térmicas son muy marcadas', 'Los rayos llegan siempre muy oblicuos'], 1, 'Entre los trópicos el Sol pasa por el cénit (dos veces al año, una en los propios trópicos).'],
      ['proyecciones', 'Una proyección que conserva las superficies se denomina…', ['Conforme', 'Equivalente', 'Equidistante', 'Gnomónica'], 1, 'Equivalente. Las conformes conservan los ángulos y las equidistantes ciertas distancias.'],
      ['proyecciones', 'La proyección UTM, usada en el Mapa Topográfico Nacional, es…', ['Cónica conforme', 'Cilíndrica transversa conforme', 'Acimutal equivalente', 'Pseudocilíndrica equivalente'], 1, 'Transversa de Mercator: cilindro tangente (secante, en la práctica) a un meridiano, en husos de 6°.'],
      ['proyecciones', 'En la proyección de Mercator, Groenlandia aparece aproximadamente tan grande como África porque…', ['Groenlandia es casi tan grande como África', 'La proyección exagera las superficies en latitudes altas', 'Es una proyección equivalente', 'Se usa una escala distinta para cada continente'], 1, 'Mercator es conforme y amplía las superficies con la latitud. África es unas 14 veces mayor que Groenlandia.'],
      ['escala', 'En un mapa a escala 1:25.000, 4 cm representan…', ['100 m', '1 km', '10 km', '25 km'], 1, '4 × 25.000 = 100.000 cm = 1 km.'],
      ['escala', 'Un mapa 1:10.000 frente a uno 1:100.000 es de…', ['Menor escala y más detalle', 'Mayor escala y más detalle', 'Mayor escala y menos detalle', 'La misma escala'], 1, 'Menor denominador = mayor escala = más detalle de un territorio más pequeño.'],
      ['escala', 'Si en un mapa 1:50.000 una finca mide 2 cm², su superficie real es…', ['10 ha', '50 ha', '100 ha', '500 ha'], 1, '2 cm² × (500 m/cm)² = 2 × 250.000 m² = 500.000 m² = 50 ha.'],
      ['relieve', 'Las curvas de nivel también se llaman…', ['Isobaras', 'Isotermas', 'Isohipsas', 'Isoyetas'], 2, 'Isohipsas: de iso (igual) e hypsos (altura).'],
      ['relieve', 'En mapas de escala muy pequeña, el relieve suele representarse mediante…', ['Curvas de nivel cada 5 m', 'Tintas hipsométricas', 'Fotografías aéreas', 'Cotas aisladas solamente'], 1, 'Con escalas pequeñas las curvas se apelotonan; se colorean los intervalos de altitud (tintas hipsométricas), a menudo con sombreado.'],
      ['relieve', 'Un desnivel de 100 m en 500 m de distancia horizontal supone una pendiente de…', ['5 %', '20 %', '50 %', '500 %'], 1, '100 / 500 × 100 = 20 %.'],
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
