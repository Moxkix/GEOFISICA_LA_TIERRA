/* ===================== 5 · EFECTO DE CORIOLIS ===================== */
H.tab({
  id: 'coriolis', nav: 'Coriolis', title: 'Efecto de Coriolis',
  init(el) {
    el.append(H.intro('Rotación · apartado 2.1.1', 'Fuerzas derivadas de la rotación: el efecto de Coriolis',
      'Un cuerpo que se desplaza sobre la Tierra sigue en realidad una trayectoria recta en el espacio, pero el suelo gira bajo él. Para un observador que gira con la Tierra, el cuerpo se desvía: a la derecha en el hemisferio norte y a la izquierda en el sur.',
      'Manual: 2.1.1<br>(consecuencias de la rotación)'));

    const s = { hem: 'N', spin: 0.6, v: 1, mode: 'centro', t: 0, run: false, trailI: [], trailR: [] };
    const cv = H.h('canvas');
    const cs = H.autoCanvas(cv, (w) => Math.min(w * 0.52, 470), (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      const R = Math.min(w / 4.4, h / 2.4), cy = h / 2 + 6, c1 = w * 0.25, c2 = w * 0.75;
      const Om = (s.hem === 'N' ? 1 : s.hem === 'S' ? -1 : 0) * s.spin * 2 * Math.PI / 3.0; // rad por unidad de tiempo
      const rot = Om * s.t;
      const pos = (t) => s.mode === 'centro' ? [s.v * t * 0.55, 0] : [-1 + s.v * t * 0.55, 0];
      const disc = (cx, ang, title) => {
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = '#e8eef2'; ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.stroke();
        ctx.rotate(-ang);
        ctx.strokeStyle = 'rgba(28,40,54,.18)'; ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * Math.cos(i * Math.PI / 6), R * Math.sin(i * Math.PI / 6)); ctx.stroke(); }
        for (const f of [0.33, 0.66]) { ctx.beginPath(); ctx.arc(0, 0, R * f, 0, 7); ctx.stroke(); }
        // diana fija al disco (hacia donde se apuntó)
        ctx.fillStyle = '#2d7a4c'; ctx.beginPath(); ctx.arc(R * 0.93, 0, 7, 0, 7); ctx.fill();
        if (s.mode === 'borde') { ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.arc(-R, 0, 5, 0, 7); ctx.fill(); }
        ctx.restore();
        ctx.fillStyle = '#1c2836'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(title, cx, 16);
      };
      disc(c1, rot, 'Visto desde el espacio (fijo)');
      disc(c2, 0, 'Visto desde la plataforma (gira con ella)');
      // flecha de giro
      if (Om) { const cx = c1, rr = R + 14, a0 = -Math.PI * 0.42, a1 = -Math.PI * 0.12; ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a1); ctx.stroke(); const ae = Om > 0 ? a0 : a1, dir = Om > 0 ? -1 : 1; const px = cx + rr * Math.cos(ae), py = cy + rr * Math.sin(ae); const tx = -Math.sin(ae) * dir, ty = Math.cos(ae) * dir; ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.moveTo(px + tx * 10, py + ty * 10); ctx.lineTo(px - ty * 6, py + tx * 6); ctx.lineTo(px + ty * 6, py - tx * 6); ctx.fill(); ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(Om > 0 ? 'giro antihorario (hemisferio N visto desde encima del polo)' : 'giro horario (hemisferio S visto desde debajo del polo)', cx, h - 6); }
      if (!Om) { ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.fillText('Sin giro del plano horizontal: así ocurre en el Ecuador', c1, h - 6); }
      // trayectorias
      const tr = (cx, pts, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([x, y], i) => { const X = cx + x * R, Y = cy - y * R; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); };
      tr(c1, s.trailI, '#b4531d'); tr(c2, s.trailR, '#b4531d');
      const p = pos(s.t), pr = [p[0] * Math.cos(-rot) - p[1] * Math.sin(-rot), p[0] * Math.sin(-rot) + p[1] * Math.cos(-rot)];
      if (Math.hypot(...p) <= 1.001) for (const [cx, q] of [[c1, p], [c2, pr]]) { ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + q[0] * R, cy - q[1] * R, 7, 0, 7); ctx.fill(); ctx.stroke(); }
      s.cur = { p, pr, rot };
    });
    let timer = null;
    const launch = () => {
      clearTimeout(timer); s.t = 0; s.trailI = []; s.trailR = []; s.run = true;
      const step = () => {
        const p = s.mode === 'centro' ? [s.v * s.t * 0.55, 0] : [-1 + s.v * s.t * 0.55, 0];
        if (Math.hypot(...p) > 1.0 || s.t > 20) { s.run = false; cs.redraw(); return; }
        cs.redraw(); s.trailI.push(s.cur.p); s.trailR.push(s.cur.pr);
        s.t += 0.025; timer = setTimeout(step, 16);
      };
      step();
    };
    const hemSeg = H.seg([['N', 'Hemisferio norte'], ['E', 'Ecuador'], ['S', 'Hemisferio sur']], 'N', (v) => { s.hem = v; launch(); });
    const modeSeg = H.seg([['centro', 'Lanzar desde el centro'], ['borde', 'Lanzar desde el borde']], 'centro', (v) => { s.mode = v; launch(); });
    const spS = H.slider('Velocidad de giro de la plataforma', 0.1, 1.5, 0.05, s.spin, (v) => H.f(v, 2), (v) => { s.spin = v; });
    const vS = H.slider('Velocidad del disco lanzado', 0.4, 2, 0.05, s.v, (v) => H.f(v, 2), (v) => { s.v = v; });
    const go = H.h('button', { class: 'btn acc', type: 'button' }, 'Lanzar');
    go.onclick = launch;
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La plataforma giratoria'),
      H.h('p', { class: 'sub' }, 'Se lanza un disco hacia la diana verde. Visto desde fuera, va en línea recta; visto desde la plataforma, que gira, parece desviarse y no llega a la diana.'),
      H.h('div', { class: 'viz framed' }, cv),
      H.h('div', { class: 'grid2', style: { marginTop: '12px' } }, H.h('div', {}, hemSeg, H.h('div', { style: { height: '8px' } }), modeSeg), H.h('div', {}, spS, vS, go))));
    setTimeout(launch, 300);

    /* ---------- en la Tierra ---------- */
    const e = { lat: Math.round(H.place.lat), v: 10, t: 6 };
    const ro = { f: H.ro('Parámetro de Coriolis f = 2Ω sen φ'), d: H.ro('Desviación lateral', 'hl'), x: H.ro('Avance', 'bl'), T: H.ro('Periodo inercial (2π/f)') };
    const pcv = H.h('canvas');
    const ps = H.autoCanvas(pcv, (w) => Math.min(w * 0.55, 300), (ctx, w, h) => {
      const f = 2 * H.K.omega * Math.sin(e.lat * H.D2R), v = e.v, T = e.t * 3600;
      const pts = []; const n = 200;
      for (let i = 0; i <= n; i++) { const t = T * i / n; let x, y; if (Math.abs(f) < 1e-9) { x = v * t; y = 0; } else { x = v / f * Math.sin(f * t); y = -v / f * (1 - Math.cos(f * t)); } pts.push([x, y]); } // y<0: a la derecha (hemisferio N)
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(0, ...xs), x1 = Math.max(v * T, ...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
      const sc = Math.min((w - 60) / Math.max(1e-9, x1 - x0), (h - 60) / Math.max(1e-9, y1 - y0));
      const ox = 30 - x0 * sc + ((w - 60) - (x1 - x0) * sc) / 2, oy = 24 + y1 * sc + ((h - 60) - (y1 - y0) * sc) / 2;
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#1f6f8b'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + v * T * sc, oy); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([x, y], i) => { const X = ox + x * sc, Y = oy - y * sc; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
      const L = pts[n]; ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.arc(ox + L[0] * sc, oy - L[1] * sc, 5, 0, 7); ctx.fill();
      ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.arc(ox, oy, 4, 0, 7); ctx.fill();
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left';
      ctx.fillText('Trayectoria sin rotación (discontinua) y con rotación, vista desde arriba. Escala igual en ambos ejes.', 8, h - 8);
      const dlat = -L[1], dist = Math.hypot(L[0], L[1]);
      ro.f.v.innerHTML = `${(f * 1e4).toFixed(3).replace('.', ',')}·10⁻⁴ <small>s⁻¹</small>`;
      const fmtD = (m) => Math.abs(m) >= 1000 ? `${H.f(m / 1000, Math.abs(m) >= 1e5 ? 0 : 1)} km` : Math.abs(m) >= 1 ? `${H.f(m, 1)} m` : `${H.f(m * 1000, 2)} mm`;
      ro.d.v.innerHTML = `${fmtD(Math.abs(dlat))} <small>${Math.abs(dlat) < 1e-9 ? '' : dlat > 0 ? 'a la derecha' : 'a la izquierda'}</small>`;
      ro.x.v.innerHTML = fmtD(L[0]);
      ro.T.v.innerHTML = Math.abs(f) < 1e-9 ? '∞' : H.hm(2 * Math.PI / Math.abs(f) / 3600);
    });
    const latS = H.slider('Latitud', -90, 90, 1, e.lat, (v) => v === 0 ? '0° (Ecuador)' : Math.abs(v) + '° ' + (v > 0 ? 'N' : 'S'), (v) => { e.lat = v; ps.redraw(); });
    const vS2 = H.slider('Velocidad', 0.1, 900, 0.1, e.v, (v) => H.f(v, v < 10 ? 1 : 0) + ' m/s', (v) => { e.v = v; ps.redraw(); });
    const tS = H.slider('Tiempo de recorrido', 0.002, 48, 0.001, e.t, (v) => v < 0.1 ? H.f(v * 3600, 0) + ' s' : H.hm(v), (v) => { e.t = v; ps.redraw(); });
    const presets = [['Viento: 10 m/s durante 12 h', 10, 12], ['Corriente marina: 0,5 m/s, 2 días', 0.5, 48], ['Proyectil: 800 m/s, 40 s', 800, 40 / 3600], ['Lavabo: 0,1 m/s, 10 s', 0.1, 10 / 3600]];
    const pr = H.h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } });
    presets.forEach(([n, v, t]) => { const b = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, n); b.onclick = () => { e.v = v; e.t = t; vS2.set(v); tS.set(t); ps.redraw(); }; pr.append(b); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Cuánto se desvía un cuerpo en la Tierra'),
      H.h('p', { class: 'sub' }, 'La intensidad del efecto depende de la latitud (f = 2Ω sen φ): nula en el Ecuador y máxima en los polos. Con poco tiempo de recorrido la desviación es mínima; con horas o días, enorme.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, pcv), H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.f, ro.d, ro.x, ro.T)),
        H.h('div', {}, latS, vS2, tS, pr, H.info('<b>Mito del lavabo.</b> En un lavabo la desviación es de milésimas de milímetro: el sentido del remolino lo deciden la forma del recipiente y el movimiento inicial del agua, no el hemisferio. En cambio, en borrascas y anticiclones, que duran días, el efecto es dominante.')))));
    ps.redraw();

    el.append(H.info('<b>Fuerza centrífuga y gravedad.</b> La rotación también genera una fuerza centrífuga, máxima en el Ecuador (≈ 0,3 % de la gravedad). Contribuyó a achatar la Tierra por los polos y hace que la gravedad efectiva sea algo menor en el Ecuador (9,78 m/s²) que en los polos (9,83 m/s²).'));
    el.append(H.fix('apartado 2.1.1', ['El efecto de Coriolis no afecta solo a los fluidos: actúa sobre <b>todo cuerpo en movimiento</b> respecto a la superficie terrestre. Es apreciable en vientos, corrientes marinas o proyectiles de largo alcance porque recorren grandes distancias durante mucho tiempo.']));
    el.append(H.selfCheck([
      { q: 'En el hemisferio norte, un cuerpo que se desplaza sobre la superficie terrestre se desvía…', opts: ['Hacia la izquierda de su dirección de marcha', 'Hacia la derecha de su dirección de marcha', 'Siempre hacia el este', 'Siempre hacia el Ecuador'], a: 1, ex: 'A la derecha en el hemisferio norte y a la izquierda en el sur, sea cual sea la dirección del movimiento.' },
      { q: '¿Dónde es nulo el efecto de Coriolis sobre los movimientos horizontales?', opts: ['En los polos', 'En los trópicos', 'En el Ecuador', 'En ningún lugar'], a: 2, ex: 'Es proporcional a sen φ: vale 0 en el Ecuador y es máximo en los polos.' },
      { q: '¿Por qué el efecto apenas se nota en un lavabo pero sí en una borrasca?', opts: ['Porque en el lavabo el agua está demasiado fría', 'Porque la desviación crece con el tiempo y la distancia del recorrido, y en el lavabo ambos son minúsculos', 'Porque las borrascas se forman solo en el Ecuador', 'Porque el lavabo está en un edificio'], a: 1, ex: 'Durante segundos y centímetros la desviación es de milésimas de milímetro. Una masa de aire que circula durante días se desvía cientos de kilómetros.' },
    ]));
  },
});
