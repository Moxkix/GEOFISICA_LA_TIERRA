// =====================================================================
// Geografía General I (UNED) · Tema 3 · Presión, vientos y precipitación
// Climatología mensual ERA5 1991-2020 (enero-junio: 30 años; julio-diciembre:
// 29 años, porque ECMWF/ERA5/MONTHLY termina en junio de 2020)
//
// Lanza DOS exportaciones a Google Drive (carpeta GEE_tema3), en enteros de 16 bits:
//   era5_pres_viento_1deg.tif  36 bandas, rejilla de 1°:
//        p01…p12  presión media a nivel del mar, en DÉCIMAS de hPa
//        u01…u12  viento a 10 m, componente oeste-este, en CENTÉSIMAS de m/s
//        v01…v12  viento a 10 m, componente sur-norte, en CENTÉSIMAS de m/s
//   era5_precip_05deg.tif      12 bandas, rejilla de 0,5°:
//        r01…r12  precipitación media mensual, en DÉCIMAS de mm
//
// Solo usa la serie mensual (sin ECMWF/ERA5/HOURLY) y no reproyecta ni agrega:
// se exporta por muestreo directo de la rejilla de 0,25°, y data/tema3/make_clima.py
// calcula después las medias por celdas.
// =====================================================================

var START = 1991, END = 2020;
var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);

var era5 = ee.ImageCollection('ECMWF/ERA5/MONTHLY')
  .filter(ee.Filter.calendarRange(START, END, 'year'));
print('Proyección nativa de ERA5 mensual:', era5.first().projection());

var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
var P = [], U = [], V = [], R = [];
for (var m = 1; m <= 12; m++) {
  var col = era5.filter(ee.Filter.calendarRange(m, m, 'month'));
  print('Mes ' + m + ' · años promediados:', col.size());
  var mean = col.mean();
  P.push(mean.select('mean_sea_level_pressure').divide(10).rename('p' + pad(m)));   // Pa → décimas de hPa
  U.push(mean.select('u_component_of_wind_10m').multiply(100).rename('u' + pad(m)));
  V.push(mean.select('v_component_of_wind_10m').multiply(100).rename('v' + pad(m)));
  R.push(mean.select('total_precipitation').multiply(10000).rename('r' + pad(m))); // m → décimas de mm
}
var presViento = ee.Image.cat(P.concat(U, V)).round().toInt16();
var precip = ee.Image.cat(R).round().toInt16();

// --- Vista previa -----------------------------------------------------------
Map.addLayer(ee.Image.cat(P).select('p01').divide(10), {min: 990, max: 1035, palette: ['#3b4cc0', '#f7f7f7', '#b40426']}, 'Presión enero (hPa)');
Map.addLayer(ee.Image.cat(P).select('p07').divide(10), {min: 990, max: 1035, palette: ['#3b4cc0', '#f7f7f7', '#b40426']}, 'Presión julio (hPa)', false);
Map.addLayer(ee.Image.cat(R).select('r07').divide(10), {min: 0, max: 400, palette: ['#fff7e6', '#a6d96a', '#1a9850', '#2166ac', '#542788']}, 'Precipitación julio (mm)', false);

// --- Exportaciones ------------------------------------------------------------
Export.image.toDrive({
  image: presViento, description: 'era5_pres_viento_1deg', folder: 'GEE_tema3',
  fileNamePrefix: 'era5_pres_viento_1deg', region: GLOBE,
  crs: 'EPSG:4326', crsTransform: [1, 0, -180, 0, -1, 90], fileFormat: 'GeoTIFF', maxPixels: 1e9
});
Export.image.toDrive({
  image: precip, description: 'era5_precip_05deg', folder: 'GEE_tema3',
  fileNamePrefix: 'era5_precip_05deg', region: GLOBE,
  crs: 'EPSG:4326', crsTransform: [0.5, 0, -180, 0, -0.5, 90], fileFormat: 'GeoTIFF', maxPixels: 1e9
});
