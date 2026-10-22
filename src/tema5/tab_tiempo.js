/* ===================== T · EL CLIMA EN EL TIEMPO ===================== */
H.tab({
  id: 'tiempo', nav: 'El clima en el tiempo', title: 'El clima en el tiempo',
  init(el) {
    el.append(H.intro('Clasificación de los climas · escala temporal (apartado 1.2.2)', 'El clima también cambia: de la última glaciación a hoy',
      'Los climas no son fijos. El manual distingue una escala paleoclimática (reconstruida con indicios geológicos y biológicos), una secular y otra reciente, y lo ilustra con el mapa del clima de hace 18.000 años (fig. 5.3) y una cronología de los últimos 10.000 años. Aquí ves la temperatura global reconstruida desde el Último Máximo Glaciar, el registro instrumental desde 1850 y cómo ha cambiado el clima de tu municipio entre las normales 1961-1990 y 1991-2020.',
      'Manual: 1.2.2<br>Fig. 5.3 y cronología'));

    const HC = T5.DATA().HADCRUT, LG = T5.DATA().LGMR;
    /* HadCRUT respecto a 1850-1900 */
    const hc = HC ? (() => { const base = HC.v.slice(0, 51).reduce((a, b) => a + b, 0) / 51; return HC.v.map((v, i) => ({ y: HC.y0 + i, v: v - base, lo: HC.lo[i] - base, hi: HC.hi[i] - base })); })() : [];
    const mean = (a, b) => { const s = hc.filter((x) => x.y >= a && x.y <= b); return s.reduce((p, x) => p + x.v, 0) / s.length; };

    /* ================= A · la curva larga ================= */
    const card = H.h('div', { class: 'card' });
    const cv = H.h('canvas'), ch = H.chart(cv, (w) => Math.min(w * 0.45, 360));
    const note = H.h('p', { class: 'small' });
    const views = LG && LG.gmst ? [['lgm', 'Desde hace 24.000 años'], ['hol', 'Holoceno (11.700 años)'], ['ins', '1850-2025']] : [['ins', '1850-2025']];
    let view = views[0][0];
    const seg = H.seg(views, view, (v) => { view = v; draw(); });
    const EV = [[21000, 'Último Máximo Glaciar'], [12900, 'Dryas Reciente'], [11700, 'comienza el Holoceno'], [8200, 'evento 8,2 ka'], [4200, 'evento 4,2 ka']];
    const draw = () => {
      if (view === 'ins') {
        const yMin = -0.6, yMax = 1.7;
        ch.draw({ xMin: 1850, xMax: 2026, yMin, yMax, pad: { l: 58 },
          xTicks: [1850, 1875, 1900, 1925, 1950, 1975, 2000, 2025].map((v) => ({ v })), yTicks: [-0.5, 0, 0.5, 1, 1.5].map((v) => ({ v, label: H.fs(v, 1) })), yLabel: '°C respecto a 1850-1900',
          bands: [{ x0: 1961, x1: 1990, color: 'rgba(31,111,139,.10)' }, { x0: 1991, x1: 2020, color: 'rgba(180,83,29,.12)' }],
          series: [{ pts: hc.map((x) => [x.y, x.v]), color: 'rgba(28,40,54,.55)', width: 1.4 },
            { pts: hc.map((x, i) => [x.y, i >= 5 && i < hc.length - 5 ? hc.slice(i - 5, i + 6).reduce((a, b) => a + b.v, 0) / 11 : null]), color: '#b0393a', width: 2.8 },
            { pts: [[1961, mean(1961, 1990)], [1990, mean(1961, 1990)]], color: '#1f6f8b', width: 3 }, { pts: [[1991, mean(1991, 2020)], [2020, mean(1991, 2020)]], color: '#b4531d', width: 3 }],
          after: (ctx, X, Y) => { ctx.font = 'bold 10.5px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#1f6f8b'; ctx.fillText('normal 1961-1990', X(1975.5), Y(mean(1961, 1990)) - 4); ctx.fillStyle = '#b4531d'; ctx.fillText('normal 1991-2020', X(2005.5), Y(mean(1991, 2020)) - 4); const r = hc.reduce((a, b) => (b.v > a.v ? b : a)); ctx.fillStyle = '#b0393a'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(`${r.y}: ${H.fs(r.v, 2)} °C`, X(r.y) - 8, Y(r.v));
            ctx.strokeStyle = 'rgba(176,57,58,.7)'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(1850), Y(1.5)); ctx.lineTo(X(2026), Y(1.5)); ctx.stroke(); ctx.setLineDash([]);
            ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.font = '10.5px system-ui'; ctx.fillText('1,5 °C, límite del Acuerdo de París (para medias de 20 años)', X(1852), Y(1.5) - 2); } });
        note.innerHTML = `Temperatura media global (HadCRUT5) respecto a 1850-1900. Línea fina: cada año; gruesa: media móvil de 11 años. La normal 1991-2020 es ${H.f(mean(1991, 2020) - mean(1961, 1990), 2)} °C más cálida que la de 1961-1990; la media de 2015-2024 supera en ${H.f(mean(2015, 2024), 2)} °C la de 1850-1900, y 2024 fue el primer año natural por encima de 1,5 °C.`;
        return;
      }
      const g = LG.gmst, ka = view === 'lgm' ? 24 : 12;
      const pts = g.age.map((a, i) => [-a, g.p50[i]]).filter((p) => -p[0] <= ka * 1000);
      const band = g.age.map((a, i) => [-a, g.p5[i], g.p95[i]]).filter((p) => -p[0] <= ka * 1000);
      const inst = hc.length ? hc.filter((x) => x.y >= 1850).map((x) => [x.y - 1950, x.v + (g.off || 0)]) : [];
      const all = pts.map((p) => p[1]).concat(band.map((p) => p[1]), inst.map((p) => p[1]));
      const yMin = Math.floor(Math.min(...all)), yMax = Math.ceil(Math.max(...all) * 2) / 2;
      ch.draw({ xMin: -ka * 1000, xMax: 120, yMin, yMax, pad: { l: 58 },
        xTicks: Array.from({ length: ka / 2 + 1 }, (_, i) => ({ v: -ka * 1000 + i * 2000, label: i === ka / 2 ? 'hoy' : H.f((ka - i * 2)) + ' ka' })), yTicks: Array.from({ length: yMax - yMin + 1 }, (_, i) => ({ v: yMin + i, label: H.fs(yMin + i, 0) })), yLabel: '°C respecto a la era preindustrial',
        series: [{ pts: band.map((p) => [p[0], p[2]]), color: 'rgba(31,111,139,.25)', width: 1 }, { pts: band.map((p) => [p[0], p[1]]), color: 'rgba(31,111,139,.25)', width: 1 }, { pts, color: '#1f6f8b', width: 2.6 }, { pts: inst, color: '#b0393a', width: 2 }],
        after: (ctx, X, Y) => {
          ctx.fillStyle = 'rgba(31,111,139,.12)'; ctx.beginPath(); band.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[2])) : ctx.moveTo(X(p[0]), Y(p[2])))); for (let i = band.length - 1; i >= 0; i--) ctx.lineTo(X(band[i][0]), Y(band[i][1])); ctx.fill();
          ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
          EV.filter(([a]) => a <= ka * 1000).forEach(([a, t], k) => { const x = X(-a); ctx.strokeStyle = 'rgba(28,40,54,.25)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x, ch.h - 38); ctx.stroke(); ctx.setLineDash([]); ctx.fillText(t, x + 3, 16 + (k % 2) * 12); });
        } });
      note.innerHTML = `Azul: temperatura media global reconstruida por Osman y otros (2021) a partir de indicadores marinos y de un modelo climático (mediana y margen del 90 %), en intervalos de 200 años. Rojo: el registro instrumental (HadCRUT5, 1850-2025), en la misma escala. El calentamiento de la deglaciación (unos ${H.f(g.dLGM || 7, 0)} °C) tardó unos 10.000 años; el actual, más de 1 °C, ha tardado 150.`;
    };
    card.append(H.h('h3', {}, 'La temperatura del planeta'), seg, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cv), note);
    el.append(card);
    draw();

    /* ================= B · el mapa del Último Máximo Glaciar ================= */
    if (LG && LG.map) {
      const M = LG.map, gm = T4.grid(M.d, M);
      const mc = H.h('div', { class: 'card' });
      const col = T4.ramp([[-25, [40, 30, 110]], [-15, [60, 90, 180]], [-8, [110, 160, 215]], [-4, [190, 220, 235]], [-1, [245, 245, 240]], [1, [250, 230, 210]]]);
      const mcv = H.h('canvas');
      const mp = T4.map(mcv, { bbox: [-180, 180, -78, 82], grid: 30, land: (lat, lon) => col(gm.at(lat, lon)) || T4.LAND, color: (lat, lon) => { const c = col(gm.at(lat, lon)); return c ? H.mix(c, [255, 255, 255], 0.35) : null; } });
      T4.hover(mcv, mp, (lat, lon) => { const v = gm.at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)} · ${H.fs(v, 1)} °C` : null; });
      mc.append(H.h('h3', {}, `El Último Máximo Glaciar, hace unos ${H.f(M.ka || 21)}.000 años`),
        H.h('p', { class: 'sub' }, `Diferencia de la temperatura media anual del aire en superficie entre el Último Máximo Glaciar (${M.lab || '19.000-23.000 años'}) y la época preindustrial, según la reanálisis de Osman y otros (2021). Sustituye la fig. 5.3, que reproduce la reconstrucción CLIMAP de 1976.`),
        H.h('div', { class: 'viz framed' }, mcv), T3.legend(col, -25, 1, [-25, -20, -15, -10, -5, 0], (v) => H.fs(v) + ' °C'),
        H.html('<p class="hint">El enfriamiento fue máximo sobre los grandes mantos de hielo de Norteamérica y Escandinavia (más de 20 °C) y mucho menor en los trópicos (2-4 °C), aunque mayor que el que daba CLIMAP. El nivel del mar estaba unos 125 m más bajo (Tema 4, «Nivel del mar»).</p>'));
      el.append(mc);
    }

    /* ================= C · tu municipio: 1961-1990 frente a 1991-2020 ================= */
    const mu = H.h('div', { class: 'card' });
    const cvM = H.h('canvas'), chM = H.chart(cvM, (w) => Math.min(w * 0.45, 280));
    const muRo = H.h('div', { class: 'readouts' });
    const updM = () => {
      const c = T5.placeClimate();
      if (!c.T61) { muRo.innerHTML = `<div class="ro wide"><div class="v"><small>La comparación entre las dos normales usa los datos de TerraClimate de cada municipio. ${H.place.es ? '' : 'Elige un municipio español.'}</small></div></div>`; chM.draw({ xMin: 0.5, xMax: 12.5, yMin: 0, yMax: 1, series: [] }); return; }
      const d = c.T.map((t, i) => t - c.T61[i]), dA = d.reduce((a, b) => a + b, 0) / 12;
      const p91 = c.P.reduce((a, b) => a + b, 0), p61 = c.P61.reduce((a, b) => a + b, 0);
      const t91 = KG.type(c.T, c.P, c.lat, T5.opt), t61 = KG.type(c.T61, c.P61, c.lat, T5.opt);
      const lo = Math.floor(Math.min(...c.T, ...c.T61) / 5) * 5, hi = Math.ceil(Math.max(...c.T, ...c.T61) / 5) * 5;
      chM.draw({ xMin: 0.5, xMax: 12.5, yMin: lo, yMax: hi, pad: { l: 40 }, xTicks: H.MES3.map((m, i) => ({ v: i + 1, label: m })), yTicks: Array.from({ length: (hi - lo) / 5 + 1 }, (_, i) => ({ v: lo + i * 5, label: lo + i * 5 + '°' })),
        series: [{ pts: c.T61.map((t, i) => [i + 1, t]), color: '#1f6f8b', width: 2.4 }, { pts: c.T.map((t, i) => [i + 1, t]), color: '#b4531d', width: 2.8 }] });
      muRo.innerHTML = `<div class="ro"><div class="k">1961-1990</div><div class="v">${T5.chip(t61)} <small>${T5.fT(c.T61.reduce((a, b) => a + b, 0) / 12)} · ${H.f(p61)} mm</small></div></div>
        <div class="ro hl"><div class="k">1991-2020</div><div class="v">${T5.chip(t91)} <small>${T5.fT(c.T.reduce((a, b) => a + b, 0) / 12)} · ${H.f(p91)} mm</small></div></div>
        <div class="ro bl"><div class="k">Cambio</div><div class="v">${H.fs(dA, 1)} °C <small>· ${H.fs((p91 / p61 - 1) * 100, 0)} % de lluvia · más en ${H.MESES[d.indexOf(Math.max(...d))]}</small></div></div>
        ${t61 !== t91 ? `<div class="ro wide"><div class="v"><small>Tu municipio ha cambiado de tipo de Köppen: de ${T5.chip(t61)} a ${T5.chip(t91)}. Mira en la pestaña «España» cuántos municipios lo han hecho.</small></div></div>` : ''}`;
    };
    mu.append(H.h('h3', {}, 'Las normales cambian: tu municipio'), H.h('p', { class: 'sub' }, 'Temperatura media de cada mes en tu municipio con las dos normales (TerraClimate). Los climogramas del manual usan las series 1961-1990 y 1971-2000; las de los interactivos, la vigente 1991-2020.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvM), H.html('<div class="legend"><span><i style="background:#1f6f8b"></i>1961-1990</span><span><i style="background:#b4531d"></i>1991-2020</span></div>')), muRo));
    H.onPlace(updM); T5.onOpt(updM);
    el.append(mu);
    updM();

    /* ================= D · cronología ================= */
    const cr = H.h('div', { class: 'card' });
    const ROWS = [
      ['Hace 26.000-19.000 años', 'Último Máximo Glaciar', 'Mantos de hielo de 3-4 km de espesor sobre Norteamérica y el norte de Europa; temperatura global unos 6 °C más baja que en la era preindustrial (Tierney y otros, 2020); nivel del mar 120-130 m más bajo.'],
      ['19.000-11.700', 'Deglaciación', 'Calentamiento irregular: el Bølling-Allerød (14.700-12.900) y el frío brusco del Dryas Reciente (12.900-11.700), cuando el norte de Europa volvió casi a condiciones glaciares.'],
      ['Desde 11.700', 'Holoceno', 'Interglaciar actual. Entre 14.500 y 5.000 años el monzón africano llegaba al Sahara («Sahara verde»).'],
      ['Hace 8.200 años', 'Evento 8,2 ka', 'Enfriamiento de unos 150 años en el Atlántico Norte tras el vaciado del lago glaciar Agassiz.'],
      ['Hace 4.200 años', 'Evento 4,2 ka', 'Sequías prolongadas de Mesopotamia al Nilo y la India; marca el comienzo del Meghalayense, el último piso del Holoceno.'],
      ['950-1250 d. C.', 'Anomalía Climática Medieval', 'Calor en el Atlántico Norte (colonización vikinga de Groenlandia) y megasequías en el oeste de Norteamérica (la «gran sequía» de 1276-1299 del suroeste de Estados Unidos).'],
      ['1300-1850', 'Pequeña Edad del Hielo', 'Avance de los glaciares alpinos, con máximos hacia 1640, 1820 y 1850; inviernos rigurosos en Europa. No fue un frío simultáneo en todo el planeta.'],
      ['1945-1975', 'Ligero enfriamiento del hemisferio norte', 'Unas décimas de grado, atribuidas sobre todo a los aerosoles de la contaminación industrial.'],
      ['Desde 1975', 'Calentamiento actual', `Unos 0,2 °C por década. La media de 2015-2024 supera en ${hc.length ? H.f(mean(2015, 2024), 1) : '1,3'} °C la de 1850-1900; los glaciares retroceden en todo el mundo y el nivel del mar sube más de 4 mm al año.`]];
    cr.innerHTML = `<h3>Cronología: de la última glaciación a hoy</h3>
      <p class="sub">Sustituye la tabla «Cronología del clima en los últimos 10.000 años» del manual, que tiene filas descolocadas y termina en 1960.</p>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:16%">Cuándo</th><th style="width:20%">Qué</th><th>Rasgos</th></tr></thead><tbody>${ROWS.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div>`;
    el.append(cr);

    el.append(H.fix('fig. 5.3 y cronología del apartado 1.2.2', [
      'El Último Máximo Glaciar se sitúa hace unos 21.000 años de calendario (entre 26.000 y 19.000); los «18.000 años» de la fig. 5.3 son años de radiocarbono, la escala que usaba CLIMAP (1976). CLIMAP subestimó el enfriamiento de los mares tropicales: el enfriamiento global fue de unos 6 °C.',
      'La tabla de cronología tiene filas descolocadas («Islandia: hielo en el Nilo», «México: Mar Negro helado», «África: recesión glacial (período vikingo)»…) y se detiene en 1960 con un «descenso de la temperatura a escala mundial». Desde entonces la temperatura global ha subido más de 1 °C.']));
    el.append(H.selfCheck([
      { q: 'Durante el Último Máximo Glaciar, la temperatura media global era…', opts: ['Unos 0,5 °C más baja que hoy', 'Unos 6 °C más baja que en la era preindustrial', 'Unos 20 °C más baja en todo el planeta', 'Igual que hoy'], a: 1, ex: 'Con más de 20 °C menos sobre los mantos de hielo y 2-4 °C menos en los trópicos.' },
      { q: 'La normal climatológica vigente es…', opts: ['1961-1990', '1971-2000', '1991-2020', '2001-2030'], a: 2, ex: 'La OMM la actualiza cada diez años; los climogramas del manual usan 1961-1990 y 1971-2000.' },
      { q: 'El Holoceno comenzó hace…', opts: ['2.000 años', '11.700 años', '21.000 años', '2,6 millones de años'], a: 1, ex: 'Al terminar el Dryas Reciente.' },
      { q: 'La media de la temperatura global de 2015-2024 respecto a 1850-1900 es de unos…', opts: ['+0,2 °C', '+1,3 °C', '+3 °C', '−0,5 °C'], a: 1, ex: 'Según HadCRUT5; 2024 superó por primera vez 1,5 °C en un año natural.' },
    ]));
  },
});
