/* ============================================================
   Tema 3 · casos reales con ERA5 horario
   VSUR: viento sur en Bilbao, 23-26 de febrero de 2026
   DANA: depresión aislada en niveles altos, 28-30 de octubre de 2024
   Formato: { grid: {nx, ny, lon0, lat0, res}, times: ['AAAA-MM-DDTHH'], f: { nombre: [rejilla codificada por hora] },
             g2: { nombre: rejilla propia (opcional) } }  · codificación en T3.dec
   ============================================================ */
(() => {
  const mkSet = (SRC) => {
    if (typeof SRC === 'undefined' || !SRC) return { has: false };
    const G = SRC.grid, cache = {};
    const S = { has: true, n: SRC.times.length, times: SRC.times, grid: G, bbox: [G.lon0, G.lon0 + G.nx * G.res, G.lat0 - G.ny * G.res, G.lat0] };
    // cada campo usa la rejilla común salvo que SRC.g2[nombre] indique otra (p. ej., más fina en un recuadro menor)
    S.field = (name, i) => { const k = name + '|' + i; if (!cache[k]) { const g = (SRC.g2 && SRC.g2[name]) || G; cache[k] = T3.grid(T3.dec(SRC.f[name][i], (SRC.sc || {})[name]), g.nx, g.ny, g.lon0, g.lat0, g.res); } return cache[k]; };
    S.date = (i) => new Date(SRC.times[i] + ':00:00Z');
    S.label = (i, offset = 1) => { const d = S.date(i), l = new Date(d.getTime() + offset * 3600e3); return `${d.getUTCDate()} de ${H.MESES[d.getUTCMonth()]}, ${String(d.getUTCHours()).padStart(2, '0')} UTC (${String(l.getUTCHours()).padStart(2, '0')} h peninsular)`; };
    return S;
  };
  T3.VS = mkSet(typeof VSUR !== 'undefined' ? VSUR : null);
  T3.DN = mkSet(typeof DANA !== 'undefined' ? DANA : null);
  if (T3.DN.has) {
    const RN = DANA.rain, rc = {};
    const rg = (b) => T3.grid(T3.dec(b, RN.sc), RN.grid.nx, RN.grid.ny, RN.grid.lon0, RN.grid.lat0, RN.grid.res);
    T3.DN.r24 = () => (rc.d = rc.d || rg(RN.r24));
    T3.DN.i6 = (i) => { const k = RN.t6.indexOf(DANA.times[i]); if (k < 0) return null; return (rc[k] = rc[k] || rg(RN.r6[k])); };
  }
  const SITES = [['Bilbao', 43.301, -2.906, 'b'], ['Burgos', 42.356, -3.620, 'r'], ['Vitoria', 42.872, -2.733, 'r'], ['Donostia', 43.307, -2.041, 't'], ['Santander', 43.427, -3.820, 'l']];

  /* mapa regional reutilizable */
  const caseMap = (S, bbox, drawFn, aspectMax = 0.8) => {
    const cv = H.h('canvas'), tip = H.h('div', { class: 'tooltip' });
    const cs = H.autoCanvas(cv, (w) => Math.min(w * T3.aspect(bbox), w * aspectMax + 200), (ctx, w, h) => { const P = T3.proj(bbox, w, h); cs.P = P; drawFn(ctx, P, w, h); });
    cs.cv = cv; cs.tip = tip; return cs;
  };
  // pos: lado de la etiqueta ('r' derecha, 'l' izquierda, 't' encima, 'b' debajo)
  const dot = (ctx, x, y, label, col = '#1c2836', pos = 'r') => {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.stroke(); if (!label) return;
    const [dx, dy, al, bl] = { r: [7, 0, 'left', 'middle'], l: [-7, 0, 'right', 'middle'], t: [0, -7, 'center', 'bottom'], b: [0, 7, 'center', 'top'] }[pos];
    ctx.font = 'bold 11px system-ui'; ctx.textAlign = al; ctx.textBaseline = bl; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(label, x + dx, y + dy); ctx.fillStyle = '#1c2836'; ctx.fillText(label, x + dx, y + dy);
  };
  const isobars = (ctx, g, P, step = 4) => { const lv = []; for (let L = 952; L <= 1056; L += step) lv.push(L); T3.contour(ctx, T3.refine(g, 2), lv, P, { color: 'rgba(28,40,54,.8)', width: 1.1, fmt: (L) => H.f(L) }); };
  /* ángulo entre el viento y las isobaras (positivo: hacia las bajas presiones) */
  const crossAngle = (pg, ug, vg, lat, lon) => {
    const e = 0.25, KM = 111.2, px = (pg.at(lat, lon + e) - pg.at(lat, lon - e)) / (2 * e * KM * Math.cos(lat * H.D2R)), py = (pg.at(lat + e, lon) - pg.at(lat - e, lon)) / (2 * e * KM), gm = Math.hypot(px, py);
    const u = ug.at(lat, lon), v = vg.at(lat, lon), sp = Math.hypot(u, v); if (gm < 0.004 || sp < 3) return null;
    const gx = -py / gm, gy = px / gm; // dirección geostrófica (bajas a la izquierda)
    return Math.atan2(-(u * px + v * py) / gm, u * gx + v * gy) * H.R2D;
  };

  /* ================= viento e isobaras (pestaña El viento) ================= */
  T3.realWindCard = (card) => {
    const S = T3.VS; if (!S.has) return;
    const bb = [-20, 6, 37, 56], st = { i: 8 };
    const cs = caseMap(S, bb, (ctx, P, w, h) => {
      const bg = T3.landRaster(P, w, h, (lat, lon) => H.mix([214, 229, 240], [236, 228, 206], H.land(lat, lon))); ctx.drawImage(bg, 0, 0, w, h);
      T3.graticule(ctx, P, 5, { labels: true }); T3.drawCoast(ctx, P, { regional: true });
      isobars(ctx, S.field('p', st.i), P, 2);
      T3.arrows(ctx, S.field('u', st.i), S.field('v', st.i), P, { step: 1.5, scale: 1.3, base: 4, maxLen: 22, color: 'rgba(31,95,168,.9)', min: 1 });
      ctx.font = 'bold 12px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(6, 6, 330, 20); ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('ERA5 · ' + S.label(st.i), 10, 10);
    });
    const ro = { sea: H.ro('Ángulo medio sobre el mar', 'bl'), land: H.ro('Ángulo medio sobre tierra', 'hl') };
    const stats = () => { const pg = S.field('p', st.i), ug = S.field('u', st.i), vg = S.field('v', st.i); let a = 0, na = 0, b = 0, nb = 0; for (let lat = bb[2] + 0.5; lat < bb[3]; lat += 0.5) for (let lon = bb[0] + 0.5; lon < bb[1]; lon += 0.5) { const an = crossAngle(pg, ug, vg, lat, lon); if (an == null || Math.abs(an) > 80) continue; const ld = H.land(lat, lon); if (ld > 0.8) { b += an; nb++; } else if (ld < 0.05) { a += an; na++; } } ro.sea.v.innerHTML = na ? `${H.f(a / na)}° <small>(${na} celdas)</small>` : '—'; ro.land.v.innerHTML = nb ? `${H.f(b / nb)}° <small>(${nb} celdas)</small>` : '—'; };
    const sl = H.slider('Hora', 0, S.n - 1, 1, st.i, (v) => S.label(v), (v) => { st.i = v; cs.redraw(); stats(); });
    card.append(H.h('p', { class: 'sub' }, 'Isobaras cada 2 hPa y viento a 10 m de ERA5 sobre la Península. Compara la dirección de las flechas con la de las isobaras: sobre el mar el viento es casi paralelo; sobre tierra las cruza hacia las bajas presiones con más ángulo.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cs.cv), H.h('div', {}, sl, H.h('div', { class: 'readouts' }, ro.sea, ro.land), H.html('<p class="small">Ángulo medio entre el viento a 10 m y la dirección de las isobaras, calculado celda a celda (positivo: el viento cruza hacia las bajas presiones). Se excluyen las celdas con viento flojo o gradiente muy débil.</p>'))));
    stats();
  };

  /* ================= foehn real (pestaña Ascenso y foehn) ================= */
  T3.vsurFoehnCard = (card) => {
    const S = T3.VS; if (!S.has) return;
    const bb = [-10, 2, 40.5, 45.5], st = { i: 9 };
    const ser = VSUR.series, t0 = new Date(ser.t0 + ':00:00Z');
    const idxS = (i) => Math.round((S.date(i) - t0) / 3600e3);
    const cs = caseMap(S, bb, (ctx, P, w, h) => {
      const tg = S.field('t', st.i);
      const bg = T3.landRaster(P, w, h, (lat, lon) => H.mix(T2.tColor(tg.at(lat, lon)), [255, 255, 255], 0.15 + 0.15 * (1 - H.land(lat, lon)))); ctx.drawImage(bg, 0, 0, w, h);
      T3.graticule(ctx, P, 2, { labels: true }); T3.drawCoast(ctx, P, { regional: true, color: 'rgba(28,40,54,.8)', width: 1.2 });
      isobars(ctx, S.field('p', st.i), P, 2);
      T3.arrows(ctx, S.field('u', st.i), S.field('v', st.i), P, { step: 0.75, scale: 1.4, base: 4, maxLen: 22, color: 'rgba(28,40,54,.85)', min: 1 });
      const k = idxS(st.i);
      for (const [n, la, lo, pos] of SITES) { const T = ser.sites[n].T[k]; dot(ctx, P.X(lo), P.Y(la), `${n} ${T3.fT(T)}`, '#1c2836', pos); }
      ctx.font = 'bold 12px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(6, 6, 330, 20); ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('ERA5 · ' + S.label(st.i), 10, 10);
    });
    const ro = { bi: H.ro('Bilbao (40 m)', 'hl'), bu: H.ro('Burgos (890 m)', 'bl'), d: H.ro('Burgos bajado hasta Bilbao'), t8: H.ro('Aire a 850 hPa sobre la meseta') };
    const upd = () => {
      const k = idxS(st.i), sb = ser.sites.Bilbao, sg = ser.sites.Burgos;
      ro.bi.v.innerHTML = `${T3.fT(sb.T[k])} <small>HR ${H.f(T3.hr(sb.T[k], sb.Td[k]))} %</small>`;
      ro.bu.v.innerHTML = `${T3.fT(sg.T[k])} <small>HR ${H.f(T3.hr(sg.T[k], sg.Td[k]))} %</small>`;
      ro.d.v.innerHTML = `${T3.fT(sg.T[k] + T3.DALR * 0.85)} <small>(+${H.f(T3.DALR * 0.85, 1)} °C por compresión)</small>`;
      const t8 = S.field('t8', st.i).at(42.4, -3.7), p0 = S.field('p', st.i).at(42.4, -3.7), z8 = 287.05 * (t8 + 273.15 + 6) / 9.80665 * Math.log(p0 / 850);
      ro.t8.v.innerHTML = `${T3.fT(t8)} <small>a ≈ ${H.f(z8)} m; bajado al nivel del mar: ${T3.fT(t8 + T3.DALR * z8 / 1000)}</small>`;
      cs.redraw();
    };
    const sl = H.slider('Hora', 0, S.n - 1, 1, st.i, (v) => S.label(v), (v) => { st.i = v; upd(); });
    card.append(H.h('p', { class: 'sub' }, 'Temperatura a 2 m (colores), isobaras cada 2 hPa y viento a 10 m de ERA5. Busca la tarde del día 24: el aire del sur desciende de la meseta hacia la costa y llega más cálido y seco.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed', style: { position: 'relative' } }, cs.cv), H.h('div', {}, sl, H.h('div', { class: 'readouts' }, ro.bi, ro.bu, ro.d, ro.t8), H.html('<p class="small">«Burgos bajado hasta Bilbao» suma 0,98 °C por cada 100 m de desnivel (unos 850 m). La última lectura hace lo mismo con el aire de 850 hPa: es la temperatura que tendría si descendiera hasta el nivel del mar sin intercambiar calor. ERA5, con celdas de unos 25 km, suaviza el máximo: el termómetro de AEMET marcó 27,1 °C.</p>'), T2.legendBar(-5, 30, 5))));
    upd();
  };

  /* ================= meteograma real (pestaña Nubes y frentes) ================= */
  T3.vsurMeteoCard = (card) => {
    if (!T3.VS.has) return;
    const ser = VSUR.series, t0 = new Date(ser.t0 + ':00:00Z'), st = { site: 'Bilbao', guess: null };
    const met = T3.meteogram(H.h('canvas'));
    const N = ser.sites.Bilbao.T.length, hrs = Array.from({ length: N }, (_, i) => i);
    // hora del frente: mayor descenso de temperatura en 3 h con giro del viento
    const front = (d) => { let best = 0, bi = 0; for (let i = 3; i < N; i++) { const dT = d.T[i - 3] - d.T[i]; if (dT > best) { best = dT; bi = i; } } return bi - 1; };
    const tmax = (d) => d.T.indexOf(Math.max(...d.T));
    const lab = (i) => { const d = new Date(t0.getTime() + i * 3600e3); return `${d.getUTCDate()} ${H.MES3[d.getUTCMonth()]} ${String((d.getUTCHours() + 1) % 24).padStart(2, '0')} h`; };
    const draw = () => {
      const d = ser.sites[st.site], fi = front(d), mi = tmax(d);
      const dir = d.u.map((u, i) => T3.windFrom(u, d.v[i])), spd = d.u.map((u, i) => Math.hypot(u, d.v[i]) * 3.6);
      const xTicks = []; for (let i = 0; i < N; i += 6) { const dd = new Date(t0.getTime() + i * 3600e3); xTicks.push({ v: i, label: dd.getUTCHours() === 0 ? `${dd.getUTCDate()} feb` : String((dd.getUTCHours() + 1) % 24).padStart(2, '0') + ' h', major: dd.getUTCHours() === 0 }); }
      const marks = [{ t: mi, label: `máxima ${T3.fT(d.T[mi])}`, color: '#b4531d', align: 'right' }]; if (st.guess != null) marks.push({ t: fi, label: 'frente frío', color: '#1f5fa8' });
      met.draw({ t: hrs, T: d.T, Td: d.Td, p: d.p, dir, spd, pr: d.r, xTicks, marks, cursor: st.guess, legend: [['#b0393a', 'temperatura'], ['#2d7a4c', 'punto de rocío', [5, 3]]] });
    };
    const q = H.h('p', { class: 'small' }, 'Pulsa en el meteograma el momento en que crees que pasa el frente frío por la estación elegida.');
    met.st.canvas.addEventListener('click', (e) => { const t = Math.round(met.tAt(e)); st.guess = H.clamp(t, 0, N - 1); const d = ser.sites[st.site], fi = front(d), ok = Math.abs(st.guess - fi) <= 3; q.innerHTML = ok ? `<span style="color:var(--ok)">✔ Correcto.</span> El frente pasa hacia el ${lab(fi)} (hora peninsular): la temperatura cae, el viento gira al oeste-noroeste y la presión, que había bajado, empieza a subir.` : `<span style="color:var(--bad)">✘ No.</span> Fíjate en el momento en que la temperatura cae bruscamente y el viento cambia de dirección: fue hacia el ${lab(fi)}.`; draw(); });
    const seg = H.seg(SITES.map(([n]) => [n, n]), st.site, (v) => { st.site = v; st.guess = null; q.textContent = 'Pulsa en el meteograma el momento en que crees que pasa el frente frío por la estación elegida.'; draw(); });
    card.append(H.h('p', { class: 'sub' }, 'Serie horaria de ERA5 en la celda de cada observatorio (hora peninsular, UTC+1). Antes del frente, el viento del sur seca y calienta la costa; después, entra aire atlántico más frío y húmedo del oeste y noroeste.'),
      seg, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, met.st.canvas), q,
      H.html('<p class="small">Datos observados por AEMET en el aeropuerto de Bilbao en febrero de 2026: máxima de 27,1 °C el día 24 (récord de invierno de la serie, desde 1948), humedad relativa mínima del 21 % y racha máxima de 90,7 km/h, con viento predominante del sur.</p>'));
    draw();
  };

  /* ================= DANA (pestaña Isobaras) ================= */
  T3.danaCard = (card) => {
    const S = T3.DN; if (!S.has) return;
    const bb = S.bbox, st = { i: 3, jet: true };
    const tw = (ctx) => { ctx.font = 'bold 11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(4, 4, 290, 18); ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; };
    const sfc = caseMap(S, bb, (ctx, P, w, h) => {
      const r6 = S.i6(st.i);
      const bg = T3.landRaster(P, w, h, (lat, lon) => { const base = H.mix([214, 229, 240], [236, 228, 206], H.land(lat, lon)); if (!r6) return base; const v = r6.at(lat, lon); return v < 1 ? base : H.mix(base, [40, 110, 200], Math.min(1, 0.25 + v / 60)); }); ctx.drawImage(bg, 0, 0, w, h);
      T3.graticule(ctx, P, 5, { labels: true }); T3.drawCoast(ctx, P, { regional: true });
      isobars(ctx, S.field('p', st.i), P, 2);
      T3.arrows(ctx, S.field('u8', st.i), S.field('v8', st.i), P, { step: 1.5, scale: 1, base: 4, maxLen: 22, color: 'rgba(28,40,54,.8)', min: 2 });
      dot(ctx, P.X(-0.55), P.Y(39.4), 'Turís');
      tw(ctx); ctx.fillText('Superficie: isobaras · viento a 850 hPa', 8, 8);
    });
    const alt = caseMap(S, bb, (ctx, P, w, h) => {
      const t5 = S.field('t5', st.i);
      const bg = T3.landRaster(P, w, h, (lat, lon) => H.mix(T3.t5Color(t5.at(lat, lon)), [255, 255, 255], 0.2)); ctx.drawImage(bg, 0, 0, w, h);
      T3.graticule(ctx, P, 5, { labels: true }); T3.drawCoast(ctx, P, { regional: true, color: 'rgba(28,40,54,.7)' });
      const lv = []; for (let L = 5340; L <= 5940; L += 40) lv.push(L);
      T3.contour(ctx, T3.refine(S.field('z5', st.i), 2), lv, P, { color: '#1c2836', width: 1.3, fmt: (L) => H.f(L) });
      if (st.jet) T3.arrows(ctx, S.field('u2', st.i), S.field('v2', st.i), P, { step: 2.5, scale: 0.45, base: 4, maxLen: 26, color: 'rgba(176,57,58,.9)', min: 15 });
      dot(ctx, P.X(-0.55), P.Y(39.4), '');
      tw(ctx); ctx.fillText('500 hPa: isohipsas (m) · temperatura · chorro', 8, 8);
    });
    const ro = { z: H.ro('Isohipsa mínima de 500 hPa', 'bl'), t: H.ro('Temperatura en el núcleo a 500 hPa'), p: H.ro('Presión mínima en superficie (región)'), r: H.ro('Precipitación del día 29 (ERA5)', 'hl') };
    const upd = () => {
      const z = S.field('z5', st.i), t = S.field('t5', st.i), p = S.field('p', st.i); let zm = 1e9, zi = 0; for (let k = 0; k < z.data.length; k++) if (z.data[k] < zm) { zm = z.data[k]; zi = k; }
      const la = z.latAt(Math.floor(zi / z.nx)), lo = z.lonAt(zi % z.nx);
      ro.z.v.innerHTML = `${H.f(zm)} <small>m, en ${H.f(Math.abs(la), 1)}° N, ${H.f(Math.abs(lo), 1)}° ${lo < 0 ? 'O' : 'E'}</small>`;
      ro.t.v.textContent = T3.fT(t.at(la, lo));
      let pm = 1e9; for (const v of p.data) pm = Math.min(pm, v); ro.p.v.innerHTML = `${H.f(pm, 1)} <small>hPa</small>`;
      const r24 = S.r24(); if (r24) { let mx = 0, ml = 0, mo = 0; for (let j = 0; j < r24.ny; j++) for (let i = 0; i < r24.nx; i++) { const v = r24.get(i, j); const L = r24.latAt(j), O = r24.lonAt(i); if (L > 38 && L < 40.5 && O > -2 && O < 0.5 && v > mx) { mx = v; ml = L; mo = O; } } ro.r.v.innerHTML = `${H.f(mx)} <small>mm como máximo en la provincia de Valencia (celda de ${H.f(r24.res, 2)}°); observado en Turís: 771,8 mm</small>`; }
      sfc.redraw(); alt.redraw();
    };
    const sl = H.slider('Hora', 0, S.n - 1, 1, st.i, (v) => S.label(v), (v) => { st.i = v; upd(); });
    card.append(sl, H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'viz framed' }, sfc.cv), H.h('div', { class: 'viz framed' }, alt.cv)),
      H.h('div', { class: 'readouts', style: { marginTop: '10px' } }, ro.z, ro.t, ro.p, ro.r),
      H.html('<p class="small">Compara los dos mapas: en superficie apenas hay una borrasca débil y el viento del este empuja aire mediterráneo hacia la costa; a 500 hPa, en cambio, hay una baja cerrada y muy fría (isohipsas bajas en el centro) desgajada de la circulación del oeste. Es el caso en que el manual dice que «no siempre existe correspondencia» entre superficie y altura. En azul, a la izquierda, la precipitación de las 6 horas anteriores (ERA5). El reanálisis, con celdas de unos 25 km, se queda muy corto frente a los valores locales observados.</p>'), H.h('div', { class: 'small' }, 'Temperatura a 500 hPa:'), T3.legend(T3.t5Color, -32, -4, [-30, -25, -20, -15, -10, -5], (v) => v + ' °C', 320));
    upd();
  };
})();
