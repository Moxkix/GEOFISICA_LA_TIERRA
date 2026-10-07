// =====================================================================
// Geografía General I (UNED) · Tema 3 · Dos casos reales con ERA5 horario
//   A) DANA del 29 de octubre de 2024 (Valencia)
//   B) Viento sur en Bilbao, 23-26 de febrero de 2026 (27,1 °C el día 24,
//      récord invernal del aeropuerto desde 1948) y paso del frente frío
//
// Lanza SEIS exportaciones a Google Drive (carpeta GEE_tema3). Rejillas en
// enteros de 16 bits; horas en UTC. Cada producto va en un archivo separado para
// que un fallo en uno no impida los demás.
//   dana_superficie.tif   6 horas × (p, u, v)
//   dana_precip.tif       precipitación del día 29 (24 h y cuatro tramos de 6 h)
//   dana_altura.tif       6 horas × (thk, tv1000, t500, u500, v500, u250, v250, t850, u850, v850)
//   vsur_superficie.tif  21 horas (cada 3 h, del 23 a las 12 al 26 a las 00) × (p, u, v, t, td)
//   vsur_altura.tif      21 horas × (t850, u850, v850)
//   vsur_series.csv       serie horaria en Bilbao, Burgos, Vitoria, Donostia y Santander
// Unidades: p en décimas de hPa; u, v en centésimas de m/s; t, td, tv en décimas
// de °C; precipitación en décimas de mm; thk (espesor 1000-500 hPa) en metros.
// La altura de 500 hPa se calcula después: z500 = z1000 + espesor, con z1000
// deducida de la presión a nivel del mar (data/tema3/make_casos.py).
// =====================================================================

var SL = ee.ImageCollection('ECMWF/ERA5/HOURLY');
var PL = ee.ImageCollection('ECMWF/ERA5/HOURLY_PRESSURE_LEVELS');
var LEV = [1000, 975, 950, 925, 900, 875, 850, 825, 800, 775, 750, 700, 650, 600, 550, 500];

// Rejilla nativa de ERA5, leída de una sola banda (no todas las bandas comparten proyección).
// Si no es la de 0,25° en EPSG:4326, se usa la rejilla estándar.
function grid(col, day, band) {
  var p = ee.Image(col.filterDate(day, ee.Date(day).advance(1, 'day')).first()).select(band).projection().getInfo();
  var t = p.transform;
  if (p.crs !== 'EPSG:4326' || !t || Math.abs(t[0] - 0.25) > 1e-6) t = [0.25, 0, -180, 0, -0.25, 90];
  print('Rejilla usada (' + band + ')', p.crs, t);
  return {crs: 'EPSG:4326', crsTransform: t};
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
function thickness(i) { // espesor 1000-500 hPa con temperatura virtual (m)
  var tv = LEV.map(function (p) {
    return i.select('temperature_' + p + 'hPa').multiply(i.select('specific_humidity_' + p + 'hPa').multiply(0.608).add(1));
  });
  var thk = tv[0].add(tv[1]).multiply(0.5 * 287.05 / 9.80665 * Math.log(LEV[0] / LEV[1]));
  for (var k = 1; k < LEV.length - 1; k++) {
    thk = thk.add(tv[k].add(tv[k + 1]).multiply(0.5 * 287.05 / 9.80665 * Math.log(LEV[k] / LEV[k + 1])));
  }
  return {thk: thk, tv1000: tv[0]};
}
function upper(iso, withJet) {
  var i = hourImg(PL, iso), k = tag(iso), h = thickness(i);
  var b = [h.thk.rename('thk' + k), h.tv1000.subtract(273.15).multiply(10).rename('tv' + k)];
  if (withJet) {
    b = b.concat([
      i.select('temperature_500hPa').subtract(273.15).multiply(10).rename('t5' + k),
      i.select('u_component_of_wind_500hPa').multiply(100).rename('u5' + k),
      i.select('v_component_of_wind_500hPa').multiply(100).rename('v5' + k),
      i.select('u_component_of_wind_250hPa').multiply(100).rename('u2' + k),
      i.select('v_component_of_wind_250hPa').multiply(100).rename('v2' + k)]);
  }
  return ee.Image.cat(b.concat([
    i.select('temperature_850hPa').subtract(273.15).multiply(10).rename('t8' + k),
    i.select('u_component_of_wind_850hPa').multiply(100).rename('u8' + k),
    i.select('v_component_of_wind_850hPa').multiply(100).rename('v8' + k)]));
}
function exp(img, name, region, g) {
  Export.image.toDrive({image: img.round().toInt16(), description: name, folder: 'GEE_tema3', fileNamePrefix: name,
    region: region, crs: g.crs, crsTransform: g.crsTransform, fileFormat: 'GeoTIFF', maxPixels: 1e9});
}

// ===================== A) DANA, 29-10-2024 =====================
var DANA = ['2024-10-28T12:00:00', '2024-10-29T00:00:00', '2024-10-29T06:00:00', '2024-10-29T12:00:00', '2024-10-29T18:00:00', '2024-10-30T00:00:00'];
var regDana = ee.Geometry.Rectangle([-20, 26, 12, 50], null, false);
var gSL = grid(SL, '2024-10-29', 'mean_sea_level_pressure'), gPL = grid(PL, '2024-10-29', 'temperature_500hPa');
var danaSup = ee.Image.cat(DANA.map(surf));
var danaPre = ee.Image.cat([
  precip('2024-10-29T00:00:00', 24, 'r24'),
  precip('2024-10-29T00:00:00', 6, 'r6a'), precip('2024-10-29T06:00:00', 6, 'r6b'),
  precip('2024-10-29T12:00:00', 6, 'r6c'), precip('2024-10-29T18:00:00', 6, 'r6d')]);
var danaAlt = ee.Image.cat(DANA.map(function (t) { return upper(t, true); }));
exp(danaSup, 'dana_superficie', regDana, gSL);
exp(danaPre, 'dana_precip', regDana, gSL);
exp(danaAlt, 'dana_altura', regDana, gPL);

// ===================== B) Viento sur en Bilbao, febrero de 2026 =====================
var VS = [];
for (var h = 0; h <= 60; h += 3) VS.push(new Date(Date.UTC(2026, 1, 23, 12 + h)).toISOString().slice(0, 19));
var regVS = ee.Geometry.Rectangle([-25, 36, 10, 58], null, false);
var gSL2 = grid(SL, '2026-02-24', 'mean_sea_level_pressure'), gPL2 = grid(PL, '2026-02-24', 'temperature_500hPa');
var vsSup = ee.Image.cat(VS.map(function (iso) {
  var i = hourImg(SL, iso), k = tag(iso);
  return ee.Image.cat([surf(iso),
    i.select('temperature_2m').subtract(273.15).multiply(10).rename('t' + k),
    i.select('dewpoint_temperature_2m').subtract(273.15).multiply(10).rename('d' + k)]);
}));
var vsAlt = ee.Image.cat(VS.map(function (t) { return upper(t, false).select(['t8.*', 'u8.*', 'v8.*']); }));
exp(vsSup, 'vsur_superficie', regVS, gSL2);
exp(vsAlt, 'vsur_altura', regVS, gPL2);

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
  return img.reduceRegions({collection: PTS, reducer: ee.Reducer.first(), crs: gSL2.crs, crsTransform: gSL2.crsTransform})
    .map(function (f) { return f.set('hora_utc', img.date().format('YYYY-MM-dd HH:mm')); });
}).flatten();
print('Filas de la serie (deben ser 420):', rows.size());
Export.table.toDrive({collection: rows, description: 'vsur_series', folder: 'GEE_tema3', fileNamePrefix: 'vsur_series',
  fileFormat: 'CSV', selectors: ['sitio', 'hora_utc'].concat(BANDS)});

// --- Vista previa -----------------------------------------------------------
Map.setCenter(-4, 41, 5);
Map.addLayer(danaPre.select('r24'), {min: 0, max: 1500, palette: ['#ffffff', '#9ecae1', '#3182bd', '#31a354', '#fdae6b', '#de2d26', '#54278f']}, 'DANA: precipitación del 29-10-2024 (décimas de mm)');
Map.addLayer(danaAlt.select('thk102912'), {min: 5300, max: 5700, palette: ['#3b4cc0', '#f7f7f7', '#b40426']}, 'DANA: espesor 1000-500 hPa, 29-10 12 UTC (m)', false);
Map.addLayer(vsSup.select('t022415'), {min: 0, max: 280, palette: ['#2c7bb6', '#ffffbf', '#d7191c']}, 'Viento sur: temperatura 24-02 15 UTC (décimas de °C)', false);
