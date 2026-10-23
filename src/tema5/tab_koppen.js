/* ===================== K · CLASIFICADOR DE KÖPPEN ===================== */
H.tab({
  id: 'koppen', nav: 'Clasificador de Köppen', title: 'Clasificador de Köppen paso a paso',
  init(el) {
    el.append(H.intro('Clasificación de Köppen · recuadro de las pp. 9-10 y cuadros 5.1, 6.1, 6.5 y 6.10', 'El clasificador de Köppen, paso a paso',
      'Köppen clasifica con 24 números: la temperatura media y la precipitación de cada mes. Primero decide el grupo (E, B, A, C o D), después el régimen de lluvias (f, s, w, m; W o S en los secos) y, por último, el verano o el invierno (a, b, c, d; h o k). Aquí ves cada pregunta con los valores del lugar elegido y puedes cambiar los datos para descubrir dónde están los umbrales.',
      'Manual: pp. 9-10<br>Cuadros 5.1, 6.1, 6.5 y 6.10'));
    el.append(T5.optCtrl());

    const S = { src: 'place', st: T5.byId('8391'), lat: 40, T: null, P: null };
    const card = H.h('div', { class: 'card' });
    const srcSeg = H.seg([['place', 'Tu municipio'], ['st', 'Una estación'], ['edit', 'Introduce tus datos']], S.src, (v) => { const prev = S.src; S.src = v; if (v === 'edit' && !S.T) copyFrom(prev === 'edit' ? 'place' : prev); upd(); });
    const stSel = T5.stationSelect(S.st.id, (s) => { S.st = s; upd(); });
    const stWrap = H.h('div', { style: { flex: '1 1 260px' } }, H.h('label', { class: 'small' }, 'Estación'), stSel);
    const srcInfo = H.h('p', { class: 'small', style: { margin: '6px 0 0' } });
    const cv = H.h('canvas'), cl = T3.climo(cv, (w) => Math.min(w * 0.6, 330));
    const tbl = H.h('div', { style: { overflowX: 'auto', marginTop: '8px' } });
    const editBar = H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '6px', marginTop: '6px' } });
    const out = H.h('div');
    const marg = H.h('div', { class: 'info', style: { marginTop: '10px' } });

    /* datos del lugar elegido */
    const current = () => {
      if (S.src === 'st') return { T: S.st.ta.slice(0, 12), P: S.st.pr.slice(0, 12), lat: S.st.lat, label: T5.stLabel(S.st), sub: `normales OMM 1991-2020 · ${H.f(S.st.elev)} m` };
      if (S.src === 'edit') return { T: S.T, P: S.P, lat: S.lat, label: 'Tus datos', sub: `latitud ${H.f(Math.abs(S.lat), 1)}° ${S.lat >= 0 ? 'N' : 'S'}` };
      const c = T5.placeClimate();
      if (c.src === 'tc') return { T: c.T, P: c.P, lat: c.lat, label: H.placeLabel(), sub: 'TerraClimate 1991-2020, corregido por la altitud del municipio' };
      if (c.src === 'grid') return { T: c.T, P: c.P, lat: c.lat, label: H.placeLabel(), sub: 'TerraClimate 1991-2020 (celda de 0,5°)' };
      return { T: c.T, P: c.P, lat: c.lat, label: T5.stLabel(c.st), sub: `estación más próxima a ${H.placeLabel()} (a ${H.f(c.d)} km)` };
    };
    const copyFrom = (src) => { const s0 = S.src; S.src = src; const c = current(); S.src = s0; S.T = c.T.map((v) => Math.round(v * 10) / 10); S.P = c.P.map((v) => Math.round(v * 10) / 10); S.lat = Math.round(c.lat * 10) / 10; };

    /* tabla de datos (editable en el modo «Introduce tus datos») */
    const drawTable = (c) => {
      const ed = S.src === 'edit';
      const row = (lab, arr, key) => `<tr><th>${lab}</th>${arr.map((v, i) => `<td>${ed ? `<input class="cell" type="number" step="0.1" data-k="${key}" data-i="${i}" value="${Math.round(v * 10) / 10}" aria-label="${lab} de ${H.MESES[i]}">` : H.f(v, Math.abs(v) < 10 && key === 'P' ? 1 : key === 'T' ? 1 : 0).replace('-', '−')}</td>`).join('')}</tr>`;
      tbl.innerHTML = `<table class="t mini num"><thead><tr><th></th>${H.MES3.map((m) => `<th>${m}</th>`).join('')}</tr></thead><tbody>${row('T (°C)', c.T, 'T')}${row('P (mm)', c.P, 'P')}</tbody></table>`;
      if (ed) H.$$('input.cell', tbl).forEach((inp) => inp.addEventListener('change', () => { const v = parseFloat(inp.value); if (!isFinite(v)) return; const k = inp.dataset.k, i = +inp.dataset.i; S[k][i] = k === 'P' ? Math.max(0, v) : v; upd(false); }));
    };
    const latInp = H.h('input', { type: 'number', step: '0.1', min: -89, max: 89, value: S.lat, style: { width: '90px' }, 'aria-label': 'Latitud' });
    latInp.addEventListener('change', () => { const v = parseFloat(latInp.value); if (isFinite(v)) { S.lat = H.clamp(v, -89, 89); upd(); } });
    const btn = (t, f) => { const b = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, t); b.onclick = () => { f(); upd(); }; return b; };
    editBar.append(H.h('span', { class: 'small', style: { flex: 'none' } }, 'Latitud (S negativa):'), latInp,
      btn('+1 °C', () => { S.T = S.T.map((v) => Math.round((v + 1) * 10) / 10); }), btn('−1 °C', () => { S.T = S.T.map((v) => Math.round((v - 1) * 10) / 10); }),
      btn('+20 % lluvia', () => { S.P = S.P.map((v) => Math.round(v * 12) / 10); }), btn('−20 % lluvia', () => { S.P = S.P.map((v) => Math.round(v * 8) / 10); }),
      btn('Verano seco', () => { const su = KG.summerIdx(S.lat); su.forEach((i) => { S.P[i] = Math.round(S.P[i] * 2) / 10; }); }),
      btn('Copiar del municipio', () => copyFrom('place')), btn('Copiar de la estación', () => copyFrom('st')));

    /* margen hasta el umbral más próximo */
    const margin = (c, t0) => {
      const o = T5.opt, res = [];
      for (const sg of [1, -1]) for (let d = 0.1; d <= 8.001; d += 0.1) { const t = KG.type(c.T.map((v) => v + sg * d), c.P, c.lat, o); if (t !== t0) { res.push([d, `con ${H.f(d, 1)} °C ${sg > 0 ? 'más' : 'menos'} en todos los meses pasaría a ${T5.chip(t)}`]); break; } }
      for (const f of [1, -1]) for (let k = 1; k <= 200; k++) { const fac = f > 0 ? 1 + k * 0.01 : 1 - k * 0.005; if (fac <= 0) break; const t = KG.type(c.T, c.P.map((v) => v * fac), c.lat, o); if (t !== t0) { res.push([Math.abs(fac - 1) * 10, `con un ${H.f(Math.abs(fac - 1) * 100)} % ${f > 0 ? 'más' : 'menos'} de lluvia, a ${T5.chip(t)}`]); break; } }
      return res.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    };

    const upd = (redrawTable = true) => {
      stWrap.style.display = S.src === 'st' ? '' : 'none';
      editBar.style.display = S.src === 'edit' ? '' : 'none';
      latInp.value = S.lat;
      const c = current();
      srcInfo.innerHTML = S.src === 'place' ? `${c.sub}. ${H.place.def ? '<a href="#" id="kp-pick">Elige tu municipio</a> (ahora: Madrid).' : ''}` : S.src === 'edit' ? 'Cambia cualquier valor (pulsa Intro o sal de la casilla) y observa qué pregunta cambia de respuesta.' : c.sub;
      const a = H.$('#kp-pick', srcInfo); if (a) a.onclick = (e) => { e.preventDefault(); H.openPlacePicker(); };
      const r = KG.classify(c.T, c.P, c.lat, T5.opt), s = r.s;
      cl.draw(T5.asStation(c.T, c.P, c.lat), { title: c.label, sub: `${H.f(s.Tann, 1).replace('-', '−')} °C · ${H.f(s.Pann)} mm` });
      if (redrawTable) drawTable(c);
      const crumbs = []; for (let i = 1; i <= r.type.length; i++) crumbs.push(r.type.slice(0, i));
      out.innerHTML = '';
      out.append(H.html(`<div><div class="small" style="text-transform:uppercase;letter-spacing:.08em">Tipo de Köppen</div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:4px 0 6px">${T5.chip(r.type, 'big')}<div><div style="font-family:var(--serif);font-size:1.25rem">${KG.NAME[r.type]}</div><div class="kletters">${T5.letters(r.type)}</div></div></div><div class="small">Se construye letra a letra: ${crumbs.map((x) => `<span class="kbd">${x}</span>`).join(' → ')}</div></div>`), T5.trace(r));
      const m = margin(c, r.type);
      marg.innerHTML = m.length ? `<b>¿Está cerca de un umbral?</b> ${m.slice(0, 2).join('; ')}.` : '<b>¿Está cerca de un umbral?</b> Ni con 8 °C de diferencia ni doblando o reduciendo mucho la lluvia cambiaría de tipo.';
    };
    card.append(H.h('h3', {}, 'Clasifica un clima'),
      H.h('div', { class: 'row', style: { marginBottom: '6px' } }, H.h('div', { style: { flex: '2 1 320px' } }, srcSeg), stWrap), srcInfo,
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cv), tbl, editBar), H.h('div', {}, out, marg)));
    H.onPlace(() => { if (S.src === 'place') upd(); });
    T5.onOpt(() => upd());
    el.append(card);
    upd();

    /* ================= reto: ¿qué clima es? ================= */
    const quiz = H.h('div', { class: 'card' });
    quiz.append(H.h('h3', {}, 'Reto: ¿qué clima es?'), H.h('p', { class: 'sub' }, 'Un climograma real sin nombre, casi siempre de una de las ciudades de los climogramas del manual (con datos de 1991-2020). Clasifícalo con el procedimiento de arriba (meses más cálido y más frío, el más seco del verano y del invierno…) y elige su tipo.'));
    const qcv = H.h('canvas'), qcl = T3.climo(qcv, (w) => Math.min(w * 0.6, 300));
    const qtbl = H.h('div', { style: { overflowX: 'auto', marginTop: '6px' } });
    const qopts = H.h('div', { class: 'opts' }), qfb = H.h('div', { class: 'fb' }), qscore = H.h('span', { class: 'badge' }, '0 / 0');
    let qs = null, ok = 0, n = 0;
    const qnext = H.h('button', { class: 'btn sm', type: 'button' }, 'Otro climograma');
    const newQ = () => {
      const MAN = ['41030', '51644', '72488', '21205791', '47817', '83967', '7650', '7480', '11120', '2978', '44292', '48097', '82331', '82191', '48698', '37055010', '78663', '4250', '67085', '3091', '72530', '8391', '11343', '72231'];
      const pool = Math.random() < 0.6 ? T5.ST.filter((s) => MAN.includes(s.id)) : T5.ST.filter((s) => !s.es || Math.random() < 0.15);
      qs = pool[Math.floor(Math.random() * pool.length)];
      const t = T5.type(qs), all = [...new Set(T5.ST.map((s) => T5.type(s)))];
      const near = all.filter((x) => x !== t).sort((a, b) => ((b[0] === t[0]) - (a[0] === t[0])) || Math.random() - 0.5).slice(0, 3);
      const opts = [t, ...near].sort(() => Math.random() - 0.5);
      qcl.draw(qs, { title: '¿?', sub: `${H.f(Math.abs(qs.lat), 0)}° ${qs.lat >= 0 ? 'N' : 'S'} · ${H.f(qs.elev)} m` });
      qtbl.innerHTML = `<table class="t mini num"><thead><tr><th></th>${H.MES3.map((m) => `<th>${m}</th>`).join('')}</tr></thead><tbody><tr><th>T</th>${qs.ta.slice(0, 12).map((v) => `<td>${H.f(v, 1).replace('-', '−')}</td>`).join('')}</tr><tr><th>P</th>${qs.pr.slice(0, 12).map((v) => `<td>${H.f(v, v < 10 ? 1 : 0)}</td>`).join('')}</tr></tbody></table>`;
      qopts.innerHTML = ''; qfb.className = 'fb';
      opts.forEach((o, j) => {
        const b = H.h('button', { class: 'opt', type: 'button', html: `<span class="l">${'abcd'[j]})</span><span>${T5.chip(o)} ${KG.NAME[o]}</span>` });
        b.onclick = () => {
          H.$$('.opt', qopts).forEach((x, k) => { x.disabled = true; if (opts[k] === t) x.classList.add('ok'); });
          const good = o === t; if (!good) b.classList.add('ko'); n++; if (good) ok++; qscore.textContent = `${ok} / ${n}`;
          const r = T5.cls(qs);
          qfb.className = 'fb show ' + (good ? 'ok' : 'ko');
          qfb.innerHTML = `<b>${good ? 'Correcto.' : 'No es correcto.'}</b>Es ${T5.stLabel(qs)}: ${T5.chip(t)} ${KG.NAME[t]}. Las preguntas decisivas: ${r.steps.filter((x) => x.ok).map((x) => x.q.replace(/^¿|\?.*$/g, '')).join('; ')}.`;
        };
        qopts.append(b);
      });
    };
    qnext.onclick = newQ;
    quiz.querySelector('h3').append(' ', qscore);
    quiz.append(H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, qcv), qtbl), H.h('div', {}, qopts, qfb, H.h('div', { style: { marginTop: '10px' } }, qnext))));
    T5.onOpt(() => newQ());
    newQ();
    el.append(quiz);

    el.append(H.fix('recuadro de las pp. 9-10 y cuadros 5.1, 6.5 y 6.10', [
      '<b>s y w</b> no se definen por el 70 % o el 30 % de la lluvia invernal: ese reparto solo sirve para calcular el umbral de aridez del grupo B. <i>s</i>: el mes más seco del verano recibe menos de 30 mm (40 en los mapas actuales) y menos de un tercio del más lluvioso del invierno. <i>w</i>: el mes más seco del invierno recibe menos de un décimo del más lluvioso del verano. Así lo recoge, de hecho, el cuadro 6.5.',
      'La fórmula de Patton del cuadro 5.1, <span class="formula">e = 20t + 490 − 7·PPW</span>, es correcta (con PPW entre 30 y 70), pero <b>e no es la evapotranspiración potencial</b>, sino un umbral empírico de necesidad de agua: en Riad e ≈ 540 mm, mientras que la evapotranspiración potencial real supera ampliamente los 2.000 mm.',
      'Falta la tercera letra de los climas secos: <b>h</b> (cálido, temperatura media anual ≥ 18 °C) y <b>k</b> (frío): BWh, BWk, BSh, BSk.',
      'Las letras <b>G</b> y <b>H</b> y el tipo «<b>EB</b>» no forman parte de la clasificación de Köppen-Geiger: las montañas se clasifican con sus propios datos (Navacerrada, Izaña o Bogotá tienen tipos ordinarios). «H, climas de grandes alturas» solo aparece en la leyenda del mapa de Geiger y Pohl (fig. 6.1).',
      'Cf no exige que el mes más seco supere 30 mm (cuadros 6.5 y 6.6): significa solo que el clima no es ni s ni w.',
      'El límite entre C y D a −3 °C es el de Köppen y del manual, y es correcto; muchos mapas actuales usan 0 °C. Cámbialo arriba, en «Criterios de la clasificación», y verás pasar Varsovia de Cfb a Dfb.']));

    el.append(H.selfCheck([
      { q: 'Lo primero que se comprueba en la clasificación de Köppen es…', opts: ['Si el mes más frío llega a 18 °C (grupo A)', 'Si el mes más cálido baja de 10 °C (grupo E) y si es seco (B)', 'Si llueve más de 1.000 mm al año', 'La altitud del lugar'], a: 1, ex: 'Los grupos E y B tienen prioridad; después se reparten A, C y D según el mes más frío.' },
      { q: 'Un clima con el mes más frío a 20 °C y el mes más seco con 30 mm, en un lugar con 3.000 mm al año, es…', opts: ['Af', 'Am', 'Aw', 'Cfa'], a: 1, ex: '30 mm < 60 mm, pero 30 ≥ 100 − 3.000/25 = −20 mm: la lluvia anual compensa la estación seca. Es monzónico.' },
      { q: 'En el umbral de aridez de Köppen, si la lluvia se concentra en verano el umbral…', opts: ['Baja, porque llueve cuando hace falta', 'Sube, porque esa lluvia se evapora más', 'No cambia: solo cuenta el total', 'Desaparece: ya no puede ser seco'], a: 1, ex: 'Con PPW = 30 (o menos) se suman 280 mm a 20·t; con PPW = 70 (lluvia de invierno), nada.' },
      { q: 'La letra b significa…', opts: ['Mes más cálido ≥ 22 °C', 'Mes más cálido < 22 °C y al menos cuatro meses ≥ 10 °C', 'Invierno seco', 'Clima seco'], a: 1, ex: 'Verano templado: el de Vitoria-Gasteiz, Bilbao o Burgos.' },
      { q: 'Con las normales 1991-2020 y los criterios del manual, Vitoria-Gasteiz (Foronda) sale…', opts: ['Cfb, oceánico', 'Csb, mediterráneo de verano templado', 'BSk, estepa fría', 'Dfb, continental húmedo'], a: 1, ex: 'Agosto (28 mm) recibe menos de 30 mm y menos de un tercio que noviembre (98 mm): verano seco. Es un caso límite: con 2 mm más en agosto sería Cfb. Compruébalo en «Introduce tus datos». La rejilla de TerraClimate, que promedia unos 4 km alrededor de la ciudad, da 41 mm en agosto y clasifica el municipio como Cfb: estación y rejilla no siempre coinciden.' },
    ]));
  },
});
