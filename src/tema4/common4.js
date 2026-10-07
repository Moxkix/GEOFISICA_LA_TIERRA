/* ============================================================
   Tema 4 · utilidades: descompresión de los datos, rejillas con
   huecos (tierra), mapas del océano, escalas de color, ecuación de
   estado del agua del mar (UNESCO, EOS-80), predicción de mareas y
   fórmulas del oleaje.
   Reutiliza T2 (common2.js) y T3 (common3.js).
   ============================================================ */
const T4 = (() => {
  const T = {};
  const D2R = H.D2R;

  /* ---------- datos comprimidos (ver data/tema4/gt4.py) ---------- */
  const inflate = async (b64) => {
    const bin = atob(b64), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const st = new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(st).arrayBuffer());
  };
  T.unz = async (e) => {
    const b = await inflate(e.z), n = e.n || 1;
    const i16 = e.f === 'i16', N = i16 ? b.length >> 1 : b.length, L = N / n, mod = i16 ? 65536 : 256;
    const d = i16 ? new Uint16Array(b.buffer, b.byteOffset, N) : b;
    const q = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      const prev = e.p && i >= L ? q[i - L] : i ? q[i - 1] : 0;
      q[i] = (prev + d[i]) % mod;
    }
    const v = new Float32Array(N);
    if (i16) for (let i = 0; i < N; i++) { let x = q[i]; if (x > 32767) x -= 65536; v[i] = x === -32768 ? NaN : e.o + e.s * x; }
    else if (e.f === 'lut') for (let i = 0; i < N; i++) v[i] = q[i] === 255 ? NaN : e.t[q[i]];
    else if (e.f === 'sq') for (let i = 0; i < N; i++) v[i] = q[i] === 255 ? NaN : e.s * q[i] * q[i];
    else for (let i = 0; i < N; i++) v[i] = q[i] === 255 ? NaN : e.o + e.s * q[i];
    if (n === 1) return v;
    return Array.from({ length: n }, (_, k) => v.subarray(k * L, (k + 1) * L));
  };
  const walk = async (o) => {
    if (!o || typeof o !== 'object' || ArrayBuffer.isView(o)) return o;
    if (typeof o.z === 'string') return T.unz(o);
    for (const k of Object.keys(o)) o[k] = await walk(o[k]);
    return o;
  };
  /* el hub arranca cuando están descomprimidos todos los datos */
  T.DATA = () => ({ MAREAS: typeof MAREAS !== 'undefined' ? MAREAS : null, OCEANO: typeof OCEANO !== 'undefined' ? OCEANO : null,
    PERFILES: typeof PERFILES !== 'undefined' ? PERFILES : null, RELIEVE: typeof RELIEVE !== 'undefined' ? RELIEVE : null,
    CICLONES: typeof CICLONES !== 'undefined' ? CICLONES : null, CIARAN: typeof CIARAN !== 'undefined' ? CIARAN : null,
    NIVEL: typeof NIVEL !== 'undefined' ? NIVEL : null, VIENTOS: typeof VIENTOS !== 'undefined' ? VIENTOS : null });
  const start0 = H.start;
  H.start = () => {
    if (typeof DecompressionStream === 'undefined') {
      document.querySelector('main').innerHTML = '<div class="card"><h3>Navegador demasiado antiguo</h3><p>Este material necesita un navegador actualizado (Chrome, Edge o Firefox de 2023 en adelante, Safari 16.4 o posterior) para descomprimir sus datos.</p></div>';
      return;
    }
    const D = T.DATA();
    Promise.all(Object.values(D).map(walk)).then(start0).catch((err) => {
      console.error(err);
      document.querySelector('main').innerHTML = `<div class="card"><h3>No se han podido cargar los datos</h3><p class="small">${err}</p></div>`;
    });
  };

  /* ---------- rejillas con huecos (NaN en tierra) ---------- */
  /* m = {nx, ny, lon0, lat0, res}; celdas centradas; lon0/lat0 = esquina superior izquierda */
  T.grid = (data, m) => {
    const { nx, ny, lon0, lat0, res } = m, wrap = Math.abs(nx * res - 360) < 1e-6;
    const g = { data, nx, ny, lon0, lat0, res, wrap };
    g.lonAt = (i) => lon0 + (i + 0.5) * res; g.latAt = (j) => lat0 - (j + 0.5) * res;
    g.get = (i, j) => data[j * nx + i];
    const ix = (i) => (wrap ? ((i % nx) + nx) % nx : i);
    /* interpolación bilineal que ignora las esquinas sin dato */
    g.at = (lat, lon) => {
      let fx = (lon - lon0) / res - 0.5, fy = (lat0 - lat) / res - 0.5;
      if (fy < -0.5 || fy > ny - 0.5 || (!wrap && (fx < -0.5 || fx > nx - 0.5))) return NaN;
      fy = H.clamp(fy, 0, ny - 1); if (!wrap) fx = H.clamp(fx, 0, nx - 1);
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const xa = ix(x0), xb = ix(Math.min(x0 + 1, wrap ? x0 + 1 : nx - 1)), y1 = Math.min(ny - 1, y0 + 1);
      const c = [[data[y0 * nx + xa], (1 - tx) * (1 - ty)], [data[y0 * nx + xb], tx * (1 - ty)], [data[y1 * nx + xa], (1 - tx) * ty], [data[y1 * nx + xb], tx * ty]];
      let s = 0, w = 0; for (const [v, k] of c) if (v === v && k > 0) { s += v * k; w += k; }
      return w > 1e-6 ? s / w : NaN;
    };
    /* valor en el punto o, si cae en tierra, el de la celda de mar más próxima (hasta r celdas) */
    g.nearPt = (lat, lon, r = 3) => {
      const v = g.at(lat, lon); if (v === v) return { v, lat, lon, d: 0 };
      const i0 = Math.floor((lon - lon0) / res), j0 = Math.floor((lat0 - lat) / res);
      for (let k = 1; k <= r; k++) {
        let best = null, bd = 1e9;
        for (let j = j0 - k; j <= j0 + k; j++) for (let i = i0 - k; i <= i0 + k; i++) {
          if (j < 0 || j >= ny || (!wrap && (i < 0 || i >= nx))) continue;
          const x = data[j * nx + ix(i)]; if (x !== x) continue;
          const la = g.latAt(j), lo = g.lonAt(i), d = H.haversine(lat, lon, la, lo); if (d < bd) { bd = d; best = { v: x, lat: la, lon: lo, d }; }
        }
        if (best) return best;
      }
      return { v: NaN, lat, lon, d: NaN };
    };
    g.near = (lat, lon, r = 3) => g.nearPt(lat, lon, r).v;
    return g;
  };
  /* media zonal (por filas) de una rejilla */
  T.zonal = (g) => Array.from({ length: g.ny }, (_, j) => { let s = 0, n = 0; for (let i = 0; i < g.nx; i++) { const v = g.data[j * g.nx + i]; if (v === v) { s += v; n++; } } return { lat: g.latAt(j), v: n ? s / n : NaN, n }; });
  /* media de una rejilla ponderada por el área (cos φ) */
  T.areaMean = (g) => { let s = 0, w = 0; for (let j = 0; j < g.ny; j++) { const c = Math.cos(g.latAt(j) * D2R); for (let i = 0; i < g.nx; i++) { const v = g.data[j * g.nx + i]; if (v === v) { s += v * c; w += c; } } } return s / w; };
  T.meanLayers = (arr) => { const n = arr.length, L = arr[0].length, o = new Float32Array(L); for (let i = 0; i < L; i++) { let s = 0; for (let k = 0; k < n; k++) s += arr[k][i]; o[i] = s / n; } return o; };

  /* ---------- escalas de color ---------- */
  const ramp = (stops) => (v) => {
    if (!(v === v)) return null;
    if (v <= stops[0][0]) return stops[0][1]; if (v >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const u = (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); return H.mix(stops[i - 1][1], stops[i][1], u); }
  };
  T.ramp = ramp;
  T.sstColor = ramp([[-2, [38, 32, 100]], [2, [52, 74, 160]], [8, [70, 140, 200]], [14, [120, 196, 210]], [18, [190, 226, 190]], [22, [246, 230, 150]], [26, [244, 168, 90]], [29, [214, 82, 54]], [32, [140, 24, 40]]]);
  T.sssColor = ramp([[30, [70, 40, 120]], [32, [48, 92, 170]], [33.5, [80, 160, 200]], [34.5, [170, 218, 210]], [35.2, [246, 240, 200]], [36, [244, 196, 120]], [37, [222, 120, 70]], [38.5, [168, 50, 50]], [40, [100, 20, 40]]]);
  T.divColor = (lim) => ramp([[-lim, [40, 70, 150]], [-lim / 2, [120, 168, 210]], [-lim / 10, [238, 242, 244]], [lim / 10, [244, 240, 236]], [lim / 2, [234, 150, 110]], [lim, [170, 40, 40]]]);
  T.chlColor = ramp([[-1.7, [40, 22, 90]], [-1.2, [38, 70, 160]], [-0.7, [40, 140, 190]], [-0.3, [60, 170, 140]], [0, [120, 196, 90]], [0.5, [214, 214, 70]], [1, [190, 120, 40]], [1.6, [130, 60, 30]]]);
  T.depthColor = ramp([[-6000, [20, 40, 90]], [-4000, [36, 72, 130]], [-2000, [70, 120, 175]], [-500, [120, 170, 205]], [-130, [170, 208, 228]], [0, [205, 230, 240]]]);
  T.elevColor = ramp([[0, [168, 198, 140]], [50, [196, 214, 150]], [200, [226, 220, 160]], [600, [214, 186, 132]], [1500, [184, 150, 112]], [3000, [160, 140, 130]], [5000, [236, 236, 236]]]);
  T.css = (c) => (c ? `rgb(${c.map(Math.round).join(',')})` : 'transparent');
  T.LAND = [226, 214, 184]; T.SEA = [214, 228, 236];

  /* ---------- mapas ---------- */
  /* opts: bbox [O, E, S, N]; aspect (función de w o número); color(lat, lon) → [r,g,b] o null (sin dato, se pinta mar)
     land: color de la tierra (o función); after(ctx, P, w, h); key(): cadena que identifica el ráster (caché) */
  T.map = (canvas, opts) => {
    const o = Object.assign({ bbox: [-180, 180, -78, 82], regional: false, coast: true, grid: 30, land: T.LAND }, opts);
    let cacheKey = null, raster = null;
    const asp = o.aspect || ((w) => w * T3.aspect(o.bbox, o.regional));
    const st = H.autoCanvas(canvas, typeof asp === 'number' ? asp : asp, (ctx, w, h) => {
      const P = T3.proj(o.bbox, w, h); st.P = P;
      const key = (o.key ? o.key() : '') + '|' + w + 'x' + h + '|' + o.bbox.join(',');
      if (key !== cacheKey || !raster) {
        const landC = typeof o.land === 'function' ? o.land : () => o.land;
        raster = T3.landRaster(P, w, h, (lat, lon) => {
          const lf = H.land(lat, lon);
          if (lf > 0.5) return landC(lat, lon);
          const c = o.color ? o.color(lat, lon) : null;
          return c || T.SEA;
        });
        cacheKey = key;
      }
      ctx.imageSmoothingEnabled = true; ctx.drawImage(raster, 0, 0, w, h);
      if (o.grid) T3.graticule(ctx, P, o.grid, { labels: o.gridLabels !== false });
      if (o.coast) T3.drawCoast(ctx, P, { regional: o.regional, color: 'rgba(28,40,54,.55)', width: 0.7 });
      if (o.after) o.after(ctx, P, w, h);
    });
    st.opts = o;
    st.invalidate = () => { cacheKey = null; st.redraw(); };
    st.setBBox = (b) => { o.bbox = b; cacheKey = null; st.refit(); };
    return st;
  };
  /* tooltip que sigue al puntero sobre un mapa: fn(lat, lon) → html o null */
  T.hover = (canvas, st, fn) => {
    const tip = H.h('div', { class: 'tooltip' });
    const add = () => { if (!canvas.parentElement) return setTimeout(add, 30); canvas.parentElement.append(tip); };
    add();
    const mv = (e) => {
      if (!st.P) return; const [x, y] = st.pos(e); const [lat, lon] = st.P.inv(x, y); const t = fn(lat, lon, x, y);
      if (!t) { tip.style.display = 'none'; return; }
      tip.innerHTML = t; tip.style.display = 'block'; tip.style.left = (x / st.w * 100) + '%'; tip.style.top = (y / st.h * 100) + '%';
      const r = canvas.getBoundingClientRect(); tip.style.transform = `translate(${x / st.w > 0.75 ? '-100%' : x / st.w < 0.25 ? '0' : '-50%'}, -120%)`;
      void r;
    };
    canvas.addEventListener('mousemove', mv); canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    canvas.addEventListener('touchstart', mv, { passive: true });
    return tip;
  };
  /* recuadros habituales */
  T.BB = { mundo: [-180, 180, -78, 82], atl: [-100, 25, -60, 70], iberia: [-11, 5, 35, 44.5], canarias: [-18.5, -13, 27.4, 29.6], ind: [30, 120, -40, 30], pac: [110, 290, -45, 45] };
  T.lonName = (lon) => { const l = ((lon + 540) % 360) - 180; return H.f(Math.abs(l), 0) + '° ' + (l < 0 ? 'O' : 'E'); };
  T.latName = (lat) => H.f(Math.abs(lat), 0) + '° ' + (lat < 0 ? 'S' : 'N');
  T.ll = (lat, lon, d = 1) => `${H.f(Math.abs(lat), d)}° ${lat < 0 ? 'S' : 'N'}, ${H.f(Math.abs(((lon + 540) % 360) - 180), d)}° ${(((lon + 540) % 360) - 180) < 0 ? 'O' : 'E'}`;
  T.fT = (v, d = 1) => (v === v && v != null ? H.f(v, d).replace('-', '−') + ' °C' : '—');
  T.fN = (v, d = 1) => (v === v && v != null ? H.f(v, d).replace('-', '−') : '—');

  /* ---------- ecuación de estado del agua del mar (UNESCO 1981, EOS-80) ----------
     S: salinidad práctica; t: temperatura (°C); p: presión del agua en decibares (≈ profundidad en m) */
  T.rho0 = (S, t) => {
    const rw = 999.842594 + t * (6.793952e-2 + t * (-9.095290e-3 + t * (1.001685e-4 + t * (-1.120083e-6 + t * 6.536332e-9))));
    return rw + S * (0.824493 + t * (-4.0899e-3 + t * (7.6438e-5 + t * (-8.2467e-7 + t * 5.3875e-9))))
      + Math.pow(S, 1.5) * (-5.72466e-3 + t * (1.0227e-4 - t * 1.6546e-6)) + 4.8314e-4 * S * S;
  };
  T.K = (S, t, pb) => { // módulo de compresibilidad secante (bar)
    const Kw = 19652.21 + t * (148.4206 + t * (-2.327105 + t * (1.360477e-2 - t * 5.155288e-5)));
    const Aw = 3.239908 + t * (1.43713e-3 + t * (1.16092e-4 - t * 5.77905e-7));
    const Bw = 8.50935e-5 + t * (-6.12293e-6 + t * 5.2787e-8);
    const s15 = Math.pow(S, 1.5);
    const K0 = Kw + S * (54.6746 + t * (-0.603459 + t * (1.09987e-2 - t * 6.1670e-5))) + s15 * (7.944e-2 + t * (1.6483e-2 - t * 5.3009e-4));
    const A = Aw + S * (2.2838e-3 + t * (-1.0981e-5 - t * 1.6078e-6)) + 1.91075e-4 * s15;
    const B = Bw + S * (-9.9348e-7 + t * (2.0816e-8 + t * 9.1697e-10));
    return K0 + A * pb + B * pb * pb;
  };
  T.rho = (S, t, p = 0) => { const pb = p / 10; return pb ? T.rho0(S, t) / (1 - pb / T.K(S, t, pb)) : T.rho0(S, t); };
  T.sigma = (S, t, p = 0) => T.rho(S, t, p) - 1000;
  /* punto de congelación (°C) */
  T.tFreeze = (S, p = 0) => -0.0575 * S + 1.710523e-3 * Math.pow(S, 1.5) - 2.154996e-4 * S * S - 7.53e-4 * p;
  /* temperatura de máxima densidad (°C) a presión atmosférica, por búsqueda numérica */
  T.tMaxDens = (S) => { let a = -6, b = 6; for (let i = 0; i < 60; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (T.rho0(S, m1) < T.rho0(S, m2)) a = m1; else b = m2; } return (a + b) / 2; };
  /* gradiente adiabático (°C/dbar; Bryden 1973) y temperatura potencial respecto a la superficie (Fofonoff, RK4) */
  const atg = (S, t, p) => { const ds = S - 35;
    return (((-2.1687e-16 * t + 1.8676e-14) * t - 4.6206e-13) * p + ((2.7759e-12 * t - 1.1351e-10) * ds + ((-5.4481e-14 * t + 8.733e-12) * t - 6.7795e-10) * t + 1.8741e-8)) * p
      + (-4.2393e-8 * t + 1.8932e-6) * ds + ((6.6228e-10 * t - 6.836e-8) * t + 8.5258e-6) * t + 3.5803e-5; };
  T.theta = (S, t, p, pr = 0) => {
    let h = pr - p, xk = h * atg(S, t, p), th = t + 0.5 * xk, q = xk;
    let pp = p + 0.5 * h; xk = h * atg(S, th, pp); th += 0.29289322 * (xk - q); q = 0.58578644 * xk + 0.121320344 * q;
    xk = h * atg(S, th, pp); th += 1.707106781 * (xk - q); q = 3.414213562 * xk - 4.121320344 * q;
    pp = p + h; xk = h * atg(S, th, pp); return th + (xk - 2 * q) / 6;
  };
  /* presión (dbar) a una profundidad (m) y latitud (Saunders, 1981) */
  T.pres = (z, lat = 45) => { const s2 = Math.sin(lat * D2R) ** 2, c1 = 5.92e-3 + s2 * 5.25e-3; return ((1 - c1) - Math.sqrt((1 - c1) ** 2 - 8.84e-6 * z)) / 4.42e-6; };

  /* ---------- mareas: predicción armónica (Doodson; correcciones nodales de Pugh, 1987) ---------- */
  const CONST = {
    M2: [[2, 0, 0, 0, 0, 0], 0, 'M2'], S2: [[2, 2, -2, 0, 0, 0], 0, '1'], N2: [[2, -1, 0, 1, 0, 0], 0, 'M2'], K2: [[2, 2, 0, 0, 0, 0], 0, 'K2'],
    '2N2': [[2, -2, 0, 2, 0, 0], 0, 'M2'], MU2: [[2, -2, 2, 0, 0, 0], 0, 'M2'], NU2: [[2, -1, 2, -1, 0, 0], 0, 'M2'], L2: [[2, 1, 0, -1, 0, 0], 180, 'M2'],
    T2: [[2, 2, -3, 0, 0, 1], 0, '1'], K1: [[1, 1, 0, 0, 0, 0], -90, 'K1'], O1: [[1, -1, 0, 0, 0, 0], 90, 'O1'], P1: [[1, 1, -2, 0, 0, 0], 90, '1'],
    Q1: [[1, -2, 0, 1, 0, 0], 90, 'O1'], M4: [[4, 0, 0, 0, 0, 0], 0, 'M4'], MS4: [[4, 2, -2, 0, 0, 0], 0, 'M2'], MN4: [[4, -1, 0, 1, 0, 0], 0, 'M4'],
    M6: [[6, 0, 0, 0, 0, 0], 0, 'M6'], MK3: [[3, 1, 0, 0, 0, 0], -90, 'MK3'], SA: [[0, 0, 1, 0, 0, 0], 0, '1'], SSA: [[0, 0, 2, 0, 0, 0], 0, '1'],
    MM: [[0, 1, 0, -1, 0, 0], 0, 'MM'], MF: [[0, 2, 0, 0, 0, 0], 0, 'MF'], J1: [[1, 2, 0, -1, 0, 0], -90, 'J1'], OO1: [[1, 3, 0, 0, 0, 0], -90, 'OO1'],
    '2Q1': [[1, -3, 0, 2, 0, 0], 90, 'O1'], RHO1: [[1, -2, 2, -1, 0, 0], 90, 'O1'], S1: [[1, 1, -1, 0, 0, 0], 0, '1'], LAM2: [[2, 1, -2, 1, 0, 0], 180, 'M2'],
    '2SM2': [[2, 4, -4, 0, 0, 0], 0, 'M2i'], M3: [[3, 0, 0, 0, 0, 0], 0, 'M3'], S4: [[4, 4, -4, 0, 0, 0], 0, '1'], MSF: [[0, 2, -2, 0, 0, 0], 0, 'M2'],
  };
  T.TIDE_CONST = CONST;
  T.astro = (ms) => {
    const t = (ms / 864e5 + 2440587.5 - 2451545.0) / 36525, ut = ((ms / 3600e3) % 24 + 24) % 24;
    const s = 218.3164 + 481267.8812 * t, h = 280.4661 + 36000.7698 * t, p = 83.3535 + 4069.0137 * t, N = 125.0445 - 1934.1363 * t, p1 = 282.9384 + 1.7195 * t;
    return { tau: 15 * ut + 180 + h - s, s, h, p, Np: -N, p1, N };
  };
  const nodal = (kind, N) => {
    const c = (k) => Math.cos(k * N * D2R), sn = (k) => Math.sin(k * N * D2R);
    const fM2 = 1.0004 - 0.0373 * c(1) + 0.0002 * c(2), uM2 = -2.14 * sn(1);
    const fK1 = 1.0060 + 0.1150 * c(1) - 0.0088 * c(2) + 0.0006 * c(3), uK1 = -8.86 * sn(1) + 0.68 * sn(2) - 0.07 * sn(3);
    switch (kind) {
      case 'M2': return [fM2, uM2]; case 'M2i': return [fM2, -uM2]; case 'M4': return [fM2 * fM2, 2 * uM2]; case 'M6': return [fM2 ** 3, 3 * uM2];
      case 'M3': return [Math.pow(fM2, 1.5), 1.5 * uM2]; case 'K1': return [fK1, uK1];
      case 'O1': return [1.0089 + 0.1871 * c(1) - 0.0147 * c(2) + 0.0014 * c(3), 10.80 * sn(1) - 1.34 * sn(2) + 0.19 * sn(3)];
      case 'K2': return [1.0241 + 0.2863 * c(1) + 0.0083 * c(2) - 0.0015 * c(3), -17.74 * sn(1) + 0.68 * sn(2) - 0.04 * sn(3)];
      case 'MK3': return [fM2 * fK1, uM2 + uK1];
      case 'MM': return [1.0 - 0.1300 * c(1) + 0.0013 * c(2), 0];
      case 'MF': return [1.043 + 0.414 * c(1), -23.7 * sn(1) + 2.7 * sn(2) - 0.4 * sn(3)];
      case 'J1': return [1.0129 + 0.1676 * c(1) - 0.0170 * c(2) + 0.0016 * c(3), -12.94 * sn(1) + 1.34 * sn(2) - 0.19 * sn(3)];
      case 'OO1': return [1.1027 + 0.6504 * c(1) + 0.0317 * c(2) - 0.0014 * c(3), -36.68 * sn(1) + 4.02 * sn(2) - 0.57 * sn(3)];
      default: return [1, 0];
    }
  };
  /* velocidad angular de un componente (°/h) a partir de sus números de Doodson */
  T.speed = (name) => { const d = CONST[name][0]; return d[0] * 14.4920521 + d[1] * 0.5490165 + d[2] * 0.0410686 + d[3] * 0.0046418 + d[4] * 0.0022064 + d[5] * 0.0000020; };
  /* st.hc = [[nombre, amplitud (m), fase de Greenwich (°)], …] → función altura(ms) sobre el nivel medio (m); only: lista de componentes */
  T.tidePredictor = (st, only = null) => {
    const list = st.hc.filter(([n]) => CONST[n] && (!only || only.includes(n))).map(([n, A, G]) => ({ d: CONST[n][0], off: CONST[n][1], nk: CONST[n][2], A, G }));
    let cacheDay = null, fu = null;
    return (ms) => {
      const a = T.astro(ms), day = Math.floor(ms / 864e5);
      if (day !== cacheDay) { fu = list.map((k) => nodal(k.nk, a.N)); cacheDay = day; }
      let hgt = 0;
      for (let i = 0; i < list.length; i++) {
        const k = list[i], d = k.d, V = d[0] * a.tau + d[1] * a.s + d[2] * a.h + d[3] * a.p + d[4] * a.Np + d[5] * a.p1 + k.off;
        hgt += fu[i][0] * k.A * Math.cos((V + fu[i][1] - k.G) * D2R);
      }
      return hgt;
    };
  };
  /* pleamares y bajamares entre t0 y t1 (ms): [{t, h, hi}] */
  T.tideExtremes = (pred, t0, t1, step = 6 * 60e3) => {
    const out = []; let a = pred(t0 - step), b = pred(t0);
    for (let t = t0; t <= t1; t += step) {
      const c = pred(t + step);
      if ((b > a && b >= c) || (b < a && b <= c)) {
        // refinamiento parabólico
        const den = a - 2 * b + c, dt = den ? 0.5 * (a - c) / den : 0;
        out.push({ t: t + dt * step, h: b - 0.25 * (a - c) * dt, hi: b > a });
      }
      a = b; b = c;
    }
    return out;
  };
  T.amp = (st, n) => { const r = st.hc.find((x) => x[0] === n); return r ? r[1] : 0; };
  /* número de forma F = (K1 + O1) / (M2 + S2) y tipo de marea (Courtier, 1938) */
  T.formF = (st) => (T.amp(st, 'K1') + T.amp(st, 'O1')) / (T.amp(st, 'M2') + T.amp(st, 'S2'));
  T.tideType = (F) => F < 0.25 ? { k: 'sd', name: 'Semidiurna', col: '#1f6f8b' } : F < 1.5 ? { k: 'mxs', name: 'Mixta, sobre todo semidiurna', col: '#5b8f3e' } : F < 3 ? { k: 'mxd', name: 'Mixta, sobre todo diurna', col: '#c08a1e' } : { k: 'd', name: 'Diurna', col: '#b4531d' };
  /* carreras medias: vivas = 2(M2 + S2), muertas = 2(M2 − S2) */
  T.springRange = (st) => 2 * (T.amp(st, 'M2') + T.amp(st, 'S2'));
  T.neapRange = (st) => 2 * Math.abs(T.amp(st, 'M2') - T.amp(st, 'S2'));

  /* ---------- fases de la Luna (precisión de unas horas) ---------- */
  /* edad de la Luna en días desde la luna nueva de referencia (6 ene 2000, 18:14 UTC) */
  T.SYN = 29.530588853;
  T.moonAge = (ms) => { const d = (ms - Date.UTC(2000, 0, 6, 18, 14)) / 864e5; return ((d % T.SYN) + T.SYN) % T.SYN; };
  T.moonPhases = (t0, t1) => { // lunas nuevas, cuartos y llenas entre t0 y t1
    const out = []; const ref = Date.UTC(2000, 0, 6, 18, 14), P = T.SYN * 864e5;
    for (let k = Math.floor((t0 - ref) / P) - 1; ref + k * P < t1 + P; k++) {
      for (let q = 0; q < 4; q++) { const t = ref + (k + q / 4) * P; if (t >= t0 && t <= t1) out.push({ t: t + T.phaseCorr(t, q), q }); }
    }
    return out.sort((a, b) => a.t - b.t);
  };
  /* corrección de la fase media por la excentricidad de las órbitas (términos principales de Meeus, en ms) */
  T.phaseCorr = (t, q) => {
    const k = (t - Date.UTC(2000, 0, 6, 18, 14)) / (T.SYN * 864e5), Tc = k / 1236.85;
    const M = (2.5534 + 29.10535670 * k) * D2R, Mp = (201.5643 + 385.81693528 * k) * D2R, F = (160.7108 + 390.67050284 * k) * D2R;
    const E = 1 - 0.002516 * Tc;
    let c;
    if (q === 0 || q === 2) c = (q === 0 ? -0.40720 : -0.40614) * Math.sin(Mp) + (q === 0 ? 0.17241 : 0.17302) * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) + 0.01039 * Math.sin(2 * F) + 0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M);
    else c = -0.62801 * Math.sin(Mp) + 0.17172 * E * Math.sin(M) - 0.01183 * E * Math.sin(Mp + M) + 0.00862 * Math.sin(2 * Mp) + 0.00804 * Math.sin(2 * F) + 0.00454 * E * Math.sin(Mp - M) + (q === 1 ? 1 : -1) * (0.00306 - 0.00038 * E * Math.cos(M) + 0.00026 * Math.cos(Mp));
    return c * 864e5;
  };
  T.PHASE = ['luna nueva', 'cuarto creciente', 'luna llena', 'cuarto menguante'];

  /* ---------- oleaje ---------- */
  T.g = 9.81;
  /* número de onda k (rad/m) para el periodo T (s) y la profundidad d (m): ω² = g k tanh(k d) */
  T.waveK = (Tp, d) => { const w = 2 * Math.PI / Tp; let k = w * w / T.g; if (!(d < 1e4)) return k; k = Math.max(k, w / Math.sqrt(T.g * d)); for (let i = 0; i < 60; i++) { const th = Math.tanh(k * d), f = T.g * k * th - w * w, df = T.g * th + T.g * k * d * (1 - th * th); k -= f / df; } return k; };
  T.wave = (Tp, d = Infinity) => { const k = T.waveK(Tp, d), L = 2 * Math.PI / k, c = L / Tp, kd = k * d, n = isFinite(d) ? 0.5 * (1 + 2 * kd / Math.sinh(2 * kd)) : 0.5; return { k, L, c, cg: n * c, n, kd }; };
  /* crecimiento del oleaje con el viento: U10 (m/s), fetch (km), duración (h). Oleaje limitado por el fetch según JONSWAP
     (Hasselmann y otros, 1973) y mar totalmente desarrollada según Pierson y Moskowitz (1964), con U19,5 ≈ 1,026·U10 */
  T.spm = (U10, Fkm, Dh) => {
    const g = T.g, U = U10, F = Fkm * 1000;
    const full = { Hs: 0.21 * (1.026 * U) ** 2 / g, Tp: 2 * Math.PI / 0.877 * 1.026 * U / g };
    const tmin = (Fx) => 68.8 * (U / g) * Math.pow(g * Fx / (U * U), 2 / 3) / 3600; // h necesarias para recorrer el fetch
    let Fe = F, lim = 'fetch';
    if (tmin(F) > Dh) { Fe = Math.pow(Dh * 3600 / (68.8 * U / g), 1.5) * U * U / g; lim = 'duración'; }
    let Hs = 1.6e-3 * U * U / g * Math.sqrt(g * Fe / (U * U)), Tp = 0.286 * U / g * Math.cbrt(g * Fe / (U * U));
    if (Hs >= full.Hs) { Hs = full.Hs; Tp = full.Tp; lim = 'desarrollo completo'; }
    return { Hs, Tp, lim, Feff: Fe / 1000, tmin: tmin(F), full };
  };
  T.DOUGLAS = [[0, 0, 'Calma'], [1, 0.1, 'Rizada'], [2, 0.5, 'Marejadilla'], [3, 1.25, 'Marejada'], [4, 2.5, 'Fuerte marejada'], [5, 4, 'Gruesa'], [6, 6, 'Muy gruesa'], [7, 9, 'Arbolada'], [8, 14, 'Montañosa'], [9, Infinity, 'Enorme']];
  T.douglas = (Hs) => { for (const r of T.DOUGLAS) if (Hs <= r[1]) return r; return T.DOUGLAS[9]; };
  T.beaufort = (U) => { const lim = [0.3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7]; let b = 0; while (b < 12 && U >= lim[b]) b++; return b; };
  T.BEAUFORT = ['Calma', 'Ventolina', 'Flojito', 'Flojo', 'Bonancible', 'Fresquito', 'Fresco', 'Frescachón', 'Temporal', 'Temporal fuerte', 'Temporal duro', 'Temporal muy duro', 'Temporal huracanado'];

  /* ---------- Coriolis ---------- */
  T.f = (lat) => 2 * H.K.omega * Math.sin(lat * D2R);
  return T;
})();
