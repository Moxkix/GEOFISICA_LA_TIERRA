/* ===================== ? · IDENTIFICA EL CLIMA ===================== */
H.tab({
  id: 'identifica', nav: 'Identifica el clima', title: 'Identifica el clima',
  init(el) {
    el.append(H.intro('Ejercicio 4 y actividades complementarias', 'Identifica el clima a partir de sus datos',
      'Un climograma real, sin nombre, de una estación de las normales 1991-2020 de la OMM. Fíjate en la temperatura del mes más frío y del más cálido, en la amplitud, en cuánto llueve y en qué estación: ¿qué clima zonal es? Después, el viaje de vacaciones que propone el manual entre Innsbruck, El Cairo y Nueva Orleans.',
      'Manual: ejercicio de autoevaluación 4<br>y actividades complementarias'));
    el.append(T5.optCtrl());

    /* =============== 1 · el juego =============== */
    const POOL = T5.ST.filter((s) => s.ta && s.pr);
    const G = { s: null, n: 0, ok: 0, done: false, last: [] };
    const cc = T6.climoCard();
    const hint = H.h('p', { class: 'small' });
    const btns = H.h('div', { class: 'zleg', style: { marginTop: '6px' } });
    const fb = H.h('div');
    const score = H.h('span', { class: 'score' }, '0 / 0');
    const pick = () => {
      // tres de cada cuatro, del mundo; una, de España
      const es = Math.random() < 0.25, cand = POOL.filter((s) => s.es === es && !G.last.includes(s.id));
      G.s = cand[Math.floor(Math.random() * cand.length)]; G.last = [G.s.id].concat(G.last).slice(0, 25); G.done = false;
      const s = G.s;
      cc.set({ T: s.ta.slice(0, 12), P: s.pr.slice(0, 12), lat: s.lat, title: 'Estación misteriosa', sub: `${s.lat >= 0 ? 'hemisferio norte' : 'hemisferio sur'} · ${H.f(s.elev)} m` });
      H.$$('.cc-type, .cc-num', cc).forEach((e) => { e.style.visibility = 'hidden'; });
      hint.textContent = `Pista: está en el ${s.lat >= 0 ? 'hemisferio norte' : 'hemisferio sur'}, a ${H.f(s.elev)} m de altitud.`;
      fb.innerHTML = ''; drawBtns();
    };
    const drawBtns = () => {
      btns.innerHTML = '';
      for (const k of T6.KEYS) {
        const b = H.h('button', { type: 'button', html: `<i style="background:${T6.css(k)}"></i>${T6.ZON[k].s}` });
        b.onclick = () => answer(k, b); btns.append(b);
      }
    };
    const answer = (k, b) => {
      if (G.done) return; G.done = true; G.n++;
      const s = G.s, r = T5.cls(s), z = T6.zonal(r.type), good = k === z; if (good) G.ok++;
      score.textContent = `${G.ok} / ${G.n}`;
      H.$$('button', btns).forEach((x) => { x.disabled = true; });
      b.classList.add('on');
      H.$$('.cc-type, .cc-num', cc).forEach((e) => { e.style.visibility = 'visible'; });
      const st = T6.stats(s.ta.slice(0, 12), s.pr.slice(0, 12), s.lat);
      const why = [];
      if (z === 'sec') why.push(`la precipitación (${H.f(st.Pann)} mm) no llega al umbral de aridez`);
      else if (r.type[0] === 'A') why.push(`todos los meses superan 18 °C (el más frío, ${T5.fT(st.Tmin)})`, st.Pdry >= 60 ? 'llueve todos los meses más de 60 mm' : `el mes más seco recibe ${T5.fMM(st.Pdry)}`);
      else if (r.type[0] === 'E') why.push(`el mes más cálido no llega a 10 °C (${T5.fT(st.Tmax)})`);
      else {
        why.push(`el mes más frío tiene ${T5.fT(st.Tmin)} (${r.type[0] === 'C' ? 'por encima' : 'por debajo'} del umbral C/D) y el más cálido ${T5.fT(st.Tmax)}`);
        why.push(r.type[1] === 's' ? 'el verano es seco' : r.type[1] === 'w' ? 'el invierno es seco' : 'llueve todo el año');
      }
      fb.innerHTML = `<div class="fb show ${good ? 'ok' : 'ko'}" style="display:block"><b>${good ? 'Correcto.' : 'No es correcto.'}</b> Es <b>${T5.stLabel(s)}</b>, ${T6.both(r.type)}, porque ${why.join(' y ')}. Amplitud anual: ${H.f(st.amp, 1)} °C.</div>`;
      const d = H.h('details', { class: 'open-q', style: { marginTop: '8px' } }, H.h('summary', {}, 'Ver la clasificación paso a paso'), T5.trace(r)); fb.append(d);
      const next = H.h('button', { class: 'btn acc sm', type: 'button', style: { marginTop: '8px' } }, 'Otro climograma →'); next.onclick = pick; fb.append(next);
    };
    const gCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'El climograma misterioso ', score),
      H.h('div', { class: 'grid2' }, H.h('div', {}, cc, hint), H.h('div', {}, H.h('p', { class: 'small' }, '¿Qué clima es? Recuerda los criterios: más de 18 °C todos los meses, zona cálida; el mes más cálido por debajo de 10 °C, zona fría; entre medias, la templada, y en cualquier zona, seco si la lluvia no alcanza el umbral de aridez.'), btns, fb)));
    pick();

    /* =============== 2 · las vacaciones (actividad complementaria) =============== */
    const CITIES = [['11120', 'Innsbruck'], ['62366', 'El Cairo'], ['72231', 'Nueva Orleans']];
    const cards = CITIES.map(([id]) => { const c = T6.climoCard(); const s = T5.byId(id); c.set(Object.assign(T6.fromSt(s), { extra: () => `máximas de ${T5.fT(Math.min(...s.tx.slice(0, 12)), 0)} a ${T5.fT(Math.max(...s.tx.slice(0, 12)), 0)}` })); return c; });
    const PER = [['nav', 'Navidad', [11, 0]], ['ss', 'Semana Santa', [2, 3]], ['ver', 'Verano (julio-agosto)', [6, 7]]];
    const sels = {};
    const tbl = H.h('table', { class: 't' });
    const mean = (a, ms) => ms.reduce((x, m) => x + a[m], 0) / ms.length;
    tbl.innerHTML = `<thead><tr><th>Fechas</th>${CITIES.map(([id, n]) => `<th>${n}</th>`).join('')}<th>Tu elección</th></tr></thead>`;
    const tb = H.h('tbody');
    for (const [k, n, ms] of PER) {
      const tr = H.h('tr', {}, H.h('td', {}, H.h('b', {}, n)));
      for (const [id] of CITIES) { const s = T5.byId(id); tr.append(H.h('td', { class: 'small' }, `máx. ${T5.fT(mean(s.tx, ms), 0)} · mín. ${T5.fT(mean(s.tn, ms), 0)} · ${H.f(ms.reduce((x, m) => x + s.pr[m], 0) / ms.length)} mm/mes`)); }
      const sel = H.h('select', {}); sel.append(H.h('option', { value: '' }, 'Elige…')); CITIES.forEach(([, c]) => sel.append(H.h('option', { value: c }, c))); sels[k] = sel;
      tr.append(H.h('td', {}, sel)); tb.append(tr);
    }
    tbl.append(tb);
    const vOut = H.h('div');
    const chk = H.h('button', { class: 'btn acc sm', type: 'button' }, 'Comprobar');
    const PROP = {
      nav: ['El Cairo', 'En diciembre y enero El Cairo tiene máximas de unos 20 °C, sol y casi ninguna lluvia. Innsbruck está bajo cero por la noche (la elección si lo que buscas es esquiar) y Nueva Orleans es templada pero lluviosa, con más de 120 mm al mes.'],
      ss: ['El Cairo', 'En marzo y abril El Cairo tiene 24-28 °C de máxima sin lluvia, antes del calor extremo; Nueva Orleans también es agradable (22-26 °C), aunque llueve más de 100 mm al mes; Innsbruck sale apenas del invierno.'],
      ver: ['Innsbruck', 'En julio y agosto las máximas llegan a 33-35 °C en El Cairo y Nueva Orleans, y Nueva Orleans, con su humedad y el comienzo de la temporada de huracanes, es bochornosa. Innsbruck, a 578 m en los Alpes, tiene máximas de unos 24 °C, aunque con tormentas por la tarde: es su estación más lluviosa.'],
    };
    chk.onclick = () => {
      vOut.innerHTML = PER.map(([k, n]) => { const v = sels[k].value, [p, t] = PROP[k]; return `<p class="small"><b>${n}:</b> ${v ? (v === p ? '✓ ' : `tu elección, ${v}; la propuesta, `) : 'sin elegir; la propuesta, '}<b>${p}</b>. ${t}</p>`; }).join('') +
        '<p class="small">Los climas: Innsbruck, oceánico degradado hacia el continental (Cfb con −3 °C, Dfb con 0 °C), por su posición en el interior de los Alpes; El Cairo, desierto cálido (BWh), por el anticiclón subtropical y la lejanía de las fuentes de humedad; Nueva Orleans, subtropical húmedo (Cfa), en la fachada oriental de Norteamérica, con aire tropical del golfo de México.</p>';
    };
    const vCard = H.h('div', { class: 'card' }, H.h('h3', {}, '¿Innsbruck, El Cairo o Nueva Orleans?'),
      H.h('p', { class: 'sub' }, 'La actividad complementaria del manual: elige el mejor destino, por su clima, para Navidad, Semana Santa y el verano. En la tabla, las medias de las máximas y mínimas diarias y la lluvia de esos meses (OMM 1991-2020).'),
      H.h('div', { class: 'grid3' }, ...cards), H.h('div', { style: { overflowX: 'auto', marginTop: '10px' } }, tbl), chk, vOut);

    el.append(gCard, vCard);
  },
});
