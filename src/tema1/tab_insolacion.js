/* ===================== 2 · ESFERICIDAD E INSOLACIÓN ===================== */
H.ramp = (stops) => (t) => {
  t = H.clamp(t, 0, 1); const n = stops.length - 1, i = Math.min(n - 1, Math.floor(t * n)), u = t * n - i;
  const a = stops[i], b = stops[i + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
};
H.heatRamp = H.ramp([[22, 32, 56], [44, 70, 120], [44, 128, 150], [120, 182, 130], [236, 208, 104], [240, 146, 58], [190, 64, 40]]);

H.tab({
  id: 'insolacion', nav: 'Esfericidad e insolación', title: 'Esfericidad e insolación',
  init(el) {
    el.append(H.intro('Planeta · apartado 1.2', 'Esfericidad e insolación',
      'Sobre una superficie curva, los rayos solares llegan con inclinación distinta en cada latitud. Un mismo haz de energía se reparte sobre más superficie y atraviesa más atmósfera cuanto más oblicuo llega. Es la causa primera de las zonas térmicas de la Tierra.',
      'Manual: 1.2 y 2.1.2<br>Figuras 1.3 y 1.10'));

    /* ---------- A · haz de rayos ---------- */
    const s = { lat: Math.round(H.place.lat), doy: H.doyOf(H.EV.jun) };
    const cv = H.h('canvas');
    const ro = { z: H.ro('Ángulo cenital (mediodía)'), h: H.ro('Altura del Sol'), e: H.ro('Energía por m² (vs. sol vertical)', 'hl'), a: H.ro('Superficie que recibe el haz', 'hl'), m: H.ro('Masa de aire atravesada', 'bl') };
    const decl = () => H.sun(H.dateFromDoy(s.doy).getTime()).decl;
    const cs = H.autoCanvas(cv, (w) => Math.min(w * 0.85, 520), (ctx, w, h) => {
      const d = decl(), cx = w * 0.5, cy = h / 2, R = Math.min(w * 0.3, h * 0.4), atm = R * 0.09;
      ctx.fillStyle = '#0f1a2a'; ctx.fillRect(0, 0, w, h);
      // posición angular en pantalla de la latitud φ (rayos llegan desde la derecha, horizontales)
      const ang = (phi) => (phi - d) * H.D2R; // 0 = punto subsolar, a la derecha
      const pt = (phi, r = R) => [cx + r * Math.cos(ang(phi)), cy - r * Math.sin(ang(phi))];
      // atmósfera
      ctx.fillStyle = 'rgba(120,170,220,.22)'; ctx.beginPath(); ctx.arc(cx, cy, R + atm, 0, 7); ctx.fill();
      // mitad noche / día
      ctx.fillStyle = '#d9c48f'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); ctx.fill();
      ctx.fillStyle = '#6b6450'; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      // eje y paralelos
      const P90 = pt(90, R * 1.18), S90 = pt(-90, R * 1.18);
      ctx.strokeStyle = '#cfd6df'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(S90[0], S90[1]); ctx.lineTo(P90[0], P90[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#cfd6df'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('PN', P90[0], P90[1] - 6); ctx.fillText('PS', S90[0], S90[1] + 14);
      const eps = H.K.eps;
      const lines = [[0, 'Ecuador', '#ffffff'], [eps, 'Tr. Cáncer', '#f0b46a'], [-eps, 'Tr. Capricornio', '#f0b46a'], [90 - eps, 'C. P. Ártico', '#9cc9e8'], [-(90 - eps), 'C. P. Antártico', '#9cc9e8']];
      for (const [phi, lab, col] of lines) {
        const a = pt(phi), b = pt(180 - phi); // cuerda del paralelo (vista de perfil)
        ctx.strokeStyle = col; ctx.globalAlpha = .55; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.globalAlpha = 1;
        const lp = pt(180 - phi, R + 6); ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(lab, lp[0] - 2, lp[1] + 4);
      }
      // rayos de fondo
      ctx.strokeStyle = 'rgba(255,214,102,.25)'; ctx.lineWidth = 1;
      for (let y = cy - R; y <= cy + R; y += 14) { const x = cx + Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)); ctx.beginPath(); ctx.moveTo(w, y); ctx.lineTo(x, y); ctx.stroke(); }
      // haz seleccionado
      const z = Math.abs(s.lat - d);
      const c = pt(s.lat); const bw = R * 0.16;
      const yTop = c[1] - bw / 2, yBot = c[1] + bw / 2;
      const hit = (y) => { const dy = y - cy; if (Math.abs(dy) > R) return null; return cx + Math.sqrt(R * R - dy * dy); };
      const hitA = (y) => { const dy = y - cy; if (Math.abs(dy) > R + atm) return null; return cx + Math.sqrt((R + atm) ** 2 - dy * dy); };
      if (z < 90) {
        const x1 = hit(yTop), x2 = hit(yBot);
        ctx.fillStyle = 'rgba(255,200,60,.55)'; ctx.beginPath(); ctx.moveTo(w, yTop);
        if (x1 != null) ctx.lineTo(x1, yTop); else ctx.lineTo(cx, yTop);
        // seguir la superficie entre ambos puntos
        const a1 = Math.atan2(-(yTop - cy), (x1 ?? cx) - cx), a2 = Math.atan2(-(yBot - cy), (x2 ?? cx) - cx);
        if (x1 != null && x2 != null) ctx.arc(cx, cy, R, -a1, -a2, false); else if (x2 != null) ctx.lineTo(x2, yBot);
        ctx.lineTo(w, yBot); ctx.closePath(); ctx.fill();
        if (x1 != null && x2 != null) { ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, -a1, -a2, false); ctx.stroke(); }
        // trayecto atmosférico del rayo central
        const xa = hitA(c[1]), xs = hit(c[1]);
        if (xa != null && xs != null) { ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, c[1]); ctx.lineTo(xs, c[1]); ctx.stroke(); }
      }
      // punto del observador
      ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c[0], c[1], 5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'left'; ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#ffd34d'; ctx.fillText('☀ Rayos solares', w - 110, 20);
      ctx.font = '11px system-ui'; ctx.fillStyle = '#cfd6df'; ctx.fillText('Corte por un meridiano a mediodía · atmósfera muy exagerada', 10, h - 10);
      // lecturas
      const hh = 90 - z;
      ro.z.v.innerHTML = z >= 90 ? '—' : `${H.f(z, 1)}°`;
      ro.h.v.innerHTML = hh <= 0 ? 'bajo el horizonte' : `${H.f(hh, 1)}°`;
      ro.e.v.innerHTML = hh <= 0 ? '0 %' : `${H.f(Math.cos(z * H.D2R) * 100)} %`;
      ro.a.v.innerHTML = hh <= 0 ? '—' : `×${H.f(1 / Math.cos(z * H.D2R), 2)}`;
      const am = hh <= 0 ? null : 1 / (Math.cos(z * H.D2R) + 0.50572 * Math.pow(96.07995 - z, -1.6364));
      ro.m.v.innerHTML = am ? `×${H.f(am, 2)}` : '—';
    });
    const latS = H.slider('Latitud del haz', -90, 90, 1, s.lat, (v) => H.dm(v).replace('−', '') + (v >= 0 ? ' N' : ' S'), (v) => { s.lat = v; cs.redraw(); });
    const dS = H.slider('Día del año', 1, H.daysInYear(), 1, s.doy, (v) => H.fdate(H.dateFromDoy(v)), (v) => { s.doy = v; cs.redraw(); });
    const quick = H.seg([['mar', 'Eq. marzo'], ['jun', 'Sol. junio'], ['sep', 'Eq. sept.'], ['dic', 'Sol. diciembre']], 'jun', (k) => { s.doy = H.doyOf(H.EV[k]); dS.set(s.doy); cs.redraw(); });
    const myLat = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Usar la latitud de mi municipio');
    myLat.onclick = () => { s.lat = Math.round(H.place.lat * 10) / 10; latS.set(s.lat); cs.redraw(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Un haz de rayos sobre una superficie curva'),
      H.h('p', { class: 'sub' }, 'El haz amarillo transporta siempre la misma energía. Mueve la latitud: cuanto más oblicuo llega, más superficie ilumina (menos energía por m²) y más atmósfera atraviesa (línea azul).'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, cv),
        H.h('div', {}, latS, myLat, H.h('div', { style: { height: '12px' } }), dS, quick,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.z, ro.h, ro.e, ro.a, ro.m),
          H.h('p', { class: 'small', html: 'Energía por m² ∝ <span class="formula">cos z</span>. Masa de aire según Kasten y Young (1989); vale 1 con el Sol en la vertical.' })))));

    /* ---------- B · mapa de insolación ---------- */
    const hm = { eps: H.K.eps, ecc: true, hover: null };
    const hcv = H.h('canvas'); const tip = H.h('div', { class: 'tooltip' });
    const NX = 365, NY = 181; let grid = null;
    const compute = () => {
      grid = new Float32Array(NX * NY);
      for (let i = 0; i < NX; i++) {
        const sn = H.sun(H.dateFromDoy(i + 1).getTime(), hm.eps); const R = hm.ecc ? sn.R : 1;
        for (let j = 0; j < NY; j++) grid[j * NX + i] = H.toaInsolation(90 - j, sn.decl, R);
      }
    };
    const P = { l: 46, r: 12, t: 10, b: 30 };
    const hs = H.autoCanvas(hcv, (w) => Math.min(w * 0.5, 420), (ctx, w, h) => {
      if (!grid) compute();
      const iw = w - P.l - P.r, ih = h - P.t - P.b;
      const img = ctx.createImageData(NX, NY);
      for (let k = 0; k < NX * NY; k++) { const c = H.heatRamp(grid[k] / 560); img.data[k * 4] = c[0]; img.data[k * 4 + 1] = c[1]; img.data[k * 4 + 2] = c[2]; img.data[k * 4 + 3] = 255; }
      const off = document.createElement('canvas'); off.width = NX; off.height = NY; off.getContext('2d').putImageData(img, 0, 0);
      ctx.clearRect(0, 0, w, h); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, P.l, P.t, iw, ih);
      const X = (doy) => P.l + (doy - 1) / NX * iw, Y = (lat) => P.t + (90 - lat) / 180 * ih;
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (const la of [90, 60, 30, 0, -30, -60, -90]) { ctx.fillText(la === 0 ? '0°' : Math.abs(la) + '°' + (la > 0 ? 'N' : 'S'), P.l - 5, Y(la)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      H.monthTicks().forEach((t) => ctx.fillText(t.label, X(t.v), h - P.b + 6));
      // trópicos y círculos polares con la oblicuidad elegida
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      for (const la of [hm.eps, -hm.eps]) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(P.l, Y(la)); ctx.lineTo(w - P.r, Y(la)); ctx.stroke(); }
      for (const la of [90 - hm.eps, -(90 - hm.eps)]) { ctx.strokeStyle = 'rgba(180,220,255,.6)'; ctx.beginPath(); ctx.moveTo(P.l, Y(la)); ctx.lineTo(w - P.r, Y(la)); ctx.stroke(); }
      ctx.setLineDash([]);
      // latitud del municipio
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.l, Y(H.place.lat)); ctx.lineTo(w - P.r, Y(H.place.lat)); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.font = 'bold 11px system-ui'; ctx.fillText(H.place.name, P.l + 4, Y(H.place.lat) - 2);
      // línea del punto subsolar (declinación)
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < NX; i++) { const dd = H.sun(H.dateFromDoy(i + 1).getTime(), hm.eps).decl; i ? ctx.lineTo(X(i + 1), Y(dd)) : ctx.moveTo(X(i + 1), Y(dd)); } ctx.stroke();
      if (hm.hover) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(X(hm.hover[0]) - 3, Y(hm.hover[1]) - 3, 6, 6); }
      ctx.strokeStyle = '#1c2836'; ctx.strokeRect(P.l, P.t, iw, ih);
    });
    hcv.addEventListener('mousemove', (e) => {
      const [x, y] = hs.pos(e); const iw = hs.w - P.l - P.r, ih = hs.h - P.t - P.b;
      const doy = Math.round((x - P.l) / iw * NX + 1), lat = Math.round(90 - (y - P.t) / ih * 180);
      if (doy < 1 || doy > NX || lat < -90 || lat > 90) { tip.style.display = 'none'; hm.hover = null; hs.redraw(); return; }
      hm.hover = [doy, lat]; hs.redraw();
      const v = grid[(90 - lat) * NX + doy - 1];
      tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px';
      tip.textContent = `${H.fdate(H.dateFromDoy(doy))} · ${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'} · ${H.f(v)} W/m²`;
    });
    hcv.addEventListener('mouseleave', () => { tip.style.display = 'none'; hm.hover = null; hs.redraw(); });
    const epsS = H.slider('Inclinación del eje', 0, 45, 0.5, hm.eps, (v) => H.f(v, 1) + '°' + (Math.abs(v - H.K.eps) < 0.3 ? ' (actual)' : ''), (v) => { hm.eps = v; compute(); hs.redraw(); upd2(); });
    const eccChk = H.h('input', { type: 'checkbox', checked: true }); eccChk.onchange = () => { hm.ecc = eccChk.checked; compute(); hs.redraw(); upd2(); };
    const legend = H.h('div', { class: 'legend' });
    const lg = H.h('canvas', { width: 220, height: 10, style: { width: '220px', height: '10px', borderRadius: '3px' } });
    { const x = lg.getContext('2d'); for (let i = 0; i < 220; i++) { const c = H.heatRamp(i / 219); x.fillStyle = `rgb(${c.map(Math.round)})`; x.fillRect(i, 0, 1, 10); } }
    legend.append(H.h('span', {}, '0'), lg, H.h('span', {}, '560 W/m² (media diaria en el techo de la atmósfera)'));

    /* ---------- C · distancia frente a inclinación ---------- */
    const cmp = H.h('div');
    const upd2 = () => {
      const lat = H.place.lat;
      const sJ = H.sun(H.EV.jun.getTime(), hm.eps), sD = H.sun(H.EV.dic.getTime(), hm.eps);
      const qJ = H.toaInsolation(lat, sJ.decl, hm.ecc ? sJ.R : 1), qD = H.toaInsolation(lat, sD.decl, hm.ecc ? sD.R : 1);
      const dist = (H.EV.afeR / H.EV.periR) ** 2;
      const ratio = qD > 0 ? qJ / qD : Infinity;
      const maxw = 100;
      const bar = (lbl, v, txt, col) => `<div style="margin:8px 0"><div class="small" style="display:flex;justify-content:space-between"><b style="color:var(--ink)">${lbl}</b><span>${txt}</span></div><div style="background:var(--soft);border-radius:4px;height:14px"><div style="width:${Math.min(maxw, v)}%;height:100%;background:${col};border-radius:4px"></div></div></div>`;
      cmp.innerHTML = `<h4>¿Qué pesa más: la distancia al Sol o la inclinación?</h4>
        ${bar('Distancia: perihelio frente a afelio', (dist - 1) * 100 / 2, `+${H.f((dist - 1) * 100, 1)} % de energía en enero`, '#1f6f8b')}
        ${bar(`Inclinación: junio frente a diciembre en ${H.place.name}`, isFinite(ratio) ? Math.min(100, (ratio - 1) * 100 / 2) : 100, isFinite(ratio) ? `junio recibe ×${H.f(ratio, 2)} (${H.f(qJ)} frente a ${H.f(qD)} W/m²)` : 'noche polar en diciembre', '#b4531d')}
        <p class="small">La variación de distancia apenas cambia un 7 % la energía recibida, y además es favorable al hemisferio norte en invierno. El contraste estacional procede de la inclinación del eje: altura del Sol y duración del día. ${hm.eps < 1 ? '<b>Con el eje sin inclinar, las estaciones casi desaparecen.</b>' : ''}</p>`;
    };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Insolación diaria a lo largo del año y de las latitudes'),
      H.h('p', { class: 'sub' }, 'Energía media diaria que llega al techo de la atmósfera, sin nubes ni absorción. La línea blanca es la latitud donde el Sol pasa por el cénit a mediodía; la naranja, tu municipio. Pasa el ratón para leer valores.'),
      H.h('div', { class: 'viz', style: { position: 'relative' } }, hcv, tip), legend,
      H.h('div', { class: 'grid2', style: { marginTop: '14px' } }, H.h('div', {}, epsS, H.h('label', { class: 'chk' }, eccChk, 'Órbita elíptica real (desmarca para órbita circular)'),
        H.h('p', { class: 'small', html: 'Observa que en el solsticio de junio el polo norte recibe más energía diaria que el Ecuador: el Sol está bajo, pero no se pone en 24 horas. Lo que no consigue es calentar el hielo, que refleja buena parte de esa energía.' })), cmp)));
    upd2();

    H.onPlace(() => { cs.redraw(); hs.redraw(); upd2(); });
    el.append(H.fix('', ['Las fechas de solsticios y equinoccios se calculan para el año en curso (no el día 22 fijo) y la oblicuidad es la actual, <b>23° 26′</b>.']));
    el.append(H.openQ('Autoevaluación del manual 3: ¿el verano se produce cuando la Tierra está más próxima al Sol y el invierno cuando está más alejada?',
      'No. La Tierra está más cerca del Sol a comienzos de enero (perihelio) y más lejos a comienzos de julio (afelio), justo al revés que las estaciones del hemisferio norte. La diferencia de distancia es pequeña (≈ 3,4 %) y supone ≈ 7 % de energía. Las estaciones se deben a la inclinación del eje: en verano el Sol está más alto (rayos menos oblicuos) y los días son más largos. Prueba en el gráfico a desactivar la órbita elíptica: casi nada cambia.'));
    el.append(H.selfCheck([
      { q: 'Un mismo haz de rayos llega con un ángulo cenital de 60°. ¿Qué superficie ilumina respecto a si llegara vertical?', opts: ['La mitad', 'La misma', 'El doble', 'El triple'], a: 2, ex: 'La superficie aumenta en 1/cos z = 1/cos 60° = 2. Por eso la energía por m² se reduce a la mitad.' },
      { q: '¿Por qué, además, los rayos oblicuos calientan menos?', opts: ['Porque viajan más despacio', 'Porque atraviesan más espesor de atmósfera, que absorbe y difunde parte de la energía', 'Porque proceden de otra parte del Sol', 'Porque la Tierra está más lejos del Sol'], a: 1, ex: 'Con el Sol a 30° de altura el rayo atraviesa casi el doble de atmósfera que con el Sol vertical (masa de aire ≈ 2).' },
      { q: '¿Cuándo está la Tierra más cerca del Sol?', opts: ['A comienzos de enero', 'En el solsticio de junio', 'En los equinoccios', 'A comienzos de julio'], a: 0, ex: 'El perihelio cae entre el 2 y el 5 de enero, en pleno invierno del hemisferio norte.' },
      { q: 'En el solsticio de junio, ¿dónde es mayor la insolación diaria en el techo de la atmósfera?', opts: ['En el Ecuador', 'En el trópico de Capricornio', 'En el polo norte', 'Es igual en todas partes'], a: 2, ex: 'En el polo norte el Sol no se pone durante 24 horas; aunque esté bajo (23,4°), la suma diaria supera a la del Ecuador. Compruébalo en el mapa de calor.' },
    ]));
  },
});
