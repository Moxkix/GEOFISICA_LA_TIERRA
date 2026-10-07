#!/usr/bin/env python3
"""Genera gee/altitud_municipios.js y data/tema3/mun_ine.json.

Las coordenadas de data/mun.json son el centroide geométrico de cada término municipal (paquete spanish-cities-info),
que en municipios grandes o montañosos puede caer lejos del pueblo y cientos de metros más alto o más bajo. Para dar
la altitud del núcleo de población, el script de Earth Engine busca alrededor del centroide tres candidatos (el punto
con más población en su entorno en un círculo que abarca el término, lo mismo en un círculo interior y el punto con
más edificación residencial en ese círculo interior; GHSL 2020) y toma en cada uno la altitud SRTM. Después,
data/tema3/add_altitudes.py se queda con el primero que cae dentro del término municipal (IGN); si ninguno, con la
altitud del centroide.

Necesita dos paquetes de npm (solo para generar el script):
  npm pack spanish-cities-info es-atlas   (y descomprimirlos)
  node -e "require('fs').writeFileSync('cities.json', JSON.stringify(require('./spanish-cities-info/package/dist/index.js').getAllCities()))"

Uso:  python3 data/tema3/gen_altitud_gee.py cities.json es-atlas/package/es/municipalities.json
"""
import json, math, pathlib, sys

R = pathlib.Path(__file__).resolve().parent
ROOT = R.parent.parent


def topo_polygons(path):
    """Devuelve {código INE: [anillos en lon/lat]} a partir del TopoJSON de es-atlas."""
    t = json.load(open(path, encoding='utf-8'))
    sx, sy = t['transform']['scale']; tx, ty = t['transform']['translate']
    arcs = []
    for a in t['arcs']:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(idx):
        out = []
        for k in idx:
            seg = arcs[k] if k >= 0 else arcs[~k][::-1]
            out.extend(seg if not out else seg[1:])
        return out

    polys = {}
    for g in t['objects']['municipalities']['geometries']:
        rings = []
        if g['type'] == 'Polygon':
            rings = [ring(r) for r in g['arcs']]
        elif g['type'] == 'MultiPolygon':
            rings = [ring(r) for p in g['arcs'] for r in p]
        polys.setdefault(g['id'], []).extend(rings)
    return polys


def area_km2(rings):
    """Área aproximada (km²) con regla par-impar: los huecos restan porque su sentido es contrario."""
    tot = 0
    for r in rings:
        lat0 = sum(p[1] for p in r) / len(r); k = 111.32 * math.cos(math.radians(lat0))
        s = sum((r[i][0] * k) * (r[i + 1][1] * 110.57) - (r[i + 1][0] * k) * (r[i][1] * 110.57) for i in range(len(r) - 1))
        tot += s / 2
    return abs(tot)


def main(a):
    if len(a) < 2:
        raise SystemExit(__doc__)
    cities = json.load(open(a[0], encoding='utf-8'))
    mun = json.load(open(ROOT / 'data' / 'mun.json', encoding='utf-8'))['m']
    assert len(cities) == len(mun) and all(c['name'] == m[0] for c, m in zip(cities, mun)), 'spanish-cities-info y data/mun.json no coinciden'
    polys = topo_polygons(a[1])
    ine = [c['ineCode'] for c in cities]
    (R / 'mun_ine.json').write_text(json.dumps(ine, separators=(',', ':')))
    vals = []
    for m, code in zip(mun, ine):
        A = area_km2(polys[code]) if code in polys else 30.0
        ri = min(25.0, max(1.0, 0.8 * math.sqrt(A / math.pi)))       # círculo interior: casi todo dentro del término
        rc = ri
        if code in polys:  # círculo que contiene todo el término (distancia al vértice más lejano)
            k = math.cos(math.radians(m[2]))
            rc = max(math.hypot((x - m[3]) * 111.32 * k, (y - m[2]) * 110.57) for r_ in polys[code] for x, y in r_)
        rc = min(35.0, max(ri, rc))
        vals += [m[2], m[3], round(ri, 1), round(rc, 1)]
    js = (R.parent.parent / 'gee' / 'altitud_municipios.js')
    body = ','.join(f'{v:g}' for v in vals)
    js.write_text(TEMPLATE.replace('%N%', str(len(mun))).replace('%C%', body), encoding='utf-8')
    print(f'{js}: {js.stat().st_size / 1024:.0f} KB; {sum(1 for c in ine if c in polys)} municipios con polígono')


TEMPLATE = """// =====================================================================
// Geografía General I (UNED) · Altitud de los %N% municipios de España
// Las coordenadas de los hubs son el centroide de cada término municipal, que en
// municipios grandes o de montaña puede quedar lejos del pueblo. Para dar la altitud
// del núcleo de población se buscan, alrededor del centroide, tres candidatos:
//   1) el punto con más población en su entorno (GHSL 2020, radio de 700 m) dentro
//      de un círculo que abarca todo el término: normalmente, la capital municipal;
//   2) lo mismo en un círculo interior, más pequeño, por si el primero cae en el
//      pueblo de un municipio vecino;
//   3) el punto con más superficie construida residencial (GHSL 2020) en ese círculo
//      interior, para los pueblos muy pequeños;
// y en cada uno la altitud media del modelo SRTM (NASA/USGS) en 100 m a la redonda.
// data/tema3/add_altitudes.py se queda con el primero que cae dentro del término
// municipal (límites del IGN) y, si ninguno, con la altitud del centroide.
// Exporta a Google Drive (carpeta GEE_tema3) la tabla altitud_municipios.csv.
// Generado por data/tema3/gen_altitud_gee.py
// =====================================================================

// latitud, longitud, radio interior (km), radio que abarca el término (km), …
var C = [%C%];

var LIST = ee.List(C);
var N = C.length / 4;
var pts = ee.FeatureCollection(ee.List.sequence(0, N - 1).map(function (i) {
  i = ee.Number(i).int();
  var k = i.multiply(4);
  var lat = ee.Number(LIST.get(k)), lon = ee.Number(LIST.get(k.add(1)));
  return ee.Feature(ee.Geometry.Point([lon, lat]), {i: i, clat: lat, clon: lon, ri: LIST.get(k.add(2)), rc: LIST.get(k.add(3))});
}));

var dem = ee.Image('USGS/SRTMGL1_003').select('elevation');
var demS = dem.focalMean(100, 'circle', 'meters');                       // altitud media en 100 m a la redonda
var pop = ee.Image('JRC/GHSL/P2023A/GHS_POP/2020').select('population_count')
  .focalMean(700, 'circle', 'meters');                                   // población del entorno: tamaño del núcleo
var ghsl = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_S/2020');
var dens = ghsl.select('built_surface').subtract(ghsl.select('built_surface_nres')).max(0)
  .focalMean(300, 'circle', 'meters');                                   // densidad de edificación residencial
var ll = ee.Image.pixelLonLat();

// Máximo de la primera banda dentro del círculo (radio en la propiedad «radius», km) y,
// en ese mismo píxel, altitud y coordenadas. Se encadena: cada paso conserva las propiedades anteriores.
function best(img, fc, radius, names, scale) {
  var circles = fc.map(function (f) {
    var c = ee.Geometry.Point([ee.Number(f.get('clon')), ee.Number(f.get('clat'))]);
    return ee.Feature(ee.Feature(c.buffer(ee.Number(f.get(radius)).multiply(1000), 100)).copyProperties(f));
  });
  return ee.Image.cat([img, demS, ll]).reduceRegions({collection: circles,
    reducer: ee.Reducer.max(4).setOutputs(names), scale: scale, tileScale: 4})
    .map(function (f) { return f.setGeometry(null); });
}

var s0 = dem.reduceRegions({collection: pts, reducer: ee.Reducer.first().setOutputs(['alt0']), scale: 30});
var s1 = best(pop, s0, 'rc', ['m1', 'alt1', 'lon1', 'lat1'], 200);
var s2 = best(pop, s1, 'ri', ['m2', 'alt2', 'lon2', 'lat2'], 200);
var s3 = best(dens, s2, 'ri', ['m3', 'alt3', 'lon3', 'lat3'], 100);

print('Municipios:', N);
Map.addLayer(pop, {min: 0, max: 200, palette: ['000000', 'ffffff']}, 'Población del entorno (GHSL 2020)', false);
Map.addLayer(pts, {color: 'red'}, 'Centroides de los municipios');
Export.table.toDrive({collection: s3, description: 'altitud_municipios', folder: 'GEE_tema3',
  fileNamePrefix: 'altitud_municipios', fileFormat: 'CSV',
  selectors: ['i', 'alt0', 'm1', 'alt1', 'lon1', 'lat1', 'm2', 'alt2', 'lon2', 'lat2', 'm3', 'alt3', 'lon3', 'lat3']});
"""

if __name__ == '__main__':
    main(sys.argv[1:])
