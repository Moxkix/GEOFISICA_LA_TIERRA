/* ===================== MOVIMIENTOS · CORRIENTES SUPERFICIALES ===================== */
H.tab({
  id: 'corrientes', nav: 'Corrientes', title: 'Las corrientes superficiales',
  init(el) {
    el.append(H.intro('Movimientos debidos a los vientos · apartado 2.4.2', 'Grandes ríos en el mar, movidos por el viento',
      'Las corrientes superficiales dibujan grandes giros que siguen a los centros de acción de la atmósfera: giran en el sentido de las agujas del reloj en el hemisferio norte y al revés en el sur, alrededor de los anticiclones subtropicales. Llevan agua cálida hacia los polos por el oeste de los océanos y agua fría hacia el ecuador por el este. Aquí se ven las corrientes medias de 2014-2023 del modelo HYCOM sobre la temperatura del mar, junto a los vientos y la presión media del reanálisis ERA5.',
      'Manual: 2.4.2<br>Figs. 4.8 y 4.9 · Ejercicio 5'));
    const O = OCEANO || {}, W = typeof VIENTOS !== 'undefined' ? VIENTOS : null, D2R = H.D2R;
    const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 };
    const hasC = !!(O.u && O.v);
    const U = hasC ? O.u.map((a) => T4.grid(a, G1)) : null, V = hasC ? O.v.map((a) => T4.grid(a, G1)) : null;
    const sst = O.sst ? O.sst.map((a) => T4.grid(a, G1)) : null;
    const WU = W ? W.u.map((a) => T4.grid(a, W.w)) : null, WV = W ? W.v.map((a) => T4.grid(a, W.w)) : null, WP = W ? W.pr.map((a) => T4.grid(a, W.p)) : null;
    if (!hasC) el.append(H.info('<b>Pendiente de datos.</b> Las corrientes del modelo HYCOM se dibujarán en cuanto estén procesadas sus exportaciones (<code>gee/tema4_hycom.js</code>). Mientras tanto, el mapa muestra la temperatura del mar y los vientos y presiones medios.'));

    /* ================= A · mapa de corrientes ================= */
    const BB = { mundo: T4.BB.mundo, atl: [-100, 20, 0, 70], ind: [30, 110, -40, 28], pac: [120, 260, -40, 55], florida: [-98, -50, 15, 45], iberia: [-30, 5, 20, 50] };
    const sA = { m: new Date().getMonth(), r: 'atl', wind: false, pres: false, bg: 'sst' };
    const cvA = H.h('canvas');
    const spdCol = T4.ramp([[0, [120, 140, 160]], [0.15, [40, 90, 150]], [0.3, [20, 60, 120]], [0.6, [130, 30, 80]], [1, [200, 30, 40]]]);
    const arrowsC = (ctx, P, step) => {
      const [a, b, c, d] = P.bbox, kx = P.w / (b - a), ky = P.h / (d - c);
      for (let lat = Math.floor(c / step) * step + step / 2; lat < d; lat += step) for (let lon = Math.floor(a / step) * step + step / 2; lon < b; lon += step) {
        const u = U[sA.m].at(lat, lon), v = V[sA.m].at(lat, lon); if (!(u === u)) continue; const sp = Math.hypot(u, v); if (sp < 0.03) continue;
        let dx = u / Math.cos(lat * D2R) * kx, dy = -v * ky; const n = Math.hypot(dx, dy); dx /= n; dy /= n;
        const L = Math.min(step * kx * 1.3, 5 + sp * 40), x = P.X(lon), y = P.Y(lat);
        ctx.strokeStyle = ctx.fillStyle = T3.css(spdCol(sp)); ctx.lineWidth = sp > 0.5 ? 1.8 : 1.2;
        const x0 = x - dx * L / 2, y0 = y - dy * L / 2, x1 = x + dx * L / 2, y1 = y + dy * L / 2;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const hs = Math.min(5, 2 + L * 0.2); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - dx * hs - dy * hs * 0.6, y1 - dy * hs + dx * hs * 0.6); ctx.lineTo(x1 - dx * hs + dy * hs * 0.6, y1 - dy * hs - dx * hs * 0.6); ctx.closePath(); ctx.fill();
      }
      ctx.lineWidth = 1;
    };
    const mapA = T4.map(cvA, { bbox: BB[sA.r], grid: 10, key: () => sA.m + sA.r + sA.bg, aspect: (w) => Math.min(w * T3.aspect(BB[sA.r], sA.r !== 'mundo'), 600),
      color: (lat, lon) => { if (!sst) return null; const v = sst[sA.m].at(lat, lon); return v === v ? H.mix(T4.sstColor(v), [255, 255, 255], 0.45) : null; },
      after: (ctx, P) => {
        const span = P.bbox[1] - P.bbox[0];
        if (sA.pres && WP) T3.contour(ctx, T3.refine(WP[sA.m], 2), Array.from({ length: 20 }, (_, i) => 976 + 4 * i), P, { color: 'rgba(90,60,120,.75)', width: 1, fmt: (L) => H.f(L) });
        if (hasC) arrowsC(ctx, P, span > 200 ? 6 : span > 90 ? 3 : span > 40 ? 1.5 : 1);
        if (sA.wind && WU) T3.arrows(ctx, WU[sA.m], WV[sA.m], P, { step: span > 200 ? 8 : 4, scale: 1.4, maxLen: 26, color: 'rgba(60,60,60,.55)', width: 1.4 });
      } });
    T4.hover(cvA, mapA, (lat, lon) => {
      if (H.land(lat, lon) > 0.5) return null;
      const t = sst ? sst[sA.m].at(lat, lon) : NaN; let s = `${T4.ll(lat, lon, 1)}<br>mar a ${T4.fT(t)}`;
      if (hasC) { const u = U[sA.m].at(lat, lon), v = V[sA.m].at(lat, lon); if (u === u) { const dir = (Math.atan2(u, v) / D2R + 360) % 360; s += `<br>corriente de ${H.f(Math.hypot(u, v) * 100)} cm/s hacia el ${T3.dirName(dir)}`; } }
      return s;
    });
    const segR = H.seg([['mundo', 'Mundo'], ['atl', 'Atlántico Norte'], ['florida', 'Caribe y Florida'], ['iberia', 'Península y Canarias'], ['ind', 'Índico'], ['pac', 'Pacífico']], sA.r, (v) => { sA.r = v; mapA.setBBox(BB[v]); });
    const mSl = H.slider('Mes', 0, 11, 1, sA.m, (v) => H.MESES[v], (v) => { sA.m = v; mapA.invalidate(); });
    const chkW = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', onchange: (e) => { sA.wind = e.target.checked; mapA.redraw(); } }), ' Vientos a 10 m (flechas grises)');
    const chkP = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', onchange: (e) => { sA.pres = e.target.checked; mapA.redraw(); } }), ' Presión a nivel del mar (isobaras moradas)');
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Las corrientes, los vientos y los centros de acción (fig. 4.8)'),
      H.h('p', { class: 'sub' }, 'Flechas: corriente superficial media del mes (su color y su longitud indican la velocidad, de unos centímetros por segundo en el centro de los giros a más de 1 m/s en la corriente del Golfo). Fondo: temperatura del mar. Activa los vientos y las isobaras para comprobar que los giros siguen a los anticiclones subtropicales y que las corrientes ecuatoriales siguen a los alisios.'),
      segR, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvA),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, mSl), H.h('div', {}, chkW, chkP, hasC ? T3.legend((v) => spdCol(v), 0, 1, [0, 0.25, 0.5, 0.75, 1], (v) => H.f(v * 100) + (v === 1 ? ' cm/s' : '')) : null)),
      H.h('p', { class: 'small' }, `Corrientes: ${O.srcs && O.srcs.hycom ? O.srcs.hycom : 'HYCOM'} (rejilla de 1°: las corrientes más estrechas, como la del Golfo, aparecen más anchas y lentas que en la realidad). Vientos y presión: ERA5, 1991-2020. Temperatura del mar: NOAA OISST, 1991-2020.`)));

    /* ================= B · el monzón ================= */
    if (hasC) {
      const sB = { m: 0 };
      const cvB = H.h('canvas');
      const mapB = T4.map(cvB, { bbox: [38, 80, -12, 26], grid: 10, regional: false, key: () => 'b' + sB.m, aspect: (w) => Math.min(w * T3.aspect([38, 80, -12, 26], true), 480),
        color: (lat, lon) => { if (!sst) return null; const v = sst[sB.m].at(lat, lon); return v === v ? H.mix(T4.sstColor(v), [255, 255, 255], 0.35) : null; },
        after: (ctx, P) => { const m0 = sA.m; sA.m = sB.m; arrowsC(ctx, P, 2); if (WU) T3.arrows(ctx, WU[sB.m], WV[sB.m], P, { step: 4, scale: 1.6, maxLen: 30, color: 'rgba(60,60,60,.6)', width: 1.6 }); sA.m = m0; } });
      const segB = H.seg([[0, 'Enero: monzón del nordeste'], [6, 'Julio: monzón del suroeste']], 0, (v) => { sB.m = v; mapB.invalidate(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El Índico: corrientes que cambian con el monzón'),
        H.h('p', { class: 'sub' }, 'En invierno el monzón sopla del nordeste y la corriente norecuatorial del Índico va hacia el oeste; frente a Somalia la corriente baja hacia el sur. En verano el monzón del suroeste invierte la circulación: la corriente de Somalia sube hacia el norte con más de 1 m/s, provoca un afloramiento frío frente a Somalia y Omán y la corriente monzónica va hacia el este al sur de la India.'),
        segB, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvB)));
    }

    /* ================= C · el circuito del Atlántico Norte (fig. 4.9) y el ejercicio 5 ================= */
    const CIR = [['Corriente norecuatorial', 15, -45, 'Los alisios del nordeste, desviados por Coriolis, empujan el agua hacia el oeste: es el lado sur del giro subtropical.'],
      ['Corriente del Caribe y del golfo de México', 15, -75, 'Al chocar con América, parte del agua entra en el Caribe y el golfo de México, donde se calienta todavía más.'],
      ['Corriente de Florida', 25, -79.8, 'Sale del golfo de México por el estrecho de Florida, entre Florida y Cuba: lleva unos 32 millones de m³/s a más de 1,5 m/s. Es el comienzo de la corriente del Golfo.'],
      ['Corriente del Golfo', 37, -70, 'Bordea la costa de EE. UU. hasta el cabo Hatteras y se separa de ella hacia el nordeste, con meandros y remolinos; frente a Terranova transporta más de 100 millones de m³/s.'],
      ['Deriva noratlántica', 50, -30, 'Su continuación hacia Europa, empujada por los vientos del oeste. Se divide: un ramal sube hacia Noruega y el Ártico; otro gira hacia el sur.'],
      ['Corriente de Canarias', 25, -18, 'Rama oriental del giro, fría para su latitud: aguas que vienen del norte y afloramiento costero por los alisios.'],
      ['Mar de los Sargazos', 30, -55, 'Centro del giro, de aguas cálidas, muy saladas y pobres en nutrientes, con algas flotantes (sargazos).'],
      ['Corriente del Labrador', 52, -52, 'Agua ártica fría que baja por el oeste del mar del Labrador hasta Terranova, con icebergs.'],
      ['Corriente de Groenlandia oriental', 65, -33, 'Agua y hielo del Ártico que bajan por el estrecho de Dinamarca.']];
    const sC = { k: 2 };
    const cvC = H.h('canvas');
    const mapC = T4.map(cvC, { bbox: [-100, 10, 5, 70], grid: 10, key: () => 'c' + sC.k, aspect: (w) => Math.min(w * T3.aspect([-100, 10, 5, 70], true), 520),
      color: (lat, lon) => { if (!sst) return null; const v = sst[7].at(lat, lon); return v === v ? H.mix(T4.sstColor(v), [255, 255, 255], 0.5) : null; },
      after: (ctx, P) => {
        if (hasC) { const m0 = sA.m; sA.m = 7; arrowsC(ctx, P, 2); sA.m = m0; }
        CIR.forEach(([n, la, lo], i) => { const x = P.X(lo), y = P.Y(la); ctx.fillStyle = i === sC.k ? '#b4531d' : 'rgba(28,40,54,.75)'; ctx.beginPath(); ctx.arc(x, y, i === sC.k ? 8 : 5, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, x, y + 0.5); });
      } });
    cvC.addEventListener('click', (e) => { const [x, y] = mapC.pos(e); let b = -1, bd = 20; CIR.forEach(([, la, lo], i) => { const d = Math.hypot(mapC.P.X(lo) - x, mapC.P.Y(la) - y); if (d < bd) { bd = d; b = i; } }); if (b >= 0) { sC.k = b; updC(); } });
    const desc = H.h('div', { class: 'card', style: { background: 'var(--soft)', margin: 0 } });
    const list = H.h('div', { class: 'chipbar' });
    const updC = () => {
      const [n, la, lo, t] = CIR[sC.k];
      let sp = ''; if (hasC) { const u = U[7].near(la, lo, 2), v = V[7].near(la, lo, 2); if (u === u) sp = `<p class="small">Corriente media en ese punto en agosto (HYCOM, 1°): <b>${H.f(Math.hypot(u, v) * 100)} cm/s</b> hacia el ${T3.dirName((Math.atan2(u, v) / D2R + 360) % 360)}. Temperatura del mar: ${T4.fT(sst ? sst[7].near(la, lo, 2) : NaN)}.</p>`; }
      desc.innerHTML = `<h4>${sC.k + 1}. ${n}</h4><p>${t}</p>${sp}`;
      H.$$('button', list).forEach((b, i) => b.classList.toggle('sel', i === sC.k));
      mapC.invalidate();
    };
    CIR.forEach(([n], i) => { const b = H.h('button', { class: 'chip', type: 'button' }, `${i + 1}. ${n}`); b.onclick = () => { sC.k = i; updC(); }; list.append(b); });
    el.append(H.h('div', { class: 'card', id: 'atlantico' }, H.h('h3', {}, 'El circuito del Atlántico Norte (fig. 4.9) y la corriente del Golfo'),
      H.h('p', { class: 'sub' }, 'Sigue el giro subtropical del Atlántico Norte desde los alisios, como propone el manual. Pulsa un número en el mapa o en la lista.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cvC), H.h('div', {}, list, H.h('div', { style: { marginTop: '10px' } }, desc)))));
    updC();
    el.append(H.openQ('Ejercicio 5 del manual: ¿qué corriente baña las costas de Florida? ¿Qué importancia tiene? Explique su trayectoria.', 'La corriente de Florida, comienzo de la corriente del Golfo. Nace del agua que los alisios acumulan en el Caribe y el golfo de México (corrientes norecuatorial y del Caribe), sale por el estrecho de Florida, sube junto a la costa de EE. UU. hasta el cabo Hatteras y desde allí cruza el Atlántico hacia el nordeste; frente a Europa continúa como deriva noratlántica. Su importancia: transporta enormes cantidades de calor hacia el norte (es la parte superficial de la circulación de retorno del Atlántico), suaviza el clima de Europa occidental (fachadas libres de hielo hasta Noruega), alimenta borrascas al ceder calor y humedad al aire frío en invierno y forma, al encontrarse con la corriente fría del Labrador, las nieblas y los ricos caladeros de Terranova.'));

    el.append(H.fix('Corrientes superficiales', [
      'En el Índico, el monzón de invierno sopla del nordeste, no del noroeste; con él la corriente norecuatorial va hacia el oeste. En verano, con el monzón del suroeste, se forma la corriente monzónica hacia el este y la corriente de Somalia sube hacia el norte.',
      'La deriva noratlántica no se bifurca al «chocar contra Europa»: se divide en medio del océano, y la corriente de Canarias es la rama oriental del giro subtropical, que se cierra por el sur con la corriente norecuatorial.',
      'Las corrientes no son «como ríos» de agua homogénea: son flujos con meandros y remolinos de decenas a cientos de kilómetros, que transportan casi tanta energía como las corrientes medias.',
    ]));
    el.append(H.selfCheck([
      { q: 'En el hemisferio norte, los giros subtropicales giran…', opts: ['en el sentido de las agujas del reloj, alrededor de los anticiclones', 'en sentido contrario a las agujas del reloj', 'de este a oeste sin girar', 'según la estación'], a: 0, ex: ' Siguen a los vientos que rodean los anticiclones subtropicales (Azores, Hawái).' },
      { q: 'Las corrientes de las fachadas occidentales de los océanos (Golfo, Kuroshio, Brasil) son…', opts: ['frías y anchas', 'cálidas, estrechas y rápidas', 'inexistentes', 'iguales que las orientales'], a: 1, ex: ' Llevan agua tropical hacia los polos; son estrechas por la intensificación occidental.' },
      { q: 'La corriente de Somalia sube hacia el norte en…', opts: ['enero', 'julio, con el monzón del suroeste', 'todo el año', 'nunca'], a: 1, ex: ' Es la única gran corriente que invierte su sentido cada año.' },
      { q: 'La corriente de Canarias es…', opts: ['cálida, porque viene del ecuador', 'fría para su latitud: viene del norte y hay afloramiento', 'una rama de la corriente del Labrador', 'una corriente de marea'], a: 1, ex: ' Por eso el agua de Canarias está a unos 18-23 °C, más fresca que la de otras costas a 28° N.' },
    ]));
  },
});
