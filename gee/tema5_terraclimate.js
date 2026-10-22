// =====================================================================
// Geografía General I (UNED) · Temas 5 y 6 · La diversidad climática
// Normales climáticas de TerraClimate (Abatzoglou et al., 2018; 1/24°, ≈4 km, solo tierra firme)
// para dos periodos: 1991-2020 (normal vigente de la OMM) y 1961-1990 (la del manual).
//
// Lanza CINCO exportaciones a Google Drive (carpeta GEE_tema5), en enteros de 16 bits;
// los píxeles sin dato (mar) se exportan como -32768:
//   tc_mundo_9120_TPZ.tif   rejilla de ≈0,5°: T91_01…T91_12, P91_01…P91_12, Z
//   tc_mundo_9120_E.tif     rejilla de ≈0,5°: E91_01…E91_12
//   tc_mundo_6190_TP.tif    rejilla de ≈0,5°: T61_01…T61_12, P61_01…P61_12
//   tc_espana_peninsula.tif resolución nativa (≈4 km), península, Baleares, Ceuta y Melilla: todas las bandas
//   tc_espana_canarias.tif  resolución nativa (≈4 km), Canarias: todas las bandas
// Unidades:
//   T  temperatura media mensual = (máxima + mínima) / 2, en DÉCIMAS de °C
//   P  precipitación media mensual, en DÉCIMAS de mm
//   E  evapotranspiración potencial (Penman-Monteith de referencia), en DÉCIMAS de mm
//   Z  altitud media de la celda (ETOPO1), en m
//
// Con estos datos, los scripts de data/tema5 clasifican cada celda y cada uno de los 8.132 municipios
// según Köppen-Geiger en los dos periodos.
//
// Cómo se agregan las celdas del mapa mundial
// · Se exporta en la proyección nativa de TerraClimate, con celdas de 12 × 12 píxeles nativos (12 × 1/24° = 0,5°),
//   de modo que los bordes coinciden con los de los píxeles de origen (lo que evita el error «Unable to transform edge»).
// · Cada celda es la MEDIA de sus 144 píxeles de tierra (reduceResolution), no el valor de un único píxel:
//   en montaña la diferencia es grande.
// =====================================================================

var TC = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE');
var nat = ee.Image(TC.first()).select('tmmx').projection().getInfo();
print('Proyección nativa de TerraClimate:', nat.crs, nat.transform);

var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
// rejilla con el origen y la orientación nativos y celdas de un número entero de píxeles (12 × 1/24° = 0,5°)
function grid(deg) {
  var t = nat.transform, k = Math.max(1, Math.round(deg / Math.abs(t[0])));
  return [t[0] * k, t[1], t[2], t[3], t[4] * k, t[5]];
}
var G05 = grid(0.5);

// Normales mensuales de un periodo (los valores de TerraClimate son enteros con factor de escala:
// tmmx, tmmn y pet en décimas; pr en mm enteros)
function normals(y0, y1, tag, withPet) {
  var c = TC.filter(ee.Filter.calendarRange(y0, y1, 'year'));
  print('Meses de ' + y0 + '-' + y1 + ' (deben ser ' + (12 * (y1 - y0 + 1)) + '):', c.size());
  var T = [], P = [], E = [];
  for (var m = 1; m <= 12; m++) {
    var cm = c.filter(ee.Filter.calendarRange(m, m, 'month'));
    T.push(cm.map(function (i) { return i.select('tmmx').add(i.select('tmmn')).divide(2); }).mean().rename('T' + tag + '_' + pad(m)));
    P.push(cm.select('pr').mean().multiply(10).rename('P' + tag + '_' + pad(m)));
    if (withPet) E.push(cm.select('pet').mean().rename('E' + tag + '_' + pad(m)));
  }
  return { T: ee.Image.cat(T), P: ee.Image.cat(P), E: withPet ? ee.Image.cat(E) : null };
}
var n91 = normals(1991, 2020, '91', true);
var n61 = normals(1961, 1990, '61', false);
var Z = ee.Image('NOAA/NGDC/ETOPO1').select('ice_surface').rename('Z');

// Comprobación de unidades en Vitoria-Gasteiz: julio ≈ 190-200 décimas de °C y ≈ 300-400 décimas de mm
var VIT = ee.Geometry.Point([-2.67, 42.85]);
print('Vitoria-Gasteiz, julio 1991-2020 (T en décimas de °C, P en décimas de mm):',
  n91.T.select('T91_07').addBands(n91.P.select('P91_07')).reduceRegion({reducer: ee.Reducer.first(), geometry: VIT,
    crs: nat.crs, crsTransform: nat.transform}));

// Media de los píxeles de cada celda de 0,5° (las medias de la colección pierden la proyección: se le devuelve la nativa)
function agg(img) {
  return img.setDefaultProjection({crs: nat.crs, crsTransform: nat.transform})
    .reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 256})
    .reproject({crs: nat.crs, crsTransform: G05});
}
var Z05 = Z.reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 1024}).reproject({crs: nat.crs, crsTransform: G05});
var Znat = Z.reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 64}).reproject({crs: nat.crs, crsTransform: nat.transform});

function exp(img, name, tr, region) {
  Export.image.toDrive({image: img.round().clamp(-32767, 32767).unmask(-32768).toInt16(), description: name, folder: 'GEE_tema5',
    fileNamePrefix: name, region: region, crs: nat.crs, crsTransform: tr, fileFormat: 'GeoTIFF', maxPixels: 1e10});
}
var MUNDO = ee.Geometry.Rectangle([-180, -60, 180, 84], null, false); // TerraClimate no cubre la Antártida
var PENIN = ee.Geometry.Rectangle([-9.5, 35.1, 4.5, 43.9], null, false); // península, Baleares, Ceuta y Melilla
var CANAR = ee.Geometry.Rectangle([-18.3, 27.5, -13.3, 29.5], null, false);

exp(agg(n91.T.addBands(n91.P)).addBands(Z05), 'tc_mundo_9120_TPZ', G05, MUNDO);
exp(agg(n91.E), 'tc_mundo_9120_E', G05, MUNDO);
exp(agg(n61.T.addBands(n61.P)), 'tc_mundo_6190_TP', G05, MUNDO);
var esp = ee.Image.cat([n91.T, n91.P, n91.E, n61.T, n61.P]).addBands(Znat);
exp(esp, 'tc_espana_peninsula', nat.transform, PENIN);
exp(esp, 'tc_espana_canarias', nat.transform, CANAR);

// --- Vista previa (resolución nativa; puede tardar unos segundos en dibujarse) ---------------------
Map.setCenter(-3.7, 40.3, 6);
Map.addLayer(n91.T.select('T91_07').divide(10), {min: 10, max: 30, palette: ['#313695', '#74add1', '#ffffbf', '#f46d43', '#a50026']}, 'Temperatura de julio 1991-2020 (°C)');
Map.addLayer(n91.P.select('P91_08').divide(10), {min: 0, max: 120, palette: ['#fff7e6', '#a6d96a', '#1a9850', '#2166ac']}, 'Precipitación de agosto 1991-2020 (mm)', false);
print('Lanza las cinco tareas desde la pestaña Tasks (botón RUN en cada una).');
