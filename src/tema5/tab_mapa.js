/* ===================== M · MAPA MUNDIAL DE KÖPPEN ===================== */
H.tab({
  id: 'mapa', nav: 'Mapa mundial', title: 'Mapa mundial de Köppen',
  init(el) {
    el.append(H.intro('La diversidad climática · fig. 6.1', 'Los climas del mundo según Köppen, 1991-2020',
      'Cada celda de medio grado se ha clasificado con sus temperaturas y precipitaciones medias de 1991-2020 (TerraClimate) y con el mismo procedimiento del clasificador. Pulsa cualquier punto para ver su climograma y por qué tiene ese tipo; filtra un tipo en la leyenda; compara con la normal 1961-1990 y mira dónde ha cambiado el clima.',
      'Manual: fig. 6.1<br>Tema 6 para los climas zonales'));
    el.append(T5.optCtrl());
    const W = T5.DATA().KMUNDO;
    if (!W || !W.K) { el.append(H.info('El mapa mundial necesita los datos de TerraClimate, que todavía no están incluidos en esta versión.')); return; }
    if (W.prueba) el.append(H.info('<b>Versión de prueba:</b> este mapa usa ERA5 a 2° mientras llegan los datos de TerraClimate.'));

    const S = { per: '91', sel: null, filt: null, reg: 'mundo' };
    const REG = { mundo: ['Mundo', [-180, 180, -60, 84]], eur: ['Europa', [-25, 45, 34, 72]], ib: ['Península ibérica', [-10.5, 4.5, 35.5, 44.2]], afr: ['África', [-20, 55, -36, 38]], asi: ['Asia', [40, 150, 0, 78]],
      nam: ['Norteamérica', [-170, -50, 10, 75]], sam: ['Sudamérica', [-85, -32, -56, 14]], oce: ['Oceanía', [110, 180, -48, -8]] };
    const K = (per) => W.K[per][T5.combo()];
    const at = (per) => T5.nn(K(per), W);
    const typeAt = (lat, lon, per = S.per === '61' ? '61' : '91') => { const v = at(per)(lat, lon); return v === v && v > 0 ? KG.CODES[Math.round(v) - 1] : null; };

    const card = H.h('div', { class: 'card' });
    const cv = H.h('canvas');
    const fade = (c) => H.mix(c, [244, 241, 234], 0.82);
    const colorAt = (lat, lon) => {
      if (S.per === 'chg') {
        const a = typeAt(lat, lon, '61'), b = typeAt(lat, lon, '91');
        if (!b) return lat < -60 ? [215, 215, 215] : T4.LAND;
        return a !== b ? KG.COL[b] : [226, 222, 212];
      }
      const t = typeAt(lat, lon);
      if (!t) return lat < -60 ? fade(KG.COL.EF) : T4.LAND; // la Antártida: hielo perpetuo (TerraClimate no la cubre)
      const c = KG.COL[t];
      return S.filt && !(S.filt.length === 1 ? t[0] === S.filt : t === S.filt) ? fade(c) : c;
    };
    const mp = T4.map(cv, { bbox: REG.mundo[1], grid: 30, key: () => [S.per, S.filt, T5.combo()].join('|'), land: colorAt, color: (lat, lon) => (typeAt(lat, lon) ? colorAt(lat, lon) : null),
      after: (ctx, P) => { if (S.sel) { const x = P.X(S.sel.lon), y = P.Y(S.sel.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1; } } });
    T4.hover(cv, mp, (lat, lon) => { const t = typeAt(lat, lon); if (!t) return null; const t6 = typeAt(lat, lon, '61'); return `${t} · ${KG.NAME[t]}${S.per === 'chg' && t6 !== t ? ` (antes ${t6})` : ''}`; });
    cv.addEventListener('click', (e) => { if (!mp.P) return; const [x, y] = mp.pos(e); const [lat, lon] = mp.P.inv(x, y); const c = T5.cell(lat, lon); if (c) { S.sel = c; mp.redraw(); updSel(); } });

    const perSeg = H.seg([['91', '1991-2020'], ['61', '1961-1990'], ['chg', 'Cambios']], S.per, (v) => { S.per = v; mp.invalidate(); updStats(); });
    const regSel = H.h('select', { 'aria-label': 'Región' }); for (const [k, [n]] of Object.entries(REG)) regSel.append(H.h('option', { value: k }, n));
    regSel.onchange = () => { S.reg = regSel.value; mp.opts.grid = S.reg === 'mundo' ? 30 : S.reg === 'ib' ? 2 : 10; mp.opts.regional = S.reg === 'eur' || S.reg === 'ib'; mp.setBBox(REG[S.reg][1]); };
    const leg = H.h('div');
    const drawLeg = () => {
      leg.innerHTML = '';
      const l = T5.legend(KG.CODES, (t, b) => { S.filt = S.filt === t ? null : t; mp.invalidate(); drawLeg(); });
      H.$$('.kl-i', l).forEach((b) => { if (S.filt && b.textContent === S.filt) b.classList.add('on'); });
      H.$$('.kl-g', l).forEach((g) => { g.style.cursor = 'pointer'; g.title = 'Resaltar el grupo'; g.onclick = () => { S.filt = S.filt === g.textContent ? null : g.textContent; mp.invalidate(); drawLeg(); }; });
      leg.append(l, H.html('<p class="hint">Pulsa un tipo (o la letra de un grupo) para resaltarlo; otra vez para quitar el filtro.</p>'));
    };
    drawLeg();
    card.append(H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '2 1 300px' } }, perSeg), H.h('div', { style: { flex: '1 1 180px' } }, regSel)),
      H.h('div', { class: 'viz framed' }, cv), H.h('div', { style: { height: '8px' } }), leg);

    /* ---------- celda seleccionada ---------- */
    const sel = H.h('div', { class: 'card' });
    const scv = H.h('canvas'), scl = T3.climo(scv, (w) => Math.min(w * 0.6, 300));
    const sOut = H.h('div');
    const updSel = () => {
      const c = S.sel; if (!c) { sOut.innerHTML = '<p class="small">Pulsa un punto del mapa.</p>'; return; }
      const r = KG.classify(c.T, c.P, c.lat, T5.opt), t6 = typeAt(c.lat, c.lon, '61');
      scl.draw(T5.asStation(c.T, c.P, c.lat), { title: T4.ll(c.lat, c.lon, 2), sub: (c.Z != null && c.Z === c.Z ? `altitud media ${H.f(c.Z)} m · ` : '') + 'TerraClimate 1991-2020' });
      sOut.innerHTML = '';
      sOut.append(H.html(`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px">${T5.chip(r.type, 'big')}<div><b>${KG.NAME[r.type]}</b><div class="kletters">${T5.letters(r.type)}</div><div class="small">1961-1990: ${t6 ? T5.chip(t6) + (t6 !== r.type ? ' — ha cambiado' : ' — el mismo') : '—'}${c.AI === c.AI && c.AI != null ? ` · índice de aridez P/ETP: ${H.f(c.AI, 2)}` : ''}</div></div></div>`), T5.trace(r));
    };
    sel.append(H.h('h3', {}, 'El punto elegido'), H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, scv), sOut));
    S.sel = T5.cell(H.place.lat, H.place.lon); updSel();

    /* ---------- superficie de cada tipo ---------- */
    const st = H.h('div', { class: 'card' });
    const stOut = H.h('div');
    const updStats = () => {
      const per = S.per === 'chg' ? '91' : S.per, a = K(per), b = K('61'), c9 = K('91'), area = {}, grp = {};
      let tot = 0, chg = 0; const tr = {};
      for (let j = 0; j < W.ny; j++) {
        const w = Math.cos((W.lat0 - (j + 0.5) * W.res) * H.D2R);
        for (let i = 0; i < W.nx; i++) {
          const k = j * W.nx + i, v = a[k]; if (!(v > 0)) continue;
          const t = KG.CODES[v - 1]; tot += w; area[t] = (area[t] || 0) + w; grp[t[0]] = (grp[t[0]] || 0) + w;
          if (b[k] > 0 && c9[k] > 0 && b[k] !== c9[k]) { chg += w; const key = KG.CODES[b[k] - 1] + ' → ' + KG.CODES[c9[k] - 1]; tr[key] = (tr[key] || 0) + w; }
        }
      }
      const pc = (x) => H.f(x / tot * 100, 1) + ' %';
      const top = Object.entries(area).sort((x, y) => y[1] - x[1]).slice(0, 8);
      const trs = Object.entries(tr).sort((x, y) => y[1] - x[1]).slice(0, 6);
      stOut.innerHTML = `<div class="grid2 even"><div><h4>Por grupos (${S.per === '61' ? '1961-1990' : '1991-2020'})</h4>
        ${['A', 'B', 'C', 'D', 'E'].map((g) => `<div style="display:flex;align-items:center;gap:8px;margin:3px 0"><span class="kbd" style="width:22px;text-align:center">${g}</span><div style="flex:1;background:var(--soft);border-radius:4px;height:16px;position:relative"><div style="position:absolute;inset:0 auto 0 0;width:${(grp[g] || 0) / tot * 100}%;background:${KG.css(g === 'A' ? 'Aw' : g === 'B' ? 'BWh' : g === 'C' ? 'Cfb' : g === 'D' ? 'Dfc' : 'ET')};border-radius:4px"></div></div><span class="num" style="width:56px;text-align:right">${pc(grp[g] || 0)}</span></div>`).join('')}
        <p class="small">Los tipos más extensos: ${top.map(([t, v]) => `${T5.chip(t)} ${pc(v)}`).join(' · ')}</p></div>
        <div><h4>Cambios entre 1961-1990 y 1991-2020</h4><p>Ha cambiado de tipo el <b>${pc(chg)}</b> de la superficie clasificada.</p>
        <table class="t mini"><tbody>${trs.map(([k, v]) => `<tr><td>${k.split(' → ').map((x) => T5.chip(x)).join(' → ')}</td><td class="num">${pc(v)}</td></tr>`).join('')}</tbody></table>
        <p class="small">Los cambios más frecuentes reflejan el calentamiento: inviernos que dejan de bajar del umbral C/D, veranos que superan los 22 °C (b → a), tundras que pasan a bosque boreal. En regiones con pocas estaciones, parte del cambio puede deberse a los datos de 1961-1990.</p></div></div>
        <p class="small">Superficie de tierra firme entre 60° S y 84° N (sin la Antártida, que TerraClimate no cubre y que es casi toda EF).</p>`;
    };
    st.append(H.h('h3', {}, '¿Cuánta superficie ocupa cada clima?'), stOut);
    T5.onOpt(() => { mp.invalidate(); updSel(); updStats(); });
    updStats();

    el.append(card, sel, st, H.fix('fig. 6.1', ['El mapa del manual es el de Geiger y Pohl (1953), con datos de la primera mitad del siglo XX. Este se ha calculado con las normales 1991-2020, con los criterios del manual (que puedes cambiar arriba).']));
    el.append(H.selfCheck([
      { q: 'El grupo de climas que ocupa más superficie de tierra firme es…', opts: ['A, cálidos', 'B, secos', 'C, templados', 'E, polares'], a: 1, ex: 'Los climas secos cubren cerca de un tercio de las tierras emergidas (sin la Antártida).' },
      { q: 'Los climas D apenas existen en el hemisferio sur porque…', opts: ['Allí no hay montañas', 'No hay grandes masas continentales en las latitudes en que se forman', 'El ecuador está más al sur', 'Llueve demasiado'], a: 1, ex: 'Entre 40° y 70° S casi todo es océano: solo hay D en enclaves de los Andes.' },
      { q: 'Los climas Cs (mediterráneos) se sitúan en…', opts: ['Las fachadas orientales entre 20° y 30°', 'Las fachadas occidentales entre 30° y 45°', 'El interior de los continentes', 'Los trópicos'], a: 1, ex: 'California, Chile central, el Cabo, el suroeste de Australia y la cuenca mediterránea.' },
    ]));
  },
});
