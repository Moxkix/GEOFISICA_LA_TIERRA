/* ===================== E · CLIMAS POLARES ===================== */
H.tab({
  id: 'polares', nav: 'Climas polares', title: 'Climas polares',
  init(el) {
    el.append(H.intro('La zona fría · apartado 3', 'Donde el verano no llega a 10 °C',
      'Los climas polares empiezan donde el mes más cálido no alcanza los 10 °C, el límite aproximado de los árboles. Entre 10 °C y 0 °C está la tundra (ET), sin árboles y con el suelo helado en profundidad; por debajo de 0 °C, el hielo perpetuo (EF) de los casquetes de Groenlandia y la Antártida. La causa es la radiación: el Sol, siempre bajo, calienta poco, y la nieve y el hielo reflejan buena parte de lo que llega.',
      'Manual: apartado 3<br>Cuadros 6.10-6.12; figs. 6.17 y 6.18; ejercicios 5 y 6'));
    el.append(T5.optCtrl());
    const D2R = H.D2R, Ly = T6.layers(), PO = T6.DATA().POLAR;
    if (!Ly || !PO) { el.append(H.info('Esta pestaña necesita los datos de TerraClimate y de ERA5.')); return; }
    const gN = T4.grid(PO.wn.W, PO.wn), gS = T4.grid(PO.ws.W, PO.ws);

    /* =============== 1 · mapa polar (fig. 6.17) =============== */
    const M = { h: 'n', sel: '4250' };
    const LATMIN = 45, k = Math.sin((90 - LATMIN) * D2R);
    const RAMP = T4.ramp([[-30, [246, 248, 251]], [-0.01, [228, 234, 240]], [0, [206, 214, 222]], [9.99, [176, 188, 200]], [10, [150, 195, 150]], [15, [96, 160, 104]], [20, [196, 208, 128]], [26, [232, 190, 112]]]);
    const warmAt = (lat, lon) => {
      const c = T6.idx(lat, lon); if (c >= 0 && Ly.warm[c] === Ly.warm[c]) return Ly.warm[c];
      if (H.land(lat, lon) < 0.5) return NaN;
      return lat < 0 ? gS.at(lat, lon) : gN.at(lat, lon);
    };
    const NSTA = ['70026', '71018', '4202', '4250', '4030', '1026', '24266', '24959', '70261', '70273', '31088', '25913'], SSTA = ['87938', '85934', 'polo'];
    const pcv = H.h('canvas');
    let RAST = {};
    const pst = H.autoCanvas(pcv, (w) => Math.min(w, 560), (ctx, w, h) => {
      const S = Math.min(w, h), ox = (w - S) / 2, O = H.ortho(M.h === 'n' ? 90 : -90, 0);
      const proj = (lat, lon) => { const [x, y, cc] = O.fwd(lat, lon); if (cc <= 0 || Math.hypot(x, y) > k * 1.0001) return null; return [ox + S / 2 + x / k * S / 2, S / 2 - y / k * S / 2]; };
      pst.proj = proj; pst.O = O; pst.S = S; pst.ox = ox;
      ctx.clearRect(0, 0, w, h);
      if (!RAST[M.h] || RAST[M.h].width !== Math.round(Math.min(S, 520))) {
        const RS = Math.round(Math.min(S, 520)), img = new ImageData(RS, RS);
        for (let j = 0; j < RS; j++) for (let i = 0; i < RS; i++) {
          const u = ((i + 0.5) / RS * 2 - 1) * k, v = -((j + 0.5) / RS * 2 - 1) * k, q = (j * RS + i) * 4;
          if (Math.hypot(u, v) > k) { img.data[q + 3] = 0; continue; }
          const ll = O.inv(u, v); if (!ll) { img.data[q + 3] = 0; continue; }
          const t = warmAt(ll[0], ll[1]); const c = t === t ? RAMP(t) : [208, 225, 236];
          img.data[q] = c[0]; img.data[q + 1] = c[1]; img.data[q + 2] = c[2]; img.data[q + 3] = 255;
        }
        const cv = document.createElement('canvas'); cv.width = RS; cv.height = RS; cv.getContext('2d').putImageData(img, 0, 0); RAST[M.h] = cv;
      }
      ctx.drawImage(RAST[M.h], ox, 0, S, S);
      // retícula
      ctx.save(); ctx.strokeStyle = 'rgba(28,40,54,.18)'; ctx.setLineDash([2, 3]);
      for (const la of [50, 60, 70, 80]) { const r = Math.sin((90 - la) * D2R) / k * S / 2; ctx.beginPath(); ctx.arc(ox + S / 2, S / 2, r, 0, 7); ctx.stroke(); }
      for (let lo = -180; lo < 180; lo += 30) { const a = proj((M.h === 'n' ? 1 : -1) * LATMIN, lo); if (a) { ctx.beginPath(); ctx.moveTo(ox + S / 2, S / 2); ctx.lineTo(a[0], a[1]); ctx.stroke(); } }
      ctx.setLineDash([]); ctx.restore();
      // círculo polar
      ctx.save(); ctx.strokeStyle = 'rgba(28,40,54,.5)'; ctx.setLineDash([7, 4]); const rc = Math.sin(23.44 * D2R) / k * S / 2; ctx.beginPath(); ctx.arc(ox + S / 2, S / 2, rc, 0, 7); ctx.stroke(); ctx.restore();
      // costas
      ctx.save(); ctx.strokeStyle = 'rgba(28,40,54,.55)'; ctx.lineWidth = 0.7; ctx.beginPath();
      for (const poly of LAND) for (const ring of poly) { let prev = null; for (let i = 0; i < ring.length; i += 2) { const p = proj(ring[i + 1], ((ring[i] + 540) % 360) - 180); if (p && prev) ctx.lineTo(p[0], p[1]); else if (p) ctx.moveTo(p[0], p[1]); prev = p; } }
      ctx.stroke(); ctx.restore();
      // isotermas del mes más cálido (ERA5, con el mar)
      const g = M.h === 'n' ? gN : gS;
      T6.contourProj(ctx, g, 10, proj, { color: '#1c2836', width: 2.2 });
      T6.contourProj(ctx, g, 0, proj, { color: '#2c5f9e', width: 1.8, dash: [6, 4] });
      // estaciones
      pst.pts = [];
      const items = [];
      for (const id of (M.h === 'n' ? NSTA : SSTA)) {
        const s = id === 'polo' ? { lat: -90, lon: 0, name: 'Polo Sur' } : T5.byId(id); if (!s) continue;
        const p = proj(s.lat, s.lon); if (!p) continue; const on = id === M.sel;
        ctx.fillStyle = on ? '#b4531d' : '#1c2836'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], on ? 6 : 4, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
        pst.pts.push([p[0], p[1], id]); items.push({ x: p[0], y: p[1], t: s.name.replace(/ \(.*\)/, ''), bg: true, bold: on });
      }
      T6.labels(ctx, items, [0, 0, w, h], '10.5px system-ui');
      ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(M.h === 'n' ? 'círculo polar ártico (discontinua)' : 'círculo polar antártico (discontinua)', 6, 6);
    });
    pcv.addEventListener('click', (e) => { const [x, y] = pst.pos(e); let b = null, bd = 16; for (const [px, py, id] of pst.pts || []) { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; b = id; } } if (b) { M.sel = b; pst.redraw(); updSel(); } });
    const ptip = H.h('div', { class: 'tooltip' });
    pcv.addEventListener('mousemove', (e) => {
      if (!pst.O) return; const [x, y] = pst.pos(e), S = pst.S, u = ((x - pst.ox) / S * 2 - 1) * k, v = -(y / S * 2 - 1) * k;
      const ll = Math.hypot(u, v) <= k ? pst.O.inv(u, v) : null; const t = ll ? warmAt(ll[0], ll[1]) : NaN;
      if (!(t === t)) { ptip.style.display = 'none'; return; }
      ptip.innerHTML = `${T4.ll(ll[0], ll[1], 0)} · mes más cálido ${T5.fT(t)}${t < 0 ? ' · hielo perpetuo' : t < 10 ? ' · tundra' : ''}`;
      ptip.style.display = 'block'; ptip.style.left = (x / pst.w * 100) + '%'; ptip.style.top = (y / pst.h * 100) + '%'; ptip.style.transform = `translate(${x / pst.w > 0.65 ? '-100%' : x / pst.w < 0.35 ? '0' : '-50%'}, -120%)`;
    });
    pcv.addEventListener('mouseleave', () => { ptip.style.display = 'none'; });
    const hSeg = H.seg([['n', 'Ártico'], ['s', 'Antártida']], M.h, (v) => { M.h = v; M.sel = v === 'n' ? '4250' : 'polo'; pst.redraw(); updSel(); });
    const sc = T6.climoCard(), sTxt = H.h('p', { class: 'small' });
    const polo = () => ({ T: PO.polo.T, P: PO.polo.P, lat: -90, lon: 0, title: 'Polo Sur (Amundsen-Scott, 2.835 m)', sub: 'temperatura: estación; precipitación: ERA5' });
    const NOTES = {
      '4250': 'Nuuk, en la costa suroccidental de Groenlandia: tundra oceánica, con inviernos moderados para su latitud y 874 mm de precipitación, muy lejos de los «menos de 250 mm» del cuadro 6.11.',
      '70026': 'Utqiaġvik (Barrow), en la costa ártica de Alaska: tundra con 137 mm al año, la mayor parte en verano, y un invierno de −24 °C.',
      '24266': 'Verjoyansk: el mes más cálido supera los 15 °C y hay bosque (taiga de alerces), aunque en enero ronde los −45 °C: no es un clima polar, sino subártico (Dsd).',
      polo: 'Hielo perpetuo: ningún mes llega a 0 °C; enero, en pleno verano austral, se queda en −28 °C. La precipitación es de unas decenas de milímetros al año, y los pluviómetros no la miden bien porque el viento arrastra la nieve.',
      '87938': 'Ushuaia, a 55° S: su mes más cálido se queda por debajo de 10 °C, de modo que Köppen la clasifica como tundra aunque esté rodeada de bosque de hayas australes, un caso en el que el límite de 10 °C no coincide con el de los árboles.',
    };
    const updSel = () => {
      const id = M.sel;
      if (id === 'polo') sc.set(polo()); else sc.set(T6.fromSt(T5.byId(id)));
      sTxt.innerHTML = NOTES[id] || '';
    };
    const c1 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Los límites de los climas polares (fig. 6.17 y ejercicio 5)'),
      H.h('p', { class: 'sub' }, 'Temperatura del mes más cálido (TerraClimate 1991-2020 sobre tierra; ERA5 en la Antártida). Línea negra: isoterma de 10 °C del mes más cálido, límite de los climas polares; azul discontinua: isoterma de 0 °C, límite del hielo perpetuo (ERA5, sobre tierra y mar). Pulsa una estación.'),
      hSeg, H.h('div', { class: 'grid2', style: { marginTop: '8px' } }, H.h('div', { class: 'viz framed', style: { position: 'relative' } }, pcv, ptip), H.h('div', {}, sc, sTxt,
        H.html(`<div class="zleg" style="margin-top:8px">${[[-10, 'menos de 0 °C (EF)'], [5, '0-10 °C (ET)'], [12, '10-15 °C'], [17, '15-20 °C'], [24, 'más de 20 °C']].map(([t, l]) => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.78rem"><i style="display:inline-block;width:14px;height:12px;border-radius:2px;background:rgb(${RAMP(t).map(Math.round).join(',')});border:1px solid rgba(28,40,54,.3)"></i>${l}</span>`).join('')}</div>`))));
    updSel();

    /* =============== 2 · la latitud de la isoterma de 10 °C =============== */
    const iso = []; // [lon, lat]
    // límite sur de los climas polares: desde 40° N hacia el norte, primer punto en que el mes más cálido baja de 10 °C
    for (let i = 0; i < gN.nx; i++) {
      let prev = null;
      for (let j = gN.ny - 1; j >= 0; j--) {
        const v = gN.data[j * gN.nx + i], la = gN.latAt(j);
        if (prev && prev.v >= 10 && v < 10) { iso.push([gN.lonAt(i), prev.la + (prev.v - 10) / (prev.v - v) * (la - prev.la)]); break; }
        prev = { v, la };
      }
    }
    const ich = H.chart(H.h('canvas'), (w) => Math.max(w * 0.36, 300));
    const at = (lon) => { let b = iso[0]; for (const p of iso) if (Math.abs(p[0] - lon) < Math.abs(b[0] - lon)) b = p; return b; };
    const MK = [[-170, 'Bering'], [-125, 'Mackenzie'], [-85, 'bahía de Hudson'], [-60, 'Labrador'], [-20, 'Islandia'], [18, 'Noruega'], [100, 'Siberia central'], [158, 'Kamchatka']];
    ich.draw({ xMin: -180, xMax: 180, yMin: 50, yMax: 76, pad: { l: 46, b: 34 }, xTicks: [-180, -120, -60, 0, 60, 120, 180].map((v) => ({ v, label: T4.lonName(v) })), yTicks: [50, 55, 60, 65, 70, 75].map((v) => ({ v, label: v + '° N' })),
      series: [{ pts: iso, color: '#1c2836', width: 2.2 }], markers: MK.map(([lo, n]) => { const p = at(lo); return { x: p[0], y: p[1], label: `${n} (${H.f(p[1])}°)`, color: '#b4531d', r: 4 }; }) });
    const c2 = H.h('div', { class: 'card' }, H.h('h3', {}, '¿Por qué la isoterma de 10 °C no sigue un paralelo? (ejercicio 5)'),
      H.h('p', { class: 'sub' }, 'Latitud a la que, avanzando hacia el norte, el mes más cálido baja de 10 °C: el límite sur de los climas polares, meridiano a meridiano (ERA5 1991-2020, sobre tierra y mar).'),
      H.h('div', { class: 'viz framed' }, ich.st.canvas),
      H.html(`<div class="grid2 even" style="margin-top:8px"><div><p class="small"><b>Sus posiciones más meridionales</b>, entre 52° y 58° N, están en el mar de Bering, la bahía de Hudson y el Labrador: corrientes frías (del Labrador, de Kamchatka) y un mar helado hasta bien entrado el verano enfrían las costas. Por eso la tundra baja allí hasta latitudes como la de Escocia.</p></div>
        <div><p class="small"><b>Sus posiciones más septentrionales</b>, por encima de 70° N, están en Noruega, donde la deriva noratlántica calienta el mar, y en el interior de Siberia y del valle del Mackenzie, donde el continente se caldea en verano. Se usa en las clasificaciones porque coincide aproximadamente con el límite de los árboles: separa la tundra de la taiga y los climas polares (E) de los demás.</p></div></div>`));

    /* =============== 3 · climogramas (fig. 6.18) =============== */
    const PAIRS = {
      f618: ['Fig. 6.18 · Nuuk y el Polo Sur', '4250', 'polo'],
      tun: ['Dos tundras: Nuuk y Utqiaġvik', '4250', '70026'],
      gro: ['Groenlandia: la costa y el casquete', '4250', 'groen'],
      sur: ['Hemisferio sur: Ushuaia y Punta Arenas', '87938', '85934'],
    };
    const fa = T6.climoCard(), fb = T6.climoCard(), fTxt = H.h('p', { class: 'small' });
    const TX = {
      f618: 'Los dos extremos de la zona fría. Nuuk: tundra oceánica, con 15 °C de amplitud y precipitación abundante. El Polo Sur: hielo perpetuo, 33 °C de amplitud, un invierno «sin núcleo» (de abril a septiembre la temperatura apenas cambia, en torno a −58 °C) y casi sin precipitación.',
      tun: 'Las dos variedades de tundra del manual: la oceánica de Nuuk, con inviernos moderados y precipitación abundante todo el año, y la de Utqiaġvik, en la costa del océano Ártico, helado casi todo el año, con inviernos mucho más fríos, 30 °C de amplitud y precipitación escasa, de verano.',
      gro: 'Nuuk, en la costa, y una celda del centro del casquete de Groenlandia, a unos 3.200 m (TerraClimate): ningún mes llega a 0 °C. La altitud del casquete, más que la latitud, explica el hielo perpetuo, como en la Antártida. Las precipitaciones de TerraClimate sobre el hielo no son fiables: en la cumbre del casquete se acumulan unos 200-250 mm de agua al año.',
      sur: 'En el hemisferio sur no hay continentes a 55°-65° S salvo el extremo de Sudamérica: Ushuaia (55° S) y Punta Arenas (53° S) tienen veranos muy frescos (unos 10 °C) e inviernos suaves, con poca amplitud por la influencia del océano. Ushuaia queda por debajo de 10 °C (ET) y Punta Arenas apenas por encima (Cfc).',
    };
    const get = (id) => (id === 'polo' ? polo() : id === 'groen' ? T6.fromCell(T5.cell(72.6, -38.5), 'Centro de Groenlandia') : T6.fromSt(T5.byId(id)));
    const setF = (key) => { const [, a, b] = PAIRS[key]; fa.set(get(a)); fb.set(get(b)); fTxt.textContent = TX[key]; };
    const c3 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Tundra y hielo perpetuo'), H.seg(Object.entries(PAIRS).map(([kk, v]) => [kk, v[0]]), 'f618', setF),
      H.h('div', { class: 'pairs', style: { marginTop: '10px' } }, fa, fb), fTxt);
    setF('f618');

    /* =============== 4 · el Sol en el polo =============== */
    const sch = H.chart(H.h('canvas'), (w) => Math.max(w * 0.4, 280));
    const days = Array.from({ length: 73 }, (_, i) => 1 + i * 5);
    const ser = [[90, '#1c2836'], [70, '#2c5f9e'], [45, '#3f8f6b'], [0, '#b4531d']].map(([lat, c]) => ({ pts: days.map((d) => { const s = H.sun(H.dateFromDoy(d).getTime()); return [d, H.toaInsolation(lat, s.decl, s.R)]; }), color: c, width: 2.2, lat }));
    const jun = H.doyOf(new Date(Date.UTC(H.year, 5, 21))), sJ = H.sun(H.dateFromDoy(jun).getTime());
    sch.draw({ xMin: 1, xMax: 365, yMin: 0, yMax: 560, pad: { l: 52 }, xTicks: H.monthTicks(), yTicks: [0, 100, 200, 300, 400, 500].map((v) => ({ v, label: H.f(v) })), yLabel: 'W/m² (media del día)', series: ser,
      after: (ctx, X, Y) => { ctx.font = '10.5px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; for (const s of ser) { const p = s.pts[Math.floor(s.pts.length * 0.47)]; ctx.fillStyle = s.color; ctx.fillText(s.lat ? s.lat + '° N' : 'ecuador', X(p[0]) + 4, Y(p[1]) - 3); } } });
    const c4 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Mucha luz en verano, poco calor'),
      H.h('p', { class: 'sub' }, 'Radiación solar media del día en el techo de la atmósfera a lo largo del año (Tema 1).'),
      H.h('div', { class: 'viz framed' }, sch.st.canvas),
      H.html(`<p class="small">Hacia el solsticio de junio el polo norte recibe en el techo de la atmósfera más energía que el ecuador (${H.f(H.toaInsolation(90, sJ.decl, sJ.R))} frente a ${H.f(H.toaInsolation(0, sJ.decl, sJ.R))} W/m²), porque el Sol no se pone. Sin embargo, el Sol nunca sube de 23,4° y sus rayos atraviesan mucha atmósfera; la nieve y el hielo reflejan entre el 50 y el 90 % de lo que llega, y el calor que queda se gasta en fundir el hielo. Durante el invierno polar, en cambio, no llega nada durante semanas o meses. El resultado es la menor temperatura media del planeta.</p>`));

    /* =============== 5 · taiga y tundra (ejercicio 6) =============== */
    const c5 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Taiga y tundra (ejercicio 6)'),
      H.html(`<div style="overflow-x:auto"><table class="t"><thead><tr><th></th><th>Taiga (bosque boreal)</th><th>Tundra</th></tr></thead><tbody>
        <tr><td><b>Clima</b></td><td>Subártico (Dfc, Dwc, Dfd): verano corto, con 1 a 3 meses por encima de 10 °C</td><td>Polar de tundra (ET): ningún mes llega a 10 °C</td></tr>
        <tr><td><b>Vegetación</b></td><td>Bosque de coníferas de pocas especies: píceas, abetos, pinos y alerces (estos pierden la aguja en invierno), con abedules; sotobosque de musgos y líquenes</td><td>Sin árboles: musgos, líquenes, gramíneas, juncos y arbustos enanos (sauces, abedules enanos); hacia el sur, tundra arbustiva y bosque abierto de transición</td></tr>
        <tr><td><b>Suelos</b></td><td>Podzoles ácidos y lavados; permafrost discontinuo en Siberia oriental</td><td>Permafrost continuo: solo se deshiela la capa superficial en verano; suelos encharcados y turbosos (criosoles), con formas de crioturbación</td></tr>
        <tr><td><b>Límite</b></td><td colspan="2">Coincide aproximadamente con la isoterma de 10 °C del mes más cálido: por debajo, el verano es demasiado corto y frío para que crezcan los árboles</td></tr>
      </tbody></table></div>`),
      H.openQ('¿Por qué el permafrost se extiende por el sur de Siberia oriental, bajo la taiga, y no en Escandinavia a la misma latitud?', 'Porque el invierno de Siberia oriental es mucho más frío (−30 a −40 °C, bajo el anticiclón siberiano) y con poca nieve que aísle el suelo: la helada penetra a gran profundidad y el corto verano no la deshace. En Escandinavia, la deriva noratlántica suaviza el invierno.'));

    el.append(c1, c2, c3, c4, c5,
      H.fix('apartado 3, cuadros 6.10-6.12, fig. 6.17', [
        'En el hemisferio norte los climas polares no empiezan «por encima del paralelo 70°» en general: la isoterma de 10 °C del mes más cálido baja a unos 52°-58° N en el mar de Bering, la bahía de Hudson y el Labrador, como muestra la propia fig. 6.17 (y el mapa de arriba).',
        'Cuadro 6.11: la tundra no siempre recibe «menos de 250 mm»: la variedad oceánica es mucho más húmeda (Nuuk, 874 mm).',
        'Cuadro 6.10: «EB, clima seco de alta montaña» no existe en Köppen-Geiger; las montañas se clasifican con sus propios datos (Tema 5).',
        'Apartado 3.2.1: el casquete antártico no es una herencia de las glaciaciones cuaternarias: se formó hace unos 34 millones de años, en el tránsito del Eoceno al Oligoceno. La idea de que no se volvería a formar con el clima actual se ha calculado para el casquete de Groenlandia.',
        'El albedo de la nieve reciente llega al 80-90 %; el del hielo, al 50-60 %.',
        'Taiga (2.4.3): el ciprés pelado (Taxodium) no es una especie de la taiga, sino de los pantanos del sureste de Estados Unidos; la conífera caducifolia de la taiga es el alerce.',
        'Pie de la fig. 6.17: la línea discontinua de la figura es el límite de los glaciares, no la isoterma de 0 °C.',
      ]),
      H.selfCheck([
        { q: 'El límite entre la tundra y la taiga coincide aproximadamente con…', opts: ['El círculo polar ártico', 'La isoterma de 10 °C del mes más cálido', 'La isoterma de 0 °C del mes más frío', 'El paralelo 70°'], a: 1, ex: 'Por debajo de 10 °C en el mes más cálido no crecen árboles.' },
        { q: 'La isoterma de 10 °C del mes más cálido baja más al sur en…', opts: ['Noruega', 'La bahía de Hudson y el Labrador', 'Siberia central', 'Islandia'], a: 1, ex: 'Corrientes frías y un mar helado hasta el verano; en Noruega la deriva noratlántica la empuja al norte.' },
        { q: 'En el solsticio de verano, el polo recibe en el techo de la atmósfera…', opts: ['Menos energía que el ecuador', 'Más energía que el ecuador, pero sigue frío', 'Ninguna energía', 'La misma que en invierno'], a: 1, ex: 'El Sol no se pone, pero está bajo, y la nieve y el hielo reflejan buena parte de la radiación.' },
        { q: 'El casquete de hielo de la Antártida se formó…', opts: ['En la última glaciación', 'Hace unos 34 millones de años', 'Hace 10.000 años', 'En la Pequeña Edad del Hielo'], a: 1, ex: 'En el tránsito del Eoceno al Oligoceno, cuando el océano Austral aisló el continente.' },
      ]));
  },
});
