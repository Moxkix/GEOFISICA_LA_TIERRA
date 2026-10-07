/* ===================== MOVIMIENTOS · LAS OLAS ===================== */
H.tab({
  id: 'olas', nav: 'Olas', title: 'Las olas',
  init(el) {
    el.append(H.intro('Movimientos debidos a los vientos · apartado 2.4.1', 'Las olas: energía que viaja, agua que apenas se desplaza',
      'El viento transfiere energía a la superficie del mar. La ola es una onda: lo que avanza es su forma y su energía, mientras cada partícula de agua describe una órbita casi cerrada. Su tamaño depende de la velocidad del viento, del tiempo que sopla y de la extensión de mar sobre la que actúa (el fetch); al llegar a aguas poco profundas, la ola se frena, crece y rompe.',
      'Manual: 2.4.1<br>Fig. 4.7'));
    const g = T4.g, TAU = 2 * Math.PI;

    /* ================= A · órbitas ================= */
    const sA = { T: 8, H: 1.5, d: 400, run: true, t: 0 };
    const cvA = H.h('canvas');
    const roA = { L: H.ro('Longitud de onda'), c: H.ro('Velocidad de la ola'), base: H.ro('Base de la ola (L/2)'), reg: H.ro('Régimen', 'hl'), st: H.ro('Peralte H/L', 'bl') };
    let W = null;
    const csA = H.autoCanvas(cvA, (w) => Math.min(w * 0.5, 380), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const L = W.L, k = W.k, d = sA.d, deep = W.kd > Math.PI;
      const viewW = 2 * L, zMax = Math.min(d, 0.62 * L);
      const ex = Math.max(1, Math.min(30, 0.035 * L / (sA.H / 2))); // exageración de la amplitud para que se vean las órbitas
      const Hd = sA.H * ex, sc = Math.min(w / viewW, (h - 46) / (zMax + Hd * 0.6));
      const x0 = 0, y0 = 30 + Hd * 0.5 * sc, X = (x) => x0 + x * sc, Y = (z) => y0 - z * sc; // z hacia arriba
      const ph = TAU * sA.t / sA.T;
      const amp = (z) => (deep ? Math.exp(k * z) : Math.cosh(k * (z + d)) / Math.sinh(k * d));
      const ampV = (z) => (deep ? Math.exp(k * z) : Math.sinh(k * (z + d)) / Math.sinh(k * d));
      // agua
      // superficie: trocoide que forman las partículas de la superficie
      const surf = []; for (let px = -40; px <= w + 40; px += 2) { const x0s = px / sc, th = k * x0s - ph; surf.push([X(x0s - Hd / 2 * Math.sin(th)), Y(Hd / 2 * Math.cos(th))]); }
      ctx.fillStyle = 'rgba(80,150,200,.22)'; ctx.beginPath(); ctx.moveTo(0, h); surf.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1f6f8b'; ctx.lineWidth = 2; ctx.beginPath(); surf.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.lineWidth = 1;
      // fondo
      if (d <= zMax + 1e-6) { ctx.fillStyle = '#d9c9a3'; ctx.fillRect(0, Y(-d), w, h - Y(-d)); ctx.strokeStyle = '#8a7650'; ctx.beginPath(); ctx.moveTo(0, Y(-d)); ctx.lineTo(w, Y(-d)); ctx.stroke(); }
      // base de la ola
      if (L / 2 < zMax && L / 2 < d) { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#b4531d'; ctx.beginPath(); ctx.moveTo(0, Y(-L / 2)); ctx.lineTo(w, Y(-L / 2)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#b4531d'; ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('base de la ola (L/2): el movimiento ya es casi nulo', w - 6, Y(-L / 2) - 2); }
      // órbitas y partículas
      const zs = []; const nz = 6; for (let i = 0; i < nz; i++) { const z = -(i / (nz - 1)) * Math.min(d * 0.92, zMax * 0.95); zs.push(z); }
      const xs = [0.25, 0.75, 1.25, 1.75].map((f) => f * L);
      for (const z of zs) {
        const a = Hd / 2 * amp(z), b = Hd / 2 * ampV(z);
        for (const xc of xs) {
          if (X(xc) > w) continue;
          ctx.strokeStyle = 'rgba(28,40,54,.25)'; ctx.beginPath(); ctx.ellipse(X(xc), Y(z), Math.max(0.5, a * sc), Math.max(0.5, b * sc), 0, 0, 7); ctx.stroke();
          const th = k * xc - ph, px = xc - a * Math.sin(th), pz = z + b * Math.cos(th);
          ctx.fillStyle = z === 0 ? '#b4531d' : '#1c2836'; ctx.beginPath(); ctx.arc(X(px), Y(pz), z === 0 ? 4 : 3, 0, 7); ctx.fill();
        }
      }
      // botella (fig. 4.7)
      { const xc = 1.0 * L, th = k * xc - ph, a = Hd / 2, px = xc - a * Math.sin(th), pz = a * Math.cos(th);
        ctx.save(); ctx.translate(X(px), Y(pz)); ctx.rotate(Math.max(-0.6, Math.min(0.6, -Math.atan(k * a * Math.sin(th)) * 0.8)));
        ctx.fillStyle = '#3d8a52'; ctx.fillRect(-12, -6, 20, 12); ctx.fillRect(8, -3, 7, 6); ctx.fillStyle = '#efe6cf'; ctx.fillRect(-9, -3, 12, 6); ctx.restore(); }
      ctx.fillStyle = '#5a6878'; ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`Ventana de ${H.f(viewW)} m${ex > 1.05 ? ` · altura de la ola y órbitas exageradas ×${H.f(ex, ex < 10 ? 1 : 0)}` : ' · escala real'}`, 6, 6);
      ctx.textAlign = 'right'; ctx.fillText('la ola avanza →', w - 6, 6);
    });
    const updA = () => {
      W = T4.wave(sA.T, sA.d);
      const L = W.L, deep = sA.d >= L / 2, shallow = sA.d < L / 20;
      roA.L.v.innerHTML = H.f(L, L < 10 ? 1 : 0) + ' <small>m</small>';
      roA.c.v.innerHTML = H.f(W.c, 1) + ' <small>m/s</small> · ' + H.f(W.c * 3.6) + ' <small>km/h</small>';
      roA.base.v.innerHTML = H.f(L / 2) + ' <small>m</small>';
      roA.reg.v.innerHTML = deep ? 'Aguas profundas <small>(d > L/2)</small>' : shallow ? 'Aguas someras <small>(d < L/20)</small>' : 'Aguas intermedias';
      const stp = sA.H / L, brk = stp > 1 / 7 || sA.H > 0.78 * sA.d;
      roA.st.v.innerHTML = '1/' + H.f(1 / stp) + (brk ? ' <small>· ¡rompe!</small>' : '');
      csA.redraw();
    };
    const tA = H.slider('Periodo (T)', 2, 20, 0.5, sA.T, (v) => H.f(v, 1) + ' s', (v) => { sA.T = v; updA(); });
    const hA = H.slider('Altura (H)', 0.1, 10, 0.1, sA.H, (v) => H.f(v, 1) + ' m', (v) => { sA.H = v; updA(); });
    const dA = H.slider('Profundidad del fondo', 2, 400, 1, sA.d, (v) => H.f(v) + ' m', (v) => { sA.d = v; updA(); });
    const play = H.h('button', { class: 'btn ghost sm', type: 'button' }, '❚❚ Pausa');
    play.onclick = () => { sA.run = !sA.run; play.textContent = sA.run ? '❚❚ Pausa' : '▶ Seguir'; if (sA.run) loop(); };
    let last = null;
    const loop = (ts) => {
      if (!sA.run) { last = null; return; }
      if (cvA.isConnected && cvA.offsetParent !== null) { if (last != null) sA.t += Math.min(0.1, (ts - last) / 1000); csA.redraw(); }
      last = ts; requestAnimationFrame(loop);
    };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Cómo se mueve el agua al pasar una ola'),
      H.h('p', { class: 'sub' }, 'Cada partícula gira en una órbita mientras pasa la ola y vuelve casi al mismo sitio: la botella sube, avanza un poco, baja y retrocede. En aguas profundas las órbitas son círculos que se reducen rápidamente hacia abajo y desaparecen a la mitad de la longitud de onda. Cuando el fondo está más cerca, se aplastan en elipses y en el fondo el agua solo va y viene.'),
      H.h('div', { class: 'viz framed' }, cvA),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, tA, hA, dA, play), H.h('div', { class: 'readouts' }, roA.L, roA.c, roA.base, roA.reg, roA.st))));
    updA(); requestAnimationFrame(loop);

    /* ================= B · generador de oleaje ================= */
    const sB = { U: 20, F: 500, D: 24 };
    const cvB = H.h('canvas'); const chB = H.chart(cvB, 0.55);
    const roB = { hs: H.ro('Altura significativa (Hs)', 'hl'), tp: H.ro('Periodo de pico'), dg: H.ro('Escala Douglas', 'bl'), lim: H.ro('Lo que limita el crecimiento'), bf: H.ro('Viento (Beaufort)'), L: H.ro('Longitud de onda') };
    const updB = () => {
      const r = T4.spm(sB.U, sB.F, sB.D);
      roB.hs.v.innerHTML = H.f(r.Hs, 1) + ' <small>m</small>';
      roB.tp.v.innerHTML = H.f(r.Tp, 1) + ' <small>s</small>';
      const dg = T4.douglas(r.Hs); roB.dg.v.innerHTML = `${dg[0]} · ${dg[2]}`;
      roB.lim.v.innerHTML = r.lim === 'fetch' ? `el fetch <small>(bastan ${H.f(r.tmin, r.tmin < 10 ? 1 : 0)} h de viento)</small>` : r.lim === 'duración' ? `la duración <small>(fetch efectivo ${H.f(r.Feff)} km)</small>` : 'nada: mar totalmente desarrollada';
      const bf = T4.beaufort(sB.U); roB.bf.v.innerHTML = `${bf} · ${T4.BEAUFORT[bf]} <small>(${H.f(sB.U * 3.6)} km/h)</small>`;
      roB.L.v.innerHTML = H.f(T4.wave(r.Tp).L) + ' <small>m en aguas profundas</small>';
      const Fs = [], series = [];
      for (const [U, col] of [[10, '#9db7c6'], [20, '#5b8fae'], [30, '#1f4f6b']]) { const pts = []; for (let lf = 1; lf <= 3.5; lf += 0.02) { const F = 10 ** lf; pts.push([lf, T4.spm(U, F, sB.D).Hs]); } series.push({ pts, color: col, width: U === Math.round(sB.U / 10) * 10 ? 2 : 1.2, dash: [4, 3] }); }
      const pts = []; for (let lf = 1; lf <= 3.5; lf += 0.02) pts.push([lf, T4.spm(sB.U, 10 ** lf, sB.D).Hs]);
      series.push({ pts, color: '#b4531d', width: 2.6 });
      void Fs;
      chB.draw({ xMin: 1, xMax: 3.5, yMin: 0, yMax: 20, xLabel: `Fetch (km), con ${H.f(sB.D)} h de viento`, yLabel: 'Hs (m)',
        xTicks: [[1, '10'], [1.5, '30'], [2, '100'], [2.5, '300'], [3, '1.000'], [3.5, '3.000']].map(([v, l]) => ({ v, label: l })), yTicks: [0, 4, 8, 12, 16, 20].map((v) => ({ v })),
        series, markers: [{ x: Math.log10(sB.F), y: r.Hs, label: `${H.f(r.Hs, 1)} m` }],
        after: (ctx, X, Y) => { ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; [[10, '10 m/s'], [20, '20 m/s'], [30, '30 m/s']].forEach(([U, t]) => { const y = T4.spm(U, 3000, sB.D).Hs; if (y < 19.5) ctx.fillText(t, X(3.5) - 3, Y(y) - 2); }); } });
    };
    const uB = H.slider('Velocidad del viento a 10 m', 3, 35, 0.5, sB.U, (v) => H.f(v, 1) + ' m/s', (v) => { sB.U = v; updB(); });
    const fB = H.slider('Fetch (mar sobre el que sopla)', 1, 3.5, 0.01, Math.log10(sB.F), (v) => H.f(10 ** v) + ' km', (v) => { sB.F = 10 ** v; updB(); });
    const dB = H.slider('Duración', 1, 72, 1, sB.D, (v) => H.f(v) + ' h', (v) => { sB.D = v; updB(); });
    const preB = H.h('div', { class: 'chipbar' });
    [['Brisa en una bahía', 6, 10, 6], ['Tramontana en el golfo de León', 18, 150, 12], ['Levante en el Estrecho', 15, 400, 24], ['Alisios', 8, 2000, 72], ['Temporal del noroeste en Galicia', 22, 1000, 36], ['Gran borrasca atlántica', 28, 1500, 48]].forEach(([n, U, F, D]) => {
      const b = H.h('button', { class: 'chip', type: 'button' }, n); b.onclick = () => { sB.U = U; sB.F = F; sB.D = D; uB.set(U); fB.set(Math.log10(F)); dB.set(D); updB(); }; preB.append(b);
    });
    const dtab = H.html(`<table class="t small"><thead><tr><th>Grado</th><th>Estado de la mar (Douglas)</th><th>Hs (m)</th></tr></thead><tbody>${T4.DOUGLAS.map((r, i) => `<tr><td>${r[0]}</td><td>${r[2]}</td><td>${i === 0 ? '0' : i === 9 ? 'más de 14' : `${H.f(T4.DOUGLAS[i - 1][1], T4.DOUGLAS[i - 1][1] % 1 ? 2 : 0).replace(',00', '').replace(/,50$/, ',5').replace(/,10$/, ',1')} – ${H.f(r[1], r[1] % 1 ? 2 : 0).replace(/,50$/, ',5').replace(/,10$/, ',1')}`}</td></tr>`).join('')}</tbody></table>`);
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Generador de oleaje: viento, fetch y duración'),
      H.h('p', { class: 'sub' }, 'Para un viento dado, las olas crecen mientras haya distancia (fetch) y tiempo (duración) suficientes; si el viento sopla lo bastante sobre una gran extensión, el mar llega a estar «totalmente desarrollado» y ya no crece más. Se usan las fórmulas empíricas del proyecto JONSWAP (Hasselmann y otros, 1973), para el oleaje limitado por el fetch o la duración, y de Pierson y Moskowitz (1964), para el mar totalmente desarrollado.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, uB, fB, dB, preB, H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, roB.hs, roB.tp, roB.dg, roB.lim, roB.bf, roB.L)),
        H.h('div', {}, H.h('div', { class: 'viz' }, cvB), H.h('details', { class: 'open-q' }, H.h('summary', {}, 'Escala Douglas del estado de la mar'), H.h('div', { class: 'ans' }, dtab))))));
    updB();

    /* ================= C · mar de viento y mar de fondo ================= */
    const sC = { X: 3000 };
    const cvC = H.h('canvas'); const chC = H.chart(cvC, 0.42);
    const updC = () => {
      const pts = []; for (let T = 6; T <= 22; T += 0.25) { const cg = g * T / (4 * Math.PI); pts.push([T, sC.X * 1000 / cg / 3600]); }
      const mx = pts[0][1];
      const st = mx > 300 ? 48 : mx > 120 ? 24 : mx > 48 ? 12 : 6;
      chC.draw({ xMin: 6, xMax: 22, yMin: 0, yMax: Math.ceil(mx / st) * st, xLabel: 'Periodo de las olas (s)', yLabel: 'Horas hasta llegar',
        xTicks: [6, 8, 10, 12, 14, 16, 18, 20, 22].map((v) => ({ v, label: v + ' s' })), yTicks: Array.from({ length: Math.ceil(mx / st) + 1 }, (_, i) => ({ v: i * st, label: i * st >= 48 ? H.f(i * st / 24, 1).replace(',0', '') + ' d' : i * st + ' h' })),
        series: [{ pts, color: '#1f6f8b', width: 2.4 }],
        markers: [16, 10].map((T) => { const t = sC.X * 1000 / (g * T / (4 * Math.PI)) / 3600; return { x: T, y: t, label: `${T} s: ${t > 48 ? H.f(t / 24, 1) + ' días' : H.f(t) + ' h'}` }; }) });
    };
    const xC = H.slider('Distancia a la borrasca que generó el oleaje', 200, 10000, 100, sC.X, (v) => H.f(v) + ' km', (v) => { sC.X = v; updC(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Mar de viento y mar de fondo'),
      H.h('p', { class: 'sub' }, 'Bajo el viento que las genera, las olas son irregulares, de crestas agudas y periodos variados: es la mar de viento. Al salir de la zona de generación se ordenan por periodos, porque en aguas profundas las ondas largas viajan más deprisa (su energía avanza a gT/4π m/s): llegan primero las de periodo más largo, como trenes regulares de crestas redondeadas. Es la mar de fondo (en inglés, swell), que cruza océanos enteros y puede romper con fuerza en una costa con viento en calma.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, cvC), H.h('div', {}, xC, H.html('<p class="small">Una borrasca al sur de Terranova está a unos 3.000 km de Galicia: su mar de fondo de 16 s llega en menos de tres días. Las borrascas de los «cuarenta rugientes», en el Atlántico Sur, envían mar de fondo hasta las Canarias y el golfo de Guinea, a más de 8.000 km.</p>')))));
    updC();

    /* ================= D · rompientes y tsunamis ================= */
    const sD = { T: 10, H0: 2, m: 0.02 };
    const cvD = H.h('canvas'); const chD = H.chart(cvD, 0.42);
    const roD = { db: H.ro('Profundidad de rotura', 'hl'), hb: H.ro('Altura al romper'), x: H.ro('Distancia a la orilla'), ty: H.ro('Tipo de rompiente', 'bl') };
    const shoal = () => {
      const w0 = T4.wave(sD.T), cg0 = w0.cg, out = [];
      for (let ld = Math.log10(Math.max(w0.L / 2, 5)); ld >= -0.5; ld -= 0.005) { const d = 10 ** ld, w = T4.wave(sD.T, d), Hh = sD.H0 * Math.sqrt(cg0 / w.cg); out.push({ d, H: Hh, L: w.L, brk: Hh >= 0.78 * d }); }
      return { out, L0: w0.L };
    };
    const updD = () => {
      const { out, L0 } = shoal(), ib = out.findIndex((p) => p.brk), p = out[Math.max(0, ib)];
      const xMax = Math.log10(Math.max(L0 / 2, 5)), xMin = -0.5;
      const ser = out.slice(0, ib >= 0 ? ib + 1 : out.length).map((q) => [Math.log10(q.d), q.H]);
      const lim = []; for (let x = xMin; x <= xMax + 1e-9; x += 0.02) lim.push([x, 0.78 * 10 ** x]);
      const yM = Math.ceil(Math.max(p.H * 1.6, sD.H0 * 1.8));
      const ticks = [0.3, 1, 3, 10, 30, 100, 300].filter((v) => Math.log10(v) >= xMin - 1e-9 && Math.log10(v) <= xMax + 1e-9);
      chD.draw({ xMin: xMax, xMax: xMin, yMin: 0, yMax: yM, xLabel: 'Profundidad (m, escala logarítmica) · la orilla está a la derecha', yLabel: 'Altura de la ola (m)',
        xTicks: ticks.map((v) => ({ v: Math.log10(v), label: H.f(v, v < 1 ? 1 : 0) })), yTicks: Array.from({ length: yM + 1 }, (_, i) => ({ v: i })).filter((t) => yM <= 10 || t.v % 2 === 0),
        series: [{ pts: lim, color: '#b4531d', width: 1.4, dash: [5, 4] }, { pts: ser, color: '#1f6f8b', width: 2.6 }],
        vlines: [{ x: Math.log10(L0 / 2), color: '#5a6878', label: 'L/2: empieza a notar el fondo' }],
        markers: ib >= 0 ? [{ x: Math.log10(p.d), y: p.H, color: '#b4531d', label: `rompe: ${H.f(p.H, 1)} m a ${H.f(p.d, 1)} m de fondo`, align: 'right' }] : [],
        after: (ctx, X, Y) => { ctx.font = '11px system-ui'; ctx.fillStyle = '#b4531d'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; const x = Math.log10(Math.min(10 ** xMax, yM / 0.78 * 0.85)); ctx.fillText('límite de rotura: H = 0,78·d', X(x) + 4, Y(0.78 * 10 ** x) - 4); } });
      roD.db.v.innerHTML = H.f(p.d, 1) + ' <small>m</small>';
      roD.hb.v.innerHTML = H.f(p.H, 1) + ' <small>m (×' + H.f(p.H / sD.H0, 2) + ')</small>';
      roD.x.v.innerHTML = H.f(p.d / sD.m) + ' <small>m con esa pendiente</small>';
      const xi = sD.m / Math.sqrt(sD.H0 / L0);
      roD.ty.v.innerHTML = xi < 0.5 ? 'En descrestamiento <small>(spilling)</small>' : xi < 3.3 ? 'En voluta <small>(plunging)</small>' : 'Por oleada <small>(surging)</small>';
    };
    const tD = H.slider('Periodo en alta mar', 4, 18, 0.5, sD.T, (v) => H.f(v, 1) + ' s', (v) => { sD.T = v; updD(); });
    const hD = H.slider('Altura en alta mar', 0.3, 8, 0.1, sD.H0, (v) => H.f(v, 1) + ' m', (v) => { sD.H0 = v; updD(); });
    const mD = H.slider('Pendiente del fondo', 0.005, 0.1, 0.005, sD.m, (v) => H.f(v * 100, 1) + ' %', (v) => { sD.m = v; updD(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Al llegar a la costa: la ola crece, se frena y rompe'),
      H.h('p', { class: 'sub' }, 'Cuando la profundidad baja de la mitad de la longitud de onda, la ola empieza a rozar el fondo: se frena, se acorta y, para conservar su energía, gana altura. Rompe cuando su altura llega a ser casi igual a la profundidad (H ≈ 0,78 d, o d ≈ 1,3 H). En playas tendidas rompe lejos y poco a poco; en fondos empinados, de golpe y cerca de la orilla.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, cvD), H.h('div', {}, tD, hD, mD, H.h('div', { class: 'readouts' }, roD.db, roD.hb, roD.x, roD.ty)))));
    updD();

    // tsunamis
    const sT = { d: 4000 };
    const roT = { c: H.ro('Velocidad del tsunami', 'hl'), L: H.ro('Longitud de onda (periodo de 20 min)'), t: H.ro('Tiempo para cruzar 10.000 km'), a: H.ro('Altura relativa al llegar a 10 m de fondo', 'bl') };
    const updT = () => {
      const c = Math.sqrt(g * sT.d);
      roT.c.v.innerHTML = H.f(c * 3.6) + ' <small>km/h</small>';
      roT.L.v.innerHTML = H.f(c * 1200 / 1000) + ' <small>km</small>';
      roT.t.v.innerHTML = H.f(1e7 / c / 3600, 1) + ' <small>h</small>';
      roT.a.v.innerHTML = '×' + H.f(Math.pow(sT.d / 10, 0.25), 1) + ' <small>(ley de Green)</small>';
    };
    const dT = H.slider('Profundidad del océano', 50, 7000, 50, sT.d, (v) => H.f(v) + ' m', (v) => { sT.d = v; updT(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Tsunamis: olas de todo el espesor del océano'),
      H.h('div', { class: 'grid2' }, H.html(`<div><p>Un terremoto submarino, un deslizamiento o una erupción levantan o hunden de golpe toda la columna de agua. La onda resultante tiene una longitud de cientos de kilómetros, mucho mayor que la profundidad del océano, así que se comporta como una ola de aguas someras: su velocidad solo depende de la profundidad (c = √(g·d)) y mueve el agua hasta el fondo.</p>
        <p>En alta mar apenas mide unos decímetros y pasa inadvertida; al llegar a la plataforma se frena, se acorta y crece. El tsunami del océano Índico de 2004 y el de Japón de 2011 superaron los 30 m de altura de inundación (run-up) en algunas costas.</p>
        <p>Son más frecuentes alrededor del Pacífico (el «cinturón de fuego»: Japón, Indonesia, Chile, Alaska) y en el Índico oriental. En España, el terremoto de Lisboa de 1755 lanzó un tsunami que arrasó la costa de Huelva y Cádiz, y el arco de Alborán y el norte de Argelia pueden generarlos en el Mediterráneo occidental.</p></div>`),
        H.h('div', {}, dT, H.h('div', { class: 'readouts' }, roT.c, roT.L, roT.t, roT.a)))));
    updT();

    /* ================= E · caso real: la borrasca Ciarán ================= */
    if (CIARAN) {
      const C = CIARAN, nt = C.times.length, meta = { nx: C.nx, ny: C.ny, lon0: C.lon0, lat0: C.lat0, res: C.res };
      const hasHs = !!C.hs, hsMeta = C.hsG || meta;
      const sE = { k: 9, layer: hasHs ? 'hs' : 'wind', run: false, pt: [43.6, -3.0] };
      const G = { p: [], u: [], v: [], hs: [] };
      for (let k = 0; k < nt; k++) { G.p.push(T3.refine(T4.grid(C.p[k], meta), 2)); G.u.push(T4.grid(C.u[k], meta)); G.v.push(T4.grid(C.v[k], meta)); if (hasHs) G.hs.push(T4.grid(C.hs[k], hsMeta)); }
      const wsCol = T4.ramp([[0, [240, 244, 246]], [8, [190, 220, 230]], [14, [120, 190, 200]], [18, [250, 220, 120]], [22, [240, 150, 70]], [26, [210, 70, 50]], [32, [130, 20, 60]]]);
      const hsCol = T4.ramp([[0, [236, 242, 246]], [2, [180, 214, 230]], [4, [110, 180, 210]], [6, [70, 130, 190]], [8, [250, 210, 110]], [10, [235, 130, 60]], [12, [200, 50, 50]], [15, [110, 20, 70]]]);
      const BB = [C.lon0, C.lon0 + C.nx * C.res, C.lat0 - C.ny * C.res, C.lat0];
      const cvE = H.h('canvas');
      const mapE = T4.map(cvE, { bbox: BB, regional: false, grid: 10, key: () => sE.k + sE.layer, aspect: (w) => Math.min(w * T3.aspect(BB, true), 560),
        color: (lat, lon) => { if (sE.layer === 'hs') { const v = G.hs[sE.k].at(lat, lon); return v === v ? hsCol(v) : null; } const u = G.u[sE.k].at(lat, lon), v = G.v[sE.k].at(lat, lon); return u === u ? wsCol(Math.hypot(u, v)) : null; },
        land: (lat, lon) => { if (sE.layer === 'hs') return T4.LAND; const u = G.u[sE.k].at(lat, lon), v = G.v[sE.k].at(lat, lon); return u === u ? H.mix(wsCol(Math.hypot(u, v)), T4.LAND, 0.55) : T4.LAND; },
        after: (ctx, P) => {
          T3.contour(ctx, G.p[sE.k], Array.from({ length: 23 }, (_, i) => 948 + 4 * i), P, { color: 'rgba(28,40,54,.8)', width: 1.1, style: (L) => (L % 20 === 0 ? { width: 1.8 } : {}) });
          T3.arrows(ctx, G.u[sE.k], G.v[sE.k], P, { step: 2.5, scale: 0.9, maxLen: 24, color: 'rgba(28,40,54,.7)' });
          // mínimo de presión
          const gp = G.p[sE.k]; let mn = 1e9, mi = 0; for (let i = 0; i < gp.data.length; i++) if (gp.data[i] < mn) { mn = gp.data[i]; mi = i; }
          const lon = gp.lonAt(mi % gp.nx), lat = gp.latAt(Math.floor(mi / gp.nx)), x = P.X(lon), y = P.Y(lat);
          ctx.font = 'bold 15px system-ui'; ctx.fillStyle = '#b02020'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('B', x, y);
          ctx.font = 'bold 10.5px system-ui'; ctx.fillText(H.f(mn, 0), x, y + 13);
          const [pl, pn] = sE.pt, px = P.X(pn), py = P.Y(pl); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
          const t = new Date(C.times[sE.k] + ':00:00Z');
          ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; const lbl = `${t.getUTCDate()} nov 2023, ${String(t.getUTCHours()).padStart(2, '0')} UTC`;
          const tw = ctx.measureText(lbl).width; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(6, 6, tw + 10, 18); ctx.fillStyle = '#1c2836'; ctx.fillText(lbl, 11, 9);
        } });
      cvE.addEventListener('click', (e) => { const [x, y] = mapE.pos(e); sE.pt = mapE.P.inv(x, y); updE(); });
      T4.hover(cvE, mapE, (lat, lon) => { const u = G.u[sE.k].at(lat, lon), v = G.v[sE.k].at(lat, lon), p = G.p[sE.k].at(lat, lon); if (!(u === u)) return null; return `${H.f(p, 0)} hPa · ${H.f(Math.hypot(u, v) * 3.6)} km/h${hasHs ? ' · Hs ' + T4.fN(G.hs[sE.k].at(lat, lon), 1) + ' m' : ''}`; });
      const roE = { p: H.ro('Presión'), w: H.ro('Viento medio a 10 m', 'hl'), b: H.ro('Beaufort'), h: H.ro('Altura significativa', 'bl') };
      const cvE2 = H.h('canvas'); const chE = H.chart(cvE2, 0.45);
      const updE = () => {
        const [lat, lon] = sE.pt, k = sE.k;
        const p = G.p[k].at(lat, lon), u = G.u[k].at(lat, lon), v = G.v[k].at(lat, lon), ws = Math.hypot(u, v);
        roE.p.v.innerHTML = T4.fN(p, 0) + ' <small>hPa</small>';
        roE.w.v.innerHTML = H.f(ws * 3.6) + ' <small>km/h del ' + T3.dirName(T3.windFrom(u, v)) + '</small>';
        const b = T4.beaufort(ws); roE.b.v.innerHTML = `${b} · ${T4.BEAUFORT[b]}`;
        roE.h.v.innerHTML = hasHs ? T4.fN(G.hs[k].at(lat, lon), 1) + ' <small>m</small>' : '<small>pendiente de los datos de oleaje</small>';
        const sp = [], sw = [], shs = [];
        for (let i = 0; i < nt; i++) { sp.push([i * 3, G.p[i].at(lat, lon)]); const uu = G.u[i].at(lat, lon), vv = G.v[i].at(lat, lon); sw.push([i * 3, Math.hypot(uu, vv) * 3.6]); if (hasHs) shs.push([i * 3, G.hs[i].at(lat, lon) * 10]); }
        const pm = Math.min(...sp.map((q) => q[1])), pM = Math.max(...sp.map((q) => q[1]));
        chE.draw({ xMin: 0, xMax: (nt - 1) * 3, yMin: 0, yMax: 140, xLabel: `${T4.ll(lat, lon)} · horas desde el 1 nov 00 UTC`, yLabel: 'km/h' + (hasHs ? ' · Hs (dm)' : ''),
          xTicks: [0, 12, 24, 36, 48].map((v) => ({ v, label: ['1 nov 00', '12', '2 nov 00', '12', '3 nov 00'][v / 12] })), yTicks: [0, 20, 40, 60, 80, 100, 120, 140].map((v) => ({ v })),
          series: [{ pts: sw, color: '#b4531d', width: 2.2 }].concat(hasHs ? [{ pts: shs, color: '#1f6f8b', width: 2.2 }] : []), vlines: [{ x: k * 3, color: '#1c2836', dash: [3, 3] }],
          after: (ctx, X, Y, w) => { ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = '#b4531d'; ctx.fillText('viento medio (km/h)', w - 18, 18); if (hasHs) { ctx.fillStyle = '#1f6f8b'; ctx.fillText('altura de ola (dm)', w - 18, 32); } ctx.fillStyle = '#5a6878'; ctx.fillText(`presión: ${H.f(pm, 0)}–${H.f(pM, 0)} hPa`, w - 18, hasHs ? 46 : 32); } });
        mapE.invalidate();
      };
      const tE = H.slider('Fecha y hora', 0, nt - 1, 1, sE.k, (v) => { const t = new Date(C.times[v] + ':00:00Z'); return `${t.getUTCDate()} nov ${String(t.getUTCHours()).padStart(2, '0')} UTC`; }, (v) => { sE.k = v; updE(); });
      const playE = H.h('button', { class: 'btn ghost sm', type: 'button' }, '▶ Animar');
      let timer = null; playE.onclick = () => { if (timer) { clearInterval(timer); timer = null; playE.textContent = '▶ Animar'; return; } playE.textContent = '❚❚ Parar'; timer = setInterval(() => { sE.k = (sE.k + 1) % nt; tE.set(sE.k); updE(); if (!cvE.isConnected || cvE.offsetParent === null) { clearInterval(timer); timer = null; playE.textContent = '▶ Animar'; } }, 700); };
      const segE = hasHs ? H.seg([['hs', 'Oleaje (Hs)'], ['wind', 'Viento']], sE.layer, (v) => { sE.layer = v; updE(); }) : null;
      const leg = H.h('div', {});
      const updLeg = () => { leg.innerHTML = ''; leg.append(sE.layer === 'hs' ? T3.legend(hsCol, 0, 15, [0, 3, 6, 9, 12, 15], (v) => v + (v === 15 ? ' m' : '')) : T3.legend(wsCol, 0, 32, [0, 8, 16, 24, 32], (v) => H.f(v * 3.6) + (v === 32 ? ' km/h' : ''))); };
      if (segE) segE.addEventListener('click', updLeg);
      updLeg();
      el.append(H.h('div', { class: 'card', id: 'ciaran' }, H.h('h3', {}, 'Caso real: la borrasca Ciarán (1-3 de noviembre de 2023)'),
        H.h('p', { class: 'sub' }, `Una ciclogénesis explosiva cruzó el Atlántico y tocó tierra en Bretaña con unos 954 hPa en su centro. En la punta del Raz se midió una racha de 207 km/h; en el País Vasco, 160 km/h en Cerroja y 157 km/h en Matxitxako, y la boya de Donostia registró olas de más de 8 m de altura significativa. Causó 21 muertos en Europa. Mapa: presión a nivel del mar (isobaras cada 4 hPa) y viento medio a 10 m del reanálisis ERA5${hasHs ? ', y altura significativa del oleaje del modelo WAVEWATCH III (NOAA)' : ''}. Pulsa en el mapa para ver la evolución en un punto.`),
        H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvE), leg),
          H.h('div', {}, segE, tE, playE, H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, roE.p, roE.w, roE.b, roE.h), H.h('div', { class: 'viz', style: { marginTop: '10px' } }, cvE2))),
        H.h('p', { class: 'small' }, `Fuentes: ERA5 (Copernicus/ECMWF) vía Google Earth Engine, rejilla de 0,5°; datos de rachas y oleaje de Météo-France, Euskalmet (informe climatológico de noviembre de 2023) y Puertos del Estado. Las rachas son mucho mayores que el viento medio que da el reanálisis.`)));
      updE();
    }

    el.append(H.fix('Olas', [
      'El manual llama «marejada o a veces mar gruesa» a las ondas regulares que se propagan lejos de la zona de generación. Su nombre es mar de fondo; marejada y mar gruesa son grados de la escala Douglas (olas de 0,5 a 1,25 m y de 2,5 a 4 m), aplicables a cualquier tipo de oleaje.',
      'Las olas no dejan de notarse a una profundidad fija de 200 m: el movimiento se extingue hacia la mitad de la longitud de onda (unos 40 m para olas de 7 s, 200 m solo para la mar de fondo más larga, de unos 16 s).',
      'Son dos umbrales distintos: la ola empieza a «sentir» el fondo cuando la profundidad es menor que media longitud de onda, y rompe cuando la profundidad es de unas 1,3 veces su altura.',
      'Los tsunamis amenazan sobre todo las costas orientales de Asia (Japón, Filipinas, Indonesia) y, en general, el borde del Pacífico, no sus costas occidentales.',
    ]));
    el.append(H.selfCheck([
      { q: 'Al pasar una ola en alta mar, una botella que flota…', opts: ['avanza con la ola hasta la costa', 'describe una órbita y vuelve casi al mismo sitio', 'se queda quieta', 'se hunde en el seno de la ola'], a: 1, ex: ' La ola transporta energía, no agua (salvo una pequeña deriva). Es lo que muestra la fig. 4.7.' },
      { q: 'Un viento de 20 m/s que sopla 6 horas sobre un fetch de 1.000 km genera olas…', opts: ['limitadas por el fetch', 'limitadas por la duración: aún no ha dado tiempo a que crezcan', 'totalmente desarrolladas', 'iguales que con 48 horas de viento'], a: 1, ex: ' Para recorrer un fetch tan largo la ola necesita más de un día de viento; con 6 horas el oleaje queda limitado por la duración.' },
      { q: '¿Por qué la mar de fondo de una borrasca lejana llega antes con periodos largos?', opts: ['Porque las olas largas viajan más rápido en aguas profundas', 'Porque el viento las empuja más', 'Porque las cortas se hunden', 'Porque se generan antes'], a: 0, ex: ' En aguas profundas la velocidad de grupo es gT/4π: una ola de 16 s viaja el doble de rápido que una de 8 s.' },
      { q: 'Una ola de 2 m de altura rompe aproximadamente cuando la profundidad es de…', opts: ['200 m', 'media longitud de onda', 'unos 2,5 m', '20 cm'], a: 2, ex: ' La rotura llega cuando H ≈ 0,78 d, es decir, d ≈ 1,3 H.' },
      { q: 'Un tsunami cruza un océano de 4.000 m de profundidad a unos…', opts: ['70 km/h', '200 km/h', '700 km/h', '7.000 km/h'], a: 2, ex: ' c = √(9,8 × 4.000) ≈ 198 m/s ≈ 710 km/h, la velocidad de un avión comercial.' },
    ]));
  },
});
