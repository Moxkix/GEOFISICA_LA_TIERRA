// =====================================================================
// Geografía General I (UNED) · Tema 2 · Isotermas mundiales
// Climatología ERA5 1991-2020 de la temperatura a 2 m + altitud de la celda
//
// Exporta a Google Drive (carpeta GEE_tema2) un GeoTIFF de 13 bandas a 1°:
//   t01 … t12  temperatura media mensual a 2 m (°C), periodo 1991-2020
//   elev       altitud media de la celda (m, el mar cuenta como 0), de ETOPO1
//              (superficie del hielo), para reducir al nivel del mar en el hub
//
// Notas
// · ECMWF/ERA5/MONTHLY termina en junio de 2020; los meses de julio a
//   diciembre de 2020 se completan con la media de ECMWF/ERA5/HOURLY, de modo
//   que cada mes promedia exactamente 30 años.
// · Las medias se agregan de 0,25° a 1° promediando (no por vecino más próximo).
// =====================================================================

var START = 1991, END = 2020;
var FINE = {crs: 'EPSG:4326', crsTransform: [0.25, 0, -180, 0, -0.25, 90]};
var GRID = {crs: 'EPSG:4326', crsTransform: [1, 0, -180, 0, -1, 90]};
var GLOBE = ee.Geometry.Rectangle([-180, -90, 180, 90], null, false);

var monthly = ee.ImageCollection('ECMWF/ERA5/MONTHLY').select('mean_2m_air_temperature');
var hourly  = ee.ImageCollection('ECMWF/ERA5/HOURLY').select('temperature_2m');
var era5proj = monthly.first().projection();

// Promedia una imagen de 0,25° a la rejilla de 1°
function toGrid(img) {
  return img.setDefaultProjection(era5proj)
    .reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 64})
    .reproject(GRID);
}

// --- Climatología mensual -------------------------------------------------
var bands = [];
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
  var tC = col.mean().subtract(273.15);
  bands.push(toGrid(tC).rename(m < 10 ? 't0' + m : 't' + m));
}

// --- Altitud media de la celda (ETOPO1, superficie del hielo; mar = 0) ------
var etopo = ee.Image('NOAA/NGDC/ETOPO1').select('ice_surface').max(0);
var elev = etopo
  .reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 256})
  .reproject(FINE)
  .reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 64})
  .reproject(GRID)
  .rename('elev');

var clim = ee.Image.cat(bands).addBands(elev).toFloat();

// --- Vista previa -----------------------------------------------------------
var pal = ['#2c1b6b', '#2b4ea2', '#3f8fc5', '#8cc8d6', '#e8edc8', '#f6c36b', '#ea7d3c', '#b8312b', '#6b0f1a'];
Map.addLayer(clim.select('t01'), {min: -45, max: 35, palette: pal}, 'Enero (°C)');
Map.addLayer(clim.select('t07'), {min: -45, max: 35, palette: pal}, 'Julio (°C)', false);
Map.addLayer(clim.select('elev'), {min: 0, max: 4000}, 'Altitud de la celda (m)', false);
print('Bandas exportadas:', clim.bandNames());

// --- Exportación --------------------------------------------------------------
Export.image.toDrive({
  image: clim,
  description: 'era5_t2m_clim_1991_2020_1deg',
  folder: 'GEE_tema2',
  fileNamePrefix: 'era5_t2m_clim_1991_2020_1deg',
  region: GLOBE,
  crs: GRID.crs,
  crsTransform: GRID.crsTransform,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e9
});
