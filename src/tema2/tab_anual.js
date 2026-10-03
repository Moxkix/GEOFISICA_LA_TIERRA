/* ===================== T · CICLO ANUAL Y RÉGIMEN TÉRMICO ===================== */
H.tab({
  id: 'anual', nav: 'Régimen térmico', title: 'Ciclo anual y régimen térmico',
  init(el) {
    el.append(H.intro('La temperatura · apartado 6.1.2', 'Variaciones estacionales y régimen térmico',
      'La sucesión de las temperaturas medias de los doce meses, calculadas sobre un periodo de al menos 30 años, es el régimen térmico de un lugar. Sigue a la insolación, pero con un retraso de alrededor de un mes en los continentes y mayor junto al mar. La latitud fija la forma de la curva; la continentalidad, su amplitud.',
      'Manual: 6.1.2<br>Fig. 2.13'));

    /* ---------- A · régimen de una estación ---------- */
    const s = { st: T2.myStation().s };
    const ch = H.chart(H.h('canvas'), 0.5);
    const ro = { med: H.ro('Media anual'), cal: H.ro('Mes más cálido', 'hl'), fri: H.ro('Mes más frío', 'bl'), amp: H.ro('Amplitud térmica anual'), ins: H.ro('Máximo de insolación'), lag: H.ro('Retraso del máximo térmico') };
    const info = H.h('p', { class: 'small' });
    const draw = () => {
      const st = s.st, ta = st.ta.slice(0, 12), x = ta.map((v, i) => [i + 1, v]);
      const ins = T2.monthlyTOA(st.lat), imax = Math.max(...ins);
      const all = ta.concat(st.tx ? st.tx.slice(0, 12) : [], st.tn ? st.tn.slice(0, 12) : []);
      const lo = Math.floor(Math.min(...all) / 5) * 5 - (Math.min(...all) % 5 === 0 ? 5 : 0), hi = Math.ceil(Math.max(...all) / 5) * 5 + 5;
      const yt = []; for (let v = lo; v <= hi; v += hi - lo > 40 ? 10 : 5) yt.push({ v, label: v + '°' });
      ch.draw({ xMin: 0.5, xMax: 12.5, yMin: lo, yMax: hi, xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: yt, yLabel: 'Temperatura (°C)', pad: { r: 56 },
        hlines: lo < 0 && hi > 0 ? [{ y: 0, color: 'rgba(31,111,139,.5)', dash: [2, 3] }] : [],
        series: [{ pts: ins.map((v, i) => [i + 1, lo + v / Math.max(1, imax) * (hi - lo) * 0.92]), color: 'rgba(226,167,42,.9)', width: 2, dash: [6, 4] }, { pts: x, color: '#b4531d', width: 3 }],
        after: (ctx, X, Y, w, h) => {
          if (st.tx && st.tn) { ctx.fillStyle = 'rgba(180,83,29,.12)'; ctx.beginPath(); st.tx.slice(0, 12).forEach((v, i) => (i ? ctx.lineTo(X(i + 1), Y(v)) : ctx.moveTo(X(i + 1), Y(v)))); for (let i = 11; i >= 0; i--) ctx.lineTo(X(i + 1), Y(st.tn[i])); ctx.closePath(); ctx.fill(); }
          ta.forEach((v, i) => { ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.arc(X(i + 1), Y(v), 3.5, 0, 7); ctx.fill(); });
          ctx.fillStyle = '#a8741a'; ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          for (const f of [0, 0.5, 1]) { const y = Y(lo + f * (hi - lo) * 0.92); ctx.fillText(H.f(f * imax), w - 52, y); }
          ctx.save(); ctx.translate(w - 8, (Y(lo) + Y(hi)) / 2); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Insolación en el techo de la atmósfera (W/m²)', 0, 0); ctx.restore();
        } });
      const imx = ta.indexOf(Math.max(...ta)), imn = ta.indexOf(Math.min(...ta));
      ro.med.v.textContent = T2.fT(st.ta[12]);
      ro.cal.v.innerHTML = `${T2.fT(ta[imx])} <small>${H.MESES[imx]}</small>`;
      ro.fri.v.innerHTML = `${T2.fT(ta[imn])} <small>${H.MESES[imn]}</small>`;
      ro.amp.v.innerHTML = `${H.f(ta[imx] - ta[imn], 1)} <small>°C</small>`;
      const hT = T2.harmonic(ta, T2.MID);
      const dI = []; const vI = []; for (let d = 1; d <= 365; d += 5) { const sn = H.sun(H.dateFromDoy(d).getTime()); dI.push(d); vI.push(H.toaInsolation(st.lat, sn.decl, sn.R)); }
      const hI = T2.harmonic(vI, dI);
      ro.ins.v.textContent = H.fdate(H.dateFromDoy(Math.round(hI.dayMax) || 1));
      let lag = ((hT.dayMax - hI.dayMax) % 365 + 365) % 365; if (lag > 182) lag -= 365;
      ro.lag.v.innerHTML = hT.amp < 1 ? '<small>sin estaciones térmicas claras</small>' : `${H.f(lag)} <small>días</small>`;
      info.innerHTML = `Normales 1991–2020 de <b>${T2.stLabel(st)}</b> (${H.f(Math.abs(st.lat), 1)}° ${st.lat >= 0 ? 'N' : 'S'}, ${H.f(st.elev)} m). Línea: media mensual; banda: entre la máxima y la mínima medias; discontinua: insolación diaria en el techo de la atmósfera a esa latitud. El retraso se calcula con el primer armónico de ambas curvas.${st.lat < 0 ? ' Hemisferio sur: el verano corresponde a diciembre–febrero.' : ''}`;
    };
    const stSel = T2.stationSelect(s.st.id, (st) => { s.st = st; draw(); });
    const meBtn = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, 'Estación de mi municipio');
    meBtn.onclick = () => { s.st = T2.myStation().s; stSel.set(s.st.id); draw(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El régimen térmico de una estación'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, ch.st.canvas),
        H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Estación'), H.h('div', { class: 'row' }, stSel, meBtn)),
          H.h('div', { class: 'readouts' }, ro.med, ro.amp, ro.cal, ro.fri, ro.ins, ro.lag), info))));
    draw();
    H.onPlace(() => { s.st = T2.myStation().s; stSel.set(s.st.id); draw(); });

    /* ---------- B · comparador ---------- */
    const PRE = [
      ['Del ecuador al polo', ['48698', '8222', '24959', '71018']],
      ['Mismo paralelo: oceánico y continental', ['3953', '12375', '28698', '30710']],
      ['Mediterráneos de ambos hemisferios', ['8222', '85577', '94608', '68816']],
      ['España: costa e interior', ['8001', '8285', '8222', '8235']],
      ['Desierto y monzón', ['62366', '61052', '48455', '94120']],
      ['La altitud', ['60020', '60010', '8222', '8215']],
    ];
    const COLS = ['#b4531d', '#1f6f8b', '#2d7a4c', '#6b4fa0'];
    const cmp = { ids: PRE[0][1].slice() };
    const cch = H.chart(H.h('canvas'), 0.5); const tbl = H.h('div');
    const sels = COLS.map((c, k) => T2.stationSelect(cmp.ids[k], (st) => { cmp.ids[k] = st.id; drawC(); }));
    const drawC = () => {
      const st = cmp.ids.map(T2.byId);
      const all = st.flatMap((x) => x.ta.slice(0, 12)), lo = Math.floor(Math.min(...all) / 5) * 5, hi = Math.ceil(Math.max(...all) / 5) * 5;
      const yt = []; for (let v = lo; v <= hi; v += hi - lo > 40 ? 10 : 5) yt.push({ v, label: v + '°' });
      cch.draw({ xMin: 0.5, xMax: 12.5, yMin: lo, yMax: hi, xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: yt, yLabel: 'Temperatura media (°C)', hlines: lo < 0 && hi > 0 ? [{ y: 0, color: 'rgba(31,111,139,.5)', dash: [2, 3] }] : [],
        series: st.map((x, k) => ({ pts: x.ta.slice(0, 12).map((v, i) => [i + 1, v]), color: COLS[k], width: 3 })) });
      tbl.innerHTML = `<div style="overflow-x:auto"><table class="t flowtable"><thead><tr><th>Estación</th><th>Latitud</th><th>Media</th><th>Amplitud</th><th>Mes más cálido</th><th>Mes más frío</th></tr></thead><tbody>${st.map((x, k) => { const ta = x.ta.slice(0, 12), a = ta.indexOf(Math.max(...ta)), b = ta.indexOf(Math.min(...ta)); return `<tr><td><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${COLS[k]};margin-right:6px;vertical-align:-1px"></span><b>${T2.stLabel(x)}</b></td><td class="n">${H.f(Math.abs(x.lat), 1)}° ${x.lat >= 0 ? 'N' : 'S'}</td><td class="n">${T2.fT(x.ta[12])}</td><td class="n">${H.f(T2.amp(x), 1)} °C</td><td>${H.MESES[a]}</td><td>${H.MESES[b]}</td></tr>`; }).join('')}</tbody></table></div>`;
    };
    const chips = H.h('div', { class: 'chipbar' });
    PRE.forEach(([l, ids]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { cmp.ids = ids.slice(); sels.forEach((x, k) => x.set(ids[k])); drawC(); }; chips.append(b); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Comparador de regímenes térmicos'),
      H.h('p', { class: 'sub' }, `Elige una comparación o cualquier combinación de las ${T2.ST.length} estaciones disponibles (todas las principales de España y una selección mundial).`),
      chips, H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', { class: 'viz' }, cch.st.canvas), H.h('div', {}, ...sels.map((x, k) => H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab', style: { color: COLS[k] } }, 'Estación ' + (k + 1)), x)))), tbl));
    drawC();

    /* ---------- C · práctica ---------- */
    const pr = H.h('div');
    const newPr = () => {
      const es = T2.ST.filter((x) => x.es), st = es[Math.floor(Math.random() * es.length)], m = Math.floor(Math.random() * 12);
      const nd = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
      const vals = []; for (let d = 0; d < nd; d++) vals.push(Math.round((st.ta[m] + (Math.random() - 0.5) * 7 + Math.sin(d / 3) * 1.5) * 10) / 10);
      const mean = vals.reduce((a, v) => a + v, 0) / nd;
      const w = T2.ST.filter((x) => !x.es)[Math.floor(Math.random() * 82)], wt = w.ta.slice(0, 12);
      pr.innerHTML = '';
      pr.append(H.h('p', {}, `1. Temperaturas medias diarias de ${H.MESES[m]} de un año en ${st.name}. Calcula la temperatura media mensual:`),
        H.html(`<p class="small" style="line-height:1.9;color:var(--ink)">${vals.map((v) => `<span class="kbd">${H.f(v, 1)}</span>`).join(' ')}</p>`));
      const i1 = H.h('input', { type: 'number', step: '0.01', style: { flex: '0 0 140px' } }), r1 = H.h('span');
      const b1 = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar'); b1.onclick = () => { const v = parseFloat(String(i1.value).replace(',', '.')); r1.innerHTML = Math.abs(v - mean) < 0.06 ? ' <span class="pill ok">Correcto</span>' : ` <span class="pill ko">No: suma ${H.f(vals.reduce((a, x) => a + x, 0), 1)} / ${nd} días = ${H.f(mean, 2)} °C</span>`; };
      pr.append(H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, i1, H.h('span', { style: { flex: 'none' } }, b1)), r1);
      pr.append(H.h('p', { style: { marginTop: '14px' } }, `2. Régimen térmico de ${T2.stLabel(w)} (°C): ${wt.map((v, i) => H.MES3[i] + ' ' + H.f(v, 1)).join(' · ')}. ¿Cuál es su amplitud térmica anual?`));
      const i2 = H.h('input', { type: 'number', step: '0.1', style: { flex: '0 0 140px' } }), r2 = H.h('span');
      const b2 = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar'); b2.onclick = () => { const v = parseFloat(String(i2.value).replace(',', '.')); const a = Math.max(...wt) - Math.min(...wt); r2.innerHTML = Math.abs(v - a) < 0.06 ? ' <span class="pill ok">Correcto</span>' : ` <span class="pill ko">No: ${H.f(Math.max(...wt), 1)} − (${H.f(Math.min(...wt), 1)}) = ${H.f(a, 1)} °C</span>`; };
      pr.append(H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, i2, H.h('span', { style: { flex: 'none' } }, b2)), r2, H.h('p', {}, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newPr }, 'Otros datos')));
    };
    newPr();
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Practica: media mensual y amplitud anual'), pr));

    el.append(H.fix('recuadro «Temperaturas medias mensuales»', ['Las normales climatológicas se calculan sobre periodos de 30 años; el periodo de referencia vigente de la OMM es <b>1991–2020</b>, el que usan todos los datos de esta pestaña.']));
    el.append(H.selfCheck([
      { q: '¿Qué es el régimen térmico de un lugar?', opts: ['La temperatura media anual', 'La sucesión de las temperaturas medias mensuales a lo largo del año, sobre un periodo largo', 'La diferencia entre la máxima y la mínima absolutas', 'El número de días de helada'], a: 1, ex: 'Se representa con las doce medias mensuales calculadas, al menos, sobre 30 años.' },
      { q: 'En el interior de la Península, el mes más cálido suele ser julio y no junio porque…', opts: ['En julio el Sol está más alto', 'El calentamiento del suelo y del aire se retrasa respecto a la insolación', 'En julio la Tierra está más cerca del Sol', 'En junio llueve más'], a: 1, ex: 'Como en el ciclo diario, la temperatura sigue subiendo mientras el balance sea positivo; el retraso es de unas 4 semanas en los continentes.' },
      { q: '¿Dónde es menor la amplitud térmica anual?', opts: ['En Yakutsk', 'En Madrid', 'En Singapur', 'En Pekín'], a: 2, ex: 'En el ecuador la insolación apenas cambia a lo largo del año: Singapur tiene una amplitud de ≈ 2 °C.' },
      { q: 'En Santiago de Chile o Perth, el mes más frío es…', opts: ['Enero', 'Abril', 'Julio', 'Octubre'], a: 2, ex: 'Están en el hemisferio sur: el invierno corresponde a junio–agosto.' },
      { q: 'En una estación costera oceánica, como Valentia, el mes más cálido es…', opts: ['Junio', 'Julio', 'Agosto', 'Diciembre'], a: 2, ex: 'Junto al mar, el retraso respecto a la insolación es mayor: en Valentia el máximo llega en agosto, casi dos meses después del solsticio.' },
    ]));
  },
});
