/* ===================== 4 · HORA Y HUSOS HORARIOS ===================== */
H.tab({
  id: 'hora', nav: 'Hora y husos', title: 'Hora y husos horarios',
  init(el) {
    el.append(H.intro('Rotación · apartado 2.1.1', 'Medición del tiempo: hora solar, husos y cambio de fecha',
      'La Tierra gira 360° en un día: 15° por hora. Cada meridiano tiene su propio mediodía solar, de modo que hacia el este es más tarde y hacia el oeste más temprano. Los husos horarios uniforman la hora en franjas de unos 15° y los Estados ajustan sus límites.',
      'Manual: 2.1.1<br>Figura 1.7'));

    const now = new Date();
    const st = { date: Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()), utc: now.getUTCHours() + now.getUTCMinutes() / 60, sel: { lat: H.place.lat, lon: H.place.lon, name: H.place.name }, play: false };
    const ms = () => st.date + st.utc * 36e5;

    /* ---------- mapa mundial ---------- */
    const cv = H.h('canvas'); const P = { t: 26, b: 4 };
    let base = null, baseW = 0;
    const cs = H.autoCanvas(cv, (w) => w * 0.5 + 30, (ctx, w, h) => {
      const mh = h - P.t - P.b, X = (lo) => (lo + 180) / 360 * w, Y = (la) => P.t + (90 - la) / 180 * mh;
      if (!base || baseW !== w) {
        const N = Math.min(1440, Math.round(w)), M = Math.round(N / 2), img = ctx.createImageData(N, M);
        for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) { const c = H.surface(90 - (j + 0.5) * 180 / M, -180 + (i + 0.5) * 360 / N); const k = (j * N + i) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255; }
        base = document.createElement('canvas'); base.width = N; base.height = M; base.getContext('2d').putImageData(img, 0, 0); baseW = w;
      }
      ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(base, 0, P.t, w, mh);
      // husos teóricos
      for (let k = -12; k <= 12; k++) {
        const a = Math.max(-180, k * 15 - 7.5), b = Math.min(180, k * 15 + 7.5);
        if (k % 2 === 0) { ctx.fillStyle = 'rgba(31,111,139,.10)'; ctx.fillRect(X(a), P.t, X(b) - X(a), mh); }
        const hk = st.utc + k, lab = H.clock(hk);
        ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = k === 0 ? '#b4531d' : '#1c2836';
        ctx.fillText((k > 0 ? '+' : '') + k, X((a + b) / 2), 10);
        ctx.fillStyle = '#5a6878'; ctx.fillText(lab, X((a + b) / 2), 22);
      }
      // noche
      const sn = H.sun(ms()); const sslon = -15 * (st.utc - 12 + sn.eot / 60);
      const ns = [Math.cos(sn.decl * H.D2R) * Math.cos(sslon * H.D2R), Math.cos(sn.decl * H.D2R) * Math.sin(sslon * H.D2R), Math.sin(sn.decl * H.D2R)];
      const NW = 360, NH = 180, im = ctx.createImageData(NW, NH);
      for (let j = 0; j < NH; j++) for (let i = 0; i < NW; i++) {
        const la = (90 - (j + 0.5)) * H.D2R, lo = (-180 + i + 0.5) * H.D2R;
        const dot = Math.cos(la) * Math.cos(lo) * ns[0] + Math.cos(la) * Math.sin(lo) * ns[1] + Math.sin(la) * ns[2];
        const k = (j * NW + i) * 4; const t = H.clamp((-dot + 0.1) / 0.2, 0, 1); // crepúsculo suave hasta −6°…
        im.data[k] = 12; im.data[k + 1] = 22; im.data[k + 2] = 48; im.data[k + 3] = 150 * t;
      }
      const off = document.createElement('canvas'); off.width = NW; off.height = NH; off.getContext('2d').putImageData(im, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, P.t, w, mh);
      // meridianos de referencia
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), P.t); ctx.lineTo(X(0), h - P.b); ctx.stroke();
      ctx.strokeStyle = '#b0393a'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(180) - 1, P.t); ctx.lineTo(X(180) - 1, h - P.b); ctx.moveTo(1, P.t); ctx.lineTo(1, h - P.b); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(28,40,54,.3)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();
      // sol
      const sx = X(((sslon + 540) % 360) - 180), sy = Y(sn.decl);
      ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = '#a8741a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx, sy, 8, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,211,77,.9)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(sx, P.t); ctx.lineTo(sx, h - P.b); ctx.stroke(); ctx.setLineDash([]);
      // punto seleccionado
      const px = X(st.sel.lon), py = Y(st.sel.lat);
      ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 5.5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(st.sel.name, px + 8, py - 4); ctx.fillStyle = '#b4531d'; ctx.fillText(st.sel.name, px + 8, py - 4);
      cs.X = X; cs.Y = Y; cs.mh = mh;
    });
    cv.addEventListener('click', (e) => { const [x, y] = cs.pos(e); const lo = x / cs.w * 360 - 180, la = 90 - (y - P.t) / cs.mh * 180; if (la < -90 || la > 90) return; st.sel = { lat: la, lon: lo, name: 'Punto elegido' }; updAll(); });
    cv.style.cursor = 'crosshair';

    const dateIn = H.h('input', { type: 'date', value: new Date(st.date).toISOString().slice(0, 10) });
    dateIn.onchange = () => { const d = new Date(dateIn.value + 'T00:00:00Z'); if (!isNaN(d)) { st.date = d.getTime(); updAll(); } };
    const tS = H.slider('Hora UTC (tiempo universal)', 0, 23.95, 1 / 12, st.utc, (v) => H.clock(v) + ' UTC', (v) => { st.utc = v; updAll(); });
    const playB = H.h('button', { class: 'btn ghost sm', type: 'button' }, '▶ Animar');
    const nowB = H.h('button', { class: 'btn ghost sm', type: 'button' }, 'Ahora');
    let raf = null;
    playB.onclick = () => { st.play = !st.play; playB.textContent = st.play ? '❚❚ Pausa' : '▶ Animar'; const step = () => { if (!st.play) return; st.utc = (st.utc + 0.08) % 24; tS.set(st.utc); updAll(); raf = setTimeout(step, 60); }; step(); };
    nowB.onclick = () => { const n = new Date(); st.date = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()); st.utc = n.getUTCHours() + n.getUTCMinutes() / 60; dateIn.value = new Date(st.date).toISOString().slice(0, 10); tS.set(st.utc); updAll(); };
    const ex = [['Mi municipio', null], ['Fisterra', [42.94, -9.26]], ['Maó', [39.92, 4.23]], ['Las Palmas G. C.', [28.09, -15.45]], ['Kasgar (China)', [39.47, 75.99]], ['Tonga / Samoa', [-13.83, -171.76]]];
    const exRow = H.h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '6px' } });
    ex.forEach(([n, c]) => { const b = H.h('button', { class: 'btn ghost sm', type: 'button', style: { flex: 'none' } }, n); b.onclick = () => { st.sel = c ? { lat: c[0], lon: c[1], name: n } : { lat: H.place.lat, lon: H.place.lon, name: H.place.name }; updAll(); }; exRow.append(b); });

    const ro = { lon: H.ro('Longitud'), huso: H.ro('Huso teórico'), hh: H.ro('Hora del huso'), hm: H.ro('Hora solar media', 'hl'), ha: H.ro('Hora solar verdadera', 'hl'), alt: H.ro('Altura del Sol', 'bl') };
    const note = H.h('p', { class: 'small' });
    const dateLine = H.h('div', { class: 'info' });
    const OFFICIAL = { 'Kasgar (China)': 8, 'Tonga / Samoa': 13 };
    const updSel = () => {
      const lo = st.sel.lon, la = st.sel.lat, sn = H.sun(ms());
      const k = Math.round(lo / 15), hm = st.utc + lo / 15, ha = hm + sn.eot / 60;
      ro.lon.v.textContent = H.dms(lo, 'E', 'O', false);
      ro.huso.v.textContent = (k > 0 ? 'UTC+' : k < 0 ? 'UTC−' : 'UTC±') + Math.abs(k);
      ro.hh.v.textContent = H.clock(st.utc + k);
      ro.hm.v.textContent = H.clock(hm);
      ro.ha.v.textContent = H.clock(ha);
      // altura del Sol
      const Hang = (ha - 12) * 15 * H.D2R, p = la * H.D2R, d = sn.decl * H.D2R;
      const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(Hang)) * H.R2D;
      ro.alt.v.innerHTML = alt > 0 ? `${H.f(alt, 1)}° <small>(de día)</small>` : `${H.f(alt, 1)}° <small>(de noche)</small>`;
      let off = null;
      if (st.sel.name === H.place.name && H.place.es) off = H.officialOffset(H.place, ms());
      else if (['Fisterra', 'Maó'].includes(st.sel.name)) off = H.officialOffset({ es: true }, ms());
      else if (st.sel.name === 'Las Palmas G. C.') off = H.officialOffset({ es: true, can: true }, ms());
      else if (OFFICIAL[st.sel.name] != null) off = OFFICIAL[st.sel.name];
      note.innerHTML = off == null ? 'La hora oficial de un punto cualquiera depende de las decisiones de cada Estado; aquí se muestra la del huso teórico.'
        : `Hora oficial: <b>${H.clock(st.utc + off)}</b> (UTC${off >= 0 ? '+' : '−'}${Math.abs(off)}). Diferencia con la hora solar media: <b>${H.fs((st.utc + off) - hm, 2).replace('.', ',')} h</b> (${H.fs(Math.round(((st.utc + off) - hm) * 60))} min).`;
      // cambio de fecha
      const dW = new Date(ms() - 12 * 36e5), dE = new Date(ms() + 12 * 36e5);
      const fd = (d) => `${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getUTCDay()]} ${d.getUTCDate()} de ${H.MESES[d.getUTCMonth()]}, ${H.clock(d.getUTCHours() + d.getUTCMinutes() / 60)}`;
      dateLine.innerHTML = `<b>Cambio de fecha.</b> A ambos lados del meridiano 180° (línea roja discontinua) el reloj marca la misma hora, pero con un día de diferencia. En el huso +12: <b>${fd(dE)}</b>; en el huso −12: <b>${fd(dW)}</b>. Quien cruza la línea hacia el oeste suma un día; hacia el este, lo resta.`;
    };

    /* ---------- tu municipio ---------- */
    const clocks = H.h('div', { class: 'grid3' });
    const noonCh = H.chart(H.h('canvas'), 0.38);
    const updMine = () => {
      const p = H.place, n = Date.now(), sn = H.sun(n), off = H.officialOffset(p, n);
      const u = new Date(n).getUTCHours() + new Date(n).getUTCMinutes() / 60 + new Date(n).getUTCSeconds() / 3600;
      const hm = u + p.lon / 15, ha = hm + sn.eot / 60;
      clocks.innerHTML = `<div class="ro hl"><div class="k">Hora oficial ${off != null ? `(UTC+${off})` : '(huso teórico)'}</div><div class="clock">${H.clock(u + (off ?? Math.round(p.lon / 15)), true)}</div></div>
        <div class="ro"><div class="k">Hora solar media local</div><div class="clock">${H.clock(hm, true)}</div></div>
        <div class="ro bl"><div class="k">Hora solar verdadera</div><div class="clock">${H.clock(ha, true)}</div></div>`;
    };
    const updNoon = () => {
      const p = H.place, pts = [];
      for (let d = 1; d <= H.daysInYear(); d++) { const t = H.dateFromDoy(d).getTime(); const sn = H.sun(t); const off = H.officialOffset(p, t) ?? Math.round(p.lon / 15); pts.push([d, 12 - p.lon / 15 - sn.eot / 60 + off]); }
      const ys = pts.map((q) => q[1]); const lo = Math.floor(Math.min(...ys) * 2) / 2 - 0.25, hi = Math.ceil(Math.max(...ys) * 2) / 2 + 0.25;
      const tk = []; for (let v = Math.ceil(lo * 4) / 4; v <= hi; v += 0.25) tk.push({ v, label: H.clock(v) });
      const td = H.todayDoy(), tv = pts[td - 1][1];
      noonCh.draw({ xMin: 1, xMax: H.daysInYear(), yMin: lo, yMax: hi, xTicks: H.monthTicks(), yTicks: tk.filter((_, i) => tk.length < 10 || i % 2 === 0), yLabel: 'hora oficial', series: [{ pts, color: '#b4531d', width: 2.5 }], markers: [{ x: td, y: tv, label: `hoy: ${H.clock(tv)}` }] });
      mineTxt.innerHTML = `En <b>${H.placeLabel(p)}</b> (${H.dms(p.lon, 'E', 'O', false)}) el Sol alcanza su punto más alto hoy a las <b>${H.clock(tv)}</b> hora oficial. ${p.es ? `La longitud aporta ${H.fs(Math.round(-p.lon / 15 * 60))} min respecto al meridiano de Greenwich; el uso de UTC+${p.can ? '0' : '1'} (y el horario de verano) añade el resto. La ondulación de la curva es la <i>ecuación del tiempo</i> (±16 min), consecuencia de la órbita elíptica y de la inclinación del eje.` : ''}`;
    };
    const mineTxt = H.h('p', { class: 'small' });

    /* ---------- ejercicios ---------- */
    const exBox = H.h('div');
    const newEx = () => {
      const type = Math.random() < 0.5 ? 0 : 1;
      exBox.innerHTML = '';
      if (type === 0) {
        const L = (Math.round(Math.random() * 340) - 170), h0 = 6 + Math.floor(Math.random() * 12), m0 = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const ans = h0 + m0 / 60 + L / 15;
        const inp = H.h('input', { type: 'text', placeholder: 'hh:mm', style: { flex: '0 0 130px' } });
        const res = H.h('span');
        const chk = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar');
        chk.onclick = () => { const m = inp.value.match(/^(\d{1,2})[:.,h ]?(\d{2})$/); if (!m) { res.innerHTML = ' <span class="pill ko">Formato hh:mm</span>'; return; } const v = +m[1] + +m[2] / 60; const diff = Math.abs((((v - ((ans % 24) + 24) % 24) + 36) % 24) - 12) * 60; res.innerHTML = diff <= 1 ? ' <span class="pill ok">Correcto</span>' : ` <span class="pill ko">No: ${H.clock(ans)}</span> <span class="small">${Math.abs(L)}° ${L >= 0 ? 'E' : 'O'} ÷ 15 = ${H.f(Math.abs(L) / 15, 2)} h = ${H.hm(Math.abs(L) / 15)} ${L >= 0 ? 'más' : 'menos'}</span>`; };
        exBox.append(H.h('p', {}, `Cuando en Greenwich son las ${H.clock(h0 + m0 / 60)} (hora solar media), ¿qué hora solar media es en un lugar situado a ${Math.abs(L)}° ${L >= 0 ? 'E' : 'O'}?`), H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, inp, H.h('span', { style: { flex: '0 0 auto' } }, chk)), res);
      } else {
        const dh = (Math.floor(Math.random() * 40) + 2) * 10; // minutos
        const ans = dh / 60 * 15;
        const inp = H.h('input', { type: 'number', step: '0.25', placeholder: 'grados', style: { flex: '0 0 130px' } });
        const res = H.h('span');
        const chk = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar');
        chk.onclick = () => { const v = parseFloat(inp.value); res.innerHTML = Math.abs(v - ans) < 0.13 ? ' <span class="pill ok">Correcto</span>' : ` <span class="pill ko">No: ${H.f(ans, 2)}°</span> <span class="small">${dh} min × 15°/60 min = ${H.f(ans, 2)}°</span>`; };
        exBox.append(H.h('p', {}, `Dos lugares tienen una diferencia de hora solar de ${H.hm(dh / 60)}. ¿Qué diferencia de longitud hay entre ellos (en grados)?`), H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, inp, H.h('span', { style: { flex: '0 0 auto' } }, chk)), res);
      }
      exBox.append(H.h('p', {}, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newEx }, 'Otro ejercicio')));
    };
    newEx();

    const updAll = () => { cs.redraw(); updSel(); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El día y la noche recorren el planeta'),
      H.h('p', { class: 'sub' }, 'Husos teóricos de 15° (arriba, su desfase con UTC y la hora que marcan). La zona oscura es la noche para la fecha y la hora elegidas; el sol amarillo, el punto donde está en el cénit. Haz clic en el mapa para consultar cualquier lugar.'),
      H.h('div', { class: 'viz framed' }, cv),
      H.h('div', { class: 'grid2', style: { marginTop: '12px' } },
        H.h('div', {}, H.h('div', { class: 'row' }, H.h('div', { class: 'ctrl', style: { flex: '0 0 160px' } }, H.h('div', { class: 'lab' }, 'Fecha'), dateIn), playB, nowB), tS, exRow),
        H.h('div', {}, H.h('div', { class: 'readouts' }, ro.lon, ro.huso, ro.hh, ro.hm, ro.ha, ro.alt), note)),
      dateLine));
    updAll();

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Hora oficial y hora solar en tu municipio'),
      clocks, H.h('div', { class: 'grid2', style: { marginTop: '12px' } }, H.h('div', {}, H.h('h4', {}, 'Hora oficial del mediodía solar a lo largo del año'), H.h('div', { class: 'viz' }, noonCh.st.canvas)), H.h('div', {}, mineTxt,
        H.html('<p class="small"><b>Hora solar media</b>: la que corresponde a la longitud del lugar (4 min por grado). <b>Hora solar verdadera</b>: la que marcaría un reloj de sol; se adelanta o retrasa respecto a la media según la ecuación del tiempo.</p>')))));
    updMine(); updNoon();
    const tick = setInterval(() => { if (H.$('#tab-hora').classList.contains('active')) updMine(); }, 1000);

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Practica el cálculo horario'), H.h('p', { class: 'sub' }, '360° en 24 h: 15° por hora, 1° cada 4 minutos. Hacia el este, más tarde; hacia el oeste, más temprano.'), exBox));

    H.onPlace(() => { st.sel = { lat: H.place.lat, lon: H.place.lon, name: H.place.name }; updAll(); updMine(); updNoon(); });
    el.append(H.fix('apartado 2.1.1 (zonas horarias)', [
      'Fleming formuló su propuesta hacia <b>1876–1879</b>, no en 1870.',
      'En la Conferencia Internacional del Meridiano (Washington, 1884) participaron <b>25 países</b>. Adoptó Greenwich como meridiano origen y el día universal, pero <b>no fijó la línea de cambio de fecha</b>: es una convención y sus quiebros los deciden los Estados (Kiribati la desplazó en 1995; Samoa, en 2011).',
      'La referencia actual es el Tiempo Universal Coordinado (<b>UTC</b>), basado en relojes atómicos; GMT es su antecesor.',
      'La España peninsular está geográficamente casi entera en el <b>huso 0</b> (Galicia occidental, en el −1), pero usa <b>UTC+1</b> desde 1940 (UTC+2 en verano). Canarias usa UTC+0 (UTC+1 en verano).',
      'Hoy hay más de 24 horas oficiales: existen desfases de 30 y 45 minutos (India, Nepal) y horas de UTC−12 a <b>UTC+14</b>.',
      'El mediodía solar no cae siempre a la misma hora: la ecuación del tiempo lo adelanta o retrasa hasta unos 16 minutos a lo largo del año.',
    ]));
    el.append(H.selfCheck([
      { q: '¿Cuántos grados gira la Tierra en una hora?', opts: ['1°', '4°', '15°', '24°'], a: 2, ex: '360° / 24 h = 15° por hora; o 1° cada 4 minutos.' },
      { q: 'Si en Greenwich es mediodía solar, ¿qué hora solar es en un lugar a 45° O?', opts: ['09:00', '15:00', '11:15', '12:45'], a: 0, ex: '45° / 15° = 3 h. Hacia el oeste es más temprano: 12 − 3 = 9 h.' },
      { q: '¿Por qué en Bilbao o Madrid el Sol culmina hacia las 14:00 en verano?', opts: ['Por la refracción atmosférica', 'Porque usan UTC+2 en verano estando geográficamente en el huso 0', 'Porque España está al este de Greenwich', 'Por la ecuación del tiempo exclusivamente'], a: 1, ex: 'Con longitudes de unos 3–4° O, su mediodía solar ocurre hacia las 12:15 UTC. La hora oficial de verano (UTC+2) suma 2 h. La ecuación del tiempo solo añade o resta unos minutos.' },
      { q: 'Un avión cruza el meridiano 180° volando hacia el oeste. ¿Qué ocurre con la fecha?', opts: ['Se resta un día', 'Se suma un día', 'No cambia', 'Cambia solo la hora'], a: 1, ex: 'Hacia el oeste se avanza un día en el calendario (por ejemplo, de lunes a martes). Hacia el este, se repite un día.' },
    ]));
  },
});
