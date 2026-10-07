/* ===================== P · ISOBARAS E INDIVIDUOS ISOBÁRICOS ===================== */
H.tab({
  id: 'isobaras', nav: 'Isobaras', title: 'Isobaras e individuos isobáricos',
  init(el) {
    el.append(H.intro('La presión · apartado 1', 'El campo de presión en superficie y en altura',
      'Para comparar la presión de lugares distintos hay que reducirla al nivel del mar. Uniendo los puntos de igual presión se trazan las isobaras, que dibujan anticiclones, borrascas, dorsales y vaguadas: los individuos isobáricos. En altura no se dibujan isobaras sino isohipsas, la altitud a la que se encuentra una presión dada, por ejemplo 500 hPa.',
      'Manual: 1.1 a 1.3<br>Figs. 3.1 y 3.2; ejercicio 1'));

    /* ================= A · laboratorio de isobaras ================= */
    const BBOX = [-32, 32, 26, 64];
    const PRESET = () => [
      { k: 'A', lon: -24, lat: 38, a: 14, sx: 1000, sy: 800, ang: 0 },
      { k: 'B', lon: -12, lat: 58, a: -22, sx: 650, sy: 600, ang: 0 },
      { k: 'dorsal', lon: -28, lat: 51, a: 9, sx: 330, sy: 900, ang: 35 },
      { k: 'vaguada', lon: 8, lat: 48, a: -11, sx: 300, sy: 950, ang: 15 },
      { k: 'A', lon: 28, lat: 52, a: 6, sx: 900, sy: 900, ang: 0 },
    ];
    const NAMES = { A: 'Anticiclón', B: 'Borrasca', dorsal: 'Dorsal (cuña anticiclónica)', vaguada: 'Vaguada' };
    const s = { C: PRESET(), fill: true, wind: false, mode: 'lab', drag: null, ask: null, ok: 0, n: 0, pick: null, vt: 8 };
    const KM = 111.2;
    const field = (lat, lon) => {
      let p = 1013 + (lat - 45) * -0.12; // ligero gradiente norte-sur de fondo
      for (const c of s.C) {
        const dx = (lon - c.lon) * KM * Math.cos(lat * H.D2R), dy = (lat - c.lat) * KM, a = c.ang * H.D2R;
        const u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
        p += c.a * Math.exp(-0.5 * ((u / c.sx) ** 2 + (v / c.sy) ** 2));
      }
      return p;
    };
    const RES = 0.5, NX = (BBOX[1] - BBOX[0]) / RES, NY = (BBOX[3] - BBOX[2]) / RES;
    const buildGrid = () => { const d = new Float32Array(NX * NY); for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) d[j * NX + i] = field(BBOX[3] - (j + 0.5) * RES, BBOX[0] + (i + 0.5) * RES); return T3.grid(d, NX, NY, BBOX[0], BBOX[3], RES); };
    const cv = H.h('canvas'), tip = H.h('div', { class: 'tooltip' });
    const curBB = () => (s.mode === 'real' && T3.VS && T3.VS.has ? T3.VS.bbox : BBOX); // en el caso real, el recuadro de los datos
    const cs = H.autoCanvas(cv, (w) => w * T3.aspect(curBB()), (ctx, w, h) => {
      const BB = curBB(), P = T3.proj(BB, w, h); cs.P = P;
      let g, rgP = null;
      if (s.mode === 'real' && T3.VS && T3.VS.has) { g = T3.VS.field('p', s.vt); rgP = T3.VS.bbox; } else g = buildGrid();
      const bg = T3.landRaster(P, w, h, (lat, lon) => { const base = H.mix([222, 233, 241], [240, 233, 214], H.land(lat, lon)); if (!s.fill) return base; const inside = !rgP || (lon >= rgP[0] && lon <= rgP[1] && lat >= rgP[2] && lat <= rgP[3]); return inside ? H.mix(T3.pColor(g.at(lat, lon)), base, 0.35) : base; });
      ctx.drawImage(bg, 0, 0, w, h);
      T3.graticule(ctx, P, BB === BBOX ? 10 : 5, { labels: true });
      T3.drawCoast(ctx, P, { regional: true, color: 'rgba(28,40,54,.55)' });
      const levels = []; for (let L = 960; L <= 1060; L += 4) levels.push(L);
      T3.contour(ctx, T3.refine(g, 2), levels, P, { style: (L) => ({ width: L === 1012 || L === 1016 ? 1.6 : 1.1, color: 'rgba(28,40,54,.8)' }), fmt: (L) => H.f(L), avoid: BB === BBOX ? [] : [[156, 16, 156, 12]] });
      if (s.wind) { // viento geostrófico aproximado a partir del gradiente
        ctx.save(); ctx.strokeStyle = 'rgba(31,111,139,.9)'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1.4;
        const st4 = BB === BBOX ? 4 : 2.5;
        for (let lat = BB[2] + st4 / 2; lat < BB[3]; lat += st4) for (let lon = BB[0] + st4 / 2; lon < BB[1]; lon += st4) {
          const e = 0.25, px = (g.at(lat, lon + e) - g.at(lat, lon - e)) / (2 * e * KM * Math.cos(lat * H.D2R)), py = (g.at(lat + e, lon) - g.at(lat - e, lon)) / (2 * e * KM);
          const gm = Math.hypot(px, py); if (gm < 1e-4) continue; let ux = -py / gm, uy = px / gm; // paralelo a las isobaras, bajas a la izquierda
          const L = Math.min(24, 6 + gm * 100 * 9), x = P.X(lon), y = P.Y(lat), dx = ux * L / 2, dy = -uy * L / 2;
          ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke(); const an = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - 6 * Math.cos(an - 0.45), y + dy - 6 * Math.sin(an - 0.45)); ctx.lineTo(x + dx - 6 * Math.cos(an + 0.45), y + dy - 6 * Math.sin(an + 0.45)); ctx.fill();
        }
        ctx.restore();
      }
      if (s.mode === 'lab') for (const c of s.C) { if (c.k !== 'A' && c.k !== 'B') continue; const x = P.X(c.lon), y = P.Y(c.lat); ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(c.k, x, y); ctx.fillStyle = c.k === 'A' ? '#b4531d' : '#1f6f8b'; ctx.fillText(c.k, x, y); }
      if (s.mode === 'lab') for (const c of s.C) { if (c.k === 'A' || c.k === 'B') continue; const x = P.X(c.lon), y = P.Y(c.lat); ctx.fillStyle = 'rgba(28,40,54,.45)'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); }
      if (s.pick) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(P.X(s.pick[1]), P.Y(s.pick[0]), 8, 0, 7); ctx.stroke(); }
      if (s.mode === 'real' && T3.VS && T3.VS.has) { ctx.fillStyle = '#1c2836'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(6, 6, 300, 20); ctx.fillStyle = '#1c2836'; ctx.fillText('ERA5 · ' + T3.VS.label(s.vt), 10, 10); }
    });
    /* clasificación del punto pulsado */
    const classify = (lat, lon) => {
      if (s.mode === 'lab') {
        let best = null, bd = 1e9;
        for (const c of s.C) { const dx = (lon - c.lon) * KM * Math.cos(lat * H.D2R), dy = (lat - c.lat) * KM, a = c.ang * H.D2R, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a), d = Math.hypot(u / c.sx, v / c.sy) / (c.k === 'A' || c.k === 'B' ? 0.75 : 1); if (d < bd) { bd = d; best = c; } }
        if (best && bd < 1) return best.k;
      }
      const e = 0.3, gx = (field(lat, lon + e) - field(lat, lon - e)) / (2 * e * KM * Math.cos(lat * H.D2R)), gy = (field(lat + e, lon) - field(lat - e, lon)) / (2 * e * KM);
      return Math.hypot(gx, gy) * 100 < 0.35 ? 'pantano' : 'gradiente';
    };
    const ro = { p: H.ro('Presión reducida al nivel del mar', 'hl'), what: H.ro('Individuo isobárico', 'bl'), gr: H.ro('Gradiente') };
    const qBox = H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '10px', marginTop: '8px' } });
    const qTxt = H.h('b'), qFb = H.h('span', { class: 'small' }), qSc = H.h('span', { class: 'pill ok' }, '0 / 0');
    const WHAT = { A: 'Anticiclón: isobaras cerradas con la presión más alta en el centro', B: 'Borrasca (depresión): isobaras cerradas con la presión más baja en el centro', dorsal: 'Dorsal o cuña anticiclónica: lengua de altas presiones entre bajas', vaguada: 'Vaguada: lengua de bajas presiones, como media borrasca', pantano: 'Pantano barométrico: presión casi uniforme, isobaras muy separadas', gradiente: 'Zona de gradiente: isobaras paralelas entre altas y bajas' };
    const onPick = (lat, lon) => {
      s.pick = [lat, lon];
      const g = s.mode === 'real' && T3.VS && T3.VS.has ? T3.VS.field('p', s.vt) : null;
      const pv = g ? g.at(lat, lon) : field(lat, lon);
      ro.p.v.innerHTML = `${H.f(pv, 1)} <small>hPa</small>`;
      const e = 0.3, f2 = (la, lo) => (g ? g.at(la, lo) : field(la, lo)), gx = (f2(lat, lon + e) - f2(lat, lon - e)) / (2 * e * KM * Math.cos(lat * H.D2R)), gy = (f2(lat + e, lon) - f2(lat - e, lon)) / (2 * e * KM);
      ro.gr.v.innerHTML = `${H.f(Math.hypot(gx, gy) * 100, 1)} <small>hPa/100 km</small>`;
      if (s.mode === 'lab') {
        const k = classify(lat, lon); ro.what.v.innerHTML = `<small>${WHAT[k]}</small>`;
        if (s.ask) { s.n++; const good = k === s.ask; if (good) s.ok++; qSc.textContent = `${s.ok} / ${s.n}`; qFb.innerHTML = good ? ' <span style="color:var(--ok)">✔ Correcto</span>' : ` <span style="color:var(--bad)">✘ Ahí hay: ${WHAT[k].split(':')[0].toLowerCase()}</span>`; s.ask = null; }
      } else ro.what.v.innerHTML = '<small>Identifícalo con las isobaras</small>';
      cs.redraw();
    };
    H.drag(cv, {
      down: (e) => { const [x, y] = cs.pos(e), P = cs.P; s.drag = null; if (s.mode === 'lab') { let bd = 18; for (const c of s.C) { const d = Math.hypot(P.X(c.lon) - x, P.Y(c.lat) - y); if (d < bd) { bd = d; s.drag = c; } } } if (!s.drag) { const [lat, lon] = P.inv(x, y); onPick(lat, lon); } },
      move: (e) => { if (!s.drag) return; const [x, y] = cs.pos(e), [lat, lon] = cs.P.inv(x, y); s.drag.lat = H.clamp(lat, BBOX[2], BBOX[3]); s.drag.lon = H.clamp(lon, BBOX[0], BBOX[1]); cs.redraw(); },
      up: () => { s.drag = null; },
    });
    cv.addEventListener('mousemove', (e) => { const [x, y] = cs.pos(e), [lat, lon] = cs.P.inv(x, y); const g = s.mode === 'real' && T3.VS && T3.VS.has ? T3.VS.field('p', s.vt) : null; tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${H.f(g ? g.at(lat, lon) : field(lat, lon), 1)} hPa`; });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    cv.style.cursor = 'crosshair';
    const addB = (k) => { const b = H.h('button', { class: 'btn ghost sm', type: 'button' }, k === 'A' ? '+ Anticiclón' : '+ Borrasca'); b.onclick = () => { s.C.push({ k, lon: 0 + (Math.random() - 0.5) * 20, lat: 45 + (Math.random() - 0.5) * 10, a: k === 'A' ? 10 : -14, sx: 600, sy: 600, ang: 0 }); cs.redraw(); }; return b; };
    const resetB = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Restaurar el mapa'); resetB.onclick = () => { s.C = PRESET(); s.pick = null; cs.redraw(); };
    const askB = H.h('button', { class: 'btn sm', type: 'button' }, 'Practicar: identifica'); askB.onclick = () => { const opts = ['A', 'B', 'dorsal', 'vaguada', 'pantano']; s.ask = opts[Math.floor(Math.random() * opts.length)]; qTxt.textContent = 'Pulsa sobre: ' + (s.ask === 'pantano' ? 'un pantano barométrico' : s.ask === 'A' ? 'un anticiclón' : s.ask === 'B' ? 'una borrasca' : s.ask === 'dorsal' ? 'una dorsal' : 'una vaguada'); qFb.textContent = ''; askB.textContent = 'Otra →'; };
    qBox.append(H.h('span', { style: { flex: 'none' } }, askB), H.h('span', { style: { flex: 'none' } }, qTxt, qFb), H.h('span', { style: { flex: 'none' } }, qSc));
    const chk = (k, l) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, l); };
    const labCtl = H.h('div', {}, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '6px' } }, H.h('span', { style: { flex: 'none' } }, addB('A')), H.h('span', { style: { flex: 'none' } }, addB('B')), H.h('span', { style: { flex: 'none' } }, resetB)), qBox);
    const realCtl = H.h('div', { style: { display: 'none' } });
    const hasVS = typeof VSUR !== 'undefined' && VSUR;
    if (hasVS) {
      const vtS = H.slider('Hora', 0, T3.VS.n - 1, 1, s.vt, (v) => T3.VS.label(v), (v) => { s.vt = v; cs.redraw(); if (s.pick) onPick(...s.pick); });
      realCtl.append(vtS, H.html('<p class="small">Presión a nivel del mar de ERA5 durante el episodio de viento sur de febrero de 2026: una borrasca profunda al oeste de Irlanda y altas presiones sobre el Mediterráneo dejan entre ambas un fuerte flujo del sur sobre la Península. Identifica la borrasca, el anticiclón y la dorsal; observa cómo se acerca la vaguada del frente frío el día 25.</p>'));
    }
    const modeSeg = H.seg([['lab', 'Campo de prácticas (como la fig. 3.1)'], ['real', 'Caso real: viento sur, febrero de 2026']], s.mode, (v) => { if (v === 'real' && !hasVS) { modeSeg.set('lab'); alertBox.style.display = ''; return; } s.mode = v; s.pick = null; labCtl.style.display = v === 'lab' ? '' : 'none'; realCtl.style.display = v === 'real' ? '' : 'none'; cs.refit(); });
    const alertBox = H.info('El caso real se añadirá en cuanto se exporten los datos horarios de ERA5 desde Google Earth Engine.'); alertBox.style.display = 'none';
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Laboratorio de isobaras'),
      H.h('p', { class: 'sub' }, 'Isobaras cada 4 hPa sobre Europa occidental. Arrastra las letras A y B para mover anticiclones y borrascas y observa cómo cambian las isobaras; pulsa cualquier punto para leer su presión y saber qué individuo isobárico hay en él.'),
      modeSeg, alertBox,
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cv, tip),
        H.h('div', {}, labCtl, realCtl, H.h('div', { style: { margin: '8px 0' } }, chk('fill', 'Colorear la presión'), chk('wind', 'Viento geostrófico (Buys Ballot)')),
          H.h('div', { class: 'readouts' }, ro.p, ro.gr, ro.what),
          H.h('div', { style: { marginTop: '10px' } }, T3.legend(T3.pColor, 984, 1038, [990, 1000, 1013, 1020, 1030], (v) => H.f(v) + (v === 1030 ? ' hPa' : ''), 320))))));

    /* ================= B · reducción al nivel del mar ================= */
    const r = { h: 600, t: 15, src: 'manual' };
    const stdP = (hh) => 1013.25 * Math.pow(1 - 0.0065 * hh / 288.15, 5.255);
    r.p = Math.round(stdP(r.h) * 10) / 10;
    const red = (p, hh, t) => p * Math.pow(1 - 0.0065 * hh / (t + 0.0065 * hh + 273.15), -5.257); // fórmula hipsométrica simplificada (OMM)
    const rro = { man: H.ro('Regla del manual (11 hPa/100 m)'), hyp: H.ro('Fórmula hipsométrica', 'hl'), dif: H.ro('Diferencia'), gr: H.ro('Variación real a esa altitud', 'bl') };
    const altInfo = H.h('p', { class: 'small' });
    const hS = H.slider('Altitud de la estación', 0, 2500, 10, r.h, (v) => H.f(v) + ' m', (v) => { r.h = v; r.p = Math.round(stdP(v) * 10) / 10; pS.set(r.p); updR(); });
    const pS = H.slider('Presión medida en la estación', 700, 1050, 0.5, r.p, (v) => H.f(v, 1) + ' hPa', (v) => { r.p = v; updR(); });
    const tS = H.slider('Temperatura del aire', -15, 40, 0.5, r.t, (v) => T3.fT(v), (v) => { r.t = v; updR(); });
    const gch = H.chart(H.h('canvas'), 0.55);
    const updR = () => {
      const man = r.p + 11 * r.h / 100, hyp = red(r.p, r.h, r.t);
      rro.man.v.innerHTML = `${H.f(man, 1)} <small>hPa</small>`; rro.hyp.v.innerHTML = `${H.f(hyp, 1)} <small>hPa</small>`; rro.dif.v.innerHTML = `${H.fs(man - hyp, 1)} <small>hPa</small>`;
      rro.gr.v.innerHTML = `${H.f(r.p * 9.80665 * 100 / (287.05 * (r.t + 273.15)), 1)} <small>hPa cada 100 m (1 hPa cada ${H.f(287.05 * (r.t + 273.15) / (r.p * 9.80665), 1)} m)</small>`;
      const pts = []; for (let hh = 0; hh <= 4000; hh += 50) pts.push([hh, stdP(hh) * 9.80665 * 100 / (287.05 * (288.15 - 0.0065 * hh))]);
      gch.draw({ xMin: 0, xMax: 4000, yMin: 6, yMax: 13, xTicks: [0, 1000, 2000, 3000, 4000].map((v) => ({ v, label: H.f(v) + ' m' })), yTicks: [6, 8, 10, 12].map((v) => ({ v, label: v })), yLabel: 'hPa por cada 100 m',
        hlines: [{ y: 11, color: '#b0393a', label: 'regla del manual: 11' }], series: [{ pts, color: '#1f6f8b', width: 2.5 }], markers: [{ x: r.h, y: r.p * 9.80665 * 100 / (287.05 * (r.t + 273.15)), color: '#b4531d', label: 'tu estación' }] });
    };
    const useMine = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Usar la altitud de mi municipio');
    useMine.onclick = () => { const a = T3.placeAlt(); let hh, src; if (a != null) { hh = a; src = `${H.placeLabel()}: ${H.f(a)} m (modelo digital SRTM).`; } else { const st = T3.myStation().s; hh = st.elev; src = `Sin altitud del municipio todavía: se usa la de su estación, ${T3.stLabel(st)} (${H.f(st.elev)} m).`; } r.h = Math.min(2500, Math.round(hh / 10) * 10); hS.set(r.h); r.p = Math.round(stdP(r.h) * 10) / 10; pS.set(r.p); altInfo.textContent = src; updR(); };
    const ex = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Ejemplo del manual: 980 hPa a 200 m');
    ex.onclick = () => { r.h = 200; r.p = 980; r.t = 15; hS.set(200); pS.set(980); tS.set(15); altInfo.textContent = 'Manual: 980 + 2 × 11 = 1.002 hPa.'; updR(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Reducir la presión al nivel del mar'),
      H.h('p', { class: 'sub' }, 'La presión disminuye con la altitud: cerca del nivel del mar, unos 12 hPa cada 100 m (1 hPa cada 8 m); a 2.000 m, unos 10 hPa. Por eso una regla fija de 11 hPa/100 m solo es aproximada. Los servicios meteorológicos usan la fórmula hipsométrica, que tiene en cuenta la temperatura del aire.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, hS, pS, tS, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '6px' } }, H.h('span', { style: { flex: 'none' } }, useMine), H.h('span', { style: { flex: 'none' } }, ex)), altInfo,
        H.h('div', { class: 'readouts', style: { marginTop: '8px' } }, rro.man, rro.hyp, rro.dif, rro.gr)), H.h('div', { class: 'viz' }, gch.st.canvas)),
      H.html('<p class="small"><span class="formula">p₀ = p · (1 − 0,0065 h / (T + 0,0065 h + 273,15))<sup>−5,257</sup></span> &nbsp; con h en metros y T en °C. La presión normal a nivel del mar es 1.013,25 hPa = 760 mm de mercurio.</p>')));
    updR();

    /* ================= C · superficie y altura: la DANA ================= */
    const dana = H.h('div', { class: 'card', id: 'dana' }, H.h('h3', {}, 'Superficie y altura: la DANA del 29 de octubre de 2024'));
    dana.append(H.html('<p class="sub">En altura no se representa la presión a una altitud fija, sino la <b>altitud de una superficie de igual presión</b>: las isohipsas. En el mapa de 500 hPa, una isohipsa de 5.820 m une los puntos donde la presión de 500 hPa se alcanza a 5.820 m. Valores altos equivalen a altas presiones y valores bajos, a bajas presiones (fig. 3.2). Una DANA (depresión aislada en niveles altos, la antigua «gota fría») es una borrasca cerrada en altura, con aire muy frío en su núcleo, que puede no tener casi reflejo en superficie.</p>'));
    if (typeof DANA === 'undefined' || !DANA) dana.append(H.info('<b>Datos pendientes.</b> Aquí irán los mapas de ERA5 en superficie y a 500 hPa del 28 al 30 de octubre de 2024 y la precipitación del día 29; se añadirán en cuanto se exporten desde Google Earth Engine.'));
    else T3.danaCard && T3.danaCard(dana);
    dana.append(H.html('<p class="small">El 29 de octubre de 2024 la estación de AEMET en Turís (Valencia) recogió 771,8 l/m² en 14 horas, muy cerca del récord español en un día (817 l/m², Oliva, 1987), y 184,6 l/m² en una sola hora, récord de España. La DANA, centrada entre el golfo de Cádiz y el norte de Marruecos, y las altas presiones situadas al norte mantuvieron durante horas un flujo del este muy húmedo desde el Mediterráneo, que se elevaba al llegar a las montañas valencianas.</p>'));
    el.append(dana);

    el.append(H.fix('La presión', [
      'Presión normal a nivel del mar: <s>1.015 milibares</s> → <b>1.013,25 hPa</b> (= 760 mm de mercurio). Hoy se usa el hectopascal, equivalente al milibar.',
      'Reducción al nivel del mar: cerca de la costa la presión cambia unos <b>12 hPa cada 100 m</b>, no 11, y la cifra disminuye con la altitud. El ejemplo del manual (980 hPa a 200 m) da ≈ 1.003,5 hPa con la fórmula hipsométrica, no 1.002.',
      'Fig. 3.4: la isobara rotulada «1.115» es la de 1.015 hPa.',
      'Valores extremos registrados: 1.084,8 hPa (Tosontsengel, Mongolia, 2001) y 870 hPa (tifón Tip, 1979).',
      'Los anticiclones subtropicales no los «causa» directamente la corriente en chorro: se deben al aire que desciende en la rama de la célula de Hadley (véase <a href="#circulacion">Circulación general</a>).',
    ]));
    el.append(H.openQ('Ejercicio 1 del manual: ¿en qué se diferencian las altas y bajas presiones térmicas de las dinámicas?', 'Las <b>térmicas</b> se deben al calentamiento o enfriamiento del suelo: el aire frío y denso de los continentes en invierno forma anticiclones (Siberia, Canadá) y el recalentamiento estival crea bajas (Sahara, Asia meridional, la Península en verano). Son poco profundas: <b>desaparecen en altura</b>, donde incluso se invierten. Las <b>dinámicas</b> nacen del movimiento del aire: el descenso de la célula de Hadley mantiene los anticiclones subtropicales (Azores) y la convergencia y las ondas de la corriente en chorro generan las borrascas de latitudes medias (Islandia). Se mantienen en los mapas de altura. Con mapas de superficie y de 500 hPa se distinguen: si el centro de acción aparece también en altura, es dinámico. Ejemplos: anticiclón siberiano (térmico) y de las Azores (dinámico).'));
    el.append(H.selfCheck([
      { q: 'En un mapa de isobaras, la presión aumenta hacia el centro en…', opts: ['Una borrasca', 'Un anticiclón', 'Una vaguada', 'Un pantano barométrico'], a: 1, ex: 'Es la definición de anticiclón; en la borrasca disminuye hacia el centro.' },
      { q: 'Una lengua de altas presiones que penetra entre zonas de bajas es una…', opts: ['Vaguada', 'Dorsal', 'Borrasca', 'Isohipsa'], a: 1, ex: 'También se llama cuña anticiclónica. La vaguada es lo contrario.' },
      { q: 'Una estación a 800 m mide 920 hPa. Su presión reducida al nivel del mar es de unos…', opts: ['920 hPa', '1.012 hPa', '1.100 hPa', '850 hPa'], a: 1, ex: 'Se suman unos 11–12 hPa por cada 100 m: ≈ 1.010–1.016 hPa (la fórmula hipsométrica da ≈ 1.011 hPa a 15 °C).' },
      { q: 'En un mapa de 500 hPa, una isohipsa de 5.520 m, comparada con una de 5.820 m, indica…', opts: ['Presiones más altas en altura', 'Presiones más bajas en altura y aire más frío', 'Más humedad', 'Nada: son altitudes'], a: 1, ex: 'Una columna de aire frío es más densa y «baja» la superficie de 500 hPa: isohipsas bajas = bajas presiones en altura.' },
      { q: 'Los anticiclones térmicos de los continentes en invierno…', opts: ['Se refuerzan en altura', 'Desaparecen en altura', 'Solo existen en altura', 'Están siempre sobre el mar'], a: 1, ex: 'Son capas poco profundas de aire frío y denso pegadas al suelo.' },
    ]));
  },
});
