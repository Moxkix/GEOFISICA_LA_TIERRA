/* ===================== 7 · PROYECCIONES ===================== */
H.PROJ = (() => {
  const D = Math.PI / 180, PI = Math.PI, S2 = Math.SQRT2;
  const wrap = (l) => { while (l > PI) l -= 2 * PI; while (l < -PI) l += 2 * PI; return l; };
  const mollTheta = (p) => { if (Math.abs(p) > PI / 2 - 1e-9) return Math.sign(p) * PI / 2; let t = p; for (let i = 0; i < 30; i++) { const d = -(2 * t + Math.sin(2 * t) - PI * Math.sin(p)) / (2 + 2 * Math.cos(2 * t)); t += d; if (Math.abs(d) < 1e-10) break; } return t; };
  const P = {};
  P.equi = { name: 'Equirectangular (cilíndrica simple)', fam: 'Cilíndrica', prop: ['q', 'Equidistante en los meridianos'],
    fwd: (p, l) => [l, p], inv: (x, y) => (Math.abs(x) <= PI && Math.abs(y) <= PI / 2) ? [y, x] : null, b: [-PI, PI, -PI / 2, PI / 2],
    txt: 'Meridianos y paralelos son rectas equiespaciadas: una cuadrícula regular. Conserva las distancias a lo largo de los meridianos, pero estira los paralelos hacia los polos. Muy usada para datos raster globales (SIG).' };
  P.merc = { name: 'Mercator', fam: 'Cilíndrica', prop: ['c', 'Conforme'], lim: 85,
    fwd: (p, l) => Math.abs(p) > 85 * D ? null : [l, Math.log(Math.tan(PI / 4 + p / 2))], inv: (x, y) => (Math.abs(x) <= PI && Math.abs(y) <= 3.13) ? [2 * Math.atan(Math.exp(y)) - PI / 2, x] : null, b: [-PI, PI, -3.13, 3.13],
    txt: 'Cilindro tangente al Ecuador; los paralelos se separan cada vez más para conservar los ángulos. Las líneas de rumbo constante (loxodromias) son rectas: por eso fue la carta náutica por excelencia (G. Mercator, 1569). Exagera enormemente las superficies en latitudes altas y no puede representar los polos.' };
  const c45 = Math.cos(45 * D);
  P.peters = { name: 'Gall-Peters', fam: 'Cilíndrica', prop: ['e', 'Equivalente'],
    fwd: (p, l) => [l * c45, Math.sin(p) / c45], inv: (x, y) => { const s = y * c45; if (Math.abs(s) > 1 || Math.abs(x) > PI * c45) return null; return [Math.asin(s), x / c45]; }, b: [-PI * c45, PI * c45, -1 / c45, 1 / c45],
    txt: 'Cilíndrica equivalente con paralelos estándar a 45°. La publicó J. Gall en 1855 y la popularizó A. Peters en 1973 como alternativa «justa» a Mercator. Conserva las superficies, pero alarga mucho las formas cerca del Ecuador y las aplana en latitudes altas. Los paralelos se aproximan hacia los polos.' };
  P.tm = { name: 'Transversa de Mercator (base de la UTM)', fam: 'Cilíndrica', prop: ['c', 'Conforme'], tm: true,
    fwd: (p, l) => { const B = Math.cos(p) * Math.sin(l); if (Math.abs(B) > 0.986) return null; return [0.5 * Math.log((1 + B) / (1 - B)), Math.atan2(Math.tan(p), Math.cos(l))]; },
    inv: (x, y) => { if (Math.abs(x) > 2.5 || Math.abs(y) > PI) return null; return [Math.asin(Math.sin(y) / Math.cosh(x)), Math.atan2(Math.sinh(x), Math.cos(y))]; }, b: [-2.5, 2.5, -PI, PI],
    txt: 'El cilindro se coloca tangente a un meridiano (el central). La deformación es mínima cerca de él y crece rápidamente al alejarse. La UTM divide la Tierra en 60 husos de 6° y usa un cilindro secante (factor de escala 0,9996 en el meridiano central). La franja resaltada es el huso 30, donde está casi toda la España peninsular.' };
  P.moll = { name: 'Mollweide (homolográfica)', fam: 'Pseudocilíndrica', prop: ['e', 'Equivalente'],
    fwd: (p, l) => { const t = mollTheta(p); return [2 * S2 / PI * l * Math.cos(t), S2 * Math.sin(t)]; },
    inv: (x, y) => { if (Math.abs(y) > S2) return null; const t = Math.asin(y / S2); const l = PI * x / (2 * S2 * Math.cos(t)); if (Math.abs(l) > PI) return null; return [Math.asin((2 * t + Math.sin(2 * t)) / PI), l]; }, b: [-2 * S2, 2 * S2, -S2, S2],
    txt: 'Mundo encerrado en una elipse cuyo Ecuador mide el doble que el meridiano central. Paralelos rectos, meridianos elípticos. Conserva las superficies: adecuada para mapas temáticos mundiales de distribución.' };
  P.sinu = { name: 'Sinusoidal', fam: 'Pseudocilíndrica', prop: ['e', 'Equivalente'],
    fwd: (p, l) => [l * Math.cos(p), p], inv: (x, y) => { if (Math.abs(y) > PI / 2) return null; const c = Math.cos(y); const l = c < 1e-9 ? 0 : x / c; if (Math.abs(l) > PI) return null; return [y, l]; }, b: [-PI, PI, -PI / 2, PI / 2],
    txt: 'Paralelos rectos y equiespaciados, con su longitud real; los meridianos son sinusoides. Equivalente y sin deformación a lo largo del Ecuador y del meridiano central, pero muy distorsionada en los bordes.' };
  // Goode homolosena interrumpida
  const PHT = 40.7366666 * D, YOFF = 0.0528035274542;
  const NL = [[-180, -40, -100], [-40, 180, 30]], SL = [[-180, -100, -160], [-100, -20, -60], [-20, 80, 20], [80, 180, 140]];
  const gF = (p, dl) => { if (Math.abs(p) <= PHT) return [dl * Math.cos(p), p]; const t = mollTheta(p); return [2 * S2 / PI * dl * Math.cos(t), S2 * Math.sin(t) - Math.sign(p) * YOFF]; };
  P.goode = { name: 'Homolosena de Goode (interrumpida)', fam: 'Compleja', prop: ['e', 'Equivalente'], fixed: true,
    fwd: (p, l) => { const L = l / D; const lobes = p >= 0 ? NL : SL; for (const [a, b, c] of lobes) if (L >= a && L <= b) { const q = gF(p, l - c * D); return [q[0] + c * D, q[1]]; } return null; },
    inv: (x, y) => {
      let p; const yt = PHT;
      if (Math.abs(y) <= yt) p = y; else { const yy = y + Math.sign(y) * YOFF; if (Math.abs(yy) > S2) return null; const t = Math.asin(yy / S2); p = Math.asin((2 * t + Math.sin(2 * t)) / PI); }
      const lobes = p >= 0 ? NL : SL;
      for (const [a, b, c] of lobes) {
        const dx = x - c * D; let dl;
        if (Math.abs(p) <= PHT) { const cp = Math.cos(p); dl = cp < 1e-9 ? 0 : dx / cp; }
        else { const t = mollTheta(p); dl = dx * PI / (2 * S2 * Math.cos(t)); }
        const L = (c * D + dl) / D; if (L >= a - 1e-6 && L <= b + 1e-6) return [p, c * D + dl];
      }
      return null;
    }, b: [-PI, PI, -PI / 2, PI / 2],
    txt: 'Combina la sinusoidal (latitudes bajas) y la de Mollweide (altas), unidas a 40° 44′, e interrumpe los océanos para que cada continente quede cerca de un meridiano central propio. Equivalente y con formas continentales bastante fieles: muy usada en atlas para mapas de distribución.' };
  // Lambert cónica conforme
  const f1 = 30 * D, f2 = 60 * D, f0 = 45 * D;
  const n = Math.log(Math.cos(f1) / Math.cos(f2)) / Math.log(Math.tan(PI / 4 + f2 / 2) / Math.tan(PI / 4 + f1 / 2));
  const F = Math.cos(f1) * Math.pow(Math.tan(PI / 4 + f1 / 2), n) / n, r0 = F / Math.pow(Math.tan(PI / 4 + f0 / 2), n);
  P.lcc = { name: 'Cónica conforme de Lambert', fam: 'Cónica', prop: ['c', 'Conforme'], cone: true,
    fwd: (p, l) => { if (p < -20 * D) return null; const r = F / Math.pow(Math.tan(PI / 4 + p / 2), n); return [r * Math.sin(n * l), r0 - r * Math.cos(n * l)]; },
    inv: (x, y) => { const r = Math.hypot(x, r0 - y); const th = Math.atan2(x, r0 - y); const l = th / n; if (Math.abs(l) > PI) return null; const p = 2 * Math.atan(Math.pow(F / r, 1 / n)) - PI / 2; if (p < -20 * D) return null; return [p, l]; },
    b: null, txt: 'Cono secante a la esfera en dos paralelos (aquí 30° N y 60° N), sobre los que no hay deformación. Paralelos en arcos concéntricos y meridianos radiales. Ideal para territorios extensos en longitud y de latitud media: Europa, EE. UU. o la cartografía aeronáutica. Solo se representa hasta 20° S.' };
  // acimutales (aspecto y punto de vista configurables)
  const AZ = { equid: ['Equidistante', ['q', 'Equidistante desde el centro'], (c) => c, (r) => r, PI],
    ortho: ['Ortográfica (punto de vista en el infinito)', ['n', 'Ni conforme ni equivalente'], (c) => Math.sin(c), (r) => r > 1 ? NaN : Math.asin(r), PI / 2],
    stereo: ['Estereográfica (punto de vista en las antípodas)', ['c', 'Conforme'], (c) => 2 * Math.tan(c / 2), (r) => 2 * Math.atan(r / 2), 130 * D],
    gnomo: ['Gnomónica (punto de vista en el centro de la Tierra)', ['n', 'Círculos máximos como rectas'], (c) => Math.tan(c), (r) => Math.atan(r), 65 * D],
    laea: ['Equivalente de Lambert', ['e', 'Equivalente'], (c) => 2 * Math.sin(c / 2), (r) => r > 2 ? NaN : 2 * Math.asin(r / 2), PI] };
  P.azi = { name: 'Acimutal', fam: 'Acimutal', azi: true, prop: null, b: null, txt: '' };
  P.aziMake = (type, lat0) => {
    const [nm, prop, rho, irho, cmax] = AZ[type]; const p0 = lat0 * D, s0 = Math.sin(p0), c0 = Math.cos(p0);
    const rmax = rho(Math.min(cmax, PI - 1e-6));
    return Object.assign({}, P.azi, { name: 'Acimutal ' + nm.charAt(0).toLowerCase() + nm.slice(1), prop, b: [-rmax, rmax, -rmax, rmax],
      fwd: (p, l) => { const cc = s0 * Math.sin(p) + c0 * Math.cos(p) * Math.cos(l); const c = Math.acos(H.clamp(cc, -1, 1)); if (c > cmax) return null; const k = c < 1e-9 ? 1 : rho(c) / Math.sin(c); return [k * Math.cos(p) * Math.sin(l), k * (c0 * Math.sin(p) - s0 * Math.cos(p) * Math.cos(l))]; },
      inv: (x, y) => { const r = Math.hypot(x, y); if (r > rmax) return null; const c = irho(r); if (!isFinite(c) || c > cmax) return null; if (r < 1e-12) return [p0, 0]; const sc = Math.sin(c), cc = Math.cos(c); return [Math.asin(H.clamp(cc * s0 + y * sc * c0 / r, -1, 1)), Math.atan2(x * sc, r * c0 * cc - y * s0 * sc)]; },
      txt: { equid: 'Proyección sobre un plano tangente. Las distancias y direcciones desde el punto central son verdaderas: útil para radiocomunicaciones o rutas aéreas desde un punto (es el emblema de la ONU, en aspecto polar).', ortho: 'Perspectiva desde el infinito: la Tierra tal como se ve desde muy lejos, como una fotografía desde el espacio. Solo muestra un hemisferio y comprime mucho los bordes.', stereo: 'Perspectiva desde el punto diametralmente opuesto al de tangencia. Es conforme: conserva los ángulos y transforma círculos en círculos. Muy usada en mapas polares y en cristalografía.', gnomo: 'Perspectiva desde el centro de la Tierra. Todos los círculos máximos (las rutas más cortas) aparecen como rectas: se usa para trazar ortodromias en navegación. La deformación crece muy deprisa: no puede mostrar ni un hemisferio.', laea: 'Conserva las superficies alrededor de un centro. La Unión Europea la usa (centrada en 52° N, 10° E) para sus estadísticas espaciales (proyección ETRS89-LAEA).' }[type] });
  };
  P.wrap = wrap;
  return P;
})();

H.tab({
  id: 'proyecciones', nav: 'Proyecciones', title: 'Proyecciones cartográficas',
  init(el) {
    el.append(H.intro('Mapa · apartado 3.1', 'Las proyecciones: de la esfera al plano',
      'No es posible aplanar una esfera sin deformarla. Cada proyección elige qué conserva: los ángulos (conformes), las superficies (equivalentes) o ciertas distancias (equidistantes). Las indicatrices de Tissot, círculos iguales sobre la esfera, muestran cómo y cuánto deforma cada una.',
      'Manual: 3.1<br>Figuras 1.11 a 1.16'));
    const PR = H.PROJ;
    const s = { key: 'merc', lon0: 0, aziType: 'equid', aziLat: 90, tissot: true, grid: true, shape: 'Groenlandia', truesize: false, at: null, hover: null };
    const proj = () => { const p = s.key === 'azi' ? PR.aziMake(s.aziType, s.aziLat) : PR[s.key]; return p; };
    const center = () => s.key === 'goode' ? 0 : s.key === 'tm' ? s.tmLon ?? -3 : s.lon0;

    const cv = H.h('canvas'); const tip = H.h('div', { class: 'tooltip' });
    let base = null, baseKey = '', geom = null;
    const bounds = (p) => {
      if (p.b) return p.b;
      let xa = 1e9, xb = -1e9, ya = 1e9, yb = -1e9;
      for (let la = -20; la <= 90; la += 2) for (let lo = -180; lo <= 180; lo += 3) { const q = p.fwd(la * H.D2R, lo * H.D2R); if (!q) continue; xa = Math.min(xa, q[0]); xb = Math.max(xb, q[0]); ya = Math.min(ya, q[1]); yb = Math.max(yb, q[1]); }
      return [xa, xb, ya, yb];
    };
    const cs = H.autoCanvas(cv, (w) => { const p = proj(), b = bounds(p); return H.clamp(w * (b[3] - b[2]) / (b[1] - b[0]) + 16, 260, Math.min(640, w * 1.05)); }, (ctx, w, h) => {
      const p = proj(), b = bounds(p), l0 = center() * H.D2R;
      const sc = Math.min((w - 16) / (b[1] - b[0]), (h - 16) / (b[3] - b[2]));
      const ox = w / 2 - (b[0] + b[1]) / 2 * sc, oy = h / 2 + (b[2] + b[3]) / 2 * sc;
      geom = { p, sc, ox, oy, l0 };
      const key = [s.key, s.aziType, s.aziLat, center(), w, h].join('|');
      if (key !== baseKey) {
        const img = ctx.createImageData(w, h);
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const x = (i + 0.5 - ox) / sc, y = (oy - j - 0.5) / sc; const ll = p.inv(x, y); const k = (j * w + i) * 4;
          if (!ll) { img.data[k + 3] = 0; continue; }
          const c = H.surface(ll[0] * H.R2D, PR.wrap(ll[1] + l0) * H.R2D);
          img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
        }
        base = document.createElement('canvas'); base.width = w; base.height = h; base.getContext('2d').putImageData(img, 0, 0); baseKey = key;
      }
      ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h); ctx.drawImage(base, 0, 0, w, h);
      const F = (la, lo) => { const q = p.fwd(la * H.D2R, PR.wrap(lo * H.D2R - l0)); return q ? [ox + q[0] * sc, oy - q[1] * sc] : null; };
      geom.F = F;
      const line = (pts, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let prev = null; for (const [la, lo] of pts) { const q = F(la, lo); if (!q || (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) > w * 0.12)) { prev = q; if (q) ctx.moveTo(q[0], q[1]); continue; } prev ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); prev = q; } ctx.stroke(); ctx.setLineDash([]); };
      geom.line = line;
      // franja del huso UTM 30
      if (s.key === 'tm') { ctx.fillStyle = 'rgba(180,83,29,.18)'; ctx.beginPath(); const pts = []; for (let la = -80; la <= 84; la += 2) pts.push(F(la, -6)); for (let la = 84; la >= -80; la -= 2) pts.push(F(la, 0)); pts.filter(Boolean).forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.fill(); }
      if (s.grid) {
        const lo0 = center();
        for (let la = -75; la <= 75; la += 15) { const pts = []; for (let lo = -180; lo <= 180; lo += 1) pts.push([la, lo0 + lo]); line(pts, la === 0 ? '#1c2836' : H.COL.grid, la === 0 ? 1.3 : 0.8); }
        for (let lo = -180; lo < 180; lo += 15) { const pts = []; for (let la = -90; la <= 90; la += 1) pts.push([la, lo]); line(pts, lo === 0 ? '#1c2836' : H.COL.grid, lo === 0 ? 1.3 : 0.8); }
      }
      if (s.tissot && !s.truesize) {
        const R = 5 * H.D2R;
        const lats = s.key === 'merc' ? [-60, -30, 0, 30, 60] : [-75, -45, -15, 15, 45, 75];
        for (const la of lats) for (let lo = -165; lo <= 180; lo += 30) {
          const cla = la * H.D2R, clo = (lo + (s.key === 'goode' ? 0 : center())) * H.D2R; const pts = [];
          if (s.key === 'goode') { const cuts = la >= 0 ? [-180, -40, 180] : [-180, -100, -20, 80, 180]; if (cuts.some((c) => Math.abs(PR.wrap((lo - c) * H.D2R)) * H.R2D < 7)) continue; }
          if (s.key === 'azi') { const p0 = s.aziLat * H.D2R; const cc = Math.sin(p0) * Math.sin(cla) + Math.cos(p0) * Math.cos(cla) * Math.cos(clo - center() * H.D2R); if (Math.acos(H.clamp(cc, -1, 1)) * H.R2D > 140) continue; }
          for (let a = 0; a <= 360; a += 10) { const A = a * H.D2R; const la2 = Math.asin(Math.sin(cla) * Math.cos(R) + Math.cos(cla) * Math.sin(R) * Math.cos(A)); const lo2 = clo + Math.atan2(Math.sin(A) * Math.sin(R) * Math.cos(cla), Math.cos(R) - Math.sin(cla) * Math.sin(la2)); const q = F(la2 * H.R2D, lo2 * H.R2D); if (!q) { pts.length = 0; break; } pts.push(q); }
          if (pts.length < 10) continue;
          let bad = false; for (let i = 1; i < pts.length; i++) if (Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) > w * 0.1) bad = true; if (bad) continue;
          ctx.fillStyle = 'rgba(180,58,40,.45)'; ctx.strokeStyle = '#8a2a1c'; ctx.lineWidth = 0.8; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }
      if (s.truesize) drawShape(ctx, w, h);
      if (s.hover) { ctx.strokeStyle = '#1c2836'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(s.hover[0], s.hover[1], 4, 0, 7); ctx.stroke(); }
    });

    /* ---------- tamaño real ---------- */
    const AREAS = { 'Groenlandia': 2166086, 'España': 505990, 'Brasil': 8515767, 'R. D. del Congo': 2344858, 'Australia': 7692024, 'India': 3287263, 'México': 1964375, 'Argentina': 2780400, 'China': 9596961, 'África': 30370000 };
    const vec = (la, lo) => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    const ll = (v) => [Math.asin(H.clamp(v[2], -1, 1)), Math.atan2(v[1], v[0])];
    const centroid = (rings) => { let c = [0, 0, 0]; for (const r of rings) for (let i = 0; i < r.length; i += 2) { const v = vec(r[i + 1] * H.D2R, r[i] * H.D2R); c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; } const n = Math.hypot(...c); return c.map((x) => x / n); };
    const rotTo = (a, b) => { // matriz de rotación que lleva a sobre b (Rodrigues)
      const k = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; const s_ = Math.hypot(...k), c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      if (s_ < 1e-12) return (v) => v; const u = k.map((x) => x / s_);
      return (v) => { const d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; return [0, 1, 2].map((i) => v[i] * c + cr[i] * s_ + u[i] * d * (1 - c)); };
    };
    const shapeArea = (polys) => { let A = 0; for (const p of polys) { if (p.length < 3) continue; let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } A += Math.abs(a) / 2; } return A; };
    const projRings = (rings, rot) => {
      const out = []; for (const r of rings) { const pts = []; let ok = true; let prev = null; for (let i = 0; i < r.length; i += 2) { let v = vec(r[i + 1] * H.D2R, r[i] * H.D2R); if (rot) v = rot(v); const [la, lo] = ll(v); const q = geom.F(la * H.R2D, lo * H.R2D); if (!q) { ok = false; break; } if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) > cs.w * 0.25) { ok = false; break; } pts.push(q); prev = q; } if (ok) out.push(pts); else out.push(null); } return out;
    };
    const tsInfo = H.h('div', { class: 'readouts' }); const tsArea = H.ro('Superficie real'), tsApp = H.ro('Aparenta en esta posición', 'hl'), tsLat = H.ro('Centro situado en'); tsInfo.append(tsArea, tsLat, tsApp);
    const drawShape = (ctx) => {
      const rings = SHAPES[s.shape]; const c = centroid(rings); const c0 = ll(c);
      if (!s.at) s.at = [c0[0] * H.R2D, c0[1] * H.R2D];
      const rot = rotTo(c, vec(s.at[0] * H.D2R, s.at[1] * H.D2R));
      const orig = projRings(rings, null), moved = projRings(rings, rot);
      const fill = (polys, col, st, lw) => { ctx.fillStyle = col; ctx.strokeStyle = st; ctx.lineWidth = lw; for (const p of polys) { if (!p) continue; ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); ctx.stroke(); } };
      fill(orig, 'rgba(28,40,54,.12)', 'rgba(28,40,54,.55)', 1);
      fill(moved, 'rgba(180,83,29,.55)', '#7a3510', 1.5);
      // tamaño aparente respecto a la misma forma centrada en el Ecuador y el meridiano central
      const ref = projRings(rings, rotTo(c, vec(0, center() * H.D2R)));
      const aM = shapeArea(moved.filter(Boolean)), aR = shapeArea(ref.filter(Boolean));
      tsArea.v.innerHTML = `${H.f(AREAS[s.shape])} <small>km²</small>`;
      tsLat.v.innerHTML = `${H.dm(Math.abs(s.at[0]))} ${s.at[0] >= 0 ? 'N' : 'S'}`;
      tsApp.v.innerHTML = moved.some((x) => !x) || ref.some((x) => !x) || !aR ? '<small>fuera del mapa</small>' : `×${H.f(aM / aR, 2)} <small>de su tamaño en el Ecuador</small>`;
    };

    /* ---------- interacción ---------- */
    const roH = { ll: H.ro('Posición'), h: H.ro('Escala en el meridiano (h)'), k: H.ro('Escala en el paralelo (k)'), s: H.ro('Escala de superficies', 'hl'), w: H.ro('Deformación angular máx.', 'bl') };
    const analyze = (la, lo) => {
      const p = geom.p, l0 = geom.l0, d = 1e-4; const L = PR.wrap(lo - l0);
      const a = p.fwd(la, L), bN = p.fwd(la + d, L), bE = p.fwd(la, L + d);
      if (!a || !bN || !bE || Math.abs(Math.cos(la)) < 1e-6) return null;
      const mx = [(bN[0] - a[0]) / d, (bN[1] - a[1]) / d], px = [(bE[0] - a[0]) / (d * Math.cos(la)), (bE[1] - a[1]) / (d * Math.cos(la))];
      const h = Math.hypot(...mx), k = Math.hypot(...px); const sA = Math.abs(mx[0] * px[1] - mx[1] * px[0]);
      const A = Math.sqrt(Math.max(0, h * h + k * k + 2 * sA)), B = Math.sqrt(Math.max(0, h * h + k * k - 2 * sA));
      const am = (A + B) / 2, bm = (A - B) / 2; const w = 2 * Math.asin(H.clamp((am - bm) / (am + bm), 0, 1)) * H.R2D;
      return { h, k, s: sA, w };
    };
    let dragging = false;
    H.drag(cv, {
      down: (e) => { if (!s.truesize) return; dragging = true; setAt(e); },
      move: (e) => { if (dragging) setAt(e); }, up: () => { dragging = false; },
    });
    const setAt = (e) => { const [x, y] = cs.pos(e); const q = geom.p.inv((x - geom.ox) / geom.sc, (geom.oy - y) / geom.sc); if (!q) return; s.at = [q[0] * H.R2D, PR.wrap(q[1] + geom.l0) * H.R2D]; cs.redraw(); };
    cv.addEventListener('mousemove', (e) => {
      if (!geom) return; const [x, y] = cs.pos(e); const q = geom.p.inv((x - geom.ox) / geom.sc, (geom.oy - y) / geom.sc);
      if (!q) { tip.style.display = 'none'; return; }
      const la = q[0], lo = PR.wrap(q[1] + geom.l0); const r = analyze(la, lo);
      roH.ll.v.innerHTML = `${H.dm(Math.abs(la * H.R2D))} ${la >= 0 ? 'N' : 'S'}, ${H.dm(Math.abs(lo * H.R2D))} ${lo >= 0 ? 'E' : 'O'}`;
      if (r) { roH.h.v.textContent = H.f(r.h, 2); roH.k.v.textContent = H.f(r.k, 2); roH.s.v.textContent = '×' + H.f(r.s, 2); roH.w.v.textContent = H.f(r.w, 1) + '°'; }
      tip.style.display = 'block'; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = r ? `superficie ×${H.f(r.s, 2)} · ángulos ${H.f(r.w, 1)}°` : '';
    });
    cv.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

    /* ---------- controles ---------- */
    const desc = H.h('div');
    const groups = [['Cilíndricas', [['equi', 'Equirectangular'], ['merc', 'Mercator'], ['peters', 'Gall-Peters'], ['tm', 'Transversa (UTM)']]], ['Cónicas', [['lcc', 'Lambert conforme']]], ['Acimutales', [['azi', 'Plano tangente']]], ['Pseudocilíndricas y complejas', [['moll', 'Mollweide'], ['sinu', 'Sinusoidal'], ['goode', 'Homolosena']]]];
    const selBox = H.h('div');
    const btns = [];
    groups.forEach(([g, items]) => { const row = H.h('div', { class: 'seg', style: { marginBottom: '6px' } }); items.forEach(([k, l]) => { const b = H.h('button', { type: 'button', 'aria-pressed': k === s.key }, l); b.onclick = () => { s.key = k; btns.forEach(([kk, bb]) => bb.setAttribute('aria-pressed', kk === k)); s.at = null; refresh(); }; btns.push([k, b]); row.append(b); }); selBox.append(H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)', marginTop: '6px' } }, g), row); });
    const aziBox = H.h('div', { style: { marginTop: '8px' } },
      H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)' } }, 'Tipo de proyección acimutal'),
      H.seg([['equid', 'Equidistante'], ['gnomo', 'Gnomónica'], ['stereo', 'Estereográfica'], ['ortho', 'Ortográfica'], ['laea', 'Equivalente']], s.aziType, (v) => { s.aziType = v; refresh(); }),
      H.h('div', { class: 'small', style: { fontWeight: 700, color: 'var(--ink)', marginTop: '6px' } }, 'Aspecto (posición del plano tangente)'),
      H.seg([[90, 'Polar'], [0, 'Ecuatorial'], [40, 'Oblicuo (40° N)']], s.aziLat, (v) => { s.aziLat = v; refresh(); }));
    const lonS = H.slider('Meridiano central', -180, 180, 5, 0, (v) => v === 0 ? '0° (Greenwich)' : Math.abs(v) + '° ' + (v > 0 ? 'E' : 'O'), (v) => { if (s.key === 'tm') s.tmLon = v; else s.lon0 = v; s.at = null; cs.redraw(); });
    const chk = (k, lbl) => { const c = H.h('input', { type: 'checkbox', checked: s[k] }); c.onchange = () => { s[k] = c.checked; cs.redraw(); }; return H.h('label', { class: 'chk' }, c, lbl); };
    const tsChk = H.h('input', { type: 'checkbox' }); tsChk.onchange = () => { s.truesize = tsChk.checked; tsBox.style.display = s.truesize ? '' : 'none'; cs.redraw(); };
    const shapeSel = H.h('select', {}, ...Object.keys(SHAPES).map((k) => H.h('option', { value: k, selected: k === s.shape }, k)));
    shapeSel.onchange = () => { s.shape = shapeSel.value; s.at = null; cs.redraw(); };
    const tsBox = H.h('div', { style: { display: 'none', marginTop: '8px' } }, H.h('div', { class: 'row' }, shapeSel), H.h('p', { class: 'small' }, 'Arrastra sobre el mapa para mover la forma. En gris, su posición real; en naranja, la forma desplazada, con su superficie real, tal como la dibuja la proyección.'), tsInfo);
    const refresh = () => {
      const p = proj();
      aziBox.style.display = s.key === 'azi' ? '' : 'none';
      lonS.style.display = s.key === 'goode' || s.key === 'azi' ? 'none' : '';
      if (s.key === 'tm') lonS.set(s.tmLon ?? -3); else lonS.set(s.lon0);
      const bc = { c: 'c', e: 'e', q: 'q', n: 'n' }[p.prop[0]];
      desc.innerHTML = `<h3 style="margin:0 0 4px">${p.name}</h3><p style="margin:0 0 6px"><span class="badge">${p.fam}</span><span class="badge ${bc}">${p.prop[1]}</span></p><p class="small" style="color:var(--ink)">${p.txt}</p>`;
      baseKey = ''; cs.st && 0; // forzar
      // la altura del lienzo depende de la proyección
      cs.w = 0; cs.redraw();
    };

    el.append(H.h('div', { class: 'card' },
      H.h('div', { class: 'grid2' },
        H.h('div', {}, H.h('div', { class: 'viz', style: { position: 'relative' } }, cv, tip), H.h('p', { class: 'hint' }, 'Pasa el ratón por el mapa para medir la deformación en cada punto. Cada círculo rojo cubre la misma superficie en la esfera (5° de radio).'),
          H.h('div', { class: 'readouts', style: { marginTop: '8px' } }, roH.ll, roH.h, roH.k, roH.s, roH.w)),
        H.h('div', {}, selBox, aziBox, H.h('div', { style: { height: '10px' } }), lonS, H.h('div', {}, chk('grid', 'Red de meridianos y paralelos'), chk('tissot', 'Indicatrices de Tissot')),
          H.h('label', { class: 'chk', style: { marginTop: '6px' } }, tsChk, H.h('b', {}, 'Comparar tamaños reales')), tsBox,
          H.h('div', { class: 'card', style: { marginTop: '12px', background: 'var(--soft)' } }, desc)))));
    refresh();

    el.append(H.h('div', { class: 'card' }, H.h('h3', {}, 'Cómo leer las indicatrices'),
      H.h('div', { class: 'grid3' },
        H.html('<div><span class="badge c">Conforme</span><p class="small" style="color:var(--ink)">Las indicatrices siguen siendo <b>círculos</b> (deformación angular 0°), pero cambian de tamaño: la superficie no se conserva. Ej.: Mercator, Lambert conforme, estereográfica, UTM.</p></div>'),
        H.html('<div><span class="badge e">Equivalente</span><p class="small" style="color:var(--ink)">Todas las indicatrices tienen la <b>misma superficie</b> (escala de superficies ×1,00), aunque se aplastan en elipses: las formas se deforman. Ej.: Gall-Peters, Mollweide, sinusoidal, homolosena.</p></div>'),
        H.html('<div><span class="badge q">Equidistante</span><p class="small" style="color:var(--ink)">Conservan la escala a lo largo de ciertas líneas (meridianos, o radios desde el centro). Ninguna proyección es a la vez conforme y equivalente.</p></div>'))));

    el.append(H.fix('apartado 3.1', [
      'En las proyecciones cilíndricas los paralelos solo «se van espaciando» en las conformes como Mercator; en las <b>equivalentes</b> (Lambert, Gall-Peters) <b>se aproximan</b> hacia los polos. Compruébalo cambiando de una a otra.',
      'La UTM usa un cilindro <b>transverso secante</b> (factor de escala 0,9996 en el meridiano central) dividido en 60 husos de 6°, y <b>sigue siendo</b> la proyección del Mapa Topográfico Nacional, hoy sobre el sistema geodésico ETRS89.',
      'La proyección «de Peters» es la cilíndrica equivalente que <b>James Gall publicó en 1855</b>; por eso se llama Gall-Peters. Conserva las superficies, pero deforma mucho las formas.',
      'Matiz: las proyecciones conformes son las adecuadas para navegación y cartografía topográfica de detalle (UTM), donde importan los ángulos y las formas locales. Para mapas mundiales de distribución se prefieren las equivalentes.',
    ]));
    el.append(H.selfCheck([
      { q: '¿Qué propiedad conserva la proyección de Mercator?', opts: ['Las superficies', 'Los ángulos', 'Las distancias desde el centro', 'Ninguna'], a: 1, ex: 'Es conforme: las indicatrices son círculos, pero su tamaño crece con la latitud. Por eso Groenlandia parece tan grande como África, que es 14 veces mayor.' },
      { q: 'Para un mapa mundial de la superficie cultivada por países conviene una proyección…', opts: ['Conforme', 'Equivalente', 'Gnomónica', 'Cualquiera'], a: 1, ex: 'Si se compara la extensión de un fenómeno, las superficies deben ser proporcionales a las reales: proyección equivalente.' },
      { q: 'En una proyección cónica simple, los paralelos son…', opts: ['Rectas paralelas', 'Arcos de círculo concéntricos', 'Sinusoides', 'Elipses'], a: 1, ex: 'Al desarrollar el cono, los paralelos quedan como arcos concéntricos y los meridianos como rectas radiales que convergen hacia el polo.' },
      { q: '¿En qué proyección acimutal las rutas más cortas entre dos puntos (círculos máximos) son líneas rectas?', opts: ['Estereográfica', 'Ortográfica', 'Gnomónica', 'Equivalente de Lambert'], a: 2, ex: 'En la gnomónica, con el punto de vista en el centro de la Tierra, todo plano que pasa por el centro corta el plano tangente en una recta.' },
      { q: '¿Qué ocurre con la deformación en la transversa de Mercator a medida que nos alejamos del meridiano central?', opts: ['Disminuye', 'No cambia', 'Aumenta rápidamente', 'Desaparece en el Ecuador'], a: 2, ex: 'Por eso la UTM limita cada huso a 6° de longitud: la deformación se mantiene muy pequeña dentro de cada uno.' },
    ]));
  },
});
