/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 5 completo'));
    const BANK = [
      ['clasificar', 'El clima de un lugar se define con…', ['Las observaciones de un año reciente', 'Las medias de una serie de al menos 30 años', 'El tiempo de un día representativo', 'Los valores extremos registrados'], 1, 'La normal vigente de la OMM es 1991-2020.'],
      ['clasificar', 'Una clasificación genética se basa en…', ['Umbrales de temperatura y precipitación', 'Las masas de aire y la circulación general', 'Las exigencias de los cultivos', 'El nombre de una región tipo'], 1, 'Como la de Petterssen (fig. 5.1).'],
      ['clasificar', 'La clasificación de Papadakis es…', ['Genética: se basa en las masas de aire', 'Ecológica: se basa en los cultivos', 'Geográfica: usa nombres de regiones', 'Térmica: solo usa la temperatura'], 1, 'Se usó en el Mapa de Cultivos y Aprovechamientos de España.'],
      ['clasificar', 'La escala regional del clima abarca espacios de…', ['Metros', '100 m a 10 km', '200 a 2.000 km', 'Todo el planeta'], 2, 'Contrastes tierra-mar, grandes relieves, fachadas.'],
      ['clasificar', 'Dos lugares con la misma temperatura media anual…', ['Tienen siempre el mismo clima', 'Pueden tener climas distintos', 'Están a la misma latitud', 'Tienen la misma precipitación'], 1, 'La amplitud térmica y el régimen de lluvias pueden ser muy distintos: por eso Köppen usa los valores de cada mes.'],
      ['koppen', 'En Köppen, el grupo A exige que…', ['Llueva más de 1.000 mm', 'El mes más frío llegue a 18 °C', 'El mes más cálido supere 30 °C', 'No haya estación seca'], 1, 'Sin invierno térmico.'],
      ['koppen', 'Un clima es E si…', ['El mes más frío baja de −3 °C', 'El mes más cálido no llega a 10 °C', 'Llueve menos de 250 mm', 'Está a más de 3.000 m'], 1, '10 °C en el mes más cálido es, aproximadamente, el límite del árbol.'],
      ['koppen', 'La letra s significa…', ['Invierno seco', 'Verano seco', 'Clima seco (estepa)', 'Lluvia todo el año'], 1, 'El mes más seco del verano recibe menos de 30 mm (40 en los mapas actuales) y menos de un tercio que el más lluvioso del invierno. El manual la define mal en la p. 10 (70 % de la lluvia en invierno), pero bien en el cuadro 6.5.'],
      ['koppen', 'La letra a significa…', ['Clima árido o seco', 'Mes más cálido ≥ 22 °C', 'Clima de alta montaña', 'Lluvia todo el año'], 1, 'Csa (Sevilla) frente a Csb (Burgos).'],
      ['koppen', 'Am se distingue de Aw porque…', ['Tiene más amplitud térmica anual', 'Su mes más seco recibe ≥ 100 − P/25 mm', 'Es más fresco por la altitud', 'Solo existe en el sudeste asiático'], 1, 'La lluvia anual compensa la estación seca; es el diagrama de la fig. 6.2.'],
      ['koppen', 'Con los criterios del manual y las normales 1991-2020, Vitoria-Gasteiz sale…', ['Cfb', 'Csb', 'BSk', 'Dfb'], 1, 'Agosto recibe 28 mm, menos de 30 y menos de un tercio de noviembre.'],
      ['koppen', 'El límite entre los climas C y D está en…', ['18 °C del mes más frío', '−3 °C del mes más frío', '10 °C del mes más cálido', '22 °C del mes más cálido'], 1, 'Es el umbral de Köppen (1936) y del manual; muchos mapas actuales usan 0 °C. Con 0 °C, Varsovia pasa de Cfb a Dfb.'],
      ['secos', 'El umbral de aridez de Köppen aumenta…', ['Con la latitud y la distancia al mar', 'Con la temperatura y la lluvia de verano', 'Con la altitud y la presión atmosférica', 'Con la humedad relativa y la nubosidad'], 1, 'e = 20t + 490 − 7·PPW.'],
      ['secos', 'Yakutsk recibe 233 mm al año y…', ['Es un desierto frío (BWk)', 'No es un clima seco', 'Es una estepa fría (BSk)', 'Es una estepa cálida (BSh)'], 1, 'Con −8 °C de media apenas se evapora el agua: su umbral es de unos 120 mm, y es Dfc.'],
      ['secos', 'BW se distingue de BS porque…', ['Es más cálido que la estepa', 'Recibe menos de la mitad de e', 'Tiene la lluvia en verano', 'Está en el hemisferio sur'], 1, 'Desierto frente a estepa: el desierto no llega a la mitad del umbral de aridez.'],
      ['secos', 'Atacama y el Namib son desiertos…', ['De latitudes medias, por continentalidad', 'Costeros, de corriente fría', 'Polares, por el frío extremo', 'De montaña, por la altitud'], 1, 'Corrientes frías y anticiclones subtropicales: el mar está varios grados más frío que la media de su latitud.'],
      ['secos', 'El desierto de Gobi se explica sobre todo por…', ['La corriente fría de Humboldt', 'La continentalidad y el relieve', 'Los alisios del nordeste', 'La altitud de los Andes'], 1, 'La lejanía del mar, las montañas que lo rodean y el anticiclón siberiano. Es un desierto frío (BWk).'],
      ['secos', 'El índice de aridez del PNUMA (UNEP) compara…', ['Temperatura media y altitud del lugar', 'Precipitación y evapotranspiración potencial', 'Lluvia de verano y lluvia de invierno', 'Presión atmosférica y viento dominante'], 1, 'P/ETP < 0,65 define las tierras secas.'],
      ['montana', 'La temperatura baja con la altura, por término medio, unos…', ['0,65 °C cada 100 m', '1 °C cada 10 m', '0,1 °C cada 100 m', '6,5 °C cada 100 m'], 0, 'En las estaciones reales varía con la estación del año y las inversiones.'],
      ['montana', 'En las montañas ecuatoriales…', ['Hay inviernos largos y fríos', 'La amplitud anual es mínima', 'Nunca hay nieve en las cumbres', 'La umbría recibe el triple que la solana'], 1, 'Conservan los rasgos de su zona: los pisos se definen por la temperatura media (Caldas).'],
      ['montana', 'La diferencia entre solana y umbría es mayor…', ['En el ecuador', 'En latitudes altas y en invierno', 'En verano en los trópicos', 'Igual en todas las latitudes'], 1, 'Con el Sol bajo, la umbría puede quedar en sombra semanas.'],
      ['montana', 'Según Caldas, Bogotá (2.547 m, unos 14 °C) está en el piso…', ['Cálido', 'Templado', 'Frío', 'Páramo alto'], 2, 'Piso frío: 17,5 °C > T ≥ 12 °C.'],
      ['montana', 'Entre Navacerrada y Madrid el gradiente térmico es mayor…', ['En invierno, por el frío', 'En primavera y verano', 'Igual todo el año', 'De noche, con calma'], 1, 'Como dice el cuadro 5.3.'],
      ['mapa', 'Los climas mediterráneos (Cs) ocupan…', ['Las fachadas orientales subtropicales', 'Las fachadas occidentales entre 30° y 45°', 'El interior de Asia', 'La zona ecuatorial'], 1, 'California, Chile, el Cabo, el suroeste de Australia y el Mediterráneo.'],
      ['mapa', 'El grupo de climas más extenso en tierra firme es…', ['A', 'B', 'C', 'E'], 1, 'Los climas secos, cerca de un tercio de las tierras emergidas.'],
      ['espana', 'El tipo de clima más frecuente entre los municipios españoles es…', ['Cfb', 'Csa', 'BWh', 'Dfb'], 1, 'Domina en la mitad sur y en el litoral mediterráneo; en el valle del Ebro predominan BSk y Cfa.'],
      ['espana', 'Entre 1961-1990 y 1991-2020 muchos municipios han pasado de Csb a Csa porque…', ['Ahora llueve más en verano', 'El mes más cálido supera ya 22 °C', 'Ha bajado la temperatura media', 'Ha cambiado el criterio de Köppen'], 1, 'Es la huella del calentamiento de los veranos.'],
      ['tiempo', 'El Último Máximo Glaciar fue hace unos…', ['2.000 años', '21.000 años', '200.000 años', '2,6 millones de años'], 1, 'Los «18.000 años» del manual son años de radiocarbono.'],
      ['tiempo', 'Durante el Último Máximo Glaciar la temperatura global era unos…', ['0,5 °C más baja que hoy', '6-7 °C más baja que la preindustrial', '20 °C más baja en todo el planeta', 'Igual que la actual'], 1, 'Con mucho más frío sobre los mantos de hielo que en los trópicos.'],
      ['tiempo', 'La normal 1991-2020 es, en el conjunto del planeta, unos…', ['0,5 °C más cálida que 1961-1990', '2 °C más cálida que 1961-1990', 'Igual que la de 1961-1990', '0,5 °C más fría que 1961-1990'], 0, 'Según HadCRUT5.'],
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
