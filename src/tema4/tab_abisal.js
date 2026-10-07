/* ===================== MOVIMIENTOS · LA CIRCULACIÓN ABISAL ===================== */
H.tab({
  id: 'abisal', nav: 'Abisal', title: 'La circulación abisal y la cinta transportadora',
  init(el) {
    el.append(H.intro('La circulación abisal · apartado 2.5', 'Agua que se hunde en los polos y tarda siglos en volver',
      'En unos pocos lugares de las regiones polares el agua superficial, fría y salada, se hace tan densa que se hunde hasta el fondo. Esa agua profunda se extiende lentamente por todas las cuencas y vuelve a la superficie, sobre todo alrededor de la Antártida, empujada por los vientos del oeste y mezclada por la turbulencia. El resultado es una circulación de escala planetaria, la circulación de vuelco o «cinta transportadora», que redistribuye calor, sal, oxígeno y carbono.',
      'Manual: 2.5<br>Fig. 4.10'));
    const PF = typeof PERFILES !== 'undefined' && PERFILES ? PERFILES : null;

    /* ================= A · la cinta transportadora ================= */
    const SURF = [[-120, 0], [-150, -3], [-179.9, -4], [179.9, -4], [150, -2], [125, -5], [112, -10], [90, -14], [70, -20], [50, -30], [32, -37], [18, -36], [5, -30], [-10, -20], [-25, -10], [-38, 2], [-55, 12], [-70, 20], [-79, 26], [-75, 34], [-62, 40], [-45, 44], [-30, 50], [-18, 58], [-6, 64], [4, 70]];
    const SURF2 = [[-30, 50], [-40, 56], [-50, 60]];
    const DEEP = [[-12, 66], [-28, 61], [-45, 56], [-50, 48], [-60, 40], [-70, 32], [-66, 22], [-52, 10], [-36, -5], [-34, -22], [-44, -36], [-38, -50], [-15, -55], [10, -54], [40, -52], [70, -50], [100, -50], [130, -53], [160, -57], [179.9, -57.5], [-179.9, -57.5], [-160, -57], [-140, -55], [-115, -48]];
    const DEEP_I = [[60, -50], [70, -35], [75, -15], [78, 0]];
    const DEEP_P = [[172, -57], [179.9, -48], [-179.9, -47], [-172, -30], [-170, -15], [-170, 10], [-165, 30], [-170, 45]];
    const AABW = [[-45, -72], [-40, -62], [-34, -48], [-28, -32], [-30, -12], [-36, 8], [-48, 22]];
    const SINK = [['Mares de Groenlandia y Noruega', 72, -5], ['Mar del Labrador', 58, -53], ['Mar de Weddell', -72, -45], ['Mar de Ross', -75, -175]];
    const UPW = [['Divergencia antártica: el agua profunda aflora', -62, 20], ['Ascenso lento en el Pacífico', 20, -150], ['Ascenso lento en el Índico', -5, 80]];
    const s = { t: 0, run: true, show: { surf: true, deep: true, aabw: true } };
    const cv = H.h('canvas');
    const map = T4.map(cv, { bbox: [-180, 180, -78, 80], grid: 30, gridLabels: false, key: () => 'a', color: () => [196, 216, 230],
      after: (ctx, P) => {
        const path = (pts, col, w, dash, rev) => {
          ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash); ctx.lineDashOffset = rev ? s.t : -s.t;
          ctx.beginPath(); let prev = null;
          pts.forEach(([lo, la]) => { const x = P.X(lo), y = P.Y(la); if (prev != null && Math.abs(lo - prev) > 180) ctx.moveTo(x, y); else if (prev == null) ctx.moveTo(x, y); else ctx.lineTo(x, y); prev = lo; });
          ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
        };
        if (s.show.deep) { [DEEP, DEEP_I, DEEP_P].forEach((p) => { path(p, 'rgba(31,79,139,.35)', 9, []); path(p, '#1f4f8b', 3, [10, 12]); }); }
        if (s.show.aabw) { path(AABW, 'rgba(40,30,100,.3)', 9, []); path(AABW, '#3a2a8a', 3, [6, 10]); }
        if (s.show.surf) { [SURF, SURF2].forEach((p) => { path(p, 'rgba(180,40,30,.3)', 9, []); path(p, '#b42c1e', 3, [10, 12]); }); }
        ctx.font = 'bold 10.5px system-ui'; ctx.textBaseline = 'middle';
        SINK.forEach(([n, la, lo]) => { const x = P.X(lo), y = P.Y(la); ctx.fillStyle = '#1f4f8b'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('↓', x, y + 0.5); if (P.w > 640) { ctx.fillStyle = '#1c2836'; ctx.textAlign = lo < -100 ? 'left' : 'right'; ctx.fillText(n, x + (lo < -100 ? 11 : -11), y); } });
        UPW.forEach(([n, la, lo]) => { const x = P.X(lo), y = P.Y(la); ctx.fillStyle = '#c08a1e'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('↑', x, y + 0.5); if (P.w > 640) { ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.fillText(n, x + 11, y); } });
      } });
    let last = null;
    const loop = (ts) => { if (!s.run) return; if (cv.isConnected && cv.offsetParent !== null) { if (last != null) s.t = (s.t + (ts - last) * 0.02) % 1000; map.redraw(); } last = ts; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const chk = (k, l) => H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', checked: true, onchange: (e) => { s.show[k] = e.target.checked; map.redraw(); } }), ' ' + l);
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La circulación de vuelco: una cinta transportadora'),
      H.h('p', { class: 'sub' }, 'Esquema de las grandes ramas (simplificado; las flechas reales no son tubos continuos, sino flujos lentos repartidos en miles de kilómetros). En rojo, las aguas superficiales y termoclinas que van hacia el Atlántico Norte; en azul, el agua profunda del Atlántico Norte, que viaja hacia el sur y se reparte por los océanos Índico y Pacífico a través de la corriente circumpolar antártica; en morado, el agua de fondo antártica.'),
      H.h('div', { class: 'viz framed' }, cv),
      H.h('div', { class: 'row', style: { gap: '14px', marginTop: '8px', justifyContent: 'flex-start' } }, chk('surf', 'Aguas superficiales'), chk('deep', 'Agua profunda del Atlántico Norte'), chk('aabw', 'Agua de fondo antártica')),
      H.html(`<div class="readouts" style="margin-top:10px">
        <div class="ro hl"><div class="k">Caudal de la circulación de vuelco a 26,5° N</div><div class="v">≈ 17 <small>Sv (millones de m³/s), unas 15 veces todos los ríos del mundo</small></div></div>
        <div class="ro"><div class="k">Calor que transporta hacia el norte</div><div class="v">≈ 1,2 <small>PW (billones de kW) a 26,5° N</small></div></div>
        <div class="ro bl"><div class="k">Edad del agua del fondo del Pacífico norte</div><div class="v">1.000-1.500 <small>años desde que estuvo en superficie</small></div></div></div>
        <p class="small">Valores de la red de observación RAPID-MOCHA a 26,5° N (medias desde 2004) y de la datación por radiocarbono del agua profunda.</p>`)));

    /* ================= B · ¿hasta dónde se hunde? ================= */
    if (PF && PF.atl) {
      const A = PF.atl, zs = A.z;
      const SRC = [['Agua del mar del Labrador en invierno', 3.2, 34.85], ['Agua del mar de Groenlandia en invierno', -1.0, 34.9], ['Agua de la plataforma del mar de Weddell', -1.9, 34.65], ['Agua mediterránea en Gibraltar', 13.2, 38.4], ['Agua superficial del Atlántico tropical', 26, 36.2], ['Agua dulce de deshielo en Groenlandia', 0, 31.5]];
      const sB = { k: 0, lat: 30 };
      const cvB = H.h('canvas'); const chB = H.chart(cvB, 0.95);
      const ro = { s: H.ro('Densidad de la muestra (σθ)', 'hl'), z: H.ro('Profundidad a la que se estabiliza', 'bl') };
      const updB = () => {
        const [n, T, S] = SRC[sB.k], sig = T4.sigma(S, T);
        const ii = Math.round((sB.lat - A.lat0) / A.dlat); // índice del perfil (69,5° N, 68,5° N, …)
        const col = zs.map((z, k) => { const t = A.T[k][ii], ss = A.S[k][ii]; return t === t && ss === ss ? T4.sigma(ss, T4.theta(ss, t, z), 0) : NaN; });
        const pts = zs.map((z, k) => [col[k], -z]).filter((p) => p[0] === p[0]);
        let zeq = null; const zb = -pts[pts.length - 1][1];
        if (sig <= pts[0][0]) zeq = 0; else { for (let k = 1; k < pts.length; k++) if (pts[k][0] >= sig) { const a = pts[k - 1], b = pts[k], t = (sig - a[0]) / (b[0] - a[0]); zeq = -(a[1] + (b[1] - a[1]) * t); break; } }
        const mn = Math.min(24, Math.floor(Math.min(...pts.map((p) => p[0])))), mx = 28.2;
        chB.draw({ xMin: mn, xMax: mx, yMin: -Math.max(zb, 1000), yMax: 0, xLabel: 'Densidad potencial σθ (kg/m³ − 1.000)', yLabel: 'Profundidad (m)', pad: { l: 52 },
          xTicks: Array.from({ length: Math.round((mx - mn) / 0.5) + 1 }, (_, k) => ({ v: mn + k * 0.5, label: H.f(mn + k * 0.5, 1) })).filter((t, k) => k % 2 === 0),
          yTicks: [0, 1000, 2000, 3000, 4000, 5000].filter((z) => z <= Math.max(zb, 1000)).map((z) => ({ v: -z, label: H.f(z) })),
          series: [{ pts, color: '#1f6f8b', width: 2.4 }], vlines: [{ x: Math.min(sig, mx), color: '#b4531d', label: 'muestra' }],
          markers: zeq != null ? [{ x: sig, y: -zeq, color: '#b4531d', label: zeq === 0 ? 'se queda en superficie' : `se estabiliza a ${H.f(zeq)} m`, align: sig > (mn + mx) / 2 ? 'right' : 'left' }] : [{ x: Math.min(sig, mx), y: -zb, color: '#3a2a8a', label: 'llega al fondo', align: 'right' }] });
        ro.s.v.innerHTML = H.f(sig, 2) + ` <small>(${T4.fT(T)}, S = ${H.f(S, 2)})</small>`;
        ro.z.v.innerHTML = zeq == null ? `el fondo <small>(${H.f(zb)} m): más densa que toda la columna</small>` : zeq === 0 ? 'en superficie <small>(más ligera que el agua superficial)</small>' : `${H.f(zeq)} <small>m</small>`;
      };
      const sel = H.h('select', { 'aria-label': 'Muestra' }, ...SRC.map(([n], i) => H.h('option', { value: i }, n))); sel.onchange = () => { sB.k = +sel.value; updB(); };
      const latS = H.slider('Latitud del perfil del Atlántico (25° O)', -60, 60, 1, sB.lat, (v) => H.f(Math.abs(v)) + '° ' + (v < 0 ? 'S' : 'N'), (v) => { sB.lat = v; updB(); });
      el.append(H.h('div', { class: 'card' }, H.h('h3', {}, '¿Hasta dónde se hunde un agua?'),
        H.h('p', { class: 'sub' }, 'Un agua que se hunde baja hasta encontrar agua de su misma densidad y allí se extiende horizontalmente. Elige una muestra y compárala con el perfil real de densidad del Atlántico a 25° O (HYCOM): la línea azul es la densidad del océano a cada profundidad; la naranja, la de la muestra.'),
        H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, cvB), H.h('div', {}, sel, latS, H.h('div', { class: 'readouts' }, ro.s, ro.z),
          H.h('p', { class: 'small' }, 'El agua mediterránea, aunque está a 13 °C, es tan salada que baja hasta unos 1.000 m; el agua de deshielo, muy dulce, no se hunde aunque esté a 0 °C: por eso el aporte de agua dulce de Groenlandia puede frenar la formación de agua profunda.')))));
      updB();
    }

    /* ================= C · ¿se está debilitando? ================= */
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'La circulación de vuelco del Atlántico y el cambio climático'),
      H.html(`<div class="grid2 even"><div><p>El calentamiento del océano y el agua dulce que añaden el deshielo de Groenlandia y las mayores lluvias del Atlántico Norte hacen el agua superficial menos densa y pueden frenar su hundimiento. Los modelos climáticos coinciden en que la circulación de vuelco del Atlántico (AMOC, por sus siglas en inglés) se debilitará a lo largo del siglo XXI; el IPCC (2021) considera, con confianza media, que no se interrumpirá bruscamente antes de 2100, aunque algunos estudios recientes apuntan a un riesgo mayor.</p></div>
        <div><p>Un colapso enfriaría el Atlántico Norte y Europa occidental varios grados, desplazaría hacia el sur la zona de convergencia intertropical (con sequías en el Sahel y cambios en los monzones), elevaría el nivel del mar en la costa este de América del Norte y reduciría la absorción de CO₂ por el océano. Las medidas directas, como las de RAPID a 26,5° N desde 2004, son todavía demasiado cortas para separar una tendencia de la variabilidad natural.</p></div></div>`)));

    el.append(H.fix('Circulación abisal', [
      'El manual no presenta la circulación de vuelco como un sistema que une todos los océanos (la «cinta transportadora»), ni su papel en el transporte de calor y de carbono ni su posible debilitamiento por el cambio climático.',
      'El agua profunda no se forma en cualquier parte de las latitudes altas: solo en unos pocos lugares (mares de Groenlandia, Noruega y Labrador; mares de Weddell y Ross), donde el enfriamiento intenso y la formación de hielo vuelven inestable la columna de agua.',
      'El retorno a la superficie no es un simple «ascenso compensatorio»: ocurre sobre todo en el océano Austral, donde los vientos del oeste hacen aflorar el agua profunda, y por la mezcla turbulenta repartida por todos los océanos.',
    ]));
    el.append(H.selfCheck([
      { q: 'El agua profunda del Atlántico Norte se forma…', opts: ['en el mar de los Sargazos', 'en los mares de Groenlandia, Noruega y Labrador', 'en el golfo de México', 'en el Mediterráneo'], a: 1, ex: ' El enfriamiento invernal del agua salada que trae la deriva noratlántica la hace hundirse.' },
      { q: '¿Por qué el agua de deshielo de Groenlandia podría frenar la circulación abisal?', opts: ['Porque es más caliente', 'Porque, al ser dulce, hace menos densa el agua superficial y dificulta que se hunda', 'Porque congela el océano', 'No influye'], a: 1, ex: ' La formación de agua profunda depende de que el agua superficial sea muy densa: el agua dulce lo impide.' },
      { q: 'El agua más antigua del océano (que lleva más tiempo sin estar en superficie) está…', opts: ['en el fondo del Atlántico Norte', 'en el fondo del Pacífico norte', 'en el Mediterráneo', 'en la capa de mezcla'], a: 1, ex: ' Es el extremo final del recorrido: más de mil años desde que se hundió.' },
    ]));
  },
});
