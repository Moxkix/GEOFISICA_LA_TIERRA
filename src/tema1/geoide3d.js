/* ===================== Geoide EGM96: datos y globo 3D (WebGL, sin bibliotecas) ===================== */
const GEO = (() => {
  const G = { ready: false };
  const AE = 6378137, FW = 1 / 298.257223563;

  /* base64 → deflate → int16 (predictor 2D) → metros */
  const unz = async (b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const st = new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Int16Array(await new Response(st).arrayBuffer());
  };
  const rebuild = (r, nx, ny, sc) => {
    const q = new Int32Array(nx * ny), out = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const p = i && j ? q[k - 1] + q[k - nx] - q[k - nx - 1] : i ? q[k - 1] : j ? q[k - nx] : 0;
      q[k] = r[k] + p; out[k] = q[k] * sc;
    }
    return out;
  };
  const grid = (data, m, wrap) => ({
    ...m, data,
    at(lat, lon) {
      const fy = (m.lat0 - lat) / m.res; let fx = (lon - m.lon0) / m.res;
      if (wrap) fx = ((fx % m.nx) + m.nx) % m.nx;
      if (fy < 0 || fy > m.ny - 1 || (!wrap && (fx < 0 || fx > m.nx - 1))) return wrap ? data[Math.max(0, Math.min(m.ny - 1, Math.round(fy))) * m.nx + Math.floor(fx)] : NaN;
      const x0 = Math.floor(fx), y0 = Math.min(Math.floor(fy), m.ny - 2), tx = fx - x0, ty = fy - y0;
      const x1 = wrap ? (x0 + 1) % m.nx : Math.min(x0 + 1, m.nx - 1);
      const d = data, n = m.nx;
      return d[y0 * n + x0] * (1 - tx) * (1 - ty) + d[y0 * n + x1] * tx * (1 - ty) + d[(y0 + 1) * n + x0] * (1 - tx) * ty + d[(y0 + 1) * n + x1] * tx * ty;
    },
  });

  G.load = async () => {
    if (G.ready) return G;
    const D = GEOIDE;
    G.g = grid(rebuild(await unz(D.z), D.nx, D.ny, D.scale), D, true);
    if (D.es) G.es = grid(rebuild(await unz(D.es.z), D.es.nx, D.es.ny, D.scale), D.es, false);
    G.min = D.min; G.max = D.max; G.src = D.src;
    G.ready = true; return G;
  };
  /* ondulación N (m) en un punto: rejilla de 15′ en España, de 1° en el resto */
  G.N = (lat, lon) => { if (G.es) { const v = G.es.at(lat, lon); if (v === v) return v; } return G.g.at(lat, lon); };

  /* rampa de color divergente para N (m) */
  const STOPS = [[-110, [33, 60, 120]], [-60, [56, 112, 170]], [-25, [140, 186, 214]], [0, [244, 241, 232]], [25, [236, 182, 120]], [55, [205, 104, 52]], [90, [130, 30, 40]]];
  G.color = (v) => {
    if (v <= STOPS[0][0]) return STOPS[0][1];
    for (let i = 1; i < STOPS.length; i++) if (v <= STOPS[i][0]) { const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], t = (v - a) / (b - a); return ca.map((c, k) => c + (cb[k] - c) * t); }
    return STOPS[STOPS.length - 1][1];
  };

  /* superficie: elipsoide de achatamiento f·kf (radio ecuatorial 1) + N·kg a lo largo de la normal */
  const surf = (lat, lon, N, kf, kg, o, k) => {
    const f = FW * kf, e2 = 2 * f - f * f, p = lat * Math.PI / 180, l = lon * Math.PI / 180;
    const sp = Math.sin(p), cp = Math.cos(p), Ne = 1 / Math.sqrt(1 - e2 * sp * sp), h = N * kg / AE;
    o[k] = (Ne + h) * cp * Math.sin(l); o[k + 1] = (Ne * (1 - e2) + h) * sp; o[k + 2] = (Ne + h) * cp * Math.cos(l);
  };

  const VS = `attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; uniform mat3 uM; uniform vec2 uS; varying vec3 vC; varying float vL;
    void main(){ vec3 p = uM * aP; vec3 n = normalize(uM * aN); vec3 L = normalize(vec3(-0.5, 0.55, 0.68));
      float d = max(dot(n, L), 0.0); float rim = pow(1.0 - max(n.z, 0.0), 3.0);
      vL = 0.34 + 0.72 * d - 0.12 * rim; vC = aC; gl_Position = vec4(p.x * uS.x, p.y * uS.y, -p.z * 0.4, 1.0); }`;
  const FS = `precision mediump float; varying vec3 vC; varying float vL; void main(){ gl_FragColor = vec4(vC * vL, 1.0); }`;
  const VSL = `attribute vec3 aP; uniform mat3 uM; uniform vec2 uS; void main(){ vec3 p = uM * aP; gl_Position = vec4(p.x * uS.x, p.y * uS.y, -p.z * 0.4 - 0.004, 1.0); }`;
  const FSL = `precision mediump float; uniform vec4 uCol; void main(){ gl_FragColor = uCol; }`;

  /* globo interactivo. opts: { onPick(lat, lon), labels(): [{lat, lon, text, color, dot}] } */
  G.globe = (wrap, opts = {}) => {
    const cv = H.h('canvas', { style: { display: 'block', width: '100%', touchAction: 'pan-y', cursor: 'grab', border: '0', borderRadius: '0', background: '#0f1a2a' }, 'aria-label': 'Globo del geoide; arrastra para girarlo' });
    const ov = H.h('canvas', { style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '0', borderRadius: '0', background: 'transparent' } });
    wrap.style.position = 'relative'; wrap.append(cv, ov);
    const gl = cv.getContext('webgl2', { antialias: true, alpha: false, preserveDrawingBuffer: true }) || cv.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: true });
    if (!gl) { cv.remove(); ov.remove(); return null; }
    const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    const u32 = gl2 || !!gl.getExtension('OES_element_index_uint');
    const st = { lonC: opts.lonC ?? 10, latC: opts.latC ?? 25, kf: 1, kg: 10000, auto: false, w: 0, h: 0, dpr: 1, pick: null };

    const prog = (vs, fs) => { const p = gl.createProgram(); for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); gl.attachShader(p, sh); } gl.linkProgram(p); return p; };
    const P1 = prog(VS, FS), P2 = prog(VSL, FSL);

    /* malla: nodos cada `step` grados (la columna −180 se repite en +180 para cerrar la costura) */
    const step = u32 ? 1 : 2, NLA = 180 / step + 1, NLO = 360 / step + 1, nv = NLA * NLO;
    const LAT = new Float32Array(nv), LON = new Float32Array(nv), NN = new Float32Array(nv), COL = new Float32Array(nv * 3);
    for (let j = 0; j < NLA; j++) for (let i = 0; i < NLO; i++) {
      const k = j * NLO + i, lat = 90 - j * step, lon = -180 + i * step; LAT[k] = lat; LON[k] = lon;
      const v = G.g.data[(j * step) * 360 + ((i * step) % 360)]; NN[k] = v;
      const c = G.color(v); COL[k * 3] = c[0] / 255; COL[k * 3 + 1] = c[1] / 255; COL[k * 3 + 2] = c[2] / 255;
    }
    const IDX = new (u32 ? Uint32Array : Uint16Array)((NLA - 1) * (NLO - 1) * 6); let q = 0;
    for (let j = 0; j < NLA - 1; j++) for (let i = 0; i < NLO - 1; i++) { const a = j * NLO + i, b = a + 1, c = a + NLO, d = c + 1; IDX[q++] = a; IDX[q++] = c; IDX[q++] = b; IDX[q++] = b; IDX[q++] = c; IDX[q++] = d; }
    const POS = new Float32Array(nv * 3), NRM = new Float32Array(nv * 3);

    /* líneas: costas (de LAND, densificadas cada ≤ 1°) y meridianos y paralelos cada 30° */
    const mkLines = (rings) => {
      const pts = [], seg = [];
      for (const r of rings) {
        let prev = -1;
        for (let i = 0; i < r.length; i += 2) {
          let lon = r[i], lat = r[i + 1];
          if (prev >= 0) {
            const plon = pts[prev * 2 + 1], plat = pts[prev * 2]; let dl = lon - plon; if (Math.abs(dl) > 180) { prev = -1; }
            else {
              const n = Math.ceil(Math.max(Math.abs(dl), Math.abs(lat - plat)) / 1);
              for (let s = 1; s < n; s++) { pts.push(plat + (lat - plat) * s / n, plon + dl * s / n); const cur = pts.length / 2 - 1; seg.push(cur - 1, cur); }
            }
          }
          pts.push(lat, lon); const cur = pts.length / 2 - 1; if (prev >= 0) seg.push(cur - 1, cur); prev = cur;
        }
      }
      const n = pts.length / 2, L = { lat: new Float32Array(n), lon: new Float32Array(n), N: new Float32Array(n), pos: new Float32Array(n * 3), idx: new (u32 && n > 65535 ? Uint32Array : Uint16Array)(seg) };
      for (let i = 0; i < n; i++) { L.lat[i] = pts[2 * i]; L.lon[i] = pts[2 * i + 1]; L.N[i] = G.g.at(L.lat[i], L.lon[i]); }
      return L;
    };
    const coastRings = []; for (const poly of LAND) for (const ring of poly) coastRings.push(ring.concat(ring.slice(0, 2)));
    const COAST = mkLines(coastRings);
    const gr = [];
    for (let la = -60; la <= 60; la += 30) { const r = []; for (let lo = -180; lo <= 180; lo += 2) r.push(lo, la); gr.push(r); }
    for (let lo = -180; lo < 180; lo += 30) { const r = []; for (let la = -88; la <= 88; la += 2) r.push(lo, la); gr.push(r); }
    const GRAT = mkLines(gr);
    const bigIdx = COAST.idx instanceof Uint32Array;

    const buf = (data, target = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, usage); return b; };
    const bPos = buf(POS, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW), bNrm = buf(NRM, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW), bCol = buf(COL), bIdx = buf(IDX, gl.ELEMENT_ARRAY_BUFFER);
    const bCP = buf(COAST.pos, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW), bCI = buf(COAST.idx, gl.ELEMENT_ARRAY_BUFFER);
    const bGP = buf(GRAT.pos, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW), bGI = buf(GRAT.idx, gl.ELEMENT_ARRAY_BUFFER);

    const geom = () => {
      for (let k = 0; k < nv; k++) surf(LAT[k], LON[k], NN[k], st.kf, st.kg, POS, k * 3);
      // normales por diferencias entre vecinos de la malla
      for (let j = 0; j < NLA; j++) for (let i = 0; i < NLO; i++) {
        const k = j * NLO + i, o = k * 3;
        if (j === 0 || j === NLA - 1) { const r = Math.hypot(POS[o], POS[o + 1], POS[o + 2]); NRM[o] = POS[o] / r; NRM[o + 1] = POS[o + 1] / r; NRM[o + 2] = POS[o + 2] / r; continue; }
        const il = i === 0 ? NLO - 2 : i - 1, ir = i === NLO - 1 ? 1 : i + 1;
        const a = (j * NLO + ir) * 3, b = (j * NLO + il) * 3, c = ((j - 1) * NLO + i) * 3, d = ((j + 1) * NLO + i) * 3;
        const ex = POS[a] - POS[b], ey = POS[a + 1] - POS[b + 1], ez = POS[a + 2] - POS[b + 2];
        const nx = POS[c] - POS[d], ny = POS[c + 1] - POS[d + 1], nz = POS[c + 2] - POS[d + 2];
        let x = ey * nz - ez * ny, y = ez * nx - ex * nz, z = ex * ny - ey * nx;
        if (x * POS[o] + y * POS[o + 1] + z * POS[o + 2] < 0) { x = -x; y = -y; z = -z; }
        const r = Math.hypot(x, y, z) || 1; NRM[o] = x / r; NRM[o + 1] = y / r; NRM[o + 2] = z / r;
      }
      for (const L of [COAST, GRAT]) for (let i = 0; i < L.lat.length; i++) { surf(L.lat[i], L.lon[i], L.N[i], st.kf, st.kg, L.pos, i * 3); for (let c = 0; c < 3; c++) L.pos[i * 3 + c] *= 1.0015; }
      gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferSubData(gl.ARRAY_BUFFER, 0, POS);
      gl.bindBuffer(gl.ARRAY_BUFFER, bNrm); gl.bufferSubData(gl.ARRAY_BUFFER, 0, NRM);
      gl.bindBuffer(gl.ARRAY_BUFFER, bCP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, COAST.pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, bGP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, GRAT.pos);
    };

    /* matriz de vista: el punto (latC, lonC) mira al observador (+z) */
    const mat = () => {
      const l = st.lonC * Math.PI / 180, p = st.latC * Math.PI / 180, cl = Math.cos(l), sl = Math.sin(l), cp = Math.cos(p), sp = Math.sin(p);
      // Rx(p) · Ry(l): filas de la matriz
      const r0 = [cl, 0, -sl], r1 = [-sp * sl, cp, -sp * cl], r2 = [cp * sl, sp, cp * cl];
      return [r0, r1, r2];
    };
    const scale = () => { const s = 0.76, a = st.w / st.h; return a >= 1 ? [s / a, s] : [s, s * a]; };
    const attrib = (p, name, b, n = 3) => { const loc = gl.getAttribLocation(p, name); if (loc < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); };
    const proj = (lat, lon, N) => { const o = [0, 0, 0]; surf(lat, lon, N, st.kf, st.kg, o, 0); const M = mat(), S = scale(); const v = M.map((r) => r[0] * o[0] + r[1] * o[1] + r[2] * o[2]); return { x: (v[0] * S[0] + 1) / 2 * st.w, y: (1 - v[1] * S[1]) / 2 * st.h, z: v[2], r: Math.hypot(...o) }; };

    const draw = () => {
      if (!st.w) return;
      const M = mat(), S = scale(), m9 = new Float32Array([M[0][0], M[1][0], M[2][0], M[0][1], M[1][1], M[2][1], M[0][2], M[1][2], M[2][2]]); // columnas
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0.059, 0.102, 0.165, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
      gl.useProgram(P1); attrib(P1, 'aP', bPos); attrib(P1, 'aN', bNrm); attrib(P1, 'aC', bCol);
      gl.uniformMatrix3fv(gl.getUniformLocation(P1, 'uM'), false, m9); gl.uniform2fv(gl.getUniformLocation(P1, 'uS'), S);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx); gl.drawElements(gl.TRIANGLES, IDX.length, u32 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.CULL_FACE);
      for (let a = 0; a < 3; a++) { const l = gl.getAttribLocation(P1, ['aP', 'aN', 'aC'][a]); if (l >= 0) gl.disableVertexAttribArray(l); }
      gl.useProgram(P2); gl.uniformMatrix3fv(gl.getUniformLocation(P2, 'uM'), false, m9); gl.uniform2fv(gl.getUniformLocation(P2, 'uS'), S);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      attrib(P2, 'aP', bGP); gl.uniform4fv(gl.getUniformLocation(P2, 'uCol'), [1, 1, 1, 0.32]); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bGI); gl.drawElements(gl.LINES, GRAT.idx.length, GRAT.idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      attrib(P2, 'aP', bCP); gl.uniform4fv(gl.getUniformLocation(P2, 'uCol'), [0.07, 0.1, 0.14, 0.9]); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bCI); gl.drawElements(gl.LINES, COAST.idx.length, bigIdx ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.BLEND);
      // capa 2D: etiquetas en la cara visible
      const c = ov.getContext('2d'); c.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); c.clearRect(0, 0, st.w, st.h);
      const labs = (opts.labels ? opts.labels() : []).concat(st.pick ? [{ lat: st.pick[0], lon: st.pick[1], dot: '#ffffff', ring: true }] : []);
      for (const L of labs) {
        const p = proj(L.lat, L.lon, G.N(L.lat, L.lon));
        if (p.z < 0.03) continue; // en la cara oculta
        c.beginPath(); c.arc(p.x, p.y, L.ring ? 6 : 4, 0, 7); if (L.ring) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#1c2836'; c.lineWidth = 1; c.beginPath(); c.arc(p.x, p.y, 7.5, 0, 7); c.stroke(); } else { c.fillStyle = L.dot || '#fff'; c.fill(); c.strokeStyle = '#1c2836'; c.lineWidth = 1.2; c.stroke(); }
        if (L.text) {
          c.font = 'bold 12px system-ui'; const tw = c.measureText(L.text).width; let x = p.x + 9, y = p.y - 9; if (x + tw + 6 > st.w) x = p.x - 9 - tw - 6; if (y < 14) y = p.y + 20;
          c.fillStyle = 'rgba(15,26,42,.78)'; c.fillRect(x - 3, y - 12, tw + 6, 16); c.fillStyle = L.color || '#fff'; c.textBaseline = 'alphabetic'; c.fillText(L.text, x, y);
        }
      }
    };
    const resize = () => {
      const w = wrap.clientWidth; if (!w) return; const h = Math.round(Math.min(w * (w < 600 ? 1 : 0.78), 600)); const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = w; st.h = h; st.dpr = dpr; cv.style.height = h + 'px'; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ov.width = cv.width; ov.height = cv.height; draw();
    };
    new ResizeObserver(resize).observe(wrap);

    /* puntería: rayo ortogonal desde el observador hasta la superficie */
    const pickAt = (px, py) => {
      const S = scale(), M = mat(), vx = ((px / st.w) * 2 - 1) / S[0], vy = (1 - (py / st.h) * 2) / S[1];
      const toLL = (vz) => { const x = M[0][0] * vx + M[1][0] * vy + M[2][0] * vz, y = M[0][1] * vx + M[1][1] * vy + M[2][1] * vz, z = M[0][2] * vx + M[1][2] * vy + M[2][2] * vz; const r = Math.hypot(x, y, z), f = FW * st.kf, e2 = 2 * f - f * f; const gc = Math.atan2(y, Math.hypot(x, z)); const lat = Math.atan(Math.tan(gc) / (1 - e2)) * 180 / Math.PI; return [lat, Math.atan2(x, z) * 180 / Math.PI, r]; };
      const inside = (vz) => { const [lat, lon, r] = toLL(vz); const o = [0, 0, 0]; surf(lat, lon, G.N(lat, lon), st.kf, st.kg, o, 0); return r <= Math.hypot(...o); };
      let z0 = 1.7, hit = null; for (let z = 1.7; z >= -0.2; z -= 0.004) { if (inside(z)) { hit = z; break; } z0 = z; }
      if (hit == null) return null; let a = z0, b = hit; for (let k = 0; k < 14; k++) { const m = (a + b) / 2; if (inside(m)) b = m; else a = m; }
      const [lat, lon] = toLL(b); return [lat, lon];
    };

    /* arrastre para girar; clic para señalar un punto */
    let drag = null;
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, lon: st.lonC, lat: st.latC, moved: false }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      const k = 180 / (Math.min(st.w, st.h) * 0.72 * Math.PI);
      st.lonC = drag.lon - dx * k * 1.15; st.latC = Math.max(-90, Math.min(90, drag.lat + dy * k * 1.15)); if (drag.moved) { st.auto = false; if (opts.onAuto) opts.onAuto(false); } draw();
    });
    const up = (e) => { if (!drag) return; const r = cv.getBoundingClientRect(); if (!drag.moved && e.type === 'pointerup') { const p = pickAt(e.clientX - r.left, e.clientY - r.top); st.pick = p; if (opts.onPick) opts.onPick(p); draw(); } drag = null; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    const loop = () => { if (!st.auto || !cv.isConnected) { st.looping = false; return; } if (cv.offsetParent !== null) { st.lonC += 0.25; draw(); } requestAnimationFrame(loop); };
    geom();
    return {
      st, redraw: draw, pickAt,
      set(o) { let g = false; for (const k of ['kf', 'kg']) if (k in o && o[k] !== st[k]) { st[k] = o[k]; g = true; } for (const k of ['lonC', 'latC', 'pick']) if (k in o) st[k] = o[k]; if (g) geom(); draw(); },
      auto(on) { st.auto = on; if (on && !st.looping) { st.looping = true; requestAnimationFrame(loop); } },
      fallback: !u32,
    };
  };
  return G;
})();
