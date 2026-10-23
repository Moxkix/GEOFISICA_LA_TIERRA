/* ===================== V · VEGETACIÓN Y SUELOS ===================== */
H.tab({
  id: 'vegetacion', nav: 'Vegetación y suelos', title: 'Vegetación y suelos',
  init(el) {
    el.append(H.intro('Rasgos biogeográficos de los climas zonales', 'Cada clima, su paisaje',
      'El clima decide qué plantas pueden vivir en un lugar y cómo se forma el suelo bajo ellas: la vegetación y los suelos son la huella más visible de los climas zonales. Aquí se comparan, celda a celda, los climas de Köppen con los biomas (las grandes formaciones vegetales) delimitados por RESOLVE (Dinerstein y otros, 2017), y se dibujan los perfiles de vegetación y de suelo de cada clima.',
      'Manual: «Rasgos biogeográficos»<br>de cada clima; figs. 6.4, 6.6, 6.11, 6.13, 6.16 y 6.19'));
    const B = T6.DATA().BIOMAS, W = T6.W(), D2R = H.D2R;

    /* =============== 1 · mapa de biomas y comparación con los climas =============== */
    const cards = [];
    if (B && B.B && W) {
      const bioAt = (lat, lon) => { const j = Math.floor((B.lat0 - lat) / B.res), i = ((Math.floor((lon - B.lon0) / B.res) % B.nx) + B.nx) % B.nx; if (j < 0 || j >= B.ny) return NaN; return B.B[j * B.nx + i]; };
      const S = { mode: 'bio', filt: null, sel: T5.cell(H.place.lat, H.place.lon) };
      const fade = (c) => H.mix(c, [244, 241, 234], 0.8);
      const col = (lat, lon) => {
        if (S.mode === 'bio') { const b = bioAt(lat, lon); if (!(b === b)) return null; const c = T6.biomeCol(b); return S.filt && S.filt !== b ? fade(c) : c; }
        const t = T6.typeAt(lat, lon); return t ? T6.col(T6.zonal(t)) : null;
      };
      const cv = H.h('canvas');
      const mp = T4.map(cv, { bbox: [-180, 180, -60, 84], grid: 30, key: () => S.mode + S.filt, land: (lat, lon) => col(lat, lon) || T4.LAND, color: col,
        after: (ctx, P) => { if (S.sel) { const x = P.X(S.sel.lon), y = P.Y(S.sel.lat); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.stroke(); ctx.lineWidth = 1; } } });
      T4.hover(cv, mp, (lat, lon) => { const b = bioAt(lat, lon), t = T6.typeAt(lat, lon); if (!(b === b) && !t) return null; return `${b === b ? T6.biomeName(b) : '—'}${t ? ' · ' + T6.ZON[T6.zonal(t)].s + ' (' + t + ')' : ''}`; });
      cv.addEventListener('click', (e) => { if (!mp.P) return; const [x, y] = mp.pos(e); const [lat, lon] = mp.P.inv(x, y); const c = T5.cell(lat, lon); if (c) { S.sel = c; mp.redraw(); updSel(); } });
      const present = [...new Set(Array.from(B.B).filter((v) => v === v))].sort((a, b) => a - b);
      const leg = H.h('div');
      const drawLeg = () => {
        leg.innerHTML = '';
        if (S.mode === 'zon') { leg.append(T6.legend(null)); return; }
        const box = H.h('div', { class: 'zleg' });
        present.forEach((b) => { const bt = H.h('button', { type: 'button', class: S.filt === b ? 'on' : '', html: `<i style="background:rgb(${T6.biomeCol(b).join(',')})"></i>${T6.biomeName(b)}` }); bt.onclick = () => { S.filt = S.filt === b ? null : b; mp.invalidate(); drawLeg(); }; box.append(bt); });
        leg.append(box);
      };
      drawLeg();
      const seg = H.seg([['bio', 'Biomas'], ['zon', 'Climas zonales']], S.mode, (v) => { S.mode = v; S.filt = null; mp.invalidate(); drawLeg(); });
      const sc = T6.climoCard(), sOut = H.h('div');
      const updSel = () => { const c = S.sel; if (!c) return; sc.set(T6.fromCell(c)); const b = bioAt(c.lat, c.lon); sOut.innerHTML = `<p class="small"><b>Bioma:</b> ${b === b ? T6.biomeName(b) : 'sin dato'}</p>`; };
      updSel();
      cards.push(H.h('div', { class: 'card' }, H.h('h3', {}, 'Clima y vegetación, celda a celda'),
        H.h('p', { class: 'sub' }, 'Bioma dominante en cada celda de medio grado (RESOLVE Ecoregions 2017, que delimita la vegetación natural potencial) frente a los climas zonales (TerraClimate 1991-2020). Cambia de capa para comparar, resalta un bioma en la leyenda y pulsa un punto.'),
        seg, H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cv), H.h('div', { style: { height: '8px' } }), leg,
        H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, sc, sOut)));

      /* --- tabla cruzada: qué biomas hay en cada clima --- */
      const ORDER = [1, 2, 3, 14, 9, 7, 12, 4, 5, 8, 6, 11, 10, 13];
      const C = T6.cats(), acc = T6.KEYS.map(() => ({})), tot = T6.KEYS.map(() => 0);
      for (let j = 0; j < W.ny; j++) { const w = Math.cos((W.lat0 - (j + 0.5) * W.res) * D2R); for (let i = 0; i < W.nx; i++) { const k = j * W.nx + i, c = C[k], b = B.B[k]; if (c < 0 || !(b === b)) continue; acc[c][b] = (acc[c][b] || 0) + w; tot[c] += w; } }
      const xcv = H.h('canvas'); const rows = T6.KEYS.filter((k, ci) => tot[ci] > 0);
      const xst = H.autoCanvas(xcv, (w) => Math.max(rows.length * 30 + 40, 300), (ctx, w, h) => {
        const P = { l: 132, r: 12, t: 8, b: 26 }, bh = (h - P.t - P.b) / rows.length, X = (v) => P.l + v * (w - P.l - P.r);
        ctx.font = '11px system-ui'; ctx.textBaseline = 'middle'; xst.cells = [];
        rows.forEach((k, r) => {
          const ci = T6.KEYS.indexOf(k), y = P.t + r * bh; let x0 = 0;
          ctx.fillStyle = '#1c2836'; ctx.textAlign = 'right'; ctx.fillText(T6.ZON[k].s, P.l - 8, y + bh / 2);
          ctx.fillStyle = T6.css(k); ctx.fillRect(P.l - 6, y + 4, 4, bh - 8);
          for (const b of ORDER) { const f = (acc[ci][b] || 0) / tot[ci]; if (!f) continue; ctx.fillStyle = `rgb(${T6.biomeCol(b).join(',')})`; ctx.fillRect(X(x0), y + 3, X(x0 + f) - X(x0) + 0.3, bh - 6); xst.cells.push([X(x0), y + 3, X(x0 + f) - X(x0), bh - 6, k, b, f]); x0 += f; }
        });
        ctx.fillStyle = '#5a6878'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; for (let v = 0; v <= 1; v += 0.25) ctx.fillText(H.f(v * 100) + ' %', X(v), h - P.b + 6);
      });
      const xtip = H.h('div', { class: 'tooltip' });
      xcv.addEventListener('mousemove', (e) => { const [x, y] = xst.pos(e), c = (xst.cells || []).find(([cx, cy, cw, ch]) => x >= cx && x < cx + cw && y >= cy && y < cy + ch); if (!c) { xtip.style.display = 'none'; return; } xtip.innerHTML = `${T6.ZON[c[4]].s}: ${T6.pct(c[6] * 100)} ${T6.biomeName(c[5]).toLowerCase()}`; xtip.style.display = 'block'; xtip.style.left = (x / xst.w * 100) + '%'; xtip.style.top = (y / xst.h * 100) + '%'; xtip.style.transform = `translate(${x / xst.w > 0.6 ? '-100%' : '0'}, -120%)`; });
      xcv.addEventListener('mouseleave', () => { xtip.style.display = 'none'; });
      const top = (k) => { const ci = T6.KEYS.indexOf(k); const e = Object.entries(acc[ci]).sort((a, b) => b[1] - a[1])[0]; return e ? [T6.biomeName(+e[0]).toLowerCase(), T6.pct(e[1] / tot[ci] * 100)] : ['—', '']; };
      const tE = top('ecu'), tM = top('med'), tO = top('oce'), tS = top('sba'), tT = top('tun'), tA = top('sab');
      cards.push(H.h('div', { class: 'card' }, H.h('h3', {}, '¿Qué vegetación hay en cada clima?'),
        H.h('p', { class: 'sub' }, 'Proporción de la superficie de cada clima zonal ocupada por cada bioma (pasa el puntero por las barras).'),
        H.h('div', { class: 'viz framed', style: { position: 'relative' } }, xcv, xtip),
        H.html(`<p class="small" style="margin-top:8px">El bioma más extenso en cada clima: ecuatorial → ${tE[0]} (${tE[1]}); subártico → ${tS[0]} (${tS[1]}); tundra → ${tT[0]} (${tT[1]}); mediterráneo → ${tM[0]} (${tM[1]}); oceánico → ${tO[0]} (${tO[1]}); sabana → ${tA[0]} (${tA[1]}). Las mezclas tienen tres causas: los límites de Köppen son convencionales (la vegetación responde también al suelo, al fuego y a la variabilidad de la lluvia), los biomas son vegetación potencial que el ser humano ha transformado mucho (pastos, cultivos) y las montañas tienen sus propios pisos (Tema 5).</p>`)));

      /* --- manglares --- */
      const lats = (j) => B.lat0 - (j + 0.5) * B.res, lons = (i) => B.lon0 + (i + 0.5) * B.res;
      const area = (la0, la1, lo0, lo1) => { let s = 0; for (let j = 0; j < B.ny; j++) { const la = lats(j); if (la < la0 || la > la1) continue; const w = Math.cos(la * D2R) * 3091; for (let i = 0; i < B.nx; i++) { const lo = lons(i); if (lo < lo0 || lo > lo1) continue; s += (B.M[j * B.nx + i] || 0) * w; } } return s; };
      const R = [['Perú y norte de Chile', [-30, -4, -82, -68], 'Brasil, a la misma latitud', [-30, -4, -50, -34]], ['Namibia y sur de Angola', [-30, -12, 8, 20], 'Mozambique, a la misma latitud', [-30, -12, 30, 42]], ['Baja California (Pacífico)', [23, 32, -118, -112], 'Golfo de México y Florida', [23, 32, -98, -79]]];
      const mcv = H.h('canvas');
      const mmp = T4.map(mcv, { bbox: [-120, 160, -35, 32], grid: 20, key: () => 'mg', land: [232, 224, 204], color: null,
        after: (ctx, P) => {
          for (let j = 0; j < B.ny; j++) { const la = lats(j); if (la < -36 || la > 33) continue; for (let i = 0; i < B.nx; i++) { const m = B.M[j * B.nx + i]; if (!(m > 0.005)) continue; const lo = lons(i); const x = P.X(lo), y = P.Y(la), r = 1.8 + Math.sqrt(m) * 5; ctx.fillStyle = 'rgba(200,40,60,.8)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }
          ctx.strokeStyle = 'rgba(28,40,54,.7)'; ctx.setLineDash([4, 3]); for (const [, a, , b] of R) for (const [la0, la1, lo0, lo1] of [a, b]) ctx.strokeRect(P.X(lo0), P.Y(la1), P.X(lo1) - P.X(lo0), P.Y(la0) - P.Y(la1)); ctx.setLineDash([]);
        } });
      cards.push(H.h('div', { class: 'card' }, H.h('h3', {}, 'Los manglares y las corrientes frías'),
        H.h('p', { class: 'sub' }, 'Celdas con ecorregiones de manglar (el tamaño del punto indica la fracción de la celda). Los recuadros comparan fachadas occidentales y orientales a la misma latitud.'),
        H.h('div', { class: 'viz framed' }, mcv),
        H.html(`<div><div class="grid3" style="margin-top:10px">${R.map(([a, ba, b, bb]) => `<div class="ro"><div class="k">${a} frente a ${b}</div><div class="v">${H.f(Math.round(area(...ba) / 10) * 10)} <small>km²</small> · ${H.f(Math.round(area(...bb) / 10) * 10)} <small>km²</small></div></div>`).join('')}</div>
          <p class="small">El manual dice que los manglares se dan en la costa oeste y no en la este, «donde hay corrientes frías». Es al revés: las corrientes frías bañan las fachadas occidentales de los continentes en latitudes tropicales (Humboldt, Benguela, California), y allí los manglares faltan o son escasos. Necesitan aguas cálidas todo el año y se extienden por las costas orientales y por las occidentales sin corrientes frías, como el golfo de Guinea.</p></div>`)));
    } else cards.push(H.info('Faltan los biomas de RESOLVE (gee/tema6_biomas.js).'));

    /* =============== 2 · perfiles de vegetación (ilustraciones propias) =============== */
    const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const PROF = {
      selva: { n: 'Selva ecuatorial', z: 'ecu', max: 60, txt: 'Tres estratos de árboles de hoja ancha y perenne: emergentes aislados de hasta 50-60 m, un dosel continuo a 30-40 m y un estrato inferior de árboles jóvenes y de copa estrecha; debajo, arbustos y hierbas que viven con muy poca luz. Lianas que trepan hacia la luz y epífitas (orquídeas, bromelias) sobre las ramas. Muchísimas especies: más de 200 de árboles por hectárea en la Amazonía.' },
      sabana: { n: 'Sabana', z: 'sab', max: 20, txt: 'Un tapiz de gramíneas altas (hasta 3 m en la sabana húmeda, menos de 0,6 m en la seca) con árboles y arbustos dispersos, de copa aplanada, corteza gruesa y hojas pequeñas o caducas en la estación seca (acacias, baobabs). El fuego, en la estación seca, impide que el bosque se cierre.' },
      medit: { n: 'Bosque y matorral mediterráneo', z: 'med', max: 20, txt: 'Bosque claro de encinas y alcornoques, de hoja perenne, pequeña, dura y con cutícula gruesa (esclerófila): resiste la sequía del verano. Al degradarse por el fuego, la tala o el pastoreo, da paso al maquis (jaras, brezos, madroños) sobre suelos silíceos y a la garriga, más baja y abierta (coscoja, romero, tomillo, lavanda), sobre calizas.' },
      oceano: { n: 'Bosque caducifolio y landa', z: 'oce', max: 40, txt: 'Bosque alto de hayas, robles y fresnos que pierden la hoja en invierno, con un sotobosque abundante. Donde se ha talado y quemado repetidamente, la landa: matorral denso de brezos, tojos y helechos sobre suelos ácidos y lavados.' },
      taiga: { n: 'Taiga', z: 'sba', max: 35, txt: 'Bosque denso de coníferas de pocas especies: píceas y abetos de copa cónica (que deja resbalar la nieve), pinos y, en Siberia oriental, alerces que pierden la aguja en invierno; algunos abedules. El suelo está tapizado de musgos y líquenes.' },
      tundra: { n: 'Tundra', z: 'tun', max: 2, txt: 'Sin árboles: musgos, líquenes, gramíneas, juncos y arbustos enanos y rastreros (sauces y abedules enanos) que no superan el metro. Bajo la capa que se deshiela en verano está el permafrost, que encharca el suelo.' },
    };
    const drawProf = (key) => {
      const p = PROF[key], Wd = 640, Hd = 270, G = 232, L = 40, sc = (G - 18) / p.max, r = rnd(key.length * 997 + 13);
      let s = `<svg viewBox="0 0 ${Wd} ${Hd + (key === 'tundra' ? 22 : 0)}" role="img" aria-label="Perfil de vegetación: ${p.n}">`;
      s += `<rect x="0" y="0" width="${Wd}" height="${G}" fill="#f4f1ea"/>`;
      // escala vertical
      const step = p.max >= 40 ? 10 : p.max >= 20 ? 5 : 0.5;
      for (let v = 0; v <= p.max; v += step) { const y = G - v * sc; s += `<line x1="${L}" x2="${Wd}" y1="${y}" y2="${y}" stroke="rgba(28,40,54,.08)"/><text x="${L - 5}" y="${y + 3}" font-size="10" text-anchor="end" fill="#5a6878">${H.f(v, v % 1 ? 1 : 0)} m</text>`; }
      const trunk = (x, h, w, c = '#6b4f35') => `<rect x="${x - w / 2}" y="${G - h}" width="${w}" height="${h}" fill="${c}"/>`;
      const crown = (x, y, rx, ry, c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" stroke="rgba(0,0,0,.15)"/>`;
      const broad = (x, h, cw, c) => { const ch = Math.min(cw * 0.75, h * 0.45); return trunk(x, h - ch * 0.4, Math.max(2, cw * 0.07)) + crown(x, G - h + ch / 2, cw / 2, ch / 2, c); };
      const flat = (x, h, cw, c) => trunk(x, h - 3, 3) + `<path d="M${x - cw / 2} ${G - h + 4} Q ${x} ${G - h - 7} ${x + cw / 2} ${G - h + 4} Z" fill="${c}" stroke="rgba(0,0,0,.15)"/>`;
      const conif = (x, h, w, c) => { let o = trunk(x, h * 0.25, 3); for (let q = 0; q < 4; q++) { const top = G - h + q * h * 0.18, bot = top + h * 0.34; const ww = w * (0.45 + q * 0.2); o += `<path d="M${x} ${top} L ${x - ww / 2} ${bot} L ${x + ww / 2} ${bot} Z" fill="${c}" stroke="rgba(0,0,0,.12)"/>`; } return o; };
      const shrub = (x, h, w, c) => crown(x, G - h / 2, w / 2, h / 2, c);
      const grass = (x0, x1, h, c, n = 160) => { let o = `<g stroke="${c}" stroke-width="1.2">`; for (let q = 0; q < n; q++) { const x = x0 + r() * (x1 - x0), hh = h * (0.6 + r() * 0.5); o += `<line x1="${x}" y1="${G}" x2="${x + (r() - 0.5) * 6}" y2="${G - hh}"/>`; } return o + '</g>'; };
      let b = '';
      if (key === 'selva') {
        for (let x = L + 15; x < Wd; x += 26) b += broad(x + r() * 10, (8 + r() * 6) * sc, 22, '#4f8a4a');
        for (let x = L + 5; x < Wd; x += 38) b += broad(x + r() * 12, (30 + r() * 9) * sc, 48, r() > 0.5 ? '#2f6e3a' : '#3c7d42');
        for (const x of [L + 90, L + 330, L + 520]) b += broad(x, (50 + r() * 8) * sc, 70, '#285f33');
        for (let x = L + 30; x < Wd; x += 70) b += `<path d="M${x} ${G} C ${x + 18} ${G - 60}, ${x - 14} ${G - 120}, ${x + 10} ${G - 32 * sc}" stroke="#7a6a3a" stroke-width="1.6" fill="none"/>`;
        for (let q = 0; q < 26; q++) b += `<circle cx="${L + r() * (Wd - L)}" cy="${G - (12 + r() * 25) * sc}" r="2.6" fill="#c0508a"/>`;
        b += grass(L, Wd, 1.2 * sc, '#5a8a4a', 120);
      } else if (key === 'sabana') {
        b += grass(L, Wd, 2.5 * sc, '#c9a94a', 520);
        for (const [x, h, w] of [[L + 70, 12, 70], [L + 260, 16, 90], [L + 420, 9, 50], [L + 540, 14, 80]]) b += flat(x, h * sc, w, '#6f8f3a');
        b += trunk(L + 340, 10 * sc, 22, '#8a6a4a') + crown(L + 340, G - 10.5 * sc, 30, 10, '#7f9a48');
        b += shrub(L + 180, 3 * sc, 30, '#8aa04a') + shrub(L + 480, 2.6 * sc, 26, '#8aa04a');
      } else if (key === 'medit') {
        for (const [x, h, w] of [[L + 40, 12, 60], [L + 120, 14, 66], [L + 205, 11, 56]]) b += broad(x, h * sc, w, '#3f5f34');
        b += `<text x="${L + 120}" y="22" font-size="11" text-anchor="middle" fill="#1c2836">encinar</text>`;
        for (let x = L + 250; x < L + 420; x += 18) b += shrub(x + r() * 6, (2 + r() * 2) * sc, 22, r() > 0.5 ? '#5d7a3a' : '#7a8a46');
        b += `<text x="${L + 335}" y="22" font-size="11" text-anchor="middle" fill="#1c2836">maquis</text>`;
        for (let x = L + 440; x < Wd - 5; x += 14) b += shrub(x + r() * 6, (0.4 + r() * 0.6) * sc, 13, r() > 0.5 ? '#8a9a5a' : '#9aa070');
        b += `<text x="${L + 520}" y="22" font-size="11" text-anchor="middle" fill="#1c2836">garriga</text>`;
      } else if (key === 'oceano') {
        for (let x = L + 15; x < L + 360; x += 34) b += broad(x + r() * 8, (24 + r() * 10) * sc, 46, r() > 0.4 ? '#5d9a4a' : '#6aa452');
        for (let x = L + 20; x < L + 360; x += 30) b += shrub(x + r() * 8, (2 + r() * 3) * sc, 20, '#7aa45a');
        for (let x = L + 380; x < Wd - 5; x += 13) b += shrub(x + r() * 5, (0.6 + r() * 1) * sc, 14, r() > 0.5 ? '#8a6a8a' : '#9a8a40');
        b += `<text x="${L + 190}" y="22" font-size="11" text-anchor="middle" fill="#1c2836">hayedo y robledal</text><text x="${L + 470}" y="${G - 3.5 * sc}" font-size="11" text-anchor="middle" fill="#1c2836">landa</text>`;
      } else if (key === 'taiga') {
        b += `<rect x="${L}" y="${G - 4}" width="${Wd - L}" height="4" fill="#8aa06a"/>`;
        for (let x = L + 10; x < Wd; x += 24) b += r() > 0.85 ? broad(x, (14 + r() * 5) * sc, 22, '#9ab85a') : conif(x + r() * 6, (18 + r() * 12) * sc, 30, r() > 0.5 ? '#2f5a42' : '#3a6a4a');
      } else if (key === 'tundra') {
        for (let x = L + 4; x < Wd; x += 9) b += shrub(x + r() * 4, (0.1 + r() * 0.35) * sc, 10, r() > 0.6 ? '#8a9a6a' : r() > 0.3 ? '#a0a070' : '#b0a080');
        for (let x = L + 30; x < Wd; x += 70) b += shrub(x, (0.6 + r() * 0.5) * sc, 26, '#6f8a4a');
      }
      s += b;
      s += `<rect x="0" y="${G}" width="${Wd}" height="${Hd - G}" fill="#8a6a4a"/>`;
      if (key === 'tundra') s += `<rect x="0" y="${G + 12}" width="${Wd}" height="${Hd - G + 10}" fill="#a9c1d6"/><text x="${Wd - 8}" y="${G + 28}" font-size="11" text-anchor="end" fill="#1c2836">permafrost</text>`;
      s += `<line x1="${L}" x2="${L}" y1="10" y2="${G}" stroke="#1c2836"/></svg>`;
      return s;
    };
    const pBox = H.h('div', { class: 'illu' }), pTxt = H.h('div');
    const setProf = (k) => { pBox.innerHTML = drawProf(k); const p = PROF[k]; pTxt.innerHTML = `<p style="margin:.4em 0">${T6.chip(p.z)} <b>${p.n}</b></p><p class="small">${p.txt}</p>`; };
    const pCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Perfiles de vegetación'),
      H.h('p', { class: 'sub' }, 'Ilustraciones propias, esquemáticas. La escala vertical cambia de un perfil a otro: compara las alturas en el eje.'),
      H.seg(Object.entries(PROF).map(([k, v]) => [k, v.n.split(' ')[0] === 'Bosque' ? (k === 'medit' ? 'Mediterráneo' : 'Caducifolio') : v.n]), 'selva', setProf),
      H.h('div', { class: 'grid2', style: { marginTop: '10px' } }, H.h('div', { class: 'viz framed' }, pBox), pTxt));
    setProf('selva');

    /* =============== 3 · perfiles de suelo =============== */
    const SOILS = [
      ['Ferralsol', 'ecu', 'Selva y sabana', [[0, 3, '#3b2a1e', 'O'], [3, 18, '#7a3c22', 'A'], [18, 150, '#b5532b', 'Bo']], 'Muy profundo y muy alterado: el calor y la lluvia han disuelto casi todos los minerales salvo los óxidos de hierro y aluminio, que lo tiñen de rojo. Pobre: los nutrientes están en la vegetación, no en el suelo (los «lateríticos» del manual).'],
      ['Luvisol crómico (terra rossa)', 'med', 'Mediterráneo', [[0, 15, '#7a5a3e', 'A'], [15, 75, '#a33a22', 'Bt'], [75, 150, '#d8d2c4', 'R']], 'Rojo por el hierro de la arcilla que deja la disolución de la caliza (R) y que se acumula en el horizonte Bt. Fértil, pero erosionable cuando se pierde la vegetación.'],
      ['Podzol', 'sba', 'Taiga y landas', [[0, 8, '#2a2018', 'O'], [8, 30, '#cfcac0', 'E'], [30, 60, '#8a4a20', 'Bhs'], [60, 150, '#d9c27a', 'C']], 'La hojarasca ácida de coníferas y brezos libera ácidos que lavan el horizonte E, que queda blanquecino como la ceniza, y depositan humus, hierro y aluminio más abajo (Bhs). Ácido y pobre.'],
      ['Chernozem', 'con', 'Pradera continental', [[0, 80, '#2b2420', 'A'], [80, 110, '#6a5440', 'Bk'], [110, 150, '#d6c08a', 'C']], 'La «tierra negra»: las raíces de las gramíneas, que mueren cada año, acumulan un horizonte A de humus de casi un metro. La lluvia escasa no lava el calcio, que precipita en el Bk. Uno de los suelos más fértiles del mundo (Ucrania, la Pampa, las Grandes Llanuras).'],
      ['Criosol', 'tun', 'Tundra', [[0, 10, '#4a3a2a', 'O'], [10, 50, '#7b7468', 'capa activa'], [50, 150, '#a9c1d6', 'permafrost']], 'Sobre el permafrost, la capa activa se deshiela cada verano, se encharca y se remueve con las heladas (crioturbación). La materia orgánica se descompone muy despacio y forma turba.'],
    ];
    const soilSvg = ([n, z, , hz]) => {
      const Wd = 120, Hd = 300, sc = 260 / 150; let s = `<svg viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Perfil de suelo: ${n}">`;
      for (const [a, b, c, l] of hz) { const y0 = 18 + a * sc, y1 = 18 + b * sc; s += `<rect x="34" y="${y0}" width="${Wd - 44}" height="${y1 - y0}" fill="${c}"/>`; const lc = ['#2b2420', '#3b2a1e', '#2a2018', '#4a3a2a', '#7a3c22', '#a33a22', '#7a5a3e', '#6a5440', '#8a4a20', '#7b7468'].includes(c) ? '#fff' : '#1c2836'; if (y1 - y0 >= 14) s += `<text x="${34 + (Wd - 44) / 2}" y="${(y0 + y1) / 2 + 4}" font-size="${l.length > 4 ? 9.5 : 11}" text-anchor="middle" fill="${lc}" font-weight="700">${l}</text>`; }
      if (n === 'Chernozem') { const rr = rnd(7); for (let q = 0; q < 16; q++) s += `<circle cx="${38 + rr() * (Wd - 52)}" cy="${18 + (82 + rr() * 26) * sc}" r="${1.4 + rr() * 1.4}" fill="#f4f0e6"/>`; }
      for (let v = 0; v <= 150; v += 50) s += `<text x="30" y="${18 + v * sc + 3}" font-size="9" text-anchor="end" fill="#5a6878">${v}</text>`;
      s += `<text x="30" y="11" font-size="9" text-anchor="end" fill="#5a6878">cm</text><rect x="34" y="18" width="${Wd - 44}" height="${150 * sc}" fill="none" stroke="#1c2836"/>`;
      return s + '</svg>';
    };
    const sGrid = H.h('div', { class: 'grid3' });
    sGrid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(min(100%,180px),1fr))';
    for (const so of SOILS) sGrid.append(H.html(`<div class="ccard"><div class="illu" style="max-width:150px">${soilSvg(so)}</div><div><p style="margin:.2em 0">${T6.chip(so[1])} <b>${so[0]}</b></p><p class="small" style="margin:.2em 0"><i>${so[2]}.</i> ${so[4]}</p></div></div>`));
    const sCard = H.h('div', { class: 'card' }, H.h('h3', {}, 'Perfiles de suelo'),
      H.h('p', { class: 'sub' }, 'Ilustraciones propias. Se nombran según la Base Referencial Mundial de la FAO (WRB), que ha sustituido a términos del manual como «suelos lateríticos» o «tierras pardas». Horizontes: O, orgánico; A, superficial con humus; E, lavado; B, de acumulación (t, de arcilla; o, de óxidos; hs, de humus y sesquióxidos; k, de carbonatos); C, roca alterada; R, roca.'),
      sGrid);

    el.append(...cards, pCard, sCard,
      H.fix('rasgos biogeográficos', [
        'Manglares (1.1.3): faltan en las fachadas occidentales con corrientes frías (Perú, Namibia, Baja California), no en las orientales.',
        'Los «suelos lateríticos» son hoy ferralsoles (y plintosoles cuando tienen costras de laterita); las «tierras pardas», cambisoles y luvisoles.',
        'Taiga (2.4.3): el ciprés pelado no forma parte de la taiga; la conífera de hoja caduca es el alerce.',
      ]),
      H.selfCheck([
        { q: 'El clima en el que la vegetación coincide mejor con un solo bioma es…', opts: ['El mediterráneo', 'El subártico, con la taiga', 'El continental húmedo', 'El templado de altura'], a: 1, ex: 'Taiga y tundra cubren casi por completo sus climas; en los climas templados, la acción humana y el relieve mezclan más los biomas.' },
        { q: 'La hoja pequeña, dura y perenne de la encina es una adaptación a…', opts: ['El frío invernal', 'La sequía del verano', 'La falta de luz', 'Los suelos helados'], a: 1, ex: 'Es la vegetación esclerófila del clima mediterráneo.' },
        { q: 'El horizonte blanquecino de un podzol se debe a…', opts: ['La acumulación de cal', 'El lavado de los minerales por ácidos orgánicos', 'La ceniza de los incendios', 'El hielo del permafrost'], a: 1, ex: 'Los ácidos de la hojarasca de coníferas y brezos arrastran el hierro y el aluminio hacia el horizonte B.' },
        { q: 'Los manglares faltan en las costas de Perú y Namibia porque…', opts: ['Allí no hay mareas', 'Las corrientes frías enfrían el mar', 'Son costas acantiladas', 'Llueve demasiado'], a: 1, ex: 'Las corrientes de Humboldt y Benguela mantienen el agua fría; los manglares necesitan aguas cálidas todo el año.' },
      ]));
  },
});
