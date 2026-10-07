/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario final', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 3 completo'));
    const BANK = [
      ['isobaras', 'Una isobara une puntos de igual…', ['Temperatura', 'Presión reducida al nivel del mar', 'Altitud', 'Precipitación'], 1, 'Para compararlas, las presiones se reducen al nivel del mar.'],
      ['isobaras', 'La presión normal al nivel del mar es…', ['1.000 hPa', '1.013,25 hPa (760 mm de mercurio)', '1.015 hPa', '1.040 hPa'], 1, 'El manual da 1.015 mb, pero 760 mm de mercurio equivalen a 1.013,25 hPa.'],
      ['isobaras', 'Cerca del nivel del mar, la presión disminuye con la altura unos…', ['1 hPa cada 100 m', '12 hPa cada 100 m', '50 hPa cada 100 m', '0,65 hPa cada 100 m'], 1, 'Es decir, 1 hPa cada 8 m; a 2.000 m, unos 10 hPa cada 100 m.'],
      ['isobaras', 'Una vaguada es…', ['Una lengua de altas presiones', 'Una lengua de bajas presiones', 'Un anticiclón cerrado', 'Una zona de presión uniforme'], 1, 'Como media borrasca; la dorsal es lo contrario.'],
      ['isobaras', 'En un mapa de 500 hPa se representan…', ['Isobaras', 'Isohipsas: la altitud de la superficie de 500 hPa', 'Isotermas', 'Isoyetas'], 1, 'Valores altos de las isohipsas equivalen a altas presiones en altura.'],
      ['isobaras', 'Una DANA es…', ['Una borrasca profunda en superficie', 'Una baja cerrada y fría en niveles altos, desgajada de la circulación del oeste', 'Un anticiclón de bloqueo', 'Un frente frío'], 1, 'Depresión aislada en niveles altos: la antigua «gota fría». En superficie puede apenas notarse.'],
      ['viento', 'La dirección del viento es…', ['Hacia donde sopla', 'De donde viene', 'La de las isobaras', 'Siempre del oeste'], 1, 'Un viento del oeste sopla hacia el este.'],
      ['viento', 'Si las isobaras están muy juntas, el viento…', ['Es flojo', 'Es fuerte', 'No existe', 'Es siempre del norte'], 1, 'Mayor gradiente de presión, mayor velocidad.'],
      ['viento', 'En el hemisferio norte la fuerza de Coriolis desvía el aire…', ['Hacia la izquierda', 'Hacia la derecha', 'Hacia arriba', 'No lo desvía'], 1, 'Hacia la izquierda en el hemisferio sur; nula en el ecuador.'],
      ['viento', 'En la atmósfera libre, el viento sopla…', ['Perpendicular a las isobaras', 'Casi paralelo a las isobaras', 'Hacia las altas presiones', 'Siempre del este'], 1, 'Es el viento geostrófico: Coriolis equilibra al gradiente.'],
      ['viento', 'En el hemisferio norte, el aire en superficie en una borrasca…', ['Gira en sentido horario y sale', 'Gira en sentido antihorario y converge hacia el centro', 'Desciende', 'No se mueve'], 1, 'Convergencia en superficie y ascenso: nubes y precipitación.'],
      ['viento', 'Una caída del barómetro anuncia generalmente…', ['Tiempo estable', 'La llegada de una borrasca y tiempo inestable', 'Una ola de calor', 'Heladas'], 1, 'Ejercicio 3 del manual.'],
      ['circulacion', 'Los alisios del hemisferio norte soplan del…', ['Noreste', 'Noroeste', 'Sureste', 'Oeste'], 0, 'Van de las altas subtropicales a las bajas ecuatoriales, desviados a la derecha.'],
      ['circulacion', 'Entre los 30° y los 60° de latitud predominan…', ['Los alisios', 'Los vientos del oeste', 'Las calmas', 'Los vientos polares del este'], 1, 'Soplan de las altas subtropicales a las bajas subpolares.'],
      ['circulacion', 'El anticiclón de las Azores es…', ['Térmico e invernal', 'Dinámico y casi permanente', 'Una baja de verano', 'Continental'], 1, 'Se debe al aire que desciende en la célula de Hadley.'],
      ['circulacion', 'En julio, sobre el sur de Asia domina…', ['Un anticiclón térmico', 'Una baja térmica', 'El anticiclón de Siberia', 'La ZCIT en el hemisferio sur'], 1, 'El recalentamiento del continente y la ZCIT muy al norte: monzón.'],
      ['circulacion', 'La corriente en chorro es…', ['Un viento del este en superficie', 'Una franja de vientos del oeste muy rápidos en la alta troposfera', 'Una corriente marina', 'Un viento local'], 1, 'Hay dos: subtropical y polar.'],
      ['adiabatico', 'El aire no saturado que asciende se enfría unos…', ['0,5 °C cada 100 m', '1 °C cada 100 m', '0,1 °C cada 100 m', '6,5 °C cada 100 m'], 1, 'Gradiente adiabático seco: 0,98 °C/100 m.'],
      ['adiabatico', 'Con 22 °C y un punto de rocío de 14 °C, la base de las nubes convectivas estará hacia los…', ['250 m', '1.000 m', '3.000 m', '14 m'], 1, '125 × (22 − 14) = 1.000 m.'],
      ['adiabatico', 'El aire es condicionalmente inestable cuando el gradiente del entorno está…', ['Por debajo del húmedo', 'Entre el húmedo y el seco', 'Por encima del seco', 'En cero'], 1, 'Estable si no está saturado; inestable si llega a saturarse.'],
      ['adiabatico', 'El efecto foehn hace que a sotavento el aire llegue…', ['Más frío y húmedo', 'Más cálido y seco', 'Igual', 'Saturado'], 1, 'Perdió agua al precipitar en barlovento y desciende calentándose al ritmo seco.'],
      ['frentes', 'Las nubes de hielo más altas, en filamentos, son los…', ['Estratos', 'Cirros', 'Cúmulos', 'Nimbostratos'], 1, 'Entre 5 y 13 km en latitudes medias.'],
      ['frentes', 'La lluvia continua y moderada de un frente cálido cae de…', ['Cumulonimbos', 'Nimbostratos', 'Cirros', 'Cúmulos de buen tiempo'], 1, 'Los cumulonimbos dan los chubascos del frente frío.'],
      ['frentes', 'Al pasar un frente frío, la temperatura…', ['Sube', 'Baja', 'No cambia', 'Oscila sin tendencia'], 1, 'Entra aire polar; la presión empieza a subir y el viento gira al noroeste.'],
      ['frentes', 'En la oclusión…', ['El frente cálido alcanza al frío', 'El frente frío alcanza al cálido y el aire cálido queda en altura', 'Se forma una nueva borrasca', 'Desaparece el frente polar'], 1, 'Es la fase de madurez avanzada y comienzo de la disolución.'],
      ['precipitacion', 'La precipitación media mundial es de unos…', ['250 mm', '1.000 mm', '5.000 mm', '100 mm'], 1, 'Entre 950 y 1.050 mm según la fuente (el manual da 900).'],
      ['precipitacion', 'Los desiertos costeros de Atacama y Namib se deben sobre todo a…', ['Corrientes marinas frías y anticiclones subtropicales', 'La altitud', 'La lejanía del mar', 'El monzón'], 0, 'El aire marino, enfriado desde abajo, es muy estable.'],
      ['precipitacion', 'Sobre los océanos, en el balance anual del agua…', ['La precipitación supera a la evaporación', 'La evaporación supera a la precipitación', 'Son iguales', 'No hay evaporación'], 1, 'El exceso de vapor llueve sobre los continentes y vuelve por los ríos.'],
      ['regimenes', 'Un régimen con dos máximos de lluvia hacia los equinoccios es…', ['Mediterráneo', 'Ecuatorial', 'Continental', 'Monzónico'], 1, 'La convergencia intertropical pasa dos veces al año.'],
      ['regimenes', 'El régimen mediterráneo tiene…', ['El máximo en verano', 'El verano seco', 'Lluvia constante', 'Dos estaciones lluviosas tropicales'], 1, 'Dominio del anticiclón subtropical en verano.'],
      ['regimenes', 'En un climograma de Gaussen un mes es seco si…', ['P < 2T', 'P < T', 'P < 100 mm', 'T > 20 °C'], 0, 'La barra de lluvia queda bajo la curva de temperatura.'],
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
