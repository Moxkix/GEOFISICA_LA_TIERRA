/* ===================== H · ASCENSO ADIABÁTICO, ESTABILIDAD Y FOEHN ===================== */
H.tab({
  id: 'adiabatico', nav: 'Ascenso y foehn', title: 'Ascenso adiabático, estabilidad y efecto foehn',
  init(el) {
    el.append(H.intro('La humedad · apartados 3.3.1 y 3.3.2', 'El aire que asciende se enfría, se satura y forma nubes',
      'El mecanismo más eficaz para saturar el aire es hacerlo subir. Al ascender se expande y se enfría sin intercambiar calor con el entorno (enfriamiento adiabático): casi 1 °C cada 100 m mientras no está saturado. Al llegar al punto de rocío condensa, libera calor latente y a partir de ahí se enfría más despacio. Que siga subiendo o no depende de la temperatura del aire que lo rodea.',
      'Manual: 3.3.1 y 3.3.2<br>Figs. 3.16 y 3.17'));

    /* ================= A · diagrama de ascenso ================= */
    const s = { t: 20, hr: 57.8, env: 6.5, zTop: 12000, anim: null };
    const tdOf = () => T3.tdFromHR(s.t, s.hr);
    const envT = (z) => z <= 11000 ? s.t - s.env * z / 1000 : s.t - s.env * 11;
    let P = null;
    const compute = () => {
      P = T3.parcel({ t0: s.t, td0: tdOf(), zTop: s.zTop, dz: 20 });
      // nivel de libre convección (la burbuja más caliente que el entorno) y nivel de equilibrio (techo de la nube)
      let lfc = null, el2 = null; const i0 = P.lcl == null ? P.z.length : P.z.indexOf(P.lcl);
      for (let i = Math.max(1, i0); i < P.z.length; i++) { const d = P.t[i] - envT(P.z[i]); if (lfc == null && d > 0) lfc = P.z[i]; if (lfc != null && d < 0) { el2 = P.z[i]; break; } }
      P.lfc = lfc; P.el = lfc != null ? (el2 || s.zTop) : null;
    };
    const cv = H.h('canvas'), PAD = { l: 52, r: 16, t: 14, b: 38 }, TX = [-60, 40];
    const cs = H.autoCanvas(cv, (w) => Math.min(w * 0.85, 560), (ctx, w, h) => {
      const X = (t) => PAD.l + (t - TX[0]) / (TX[1] - TX[0]) * (w - PAD.l - PAD.r), Y = (z) => h - PAD.b - z / s.zTop * (h - PAD.t - PAD.b);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.font = '11px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.08)'; ctx.fillStyle = '#5a6878';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let z = 0; z <= s.zTop; z += 1000) { ctx.beginPath(); ctx.moveTo(PAD.l, Y(z)); ctx.lineTo(w - PAD.r, Y(z)); ctx.stroke(); ctx.fillText(H.f(z), PAD.l - 6, Y(z)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let t = TX[0]; t <= TX[1]; t += 10) { ctx.beginPath(); ctx.moveTo(X(t), PAD.t); ctx.lineTo(X(t), h - PAD.b); ctx.stroke(); ctx.fillText(t + ' °C', X(t), h - PAD.b + 5); }
      ctx.save(); ctx.translate(13, (PAD.t + h - PAD.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText('Altitud (m)', 0, 0); ctx.restore();
      ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t); ctx.lineTo(PAD.l, h - PAD.b); ctx.lineTo(w - PAD.r, h - PAD.b); ctx.stroke();
      // nube
      if (P.lcl != null) {
        const top = P.el != null ? P.el : Math.min(s.zTop, P.lcl + 600);
        const xm = X(P.tLcl);
        ctx.fillStyle = P.el != null ? 'rgba(150,160,175,.32)' : 'rgba(150,160,175,.2)';
        const xc = Math.max(PAD.l + 60, Math.min(w - PAD.r - 60, xm + 90)), wc = 80;
        ctx.beginPath(); ctx.moveTo(xc - wc, Y(P.lcl)); ctx.lineTo(xc + wc, Y(P.lcl));
        if (P.el != null) { ctx.quadraticCurveTo(xc + wc * 1.15, Y((P.lcl + top) / 2), xc + wc * 0.55, Y(top)); ctx.lineTo(xc + wc * 1.35, Y(top) - 2); ctx.lineTo(xc - wc * 1.35, Y(top) - 2); ctx.lineTo(xc - wc * 0.55, Y(top)); ctx.quadraticCurveTo(xc - wc * 1.15, Y((P.lcl + top) / 2), xc - wc, Y(P.lcl)); }
        else { ctx.lineTo(xc + wc, Y(top)); ctx.lineTo(xc - wc, Y(top)); }
        ctx.fill();
        ctx.fillStyle = '#5a6878'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(P.el != null ? (P.el - P.lcl > 6000 ? 'cumulonimbo' : P.el - P.lcl > 2000 ? 'cúmulo de desarrollo' : 'cúmulo') : 'nube solo si el aire es forzado a subir', xc, Y(top) - 4);
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#1f6f8b'; ctx.beginPath(); ctx.moveTo(PAD.l, Y(P.lcl)); ctx.lineTo(w - PAD.r, Y(P.lcl)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#1f6f8b'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('nivel de condensación ' + H.f(P.lcl) + ' m', PAD.l + 4, Y(P.lcl) - 2);
      }
      // adiabática seca de referencia
      ctx.strokeStyle = 'rgba(180,83,29,.3)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(s.t), Y(0)); ctx.lineTo(X(s.t - T3.DALR * s.zTop / 1000), Y(s.zTop)); ctx.stroke(); ctx.setLineDash([]);
      // entorno
      ctx.strokeStyle = '#2d7a4c'; ctx.lineWidth = 2; ctx.beginPath(); for (let z = 0; z <= s.zTop; z += 100) { const x = X(envT(z)), y = Y(z); z ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      // punto de rocío de la burbuja (hasta el nivel de condensación)
      ctx.strokeStyle = '#1f6f8b'; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i < P.z.length; i++) { if (P.lcl != null && P.z[i] > P.lcl) break; const x = X(P.td[i]), y = Y(P.z[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      // burbuja
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 2.6; ctx.beginPath(); P.z.forEach((z, i) => { const x = X(P.t[i]), y = Y(z); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1;
      // leyenda
      const lg = [['#b4531d', 'aire que asciende (burbuja)'], ['#1f6f8b', 'su punto de rocío'], ['#2d7a4c', 'aire del entorno'], ['rgba(180,83,29,.5)', 'adiabática seca (≈ 1 °C/100 m)']];
      ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      lg.forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillRect(w - PAD.r - 200, PAD.t + 10 + i * 16, 14, 3); ctx.fillStyle = '#1c2836'; ctx.fillText(t, w - PAD.r - 182, PAD.t + 11 + i * 16); });
      // animación
      if (s.anim != null) { const i = Math.min(P.z.length - 1, s.anim); ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(P.t[i]), Y(P.z[i]), 8, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1c2836'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(`${H.f(P.z[i])} m · ${T3.fT(P.t[i])}`, X(P.t[i]) + 12, Y(P.z[i])); }
    });
    const ro = { td: H.ro('Punto de rocío en superficie'), lcl: H.ro('Nivel de condensación', 'bl'), esp: H.ro('Estimación rápida (125 m × (T − Td))'), tl: H.ro('Temperatura en la base de la nube'), mr: H.ro('Gradiente húmedo en la base'), st: H.ro('Estabilidad del aire', 'hl wide'), top: H.ro('Techo de la nube convectiva'), w: H.ro('Agua condensada en el techo') };
    const stab = () => {
      const gm = P.lcl != null ? T3.malr(P.tLcl, T3.pStd(P.lcl)) : T3.malr(s.t, 1013);
      if (s.env < gm) return ['Estable', `El entorno se enfría menos que el aire saturado (${H.f(gm / 10, 2)} °C/100 m): cualquier burbuja que suba queda más fría que el entorno y tiende a bajar.`];
      if (s.env > T3.DALR) return ['Absolutamente inestable', 'El entorno se enfría más deprisa que la adiabática seca: el aire sube por sí solo, saturado o no.'];
      return ['Condicionalmente inestable', 'Estable mientras el aire no está saturado; inestable si, una vez saturado, se le obliga a subir lo suficiente.'];
    };
    const upd = () => {
      compute();
      const td = tdOf();
      ro.td.v.textContent = T3.fT(td);
      ro.lcl.v.innerHTML = P.lcl == null ? '<small>por encima del gráfico</small>' : `${H.f(P.lcl)} <small>m</small>`;
      ro.esp.v.innerHTML = `${H.f(T3.espy(s.t, td))} <small>m</small>`;
      ro.tl.v.textContent = P.lcl == null ? '—' : T3.fT(P.tLcl);
      ro.mr.v.innerHTML = P.lcl == null ? '—' : `${H.f(T3.malr(P.tLcl, T3.pStd(P.lcl)) / 10, 2)} <small>°C/100 m</small>`;
      const [sn, sx] = stab(); ro.st.v.innerHTML = `${sn}<br><small>${sx}</small>`;
      ro.top.v.innerHTML = P.el == null ? '<small>sin convección libre</small>' : `${H.f(P.el)} <small>m</small>`;
      const iTop = P.el == null ? null : P.z.findIndex((z) => z >= P.el);
      ro.w.v.innerHTML = iTop == null || iTop < 0 ? '—' : `${H.f(P.cond[iTop], 1)} <small>g/kg · ${H.f(P.cond[iTop] * T3.rho(P.t[iTop], P.p[iTop]), 1)} g/m³</small>`;
      cs.redraw();
    };
    const tS = H.slider('Temperatura en superficie', -10, 40, 0.5, s.t, (v) => T3.fT(v), (v) => { s.t = v; upd(); });
    const hS = H.slider('Humedad relativa en superficie', 5, 100, 0.5, s.hr, (v) => H.f(v, 1) + ' % · ' + H.f(T2.rhoSat(s.t) * v / 100, 1) + ' g/m³', (v) => { s.hr = v; upd(); });
    const eS = H.slider('Gradiente del aire del entorno', 3, 11, 0.1, s.env, (v) => H.f(v / 10, 2) + ' °C/100 m', (v) => { s.env = v; upd(); });
    const go = H.h('button', { class: 'btn acc sm', type: 'button' }, '▲ Elevar la burbuja');
    go.onclick = () => { s.anim = 0; const top = P.el != null ? P.z.findIndex((z) => z >= P.el) : (P.lcl != null ? P.z.findIndex((z) => z >= P.lcl + 1500) : P.z.length - 1); const end = top < 0 ? P.z.length - 1 : top; const t0 = performance.now(); const fr = (now) => { s.anim = Math.round((now - t0) / 3000 * end); cs.redraw(); if (s.anim < end) requestAnimationFrame(fr); }; requestAnimationFrame(fr); };
    const presets = H.h('div', { class: 'chipbar' });
    [['Fig. 3.16: 20 °C y 10 g/m³', 20, 57.8, 6.5], ['Tarde de tormenta: 30 °C, 55 %', 30, 55, 8], ['Anticiclón de invierno: 8 °C, 70 %', 8, 70, 4.5], ['Trópico húmedo: 28 °C, 80 %', 28, 80, 6.5]].forEach(([l, t, hr, en]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { s.t = t; s.hr = hr; s.env = en; tS.set(t); hS.set(hr); eS.set(en); s.anim = null; upd(); }; presets.append(b); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Diagrama de ascenso: del aire seco a la nube'),
      H.h('p', { class: 'sub' }, 'Como la fig. 3.16, pero con la física completa: el gradiente húmedo no es fijo, depende de la temperatura y la presión, y el punto de rocío del aire que sube también baja (unos 0,18 °C cada 100 m). Compara la burbuja con el aire del entorno: si queda más caliente, sigue subiendo por sí sola.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, tS, hS, eS, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', margin: '2px 0 10px' } }, H.h('span', { style: { flex: 'none' } }, go)), presets,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.td, ro.lcl, ro.esp, ro.tl, ro.mr, ro.top, ro.w, ro.st)))));
    upd();

    /* comparación con la fig. 3.16 */
    const m = T3.parcel({ t0: 20, td0: T3.tdFromHR(20, 10 / T2.rhoSat(20) * 100), dz: 10, zTop: 2000 });
    const i13 = m.z.findIndex((z) => z >= 1300);
    el.append(H.h('div', { class: 'card', style: { background: 'var(--soft)' } }, H.h('h4', {}, 'La fig. 3.16 con números actuales'),
      H.html(`<div style="overflow-x:auto"><table class="t"><thead><tr><th></th><th>Manual</th><th>Cálculo completo</th></tr></thead><tbody>
        <tr><td>Aire en superficie</td><td>20 °C · 10 g/m³ · 57,8 %</td><td>20 °C · 10 g/m³ · ${H.f(10 / T2.rhoSat(20) * 100, 1)} % (rocío ${T3.fT(T3.tdFromHR(20, 10 / T2.rhoSat(20) * 100))})</td></tr>
        <tr><td>Nivel de condensación</td><td class="bad">900 m, a 11 °C</td><td class="good">${H.f(m.lcl)} m, a ${T3.fT(m.tLcl)}</td></tr>
        <tr><td>Gradiente húmedo</td><td>0,5 °C/100 m</td><td>${H.f(T3.malr(m.tLcl, T3.pStd(m.lcl)) / 10, 2)} °C/100 m en la base de la nube</td></tr>
        <tr><td>A 1.300 m</td><td>9 °C · 8,5 g/m³ · condensados 1,5 g/m³</td><td>${T3.fT(m.t[i13])} · condensados ${H.f(m.cond[i13] * T3.rho(m.t[i13], m.p[i13]), 2)} g/m³</td></tr>
      </tbody></table></div>`),
      H.html('<p class="small">El manual supone que el aire conserva sus 10 g/m³ al subir y que se satura cuando su temperatura llega al punto de rocío de superficie (11 °C). En realidad el aire se expande al ascender (su vapor por metro cúbico disminuye) y su punto de rocío baja unos 0,18 °C cada 100 m, así que la condensación empieza más arriba: unos 125 m por cada grado de diferencia entre la temperatura y el punto de rocío.</p>')));

    /* ================= B · efecto foehn ================= */
    const f = { t: 18, hr: 70, H: 2000, rain: 100 };
    const foehn = () => {
      const up = T3.parcel({ t0: f.t, td0: T3.tdFromHR(f.t, f.hr), zTop: f.H, dz: 10 });
      const n = up.z.length - 1, tTop = up.t[n], condTop = up.cond[n] / 1000; // kg/kg
      let liq = condTop * (1 - f.rain / 100), t = tTop, w = T3.mixing(T3.esW(up.td[n]), up.p[n]); const down = { z: [], t: [] };
      for (let z = f.H; z >= 0; z -= 10) {
        down.z.push(z); down.t.push(t); if (z < 10) break;
        const pn = T3.pStd(z - 10);
        if (liq > 1e-7) { // descenso con gotitas: se evaporan y el aire se calienta al ritmo húmedo
          const tn = t + T3.malr(t, T3.pStd(z)) * 0.01, wsn = T3.mixing(T3.esW(tn), pn), ev = wsn - w;
          if (ev <= liq) { liq -= ev; w = wsn; t = tn; } else { w += liq; liq = 0; t += T3.DALR * 0.01; }
        } else t += T3.DALR * 0.01;
      }
      const tLee = down.t[down.t.length - 1], eLee = w * 1013.25 / (0.622 + w), hrLee = Math.min(100, eLee / T3.esW(tLee) * 100);
      return { up, tTop, tLee, hrLee, condTop, down, cloudTop: f.rain < 100 ? 'derrama' : null };
    };
    const cvF = H.h('canvas');
    const csF = H.autoCanvas(cvF, (w) => Math.min(w * 0.5, 380), (ctx, w, h) => {
      const R = foehn(), ZM = 4000, pad = 26, X = (x) => pad + x * (w - 2 * pad), Y = (z) => h - pad - z / ZM * (h - 2 * pad);
      const mtn = (x) => f.H * Math.exp(-Math.pow((x - 0.5) / 0.16, 2));
      ctx.fillStyle = '#eaf2f7'; ctx.fillRect(0, 0, w, h);
      // nube orográfica en barlovento (y sobre la cumbre si no todo el agua precipita)
      if (R.up.lcl != null && R.up.lcl < f.H) {
        const xs = 0.5 - 0.16 * Math.sqrt(Math.log(1 / 0.12)), xe = f.rain < 100 ? 0.58 : 0.5, topZ = f.H + 350;
        const upper = (x) => x <= 0.5 ? R.up.lcl + (topZ - R.up.lcl) * Math.sin(Math.PI / 2 * H.clamp((x - xs) / (0.5 - xs), 0, 1)) : topZ - (topZ - mtn(xe)) * (x - 0.5) / Math.max(1e-6, xe - 0.5);
        ctx.fillStyle = 'rgba(150,160,175,.6)'; ctx.beginPath();
        for (let x = xs; x <= xe + 1e-9; x += 0.004) ctx.lineTo(X(x), Y(Math.max(mtn(x), x <= 0.5 ? R.up.lcl : mtn(x))));
        for (let x = xe; x >= xs - 1e-9; x -= 0.004) ctx.lineTo(X(x), Y(Math.max(upper(x), mtn(x))));
        ctx.closePath(); ctx.fill();
        if (f.rain > 0) { ctx.strokeStyle = 'rgba(31,111,139,.6)'; ctx.lineWidth = 1; for (let x = xs + 0.02; x < 0.47; x += 0.018) { const z0 = R.up.lcl, z1 = mtn(x); if (z1 >= z0 - 50) continue; ctx.beginPath(); ctx.moveTo(X(x), Y(z0)); ctx.lineTo(X(x) - 4, Y(z1)); ctx.stroke(); } }
      }
      // montaña
      ctx.fillStyle = '#c9b48a'; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); for (let x = 0; x <= 1; x += 0.005) ctx.lineTo(X(x), Y(mtn(x))); ctx.lineTo(X(1), Y(0)); ctx.closePath(); ctx.fill();
      // flujo
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.beginPath(); for (let x = 0.02; x <= 0.98; x += 0.01) { const z = mtn(x) + 120; x > 0.02 ? ctx.lineTo(X(x), Y(z)) : ctx.moveTo(X(x), Y(z)); } ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(X(0.98), Y(120)); ctx.lineTo(X(0.98) - 10, Y(120) - 5); ctx.lineTo(X(0.98) - 10, Y(120) + 5); ctx.fill();
      const tag = (x, z, txt, col = '#1c2836', al = 'center') => { ctx.font = 'bold 11px system-ui'; ctx.textAlign = al; ctx.textBaseline = 'bottom'; const lines = txt.split('\n'); lines.forEach((l, i) => { const yy = Y(z) - 6 - (lines.length - 1 - i) * 13; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(l, X(x), yy); ctx.fillStyle = col; ctx.fillText(l, X(x), yy); }); };
      tag(0.05, 200, `Barlovento\n${T3.fT(f.t, 1)} · ${H.f(f.hr)} %`, '#1c2836', 'left');
      if (R.up.lcl != null && R.up.lcl < f.H) tag(0.24, R.up.lcl, `base de la nube ${H.f(R.up.lcl)} m\n${T3.fT(R.up.tLcl, 1)}`, '#1f6f8b');
      tag(0.5, f.H + 120, `cumbre ${H.f(f.H)} m · ${T3.fT(R.tTop, 1)}`);
      tag(0.95, 200, `Sotavento\n${T3.fT(R.tLee, 1)} · ${H.f(R.hrLee)} %`, '#b4531d', 'right');
      ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('viento →', 8, 8);
    });
    const fro = { d: H.ro('Calentamiento a sotavento', 'hl'), hr: H.ro('Humedad relativa a sotavento', 'bl'), p: H.ro('Agua precipitada en barlovento') };
    const updF = () => { const R = foehn(); fro.d.v.innerHTML = `${H.fs(R.tLee - f.t, 1)} <small>°C respecto a barlovento</small>`; fro.hr.v.innerHTML = `${H.f(R.hrLee)} <small>% (antes ${H.f(f.hr)} %)</small>`; fro.p.v.innerHTML = `${H.f(R.condTop * 1000 * f.rain / 100, 1)} <small>g por kg de aire</small>`; csF.redraw(); };
    const fT = H.slider('Temperatura en barlovento', -5, 35, 0.5, f.t, (v) => T3.fT(v), (v) => { f.t = v; updF(); });
    const fH = H.slider('Humedad relativa en barlovento', 20, 100, 1, f.hr, (v) => v + ' %', (v) => { f.hr = v; updF(); });
    const fM = H.slider('Altura de la montaña', 300, 3800, 50, f.H, (v) => H.f(v) + ' m', (v) => { f.H = v; updF(); });
    const fR = H.slider('Parte del agua condensada que precipita', 0, 100, 5, f.rain, (v) => v + ' %', (v) => { f.rain = v; updF(); });
    const fPre = H.h('div', { class: 'chipbar' });
    [['Clásico: 18 °C, 70 %, 2.000 m', 18, 70, 2000, 100], ['Pirineo: aire atlántico hacia Huesca', 12, 85, 2600, 80], ['Teide: alisio húmedo', 20, 85, 3700, 60], ['Sin lluvia: nube que se disipa al bajar', 18, 70, 2000, 0]].forEach(([l, t, hr, H2, r]) => { const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { f.t = t; f.hr = hr; f.H = H2; f.rain = r; fT.set(t); fH.set(hr); fM.set(H2); fR.set(r); updF(); }; fPre.append(b); });
    el.append(H.h('div', { class: 'card', id: 'foehn' }, H.h('h3', {}, 'El efecto foehn'),
      H.h('p', { class: 'sub' }, 'El aire que remonta una montaña (fig. 3.17) se enfría, condensa y descarga en barlovento. Al bajar por sotavento se calienta por compresión a casi 1 °C cada 100 m. Si ha perdido agua por precipitación, llega abajo más cálido y más seco que al empezar.'),
      H.h('div', { class: 'viz framed' }, cvF),
      H.h('div', { class: 'grid2', style: { marginTop: '12px' } }, H.h('div', {}, fT, fH, fM, fR, fPre), H.h('div', {}, H.h('div', { class: 'readouts' }, fro.d, fro.hr, fro.p),
        H.html('<p class="small">Si todo el agua condensada vuelve a evaporarse al bajar (0 %), el aire recorre el camino inverso y llega con la misma temperatura: no hay foehn. El calentamiento neto procede del calor latente que dejó en barlovento el agua que precipitó.</p>')))));
    updF();

    /* ================= C · caso real: viento sur en Bilbao ================= */
    const real = H.h('div', { class: 'card' }, H.h('h3', {}, 'Caso real: viento sur en Bilbao, 25 de febrero de 2026'));
    real.append(H.html('<p class="sub">El 25 de febrero de 2026 el aeropuerto de Bilbao llegó a <b>27,1 °C</b>, la máxima más alta de un mes de febrero desde que empezó su serie, en 1948 (la anterior era de 26,9 °C, el 27 de febrero de 2019; AEMET). Llevaba dos días soplando el viento del sur, cálido y seco, hasta que por la tarde entró el aire del noroeste.</p>'));
    if (typeof VSUR === 'undefined' || !VSUR) real.append(H.info('<b>Datos pendientes.</b> Aquí irán los mapas horarios de ERA5 (temperatura, presión y viento) y la comparación entre la meseta y la costa; se añadirán en cuanto se exporten desde Google Earth Engine.'));
    else T3.vsurFoehnCard && T3.vsurFoehnCard(real);
    real.append(H.html('<p class="small">En el Cantábrico el «viento sur» no es un foehn de libro: rara vez llueve en la vertiente sur de la cordillera. El aire, cálido y seco, procede de la meseta y de capas más altas, y al descender hasta el mar se calienta por compresión (≈ 1 °C cada 100 m). Por delante de una borrasca atlántica, el flujo del sur arrastra además aire subtropical. La secuencia completa, con el giro del viento al noroeste la tarde del día 25, está en <a href="#frentes">Nubes, frentes y borrascas</a>.</p>'));
    el.append(real);

    el.append(H.fix('Enfriamiento adiabático', [
      'El gradiente adiabático seco es de 0,98 °C/100 m. El húmedo <b>no es fijo</b> en 0,5 °C/100 m: varía de unos 0,3 °C/100 m en aire cálido y muy húmedo a casi 0,9 °C/100 m en aire frío.',
      'En la fig. 3.16 la condensación no empieza a 900 m sino hacia los <b>1.080 m</b>: el aire que sube se expande (no conserva sus g/m³) y su punto de rocío también baja. Regla práctica: unos 125 m por cada grado de diferencia entre temperatura y punto de rocío.',
      'Foehn: en sotavento el aire se calienta por compresión y por eso baja su humedad relativa. Llega más cálido y seco que en barlovento porque perdió agua al precipitar, no por el aumento de presión en sí.',
    ]));
    el.append(H.selfCheck([
      { q: 'Una masa de aire a 25 °C con el punto de rocío a 13 °C empezará a condensar al subir hacia los…', opts: ['500 m', '1.500 m', '3.000 m', '13 m'], a: 1, ex: '125 × (25 − 13) = 1.500 m.' },
      { q: 'Una vez saturado, el aire que sigue subiendo se enfría…', opts: ['Más deprisa que antes', 'Más despacio, porque la condensación libera calor latente', 'Igual', 'Deja de enfriarse'], a: 1, ex: 'El calor latente compensa parte del enfriamiento por expansión.' },
      { q: 'El aire es absolutamente inestable cuando el gradiente del entorno es…', opts: ['Menor que el húmedo', 'Entre el húmedo y el seco', 'Mayor que el seco (≈ 1 °C/100 m)', 'Nulo'], a: 2, ex: 'Entonces cualquier burbuja que suba queda más caliente que el entorno, esté o no saturada.' },
      { q: 'En el efecto foehn, el aire llega a sotavento más cálido que en barlovento porque…', opts: ['La montaña lo calienta por contacto', 'Ha perdido agua al precipitar y gana el calor latente que liberó', 'Sopla más deprisa', 'Hay más radiación solar'], a: 1, ex: 'Sube enfriándose al ritmo húmedo y baja calentándose al ritmo seco.' },
      { q: 'Las nubes de desarrollo vertical (cúmulos, cumulonimbos) indican aire…', opts: ['Estable', 'Inestable', 'Seco', 'Muy frío'], a: 1, ex: 'La burbuja sigue subiendo mientras está más caliente que el entorno; con aire estable se forman nubes estratiformes.' },
    ]));
  },
});
