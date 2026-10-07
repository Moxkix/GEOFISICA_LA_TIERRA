// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · Datos de superficie
// Lanza CUATRO exportaciones a Google Drive (carpeta GEE_tema4), en enteros de 16 bits:
//   oisst_clima_1deg.tif   SST media mensual 1991-2020 (t01…t12, centésimas de °C) y
//                          concentración de hielo marino en marzo y septiembre (i03, i09, centésimas de %)
//                          (NOAA OISST v2.1, diario 0,25°)
//   oisst_anomalias_1deg.tif  anomalía de la SST respecto a 1991-2020 en meses señalados
//                          (a199712, a201012, a201512, a202312, a202308; centésimas de °C)
//   modis_clorofila_05deg.tif clorofila a, media mensual 2003-2022 de log10(mg/m³) × 1000
//                          (c01…c12) (NASA MODIS-Aqua, diario 4,6 km)
//   ciaran_era5.tif        borrasca Ciarán, 1-3 de noviembre de 2023, cada 3 h: presión a nivel del
//                          mar (décimas de hPa) y viento a 10 m (centésimas de m/s) (ERA5 horario)
// Los píxeles sin dato (tierra, hielo, nubes) se exportan como -32768.
// La evaporación y la precipitación (MERRA-2) se exportan aparte: gee/tema4_merra2.js.
// =====================================================================

var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
function exp(img, name, tr, region) {
  Export.image.toDrive({image: img.round().unmask(-32768).toInt16(), description: name, folder: 'GEE_tema4',
    fileNamePrefix: name, region: region || GLOBE, crs: 'EPSG:4326', crsTransform: tr, fileFormat: 'GeoTIFF', maxPixels: 1e10});
}
var byMonth = function (col, m) { return col.filter(ee.Filter.calendarRange(m, m, 'month')); };

// ---------- 1) NOAA OISST: climatología 1991-2020 ----------
// Los valores de OISST están guardados en centésimas (escala 0,01): se conservan así.
var oi = ee.ImageCollection('NOAA/CDR/OISST/V2_1').filter(ee.Filter.calendarRange(1991, 2020, 'year'));
var SST = [];
for (var m = 1; m <= 12; m++) SST.push(byMonth(oi, m).select('sst').mean().rename('t' + pad(m)));
var ice = [byMonth(oi, 3).select('ice').mean().rename('i03'), byMonth(oi, 9).select('ice').mean().rename('i09')];
var climSST = ee.Image.cat(SST);
exp(ee.Image.cat(SST.concat(ice)), 'oisst_clima_1deg', [1, 0, -180, 0, -1, 90]);

// Anomalías de meses señalados (El Niño 1997 y 2015, La Niña 2010, El Niño 2023 y el agosto récord de 2023)
var oiAll = ee.ImageCollection('NOAA/CDR/OISST/V2_1').select('sst');
var ANOM = [[1997, 12], [2010, 12], [2015, 12], [2023, 12], [2023, 8]];
var anom = ee.Image.cat(ANOM.map(function (ym) {
  var mean = oiAll.filter(ee.Filter.calendarRange(ym[0], ym[0], 'year')).filter(ee.Filter.calendarRange(ym[1], ym[1], 'month')).mean();
  return mean.subtract(climSST.select('t' + pad(ym[1]))).rename('a' + ym[0] + pad(ym[1]));
}));
exp(anom, 'oisst_anomalias_1deg', [1, 0, -180, 0, -1, 90]);

// ---------- 2) MODIS-Aqua: clorofila a 2003-2022 ----------
var chl = ee.ImageCollection('NASA/OCEANDATA/MODIS-Aqua/L3SMI').filter(ee.Filter.calendarRange(2003, 2022, 'year')).select('chlor_a');
var C = [];
for (var c = 1; c <= 12; c++) {
  C.push(byMonth(chl, c).map(function (i) { return i.max(0.001).log10(); }).mean().multiply(1000).rename('c' + pad(c)));
}
exp(ee.Image.cat(C), 'modis_clorofila_05deg', [0.5, 0, -180, 0, -0.5, 90]);

// ---------- 3) Borrasca Ciarán con ERA5 horario (presión y viento) ----------
var SL = ee.ImageCollection('ECMWF/ERA5/HOURLY');
var CI = [];
for (var h = 0; h <= 48; h += 3) CI.push(new Date(Date.UTC(2023, 10, 1, h)).toISOString().slice(0, 19));
var ciaran = ee.Image.cat(CI.map(function (iso) {
  var i = ee.Image(SL.filterDate(ee.Date(iso), ee.Date(iso).advance(1, 'hour')).first());
  var k = iso.slice(5, 7) + iso.slice(8, 10) + iso.slice(11, 13);
  return ee.Image.cat([i.select('mean_sea_level_pressure').divide(10).rename('p' + k),
    i.select('u_component_of_wind_10m').multiply(100).rename('u' + k),
    i.select('v_component_of_wind_10m').multiply(100).rename('v' + k)]);
}));
print('Horas de ERA5 para Ciarán (deben ser ' + CI.length + '):',
  ee.List(CI.map(function (t) { return SL.filterDate(ee.Date(t), ee.Date(t).advance(1, 'hour')).size(); })).reduce(ee.Reducer.sum()));
exp(ciaran, 'ciaran_era5', [0.25, 0, -180.125, 0, -0.25, 90.125], ee.Geometry.Rectangle([-40, 35, 10, 62], null, false));

// ---------- Vista previa ----------
Map.addLayer(climSST.select('t08').divide(100), {min: -2, max: 30, palette: ['#2c7bb6', '#abd9e9', '#ffffbf', '#fdae61', '#d7191c']}, 'SST agosto (°C)');
Map.addLayer(anom.select('a201512').divide(100), {min: -3, max: 3, palette: ['#2166ac', '#f7f7f7', '#b2182b']}, 'Anomalía diciembre 2015 (°C)', false);
Map.addLayer(ee.Image.cat(C).select('c07').divide(1000), {min: -1.5, max: 1, palette: ['#3d1a5c', '#2166ac', '#1a9850', '#d9ef8b']}, 'Clorofila julio (log10 mg/m³)', false);
