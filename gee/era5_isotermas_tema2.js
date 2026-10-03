// =====================================================================
// Geografía General I (UNED) · Tema 2 · Isotermas mundiales
// Climatología ERA5 1991-2020 de la temperatura a 2 m + altitud
//
// Lanza DOS exportaciones a Google Drive (carpeta GEE_tema2), ambas en una
// rejilla de 0,25° (1440 × 720 píxeles) y en enteros de 16 bits:
//   era5_t2m_clim_1991_2020_025deg.tif  12 bandas (t01 … t12): temperatura
//                                       media mensual a 2 m en DÉCIMAS de °C
//   etopo1_elev_025deg.tif              1 banda (elev): altitud en m (mar = 0),
//                                       de ETOPO1 (superficie del hielo)
//
// Notas
// · Solo se usa ECMWF/ERA5/MONTHLY, que en Earth Engine termina en junio de
//   2020: enero-junio promedian 30 años (1991-2020) y julio-diciembre 29
//   (1991-2019). El efecto en el mapa es de centésimas de grado.
// · No se usa ECMWF/ERA5/HOURLY para completar 2020: es el origen más probable
//   del error «Unable to transform edge» en la exportación global.
// · Tampoco se agrega ni se reproyecta en Earth Engine: la media por celdas
//   de 2° la calcula después data/tema2/make_grid.py.
// =====================================================================

var START = 1991, END = 2020;
var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);
var OUT = {crs: 'EPSG:4326', crsTransform: [0.25, 0, -180, 0, -0.25, 90]};

var monthly = ee.ImageCollection('ECMWF/ERA5/MONTHLY')
  .select('mean_2m_air_temperature')
  .filter(ee.Filter.calendarRange(START, END, 'year'));
print('Proyección nativa de ERA5 mensual:', monthly.first().projection());

// --- Climatología mensual (°C) --------------------------------------------
var bandsC = [];
for (var m = 1; m <= 12; m++) {
  var col = monthly.filter(ee.Filter.calendarRange(m, m, 'month'));
  print('Mes ' + m + ' · años promediados (30 en ene-jun, 29 en jul-dic):', col.size());
  bandsC.push(col.mean().subtract(273.15).rename(m < 10 ? 't0' + m : 't' + m));
}
var tempC = ee.Image.cat(bandsC);

// --- Altitud (ETOPO1, superficie del hielo; mar = 0) --------------------------
var elev = ee.Image('NOAA/NGDC/ETOPO1').select('ice_surface').max(0).rename('elev');

// --- Vista previa -----------------------------------------------------------
var pal = ['#2c1b6b', '#2b4ea2', '#3f8fc5', '#8cc8d6', '#e8edc8', '#f6c36b', '#ea7d3c', '#b8312b', '#6b0f1a'];
Map.addLayer(tempC.select('t01'), {min: -45, max: 35, palette: pal}, 'Enero (°C)');
Map.addLayer(tempC.select('t07'), {min: -45, max: 35, palette: pal}, 'Julio (°C)', false);
Map.addLayer(elev, {min: 0, max: 4000}, 'Altitud (m)', false);

// --- Exportaciones (enteros de 16 bits: décimas de °C y metros) ---------------
Export.image.toDrive({
  image: tempC.multiply(10).round().toInt16(),
  description: 'era5_t2m_clim_1991_2020_025deg',
  folder: 'GEE_tema2',
  fileNamePrefix: 'era5_t2m_clim_1991_2020_025deg',
  region: GLOBE, crs: OUT.crs, crsTransform: OUT.crsTransform,
  fileFormat: 'GeoTIFF', maxPixels: 1e9
});
Export.image.toDrive({
  image: elev.round().toInt16(),
  description: 'etopo1_elev_025deg',
  folder: 'GEE_tema2',
  fileNamePrefix: 'etopo1_elev_025deg',
  region: GLOBE, crs: OUT.crs, crsTransform: OUT.crsTransform,
  fileFormat: 'GeoTIFF', maxPixels: 1e9
});
