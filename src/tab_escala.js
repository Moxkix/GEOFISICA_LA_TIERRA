/* ===================== utilidades de relieve (compartidas) ===================== */
H.TERR = (() => {
  const T = {};
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  T.noise = (seed) => {
    const r = rng(seed), G = 64, g = new Float32Array(G * G); for (let i = 0; i < G * G; i++) g[i] = r();
    const sm = (t) => t * t * (3 - 2 * t);
    const v = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), tx = sm(x - xi), ty = sm(y - yi); const a = g[((yi % G + G) % G) * G + ((xi % G + G) % G)], b = g[((yi % G + G) % G) * G + (((xi + 1) % G + G) % G)], c = g[(((yi + 1) % G + G) % G) * G + ((xi % G + G) % G)], d = g[(((yi + 1) % G + G) % G) * G + (((xi + 1) % G + G) % G)]; return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty; };
    return (x, y, oct = 5) => { let s = 0, amp = 1, f = 1, n = 0; for (let o = 0; o < oct; o++) { s += amp * v(x * f, y * f); n += amp; amp *= 0.5; f *= 2; } return s / n; };
  };
  /* Terreno compuesto: sierra, valle fluvial, cerro cónico y meseta. N×N celdas sobre 'km' kilómetros */
  T.make = (seed = 7, N = 200, km = 10) => {
    const nz = T.noise(seed), z = new Float32Array(N * N), r = rng(seed + 11);
    const rx = 0.2 + r() * 0.15, peak = [0.72 + r() * 0.08, 0.3 + r() * 0.1], mesa = [0.25 + r() * 0.08, 0.72 + r() * 0.08];
    const river = (y) => 0.5 + 0.12 * Math.sin(y * 5.5 + seed) + 0.05 * Math.sin(y * 13 + seed * 2);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i / (N - 1), y = j / (N - 1);
      let h = 520 + 420 * nz(x * 3, y * 3) + 160 * nz(x * 9 + 5, y * 9 + 3, 3);
      // sierra al norte
      h += 950 * Math.exp(-((y - rx - 0.08 * Math.sin(x * 6)) ** 2) / 0.012) * (0.75 + 0.5 * nz(x * 5, 2, 3));
      // cerro cónico
      const dp = Math.hypot(x - peak[0], y - peak[1]); h += Math.max(0, 520 * (1 - dp / 0.16));
      // meseta con escarpe
      const dm = Math.hypot((x - mesa[0]) * 1.2, y - mesa[1]); h += 300 / (1 + Math.exp((dm - 0.14) * 70));
      // valle fluvial (de norte a sur)
      const dr = Math.abs(x - river(y)); h -= 260 * Math.exp(-(dr * dr) / 0.004) + 120 * Math.exp(-(dr * dr) / 0.03);
      h -= 120 * y; // pendiente general hacia el sur
      z[j * N + i] = h;
    }
    return { z, N, km, river, cell: km * 1000 / (N - 1) };
  };
  T.at = (t, x, y) => { // x,y en 0..1, interpolación bilineal
    const N = t.N, fx = H.clamp(x, 0, 1) * (N - 1), fy = H.clamp(y, 0, 1) * (N - 1), i = Math.min(N - 2, Math.floor(fx)), j = Math.min(N - 2, Math.floor(fy)), u = fx - i, v = fy - j, z = t.z;
    return z[j * N + i] * (1 - u) * (1 - v) + z[j * N + i + 1] * u * (1 - v) + z[(j + 1) * N + i] * (1 - u) * v + z[(j + 1) * N + i + 1] * u * v;
  };
  T.range = (t) => { let a = 1e9, b = -1e9; for (const v of t.z) { if (v < a) a = v; if (v > b) b = v; } return [a, b]; };
  /* marching squares: segmentos de la isolínea 'lev' en coordenadas de celda */
  T.iso = (t, lev) => {
    const { z, N } = t, seg = [];
    for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
      const a = z[j * N + i], b = z[j * N + i + 1], c = z[(j + 1) * N + i + 1], d = z[(j + 1) * N + i];
      const k = (a > lev ? 8 : 0) | (b > lev ? 4 : 0) | (c > lev ? 2 : 0) | (d > lev ? 1 : 0); if (k === 0 || k === 15) continue;
      const L = (p, q) => (lev - p) / (q - p);
      const top = [i + L(a, b), j], right = [i + 1, j + L(b, c)], bot = [i + L(d, c), j + 1], left = [i, j + L(a, d)];
      const S = { 1: [[left, bot]], 2: [[bot, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bot, right]], 6: [[top, bot]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bot]], 10: [[top, right], [left, bot]], 11: [[top, right]], 12: [[left, right]], 13: [[bot, right]], 14: [[left, bot]] }[k];
      for (const s of S) seg.push(s);
    }
    return seg;
  };
  T.HYPSO = [[0, [146, 186, 120]], [0.15, [178, 206, 140]], [0.32, [222, 220, 160]], [0.5, [226, 196, 132]], [0.68, [200, 158, 106]], [0.85, [168, 128, 96]], [1, [214, 196, 178]]];
  T.hypso = (t) => { const S = T.HYPSO; for (let i = 1; i < S.length; i++) if (t <= S[i][0]) { const u = (t - S[i - 1][0]) / (S[i][0] - S[i - 1][0]); return H.mix(S[i - 1][1], S[i][1], u); } return S[S.length - 1][1]; };
  /* imagen: modos 'hypso' (tintas), 'shade' (sombreado), combinables */
  T.render = (t, W, Hh, { hypso = true, shade = true, steps = null, lo, hi } = {}) => {
    const c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d'); const img = x.createImageData(W, Hh);
    const [a, b] = lo != null ? [lo, hi] : T.range(t); const cs = t.cell, N = t.N;
    for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
      const u = i / (W - 1), v = j / (Hh - 1); const h = T.at(t, u, v);
      let col = [246, 242, 232];
      if (hypso) { let tt = (h - a) / (b - a); if (steps) tt = Math.floor((h - a) / steps) * steps / (b - a); col = T.hypso(tt); }
      if (shade) { const d = 1 / (N - 1); const dzdx = (T.at(t, u + d, v) - T.at(t, u - d, v)) / (2 * cs), dzdy = (T.at(t, u, v + d) - T.at(t, u, v - d)) / (2 * cs); const nx = -dzdx * 1.6, ny = -dzdy * 1.6, nz = 1, nn = Math.hypot(nx, ny, nz); const L = [-0.55, -0.55, 0.63]; let sh = (nx * L[0] + ny * L[1] + nz * L[2]) / nn; sh = H.clamp(sh, 0, 1); const f = 0.55 + 0.6 * sh; col = col.map((q) => Math.min(255, q * f)); }
      const k = (j * W + i) * 4; img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 255;
    }
    x.putImageData(img, 0, 0); return c;
  };
  return T;
})();

/* ===================== 8 · ESCALA ===================== */
H.tab({
  id: 'escala', nav: 'Escala', title: 'La escala',
  init(el) {
    el.append(H.intro('Mapa · apartado 3.2', 'La escala: la relación entre el mapa y la realidad',
      'La escala es la razón entre una distancia en el mapa y la distancia correspondiente en el terreno. Se expresa como fracción de numerador 1 (escala numérica) o con un segmento graduado (escala gráfica). Cuanto menor es el denominador, mayor es la escala y más detalle muestra el mapa.',
      'Manual: 3.2<br>Figura 1.17'));

    /* ---------- A · conversor ---------- */
    const st = { den: 50000 };
    const denSel = H.h('select', {}, ...[1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 5000000, 25000000].map((d) => H.h('option', { value: d, selected: d === st.den }, '1:' + H.f(d))), H.h('option', { value: 'x' }, 'Otra…'));
    const denIn = H.h('input', { type: 'number', min: 1, step: 1, value: st.den, style: { display: 'none' } });
    const mapCm = H.h('input', { type: 'number', step: 'any', value: 4 });
    const realKm = H.h('input', { type: 'number', step: 'any' });
    const mapCm2 = H.h('input', { type: 'number', step: 'any', value: 1 });
    const realHa = H.h('div', { class: 'ro hl' });
    const words = H.h('p', { class: 'small' });
    const bar = H.h('div');
    const nice = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; };
    const fmtLen = (m) => m === 0 ? '0' : m >= 1000 ? `${H.f(m / 1000, m % 1000 ? (m % 100 ? 2 : 1) : 0)} km` : `${H.f(m, m < 1 ? 2 : 0)} m`;
    const drawBar = () => {
      // segmento de ~2 cm del mapa; 1 cm del mapa se dibuja a 38 px (aproximado)
      const PX = 38, seg = nice(st.den * 2 / 100), segCm = seg * 100 / st.den, segPx = segCm * PX;
      let s = `<svg viewBox="0 0 ${segPx * 5 + 90} 64" style="width:100%;max-width:${segPx * 5 + 90}px;height:auto">`;
      const x0 = 30 + segPx; // talón a la izquierda
      for (let i = 0; i < 4; i++) s += `<rect x="${x0 + i * segPx}" y="18" width="${segPx}" height="9" fill="${i % 2 ? '#fff' : '#1c2836'}" stroke="#1c2836"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${30 + i * segPx / 4}" y="18" width="${segPx / 4}" height="9" fill="${i % 2 ? '#1c2836' : '#fff'}" stroke="#1c2836"/>`;
      for (let i = 0; i <= 4; i++) s += `<text x="${x0 + i * segPx}" y="42" font-size="11" text-anchor="middle" fill="#1c2836">${fmtLen(seg * i)}</text>`;
      s += `<text x="30" y="42" font-size="11" text-anchor="middle" fill="#1c2836">${fmtLen(seg)}</text><text x="${x0 + 2 * segPx}" y="12" font-size="11" text-anchor="middle" fill="#5a6878">Escala 1:${H.f(st.den)}</text>`;
      s += `<text x="${x0 + 2 * segPx}" y="60" font-size="10" text-anchor="middle" fill="#5a6878">cada tramo = ${H.f(segCm, 2)} cm del mapa = ${fmtLen(seg)} del terreno</text></svg>`;
      bar.innerHTML = s;
    };
    const fromMap = () => { const cm = parseFloat(mapCm.value); if (isFinite(cm)) realKm.value = +(cm * st.den / 1e5).toPrecision(8); upd(); };
    const fromReal = () => { const km = parseFloat(realKm.value); if (isFinite(km)) mapCm.value = +(km * 1e5 / st.den).toPrecision(8); upd(); };
    const upd = () => {
      const a = parseFloat(mapCm2.value), m2 = a * (st.den / 100) ** 2;
      realHa.innerHTML = `<div class="k">Superficie real</div><div class="v">${isFinite(m2) ? (m2 >= 1e6 ? H.f(m2 / 1e6, 3) + ' <small>km²</small>' : H.f(m2 / 1e4, 2) + ' <small>ha</small>') : '—'}</div><small>${isFinite(m2) ? H.f(a, 2) + ' cm² × ' + H.f(st.den) + '² = ' + H.f(m2) + ' m²' : ''}</small>`;
      words.innerHTML = `<b>1:${H.f(st.den)}</b> significa que 1 cm del mapa equivale a ${H.f(st.den)} cm del terreno, es decir, <b>${fmtLen(st.den / 100)}</b>. Un km del terreno ocupa <b>${H.f(1e5 / st.den, 2)} cm</b> del mapa. Las superficies se reducen con el cuadrado de la escala: 1 cm² del mapa son <b>${(st.den / 100) ** 2 >= 1e6 ? H.f((st.den / 100) ** 2 / 1e6, 2) + ' km²' : H.f((st.den / 100) ** 2 / 1e4, 2) + ' ha'}</b>. ${st.den <= 10000 ? '<span class="pill ok">Plano</span>' : st.den <= 100000 ? '<span class="pill ok">Mapa topográfico</span>' : '<span class="pill ok">Mapa de pequeña escala (corográfico o geográfico)</span>'}`;
      drawBar();
    };
    denSel.onchange = () => { if (denSel.value === 'x') { denIn.style.display = ''; denIn.focus(); return; } denIn.style.display = 'none'; st.den = +denSel.value; denIn.value = st.den; fromMap(); };
    denIn.oninput = () => { const v = parseInt(denIn.value); if (v > 0) { st.den = v; fromMap(); } };
    mapCm.oninput = fromMap; realKm.oninput = fromReal; mapCm2.oninput = upd;
    fromMap();
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Conversor de escala'),
      H.h('div', { class: 'grid2' },
        H.h('div', {}, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Escala numérica'), H.h('div', { class: 'row' }, denSel, denIn)),
          H.h('div', { class: 'row' }, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Distancia en el mapa (cm)'), mapCm), H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Distancia real (km)'), realKm)),
          H.h('div', { class: 'row' }, H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Superficie en el mapa (cm²)'), mapCm2), realHa),
          H.h('p', { class: 'small', html: '<span class="formula">D<sub>real</sub> = d<sub>mapa</sub> × x</span> &nbsp; <span class="formula">S<sub>real</sub> = s<sub>mapa</sub> × x²</span> &nbsp; (x = denominador)' })),
        H.h('div', {}, words, H.h('h4', { style: { marginTop: '10px' } }, 'Escala gráfica equivalente'), bar,
          H.h('p', { class: 'small' }, 'La escala gráfica sigue siendo válida aunque el mapa se amplíe, se reduzca o se vea en pantalla, porque se transforma con él. La numérica deja de serlo si el mapa se imprime a otro tamaño.')))));

    /* ---------- B · medir sobre una hoja ---------- */
    const T = H.TERR.make(19, 160, 8);
    const ms = { den: 25000, pts: [], mode: 'dist' };
    const PXCM = 38; // píxeles por cm del mapa (nominal)
    const mcv = H.h('canvas');
    let mapImg = null;
    const mcs = H.autoCanvas(mcv, (w) => Math.min(w * 0.62, 460), (ctx, w, h) => {
      if (!mapImg || mapImg.width !== Math.round(w)) mapImg = H.TERR.render(T, Math.round(w), Math.round(h), { hypso: true, shade: true });
      ctx.drawImage(mapImg, 0, 0, w, h);
      // curvas de nivel cada 50 m
      ctx.strokeStyle = 'rgba(120,70,30,.45)'; ctx.lineWidth = 0.7;
      const [a, b] = H.TERR.range(T); const sx = w / (T.N - 1), sy = h / (T.N - 1);
      ctx.beginPath();
      for (let L = Math.ceil(a / 50) * 50; L < b; L += 50) for (const [p, q] of H.TERR.iso(T, L)) { ctx.moveTo(p[0] * sx, p[1] * sy); ctx.lineTo(q[0] * sx, q[1] * sy); }
      ctx.stroke();
      // río
      ctx.strokeStyle = '#2b78b8'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = 0; y <= 1; y += 0.01) { const x = T.river(y); y ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h); } ctx.stroke();
      // cuadrícula de 1 cm
      ctx.strokeStyle = 'rgba(28,40,54,.18)'; ctx.lineWidth = 0.5; ctx.beginPath();
      for (let x = 0; x < w; x += PXCM) { ctx.moveTo(x, 0); ctx.lineTo(x, h); } for (let y = 0; y < h; y += PXCM) { ctx.moveTo(0, y); ctx.lineTo(w, y); } ctx.stroke();
      // regla
      ctx.fillStyle = 'rgba(255,253,248,.92)'; ctx.fillRect(8, h - 34, PXCM * 5 + 20, 26); ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(18, h - 16); ctx.lineTo(18 + PXCM * 5, h - 16); for (let i = 0; i <= 50; i++) { const x = 18 + i * PXCM / 10; ctx.moveTo(x, h - 16); ctx.lineTo(x, h - 16 - (i % 10 === 0 ? 8 : i % 5 === 0 ? 5 : 3)); } ctx.stroke();
      ctx.fillStyle = '#1c2836'; ctx.font = '9px system-ui'; ctx.textAlign = 'center'; for (let i = 0; i <= 5; i++) ctx.fillText(i + ' cm', 18 + i * PXCM, h - 27 + 18);
      ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,253,248,.92)'; ctx.fillRect(w - 120, 8, 112, 22); ctx.fillStyle = '#1c2836'; ctx.fillText('E. 1:' + H.f(ms.den), w - 14, 24);
      // trazado del usuario
      if (ms.pts.length) {
        ctx.strokeStyle = '#b4531d'; ctx.fillStyle = 'rgba(180,83,29,.18)'; ctx.lineWidth = 2.5; ctx.beginPath();
        ms.pts.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h));
        if (ms.mode === 'area' && ms.pts.length > 2) { ctx.closePath(); ctx.fill(); }
        ctx.stroke();
        for (const [x, y] of ms.pts) { ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.arc(x * w, y * h, 4, 0, 7); ctx.fill(); }
      }
      const cmPts = ms.pts.map(([x, y]) => [x * w / PXCM, y * h / PXCM]);
      let L = 0; for (let i = 1; i < cmPts.length; i++) L += Math.hypot(cmPts[i][0] - cmPts[i - 1][0], cmPts[i][1] - cmPts[i - 1][1]);
      let A = 0; if (cmPts.length > 2) { for (let i = 0; i < cmPts.length; i++) { const [x1, y1] = cmPts[i], [x2, y2] = cmPts[(i + 1) % cmPts.length]; A += x1 * y2 - x2 * y1; } A = Math.abs(A) / 2; }
      mro.cm.v.innerHTML = ms.mode === 'dist' ? `${H.f(L, 2)} <small>cm</small>` : `${H.f(A, 2)} <small>cm²</small>`;
      const real = ms.mode === 'dist' ? L * ms.den / 100 : A * (ms.den / 100) ** 2;
      mro.real.v.innerHTML = ms.mode === 'dist' ? fmtLen(real) : real >= 1e6 ? `${H.f(real / 1e6, 2)} <small>km²</small>` : `${H.f(real / 1e4, 1)} <small>ha</small>`;
      mro.op.v.innerHTML = ms.mode === 'dist' ? `<small>${H.f(L, 2)} × ${H.f(ms.den)} cm</small>` : `<small>${H.f(A, 2)} × ${H.f(ms.den)}² cm²</small>`;
    });
    const mro = { cm: H.ro('Medida en el mapa', 'bl'), real: H.ro('En el terreno', 'hl'), op: H.ro('Operación') };
    mcv.addEventListener('click', (e) => { const [x, y] = mcs.pos(e); ms.pts.push([x / mcs.w, y / mcs.h]); mcs.redraw(); });
    mcv.style.cursor = 'crosshair';
    const mSeg = H.seg([['dist', 'Medir distancia'], ['area', 'Medir superficie']], 'dist', (v) => { ms.mode = v; ms.pts = []; mcs.redraw(); });
    const dSeg = H.seg([[10000, '1:10.000'], [25000, '1:25.000'], [50000, '1:50.000']], ms.den, (v) => { ms.den = v; mcs.redraw(); });
    const clr = H.h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { ms.pts = []; mcs.redraw(); } }, 'Borrar');
    const undo = H.h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { ms.pts.pop(); mcs.redraw(); } }, 'Deshacer punto');
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Medir sobre el mapa'),
      H.h('p', { class: 'sub' }, 'Haz clic para trazar un recorrido o el contorno de una superficie. La cuadrícula y la regla representan centímetros del mapa impreso (la equivalencia en pantalla es aproximada). Cambia la escala y observa que la misma medida en el papel corresponde a una distancia real distinta.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, mcv),
        H.h('div', {}, mSeg, H.h('div', { style: { height: '8px' } }), H.h('div', { class: 'lab small', style: { fontWeight: 700, color: 'var(--ink)' } }, 'Escala de la hoja'), dSeg, H.h('div', { class: 'row', style: { marginTop: '8px' } }, undo, clr),
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, mro.cm, mro.real, mro.op),
          H.h('p', { class: 'small' }, 'Sobre el mapa se mide la distancia en proyección horizontal. En terreno accidentado la distancia recorrida es algo mayor: para calcularla hace falta el perfil topográfico (pestaña Curvas de nivel).')))));

    /* ---------- C · ordenar escalas ---------- */
    const ord = H.h('div');
    const newOrd = () => {
      const pool = [500, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 10000000, 40000000];
      const pick = pool.sort(() => Math.random() - 0.5).slice(0, 6); const target = [...pick].sort((a, b) => a - b);
      let chosen = [];
      ord.innerHTML = '';
      const src = H.h('div', { class: 'sortlist' }), dst = H.h('div', { class: 'sortlist' });
      const res = H.h('p');
      const render = () => {
        src.innerHTML = ''; dst.innerHTML = '';
        pick.filter((d) => !chosen.includes(d)).forEach((d) => { const c = H.h('button', { class: 'chip', type: 'button' }, '1:' + H.f(d)); c.onclick = () => { chosen.push(d); render(); }; src.append(c); });
        chosen.forEach((d, i) => { const c = H.h('button', { class: 'chip sel', type: 'button' }, '1:' + H.f(d)); c.onclick = () => { chosen.splice(i, 1); render(); }; dst.append(c); });
        if (chosen.length === pick.length) {
          let ok = 0; H.$$('.chip', dst).forEach((c, i) => { const g = chosen[i] === target[i]; if (g) ok++; c.className = 'chip ' + (g ? 'ok' : 'ko'); });
          res.innerHTML = ok === pick.length ? '<span class="pill ok">Perfecto</span> De mayor a menor escala = de menor a mayor denominador.' : `<span class="pill ko">${ok} de ${pick.length} en su sitio</span> Recuerda: la escala es una fracción; 1/5.000 es mayor que 1/50.000. Orden correcto: ${target.map((d) => '1:' + H.f(d)).join(' > ')}`;
        } else res.innerHTML = '';
      };
      render();
      ord.append(H.h('p', { class: 'small' }, 'Pulsa las escalas en orden, de la mayor a la menor. Pulsa una ya colocada para devolverla.'), src, H.h('div', { class: 'small', style: { margin: '8px 0 4px', fontWeight: 700 } }, 'Tu orden (mayor → menor):'), dst, res, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newOrd }, 'Otra serie'));
    };
    newOrd();

    /* ---------- D · ejercicios ---------- */
    const exb = H.h('div');
    const newEx = () => {
      exb.innerHTML = '';
      const dens = [5000, 10000, 20000, 25000, 50000, 100000, 200000];
      const den = dens[Math.floor(Math.random() * dens.length)], t = Math.floor(Math.random() * 3);
      let q, ans, unit, expl;
      if (t === 0) { const cm = Math.round((1 + Math.random() * 14) * 10) / 10; q = `En un mapa a escala 1:${H.f(den)}, dos puntos distan ${H.f(cm, 1)} cm. ¿Cuál es la distancia real en km?`; ans = cm * den / 1e5; unit = 'km'; expl = `${H.f(cm, 1)} cm × ${H.f(den)} = ${H.f(cm * den)} cm = ${H.f(ans, 3)} km`; }
      else if (t === 1) { const km = Math.round((0.5 + Math.random() * 20) * 10) / 10; q = `¿Cuántos cm ocuparán ${H.f(km, 1)} km en un mapa a escala 1:${H.f(den)}?`; ans = km * 1e5 / den; unit = 'cm'; expl = `${H.f(km, 1)} km = ${H.f(km * 1e5)} cm; ÷ ${H.f(den)} = ${H.f(ans, 2)} cm`; }
      else { const cm2 = Math.round((1 + Math.random() * 30) * 10) / 10; q = `Una parcela ocupa ${H.f(cm2, 1)} cm² en un mapa a escala 1:${H.f(den)}. ¿Cuál es su superficie real en hectáreas?`; ans = cm2 * (den / 100) ** 2 / 1e4; unit = 'ha'; expl = `${H.f(cm2, 1)} cm² × (${H.f(den / 100)} m/cm)² = ${H.f(cm2 * (den / 100) ** 2)} m² = ${H.f(ans, 2)} ha`; }
      const inp = H.h('input', { type: 'number', step: 'any', style: { flex: '0 0 150px' } }); const res = H.h('span');
      const chk = H.h('button', { class: 'btn sm', type: 'button' }, 'Comprobar');
      chk.onclick = () => { const v = parseFloat(inp.value); res.innerHTML = Math.abs(v - ans) <= Math.max(0.01, Math.abs(ans) * 0.01) ? ' <span class="pill ok">Correcto</span>' : ` <span class="pill ko">No</span> <span class="small">${expl}</span>`; };
      exb.append(H.h('p', {}, q), H.h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, inp, H.h('span', { style: { flex: '0 0 auto' } }, unit), H.h('span', { style: { flex: '0 0 auto' } }, chk)), res, H.h('p', {}, H.h('button', { class: 'btn ghost sm', type: 'button', onclick: newEx }, 'Otro ejercicio')));
    };
    newEx();
    el.append(H.h('div', { class: 'grid2 even' }, H.h('div', { class: 'card' }, H.h('h3', {}, '¿Gran o pequeña escala?'), ord), H.h('div', { class: 'card' }, H.h('h3', {}, 'Ejercicios'), exb,
      H.html('<table class="t" style="margin-top:8px"><thead><tr><th>Tipo de documento (orientativo)</th><th>Escalas</th></tr></thead><tbody><tr><td>Planos</td><td>1:10.000 o mayores</td></tr><tr><td>Mapas topográficos (MTN25, MTN50)</td><td>1:25.000 a 1:100.000</td></tr><tr><td>Mapas corográficos y geográficos</td><td>1:200.000 y menores</td></tr></tbody></table>'))));

    el.append(H.fix('apartado 3.2', ['Se llaman <b>planos</b> los documentos a escala <b>1:10.000 o mayor</b> (denominador de 10.000 o menos); el «para abajo» del manual puede inducir a confusión, porque los planos son las escalas mayores, no las menores.']));
    el.append(H.selfCheck([
      { q: '¿Cuál de estas escalas es mayor?', opts: ['1:1.000.000', '1:200.000', '1:50.000', '1:5.000'], a: 3, ex: 'La escala es una fracción: 1/5.000 es la mayor. Gran escala = denominador pequeño = más detalle y menos territorio.' },
      { q: 'En un mapa 1:50.000, 3 cm equivalen a…', opts: ['150 m', '1,5 km', '15 km', '150 km'], a: 1, ex: '3 × 50.000 = 150.000 cm = 1.500 m = 1,5 km.' },
      { q: 'Si duplicamos el denominador de la escala, la superficie que ocupa un mismo terreno en el mapa…', opts: ['Se reduce a la mitad', 'Se reduce a la cuarta parte', 'Se duplica', 'No cambia'], a: 1, ex: 'Las superficies varían con el cuadrado de la escala: (1/2)² = 1/4.' },
      { q: '¿Qué ventaja tiene la escala gráfica frente a la numérica?', opts: ['Es más precisa', 'Sigue siendo válida si el mapa se amplía o reduce', 'Permite calcular superficies', 'Indica la proyección'], a: 1, ex: 'El segmento se amplía o reduce junto con el mapa, de modo que la equivalencia se mantiene; la escala numérica deja de ser cierta.' },
    ]));
  },
});
