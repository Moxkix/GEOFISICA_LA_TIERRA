/* ===================== MOVIMIENTOS · EKMAN, AFLORAMIENTOS Y GIROS ===================== */
H.tab({
  id: 'ekman', nav: 'Afloramientos', title: 'La espiral de Ekman, los afloramientos y los giros oceánicos',
  init(el) {
    el.append(H.intro('Movimientos de equilibrio y debidos a los vientos · 2.1 y 2.4.2', 'El viento no empuja el agua en su misma dirección',
      'Por la rotación de la Tierra, el agua que arrastra el viento se desvía: la corriente superficial va unos 45° a la derecha del viento en el hemisferio norte (a la izquierda en el sur) y el transporte total de la capa superficial, 90°. Este efecto, descrito por V. W. Ekman en 1905, explica los afloramientos de agua fría en las costas, las convergencias y divergencias de la fig. 4.5 y, con la variación de Coriolis con la latitud, la forma de los grandes giros oceánicos.',
      'Manual: 2.1 y 2.4.2<br>Figs. 4.5 y 4.8'));
    const D2R = H.D2R;

    /* ================= A · espiral de Ekman ================= */
    const sA = { U: 10, lat: 43 };
    const cvA = H.h('canvas');
    const ek = () => {
      // profundidad y corriente superficial: relaciones empíricas de Ekman (en Pond y Pickard, 1983); transporte: τ/(ρ·f)
      const f = T4.f(sA.lat), af = Math.abs(f), tau = 1.22 * 1.3e-3 * sA.U * sA.U, rho = 1025, sq = Math.sqrt(Math.abs(Math.sin(sA.lat * D2R)));
      const D = 7.6 * sA.U / sq, V0 = 0.0127 * sA.U / sq, M = tau / (rho * af);
      return { f, tau, D, V0, M, nh: sA.lat >= 0 };
    };
    const csA = H.autoCanvas(cvA, (w) => Math.min(w * 0.75, 430), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const e = ek(), cx = w * 0.5, top = h * 0.16, depthPx = h * 0.68, L = Math.min(w, h) * 0.3;
      // proyección oblicua: x (este) a la derecha, y (norte) hacia arriba-derecha, z hacia abajo
      const P = (x, y, z) => [cx + x * L + y * L * 0.55, top + L * 0.45 - y * L * 0.45 + z * depthPx];
      // plano de la superficie
      ctx.fillStyle = 'rgba(80,150,200,.18)'; ctx.strokeStyle = 'rgba(31,111,139,.5)';
      const c = [[-1.3, -1], [1.3, -1], [1.3, 1], [-1.3, 1]].map(([x, y]) => P(x, y, 0));
      ctx.beginPath(); c.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.stroke();
      // eje vertical
      ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.setLineDash([3, 3]); const [ax0, ay0] = P(0, 0, 0), [ax1, ay1] = P(0, 0, 1.02); ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax1, ay1); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${H.f(e.D)} m (profundidad de Ekman)`, ax1 + 6, ay1);
      const arrow = (x0, y0, x1, y1, col, wd = 2) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy); if (l < 2) return; const ux = dx / l, uy = dy / l, hs = Math.min(9, 3 + l * 0.18); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * 0.7, y1 - uy * hs * 0.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * 0.5, y1 - uy * hs + ux * hs * 0.5); ctx.lineTo(x1 - ux * hs + uy * hs * 0.5, y1 - uy * hs - ux * hs * 0.5); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; };
      // viento hacia el norte
      { const [x0, y0] = P(0, -0.2, 0), [x1, y1] = P(0, 1.0, 0); const [x2, y2] = [x0, y0 - 46], [x3, y3] = [x1, y1 - 46]; arrow(x2, y2, x3, y3, '#5a6878', 3); ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.fillText(`viento: ${H.f(sA.U)} m/s`, x3 + 6, y3); }
      // espiral
      const s = e.nh ? 1 : -1, n = 14, pts = [];
      for (let k = 0; k <= n; k++) {
        const zf = k / n, z = -zf * e.D, mag = Math.exp(Math.PI * z / e.D), ang = 90 * D2R + s * (-45 * D2R + Math.PI * z / e.D);
        const vx = Math.cos(ang) * mag, vy = Math.sin(ang) * mag;
        const [x0, y0] = P(0, 0, zf), [x1, y1] = P(vx * 0.9, vy * 0.9, zf);
        pts.push([x1, y1]);
        arrow(x0, y0, x1, y1, k === 0 ? '#b4531d' : `rgba(31,111,139,${0.95 - zf * 0.6})`, k === 0 ? 2.6 : 1.6);
      }
      ctx.strokeStyle = 'rgba(31,111,139,.5)'; ctx.setLineDash([2, 3]); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
      // transporte neto: 90° a la derecha (N) o izquierda (S)
      { const [x0, y0] = P(0, 0, 0), [x1, y1] = P(s * 1.25, 0, 0); arrow(x0, y0 + 2, x1, y1 + 2, '#7a5aa8', 4); ctx.fillStyle = '#7a5aa8'; ctx.textAlign = s > 0 ? 'left' : 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('transporte de Ekman', x1 + s * 4, y1 - 4); }
      ctx.fillStyle = '#b4531d'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('corriente superficial (45°)', 8, 8);
      ctx.fillStyle = '#5a6878'; ctx.fillText(e.nh ? 'Hemisferio norte: desvío a la derecha' : 'Hemisferio sur: desvío a la izquierda', 8, 24);
      // rosa
      const [rx, ry] = [w - 38, h - 34]; ctx.strokeStyle = '#5a6878'; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 16, ry - 13); ctx.moveTo(rx, ry); ctx.lineTo(rx + 22, ry); ctx.stroke(); ctx.fillStyle = '#5a6878'; ctx.textBaseline = 'middle'; ctx.fillText('N', rx + 19, ry - 17); ctx.fillText('E', rx + 25, ry);
    });
    const roA = { s: H.ro('Corriente en superficie', 'hl'), d: H.ro('Profundidad de Ekman'), m: H.ro('Transporte por cada km de costa', 'bl') };
    const updA = () => {
      const e = ek();
      roA.s.v.innerHTML = H.f(e.V0 * 100) + ` <small>cm/s (${H.f(e.V0 / sA.U * 100, 1)} % del viento)</small>`;
      roA.d.v.innerHTML = H.f(e.D) + ' <small>m</small>';
      roA.m.v.innerHTML = H.f(e.M * 1000) + ' <small>m³/s</small>';
      csA.redraw();
    };
    const uA = H.slider('Velocidad del viento', 2, 25, 0.5, sA.U, (v) => H.f(v, 1) + ' m/s', (v) => { sA.U = v; updA(); });
    const lA = H.slider('Latitud', -70, 70, 1, sA.lat, (v) => (Math.abs(v) < 5 ? 'demasiado cerca del ecuador' : H.f(Math.abs(v)) + '° ' + (v < 0 ? 'S' : 'N')), (v) => { sA.lat = Math.abs(v) < 5 ? (v < 0 ? -5 : 5) : v; updA(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La espiral de Ekman'),
      H.h('p', { class: 'sub' }, 'El viento arrastra la capa más superficial; cada capa arrastra a la de debajo, más despacio, y Coriolis desvía todas un poco más. El resultado es una espiral de corrientes que giran y se debilitan con la profundidad hasta casi desaparecer a unas decenas de metros. Sumando todas, el agua se mueve en promedio a 90° del viento.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cvA), H.h('div', {}, uA, lA, H.h('div', { class: 'readouts' }, roA.s, roA.d, roA.m),
        H.h('p', { class: 'small' }, 'Profundidad y corriente superficial según las relaciones empíricas de Ekman (D ≈ 7,6·U/√sen φ y V₀ ≈ 0,0127·U/√sen φ); el transporte, τ/(ρ·f), no depende de cómo se reparta la corriente en la vertical. En el mar real la deriva superficial (con el oleaje) llega al 2-3 % del viento y se desvía 20-45°.')))));
    updA();

    /* ================= B · afloramiento costero ================= */
    const sB = { nh: true, coast: 'oeste', wind: 'ecuador' };
    const cvB = H.h('canvas');
    const csB = H.autoCanvas(cvB, (w) => Math.min(w * 0.45, 300), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const half = w / 2;
      // ---- planta ----
      const landRight = sB.coast === 'oeste'; // costa occidental de un continente: la tierra está al este (a la derecha)
      const cxL = half * 0.62;
      ctx.fillStyle = '#e8dcbf'; if (landRight) ctx.fillRect(cxL, 0, half - cxL, h); else ctx.fillRect(0, 0, half - cxL, h);
      ctx.fillStyle = 'rgba(80,150,200,.2)'; if (landRight) ctx.fillRect(0, 0, cxL, h); else ctx.fillRect(half - cxL, 0, cxL, h);
      ctx.strokeStyle = '#8a7650'; ctx.beginPath(); const xc = landRight ? cxL : half - cxL; ctx.moveTo(xc, 0); ctx.lineTo(xc, h); ctx.stroke();
      const towardEq = sB.wind === 'ecuador'; // viento hacia el ecuador
      const windUp = sB.nh ? !towardEq : towardEq; // en el mapa, arriba = norte
      const xs = landRight ? cxL * 0.5 : half - cxL * 0.5;
      const arrow = (x0, y0, x1, y1, col, wd = 3) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * 8, y1 - uy * 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * 11 - uy * 6, y1 - uy * 11 + ux * 6); ctx.lineTo(x1 - ux * 11 + uy * 6, y1 - uy * 11 - ux * 6); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; };
      const y0 = windUp ? h * 0.8 : h * 0.2, y1 = windUp ? h * 0.2 : h * 0.8;
      arrow(xs - 40, y0, xs - 40, y1, '#5a6878');
      // transporte: 90° a la derecha (N) o izquierda (S) del viento
      const wdir = windUp ? 1 : -1; // +1 = hacia el norte
      let tx = (sB.nh ? 1 : -1) * wdir; // norte → derecha (este) en el HN
      arrow(xs + 10, h / 2, xs + 10 + tx * 50, h / 2, '#7a5aa8', 4);
      const offshore = (tx > 0) !== landRight; // se aleja de la costa
      ctx.font = '11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center';
      ctx.fillText('Planta', half / 2, 14); ctx.fillStyle = '#5a6878'; ctx.fillText('viento', xs - 40, windUp ? h * 0.86 : h * 0.14);
      ctx.fillStyle = '#7a5aa8'; ctx.fillText('transporte', xs + 10 + tx * 25, h / 2 + 18);
      ctx.fillStyle = '#5a6878'; ctx.fillText(sB.nh ? 'N ↑ (hemisferio norte)' : 'N ↑ (hemisferio sur)', half / 2, h - 6);
      // ---- corte ----
      const x0 = half + 14, x1 = w - 10, sea = (x) => x, shoreLeft = !landRight; void sea;
      const sx0 = shoreLeft ? x0 + (x1 - x0) * 0.25 : x0, sx1 = shoreLeft ? x1 : x1 - (x1 - x0) * 0.25;
      const ySurf = h * 0.22, yBot = h * 0.92;
      ctx.fillStyle = '#e8dcbf'; if (shoreLeft) ctx.fillRect(x0, ySurf - 12, sx0 - x0, h); else ctx.fillRect(sx1, ySurf - 12, x1 - sx1, h);
      // capas: cálida arriba, fría abajo; termoclina inclinada
      const coastX = shoreLeft ? sx0 : sx1, farX = shoreLeft ? sx1 : sx0;
      const thC = offshore ? ySurf + 6 : ySurf + (yBot - ySurf) * 0.62, thF = ySurf + (yBot - ySurf) * 0.38;
      ctx.fillStyle = '#f2c79a'; ctx.beginPath(); ctx.moveTo(farX, ySurf); ctx.lineTo(coastX, ySurf); ctx.lineTo(coastX, thC); ctx.lineTo(farX, thF); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7fb0d0'; ctx.beginPath(); ctx.moveTo(farX, thF); ctx.lineTo(coastX, thC); ctx.lineTo(coastX, yBot); ctx.lineTo(farX, yBot); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c9b48a'; ctx.beginPath(); ctx.moveTo(farX, yBot); ctx.lineTo(coastX + (shoreLeft ? 1 : -1) * 45, yBot - 8); ctx.lineTo(coastX, ySurf + 55); ctx.lineTo(coastX, h); ctx.lineTo(farX, h); ctx.closePath(); ctx.fill();
      // flechas de circulación
      const dirOff = shoreLeft ? 1 : -1; // sentido mar adentro en el corte
      const midX = (coastX + farX) / 2;
      if (offshore) { arrow(coastX + dirOff * 14, ySurf + 10, midX, ySurf + 10, '#7a5aa8', 2.5); arrow(coastX + dirOff * 60, yBot - 22, coastX + dirOff * 30, ySurf + 24, '#1f4f8b', 2.5); }
      else { arrow(midX, ySurf + 10, coastX + dirOff * 14, ySurf + 10, '#7a5aa8', 2.5); arrow(coastX + dirOff * 30, ySurf + 24, coastX + dirOff * 60, yBot - 26, '#b4531d', 2.5); }
      ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.fillText('Corte perpendicular a la costa', (x0 + x1) / 2, 14);
      ctx.font = 'bold 12px system-ui'; ctx.fillStyle = offshore ? '#1f4f8b' : '#b4531d';
      ctx.fillText(offshore ? 'AFLORAMIENTO: sube agua fría y rica en nutrientes' : 'HUNDIMIENTO: el agua cálida se acumula y se hunde', (x0 + x1) / 2, h - 6);
      ctx.strokeStyle = 'rgba(28,40,54,.3)'; ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, h); ctx.stroke();
    });
    const segB1 = H.seg([[true, 'Hemisferio norte'], [false, 'Hemisferio sur']], true, (v) => { sB.nh = v; csB.redraw(); });
    const segB2 = H.seg([['oeste', 'Costa occidental de un continente'], ['este', 'Costa oriental']], 'oeste', (v) => { sB.coast = v; csB.redraw(); });
    const segB3 = H.seg([['ecuador', 'Viento hacia el ecuador'], ['polo', 'Viento hacia el polo']], 'ecuador', (v) => { sB.wind = v; csB.redraw(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Afloramiento costero: el viento paralelo a la costa'),
      H.h('p', { class: 'sub' }, 'Cuando el viento sopla paralelo a la costa, el transporte de Ekman lleva el agua superficial mar adentro o hacia la costa. Si se aleja, agua fría y rica en nutrientes sube desde 100-300 m para reponerla: es un afloramiento. En las costas occidentales de los continentes los alisios soplan hacia el ecuador y producen afloramientos permanentes (Canarias y Mauritania, Benguela, Perú, California); en Galicia y Portugal el afloramiento es de primavera y verano, con el viento del norte del anticiclón de las Azores.'),
      H.h('div', { class: 'viz framed' }, cvB), H.h('div', { class: 'row', style: { marginTop: '10px', gap: '8px' } }, segB1, segB2, segB3)));

    /* ================= C · clorofila y temperatura: los afloramientos vistos desde el espacio ================= */
    if (OCEANO && OCEANO.chl) {
      const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 };
      const chl = OCEANO.chl.map((a) => T4.grid(a, G1)), sst = OCEANO.sst ? OCEANO.sst.map((a) => T4.grid(a, G1)) : null;
      const BBC = { mundo: T4.BB.mundo, canarias: [-30, 0, 10, 46], peru: [-95, -65, -30, 5], benguela: [0, 25, -36, -10], arabia: [40, 80, 0, 28], california: [-135, -105, 20, 48] };
      const SEAS = ['diciembre-febrero', 'marzo-mayo', 'junio-agosto', 'septiembre-noviembre'];
      const sC = { var: 'chl', s: 2, r: 'canarias' };
      const cvC = H.h('canvas');
      const mapC = T4.map(cvC, { bbox: BBC[sC.r], grid: 10, key: () => sC.var + sC.s + sC.r, aspect: (w) => Math.min(w * T3.aspect(BBC[sC.r], sC.r !== 'mundo'), 560),
        color: (lat, lon) => { if (sC.var === 'chl') { const v = chl[sC.s].at(lat, lon); return v === v ? T4.chlColor(v) : [200, 200, 200]; } const m = [1, 4, 7, 10][sC.s]; const v = sst[m].at(lat, lon); return v === v ? T4.sstColor(v) : null; } });
      T4.hover(cvC, mapC, (lat, lon) => { if (H.land(lat, lon) > 0.5) return null; if (sC.var === 'chl') { const v = chl[sC.s].at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)}<br><b>${H.f(10 ** v, 10 ** v < 1 ? 2 : 1)} mg/m³</b> de clorofila` : 'sin datos (nubes o noche polar)'; } const v = sst[[1, 4, 7, 10][sC.s]].at(lat, lon); return v === v ? `${T4.ll(lat, lon, 0)}<br><b>${T4.fT(v)}</b>` : null; });
      const legC = H.h('div', {});
      const updC = () => { legC.innerHTML = ''; legC.append(sC.var === 'chl' ? T3.legend(T4.chlColor, -1.7, 1.6, [-1.5, -1, -0.5, 0, 0.5, 1], (v) => H.f(10 ** v, v < -1.2 ? 2 : v < -0.2 ? 1 : 0) + (v === 1 ? ' mg/m³' : '')) : T3.legend(T4.sstColor, -2, 32, [0, 10, 20, 30], (v) => v + (v === 30 ? ' °C' : ''))); mapC.invalidate(); };
      const r1 = H.seg([['chl', 'Clorofila'], ['sst', 'Temperatura']].filter(([k]) => k === 'chl' || sst), 'chl', (v) => { sC.var = v; updC(); });
      const r2 = H.seg(SEAS.map((s, i) => [i, ['Dic-feb', 'Mar-may', 'Jun-ago', 'Sep-nov'][i]]), sC.s, (v) => { sC.s = v; updC(); });
      const r3 = H.seg([['canarias', 'Iberia y Canarias'], ['peru', 'Perú'], ['benguela', 'Benguela'], ['california', 'California'], ['arabia', 'Mar Arábigo'], ['mundo', 'Mundo']], sC.r, (v) => { sC.r = v; mapC.setBBox(BBC[v]); mapC.opts.grid = v === 'mundo' ? 30 : 10; updC(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Los afloramientos vistos desde el espacio'),
        H.h('p', { class: 'sub' }, 'Los satélites miden el color del mar: donde hay más fitoplancton, el agua es más verde. La clorofila marca así los afloramientos, donde los nutrientes que sube el agua profunda alimentan la base de las pesquerías más ricas del mundo (anchoveta del Perú, sardina de Galicia y del noroeste de África). Compara la clorofila con la temperatura: el agua que aflora es más fría que la de alta mar a la misma latitud. Fíjate también en el mar Arábigo en junio-agosto, con el monzón del suroeste, y en la banda del ecuador, donde los alisios provocan una divergencia.'),
        H.h('div', { class: 'row', style: { gap: '8px' } }, r1, r2), H.h('div', { style: { margin: '8px 0' } }, r3),
        H.h('div', { class: 'viz framed' }, cvC), legC,
        H.h('p', { class: 'small' }, `Clorofila a: ${OCEANO.srcs && OCEANO.srcs.chl ? OCEANO.srcs.chl : 'MODIS-Aqua'} (gris: sin datos, por nubes persistentes o noche polar). Temperatura: NOAA OISST, media 1991-2020 del mes central de cada estación. Rejilla de 1°: los afloramientos de Galicia y Portugal, de unos 50 km de anchura, se ven atenuados.`)));
      updC();
    }

    /* ================= D · giros: la intensificación occidental ================= */
    const sD = { beta: true };
    const cvD = H.h('canvas'), cvD2 = H.h('canvas');
    const NX = 120, NY = 80, LAM = 1.5;
    const stommel = (alpha) => {
      const k = Math.PI, A = -alpha / 2 + Math.sqrt(alpha * alpha / 4 + k * k), B = -alpha / 2 - Math.sqrt(alpha * alpha / 4 + k * k);
      const eA = Math.exp(A * LAM), eB = Math.exp(B * LAM), p = (1 - eB) / (eA - eB), q = 1 - p;
      const psi = new Float32Array(NX * NY);
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const x = (i + 0.5) / NX * LAM, y = 1 - (j + 0.5) / NY; psi[j * NX + i] = Math.sin(k * y) * (p * Math.exp(A * x) + q * Math.exp(B * x) - 1); }
      let mn = 0, mx = 0; for (const v of psi) { mn = Math.min(mn, v); mx = Math.max(mx, v); } const sc = -mn > mx ? mn : mx; for (let i = 0; i < psi.length; i++) psi[i] /= sc;
      return psi;
    };
    let PSI = null;
    const csD = H.autoCanvas(cvD, (w) => Math.min(w / LAM * 0.95, 380), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const padL = 60, padR = 12, padT = 14, padB = 22, bw = w - padL - padR, bh = h - padT - padB;
      const g = { nx: NX, ny: NY, data: PSI, lonAt: (i) => (i + 0.5) / NX * LAM, latAt: (j) => 1 - (j + 0.5) / NY };
      const P = { X: (x) => padL + x / LAM * bw, Y: (y) => padT + (1 - y) * bh, w, h };
      ctx.fillStyle = 'rgba(80,150,200,.15)'; ctx.fillRect(padL, padT, bw, bh);
      T3.contour(ctx, g, [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.97], P, { color: '#1f6f8b', width: 1.4, label: false });
      ctx.strokeStyle = '#8a7650'; ctx.lineWidth = 3; ctx.strokeRect(padL, padT, bw, bh); ctx.lineWidth = 1;
      // flechas de sentido sobre la línea 0,55
      ctx.fillStyle = '#1f6f8b';
      // perfil del viento a la izquierda
      ctx.strokeStyle = '#5a6878'; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const y = k / 40, u = -Math.cos(Math.PI * y); const x = padL - 30 + u * 22, yy = P.Y(y); k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
      for (const y of [0.12, 0.88]) { const u = -Math.cos(Math.PI * y), x0 = padL - 30, x1 = x0 + u * 22, yy = P.Y(y); ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x1 - Math.sign(u) * 6, yy - 4); ctx.lineTo(x1 - Math.sign(u) * 6, yy + 4); ctx.closePath(); ctx.fillStyle = '#5a6878'; ctx.fill(); }
      ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.fillText('ponientes', padL - 30, P.Y(0.97)); ctx.fillText('alisios', padL - 30, P.Y(0.03) + 2);
      ctx.fillText('Oeste', padL + 20, h - 6); ctx.fillText('Este', padL + bw - 20, h - 6);
      // sentido del giro
      ctx.font = 'bold 18px system-ui'; ctx.fillStyle = '#1f6f8b'; ctx.fillText('↻', P.X(sD.beta ? 0.35 : 0.75), P.Y(0.5) + 6);
    });
    const chD = H.chart(cvD2, 0.42);
    const updD = () => {
      PSI = stommel(sD.beta ? 12 : 0);
      const j = Math.round(NY / 2), pts = [];
      for (let i = 1; i < NX - 1; i++) { const v = (PSI[j * NX + i + 1] - PSI[j * NX + i - 1]) / (2 * LAM / NX); pts.push([(i + 0.5) / NX * LAM, v]); }
      const mx = Math.max(...pts.map((p) => Math.abs(p[1])));
      chD.draw({ xMin: 0, xMax: LAM, yMin: -12, yMax: 12, xLabel: 'Del borde oeste al borde este de la cuenca', yLabel: 'Velocidad norte-sur', xTicks: [{ v: 0, label: 'O' }, { v: LAM, label: 'E' }], yTicks: [{ v: -12, label: 'S' }, { v: 0, label: '0' }, { v: 12, label: 'N' }],
        series: [{ pts: pts.map(([x, v]) => [x, v * 12 / Math.max(mx, 1e-6) * (sD.beta ? 1 : 0.35)]), color: '#b4531d', width: 2.4, fill: 'rgba(180,83,29,.1)' }], hlines: [{ y: 0, color: '#999' }] });
      csD.redraw();
    };
    const segD = H.seg([[true, 'Con Coriolis variable con la latitud'], [false, 'Con Coriolis constante']], true, (v) => { sD.beta = v; updD(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Por qué las corrientes son más fuertes en el oeste de los océanos'),
      H.h('p', { class: 'sub' }, 'Un océano rectangular del hemisferio norte con ponientes al norte y alisios al sur forma un giro en el sentido de las agujas del reloj. Si la fuerza de Coriolis fuera igual en todas las latitudes, el giro sería simétrico. Como crece hacia el polo, el giro se aplasta contra el borde oeste: allí la corriente hacia el norte es estrecha y rápida (la corriente del Golfo, Kuroshio, Brasil, Agulhas) y en el resto de la cuenca el retorno hacia el ecuador es ancho y lento (Canarias, California). Es el modelo de H. Stommel (1948).'),
      segD, H.h('div', { class: 'grid2', style: { marginTop: '8px' } }, H.h('div', { class: 'viz framed' }, cvD), H.h('div', { class: 'viz' }, cvD2))));
    updD();

    el.append(H.fix('Movimientos debidos al viento', [
      'El manual no explica el transporte de Ekman, que es la clave de los movimientos verticales de la fig. 4.5: el agua superficial no se mueve en la dirección del viento, sino desviada (45° la superficie y 90° el conjunto de la capa).',
      'Los afloramientos costeros no se producen donde «los vientos se desvían de la costa», sino donde el viento sopla paralelo a ella con la costa a su izquierda en el hemisferio norte (a su derecha en el sur), de modo que el transporte de Ekman aleja el agua de la orilla.',
      'El agua fría de la costa del Sáhara no ocupa un «vacío» dejado por la corriente norecuatorial: aflora porque los alisios, paralelos a la costa, empujan el agua superficial mar adentro.',
    ]));
    el.append(H.selfCheck([
      { q: 'En el hemisferio norte sopla un viento del sur (hacia el norte). El transporte de Ekman va hacia…', opts: ['el norte', 'el este', 'el oeste', 'el sur'], a: 1, ex: ' 90° a la derecha del sentido hacia el que sopla el viento.' },
      { q: 'En la costa de Galicia sopla viento del norte en verano. ¿Qué ocurre?', opts: ['El agua superficial se acumula en la costa y se hunde', 'El agua superficial se aleja hacia el oeste y aflora agua fría', 'No ocurre nada', 'Sube el nivel del mar'], a: 1, ex: ' El transporte se dirige 90° a la derecha del viento (hacia el oeste): mar adentro. Es el afloramiento que fertiliza las rías.' },
      { q: '¿Por qué las costas de Perú y del Sáhara tienen mucha clorofila?', opts: ['Por los ríos', 'Por el afloramiento de aguas profundas ricas en nutrientes', 'Por las mareas', 'Porque el agua es cálida'], a: 1, ex: ' Los alisios paralelos a la costa provocan afloramientos casi permanentes.' },
      { q: 'La corriente del Golfo es estrecha y rápida porque…', opts: ['allí el viento es más fuerte', 'la fuerza de Coriolis aumenta con la latitud y concentra el giro en el borde oeste', 'el Caribe es poco profundo', 'el agua es más cálida'], a: 1, ex: ' Es la intensificación occidental (Stommel, 1948), presente en todos los grandes giros.' },
    ]));
  },
});
