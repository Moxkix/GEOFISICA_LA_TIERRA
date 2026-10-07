/* ===================== H · NUBES, FRENTES Y BORRASCAS ===================== */
H.tab({
  id: 'frentes', nav: 'Nubes y frentes', title: 'Nubes, frentes y borrascas',
  init(el) {
    el.append(H.intro('La humedad · apartados 3.3.2 y 3.3.3', 'Nubes, frentes y el paso de una borrasca',
      'La forma de las nubes delata cómo sube el aire: las cumuliformes crecen en vertical cuando el aire es inestable; las estratiformes se extienden en capas cuando es estable. En latitudes medias, los frentes de las borrascas obligan al aire cálido a subir sobre el frío y ordenan las nubes y la lluvia en una secuencia que se repite con cada perturbación.',
      'Manual: 3.3.2 y 3.3.3<br>Figs. 3.18 a 3.20'));

    /* ================= A · atlas de nubes ================= */
    const INFO = {
      Ci: ['Cirros (Ci)', 'Alta: de 5 a 13 km', 'Cristales de hielo', 'Filamentos blancos y fibrosos («colas de caballo»). No precipitan. Si aumentan y se espesan, anuncian un frente cálido.'],
      Cc: ['Cirrocúmulos (Cc)', 'Alta: de 5 a 13 km', 'Hielo (a veces gotitas subfundidas)', 'Pequeños copos sin sombra, en bancos o capas: el «cielo aborregado». No precipitan.'],
      Cs: ['Cirrostratos (Cs)', 'Alta: de 5 a 13 km', 'Cristales de hielo', 'Velo blanquecino y transparente que produce halos alrededor del Sol y la Luna. Suele preceder a un frente cálido.'],
      Ac: ['Altocúmulos (Ac)', 'Media: de 2 a 7 km', 'Gotitas de agua (a veces hielo)', 'Bancos de copos o rollos con sombras propias. Suelen indicar tiempo estable; los de torreones (castellanus) anuncian tormentas.'],
      As: ['Altostratos (As)', 'Media: de 2 a 7 km', 'Agua y hielo', 'Capa gris o azulada que cubre el cielo; el Sol se ve como tras un vidrio esmerilado, sin halo. Precede a la lluvia del frente cálido.'],
      Ns: ['Nimbostratos (Ns)', 'Media, con la base casi siempre por debajo de 2 km y varios km de espesor', 'Agua, hielo y copos de nieve', 'Capa gris oscura que oculta el Sol. Lluvia o nieve continua y moderada durante horas: la nube típica del frente cálido.'],
      Sc: ['Estratocúmulos (Sc)', 'Baja: hasta 2 km', 'Gotitas de agua', 'Bancos o rollos grises con partes oscuras. Son las nubes más frecuentes del planeta; como mucho dan lluvia débil.'],
      St: ['Estratos (St)', 'Baja: hasta 2 km', 'Gotitas de agua', 'Capa gris y uniforme, como una niebla que no toca el suelo. Llovizna.'],
      Cu: ['Cúmulos (Cu)', 'Base baja; desarrollo vertical', 'Gotitas de agua', 'Nubes aisladas de contorno nítido y base plana. Pequeños, de buen tiempo; con más inestabilidad crecen y dan chubascos.'],
      Cb: ['Cumulonimbos (Cb)', 'Base baja; cima en la tropopausa: 10–12 km en latitudes medias, 16–18 km en los trópicos', 'Agua en la parte baja, hielo arriba', 'Nube de tormenta con forma de yunque: chubascos intensos, granizo, rayos y rachas. Frentes fríos y convección.'],
    };
    const Yz = (z) => 500 - z * 35;
    const puffs = (cx, cy, r, n, sp, col) => { let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${cx + (i - (n - 1) / 2) * sp}" cy="${cy - Math.sin(i * 1.7) * r * 0.25}" r="${r * (0.8 + 0.3 * Math.abs(Math.sin(i * 2.3)))}" fill="${col}"/>`; return o; };
    let svg = `<svg viewBox="0 0 1000 540" role="img" aria-label="Atlas de nubes por altitud"><defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa3d6"/><stop offset="1" stop-color="#cfe6f6"/></linearGradient></defs>
      <rect x="0" y="0" width="1000" height="510" fill="url(#sky3)"/><rect x="0" y="500" width="1000" height="40" fill="#b9a675"/>`;
    for (let z = 0; z <= 13; z += 1) svg += `<line x1="40" x2="48" y1="${Yz(z)}" y2="${Yz(z)}" stroke="#1c2836"/>${z % 2 === 0 ? `<text x="36" y="${Yz(z) + 4}" text-anchor="end" font-size="11" fill="#1c2836">${z} km</text>` : ''}`;
    svg += `<line x1="48" x2="48" y1="${Yz(13)}" y2="500" stroke="#1c2836"/><line x1="52" x2="990" y1="${Yz(2)}" y2="${Yz(2)}" stroke="#fff" stroke-dasharray="4 6" opacity=".7"/><line x1="52" x2="990" y1="${Yz(7)}" y2="${Yz(7)}" stroke="#fff" stroke-dasharray="4 6" opacity=".7"/><line x1="52" x2="990" y1="${Yz(5)}" y2="${Yz(5)}" stroke="#fff" stroke-dasharray="1 5" opacity=".6"/>`;
    svg += `<text x="985" y="${Yz(9.5)}" text-anchor="end" font-size="12" fill="#fff" font-weight="700">ALTAS</text><text x="985" y="${Yz(4.5)}" text-anchor="end" font-size="12" fill="#fff" font-weight="700">MEDIAS</text><text x="985" y="${Yz(1.2)}" text-anchor="end" font-size="12" fill="#fff" font-weight="700">BAJAS</text>`;
    const g = (k, inner, lx, lz) => `<g class="cloud" data-k="${k}" tabindex="0" role="button" aria-label="${INFO[k][0]}" style="cursor:pointer">${inner}<text x="${lx}" y="${Yz(lz)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1c2836" style="paint-order:stroke" stroke="#fff" stroke-width="3">${k}</text></g>`;
    // altas
    svg += g('Cc', Array.from({ length: 4 }, (_, j) => Array.from({ length: 9 }, (_, i) => `<circle cx="${85 + i * 22 + (j % 2) * 10}" cy="${Yz(8.9) + j * 12}" r="5.5" fill="#fff" opacity=".95"/>`).join('')).join(''), 175, 9.6);
    svg += g('Cs', `<rect x="300" y="${Yz(8.6)}" width="230" height="40" rx="18" fill="#fff" opacity=".55"/><circle cx="470" cy="${Yz(7.9)}" r="12" fill="#ffe680"/><circle cx="470" cy="${Yz(7.9)}" r="34" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>`, 360, 9.2);
    svg += g('Ci', Array.from({ length: 6 }, (_, i) => `<path d="M${560 + i * 40} ${Yz(10.2) + (i % 2) * 14} q 25 -18 50 -6 q 10 6 4 14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".95"/>`).join(''), 690, 11.3);
    // medias
    svg += g('Ac', [0, 1, 2].map((j) => puffs(170, Yz(5.0) + j * 18, 11, 7, 26, '#f4f6f8')).join('') + [0, 1, 2].map((j) => puffs(170, Yz(5.0) + j * 18 + 5, 8, 7, 26, '#c9d1da')).join(''), 175, 5.9);
    svg += g('As', `<rect x="300" y="${Yz(5.4)}" width="230" height="44" rx="10" fill="#b8c2cd"/><circle cx="380" cy="${Yz(4.75)}" r="12" fill="#f3efe0" opacity=".8"/>`, 415, 5.7);
    // nimbostrato y lluvia
    svg += g('Ns', `<path d="M545 ${Yz(4.6)} h170 v ${4.6 * 35 - 0.9 * 35} h-170z" fill="#7d8794"/>` + Array.from({ length: 16 }, (_, i) => `<line x1="${552 + i * 10.5}" y1="${Yz(0.9)}" x2="${546 + i * 10.5}" y2="498" stroke="#5b7fa3" stroke-width="1.4"/>`).join(''), 630, 4.9);
    // cumulonimbo
    svg += g('Cb', `<path d="M760 ${Yz(0.9)} C 745 ${Yz(3)} 770 ${Yz(5)} 780 ${Yz(7.5)} C 785 ${Yz(9.5)} 760 ${Yz(10.6)} 720 ${Yz(11.3)} L 990 ${Yz(11.4)} C 940 ${Yz(10.8)} 900 ${Yz(10)} 905 ${Yz(7.5)} C 915 ${Yz(5)} 935 ${Yz(3)} 920 ${Yz(0.9)} Z" fill="#eef1f4"/><path d="M760 ${Yz(0.9)} h160 v-10 h-160z" fill="#6c7581"/>` + Array.from({ length: 14 }, (_, i) => `<line x1="${768 + i * 11}" y1="${Yz(0.8)}" x2="${760 + i * 11}" y2="498" stroke="#3e6690" stroke-width="2"/>`).join('') + `<path d="M840 ${Yz(0.8)} l -14 30 h 10 l -12 34" fill="none" stroke="#ffd34d" stroke-width="3"/>`, 845, 6.5);
    // bajas
    svg += g('Sc', [0, 1].map((j) => `<path d="M${70 + j * 6} ${Yz(1.5) + j * 20} q 20 -18 40 0 q 20 -20 40 0 q 20 -18 40 0 q 18 -16 34 0 z" fill="${j ? '#9aa5b1' : '#c3cbd4'}"/>`).join(''), 145, 2.15);
    svg += g('Cu', `<path d="M215 ${Yz(0.9)} c -10 -14 0 -28 14 -26 c 0 -22 26 -30 38 -14 c 12 -14 34 -4 30 14 c 16 0 18 20 6 26 z" fill="#fff"/>`, 254, 2.7);
    svg += g('St', `<rect x="300" y="${Yz(0.75)}" width="230" height="16" rx="8" fill="#a8b1bb"/>` + Array.from({ length: 22 }, (_, i) => `<circle cx="${306 + i * 10}" cy="${Yz(0.4) + (i % 3) * 4}" r="1.2" fill="#5b7fa3"/>`).join(''), 415, 1.1);
    svg += '</svg>';
    const atlas = H.h('div', { class: 'viz framed wide-svg', html: svg });
    const infoBox = H.h('div', { class: 'info' }, 'Pulsa una nube para ver sus características.');
    const showCloud = (k) => { const [n, alt, comp, tx] = INFO[k]; infoBox.innerHTML = `<b>${n}</b><br><span class="small">Altitud: ${alt} · Composición: ${comp}</span><br>${tx}`; H.$$('.cloud', atlas).forEach((c) => c.style.filter = c.dataset.k === k ? 'drop-shadow(0 0 6px #b4531d)' : ''); };
    // juego
    const Q = [['Cb', 'Nube de tormenta con forma de yunque'], ['Cs', 'Velo transparente que forma halos'], ['Ns', 'Capa oscura con lluvia continua durante horas'], ['Cc', 'Cielo aborregado de copos pequeños, muy alto'], ['St', 'Capa baja y uniforme que da llovizna'], ['Cu', 'Nube aislada de base plana y contorno de coliflor'], ['As', 'El Sol se ve como tras un vidrio esmerilado'], ['Ci', 'Filamentos de hielo, «colas de caballo»'], ['Sc', 'Rollos grises bajos, las nubes más frecuentes'], ['Ac', 'Bancos de copos con sombra a media altura']];
    const qz = { i: -1, ok: 0, n: 0, on: false };
    const qTxt = H.h('b'), qFb = H.h('span', { class: 'small' }), qSc = H.h('span', { class: 'pill ok' }, '0 / 0');
    const nextQ = () => { let k; do { k = Math.floor(Math.random() * Q.length); } while (k === qz.i); qz.i = k; qz.on = true; qTxt.textContent = Q[k][1]; qFb.textContent = ''; };
    const qb = H.h('button', { class: 'btn sm', type: 'button' }, 'Jugar: señala la nube'); qb.onclick = () => { nextQ(); qb.textContent = 'Otra →'; };
    H.$$('.cloud', atlas).forEach((c) => {
      const act = () => { const k = c.dataset.k; showCloud(k); if (qz.on) { qz.on = false; qz.n++; const good = k === Q[qz.i][0]; if (good) qz.ok++; qSc.textContent = `${qz.ok} / ${qz.n}`; qFb.innerHTML = good ? ' <span style="color:var(--ok)">✔ Correcto</span>' : ` <span style="color:var(--bad)">✘ Era ${INFO[Q[qz.i][0]][0]}</span>`; } };
      c.addEventListener('click', act); c.addEventListener('keydown', (e) => { if (e.key === 'Enter') act(); });
    });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Los diez géneros de nubes según su altura'),
      H.h('p', { class: 'sub' }, 'Clasificación de la Organización Meteorológica Mundial para latitudes medias (fig. 3.20). Las nubes altas son de hielo; las medias y bajas, de gotitas de agua, salvo que estén muy frías.'),
      atlas, infoBox, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', gap: '10px' } }, H.h('span', { style: { flex: 'none' } }, qb), H.h('span', { style: { flex: 'none' } }, qTxt, qFb), H.h('span', { style: { flex: 'none' } }, qSc))));

    /* ================= B · ciclo de vida de una borrasca frontal ================= */
    const b = { ph: 1.2, tau: -18 };
    const lerp = (a, c, u) => a + (c - a) * u;
    const key = (arr, ph) => { const i = Math.min(arr.length - 2, Math.floor(ph)), u = ph - i; return lerp(arr[i], arr[i + 1], u); };
    const geom = () => {
      const ph = b.ph, occ = ph <= 1.4 ? 0 : (ph - 1.4) / 1.6 * 650, oa = -55 * H.D2R;
      const T = [occ * Math.cos(oa), occ * Math.sin(oa)];
      const thw = key([0, -22, -32, -40], ph) * H.D2R, thc = key([180, 222, 240, 250], ph) * H.D2R;
      const Lw = key([650, 700, 650, 500], ph), Lc = key([800, 900, 850, 700], ph);
      const curve = (P0, th, L, bend) => { const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30, a = th + bend * u; pts.push([P0[0] + Math.cos(th + bend * u * 0.5) * L * u, P0[1] + Math.sin(th + bend * u * 0.5) * L * u]); void a; } return pts; };
      const wf = curve(T, thw, Lw, -0.25), cf = curve(T, thc, Lc, 0.35);
      const of = []; if (occ > 0) for (let i = 0; i <= 20; i++) { const u = i / 20; of.push([T[0] * u + Math.sin(u * Math.PI) * 60, T[1] * u]); }
      const depth = ph <= 2.2 ? 1 + 5 * Math.sin(Math.min(1, ph / 2.2) * Math.PI / 2) : 6 - (ph - 2.2) * 3;
      return { T, wf, cf, of, depth, fade: ph > 2.4 ? 1 - (ph - 2.4) / 0.9 : 1 };
    };
    const cvB = H.h('canvas');
    const BB = { x0: -1100, x1: 1300, y0: -800, y1: 650 };
    const csB = H.autoCanvas(cvB, (w) => Math.min(w * 0.6, 440), (ctx, w, h) => {
      const X = (x) => (x - BB.x0) / (BB.x1 - BB.x0) * w, Y = (y) => h - (y - BB.y0) / (BB.y1 - BB.y0) * h, G = geom();
      ctx.fillStyle = '#dfe9f2'; ctx.fillRect(0, 0, w, h);
      // sector cálido
      ctx.fillStyle = 'rgba(240,165,110,.35)'; ctx.beginPath(); G.wf.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); const we = G.wf[G.wf.length - 1], ce = G.cf[G.cf.length - 1];
      ctx.lineTo(X(we[0]), Y(BB.y0)); ctx.lineTo(X(ce[0]), Y(BB.y0)); for (let i = G.cf.length - 1; i >= 0; i--) ctx.lineTo(X(G.cf[i][0]), Y(G.cf[i][1])); ctx.closePath(); ctx.fill();
      // isobaras
      ctx.strokeStyle = 'rgba(28,40,54,.55)'; ctx.lineWidth = 1;
      const n = Math.max(1, Math.round(G.depth)); for (let k = 1; k <= n; k++) { ctx.beginPath(); ctx.ellipse(X(0), Y(0), k * 120 / (BB.x1 - BB.x0) * w, k * 95 / (BB.y1 - BB.y0) * h, 0, 0, 7); ctx.stroke(); }
      ctx.font = 'bold 22px system-ui'; ctx.fillStyle = '#1f6f8b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('B', X(0), Y(0));
      // frentes con símbolos
      const front = (pts, col, kind, alpha = 1) => {
        if (pts.length < 2) return; ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
        const P = pts.map(([x, y]) => [X(x), Y(y)]); let acc = 0, next = 22, cnt = 0;
        for (let i = 1; i < P.length; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i], d = Math.hypot(x1 - x0, y1 - y0); while (acc + d >= next) { const u = (next - acc) / d, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, tx = (x1 - x0) / d, ty = (y1 - y0) / d; let nx = -ty, ny = tx; if (ny > 0) { nx = -nx; ny = -ny; } // símbolos hacia el norte/este
          const k2 = kind === 'occ' ? (cnt % 2 ? 'warm' : 'cold') : kind; ctx.fillStyle = k2 === 'warm' ? (kind === 'occ' ? col : '#c0392b') : (kind === 'occ' ? col : '#1f5fa8');
          if (kind === 'cold') { nx = -ty; ny = tx; if (nx < 0) { nx = -nx; ny = -ny; } }
          if (k2 === 'warm') { ctx.beginPath(); ctx.arc(x, y, 6, Math.atan2(ny, nx) - Math.PI / 2, Math.atan2(ny, nx) + Math.PI / 2); ctx.fill(); }
          else { ctx.beginPath(); ctx.moveTo(x - tx * 6, y - ty * 6); ctx.lineTo(x + tx * 6, y + ty * 6); ctx.lineTo(x + nx * 10, y + ny * 10); ctx.closePath(); ctx.fill(); }
          next += 36; cnt++; } acc += d; }
        ctx.globalAlpha = 1;
      };
      front(G.wf, '#c0392b', 'warm', G.fade); front(G.cf, '#1f5fa8', 'cold', G.fade); if (G.of.length) front(G.of, '#7a3d9a', 'occ', G.fade);
      // aire frío y cálido
      ctx.font = '12px system-ui'; ctx.fillStyle = '#1f5fa8'; ctx.textAlign = 'center'; ctx.fillText('aire polar (frío)', X(250), Y(480)); ctx.fillStyle = '#b4531d'; ctx.fillText('aire tropical (cálido)', X(150), Y(-650));
      // corte C–D
      const ys = G.T[1] - 300; ctx.strokeStyle = '#1c2836'; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(BB.x0 + 40), Y(ys)); ctx.lineTo(X(BB.x1 - 40), Y(ys)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#1c2836'; ctx.fillText('C', X(BB.x0 + 25), Y(ys)); ctx.fillText('D', X(BB.x1 - 25), Y(ys));
      // observador (se desplaza con el tiempo relativo)
      const cr = crossing(G, ys), xo = cr.xw - b.tau * 40; if (xo > BB.x0 && xo < BB.x1) { ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.arc(X(xo), Y(ys), 6, 0, 7); ctx.fill(); ctx.fillStyle = '#1c2836'; ctx.font = '11px system-ui'; ctx.textAlign = X(xo) > w - 50 ? 'right' : X(xo) < 50 ? 'left' : 'center'; ctx.fillText('observador', X(xo), Y(ys) - 14); }
      ctx.fillStyle = '#1c2836'; ctx.textAlign = 'left'; ctx.font = 'bold 13px system-ui'; ctx.fillText(['a) Fase de formación', 'b) Fase inicial (borrasca madura)', 'c) Fase de oclusión', 'd) Fase de disolución'][Math.min(3, Math.round(b.ph))], 10, 18);
    });
    // intersección del corte con los frentes
    const crossing = (G, ys) => { const at = (pts) => { for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if ((y0 - ys) * (y1 - ys) <= 0 && y1 !== y0) return x0 + (x1 - x0) * (ys - y0) / (y1 - y0); } return null; }; return { xw: at(G.wf) ?? 400, xc: at(G.cf) ?? -300 }; };
    // perfil vertical a lo largo de C–D
    const cvS = H.h('canvas');
    const csS = H.autoCanvas(cvS, (w) => Math.min(w * 0.32, 230), (ctx, w, h) => {
      const G = geom(), cr = crossing(G, G.T[1] - 300), ZM = 12, X = (x) => (x - BB.x0) / (BB.x1 - BB.x0) * w, Y = (z) => h - 16 - z / ZM * (h - 26);
      ctx.fillStyle = '#eaf2f7'; ctx.fillRect(0, 0, w, h);
      const xw = cr.xw, xc = cr.xc;
      // aire frío por delante (cuña bajo el frente cálido) y por detrás del frente frío
      ctx.fillStyle = 'rgba(31,95,168,.18)'; ctx.beginPath(); ctx.moveTo(X(xw), Y(0)); ctx.lineTo(X(xw + 150 * ZM), Y(ZM)); ctx.lineTo(X(BB.x1), Y(ZM)); ctx.lineTo(X(BB.x1), Y(0)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(xc), Y(0)); ctx.lineTo(X(xc - 60 * ZM), Y(ZM)); ctx.lineTo(X(BB.x0), Y(ZM)); ctx.lineTo(X(BB.x0), Y(0)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(240,165,110,.25)'; ctx.beginPath(); ctx.moveTo(X(xc), Y(0)); ctx.lineTo(X(xw), Y(0)); ctx.lineTo(X(xw + 150 * ZM), Y(ZM)); ctx.lineTo(X(xc - 60 * ZM), Y(ZM)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(xw), Y(0)); ctx.lineTo(X(xw + 150 * ZM), Y(ZM)); ctx.stroke();
      ctx.strokeStyle = '#1f5fa8'; ctx.beginPath(); ctx.moveTo(X(xc), Y(0)); ctx.lineTo(X(xc - 60 * ZM), Y(ZM)); ctx.stroke(); ctx.lineWidth = 1;
      // nubes del frente cálido: Ci, Cs, As, Ns
      const lay = (x0, x1, z0, z1, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(x0), Y(z0)); ctx.lineTo(X(x1), Y(z0 + (x1 - x0) / 150)); ctx.lineTo(X(x1), Y(z1 + (x1 - x0) / 150)); ctx.lineTo(X(x0), Y(z1)); ctx.closePath(); ctx.fill(); };
      lay(xw, xw + 300, 0.8, 5.5, 'rgba(110,120,135,.85)'); lay(xw + 300, xw + 700, 2.6, 4.6, 'rgba(170,180,192,.85)'); lay(xw + 700, xw + 1000, 4.9, 5.9, 'rgba(230,236,242,.9)'); lay(xw + 1000, xw + 1350, 6.8, 7.4, 'rgba(255,255,255,.95)');
      ctx.strokeStyle = 'rgba(31,111,139,.7)'; for (let x = xw + 10; x < xw + 300; x += 20) { ctx.beginPath(); ctx.moveTo(X(x), Y(0.8)); ctx.lineTo(X(x) - 3, Y(0)); ctx.stroke(); }
      // sector cálido: estratos bajos; frente frío: cumulonimbo; detrás: cúmulos
      ctx.fillStyle = 'rgba(160,168,180,.7)'; ctx.fillRect(X(xc + 60), Y(1), X(xw) - X(xc + 60), Y(0.4) - Y(1));
      ctx.fillStyle = 'rgba(245,247,250,.95)'; ctx.beginPath(); ctx.moveTo(X(xc + 40), Y(0.8)); ctx.lineTo(X(xc + 70), Y(9)); ctx.lineTo(X(xc + 280), Y(10.4)); ctx.lineTo(X(xc - 120), Y(10.4)); ctx.lineTo(X(xc - 40), Y(9)); ctx.lineTo(X(xc - 60), Y(0.8)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(28,40,54,.3)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(31,80,150,.9)'; ctx.lineWidth = 2; for (let x = xc - 50; x < xc + 40; x += 12) { ctx.beginPath(); ctx.moveTo(X(x), Y(0.8)); ctx.lineTo(X(x) - 4, Y(0)); ctx.stroke(); } ctx.lineWidth = 1;
      for (let x = xc - 600; x < xc - 150; x += 160) { ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(X(x), Y(1.6), 7, 0, 7); ctx.arc(X(x) + 8, Y(1.9), 8, 0, 7); ctx.arc(X(x) + 16, Y(1.5), 6, 0, 7); ctx.fill(); }
      ctx.font = '10.5px system-ui'; ctx.fillStyle = '#1c2836'; ctx.textAlign = 'center';
      [['Ns', xw + 150, 3.4], ['As', xw + 500, 5.2], ['Cs', xw + 850, 6.9], ['Ci', xw + 1170, 8.4], ['Cb', xc + 80, 5.5], ['St', (xc + xw) / 2, 1.5], ['Cu', xc - 360, 2.8]].forEach(([t, x, z]) => { if (x > BB.x0 + 20 && x < BB.x1 - 20) ctx.fillText(t, X(x), Y(z)); });
      ctx.fillStyle = '#c0392b'; ctx.fillText('frente cálido (pendiente ≈ 1:150)', X(Math.min(xw + 420, BB.x1 - 200)), Y(0.3) - 2);
      ctx.fillStyle = '#1f5fa8'; ctx.fillText('frente frío (≈ 1:60)', X(Math.max(xc - 300, BB.x0 + 120)), Y(5));
      ctx.fillStyle = '#5a6878'; ctx.textAlign = 'left'; ctx.fillText('Corte C–D (escala vertical muy exagerada)', 6, 12);
      // observador
      const xo = xw - b.tau * 40; if (xo > BB.x0 && xo < BB.x1) { ctx.fillStyle = '#b4531d'; ctx.beginPath(); ctx.moveTo(X(xo), Y(0)); ctx.lineTo(X(xo) - 6, Y(0) + 10); ctx.lineTo(X(xo) + 6, Y(0) + 10); ctx.fill(); }
    });
    // meteograma sintético del observador
    const met = T3.meteogram(H.h('canvas'));
    const synth = () => {
      const t = [], T = [], Td = [], p = [], dir = [], spd = [], pr = [], sky = [];
      const W = 500 / 40; // horas entre el paso del frente cálido (τ = 0) y el del frío
      for (let tau = -30; tau <= 30; tau += 0.5) {
        const dw = -tau * 40; // km por delante del frente cálido
        t.push(tau);
        const warm = tau > 0 && tau < W, after = tau >= W;
        T.push(after ? 6 + 2 * Math.exp(-(tau - W) / 8) - 2 : warm ? 14 : 8 + 6 / (1 + Math.exp(-tau * 1.2)) * (tau > -3 ? 1 : 0.2));
        Td.push(after ? 0 : warm ? 12 : 4 + 4 * Math.exp(tau / 10));
        p.push(1014 - 10 * Math.exp(-Math.pow((tau - W + 1) / 16, 2)) + (after ? 6 * (1 - Math.exp(-(tau - W) / 6)) : 0));
        dir.push(after ? 310 : warm ? 225 : 150); spd.push(after ? 45 : warm ? 30 : 20 + (tau > -10 ? 10 : 0));
        const rain = dw >= 0 && dw < 300 ? 1.8 : warm ? 0.2 : Math.abs(tau - W) < 1.3 ? 8 : after && tau < W + 10 && (Math.floor(tau) % 4 === 0) ? 1.5 : 0;
        pr.push(rain);
        sky.push(dw > 1000 ? 'Ci' : dw > 700 ? 'Cs' : dw > 300 ? 'As' : dw >= 0 ? 'Ns' : warm && Math.abs(tau - W) >= 1.3 ? 'St' : Math.abs(tau - W) < 1.3 ? 'Cb' : after && tau < W + 12 ? 'Cu' : 'despejado');
      }
      const xTicks = []; for (let v = -30; v <= 30; v += 6) xTicks.push({ v, label: (v > 0 ? '+' : '') + v + ' h', major: v === 0 });
      met.draw({ t, T, Td, p, dir, spd: spd.map((v) => v), pr, sky, xTicks, cursor: b.tau, marks: [{ t: 0, label: 'frente cálido', color: '#c0392b' }, { t: W, label: 'frente frío', color: '#1f5fa8' }], legend: [['#b0393a', 'temperatura'], ['#2d7a4c', 'punto de rocío', [5, 3]]] });
    };
    const phS = H.slider('Fase de la borrasca', 0, 3, 0.05, b.ph, (v) => ['formación', 'inicial', 'oclusión', 'disolución'][Math.min(3, Math.round(v))], (v) => { b.ph = v; csB.redraw(); csS.redraw(); });
    const tauS = H.slider('Tiempo para el observador (respecto al paso del frente cálido)', -30, 30, 0.5, b.tau, (v) => (v > 0 ? '+' : '') + H.f(v, 1) + ' h', (v) => { b.tau = v; csB.redraw(); csS.redraw(); synth(); });
    met.st.canvas.addEventListener('click', (e) => { b.tau = H.clamp(Math.round(met.tAt(e) * 2) / 2, -30, 30); tauS.set(b.tau); csB.redraw(); csS.redraw(); synth(); });
    let rafB = null; const playB = H.h('button', { class: 'btn acc sm', type: 'button' }, '▶ Ver el ciclo completo');
    playB.onclick = () => { cancelAnimationFrame(rafB); const t0 = performance.now(); const fr = (now) => { b.ph = Math.min(3, (now - t0) / 6000 * 3); phS.set(b.ph); csB.redraw(); csS.redraw(); if (b.ph < 3) rafB = requestAnimationFrame(fr); }; rafB = requestAnimationFrame(fr); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Ciclo de vida de una borrasca frontal'),
      H.h('p', { class: 'sub' }, 'El modelo noruego de las figs. 3.18 y 3.19: una onda en el frente polar se convierte en borrasca, con un frente cálido (rojo) y uno frío (azul) que encierran el sector cálido. El frente frío, más rápido, alcanza al cálido y lo levanta: es la oclusión (violeta). Abajo, el corte C–D por el sector cálido y lo que registraría un observador al paso de la borrasca.'),
      H.h('div', { class: 'grid2' }, H.h('div', {}, H.h('div', { class: 'viz framed' }, cvB), H.h('div', { class: 'viz framed', style: { marginTop: '8px' } }, cvS)),
        H.h('div', {}, phS, H.h('div', { class: 'row', style: { justifyContent: 'flex-start', marginBottom: '10px' } }, H.h('span', { style: { flex: 'none' } }, playB)), tauS, H.h('div', { class: 'viz framed' }, met.st.canvas),
          H.html('<p class="small">Meteograma sintético. Al acercarse el frente cálido: nubes cada vez más bajas y espesas (Ci → Cs → As → Ns), lluvia continua y presión en descenso. En el sector cálido: temperatura y punto de rocío más altos, viento del suroeste, estratos y llovizna. Con el frente frío: chubascos fuertes, el viento gira al noroeste, la temperatura cae y la presión sube.</p>')))));
    synth();

    /* ================= C · meteograma real ================= */
    const real = H.h('div', { class: 'card' }, H.h('h3', {}, 'Meteograma real: viento sur y frente frío en Bilbao, 23–26 de febrero de 2026'));
    if (typeof VSUR === 'undefined' || !VSUR) real.append(H.info('<b>Datos pendientes.</b> Aquí irá la serie horaria de ERA5 en Bilbao y en la meseta durante el episodio de viento sur y el paso del frente frío; se añadirá en cuanto se exporte desde Google Earth Engine.'));
    else T3.vsurMeteoCard && T3.vsurMeteoCard(real);
    el.append(real);

    el.append(H.fix('Nubes y frentes', [
      'Los cumulonimbos de latitudes medias no se quedan en 5–6 km: su cima llega a la tropopausa, hacia los <b>10–12 km</b> (16–18 km en los trópicos).',
      'Los nimbostratos son nubes del piso medio según la OMM, aunque su base suele estar por debajo de 2 km y su espesor abarca varios kilómetros.',
      'Los límites entre pisos son aproximados y se solapan: en latitudes medias, nubes altas de 5 a 13 km, medias de 2 a 7 km y bajas hasta 2 km.',
    ]));
    el.append(H.selfCheck([
      { q: 'La secuencia de nubes que anuncia la llegada de un frente cálido es…', opts: ['Cu → Cb', 'Ci → Cs → As → Ns', 'St → Sc → Cu', 'Ns → As → Ci'], a: 1, ex: 'La superficie frontal es poco inclinada: las nubes aparecen cientos de kilómetros antes, primero las más altas.' },
      { q: 'Las precipitaciones más intensas y breves de una borrasca se producen…', opts: ['En el frente cálido', 'En el frente frío', 'En el sector cálido', 'Delante de los cirros'], a: 1, ex: 'El frente frío, más inclinado, levanta bruscamente el aire cálido: cumulonimbos y chubascos.' },
      { q: 'En el hemisferio norte, al pasar un frente frío el viento suele girar…', opts: ['Del noroeste al sur', 'Del suroeste al noroeste', 'Del este al oeste', 'No cambia'], a: 1, ex: 'Detrás del frente frío entra aire polar del noroeste.' },
      { q: 'La oclusión se produce porque…', opts: ['El frente cálido avanza más rápido', 'El frente frío alcanza al cálido y levanta el aire del sector cálido', 'Desaparece el aire polar', 'La borrasca se profundiza'], a: 1, ex: 'Es el principio del fin de la borrasca: el aire cálido queda separado del suelo.' },
      { q: 'Una nube con forma de yunque, rayos y granizo es un…', opts: ['Nimbostrato', 'Cumulonimbo', 'Altostrato', 'Cirrocúmulo'], a: 1, ex: 'El yunque es la cima helada que se extiende bajo la tropopausa.' },
    ]));
  },
});
