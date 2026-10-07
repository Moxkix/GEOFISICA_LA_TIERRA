// =====================================================================
// Geografía General I (UNED) · Tema 4 · Los océanos · Relieve para el nivel del mar y ciclones tropicales
// Lanza CUATRO exportaciones a Google Drive (carpeta GEE_tema4):
//   etopo_mundo_05deg.tif     altitud y profundidad (m), rejilla de 0,5° (ETOPO1, superficie del hielo)
//   etopo_iberia_0025deg.tif  lo mismo para la Península y Baleares (10° O - 4,5° E, 35,5° - 44° N), 0,025°
//   etopo_canarias_0025deg.tif lo mismo para Canarias (18,3° O - 13,3° O, 27,5° - 29,5° N), 0,025°
//   ibtracs_1991_2020.csv     trayectorias de los ciclones tropicales 1991-2020 (NOAA IBTrACS v4),
//                             trayectoria principal, puntos cada 6 h
// Las altitudes son medias de los píxeles de 1' de ETOPO1 que caen en cada celda.
// =====================================================================

var etopo = ee.Image('NOAA/NGDC/ETOPO1').select('ice_surface');
function expElev(name, res, region) {
  var img = etopo.reduceResolution({reducer: ee.Reducer.mean(), maxPixels: 1024})
    .reproject({crs: 'EPSG:4326', crsTransform: [res, 0, region[0], 0, -res, region[3]]});
  Export.image.toDrive({image: img.round().toInt16(), description: name, folder: 'GEE_tema4', fileNamePrefix: name,
    region: ee.Geometry.Rectangle(region, null, false), crs: 'EPSG:4326', crsTransform: [res, 0, region[0], 0, -res, region[3]],
    fileFormat: 'GeoTIFF', maxPixels: 1e10});
}
expElev('etopo_mundo_05deg', 0.5, [-180, -90, 180, 90]);
expElev('etopo_iberia_0025deg', 0.025, [-10, 35.5, 4.5, 44]);
expElev('etopo_canarias_0025deg', 0.025, [-18.3, 27.5, -13.3, 29.5]);

// ---------- Ciclones tropicales (IBTrACS) ----------
var ib = ee.FeatureCollection('NOAA/IBTrACS/v4');
print('Ejemplo de punto de IBTrACS:', ib.first());
var six = ee.Filter.or(ee.Filter.stringEndsWith('ISO_TIME', '00:00:00'), ee.Filter.stringEndsWith('ISO_TIME', '06:00:00'),
  ee.Filter.stringEndsWith('ISO_TIME', '12:00:00'), ee.Filter.stringEndsWith('ISO_TIME', '18:00:00'));
var pts = ib.filter(ee.Filter.rangeContains('SEASON', 1991, 2020)).filter(ee.Filter.eq('TRACK_TYPE', 'main')).filter(six)
  .map(function (f) {
    var c = f.geometry().coordinates();
    return f.set({lon: ee.Number(c.get(0)).multiply(100).round().divide(100), lat: ee.Number(c.get(1)).multiply(100).round().divide(100)})
      .setGeometry(null);
  });
print('Puntos de ciclones 1991-2020 (cada 6 h):', pts.size());
Export.table.toDrive({collection: pts, description: 'ibtracs_1991_2020', folder: 'GEE_tema4', fileNamePrefix: 'ibtracs_1991_2020',
  fileFormat: 'CSV', selectors: ['SID', 'SEASON', 'BASIN', 'NAME', 'ISO_TIME', 'NATURE', 'WMO_WIND', 'USA_WIND', 'USA_SSHS', 'lon', 'lat']});

// ---------- Vista previa ----------
Map.addLayer(etopo.lt(-120), {min: 0, max: 1, palette: ['#e8dcc0', '#9ecae1']}, 'Mar con el nivel 120 m más bajo (último máximo glacial)');
Map.addLayer(pts.limit(5000).map(function (f) { return f.setGeometry(ee.Geometry.Point([f.get('lon'), f.get('lat')])); }), {color: 'red'}, 'Ciclones (muestra)', false);
