/* ============================================================
   Clasificación climática de Köppen-Geiger (motor común de los
   Temas 5 y 6). Función pura: 12 temperaturas medias (°C) y
   12 precipitaciones (mm) → tipo y traza de cada decisión.

   Criterios (Köppen, 1936; Kottek y otros, 2006; Peel y otros, 2007):
   · E   mes más cálido < 10 °C (ET si llega a 0 °C; EF si no).
   · B   precipitación anual < umbral de aridez e (BW si < e/2; BS si no).
         Umbral del manual (Patton): e = 20·t + 490 − 7·PPW, con PPW (% de la
         lluvia en el semestre frío) entre 30 y 70; o la regla por tramos de
         Peel y otros (2007): 20·t + 0, 140 o 280 mm. h si t anual ≥ 18 °C; k si no.
   · A   mes más frío ≥ 18 °C. Af: mes más seco ≥ 60 mm; Am: mes más seco
         ≥ 100 − P/25; Aw: el resto.
   · C/D mes más frío entre el umbral C/D (−3 °C, o 0 °C) y 18 °C → C; por debajo → D.
         s: el mes más seco del verano recibe < 30 mm (o 40) y < 1/3 del más lluvioso
            del invierno (y menos que el más seco del invierno).
         w: el mes más seco del invierno recibe < 1/10 del más lluvioso del verano
            (y menos que el más seco del verano).
         f: ni s ni w.
         a: mes más cálido ≥ 22 °C; b: 4 o más meses ≥ 10 °C; d: mes más frío < −38 °C;
         c: el resto.
   Verano = abril-septiembre en el hemisferio norte y octubre-marzo en el sur.
   ============================================================ */
const KG = (() => {
  const K = {};
  K.DEF = { cd: -3, sMm: 30, arid: 'patton' };

  /* colores habituales de los mapas de Köppen-Geiger (Peel y otros, 2007; Beck y otros, 2018) */
  K.COL = {
    Af: [0, 0, 255], Am: [0, 120, 255], Aw: [70, 170, 250],
    BWh: [255, 0, 0], BWk: [255, 150, 150], BSh: [245, 165, 0], BSk: [255, 220, 100],
    Csa: [255, 255, 0], Csb: [200, 200, 0], Csc: [150, 150, 0],
    Cwa: [150, 255, 150], Cwb: [100, 200, 100], Cwc: [50, 150, 50],
    Cfa: [200, 255, 80], Cfb: [100, 255, 80], Cfc: [50, 200, 0],
    Dsa: [255, 0, 255], Dsb: [200, 0, 200], Dsc: [150, 50, 150], Dsd: [150, 100, 150],
    Dwa: [170, 175, 255], Dwb: [90, 120, 220], Dwc: [75, 80, 180], Dwd: [50, 0, 135],
    Dfa: [0, 255, 255], Dfb: [55, 200, 255], Dfc: [0, 125, 125], Dfd: [0, 70, 95],
    ET: [178, 178, 178], EF: [102, 102, 102],
  };
  K.CODES = Object.keys(K.COL); // el índice (1…30) sirve de código numérico en los mapas
  K.code = (t) => K.CODES.indexOf(t) + 1;
  K.css = (t) => `rgb(${(K.COL[t] || [255, 255, 255]).join(',')})`;
  /* texto negro o blanco según el fondo */
  K.ink = (t) => { const c = K.COL[t] || [255, 255, 255]; return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 150 ? '#1c2836' : '#fff'; };

  K.GROUP = { A: 'Climas cálidos (tropicales)', B: 'Climas secos', C: 'Climas templados', D: 'Climas fríos (de bosque boreal)', E: 'Climas polares' };
  const L2 = { f: 'húmedo todo el año', s: 'con verano seco', w: 'con invierno seco', m: 'monzónico', W: 'de desierto', S: 'de estepa', T: 'de tundra', F: 'de hielo perpetuo' };
  const L3 = { a: 'verano caluroso', b: 'verano templado', c: 'verano corto y fresco', d: 'invierno muy frío', h: 'cálido', k: 'frío' };
  K.NAME = {
    Af: 'Ecuatorial (selva tropical)', Am: 'Monzónico', Aw: 'Tropical con estación seca (sabana)',
    BWh: 'Desierto cálido', BWk: 'Desierto frío', BSh: 'Estepa cálida', BSk: 'Estepa fría',
    Csa: 'Mediterráneo de verano caluroso', Csb: 'Mediterráneo de verano templado', Csc: 'Mediterráneo de verano fresco',
    Cwa: 'Subtropical con invierno seco', Cwb: 'Templado de altura con invierno seco', Cwc: 'Subpolar de altura con invierno seco',
    Cfa: 'Subtropical húmedo (chino)', Cfb: 'Oceánico', Cfc: 'Oceánico subpolar',
    Dsa: 'Continental con verano seco y caluroso', Dsb: 'Continental con verano seco y templado', Dsc: 'Subártico con verano seco', Dsd: 'Subártico con verano seco e invierno extremo',
    Dwa: 'Continental de invierno seco y verano caluroso', Dwb: 'Continental de invierno seco y verano templado', Dwc: 'Subártico de invierno seco', Dwd: 'Subártico de invierno seco y extremo',
    Dfa: 'Continental húmedo de verano caluroso', Dfb: 'Continental húmedo de verano templado', Dfc: 'Subártico (taiga)', Dfd: 'Subártico de invierno extremo',
    ET: 'Tundra', EF: 'Hielo perpetuo',
  };
  /* descripción de cada letra del tipo */
  K.letters = (t) => {
    const g = t[0], out = [[g, K.GROUP[g]]];
    if (g === 'B') { out.push([t[1], L2[t[1]]]); out.push([t[2], L3[t[2]]]); }
    else if (g === 'E') out.push([t[1], L2[t[1]]]);
    else { out.push([t[1], L2[t[1]]]); if (t[2]) out.push([t[2], L3[t[2]]]); }
    return out;
  };

  const sum = (a) => a.reduce((x, y) => x + y, 0);
  /* índices de los meses de verano (semestre cálido astronómico) según el hemisferio */
  K.summerIdx = (lat) => (lat >= 0 ? [3, 4, 5, 6, 7, 8] : [9, 10, 11, 0, 1, 2]);
  K.winterIdx = (lat) => (lat >= 0 ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8]);

  /* umbral de aridez (mm) */
  K.aridity = (Tann, pw, arid = 'patton') => {
    if (arid === 'peel') return 20 * Tann + (pw >= 70 ? 0 : pw <= 30 ? 280 : 140);
    const PPW = Math.max(30, Math.min(70, pw));
    return 20 * Tann + 490 - 7 * PPW;
  };

  /* estadísticos que usa la clasificación */
  K.stats = (T, P, lat) => {
    const su = K.summerIdx(lat), wi = K.winterIdx(lat);
    const Ps = su.map((i) => P[i]), Pw = wi.map((i) => P[i]);
    const Pann = sum(P), Tann = sum(T) / 12;
    const st = {
      Tann, Pann, Tmax: Math.max(...T), Tmin: Math.min(...T), iTmax: T.indexOf(Math.max(...T)), iTmin: T.indexOf(Math.min(...T)),
      Pdry: Math.min(...P), iPdry: P.indexOf(Math.min(...P)),
      Psdry: Math.min(...Ps), Pswet: Math.max(...Ps), Pwdry: Math.min(...Pw), Pwwet: Math.max(...Pw),
      iPsdry: su[Ps.indexOf(Math.min(...Ps))], iPswet: su[Ps.indexOf(Math.max(...Ps))], iPwdry: wi[Pw.indexOf(Math.min(...Pw))], iPwwet: wi[Pw.indexOf(Math.max(...Pw))],
      Psum: sum(Ps), Pwin: sum(Pw), n10: T.filter((t) => t >= 10).length,
    };
    st.pw = Pann > 0 ? st.Pwin / Pann * 100 : 50; // % de la lluvia en el semestre frío
    return st;
  };

  /* clasificación con traza: steps = [{id, q, a, ok}] (pregunta, respuesta con valores, se cumple o no) */
  K.classify = (T, P, lat, opt = {}) => {
    const o = Object.assign({}, K.DEF, opt), s = K.stats(T, P, lat), steps = [];
    const neg = (s) => s.replace('-', '−');
    const f1 = (v) => neg((Math.round(v * 10) / 10).toLocaleString('es-ES')), f0 = (v) => neg(Math.round(v).toLocaleString('es-ES'));
    const fm = (v) => (Math.abs(v) < 10 ? f1(v) : f0(v)); // mm: con un decimal por debajo de 10
    const fp = (v) => (v < 0 ? `(${f1(v)})` : f1(v)); // entre paréntesis si es negativo
    const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const step = (id, q, a, ok) => { steps.push({ id, q, a, ok }); return ok; };
    let type;
    // 1 · E
    if (step('E', '¿El mes más cálido está por debajo de 10 °C?', `Mes más cálido: ${MES[s.iTmax]}, ${f1(s.Tmax)} °C`, s.Tmax < 10)) {
      type = step('EF', '¿Ningún mes llega a 0 °C?', `Mes más cálido: ${f1(s.Tmax)} °C`, s.Tmax < 0) ? 'EF' : 'ET';
      return { type, steps, s, o };
    }
    // 2 · B
    const e = K.aridity(s.Tann, s.pw, o.arid); s.e = e;
    const eTxt = o.arid === 'peel'
      ? `umbral e = 20 × ${fp(s.Tann)} + ${s.pw >= 70 ? 0 : s.pw <= 30 ? 280 : 140} = ${f0(e)} mm (lluvia del semestre frío: ${f0(s.pw)} %)`
      : `umbral e = 20 × ${fp(s.Tann)} + 490 − 7 × ${f0(Math.max(30, Math.min(70, s.pw)))} = ${f0(e)} mm (lluvia del semestre frío: ${f0(s.pw)} %${s.pw < 30 || s.pw > 70 ? ', se toma ' + (s.pw < 30 ? 30 : 70) : ''})`;
    if (step('B', '¿La precipitación anual es menor que el umbral de aridez?', `P = ${f0(s.Pann)} mm; ${eTxt}`, s.Pann < e)) {
      const W = step('BW', '¿Es menor que la mitad del umbral?', `${f0(s.Pann)} mm frente a e/2 = ${f0(e / 2)} mm`, s.Pann < e / 2);
      const h = step('Bh', '¿La temperatura media anual llega a 18 °C?', `${f1(s.Tann)} °C`, s.Tann >= 18);
      return { type: 'B' + (W ? 'W' : 'S') + (h ? 'h' : 'k'), steps, s, o };
    }
    // 3 · A
    if (step('A', '¿El mes más frío llega a 18 °C?', `Mes más frío: ${MES[s.iTmin]}, ${f1(s.Tmin)} °C`, s.Tmin >= 18)) {
      if (step('Af', '¿El mes más seco recibe al menos 60 mm?', `Mes más seco: ${MES[s.iPdry]}, ${fm(s.Pdry)} mm`, s.Pdry >= 60)) return { type: 'Af', steps, s, o };
      const lim = 100 - s.Pann / 25;
      const m = step('Am', '¿El mes más seco recibe al menos 100 − P/25 mm? (equivale a P ≥ 2.500 − 25 × mes más seco)', `${fm(s.Pdry)} mm frente a 100 − ${f0(s.Pann)}/25 = ${fm(lim)} mm`, s.Pdry >= lim);
      return { type: m ? 'Am' : 'Aw', steps, s, o };
    }
    // 4 · C o D
    const C = step('C', `¿El mes más frío supera ${o.cd === 0 ? '0' : '−3'} °C?`, `Mes más frío: ${MES[s.iTmin]}, ${f1(s.Tmin)} °C`, s.Tmin > o.cd);
    const g = C ? 'C' : 'D';
    // segunda letra
    const sOk = s.Psdry < o.sMm && s.Psdry < s.Pwwet / 3 && s.Psdry < s.Pwdry;
    const wOk = s.Pwdry < s.Pswet / 10 && s.Pwdry < s.Psdry;
    let l2 = 'f';
    if (step('s', `¿Verano seco? El mes más seco del verano recibe menos de ${o.sMm} mm y menos de 1/3 del más lluvioso del invierno`,
      `${MES[s.iPsdry]}: ${fm(s.Psdry)} mm; ${MES[s.iPwwet]}: ${fm(s.Pwwet)} mm (1/3 = ${fm(s.Pwwet / 3)} mm)`, sOk)) l2 = 's';
    else if (step('w', '¿Invierno seco? El mes más seco del invierno recibe menos de 1/10 del más lluvioso del verano',
      `${MES[s.iPwdry]}: ${fm(s.Pwdry)} mm; ${MES[s.iPswet]}: ${fm(s.Pswet)} mm (1/10 = ${fm(s.Pswet / 10)} mm)`, wOk)) l2 = 'w';
    // tercera letra
    let l3;
    if (step('a', '¿El mes más cálido llega a 22 °C?', `${MES[s.iTmax]}: ${f1(s.Tmax)} °C`, s.Tmax >= 22)) l3 = 'a';
    else if (step('b', '¿Hay al menos 4 meses de 10 °C o más?', `${s.n10} ${s.n10 === 1 ? 'mes' : 'meses'}`, s.n10 >= 4)) l3 = 'b';
    else if (g === 'D' && step('d', '¿El mes más frío baja de −38 °C?', `${f1(s.Tmin)} °C`, s.Tmin < -38)) l3 = 'd';
    else l3 = 'c';
    return { type: g + l2 + l3, steps, s, o };
  };
  K.type = (T, P, lat, opt) => K.classify(T, P, lat, opt).type;
  return K;
})();
if (typeof module !== 'undefined') module.exports = KG;
