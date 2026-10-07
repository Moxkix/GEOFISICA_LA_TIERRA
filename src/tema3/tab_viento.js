/* ===================== P · EL VIENTO: GRADIENTE, CORIOLIS Y ROZAMIENTO ===================== */
H.tab({
  id: 'viento', nav: 'El viento', title: 'El viento: gradiente, Coriolis y rozamiento',
  init(el) {
    el.append(H.intro('La presión · apartado 2.1', 'Por qué el viento no va directo de las altas a las bajas presiones',
      'La diferencia de presión empuja el aire de las altas hacia las bajas presiones, perpendicularmente a las isobaras. Pero en cuanto el aire se mueve, la rotación terrestre lo desvía (a la derecha en el hemisferio norte), hasta que en la atmósfera libre acaba soplando casi paralelo a las isobaras. Cerca del suelo, el rozamiento lo frena y el viento cruza las isobaras hacia las bajas presiones.',
      'Manual: 2.1<br>Figs. 3.3 a 3.7; ejercicios 3 y 5'));

    /* ================= A · laboratorio de fuerzas ================= */
    const OM = 7.2921e-5, RHO = 1.2;
    const s = { G: 1.5, lat: 43, hemi: 1, fric: 'none', run: false, t: 0, x: 0, y: 0, u: 0, v: 0, path: [] };
    const K = { none: 0, sea: 2.8e-5, land: 7.5e-5 };
    const DOM = { w: 3200e3, h: 1800e3 }; // metros representados en el lienzo
    const f = () => 2 * OM * Math.sin(s.lat * H.D2R) * s.hemi;
    const apg = () => s.G * 100 / 100e3 / RHO; // m/s²: G hPa por 100 km → Pa/m / densidad
    const reset = () => { s.t = 0; s.x = 250e3; s.y = DOM.h * (s.lat < 3 ? 0.5 : s.hemi > 0 ? 0.9 : 0.1); s.u = 0; s.v = 0; s.path = [[s.x, s.y, 0]]; };
    const step = (dt) => {
      const k = K[s.fric], ff = f(), a = apg();
      // Runge-Kutta 2 sobre (u, v)
      const acc = (u, v) => [a + ff * v - k * u, -ff * u - k * v];
      const [ax1, ay1] = acc(s.u, s.v), um = s.u + ax1 * dt / 2, vm = s.v + ay1 * dt / 2, [ax2, ay2] = acc(um, vm);
      s.x += um * dt; s.y += vm * dt; s.u += ax2 * dt; s.v += ay2 * dt; s.t += dt;
    };
    const cv = H.h('canvas');
    const cs = H.autoCanvas(cv, (w) => Math.min(w * 0.56, 430), (ctx, w, h) => {
      const kx = w / DOM.w, X = (x) => x * kx, Y = (y) => h - y * h / DOM.h;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      // fondo: de altas (izquierda) a bajas presiones (derecha)
      const gr = ctx.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(228,150,96,.18)'); gr.addColorStop(1, 'rgba(96,140,200,.18)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
      // isobaras cada 4 hPa
      const sp = 4 / s.G * 100e3; // m entre isobaras
      const p0 = 1024; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
      for (let i = 0; i * sp <= DOM.w; i++) { const x = X(i * sp); ctx.strokeStyle = 'rgba(28,40,54,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); if (sp * kx > 26 || i % 2 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 17, 4, 34, 14); ctx.fillStyle = '#1c2836'; ctx.fillText(H.f(p0 - 4 * i), x, 15); } }
      ctx.font = 'bold 22px system-ui'; ctx.fillStyle = '#b4531d'; ctx.textAlign = 'left'; ctx.fillText('A', 8, h - 12); ctx.fillStyle = '#1f6f8b'; ctx.textAlign = 'right'; ctx.fillText('B', w - 8, h - 12);
      // escala
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, h - 18); ctx.lineTo(40 + X(500e3), h - 18); ctx.stroke(); ctx.font = '10px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.fillText('500 km', 40 + X(250e3), h - 24);
      // trayectoria con marcas cada 6 h
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); s.path.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
      ctx.fillStyle = '#1c2836'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
      let pk = 0; for (const [x, y, t] of s.path) { const k6 = Math.floor(t / 21600); if (k6 > pk) { pk = k6; ctx.beginPath(); ctx.arc(X(x), Y(y), 3, 0, 7); ctx.fill(); ctx.fillText(H.f(k6 * 6) + ' h', X(x) + 5, Y(y) - 5); } }
      // fuerzas en la posición actual (escaladas)
      const k = K[s.fric], ff = f(), a = apg(), x0 = X(s.x), y0 = Y(s.y);
      const sc = 60 / Math.max(a, 1e-6);
      const vec = (ax, ay, col, lab) => { const L = Math.hypot(ax, ay) * sc; if (L < 3) return; const ex = x0 + ax * sc, ey = y0 - ay * sc; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke(); const an = Math.atan2(ey - y0, ex - x0); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 9 * Math.cos(an - 0.4), ey - 9 * Math.sin(an - 0.4)); ctx.lineTo(ex - 9 * Math.cos(an + 0.4), ey - 9 * Math.sin(an + 0.4)); ctx.fill(); ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(lab, ex + 4, ey - 4); ctx.fillText(lab, ex + 4, ey - 4); };
      vec(a, 0, '#b4531d', 'gradiente');
      vec(ff * s.v, -ff * s.u, '#1f6f8b', 'Coriolis');
      if (k) vec(-k * s.u, -k * s.v, '#6b6b6b', 'rozamiento');
      // velocidad
      const V = Math.hypot(s.u, s.v);
      if (V > 0.2) { const L = 14 + V * 3, ex = x0 + s.u / V * L, ey = y0 - s.v / V * L; ctx.strokeStyle = '#1c2836'; ctx.setLineDash([5, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#1c2836'; ctx.font = '11px system-ui'; ctx.fillText('viento', ex + 4, ey + 12); }
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x0, y0, 7, 0, 7); ctx.fill(); ctx.stroke();
    });
    const ro = { v: H.ro('Velocidad del viento', 'hl'), ang: H.ro('Ángulo con las isobaras'), vg: H.ro('Viento geostrófico'), f: H.ro('Parámetro de Coriolis'), bb: H.ro('Con el viento a la espalda…', 'bl'), t: H.ro('Tiempo transcurrido') };
    const upd = () => {
      const V = Math.hypot(s.u, s.v), ff = f();
      ro.v.v.innerHTML = `${H.f(V, 1)} <small>m/s · ${H.f(V * 3.6)} km/h</small>`;
      // ángulo con las isobaras (verticales): 0° = paralelo; 90° = directo hacia las bajas
      const ang = V > 0.3 ? Math.atan2(Math.abs(s.u), Math.abs(s.v)) * H.R2D : null;
      ro.ang.v.innerHTML = ang == null ? '—' : `${H.f(ang)}° <small>${ang < 5 ? 'paralelo' : ang > 80 ? 'casi perpendicular' : 'hacia las bajas'}</small>`;
      ro.vg.v.innerHTML = Math.abs(ff) < 1e-6 ? '<small>no existe en el ecuador</small>' : `${H.f(apg() / Math.abs(ff), 1)} <small>m/s</small>`;
      ro.f.v.innerHTML = `${H.f(ff * 1e4, 2).replace('-', '−')} <small>×10⁻⁴ s⁻¹</small>`;
      // observador mirando hacia donde va el viento: su izquierda es (−v, u); las bajas están hacia +x
      if (V > 0.5) ro.bb.v.innerHTML = `bajas a la <b>${-s.v > 0 ? 'izquierda' : 'derecha'}</b>`; else ro.bb.v.textContent = '—';
      ro.t.v.innerHTML = `${H.f(s.t / 3600, 0)} <small>h</small>`;
      cs.redraw();
    };
    let raf = null;
    const loop = () => {
      for (let i = 0; i < 20; i++) { step(90); if (i % 4 === 3) s.path.push([s.x, s.y, s.t]); }
      upd();
      if (s.x > DOM.w - 30e3 || s.x < 0 || s.y < 0 || s.y > DOM.h || s.t > 72 * 3600) { s.run = false; runB.textContent = '▶ Soltar el aire'; return; }
      raf = requestAnimationFrame(loop);
    };
    const runB = H.h('button', { class: 'btn acc sm', type: 'button' }, '▶ Soltar el aire');
    runB.onclick = () => { cancelAnimationFrame(raf); if (s.run) { s.run = false; runB.textContent = '▶ Soltar el aire'; return; } reset(); s.run = true; runB.textContent = '■ Parar'; loop(); };
    const restart = () => { cancelAnimationFrame(raf); s.run = false; runB.textContent = '▶ Soltar el aire'; reset(); upd(); };
    const gS = H.slider('Gradiente de presión', 0.5, 4, 0.1, s.G, (v) => H.f(v, 1) + ' hPa/100 km', (v) => { s.G = v; restart(); });
    const latS = H.slider('Latitud', 0, 90, 1, s.lat, (v) => v + '°', (v) => { s.lat = v; restart(); });
    const hemiSeg = H.seg([[1, 'Hemisferio norte'], [-1, 'Hemisferio sur']], s.hemi, (v) => { s.hemi = v; restart(); });
    const fricSeg = H.seg([['none', 'Atmósfera libre'], ['sea', 'Sobre el mar'], ['land', 'Sobre tierra']], s.fric, (v) => { s.fric = v; restart(); });
    const presets = H.h('div', { class: 'chipbar', style: { marginTop: '10px' } });
    [['Ecuador, sin rozamiento', 0, 'none'], ['Latitudes medias, atmósfera libre', 45, 'none'], ['Latitudes medias, sobre tierra', 45, 'land'], ['Polo, sobre el mar', 89, 'sea']].forEach(([l, la, fr]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { s.lat = la; s.fric = fr; latS.set(la); fricSeg.set(fr); restart(); runB.click(); }; presets.append(b); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Laboratorio: las fuerzas que mueven el aire'),
      H.h('p', { class: 'sub' }, 'Las isobaras son rectas, como en la fig. 3.4. Suelta una partícula de aire en reposo junto a las altas presiones y observa su trayectoria y las fuerzas que actúan sobre ella: el gradiente (naranja), Coriolis (azul) y, cerca del suelo, el rozamiento (gris).'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, gS, latS, hemiSeg, H.h('div', { style: { height: '8px' } }), fricSeg,
          H.h('div', { class: 'row', style: { justifyContent: 'flex-start', marginTop: '10px' } }, H.h('span', { style: { flex: 'none' } }, runB)), presets,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.v, ro.ang, ro.vg, ro.f, ro.bb, ro.t))),
      H.html(`<p class="small">Viento geostrófico: <span class="formula">V<sub>g</sub> = (1/ρ f) · Δp/Δn</span>, con <i>f</i> = 2Ω sen φ. En la atmósfera libre el aire oscila alrededor de esa velocidad y termina soplando paralelo a las isobaras. El rozamiento lo frena, Coriolis (proporcional a la velocidad) se debilita y el gradiente consigue desviarlo hacia las bajas: unos 10–20° sobre el mar y 25–45° sobre tierra. En el ecuador <i>f</i> = 0: el aire va directo hacia las bajas presiones. Ver también <a href="${H.T1}#coriolis">Tema 1 · Efecto de Coriolis</a>.</p>`)));
    reset(); upd();

    /* ================= B · convergencia y divergencia ================= */
    const c = { hemi: 1, fric: true, t: 0 };
    const cv2 = H.h('canvas');
    const N = 70, parts = []; for (let i = 0; i < N; i++) parts.push({ r: 0.25 + Math.random() * 0.75, a: Math.random() * 6.283, side: i % 2 });
    const cs2 = H.autoCanvas(cv2, (w) => Math.min(w * 0.62, 470), (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      const top = h * 0.52, R = Math.min(w * 0.2, top * 0.42), cxs = [w * 0.27, w * 0.73], cy = top * 0.5;
      // planta
      cxs.forEach((cx, side) => {
        const low = side === 0;
        for (let k = 1; k <= 4; k++) { ctx.strokeStyle = 'rgba(28,40,54,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, R * k / 4, R * k / 4 * 0.8, 0, 0, 7); ctx.stroke(); }
        ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left';
        for (let k = 1; k <= 4; k++) ctx.fillText(H.f(low ? 996 + 4 * k : 1032 - 4 * k), cx + R * k / 4 + 2, cy);
        ctx.font = 'bold 22px system-ui'; ctx.fillStyle = low ? '#1f6f8b' : '#b4531d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(low ? 'B' : 'A', cx, cy); ctx.textBaseline = 'alphabetic';
        ctx.font = '12px system-ui'; ctx.fillStyle = '#1c2836'; ctx.fillText(low ? 'Borrasca: convergencia' : 'Anticiclón: divergencia', cx, cy + R * 0.8 + 18);
      });
      for (const p of parts) {
        const cx = cxs[p.side], x = cx + Math.cos(p.a) * R * p.r, y = cy + Math.sin(p.a) * R * p.r * 0.8;
        ctx.fillStyle = p.side ? '#b4531d' : '#1f6f8b'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
      }
      // perfil
      const y0 = h - 24, yTop = top + 26;
      ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, y0, w, h - y0); ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.fillText('Perfil (fig. 3.7 b)', 6, top + 16);
      // nube sobre la borrasca, cielo despejado sobre el anticiclón
      ctx.fillStyle = 'rgba(160,170,185,.55)'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(cxs[0] + i * R * 0.18, yTop + 18 + Math.abs(i) * 4, R * 0.16, 0, 7); ctx.fill(); }
      if (c.fric) { ctx.strokeStyle = 'rgba(31,111,139,.6)'; ctx.setLineDash([3, 4]); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cxs[0] + i * R * 0.15, yTop + 40); ctx.lineTo(cxs[0] + i * R * 0.15 - 6, y0 - 4); ctx.stroke(); } ctx.setLineDash([]); }
      const arrow = (x1, y1, x2, y2, col, wd = 3) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const an = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 10 * Math.cos(an - 0.4), y2 - 10 * Math.sin(an - 0.4)); ctx.lineTo(x2 - 10 * Math.cos(an + 0.4), y2 - 10 * Math.sin(an + 0.4)); ctx.fill(); };
      if (c.fric) {
        arrow(cxs[0], y0 - 10, cxs[0], yTop + 46, '#1f6f8b', 4); arrow(cxs[1], yTop + 30, cxs[1], y0 - 14, '#b4531d', 4);
        arrow(cxs[1] - R * 0.25, y0 - 10, cxs[0] + R * 0.35, y0 - 10, '#1c2836', 2.5);
        arrow(cxs[0] + R * 0.35, yTop + 26, cxs[1] - R * 0.25, yTop + 26, '#8a96a3', 2);
        ctx.font = '11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center';
        ctx.fillText('el aire asciende, se enfría y condensa', cxs[0], yTop + 4); ctx.fillText('el aire desciende y se calienta: cielo despejado', cxs[1], yTop + 4);
        ctx.fillText('en superficie, del anticiclón a la borrasca', w / 2, y0 + 15); ctx.fillStyle = '#5a6878'; ctx.fillText('en altura, compensación', w / 2, yTop + 20);
      } else { ctx.font = '12px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.fillText('Sin rozamiento el aire gira paralelo a las isobaras: ni converge ni diverge en superficie.', w / 2, (yTop + y0) / 2); }
    });
    let raf2 = null;
    const tick = () => {
      for (const p of parts) {
        const low = p.side === 0, rot = (low ? 1 : -1) * c.hemi; // borrasca: antihorario en el HN
        p.a -= rot * 0.03 / Math.max(0.3, p.r);
        if (c.fric) { p.r += low ? -0.004 : 0.004; if (p.r < 0.1) p.r = 1; if (p.r > 1) p.r = 0.15; }
      }
      cs2.redraw(); raf2 = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((en) => { en.forEach((e) => { if (e.isIntersecting) { cancelAnimationFrame(raf2); tick(); } else cancelAnimationFrame(raf2); }); });
    io.observe(cv2);
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Borrascas y anticiclones: giro, convergencia y divergencia'),
      H.h('p', { class: 'sub' }, 'Vista en planta y perfil, como en la fig. 3.7. En el hemisferio norte el aire gira en sentido antihorario en las borrascas y horario en los anticiclones; en el sur, al revés. El rozamiento hace que en superficie el aire entre en espiral en las borrascas y salga de los anticiclones.'),
      H.h('div', { class: 'viz framed' }, cv2),
      H.h('div', { class: 'row', style: { justifyContent: 'flex-start', marginTop: '10px' } },
        H.h('span', { style: { flex: '0 1 auto', maxWidth: '100%' } }, H.seg([[1, 'Hemisferio norte'], [-1, 'Hemisferio sur']], 1, (v) => { c.hemi = v; })),
        H.h('span', { style: { flex: '0 1 auto', maxWidth: '100%' } }, H.seg([[true, 'Con rozamiento (superficie)'], [false, 'Sin rozamiento (en altura)']], true, (v) => { c.fric = v; cs2.redraw(); }))),
      H.openQ('Ejercicio 3 del manual: ¿por qué una bajada del barómetro se asocia con tiempo inestable?', 'Porque anuncia la llegada o la profundización de una borrasca. En ella el aire <b>converge</b> en superficie y, como no puede acumularse, <b>asciende</b>: se enfría adiabáticamente, alcanza la saturación y forma nubes y precipitación. Las borrascas de latitudes medias traen además frentes (véase <a href="#frentes">Nubes, frentes y borrascas</a>). Al contrario, una subida del barómetro indica aire que desciende y se calienta: cielo despejado y tiempo estable.'),
      H.openQ('Ejercicio 5 del manual: si la fuerza del gradiente es perpendicular a las isobaras, ¿por qué el aire se mueve casi paralelo a ellas?', 'Porque en cuanto el aire se pone en movimiento aparece la <b>fuerza de Coriolis</b>, perpendicular a la velocidad (hacia la derecha en el hemisferio norte). El aire se va desviando hasta que Coriolis equilibra al gradiente: entonces sopla paralelo a las isobaras, con las bajas a su izquierda (ley de Buys Ballot). Es el <b>viento geostrófico</b>, que se cumple bien en la atmósfera libre. Cerca del suelo el <b>rozamiento</b> frena el aire, Coriolis se debilita y el viento cruza las isobaras hacia las bajas presiones con un ángulo de 10° a 45°. En el ecuador, donde no hay Coriolis, el aire va directo hacia las bajas.')));

    /* ================= C · caso real: viento e isobaras ================= */
    const realCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Caso real: viento e isobaras el 24 de febrero de 2026'));
    if (typeof VSUR === 'undefined' || !VSUR) realCard.append(H.info('<b>Datos pendientes.</b> Este mapa usa la presión y el viento horarios de ERA5 del episodio de viento sur de febrero de 2026; se añadirá en cuanto se exporten desde Google Earth Engine.'));
    else T3.realWindCard && T3.realWindCard(realCard);
    el.append(realCard);

    /* ================= D · escala de Beaufort ================= */
    const BF = [[0, 1, 'Calma', 'El humo sube vertical; mar como un espejo.'], [1, 6, 'Ventolina', 'El humo indica la dirección; la veleta no se mueve.'], [6, 12, 'Flojito', 'Se nota el viento en la cara; se mueven las hojas.'], [12, 20, 'Flojo', 'Hojas y ramitas en movimiento continuo; ondean las banderas.'], [20, 29, 'Bonancible', 'Se levanta polvo y papeles; se mueven las ramas pequeñas.'], [29, 39, 'Fresquito', 'Se mueven los arbustos; olas con borregos.'], [39, 50, 'Fresco', 'Se mueven las ramas grandes; silban los cables.'], [50, 62, 'Frescachón', 'Se mueven los árboles enteros; cuesta andar contra el viento.'], [62, 75, 'Duro', 'Se rompen ramas; es muy difícil andar.'], [75, 89, 'Muy duro', 'Daños en tejados y chimeneas.'], [89, 103, 'Temporal', 'Árboles arrancados; daños importantes.'], [103, 118, 'Borrasca', 'Destrozos generalizados.'], [118, 999, 'Huracán', 'Devastación.']];
    const bro = { b: H.ro('Grado Beaufort', 'hl'), n: H.ro('Denominación'), u: H.ro('Equivalencias'), e: H.ro('Efectos', 'bl') };
    const bfS = H.slider('Velocidad del viento', 0, 150, 1, 30, (v) => v + ' km/h', (v) => updB(v));
    const updB = (kmh) => { const i = BF.findIndex(([a, b]) => kmh >= a && kmh < b); bro.b.v.textContent = i; bro.n.v.textContent = BF[i][2]; bro.u.v.innerHTML = `${H.f(kmh / 3.6, 1)} <small>m/s</small> · ${H.f(kmh / 1.852, 0)} <small>nudos</small>`; bro.e.v.innerHTML = `<small>${BF[i][3]}</small>`; };
    updB(30);
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La medida del viento: escala de Beaufort'),
      H.h('p', { class: 'sub' }, 'La dirección del viento es aquella de donde viene: un viento del oeste sopla hacia el este. Hoy la velocidad se da en km/h, m/s o nudos, pero la escala de Beaufort (1806) sigue en uso en el mar.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, bfS), H.h('div', { class: 'readouts' }, bro.b, bro.n, bro.u, bro.e))));

    el.append(H.fix('El viento', [
      'La fuerza de Coriolis actúa sobre <b>cualquier</b> movimiento horizontal, no solo sobre el que va de norte a sur. La explicación por la distinta velocidad lineal de cada paralelo (fig. 3.5) solo justifica la desviación de los movimientos meridianos.',
      'El viento es casi <b>paralelo</b> a las isobaras en la atmósfera libre. En superficie el rozamiento las hace cruzar con un ángulo de 10–20° sobre el mar y de 25–45° sobre tierra.',
      'El gradiente se expresa hoy en hPa por 100 km (los 111 km del grado de meridiano del manual son casi equivalentes).',
    ]));
    el.append(H.selfCheck([
      { q: 'En el hemisferio norte, con el viento a la espalda, las bajas presiones quedan…', opts: ['A la derecha', 'A la izquierda', 'Delante', 'Detrás'], a: 1, ex: 'Es la ley de Buys Ballot. En el hemisferio sur, a la derecha.' },
      { q: 'Con las mismas isobaras, el viento geostrófico es más intenso…', opts: ['Cerca del polo', 'En latitudes bajas', 'Igual en todas partes', 'Solo sobre el mar'], a: 1, ex: 'V<sub>g</sub> = Δp/(ρ f Δn): cuanto menor es f (latitudes bajas), mayor es la velocidad para el mismo gradiente.' },
      { q: 'Sobre tierra, el viento cruza las isobaras con más ángulo que sobre el mar porque…', opts: ['Hay más Coriolis', 'El rozamiento es mayor', 'La presión es más alta', 'El aire es más denso'], a: 1, ex: 'Un mayor rozamiento frena más el aire y debilita Coriolis, de modo que el gradiente lo desvía más hacia las bajas.' },
      { q: 'En una borrasca del hemisferio sur, el aire en superficie gira…', opts: ['En sentido antihorario hacia dentro', 'En sentido horario hacia dentro', 'En sentido horario hacia fuera', 'No gira'], a: 1, ex: 'En el hemisferio sur Coriolis desvía hacia la izquierda: las borrascas giran en sentido horario y el rozamiento hace que el aire entre en espiral.' },
      { q: 'Isobaras muy juntas en un mapa indican…', opts: ['Calma', 'Viento fuerte', 'Altas presiones', 'Precipitación segura'], a: 1, ex: 'A más gradiente de presión (isobaras más próximas), más velocidad del viento.' },
    ]));
  },
});
