/* ===================== AGUAS MARINAS · PROPIEDADES Y DENSIDAD ===================== */
H.tab({
  id: 'densidad', nav: 'Densidad', title: 'Propiedades del agua del mar y densidad',
  init(el) {
    el.append(H.intro('Las aguas marinas · apartados 1.2 y 1.3', 'Temperatura, salinidad y presión deciden la densidad',
      'El agua del mar es más densa cuanto más fría, más salada y más comprimida está. Esas diferencias de densidad, aunque pequeñas (de unos 1.020 a 1.030 kg/m³ en superficie), ordenan el océano en capas y ponen en marcha los movimientos verticales y la circulación profunda. Los cálculos usan la ecuación de estado internacional del agua del mar (UNESCO, EOS-80).',
      'Manual: 1.2 y 1.3<br>Figs. 4.2 y 4.4'));

    /* ================= A · diagrama T-S ================= */
    const SM = [0, 42], TM = [-2.5, 32];
    const sA = { a: { S: 35.0, T: 15 }, b: { S: 38.5, T: 13 }, mix: false, z: 0, wm: true, drag: null };
    // rejilla de σ0 para las isopicnas
    const RES = 0.25, nx = (SM[1] - SM[0]) / RES, ny = (TM[1] - TM[0]) / RES, sig = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const S = SM[0] + (i + 0.5) * RES, T = TM[1] - (j + 0.5) * RES; sig[j * nx + i] = T < T4.tFreeze(S) - 0.6 ? NaN : T4.sigma(S, T); }
    const gS = T4.grid(sig, { nx, ny, lon0: SM[0], lat0: TM[1], res: RES });
    const WM = [ // masas de agua (valores típicos de temperatura potencial y salinidad)
      ['Agua central del Atlántico Norte', 36.2, 16, 'superficial-central'], ['Agua mediterránea (en el Atlántico, a ~1.000 m)', 36.4, 11.5, 'intermedia'],
      ['Agua mediterránea (en el Mediterráneo)', 38.5, 13.2, 'intermedia'], ['Agua profunda del Atlántico Norte', 34.95, 3, 'profunda'],
      ['Agua intermedia antártica', 34.3, 4, 'intermedia'], ['Agua de fondo antártica', 34.66, -0.4, 'de fondo'],
      ['Agua del mar Rojo', 40.5, 22, 'superficial'], ['Agua superficial del Báltico', 7, 10, 'superficial'], ['Agua superficial ecuatorial', 34.8, 28, 'superficial'],
    ];
    const cvA = H.h('canvas'); const PAD = { l: 50, r: 14, t: 14, b: 40 };
    let PA = null, bgA = null;
    const csA = H.autoCanvas(cvA, (w) => Math.min(w * 0.82, 520), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const X = (S) => PAD.l + (S - SM[0]) / (SM[1] - SM[0]) * (w - PAD.l - PAD.r), Y = (T) => h - PAD.b - (T - TM[0]) / (TM[1] - TM[0]) * (h - PAD.t - PAD.b);
      PA = { X, Y, w, h, inv: (x, y) => [TM[0] + (h - PAD.b - y) / (h - PAD.t - PAD.b) * (TM[1] - TM[0]), SM[0] + (x - PAD.l) / (w - PAD.l - PAD.r) * (SM[1] - SM[0])], bbox: [SM[0], SM[1], TM[0], TM[1]] };
      // fondo por densidad (se guarda mientras no cambie el tamaño)
      if (!bgA || bgA.w !== w || bgA.h !== h) {
        const iw = Math.round(w - PAD.l - PAD.r), ih = Math.round(h - PAD.t - PAD.b), cv2 = document.createElement('canvas'); cv2.width = iw; cv2.height = ih;
        const c2 = cv2.getContext('2d'), img = c2.createImageData(iw, ih);
        const ramp = T4.ramp([[-4, [250, 240, 214]], [10, [236, 244, 240]], [20, [206, 228, 238]], [26, [170, 204, 228]], [30, [140, 178, 214]], [34, [118, 150, 200]]]);
        for (let j = 0; j < ih; j++) for (let i = 0; i < iw; i++) {
          const [T, S] = PA.inv(PAD.l + i, PAD.t + j); const k = (j * iw + i) * 4;
          const c = T < T4.tFreeze(S) ? [222, 232, 240] : ramp(T4.sigma(S, T));
          img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
        }
        c2.putImageData(img, 0, 0); bgA = { w, h, cv: cv2 };
      }
      ctx.drawImage(bgA.cv, PAD.l, PAD.t);
      // rejilla
      ctx.font = '11px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.12)'; ctx.fillStyle = '#5a6878';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let T = 0; T <= 30; T += 5) { ctx.beginPath(); ctx.moveTo(PAD.l, Y(T)); ctx.lineTo(w - PAD.r, Y(T)); ctx.stroke(); ctx.fillText(T + ' °C', PAD.l - 5, Y(T)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let S = 0; S <= 40; S += 5) { ctx.beginPath(); ctx.moveTo(X(S), PAD.t); ctx.lineTo(X(S), h - PAD.b); ctx.stroke(); ctx.fillText(S, X(S), h - PAD.b + 4); }
      ctx.fillText('Salinidad', (PAD.l + w - PAD.r) / 2, h - 16);
      ctx.save(); ctx.translate(12, (PAD.t + h - PAD.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText('Temperatura', 0, 0); ctx.restore();
      // isopicnas
      ctx.save(); ctx.beginPath(); ctx.rect(PAD.l, PAD.t, w - PAD.l - PAD.r, h - PAD.t - PAD.b); ctx.clip();
      const LEV = [0, 5, 10, 15, 20, 23, 25, 26, 27, 28, 29, 30];
      T3.contour(ctx, gS, LEV, PA, { color: 'rgba(28,40,54,.45)', width: 0.8, label: false });
      // etiquetas de las isopicnas, escalonadas para que no se solapen
      const labs = [];
      for (const L of LEV) {
        let Tl = { 23: 25, 25: 21.5, 26: 17.5, 27: 13, 28: 8.5, 29: 4.5, 30: 1 }[L] ?? 25, a = 0, b = 42;
        if (T4.sigma(42, Tl) < L) continue;
        for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (T4.sigma(m, Tl) < L) a = m; else b = m; }
        labs.push([[X((a + b) / 2), Y(Tl)], L]);
      }
      T3.drawLabels(ctx, labs, (L) => 'σ ' + L);
      // congelación y máxima densidad
      ctx.lineWidth = 2; ctx.strokeStyle = '#1f6f8b'; ctx.beginPath(); for (let S = 0; S <= 42; S += 0.5) { const y = Y(T4.tFreeze(S)); S ? ctx.lineTo(X(S), y) : ctx.moveTo(X(S), y); } ctx.stroke();
      ctx.strokeStyle = '#b4531d'; ctx.setLineDash([6, 4]); ctx.beginPath(); for (let S = 0; S <= 24.7; S += 0.5) { const y = Y(T4.tMaxDens(S)); S ? ctx.lineTo(X(S), y) : ctx.moveTo(X(S), y); } ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#1f6f8b'; ctx.fillText('punto de congelación', X(7), Y(T4.tFreeze(7)) - 3);
      ctx.fillStyle = '#b4531d'; ctx.fillText('temperatura de máxima densidad', X(1), Y(T4.tMaxDens(1)) - 6);
      const xc = X(24.7), yc = Y(T4.tFreeze(24.7)); ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.arc(xc, yc, 3.5, 0, 7); ctx.fill(); ctx.textBaseline = 'top'; ctx.fillText('S = 24,7', xc + 5, yc + 2);
      // masas de agua
      if (sA.wm) { ctx.font = '10.5px system-ui'; WM.forEach(([n, S, T]) => { const x = X(S), y = Y(T); ctx.fillStyle = '#2d7a4c'; ctx.beginPath(); ctx.rect(x - 3.5, y - 3.5, 7, 7); ctx.fill(); }); }
      // mezcla
      const pa = sA.a, pb = sA.b;
      if (sA.mix) { ctx.strokeStyle = '#7a5aa8'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(pa.S), Y(pa.T)); ctx.lineTo(X(pb.S), Y(pb.T)); ctx.stroke(); ctx.setLineDash([]); const m = { S: (pa.S + pb.S) / 2, T: (pa.T + pb.T) / 2 }; ctx.fillStyle = '#7a5aa8'; ctx.beginPath(); ctx.arc(X(m.S), Y(m.T), 5, 0, 7); ctx.fill(); }
      ctx.restore();
      for (const [p, lab, col] of sA.mix ? [[pa, 'A', '#b4531d'], [pb, 'B', '#1f6f8b']] : [[pa, '', '#b4531d']]) {
        ctx.fillStyle = col; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(p.S), Y(p.T), 8, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
        if (lab) { ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, X(p.S), Y(p.T) + 0.5); }
      }
    });
    const tip = T4.hover(cvA, csA, () => null);
    const near = (x, y) => { if (!PA) return null; const pts = sA.mix ? ['a', 'b'] : ['a']; let b = null, bd = 22; for (const k of pts) { const d = Math.hypot(PA.X(sA[k].S) - x, PA.Y(sA[k].T) - y); if (d < bd) { bd = d; b = k; } } return b; };
    const setAt = (k, x, y) => { const [T, S] = PA.inv(x, y); sA[k].S = H.clamp(S, 0, 42); sA[k].T = H.clamp(T, T4.tFreeze(sA[k].S), 32); updA(); };
    H.drag(cvA, {
      down: (e) => { const [x, y] = csA.pos(e); sA.drag = near(x, y) || (sA.mix ? null : 'a'); if (sA.drag) setAt(sA.drag, x, y); },
      move: (e) => { if (!sA.drag) return; const [x, y] = csA.pos(e); setAt(sA.drag, x, y); },
      up: () => { sA.drag = null; },
    });
    cvA.addEventListener('mousemove', (e) => {
      if (!PA || !sA.wm) { tip.style.display = 'none'; return; }
      const [x, y] = csA.pos(e); const m = WM.find(([, S, T]) => Math.hypot(PA.X(S) - x, PA.Y(T) - y) < 8);
      if (!m) { tip.style.display = 'none'; return; }
      tip.innerHTML = `<b>${m[0]}</b><br>S = ${H.f(m[1], 2)} · ${T4.fT(m[2])} · σ = ${H.f(T4.sigma(m[1], m[2]), 2)}`; tip.style.display = 'block'; tip.style.left = (x / csA.w * 100) + '%'; tip.style.top = (y / csA.h * 100) + '%';
    });
    const roA = { rho: H.ro('Densidad en superficie', 'hl'), sig: H.ro('Densidad a la profundidad elegida'), tf: H.ro('Punto de congelación', 'bl'), md: H.ro('Máximo de densidad'), mx: H.ro('Mezcla de A y B a partes iguales', 'wide') };
    const updA = () => {
      const { S, T } = sA.a, p = T4.pres(sA.z);
      roA.rho.v.innerHTML = H.f(T4.rho(S, T), 2) + ' <small>kg/m³</small>';
      roA.sig.v.innerHTML = H.f(T4.rho(S, T, p), 2) + ` <small>kg/m³ a ${H.f(sA.z)} m</small>`;
      roA.tf.v.innerHTML = T4.fT(T4.tFreeze(S, p), 2);
      roA.md.v.innerHTML = S < 24.7 ? T4.fT(T4.tMaxDens(S), 2) + ' <small>(antes de congelarse)</small>' : '<small>no hay: se hace más densa hasta congelarse</small>';
      if (sA.mix) {
        const a = sA.a, b = sA.b, m = { S: (a.S + b.S) / 2, T: (a.T + b.T) / 2 };
        const ra = T4.rho(a.S, a.T, p), rb = T4.rho(b.S, b.T, p), rm = T4.rho(m.S, m.T, p);
        roA.mx.v.innerHTML = `A: ${H.f(ra, 2)} · B: ${H.f(rb, 2)} · mezcla: <b>${H.f(rm, 2)}</b> <small>kg/m³ a ${H.f(sA.z)} m. ${rm > (ra + rb) / 2 + 0.005 ? `La mezcla es ${H.f(rm - (ra + rb) / 2, 3)} kg/m³ más densa que la media de las dos («cabbeling»): las isopicnas son curvas.` : ''} ${Math.abs(ra - rb) < 0.01 ? 'A y B tienen la misma densidad.' : ra > rb ? 'A es más densa: se hunde bajo B.' : 'B es más densa: se hunde bajo A.'}</small>`;
        roA.mx.style.display = '';
      } else roA.mx.style.display = 'none';
      csA.redraw();
    };
    const zA = H.slider('Profundidad (presión)', 0, 5000, 50, 0, (v) => H.f(v) + ' m', (v) => { sA.z = v; updA(); });
    const segA = H.seg([[false, 'Una muestra'], [true, 'Mezclar dos aguas']], false, (v) => { sA.mix = v; updA(); });
    const wmChk = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', checked: true, onchange: (e) => { sA.wm = e.target.checked; csA.redraw(); } }), ' Masas de agua (cuadrados verdes)');
    const pre = H.h('div', { class: 'chipbar' });
    [['Agua dulce a 4 °C', 0, 4], ['Báltico', 7, 10], ['Atlántico tropical', 36.4, 26], ['Cantábrico en invierno', 35.6, 12.5], ['Mediterráneo en verano', 37.8, 25], ['Mar Rojo', 40.5, 26], ['Mar de Weddell', 34.6, -1.85]].forEach(([n, S, T]) => {
      const b = H.h('button', { class: 'chip', type: 'button' }, n); b.onclick = () => { sA.a = { S, T }; updA(); }; pre.append(b);
    });
    const preM = H.h('div', { class: 'chipbar' });
    const sameRho = (S0, T0, T1) => { let a = 0, b = 42; const r = T4.rho(S0, T0); for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (T4.rho(m, T1) < r) a = m; else b = m; } return (a + b) / 2; };
    [['Atlántico y Mediterráneo en Gibraltar', [36.2, 15], [38.4, 13.2]], ['Dos aguas de igual densidad (polar y subtropical)', [34.0, 0.5], [null, 14.0]]].forEach(([n, a, b]) => {
      const bt = H.h('button', { class: 'chip', type: 'button' }, n); bt.onclick = () => { sA.mix = true; segA.set(true); sA.a = { S: a[0], T: a[1] }; sA.b = { S: b[0] == null ? sameRho(a[0], a[1], b[1]) : b[0], T: b[1] }; updA(); }; preM.append(bt);
    });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Laboratorio de densidad: el diagrama T-S'),
      H.h('p', { class: 'sub' }, 'Arrastra la muestra por el diagrama de temperatura y salinidad. Las líneas grises unen aguas de igual densidad (isopicnas, en σ = densidad − 1.000 kg/m³). Fíjate en que son curvas: en aguas frías la densidad depende casi solo de la salinidad, y en aguas cálidas sobre todo de la temperatura. La línea discontinua es la temperatura de máxima densidad: por encima de una salinidad de 24,7 corta a la de congelación y el agua del mar ya no tiene máximo de densidad.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cvA),
        H.h('div', {}, segA, zA, wmChk, H.h('p', { class: 'small', style: { margin: '8px 0 4px' } }, 'Muestras:'), pre, H.h('p', { class: 'small', style: { margin: '8px 0 4px' } }, 'Mezclas:'), preM,
          H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, roA.rho, roA.sig, roA.tf, roA.md, roA.mx)))));
    updA();

    /* ================= B · el hielo y la salmuera ================= */
    const sB = { hi: 0, S0: 34.3, D: 100, Sdeep: 34.68, Tdeep: -0.4 };
    const cvB = H.h('canvas');
    const roB = { s: H.ro('Salinidad de la capa superficial'), r: H.ro('Su densidad (σ)', 'hl'), d: H.ro('Agua de debajo (σ)'), st: H.ro('Resultado', 'bl') };
    const calcB = () => {
      const rhoI = 917, Si = 6, mw = 1027 * sB.D, mi = rhoI * sB.hi; // kg/m²
      const S = (sB.S0 * mw - Si * mi) / (mw - mi), T = T4.tFreeze(S);
      return { S, T, sig: T4.sigma(S, T), sigD: T4.sigma(sB.Sdeep, sB.Tdeep) };
    };
    const csB = H.autoCanvas(cvB, (w) => Math.min(w * 0.6, 300), (ctx, w, h) => {
      const r = calcB(); ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const top = 40, iceH = Math.min(60, sB.hi * 18), mixB = top + 20 + (h - top - 20) * 0.45;
      // aire
      ctx.fillStyle = '#eef3f7'; ctx.fillRect(0, 0, w, top);
      ctx.fillStyle = '#5a6878'; ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('aire a −25 °C: el mar pierde calor y se congela', 8, 8);
      // capa de mezcla
      const dens = (s) => T4.ramp([[26.5, [190, 220, 238]], [27.6, [110, 160, 205]], [28.2, [40, 80, 150]]])(s);
      ctx.fillStyle = T3.css(dens(r.sig)); ctx.fillRect(0, top, w, mixB - top);
      ctx.fillStyle = T3.css(dens(r.sigD)); ctx.fillRect(0, mixB, w, h - mixB);
      // hielo
      if (sB.hi > 0) { ctx.fillStyle = '#f4f8fb'; ctx.strokeStyle = '#a9c0d0'; ctx.fillRect(w * 0.08, top - iceH * 0.1, w * 0.84, iceH); ctx.strokeRect(w * 0.08, top - iceH * 0.1, w * 0.84, iceH); ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (iceH > 12) ctx.fillText(`hielo de ${H.f(sB.hi, 1)} m (salinidad ≈ 6)`, w / 2, top - iceH * 0.1 + iceH / 2); }
      // gotas de salmuera
      ctx.fillStyle = 'rgba(40,60,110,.55)';
      const nDrops = Math.round(sB.hi * 25); for (let k = 0; k < nDrops; k++) { const x = w * 0.1 + (k * 97 % 100) / 100 * w * 0.8, y = top + iceH * 0.9 + 6 + ((k * 37) % 100) / 100 * (mixB - top - iceH - 10); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); }
      // flechas de convección si la capa es más densa que la de abajo
      if (r.sig > r.sigD) { ctx.strokeStyle = '#b4531d'; ctx.fillStyle = '#b4531d'; ctx.lineWidth = 2.5; for (const fx of [0.25, 0.5, 0.75]) { const x = w * fx; ctx.beginPath(); ctx.moveTo(x, mixB - 30); ctx.lineTo(x, h - 20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, h - 12); ctx.lineTo(x - 7, h - 24); ctx.lineTo(x + 7, h - 24); ctx.closePath(); ctx.fill(); } ctx.lineWidth = 1; }
      ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.font = '11px system-ui';
      ctx.fillText(`capa superficial (${sB.D} m): S = ${H.f(r.S, 2)}, ${T4.fT(r.T, 2)}, σ = ${H.f(r.sig, 2)}`, 8, mixB - 4);
      ctx.fillStyle = '#fff'; ctx.fillText(`agua profunda: S = ${H.f(sB.Sdeep, 2)}, ${T4.fT(sB.Tdeep, 1)}, σ = ${H.f(r.sigD, 2)}`, 8, h - 6);
    });
    const updB = () => {
      const r = calcB();
      roB.s.v.innerHTML = H.f(r.S, 2) + ` <small>(+${H.f(r.S - sB.S0, 2)})</small>`;
      roB.r.v.innerHTML = H.f(r.sig, 3) + ' <small>kg/m³</small>';
      roB.d.v.innerHTML = H.f(r.sigD, 3) + ' <small>kg/m³</small>';
      roB.st.v.innerHTML = r.sig > r.sigD ? 'Se hunde hasta el fondo: se forma agua de fondo' : `Flota: le faltan ${H.f(r.sigD - r.sig, 3)} kg/m³`;
      csB.redraw();
    };
    const hiB = H.slider('Hielo formado en el invierno', 0, 3, 0.05, 0, (v) => H.f(v, 2) + ' m', (v) => { sB.hi = v; updB(); });
    const dB = H.slider('Espesor de la capa superficial', 30, 300, 10, sB.D, (v) => H.f(v) + ' m', (v) => { sB.D = v; updB(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El hielo marino expulsa sal y fabrica agua densa'),
      H.h('p', { class: 'sub' }, 'Al congelarse el agua del mar, la mayor parte de la sal queda fuera del hielo en forma de salmuera, que sale por canales y se mezcla con el agua de debajo. La capa superficial, ya en el punto de congelación, se va haciendo más salada y más densa hasta que se hunde. Así se forma el agua de fondo antártica en las plataformas de los mares de Weddell y Ross. Ajusta cuánto hielo se forma en un invierno.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cvB), H.h('div', {}, hiB, dB, H.h('div', { class: 'readouts' }, roB.s, roB.r, roB.d, roB.st),
        H.h('p', { class: 'small' }, 'El hielo marino del primer año alcanza 1-2 m de espesor y el que sobrevive varios veranos, 3-4 m; su salinidad baja con el tiempo (de 10-15 al formarse a menos de 4 en el hielo viejo).')))));
    updB();

    /* ================= C · el océano, almacén de calor ================= */
    const sC = { z: 10 };
    const roC = { r: H.ro('Calor que almacena por grado, comparado con toda la atmósfera', 'hl'), e: H.ro('Espesor de océano equivalente a la atmósfera') };
    const CA = 101325 / 9.81 * 1004, CO = 1025 * 3990; // J/(m²·K) de la columna de aire y por metro de agua
    const updC = () => { roC.r.v.innerHTML = '×' + H.f(sC.z * CO / CA, 1); roC.e.v.innerHTML = H.f(CA / CO, 1) + ' <small>m</small>'; };
    const zC = H.slider('Espesor de la capa del océano', 1, 200, 1, sC.z, (v) => H.f(v) + ' m', (v) => { sC.z = v; updC(); });
    el.append(H.h('div', { class: 'grid2 even' },
      H.h('div', { class: 'card' }, H.h('h3', {}, 'El océano, acumulador de calor'),
        H.h('p', { class: 'sub' }, 'El agua tiene un calor específico cuatro veces mayor que el del aire y la atmósfera pesa como una capa de agua de 10 m. Por eso los 2,5 m superiores del océano almacenan tanto calor por grado como toda la columna de aire que tienen encima, y la capa de mezcla (50-100 m) unas 20 a 40 veces más.'),
        zC, H.h('div', { class: 'readouts' }, roC.r, roC.e),
        H.html(`<p class="small">Por eso el mar se calienta y se enfría despacio (ver el <a href="${H.T2}#tierramar">contraste tierra-mar del Tema 2</a>) y por eso el océano ha absorbido más del 90 % del calor que el efecto invernadero añadido ha acumulado en el sistema climático desde 1970 (IPCC, 2021).</p>`)),
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Calores latentes'),
        H.html(`<div><p>Evaporar un kilo de agua del mar requiere unos 2.450 kJ, casi seis veces lo que hace falta para calentarla de 0 a 100 °C. La evaporación es la principal pérdida de calor del océano en latitudes bajas, y ese calor se libera en la atmósfera cuando el vapor se condensa, a veces a miles de kilómetros (es el combustible de los ciclones tropicales).</p>
        <p>Congelar un kilo de agua libera 334 kJ. Mientras el mar se congela o el hielo se funde, la temperatura del agua queda fijada en el punto de congelación: el hielo marino amortigua las variaciones térmicas de las regiones polares.</p>
        <p>La evaporación no exige que el aire esté más frío que el agua: depende de la diferencia entre la tensión de vapor junto a la superficie del mar (saturada a la temperatura del agua) y la del aire, y de la velocidad del viento. Por eso se evapora mucha agua en los alisios, con aire seco y viento constante.</p></div>`))));
    updC();

    el.append(H.fix('Propiedades del agua del mar', [
      'El agua del mar no tiene su máximo de densidad a −2 °C para «empezar a dilatarse» después: con una salinidad mayor de 24,7 (la de casi todo el océano) no tiene máximo antes de congelarse, y se hace más densa al enfriarse hasta que se congela a unos −1,9 °C. Solo el agua dulce y la salobre (como la del Báltico) tienen un máximo por encima del punto de congelación.',
      'El calor latente de fusión mantiene la temperatura de las regiones polares cerca del punto de congelación (o de fusión), no del «punto de licuefacción», que es el paso de gas a líquido.',
      'La evaporación no depende de que el aire esté 0,3 °C más frío que el agua, sino del contraste entre la humedad del aire y la del aire saturado junto a la superficie del mar, y del viento.',
      'En la fig. 4.4 la densidad está en g/cm³ (1,025-1,028), no en kg/cm³. La densidad media del agua superficial es de unos 1.025 kg/m³; en el fondo, por la compresión, supera los 1.050 kg/m³.',
      'Que la densidad dependa más de la temperatura que de la salinidad solo vale en aguas templadas y cálidas. En aguas frías, polares y profundas, la salinidad es la que decide (fíjate en lo verticales que son las isopicnas a la izquierda del diagrama).',
    ]));
    el.append(H.selfCheck([
      { q: 'Un agua de salinidad 35 que se enfría desde 4 °C…', opts: ['se dilata a partir de 4 °C, como el agua dulce', 'se hace cada vez más densa hasta congelarse hacia −1,9 °C', 'se congela a 0 °C', 'tiene su máxima densidad a −2 °C y luego se dilata'], a: 1, ex: ' Con salinidades mayores de 24,7 la temperatura de máxima densidad queda por debajo del punto de congelación.' },
      { q: 'Dos aguas de igual densidad, una fría y poco salada y otra cálida y salada, se mezclan. La mezcla…', opts: ['tiene la misma densidad', 'es menos densa', 'es algo más densa y tiende a hundirse', 'se congela'], a: 2, ex: ' Las isopicnas son curvas: la mezcla de dos aguas de igual densidad queda por debajo de esa isopicna en el diagrama T-S (efecto «cabbeling»).' },
      { q: 'Al formarse el hielo marino, el agua que queda debajo…', opts: ['se vuelve más dulce', 'se vuelve más salada y más densa', 'se calienta', 'no cambia'], a: 1, ex: ' El hielo expulsa la mayor parte de la sal en forma de salmuera; así se forma agua de fondo en torno a la Antártida.' },
      { q: '¿Qué espesor del océano almacena tanto calor por grado como toda la atmósfera?', opts: ['Unos 2,5 m', 'Unos 100 m', 'Unos 1.000 m', 'Todo el océano'], a: 0, ex: ' La columna de aire equivale en masa a unos 10 m de agua, y el agua tiene un calor específico cuatro veces mayor.' },
      { q: 'En aguas polares, la densidad depende sobre todo de…', opts: ['la temperatura', 'la salinidad', 'la presión atmosférica', 'la turbidez'], a: 1, ex: ' Cerca del punto de congelación la dilatación térmica del agua es muy pequeña, así que mandan las diferencias de salinidad.' },
    ]));
  },
});
