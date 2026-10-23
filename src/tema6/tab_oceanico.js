/* ===================== D · OCEÁNICO Y CONTINENTAL ===================== */
H.tab({
  id: 'oceanico', nav: 'Oceánico y continental', title: 'Oceánico y continental',
  init(el) {
    el.append(H.intro('La zona templada · apartados 2.3 y 2.4', 'Del océano al corazón del continente',
      'Entre 40° y 60° de latitud soplan los vientos del oeste. En la fachada occidental llegan del océano, templado en invierno por corrientes cálidas: inviernos suaves, veranos frescos y lluvia todo el año, el clima oceánico (Cfb). Hacia el interior la influencia del mar se pierde y, en invierno, se forman anticiclones térmicos: aumenta la amplitud térmica, el invierno baja del umbral C/D y las lluvias se concentran en verano, el clima continental (Df, Dw). Más al norte, con veranos cortos, el subártico de la taiga.',
      'Manual: apartados 2.3 y 2.4<br>Cuadros 6.8 y 6.9; figs. 6.12-6.15'));
    el.append(T5.optCtrl());
    const with0 = (s0) => (s) => { void s; return `con 0 °C: ${KG.type(s0.ta.slice(0, 12), s0.pr.slice(0, 12), s0.lat, Object.assign({}, T5.opt, { cd: 0 }))}`; };

    /* =============== 1 · Lyon, Innsbruck y un oceánico de verdad (fig. 6.12) =============== */
    const ids = ['7110', '7480', '11120'];
    const cards = ids.map(() => T6.climoCard());
    const upd1 = () => ids.forEach((id, i) => { const s = T5.byId(id); cards[i].set(Object.assign(T6.fromSt(s), { extra: with0(s) })); });
    upd1(); T5.onOpt(upd1);
    const c1 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Lyon, Innsbruck y Brest (fig. 6.12)'),
      H.h('p', { class: 'sub' }, 'Los dos climogramas del manual, con 1991-2020, y Brest, en la punta de Bretaña, como ejemplo de clima oceánico puro.'),
      H.h('div', { class: 'grid3' }, ...cards),
      H.html(`<p class="small" style="margin-top:8px"><b>Brest</b> es el oceánico de manual: amplitud de 10 °C, inviernos de 7 °C, verano fresco (17 °C) y lluvia todos los meses, con máximo en otoño-invierno, cuando las borrascas del frente polar son más activas. <b>Lyon</b> ya no sirve de ejemplo: con 1991-2020 su mes más cálido llega a 22,6 °C y es Cfa, subtropical húmedo; en el corredor del Ródano, lejos del Atlántico, el verano se ha calentado. <b>Innsbruck</b> (578 m, en un valle de los Alpes) muestra la degradación continental: 20 °C de amplitud y un máximo de lluvia en verano, tormentoso. Con el umbral de −3 °C es Cfb; con el de 0 °C, Dfb.</p>`));

    /* =============== 2 · misma latitud, dos orillas del océano =============== */
    const PAIRS = { atl: ['Atlántico norte: Brest y Gander', '7110', '71742'], pac: ['Pacífico norte: Seattle y Vladivostok', '72793', '31960'] };
    const pa = T6.climoCard(), pb = T6.climoCard(), pTxt = H.h('p', { class: 'small' });
    const TXT = {
      atl: 'Brest (48,5° N) y Gander, en Terranova (48,9° N), están a la misma latitud a los dos lados del Atlántico. Brest recibe los vientos del oeste después de cruzar la deriva noratlántica, cálida: su enero tiene 7 °C. A Gander el viento del oeste le llega del continente helado y la corriente que baña su costa es la fría del Labrador: su enero baja de −6 °C, la amplitud es de 23 °C y el clima, continental (Dfb), aunque esté junto al mar.',
      pac: 'Seattle (47° N) recibe el aire del Pacífico: inviernos de 6 °C y verano seco, mediterráneo de verano templado (Csb). Vladivostok, más al sur (43° N), está en la fachada oriental de Asia: en invierno le llega el aire del anticiclón siberiano, con enero por debajo de −10 °C y un invierno seco (Dwb). Es una de las diferencias entre fachadas más marcadas del planeta.',
    };
    const setP = (k) => { const [, a, b] = PAIRS[k]; const A = T5.byId(a), B = T5.byId(b); pa.set(T6.fromSt(A, `fachada occidental · ${T4.latName(A.lat)} · OMM 1991-2020`)); pb.set(T6.fromSt(B, `fachada oriental · ${T4.latName(B.lat)} · OMM 1991-2020`)); pTxt.textContent = TXT[k]; };
    const c2 = H.h('div', { class: 'card' }, H.h('h3', {}, 'La misma latitud en las dos orillas de un océano'),
      H.seg(Object.entries(PAIRS).map(([k, v]) => [k, v[0]]), 'atl', setP), H.h('div', { class: 'pairs', style: { marginTop: '10px' } }, pa, pb), pTxt);
    setP('atl');

    /* =============== 3 · la continentalidad euroasiática (fig. 6.14) =============== */
    const TR = [['10410', 'Essen', 16, 36], ['10381', 'Berlín', 20, 42], ['12375', 'Varsovia', 21.3, 47.5], ['11723', 'Brno', 22.3, 51], ['26850', 'Minsk', 25.5, 48], ['27612', 'Moscú', 28.3, 46],
      ['27595', 'Kazán', 33, 51], ['28434', 'Ekaterimburgo*', 33, 57], ['28698', 'Omsk', 37.4, 61], ['30710', 'Irkutsk', 36.3, 69], ['30777', 'Chitá*', 44, 73.5]];
    const EXTRA = [['7110', 'Brest'], ['24959', 'Yakutsk']];
    const C = { extra: true, man: true };
    const pts = () => {
      const list = TR.map(([id, n, mx, my]) => ({ s: T5.byId(id), n, mx, my })).concat(C.extra ? EXTRA.map(([id, n]) => ({ s: T5.byId(id), n, add: true })) : []);
      return list.map((o) => { const st = T6.stats(o.s.ta.slice(0, 12), o.s.pr.slice(0, 12), o.s.lat); return Object.assign(o, { x: st.amp, y: st.p4 }); });
    };
    const fit = (P) => { const n = P.length, sx = P.reduce((a, p) => a + p.x, 0), sy = P.reduce((a, p) => a + p.y, 0), sxx = P.reduce((a, p) => a + p.x * p.x, 0), sxy = P.reduce((a, p) => a + p.x * p.y, 0); const b = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { b, a: (sy - b * sx) / n }; };
    const ccv = H.h('canvas');
    const cst = H.autoCanvas(ccv, (w) => Math.min(Math.max(w * 0.5, 320), 460), (ctx, w, h) => {
      const P = { l: 50, r: 16, t: 14, b: 40 }, X0 = 5, X1 = 60, Y0 = 20, Y1 = 80;
      const X = (v) => P.l + (v - X0) / (X1 - X0) * (w - P.l - P.r), Y = (v) => h - P.b - (v - Y0) / (Y1 - Y0) * (h - P.t - P.b);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.font = '10.5px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.1)'; ctx.fillStyle = '#5a6878';
      for (let v = 10; v <= X1; v += 10) { ctx.beginPath(); ctx.moveTo(X(v), P.t); ctx.lineTo(X(v), h - P.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(v + ' °C', X(v), h - P.b + 5); }
      for (let v = 20; v <= Y1; v += 10) { ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(w - P.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v + ' %', P.l - 5, Y(v)); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('amplitud térmica anual', (P.l + w - P.r) / 2, h - 6);
      ctx.save(); ctx.translate(12, (P.t + h - P.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('lluvia de mayo a agosto / lluvia anual', 0, 0); ctx.restore();
      const L = pts(), main = L.filter((p) => !p.add), f = fit(main);
      ctx.strokeStyle = '#b4531d'; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(10), Y(f.a + f.b * 10)); ctx.lineTo(X(50), Y(f.a + f.b * 50)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      if (C.man) for (const p of main) { ctx.strokeStyle = 'rgba(28,40,54,.45)'; ctx.beginPath(); ctx.arc(X(p.mx), Y(p.my), 4, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(p.mx), Y(p.my)); ctx.lineTo(X(p.x), Y(p.y)); ctx.stroke(); }
      for (const p of L) { ctx.fillStyle = p.add ? '#5a6878' : '#1f6f8b'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 5, 0, 7); ctx.fill(); }
      T6.labels(ctx, L.map((p) => ({ x: X(p.x), y: Y(p.y), t: p.n })), [P.l, P.t, w - P.r, h - P.b]);
    });
    const chkE = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', checked: true, onchange: (e) => { C.extra = e.target.checked; cst.redraw(); } }), ' Añadir Brest y Yakutsk');
    const chkM = H.h('label', { class: 'chk' }, H.h('input', { type: 'checkbox', checked: true, onchange: (e) => { C.man = e.target.checked; cst.redraw(); } }), ' Posición en la figura del manual (círculos vacíos)');
    // mapa de amplitud térmica (TerraClimate) con las estaciones
    const Ly = T6.layers();
    const AMP = T4.ramp([[5, [40, 90, 170]], [10, [90, 160, 210]], [15, [170, 215, 225]], [20, [240, 236, 200]], [30, [240, 190, 110]], [40, [215, 110, 60]], [55, [140, 40, 50]]]);
    const acol = (lat, lon) => { const k = T6.idx(lat, lon); if (k < 0 || !(Ly.warm[k] === Ly.warm[k])) return null; return AMP(Ly.warm[k] - Ly.cold[k]); };
    const acv = H.h('canvas');
    const amp = T4.map(acv, { bbox: [-12, 125, 35, 70], regional: false, grid: 20, key: () => 'a', land: (lat, lon) => acol(lat, lon) || T4.LAND, color: acol,
      after: (ctx, P) => { const it = []; for (const [id, n] of TR.concat(EXTRA)) { const s = T5.byId(id), x = P.X(s.lon), y = P.Y(s.lat); ctx.fillStyle = '#1c2836'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); it.push({ x, y, t: n, bg: true }); } T6.labels(ctx, it, [0, 0, P.w, P.h], '10px system-ui'); } });
    T4.hover(acv, amp, (lat, lon) => { const k = T6.idx(lat, lon); return k >= 0 && Ly.warm[k] === Ly.warm[k] ? `amplitud ${H.f(Ly.warm[k] - Ly.cold[k], 1)} °C` : null; });
    const c3 = H.h('div', { class: 'card' }, H.h('h3', {}, 'La continentalidad, de Brest a Chitá (fig. 6.14)'),
      H.h('p', { class: 'sub' }, 'Estienne y Godard (1970) relacionaron la amplitud térmica anual con la proporción de la lluvia que cae de mayo a agosto. Aquí, las mismas estaciones con las normales 1991-2020 (* Ekaterimburgo y Chitá no figuran en las normales de la OMM: se usan Krasnoufimsk y Sretensk, en sus mismas regiones). La línea discontinua es el ajuste lineal.'),
      H.h('div', { class: 'viz framed' }, ccv), H.h('div', { class: 'row', style: { marginTop: '6px', justifyContent: 'flex-start', gap: '18px' } }, chkE, chkM),
      H.h('div', { class: 'viz framed', style: { marginTop: '10px' } }, acv), H.html('<p class="hint">Amplitud térmica anual (mes más cálido menos mes más frío), TerraClimate 1991-2020: de menos de 10 °C en la costa atlántica a más de 50 °C en Yakutia.</p>'),
      H.html('<p class="small">La amplitud crece hacia el este porque el océano, que suaviza las temperaturas, queda cada vez más lejos: el invierno se enfría mucho más de lo que se calienta el verano. A la vez, la lluvia se desplaza al verano: en invierno el anticiclón térmico continental bloquea las borrascas del oeste, y en verano el suelo caliente favorece la convección. Varsovia, Brno y Berlín, con amplitudes de 18 a 22 °C, siguen siendo Cfb con el umbral de −3 °C; con el de 0 °C, Varsovia y Brno pasan a Dfb.</p>'));

    /* =============== 4 · Helsinki y Ulán Bator (fig. 6.15) =============== */
    const ha = T6.climoCard(), hb = T6.climoCard();
    const upd4 = () => { ha.set(T6.fromSt(T5.byId('2978'))); const u = T5.byId('44292'); hb.set(Object.assign(T6.fromSt(u), { extra: () => `umbral de aridez ${H.f(KG.aridity(T6.stats(u.ta.slice(0, 12), u.pr.slice(0, 12), u.lat).Tann, T6.stats(u.ta.slice(0, 12), u.pr.slice(0, 12), u.lat).pw, T5.opt.arid))} mm` })); };
    upd4(); T5.onOpt(upd4);
    const c4 = H.h('div', { class: 'card' }, H.h('h3', {}, 'Helsinki y Ulán Bator (fig. 6.15)'),
      H.h('div', { class: 'pairs' }, ha, hb),
      H.html('<p class="small" style="margin-top:8px"><b>Helsinki</b> (Dfb) recibe lluvia todo el año gracias a las borrascas del Báltico, con un máximo al final del verano. <b>Ulán Bator</b> tiene el contraste más fuerte: 74 mm en julio y 2 mm en enero, cuando domina el anticiclón siberiano (de ahí la w de «invierno seco» que le da el manual). Pero con 273 mm al año y 1.300 m de altitud, no llega a su umbral de aridez: con las normales 1991-2020 es una estepa fría (BSk), un clima seco azonal.</p>'));

    /* =============== 5 · climas D en los dos hemisferios =============== */
    const W = T6.W(), K = T6.K(); let dn = 0, ds = 0, ln = 0, ls = 0;
    if (W) for (let j = 0; j < W.ny; j++) { const lat = W.lat0 - (j + 0.5) * W.res, w = Math.cos(lat * H.D2R); for (let i = 0; i < W.nx; i++) { const v = K[j * W.nx + i]; if (!(v > 0)) continue; const isD = KG.CODES[v - 1][0] === 'D'; if (lat >= 0) { ln += w; if (isD) dn += w; } else { ls += w; if (isD) ds += w; } } }
    const c5 = H.h('div', { class: 'card' });
    c5.innerHTML = `<h3>¿Por qué los climas D son del hemisferio norte?</h3><div class="grid3">
      <div class="ro"><div class="k">Hemisferio norte</div><div class="v">${T6.pct(dn / ln * 100)}</div><p class="small" style="margin:.2em 0 0">de las tierras tiene un clima D</p></div>
      <div class="ro"><div class="k">Hemisferio sur</div><div class="v">${ds > 0 ? T6.pct(ds / ls * 100, ds / ls * 100 < 1 ? 2 : 0) : '0 %'}</div><p class="small" style="margin:.2em 0 0">${ds > 0 ? 'de sus tierras (sin la Antártida)' : 'ninguna celda de medio grado de sus tierras (sin la Antártida) con estos criterios'}</p></div>
      <div class="ro"><div class="k">La razón</div><p class="small" style="margin:.3em 0 0">Entre 40° y 65° S casi todo es océano: no hay continentes donde el invierno se enfríe por debajo del umbral C/D. Solo algunos valles y laderas de los Andes, más pequeños que una celda de medio grado, tienen inviernos así.</p></div></div>`;

    /* =============== 6 · rasgos biogeográficos =============== */
    const bio = H.h('div', { class: 'card' });
    bio.innerHTML = `<h3>Ríos, vegetación y suelos</h3>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:16%">Clima</th><th>Ríos</th><th>Vegetación</th><th>Suelos</th></tr></thead><tbody>
      <tr><td>${T6.chip('oce')}</td><td>Régimen pluvial regular, con aguas altas en invierno y crecidas con las borrascas</td><td>Bosque caducifolio de hayas, robles y fresnos, con abundante sotobosque; landas de brezos, tojos y helechos donde se ha degradado</td><td>Pardos, fértiles (cambisoles, las «tierras pardas»); podzoles ácidos y lavados sobre arenas y bajo las landas</td></tr>
      <tr><td>${T6.chip('con')}</td><td>Aguas bajas en invierno (heladas) y crecida de primavera con el deshielo; en los ríos que corren hacia el norte, el hielo del curso bajo bloquea el agua y provoca inundaciones</td><td>Bosque mixto de coníferas y frondosas al norte; hacia el sur y el interior, pradera y estepa de gramíneas</td><td>Luvisoles y podzoles bajo el bosque; chernozems (tierras negras), riquísimos en humus, bajo la pradera; kastanozems en la estepa más seca</td></tr>
      <tr><td>${T6.chip('sba')}</td><td>Como el continental, con más meses helados</td><td>Taiga: coníferas de hoja perenne (abetos, píceas, pinos) y, en Siberia oriental, alerces, que pierden la aguja en invierno</td><td>Podzoles; criosoles con permafrost en Siberia oriental y el norte de Canadá</td></tr>
      </tbody></table></div><p class="small"><a href="#vegetacion">Ver la pestaña «Vegetación y suelos» →</a></p>`;

    el.append(c1, c2, c3, c4, c5, bio,
      H.fix('figs. 6.12-6.15, apartado 2.4', [
        'Fig. 6.12: con las normales 1991-2020 Lyon no es oceánico sino subtropical húmedo (Cfa): su mes más cálido llega a 22,6 °C. El nombre correcto es Innsbruck, no «Innsbruk».',
        'Fig. 6.15: Ulán Bator no es Dwb con 1991-2020, sino BSk: sus 273 mm anuales no alcanzan el umbral de aridez.',
        'Apartado 2.4: en el hemisferio sur no hay climas microtérmicos en «una parte de la Pampa Argentina», que es Cfa y BSk; solo en enclaves de montaña de los Andes.',
        'Fig. 6.14: Sverdlovsk se llama Ekaterimburgo desde 1991, y Tchita es Chitá; ninguna de las dos figura en las normales de la OMM y se usan estaciones de sus regiones.',
      ]),
      H.selfCheck([
        { q: 'Brest y Gander están a la misma latitud, pero Gander tiene inviernos mucho más fríos porque…', opts: ['Está a más altitud que Brest', 'Su viento y su corriente llegan fríos', 'Recibe menos lluvia en invierno', 'Está más cerca del polo'], a: 1, ex: 'A Gander el viento del oeste le llega del interior de Canadá y su costa la baña la corriente del Labrador; Brest recibe el aire del océano templado por la deriva noratlántica.' },
        { q: 'Al avanzar hacia el interior de Eurasia…', opts: ['Disminuye la amplitud térmica anual', 'Aumentan la amplitud y la lluvia de verano', 'La lluvia se concentra en el invierno', 'El invierno se hace más suave'], a: 1, ex: 'Es la fig. 6.14: el anticiclón térmico bloquea las borrascas en invierno y el verano trae lluvias de convección.' },
        { q: 'La w de Dwb significa…', opts: ['Viento fuerte', 'Invierno seco', 'Verano seco', 'Clima de bosque'], a: 1, ex: 'El mes más seco del invierno recibe menos de 1/10 del más lluvioso del verano: el anticiclón siberiano impide la lluvia.' },
        { q: 'Con las normales 1991-2020, Lyon es…', opts: ['Cfb, oceánico', 'Cfa, subtropical húmedo', 'Dfb, continental', 'Csb, mediterráneo'], a: 1, ex: 'Su mes más cálido llega a 22,6 °C: verano «a».' },
      ]));
  },
});
