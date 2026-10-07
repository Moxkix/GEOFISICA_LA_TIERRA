// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · Hielo marino (corrección)
// Lanza UNA exportación a Google Drive (carpeta GEE_tema4), en enteros de 16 bits:
//   oisst_hielo_1deg.tif   concentración media de hielo marino 1991-2020, mes a mes (i01…i12, en %)
//                          (NOAA OISST v2.1, diario 0,25°)
// Por qué: en OISST la banda «ice» no tiene dato (está enmascarada) los días sin hielo. La media de
// tema4_superficie.js promediaba solo los días con hielo y exageraba su extensión. Aquí los días
// sin hielo cuentan como 0 %.
// =====================================================================

var pad = function (m) { return m < 10 ? '0' + m : '' + m; };
var oi = ee.ImageCollection('NOAA/CDR/OISST/V2_1').filter(ee.Filter.calendarRange(1991, 2020, 'year'))
  .map(function (img) { return img.select('ice').unmask(0); });
var I = [];
for (var m = 1; m <= 12; m++) I.push(oi.filter(ee.Filter.calendarRange(m, m, 'month')).mean().rename('i' + pad(m)));
Export.image.toDrive({image: ee.Image.cat(I).round().toInt16(), description: 'oisst_hielo_1deg', folder: 'GEE_tema4',
  fileNamePrefix: 'oisst_hielo_1deg', region: ee.Geometry.Rectangle([-180, -90, 180, 90], null, false),
  crs: 'EPSG:4326', crsTransform: [1, 0, -180, 0, -1, 90], fileFormat: 'GeoTIFF', maxPixels: 1e10});
print('Lanza la tarea oisst_hielo_1deg desde la pestaña Tasks (botón RUN).');
