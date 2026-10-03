/* ===================== I · BALANCE ENERGÉTICO ===================== */
H.tab({
  id: 'balance', nav: 'Balance energético', title: 'Balance energético y efecto invernadero',
  init(el) {
    el.append(H.intro('La insolación terrestre · apartados 4 y 5', 'Balance energético y efecto invernadero',
      'La Tierra recibe energía del Sol en onda corta y la devuelve al espacio en onda larga. Por término medio entra tanta energía como sale, pero por el camino la atmósfera la absorbe, la refleja, la dispersa y la reemite. Ese reparto explica que la superficie esté a unos 15 °C y no a −18 °C, la temperatura que tendría sin efecto invernadero.',
      'Manual: 4 y 5.1<br>Figs. 2.4 a 2.8'));

    /* ---------- A · balance global ---------- */
    const DATA = {
      manual: { inc: 100, refAtm: 35, refSfc: 0, absAtm: 20, sfcIn: 45, sfcAbs: 45, lwUp: 120, win: 15, back: 105, atmOut: 50, lat: 20, sen: 10, unit: '' },
      actual: { inc: 341.3, refAtm: 79, refSfc: 23, absAtm: 78, sfcIn: 184, sfcAbs: 161, lwUp: 396, win: 40, back: 333, atmOut: 199, lat: 80, sen: 17, unit: 'W/m²' },
    };
    const b = { mode: 'actual' };
    const svgBox = H.h('div', { class: 'viz wide-svg' });
    const balBox = H.h('div');
    const drawBal = () => {
      const d = DATA[b.mode], pc = (v) => v / d.inc * 100;
      const lab = (v) => b.mode === 'manual' ? H.f(v) : `${H.f(v)}<tspan class="u"> · ${H.f(pc(v))} %</tspan>`;
      const W = 1000, Ht = 470, yT = 96, yS = 396, k = 0.26; // px por punto porcentual
      const wd = (v) => Math.max(3, pc(v) * k);
      const vArrow = (x, y1, y2, v, col) => { // flecha vertical; y2 es la punta
        const w = wd(v), dir = Math.sign(y2 - y1), hl = 12, hw = w / 2 + 6;
        return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - dir * hl}" stroke="${col}" stroke-width="${w}"/><path d="M${x} ${y2} L${x - hw} ${y2 - dir * hl} L${x + hw} ${y2 - dir * hl}Z" fill="${col}"/>`;
      };
      const tl = (x, y, v, t, anc = 'start') => `<text x="${x}" y="${y}" text-anchor="${anc}" class="fl"><tspan class="v">${lab(v)}</tspan><tspan x="${x}" dy="14" class="d">${t}</tspan></text>`;
      const SW = '#e2a72a', SWr = '#efc768', LW = '#c0503a', NR = '#4f86a8';
      const R = (x, v) => x + wd(v) / 2 + 8;
      let s = `<svg viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Balance energético de la Tierra"><style>
        .fl{font:12px system-ui,sans-serif;fill:#1c2836}.fl .v{font-weight:700;font-size:13px}.fl .u{font-weight:400;fill:#5a6878}.fl .d{fill:#5a6878;font-size:11px}
        .ttl{font:bold 11px system-ui;letter-spacing:.1em;fill:#5a6878}.rg{font:bold 10px system-ui;letter-spacing:.12em;fill:#8a96a3}</style>
        <rect x="0" y="${yT}" width="${W}" height="${yS - yT}" fill="#eef4f7"/>
        <rect x="0" y="${yS}" width="${W}" height="${Ht - yS}" fill="#e9dcb8"/>
        <line x1="0" y1="${yT}" x2="${W}" y2="${yT}" stroke="#1c2836" stroke-dasharray="6 4"/>
        <line x1="392" y1="22" x2="392" y2="${Ht}" stroke="#fff" stroke-width="3"/><line x1="772" y1="22" x2="772" y2="${Ht}" stroke="#fff" stroke-width="3"/>
        <text x="196" y="14" class="ttl" text-anchor="middle">ONDA CORTA (SOLAR)</text><text x="582" y="14" class="ttl" text-anchor="middle">ONDA LARGA (TERRESTRE)</text><text x="886" y="14" class="ttl" text-anchor="middle">SIN RADIACIÓN</text>
        <text x="${W - 8}" y="${yT - 8}" class="rg" text-anchor="end">ESPACIO</text><text x="${W - 8}" y="${yT + 16}" class="rg" text-anchor="end">ATMÓSFERA</text><text x="${W - 8}" y="${yS + 16}" class="rg" text-anchor="end">SUPERFICIE</text>`;
      // onda corta
      s += vArrow(50, 30, 168, d.inc, SW) + tl(R(50, d.inc), 52, d.inc, 'radiación entrante');
      s += vArrow(222, 168, 30, d.refAtm, SWr) + tl(R(222, d.refAtm), 52, d.refAtm, b.mode === 'manual' ? 'reflejada (25) y difundida (10)' : 'reflejada por nubes y aire');
      s += `<circle cx="176" cy="208" r="7" fill="${SW}" opacity=".6"/>` + tl(190, 204, d.absAtm, 'absorbida por la atmósfera');
      s += vArrow(50, 178, yS - 2, d.sfcIn, SW) + tl(R(50, d.sfcIn), 300, d.sfcIn, b.mode === 'manual' ? 'al suelo (25 directa + 20 difusa)' : 'llega al suelo');
      if (d.refSfc > 0) s += vArrow(362, yS - 2, yT - 2, d.refSfc, SWr) + tl(352, 330, d.refSfc, 'reflejada por el suelo', 'end');
      else s += `<text x="352" y="330" class="fl" text-anchor="end"><tspan class="d">reflexión del suelo: incluida</tspan><tspan x="352" dy="14" class="d">en la de las nubes</tspan></text>`;
      s += tl(50, yS + 34, d.sfcAbs, 'absorbida por la superficie');
      // onda larga
      s += vArrow(425, yS - 2, 190, d.lwUp, LW) + tl(425, 156, d.lwUp, 'emitida por el suelo', 'middle');
      s += vArrow(530, 190, yS - 2, d.back, LW) + tl(530, 156, d.back, 'contrarradiación', 'middle');
      s += vArrow(610, yS - 2, 30, d.win, LW) + tl(R(610, d.win), 52, d.win, 'ventana');
      s += vArrow(722, 190, 30, d.atmOut, LW) + tl(R(722, d.atmOut), 52, d.atmOut, 'al espacio');
      // otros flujos
      s += vArrow(815, yS - 2, 214, d.lat, NR) + tl(815, 180, d.lat, 'calor latente', 'middle');
      s += vArrow(935, yS - 2, 274, d.sen, NR) + tl(935, 240, d.sen, 'calor sensible', 'middle');
      s += `</svg>`;
      svgBox.innerHTML = s;
      const toa = d.refAtm + d.refSfc + d.win + d.atmOut, atmIn = d.absAtm + (d.lwUp - d.win) + d.lat + d.sen, atmOut = d.back + d.atmOut, sIn = d.sfcAbs + d.back, sOut = d.lwUp + d.lat + d.sen;
      const row = (n, a, c) => `<tr><td><b>${n}</b></td><td class="n">${H.f(a)}</td><td class="n">${H.f(c)}</td><td class="n">${a - c > 0.5 ? '+' : ''}${H.f(a - c)}</td></tr>`;
      balBox.innerHTML = `<table class="t flowtable"><thead><tr><th>Compartimento</th><th>Recibe</th><th>Pierde</th><th>Saldo</th></tr></thead><tbody>
        ${row('Cima de la atmósfera', d.inc, toa)}${row('Atmósfera', atmIn, atmOut)}${row('Superficie', sIn, sOut)}</tbody></table>
        <p class="small">${b.mode === 'manual' ? 'Esquema del manual en unidades por cada 100 que llegan del Sol: cada compartimento recibe exactamente lo que pierde.' : 'Valores de Trenberth, Fasullo y Kiehl (2009) en W/m² (media del planeta, 2000–2004). Estimaciones posteriores son muy parecidas, aunque reducen la «ventana» a unos 22 W/m² (Costa y Shine, 2012). Los saldos de ±1 se deben al redondeo y al pequeño desequilibrio actual (≈ +0,9 W/m²), la energía que el planeta acumula por el aumento del efecto invernadero.'}</p>
        <p class="small">Albedo planetario: <b>${H.f(pc(d.refAtm + d.refSfc), 0)} %</b> · absorbida por la atmósfera: <b>${H.f(pc(d.absAtm), 0)} %</b> · por la superficie: <b>${H.f(pc(d.sfcAbs), 0)} %</b>.</p>`;
    };
    const modeSeg = H.seg([['actual', 'Valores actuales (W/m²)'], ['manual', 'Esquema del manual (fig. 2.4)']], b.mode, (v) => { b.mode = v; drawBal(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El balance energético de la Tierra'),
      H.h('p', { class: 'sub' }, 'El grosor de cada flecha es proporcional a la energía que transporta. Compara el esquema del manual con las estimaciones actuales: la idea es la misma, pero cambian las cifras.'),
      modeSeg, H.h('div', { style: { height: '10px' } }), svgBox, balBox));
    drawBal();

    /* ---------- B · efecto invernadero ---------- */
    const g = { alb: 0.30, eps: 0.778, S: 1361 };
    const gBox = H.h('div', { class: 'viz wide-svg' });
    const ro = { te: H.ro('Temperatura sin efecto invernadero'), ts: H.ro('Temperatura de la superficie', 'hl'), ef: H.ro('Efecto invernadero', 'bl'), ta: H.ro('Temperatura de la capa atmosférica') };
    const drawG = () => {
      const sig = T2.SIGMA, Q = g.S * (1 - g.alb) / 4, Te = Math.pow(Q / sig, 0.25), Ts = Te * Math.pow(2 / (2 - g.eps), 0.25), Ta = Ts / Math.pow(2, 0.25);
      const up = sig * Ts ** 4, win = (1 - g.eps) * up, atm = g.eps * sig * Ta ** 4;
      ro.te.v.textContent = T2.fT(Te - 273.15); ro.ts.v.textContent = T2.fT(Ts - 273.15); ro.ef.v.innerHTML = `+${H.f(Ts - Te, 1)} <small>°C</small>`; ro.ta.v.textContent = g.eps > 0.01 ? T2.fT(Ta - 273.15) : '—';
      const W = 700, Hh = 300, k = 0.07, yL0 = 100, yL1 = 170, yG = 250;
      const ar = (x, y1, y2, v, col) => { const w = Math.max(3, v * k), dir = Math.sign(y2 - y1); return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - dir * 12}" stroke="${col}" stroke-width="${w}"/><path d="M${x} ${y2} l${-w / 2 - 6} ${-dir * 12} h${w + 12}z" fill="${col}"/>`; };
      const tx = (x, y, v, t) => `<text x="${x}" y="${y}" class="fl"><tspan class="v">${H.f(v)} W/m²</tspan><tspan x="${x}" dy="13" class="d">${t}</tspan></text>`;
      const Rx = (x, v) => x + Math.max(3, v * k) / 2 + 8;
      let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Modelo de una capa"><style>.fl{font:12px system-ui;fill:#1c2836}.fl .v{font-weight:700}.fl .d{fill:#5a6878;font-size:11px}</style>
        <rect x="0" y="${yL0}" width="${W}" height="${yL1 - yL0}" fill="rgba(192,80,58,${0.05 + g.eps * 0.22})"/>
        <text x="${W - 8}" y="${yL1 - 10}" class="fl" text-anchor="end"><tspan class="d">capa atmosférica: absorbe el ${H.f(g.eps * 100)} % de la onda larga</tspan></text>
        <rect x="0" y="${yG}" width="${W}" height="${Hh - yG}" fill="#e9dcb8"/><text x="8" y="${Hh - 14}" class="fl"><tspan class="d">superficie</tspan></text>`;
      s += ar(70, 10, yG - 2, Q, '#e2a72a') + tx(Rx(70, Q), 40, Q, 'solar absorbida');
      s += ar(230, yG - 2, 10, up, '#c0503a') + tx(Rx(230, up), 200, up, 'emitida por el suelo');
      if (win > 0.5) s += ar(380, yG - 2, 10, win, '#d98b74') + tx(Rx(380, win), 40, win, 'escapa (ventana)');
      if (atm > 0.5) { s += ar(490, yL1, yG - 2, atm, '#c0503a') + tx(Rx(490, atm), 200, atm, 'contrarradiación'); s += ar(585, yL0, 10, atm, '#c0503a') + tx(Rx(585, atm), 40, atm, 'al espacio'); }
      s += `</svg>`;
      gBox.innerHTML = s;
    };
    const aS = H.slider('Albedo planetario', 0.05, 0.7, 0.01, g.alb, (v) => H.f(v * 100) + ' %', (v) => { g.alb = v; drawG(); });
    const eS = H.slider('Absorción de onda larga (gases de efecto invernadero)', 0, 1, 0.002, g.eps, (v) => H.f(v * 100, 1) + ' %', (v) => { g.eps = v; drawG(); });
    const sS = H.slider('Constante solar', 1200, 1500, 1, g.S, (v) => H.f(v) + ' W/m²', (v) => { g.S = v; drawG(); });
    const pre = H.h('div', { class: 'chipbar' });
    [['Tierra actual', 0.30, 0.778, 1361], ['Sin atmósfera', 0.30, 0, 1361], ['Más gases de efecto invernadero', 0.30, 0.798, 1361], ['Tierra cubierta de hielo', 0.60, 0.778, 1361]].forEach(([l, a, e, S]) => { const bt = H.h('button', { class: 'chip', type: 'button' }, l); bt.onclick = () => { g.alb = a; g.eps = e; g.S = S; aS.set(a); eS.set(e); sS.set(S); drawG(); }; pre.append(bt); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'El efecto invernadero en un modelo de una sola capa'),
      H.h('p', { class: 'sub' }, 'La atmósfera deja pasar casi toda la onda corta pero absorbe buena parte de la onda larga que emite el suelo, y la reemite en parte hacia abajo. Modifica el albedo y la absorción infrarroja y observa la temperatura de equilibrio.'),
      H.h('div', { class: 'grid2' }, gBox, H.h('div', {}, pre, H.h('div', { style: { height: '10px' } }), aS, eS, sS, H.h('div', { class: 'readouts' }, ro.ts, ro.te, ro.ef, ro.ta),
        H.h('p', { class: 'small', html: '<span class="formula">T<sub>e</sub> = [S(1 − α) / 4σ]<sup>¼</sup></span> &nbsp; <span class="formula">T<sub>s</sub> = T<sub>e</sub> · [2 / (2 − ε)]<sup>¼</sup></span>. Modelo didáctico: no incluye realimentaciones (vapor de agua, hielo, nubes), que en la realidad amplifican los cambios.' })))));
    drawG();

    /* ---------- C · espectros ---------- */
    const sp = { T: 1000 };
    const spC = H.chart(H.h('canvas'), 0.42);
    const spRo = H.h('div', { class: 'readouts' });
    const fr = { uv: T2.bandFraction(5772, 0, 0.4), vis: T2.bandFraction(5772, 0.4, 0.7) };
    const drawSp = () => {
      const lx = (l) => Math.log10(l); const xs = []; for (let l = 0.1; l <= 100; l *= 1.03) xs.push(l);
      const curve = (Tk) => { const v = xs.map((l) => T2.planck(l, Tk)); const m = Math.max(...v); return xs.map((l, i) => [lx(l), v[i] / m]); };
      const ticks = [0.1, 0.2, 0.4, 0.7, 1, 2, 4, 10, 20, 50, 100].map((v) => ({ v: lx(v), label: H.f(v, v < 1 ? 1 : 0) }));
      spC.draw({ xMin: -1, xMax: 2, yMin: 0, yMax: 1.12, xTicks: ticks, yTicks: [{ v: 0, label: '0' }, { v: 0.5, label: '0,5' }, { v: 1, label: '1' }], xLabel: 'Longitud de onda (µm, escala logarítmica)', yLabel: 'Emisión relativa',
        bands: [{ x0: -1, x1: lx(0.4), color: 'rgba(120,80,200,.10)' }, { x0: lx(0.4), x1: lx(0.7), color: 'rgba(240,200,60,.18)' }, { x0: lx(8), x1: lx(13), color: 'rgba(31,111,139,.10)' }],
        series: [{ pts: curve(5772), color: '#e2a72a', width: 3 }, { pts: curve(288), color: '#c0503a', width: 3 }, { pts: curve(sp.T), color: '#1c2836', width: 1.5, dash: [5, 4] }],
        after: (ctx, X, Y) => {
          ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#6b4fa0'; ctx.fillText('UV', X(lx(0.2)), Y(1.07)); ctx.fillStyle = '#a8741a'; ctx.fillText('visible', X(lx(0.53)), Y(1.07)); ctx.fillStyle = '#1f6f8b'; ctx.fillText('ventana', X(lx(10.2)), Y(1.07));
          ctx.fillStyle = '#a8741a'; ctx.font = 'bold 12px system-ui'; ctx.fillText('Sol · 5.772 K', X(lx(0.5)), Y(0.62)); ctx.fillStyle = '#c0503a'; ctx.fillText('Tierra · 288 K', X(lx(10)), Y(0.62));
          const gases = [['O₃', 0.25], ['H₂O', 1.4], ['H₂O', 1.9], ['CO₂', 4.3], ['H₂O', 6.3], ['O₃', 9.6], ['CO₂', 15], ['H₂O', 30]];
          ctx.font = '10px system-ui'; ctx.fillStyle = '#5a6878'; for (const [n, l] of gases) { ctx.fillRect(X(lx(l)) - 0.5, Y(0.02), 1, -12); ctx.fillText(n, X(lx(l)), Y(0.02) - 15); }
        } });
      spRo.innerHTML = `<div class="ro"><div class="k">Máximo de emisión del Sol</div><div class="v">${H.f(2898 / 5772, 2)} <small>µm</small></div></div><div class="ro"><div class="k">Máximo de emisión de la Tierra</div><div class="v">${H.f(2898 / 288, 1)} <small>µm</small></div></div><div class="ro bl"><div class="k">Cuerpo negro a ${H.f(sp.T)} K</div><div class="v">${H.f(2898 / sp.T, 2)} <small>µm</small></div></div>
        <div class="ro hl"><div class="k">Sol: UV / visible / IR</div><div class="v">${H.f(fr.uv * 100)} / ${H.f(fr.vis * 100)} / ${H.f((1 - fr.uv - fr.vis) * 100)} <small>%</small></div></div>`;
    };
    const tS = H.slider('Temperatura de un cuerpo negro de prueba (curva discontinua)', 200, 8000, 10, sp.T, (v) => H.f(v) + ' K (' + T2.fNum(v - 273.15, 0) + ' °C)', (v) => { sp.T = v; drawSp(); });
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Onda corta y onda larga'),
      H.h('p', { class: 'sub' }, 'Cuanto más caliente es un cuerpo, en longitudes de onda más cortas emite (ley de Wien: λ máx = 2.898 / T µm). Por eso el Sol emite sobre todo en el visible y la Tierra en el infrarrojo térmico. Las marcas inferiores señalan bandas de absorción de los gases; la franja azul de 8 a 13 µm es la «ventana» por la que escapa parte de la onda larga.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz' }, spC.st.canvas), H.h('div', {}, tS, spRo,
        H.h('p', { class: 'small' }, 'Curvas normalizadas a su máximo (el Sol emite, por unidad de superficie, unas 160.000 veces más que la Tierra). Reparto calculado para un cuerpo negro de 5.772 K; el espectro solar real tiene algo menos de UV (≈ 8 %). La emisión solar de rayos X y gamma es insignificante.')))));
    drawSp();

    /* ---------- D · del techo de la atmósfera al suelo ---------- */
    const EX5 = [['Yangambi', 1, 373, 397], ['Dakar', 15, 470, 580], ['Calcuta', 22, 501, 817], ['Santa María (California)', 35.5, 235, 651], ['Madrid', 40.4, 155, 606], ['Bruselas', 51, 47, 441], ['Estocolmo', 59, 18, 517]];
    const toa = (lat, doy) => { const s = H.sun(H.dateFromDoy(doy).getTime()); return H.toaInsolation(lat, s.decl, s.R) / T2.LANGLEY; };
    const dDec = H.doyOf(H.EV.dic), dJun = H.doyOf(H.EV.jun);
    const ex5rows = EX5.map(([n, la, de, ju]) => { const td = toa(la, dDec), tj = toa(la, dJun); return `<tr><td><b>${n}</b></td><td class="n">${H.f(la, la % 1 ? 1 : 0)}° N</td><td class="n">${de}</td><td class="n">${H.f(td)}</td><td class="n"><b>${H.f(de / td * 100)} %</b></td><td class="n">${ju}</td><td class="n">${H.f(tj)}</td><td class="n"><b>${H.f(ju / tj * 100)} %</b></td></tr>`; }).join('');
    el.append(H.html(`<div class="card"><h3>Del techo de la atmósfera al suelo: ejercicios 3 y 5 del manual</h3>
      <p class="sub">Energía recibida en el suelo (tabla del manual, cal/cm²·día) frente a la que llega al techo de la atmósfera en el solsticio, calculada para cada latitud. El porcentaje mide cuánto deja pasar la atmósfera: nubes, vapor de agua y polvo.</p>
      <div style="overflow-x:auto"><table class="t flowtable"><thead><tr><th rowspan="2">Lugar</th><th rowspan="2">Latitud</th><th colspan="3">Diciembre</th><th colspan="3">Junio</th></tr><tr><th>Suelo</th><th>Techo</th><th>Llega</th><th>Suelo</th><th>Techo</th><th>Llega</th></tr></thead><tbody>${ex5rows}</tbody></table></div>
      <p class="hint">1 cal/cm²·día (1 langley) = 0,484 W/m². Valores del techo de la atmósfera para los solsticios de ${H.year}.</p></div>`));
    const ex = H.h('div', { class: 'card', style: { background: 'var(--soft)' } });
    ex.append(H.h('h4', {}, 'Ejercicios de autoevaluación 3 y 5 del manual'),
      H.openQ('3. ¿Por qué la zona ecuatorial, pese a que la incidencia de los rayos es máxima, no es donde se produce la mayor insolación terrestre?', 'Porque su atmósfera es muy nubosa y húmeda: en Yangambi apenas llega al suelo la mitad de la energía del techo de la atmósfera. Los valores máximos se registran en los desiertos subtropicales (Sahara, Arabia, Australia), con cielos despejados casi todo el año (fig. 2.11). Además, en el ecuador el día dura siempre 12 h, mientras que en verano las latitudes medias y altas tienen días mucho más largos.'),
      H.openQ('5. ¿Qué factores explican las diferencias de la tabla y a qué zona climática pertenece cada lugar?', 'En <b>diciembre</b> la energía cae con la latitud porque el Sol está bajo y los días son cortos (Estocolmo recibe 18 frente a 373 en Yangambi). En <b>junio</b> las diferencias se borran e incluso se invierten: la mayor duración del día compensa la menor altura solar (Estocolmo supera a Yangambi). La <b>nubosidad</b> rebaja los valores en el ecuador y en las latitudes oceánicas (Bruselas). Zonas: Yangambi, ecuatorial; Dakar, tropical seca; Calcuta, tropical monzónica; Santa María y Madrid, templada mediterránea; Bruselas, templada oceánica; Estocolmo, templada fría de transición a la continental.'),
      H.html(`<p class="small">Para la geometría de la insolación (altura solar, duración del día, distancia al Sol) ve al Tema 1: <a href="${H.T1}#insolacion">Esfericidad e insolación</a> · <a href="${H.T1}#estaciones">Traslación y estaciones</a>.</p>`));
    el.append(ex);

    el.append(H.fix('apartados 4 y 5', [
      'Balance energético: las estimaciones actuales (Trenberth y otros, 2009) dan un albedo planetario de ≈ <b>30 %</b> (no 35 %), una absorción en superficie de ≈ <b>47 %</b>, calor latente ≈ <b>23 %</b> y calor sensible ≈ <b>5 %</b>. El esquema del manual es coherente, pero antiguo.',
      'La temperatura efectiva del Sol es de <b>5.772 K, unos 5.500 °C</b>. Su emisión de rayos X y gamma es insignificante.',
      'Fig. 2.7: el ángulo entre los planos de la eclíptica y del ecuador es fijo (<b>23° 26′</b>); lo que vale 20° en el ejemplo es la <b>declinación solar</b>. Ver <a href="' + H.T1 + '#estaciones">Tema 1 · Traslación y estaciones</a>.',
    ]));
    el.append(H.selfCheck([
      { q: '¿En qué tipo de radiación pierde energía la Tierra hacia el espacio?', opts: ['Ultravioleta', 'Visible', 'Infrarroja (onda larga)', 'Rayos X'], a: 2, ex: 'A unos 288 K, la Tierra emite sobre todo hacia 10 µm, en el infrarrojo térmico.' },
      { q: '¿Qué es el albedo?', opts: ['La energía absorbida por la atmósfera', 'La proporción de radiación reflejada por una superficie', 'La radiación emitida por el suelo', 'El calor latente de evaporación'], a: 1, ex: 'El planeta refleja ≈ 30 %; la nieve fresca, más del 80 %; el mar con el Sol alto, apenas un 2–6 %.' },
      { q: 'Sin efecto invernadero, la temperatura media de la superficie sería de unos…', opts: ['+30 °C', '+15 °C', '0 °C', '−18 °C'], a: 3, ex: 'Es la temperatura de equilibrio radiativo con un albedo del 30 %. Los gases de efecto invernadero elevan la media a ≈ +15 °C.' },
      { q: 'La superficie emite más onda larga (≈ 116 %) de la que recibe del Sol (≈ 47 %). ¿Cómo es posible?', opts: ['Porque el interior de la Tierra la calienta', 'Porque también recibe la contrarradiación de la atmósfera', 'Porque el albedo es negativo', 'Es un error de medida'], a: 1, ex: 'La atmósfera, calentada por la onda larga del suelo, devuelve hacia abajo casi tanta energía como la que llega del Sol en total.' },
      { q: 'Si aumenta la absorción de onda larga por la atmósfera, la temperatura de la superficie…', opts: ['Baja', 'Sube', 'No cambia', 'Primero sube y luego baja'], a: 1, ex: 'Aumenta la contrarradiación y el suelo debe calentarse para volver a equilibrar el balance. Compruébalo con el modelo.' },
    ]));
  },
});
