#!/usr/bin/env python3
"""Genera gee/altitud_municipios.js y data/tema3/mun_ine.json.

Las coordenadas de data/mun.json son el centroide geométrico de cada término municipal (paquete spanish-cities-info),
que en municipios grandes o montañosos puede caer lejos del pueblo y cientos de metros más alto o más bajo. Para dar
la altitud del núcleo de población, el script de Earth Engine busca, en un círculo alrededor del centroide de radio
proporcional al tamaño del término, el punto con más superficie construida residencial (GHSL 2020) y toma allí la
altitud del modelo SRTM. Después, data/tema3/add_altitudes.py comprueba que ese punto cae dentro del término
municipal; si no, usa la altitud del centroide.

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
        r = min(30.0, max(1.0, 1.2 * math.sqrt(A / math.pi)))
        vals += [m[2], m[3], round(r, 1)]
    js = (R.parent.parent / 'gee' / 'altitud_municipios.js')
    body = ','.join(f'{v:g}' for v in vals)
    js.write_text(TEMPLATE.replace('%N%', str(len(mun))).replace('%C%', body), encoding='utf-8')
    print(f'{js}: {js.stat().st_size / 1024:.0f} KB; {sum(1 for c in ine if c in polys)} municipios con polígono')


TEMPLATE = """// =====================================================================
// Geografía General I (UNED) · Altitud de los %N% municipios de España
// Las coordenadas de los hubs son el centroide de cada término municipal, que en
// municipios grandes o de montaña puede quedar lejos del pueblo. Para dar la altitud
// del núcleo de población, se busca en un círculo alrededor del centroide (de radio
// proporcional al tamaño del término) el punto con más superficie construida
// residencial (GHSL 2020, JRC) y se toma allí la altitud del modelo SRTM (NASA/USGS).
// Exporta a Google Drive (carpeta GEE_tema3) la tabla altitud_municipios.csv:
//   i      índice del municipio (mismo orden que data/mun.json)
//   alt0   altitud en el centroide (m)
//   b      superficie construida residencial en el punto elegido (m² por celda de 100 m, suavizada)
//   alt    altitud en ese punto (m)
//   lon, lat  coordenadas de ese punto
// data/tema3/add_altitudes.py comprueba que el punto cae dentro del término municipal.
// Generado por data/tema3/gen_altitud_gee.py
// =====================================================================

// latitud, longitud, radio de búsqueda (km), latitud, longitud, radio…
var C = [%C%];

var LIST = ee.List(C);
var N = C.length / 3;
var pts = ee.FeatureCollection(ee.List.sequence(0, N - 1).map(function (i) {
  i = ee.Number(i).int();
  var k = i.multiply(3);
  var lat = ee.Number(LIST.get(k)), lon = ee.Number(LIST.get(k.add(1))), r = ee.Number(LIST.get(k.add(2)));
  return ee.Feature(ee.Geometry.Point([lon, lat]), {i: i, r: r});
}));

var dem = ee.Image('USGS/SRTMGL1_003').select('elevation');
var ghsl = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_S/2020');
var res = ghsl.select('built_surface').subtract(ghsl.select('built_surface_nres')).max(0);  // solo residencial
var dense = res.focalMean(300, 'circle', 'meters');              // núcleo más denso, no un edificio aislado
var demS = dem.focalMean(100, 'circle', 'meters');               // altitud media del entorno inmediato
var img = ee.Image.cat([dense.rename('b'), demS.rename('alt'), ee.Image.pixelLonLat()]);

// 1) altitud en el centroide
var step1 = dem.reduceRegions({collection: pts, reducer: ee.Reducer.first().setOutputs(['alt0']), scale: 30});
// 2) punto más construido dentro del círculo y su altitud
var circles = step1.map(function (f) { return f.buffer(ee.Number(f.get('r')).multiply(1000), 100); });
var out = img.reduceRegions({collection: circles, reducer: ee.Reducer.max(4).setOutputs(['b', 'alt', 'lon', 'lat']),
  scale: 100, tileScale: 4});

print('Municipios:', N, '· primeros resultados:', out.limit(5));
Map.addLayer(dense, {min: 0, max: 3000, palette: ['000000', 'ffffff']}, 'Superficie residencial (GHSL 2020, suavizada)', false);
Map.addLayer(pts, {color: 'red'}, 'Centroides de los municipios');
Export.table.toDrive({collection: out, description: 'altitud_municipios', folder: 'GEE_tema3',
  fileNamePrefix: 'altitud_municipios', fileFormat: 'CSV', selectors: ['i', 'alt0', 'b', 'alt', 'lon', 'lat']});
"""

if __name__ == '__main__':
    main(sys.argv[1:])
