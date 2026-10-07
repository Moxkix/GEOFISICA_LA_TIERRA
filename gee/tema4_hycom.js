// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · El océano en tres dimensiones (HYCOM)
// Climatología 2014-2023 del modelo oceánico HYCOM (1/12°, con asimilación de datos), una imagen al día.
// Lanza SIETE exportaciones a Google Drive (carpeta GEE_tema4). Valores en bruto de HYCOM (enteros de 16 bits):
//   temperatura y salinidad: valor = bruto × 0,001 + 20 (°C y salinidad práctica)
//   velocidades: valor = bruto × 0,001 (m/s)
// Los píxeles sin dato (tierra, fondo) se exportan como -32768.
//   hycom_salinidad_1deg.tif   salinidad superficial (s01…s12), medias mensuales, celdas de ≈1°
//   hycom_corrientes_1deg.tif  corriente superficial (u01…u12, v01…v12), medias mensuales, celdas de ≈1°
//   hycom_perfiles_5deg.tif    temperatura y salinidad en 19 profundidades, febrero y agosto, celdas de ≈5°
//   hycom_atlantico_25W.tif    corte norte-sur del Atlántico a 25° O, media anual, 40 profundidades (resolución nativa)
//   hycom_gibraltar_36N.tif    corte oeste-este por el estrecho de Gibraltar (35,95° N), media anual (resolución nativa)
//   hycom_ecuador_oeste.tif / hycom_ecuador_este.tif  corte a lo largo del ecuador en el Pacífico (120° E - 80° O),
//                              0-500 m: media 2014-2023 y diciembre de 2015 (El Niño) (resolución nativa)
//
// Por qué se exporta en la rejilla de HYCOM
// · En una rejilla de 1° con origen en −180°/90°, la tarea fallaba con «Unable to transform edge … (Error code: 3)»,
//   el mismo error que dieron MERRA-2 y ERA5 horarios: Earth Engine no consigue proyectar los bordes de las
//   teselas de salida sobre la rejilla de estas colecciones diarias u horarias.
// · Aquí la salida usa la proyección nativa de HYCOM (0,08°): tal cual en los cortes, y con las celdas agrupadas
//   por un número entero de píxeles nativos en los mapas (con píxeles de 0,08°: 12 → 0,96°, 62 → 4,96°), de modo que los bordes de las
//   celdas coinciden con bordes de píxeles de HYCOM. HYCOM solo cubre de 80,48° S a 80,48° N.
// · Los conversores (data/tema4/make_oceano.py y make_hycom.py) pasan los datos a celdas de 1° y 5° por coordenadas.
// =====================================================================

var Y0 = 2014, Y1 = 2023;
var LEV = [0, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250, 300, 350,
  400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000];
var LEV19 = [0, 10, 20, 30, 50, 70, 100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 4000, 5000];
var LEVEQ = LEV.filter(function (z) { return z <= 500; });
var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
var daily = ee.Filter.calendarRange(0, 0, 'hour'); // una imagen al día (00 UTC)
var TS = ee.ImageCollection('HYCOM/sea_temp_salinity').filter(ee.Filter.calendarRange(Y0, Y1, 'year')).filter(daily);
var UV = ee.ImageCollection('HYCOM/sea_water_velocity').filter(ee.Filter.calendarRange(Y0, Y1, 'year')).filter(daily);
print('Imágenes diarias de temperatura/salinidad:', TS.size(), '· de velocidad:', UV.size());
var byMonth = function (col, m) { return col.filter(ee.Filter.calendarRange(m, m, 'month')); };

// Proyecciones nativas (se leen del propio dato para no suponer nada)
var natTS = ee.Image(TS.first()).select('salinity_0').projection().getInfo();
var natUV = ee.Image(UV.first()).select('velocity_u_0').projection().getInfo();
print('Proyección nativa de temperatura/salinidad:', natTS.crs, natTS.transform);
print('Proyección nativa de velocidad:', natUV.crs, natUV.transform);
// Rejilla con el mismo origen y la misma orientación que la nativa y celdas de un número entero de píxeles
// nativos en cada eje, lo más cerca posible de `deg` grados sin pasarse (p. ej., 12 × 0,08° = 0,96°)
function grid(nat, deg) {
  var t = nat.transform;
  var kx = Math.max(1, Math.floor(deg / Math.abs(t[0]) + 1e-9)), ky = Math.max(1, Math.floor(deg / Math.abs(t[4]) + 1e-9));
  return [t[0] * kx, t[1], t[2], t[3], t[4] * ky, t[5]];
}

function exp(img, name, nat, tr, region) {
  Export.image.toDrive({image: img.round().unmask(-32768).toInt16(), description: name, folder: 'GEE_tema4',
    fileNamePrefix: name, region: region, crs: nat.crs, crsTransform: tr, fileFormat: 'GeoTIFF', maxPixels: 1e10});
}
var OCEAN = ee.Geometry.Rectangle([-180, -80, 180, 80], null, false);
function tsBands(levels) {
  return levels.map(function (z) { return 'water_temp_' + z; }).concat(levels.map(function (z) { return 'salinity_' + z; }));
}
function renamed(img, levels, tag) {
  var t = levels.map(function (z) { return 'T' + tag + '_' + z; }), s = levels.map(function (z) { return 'S' + tag + '_' + z; });
  return img.rename(t.concat(s));
}

// ---------- 1) Superficie: salinidad y corriente, medias mensuales (≈1°) ----------
var S = [], U = [], V = [];
for (var m = 1; m <= 12; m++) {
  S.push(byMonth(TS, m).select('salinity_0').mean().rename('s' + pad(m)));
  var uv = byMonth(UV, m).select(['velocity_u_0', 'velocity_v_0']).mean();
  U.push(uv.select('velocity_u_0').rename('u' + pad(m)));
  V.push(uv.select('velocity_v_0').rename('v' + pad(m)));
}
exp(ee.Image.cat(S), 'hycom_salinidad_1deg', natTS, grid(natTS, 1), OCEAN);
exp(ee.Image.cat(U.concat(V)), 'hycom_corrientes_1deg', natUV, grid(natUV, 1), OCEAN);

// ---------- 2) Perfiles verticales en febrero y agosto (≈5°) ----------
var prof = ee.Image.cat([2, 8].map(function (m) {
  return renamed(byMonth(TS, m).select(tsBands(LEV19)).mean(), LEV19, pad(m));
}));
exp(prof, 'hycom_perfiles_5deg', natTS, grid(natTS, 5), OCEAN);

// ---------- 3) Cortes verticales, media anual, en la resolución nativa ----------
var annual = renamed(TS.select(tsBands(LEV)).mean(), LEV, '');
var NAT = natTS.transform;
// Atlántico a 25° O, de la Antártida (mar de Weddell) a Islandia
exp(annual, 'hycom_atlantico_25W', natTS, NAT, ee.Geometry.Rectangle([-25.04, -80, -24.96, 70], null, false));
// Estrecho de Gibraltar a 35,95° N, de 20° O a 0°
exp(annual, 'hycom_gibraltar_36N', natTS, NAT, ee.Geometry.Rectangle([-20, 35.93, 0, 35.97], null, false));

// ---------- 4) El ecuador en el Pacífico: termoclina inclinada y El Niño de 2015 (0,5° S - 0,5° N) ----------
var eqBands = LEVEQ.map(function (z) { return 'water_temp_' + z; });
var eqMean = TS.select(eqBands).mean().rename(LEVEQ.map(function (z) { return 'T_' + z; }));
var eqNino = TS.filter(ee.Filter.calendarRange(2015, 2015, 'year')).filter(ee.Filter.calendarRange(12, 12, 'month'))
  .select(eqBands).mean().rename(LEVEQ.map(function (z) { return 'N_' + z; }));
var eq = ee.Image.cat([eqMean, eqNino]);
exp(eq, 'hycom_ecuador_oeste', natTS, NAT, ee.Geometry.Rectangle([120, -0.5, 180, 0.5], null, false));
exp(eq, 'hycom_ecuador_este', natTS, NAT, ee.Geometry.Rectangle([-180, -0.5, -80, 0.5], null, false));

// Sin vista previa en el mapa: promediar diez años de datos diarios en las teselas del mapa interactivo
// agota la memoria del Code Editor. Las exportaciones por lotes sí tienen memoria suficiente.
print('Lanza las siete tareas desde la pestaña Tasks (botón RUN en cada una).');
