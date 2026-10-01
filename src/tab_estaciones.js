/* ===================== 6 · TRASLACIÓN Y ESTACIONES ===================== */
H.tab({
  id: 'estaciones', nav: 'Traslación y estaciones', title: 'Traslación y estaciones',
  init(el) {
    el.append(H.intro('Traslación · apartado 2.1.2', 'Traslación, solsticios, equinoccios y estaciones',
      'La Tierra gira alrededor del Sol con el eje inclinado 23° 26′ respecto a la perpendicular al plano de la órbita, y el eje mantiene su orientación en el espacio. Por eso a lo largo del año cambian la latitud a la que el Sol llega a la vertical, la altura del Sol y la duración del día.',
      'Manual: 2.1.2<br>Figuras 1.8, 1.9 y 1.10'));

    const s = { doy: H.todayDoy(), eps: H.K.eps, lat: H.place.lat, ownLat: false, exag: true, spin: 0, play: false };
    const ms = () => H.dateFromDoy(s.doy).getTime();
    const SUN = () => H.sun(ms(), s.eps);

    /* ---------- órbita vista desde arriba ---------- */
    const ocv = H.h('canvas');
    const os = H.autoCanvas(ocv, (w) => Math.min(w * 0.78, 400), (ctx, w, h) => {
      ctx.fillStyle = '#0f1a2a'; ctx.fillRect(0, 0, w, h);
      const e = s.exag ? 0.25 : H.K.ecc;
      const A = Math.min(w * 0.38, h * 0.38), B = A * Math.sqrt(1 - e * e), c = A * e;
      const cx = w / 2, cy = h / 2 - 8;
      // el Sol ocupa un foco; perihelio a la izquierda del foco (dirección longitud del perihelio ≈ 283° vista del Sol desde la Tierra)
      // Posición de la Tierra: ángulo heliocéntrico = L + 180 (L: longitud eclíptica del Sol vista desde la Tierra)
      const sunX = cx - c, sunY = cy;
      const peri = 283 * H.D2R; // longitud geocéntrica del Sol en el perihelio
      const posAt = (Lsun) => { // anomalía verdadera respecto al perihelio
        const nu = (Lsun - 283) * H.D2R; const r = A * (1 - e * e) / (1 + e * Math.cos(nu));
        const th = Math.PI + nu; // la Tierra está en el lado opuesto al Sol visto desde ella; perihelio hacia la izquierda
        return [sunX + r * Math.cos(th), sunY - r * Math.sin(th)];
      };
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let L = 0; L <= 360; L += 2) { const p = posAt(L); L ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath(); ctx.stroke();
      // Sol
      const g = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 26); g.addColorStop(0, '#fff6c8'); g.addColorStop(0.4, '#ffd34d'); g.addColorStop(1, 'rgba(255,211,77,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sunX, sunY, 26, 0, 7); ctx.fill();
      // hitos
      ctx.font = '11px system-ui'; ctx.textAlign = 'center';
      const marks = [[0, 'Eq. marzo'], [90, 'Sol. junio'], [180, 'Eq. sept.'], [270, 'Sol. dic.'], [283, 'Perihelio'], [103, 'Afelio']];
      for (const [L, lab] of marks) {
        const p = posAt(L); ctx.fillStyle = L === 283 || L === 103 ? '#9cc9e8' : '#d9b48f';
        ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill();
        const dx = p[0] - sunX, dy = p[1] - sunY, d = Math.hypot(dx, dy);
        ctx.fillText(lab, p[0] + dx / d * 30, p[1] + dy / d * 22 + 4);
      }
      // Tierra
      const sn = SUN(); const E = posAt(sn.L);
      ctx.strokeStyle = 'rgba(255,211,77,.5)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(E[0], E[1]); ctx.stroke(); ctx.setLineDash([]);
      // eje (proyección): apunta siempre hacia la misma dirección del espacio (hacia la posición del solsticio de junio, vista desde arriba la punta N se inclina hacia el Sol en junio)
      const axDir = posAt(90); const ax = [sunX - axDir[0], sunY - axDir[1]]; const al = Math.hypot(...ax); const len = 26 * Math.sin(s.eps * H.D2R) / Math.sin(23.44 * H.D2R);
      ctx.fillStyle = '#7fb2cf'; ctx.beginPath(); ctx.arc(E[0], E[1], 10, 0, 7); ctx.fill();
      // hemisferio nocturno
      const ang = Math.atan2(sunY - E[1], sunX - E[0]);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(E[0], E[1], 10, ang + Math.PI / 2, ang + 3 * Math.PI / 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(E[0] + ax[0] / al * len, E[1] + ax[1] / al * len); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.fillText('N', E[0] + ax[0] / al * (len + 8), E[1] + ax[1] / al * (len + 8) + 3);
      ctx.fillStyle = '#cfd6df'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(`Vista desde encima del polo norte de la eclíptica · excentricidad ${s.exag ? 'exagerada (0,25)' : 'real (0,0167)'}`, 10, h - 24);
      ctx.fillText('Flecha blanca: el eje hacia el polo N, siempre orientado al mismo punto del espacio', 10, h - 9);
      os.E = E; os.posAt = posAt; os.sun = [sunX, sunY];
    });
    // arrastrar la Tierra en la órbita
    H.drag(ocv, { down: (e) => moveTo(e), move: (e) => moveTo(e) });
    const moveTo = (e) => {
      const [x, y] = os.pos(e); const ang = Math.atan2(-(y - os.sun[1]), x - os.sun[0]); // ángulo heliocéntrico
      const Lsun = ((ang * H.R2D - 180 + 283) % 360 + 360) % 360;
      // buscar el día con esa longitud
      let best = 1, bd = 999; for (let d = 1; d <= H.daysInYear(); d++) { const L = H.sun(H.dateFromDoy(d).getTime()).L; const dd = Math.abs(((L - Lsun + 540) % 360) - 180); if (dd < bd) { bd = dd; best = d; } }
      s.doy = best; dS.set(best); updAll();
    };

    /* ---------- la Tierra vista de perfil (como la figura 1.9) ---------- */
    const gcv = H.h('canvas');
    const gs = H.autoCanvas(gcv, (w) => Math.min(w * 0.9, 400), (ctx, w, h) => {
      const sn = SUN(); const d = sn.decl;
      ctx.fillStyle = '#0f1a2a'; ctx.fillRect(0, 0, w, h);
      const r = Math.min(w, h) * 0.36, cx = w * 0.46, cy = h / 2 + 4;
      // El Sol a la derecha. Vista: perpendicular a la línea Sol-Tierra, normal a la eclíptica hacia arriba.
      // Eje terrestre: inclinado hacia el Sol un ángulo igual a la declinación (en el plano de la figura) y hacia el observador el resto.
      const epsR = s.eps * H.D2R, dR = d * H.D2R;
      // componentes del eje en el sistema (x: hacia el Sol, y: arriba, z: hacia el observador)
      const ay = Math.cos(epsR), axx = Math.sin(dR), azz2 = Math.max(0, Math.sin(epsR) ** 2 - axx * axx);
      // el signo de la componente z depende de la mitad del año (antes o después del solsticio)
      const zs = (sn.L > 90 && sn.L < 270) ? -1 : 1; const az = zs * Math.sqrt(azz2);
      const axis = [axx, ay, az]; const nrm = Math.hypot(...axis); axis[0] /= nrm; axis[1] /= nrm; axis[2] /= nrm;
      // base ortonormal del ecuador: u perpendicular al eje en el plano que contiene al observador
      let u = [-axis[1] * 0 + 0, 0, 0];
      const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      u = cross([0, 1, 0], axis); if (Math.hypot(...u) < 1e-6) u = [0, 0, 1]; const un = Math.hypot(...u); u = u.map((x) => x / un);
      const v = cross(axis, u);
      const spin = s.spin;
      const toScreen = (lat, lon) => { const p = lat * H.D2R, l = (lon + spin) * H.D2R; const q = [0, 1, 2].map((i) => Math.cos(p) * Math.cos(l) * u[i] + Math.cos(p) * Math.sin(l) * v[i] + Math.sin(p) * axis[i]); return q; };
      // render por píxel
      const N = Math.round(2 * r), img = ctx.createImageData(N, N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i + 0.5 - r) / r, y = (r - j - 0.5) / r, rr = x * x + y * y, k = (j * N + i) * 4; if (rr > 1) { img.data[k + 3] = 0; continue; }
        const z = Math.sqrt(1 - rr); const P = [x, y, z];
        const lat = Math.asin(H.clamp(P[0] * axis[0] + P[1] * axis[1] + P[2] * axis[2], -1, 1)) * H.R2D;
        const lon = Math.atan2(P[0] * v[0] + P[1] * v[1] + P[2] * v[2], P[0] * u[0] + P[1] * u[1] + P[2] * u[2]) * H.R2D - spin;
        const c = H.surface(lat, ((lon + 540) % 360) - 180);
        const day = x > 0.0 ? 1 : 0; const t = H.clamp((x + 0.03) / 0.06, 0, 1);
        const f = (0.82 + 0.18 * z) * (0.32 + 0.68 * t);
        img.data[k] = c[0] * f; img.data[k + 1] = c[1] * f; img.data[k + 2] = c[2] * f; img.data[k + 3] = 255;
      }
      const off = document.createElement('canvas'); off.width = N; off.height = N; off.getContext('2d').putImageData(img, 0, 0);
      ctx.drawImage(off, cx - r, cy - r, 2 * r, 2 * r);
      // rayos
      ctx.strokeStyle = 'rgba(255,211,77,.5)'; ctx.lineWidth = 1;
      for (let y = -r; y <= r; y += r / 5) { const xs = Math.sqrt(Math.max(0, r * r - y * y)); ctx.beginPath(); ctx.moveTo(w - 8, cy - y); ctx.lineTo(cx + xs + 6, cy - y); ctx.stroke(); }
      ctx.fillStyle = '#ffd34d'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right'; ctx.fillText('☀ Sol', w - 10, 18);
      // paralelos notables
      const parL = (lat, col, lw, dash, label) => {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false, lp = null;
        for (let lo = 0; lo <= 360; lo += 3) { const q = toScreen(lat, lo - spin); if (q[2] < 0) { on = false; continue; } const X = cx + q[0] * r, Y = cy - q[1] * r; on ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); on = true; if (!lp || X < lp[0]) lp = [X, Y]; }
        ctx.stroke(); ctx.setLineDash([]);
        if (label && lp) { ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.fillStyle = col; ctx.fillText(label, lp[0] - 6, lp[1] + 4); }
      };
      parL(0, '#ffffff', 1.5, null, 'Ecuador');
      parL(s.eps, '#f0b46a', 1.2, [5, 4], 'Tr. Cáncer'); parL(-s.eps, '#f0b46a', 1.2, [5, 4], 'Tr. Capricornio');
      parL(90 - s.eps, '#9cc9e8', 1.2, [5, 4], 'C. P. Ártico'); parL(-(90 - s.eps), '#9cc9e8', 1.2, [5, 4], 'C. P. Antártico');
      // latitud del municipio con su parte diurna resaltada
      ctx.lineWidth = 3;
      { let prev = null; for (let lo = 0; lo <= 360; lo += 2) { const q = toScreen(s.lat, lo - spin); if (q[2] < 0) { prev = null; continue; } const X = cx + q[0] * r, Y = cy - q[1] * r; if (prev) { ctx.strokeStyle = q[0] > 0 ? '#ffd34d' : '#b4531d'; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(X, Y); ctx.stroke(); } prev = [X, Y]; } }
      // eje
      const P1 = [cx + axis[0] * r * 1.25, cy - axis[1] * r * 1.25], P2 = [cx - axis[0] * r * 1.25, cy + axis[1] * r * 1.25];
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(P2[0], P2[1]); ctx.lineTo(P1[0], P1[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 11px system-ui'; ctx.fillText('PN', P1[0], P1[1] - 6); ctx.fillText('PS', P2[0], P2[1] + 14);
      // vertical (perpendicular a la eclíptica)
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(cx, cy - r * 1.3); ctx.lineTo(cx, cy + r * 1.3); ctx.stroke();
      // punto subsolar
      const ssY = cy, ssX = cx + r;
      ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(ssX, ssY, 5, 0, 7); ctx.fill();
      ctx.fillStyle = '#cfd6df'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(`Paralelo de ${H.place.name}: amarillo de día, naranja de noche`, 10, h - 10);
    });
    let dragSpin = null;
    H.drag(gcv, { down: (e) => { dragSpin = [gs.pos(e)[0], s.spin]; }, move: (e) => { s.spin = dragSpin[1] + (gs.pos(e)[0] - dragSpin[0]) * 0.8; gs.redraw(); } });
    gcv.style.cursor = 'ew-resize';

    /* ---------- controles y lecturas ---------- */
    const dS = H.slider('Fecha', 1, H.daysInYear(), 1, s.doy, (v) => H.fdate(H.dateFromDoy(v)), (v) => { s.doy = v; updAll(); });
    const quick = H.h('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } });
    [['mar', 'Equinoccio de marzo'], ['jun', 'Solsticio de junio'], ['sep', 'Equinoccio de sept.'], ['dic', 'Solsticio de diciembre'], ['peri', 'Perihelio'], ['afe', 'Afelio'], ['hoy', 'Hoy']].forEach(([k, l]) => {
      const b = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, l);
      b.onclick = () => { s.doy = k === 'hoy' ? H.todayDoy() : H.doyOf(H.EV[k]); dS.set(s.doy); updAll(); }; quick.append(b);
    });
    const epsS = H.slider('Inclinación del eje (oblicuidad)', 0, 45, 0.5, s.eps, (v) => H.f(v, 1).replace(',0', '') + '°' + (Math.abs(v - H.K.eps) < 0.3 ? ' · actual' : ''), (v) => { s.eps = v; updAll(); });
    const resetE = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Restablecer 23,44°'); resetE.onclick = () => { s.eps = H.K.eps; epsS.set(s.eps); updAll(); };
    const latS = H.slider('Latitud estudiada', -90, 90, 0.5, s.lat, (v) => H.dm(v).replace('−', '') + (v >= 0 ? ' N' : ' S'), (v) => { s.lat = v; s.ownLat = true; updAll(); });
    const myLat = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Mi municipio'); myLat.onclick = () => { s.lat = H.place.lat; s.ownLat = false; latS.set(s.lat); updAll(); };
    const exChk = H.h('input', { type: 'checkbox', checked: true }); exChk.onchange = () => { s.exag = exChk.checked; os.redraw(); };
    const playB = H.h('button', { class: 'btn acc sm', type: 'button' }, '▶ Recorrer el año');
    playB.onclick = () => { s.play = !s.play; playB.textContent = s.play ? '❚❚ Pausa' : '▶ Recorrer el año'; const step = () => { if (!s.play) return; s.doy = s.doy % H.daysInYear() + 1; dS.set(s.doy); updAll(); setTimeout(step, 70); }; step(); };

    const ro = { decl: H.ro('Latitud del Sol en el cénit (declinación)', 'hl'), dist: H.ro('Distancia Tierra–Sol'), day: H.ro('Duración del día', 'hl'), real: H.ro('Con refracción y disco solar'), alt: H.ro('Altura del Sol a mediodía', 'bl'), az: H.ro('Orto / ocaso (azimut)'), ev: H.ro('Estación astronómica (hem. N)'), sr: H.ro('Salida y puesta (hora oficial)') };
    const msg = H.h('p', { class: 'small' });

    /* ---------- zonas terrestres ---------- */
    const zones = H.h('div');
    const drawZones = () => {
      const e = s.eps, Y = (la) => 150 - Math.sin(la * H.D2R) * 130;
      const pc = 90 - e;
      const band = (a, b, col) => `<rect x="20" y="${Y(b)}" width="260" height="${Y(a) - Y(b)}" fill="${col}"/>`;
      let svg = `<svg viewBox="0 0 430 300" style="width:100%;height:auto"><defs><clipPath id="zc"><circle cx="150" cy="150" r="130"/></clipPath></defs><g clip-path="url(#zc)">`;
      if (e <= 45) {
        svg += band(pc, 90, '#c9e1f0') + band(e, pc, '#e6efd6') + band(-e, e, '#f6d9a8') + band(-pc, -e, '#e6efd6') + band(-90, -pc, '#c9e1f0');
      } else svg += band(-90, 90, '#eee');
      svg += `</g><circle cx="150" cy="150" r="130" fill="none" stroke="#1c2836"/>`;
      const ln = (la, lab, col) => { const x = Math.sqrt(130 * 130 - (Y(la) - 150) ** 2); return `<line x1="${150 - x}" y1="${Y(la)}" x2="${150 + x}" y2="${Y(la)}" stroke="${col}" stroke-dasharray="4 3"/><text x="${150 + x + 6}" y="${Y(la) + 4}" font-size="11" fill="#1c2836">${lab} ${H.dm(Math.abs(la))}</text>`; };
      svg += `<line x1="20" y1="150" x2="280" y2="150" stroke="#1c2836"/><text x="286" y="154" font-size="11">Ecuador</text>`;
      if (e > 0.4) svg += ln(e, 'Tr. Cáncer', '#a8741a') + ln(-e, 'Tr. Capricornio', '#a8741a') + ln(pc, 'C. P. Ártico', '#1f6f8b') + ln(-pc, 'C. P. Antártico', '#1f6f8b');
      svg += `<line x1="150" y1="${150 - Math.sin(s.lat * H.D2R) * 130}" x2="150" y2="${150 - Math.sin(s.lat * H.D2R) * 130}" />`;
      svg += `<circle cx="${150 + Math.cos(s.lat * H.D2R) * 130 * 0.0}" cy="${Y(s.lat)}" r="4" fill="#b4531d"/>`;
      svg += `</svg>`;
      const pct = (a, b) => H.f((Math.sin(b * H.D2R) - Math.sin(a * H.D2R)) / 2 * 100, 1);
      zones.innerHTML = svg + (e < 0.4 ? '<p class="small"><b>Sin inclinación no hay trópicos ni círculos polares:</b> el Sol estaría siempre en la vertical del Ecuador y día y noche durarían 12 h en todas partes, todo el año.</p>'
        : e > 45 ? '<p class="small">Con una inclinación mayor de 45°, los trópicos quedarían más cerca de los polos que los círculos polares: las zonas se solaparían y no habría zona templada.</p>'
          : `<p class="small">Superficie terrestre: zona intertropical (cálida) <b>${pct(-e, e)} %</b>; templadas <b>${H.f(2 * (Math.sin(pc * H.D2R) - Math.sin(e * H.D2R)) / 2 * 100, 1)} %</b>; polares <b>${H.f(2 * (1 - Math.sin(pc * H.D2R)) / 2 * 100, 1)} %</b>. Los trópicos están a la latitud de la inclinación (${H.dm(e)}); los círculos polares, a 90° menos la inclinación (${H.dm(pc)}).</p>`);
    };

    /* ---------- gráficos anuales ---------- */
    const dch = H.chart(H.h('canvas'), 0.42), ach = H.chart(H.h('canvas'), 0.42);
    const updCharts = () => {
      const N = H.daysInYear(); const lats = [[0, '#1c2836', 'Ecuador'], [s.lat, '#b4531d', H.dm(s.lat).replace('−', '') + (s.lat >= 0 ? ' N' : ' S')], [66.6, '#1f6f8b', '66,6° N'], [-40, '#2d7a4c', '40° S']];
      const ser = lats.map(([la, col]) => { const pts = []; for (let d = 1; d <= N; d += 2) { const dd = H.sun(H.dateFromDoy(d).getTime(), s.eps).decl; pts.push([d, H.dayLength(la, dd)]); } return { pts, color: col, width: col === '#b4531d' ? 3 : 1.6, dash: col === '#b4531d' ? null : [5, 3] }; });
      const ev = H.EV; const vl = [['mar', 'eq'], ['jun', 'sol'], ['sep', 'eq'], ['dic', 'sol']].map(([k]) => ({ x: H.doyOf(ev[k]), color: 'rgba(90,104,120,.6)', dash: [2, 3] }));
      const dd = SUN().decl;
      dch.draw({ xMin: 1, xMax: N, yMin: 0, yMax: 24, xTicks: H.monthTicks(), yTicks: [0, 6, 12, 18, 24].map((v) => ({ v, label: v + ' h' })), series: ser, vlines: [...vl, { x: s.doy, color: '#b4531d', dash: [] }], markers: [{ x: s.doy, y: H.dayLength(s.lat, dd), label: H.hm(H.dayLength(s.lat, dd)) }] });
      const altPts = []; for (let d = 1; d <= N; d += 2) { const de = H.sun(H.dateFromDoy(d).getTime(), s.eps).decl; altPts.push([d, H.noonAlt(s.lat, de)]); }
      ach.draw({ xMin: 1, xMax: N, yMin: 0, yMax: 90, xTicks: H.monthTicks(), yTicks: [0, 15, 30, 45, 60, 75, 90].map((v) => ({ v, label: v + '°' })), series: [{ pts: altPts, color: '#1f6f8b', width: 3, fill: 'rgba(31,111,139,.12)' }], vlines: [...vl, { x: s.doy, color: '#b4531d', dash: [] }], markers: [{ x: s.doy, y: Math.max(0, H.noonAlt(s.lat, dd)), label: H.f(H.noonAlt(s.lat, dd), 1) + '°' }] });
      legend.innerHTML = lats.map(([, c, l]) => `<span><i style="background:${c}"></i>${l}</span>`).join('');
    };
    const legend = H.h('div', { class: 'legend' });

    const updRO = () => {
      const sn = SUN(), d = sn.decl, lat = s.lat;
      ro.decl.v.innerHTML = `${H.dm(Math.abs(d))} ${d >= 0 ? 'N' : 'S'}`;
      ro.dist.v.innerHTML = `${H.f(sn.R * H.K.AU, 1)} <small>millones de km</small>`;
      const dl = H.dayLength(lat, d), dr = H.dayLength(lat, d, -0.833);
      ro.day.v.innerHTML = dl >= 24 ? '24 h <small>(Sol de medianoche)</small>' : dl <= 0 ? '0 h <small>(noche polar)</small>' : H.hm(dl);
      ro.real.v.innerHTML = dr >= 24 ? '24 h' : dr <= 0 ? '0 h' : H.hm(dr);
      const na = H.noonAlt(lat, d);
      ro.alt.v.innerHTML = na <= 0 ? 'bajo el horizonte' : `${H.f(na, 1)}° <small>${lat > d ? 'hacia el S' : lat < d ? 'hacia el N' : 'cénit'}</small>`;
      const az = H.riseAzimuth(lat, d);
      ro.az.v.innerHTML = dl >= 24 || dl <= 0 ? '—' : `${H.f(az, 0)}° / ${H.f(360 - az, 0)}° <small>${az < 88 ? '(NE / NO)' : az > 92 ? '(SE / SO)' : '(E / O)'}</small>`;
      const L = sn.L; ro.ev.v.textContent = L < 90 ? 'Primavera' : L < 180 ? 'Verano' : L < 270 ? 'Otoño' : 'Invierno';
      if (!s.ownLat && H.place.es) {
        const t = ms(), off = H.officialOffset(H.place, t), noon = 12 - H.place.lon / 15 - sn.eot / 60 + off, hd = H.halfDay(lat, d, -0.833);
        ro.sr.v.innerHTML = hd >= 12 || hd <= 0 ? '—' : `${H.clock(noon - hd)} · ${H.clock(noon + hd)}`;
      } else ro.sr.v.innerHTML = '<small>solo para el municipio</small>';
      const ev = H.EV, near = (k) => Math.abs(H.doyOf(ev[k]) - s.doy) <= 1;
      msg.innerHTML = s.eps < 0.4 ? '<b>Eje sin inclinar:</b> el Sol siempre está en la vertical del Ecuador; día y noche duran 12 h en todo el planeta y no hay estaciones.'
        : near('jun') ? `<b>Solsticio de junio (${H.fdate(ev.jun)}).</b> El Sol alcanza la vertical del trópico de Cáncer. Al norte del círculo polar ártico no se pone; al sur del antártico, no sale. Comienza el verano en el hemisferio norte y el invierno en el sur.`
          : near('dic') ? `<b>Solsticio de diciembre (${H.fdate(ev.dic)}).</b> El Sol está en la vertical del trópico de Capricornio. Noche polar al norte del círculo polar ártico. Invierno en el hemisferio norte, verano en el sur.`
            : near('mar') || near('sep') ? `<b>Equinoccio (${H.fdate(near('mar') ? ev.mar : ev.sep)}).</b> El Sol está en la vertical del Ecuador y el círculo de iluminación pasa por los polos: día y noche duran 12 h geométricas en todo el planeta (algo más de día por la refracción).`
              : near('peri') ? '<b>Perihelio:</b> la Tierra está en el punto más cercano al Sol… en pleno invierno del hemisferio norte.' : near('afe') ? '<b>Afelio:</b> el punto más alejado del Sol, en pleno verano del hemisferio norte.' : 'Mueve la fecha, arrastra la Tierra en su órbita o pulsa «Recorrer el año».';
    };
    const updAll = () => { os.redraw(); gs.redraw(); updRO(); updCharts(); drawZones(); };

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Simulador de la traslación'),
      H.h('div', { class: 'grid2 even' },
        H.h('div', {}, H.h('h4', {}, 'La órbita'), H.h('div', { class: 'viz' }, ocv), H.h('div', { class: 'row', style: { marginTop: '6px' } }, H.h('label', { class: 'chk' }, exChk, 'Exagerar la excentricidad'), H.h('span', { class: 'small', style: { flex: 2 } }, 'Arrastra la Tierra para cambiar la fecha.'))),
        H.h('div', {}, H.h('h4', {}, 'La Tierra iluminada (como en la figura 1.9)'), H.h('div', { class: 'viz' }, gcv), H.h('p', { class: 'hint' }, 'Arrastra horizontalmente para hacerla girar sobre su eje.'))),
      H.h('div', { class: 'grid2', style: { marginTop: '14px' } },
        H.h('div', {}, dS, quick, H.h('div', { style: { height: '12px' } }), H.h('div', { class: 'row' }, playB), H.h('div', { style: { height: '10px' } }), epsS, resetE, H.h('div', { style: { height: '10px' } }), latS, myLat),
        H.h('div', {}, H.h('div', { class: 'readouts' }, ro.decl, ro.dist, ro.day, ro.real, ro.alt, ro.az, ro.sr, ro.ev), msg))));

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El año en una latitud'),
      H.h('div', { class: 'grid2 even' },
        H.h('div', {}, H.h('h4', {}, 'Duración del día (geométrica)'), H.h('div', { class: 'viz' }, dch.st.canvas), legend),
        H.h('div', {}, H.h('h4', {}, 'Altura del Sol a mediodía en la latitud estudiada'), H.h('div', { class: 'viz' }, ach.st.canvas), H.h('p', { class: 'small', html: 'Fuera de los trópicos: <span class="formula">h = 90° − φ + δ</span> (φ latitud, δ declinación). En los equinoccios, δ = 0 y h = 90° − φ.' })))));

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Zonas terrestres según la inclinación del eje'),
      H.h('div', { class: 'grid2' }, zones, H.h('div', {},
        H.html(`<table class="t"><tbody>
          <tr><td><b style="color:#a8741a">Intertropical (cálida)</b></td><td>Entre los trópicos. El Sol llega a la vertical dos veces al año (una en los trópicos). Día y noche casi iguales; estaciones marcadas por las lluvias más que por la temperatura. Incluye el cinturón ecuatorial (≈ 5° N–5° S) y las zonas tropicales.</td></tr>
          <tr><td><b style="color:#5d7a2e">Templadas</b></td><td>Entre trópicos y círculos polares. Rayos más oblicuos al aumentar la latitud y duración del día muy variable: estaciones térmicas bien marcadas. Transiciones subtropical y subpolar.</td></tr>
          <tr><td><b style="color:#1f6f8b">Polares (frías)</b></td><td>Más allá de los círculos polares. Al menos un día al año sin puesta y otro sin salida del Sol; en los polos, seis meses de día y seis de noche.</td></tr>
          </tbody></table>`),
        H.info('Mueve la inclinación del eje en el simulador: los trópicos y los círculos polares se desplazan con ella. Las zonas son una consecuencia directa de la oblicuidad.')))));
    updAll();

    H.onPlace(() => { if (!s.ownLat) { s.lat = H.place.lat; latS.set(s.lat); } updAll(); });
    el.append(H.fix('apartado 2.1.2', [
      'Oblicuidad de la eclíptica: <b>23° 26′</b> (23,44°), no 23° 27′; disminuye lentamente (≈ 0,47″ por año). Los círculos polares quedan a <b>66° 34′</b>.',
      'Las fechas no son fijas el día 22: el equinoccio de marzo cae el <b>20</b> (a veces el 21), el solsticio de junio el <b>20–21</b>, el equinoccio de septiembre el <b>22–23</b> y el solsticio de diciembre el <b>21–22</b>. Este año: ' + ['mar', 'jun', 'sep', 'dic'].map((k) => H.fdate(H.EV[k])).join(', ') + '.',
      'Año sidéreo: <b>365 d 6 h 9 min 10 s</b>. Órbita de ≈ <b>940 millones de km</b> recorrida a 29,8 km/s (≈ <b>107.000 km/h</b>).',
      'Perihelio ≈ <b>147,1 millones de km</b> (2–5 de enero) y afelio ≈ <b>152,1 millones de km</b> (3–7 de julio); distancia media 149,6 millones de km. El perihelio no coincide con el solsticio de diciembre: hay unas dos semanas de diferencia.',
      'En los equinoccios el día dura 12 h solo en sentido geométrico; por la refracción y el tamaño del disco solar, el día real es unos minutos más largo (compara las dos lecturas de duración).',
    ]));
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Ejercicios de autoevaluación del manual'),
      H.openQ('1. ¿Sabría explicar por qué la verticalidad máxima de los rayos solares solamente alcanza hasta los trópicos?', 'Porque el eje terrestre está inclinado 23° 26′ y mantiene su orientación durante la traslación. El punto subsolar oscila entre 23° 26′ N (solsticio de junio) y 23° 26′ S (solsticio de diciembre): nunca puede superar el valor de la inclinación. Si el eje estuviera más inclinado, los trópicos estarían más lejos del Ecuador. Pruébalo con el deslizador de inclinación.'),
      H.openQ('2. ¿Puede imaginar cómo sería la duración del día y la noche en la latitud de España si la Tierra no girara inclinada sobre su eje?', 'Con el eje perpendicular a la órbita (inclinación 0°), el círculo de iluminación pasaría siempre por los polos: el día y la noche durarían 12 h todo el año en cualquier latitud y la altura del Sol a mediodía sería constante (90° − φ; unos 47–50° en la península). No habría estaciones astronómicas. Pon la inclinación a 0° y mira el gráfico de duración del día.'),
      H.openQ('3. ¿Qué valor concede a que la Tierra esté más o menos alejada del Sol? ¿Cree que el verano se produce cuando está más próxima?', 'Muy poco. La Tierra está más cerca del Sol en enero (perihelio, ≈ 147,1 millones de km) y más lejos en julio (afelio, ≈ 152,1). La energía recibida solo varía un 7 %, mientras que la inclinación hace que en verano el Sol esté más alto y los días sean más largos. Por eso el verano boreal coincide con el afelio. Ver la pestaña «Esfericidad e insolación».'),
      H.openQ('4. ¿Puede describir la situación de la Tierra en el momento del solsticio de invierno para cada uno de los hemisferios?', 'En el solsticio de diciembre (21–22), el Sol está en la vertical del trópico de Capricornio. Hemisferio norte: comienza el invierno; el día es el más corto del año y lo es tanto más cuanto mayor es la latitud; al norte del círculo polar ártico el Sol no sale (noche polar). Hemisferio sur: comienza el verano; el día es el más largo y al sur del círculo polar antártico el Sol no se pone. En el Ecuador, día y noche duran unas 12 h.')));
    el.append(H.selfCheck([
      { q: '¿Qué latitud tiene el punto donde el Sol está en el cénit a mediodía del solsticio de junio?', opts: ['0°', '23° 26′ N', '23° 26′ S', '66° 34′ N'], a: 1, ex: 'Es el trópico de Cáncer, cuya latitud coincide con la inclinación del eje.' },
      { q: 'En los equinoccios, la altura del Sol a mediodía en un lugar de latitud 43° N es…', opts: ['43°', '47°', '66° 26′', '90°'], a: 1, ex: 'h = 90° − φ + δ, con δ = 0: 90 − 43 = 47°.' },
      { q: '¿Por qué hay estaciones?', opts: ['Porque varía la distancia de la Tierra al Sol', 'Porque el eje está inclinado respecto al plano de la órbita y mantiene su orientación', 'Porque la velocidad de rotación cambia a lo largo del año', 'Porque el Sol emite más energía en verano'], a: 1, ex: 'La inclinación hace que cambien la altura del Sol y la duración del día. La distancia apenas influye y es menor en el invierno boreal.' },
      { q: 'Al norte del círculo polar ártico, en el solsticio de junio…', opts: ['El Sol no sale', 'El Sol no se pone durante al menos 24 horas', 'Día y noche duran 12 h', 'El Sol está en el cénit'], a: 1, ex: 'Es el «Sol de medianoche». En el solsticio de diciembre ocurre lo contrario: la noche polar.' },
      { q: 'Si la inclinación del eje fuera de 30°, el trópico de Cáncer estaría a…', opts: ['23° 26′ N', '30° N', '60° N', '66° 34′ N'], a: 1, ex: 'La latitud de los trópicos es igual a la oblicuidad; la de los círculos polares, 90° menos la oblicuidad (60°).' },
      { q: 'En verano, en la península ibérica, el Sol sale…', opts: ['Exactamente por el este', 'Por el noreste', 'Por el sureste', 'Por el norte'], a: 1, ex: 'Con declinación positiva el orto se desplaza hacia el NE (azimut ≈ 57–60° en junio). Solo en los equinoccios sale exactamente por el este.' },
    ]));
  },
});
