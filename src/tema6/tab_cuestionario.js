/* ===================== CUESTIONARIO FINAL ===================== */
H.tab({
  id: 'cuestionario', nav: 'Cuestionario', title: 'Cuestionario final',
  init(el) {
    el.append(H.intro('Repaso del tema', 'Cuestionario final',
      'Veinte preguntas sobre todo el tema, en orden aleatorio. Responde todas y pulsa «Corregir»: verás la puntuación, la explicación de cada pregunta y un enlace al interactivo donde repasarla.',
      'Tema 6 completo'));
    const BANK = [
      ["mosaico", "La zona intertropical ocupa, aproximadamente,…", ["El 20 % de las tierras emergidas", "Más de un tercio de las tierras emergidas", "La mitad de las tierras emergidas", "Menos del 10 % de las tierras"], 1, "En torno al 35 % con la Antártida; el manual dice el 20 %."],
      ["mosaico", "Entre 30° y 40° de latitud, en la fachada occidental de los continentes, domina el clima…", ["Chino", "Mediterráneo", "Continental", "Oceánico"], 1, "El anticiclón subtropical domina allí el verano."],
      ["mosaico", "Los climas continentales y subárticos (D) son casi exclusivos del hemisferio norte porque…", ["El sur recibe menos radiación", "Al sur faltan continentes entre 40° y 65°", "El frente polar no llega al sur", "Las corrientes cálidas los impiden"], 1, "Sin grandes continentes, el océano suaviza los inviernos."],
      ["intertropicales", "En la zona intertropical las estaciones las marca sobre todo…", ["La temperatura", "La precipitación", "La duración del día", "El viento"], 1, "Todos los meses superan los 18 °C; lo que cambia es la lluvia."],
      ["intertropicales", "Un clima A cuyo mes más seco recibe 70 mm es…", ["Af", "Am", "Aw", "BSh"], 0, "Con 60 mm o más en el mes más seco, Af."],
      ["intertropicales", "La línea 100 − P/25 de la fig. 6.2 separa…", ["Af de Am", "Am de Aw", "Aw de BSh", "A de C"], 1, "Por encima de ella, la lluvia anual compensa la estación seca (Am)."],
      ["intertropicales", "La lluvia anual de la mitad de las celdas de selva (Af) está entre…", ["500 y 1.000 mm", "2.200 y 3.200 mm", "1.000 y 1.500 mm", "5.000 y 8.000 mm"], 1, "La mediana es de unos 2.650 mm; el manual da 1.500-2.000."],
      ["intertropicales", "Al alejarse del ecuador hacia los trópicos, la estación seca…", ["Desaparece", "Se alarga", "Se traslada al verano", "No cambia"], 1, "Es el paso de la selva a la sabana y a la estepa."],
      ["intertropicales", "Chromow definió las regiones monzónicas por…", ["Una lluvia anual de más de 2.000 mm", "Un giro del viento de al menos 120° entre estaciones", "Una temperatura media de más de 25 °C", "La presencia de ciclones tropicales"], 1, "El monzón es, ante todo, un cambio estacional de rumbo del viento."],
      ["intertropicales", "El monzón de invierno en la India es un viento…", ["Del suroeste y húmedo", "Del nordeste, continental y seco", "Del oeste, con borrascas", "Del sur, que cruza el ecuador"], 1, "Sale del anticiclón térmico siberiano: es la estación seca."],
      ["subtropicales", "Nueva York y San Francisco, casi a la misma latitud, tienen climas distintos porque…", ["Uno está a más altitud", "Están en fachadas opuestas del continente", "Uno está en el hemisferio sur", "Uno recibe monzones"], 1, "San Francisco, fachada occidental (Csb); Nueva York, oriental (Cfa)."],
      ["subtropicales", "Csa y Csb se diferencian por…", ["La lluvia de invierno", "La temperatura del mes más cálido", "Las corrientes marinas", "La duración de la sequía"], 1, "Con 22 °C o más en el mes más cálido, a; con menos, b."],
      ["subtropicales", "El clima chino en Asia tiene inviernos más secos que en América porque…", ["El monzón de verano es más débil", "El anticiclón siberiano es más fuerte que el canadiense", "Recibe más ciclones tropicales", "Está más cerca del ecuador"], 1, "El aire continental de Siberia frena las borrascas invernales."],
      ["subtropicales", "La «beta dálmata» del cuadro 6.7 es en realidad…", ["La bora", "El siroco", "El mistral", "El levante"], 0, "Un viento frío del nordeste que cae sobre la costa dálmata."],
      ["subtropicales", "En el balance hídrico del clima mediterráneo, el déficit de agua se concentra en…", ["El invierno", "El verano", "El otoño", "La primavera"], 1, "La mayor evapotranspiración coincide con la menor lluvia."],
      ["subtropicales", "Los ríos más irregulares de la zona templada, con estiaje y crecidas súbitas de otoño, son los…", ["Oceánicos", "Mediterráneos", "Continentales", "Del clima chino"], 1, "Sequía estival y lluvias torrenciales de otoño."],
      ["oceanico", "Con las normales 1991-2020, Lyon tiene un clima…", ["Cfb, oceánico", "Cfa, subtropical húmedo", "Dfb, continental", "Csb, mediterráneo"], 1, "Su mes más cálido llega a 22,6 °C."],
      ["oceanico", "Brest y Gander están a la misma latitud; Gander tiene inviernos mucho más fríos porque…", ["Está a más altitud", "Le llegan el viento del continente y una corriente fría", "Llueve menos", "Está más al norte"], 1, "Brest recibe el aire del océano templado por la deriva noratlántica."],
      ["oceanico", "Según la fig. 6.14, al aumentar la continentalidad…", ["Disminuye la amplitud térmica", "Aumentan la amplitud y la lluvia de verano", "La lluvia pasa al invierno", "El invierno se suaviza"], 1, "El anticiclón térmico invernal bloquea las borrascas; el verano trae convección."],
      ["oceanico", "Con las normales 1991-2020, Ulán Bator es…", ["Dwb", "BSk", "Dfc", "ET"], 1, "Sus 273 mm no alcanzan el umbral de aridez."],
      ["oceanico", "Los chernozems, o tierras negras, se forman bajo…", ["La taiga", "La pradera de los climas continentales", "La selva ecuatorial", "El bosque mediterráneo"], 1, "Las raíces de las gramíneas acumulan un horizonte de humus muy espeso."],
      ["polares", "El límite entre la tundra y la taiga coincide aproximadamente con…", ["El círculo polar", "La isoterma de 10 °C del mes más cálido", "El paralelo 70°", "La isoterma de 0 °C del mes más frío"], 1, "Por debajo de 10 °C en el mes más cálido no crecen árboles."],
      ["polares", "La isoterma de 10 °C del mes más cálido llega más al sur en…", ["Noruega", "La bahía de Hudson y el Labrador", "Siberia central", "Escocia"], 1, "Corrientes frías y un mar helado hasta el verano."],
      ["polares", "La tundra oceánica de Nuuk recibe al año unos…", ["100 mm", "875 mm", "250 mm", "2.500 mm"], 1, "Mucho más que los «menos de 250 mm» del cuadro 6.11."],
      ["polares", "El casquete antártico se formó…", ["En la última glaciación", "Hace unos 34 millones de años", "En el Holoceno", "En la Pequeña Edad del Hielo"], 1, "En el tránsito del Eoceno al Oligoceno."],
      ["polares", "En el solsticio de verano, el polo recibe en el techo de la atmósfera…", ["Menos radiación que el ecuador", "Más radiación que el ecuador", "Ninguna radiación", "La misma que en invierno"], 1, "El Sol no se pone, pero está bajo y la nieve refleja buena parte."],
      ["polares", "Un clima con todos los meses por debajo de 0 °C es…", ["ET", "EF", "Dfd", "BWk"], 1, "Hielo perpetuo."],
      ["vegetacion", "Los manglares faltan en las costas de Perú y Namibia porque…", ["No hay mareas", "Las corrientes frías enfrían el mar", "Son costas muy lluviosas", "Están en latitudes templadas"], 1, "Necesitan aguas cálidas todo el año."],
      ["vegetacion", "La vegetación esclerófila, de hoja pequeña, dura y perenne, es propia del clima…", ["Oceánico", "Mediterráneo", "Ecuatorial", "Subártico"], 1, "Resiste la sequía del verano: encinas, alcornoques, acebuches."],
      ["vegetacion", "Los suelos de la selva ecuatorial son…", ["Muy fértiles, con mucho humus", "Pobres, muy lavados y ricos en óxidos de hierro", "Negros, con mucho calcio", "Helados en profundidad"], 1, "Ferralsoles: los nutrientes están en la vegetación, no en el suelo."],
      ["vegetacion", "El horizonte blanquecino del podzol se debe a…", ["La acumulación de cal", "El lavado por ácidos orgánicos", "La ceniza de incendios", "La sal del mar"], 1, "La hojarasca ácida arrastra el hierro y el aluminio hacia abajo."],
      ["identifica", "Un climograma con 27 °C todo el año y más de 100 mm todos los meses corresponde al clima…", ["Monzónico", "Ecuatorial", "De sabana", "Chino"], 1, "Sin estación seca y siempre cálido: Af."],
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
