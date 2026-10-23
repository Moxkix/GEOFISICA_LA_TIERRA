/* ===================== Z · EL MOSAICO ZONAL ===================== */
H.tab({
  id: 'mosaico', nav: 'El mosaico zonal', title: 'El mosaico zonal',
  init(el) {
    el.append(H.intro('Los climas zonales · introducción del tema', 'Tres zonas, doce climas',
      'Los climas zonales siguen a las zonas térmicas de la Tierra: la intertropical, la templada y la polar. Dentro de cada zona, la circulación general, la distribución de tierras y mares, el relieve y las corrientes marinas reparten climas distintos según la latitud y según la posición en el continente: fachada occidental, interior o fachada oriental. El mapa traduce cada tipo de Köppen (TerraClimate 1991-2020) al nombre que usa el manual.',
      'Manual: introducción y apartados 1-3<br>Figs. 6.1 y 6.9'));
    el.append(T5.optCtrl());
    const W = T6.W(), L = T6.layers();
    if (!W || !L) { el.append(H.info('Esta pestaña necesita el mapa mundial de TerraClimate.')); return; }
    const D2R = H.D2R;

    /* ---------- mapa ---------- */
    const S = { mode: 'zon', filt: null, sel: null };
    const card = H.h('div', { class: 'card' });
    const cv = H.h('canvas');
    const fade = (c) => H.mix(c, [244, 241, 234], 0.8);
    const colorAt = (lat, lon) => {
      const t = T6.typeAt(lat, lon);
      if (!t) return lat < -60 ? fade(KG.COL.EF) : T4.LAND;
      const z = T6.zonal(t), c = S.mode === 'zon' ? T6.col(z) : KG.COL[t];
      return S.filt && S.filt !== z ? fade(c) : c;
    };
    const mark = (ctx, P) => { if (!S.sel) return; const x = P.X(S.sel.lon), y = P.Y(S.sel.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1; };
    const mp = T4.map(cv, { bbox: [-180, 180, -60, 84], grid: 30, key: () => [S.mode, S.filt, T5.combo()].join('|'), land: colorAt, color: (lat, lon) => (T6.typeAt(lat, lon) ? colorAt(lat, lon) : null), after: mark });
    T4.hover(cv, mp, (lat, lon) => { const t = T6.typeAt(lat, lon); return t ? `${T6.ZON[T6.zonal(t)].s} · ${t}` : null; });
    cv.addEventListener('click', (e) => { if (!mp.P) return; const [x, y] = mp.pos(e); const [lat, lon] = mp.P.inv(x, y); const c = T5.cell(lat, lon); if (c) { S.sel = c; mp.redraw(); updSel(); } });
    const modeSeg = H.seg([['zon', 'Climas zonales (manual)'], ['kop', 'Tipos de Köppen']], S.mode, (v) => { S.mode = v; mp.invalidate(); });
    const leg = H.h('div');
    const drawLeg = () => { leg.innerHTML = ''; leg.append(T6.legend((k) => { S.filt = S.filt === k ? null : k; mp.invalidate(); drawLeg(); drawProf(); }, (k) => S.filt === k)); };
    drawLeg();
    card.append(H.h('div', { class: 'row', style: { marginBottom: '8px' } }, H.h('div', { style: { flex: '1 1 300px' } }, modeSeg)),
      H.h('div', { class: 'viz framed' }, cv), H.h('div', { style: { height: '8px' } }), leg,
      H.html('<p class="hint">Pulsa un clima de la leyenda para resaltarlo y un punto del mapa para ver su climograma. Correspondencia con Köppen: ecuatorial = Af; monzónico = Am; sabana = Aw; chino = Cfa y Cwa; mediterráneo = Cs; templado de altura = Cwb y Cwc; oceánico = Cfb y Cfc; continental = D con verano a o b; subártico = D con verano c o d; tundra = ET; hielo perpetuo = EF. Los climas secos (B) son azonales y se estudian en el Tema 5.</p>'));

    /* ---------- punto elegido ---------- */
    const sel = H.h('div', { class: 'card' });
    const cc = T6.climoCard();
    const sOut = H.h('div');
    const updSel = () => {
      const c = S.sel; if (!c) return;
      cc.set(T6.fromCell(c));
      const z = T6.zonal(cc.res.type), Z = T6.ZON[z];
      const go = Z.tab === 'T5' ? `<a href="${H.T5}#secos">Tema 5, «Climas secos» →</a>` : `<a href="#${Z.tab}">Ver «${T6.TABNAME[Z.tab]}» →</a>`;
      sOut.innerHTML = `<p><b>${Z.n}</b> · ${T6.ZONA[Z.z]}</p><p class="small">${go}</p>`;
    };
    sel.append(H.h('h3', {}, 'El punto elegido'), H.h('div', { class: 'grid2' }, cc, sOut));
    S.sel = T5.cell(H.place.lat, H.place.lon); updSel(); T5.onOpt(() => { updSel(); mp.invalidate(); prof = null; ideal = null; drawProf(); drawIdeal(); });

    /* ---------- reparto por latitudes ---------- */
    const BAND = 5, LAT0 = 85, NB = Math.round((85 + 60) / BAND);
    let prof = null;
    const calcProf = () => {
      const C = T6.cats(), acc = Array.from({ length: NB }, () => new Float64Array(T6.KEYS.length)), tot = new Float64Array(NB);
      for (let j = 0; j < W.ny; j++) {
        const lat = W.lat0 - (j + 0.5) * W.res, b = Math.floor((LAT0 - lat) / BAND), w = Math.cos(lat * D2R);
        if (b < 0 || b >= NB) continue;
        for (let i = 0; i < W.nx; i++) { const c = C[j * W.nx + i]; if (c < 0) continue; acc[b][c] += w; tot[b] += w; }
      }
      return { acc, tot };
    };
    const pcv = H.h('canvas');
    const pst = H.autoCanvas(pcv, (w) => Math.min(Math.max(w * 0.95, 420), 660), (ctx, w, h) => {
      if (!prof) prof = calcProf();
      const P = { l: 46, r: 12, t: 8, b: 26 }, bh = (h - P.t - P.b) / NB, X = (v) => P.l + v * (w - P.l - P.r);
      ctx.font = '10px system-ui'; ctx.textBaseline = 'middle';
      for (let b = 0; b < NB; b++) {
        const y = P.t + b * bh, tot = prof.tot[b]; if (!tot) continue;
        let x0 = 0;
        T6.KEYS.forEach((k, ci) => {
          const f = prof.acc[b][ci] / tot; if (!f) return;
          const c = T6.col(k); ctx.fillStyle = `rgb(${(S.filt && S.filt !== k ? H.mix(c, [244, 241, 234], 0.8) : c).map(Math.round).join(',')})`;
          ctx.fillRect(X(x0), y + 0.5, X(x0 + f) - X(x0) + 0.4, bh - 1); x0 += f;
        });
      }
      ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right';
      for (let lat = 80; lat >= -60; lat -= 20) ctx.fillText(T4.latName(lat).replace('0° N', '0°'), P.l - 5, P.t + (LAT0 - lat) / BAND * bh);
      ctx.strokeStyle = 'rgba(28,40,54,.6)'; ctx.setLineDash([4, 3]);
      for (const lat of [23.44, -23.44, 66.56]) { const y = P.t + (LAT0 - lat) / BAND * bh; ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w - P.r, y); ctx.stroke(); }
      ctx.setLineDash([]); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let v = 0; v <= 1; v += 0.25) ctx.fillText(H.f(v * 100) + ' %', X(v), h - P.b + 6);
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      for (const [t, lat] of [['trópico de Cáncer', 23.44], ['trópico de Capricornio', -23.44], ['círculo polar ártico', 66.56]]) {
        const y = P.t + (LAT0 - lat) / BAND * bh - 2, tw = ctx.measureText(t).width + 6; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(w - P.r - tw - 2, y - 12, tw, 12); ctx.fillStyle = '#1c2836'; ctx.fillText(t, w - P.r - 5, y);
      }
    });
    const drawProf = () => pst.redraw();
    const pcard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Cómo se reparten por latitudes'),
      H.h('p', { class: 'sub' }, 'Proporción de la superficie emergida de cada franja de 5° ocupada por cada clima (TerraClimate 1991-2020; sin la Antártida). Es la «zonalidad»: el clima cambia sobre todo con la latitud, pero cada franja mezcla varios climas según la posición en el continente.'),
      H.h('div', { class: 'viz framed' }, pcv));

    /* ---------- el continente ideal ---------- */
    const NBIN = 12, IB = 5, ILAT0 = 80, INB = Math.round((80 + 60) / IB);
    let ideal = null;
    const calcIdeal = () => {
      const C = T6.cats(), acc = Array.from({ length: INB }, () => Array.from({ length: NBIN }, () => new Float64Array(T6.KEYS.length))), len = new Float64Array(INB), rows = new Float64Array(INB);
      const MIN = Math.round(9 / W.res); // continentes: tramos de tierra de más de 9° de longitud (deja fuera las islas, no la Patagonia)
      for (let j = 0; j < W.ny; j++) {
        const lat = W.lat0 - (j + 0.5) * W.res, b = Math.floor((ILAT0 - lat) / IB), w = Math.cos(lat * D2R); if (b < 0 || b >= INB) continue;
        rows[b] += 1;
        const row = (i) => C[j * W.nx + ((i % W.nx) + W.nx) % W.nx];
        let s0 = 0; while (s0 < W.nx && row(s0) >= 0) s0++; if (s0 === W.nx) continue; // empieza en el mar
        let i = s0;
        while (i < s0 + W.nx) {
          if (row(i) < 0) { i++; continue; }
          let e = i; while (e < s0 + W.nx && row(e) >= 0) e++;
          const n = e - i;
          if (n >= MIN) { len[b] += n * w; for (let q = i; q < e; q++) { const bin = Math.min(NBIN - 1, Math.floor((q - i + 0.5) / n * NBIN)); acc[b][bin][row(q)] += w; } }
          i = e;
        }
      }
      const width = Array.from(len, (v, b) => (rows[b] ? v / rows[b] : 0)), mx = Math.max(...width);
      return { acc, width: width.map((v) => v / mx) };
    };
    const icv = H.h('canvas');
    const ist = H.autoCanvas(icv, (w) => Math.min(Math.max(w * 0.9, 420), 640), (ctx, w, h) => {
      if (!ideal) ideal = calcIdeal();
      const P = { l: 52, r: 20, t: 26, b: 10 }, bh = (h - P.t - P.b) / INB, cx = P.l + (w - P.l - P.r) / 2, half = (w - P.l - P.r) / 2;
      ctx.font = '10px system-ui'; ctx.textBaseline = 'middle';
      ist.cells = [];
      for (let b = 0; b < INB; b++) {
        const ww = ideal.width[b] * half; if (ww < 2) continue;
        const y = P.t + b * bh, x0 = cx - ww, bw = 2 * ww / NBIN;
        for (let q = 0; q < NBIN; q++) {
          const a = ideal.acc[b][q]; let best = -1, bv = 0, sum = 0; a.forEach((v, ci) => { sum += v; if (v > bv) { bv = v; best = ci; } });
          if (best < 0) continue;
          const k = T6.KEYS[best], c = T6.col(k);
          ctx.fillStyle = `rgb(${(S.filt && S.filt !== k ? H.mix(c, [244, 241, 234], 0.8) : c).map(Math.round).join(',')})`;
          ctx.fillRect(x0 + q * bw, y, bw + 0.5, bh + 0.5);
          ist.cells.push([x0 + q * bw, y, bw, bh, k, bv / sum, b]);
        }
      }
      ctx.strokeStyle = 'rgba(28,40,54,.55)'; ctx.setLineDash([4, 3]);
      for (const lat of [0, 23.44, -23.44, 66.56]) { const y = P.t + (ILAT0 - lat) / IB * bh; ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(w - P.r, y); ctx.stroke(); }
      ctx.setLineDash([]); ctx.fillStyle = '#5a6878'; ctx.textAlign = 'right';
      for (let lat = 80; lat >= -60; lat -= 20) ctx.fillText(T4.latName(lat).replace('0° N', '0°'), P.l - 6, P.t + (ILAT0 - lat) / IB * bh);
      ctx.textAlign = 'left'; ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textBaseline = 'top';
      ctx.fillText('← fachada occidental', P.l, 4); ctx.textAlign = 'right'; ctx.fillText('fachada oriental →', w - P.r, 4);
      ctx.textAlign = 'center'; ctx.font = '10.5px system-ui'; ctx.fillStyle = '#5a6878'; ctx.fillText('interior', cx, 6);
    });
    const itip = H.h('div', { class: 'tooltip' });
    icv.addEventListener('mousemove', (e) => {
      const [x, y] = ist.pos(e), c = (ist.cells || []).find(([cx, cy, cw, ch]) => x >= cx && x < cx + cw && y >= cy && y < cy + ch);
      if (!c) { itip.style.display = 'none'; return; }
      const lat1 = ILAT0 - c[6] * IB; itip.innerHTML = `${T6.ZON[c[4]].s}: ${T6.pct(c[5] * 100)} de esa franja y posición (${T4.latName(lat1 - IB)}-${T4.latName(lat1)})`;
      itip.style.display = 'block'; itip.style.left = (x / ist.w * 100) + '%'; itip.style.top = (y / ist.h * 100) + '%'; itip.style.transform = `translate(${x / ist.w > 0.7 ? '-100%' : x / ist.w < 0.3 ? '0' : '-50%'}, -120%)`;
    });
    icv.addEventListener('mouseleave', () => { itip.style.display = 'none'; });
    const drawIdeal = () => ist.redraw();
    const icard = H.h('div', { class: 'card' }, H.h('h3', {}, 'El «continente ideal», calculado con datos reales'),
      H.h('p', { class: 'sub' }, 'Cada continente (los tramos de tierra de más de 9° de longitud, sin las islas) se estira a la misma anchura y se divide en doce partes de oeste a este; en cada franja de 5° y cada parte se pinta el clima más frecuente. La anchura de la figura es proporcional a la extensión de tierra en esa latitud.'),
      H.h('div', { class: 'viz framed', style: { position: 'relative' } }, icv, itip),
      H.html(`<div class="grid3" style="margin-top:10px">
        <div class="ro"><div class="k">Fachada occidental</div><p class="small" style="margin:.3em 0 0">Desiertos costeros entre 15° y 30° (anticiclones y corrientes frías), <b>mediterráneo</b> entre 30° y 40° y <b>oceánico</b> entre 40° y 60°: los vientos del oeste llegan del mar.</p></div>
        <div class="ro"><div class="k">Interior</div><p class="small" style="margin:.3em 0 0">Los climas secos se adentran en el continente; en el hemisferio norte, el <b>continental</b> y el <b>subártico</b> ocupan casi toda la anchura entre 40° y 65°.</p></div>
        <div class="ro"><div class="k">Fachada oriental</div><p class="small" style="margin:.3em 0 0">Más húmeda en latitudes bajas: el <b>chino</b> entre 25° y 35° (aire tropical marítimo y corrientes cálidas) y, más al norte, el continental, con inviernos fríos aunque esté junto al mar.</p></div></div>`));

    /* ---------- factores ---------- */
    const fac = H.h('div', { class: 'card' });
    fac.innerHTML = `<h3>Por qué el mosaico no es una simple sucesión de bandas</h3>
      <div class="grid2 even">
        <div><p class="small"><b>La circulación general.</b> Las bajas presiones ecuatoriales y la convergencia de los alisios (ZCIT) dan lluvia todo el año en el ecuador; los anticiclones subtropicales, sequía en torno a 20°-30°; los vientos del oeste y el frente polar, lluvias frontales en las latitudes medias. El balanceo estacional de estos cinturones (Tema 3) crea los climas de transición con una estación seca: la sabana hacia los trópicos y el mediterráneo hacia los 35°-40°.</p>
        <p class="small"><b>La latitud</b> fija la radiación solar y, con ella, la temperatura: las isotermas del mes más frío (18 °C) y del mes más cálido (10 °C) delimitan las tres zonas de Köppen.</p></div>
        <div><p class="small"><b>La distribución de tierras y mares.</b> El hemisferio norte tiene grandes continentes en las latitudes medias, con anticiclones térmicos en invierno: allí están los climas continentales y subárticos, que casi no existen en el hemisferio sur.</p>
        <p class="small"><b>Las corrientes marinas y la posición en el continente.</b> Las corrientes frías de las fachadas occidentales tropicales secan la costa; las cálidas de las orientales la humedecen (Tema 4). En latitudes medias, en cambio, la fachada occidental recibe el aire templado del océano y la oriental, el aire frío del continente.</p></div>
      </div>`;

    el.append(card, sel, H.h('div', { class: 'grid2 even' }, pcard, icard), fac,
      H.fix('introducción y apartado 1', ['La zona intertropical no ocupa «el 20 por 100 de las tierras emergidas»: entre los trópicos está más de un tercio de las tierras (en torno al 35 %, contando la Antártida; el 38 % sin ella).',
        'Fig. 6.1: el mapa del manual es el de Geiger y Pohl, con datos de la primera mitad del siglo XX. Aquí se usa la normal 1991-2020; en el mapa mundial del Tema 5 puedes ver qué ha cambiado desde 1961-1990.']),
      H.selfCheck([
        { q: 'Entre 30° y 40° de latitud, en la fachada occidental de los continentes, domina el clima…', opts: ['Mediterráneo, con verano seco', 'Chino, con lluvias de verano', 'Continental, con inviernos fríos', 'Ecuatorial, sin estación seca'], a: 0, ex: 'California, Chile central, el Mediterráneo, la región del Cabo y el suroeste de Australia: en verano los domina el anticiclón subtropical.' },
        { q: 'A la misma latitud que el mediterráneo, en la fachada oriental, aparece el clima…', opts: ['Desértico costero', 'Chino (subtropical húmedo)', 'Oceánico de verano fresco', 'Tundra'], a: 1, ex: 'El aire tropical marítimo, que llega por el flanco occidental del anticiclón y sobre corrientes cálidas, da veranos húmedos y calurosos.' },
        { q: 'Los climas continentales y subárticos (D) apenas existen en el hemisferio sur porque…', opts: ['Allí el frente polar no existe', 'Faltan continentes en las latitudes en que se forman', 'Las corrientes cálidas los impiden', 'Están cubiertos por el hielo antártico'], a: 1, ex: 'Entre 40° y 65° S casi todo es océano, que suaviza los inviernos.' },
        { q: 'La zona intertropical ocupa, aproximadamente,…', opts: ['El 20 % de las tierras emergidas', 'Más de un tercio de las tierras emergidas', 'La mitad de las tierras emergidas', 'El 5 % de las tierras emergidas'], a: 1, ex: 'Unos 35 % con la Antártida, 38 % sin ella: el manual dice el 20 %.' },
      ]));
  },
});
