/* ===================== A · PROPIEDADES DEL AIRE ===================== */
H.tab({
  id: 'aire', nav: 'Propiedades del aire', title: 'Propiedades del aire',
  init(el) {
    el.append(H.intro('La atmósfera · apartado 3', 'Propiedades del aire: humedad, presión, calor y densidad',
      'La cantidad máxima de vapor de agua que admite el aire depende de su temperatura. Cuando una masa de aire se enfría sin ganar ni perder vapor, su humedad relativa sube hasta saturarse en el punto de rocío; si sigue enfriándose, el exceso condensa. Este mecanismo, junto con el distinto calor específico del agua y del aire, está detrás de buena parte del tema.',
      'Manual: 3<br>Fig. 2.3; recuadros «Medida»'));

    /* ---------- A · laboratorio del aire húmedo ---------- */
    const s = { t: 20, rho: 12, pts: [] };
    const TMIN = -40, TMAX = 40, RMAX = 52;
    const cv = H.h('canvas');
    const P = { l: 50, r: 14, t: 14, b: 38 };
    const cs = H.autoCanvas(cv, (w) => Math.min(w * 0.72, 470), (ctx, w, h) => {
      const X = (t) => P.l + (t - TMIN) / (TMAX - TMIN) * (w - P.l - P.r), Y = (r) => h - P.b - r / RMAX * (h - P.t - P.b);
      cs.X = X; cs.Y = Y;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      // zona de sobresaturación
      ctx.beginPath(); ctx.moveTo(X(TMIN), Y(T2.rhoSat(TMIN)));
      for (let t = TMIN; t <= TMAX; t += 0.5) ctx.lineTo(X(t), Y(Math.min(RMAX, T2.rhoSat(t))));
      ctx.lineTo(X(TMAX), Y(RMAX)); ctx.lineTo(X(TMIN), Y(RMAX)); ctx.closePath(); ctx.fillStyle = 'rgba(31,111,139,.07)'; ctx.fill();
      // rejilla
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.strokeStyle = 'rgba(28,40,54,.08)';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let r = 0; r <= RMAX; r += 10) { ctx.beginPath(); ctx.moveTo(P.l, Y(r)); ctx.lineTo(w - P.r, Y(r)); ctx.stroke(); ctx.fillText(r, P.l - 6, Y(r)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let t = TMIN; t <= TMAX; t += 10) { ctx.beginPath(); ctx.moveTo(X(t), P.t); ctx.lineTo(X(t), h - P.b); ctx.stroke(); ctx.fillText(t + ' °C', X(t), h - P.b + 5); }
      ctx.save(); ctx.translate(13, (P.t + h - P.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText('Vapor de agua (g/m³)', 0, 0); ctx.restore();
      ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, h - P.b); ctx.lineTo(w - P.r, h - P.b); ctx.stroke();
      // curvas de humedad relativa
      for (const hr of [25, 50, 75]) { ctx.strokeStyle = 'rgba(31,111,139,.35)'; ctx.setLineDash([3, 3]); ctx.beginPath(); let f = true; for (let t = TMIN; t <= TMAX; t += 0.5) { const r = T2.rhoSat(t) * hr / 100; if (r > RMAX) break; f ? ctx.moveTo(X(t), Y(r)) : ctx.lineTo(X(t), Y(r)); f = false; } ctx.stroke(); ctx.setLineDash([]); const tt = 34; ctx.fillStyle = '#1f6f8b'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(hr + ' %', X(tt) + 2, Y(T2.rhoSat(tt) * hr / 100) - 2); }
      // curva de saturación
      ctx.strokeStyle = '#1f6f8b'; ctx.lineWidth = 2.5; ctx.beginPath(); let f = true;
      for (let t = TMIN; t <= TMAX; t += 0.25) { const r = T2.rhoSat(t); if (r > RMAX) break; f ? ctx.moveTo(X(t), Y(r)) : ctx.lineTo(X(t), Y(r)); f = false; }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#1f6f8b'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('saturación (100 %)', X(31), Y(T2.rhoSat(33)) - 2);
      // valores del manual
      ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left';
      for (const t of [-30, -20, -10, 0, 10, 20, 30]) { const r = T2.rhoSat(t); ctx.beginPath(); ctx.arc(X(t), Y(r), 2.2, 0, 7); ctx.fill(); ctx.fillText(H.f(r, r < 1 ? 2 : 1), X(t) - 22, Y(r) - 3); }
      // puntos extra (ejercicio)
      for (const p of s.pts) { ctx.fillStyle = p.c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(p.t), Y(p.r), 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = p.c; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(p.lab, X(p.t) + 10, Y(p.r)); }
      // masa de aire
      const sat = T2.rhoSat(s.t), dew = T2.dewPointRho(s.rho);
      ctx.strokeStyle = '#b4531d'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(s.t), Y(s.rho)); ctx.lineTo(X(Math.max(TMIN, dew)), Y(s.rho)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(s.t), Y(s.rho)); ctx.lineTo(X(s.t), Y(Math.min(RMAX, sat))); ctx.stroke(); ctx.setLineDash([]);
      if (dew > TMIN) { ctx.fillStyle = '#1f6f8b'; ctx.beginPath(); ctx.arc(X(dew), Y(s.rho), 4, 0, 7); ctx.fill(); ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText('rocío ' + H.f(dew, 1) + ' °C', X(dew) - 4, Y(s.rho) + 4); }
      const rr = Math.min(s.rho, sat);
      ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s.t), Y(rr), 8, 0, 7); ctx.fill(); ctx.stroke();
      if (s.rho > sat) { ctx.fillStyle = 'rgba(31,111,139,.8)'; ctx.beginPath(); ctx.arc(X(s.t), Y(s.rho), 5, 0, 7); ctx.fill(); ctx.strokeStyle = '#1f6f8b'; ctx.beginPath(); ctx.moveTo(X(s.t), Y(s.rho)); ctx.lineTo(X(s.t), Y(sat)); ctx.stroke(); }
    });
    const ro = { t: H.ro('Temperatura', ''), ha: H.ro('Humedad absoluta', ''), hs: H.ro('Máximo a esa temperatura', ''), hr: H.ro('Humedad relativa', 'hl'), dew: H.ro('Punto de rocío', 'bl'), c: H.ro('Vapor que condensa', '') };
    const tS = H.slider('Temperatura del aire', TMIN, TMAX, 0.5, s.t, (v) => T2.fT(v), (v) => { s.t = v; upd(); });
    const rS = H.slider('Vapor contenido (humedad absoluta)', 0.1, 40, 0.1, s.rho, (v) => H.f(v, 1) + ' g/m³', (v) => { s.rho = v; upd(); });
    let anim = null;
    const cool = H.h('button', { class: 'btn acc sm', type: 'button' }, '❄ Enfriar la masa de aire');
    cool.onclick = () => { clearInterval(anim); anim = setInterval(() => { s.t = Math.round((s.t - 0.25) * 4) / 4; if (s.t <= TMIN || s.t <= T2.dewPointRho(s.rho) - 4) { clearInterval(anim); } tS.set(s.t); upd(); }, 40); };
    const presets = H.h('div', { class: 'chipbar' });
    [['Ejemplo del manual: 20 °C y 12 g/m³', 20, 12], ['Desierto: 35 °C y 5 g/m³', 35, 5], ['Ecuador: 27 °C y 22 g/m³', 27, 22], ['Invierno: −5 °C y 2,5 g/m³', -5, 2.5]].forEach(([l, t, r]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { clearInterval(anim); s.t = t; s.rho = r; tS.set(t); rS.set(r); upd(); }; presets.append(b); });
    const upd = () => {
      const sat = T2.rhoSat(s.t), hr = Math.min(100, s.rho / sat * 100), dew = T2.dewPointRho(s.rho);
      ro.t.v.textContent = T2.fT(s.t);
      ro.ha.v.innerHTML = `${H.f(s.rho, 1)} <small>g/m³</small>`;
      ro.hs.v.innerHTML = `${H.f(sat, 1)} <small>g/m³</small>`;
      ro.hr.v.innerHTML = `${H.f(hr, 1)} <small>%</small>`;
      ro.dew.v.textContent = T2.fT(dew);
      ro.c.v.innerHTML = s.rho > sat ? `${H.f(s.rho - sat, 1)} <small>g/m³ → gotitas</small>` : '0 <small>g/m³</small>';
      cs.redraw();
    };
    H.drag(cv, { down: (e) => setPt(e), move: (e) => setPt(e) });
    const setPt = (e) => { clearInterval(anim); const [x, y] = cs.pos(e); const t = TMIN + (x - P.l) / (cs.w - P.l - P.r) * (TMAX - TMIN), r = (cs.h - P.b - y) / (cs.h - P.t - P.b) * RMAX; s.t = H.clamp(Math.round(t * 2) / 2, TMIN, TMAX); s.rho = H.clamp(Math.round(r * 10) / 10, 0.1, 40); tS.set(s.t); rS.set(s.rho); upd(); };
    cv.style.cursor = 'crosshair';
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Laboratorio del aire húmedo'),
      H.h('p', { class: 'sub' }, 'La curva azul es la fig. 2.3: la masa máxima de vapor por metro cúbico a cada temperatura (sobre hielo por debajo de 0 °C). El punto naranja es una masa de aire. Desplázalo, o pulsa «Enfriar»: al cruzar la curva se satura y el exceso condensa.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, tS, rS, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', margin: '4px 0 10px' } }, H.h('span', { style: { flex: 'none' } }, cool)), presets,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.t, ro.ha, ro.hs, ro.hr, ro.dew, ro.c),
          H.h('p', { class: 'small', html: '<span class="formula">HR = H<sub>absoluta</sub> / H<sub>saturación</sub> × 100</span> &nbsp; Saturación calculada con la fórmula de Magnus (OMM).' })))));
    upd();

    /* ejercicio 1 del manual */
    const ex1 = H.h('div', { class: 'card', style: { background: 'var(--soft)' } });
    const showEx1 = H.h('button', { class: 'btn sm', type: 'button' }, 'Situar A y B en el gráfico');
    showEx1.onclick = () => { s.pts = [{ t: 10, r: 6.5, c: '#2d7a4c', lab: 'A · 10 °C, 6,5 g' }, { t: 20, r: 10, c: '#6b4fa0', lab: 'B · 20 °C, 10 g' }]; cs.redraw(); cv.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    ex1.append(H.h('h4', {}, 'Ejercicio de autoevaluación 1 del manual'),
      H.h('p', {}, '¿Qué masa de aire tiene mayor humedad relativa: A, con 6,5 g/m³ a 10 °C, o B, con 10 g/m³ a 20 °C?'),
      H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, H.h('span', { style: { flex: 'none' } }, showEx1)),
      H.openQ('Ver la solución', `A: 6,5 / ${H.f(T2.rhoSat(10), 1)} × 100 = <b>${H.f(6.5 / T2.rhoSat(10) * 100, 0)} %</b>. B: 10 / ${H.f(T2.rhoSat(20), 1)} × 100 = <b>${H.f(10 / T2.rhoSat(20) * 100, 0)} %</b>. Tiene mayor humedad relativa <b>A</b>, aunque contiene menos vapor: lo que cuenta es lo cerca que está de la saturación a su temperatura. Además, A se saturaría al enfriarse hasta ${H.f(T2.dewPointRho(6.5), 1)} °C y B hasta ${H.f(T2.dewPointRho(10), 1)} °C.`));
    el.append(ex1);

    /* ---------- B · unidades ---------- */
    const conv = H.h('div', { class: 'grid2 even' });
    const mkConv = (title, units, toBase, fromBase, init, note) => {
      const box = H.h('div', {}, H.h('h4', {}, title));
      const inputs = units.map(([u, d]) => { const i = H.h('input', { type: 'number', step: 'any' }); i.dataset.d = d; box.append(H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, u), i)); return i; });
      const setAll = (base, except) => units.forEach(([u], k) => { if (k !== except) inputs[k].value = +fromBase[k](base).toFixed(+inputs[k].dataset.d); });
      inputs.forEach((i, k) => i.addEventListener('input', () => { const v = parseFloat(i.value); if (isFinite(v)) setAll(toBase[k](v), k); }));
      setAll(init, -1); if (note) box.append(H.h('p', { class: 'small', html: note }));
      return box;
    };
    conv.append(
      mkConv('Temperatura', [['Celsius (°C)', 2], ['Fahrenheit (°F)', 2], ['Kelvin (K)', 2]],
        [(c) => c, (f) => (f - 32) * 5 / 9, (k) => k - 273.15], [(c) => c, (c) => c * 9 / 5 + 32, (c) => c + 273.15], 20,
        '<span class="formula">C/100 = (F − 32)/180</span> &nbsp; <span class="formula">T = C + 273,15</span>. El kelvin se escribe K, sin grado.'),
      mkConv('Presión', [['Hectopascal = milibar (hPa = mb)', 2], ['Milímetros de mercurio (mmHg)', 1], ['Atmósferas (atm)', 4], ['Pascales (Pa)', 0]],
        [(h) => h, (m) => m * 1.333224, (a) => a * 1013.25, (p) => p / 100], [(h) => h, (h) => h / 1.333224, (h) => h / 1013.25, (h) => h * 100], 1013.25,
        'Presión normal a nivel del mar: <b>1.013,25 hPa</b> = 760 mmHg = 1 atm.'));
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Medida de los elementos climáticos: conversores'), H.h('p', { class: 'sub' }, 'Escribe en cualquier casilla; las demás se actualizan.'), conv));

    /* ---------- C · calor específico ---------- */
    const MAT = [['Agua', 4.18, 1000, '#1f6f8b'], ['Hielo', 2.09, 917, '#8cc8d6'], ['Suelo húmedo', 1.48, 1700, '#7a5a3a'], ['Suelo seco / arena', 0.8, 1600, '#c8a15a'], ['Granito', 0.79, 2700, '#8a8a8a'], ['Aire', 1.005, 1.2, '#d9b48f']];
    const ce = { mode: 'masa', E: 100 };
    const ceBox = H.h('div');
    const drawCe = () => {
      const res = MAT.map(([n, c, rho, col]) => { const cap = ce.mode === 'masa' ? c : c * rho; const dT = ce.E / cap; return { n, cap, dT, col }; });
      const max = Math.max(...res.map((r) => Math.min(r.dT, 1e9)));
      const lim = ce.mode === 'masa' ? 130 : 1;
      ceBox.innerHTML = `<table class="t flowtable"><thead><tr><th>Material</th><th>${ce.mode === 'masa' ? 'Calor específico (J/g·°C)' : 'Capacidad calorífica (kJ/m³·°C)'}</th><th>Subida de temperatura</th><th style="width:40%"></th></tr></thead><tbody>${res.map((r) => `<tr><td><b>${r.n}</b></td><td class="n">${H.f(r.cap, ce.mode === 'masa' ? 2 : 1)}</td><td class="n">${r.dT > 999 ? '&gt; 999' : H.f(r.dT, r.dT < 1 ? 3 : 1)} °C</td><td><div style="background:var(--soft);border-radius:3px;height:12px"><div style="width:${Math.min(100, r.dT / lim * 100)}%;height:100%;border-radius:3px;background:${r.col}"></div></div></td></tr>`).join('')}</tbody></table>`;
      ratio.innerHTML = ce.mode === 'masa' ? `Por unidad de masa, el agua necesita <b>${H.f(4.18 / 1.005, 1)} veces</b> más calor que el aire para subir 1 °C.` : `Por unidad de volumen, el agua necesita <b>${H.f(4.18 * 1000 / (1.005 * 1.2), 0)} veces</b> más calor que el aire: un metro cúbico de agua guarda tanto calor como ≈ 3.500 m³ de aire.`;
    };
    const ratio = H.h('p', {});
    const modeSeg = H.seg([['masa', 'Por gramo'], ['vol', 'Por metro cúbico']], 'masa', (v) => { ce.mode = v; eS.set(v === 'masa' ? 100 : 1000, false); ce.E = v === 'masa' ? 100 : 1000; drawCe(); });
    const eS = H.slider('Energía aportada', 1, 1000, 1, ce.E, (v) => ce.mode === 'masa' ? `${H.f(v)} J a 1 g` : `${H.f(v)} kJ a 1 m³`, (v) => { ce.E = v; drawCe(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Calor específico: misma energía, distinto calentamiento'),
      H.h('p', { class: 'sub' }, 'Aportamos la misma cantidad de calor a materiales distintos. Cambia entre «por gramo» y «por metro cúbico»: la segunda comparación es la que importa para el clima, porque el mar almacena calor en volúmenes enormes.'),
      H.h('div', { class: 'grid2' }, ceBox, H.h('div', {}, modeSeg, H.h('div', { style: { height: '10px' } }), eS, ratio))));
    drawCe();

    /* ---------- D · densidad ---------- */
    const dn = { t1: 15, h1: 50, t2: 25, h2: 50 };
    const dBox = H.h('div', { class: 'readouts' }); const dMsg = H.h('p', {});
    const rhoAir = (t, hr, p = 1013.25) => { const e = T2.es(t) * hr / 100; const Tk = t + 273.15; return ((p - e) * 100 / (T2.Rd * Tk) + e * 100 / (T2.Rv * Tk)); };
    const drawD = () => {
      const r1 = rhoAir(dn.t1, dn.h1), r2 = rhoAir(dn.t2, dn.h2);
      dBox.innerHTML = `<div class="ro bl"><div class="k">Densidad de la masa A</div><div class="v">${H.f(r1, 3)} <small>kg/m³</small></div></div><div class="ro hl"><div class="k">Densidad de la masa B</div><div class="v">${H.f(r2, 3)} <small>kg/m³</small></div></div>`;
      const d = (r2 - r1) / r1 * 100;
      dMsg.innerHTML = Math.abs(d) < 0.05 ? 'Las dos masas tienen prácticamente la misma densidad.' : `La masa <b>${d < 0 ? 'B' : 'A'}</b> es ${H.f(Math.abs(d), 1)} % menos densa y tiende a <b>ascender</b> sobre la otra. El aire caliente y el húmedo son más ligeros: el vapor de agua (18 g/mol) pesa menos que el aire seco (29 g/mol).`;
    };
    const sl = (k, lab, min, max, fmt) => H.slider(lab, min, max, 1, dn[k], fmt, (v) => { dn[k] = v; drawD(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Densidad: ¿qué aire sube?'),
      H.h('p', { class: 'sub' }, 'Dos masas de aire a la misma presión (1.013 hPa). La densidad baja al aumentar la temperatura y también al aumentar la humedad.'),
      H.h('div', { class: 'grid2 even' }, H.h('div', {}, H.h('h4', {}, 'Masa A'), sl('t1', 'Temperatura', -20, 45, (v) => T2.fT(v, 0)), sl('h1', 'Humedad relativa', 0, 100, (v) => v + ' %'), H.h('h4', {}, 'Masa B'), sl('t2', 'Temperatura', -20, 45, (v) => T2.fT(v, 0)), sl('h2', 'Humedad relativa', 0, 100, (v) => v + ' %')),
        H.h('div', {}, dBox, dMsg, H.h('p', { class: 'small' }, 'Densidad = masa / volumen (kg/m³). No debe confundirse con el peso específico (peso/volumen, en N/m³): masa y peso son magnitudes distintas.')))));
    drawD();

    el.append(H.fix('apartado 3 y recuadros «Medida»', [
      'El calor específico del agua es unas <b>4 veces</b> el del aire por unidad de masa (4,18 frente a 1,005 J/g·°C), no 5. Por unidad de volumen la diferencia es de unas <b>3.500 veces</b>.',
      'La densidad (masa/volumen) no equivale al peso específico (peso/volumen): «20 g de masa pesan 20 g» confunde masa y peso.',
      'La unidad actual de presión es el <b>hectopascal</b> (1 hPa = 1 mb); la presión normal a nivel del mar es 1.013,25 hPa.',
      'Celsius propuso en 1742 una escala <b>invertida</b> (100 en la fusión, 0 en la ebullición); la escala directa se impuso hacia 1743–1745 (Christin, Linneo). Fahrenheit asignó <b>96 °F</b> a la temperatura corporal.',
      'El cero absoluto es <b>−273,15 °C</b> (T = C + 273,15) y el kelvin se escribe K, sin «°».',
    ]));
    el.append(H.selfCheck([
      { q: 'Una masa de aire a 20 °C contiene 12 g/m³ de vapor. Si se enfría a 16 °C sin ganar ni perder vapor, su humedad relativa…', opts: ['Baja', 'Sube', 'No cambia', 'Se hace cero'], a: 1, ex: 'La humedad absoluta no cambia, pero la de saturación baja (de 17,3 a 13,6 g/m³): la relativa sube de ≈ 69 % a ≈ 88 %.' },
      { q: '¿Qué es el punto de rocío?', opts: ['La temperatura a la que se evapora el agua', 'La temperatura a la que el aire, al enfriarse, se satura de vapor', 'La humedad relativa máxima', 'La temperatura mínima del día'], a: 1, ex: 'Por debajo de esa temperatura el exceso de vapor condensa en gotitas (rocío, niebla o nubes).' },
      { q: '¿Por qué el mar suaviza el clima de las costas?', opts: ['Porque el agua tiene menor calor específico que la tierra', 'Porque el agua almacena mucho calor por unidad de volumen y se calienta y enfría despacio', 'Porque el agua refleja casi toda la radiación', 'Porque el aire del mar es más denso'], a: 1, ex: 'Su elevada capacidad calorífica, unida a la mezcla y a la penetración de la luz, le da una gran inercia térmica.' },
      { q: '¿Qué aire es más ligero?', opts: ['Frío y seco', 'Frío y húmedo', 'Caliente y seco', 'Caliente y húmedo'], a: 3, ex: 'Tanto el calentamiento como la humedad reducen la densidad del aire.' },
      { q: '25 °C equivalen a…', opts: ['77 °F y 298,15 K', '57 °F y 298,15 K', '77 °F y 248 K', '45 °F y 298 K'], a: 0, ex: 'F = 25 × 9/5 + 32 = 77 °F; K = 25 + 273,15 = 298,15 K.' },
    ]));
  },
});
