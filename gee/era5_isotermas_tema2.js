// =====================================================================
// Geografía General I (UNED) · Tema 2 · Isotermas mundiales
// Climatología ERA5 1991-2020 de la temperatura a 2 m + altitud
//
// Exporta a Google Drive (carpeta GEE_tema2) un GeoTIFF de 13 bandas en la
// rejilla nativa de ERA5 (0,25°; 1440 × 720 píxeles; enteros de 16 bits):
//   t01 … t12  temperatura media mensual a 2 m, en DÉCIMAS de °C, 1991-2020
//   elev       altitud en m (el mar cuenta como 0), de ETOPO1 (superficie
//              del hielo), para reducir al nivel del mar en el hub
//
// Notas
// · ECMWF/ERA5/MONTHLY termina en junio de 2020; los meses de julio a
//   diciembre de 2020 se completan con la media de ECMWF/ERA5/HOURLY, de modo
//   que cada mes promedia exactamente 30 años.
// · No se reproyecta ni se agrega en Earth Engine: reduceResolution() sobre la
//   rejilla global en EPSG:4326 provoca el error «Unable to transform edge».
//   La media por celdas de 2° la calcula después data/tema2/make_grid.py.
// =====================================================================

var START = 1991, END = 2020;
var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);

var monthly = ee.ImageCollection('ECMWF/ERA5/MONTHLY').select('mean_2m_air_temperature');
var hourly  = ee.ImageCollection('ECMWF/ERA5/HOURLY').select('temperature_2m');

// --- Climatología mensual (°C) --------------------------------------------
var bandsC = [];
for (var m = 1; m <= 12; m++) {
  var col = monthly
    .filter(ee.Filter.calendarRange(START, END, 'year'))
    .filter(ee.Filter.calendarRange(m, m, 'month'));
  if (m >= 7) {
    var d0 = ee.Date.fromYMD(2020, m, 1);
    var h = hourly.filterDate(d0, d0.advance(1, 'month')).mean()
      .rename('mean_2m_air_temperature');
    col = col.merge(ee.ImageCollection([h]));
  }
  print('Mes ' + m + ' · años promediados (deben ser 30):', col.size());
  bandsC.push(col.mean().subtract(273.15).rename(m < 10 ? 't0' + m : 't' + m));
}
var tempC = ee.Image.cat(bandsC);

// --- Altitud (ETOPO1, superficie del hielo; mar = 0) --------------------------
var elev = ee.Image('NOAA/NGDC/ETOPO1').select('ice_surface').max(0).rename('elev');

// Enteros de 16 bits: décimas de °C y metros (archivo más pequeño, sin pérdida útil)
var clim = tempC.multiply(10).round().addBands(elev.round()).toInt16();

// --- Vista previa -----------------------------------------------------------
var pal = ['#2c1b6b', '#2b4ea2', '#3f8fc5', '#8cc8d6', '#e8edc8', '#f6c36b', '#ea7d3c', '#b8312b', '#6b0f1a'];
Map.addLayer(tempC.select('t01'), {min: -45, max: 35, palette: pal}, 'Enero (°C)');
Map.addLayer(tempC.select('t07'), {min: -45, max: 35, palette: pal}, 'Julio (°C)', false);
Map.addLayer(elev, {min: 0, max: 4000}, 'Altitud (m)', false);
print('Bandas exportadas:', clim.bandNames());

// --- Exportación (rejilla de 0,25° alineada con -180 / 90) ---------------------
Export.image.toDrive({
  image: clim,
  description: 'era5_t2m_clim_1991_2020_025deg',
  folder: 'GEE_tema2',
  fileNamePrefix: 'era5_t2m_clim_1991_2020_025deg',
  region: GLOBE,
  crs: 'EPSG:4326',
  crsTransform: [0.25, 0, -180, 0, -0.25, 90],
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});
