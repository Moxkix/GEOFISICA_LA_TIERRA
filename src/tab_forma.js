/* ===================== 1 · FORMA Y DIMENSIONES ===================== */
H.tab({
  id: 'forma', nav: 'Forma y dimensiones', title: 'Forma y dimensiones',
  init(el) {
    el.append(H.intro('Planeta · apartado 1', 'Forma y dimensiones de la Tierra',
      'La Tierra no es exactamente una esfera: es un elipsoide achatado por los polos y, con más precisión, un geoide. Empieza por reproducir el razonamiento de Eratóstenes, que estimó su tamaño en el siglo III a. C. con una sombra y una distancia.',
      'Manual: 1.1 y 1.2<br>Figuras 1.1 y 1.2'));

    /* ---------- A · Eratóstenes ---------- */
    const st = { th: 7.2, est: 5000, km: 800, unit: 'est', stadion: 157.5 };
    const svgBox = H.h('div', { class: 'viz framed' });
    const ro = { cst: H.ro('Circunferencia', 'hl'), ckm: H.ro('En kilómetros', 'hl'), r: H.ro('Radio deducido'), err: H.ro('Diferencia con 40.075 km', 'bl') };
    const thS = H.slider('Ángulo de la sombra en Alejandría (θ)', 5, 10, 0.1, st.th, (v) => H.f(v, 1) + '° = 1/' + H.f(360 / v, 1) + ' de circunferencia', (v) => { st.th = v; upd(); });
    const dS = H.slider('Distancia Siena–Alejandría', 4000, 6000, 50, st.est, (v) => H.f(v) + ' estadios', (v) => { st.est = v; upd(); });
    const kS = H.slider('Distancia Siena–Alejandría', 600, 1000, 5, st.km, (v) => H.f(v) + ' km', (v) => { st.km = v; upd(); });
    const stadSeg = H.seg([[157.5, 'Egipcio · 157,5 m'], [185, 'Ático · 185 m'], [192.3, 'Olímpico · 192,3 m']], st.stadion, (v) => { st.stadion = v; upd(); });
    const stadBox = H.h('div', { class: 'ctrl' }, H.h('div', { class: 'lab' }, 'Longitud del estadio (incierta)'), stadSeg);
    const unitSeg = H.seg([['est', 'Datos originales (estadios)'], ['km', 'Datos en km (como el manual)']], 'est', (v) => { st.unit = v; upd(); });
    const presets = H.h('div', { class: 'row', style: { marginTop: '4px' } },
      H.h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { st.unit = 'est'; unitSeg.set('est'); st.th = 7.2; thS.set(7.2); st.est = 5000; dS.set(5000); upd(); } }, 'Eratóstenes: 7,2° y 5.000 est.'),
      H.h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { st.unit = 'km'; unitSeg.set('km'); st.th = 7; thS.set(7); st.km = 800; kS.set(800); upd(); } }, 'Manual: 7° y 800 km'));

    const drawSvg = () => {
      const k = 3, tv = st.th * k * H.D2R, cx = 330, cy = 430, R = 265;
      const P = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
      const S = P(0), A = P(-tv), n = [Math.sin(-tv), -Math.cos(-tv)];
      const T = [A[0] + 70 * n[0], A[1] + 70 * n[1]];
      // sombra: rayo vertical desde T hasta la superficie
      const dx = T[0] - cx; const sy = cy - Math.sqrt(R * R - dx * dx); const Sh = [T[0], sy];
      const arc = (c, r, a0, a1) => { const p0 = [c[0] + r * Math.sin(a0), c[1] - r * Math.cos(a0)], p1 = [c[0] + r * Math.sin(a1), c[1] - r * Math.cos(a1)]; return `M${p0[0]} ${p0[1]} A ${r} ${r} 0 0 ${a1 > a0 ? 1 : 0} ${p1[0]} ${p1[1]}`; };
      let s = `<svg viewBox="0 0 600 470" role="img" aria-label="Esquema del método de Eratóstenes">
        <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#d79a2b"/></marker>
        <radialGradient id="eg" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#f1e6c8"/><stop offset="1" stop-color="#d9c48f"/></radialGradient></defs>
        <rect width="600" height="470" fill="#fbfaf6"/><style>.lb{paint-order:stroke;stroke:#fbfaf6;stroke-width:4px;stroke-linejoin:round}</style>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#eg)" stroke="#1c2836" stroke-width="1.5"/>`;
      for (let x = 40; x <= 560; x += 40) { const ddx = x - cx; if (Math.abs(ddx) >= R) continue; const yy = cy - Math.sqrt(R * R - ddx * ddx); s += `<line x1="${x}" y1="18" x2="${x}" y2="${yy - 6}" stroke="#d79a2b" stroke-width="1.3" marker-end="url(#ar)" opacity=".75"/>`; }
      s += `<text x="20" y="14" font-size="12" fill="#a8741a" font-weight="700">☀ Rayos solares paralelos (el Sol está muy lejos)</text>`;
      // radios al centro
      s += `<line x1="${cx}" y1="${cy}" x2="${S[0]}" y2="${S[1]}" stroke="#1f6f8b" stroke-width="1.5" stroke-dasharray="5 4"/>
            <line x1="${cx}" y1="${cy}" x2="${A[0]}" y2="${A[1]}" stroke="#1f6f8b" stroke-width="1.5" stroke-dasharray="5 4"/>
            <path d="${arc([cx, cy], 70, -tv, 0)}" fill="none" stroke="#b4531d" stroke-width="2"/>
            <text x="${cx - 26}" y="${cy - 80}" font-size="14" fill="#b4531d" font-weight="700" text-anchor="middle">θ</text>
            <circle cx="${cx}" cy="${cy}" r="3" fill="#1c2836"/><text x="${cx + 8}" y="${cy - 4}" font-size="11" fill="#5a6878">centro</text>`;
      // arco de superficie
      s += `<path d="${arc([cx, cy], R + 14, -tv, 0)}" fill="none" stroke="#1c2836" stroke-width="1" marker-end="url(#ar)"/>
            <text class="lb" x="${(S[0] + A[0]) / 2}" y="${Math.min(S[1], A[1]) - 22}" font-size="12" text-anchor="middle" fill="#1c2836">${st.unit === 'est' ? H.f(st.est) + ' estadios' : H.f(st.km) + ' km'}</text>`;
      // pozo de Siena
      s += `<rect x="${S[0] - 6}" y="${S[1]}" width="12" height="26" fill="#1c2836"/><circle cx="${S[0]}" cy="${S[1] + 22}" r="4" fill="#ffd34d"/>
            <text class="lb" x="${S[0] + 12}" y="${S[1] + 18}" font-size="12" fill="#1c2836"><tspan font-weight="700">Siena (Asuán)</tspan><tspan x="${S[0] + 12}" dy="14">Sol en el cénit: ilumina el fondo del pozo</tspan></text>`;
      // gnomon y sombra en Alejandría
      s += `<line x1="${A[0]}" y1="${A[1]}" x2="${T[0]}" y2="${T[1]}" stroke="#1c2836" stroke-width="3"/>
            <line x1="${T[0]}" y1="${T[1] - 30}" x2="${Sh[0]}" y2="${Sh[1]}" stroke="#d79a2b" stroke-width="1.5"/>
            <line x1="${A[0]}" y1="${A[1]}" x2="${Sh[0]}" y2="${Sh[1]}" stroke="#333" stroke-width="5" stroke-linecap="round" opacity=".55"/>
            <path d="${arc(T, 26, Math.PI - tv, Math.PI)}" fill="none" stroke="#b4531d" stroke-width="2"/>
            <text x="${T[0] + 4}" y="${T[1] + 42}" font-size="13" fill="#b4531d" font-weight="700">θ</text>
            <text class="lb" x="${T[0] - 10}" y="${T[1] - 4}" font-size="12" text-anchor="end" fill="#1c2836"><tspan font-weight="700">Alejandría</tspan><tspan x="${T[0] - 10}" dy="14">gnomon y su sombra</tspan></text>
            <text x="16" y="462" font-size="11" fill="#5a6878">Ángulos exagerados ×3. Los dos ángulos θ son iguales (alternos internos entre paralelas).</text></svg>`;
      svgBox.innerHTML = s;
    };
    const upd = () => {
      dS.style.display = st.unit === 'est' ? '' : 'none'; stadBox.style.display = st.unit === 'est' ? '' : 'none'; kS.style.display = st.unit === 'km' ? '' : 'none';
      const frac = 360 / st.th;
      const dkm = st.unit === 'est' ? st.est * st.stadion / 1000 : st.km;
      const C = frac * dkm;
      ro.cst.v.innerHTML = st.unit === 'est' ? `${H.f(frac * st.est)} <small>estadios</small>` : `${H.f(frac, 2)} × ${H.f(st.km)} km`;
      ro.ckm.v.innerHTML = `${H.f(C)} <small>km</small>`;
      ro.r.v.innerHTML = `${H.f(C / (2 * Math.PI))} <small>km</small>`;
      const e = (C - 40075) / 40075 * 100; ro.err.v.innerHTML = `${H.fs(e, 1)} %`;
      drawSvg();
    };
    const cardA = H.h('div', { class: 'card' }, H.h('h3', {}, 'El experimento de Eratóstenes'),
      H.h('p', { class: 'sub' }, 'El día del solsticio de verano, a mediodía, el Sol estaba en la vertical de Siena y en Alejandría un gnomon proyectaba una sombra de unos 7,2°. Si la Tierra es esférica y los rayos llegan paralelos, ese ángulo es la fracción de la circunferencia que separa ambas ciudades.'),
      H.h('div', { class: 'grid2' }, svgBox,
        H.h('div', {}, unitSeg, H.h('div', { style: { height: '10px' } }), thS, dS, kS, stadBox, presets,
          H.h('div', { class: 'readouts', style: { marginTop: '12px' } }, ro.cst, ro.ckm, ro.r, ro.err),
          H.h('p', { class: 'small', html: '<span class="formula">C = d × 360° / θ</span> &nbsp; Siena está casi sobre el trópico de Cáncer (24° 05′ N): por eso allí el Sol llega a la vertical en el solsticio de junio.' }))));
    el.append(cardA);
    upd();

    /* ---------- B · Esfera, elipsoide, geoide ---------- */
    const g = { k: 25, show: { sph: true, ell: true, geo: true } };
    const cv = H.h('canvas');
    const cvs = H.autoCanvas(cv, (w) => Math.min(w * 0.82, 470), (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      const f = H.K.f * g.k;
      const ellR = (t) => { const a = R * (1 + f / 3), b = a * (1 - f); return a * b / Math.hypot(b * Math.cos(t), a * Math.sin(t)); }; // t = ángulo desde el ecuador
      const geoN = (t) => (60 * Math.sin(3 * t + 0.6) + 32 * Math.cos(5 * t - 0.4) + 18 * Math.sin(9 * t)) / 6371000 * R * g.k * 12;
      const path = (fn, col, lw, dash) => { ctx.beginPath(); for (let i = 0; i <= 360; i++) { const t = i * H.D2R, r = fn(t); const x = cx + r * Math.cos(t), y = cy - r * Math.sin(t); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
      if (g.show.ell) { ctx.beginPath(); for (let i = 0; i <= 360; i++) { const t = i * H.D2R, r = ellR(t); const x = cx + r * Math.cos(t), y = cy - r * Math.sin(t); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.fillStyle = 'rgba(228,211,168,.45)'; ctx.fill(); path(ellR, '#1c2836', 2); }
      if (g.show.sph) path(() => R, '#1f6f8b', 1.5, [6, 5]);
      if (g.show.geo) path((t) => ellR(t) + geoN(t), '#b4531d', 2);
      // ejes
      ctx.strokeStyle = 'rgba(28,40,54,.35)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(cx - R * 1.15, cy); ctx.lineTo(cx + R * 1.15, cy); ctx.moveTo(cx, cy - R * 1.15); ctx.lineTo(cx, cy + R * 1.15); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#1c2836'; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Polo N', cx, cy - R * 1.17 - 4); ctx.fillText('Ecuador', cx + R * 1.06, cy - 6);
      ctx.textAlign = 'left'; ctx.font = '11px system-ui'; ctx.fillStyle = '#5a6878';
      ctx.fillText(`Achatamiento exagerado ×${g.k}${g.show.geo ? ' · ondulaciones del geoide exageradas ×' + (g.k * 12) + ' (esquema)' : ''}`, 10, h - 10);
    });
    const kS2 = H.slider('Exageración del achatamiento', 1, 60, 1, g.k, (v) => '×' + v, (v) => { g.k = v; cvs.redraw(); });
    const chk = (key, label, col) => { const c = H.h('input', { type: 'checkbox', checked: true }); c.onchange = () => { g.show[key] = c.checked; cvs.redraw(); }; return H.h('label', { class: 'chk' }, c, H.h('i', { style: { display: 'inline-block', width: '16px', height: '3px', background: col } }), label); };
    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Esfera, elipsoide y geoide'),
      H.h('p', { class: 'sub' }, 'A escala real, el achatamiento es invisible: en una bola de 1 m de diámetro, el diámetro polar sería solo 3,4 mm menor. Exagéralo para ver qué representa cada figura.'),
      H.h('div', { class: 'grid2' }, H.h('div', { class: 'viz framed' }, cv),
        H.h('div', {}, kS2, H.h('div', { class: 'row', style: { marginBottom: '10px' } }, chk('sph', 'Esfera', '#1f6f8b'), chk('ell', 'Elipsoide', '#1c2836'), chk('geo', 'Geoide', '#b4531d')),
          H.html(`<table class="t"><tbody>
            <tr><td><b>Esfera</b></td><td>Modelo simple. Radio medio <b>6.371,0 km</b>; circunferencia ≈ 40.030 km.</td></tr>
            <tr><td><b>Elipsoide</b></td><td>Esfera achatada: semieje ecuatorial <b>a = 6.378,137 km</b>, polar <b>b = 6.356,752 km</b> (WGS84). Achatamiento f = (a − b)/a = 1/298,257. Los diámetros difieren 42,77 km. Es la superficie matemática sobre la que se calculan las coordenadas.</td></tr>
            <tr><td><b>Geoide</b></td><td>Superficie equipotencial de la gravedad que coincide con el nivel medio del mar prolongado bajo los continentes. Se separa del elipsoide entre unos −106 m (sur de la India) y +85 m (Nueva Guinea, Islandia). Es la referencia de las altitudes.</td></tr>
            </tbody></table>`)))));

    /* ---------- C · Luna ---------- */
    const moon = H.html(`<div class="card"><h3>La Luna, a escala</h3>
      <p class="sub">Tamaños y distancia en la misma escala. La distancia media equivale a unos 30 diámetros terrestres.</p>
      <svg viewBox="0 0 1000 120" style="width:100%;height:auto"><rect width="1000" height="120" fill="#0f1a2a" rx="8"/>
        <circle cx="40" cy="60" r="16.6" fill="#7fb2cf"/><text x="40" y="104" fill="#cfd6df" font-size="12" text-anchor="middle">Tierra</text>
        <circle cx="${40 + 960 * 0.98}" cy="60" r="4.5" fill="#d8d8d0"/><text x="${40 + 960 * 0.98}" y="104" fill="#cfd6df" font-size="12" text-anchor="middle">Luna</text>
        <line x1="60" y1="60" x2="${40 + 960 * 0.98 - 8}" y2="60" stroke="#5a6878" stroke-dasharray="3 5"/>
        <text x="500" y="50" fill="#cfd6df" font-size="12" text-anchor="middle">384.400 km (≈ 30 diámetros terrestres)</text></svg>
      <div class="readouts" style="margin-top:10px">
        <div class="ro"><div class="k">Diámetro</div><div class="v">3.474 <small>km</small></div><small>27 % del terrestre (≈ 1/4)</small></div>
        <div class="ro"><div class="k">Masa</div><div class="v">1/81 <small>de la terrestre</small></div></div>
        <div class="ro"><div class="k">Distancia media</div><div class="v">384.400 <small>km</small></div></div>
        <div class="ro"><div class="k">Periodo sidéreo</div><div class="v">27,3 <small>días</small></div><small>Sinódico (fases): 29,5 días</small></div>
        <div class="ro"><div class="k">Sentido de giro</div><div class="v">Oeste → este</div></div>
      </div>
      <p class="small">Su atracción produce las mareas (se estudian en el tema de los océanos) y su posición respecto al Sol y la Tierra explica los eclipses.</p></div>`);
    el.append(moon);

    el.append(H.fix('apartado 1', [
      'Radios: el manual da 6.378,16 / 6.356,77 / 6.367,75 km. Los valores del sistema WGS84 son <b>6.378,137 km</b> (ecuatorial) y <b>6.356,752 km</b> (polar); el radio medio adoptado por la UGGI es <b>6.371,0 km</b>.',
      'Eratóstenes: midió 1/50 de circunferencia (<b>7° 12′</b>) y una distancia de <b>5.000 estadios</b>, lo que da 250.000 estadios. Su equivalencia en km depende del estadio usado (≈ 39.000–46.000 km). Con los datos que cita el manual (7° y 800 km) el resultado es ≈ 41.100 km, no 45.000.',
      'Magallanes murió en <b>1521</b>; Elcano culminó la primera vuelta al mundo en 1522.',
      'La masa lunar, omitida en el texto, es ≈ <b>1/81</b> de la terrestre. El eje lunar no es paralelo al terrestre: forma 1,5° con la normal a la eclíptica, frente a 23,4° del terrestre.',
    ]));

    el.append(H.selfCheck([
      { q: '¿Qué figura corresponde al nivel medio del mar prolongado por debajo de los continentes?', opts: ['La esfera', 'El elipsoide de revolución', 'El geoide', 'El cono tangente'], a: 2, ex: 'El geoide es la superficie equipotencial de la gravedad que coincide con el nivel medio del mar. Es irregular y sirve de referencia para las altitudes.' },
      { q: 'La diferencia entre el diámetro ecuatorial y el polar de la Tierra es de unos…', opts: ['4,3 km', '43 km', '430 km', '4.300 km'], a: 1, ex: '2 × (6.378,137 − 6.356,752) = 42,77 km. Es un 0,34 % del diámetro: a simple vista la Tierra es una esfera.' },
      { q: 'Si Eratóstenes hubiera medido en Alejandría un ángulo mayor, con la misma distancia, la circunferencia calculada habría sido…', opts: ['Mayor', 'Menor', 'Igual', 'No se puede saber'], a: 1, ex: 'C = d × 360/θ: si θ crece, cabe un número menor de veces en 360° y C disminuye. Pruébalo con el deslizador.' },
      { q: '¿Por qué los rayos que llegan a Siena y a Alejandría pueden considerarse paralelos?', opts: ['Porque la Tierra es plana', 'Porque el Sol está muy lejos en comparación con el tamaño de la Tierra', 'Porque ambas ciudades están en el mismo meridiano', 'Porque era mediodía'], a: 1, ex: 'A 150 millones de km, la divergencia de los rayos entre dos puntos separados unos 800 km es despreciable. Es la hipótesis clave del método.' },
    ]));
  },
});
