"""Tema 6 · biomas del mundo en la rejilla de 0,5° de los mapas de Köppen del Tema 5.
Entrada: biomas_mundo.tif, exportado por gee/tema6_biomas.js (RESOLVE Ecoregions 2017; Dinerstein y otros, 2017;
CC BY 4.0): BIOME (bioma dominante, 1-14), MANG (fracción de la celda con manglar, en milésimas) y LAND.
Salida: data/tema6/biomas.json (formato comprimido de data/tema4/gt4.py), alineado celda a celda con
data/tema5/koppen_mundo.json (720 × 288 celdas, 84° N - 60° S).
Uso: python3 data/tema6/make_biomas.py ruta/biomas_mundo.tif"""
import json, pathlib, sys
import numpy as np
R = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / 'tema4'))
from gt4 import read_tif, pack, unpack  # noqa: E402

a, geo = read_tif(sys.argv[1])
W = json.load(open(R / 'tema5' / 'koppen_mundo.json'))
nx, ny = W['nx'], W['ny']
assert abs(geo[0] - W['lon0']) < 1e-6 and abs(geo[1] - W['lat0']) < 1e-6 and abs(geo[2] - W['res']) < 1e-6, geo
# Earth Engine añade una columna (que repite −180°) y una fila parcial al sur: se recorta como el mapa de Köppen
B, M = a[0, :ny, :nx], a[1, :ny, :nx] / 1000
B = np.where((B >= 1) & (B <= 14), B, np.nan)
M = np.where(np.isfinite(M), M, 0)
lats = W['lat0'] - (np.arange(ny) + 0.5) * W['res']; lons = W['lon0'] + (np.arange(nx) + 0.5) * W['res']
u, c = np.unique(B[np.isfinite(B)], return_counts=True)
print('celdas por bioma:', dict(zip(u.astype(int).tolist(), c.tolist())))
# comprobación de los manglares: fachadas occidentales con corriente fría frente a las orientales
def mang(la0, la1, lo0, lo1):
    j = (lats >= la0) & (lats <= la1); i = (lons >= lo0) & (lons <= lo1)
    w = np.cos(np.deg2rad(lats[j]))[:, None]
    return round(float((M[np.ix_(j, i)] * w).sum() * 3091), 0)  # km² aproximados (celda de 0,5° en el ecuador ≈ 3.091 km²)
for n, box in [('Perú y norte de Chile (fachada occidental)', (-30, -4, -82, -68)), ('costa de Brasil a la misma latitud', (-30, -4, -50, -34)),
               ('Namibia y sur de Angola (occ.)', (-30, -12, 8, 20)), ('Mozambique a la misma latitud (or.)', (-30, -12, 30, 42)),
               ('Baja California, costa del Pacífico (occ.)', (23, 32, -118, -112)), ('golfo de México y Florida (or.)', (23, 32, -98, -79))]:
    print(f'manglar {n}: ~{mang(*box):.0f} km²')
out = {'src': 'RESOLVE Ecoregions 2017 (Dinerstein y otros, 2017; CC BY 4.0) vía Google Earth Engine: bioma dominante y fracción de manglar en celdas de 0,5°',
       'nx': nx, 'ny': ny, 'lon0': W['lon0'], 'lat0': W['lat0'], 'res': W['res'],
       'B': pack(B, 'lin', lo=0, step=1), 'M': pack(M, 'lin', lo=0, step=0.004)}
assert np.nanmax(np.abs(unpack(out['B'])[0].reshape(ny, nx) - B)) < 1e-9
(R / 'tema6' / 'biomas.json').write_text(json.dumps(out, separators=(',', ':')))
print('biomas.json', round((R / 'tema6' / 'biomas.json').stat().st_size / 1024, 1), 'KB')
