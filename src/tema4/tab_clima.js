/* ===================== OCÉANO Y ATMÓSFERA ===================== */
H.tab({
  id: 'clima', nav: 'Océano y clima', title: 'La atmósfera y el océano',
  init(el) {
    el.append(H.intro('La atmósfera y el océano · apartado 3', 'Un intercambio continuo de calor, agua y movimiento',
      'La atmósfera mueve las aguas superficiales y regula su temperatura y su salinidad; el océano le devuelve calor, vapor de agua y núcleos de condensación. Esta pestaña compara la temperatura del mar y la del aire, muestra cómo las corrientes calientan o enfrían las costas, y repasa dos fenómenos en los que el océano manda: los ciclones tropicales y El Niño.',
      'Manual: 3.1, 3.2 y 3.3<br>Cuadro 4.2 · Fig. 4.11'));
    const O = OCEANO || {}, D2R = H.D2R;
    const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 }, G2 = { nx: 180, ny: 90, lon0: -180, lat0: 90, res: 2 };
    const sst = O.sst ? O.sst.map((a) => T4.grid(a, G1)) : null;

    /* ================= A · mar y aire ================= */
    if (O.aire && O.dif) {
      const dif = O.dif.map((a) => T4.grid(a, O.difG || G2));
      const sA = { k: 'ann' };
      const cvA = H.h('canvas'), cvA2 = H.h('canvas'); const chA = H.chart(cvA, 0.62);
      const difCol = T4.ramp([[-3, [40, 90, 170]], [-1, [150, 190, 225]], [0, [244, 244, 240]], [1, [246, 214, 170]], [2, [236, 160, 100]], [4, [200, 80, 50]], [8, [130, 30, 40]]]);
      const idx = () => ({ ann: 0, ene: 1, jul: 2 })[sA.k];
      const sstA = sst ? T4.grid(T4.meanLayers(sst.map((g) => g.data)), G1) : null;
      const iced = (lat, lon) => { const g = !sst ? null : sA.k === 'ann' ? sstA : sst[sA.k === 'ene' ? 0 : 6]; const t = g ? g.at(lat, lon) : NaN; return t === t && t < -1.2; }; // mar helado: sin comparación
      const mapA = T4.map(cvA2, { bbox: T4.BB.mundo, key: () => sA.k, color: (lat, lon) => { if (iced(lat, lon)) return [235, 240, 244]; const v = dif[idx()].at(lat, lon); return v === v ? difCol(v) : null; } });
      T4.hover(cvA2, mapA, (lat, lon) => { if (H.land(lat, lon) > 0.5) return null; if (iced(lat, lon)) return 'mar helado'; const v = dif[idx()].at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)}<br>mar ${v >= 0 ? 'más cálido' : 'más frío'} que el aire: <b>${H.fs(v, 1)} °C</b>` : null; });
      const updA = () => {
        const z = O.aire[sA.k], lat = O.aire.lat;
        const pts = (arr) => lat.map((la, j) => [la, arr[j]]).filter((p) => p[1] != null && p[0] > -62 && p[0] < 72);
        chA.draw({ xMin: -60, xMax: 70, yMin: -4, yMax: 30, xLabel: 'Latitud', yLabel: '°C', pad: { r: 40 },
          xTicks: [-60, -40, -20, 0, 20, 40, 60].map((v) => ({ v, label: v === 0 ? '0°' : Math.abs(v) + '°' + (v < 0 ? 'S' : 'N') })), yTicks: [0, 5, 10, 15, 20, 25, 30].map((v) => ({ v })),
          series: [{ pts: pts(z.sst), color: '#1f6f8b', width: 2.4 }, { pts: pts(z.t2m), color: '#b4531d', width: 2.4, dash: [6, 3] }],
          after: (ctx, X, Y, w) => { ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.fillStyle = '#1f6f8b'; ctx.fillText('mar (superficie)', w - 44, 22); ctx.fillStyle = '#b4531d'; ctx.fillText('aire a 2 m, sobre el mar', w - 44, 38);
            // diferencia en eje secundario
            ctx.save(); ctx.beginPath(); ctx.rect(X(-60), Y(30), X(70) - X(-60), Y(-4) - Y(30)); ctx.clip();
            ctx.strokeStyle = 'rgba(46,122,76,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); let f = true;
            lat.forEach((la, j) => { if (z.sst[j] == null || la < -62 || la > 72) { f = true; return; } const d = z.sst[j] - z.t2m[j]; const y = Y(-4 + (d + 1) * (34 / 8)); f ? ctx.moveTo(X(la), y) : ctx.lineTo(X(la), y); f = false; }); ctx.stroke(); ctx.lineWidth = 1; ctx.restore();
            ctx.fillStyle = '#2d7a4c'; ctx.textAlign = 'left'; [-1, 0, 1, 2, 3].forEach((d) => ctx.fillText(H.fs(d, 0), w - 36, Y(-4 + (d + 1) * (34 / 8)))); ctx.textAlign = 'right'; ctx.fillText('diferencia mar − aire (verde, escala a la derecha)', w - 44, 54);
            ctx.strokeStyle = 'rgba(46,122,76,.35)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(-60), Y(-4 + 34 / 8)); ctx.lineTo(X(80), Y(-4 + 34 / 8)); ctx.stroke(); ctx.setLineDash([]); } });
        mapA.redraw();
      };
      const segA = H.seg([['ann', 'Media anual'], ['ene', 'Enero'], ['jul', 'Julio']], 'ann', (v) => { sA.k = v; updA(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, '¿Está el mar más caliente que el aire?'),
        H.h('p', { class: 'sub' }, 'Medias de 1991-2020 de la temperatura de la superficie del mar (OISST) y del aire a 2 m sobre el mar (ERA5), por paralelos y en el mapa. Casi en todas partes el mar está algo más caliente que el aire, entre 1 y 2 °C de media: el océano calienta la atmósfera desde abajo. Solo donde llega aire cálido sobre agua fría (azul en el mapa) es el aire el que se enfría al contacto con el mar: son las regiones de nieblas de advección, como Terranova y el mar del Labrador en verano, las costas de California, Perú y Namibia o el mar del Norte en primavera.'),
        segA, H.h('div', { class: 'grid2', style: { marginTop: '8px' } }, H.h('div', { class: 'viz' }, cvA), H.h('div', {}, H.h('div', { class: 'viz framed' }, cvA2), T3.legend(difCol, -3, 8, [-3, -1, 0, 1, 2, 4, 8], (v) => H.fs(v) + (v === 8 ? ' °C' : '')))),
        H.h('p', { class: 'small' }, 'En invierno, sobre las corrientes cálidas de latitudes medias (corriente del Golfo, Kuroshio) y junto al hielo, el aire frío que sale de los continentes llega a estar más de 5 °C por debajo del mar: el océano le cede enormes cantidades de calor y de vapor, y allí se forman muchas borrascas.')));
      updA();
    }

    /* ================= B · corrientes y climas costeros ================= */
    if (O.t2a) {
      const t2a = O.t2a.map((a) => T4.grid(a, G2));
      const sB = { k: 0 };
      const cvB = H.h('canvas');
      const anCol = T4.divColor(12);
      const CUR = [['Corriente del Golfo', 36, -70, 'c', 'R'], ['Deriva noratlántica', 47, -30, 'c', 'R'], ['Corriente de Noruega', 68, 8, 'c', 'R'], ['Corriente del Labrador', 55, -55, 'f', 'L'], ['Corriente de Groenlandia oriental', 66, -30, 'f', 'L'], ['Corriente de Canarias', 25, -20, 'f', 'L'],
        ['Corriente de California', 32, -125, 'f', 'L'], ['Kuroshio', 32, 136, 'c', 'R'], ['Oyashio', 44, 150, 'f', 'R'], ['Corriente de Humboldt', -20, -77, 'f', 'L'], ['Corriente de Brasil', -25, -42, 'c', 'R'], ['Corriente de Benguela', -24, 9, 'f', 'L'], ['Corriente de Agulhas', -33, 30, 'c', 'R'], ['Corriente de Australia oriental', -30, 156, 'c', 'L']];
      const mapB = T4.map(cvB, { bbox: T4.BB.mundo, key: () => sB.k, land: (lat, lon) => { const v = t2a[sB.k].at(lat, lon); return v === v ? anCol(v) : T4.LAND; }, color: (lat, lon) => { const v = t2a[sB.k].at(lat, lon); return v === v ? H.mix(anCol(v), T4.SEA, 0.55) : null; },
        after: (ctx, P) => {
          ctx.font = 'bold 10px system-ui';
          for (const [n, la, lo, t, sd] of CUR) { const x = P.X(lo), y = P.Y(la); ctx.fillStyle = t === 'c' ? '#a3261b' : '#1f4f8b'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); if (P.w > 700) { ctx.textAlign = sd === 'R' ? 'left' : 'right'; const tw = ctx.measureText(n).width, tx = x + (sd === 'R' ? 6 : -6); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(sd === 'R' ? tx - 2 : tx - tw - 2, y - 6, tw + 4, 13); ctx.fillStyle = t === 'c' ? '#a3261b' : '#1f4f8b'; ctx.fillText(n, tx, y + 3); } }
          const p = H.place, x = P.X(p.lon), y = P.Y(p.lat); ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x - 5, y + 4); ctx.closePath(); ctx.fill();
        } });
      T4.hover(cvB, mapB, (lat, lon) => { const v = t2a[sB.k].at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)}<br>${H.fs(v, 1)} °C respecto a la media del paralelo` : null; });
      const ro = H.ro('Tu zona respecto a la media de su latitud', 'hl');
      const updB = () => { const p = H.place, v = t2a[sB.k].at(p.lat, p.lon); ro.v.innerHTML = `${H.fs(v, 1)} <small>°C · ${['media anual', 'enero', 'julio'][sB.k]} · ${H.placeLabel()}</small>`; mapB.redraw(); };
      H.onPlace(updB);
      const segB = H.seg([[0, 'Media anual'], [1, 'Enero'], [2, 'Julio']], 0, (v) => { sB.k = v; updB(); });
      // cuadro 4.2 con normales OMM 1991-2020
      const S = (id) => T2.byId(id);
      const PAIRS = [
        ['Subtropical (34° S)', ['68816', 'de Benguela (fría)', 'costa occidental de África'], ['94768', 'de Australia oriental (cálida)', 'costa oriental de Australia']],
        ['Templada (48-49° N)', ['71742', 'del Labrador (fría)', 'costa oriental de América (Terranova)'], ['7110', 'deriva noratlántica (cálida)', 'costa occidental de Europa']],
        ['Subpolar (60-61° N)', ['25913', 'del mar de Ojotsk (fría)', 'costa oriental de Asia'], ['70273', 'de Alaska (cálida)', 'costa occidental de América']],
        ['Subpolar (64° N)', ['4250', 'de Groenlandia oriental, que dobla el cabo Farewell (fría)', 'suroeste de Groenlandia'], ['4030', 'de Irminger, rama de la deriva noratlántica (cálida)', 'suroeste de Islandia']],
      ];
      const rows = PAIRS.map(([z, a, b]) => {
        const sa = S(a[0]), sb = S(b[0]); if (!sa || !sb) return '';
        const ta = sa.ta[12], tb = sb.ta[12];
        const cell = (s, c, side) => `<td><b>${T2.stLabel(s)}</b><br><small>${H.f(Math.abs(s.lat), 1)}° ${s.lat < 0 ? 'S' : 'N'} · ${side} · corriente ${c}</small><br>${T4.fT(s.ta[12])} <small>(ene ${T4.fT(s.ta[0], 0)}, jul ${T4.fT(s.ta[6], 0)})</small></td>`;
        return `<tr><td>${z}</td>${cell(sa, a[1], a[2])}${cell(sb, b[1], b[2])}<td><b>${H.fs(tb - ta, 1)} °C</b></td></tr>`;
      }).join('');
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Corrientes cálidas y frías: el clima de las costas'),
        H.h('p', { class: 'sub' }, 'El mapa muestra cuánto más cálido o más frío es el aire de cada lugar que la media de su paralelo (ERA5, 1991-2020). Las fachadas occidentales de los continentes son frías en los trópicos (corrientes de Canarias, California, Humboldt y Benguela, con afloramientos y desiertos costeros) y templadas en latitudes medias y altas (Europa occidental, Columbia Británica). Las fachadas orientales son cálidas en los trópicos y muy frías en latitudes altas (Labrador, Ojotsk), donde además reciben aire continental.'),
        segB, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvB), T3.legend(anCol, -12, 12, [-12, -6, 0, 6, 12], (v) => H.fs(v) + (v === 12 ? ' °C' : '')),
        H.h('div', { class: 'readouts', style: { margin: '10px 0' } }, ro),
        H.html(`<div><h4>El cuadro 4.2 con normales actuales (OMM 1991-2020)</h4><div style="overflow-x:auto"><table class="t"><thead><tr><th>Latitud</th><th>Costa con corriente fría</th><th>Costa con corriente cálida</th><th>Diferencia</th></tr></thead><tbody>${rows}</tbody></table></div>
          <p class="small">Normales climatológicas de la OMM 1991-2020 (NOAA NCEI). El manual compara Salvador de Bahía (25 °C) y Lima (20 °C) en la zona intertropical, Nueva Orleans (21 °C) y cabo Juby (19 °C), San Juan de Terranova (4 °C) y Burdeos (13 °C), e Ivittuut (1 °C) y Trondheim (5 °C); en la fila de Nueva Orleans y cabo Juby, la corriente cálida da más temperatura a la costa oriental, como en Sídney frente a Ciudad del Cabo.</p></div>`)));
      updB();
    }

    /* ================= C · ciclones tropicales ================= */
    if (sst) {
      const sC = { m: 8 };
      const cvC = H.h('canvas');
      const C = typeof CICLONES !== 'undefined' && CICLONES ? CICLONES : null;
      const mapC = T4.map(cvC, { bbox: [-180, 180, -50, 55], key: () => 'c' + sC.m, color: (lat, lon) => { const v = sst[sC.m].at(lat, lon); return v === v ? (v >= 26.5 ? H.mix(T4.sstColor(v), [255, 255, 255], 0.15) : H.mix(T4.sstColor(v), [214, 228, 236], 0.65)) : null; },
        after: (ctx, P) => {
          T3.contour(ctx, sst[sC.m], [26.5], P, { color: '#8a1c1c', width: 1.8, label: false });
          if (C && C.lat) { const CC = ['rgba(28,40,54,.4)', '#e8b33c', '#e08a2c', '#d0582a', '#b42c2c', '#7a1430']; for (let i = 0; i < C.lat.length; i++) { if (C.mon[i] !== sC.m + 1) continue; ctx.fillStyle = CC[Math.min(5, C.cat[i])]; const r = C.cat[i] ? 1.3 : 0.9; ctx.fillRect(P.X(C.lon[i]) - r, P.Y(C.lat[i]) - r, 2 * r, 2 * r); } }
        } });
      const segC = H.seg([[2, 'Marzo'], [8, 'Septiembre']], 8, (v) => { sC.m = v; mapC.invalidate(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Ciclones tropicales: el océano como fuente de energía'),
        H.h('p', { class: 'sub' }, 'Un ciclón tropical (huracán en el Atlántico y el Pacífico nororiental, tifón en el Pacífico noroccidental, ciclón en el Índico) es una máquina térmica que se alimenta del calor latente del vapor que evapora un mar cálido. Necesita agua de al menos 26,5 °C hasta unos 50 m de profundidad, aire húmedo en la troposfera media, poca diferencia de viento entre la superficie y la altura (cizalladura) y estar a más de unos 5° del ecuador, para que la fuerza de Coriolis le dé el giro. En el mapa, el mar de más de 26,5 °C en marzo (verano austral) y en septiembre (final del verano boreal).'),
        segC, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvC),
        H.h('p', { class: 'small' }, C ? `Puntos: posiciones cada 6 h de los ciclones tropicales de ${C.y0}-${C.y1} en ese mes (IBTrACS, NOAA): gris, tormenta tropical; de amarillo a granate, huracanes de categoría 1 a 5. Hubo ${H.f(C.n / (C.y1 - C.y0 + 1), 0)} ciclones al año, la mayoría en el Pacífico noroccidental. En el Atlántico Sur solo se formaron tres en esos 30 años, todos excepcionales (entre ellos el huracán Catarina, que tocó tierra en el sur de Brasil en 2004), y ninguno en el Pacífico suroriental: allí el agua es demasiado fría y la cizalladura, fuerte.` : 'Cada año se forman unas 85 tormentas tropicales en el mundo, de las que unas 45 llegan a huracán o tifón. Ninguna se forma en el Atlántico Sur ni en el Pacífico suroriental, donde el agua es demasiado fría y la cizalladura, fuerte. Al entrar en tierra o en aguas frías pierden su fuente de energía y se debilitan.')));
    }

    /* ================= D · El Niño ================= */
    if (O.anom) {
      const an = O.anom.map((a) => T4.grid(a, O.anomG || G2));
      const K = O.anomK || ['1997-12', '2010-12', '2015-12', '2023-12', '2023-08'];
      const NAMES = { '1997-12': 'Diciembre de 1997 (El Niño muy fuerte)', '2010-12': 'Diciembre de 2010 (La Niña)', '2015-12': 'Diciembre de 2015 (El Niño muy fuerte)', '2023-12': 'Diciembre de 2023 (El Niño)', '2023-08': 'Agosto de 2023 (récord mundial de temperatura del mar)' };
      const sD = { k: 0 };
      const cvD = H.h('canvas'); const anCol = T4.divColor(4);
      const mapD = T4.map(cvD, { bbox: [-180, 180, -60, 70], key: () => 'n' + sD.k, color: (lat, lon) => { const v = an[sD.k].at(lat, lon); return v === v ? anCol(v) : null; },
        after: (ctx, P) => { ctx.strokeStyle = '#1c2836'; ctx.setLineDash([4, 3]); ctx.strokeRect(P.X(-170), P.Y(5), P.X(-120) - P.X(-170), P.Y(-5) - P.Y(5)); ctx.setLineDash([]); ctx.font = '10.5px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.fillText('Niño 3.4', P.X(-170) + 2, P.Y(5) - 4); } });
      T4.hover(cvD, mapD, (lat, lon) => { if (H.land(lat, lon) > 0.5) return null; const v = an[sD.k].at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)}<br><b>${H.fs(v, 1)} °C</b> respecto a 1991-2020` : null; });
      const ro = { n34: H.ro('Anomalía media en la región Niño 3.4', 'hl'), gl: H.ro('Anomalía media del océano (60° S – 60° N)') };
      const upd = () => {
        const g = an[sD.k]; let s = 0, n = 0, s2 = 0, w2 = 0;
        for (let j = 0; j < g.ny; j++) { const la = g.latAt(j), c = Math.cos(la * D2R); for (let i = 0; i < g.nx; i++) { const lo = g.lonAt(i), v = g.data[j * g.nx + i]; if (!(v === v)) continue; if (Math.abs(la) <= 5 && lo >= -170 && lo <= -120) { s += v; n++; } if (Math.abs(la) <= 60) { s2 += v * c; w2 += c; } } }
        ro.n34.v.innerHTML = H.fs(s / n, 1) + ' <small>°C</small>'; ro.gl.v.innerHTML = H.fs(s2 / w2, 2) + ' <small>°C</small>';
        mapD.invalidate();
      };
      const sel = H.h('select', { 'aria-label': 'Mes' }, ...K.map((k, i) => H.h('option', { value: i }, NAMES[k] || k)));
      sel.onchange = () => { sD.k = +sel.value; upd(); };
      const narrow = window.innerWidth < 640; const cvO = H.h('canvas'); const chO = H.chart(cvO, narrow ? 0.62 : 0.3);
      const E = typeof ENSO !== 'undefined' && ENSO ? ENSO : null;
      // resumen del último dato del ONI: trimestres seguidos por encima/debajo de ±0,5 y episodios anteriores comparables
      const oniNow = (E) => {
        const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const n = E.v.length, t = E.t[n - 1], v = E.v[n - 1], m = Math.round((t - Math.floor(t) - 1 / 24) * 12);
        const when = `${MES[(m + 11) % 12]}-${MES[(m + 1) % 12]} de ${Math.floor(t)}`;
        const sg = v >= 0.5 ? 1 : v <= -0.5 ? -1 : 0;
        if (!sg) return `Último dato: <b>${H.fs(v, 2)} °C</b> en ${when}: condiciones neutras.`;
        let k = 0; while (k < n && E.v[n - 1 - k] * sg >= 0.5) k++;
        const cat = (a) => (a >= 2 ? 'muy fuerte' : a >= 1.5 ? 'fuerte' : a >= 1 ? 'moderado' : 'débil');
        // episodios anteriores (tramos de al menos 5 trimestres por encima de +0,5 o por debajo de −0,5) con su pico
        const eps = []; let i = 0;
        while (i < n - k) { if (E.v[i] * sg >= 0.5) { let j = i, pk = i; while (j < n - k && E.v[j] * sg >= 0.5) { if (E.v[j] * sg > E.v[pk] * sg) pk = j; j++; } if (j - i >= 5) { const tm = E.t[pk], mm = Math.round((tm - Math.floor(tm) - 1 / 24) * 12), y = Math.floor(tm) - (mm < 6 ? 1 : 0); eps.push({ y, v: E.v[pk] }); } i = j; } else i++; }
        const same = eps.filter((e) => cat(Math.abs(e.v)) === cat(Math.abs(v)) || Math.abs(e.v) >= Math.abs(v));
        const nm = sg > 0 ? 'El Niño' : 'La Niña';
        const lst = same.map((e) => `${e.y}-${String((e.y + 1) % 100).padStart(2, '0')} (${H.fs(e.v, 1)} °C)`);
        const lstTxt = lst.length > 1 ? lst.slice(0, -1).join(', ') + ' y ' + lst[lst.length - 1] : lst[0];
        return `Último dato: <b>${H.fs(v, 2)} °C</b> en ${when}, ${k === 1 ? 'el primer trimestre' : `el ${k}.º trimestre seguido`} ${sg > 0 ? 'por encima de +0,5' : 'por debajo de −0,5'} °C: ${k >= 5 ? `hay un episodio de ${nm} en curso` : `son condiciones de ${nm} (para que cuente como episodio en la serie histórica hacen falta cinco trimestres seguidos)`}, con una intensidad propia de un ${nm} <b>${cat(Math.abs(v))}</b>${lst.length ? `, como ${lst.length === 1 ? 'el' : 'los'} de ${lstTxt}` : ''}. NOAA CPC actualiza el índice cada mes.`;
      };
      el.append(H.h('div', { class: 'card', id: 'nino' }, H.h('h3', {}, 'El Niño y La Niña'),
        H.html(`<p class="sub">Normalmente los alisios empujan el agua cálida superficial hacia el oeste del Pacífico ecuatorial (Indonesia), donde el nivel del mar está unos 40 cm más alto y la termoclina más honda, mientras en Perú aflora agua fría. Cada dos a siete años los alisios se debilitan, el agua cálida refluye hacia el este y la superficie del Pacífico central y oriental se calienta: es El Niño, que se acopla con un cambio de la presión entre ambos lados del océano (la Oscilación del Sur). La Niña es la fase opuesta, con alisios más fuertes y el Pacífico oriental más frío. El fenómeno altera las lluvias de medio mundo (sequías en Indonesia y Australia, inundaciones en Perú y Ecuador) y eleva la temperatura media de la Tierra el año siguiente. Mira también el <a href="#vertical">corte del ecuador</a> en la pestaña de la estructura vertical.</p>`),
        H.h('div', { class: 'row' }, sel), H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvD), T3.legend(anCol, -4, 4, [-4, -2, 0, 2, 4], (v) => H.fs(v) + (v === 4 ? ' °C' : '')),
        H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.n34, ro.gl),
        E ? H.h('div', { class: 'viz', style: { marginTop: '10px' } }, cvO) : null,
        H.h('p', { class: 'small' }, `Anomalías mensuales de la temperatura del mar respecto a 1991-2020 (NOAA OISST v2.1).${E ? ' Abajo, el índice ONI de NOAA CPC: media móvil de tres meses de la anomalía en Niño 3.4; El Niño cuando supera +0,5 °C durante al menos cinco trimestres seguidos, La Niña por debajo de −0,5 °C.' : ''}`),
        E ? H.html(`<p class="small">${oniNow(E)}</p>`) : null));
      if (E) {
        const pts = E.t.map((t, i) => [t, E.v[i]]);
        chO.draw({ xMin: E.t[0], xMax: E.t[E.t.length - 1], yMin: -2.5, yMax: 3, yLabel: 'ONI (°C)', xTicks: Array.from({ length: 20 }, (_, i) => 1950 + i * (narrow ? 10 : 5)).filter((y) => y >= E.t[0] && y <= E.t[E.t.length - 1]).map((v) => ({ v, label: String(v) })), yTicks: [-2, -1, 0, 1, 2, 3].map((v) => ({ v })),
          series: [{ pts, color: '#1c2836', width: 1.2 }], hlines: [{ y: 0.5, color: '#b4531d' }, { y: -0.5, color: '#1f6f8b' }], pad: { t: 22 },
          markers: [{ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], color: '#b02020', r: 3.5, label: `${H.fs(pts[pts.length - 1][1], 2)} (${Math.floor(pts[pts.length - 1][0])})`, align: 'right' }],
          after: (ctx, X, Y) => { for (let i = 1; i < pts.length; i++) { const [t, v] = pts[i]; if (v >= 0.5 || v <= -0.5) { ctx.fillStyle = v > 0 ? 'rgba(180,83,29,.55)' : 'rgba(31,111,139,.55)'; ctx.fillRect(X(pts[i - 1][0]), Math.min(Y(v), Y(0)), Math.max(1, X(t) - X(pts[i - 1][0])), Math.abs(Y(v) - Y(0))); } } } });
      }
      upd();
    }

    /* ================= E · el océano y las masas de aire ================= */
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El océano y las masas de aire'),
      H.html(`<div class="grid2 even"><div><p>Las masas de aire toman las propiedades de la superficie sobre la que se forman: el aire tropical marítimo, formado sobre los anticiclones subtropicales, es cálido y húmedo; el polar marítimo, que llega a la Península desde el Atlántico norte, es fresco y húmedo pero se calienta desde abajo al cruzar un mar más templado, se vuelve inestable y descarga chubascos en las costas del Cantábrico y de Galicia.</p>
        <p>El mar también aporta los núcleos de condensación: la sal de las gotas que arranca el viento al romper las olas forma partículas higroscópicas sobre las que se condensa el vapor.</p></div>
        <div><p>Las <b>nieblas de advección</b> se forman cuando aire cálido y húmedo pasa sobre agua más fría y se enfría hasta su punto de rocío: son famosas las de Terranova, donde el aire de la corriente del Golfo cruza las aguas del Labrador, y las de las costas con afloramiento (California, Perú, Namibia o el «taró» de Galicia y del Cantábrico en verano).</p>
        <p>Los mares interiores templados en otoño, como el Mediterráneo, actúan al revés: cuando llega aire frío en altura, el mar caliente aporta calor y humedad a las capas bajas y alimenta las lluvias torrenciales de la vertiente mediterránea (ver la <a href="${H.T3}#isobaras">DANA de 2024 en el Tema 3</a>).</p></div></div>`)));

    el.append(H.fix('Atmósfera y océano', [
      'Según el manual, en los trópicos (hasta unos 10° de latitud) el mar está 1,2 °C más frío que el aire. Con los datos actuales (OISST y ERA5, 1991-2020), en las medias por paralelos el mar está más caliente que el aire a 2 m en todas las latitudes, entre 1 y 2 °C. El aire solo es más cálido que el mar en zonas concretas: corrientes frías, afloramientos y mares de latitudes altas en verano.',
      'El umbral habitual para la formación de ciclones tropicales es una temperatura del mar de 26,5 °C (no 27 °C), y no basta por sí sola: hacen falta además poca cizalladura del viento, humedad en la troposfera media y una distancia mínima al ecuador.',
      'En el cuadro 4.2, el clima de Ivittuut es ET (tundra) en la clasificación de Köppen, no «EH», y las coordenadas de Lima son 12° 05′ S, 77° 03′ O.',
      'El manual no trata El Niño ni la Oscilación del Sur, la variación natural más importante del sistema océano-atmósfera de un año a otro.',
    ]));
    el.append(H.selfCheck([
      { q: 'Por término medio, en casi todas las latitudes…', opts: ['el aire está más caliente que el mar', 'el mar está algo más caliente que el aire que tiene encima', 'mar y aire tienen exactamente la misma temperatura', 'el mar está más frío en los trópicos y más caliente en los polos'], a: 1, ex: ' El océano calienta la atmósfera desde abajo; el aire solo es más cálido sobre corrientes frías y afloramientos, donde se forman nieblas.' },
      { q: 'Las costas occidentales de los continentes en latitudes tropicales son…', opts: ['más cálidas y lluviosas que las orientales', 'más frescas y secas, por las corrientes frías y los afloramientos', 'iguales que las orientales', 'más frías solo en invierno'], a: 1, ex: ' Es el caso de Lima, el Sáhara atlántico o Namibia: desiertos costeros con nieblas.' },
      { q: 'Un ciclón tropical se debilita al entrar en tierra porque…', opts: ['choca con las montañas', 'pierde su fuente de energía: el vapor que evapora el mar cálido', 'deja de actuar la fuerza de Coriolis', 'aumenta la presión'], a: 1, ex: ' Sin el aporte de calor latente desde un mar de más de 26,5 °C, el ciclón se rellena.' },
      { q: 'Durante El Niño…', opts: ['los alisios se refuerzan y el Pacífico oriental se enfría', 'los alisios se debilitan y el Pacífico ecuatorial central y oriental se calienta', 'el Atlántico se congela', 'no cambia nada fuera del Pacífico'], a: 1, ex: ' El agua cálida acumulada en el oeste refluye hacia el este; las lluvias cambian en todo el trópico.' },
      { q: 'Las nieblas de advección de Terranova se forman cuando…', opts: ['aire frío pasa sobre agua cálida', 'aire cálido y húmedo pasa sobre las aguas frías del Labrador', 'llueve mucho', 'hay hielo'], a: 1, ex: ' El aire se enfría por debajo hasta saturarse.' },
    ]));
  },
});
