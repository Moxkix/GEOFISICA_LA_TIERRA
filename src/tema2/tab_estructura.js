/* ===================== A · COMPOSICIÓN Y ESTRUCTURA VERTICAL ===================== */
H.tab({
  id: 'estructura', nav: 'Estructura vertical', title: 'Composición y estructura de la atmósfera',
  init(el) {
    el.append(H.intro('La atmósfera · apartados 1 y 2', 'Composición y estructura vertical de la atmósfera',
      'La atmósfera se divide en capas según cómo cambia la temperatura con la altura. Esos cambios dependen de la composición de cada capa: el suelo calienta la troposfera desde abajo, el ozono calienta la estratosfera al absorber la radiación ultravioleta y el oxígeno atómico calienta la termosfera. La presión, en cambio, disminuye siempre y de forma muy rápida.',
      'Manual: 1 y 2<br>Cuadro 1; figs. 2.1 y 2.2'));

    const s = { prof: 'std', z: 11, cmp: true };
    const ZMAX = 120, TMIN = -100, TMAX = 100;
    const cv = H.h('canvas');
    const P = { l: 46, r: 18, t: 12, b: 34 };
    const REFS = [[8.85, 'Cima del Everest'], [11, 'Avión de línea'], [33, 'Globo sonda'], [80, 'Estrellas fugaces (80–110 km)'], [100, 'Línea de Kármán · auroras'], [118, 'Estación Espacial: 400 km ↑']];
    const cs = H.autoCanvas(cv, (w) => Math.min(Math.max(w * 1.05, 420), 620), (ctx, w, h) => {
      const X = (t) => P.l + (t - TMIN) / (TMAX - TMIN) * (w - P.l - P.r), Y = (z) => h - P.b - z / ZMAX * (h - P.t - P.b);
      cs.Y = Y; cs.P = P;
      const tab = T2.atmTable(s.prof);
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      // capas
      const bands = [[0, tab.trop, '#e6eef3', 'TROPOSFERA'], [tab.trop, tab.strat, '#eef0e6', 'ESTRATOSFERA'], [tab.strat, tab.meso, '#f3ece4', 'MESOSFERA'], [tab.meso, ZMAX, '#f1e6ea', 'TERMOSFERA']];
      for (const [a, b, c, lab] of bands) { ctx.fillStyle = c; ctx.fillRect(P.l, Y(b), w - P.l - P.r, Y(a) - Y(b)); ctx.fillStyle = 'rgba(28,40,54,.45)'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(lab, w - P.r - 8, (Y(a) + Y(b)) / 2 + (lab === 'TROPOSFERA' ? 8 : 0)); }
      // pausas
      ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(28,40,54,.5)'; ctx.lineWidth = 1;
      for (const [z, lab] of [[tab.trop, 'tropopausa'], [tab.strat, 'estratopausa'], [tab.meso, 'mesopausa']]) { ctx.beginPath(); ctx.moveTo(P.l, Y(z)); ctx.lineTo(w - P.r, Y(z)); ctx.stroke(); ctx.fillStyle = '#5a6878'; ctx.font = 'italic 11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(`${lab} · ${H.f(z, 1)} km`, w - P.r - 8, Y(z) - 2); }
      ctx.setLineDash([]);
      // ozono (esquema)
      const zo = T2.PROFILES[s.prof].o3, ox = X(TMAX) - 4;
      ctx.beginPath(); ctx.moveTo(ox, Y(8));
      for (let z = 8; z <= 55; z += 0.5) { const v = Math.exp(-((z - zo) ** 2) / (2 * 6.5 ** 2)); ctx.lineTo(ox - v * 70, Y(z)); }
      ctx.lineTo(ox, Y(55)); ctx.closePath(); ctx.fillStyle = 'rgba(70,130,90,.28)'; ctx.fill();
      ctx.fillStyle = '#2d6a3a'; ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('ozono', ox - 74, Y(zo));
      // ionosfera
      ctx.strokeStyle = '#8a6512'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w - P.r + 6, Y(60)); ctx.lineTo(w - P.r + 6, Y(ZMAX)); ctx.stroke();
      ctx.save(); ctx.translate(w - P.r + 13, Y(90)); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#8a6512'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('IONOSFERA', 0, 0); ctx.restore();
      // ejes
      ctx.fillStyle = '#5a6878'; ctx.font = '11px system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let z = 0; z <= ZMAX; z += 10) { ctx.fillText(z + ' km', P.l - 5, Y(z)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let t = TMIN; t <= TMAX; t += 25) { ctx.strokeStyle = 'rgba(28,40,54,.08)'; ctx.beginPath(); ctx.moveTo(X(t), P.t); ctx.lineTo(X(t), h - P.b); ctx.stroke(); ctx.fillText((t > 0 ? '+' : '') + t + '°', X(t), h - P.b + 5); }
      ctx.fillText('Temperatura (°C)', (P.l + w - P.r) / 2, h - 15);
      ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, h - P.b); ctx.lineTo(w - P.r, h - P.b); ctx.stroke();
      // 0 °C
      ctx.strokeStyle = 'rgba(31,111,139,.5)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(0), P.t); ctx.lineTo(X(0), h - P.b); ctx.stroke(); ctx.setLineDash([]);
      // referencias
      ctx.font = '11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (const [z, lab] of REFS) { ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.arc(P.l + 6, Y(z), 2.5, 0, 7); ctx.fill(); ctx.fillStyle = '#5a6878'; ctx.fillText(lab, P.l + 12, Y(z)); }
      // perfil estándar de comparación
      if (s.cmp && s.prof !== 'std') { const t0 = T2.atmTable('std'); ctx.strokeStyle = 'rgba(28,40,54,.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); for (let i = 0; i < t0.z.length; i += 4) { const x = X(t0.T[i] - 273.15), y = Y(t0.z[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); }
      // perfil
      ctx.strokeStyle = '#b4531d'; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i < tab.z.length; i += 2) { const x = X(tab.T[i] - 273.15), y = Y(tab.z[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // cursor
      const a = T2.atmAt(s.prof, s.z), yc = Y(s.z), xc = X(a.T - 273.15);
      ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.l, yc); ctx.lineTo(w - P.r, yc); ctx.stroke();
      ctx.fillStyle = '#b4531d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xc, yc, 6, 0, 7); ctx.fill(); ctx.stroke();
      const lab = `${H.f(s.z, 1)} km · ${T2.fT(a.T - 273.15)}`;
      ctx.font = 'bold 12px system-ui'; const tw = ctx.measureText(lab).width + 10, lx = Math.min(xc + 10, w - P.r - tw - 4);
      ctx.fillStyle = '#1c2836'; ctx.fillRect(lx, yc - 22, tw, 18); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(lab, lx + 5, yc - 13);
    });
    const setZ = (e) => { const [, y] = cs.pos(e); s.z = H.clamp(Math.round((cs.h - P.b - y) / (cs.h - P.t - P.b) * ZMAX * 10) / 10, 0, ZMAX); zS.set(s.z); upd(); };
    H.drag(cv, { down: setZ, move: setZ }); cv.style.cursor = 'ns-resize';

    const ro = { lay: H.ro('Capa', 'hl'), t: H.ro('Temperatura', 'hl'), p: H.ro('Presión'), rho: H.ro('Densidad del aire'), m: H.ro('Masa de la atmósfera por debajo', 'bl'), g: H.ro('Gradiente vertical') };
    const zS = H.slider('Altitud', 0, ZMAX, 0.1, s.z, (v) => H.f(v, 1) + ' km', (v) => { s.z = v; upd(); });
    const profSeg = H.seg(Object.entries(T2.PROFILES).map(([k, p]) => [k, p.name.replace(' (atmósfera estándar)', '')]), s.prof, (v) => { s.prof = v; upd(); });
    const cmpChk = H.h('input', { type: 'checkbox', checked: true }); cmpChk.onchange = () => { s.cmp = cmpChk.checked; cs.redraw(); };
    const jumps = H.h('div', { class: 'chipbar' });
    const tabNow = () => T2.atmTable(s.prof);
    [['Everest', () => 8.85], ['Tropopausa', () => tabNow().trop], ['Máximo de ozono', () => T2.PROFILES[s.prof].o3], ['Estratopausa', () => tabNow().strat], ['Mesopausa', () => tabNow().meso], ['Línea de Kármán', () => 100]].forEach(([l, f]) => {
      const b = H.h('button', { class: 'chip', type: 'button' }, l); b.onclick = () => { s.z = Math.round(f() * 10) / 10; zS.set(s.z); upd(); }; jumps.append(b);
    });
    const upd = () => {
      const a = T2.atmAt(s.prof, s.z), a2 = T2.atmAt(s.prof, Math.min(ZMAX, s.z + 0.5)), a1 = T2.atmAt(s.prof, Math.max(0, s.z - 0.5));
      ro.lay.v.textContent = T2.layerName(s.prof, s.z);
      ro.t.v.innerHTML = T2.fT(a.T - 273.15) + ` <small>(${H.f(a.T, 0)} K)</small>`;
      const hPa = a.P / 100;
      ro.p.v.innerHTML = hPa >= 1 ? `${H.f(hPa, hPa < 10 ? 1 : 0)} <small>hPa</small>` : `${hPa.toExponential(1).replace('.', ',').replace('e', '·10^')} <small>hPa</small>`;
      ro.rho.v.innerHTML = `${H.f(a.rho / 1.225 * 100, a.rho / 1.225 < 0.01 ? 4 : 1)} <small>% de la del nivel del mar</small>`;
      ro.m.v.innerHTML = `${H.f(a.mass * 100, a.mass > 0.999 ? 3 : 1)} <small>%</small>`;
      const gr = -((a2.T - a1.T) / ((Math.min(ZMAX, s.z + 0.5) - Math.max(0, s.z - 0.5))));
      ro.g.v.innerHTML = Math.abs(gr) < 0.05 ? 'isoterma' : `${gr > 0 ? 'desciende' : 'aumenta'} ${H.f(Math.abs(gr), 1)} <small>°C/km</small>`;
      cs.redraw();
    };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La columna atmosférica de 0 a 120 km'),
      H.h('p', { class: 'sub' }, 'Arrastra sobre el gráfico (o usa el deslizador) para subir y bajar por la atmósfera. La curva naranja es la temperatura; la sombra verde, la concentración relativa de ozono. Cambia de perfil para ver cómo la altura de la tropopausa depende de la latitud y la estación.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' } }, 'Perfil de temperatura'), profSeg,
          H.h('label', { class: 'chk', style: { marginTop: '6px' } }, cmpChk, 'Mostrar también la atmósfera estándar (discontinua)'),
          H.h('div', { style: { height: '10px' } }), zS, jumps,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.lay, ro.t, ro.g, ro.p, ro.rho, ro.m),
          H.h('p', { class: 'small', html: 'A unos <b>5,5 km</b> queda por debajo la mitad de la masa del aire; a unos <b>10 km</b>, las tres cuartas partes; por encima de <b>20 km</b>, apenas el 5 %. Por eso casi todo el vapor de agua, las nubes y el tiempo atmosférico están en la troposfera.' }),
          H.h('p', { class: 'hint' }, 'Latitudes medias: Atmósfera Estándar de EE. UU. (1976). Trópicos y subártico: perfiles tipo AFGL (Anderson y otros, 1986), simplificados. El ozono se representa de forma esquemática.')))));
    upd();

    /* ---------- composición ---------- */
    const GASES = [
      ['Nitrógeno', 'N₂', 78.084, 'c', 'Inerte desde el punto de vista climático.'],
      ['Oxígeno', 'O₂', 20.946, 'c', 'Su fotodisociación por el UV origina el ozono.'],
      ['Argón', 'Ar', 0.934, 'c', 'El más abundante de los gases nobles.'],
      ['Dióxido de carbono', 'CO₂', 0.0425, 'v', '≈ 425 ppm en 2025 (320 ppm en 1965). Gas de efecto invernadero; aumenta por la quema de combustibles fósiles.'],
      ['Neón', 'Ne', 0.001818, 'c', '18 ppm: es el valor que el cuadro 1 atribuye al hidrógeno.'],
      ['Helio', 'He', 0.000524, 'c', ''],
      ['Metano', 'CH₄', 0.000193, 'v', '≈ 1,93–1,94 ppm. Gas de efecto invernadero.'],
      ['Kriptón', 'Kr', 0.000114, 'c', ''],
      ['Hidrógeno', 'H₂', 0.000053, 'c', '≈ 0,5 ppm.'],
      ['Óxido nitroso', 'N₂O', 0.0000338, 'v', '≈ 0,34 ppm. Gas de efecto invernadero y destructor de ozono; su principal fuente humana son los fertilizantes. No es el «anhídrido nitroso» (N₂O₃).'],
      ['Ozono', 'O₃', 0.000004, 'v', 'Muy variable: 0,01–0,1 ppm cerca del suelo; hasta ≈ 10 ppm en la estratosfera.'],
    ];
    const lg = (v) => Math.log10(v * 1e4); // de 1 ppm (0) a 100 % (6)
    let rows = GASES.map(([n, f, v, c, note]) => {
      const ppm = v * 1e4, w = Math.max(1, lg(v) / 6 * 100);
      const val = v >= 0.01 ? H.f(v, v >= 1 ? 3 : 4) + ' %' : (ppm >= 1 ? H.f(ppm, ppm >= 10 ? 1 : 2) : H.f(ppm, 3)) + ' ppm';
      return `<tr><td><b>${n}</b> <span class="small">${f}</span></td><td class="n">${val}</td><td style="width:40%"><div style="background:var(--soft);border-radius:3px;height:12px"><div style="width:${w}%;height:100%;border-radius:3px;background:${c === 'c' ? '#1f6f8b' : '#b4531d'}"></div></div></td><td class="small">${note}</td></tr>`;
    }).join('');
    el.append(H.html(`<div class="card"><h3>Composición del aire seco (por debajo de unos 80 km)</h3>
      <p class="sub">Escala logarítmica: cada sexta parte de la barra multiplica por diez la proporción. En azul, los gases de proporción constante; en naranja, los variables. El vapor de agua no se incluye porque varía entre casi 0 y ≈ 4 % del volumen.</p>
      <div style="overflow-x:auto"><table class="t flowtable"><thead><tr><th>Gas</th><th>Volumen</th><th>Escala logarítmica (1 ppm → 100 %)</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="hint">1 ppm = 0,0001 %. Valores de NOAA y OMM (2024–2025) para CO₂, CH₄ y N₂O; el resto, composición estándar del aire seco.</p></div>`));

    el.append(H.fix('apartados 1 y 2', [
      'Cuadro 1: el CO₂ representa hoy ≈ <b>0,042 %</b> (≈ 425 ppm), no 0,0325 %; el hidrógeno, ≈ <b>0,00005 %</b> (el 0,0018 % es el neón). El N₂O es el <b>óxido nitroso</b>, un gas de efecto invernadero; los contaminantes de la combustión son el NO y el NO₂.',
      'Tropopausa polar: los 6 km de la fig. 2.2 son el mínimo del invierno polar; la media anual ronda los <b>8–9 km</b>.',
      'En la estratosfera la temperatura no llega a 100 °C: en la estratopausa ronda los <b>0 °C</b>. Además, es casi isoterma (≈ −56,5 °C) hasta unos 20 km y luego sube ≈ 1 °C/km hasta 32 km y ≈ 2,8 °C/km hasta 47 km.',
      'El ozono es más abundante entre <b>20 y 25 km</b>; la estratopausa (≈ 50 km) es donde más calienta su absorción del UV por unidad de masa de aire, no donde «acaba» el ozono.',
      'La mesopausa está a unos <b>85–90 km</b>, con ≈ −90 °C, y es el nivel más frío de la atmósfera.',
    ]));
    el.append(H.selfCheck([
      { q: '¿En qué capa tienen lugar casi todas las nubes y precipitaciones?', opts: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'], a: 0, ex: 'La troposfera contiene ≈ 75–80 % de la masa del aire y casi todo el vapor de agua; su nombre alude a la mezcla (gr. <i>tropos</i>, giro).' },
      { q: '¿Por qué aumenta la temperatura con la altura en la estratosfera?', opts: ['Porque está más cerca del Sol', 'Porque el ozono absorbe la radiación ultravioleta', 'Porque el aire es más denso', 'Por el calor que asciende desde el suelo'], a: 1, ex: 'La absorción del UV por el ozono calienta esta capa. La distancia al Sol no cambia apreciablemente en unos kilómetros.' },
      { q: 'A unos 5,5 km de altitud, ¿qué parte de la masa de la atmósfera queda por debajo?', opts: ['Una décima parte', 'La mitad', 'Tres cuartas partes', 'Casi toda'], a: 1, ex: 'La presión, que mide el peso del aire de encima, es ≈ 500 hPa: la mitad de la del nivel del mar. Compruébalo con el cursor.' },
      { q: '¿Dónde está más alta la tropopausa?', opts: ['Sobre los polos', 'En latitudes medias', 'Sobre el ecuador', 'A la misma altura en todas partes'], a: 2, ex: 'Sobre el ecuador alcanza ≈ 16–17 km y es muy fría (≈ −80 °C); sobre los polos, unos 8–9 km. El aire caliente y la convección intensa la empujan hacia arriba.' },
      { q: '¿Cuál es el nivel más frío de toda la atmósfera?', opts: ['La tropopausa ecuatorial', 'La estratopausa', 'La mesopausa', 'El límite superior de la termosfera'], a: 2, ex: 'En la mesopausa (≈ 85–90 km) la temperatura baja a unos −90 °C.' },
    ]));
  },
});
