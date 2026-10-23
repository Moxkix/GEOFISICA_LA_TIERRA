// =====================================================================
// Geografía General I (UNED) · Tema 6 · Los climas zonales y sus paisajes
// Biomas del mundo (RESOLVE Ecoregions 2017; Dinerstein y otros, 2017; CC BY 4.0) en la MISMA rejilla de 0,5°
// que los mapas de Köppen del Tema 5 (TerraClimate), para comparar celda a celda clima y vegetación.
//
// Lanza UNA exportación a Google Drive (carpeta GEE_tema6), en enteros de 16 bits (-32768 = sin dato):
//   biomas_mundo.tif  rejilla de 0,5° (84° N - 60° S), tres bandas:
//     BIOME  bioma dominante de la celda (BIOME_NUM de RESOLVE: 1-14; el resto, «Rock and Ice»)
//     MANG   fracción de la celda ocupada por ecorregiones de manglar (bioma 14), en milésimas
//     LAND   fracción de la celda ocupada por ecorregiones terrestres, en milésimas
//
// Es un cálculo ligero: se pintan los polígonos a 1/24° (la resolución nativa de TerraClimate)
// y se agregan en celdas de 12 × 12 píxeles. Tarda unos minutos y consume muy pocas EECU.
// =====================================================================

var ECO = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
print('Ecorregiones por bioma (BIOME_NUM):', ECO.aggregate_histogram('BIOME_NUM'));
print('Nombres de los biomas:', ECO.distinct(['BIOME_NUM', 'BIOME_NAME']).sort('BIOME_NUM').aggregate_array('BIOME_NAME'));

// misma rejilla que gee/tema5_terraclimate.js
var nat = ee.Image(ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE').first()).select('tmmx').projection().getInfo();
var CRS = nat.crs || 'EPSG:4326';
function grid(deg) {
  var t = nat.transform, k = Math.max(1, Math.round(deg / Math.abs(t[0])));
  return [t[0] * k, t[1], t[2], t[3], t[4] * k, t[5]];
}
var G05 = grid(0.5);
var MUNDO = ee.Geometry.Rectangle([-180, -60, 180, 84], null, false);

// biomas pintados a la resolución nativa (sin dato en el mar)
var bio = ee.Image().int16().paint(ECO, 'BIOME_NUM').rename('BIOME')
  .reproject({crs: CRS, crsTransform: nat.transform});
var up = function (img, reducer) {
  return img.reduceResolution({reducer: reducer, maxPixels: 256}).reproject({crs: CRS, crsTransform: G05});
};
var BIOME = up(bio, ee.Reducer.mode()).rename('BIOME');
var MANG = up(bio.eq(14).unmask(0), ee.Reducer.mean()).multiply(1000).rename('MANG');
var LAND = up(bio.mask().gt(0).unmask(0), ee.Reducer.mean()).multiply(1000).rename('LAND');

Export.image.toDrive({image: BIOME.addBands(MANG).addBands(LAND).round().unmask(-32768).toInt16(),
  description: 'biomas_mundo', folder: 'GEE_tema6', fileNamePrefix: 'biomas_mundo', region: MUNDO,
  crs: CRS, crsTransform: G05, fileFormat: 'GeoTIFF', maxPixels: 1e10});

// --- Vista previa -----------------------------------------------------------------------------------
Map.setCenter(10, 20, 2);
Map.addLayer(BIOME, {min: 1, max: 14, palette: ['1b7837', '7fbf7b', '5aae61', 'a6dba0', '4d9221', '2166ac', 'e6c74c', 'f6e8a6',
  '67a9cf', 'c2a5cf', '9ecae1', 'e08214', 'fdb863', 'b2182b']}, 'Bioma dominante (0,5°)');
Map.addLayer(MANG.selfMask(), {min: 0, max: 300, palette: ['fee0d2', 'a50f15']}, 'Manglares (milésimas de la celda)', false);
print('Lanza la tarea desde la pestaña Tasks (botón RUN).');
