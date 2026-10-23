/* ===================== S · CLIMAS SECOS ===================== */
H.tab({
  id: 'secos', nav: 'Climas secos', title: 'Los climas secos',
  init(el) {
    el.append(H.intro('Los climas azonales · apartado 2.1', 'Los climas secos: cuando la lluvia no alcanza',
      'Un clima es seco cuando la precipitación no cubre lo que el calor podría evaporar. Por eso Köppen no usa una cantidad fija de lluvia, sino un umbral que crece con la temperatura y con la proporción de lluvia que cae en verano. Los climas secos aparecen en todas las zonas, por causas distintas: anticiclones subtropicales, alisios continentales, corrientes frías, montañas que hacen de pantalla y la lejanía del mar.',
      'Manual: 2.1<br>Cuadros 5.1 y 5.2<br>Figs. 5.4-5.6'));
    el.append(T5.optCtrl());

    /* ================= A · el umbral de aridez ================= */
    const S = { t: 15, pw: 50, p: 400, st: T5.byId('40438') };
    const card = H.h('div', { class: 'card' });
    card.append(H.h('h3', {}, 'El umbral de aridez de Köppen'),
      H.h('p', { class: 'sub' }, 'Cada punto es una estación (temperatura media anual, precipitación anual). Las líneas son el umbral e para un clima con la lluvia en invierno (PPW = 70 %), repartida (50 %) o en verano (30 %): por debajo de e el clima es estepario (BS); por debajo de e/2, desértico (BW). Mueve los deslizadores o elige una estación.'));
    const cv = H.h('canvas'), ch = H.chart(cv, (w) => Math.min(w * 0.62, 420));
    const ro = H.h('div', { class: 'readouts' });
    const eOf = (t, pw) => KG.aridity(t, pw, T5.opt.arid);
    const sT = H.slider('Temperatura media anual', -20, 32, 0.1, S.t, (v) => T5.fT(v), (v) => { S.t = v; S.st = null; upd(); });
    const sW = H.slider('Lluvia del semestre frío (PPW)', 0, 100, 1, S.pw, (v) => H.f(v) + ' %', (v) => { S.pw = v; S.st = null; upd(); });
    const sP = H.slider('Precipitación anual', 0, 1600, 5, S.p, (v) => H.f(v) + ' mm', (v) => { S.p = v; S.st = null; upd(); });
    const stSel = T5.stationSelect(S.st.id, (s) => setSt(s));
    const ex = H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '6px' } });
    [['40438', 'Riad'], ['24959', 'Yakutsk'], ['8222', 'Madrid'], ['44292', 'Ulán Bator'], ['8487', 'Almería'], ['70026', 'Utqiaġvik'], ['8160', 'Zaragoza']].forEach(([id, n]) => { const b = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, n); b.onclick = () => setSt(T5.byId(id)); ex.append(b); });
    const setSt = (s) => {
      const st = KG.stats(s.ta.slice(0, 12), s.pr.slice(0, 12), s.lat);
      S.st = s; S.t = st.Tann; S.pw = st.pw; S.p = st.Pann;
      sT.set(Math.round(S.t * 10) / 10); sW.set(Math.round(S.pw)); sP.set(Math.min(1600, Math.round(S.p))); stSel.set(s.id); upd();
    };
    const pts = [];
    const upd = () => {
      const e = eOf(S.t, S.pw), cls = S.p < e / 2 ? 'BW' : S.p < e ? 'BS' : null;
      const line = (pw, half) => Array.from({ length: 53 }, (_, i) => { const t = -20 + i; return [t, Math.max(0, eOf(t, pw)) / (half ? 2 : 1)]; });
      pts.length = 0;
      ch.draw({
        xMin: -20, xMax: 32, yMin: 0, yMax: 1600, pad: { l: 62 },
        xTicks: [-20, -10, 0, 10, 20, 30].map((v) => ({ v, label: String(v).replace('-', '−') + '°' })), yTicks: [0, 250, 500, 750, 1000, 1250, 1500].map((v) => ({ v, label: H.f(v) })),
        xLabel: 'temperatura media anual (°C)', yLabel: 'precipitación anual (mm)',
        hlines: [{ y: 250, color: '#8a6512', label: 'isoyeta de 250 mm' }],
        series: [
          { pts: line(70), color: 'rgba(31,111,139,.55)', width: 1.3, dash: [5, 4] }, { pts: line(30), color: 'rgba(176,57,58,.6)', width: 1.3, dash: [5, 4] },
          { pts: line(50), color: 'rgba(28,40,54,.45)', width: 1.3, dash: [5, 4] },
          { pts: line(S.pw), color: '#b4531d', width: 2.6 }, { pts: line(S.pw, true), color: '#b4531d', width: 1.8, dash: [2, 3] },
        ],
        after: (ctx, X, Y) => {
          ctx.font = '10.5px system-ui'; ctx.textBaseline = 'bottom';
          const lab = (t, v, txt, col) => { ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(txt, X(t) - 3, Y(v) - 2); };
          lab(29, eOf(29, 70), 'e (PPW 70 %)', '#1f6f8b'); lab(19, eOf(19, 30), 'e (PPW 30 %)', '#b0393a');
          for (const s of T5.ST) {
            const st = KG.stats(s.ta.slice(0, 12), s.pr.slice(0, 12), s.lat); if (st.Pann > 1600) continue;
            const k = T5.type(s), x = X(st.Tann), y = Y(st.Pann); pts.push([x, y, s]);
            ctx.fillStyle = k[0] === 'B' ? (k[1] === 'W' ? '#d6336c' : '#f08c00') : 'rgba(31,111,139,.45)';
            ctx.beginPath(); ctx.arc(x, y, s === S.st ? 6 : 3.3, 0, 7); ctx.fill();
            if (s === S.st) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; }
          }
          if (!S.st) { const x = X(S.t), y = Y(Math.min(1600, S.p)); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke(); ctx.lineWidth = 1; }
        },
      });
      ro.innerHTML = `<div class="ro"><div class="k">Umbral e</div><div class="v">${H.f(Math.max(0, e))} <small>mm</small></div></div><div class="ro"><div class="k">e / 2</div><div class="v">${H.f(Math.max(0, e / 2))} <small>mm</small></div></div>
        <div class="ro ${cls ? 'hl' : 'bl'}"><div class="k">${S.st ? T5.stLabel(S.st) : 'Tu punto'}</div><div class="v">${H.f(S.p)} mm → ${cls ? `<b>${cls}</b> <small>${cls === 'BW' ? 'desierto' : 'estepa'}</small>` : '<small>no es un clima seco</small>'}</div></div>
        ${S.st ? `<div class="ro"><div class="k">Tipo completo</div><div class="v">${T5.chip(T5.type(S.st))} <small>${KG.NAME[T5.type(S.st)]}</small></div></div>` : ''}`;
    };
    cv.addEventListener('click', (e) => { const [x, y] = ch.st.pos(e); let b = null, bd = 12; for (const [px, py, s] of pts) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = s; } } if (b) setSt(b); });
    ch.st.P = { inv: () => [0, 0] };
    T4.hover(cv, ch.st, (la, lo, x, y) => { let b = null, bd = 10; for (const [px, py, s] of pts) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = s; } } return b ? `${T5.stLabel(b)} · ${T5.type(b)}` : null; });
    card.append(H.h('div', { class: 'grid2' },
      H.h('div', {}, H.h('div', { class: 'viz framed' }, cv), H.html('<div class="legend"><span><i style="background:#d6336c;height:10px;width:10px;border-radius:50%"></i>BW · desierto</span><span><i style="background:#f08c00;height:10px;width:10px;border-radius:50%"></i>BS · estepa</span><span><i style="background:rgba(31,111,139,.45);height:10px;width:10px;border-radius:50%"></i>no seco</span><span><i style="background:#b4531d"></i>umbral para tu PPW (continua: e; punteada: e/2)</span></div>')),
      H.h('div', {}, H.h('label', { class: 'small' }, 'Estación'), stSel, H.h('div', { style: { height: '8px' } }), ex, H.h('div', { style: { height: '10px' } }), sT, sW, sP, ro)),
      H.html('<p class="hint">Yakutsk recibe menos de 250 mm y no es seco: con −8 °C de media, el umbral es de 120 mm. Madrid y Zaragoza reciben más de 300 mm y quedan cerca del umbral (prueba la fórmula «por tramos» en los criterios: Madrid pasa a BSk). Por eso el manual advierte que la isoyeta de 250 mm no delimita bien los climas secos.</p>'));
    T5.onOpt(upd);
    el.append(card);
    setSt(S.st);

    /* ================= B · índice de aridez ================= */
    const W = T5.DATA().KMUNDO;
    if (W && W.AI) {
      const aiCard = H.h('div', { class: 'card' });
      const AIC = [[0.05, 'Hiperárido', [196, 64, 38]], [0.2, 'Árido', [236, 140, 72]], [0.5, 'Semiárido', [244, 210, 130]], [0.65, 'Subhúmedo seco', [222, 230, 170]], [99, 'Húmedo', [150, 200, 170]]];
      const aiCls = (v) => AIC.find((c) => v < c[0]);
      const G = { nx: W.nx, ny: W.ny, lon0: W.lon0, lat0: W.lat0, res: W.res };
      const gAI = T4.grid(W.AI, G);
      const mcv = H.h('canvas');
      const mp = T4.map(mcv, { bbox: [-180, 180, -58, 80], grid: 30, land: (lat, lon) => { const v = gAI.near(lat, lon, 1); return v === v ? aiCls(v)[2] : T4.LAND; } });
      T4.hover(mcv, mp, (lat, lon) => { const v = gAI.near(lat, lon, 1); return v === v ? `${T4.ll(lat, lon, 1)} · P/ETP = ${H.f(v, 2)} · ${aiCls(v)[1]}` : null; });
      let frac = {}; { let tot = 0; for (let j = 0; j < W.ny; j++) { const c = Math.cos((W.lat0 - (j + 0.5) * W.res) * H.D2R); for (let i = 0; i < W.nx; i++) { const v = W.AI[j * W.nx + i]; if (v === v) { tot += c; const n = aiCls(v)[1]; frac[n] = (frac[n] || 0) + c; } } } for (const k in frac) frac[k] = frac[k] / tot * 100; }
      aiCard.append(H.h('h3', {}, 'El índice de aridez: precipitación frente a evapotranspiración'),
        H.h('p', { class: 'sub' }, 'El PNUMA (UNEP) y la UNESCO (fig. 5.4) delimitan las tierras secas con el cociente entre la precipitación anual y la evapotranspiración potencial (P/ETP). Mapa calculado con TerraClimate 1991-2020 (ETP de Penman-Monteith).'),
        H.h('div', { class: 'viz framed' }, mcv),
        H.html(`<div class="legend">${AIC.map(([v, n, c]) => `<span><i style="background:rgb(${c});height:10px;width:14px"></i>${n} ${v < 1 ? '(< ' + H.f(v, 2) + ')' : '(≥ 0,65)'} · ${H.f(frac[n] || 0)} %</span>`).join('')}</div>`),
        H.html(`<p class="hint">Las tierras secas (P/ETP < 0,65) ocupan el ${H.f((frac['Hiperárido'] || 0) + (frac['Árido'] || 0) + (frac['Semiárido'] || 0) + (frac['Subhúmedo seco'] || 0))} % de las tierras emergidas sin la Antártida; hiperáridas, áridas y semiáridas, el ${H.f((frac['Hiperárido'] || 0) + (frac['Árido'] || 0) + (frac['Semiárido'] || 0))} %: el «tercio de la superficie terrestre» del manual.</p>`));
      el.append(aiCard);
    }

    /* ================= C · ¿por qué es desierto? ================= */
    const F = [['ap', 'Anticiclón subtropical (aire que desciende)'], ['ali', 'Alisios continentales (vientos secos que han cruzado tierra)'], ['cf', 'Corriente marina fría en la costa'],
      ['som', 'Sombra pluviométrica (montañas a barlovento)'], ['con', 'Lejanía del mar (continentalidad)'], ['apc', 'Anticiclón térmico continental en invierno']];
    const KEY = { gobi: ['con', 'som', 'apc'], karakum: ['con', 'som', 'apc'], victoria: ['ap', 'ali'], arabia: ['ap', 'ali'], sahara: ['ap', 'ali', 'con'], namib: ['cf', 'ap', 'som'], mojave: ['som', 'ap'], atacama: ['cf', 'ap', 'som'] };
    const TXT = {
      gobi: 'En el corazón de Asia, lejos de cualquier mar y protegido de los vientos húmedos por el Himalaya, el Tíbet y otras cordilleras. En invierno lo cubre el anticiclón siberiano, que envía aire frío y seco: su presión pasa de unos 1.003 hPa en julio a más de 1.030 en enero. Desierto de latitudes medias, frío en invierno (BWk).',
      karakum: 'En Asia central, al pie de las montañas de Irán y Afganistán, que cierran el paso a la humedad del Índico. Las borrascas del oeste llegan muy debilitadas tras cruzar el continente (o el Caspio, demasiado pequeño para recargarlas), y en invierno se extiende sobre la región el anticiclón siberiano.',
      victoria: 'Bajo el anticiclón subtropical del hemisferio sur, que hunde y reseca el aire, y barrido por alisios del sureste que llegan secos tras cruzar el continente. La corriente de Australia Occidental, fría pero débil, apenas influye en el interior.',
      arabia: 'Bajo el anticiclón subtropical y los vientos del norte (el shamal), que llegan secos del interior de Asia; el monzón del Índico no penetra en la península. Los mares que lo rodean (Rojo y Golfo Pérsico) son muy cálidos: aquí la aridez no se debe a una corriente fría.',
      sahara: 'El mayor desierto cálido: bajo la rama descendente de la célula de Hadley (el anticiclón subtropical) casi todo el año, barrido por el harmatán (un alisio continental del noreste) y con su interior a más de 1.000 km del mar. En su franja atlántica se suma la corriente fría de Canarias.',
      namib: 'Desierto costero: la corriente fría de Benguela y el afloramiento enfrían el aire desde abajo (el mar está unos 8 °C más frío que la media del océano a esa latitud), el anticiclón de Santa Elena lo estabiliza y la Gran Escarpadura africana frena la humedad que llega del este. Nieblas frecuentes y lluvia casi nula.',
      mojave: 'A sotavento de Sierra Nevada y de las sierras Transversales, que descargan la humedad de las borrascas del Pacífico; en verano lo cubre el anticiclón subtropical del Pacífico. La corriente fría de California estabiliza el aire costero, pero el Mojave está tierra adentro.',
      atacama: 'El desierto no polar más seco del mundo: la corriente de Humboldt y el afloramiento enfrían el aire (el mar está unos 5 °C por debajo de la media de su latitud), el anticiclón del Pacífico sur lo estabiliza y los Andes cierran el paso al aire húmedo de la Amazonia. Algunas estaciones pasan años sin lluvia.',
    };
    const D = (typeof DESIERTOS !== 'undefined' && DESIERTOS) || [];
    const dCard = H.h('div', { class: 'card' });
    dCard.append(H.h('h3', {}, '¿Por qué es desierto? (ejercicio 5 del manual)'),
      H.h('p', { class: 'sub' }, 'Elige un desierto, marca las causas que crees que lo explican y comprueba. Los datos de cada uno ayudan a razonar: presión, distancia al mar y temperatura del mar en la costa occidental a su misma latitud.'));
    let cur = D[0];
    const mcv2 = H.h('canvas');
    const Kw = T5.DATA().KMUNDO;
    const gK = Kw && Kw.K ? { near: (lat, lon) => T5.nn(Kw.K['91'][T5.combo()], Kw)(lat, lon) } : null;
    const mp2 = T4.map(mcv2, { bbox: [-180, 180, -50, 60], grid: 30, key: () => 'k' + T5.combo(), land: (lat, lon) => { if (!gK) return T4.LAND; const i = Math.round(gK.near(lat, lon, 1)); const t = KG.CODES[i - 1]; return t && t[0] === 'B' ? KG.COL[t] : t ? [232, 226, 210] : T4.LAND; },
      after: (ctx, P) => { D.forEach((d, i) => { const x = P.X(d.lon), y = P.Y(d.lat), on = d === cur; ctx.fillStyle = on ? '#1c2836' : '#fff'; ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, on ? 10 : 8, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = on ? '#fff' : '#1c2836'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, x, y + 0.5); }); } });
    mcv2.addEventListener('click', (e) => { if (!mp2.P) return; const [x, y] = mp2.pos(e); let b = null, bd = 18; D.forEach((d) => { const dd = Math.hypot(mp2.P.X(d.lon) - x, mp2.P.Y(d.lat) - y); if (dd < bd) { bd = dd; b = d; } }); if (b) { cur = b; updD(); } });
    const dSeg = H.h('div', { class: 'chipbar' });
    const checks = H.h('div', { class: 'opts' }), dOut = H.h('div'), dRo = H.h('div', { class: 'readouts', style: { margin: '8px 0' } });
    const chk = H.h('button', { class: 'btn acc sm', type: 'button' }, 'Comprobar');
    const updD = () => {
      mp2.redraw();
      dSeg.innerHTML = ''; D.forEach((d, i) => { const b = H.h('button', { class: 'chip' + (d === cur ? ' sel' : ''), type: 'button' }, `${i + 1}. ${d.name}`); b.onclick = () => { cur = d; updD(); }; dSeg.append(b); });
      checks.innerHTML = ''; F.forEach(([k, t]) => checks.append(H.h('label', { class: 'opt', style: { cursor: 'pointer' } }, H.h('input', { type: 'checkbox', value: k, style: { marginTop: '3px' } }), H.h('span', {}, t))));
      dOut.innerHTML = '';
      const w = cur.west && cur.west.km < 1500 ? cur.west : null;
      dRo.innerHTML = `<div class="ro"><div class="k">Precipitación anual</div><div class="v">${H.f(cur.p)} <small>mm (${cur.psrc})</small></div></div>
        <div class="ro"><div class="k">Distancia al mar</div><div class="v">${H.f(Math.round(cur.sea / 10) * 10)} <small>km</small></div></div>
        <div class="ro"><div class="k">Presión en enero / julio</div><div class="v">${H.f(cur.slp1, 0)} / ${H.f(cur.slp7, 0)} <small>hPa</small></div></div>
        <div class="ro ${w && w.anom < -2 ? 'bl' : ''}"><div class="k">Mar en la costa oeste${w ? ` (a ${H.f(Math.round(w.km / 10) * 10)} km)` : ''}</div><div class="v">${w ? `${T5.fT(w.sst)} <small>(${H.fs(w.anom, 1)} °C respecto a su latitud)</small>` : '<small>a más de 1.500 km</small>'}</div></div>`;
    };
    chk.onclick = () => {
      const key = KEY[cur.k], marked = H.$$('input', checks).filter((x) => x.checked).map((x) => x.value);
      H.$$('label.opt', checks).forEach((lb) => { const v = H.$('input', lb).value, inK = key.includes(v), m = marked.includes(v); lb.classList.remove('ok', 'ko'); if (inK) lb.classList.add('ok'); else if (m) lb.classList.add('ko'); });
      const hit = marked.filter((v) => key.includes(v)).length, extra = marked.filter((v) => !key.includes(v)).length;
      dOut.innerHTML = `<div class="fb show ${hit === key.length && !extra ? 'ok' : 'ko'}"><b>${hit} de ${key.length} causas principales${extra ? `, y ${extra} que no son decisivas aquí` : ''}.</b>${TXT[cur.k]}</div>`;
    };
    dCard.append(H.h('div', { class: 'viz framed' }, mcv2), H.h('div', { style: { height: '8px' } }), dSeg,
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, checks, H.h('div', { style: { marginTop: '8px' } }, chk), dOut), H.h('div', {}, dRo,
        H.html('<p class="small">En los desiertos subtropicales la presión no sube mucho: los anticiclones están centrados sobre los océanos y lo que seca el aire es su descenso. En el Gobi, en cambio, el salto de presión entre enero y julio delata el anticiclón térmico siberiano. En el Namib y Atacama el mar está muchos grados más frío que la media de su latitud: es la huella de la corriente fría y del afloramiento (Tema 4).</p>'))));
    T5.onOpt(() => mp2.redraw());
    if (gK) dCard.append(H.html('<p class="hint">En el mapa se colorean los climas secos de Köppen (1991-2020): rojos, los desiertos (BW); amarillos y anaranjados, las estepas (BS).</p>'));
    if (D.length) { el.append(dCard); updD(); }

    /* ================= D · desierto y estepa ================= */
    const cCard = H.h('div', { class: 'card' });
    cCard.append(H.h('h3', {}, 'Desierto y estepa, cálidos y fríos'), H.h('p', { class: 'sub' }, 'Climogramas de climas secos (normales 1991-2020). Las barras ocres son meses secos según Gaussen (P < 2T). Compara un desierto de latitudes bajas con uno de latitudes medias, como hace el manual en las figuras 5.5 y 5.6.'));
    const isB = (s) => T5.type(s)[0] === 'B';
    const mk = (id) => { const c = H.h('canvas'), cl = T3.climo(c, (w) => Math.min(w * 0.62, 280)); let s = T5.byId(id); const ro2 = H.h('p', { class: 'small' }); const sel = T5.stationSelect(id, (x) => { s = x; draw(); }, isB); const draw = () => { cl.draw(s, { title: T5.stLabel(s), sub: `${H.f(Math.abs(s.lat), 1)}° ${s.lat >= 0 ? 'N' : 'S'}` }); const st = KG.stats(s.ta.slice(0, 12), s.pr.slice(0, 12), s.lat); ro2.innerHTML = `${T5.chip(T5.type(s))} ${KG.NAME[T5.type(s)]} · amplitud anual ${H.f(st.Tmax - st.Tmin, 1)} °C · ${H.f(st.Pann)} mm · lluvia de verano ${H.f(100 - st.pw)} %`; }; T5.onOpt(draw); draw(); return H.h('div', {}, sel, H.h('div', { class: 'viz framed', style: { marginTop: '6px' } }, c), ro2); };
    cCard.append(H.h('div', { class: 'vs' }, mk('41030'), mk('51644')), H.html('<p class="hint">Son los dos desiertos de la fig. 5.5, con datos de 1991-2020. El desierto cálido (BWh, La Meca) tiene amplitud anual moderada y lluvias irregulares; el de latitudes medias (BWk, Kuqa, en la cuenca del Tarim), inviernos rigurosos, más de 30 °C de amplitud y la escasa lluvia en verano. Para las estepas de la fig. 5.6, prueba Reno (BSk) frente a Niamey (BSh), o Zaragoza frente a Almería.</p>'));
    el.append(cCard);

    el.append(H.fix('apartado 2.1 y cuadro 5.2', [
      'Cuadro 5.2: en los desiertos de la zona templada la amplitud térmica diaria no llega «hasta 90 °C»: lo habitual son 15-25 °C (es probable una errata por 30 °C). La que ronda los 30-40 °C es la amplitud <i>anual</i>.',
      'Cuadro 5.2: los desiertos costeros (Atacama, Namib) no tienen «vegetación bastante densa»: son de los más pobres del planeta; solo las nieblas mantienen algunas formaciones dispersas (las «lomas» de Perú y Chile).',
      '2.1.1: sí hay desiertos y estepas templados en el hemisferio sur: la Patagonia (BSk y BWk), a sotavento de los Andes, entre 40° y 50° S.',
      'El umbral e de Köppen no es la evapotranspiración potencial: compárala con el índice P/ETP del PNUMA (UNEP).']));
    el.append(H.selfCheck([
      { q: 'Según Köppen, un clima es seco si…', opts: ['Recibe menos de 250 mm al año', 'Su lluvia anual no llega al umbral e', 'No llueve en los meses de verano', 'La humedad relativa baja del 50 %'], a: 1, ex: 'El umbral depende de la temperatura y del reparto estacional de la lluvia: por eso Yakutsk (233 mm, −8 °C) no es seco y Zaragoza (326 mm, 16 °C) sí.' },
      { q: 'A igual temperatura, un clima es seco con más lluvia si esta cae…', opts: ['En invierno', 'En verano', 'En primavera', 'En forma de nieve'], a: 1, ex: 'En verano se evapora más: el umbral sube 280 mm si el 70 % o más de la lluvia cae en verano.' },
      { q: 'El desierto de Namib se explica sobre todo por…', opts: ['Su lejanía del mar y la continentalidad', 'La corriente fría de Benguela y el anticiclón', 'El anticiclón térmico siberiano', 'La altitud de la meseta sudafricana'], a: 1, ex: 'Es un desierto costero con nieblas: el mar frío enfría el aire desde abajo y lo estabiliza.' },
      { q: 'El Gobi es un desierto…', opts: ['Subtropical, de anticiclón dinámico', 'De latitudes medias, por continentalidad', 'Costero, por una corriente fría', 'Polar, por el frío extremo'], a: 1, ex: 'Lejanía del mar, montañas que lo rodean y anticiclón invernal; con inviernos muy fríos: BWk.' },
      { q: 'La amplitud térmica anual de los desiertos templados ronda…', opts: ['Unos 5 °C', 'Unos 30-40 °C', 'Unos 90 °C', 'Unos 15 °C'], a: 1, ex: 'El manual da unos 32 °C. Los «90 °C» del cuadro 5.2 se refieren a la amplitud diaria y son una errata: lo habitual son 15-25 °C.' },
    ]));
  },
});
