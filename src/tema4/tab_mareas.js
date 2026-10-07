/* ===================== MOVIMIENTOS · LAS MAREAS ===================== */
H.tab({
  id: 'mareas', nav: 'Mareas', title: 'Las mareas',
  init(el) {
    el.append(H.intro('Movimientos de origen cósmico · apartado 2.2', 'Las mareas: la Luna, el Sol y la forma de cada cuenca',
      'La marea es la respuesta del océano a la diferencia entre la atracción de la Luna (y del Sol) en cada punto de la Tierra y en su centro. Esa «fuerza de marea» solo levantaría el mar unos decímetros; las mareas de varios metros aparecen cuando la forma y la profundidad de cada cuenca hacen resonar la onda. Aquí se calculan con los componentes armónicos medidos en puertos reales.',
      'Manual: 2.2<br>Fig. 4.6'));
    const ST = (MAREAS && MAREAS.st) || [];
    const D2R = H.D2R;

    /* ================= A · la fuerza de marea ================= */
    const sA = { mode: 'dif', d: 60.3 };
    const cvA = H.h('canvas');
    const arrow = (ctx, x0, y0, x1, y1, col, w = 1.6) => {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 1.5) return;
      const ux = dx / L, uy = dy / L, hs = Math.min(7, 2.5 + L * 0.25);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * 0.6, y1 - uy * hs * 0.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * 0.55, y1 - uy * hs + ux * hs * 0.55); ctx.lineTo(x1 - ux * hs + uy * hs * 0.55, y1 - uy * hs - ux * hs * 0.55); ctx.closePath(); ctx.fill();
    };
    const earth = (ctx, cx, cy, R) => {
      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      g.addColorStop(0, '#7fb2cf'); g.addColorStop(1, '#2f6f95');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(214,196,150,.85)';
      ctx.beginPath(); ctx.ellipse(cx - R * 0.25, cy - R * 0.2, R * 0.28, R * 0.42, 0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + R * 0.35, cy + R * 0.25, R * 0.22, R * 0.3, -0.3, 0, 7); ctx.fill();
    };
    const csA = H.autoCanvas(cvA, (w) => Math.min(w * 0.62, 440), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const R = Math.min(h * 0.27, w * 0.2), cx = Math.min(w * 0.36, w / 2 - R * 0.2), cy = h / 2, d = sA.d, mr = Math.max(7, R * 0.27);
      const mx = Math.min(w - mr - 34, cx + d * R), atScale = cx + d * R <= w - mr - 34;
      // agua (deformación exagerada)
      const e = Math.min(0.32, 0.075 * Math.pow(60.3 / d, 3));
      ctx.fillStyle = 'rgba(80,150,200,.25)'; ctx.strokeStyle = 'rgba(31,111,139,.6)';
      ctx.beginPath(); for (let k = 0; k <= 120; k++) { const a = k / 120 * 2 * Math.PI, r = R * (1.06 + e * (3 * Math.cos(a) ** 2 - 1) / 2); const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
      earth(ctx, cx, cy, R);
      // Luna
      ctx.fillStyle = '#c9c6bd'; ctx.strokeStyle = '#8a877e'; ctx.beginPath(); ctx.arc(mx, cy, mr, 0, 7); ctx.fill(); ctx.stroke();
      ctx.font = '11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('Luna', mx, cy + mr + 4);
      if (!atScale) { ctx.fillStyle = '#5a6878'; ctx.fillText(`a ${H.f(d, d < 10 ? 1 : 0)} radios`, mx, cy + mr + 18); ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx + R * 1.5, cy); ctx.lineTo(mx - 14, cy); ctx.stroke(); ctx.setLineDash([]); const bx = (cx + R * 1.5 + mx) / 2; ctx.strokeStyle = '#5a6878'; ctx.beginPath(); ctx.moveTo(bx - 4, cy - 6); ctx.lineTo(bx, cy + 6); ctx.moveTo(bx + 2, cy - 6); ctx.lineTo(bx + 6, cy + 6); ctx.stroke(); }
      // centro de masas Tierra-Luna
      const bxy = cx + d * 0.01215 * R;
      if (bxy < mx - 10) { ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bxy - 5, cy - 5); ctx.lineTo(bxy + 5, cy + 5); ctx.moveTo(bxy + 5, cy - 5); ctx.lineTo(bxy - 5, cy + 5); ctx.stroke(); ctx.lineWidth = 1; }
      // flechas
      const a0 = 1 / (d * d), tid0 = 2 / (d * d * d);
      const pts = []; for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * Math.PI; pts.push([Math.cos(a), Math.sin(a)]); }
      pts.push([0, 0], [0.55, 0], [-0.55, 0], [0, 0.55], [0, -0.55]);
      for (const [px, py] of pts) {
        const rx = d - px, ry = -py, r3 = Math.pow(rx * rx + ry * ry, 1.5), ax = rx / r3, ay = ry / r3;
        let vx, vy, col, L;
        if (sA.mode === 'atr') { vx = ax / a0; vy = ay / a0; col = '#1f6f8b'; L = R * 0.42; }
        else if (sA.mode === 'com') { vx = 1; vy = 0; col = '#7a5aa8'; L = R * 0.42; }
        else { vx = (ax - a0) / tid0; vy = ay / tid0; col = '#b4531d'; L = R * 0.36; }
        const x0 = cx + px * R, y0 = cy + py * R;
        arrow(ctx, x0, y0, x0 + vx * L, y0 + vy * L, col);
      }
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#1c2836';
      const tt = { atr: 'Atracción de la Luna en cada punto', com: 'Aceleración común (la del centro de la Tierra)', dif: 'Diferencia: fuerza de marea' }[sA.mode];
      ctx.fillText(tt, 10, 10);
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878';
      ctx.fillText('Flechas en proporción; deformación del agua muy exagerada', 10, 27);
      if (bxy < mx - 10) { ctx.fillStyle = '#b4531d'; ctx.textBaseline = 'bottom'; ctx.fillText('× centro de masas Tierra-Luna', 10, h - 8); }
    });
    const roA = { near: H.ro('Atracción en la cara cercana'), far: H.ro('En la cara opuesta'), tid: H.ro('Fuerza de marea (cara cercana)', 'hl'), bar: H.ro('Centro de masas Tierra-Luna') };
    const updA = () => {
      const d = sA.d;
      roA.near.v.innerHTML = H.fs(((d / (d - 1)) ** 2 - 1) * 100, 1) + ' <small>% respecto al centro</small>';
      roA.far.v.innerHTML = H.fs(((d / (d + 1)) ** 2 - 1) * 100, 1) + ' <small>%</small>';
      const gm = 0.0123 / (d * d) * 9.81 * (6.371 / 6.371); // aceleración lunar en el centro relativa a g (radio terrestre = 1)
      roA.tid.v.innerHTML = H.f(2 * 0.0123 / d ** 3 * 1e7, d < 20 ? 0 : 2) + ' <small>× 10⁻⁷ g</small>'; void gm;
      roA.bar.v.innerHTML = H.f(d * 0.01215 * 6371) + ' <small>km del centro</small>';
      csA.redraw();
    };
    const segA = H.seg([['atr', 'Atracción'], ['com', 'Movimiento común'], ['dif', 'Diferencia']], sA.mode, (v) => { sA.mode = v; csA.redraw(); });
    const dA = H.slider('Distancia de la Luna (radios terrestres)', 3, 60.3, 0.1, 60.3, (v) => H.f(v, 1) + (v > 60.2 ? ' (real)' : ' (exagerada)'), (v) => { sA.d = v; updA(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'De dónde sale la fuerza de marea'),
      H.h('p', { class: 'sub' }, 'Pulsa los tres botones por orden. La Tierra y la Luna giran juntas alrededor de su centro de masas común, que está dentro de la Tierra. En ese giro todos los puntos de la Tierra describen círculos iguales y sienten la misma aceleración: la que la Luna produce en el centro. Lo que levanta el agua es lo que sobra o lo que falta en cada punto: hacia la Luna en la cara cercana, y en sentido contrario en la cara opuesta, donde la atracción es menor que en el centro.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cvA),
        H.h('div', {}, segA, dA, H.h('p', { class: 'small' }, 'Acerca la Luna para ver mejor las diferencias: a la distancia real, la atracción solo varía un 3 % de una cara a otra, y la diferencia es unas diez millonésimas de la gravedad.'),
          H.h('div', { class: 'readouts' }, roA.near, roA.far, roA.tid, roA.bar)))));
    updA();

    /* ================= B · marea de equilibrio a tu latitud ================= */
    const sB = { dec: 20, lat: H.place.lat };
    const cvB = H.h('canvas'), cvB2 = H.h('canvas');
    const AM = 0.357, AS = 0.164; // amplitudes de la marea de equilibrio (m): (M/MT)(a/d)³·a
    const csB = H.autoCanvas(cvB, (w) => Math.min(w * 0.8, 330), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const R = Math.min(h * 0.3, w * 0.27), cx = w * 0.45, cy = h / 2, dl = sB.dec * D2R;
      const e = 0.16;
      ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = 'rgba(80,150,200,.25)'; ctx.strokeStyle = 'rgba(31,111,139,.6)';
      ctx.beginPath(); for (let k = 0; k <= 120; k++) { const a = k / 120 * 2 * Math.PI, c = Math.cos(a + dl), r = R * (1.06 + e * (3 * c * c - 1) / 2); const x = r * Math.cos(a), y = r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      earth(ctx, cx, cy, R);
      // eje y ecuador
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy - R * 1.35); ctx.lineTo(cx, cy + R * 1.35); ctx.stroke();
      ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(28,40,54,.5)'; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center'; ctx.fillText('N', cx, cy - R * 1.35 - 7);
      // dirección de la Luna
      const lx = cx + Math.cos(dl) * R * 1.75, ly = cy - Math.sin(dl) * R * 1.75;
      ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx - Math.cos(dl) * R * 1.4, cy + Math.sin(dl) * R * 1.4); ctx.lineTo(lx, ly); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c9c6bd'; ctx.strokeStyle = '#8a877e'; ctx.beginPath(); ctx.arc(Math.min(w - 12, lx + 8), ly, 9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1c2836'; ctx.textAlign = 'right'; ctx.fillText(`Luna (declinación ${H.fs(sB.dec, 0)}°)`, w - 6, w < 480 ? h - 26 : Math.min(h - 8, ly + 24));
      // paralelo del lugar: posiciones a las 0 h y 12 h
      const p = sB.lat * D2R;
      const yL = cy - Math.sin(p) * R, xL = Math.cos(p) * R;
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - xL, yL); ctx.lineTo(cx + xL, yL); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#b4531d'; [[cx + xL, 'A'], [cx - xL, 'B']].forEach(([x, t]) => { ctx.beginPath(); ctx.arc(x, yL, 4.5, 0, 7); ctx.fill(); ctx.textAlign = x > cx ? 'left' : 'right'; ctx.fillText(t, x + (x > cx ? 7 : -7), yL - 7); });
      ctx.textAlign = 'left'; ctx.fillStyle = '#5a6878'; ctx.fillText('Corte por el meridiano de la Luna', 8, 14);
      ctx.fillText('A: el lugar bajo la Luna · B: 12 h 25 min después', 8, h - 10);
    });
    const chB = H.chart(cvB2, 0.5);
    const eqTide = (lat, dec, H0) => { const c = Math.sin(lat * D2R) * Math.sin(dec * D2R) + Math.cos(lat * D2R) * Math.cos(dec * D2R) * Math.cos(H0); return AM * (3 * c * c - 1) / 2; };
    const roB = { h1: H.ro('Primera pleamar (A)'), h2: H.ro('Segunda pleamar (B)'), r: H.ro('Carrera de la marea de equilibrio', 'hl') };
    const updB = () => {
      const pts = [], P = 24.84;
      for (let t = 0; t <= P; t += 0.1) pts.push([t, eqTide(sB.lat, sB.dec, t / P * 2 * Math.PI)]);
      const hA = eqTide(sB.lat, sB.dec, 0), hB = eqTide(sB.lat, sB.dec, Math.PI);
      const vals = pts.map((p) => p[1]), mn = Math.min(...vals), mx = Math.max(...vals);
      chB.draw({ xMin: 0, xMax: P, yMin: -0.25, yMax: 0.4, xLabel: 'Horas desde el paso de la Luna por el meridiano', yLabel: 'Altura (m)',
        xTicks: [0, 3, 6, 9, 12, 15, 18, 21, 24].map((v) => ({ v, label: v + ' h' })), yTicks: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4].map((v) => ({ v, label: H.f(v, 1) })),
        series: [{ pts, color: '#1f6f8b', width: 2.4 }], hlines: [{ y: 0, color: '#999', dash: [2, 3] }],
        markers: [{ x: 0, y: hA, color: '#b4531d', label: 'A' }, { x: P / 2, y: hB, color: '#b4531d', label: 'B' }] });
      roB.h1.v.innerHTML = H.f(hA * 100) + ' <small>cm</small>'; roB.h2.v.innerHTML = H.f(hB * 100) + ' <small>cm</small>';
      roB.r.v.innerHTML = H.f((mx - mn) * 100) + ' <small>cm (solo la Luna)</small>';
      csB.redraw();
    };
    const decB = H.slider('Declinación de la Luna', -28.5, 28.5, 0.5, sB.dec, (v) => H.fs(v, 1) + '°', (v) => { sB.dec = v; updB(); });
    const latB = H.slider('Latitud del lugar', -80, 80, 0.5, Math.round(sB.lat * 2) / 2, (v) => H.f(Math.abs(v), 1) + '° ' + (v < 0 ? 'S' : 'N'), (v) => { sB.lat = v; updB(); });
    H.onPlace((p) => { latB.set(Math.round(p.lat * 2) / 2, true); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La marea de equilibrio: dos pleamares al día, a menudo desiguales'),
      H.h('p', { class: 'sub' }, 'Si el océano cubriera toda la Tierra y respondiera al instante, el agua formaría los dos abultamientos de arriba y cada lugar pasaría por ellos al girar la Tierra: dos pleamares por día lunar (24 h 50 min). Cuando la Luna está al norte o al sur del ecuador, los abultamientos quedan inclinados y las dos pleamares de un lugar son distintas; en latitudes altas una de ellas puede desaparecer: es el origen de las mareas mixtas y diurnas.'),
      H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'viz framed' }, cvB), H.h('div', { class: 'viz' }, cvB2)),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, decB, latB), H.h('div', { class: 'readouts' }, roB.h1, roB.h2, roB.r)),
      H.h('p', { class: 'small' }, `La marea de equilibrio de la Luna sube como máximo ${H.f(AM * 100)} cm y baja ${H.f(AM * 50)} cm (carrera de ${H.f(AM * 150)} cm en el ecuador con la Luna sobre él); la del Sol es el 46 % de la lunar. La declinación de la Luna oscila cada mes entre dos extremos que van de ±18,3° a ±28,6° según un ciclo de 18,6 años (en 2024-2025 ha estado en el máximo).`)));
    updB();

    /* ================= puertos ================= */
    const isCan = (s) => s.group === 'es' && s.lon < -12;
    const tzOff = (s, ms) => (s.group === 'es' ? H.officialOffset({ es: true, can: isCan(s) }, ms) : 0);
    const tzName = (s) => (s.group === 'es' ? (isCan(s) ? 'hora oficial de Canarias' : 'hora oficial peninsular') : 'hora UTC');
    const nearestPort = (lat, lon, esOnly) => { let b = null, bd = 1e9; for (const s of ST) { if (esOnly && s.group !== 'es') continue; const d = H.haversine(lat, lon, s.lat, s.lon); if (d < bd) { bd = d; b = s; } } return { s: b, d: bd }; };
    const dayStart = (ms, s) => { const off = tzOff(s, ms) * 3600e3, l = new Date(ms + off); return Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()) - off; };
    const fDay = (ms, s) => { const l = new Date(ms + tzOff(s, ms) * 3600e3); return `${['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][l.getUTCDay()]} ${l.getUTCDate()} ${H.MES3[l.getUTCMonth()]}`; };
    const fTime = (ms, s) => { const l = new Date(ms + tzOff(s, ms) * 3600e3); return H.clock(l.getUTCHours() + l.getUTCMinutes() / 60 + l.getUTCSeconds() / 3600); };
    let port = nearestPort(H.place.lat, H.place.lon, !!H.place.es).s;
    const now = Date.now();

    /* ================= C · vivas y muertas ================= */
    const sC = { age: T4.moonAge(now) };
    const cvC = H.h('canvas'), cvC2 = H.h('canvas');
    const csC = H.autoCanvas(cvC, (w) => Math.min(w * 0.85, 360), (ctx, w, h) => {
      ctx.fillStyle = '#fbfcfd'; ctx.fillRect(0, 0, w, h);
      const R = Math.min(h, w) * 0.17, cx = w / 2, cy = h * 0.56, orb = Math.min(h * 0.38, w * 0.4);
      // Sol arriba
      const g = ctx.createLinearGradient(0, 0, 0, 26); g.addColorStop(0, '#f6c445'); g.addColorStop(1, '#fbe7a2');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, -h * 0.05, w * 0.32, 30, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#7a5a10'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Sol', cx, 14);
      ctx.strokeStyle = 'rgba(28,40,54,.25)'; ctx.beginPath(); ctx.arc(cx, cy, orb, 0, 7); ctx.stroke();
      const am = -Math.PI / 2 - sC.age / T4.SYN * 2 * Math.PI; // ángulo de la Luna (sentido antihorario visto desde el norte)
      const aS = -Math.PI / 2;
      const eL = 0.22, eS = eL * 0.46;
      const shape = (k, e1, e2) => { const a = k / 120 * 2 * Math.PI; return R * (1.12 + e1 * (3 * Math.cos(a - am) ** 2 - 1) / 2 + e2 * (3 * Math.cos(a - aS) ** 2 - 1) / 2); };
      const draw = (e1, e2, fill, stroke) => { ctx.beginPath(); for (let k = 0; k <= 120; k++) { const a = k / 120 * 2 * Math.PI, r = shape(k, e1, e2); const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } };
      draw(eL, eS, 'rgba(80,150,200,.28)', 'rgba(31,111,139,.8)');
      ctx.setLineDash([3, 3]); draw(eL, 0, null, 'rgba(90,90,90,.7)'); draw(0, eS * 1.6, null, 'rgba(200,150,30,.9)'); ctx.setLineDash([]);
      earth(ctx, cx, cy, R);
      const mx = cx + orb * Math.cos(am), my = cy + orb * Math.sin(am);
      // fase vista desde la Tierra: iluminada la mitad que mira al Sol
      ctx.fillStyle = '#3a3d44'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.fill();
      ctx.fillStyle = '#efece2'; ctx.beginPath(); ctx.arc(mx, my, 10, Math.PI, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = '#8a877e'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.stroke();
      ctx.font = '11px system-ui'; ctx.fillStyle = '#1c2836';
      const ph = sC.age / T4.SYN, nm = ph < 0.03 || ph > 0.97 ? 'luna nueva' : Math.abs(ph - 0.25) < 0.03 ? 'cuarto creciente' : Math.abs(ph - 0.5) < 0.03 ? 'luna llena' : Math.abs(ph - 0.75) < 0.03 ? 'cuarto menguante' : ph < 0.5 ? 'creciente' : 'menguante';
      ctx.textAlign = mx > cx + 5 ? 'left' : mx < cx - 5 ? 'right' : 'center'; ctx.textBaseline = my > cy ? 'top' : 'bottom';
      ctx.fillText(nm, mx + (mx > cx + 5 ? 14 : mx < cx - 5 ? -14 : 0), my + (my > cy ? 13 : -13));
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#5a6878';
      ctx.fillText('— — abultamiento lunar', 8, h - 24); ctx.fillStyle = '#a07a10'; ctx.fillText('— — abultamiento solar', 8, h - 9);
      ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.fillText('Visto desde el polo norte', w - 8, h - 9);
    });
    const chC = H.chart(cvC2, 0.42);
    const roC = { age: H.ro('Edad de la Luna'), eq: H.ro('Marea de equilibrio (Luna + Sol)', 'hl'), port: H.ro('Carrera en el puerto ese día', 'bl') };
    let curve30 = null, curve30key = '';
    const updC = () => {
      const ang = sC.age / T4.SYN * 2 * Math.PI; // separación Luna-Sol vista desde la Tierra
      const rng = Math.sqrt(1 + 0.46 ** 2 + 2 * 0.46 * Math.cos(2 * ang)) * AM * 1.5;
      roC.age.v.innerHTML = H.f(sC.age, 1) + ' <small>días desde la luna nueva</small>';
      roC.eq.v.innerHTML = H.f(rng * 100) + ' <small>cm en el ecuador</small>';
      // curva real de 30 días en el puerto elegido
      const t0 = dayStart(now, port), key = port.id + t0;
      if (key !== curve30key) {
        const pr = T4.tidePredictor(port), pts = [];
        for (let t = 0; t <= 30 * 24; t += 0.25) pts.push([t / 24, pr(t0 + t * 3600e3) + port.msl]);
        curve30 = { pts, ph: T4.moonPhases(t0, t0 + 30 * 864e5), t0, ext: T4.tideExtremes(pr, t0, t0 + 30 * 864e5, 10 * 60e3) };
        curve30key = key;
      }
      const ymax = Math.max(...curve30.pts.map((p) => p[1])), dsel = (sC.age - T4.moonAge(curve30.t0) + T4.SYN) % T4.SYN;
      const markers = curve30.ph.map((p) => { const x = (p.t - curve30.t0) / 864e5; return { x, y: ymax * 1.06, color: ['#1c2836', '#7a7a7a', '#b4531d', '#7a7a7a'][p.q], label: ['nueva', 'c. crec.', 'llena', 'c. meng.'][p.q], r: 4, align: x > 27 ? 'right' : 'left' }; });
      chC.draw({ xMin: 0, xMax: 30, yMin: 0, yMax: ymax * 1.18, xLabel: `Días desde hoy (${fDay(now, port)}) · ${port.name}`, yLabel: 'Altura (m)',
        xTicks: [0, 5, 10, 15, 20, 25, 30].map((v) => ({ v })), yTicks: Array.from({ length: Math.floor(ymax * 1.18 / (ymax > 5 ? 2 : ymax > 2 ? 1 : ymax > 0.8 ? 0.2 : 0.1)) + 1 }, (_, i) => { const st = ymax > 5 ? 2 : ymax > 2 ? 1 : ymax > 0.8 ? 0.2 : 0.1; return { v: i * st, label: H.f(i * st, st < 1 ? 1 : 0) }; }),
        series: [{ pts: curve30.pts, color: '#1f6f8b', width: 1.2 }], vlines: [{ x: dsel, color: '#b4531d', dash: [3, 3] }], markers });
      // carrera del día elegido
      const dd = Math.floor(dsel), ex = curve30.ext.filter((e) => (e.t - curve30.t0) / 864e5 >= dd && (e.t - curve30.t0) / 864e5 < dd + 1);
      const hi = ex.filter((e) => e.hi).map((e) => e.h), lo = ex.filter((e) => !e.hi).map((e) => e.h);
      roC.port.v.innerHTML = hi.length && lo.length ? H.f(Math.max(...hi) - Math.min(...lo), 2) + ' <small>m</small>' : '—';
      csC.redraw();
    };
    const ageC = H.slider('Día del mes lunar', 0, 29.5, 0.1, Math.round(sC.age * 10) / 10, (v) => H.f(v, 1) + ' d', (v) => { sC.age = v; updC(); });
    const btnToday = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Hoy'); btnToday.onclick = () => { sC.age = T4.moonAge(now); ageC.set(Math.round(sC.age * 10) / 10); updC(); };
    el.append(H.h('div', { class: 'card', id: 'vivas' }, H.h('h3', {}, 'Mareas vivas y mareas muertas'),
      H.h('p', { class: 'sub' }, 'Con luna nueva y luna llena (sicigias) los abultamientos de la Luna y del Sol se suman: mareas vivas. En los cuartos (cuadraturas) se cruzan: mareas muertas. A la derecha, la marea real prevista para los próximos 30 días en el puerto elegido abajo: las vivas llegan uno o dos días después de la luna nueva o llena (la «edad de la marea»).'),
      H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'viz framed' }, cvC), H.h('div', { class: 'viz' }, cvC2)),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', {}, ageC, btnToday), H.h('div', { class: 'readouts' }, roC.age, roC.eq, roC.port))));

    /* ================= D · mareas en puertos reales ================= */
    const sD = { region: port.group === 'es' ? 'es' : 'mundo', day: dayStart(now, port), days: 2 };
    const cvMap = H.h('canvas'), cvD = H.h('canvas');
    const BBD = { es: [-18.8, 5.2, 27.3, 44.4], mundo: [-180, 180, -60, 72] };
    const ptype = (s) => T4.tideType(T4.formF(s));
    const map = T4.map(cvMap, { bbox: BBD[sD.region], regional: sD.region === 'es', grid: sD.region === 'es' ? 5 : 30, key: () => sD.region,
      aspect: (w) => Math.min(w * T3.aspect(BBD[sD.region], sD.region === 'es'), 520),
      after: (ctx, P) => {
        for (const s of ST) {
          if (sD.region === 'es' && s.group !== 'es') continue;
          const x = P.X(s.lon), y = P.Y(s.lat), r = 3 + Math.sqrt(T4.springRange(s)) * 2.6;
          ctx.fillStyle = ptype(s).col; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = s === port ? '#1c2836' : '#fff'; ctx.lineWidth = s === port ? 2.5 : 1; ctx.stroke(); ctx.lineWidth = 1;
        }
        const x = P.X(port.lon), y = P.Y(port.lat); ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = x > P.w * 0.7 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
        const t = port.name.split(',')[0].split(' (')[0]; const tw = ctx.measureText(t).width; const tx = x + (x > P.w * 0.7 ? -10 : 10);
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(x > P.w * 0.7 ? tx - tw - 3 : tx - 3, y - 22, tw + 6, 15); ctx.fillStyle = '#1c2836'; ctx.fillText(t, tx, y - 8);
        if (H.place) { const px = P.X(H.place.lon), py = P.Y(H.place.lat); if (px > 0 && px < P.w && py > 0 && py < P.h) { ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.moveTo(px, py - 7); ctx.lineTo(px + 5, py + 4); ctx.lineTo(px - 5, py + 4); ctx.closePath(); ctx.fill(); } }
      } });
    const pick = (x, y) => { const P = map.P; let b = null, bd = 18; for (const s of ST) { if (sD.region === 'es' && s.group !== 'es') continue; const d = Math.hypot(P.X(s.lon) - x, P.Y(s.lat) - y); if (d < bd) { bd = d; b = s; } } return b; };
    cvMap.addEventListener('click', (e) => { const [x, y] = map.pos(e); const s = pick(x, y); if (s) setPort(s); });
    T4.hover(cvMap, map, (lat, lon, x, y) => { const s = pick(x, y); if (!s) return null; return `<b>${s.name}</b><br>vivas ${H.f(T4.springRange(s), 2)} m · ${ptype(s).name.toLowerCase()}`; });
    const chD = H.chart(cvD, 0.36);
    const portSel = H.h('select', { 'aria-label': 'Puerto' });
    const og1 = H.h('optgroup', { label: 'España' }), og2 = H.h('optgroup', { label: 'Mundo' });
    [...ST].sort((a, b) => a.name.localeCompare(b.name, 'es')).forEach((s) => (s.group === 'es' ? og1 : og2).append(H.h('option', { value: s.id }, s.name)));
    portSel.append(og1, og2);
    portSel.onchange = () => setPort(ST.find((s) => s.id === portSel.value));
    const dateIn = H.h('input', { type: 'date', 'aria-label': 'Fecha' });
    const segReg = H.seg([['es', 'España'], ['mundo', 'Mundo']], sD.region, (v) => { sD.region = v; map.opts.regional = v === 'es'; map.opts.grid = v === 'es' ? 5 : 30; map.setBBox(BBD[v]); });
    const segDays = H.seg([[1, '1 día'], [2, '2 días'], [7, '7 días']], sD.days, (v) => { sD.days = v; updD(); });
    const roD = { r: H.ro('Carrera en el periodo', 'hl'), vm: H.ro('Carrera media en vivas · en muertas'), F: H.ro('Tipo de marea (F)', 'bl'), z: H.ro('Nivel medio sobre el cero') };
    const tbl = H.h('div', { style: { overflowX: 'auto' } });
    const nearTxt = H.h('p', { class: 'small' });
    const updD = () => {
      const s = port, t0 = sD.day, t1 = t0 + sD.days * 864e5, pr = T4.tidePredictor(s), pts = [];
      const stepH = sD.days > 2 ? 0.25 : 0.1;
      for (let t = 0; t <= sD.days * 24; t += stepH) pts.push([t, pr(t0 + t * 3600e3) + s.msl]);
      const ext = T4.tideExtremes(pr, t0, t1, 5 * 60e3);
      const ys = pts.map((p) => p[1]), mx = Math.max(...ys), mn0 = Math.min(...ys, s.msl), mn = mn0 > 0.45 * mx ? mn0 : 0;
      const stp = mx - mn > 6 ? 2 : mx - mn > 2.5 ? 1 : mx - mn > 1 ? 0.5 : mx - mn > 0.4 ? 0.2 : 0.05;
      const yt = []; for (let v = Math.floor(mn / stp + 1e-9) * stp; v <= mx + stp * 0.999; v += stp) yt.push({ v, label: H.f(v, stp < 0.1 ? 2 : stp < 1 ? 1 : 0) });
      chD.draw({ xMin: 0, xMax: sD.days * 24, yMin: yt[0].v, yMax: yt[yt.length - 1].v, yTicks: yt, yLabel: 'Altura sobre el cero del puerto (m)', xLabel: tzName(s),
        xTicks: Array.from({ length: sD.days * (sD.days > 2 ? 1 : 4) + 1 }, (_, i) => { const v = i * (sD.days > 2 ? 24 : 6); const ms = t0 + v * 3600e3; return { v, label: v % 24 === 0 ? fDay(ms, s) : fTime(ms, s) }; }),
        series: [{ pts, color: '#1f6f8b', width: 2.2, fill: 'rgba(31,111,139,.08)' }], hlines: [{ y: s.msl, color: '#888', label: 'nivel medio' }],
        markers: sD.days <= 2 ? ext.map((e) => ({ x: (e.t - t0) / 3600e3, y: e.h + s.msl, color: e.hi ? '#1f6f8b' : '#b4531d', r: 3.5, label: fTime(e.t, s), align: (e.t - t0) / 3600e3 > sD.days * 20 ? 'right' : 'left' })) : [] });
      const his = ext.filter((e) => e.hi), los = ext.filter((e) => !e.hi);
      roD.r.v.innerHTML = his.length && los.length ? H.f(Math.max(...his.map((e) => e.h)) - Math.min(...los.map((e) => e.h)), 2) + ' <small>m</small>' : '—';
      roD.vm.v.innerHTML = H.f(T4.springRange(s), 2) + ' · ' + H.f(T4.neapRange(s), 2) + ' <small>m</small>';
      const F = T4.formF(s); roD.F.v.innerHTML = `${T4.tideType(F).name} <small>· F = ${H.f(F, 2)}</small>`;
      roD.z.v.innerHTML = H.f(s.msl, 2) + ' <small>m</small>';
      const rows = ext.filter((e) => e.t < t0 + Math.min(sD.days, 2) * 864e5);
      tbl.innerHTML = `<table class="t"><thead><tr><th>Día</th><th>Hora</th><th></th><th>Altura (m)</th><th>Diferencia con la anterior</th></tr></thead><tbody>${rows.map((e, i) => `<tr><td>${fDay(e.t, s)}</td><td>${fTime(e.t, s)}</td><td>${e.hi ? '<b style="color:#1f6f8b">pleamar</b>' : '<b style="color:#b4531d">bajamar</b>'}</td><td>${H.f(e.h + s.msl, 2)}</td><td>${i ? H.fs(e.h - rows[i - 1].h, 2) + ' m' : ''}</td></tr>`).join('')}</tbody></table>
        <p class="small">Horas en ${tzName(s)}${s.group === 'es' ? ' (con el horario de verano cuando corresponde)' : ''}. Alturas sobre el cero del puerto (la bajamar más baja posible), sin el efecto de la presión ni del viento, que pueden subir o bajar el mar varios decímetros. Datos: ${s.src === 'NOAA CO-OPS' ? 'NOAA CO-OPS' : 'TICON-4'} (${s.hc.length} componentes armónicos).</p>`;
      portSel.value = s.id;
      map.redraw();
      const np = nearestPort(H.place.lat, H.place.lon, !!H.place.es);
      nearTxt.innerHTML = `Puerto de referencia más cercano a ${H.placeLabel()}: <b>${np.s.name}</b>, a ${H.f(np.d)} km.${np.s !== port ? ' <a href="#" class="np">Ver</a>' : ''}`;
      const a = H.$('a.np', nearTxt); if (a) a.onclick = (e) => { e.preventDefault(); setPort(np.s); };
    };
    const setPort = (s) => {
      port = s;
      if (s.group !== 'es' && sD.region === 'es') { sD.region = 'mundo'; segReg.set('mundo'); map.opts.regional = false; map.opts.grid = 30; map.setBBox(BBD.mundo); }
      sD.day = dayStart(sD.day + 12 * 3600e3, s);
      const l = new Date(sD.day + tzOff(s, sD.day) * 3600e3 + 3600e3); dateIn.value = l.toISOString().slice(0, 10);
      updD(); updC(); updE();
    };
    dateIn.onchange = () => { if (!dateIn.value) return; const [y, m, d] = dateIn.value.split('-').map(Number); const off = tzOff(port, Date.UTC(y, m - 1, d, 12)); sD.day = Date.UTC(y, m - 1, d) - off * 3600e3; updD(); };
    const chips = H.h('div', { class: 'chipbar' });
    [['Spencers Island', 'Fundy (Canadá)'], ['Avonmouth', 'Severn (R. Unido)'], ['Saint-Malo', 'Saint-Malo'], ['Galveston', 'Golfo de México'], ['Hon Dau', 'Vietnam (diurna)'], ['Manila', 'Manila'], ['Seattle', 'Seattle (mixta)'], ['Estocolmo', 'Báltico'], ['Valencia', 'Valencia'], ['Cádiz', 'Cádiz'], ['Bilbao', 'Bilbao']].forEach(([k, l]) => {
      const s = ST.find((x) => x.name.startsWith(k)); if (!s) return;
      const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => setPort(s); chips.append(b);
    });
    el.append(H.h('div', { class: 'card', id: 'puertos' }, H.h('h3', {}, 'La marea en puertos reales'),
      H.h('p', { class: 'sub' }, `Predicción armónica para ${ST.filter((s) => s.group === 'es').length} puertos españoles y ${ST.filter((s) => s.group !== 'es').length} del resto del mundo, con las constantes medidas por sus mareógrafos. El tamaño del círculo indica la carrera en mareas vivas; el color, el tipo de marea. Pulsa un puerto en el mapa o elígelo en la lista.`),
      H.h('div', { class: 'grid2' }, H.h('div', {}, segReg, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvMap),
        H.h('div', { class: 'row small', style: { gap: '12px', marginTop: '6px' } }, ...[0.1, 1, 2, 5].map((F) => { const t = T4.tideType(F); return H.html(`<span style="flex:none"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${t.col};margin-right:4px"></span>${t.name}</span>`); })), nearTxt),
        H.h('div', {}, H.h('div', { class: 'row' }, portSel, dateIn), H.h('div', { style: { margin: '8px 0' } }, segDays), H.h('div', { class: 'readouts' }, roD.r, roD.vm, roD.F, roD.z), H.h('p', { class: 'small', style: { marginTop: '10px' } }, 'Casos llamativos:'), chips)),
      H.h('div', { class: 'viz', style: { marginTop: '12px' } }, cvD), tbl));

    /* ================= E · suma de ondas ================= */
    const MAIN = [['M2', 'lunar semidiurna principal'], ['S2', 'solar semidiurna principal'], ['N2', 'lunar elíptica (distancia de la Luna)'], ['K2', 'declinación de Luna y Sol'], ['K1', 'diurna de declinación (Luna y Sol)'], ['O1', 'lunar diurna principal'], ['P1', 'solar diurna principal'], ['Q1', 'lunar elíptica diurna'], ['M4', 'de aguas someras (deforma la curva)'], ['MS4', 'de aguas someras']];
    const on = new Set(['M2']);
    const cvE = H.h('canvas'), chE = H.h('canvas');
    const chartE = H.chart(cvE, 0.36);
    const barsE = H.chart(chE, 0.5);
    const listE = H.h('div', { class: 'chipbar' });
    const updE = () => {
      const s = port, t0 = dayStart(now, s), full = T4.tidePredictor(s), part = T4.tidePredictor(s, [...on]), pts1 = [], pts2 = [];
      for (let t = 0; t <= 15 * 24; t += 0.25) { const ms = t0 + t * 3600e3; pts1.push([t / 24, full(ms)]); pts2.push([t / 24, part(ms)]); }
      const A = Math.max(...pts1.map((p) => Math.abs(p[1])), 0.02), st = A > 3 ? 1 : A > 1 ? 0.5 : A > 0.3 ? 0.1 : 0.05;
      const yt = []; for (let v = -Math.ceil(A / st) * st; v <= A + 1e-9; v += st) yt.push({ v, label: H.f(v, st < 0.1 ? 2 : st < 1 ? 1 : 0) });
      chartE.draw({ xMin: 0, xMax: 15, yMin: yt[0].v, yMax: yt[yt.length - 1].v, xLabel: `Días desde hoy · ${s.name}`, yLabel: 'Respecto al nivel medio (m)',
        xTicks: [0, 3, 6, 9, 12, 15].map((v) => ({ v })), yTicks: yt,
        series: [{ pts: pts1, color: 'rgba(28,40,54,.35)', width: 1 }, { pts: pts2, color: '#b4531d', width: 1.5 }] });
      listE.innerHTML = '';
      MAIN.forEach(([n, d]) => {
        const a = T4.amp(s, n); if (!a) return;
        const per = 360 / T4.speed(n);
        const b = H.h('button', { class: 'chip' + (on.has(n) ? ' sel' : ''), type: 'button', title: d }, `${n} · ${a >= 0.1 ? H.f(a, 2) + ' m' : H.f(a * 100, a < 0.01 ? 1 : 0) + ' cm'} · ${per > 20 ? H.f(per, 1) + ' h' : H.hm(per).replace(' min', '′')}`);
        b.onclick = () => { if (on.has(n)) on.delete(n); else on.add(n); updE(); }; listE.append(b);
      });
      const top = [...s.hc].filter(([n]) => T4.TIDE_CONST[n] && n !== 'SA' && n !== 'SSA').sort((a, b) => b[1] - a[1]).slice(0, 12);
      barsE.draw({ xMin: -0.5, xMax: top.length - 0.5, yMin: 0, yMax: top[0][1] * 1.1, yLabel: 'Amplitud (m)', pad: { b: 30 },
        xTicks: top.map(([n], i) => ({ v: i, label: n })), yTicks: [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: f * top[0][1], label: H.f(f * top[0][1], top[0][1] < 0.5 ? 2 : 1) })), series: [],
        after: (ctx, X, Y) => { top.forEach(([n, a], i) => { const sp = T4.speed(n); ctx.fillStyle = sp < 5 ? '#999' : sp < 20 ? '#c08a1e' : sp < 35 ? '#1f6f8b' : '#7a5aa8'; ctx.fillRect(X(i) - 9, Y(a), 18, Y(0) - Y(a)); }); } });
    };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Una marea real es una suma de ondas'),
      H.h('p', { class: 'sub' }, 'Cada movimiento de la Luna y del Sol que cambia la fuerza de marea (su paso por el meridiano, sus cambios de distancia y de declinación) produce una onda de periodo fijo, un «componente armónico». Los mareógrafos miden cuánto amplifica cada puerto cada componente (amplitud) y con qué retraso llega (fase). Sumándolos se predice la marea: activa y desactiva componentes del puerto elegido y compara con la predicción completa (en gris).'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz' }, cvE), listE),
        H.h('div', {}, H.h('div', { class: 'viz' }, chE), H.h('p', { class: 'small' }, 'Los doce componentes mayores del puerto, sin los de periodo anual y semestral (SA y SSA), que recogen la variación estacional del nivel del mar por el calentamiento del agua y la presión. Colores: azul, semidiurnos (≈ 12 h); ocre, diurnos (≈ 24 h); morado, de aguas someras (≈ 6 h); gris, de largo periodo (de medio mes a un mes).')))));

    updD(); updC(); updE();
    { const l = new Date(sD.day + tzOff(port, sD.day) * 3600e3 + 3600e3); dateIn.value = l.toISOString().slice(0, 10); }
    H.onPlace(() => { setPort(nearestPort(H.place.lat, H.place.lon, !!H.place.es).s); });

    /* ================= F · tipos, corrientes y energía ================= */
    const cnt = { sd: 0, mxs: 0, mxd: 0, d: 0 }; ST.filter((s) => s.group === 'es').forEach((s) => cnt[ptype(s).k]++);
    el.append(H.h('div', { class: 'grid2 even' },
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Tipos de marea'),
        H.html(`<div><p>El tipo se mide con el número de forma <b>F = (K1 + O1) / (M2 + S2)</b>, el cociente entre las amplitudes de los componentes diurnos y semidiurnos principales: <b>semidiurna</b> si F < 0,25; <b>mixta</b>, sobre todo semidiurna, entre 0,25 y 1,5; <b>mixta</b>, sobre todo diurna, entre 1,5 y 3; <b>diurna</b> si F > 3.</p>
        <p>En los puertos españoles de la base: ${cnt.sd} semidiurnos (todo el Atlántico, el Cantábrico, Canarias y el Estrecho), ${cnt.mxs} mixtos semidiurnos y ${cnt.mxd + cnt.d} mixtos diurnos o diurnos. Estos últimos están en el golfo de Valencia y Baleares, donde la onda semidiurna casi se anula (hay un punto anfidrómico, sin marea, entre la Península y las islas): allí la marea apenas llega a unos centímetros y la dominan las ondas diurnas.</p>
        <p>La marea diurna «pura» es rara: el golfo de Tonkín (Hon Dau) y partes del golfo de México y del mar de la China. El tipo no depende de la latitud del lugar sino de cómo responde cada cuenca a las ondas diurnas y semidiurnas.</p></div>`)),
      H.h('div', { class: 'card' }, H.h('h3', {}, 'Corrientes de marea y energía'),
        H.html(`<div><p>Al subir y bajar, la marea mueve horizontalmente enormes volúmenes de agua. En mar abierto las corrientes de marea son de unos centímetros por segundo, pero en estrechos y canales que comunican una bahía con el océano superan los 30 km/h: en los rápidos de Sechelt (Skookumchuck) y Nakwakto, en la Columbia Británica, se han medido más de 16 nudos. En Saltstraumen (Noruega) pasan unos 400 millones de m³ cada seis horas por un canal de 150 m de ancho.</p>
        <p>Las mayores carreras se dan donde la cuenca resuena con la onda semidiurna: en la bahía de Fundy (Canadá) la carrera media en vivas llega a 14,5 m en Burntcoat Head, con extremos de 16,3 m; en el estuario del Severn y en Saint-Malo supera los 12 m.</p>
        <p>Esa energía se aprovecha en centrales mareomotrices como La Rance (Francia, 240 MW, 1966) y el lago Sihwa (Corea del Sur, 254 MW, 2011).</p></div>`))));

    el.append(H.fix('Mareas', [
      'La explicación del manual atribuye el abultamiento de la cara opuesta a que allí la «fuerza centrífuga» es máxima. No es así: en el giro de la Tierra alrededor del centro de masas Tierra-Luna todos sus puntos describen círculos iguales y sienten la misma aceleración. Los dos abultamientos se deben a que la atracción lunar es mayor que la media en la cara cercana y menor en la opuesta.',
      'La Luna por sí sola no produce «mareas de algunos centímetros», sino una marea de equilibrio de hasta unos 54 cm de carrera (la del Sol añade unos 25 cm). Lo que explica las mareas de varios metros es la resonancia de cada cuenca, como dice el manual.',
      'Las mayores carreras registradas son de unos 16 m (bahía de Fundy: 14,5 m en vivas medias, 16,3 m de máximo), no de 15 a 19 m.',
      'Las corrientes de marea más rápidas superan los 30 km/h (16-18 nudos en la Columbia Británica), no 18 km/h.',
      'En la fig. 4.6, las posiciones 2 y 4 son el cuarto creciente y el cuarto menguante (cuadraturas), más que «luna creciente» y «luna menguante», que son fases que duran una semana.',
      'El retraso diario de la marea es de 50 minutos solo de media: según la fase de la Luna varía entre unos 20 y más de 70 minutos (compáralo en la tabla de pleamares).',
    ]));
    el.append(H.selfCheck([
      { q: '¿Por qué hay un abultamiento de agua también en la cara de la Tierra opuesta a la Luna?', opts: ['Porque allí la fuerza centrífuga es máxima', 'Porque allí la atracción de la Luna es menor que en el centro de la Tierra, que «se aleja» del agua', 'Porque el Sol tira del agua en esa dirección', 'Porque la rotación terrestre acumula el agua'], a: 1, ex: ' La fuerza de marea es la diferencia entre la atracción en cada punto y en el centro; en la cara opuesta esa diferencia apunta hacia fuera.' },
      { q: 'Las mareas vivas se producen…', opts: ['con luna nueva y luna llena', 'solo con luna llena', 'en los cuartos creciente y menguante', 'cuando la Luna está en el apogeo'], a: 0, ex: ' En ambas sicigias los efectos de la Luna y del Sol se suman; las vivas suelen llegar uno o dos días después.' },
      { q: 'Valencia tiene una marea de pocos centímetros y de tipo mixto diurno. ¿Por qué?', opts: ['Porque está lejos del ecuador', 'Porque en el Mediterráneo no actúa la Luna', 'Porque la onda semidiurna casi se anula allí (punto anfidrómico) y quedan las diurnas, también pequeñas', 'Porque los ríos frenan la marea'], a: 2, ex: ' El tipo y la carrera dependen de cómo resuena cada cuenca; el Mediterráneo, casi cerrado, apenas recibe la marea atlántica.' },
      { q: 'Con F = (K1 + O1)/(M2 + S2) = 0,08, la marea es…', opts: ['diurna', 'mixta, sobre todo diurna', 'semidiurna', 'no se puede saber'], a: 2, ex: ' Con F < 0,25 dominan claramente los componentes semidiurnos: es el caso de todo el litoral atlántico y cantábrico.' },
      { q: '¿Cuánto levantaría el mar la Luna sola en un océano global en equilibrio?', opts: ['Unos milímetros', 'Hasta unos 36 cm (carrera de algo más de medio metro)', 'Unos 5 m', 'Unos 15 m'], a: 1, ex: ' Las carreras de varios metros se deben a la resonancia de plataformas, golfos y estuarios.' },
    ]));
    el.append(H.openQ('Busca en la tabla de pleamares de tu puerto de referencia cuánto se retrasa la pleamar de un día al siguiente durante una semana. ¿Es siempre de 50 minutos?', 'De media sí (el día lunar dura 24 h 50 min), pero el retraso varía: es menor (unos 20-40 min) cerca de las mareas vivas y mayor (más de una hora) cerca de las muertas, porque la onda solar adelanta o retrasa la pleamar respecto a la lunar.'));
  },
});
