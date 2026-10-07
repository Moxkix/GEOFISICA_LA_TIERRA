#!/usr/bin/env python3
"""Convierte las exportaciones de relieve de gee/tema4_relieve_ciclones.js en data/tema4/relieve.json (variable RELIEVE):
altitud y profundidad (m) de ETOPO1 (superficie del hielo) codificadas en un byte con una tabla no lineal: de metro en
metro entre −130 y +80 m (para simular subidas y bajadas del nivel del mar) y más gruesa fuera de ese intervalo.

  etopo_mundo_05deg.tif       → mundo (0,5°)
  etopo_iberia_0025deg.tif    → iberia (0,025°: 10° O – 4,5° E, 35,5° – 44° N)
  etopo_canarias_0025deg.tif  → canarias (0,025°: 18,3° O – 13,3° O, 27,5° – 29,5° N)

Uso:  python3 data/tema4/make_relieve.py carpeta [salida.json]
"""
import json, pathlib, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import read_tif, pack, unpack, size_kb

R = pathlib.Path(__file__).parent
DEEP = [-6000, -5000, -4500, -4000, -3500, -3000, -2500, -2000, -1750, -1500, -1250, -1000, -800, -600, -500, -400, -300, -250, -200, -160]
HIGH = [90, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 1800, 2100, 2500, 3000, 3500, 4000, 5000, 6000]
TABLE = DEEP + list(range(-130, 81)) + HIGH  # 255 valores: códigos 0-254
assert len(TABLE) == 255


def grid(path, bbox, res):
    arr, geo = read_tif(path)
    b = arr[0]
    x0, y0, dx, dy = geo
    W, E, S, N = bbox
    nx, ny = int(round((E - W) / res)), int(round((N - S) / res))
    i0, j0 = int(round((W - x0) / dx)), int(round((y0 - N) / dy))
    g = b[j0:j0 + ny, i0:i0 + nx]
    if g.shape != (ny, nx):  # completar si la exportación trae una fila o columna menos
        h = np.full((ny, nx), np.nan); h[:g.shape[0], :g.shape[1]] = g; g = h
    return g, {'nx': nx, 'ny': ny, 'lon0': W, 'lat0': N, 'res': res}


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'relieve.json'
    out = {'src': 'NOAA ETOPO1 (superficie del hielo), vía Google Earth Engine; medias por celdas', 'table': 'z'}
    for key, fn, bbox, res in (('mundo', 'etopo_mundo_05deg.tif', [-180, 180, -90, 90], 0.5),
                               ('iberia', 'etopo_iberia_0025deg.tif', [-10, 4.5, 35.5, 44], 0.025),
                               ('canarias', 'etopo_canarias_0025deg.tif', [-18.3, -13.3, 27.5, 29.5], 0.025)):
        f = d / fn
        if not f.exists():
            continue
        g, meta = grid(f, bbox, res)
        e = pack([g], mode='lut', table=TABLE)
        out[key] = dict(meta, z=e)
        dec = unpack(e)[0].reshape(g.shape)
        m = (np.abs(g) <= 80) & np.isfinite(g)
        print(f'  {key}: {g.shape[1]}×{g.shape[0]}, {size_kb(e):.0f} KB; error máx. entre −130 y 80 m: {np.nanmax(np.abs(dec - g)[m]) if m.any() else 0:.1f} m; '
              f'tierra {np.mean(g > 0) * 100:.0f} %, superficie que se inundaría con +1 m: {np.mean((g > 0) & (g <= 1)) * 100:.2f} %')
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
