/* ===================== AGUAS MARINAS · COMPOSICIÓN, TEMPERATURA Y SALINIDAD ===================== */
H.tab({
  id: 'salinidad', nav: 'Salinidad', title: 'Composición, temperatura y salinidad del mar',
  init(el) {
    el.append(H.intro('Las aguas marinas · apartado 1.1 y fig. 4.3', 'Un océano salado, cálido arriba y desigual según la latitud',
      'El océano cubre el 71 % de la superficie terrestre y guarda el 96,5 % del agua del planeta. Cada kilo de agua de mar lleva disueltos unos 35 g de sales, siempre en las mismas proporciones. La temperatura y la salinidad de la superficie cambian con la latitud y con las estaciones según el balance de calor y el balance entre evaporación, lluvia, ríos y hielo.',
      'Manual: 1.1, 1.2<br>Figs. 4.1 y 4.3'));
    const O = OCEANO || {};
    const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 };
    const sst = O.sst ? O.sst.map((a) => T4.grid(a, G1)) : null;
    const sss = O.sss ? O.sss.map((a) => T4.grid(a, G1)) : null;
    const ice = O.ice && O.iceOK ? O.ice.map((a) => T4.grid(a, G1)) : null;
    const EP = O.ep ? O.ep.map((a) => T4.grid(a, G1)) : O.e && O.p ? O.e.map((e, m) => T4.grid(e.map((v, i) => v - O.p[m][i]), G1)) : null;
    const annual = (arr) => (arr ? T4.grid(T4.meanLayers(arr.map((g) => g.data)), G1) : null);
    const sstA = annual(sst), sssA = annual(sss), epA = annual(EP);

    /* ================= A · composición ================= */
    const IONS = [['Cloruro (Cl⁻)', 19.35, '#1f6f8b'], ['Sodio (Na⁺)', 10.78, '#5b9bb8'], ['Sulfato (SO₄²⁻)', 2.71, '#c08a1e'], ['Magnesio (Mg²⁺)', 1.28, '#7a5aa8'], ['Calcio (Ca²⁺)', 0.41, '#5b8f3e'], ['Potasio (K⁺)', 0.40, '#b4531d'], ['Bicarbonato (HCO₃⁻)', 0.14, '#8a877e'], ['Otros (Br⁻, Sr²⁺, B…)', 0.10, '#c9c6bd']];
    const tot = IONS.reduce((a, b) => a + b[1], 0);
    let svg = '<svg viewBox="0 0 240 240" role="img" aria-label="Composición de las sales del agua del mar">', a0 = -Math.PI / 2;
    for (const [n, v, c] of IONS) { const a1 = a0 + v / tot * 2 * Math.PI, large = a1 - a0 > Math.PI ? 1 : 0; svg += `<path d="M120 120 L${120 + 100 * Math.cos(a0)} ${120 + 100 * Math.sin(a0)} A100 100 0 ${large} 1 ${120 + 100 * Math.cos(a1)} ${120 + 100 * Math.sin(a1)} Z" fill="${c}" stroke="#fff" stroke-width="1.5"><title>${n}: ${H.f(v, 2)} g/kg</title></path>`; a0 = a1; }
    svg += `<circle cx="120" cy="120" r="52" fill="#fffdf8"/><text x="120" y="114" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#1c2836">35 g</text><text x="120" y="134" text-anchor="middle" font-size="11" fill="#5a6878">por kg de agua</text></svg>`;
    const leg = IONS.map(([n, v, c]) => `<tr><td><span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${c};margin-right:6px"></span>${n}</td><td style="text-align:right">${H.f(v, 2)} g/kg</td><td style="text-align:right">${H.f(v / tot * 100, 1)} %</td></tr>`).join('');
    el.append(H.h('div', { class: 'grid2' },
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Las sales del agua del mar'),
        H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'viz', html: svg, style: { maxWidth: '260px', margin: '0 auto' } }),
          H.html(`<div><table class="t small"><thead><tr><th>Ion</th><th style="text-align:right">S = 35</th><th style="text-align:right">%</th></tr></thead><tbody>${leg}</tbody></table></div>`)),
        H.html(`<p class="small">El cloruro y el sodio forman el 86 % de las sales: expresado como cloruro sódico serían unos 27 g por kilo. La proporción entre los iones es casi la misma en todo el océano (principio de Marcet-Dittmar); lo que cambia de un lugar a otro es la cantidad total de agua que los diluye. Por eso basta medir la conductividad eléctrica del agua para conocer su salinidad, que hoy se expresa sin unidades en la escala práctica (antes, en «tanto por mil», ‰).</p>`)),
      H.h('div', { class: 'card' }, H.h('h3', {}, 'El océano en cifras'),
        H.html(`<div class="readouts">
          <div class="ro hl"><div class="k">Superficie</div><div class="v">361 <small>millones de km² (70,8 %)</small></div></div>
          <div class="ro"><div class="k">Volumen</div><div class="v">1.335 <small>millones de km³</small></div></div>
          <div class="ro"><div class="k">Profundidad media</div><div class="v">3.700 <small>m</small></div></div>
          <div class="ro bl"><div class="k">Agua de la Tierra</div><div class="v">96,5 <small>%</small></div></div>
          <div class="ro"><div class="k">Salinidad media</div><div class="v">34,7</div></div>
          <div class="ro"><div class="k">Temperatura media</div><div class="v">3,5 <small>°C (de todo el volumen)</small></div></div></div>
          <p class="small" style="margin-top:10px">Gases disueltos: el agua del mar contiene todos los gases de la atmósfera, pero en otras proporciones (más CO₂ y relativamente más oxígeno que el aire). Se disuelven mejor en agua fría: saturada, el agua de mar a 0 °C lleva unos 11 mg/L de oxígeno y a 25 °C, menos de 7 mg/L. Fuentes: Charette y Smith (2010), USGS y NOAA.</p>`))));

    /* ================= B · mapas de superficie ================= */
    const LAY = [['sst', 'Temperatura'], ['sss', 'Salinidad'], ['ep', 'Evaporación − precipitación'], ['ice', 'Hielo marino']].filter(([k]) => (k === 'sst' ? sst : k === 'sss' ? sss : k === 'ep' ? EP : ice));
    const sB = { lay: 'sst', m: new Date().getMonth(), ann: false };
    const cvB = H.h('canvas');
    const field = () => {
      if (sB.lay === 'sst') return sB.ann ? sstA : sst[sB.m];
      if (sB.lay === 'sss') return sB.ann ? sssA : sss[sB.m];
      if (sB.lay === 'ep') return sB.ann ? epA : EP[sB.m];
      return ice[sB.m];
    };
    const epCol = T4.divColor(6), iceCol = T4.ramp([[0, [214, 228, 236]], [14.9, [214, 228, 236]], [15, [200, 222, 236]], [50, [226, 236, 244]], [100, [255, 255, 255]]]);
    const colOf = (v) => (sB.lay === 'sst' ? T4.sstColor(v) : sB.lay === 'sss' ? T4.sssColor(v) : sB.lay === 'ep' ? epCol(v) : iceCol(v));
    const mapB = T4.map(cvB, { bbox: T4.BB.mundo, key: () => sB.lay + sB.m + sB.ann, color: (lat, lon) => { const g = field(); const v = g.at(lat, lon); return v === v ? colOf(v) : null; },
      after: (ctx, P) => {
        if (sB.lay === 'sst') T3.contour(ctx, field(), [0, 10, 20, 26.5], P, { color: 'rgba(28,40,54,.55)', width: 0.9, fmt: (L) => H.f(L, L % 1 ? 1 : 0) + '°', style: (L) => (L === 26.5 ? { color: '#8a1c1c', width: 1.6, dash: [5, 3] } : {}) });
        if (ice && !sB.ann) T3.contour(ctx, ice[sB.m], [15], P, { color: sB.lay === 'ice' ? '#1f6f8b' : 'rgba(255,255,255,.95)', width: 1.6, label: false });
        const p = H.place; const x = P.X(p.lon), y = P.Y(p.lat); ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill();
      } });
    const unit = () => (sB.lay === 'sst' ? '°C' : sB.lay === 'sss' ? '' : sB.lay === 'ep' ? 'mm/día' : '%');
    T4.hover(cvB, mapB, (lat, lon) => { if (H.land(lat, lon) > 0.5) return null; const v = field().at(lat, lon); if (!(v === v)) return null; return `${T4.ll(lat, lon, 0)}<br><b>${H.f(v, sB.lay === 'sss' ? 2 : 1).replace('-', '−')} ${unit()}</b>`; });
    const legB = H.h('div', {});
    const updLeg = () => {
      legB.innerHTML = '';
      if (sB.lay === 'sst') legB.append(T3.legend(T4.sstColor, -2, 32, [-2, 5, 10, 15, 20, 25, 30], (v) => v + (v === 30 ? ' °C' : '')));
      else if (sB.lay === 'sss') legB.append(T3.legend(T4.sssColor, 30, 40, [30, 32, 34, 35, 36, 38, 40], (v) => H.f(v)));
      else if (sB.lay === 'ep') legB.append(T3.legend(epCol, -6, 6, [-6, -3, 0, 3, 6], (v) => H.fs(v) + (v === 6 ? ' mm/día' : '')));
      else legB.append(T3.legend(iceCol, 0, 100, [15, 50, 100], (v) => v + ' %'));
    };
    const roB = { v: H.ro('En el mar más cercano a ti', 'hl'), a: H.ro('Media anual allí'), r: H.ro('Oscilación anual allí', 'bl') };
    const updB = () => {
      updLeg();
      const p = H.place, g = field(), np = g.nearPt(p.lat, p.lon, 4), v = np.v;
      roB.v.v.innerHTML = v === v ? `${H.f(v, sB.lay === 'sss' ? 2 : 1).replace('-', '−')} <small>${unit()} · ${sB.ann ? 'año' : H.MESES[sB.m]} · ${T4.ll(np.lat, np.lon, 1)}</small>` : '—';
      const arr = sB.lay === 'sst' ? sst : sB.lay === 'sss' ? sss : sB.lay === 'ep' ? EP : null;
      if (arr) {
        const vals = arr.map((gg) => gg.near(p.lat, p.lon, 4));
        roB.a.v.innerHTML = H.f(vals.reduce((a, b) => a + b, 0) / 12, sB.lay === 'sss' ? 2 : 1).replace('-', '−') + ` <small>${unit()}</small>`;
        roB.r.v.innerHTML = H.f(Math.max(...vals) - Math.min(...vals), sB.lay === 'sss' ? 2 : 1) + ` <small>${unit()} (${H.MES3[vals.indexOf(Math.min(...vals))]}–${H.MES3[vals.indexOf(Math.max(...vals))]})</small>`;
      } else { roB.a.v.innerHTML = '—'; roB.r.v.innerHTML = '—'; }
      annChk.style.display = sB.lay === 'ice' ? 'none' : '';
      mapB.redraw();
    };
    const segB = H.seg(LAY, sB.lay, (v) => { sB.lay = v; updB(); });
    const mSl = H.slider('Mes', 0, 11, 1, sB.m, (v) => H.MESES[v], (v) => { sB.m = v; updB(); });
    const annChk = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', onchange: (e) => { sB.ann = e.target.checked; updB(); } }), ' Media anual');
    H.onPlace(updB);
    const srcB = [O.srcs && O.srcs.sst, O.srcs && O.srcs.hycom && 'salinidad: ' + O.srcs.hycom, O.srcs && O.srcs.merra2 && 'evaporación y precipitación: ' + O.srcs.merra2].filter(Boolean).join('; ');
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El mar en superficie, mes a mes'),
      H.h('p', { class: 'sub' }, `Medias de 30 años de observaciones de satélite, boyas y barcos. La isoterma discontinua roja es la de 26,5 °C, umbral para que se formen ciclones tropicales; la línea blanca, el borde del hielo marino (15 % de concentración) ese mes.${!sss ? ' La salinidad (HYCOM) y la evaporación y la precipitación (MERRA-2) se añadirán cuando estén procesadas.' : ''}`),
      segB, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvB), legB,
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, mSl, annChk), H.h('div', { class: 'readouts' }, roB.v, roB.a, roB.r)),
      H.h('p', { class: 'small' }, 'Fuentes: ' + srcB + '.')));
    updB();

    /* ================= C · perfiles por latitud (fig. 4.3) ================= */
    const cvC = H.h('canvas'); const chC = H.chart(cvC, 0.5);
    const zT = sstA ? T4.zonal(sstA) : [], zS = sssA ? T4.zonal(sssA) : null, zE = epA ? T4.zonal(epA) : null;
    const sC = { v: 'T' };
    const updC = () => {
      const ok = (z) => z.filter((r) => r.n >= 20 && r.v === r.v);
      let o;
      if (sC.v === 'T') o = { yMin: -2, yMax: 30, yLabel: 'Temperatura (°C)', yTicks: [0, 5, 10, 15, 20, 25, 30].map((v) => ({ v })), series: [{ pts: ok(zT).map((r) => [r.lat, r.v]), color: '#b4531d', width: 2.4 }] };
      else if (sC.v === 'S' && zS) o = { yMin: 32, yMax: 37, yLabel: 'Salinidad', yTicks: [32, 33, 34, 35, 36, 37].map((v) => ({ v })), series: [{ pts: ok(zS).map((r) => [r.lat, r.v]), color: '#1f6f8b', width: 2.4 }] };
      else if (sC.v === 'D' && zS) { const zs = ok(zS); const pts = zs.map((r) => { const t = zT.find((q) => Math.abs(q.lat - r.lat) < 0.1); return [r.lat, t ? T4.sigma(r.v, t.v) : NaN]; }); o = { yMin: 21, yMax: 28, yLabel: 'Densidad σ (kg/m³ − 1.000)', yTicks: [21, 22, 23, 24, 25, 26, 27, 28].map((v) => ({ v })), series: [{ pts, color: '#7a5aa8', width: 2.4 }] }; }
      else if (sC.v === 'E' && zE) o = { yMin: -4, yMax: 4, yLabel: 'E − P (mm/día)', yTicks: [-4, -2, 0, 2, 4].map((v) => ({ v })), series: [{ pts: ok(zE).map((r) => [r.lat, r.v]), color: '#2d7a4c', width: 2.4 }], hlines: [{ y: 0, color: '#888' }] };
      chC.draw(Object.assign({ xMin: -75, xMax: 80, xLabel: 'Latitud', xTicks: [-60, -40, -20, 0, 20, 40, 60, 80].map((v) => ({ v, label: v === 0 ? '0°' : Math.abs(v) + '° ' + (v < 0 ? 'S' : 'N') })), vlines: [{ x: 0, color: '#aaa', dash: [2, 3] }] }, o));
    };
    const segC = H.seg([['T', 'Temperatura'], ['S', 'Salinidad'], ['D', 'Densidad'], ['E', 'Evaporación − precipitación']].filter(([k]) => k === 'T' || (k === 'E' ? zE : zS)), 'T', (v) => { sC.v = v; updC(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Temperatura, salinidad y densidad según la latitud (fig. 4.3 con datos actuales)'),
      H.h('p', { class: 'sub' }, 'Medias de cada paralelo en la superficie del océano. La temperatura es máxima cerca del ecuador; la salinidad tiene dos máximos en los subtrópicos, donde la evaporación supera a la lluvia bajo los anticiclones, y un mínimo relativo en el ecuador, donde llueve mucho; la densidad crece hacia los polos porque allí el agua es fría.'),
      segC, H.h('div', { class: 'viz', style: { marginTop: '8px' } }, cvC)));
    updC();

    /* ================= D · cuencas de dilución y de concentración ================= */
    const SEAS = [['Golfo de Botnia (Báltico)', 63, 21, '3-5', 'dilución'], ['Mar Negro', 43, 34, '17-18', 'dilución'], ['Atlántico ecuatorial (frente al Congo)', -6, 10, '< 32 junto a la desembocadura', 'dilución'],
      ['Atlántico subtropical norte', 25, -45, '37-37,5', 'océano abierto'], ['Mediterráneo oriental', 34, 28, '38,5-39,5', 'concentración'], ['Mar Rojo (norte)', 26, 35, '40-41', 'concentración'], ['Golfo Pérsico', 27, 51, '40-42', 'concentración']];
    const rows = SEAS.map(([n, la, lo, lit, t]) => { const v = sssA ? sssA.near(la, lo, 3) : NaN; return `<tr><td>${n}</td><td>${t}</td><td>${lit}</td><td>${v === v ? H.f(v, 1) : '—'}</td></tr>`; }).join('');
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Mares de dilución y mares de concentración'),
      H.html(`<div class="grid2"><div style="overflow-x:auto"><table class="t"><thead><tr><th>Mar</th><th>Tipo</th><th>Salinidad en superficie</th><th>Media HYCOM (1°)</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="small">La última columna es la media de la celda de 1° más próxima (2014-2023); en mares pequeños mezcla aguas de distinta salinidad.</p></div>
        <div><p>En los mares casi cerrados la salinidad depende del balance entre lo que entra (ríos, lluvia y agua del océano por el estrecho) y lo que se pierde por evaporación. El Báltico recibe mucha agua de los ríos y poca evaporación: es salobre. El Mediterráneo y el mar Rojo, en regiones secas y cálidas, pierden por evaporación mucha más agua de la que reciben y la compensan con agua atlántica o índica que entra por la superficie del estrecho, mientras su agua salada y densa sale por el fondo (ver el <a href="#vertical">estrecho de Gibraltar</a>).</p></div></div>`)));

    /* ================= E · hielo marino ================= */
    if (!ice) el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El hielo marino'), H.html('<p>El hielo marino del Ártico ocupa en marzo unos 15 millones de km² y en septiembre unos 5-6 (media 1991-2020); el antártico, unos 18 millones en septiembre y apenas 3 en febrero. En invierno llega al mar de Ojotsk y a Hokkaido (unos 44° N), al golfo de San Lorenzo (47° N) y, en el hemisferio sur, a unos 55-60° S. Desde 1979, el mínimo de septiembre del Ártico ha perdido en torno al 40 % de su extensión (récord: 3,4 millones de km² en 2012); el hielo antártico batió su mínimo en febrero de 2023 (1,8 millones de km²). Fuente: NSIDC.</p>')));
    if (ice) {
      const lakes = (lat, lon) => lat > 41 && lat < 49.5 && lon > -93 && lon < -75; // Grandes Lagos (no son mar)
      const area = (g, nh) => { let a = 0; for (let j = 0; j < g.ny; j++) { const lat = g.latAt(j); if ((lat > 0) !== nh) continue; const c = Math.cos(lat * H.D2R) * 111.32 * 111.32; for (let i = 0; i < g.nx; i++) { const v = g.data[j * g.nx + i]; if (v === v && !lakes(lat, g.lonAt(i))) a += c * v / 100; } } return a / 1e6; };
      const edge = (g, nh) => { let best = nh ? 90 : -90; for (let j = 0; j < g.ny; j++) { const lat = g.latAt(j); if ((lat > 0) !== nh) continue; for (let i = 0; i < g.nx; i++) if (g.data[j * g.nx + i] >= 15 && !lakes(lat, g.lonAt(i))) { if (nh ? lat < best : lat > best) best = lat; } } return best; };
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El hielo marino'),
        H.html(`<div class="readouts">
          <div class="ro bl"><div class="k">Ártico en marzo (máximo)</div><div class="v">${H.f(area(ice[2], true), 1)} <small>millones de km² de hielo</small></div></div>
          <div class="ro"><div class="k">Ártico en septiembre (mínimo)</div><div class="v">${H.f(area(ice[8], true), 1)} <small>millones de km²</small></div></div>
          <div class="ro bl"><div class="k">Antártico en septiembre (máximo)</div><div class="v">${H.f(area(ice[8], false), 1)} <small>millones de km²</small></div></div>
          <div class="ro"><div class="k">Antártico en febrero (mínimo)</div><div class="v">${H.f(area(ice[1], false), 1)} <small>millones de km²</small></div></div>
          <div class="ro hl"><div class="k">Latitud más baja con hielo, hemisferio norte</div><div class="v">${H.f(edge(ice[1], true) - 0.5, 0)}° <small>N (febrero)</small></div></div>
          <div class="ro hl"><div class="k">Latitud más baja con hielo, hemisferio sur</div><div class="v">${H.f(-edge(ice[8], false) - 0.5, 0)}° <small>S (septiembre)</small></div></div></div>
          <p class="small" style="margin-top:10px">Superficie cubierta por el hielo (suma de la concentración de cada celda de 1° por su superficie) en la media 1991-2020 de OISST, sin los Grandes Lagos; la rejilla de 1° exagera algo los valores en los bordes del hielo. El NSIDC, con celdas de 25 km, da para 1991-2020 una extensión media (superficie con al menos un 15 % de hielo) de unos 15 millones de km² en marzo y 5-6 en septiembre en el Ártico, y de 18,5 en septiembre y 3 en febrero en el Antártico. En invierno el hielo llega al golfo de Bohai, en China (37-40° N), a Hokkaido (44° N) y al golfo de San Lorenzo (47° N); en el hemisferio sur, a unos 55-60° S. Desde 1979, el mínimo de septiembre del Ártico ha perdido en torno al 40 % de su extensión (récord: 3,4 millones de km² en 2012); el hielo antártico batió su mínimo en febrero de 2023 (1,8 millones de km², NSIDC).</p>`)));
    }

    el.append(H.fix('Composición y salinidad', [
      'El volumen del océano es de unos 1.335 millones de km³ (no 1.286), el 96,5 % del agua de la Tierra.',
      'La salinidad media del océano es de 34,7 (se redondea a 35), no de 36 por mil. Hoy se expresa en la escala práctica, sin unidades.',
      'El cloruro sódico equivale a unos 27 g por kilo de agua de mar (el 78 % de las sales), no a 23 ‰.',
      'La salinidad superficial del mar Rojo llega a 40-41 en su mitad norte; los valores de 42-43 solo se dan en los golfos de Suez y Áqaba y en salinas costeras.',
      'El hielo marino no se limita a los 65° de latitud: en invierno alcanza unos 37-40° N en el golfo de Bohai (China), 44° N en Hokkaido y unos 55-60° S alrededor de la Antártida.',
    ]));
    el.append(H.selfCheck([
      { q: '¿Por qué la salinidad superficial tiene dos máximos, hacia los 20-25° N y S?', opts: ['Porque allí el agua está más caliente', 'Porque bajo los anticiclones subtropicales la evaporación supera a la precipitación', 'Porque allí desembocan pocos ríos', 'Porque allí se forma hielo'], a: 1, ex: ' El balance evaporación − precipitación es máximo en los subtrópicos; en el ecuador llueve mucho y la salinidad baja un poco.' },
      { q: 'Si la proporción entre los iones es constante, ¿qué varía de un mar a otro?', opts: ['La cantidad de cloruro respecto al sodio', 'La cantidad total de sales por kilo de agua', 'El tipo de sales', 'Nada'], a: 1, ex: ' Evaporación, lluvia, ríos y hielo concentran o diluyen las sales, pero no cambian sus proporciones.' },
      { q: 'El Mediterráneo es un mar de concentración porque…', opts: ['recibe muchos ríos', 'pierde por evaporación más agua de la que recibe de ríos y lluvia', 'está cubierto de hielo en invierno', 'no tiene mareas'], a: 1, ex: ' El déficit se compensa con agua atlántica que entra por Gibraltar.' },
      { q: 'La densidad del agua superficial es máxima…', opts: ['en el ecuador', 'en los subtrópicos', 'en las latitudes altas', 'igual en todas partes'], a: 2, ex: ' Allí el agua es fría; por eso es en las latitudes altas donde se hunde y alimenta la circulación profunda.' },
    ]));
  },
});
