// =====================================================================
// Geografía General I (UNED) · Tema 3 · Dos casos reales con ERA5 horario
//   A) DANA del 29 de octubre de 2024 (Valencia)
//   B) Viento sur en Bilbao, 23-26 de febrero de 2026 (27,1 °C el día 24,
//      récord invernal del aeropuerto desde 1948) y paso del frente frío
//
// Exporta a Google Drive (carpeta GEE_tema3), en enteros de 16 bits y horas UTC:
//   dana_superficie.tif        6 horas × (p, u, v)
//   dana_precip.tif            precipitación del día 29 (24 h y cuatro tramos de 6 h)
//   dana_altura_<fuente>.tif   6 horas × (z500, t500, u500, v500, u250, v250, t850, u850, v850)
//   vsur_superficie.tif       21 horas (cada 3 h, del 23 a las 12 al 26 a las 00) × (p, u, v, t, td)
//   vsur_altura_<fuente>.tif  21 horas × (t850, u850, v850)
//   vsur_series.csv            serie horaria en Bilbao, Burgos, Vitoria, Donostia y Santander
// Unidades: p en décimas de hPa; u, v en centésimas de m/s; t, td en décimas de °C;
// precipitación en décimas de mm; z500 (altura de la superficie de 500 hPa) en metros.
//
// Niveles de presión: se usan los de ERA5 (ECMWF/ERA5/HOURLY_PRESSURE_LEVELS) si
// están todas las horas; si no, los de MERRA-2 (NASA), que traen la altura de
// 500 hPa ya calculada. La consola indica qué fuente se ha usado en cada caso.
// =====================================================================

var SL = ee.ImageCollection('ECMWF/ERA5/HOURLY');
var PL = ee.ImageCollection('ECMWF/ERA5/HOURLY_PRESSURE_LEVELS');
var M2 = ee.ImageCollection('NASA/GSFC/MERRA/slv/2');
var LEV = [1000, 975, 950, 925, 900, 875, 850, 825, 800, 775, 750, 700, 650, 600, 550, 500];
var RD = 287.05, G0 = 9.80665;
var STD = {crs: 'EPSG:4326', crsTransform: [0.25, 0, -180, 0, -0.25, 90]};

// ¿Tiene la colección una imagen en cada una de las horas? (comprobación en el servidor)
function hasAll(col, times) {
  var n = ee.List(times.map(function (t) { return col.filterDate(ee.Date(t), ee.Date(t).advance(1, 'hour')).size(); }));
  var counts = n.getInfo();
  return counts.every(function (c) { return c > 0; });
}
// Rejilla nativa de ERA5, leída de una sola banda (no todas las bandas comparten proyección)
function grid(col, t, band) {
  var c = col.filterDate(ee.Date(t), ee.Date(t).advance(1, 'hour'));
  if (c.size().getInfo() === 0) return STD;
  var p = ee.Image(c.first()).select(band).projection().getInfo(), tr = p.transform;
  if (p.crs !== 'EPSG:4326' || !tr || Math.abs(tr[0] - 0.25) > 1e-6) return STD;
  return {crs: 'EPSG:4326', crsTransform: tr};
}
function hourImg(col, iso) {
  return ee.Image(col.filterDate(ee.Date(iso), ee.Date(iso).advance(1, 'hour')).first());
}
function tag(iso) { return iso.slice(5, 7) + iso.slice(8, 10) + iso.slice(11, 13); } // MMDDHH
function surf(iso) {
  var i = hourImg(SL, iso), k = tag(iso);
  return ee.Image.cat([
    i.select('mean_sea_level_pressure').divide(10).rename('p' + k),
    i.select('u_component_of_wind_10m').multiply(100).rename('u' + k),
    i.select('v_component_of_wind_10m').multiply(100).rename('v' + k)]);
}
function precip(iso0, hours, name) { // lluvia caída entre iso0 e iso0 + hours (décimas de mm)
  // En ERA5 la tasa media de la hora T corresponde a la hora anterior (T-1 a T): se suman de iso0+1 h a iso0+hours
  var t0 = ee.Date(iso0).advance(1, 'hour');
  var c = SL.filterDate(t0, t0.advance(hours, 'hour')).select('mean_total_precipitation_rate');
  print('Horas sumadas en ' + name + ' (deben ser ' + hours + '):', c.size());
  return c.sum().multiply(3600 * 10).rename(name);
}

// --- niveles de presión con ERA5: z500 = z1000 (de la presión a nivel del mar) + espesor 1000-500 hPa ---
function upperERA5(iso, withJet) {
  var i = hourImg(PL, iso), k = tag(iso);
  var tv = LEV.map(function (p) {
    return i.select('temperature_' + p + 'hPa').multiply(i.select('specific_humidity_' + p + 'hPa').multiply(0.608).add(1));
  });
  var thk = ee.Image(0);
  for (var j = 0; j < LEV.length - 1; j++) thk = thk.add(tv[j].add(tv[j + 1]).multiply(0.5 * RD / G0 * Math.log(LEV[j] / LEV[j + 1])));
  var z1000 = hourImg(SL, iso).select('mean_sea_level_pressure').divide(100000).log().multiply(tv[0]).multiply(RD / G0);
  var b = [];
  if (withJet) b = [z1000.add(thk).rename('z5' + k),
    i.select('temperature_500hPa').subtract(273.15).multiply(10).rename('t5' + k),
    i.select('u_component_of_wind_500hPa').multiply(100).rename('u5' + k),
    i.select('v_component_of_wind_500hPa').multiply(100).rename('v5' + k),
    i.select('u_component_of_wind_250hPa').multiply(100).rename('u2' + k),
    i.select('v_component_of_wind_250hPa').multiply(100).rename('v2' + k)];
  return ee.Image.cat(b.concat([
    i.select('temperature_850hPa').subtract(273.15).multiply(10).rename('t8' + k),
    i.select('u_component_of_wind_850hPa').multiply(100).rename('u8' + k),
    i.select('v_component_of_wind_850hPa').multiply(100).rename('v8' + k)]));
}
// --- niveles de presión con MERRA-2 (medias horarias: se promedian las dos horas que rodean al instante) ---
function upperMERRA(iso, withJet) {
  var d = ee.Date(iso), k = tag(iso);
  var i = M2.filterDate(d.advance(-1, 'hour'), d.advance(1, 'hour'))
    .map(function (im) { return im.resample('bilinear'); }).mean(); // interpolación bilineal de 0,5° × 0,625° a 0,25°
  var b = [];
  if (withJet) b = [i.select('H500').rename('z5' + k),
    i.select('T500').subtract(273.15).multiply(10).rename('t5' + k),
    i.select('U500').multiply(100).rename('u5' + k), i.select('V500').multiply(100).rename('v5' + k),
    i.select('U250').multiply(100).rename('u2' + k), i.select('V250').multiply(100).rename('v2' + k)];
  return ee.Image.cat(b.concat([
    i.select('T850').subtract(273.15).multiply(10).rename('t8' + k),
    i.select('U850').multiply(100).rename('u8' + k), i.select('V850').multiply(100).rename('v8' + k)]));
}
function upperSource(times, label) {
  if (hasAll(PL, times)) { print(label + ': niveles de presión de ERA5'); return 'era5'; }
  if (hasAll(M2, times)) { print(label + ': ERA5 no tiene esas horas en niveles de presión; se usa MERRA-2'); return 'merra2'; }
  print(label + ': AVISO, ni ERA5 ni MERRA-2 tienen esas horas en niveles de presión; no se exporta la altura');
  return null;
}
function exp(img, name, region, g) {
  Export.image.toDrive({image: img.round().toInt16(), description: name, folder: 'GEE_tema3', fileNamePrefix: name,
    region: region, crs: g.crs, crsTransform: g.crsTransform, fileFormat: 'GeoTIFF', maxPixels: 1e9});
}

// ===================== A) DANA, 29-10-2024 =====================
var DANA = ['2024-10-28T12:00:00', '2024-10-29T00:00:00', '2024-10-29T06:00:00', '2024-10-29T12:00:00', '2024-10-29T18:00:00', '2024-10-30T00:00:00'];
var regDana = ee.Geometry.Rectangle([-20, 26, 12, 50], null, false);
var gDana = grid(SL, DANA[3], 'mean_sea_level_pressure');
print('Rejilla de exportación', gDana.crsTransform);
if (!hasAll(SL, DANA)) print('DANA: AVISO, faltan horas de ERA5 en superficie');
var danaSup = ee.Image.cat(DANA.map(surf));
var danaPre = ee.Image.cat([
  precip('2024-10-29T00:00:00', 24, 'r24'),
  precip('2024-10-29T00:00:00', 6, 'r6a'), precip('2024-10-29T06:00:00', 6, 'r6b'),
  precip('2024-10-29T12:00:00', 6, 'r6c'), precip('2024-10-29T18:00:00', 6, 'r6d')]);
exp(danaSup, 'dana_superficie', regDana, gDana);
exp(danaPre, 'dana_precip', regDana, gDana);
var srcDana = upperSource(DANA, 'DANA');
var danaAlt = null;
if (srcDana) {
  danaAlt = ee.Image.cat(DANA.map(function (t) { return srcDana === 'era5' ? upperERA5(t, true) : upperMERRA(t, true); }));
  exp(danaAlt, 'dana_altura_' + srcDana, regDana, gDana);
}

// ===================== B) Viento sur en Bilbao, febrero de 2026 =====================
var VS = [];
for (var h = 0; h <= 60; h += 3) VS.push(new Date(Date.UTC(2026, 1, 23, 12 + h)).toISOString().slice(0, 19));
var regVS = ee.Geometry.Rectangle([-25, 36, 10, 58], null, false);
var gVS = grid(SL, VS[6], 'mean_sea_level_pressure');
if (!hasAll(SL, VS)) print('Viento sur: AVISO, faltan horas de ERA5 en superficie');
var vsSup = ee.Image.cat(VS.map(function (iso) {
  var i = hourImg(SL, iso), k = tag(iso);
  return ee.Image.cat([surf(iso),
    i.select('temperature_2m').subtract(273.15).multiply(10).rename('t' + k),
    i.select('dewpoint_temperature_2m').subtract(273.15).multiply(10).rename('d' + k)]);
}));
exp(vsSup, 'vsur_superficie', regVS, gVS);
var srcVS = upperSource(VS, 'Viento sur');
if (srcVS) {
  var vsAlt = ee.Image.cat(VS.map(function (t) { return srcVS === 'era5' ? upperERA5(t, false) : upperMERRA(t, false); }));
  exp(vsAlt, 'vsur_altura_' + srcVS, regVS, gVS);
}

// Serie horaria en cinco observatorios (valores de la celda ERA5 que los contiene)
var PTS = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-2.906, 43.301]), {sitio: 'Bilbao'}),
  ee.Feature(ee.Geometry.Point([-3.620, 42.356]), {sitio: 'Burgos'}),
  ee.Feature(ee.Geometry.Point([-2.733, 42.872]), {sitio: 'Vitoria'}),
  ee.Feature(ee.Geometry.Point([-2.041, 43.307]), {sitio: 'Donostia'}),
  ee.Feature(ee.Geometry.Point([-3.820, 43.427]), {sitio: 'Santander'})]);
var BANDS = ['mean_sea_level_pressure', 'u_component_of_wind_10m', 'v_component_of_wind_10m', 'temperature_2m',
  'dewpoint_temperature_2m', 'mean_total_precipitation_rate', 'total_cloud_cover', 'instantaneous_10m_wind_gust'];
var rows = SL.filterDate('2026-02-23T00:00:00', '2026-02-26T12:00:00').select(BANDS).map(function (img) {
  return img.reduceRegions({collection: PTS, reducer: ee.Reducer.first(), crs: gVS.crs, crsTransform: gVS.crsTransform})
    .map(function (f) { return f.set('hora_utc', img.date().format('YYYY-MM-dd HH:mm')); });
}).flatten();
print('Filas de la serie (deben ser 420):', rows.size());
Export.table.toDrive({collection: rows, description: 'vsur_series', folder: 'GEE_tema3', fileNamePrefix: 'vsur_series',
  fileFormat: 'CSV', selectors: ['sitio', 'hora_utc'].concat(BANDS)});

// --- Vista previa -----------------------------------------------------------
Map.setCenter(-4, 41, 5);
Map.addLayer(danaPre.select('r24'), {min: 0, max: 1500, palette: ['#ffffff', '#9ecae1', '#3182bd', '#31a354', '#fdae6b', '#de2d26', '#54278f']}, 'DANA: precipitación del 29-10-2024 (décimas de mm)');
if (danaAlt) Map.addLayer(danaAlt.select('z5102912'), {min: 5500, max: 5900, palette: ['#3b4cc0', '#f7f7f7', '#b40426']}, 'DANA: altura de 500 hPa, 29-10 12 UTC (m)', false);
Map.addLayer(vsSup.select('t022415'), {min: 0, max: 280, palette: ['#2c7bb6', '#ffffbf', '#d7191c']}, 'Viento sur: temperatura 24-02 15 UTC (décimas de °C)', false);
