// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · El océano en tres dimensiones (HYCOM)
// Climatología 2014-2023 del modelo oceánico HYCOM (1/12°, con asimilación de datos), una imagen al día.
// Lanza SEIS exportaciones a Google Drive (carpeta GEE_tema4). Valores en bruto de HYCOM (enteros de 16 bits):
//   temperatura y salinidad: valor = bruto × 0,001 + 20 (°C y salinidad práctica)
//   velocidades: valor = bruto × 0,001 (m/s)
// Los píxeles sin dato (tierra, fondo) se exportan como -32768.
//   hycom_superficie_1deg.tif  salinidad (s01…s12) y corriente superficial (u01…u12, v01…v12), medias mensuales
//   hycom_perfiles_5deg.tif    temperatura y salinidad en 19 profundidades, febrero y agosto (T02_0 … S08_5000)
//   hycom_atlantico_25W.tif    corte norte-sur del Atlántico a 25° O, media anual, 40 profundidades (T_0 … S_5000)
//   hycom_gibraltar_36N.tif    corte oeste-este por el estrecho de Gibraltar (35,95° N), media anual
//   hycom_ecuador_oeste.tif / hycom_ecuador_este.tif  corte a lo largo del ecuador en el Pacífico (120° E - 80° O),
//                              0-500 m: media 2014-2023 y diciembre de 2015 (El Niño) (T_… y N_…)
// =====================================================================

var Y0 = 2014, Y1 = 2023;
var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
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
function exp(img, name, tr, region) {
  Export.image.toDrive({image: img.round().unmask(-32768).toInt16(), description: name, folder: 'GEE_tema4',
    fileNamePrefix: name, region: region || GLOBE, crs: 'EPSG:4326', crsTransform: tr, fileFormat: 'GeoTIFF', maxPixels: 1e10});
}
function tsBands(levels, prefixT, prefixS) {
  return levels.map(function (z) { return 'water_temp_' + z; }).concat(levels.map(function (z) { return 'salinity_' + z; }));
}
function renamed(img, levels, tag) {
  var t = levels.map(function (z) { return 'T' + tag + '_' + z; }), s = levels.map(function (z) { return 'S' + tag + '_' + z; });
  return img.rename(t.concat(s));
}

// ---------- 1) Superficie: salinidad y corriente, medias mensuales (1°) ----------
var S = [], U = [], V = [];
for (var m = 1; m <= 12; m++) {
  S.push(byMonth(TS, m).select('salinity_0').mean().rename('s' + pad(m)));
  var uv = byMonth(UV, m).select(['velocity_u_0', 'velocity_v_0']).mean();
  U.push(uv.select('velocity_u_0').rename('u' + pad(m)));
  V.push(uv.select('velocity_v_0').rename('v' + pad(m)));
}
exp(ee.Image.cat(S.concat(U, V)), 'hycom_superficie_1deg', [1, 0, -180, 0, -1, 90]);

// ---------- 2) Perfiles verticales en febrero y agosto (5°) ----------
var prof = ee.Image.cat([2, 8].map(function (m) {
  return renamed(byMonth(TS, m).select(tsBands(LEV19)).mean(), LEV19, pad(m));
}));
exp(prof, 'hycom_perfiles_5deg', [5, 0, -180, 0, -5, 90]);

// ---------- 3) Cortes verticales, media anual ----------
var annual = TS.select(tsBands(LEV)).mean();
var allLev = renamed(annual, LEV, '');
// Atlántico a 25° O, de la Antártida (mar de Weddell) a Islandia, cada 1° de latitud
exp(allLev, 'hycom_atlantico_25W', [1, 0, -25.5, 0, -1, 70], ee.Geometry.Rectangle([-25.5, -80, -24.5, 70], null, false));
// Estrecho de Gibraltar a 35,95° N, de 20° O a 0°, cada 0,1° de longitud
exp(allLev, 'hycom_gibraltar_36N', [0.1, 0, -20, 0, -0.1, 36.0], ee.Geometry.Rectangle([-20, 35.9, 0, 36.0], null, false));

// ---------- 4) El ecuador en el Pacífico: termoclina inclinada y El Niño de 2015 ----------
var eqBands = tsBands(LEVEQ).slice(0, LEVEQ.length); // solo temperatura
var eqMean = TS.select(eqBands).mean().rename(LEVEQ.map(function (z) { return 'T_' + z; }));
var eqNino = TS.filter(ee.Filter.calendarRange(2015, 2015, 'year')).filter(ee.Filter.calendarRange(12, 12, 'month'))
  .select(eqBands).mean().rename(LEVEQ.map(function (z) { return 'N_' + z; }));
var eq = ee.Image.cat([eqMean, eqNino]);
exp(eq, 'hycom_ecuador_oeste', [1, 0, 120, 0, -1, 0.5], ee.Geometry.Rectangle([120, -0.5, 180, 0.5], null, false));
exp(eq, 'hycom_ecuador_este', [1, 0, -180, 0, -1, 0.5], ee.Geometry.Rectangle([-180, -0.5, -80, 0.5], null, false));

// ---------- Vista previa ----------
var sc = function (img) { return img.multiply(0.001).add(20); };
Map.addLayer(sc(S[0]), {min: 32, max: 38, palette: ['#2166ac', '#f7f7f7', '#b2182b']}, 'Salinidad superficial, enero');
Map.addLayer(U[0].hypot(V[0]).multiply(0.001), {min: 0, max: 1, palette: ['#ffffff', '#08306b']}, 'Velocidad de la corriente, enero (m/s)', false);
