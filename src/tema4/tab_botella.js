/* ===================== MOVIMIENTOS · UN MENSAJE EN UNA BOTELLA ===================== */
H.tab({
  id: 'botella', nav: 'Botella', title: 'Un mensaje en una botella: la deriva por las corrientes',
  init(el) {
    el.append(H.intro('Movimientos debidos a los vientos · apartado 2.4.2', '¿Adónde llegaría una botella lanzada al mar?',
      'Lanza botellas desde cualquier punto del océano y míralas viajar con las corrientes superficiales medias de cada mes (modelo HYCOM, 2014-2023). Se añade un pequeño movimiento al azar que imita los remolinos, que el promedio de diez años no recoge. Es una simulación simplificada: las botellas reales también se mueven con el viento y el oleaje.',
      'Manual: 2.4.2<br>Figs. 4.8 y 4.9'));
    const O = OCEANO || {}, D2R = H.D2R;
    if (!(O.u && O.v)) { el.append(H.info('<b>Pendiente de datos.</b> La simulación usa las corrientes superficiales de HYCOM (<code>gee/tema4_hycom.js</code>) y se activará cuando estén procesadas.')); return; }
    const G1 = { nx: 360, ny: 180, lon0: -180, lat0: 90, res: 1 };
    const U = O.u.map((a) => T4.grid(a, G1)), V = O.v.map((a) => T4.grid(a, G1));
    const sst = O.sst ? O.sst.map((a) => T4.grid(a, G1)) : null;
    const KDIFF = 1500; // difusividad de los remolinos (m²/s)
    const DAY = 86400;
    const s = { bottles: [], t: 0, month0: new Date().getMonth(), run: false, speed: 10, years: 5, n: 20, bbox: T4.BB.mundo };
    const vel = (lat, lon, day) => { // interpolación entre meses
      const f = (s.month0 + day / 30.44) % 12, m0 = Math.floor(f), m1 = (m0 + 1) % 12, t = f - m0;
      const u0 = U[m0].at(lat, lon), v0 = V[m0].at(lat, lon), u1 = U[m1].at(lat, lon), v1 = V[m1].at(lat, lon);
      if (!(u0 === u0 && u1 === u1)) return null;
      return [u0 + (u1 - u0) * t, v0 + (v1 - v0) * t];
    };
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const step = (b, day) => {
      if (b.dead) return;
      const k1 = vel(b.lat, b.lon, day); if (!k1) { b.dead = 'costa'; return; }
      const mlat = b.lat + k1[1] * DAY / 2 / 111195, mlon = b.lon + k1[0] * DAY / 2 / (111195 * Math.cos(b.lat * D2R));
      const k2 = vel(mlat, mlon, day + 0.5) || k1;
      const sd = Math.sqrt(2 * KDIFF * DAY);
      const dy = k2[1] * DAY + gauss() * sd, dx = k2[0] * DAY + gauss() * sd;
      b.lat += dy / 111195; b.lon += dx / (111195 * Math.cos(b.lat * D2R)); b.lon = ((b.lon + 540) % 360) - 180;
      b.dist += Math.hypot(dx, dy) / 1000;
      if (Math.abs(b.lat) > 80 || H.land(b.lat, b.lon) > 0.6) { b.dead = 'costa'; b.day = day; }
      if (Math.round(day) % 3 === 0 || b.dead) b.path.push([b.lat, b.lon]);
    };
    const cv = H.h('canvas');
    const map = T4.map(cv, { bbox: s.bbox, grid: 30, key: () => 'b' + s.month0, color: (lat, lon) => { if (!sst) return null; const v = sst[s.month0].at(lat, lon); return v === v ? H.mix(T4.sstColor(v), [255, 255, 255], 0.55) : null; },
      after: (ctx, P) => {
        const COL = ['#b4531d', '#1f6f8b', '#7a5aa8', '#2d7a4c', '#c08a1e'];
        s.bottles.forEach((b, i) => {
          ctx.strokeStyle = COL[b.g % COL.length]; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.beginPath(); let prev = null;
          for (const [la, lo] of b.path) { const x = P.X(lo), y = P.Y(la); if (prev == null || Math.abs(lo - prev) > 180) ctx.moveTo(x, y); else ctx.lineTo(x, y); prev = lo; }
          ctx.stroke(); ctx.globalAlpha = 1;
          const x = P.X(b.lon), y = P.Y(b.lat); ctx.fillStyle = b.dead ? '#1c2836' : COL[b.g % COL.length]; ctx.beginPath(); ctx.arc(x, y, b.dead ? 2.5 : 3.2, 0, 7); ctx.fill();
        });
        for (const g of groups) { const x = P.X(g.lon), y = P.Y(g.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); ctx.lineWidth = 1; }
        ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; const d = Math.floor(s.t), y = Math.floor(d / 365.25), mo = Math.floor((d % 365.25) / 30.44);
        const lbl = `Día ${H.f(d)} · ${y} año${y === 1 ? '' : 's'} y ${mo} mes${mo === 1 ? '' : 'es'} · ${H.MESES[Math.floor((s.month0 + d / 30.44) % 12)]}`;
        const tw = ctx.measureText(lbl).width; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(6, 6, tw + 10, 18); ctx.fillStyle = '#1c2836'; ctx.fillText(lbl, 11, 9);
      } });
    let groups = [];
    const launch = (lat, lon) => {
      if (H.land(lat, lon) > 0.4 || !vel(lat, lon, s.t)) { msg.textContent = 'Ese punto es tierra o está demasiado cerca de la costa: elige un punto de mar abierto.'; return; }
      const g = groups.length; groups.push({ lat, lon, t0: s.t });
      for (let i = 0; i < s.n; i++) s.bottles.push({ lat: lat + (Math.random() - 0.5) * 0.3, lon: lon + (Math.random() - 0.5) * 0.3, path: [[lat, lon]], dist: 0, g, t0: s.t });
      msg.textContent = `Lanzadas ${s.n} botellas desde ${T4.ll(lat, lon, 1)}.`;
      if (!s.run) toggle();
    };
    cv.addEventListener('click', (e) => { const [x, y] = map.pos(e); const [la, lo] = map.P.inv(x, y); launch(la, lo); });
    const ro = { act: H.ro('Botellas a la deriva', 'hl'), cos: H.ro('Llegadas a la costa'), d: H.ro('Distancia media recorrida', 'bl'), v: H.ro('Velocidad media') };
    const upd = () => {
      const alive = s.bottles.filter((b) => !b.dead), dead = s.bottles.length - alive.length;
      ro.act.v.innerHTML = H.f(alive.length); ro.cos.v.innerHTML = H.f(dead);
      const dm = s.bottles.length ? s.bottles.reduce((a, b) => a + b.dist, 0) / s.bottles.length : 0;
      ro.d.v.innerHTML = H.f(dm) + ' <small>km</small>';
      const days = s.bottles.length ? s.bottles.reduce((a, b) => a + ((b.dead ? b.day ?? s.t : s.t) - b.t0), 0) / s.bottles.length : 0;
      ro.v.v.innerHTML = days > 0 ? H.f(dm / days) + ' <small>km/día</small>' : '—';
      map.redraw();
    };
    let last = null;
    const loop = (ts) => {
      if (!s.run) { last = null; return; }
      if (cv.isConnected && cv.offsetParent !== null) {
        const nd = s.speed;
        for (let k = 0; k < nd; k++) { for (const b of s.bottles) step(b, s.t); s.t += 1; }
        if (s.t >= s.years * 365.25) { toggle(); }
        upd();
      }
      last = ts; requestAnimationFrame(loop);
    };
    const play = H.h('button', { class: 'btn acc sm', type: 'button' }, '▶ Empezar');
    const toggle = () => { s.run = !s.run; play.textContent = s.run ? '❚❚ Parar' : '▶ Seguir'; if (s.run) requestAnimationFrame(loop); };
    play.onclick = toggle;
    const reset = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Borrar');
    reset.onclick = () => { s.bottles = []; groups = []; s.t = 0; if (s.run) toggle(); play.textContent = '▶ Empezar'; msg.textContent = ''; upd(); };
    const msg = H.h('p', { class: 'small' });
    const spd = H.slider('Velocidad de la animación', 1, 30, 1, s.speed, (v) => `${v} días por fotograma`, (v) => { s.speed = v; });
    const yrs = H.slider('Duración', 1, 10, 1, s.years, (v) => `${v} año${v > 1 ? 's' : ''}`, (v) => { s.years = v; });
    const mon = H.slider('Mes del lanzamiento', 0, 11, 1, s.month0, (v) => H.MESES[v], (v) => { s.month0 = v; map.invalidate(); });
    const pre = H.h('div', { class: 'chipbar' });
    const nearSea = () => { const p = H.place; let best = null, bd = 1e9; for (let dla = -4; dla <= 4; dla += 0.5) for (let dlo = -5; dlo <= 5; dlo += 0.5) { const la = p.lat + dla, lo = p.lon + dlo; if (H.land(la, lo) > 0.1 || !vel(la, lo, 0)) continue; const d = H.haversine(p.lat, p.lon, la, lo); if (d < bd) { bd = d; best = [la, lo]; } } return best; };
    [['Desde mi costa', null], ['Galicia', [43.5, -10.5]], ['Canarias', [28, -17.5]], ['Florida', [26, -79.5]], ['Caribe', [15, -70]], ['Terranova', [46, -48]], ['Japón', [34, 141]], ['Perú', [-12, -79]], ['Sudáfrica', [-35, 25]]].forEach(([n, ll]) => {
      const b = H.h('button', { class: 'chip', type: 'button' }, n); b.onclick = () => { const p = ll || nearSea(); if (p) launch(p[0], p[1]); else msg.textContent = 'No hay mar cerca de tu municipio en la rejilla de 1°.'; }; pre.append(b);
    });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Lanza tus botellas'),
      H.h('p', { class: 'sub' }, 'Pulsa en el mar para lanzar 20 botellas a la vez o elige un punto de partida. Fíjate en cuánto tiempo tardan en cruzar el Atlántico, en cómo quedan atrapadas en el centro de los giros subtropicales (donde se acumulan los plásticos flotantes) y en cómo se separan unas de otras por los remolinos.'),
      H.h('div', { class: 'viz framed' }, cv), msg,
      H.h('div', { class: 'grid2', style: { marginTop: '8px' } }, H.h('div', {}, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '8px' } }, H.h('span', { style: { flex: 'none' } }, play), H.h('span', { style: { flex: 'none' } }, reset)), pre, mon, spd, yrs),
        H.h('div', { class: 'readouts' }, ro.act, ro.cos, ro.d, ro.v))));
    upd();
    el.append(H.h('div', { class: 'grid2 even' },
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Las islas de basura'),
        H.html('<p>Los objetos flotantes convergen hacia el centro de los giros subtropicales, donde el transporte de Ekman acumula el agua superficial. Allí se concentran los plásticos: la mayor acumulación, entre Hawái y California, tiene unos 1,6 millones de km² y del orden de 80.000 toneladas de plástico (Lebreton y otros, 2018), sobre todo fragmentos y microplásticos, no una «isla» que se pueda pisar.</p>')),
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Experimentos reales'),
        H.html('<p>En 1992 un contenedor con 28.800 juguetes de plástico cayó al Pacífico norte; los oceanógrafos siguieron durante años su llegada a las costas de Alaska, Canadá e incluso del Atlántico. Hoy se usan miles de boyas de deriva con satélite (programa Global Drifter) y de perfiladores Argo, cuyas trayectorias permiten medir las corrientes.</p>'))));
    el.append(H.selfCheck([
      { q: 'Una botella lanzada frente a Galicia tiende a…', opts: ['ir hacia el norte, a Noruega', 'bajar hacia el sur con la corriente de Canarias y luego cruzar el Atlántico hacia el Caribe', 'quedarse quieta', 'entrar en el Mediterráneo'], a: 1, ex: ' Recorre el giro subtropical del Atlántico Norte en el sentido de las agujas del reloj.' },
      { q: '¿Por qué se acumulan los plásticos en el centro de los giros subtropicales?', opts: ['Porque allí no hay corrientes', 'Porque el transporte de Ekman converge hacia el centro de los giros', 'Porque allí hay más barcos', 'Porque el agua es más densa'], a: 1, ex: ' Bajo los anticiclones, el viento lleva el agua superficial hacia dentro del giro.' },
    ]));
  },
});
