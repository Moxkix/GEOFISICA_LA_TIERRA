/* ===================== E · KÖPPEN EN ESPAÑA ===================== */
H.tab({
  id: 'espana', nav: 'España', title: 'Köppen en España',
  init(el) {
    el.append(H.intro('La diversidad climática · aplicación a España', 'Los climas de España y de sus 8.132 municipios',
      'La misma clasificación aplicada a España con una resolución de unos 4 km y a cada municipio, con las normales 1991-2020 y 1961-1990 de TerraClimate. En cada municipio la temperatura se corrige con la diferencia entre su altitud y la altitud media de la celda. Busca el tuyo, mira qué tipos dominan y qué municipios han cambiado de clima.',
      'Manual: apartados 1.2 y 2<br>Tema 6: climas templados'));
    el.append(T5.optCtrl());
    const KS = T5.DATA().KES;
    if (!KS || !KS.mun) { el.append(H.info('Esta pestaña necesita los datos de TerraClimate para España, que todavía no están incluidos en esta versión.')); return; }

    const M = KS.mun, N = H.MUNI.length;
    const S = { per: '91', i: null, filt: null };
    /* clasificación de todos los municipios con los criterios vigentes */
    let C91 = [], C61 = [];
    const col = (arr, i) => Array.from({ length: 12 }, (_, k) => arr[k][i]);
    const classifyAll = () => {
      C91 = new Array(N); C61 = new Array(N);
      for (let i = 0; i < N; i++) { if (!(M.T91[0][i] === M.T91[0][i])) continue; const lat = H.MUNI[i].lat; C91[i] = KG.type(col(M.T91, i), col(M.P91, i), lat, T5.opt); C61[i] = KG.type(col(M.T61, i), col(M.P61, i), lat, T5.opt); }
    };
    classifyAll();
    const idxOf = (p) => H.MUNI.findIndex((m) => m.name === p.name && m.prov === p.prov);
    S.i = H.place.es ? idxOf(H.place) : idxOf(H.findMuni('Madrid'));

    /* ---------- mapas ---------- */
    const typeIn = (R, per) => { const f = T5.nn(R.K[per][T5.combo()], R); return (lat, lon) => { const v = f(lat, lon); return v === v && v > 0 ? KG.CODES[Math.round(v) - 1] : null; }; };
    const fade = (c) => H.mix(c, [244, 241, 234], 0.82);
    /* color de la celda, o null si no hay dato (las celdas costeras con dato se pintan aunque la máscara de tierra de 0,25° las dé por mar) */
    const colorFn = (R) => (lat, lon) => {
      if (S.per === 'chg') { const a = typeIn(R, '61')(lat, lon), b = typeIn(R, '91')(lat, lon); if (!b) return null; return a !== b ? KG.COL[b] : [226, 222, 212]; }
      const t = typeIn(R, S.per)(lat, lon); if (!t) return null;
      return S.filt && !(S.filt.length === 1 ? t[0] === S.filt : t === S.filt) ? fade(KG.COL[t]) : KG.COL[t];
    };
    const mark = (ctx, P) => { const m = H.MUNI[S.i]; if (!m) return; const x = P.X(m.lon), y = P.Y(m.lat); if (x < 0 || y < 0 || x > P.w || y > P.h) return; ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke(); ctx.lineWidth = 1; };
    const cvP = H.h('canvas'), cvC = H.h('canvas');
    const key = () => [S.per, S.filt, T5.combo()].join('|');
    const lf = (R) => { const f = colorFn(R); return (lat, lon) => f(lat, lon) || T4.LAND; };
    const mpP = T4.map(cvP, { bbox: [-9.6, 4.6, 35.2, 44.0], regional: true, grid: 2, key, land: lf(KS.pen), color: colorFn(KS.pen), after: mark });
    const mpC = KS.can ? T4.map(cvC, { bbox: [-18.3, -13.3, 27.5, 29.5], regional: true, grid: 1, gridLabels: false, key, land: lf(KS.can), color: colorFn(KS.can), after: mark }) : null;
    const hov = (R) => (lat, lon) => { const t = typeIn(R, S.per === 'chg' ? '91' : S.per)(lat, lon); if (!t) return null; const n = H.nearestMuni(lat, lon); return `${t}${S.per === 'chg' ? ' (antes ' + (typeIn(R, '61')(lat, lon) || '—') + ')' : ''} · cerca de ${n.m.name}`; };
    T4.hover(cvP, mpP, hov(KS.pen)); if (mpC) T4.hover(cvC, mpC, hov(KS.can));
    const clickMap = (mp) => (e) => { if (!mp.P) return; const [x, y] = mp.pos(e); const [lat, lon] = mp.P.inv(x, y); const n = H.nearestMuni(lat, lon); if (n.d < 25) { S.i = H.MUNI.indexOf(n.m); redrawMaps(); updMun(); } };
    cvP.addEventListener('click', clickMap(mpP)); cvC.addEventListener('click', clickMap(mpC));
    const redrawMaps = () => { mpP.redraw(); if (mpC) mpC.redraw(); };
    const invalidate = () => { mpP.invalidate(); if (mpC) mpC.invalidate(); };

    const card = H.h('div', { class: 'card' });
    const perSeg = H.seg([['91', '1991-2020'], ['61', '1961-1990'], ['chg', 'Cambios']], S.per, (v) => { S.per = v; invalidate(); });
    const leg = H.h('div');
    const present = () => [...new Set(C91.concat(C61).filter(Boolean))].sort((a, b) => KG.CODES.indexOf(a) - KG.CODES.indexOf(b));
    const drawLeg = () => { leg.innerHTML = ''; const l = T5.legend(present(), (t) => { S.filt = S.filt === t ? null : t; invalidate(); drawLeg(); }); H.$$('.kl-i', l).forEach((b) => { if (S.filt && b.textContent === S.filt) b.classList.add('on'); }); leg.append(l); };
    drawLeg();
    card.append(H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '2 1 300px' } }, perSeg)),
      H.h('div', { class: 'viz framed' }, cvP), mpC ? H.h('div', { class: 'viz framed', style: { maxWidth: '420px', marginTop: '6px' } }, cvC) : '', H.h('div', { style: { height: '8px' } }), leg,
      H.html('<p class="hint">Celdas de unos 4 km. Pulsa el mapa para elegir el municipio más próximo. En «Cambios» se colorean solo las celdas que han cambiado de tipo entre 1961-1990 y 1991-2020, con su tipo actual.</p>'));

    /* ---------- municipio ---------- */
    const mc = H.h('div', { class: 'card' });
    const mcv = H.h('canvas'), mcl = T3.climo(mcv, (w) => Math.min(w * 0.6, 300));
    const mOut = H.h('div');
    const find = H.h('input', { type: 'text', placeholder: 'Busca un municipio…', autocomplete: 'off' }), list = H.h('ul', { class: 'sugg', style: { display: 'none' } });
    find.addEventListener('input', () => { const r = H.searchMuni(find.value, 8); list.innerHTML = ''; list.style.display = r.length ? '' : 'none'; r.forEach((m) => { const li = H.h('li', {}, H.h('span', {}, m.name), H.h('small', {}, m.prov)); li.onclick = () => { S.i = H.MUNI.indexOf(m); list.style.display = 'none'; find.value = ''; redrawMaps(); updMun(); }; list.append(li); }); });
    const updMun = () => {
      const i = S.i, m = H.MUNI[i]; if (!m || !C91[i]) { mOut.innerHTML = '<p class="small">Sin datos para este municipio.</p>'; return; }
      const T = col(M.T91, i), P = col(M.P91, i), T6 = col(M.T61, i), P6 = col(M.P61, i);
      const r = KG.classify(T, P, m.lat, T5.opt), s = r.s;
      mcl.draw(T5.asStation(T, P, m.lat), { title: `${m.name} (${m.prov})`, sub: `${H.f(m.alt)} m · 1991-2020` });
      const dT = (T.reduce((a, b) => a + b, 0) - T6.reduce((a, b) => a + b, 0)) / 12, p6 = P6.reduce((a, b) => a + b, 0);
      mOut.innerHTML = '';
      mOut.append(H.html(`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px">${T5.chip(r.type, 'big')}<div><b>${KG.NAME[r.type]}</b><div class="kletters">${T5.letters(r.type)}</div></div></div>
        <div class="readouts" style="margin-bottom:8px"><div class="ro"><div class="k">Temperatura media</div><div class="v">${T5.fT(s.Tann)} <small>(${H.fs(dT, 1)} desde 1961-1990)</small></div></div>
        <div class="ro"><div class="k">Precipitación anual</div><div class="v">${H.f(s.Pann)} <small>mm (${H.fs((s.Pann / p6 - 1) * 100, 0)} %)</small></div></div>
        <div class="ro ${C61[i] !== r.type ? 'hl' : ''}"><div class="k">Tipo en 1961-1990</div><div class="v">${T5.chip(C61[i])} <small>${C61[i] !== r.type ? 'ha cambiado' : 'el mismo'}</small></div></div>
        ${M.E && M.E[i] === M.E[i] ? `<div class="ro bl"><div class="k">Índice de aridez P/ETP</div><div class="v">${H.f(s.Pann / M.E[i], 2)}</div></div>` : ''}</div>`));
      const det = H.h('details', {}, H.h('summary', { class: 'small', style: { cursor: 'pointer' } }, 'Ver la clasificación paso a paso'), T5.trace(r));
      const use = H.h('button', { class: 'btn ghost sm', type: 'button', style: { marginTop: '8px' } }, 'Usar como mi municipio'); use.onclick = () => { const { k, ...p } = m; H.setPlace(p); };
      mOut.append(det, use);
    };
    mc.append(H.h('h3', {}, 'Un municipio'), H.h('div', { style: { position: 'relative', maxWidth: '420px', marginBottom: '8px' } }, find, list), H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, mcv), mOut));
    H.onPlace(() => { if (H.place.es) { S.i = idxOf(H.place); redrawMaps(); updMun(); } });

    /* ---------- recuento de municipios ---------- */
    const cc = H.h('div', { class: 'card' });
    const cOut = H.h('div');
    const updCount = () => {
      const n91 = {}, n61 = {}, tr = {}; let changed = 0, tot = 0;
      for (let i = 0; i < N; i++) { const a = C61[i], b = C91[i]; if (!b) continue; tot++; n91[b] = (n91[b] || 0) + 1; n61[a] = (n61[a] || 0) + 1; if (a !== b) { changed++; const k = a + ' → ' + b; tr[k] = (tr[k] || 0) + 1; } }
      const types = present(), mx = Math.max(...types.map((t) => Math.max(n91[t] || 0, n61[t] || 0)));
      const prov = H.MUNI[S.i] ? H.MUNI[S.i].prov : null;
      const inProv = prov ? H.MUNI.map((m, i) => [m, i]).filter(([m, i]) => m.prov === prov && C91[i] && C61[i] !== C91[i]) : [];
      cOut.innerHTML = `<div class="grid2 even"><div><table class="t mini"><thead><tr><th>Tipo</th><th>1961-1990</th><th>1991-2020</th><th></th></tr></thead><tbody>
        ${types.map((t) => `<tr><td>${T5.chip(t)} <span class="small">${KG.NAME[t]}</span></td><td class="num">${H.f(n61[t] || 0)}</td><td class="num"><b>${H.f(n91[t] || 0)}</b></td><td style="width:30%"><div style="background:${KG.css(t)};height:10px;border-radius:3px;width:${(n91[t] || 0) / mx * 100}%;border:1px solid rgba(28,40,54,.2)"></div></td></tr>`).join('')}
        </tbody></table></div>
        <div><p><b>${H.f(changed)}</b> municipios de ${H.f(tot)} (${H.f(changed / tot * 100, 1)} %) han cambiado de tipo entre 1961-1990 y 1991-2020.</p>
        <table class="t mini"><thead><tr><th>Cambio</th><th>Municipios</th></tr></thead><tbody>${Object.entries(tr).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `<tr><td>${k.split(' → ').map((x) => T5.chip(x)).join(' → ')}</td><td class="num">${H.f(v)}</td></tr>`).join('')}</tbody></table>
        ${prov ? `<p class="small" style="margin-top:8px">En la provincia de ${prov} han cambiado ${H.f(inProv.length)} municipios${inProv.length ? ': ' + inProv.slice(0, 25).map(([m, i]) => `${m.name} (${C61[i]} → ${C91[i]})`).join(', ') + (inProv.length > 25 ? '…' : '') : ''}.</p>` : ''}</div></div>`;
    };
    cc.append(H.h('h3', {}, 'Los municipios, tipo a tipo'), cOut);

    T5.onOpt(() => { classifyAll(); drawLeg(); invalidate(); updMun(); updCount(); });
    el.append(card, mc, cc);
    updMun(); updCount();

    el.append(H.info('<b>Cómo se ha calculado.</b> TerraClimate combina el atlas WorldClim (≈1 km) con las anomalías mensuales de las series de estaciones (CRU) y del reanálisis japonés JRA-55; aquí se usan sus medias de 1961-1990 y 1991-2020 en celdas de 1/24° (≈4 km). Para cada municipio se promedian las cuatro celdas más próximas y la temperatura se ajusta 0,65 °C por cada 100 m de diferencia entre la altitud del núcleo de población y la altitud media de las celdas. Por eso el tipo del municipio puede no coincidir con el color de su celda en el mapa. Las estaciones de AEMET dan valores algo distintos: TerraClimate es una estimación en rejilla, no una medida.'));
    el.append(H.selfCheck([
      { q: 'El tipo de clima más extendido en los municipios españoles es…', opts: ['Cfb, oceánico', 'Csa, mediterráneo de verano caluroso', 'BSk, estepa fría', 'Dfb'], a: 1, ex: 'Cubre buena parte de la mitad sur, el valle del Ebro y el litoral mediterráneo.' },
      { q: 'El cambio de tipo más frecuente entre 1961-1990 y 1991-2020 es…', opts: ['De Csa a Cfb', 'De Csb a Csa: veranos que superan los 22 °C de media en el mes más cálido', 'De BSk a Cfb', 'De ET a EF'], a: 1, ex: 'Es la consecuencia más directa del calentamiento de los veranos.' },
      { q: 'En España hay climas D (Dfb, Dsb…) solo…', opts: ['En la costa cantábrica', 'En las montañas más altas, con el mes más frío por debajo del umbral C/D', 'En Canarias', 'En el valle del Guadalquivir'], a: 1, ex: 'Pirineo, Sistema Central, Sistema Ibérico, Cordillera Cantábrica y Sierra Nevada; con el umbral de 0 °C aparecen más.' },
    ]));
  },
});
