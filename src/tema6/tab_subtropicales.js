/* ===================== Cs · MEDITERRÁNEO Y CHINO ===================== */
H.tab({
  id: 'subtropicales', nav: 'Mediterráneo y chino', title: 'Mediterráneo y chino',
  init(el) {
    el.append(H.intro('La zona templada · apartados 2.1 y 2.2', 'Dos climas a la misma latitud: el mediterráneo y el chino',
      'Entre 25° y 40° de latitud, los anticiclones subtropicales dominan el verano. En la fachada occidental de los continentes, su flanco oriental hace descender el aire, que se calienta y se estabiliza, y las corrientes frías enfrían su base: verano seco, el clima mediterráneo (Cs). En la oriental, su flanco occidental empuja aire tropical marítimo, cálido y húmedo: verano lluvioso, el clima chino o subtropical húmedo (Cfa). En invierno ambos reciben las borrascas de los vientos del oeste.',
      'Manual: apartados 2.1 y 2.2<br>Cuadros 6.5-6.7; figs. 6.9 y 6.10'));
    el.append(T5.optCtrl());
    const byName = (n) => T5.ST.find((s) => s.name.startsWith(n));

    /* =============== 1 · misma latitud, fachadas opuestas =============== */
    const PAIRS = {
      nam: ['Norteamérica', '72494', '72506', 'San Francisco y Nueva York'],
      eur: ['Eurasia', '8482', '47662', 'Málaga y Tokio'],
      sam: ['Sudamérica', '85577', '87585', 'Santiago de Chile y Buenos Aires'],
      aus: ['Australia', '94608', '94768', 'Perth y Sídney'],
    };
    const pa = T6.climoCard(), pb = T6.climoCard(), pTxt = H.h('div');
    const pct = (s) => `lluvia en el semestre cálido: ${T6.pct(s.pSum)}`;
    const setPair = (k) => {
      const [, ia, ib] = PAIRS[k], A = T5.byId(ia), B = T5.byId(ib);
      pa.set(Object.assign(T6.fromSt(A, `fachada occidental · ${T4.latName(A.lat)} · OMM 1991-2020`), { extra: pct }));
      pb.set(Object.assign(T6.fromSt(B, `fachada oriental · ${T4.latName(B.lat)} · OMM 1991-2020`), { extra: pct }));
      const sa = pa.st, sb = pb.st;
      pTxt.innerHTML = `<p class="small">${T5.stLabel(A)} recibe en verano el ${T6.pct(sa.pSum)} de su lluvia, y ${T5.stLabel(B)}, el ${T6.pct(sb.pSum)}. ${k === 'sam' ? 'Santiago, al pie de los Andes y lejos de la costa, recibe tan poca lluvia que Köppen la clasifica como estepa (BSk), pero su régimen es mediterráneo: casi toda cae en invierno. ' : ''}${k === 'eur' ? 'Tokio, además, recibe los tifones de finales del verano y las lluvias de junio (<i>baiu</i>). ' : ''}La diferencia no es de latitud, sino de posición respecto al anticiclón subtropical y a las corrientes marinas.</p>`;
    };
    const pCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Misma latitud, fachadas opuestas'),
      H.h('p', { class: 'sub' }, 'Parejas de estaciones entre 31° y 41° de latitud: a la izquierda, la fachada occidental de un continente; a la derecha, la oriental.'),
      H.seg(Object.entries(PAIRS).map(([k, v]) => [k, v[0]]), 'nam', setPair), H.h('div', { class: 'pairs', style: { marginTop: '10px' } }, pa, pb), pTxt,
      H.html(`<div class="grid2 even" style="margin-top:6px">
        <div class="ro"><div class="k">Fachada occidental · verano</div><p class="small" style="margin:.3em 0 0">El flanco oriental del anticiclón: aire que desciende y se calienta, estable; corrientes frías (California, Humboldt, Canarias, Benguela, Australia Occidental) que enfrían la base del aire. Ni nubes ni lluvia.</p></div>
        <div class="ro"><div class="k">Fachada oriental · verano</div><p class="small" style="margin:.3em 0 0">El flanco occidental del anticiclón: aire tropical marítimo que llega sobre corrientes cálidas (del Golfo, Kuroshio, Brasil, Australia Oriental), húmedo e inestable. Tormentas, lluvias de monzón y, a finales del verano, ciclones tropicales.</p></div></div>`));
    setPair('nam');

    /* =============== 2 · el clima chino (fig. 6.9) =============== */
    const ca = T6.climoCard(), cb = T6.climoCard(), cc = T6.climoCard();
    const wint = (s) => `lluvia en el semestre frío: ${T6.pct(100 - s.pSum)}`;
    ca.set(Object.assign(T6.fromSt(T5.byId('47817')), { extra: wint })); cb.set(Object.assign(T6.fromSt(T5.byId('72231')), { extra: wint })); cc.set(Object.assign(T6.fromSt(T5.byId('83967')), { extra: wint }));
    const chCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'El clima chino en Asia, América y el hemisferio sur (fig. 6.9)'),
      H.h('p', { class: 'sub' }, 'Nagasaki y Porto Alegre son los climogramas del manual (aquí con 1991-2020); Nueva Orleans se añade para comparar Asia y América a la misma latitud.'),
      H.h('div', { class: 'grid3' }, ca, cb, cc),
      H.html(`<p class="small" style="margin-top:8px"><b>Asia</b> (Nagasaki): máximo en junio-julio, con las lluvias del frente estacionario (<i>baiu</i> en Japón, <i>meiyu</i> en China), y tifones en agosto-septiembre; el invierno es más seco porque el anticiclón siberiano envía aire continental. Donde ese aire domina más, el invierno llega a ser seco: es la variedad Cwa del sur de China o del norte de la India. <b>América del Norte</b> (Nueva Orleans): el anticiclón canadiense es más débil y las borrascas del frente polar llegan en invierno; la lluvia está mejor repartida. <b>Hemisferio sur</b> (Porto Alegre): sin anticiclón continental en invierno, el reparto es casi uniforme y el verano, menos caluroso.</p>`));

    /* =============== 3 · el mediterráneo (fig. 6.10) =============== */
    const ma = T6.climoCard(), mb = T6.climoCard();
    ma.set(T6.fromSt(T5.byId('7650'))); mb.set(T6.fromSt(T5.byId('72494')));
    // Csa y Csb en la cuenca mediterránea (TerraClimate)
    const W = T6.W(); const KS = T6.K(); let nA = 0, nB = 0;
    if (W) for (let j = 0; j < W.ny; j++) { const lat = W.lat0 - (j + 0.5) * W.res; if (lat < 30 || lat > 46) continue; for (let i = 0; i < W.nx; i++) { const lon = W.lon0 + (i + 0.5) * W.res; if (lon < -6 || lon > 37) continue; const v = KS[j * W.nx + i]; if (!(v > 0)) continue; const t = KG.CODES[v - 1]; if (t === 'Csa') nA++; else if (t === 'Csb') nB++; } }
    const medCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Csa y Csb (fig. 6.10)'),
      H.h('p', { class: 'sub' }, 'Marsella y, en lugar de Oporto (que no figura en las normales de la OMM), San Francisco: un mediterráneo de verano caluroso y otro de verano templado por una corriente fría.'),
      H.h('div', { class: 'pairs' }, ma, mb),
      H.html(`<p class="small" style="margin-top:8px">Köppen separa Csa y Csb solo por la temperatura del mes más cálido: 22 °C o más (a) o menos (b). No es una cuestión de corrientes: el verano templado puede deberse a una corriente fría (San Francisco, Ciudad del Cabo), al océano (Oporto, Galicia) o a la altitud (buena parte del interior de la Península). En la cuenca mediterránea, el ${T6.pct(nB / (nA + nB || 1) * 100)} de las celdas Cs son Csb (TerraClimate 1991-2020), y en España hay 1.302 municipios Csb. San Francisco muestra además el rasgo más típico de las costas con corriente fría: el mes más cálido es septiembre, porque en julio y agosto las nieblas del afloramiento enfrían la costa.</p>`));

    /* =============== 4 · los vientos del Mediterráneo =============== */
    const WINDS = [
      ['Mistral', [4.9, 45.6], [4.6, 43.0], 'f', 'Del norte por el valle del Ródano'], ['Tramontana', [2.4, 42.9], [3.4, 41.8], 'f', 'Del norte, en el Rosellón, el Ampurdán y Menorca'],
      ['Cierzo', [-2.0, 42.3], [-0.4, 41.4], 'f', 'Del noroeste por el valle del Ebro'], ['Bora', [15.0, 45.6], [14.1, 44.1], 'f', 'Del nordeste, cae sobre la costa dálmata'],
      ['Etesios (meltemi)', [25.2, 40.8], [25.0, 37.0], 'f', 'Del norte en el Egeo, en verano'], ['Levante', [-1.4, 36.95], [-5.0, 36.4], 'n', 'Del este por el estrecho de Gibraltar'],
      ['Poniente', [-7.0, 35.45], [-3.9, 35.8], 'n', 'Del oeste por el estrecho'], ['Siroco', [11.0, 33.4], [13.6, 37.6], 'c', 'Del sur o sureste, cálido y cargado de polvo; húmedo al cruzar el mar'],
      ['Chergui', [-1.8, 33.6], [-5.6, 34.5], 'c', 'Del este en Marruecos, muy cálido y seco'], ['Ghibli', [14.5, 29.6], [14.0, 32.5], 'c', 'Del sur en Libia'],
      ['Jamsín', [29.5, 28.8], [31.6, 31.2], 'c', 'Del sur en Egipto, en primavera'],
    ];
    const wcv = H.h('canvas');
    const WC = { f: '#2c5f9e', c: '#b4381d', n: '#5a6878' };
    const wmp = T4.map(wcv, { bbox: [-9, 36, 28, 47.5], regional: true, grid: 5, key: () => 'w', land: [236, 226, 200],
      after: (ctx, P) => {
        ctx.font = 'bold 11px system-ui';
        for (const [n, a, b, k] of WINDS) {
          const x0 = P.X(a[0]), y0 = P.Y(a[1]), x1 = P.X(b[0]), y1 = P.Y(b[1]), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          ctx.strokeStyle = WC[k]; ctx.fillStyle = WC[k]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * 8, y1 - uy * 8); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * 11 - uy * 6, y1 - uy * 11 + ux * 6); ctx.lineTo(x1 - ux * 11 + uy * 6, y1 - uy * 11 - ux * 6); ctx.closePath(); ctx.fill();
          const tw = ctx.measureText(n).width; const lx = x0 - (ux > 0 ? tw + 4 : -4) * 0.5 - tw / 2 + (ux > 0 ? -tw / 2 : tw / 2) * 0, ly = y0 - 8;
          ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(lx - 2, ly - 10, tw + 4, 13); ctx.fillStyle = WC[k]; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(n, lx, ly);
        }
        ctx.lineWidth = 1;
      } });
    T4.hover(wcv, wmp, (lat, lon) => { let b = null, bd = 1e9; for (const w of WINDS) { const d = Math.hypot(w[1][0] - lon, w[1][1] - lat); if (d < bd) { bd = d; b = w; } } return bd < 1.6 ? `<b>${b[0]}</b>: ${b[4]}` : null; });
    const wCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Los vientos regionales del Mediterráneo'),
      H.h('p', { class: 'sub' }, 'Ilustración propia. En azul, vientos del norte, fríos o frescos, que bajan de las montañas o del interior de Europa hacia el mar (casi todos en invierno; los etesios, en verano); en rojo, vientos cálidos que llegan del Sáhara; en gris, los del estrecho. Pasa el puntero por el origen de cada flecha.'),
      H.h('div', { class: 'viz framed' }, wcv));

    /* =============== 5 · balance hídrico (ejercicio 2) =============== */
    const OPTS = [['7650', 'Marsella (Csa)'], ['27612', 'Moscú (Dfb)'], ['8391', 'Sevilla (Csa)'], ['72231', 'Nueva Orleans (Cfa)'], ['7110', 'Brest (Cfb)'], ['mun', 'Tu municipio']];
    const balChart = (sel0) => {
      const box = H.h('div', { class: 'ccard' });
      const sel = H.h('select', { 'aria-label': 'Estación' }); OPTS.forEach(([v, n]) => sel.append(H.h('option', { value: v }, n))); sel.value = sel0;
      const cv = H.h('canvas'), out = H.h('div');
      let data = null;
      const st = H.autoCanvas(cv, (w) => Math.min(w * 0.6, 280), (ctx, w, h) => {
        if (!data) return;
        const { b, name } = data, P = { l: 40, r: 10, t: 22, b: 22 }, mx = Math.max(...b.months.map((o) => Math.max(o.p, o.etp)), 50) * 1.08;
        const X = (i) => P.l + i * (w - P.l - P.r) / 12, Y = (v) => h - P.b - v / mx * (h - P.t - P.b), bw = (w - P.l - P.r) / 12;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        ctx.font = '10px system-ui'; ctx.strokeStyle = 'rgba(28,40,54,.1)'; ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        const step = mx > 300 ? 100 : mx > 150 ? 50 : 25;
        for (let v = 0; v <= mx; v += step) { ctx.beginPath(); ctx.moveTo(P.l, Y(v)); ctx.lineTo(w - P.r, Y(v)); ctx.stroke(); ctx.fillText(H.f(v), P.l - 4, Y(v)); }
        b.months.forEach((o, i) => {
          ctx.fillStyle = 'rgba(31,111,139,.75)'; ctx.fillRect(X(i) + bw * 0.18, Y(o.p), bw * 0.64, Y(0) - Y(o.p));
          if (o.def > 0.5) { ctx.fillStyle = 'rgba(212,120,40,.45)'; ctx.fillRect(X(i) + bw * 0.05, Y(o.etp), bw * 0.9, Y(o.etr) - Y(o.etp)); }
          if (o.exc > 0.5) { ctx.fillStyle = 'rgba(40,90,170,.35)'; ctx.fillRect(X(i) + bw * 0.05, Y(o.etp + o.exc), bw * 0.9, Y(o.etp) - Y(o.etp + o.exc)); }
        });
        const line = (k, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash || []); ctx.beginPath(); b.months.forEach((o, i) => { const x = X(i) + bw / 2, y = Y(o[k]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; };
        line('etp', '#b0393a'); line('etr', '#d08a00', [5, 3]);
        ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; H.MES3.forEach((m, i) => ctx.fillText(m, X(i) + bw / 2, h - P.b + 5));
        ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.fillText(name, P.l, 4);
        ctx.strokeStyle = '#1c2836'; ctx.beginPath(); ctx.moveTo(P.l, P.t); ctx.lineTo(P.l, Y(0)); ctx.lineTo(w - P.r, Y(0)); ctx.stroke();
      });
      const upd = () => {
        let c;
        if (sel.value === 'mun') { const pc = T5.placeClimate(); c = { T: pc.T, P: pc.P, lat: pc.lat, name: H.placeLabel() }; }
        else { const s = T5.byId(sel.value); c = { T: s.ta.slice(0, 12), P: s.pr.slice(0, 12), lat: s.lat, name: T5.stLabel(s) }; }
        const b = T6.thornthwaite(c.T, c.P, c.lat); data = { b, name: c.name }; st.redraw();
        const dm = b.months.filter((o) => o.def > 5).map((o) => H.MES3[o.m]), em = b.months.filter((o) => o.exc > 5).map((o) => H.MES3[o.m]);
        out.innerHTML = `<div class="cc-num">ETP ${H.f(b.ETP)} mm · ETR ${H.f(b.ETR)} mm · <b style="color:#b8641d">déficit ${H.f(b.DEF)} mm</b>${dm.length ? ' (' + dm.join(', ') + ')' : ''} · <b style="color:#285aaa">exceso ${H.f(b.EXC)} mm</b>${em.length ? ' (' + em.join(', ') + ')' : ''}</div>`;
      };
      sel.onchange = upd; H.onPlace(() => { if (sel.value === 'mun') upd(); });
      box.append(sel, H.h('div', { class: 'viz framed' }, cv), out); upd();
      return box;
    };
    const bCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'El balance hídrico: ¿cuándo falta agua? (ejercicio 2)'),
      H.h('p', { class: 'sub' }, 'Balance de Thornthwaite con una reserva de agua en el suelo de 100 mm. Barras: precipitación; línea roja: evapotranspiración potencial (ETP, la que habría con agua suficiente); discontinua: la real (ETR). En naranja, el déficit (agua que las plantas necesitarían y no tienen); en azul, el exceso que escurre hacia los ríos.'),
      H.h('div', { class: 'pairs' }, balChart('7650'), balChart('27612')),
      H.openQ('Compara el mediterráneo y el continental: ¿en qué meses falta agua y por qué?', 'En el mediterráneo (Marsella) el déficit se concentra en junio-septiembre: la máxima ETP coincide con el mínimo de lluvia, porque el verano está dominado por el anticiclón subtropical. En el continental (Moscú) llueve más en verano, cuando la ETP es mayor, y apenas hay déficit; y en invierno la ETP es nula porque la temperatura está por debajo de 0 °C. El modelo pone el exceso en invierno; en la realidad, la nieve lo retiene hasta el deshielo de primavera, cuando crecen los ríos. La diferencia de régimen se debe a que el mediterráneo recibe la lluvia de las borrascas invernales del oeste y el continental, de la convección y las borrascas de verano, cuando el anticiclón térmico invernal desaparece.'));

    /* =============== 6 · rasgos biogeográficos =============== */
    const bio = H.h('div', { class: 'card' });
    bio.innerHTML = `<h3>Ríos, vegetación y suelos</h3>
      <div style="overflow-x:auto"><table class="t"><thead><tr><th style="width:16%">Clima</th><th>Ríos</th><th>Vegetación</th><th>Suelos</th></tr></thead><tbody>
      <tr><td>${T6.chip('chi')}</td><td>Aguas altas en verano y bajas en invierno, sin estiaje fuerte (Yangtsé)</td><td>Bosques mixtos de frondosas perennes (laurel, alcanforero), caducifolias (robles, castaños) y coníferas, con bambúes y un sotobosque denso</td><td>Rojos y amarillos, lavados y ácidos, ricos en óxidos de hierro y arcilla (acrisoles y alisoles)</td></tr>
      <tr><td>${T6.chip('med')}</td><td>Muy irregulares: estiaje en verano y crecidas súbitas en otoño (ramblas)</td><td>Bosque esclerófilo de hoja perenne, pequeña y coriácea (encina, alcornoque, acebuche, pino carrasco); al degradarse, maquis sobre suelos silíceos (jara, brezo, madroño) y garriga sobre calizas (coscoja, romero, tomillo)</td><td>Pardos y rojos con arcilla acumulada (luvisoles crómicos); la terra rossa sobre calizas; costras calizas en las zonas más secas</td></tr>
      </tbody></table></div><p class="small"><a href="#vegetacion">Ver la pestaña «Vegetación y suelos» →</a></p>`;

    el.append(pCard, chCard, medCard, wCard, bCard, bio,
      H.fix('cuadros 6.5 y 6.7, apartado 2.2', [
        'Cuadro 6.5: s no exige que el mes más seco sea «muy inferior a 30 mm»: el mes más seco del verano ha de recibir menos de 30 mm (40 en los mapas actuales) y menos de un tercio del más lluvioso del invierno. Para Cf, «el mes más seco supera los 30 mm» no es un criterio: f significa que no se cumplen ni s ni w.',
        'Csa y Csb no se distinguen por estar en la cuenca mediterránea o junto a una corriente fría, sino por el mes más cálido (22 °C). En la cuenca mediterránea también hay Csb, sobre todo donde la altitud suaviza el verano: en España, 1.302 municipios.',
        'Cuadro 6.7: la «beta dálmata» es la bora; el «chehili» es el nombre magrebí del siroco local (chergui en Marruecos, chili en Túnez); el «shirocco», el siroco.',
        'La baja del golfo de Génova no es una baja térmica sino, sobre todo, una ciclogénesis de sotavento al pie de los Alpes, que el mar cálido refuerza.',
        'Fig. 6.10: Oporto no figura en las normales de la OMM; se usa San Francisco, de clima Csb por la corriente fría de California.',
      ]),
      H.selfCheck([
        { q: 'El verano seco del clima mediterráneo se debe sobre todo a…', opts: ['Las borrascas del frente polar', 'El anticiclón subtropical', 'Las corrientes marinas cálidas', 'El monzón de verano'], a: 1, ex: 'En verano el anticiclón se desplaza hacia el polo y su aire, que desciende, impide las lluvias; en invierno baja y deja pasar las borrascas del oeste.' },
        { q: 'A la latitud de San Francisco, la costa este de Norteamérica tiene…', opts: ['Un clima mediterráneo', 'Un clima subtropical húmedo', 'Un desierto costero', 'Un clima de tundra'], a: 1, ex: 'Nueva York es Cfa: el aire tropical marítimo del flanco occidental del anticiclón le da veranos húmedos.' },
        { q: 'Csa y Csb se distinguen por…', opts: ['La cantidad de lluvia de invierno', 'La temperatura del mes más cálido', 'La presencia de corrientes frías', 'La duración de la sequía'], a: 1, ex: 'Con 22 °C o más en el mes más cálido, Csa; con menos, Csb.' },
        { q: 'En el balance hídrico de un clima mediterráneo, el déficit se concentra en…', opts: ['Los meses de invierno', 'Los meses de verano', 'La primavera', 'Se reparte por igual'], a: 1, ex: 'La máxima evapotranspiración coincide con la mínima lluvia.' },
      ]));
  },
});
