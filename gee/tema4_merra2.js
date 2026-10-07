// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · Evaporación y precipitación (MERRA-2)
// Lanza UNA exportación a Google Drive (carpeta GEE_tema4), en enteros de 16 bits:
//   merra2_evap_prec_nativa.tif  evaporación y precipitación medias 1991-2020 (e01…e12, p01…p12;
//                                centésimas de mm/día) (NASA MERRA-2, horario; se toman 4 horas al día)
//
// Por qué va aparte y en la rejilla propia de MERRA-2 (0,625° × 0,5°)
// · Exportada en una rejilla de 1° (tema4_superficie.js), la tarea fallaba con
//   «Unable to transform edge … (Error code: 3)», el mismo error que dio ERA5 horario
//   en el tema 2: Earth Engine no consigue pasar los bordes de las teselas de la rejilla
//   de salida a la de estas colecciones horarias.
// · Aquí no se reproyecta nada: se exporta en la misma proyección y rejilla que los datos
//   de origen, y se dejan fuera los casquetes polares (más allá de 89°), donde las celdas
//   de MERRA-2 rebasan el polo. El paso a 1° lo hace después data/tema4/make_oceano.py.
// =====================================================================

var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
var byMonth = function (col, m) { return col.filter(ee.Filter.calendarRange(m, m, 'month')); };
var hours = ee.Filter.or(ee.Filter.calendarRange(0, 0, 'hour'), ee.Filter.calendarRange(6, 6, 'hour'),
  ee.Filter.calendarRange(12, 12, 'hour'), ee.Filter.calendarRange(18, 18, 'hour'));
var mf = ee.ImageCollection('NASA/GSFC/MERRA/flx/2').filter(ee.Filter.calendarRange(1991, 2020, 'year')).filter(hours)
  .select(['EVAP', 'PRECTOTCORR']);

// Proyección nativa (se lee de la primera imagen; se imprime en la consola para comprobarla)
var nat = ee.Image(mf.first()).select('EVAP').projection().getInfo();
print('Proyección nativa de MERRA-2 (crs y transform):', nat.crs, nat.transform);
print('Imágenes usadas (4 al día, 1991-2020; deben ser unas 43 800):', mf.size());

var E = [], P = [];
for (var k = 1; k <= 12; k++) {
  var mm = byMonth(mf, k).mean().multiply(86400 * 100); // kg/m²/s = mm/s → centésimas de mm/día
  E.push(mm.select('EVAP').rename('e' + pad(k)));
  P.push(mm.select('PRECTOTCORR').rename('p' + pad(k)));
}
var img = ee.Image.cat(E.concat(P));

Export.image.toDrive({image: img.round().unmask(-32768).toInt16(), description: 'merra2_evap_prec_nativa',
  folder: 'GEE_tema4', fileNamePrefix: 'merra2_evap_prec_nativa',
  region: ee.Geometry.Rectangle([-180, -89, 180, 89], null, false),
  crs: nat.crs, crsTransform: nat.transform, fileFormat: 'GeoTIFF', maxPixels: 1e10});

// ---------- Vista previa ----------
Map.addLayer(img.select('e07').subtract(img.select('p07')).divide(100), {min: -6, max: 6,
  palette: ['#2166ac', '#f7f7f7', '#b2182b']}, 'E − P julio (mm/día)');
