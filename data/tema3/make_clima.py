#!/usr/bin/env python3
"""Convierte las exportaciones de gee/era5_tema3_clima.js en data/tema3/era5_clima.json (variable CLIMA del hub):
  · presión media a nivel del mar, 12 meses, rejilla de 2°            (p)
  · precipitación media mensual, 12 meses, rejilla de 2°               (r)
  · viento medio a 10 m, 12 meses, componentes u y v, rejilla de 4°    (u, v; rejilla en w)
Cada celda es la media de los píxeles exportados que caen en ella. Los valores se guardan cuantificados en
un byte (ver gt.py): 0,2–0,4 hPa de resolución en presión y 0,1–0,2 m/s en viento, de sobra para dibujar
isobaras cada 4 hPa y flechas.

Uso:  python3 data/tema3/make_clima.py era5_pres_viento_1deg.tif era5_precip_05deg.tif [salida.json]
"""
import json, pathlib, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt import read_tif, block_mean, q8, dq8

R = pathlib.Path(__file__).parent
GLOBE = [-180, 180, -90, 90]


def main(a):
    if len(a) < 2:
        raise SystemExit(__doc__)
    files = {}
    for f in a[:2]:
        arr, geo = read_tif(f)
        files[arr.shape[0]] = (arr, geo, f)
    if 36 not in files or 12 not in files:
        raise SystemExit(f'Se esperaban un archivo de 36 bandas (presión y viento) y otro de 12 (precipitación); recibidos: {sorted(files)}')
    pv, gpv, _ = files[36]
    pr, gpr, _ = files[12]
    out = {'src': 'ERA5 (Copernicus/ECMWF) vía Google Earth Engine, ECMWF/ERA5/MONTHLY: medias 1991-2020 (julio-diciembre, 1991-2019)'}
    P, U, V, Rr = [], [], [], []
    for m in range(12):
        p, g2 = block_mean(pv[m] / 10, gpv, GLOBE, 2, wrap=True)
        u, g4 = block_mean(pv[12 + m] / 100, gpv, GLOBE, 4, wrap=True)
        v, _ = block_mean(pv[24 + m] / 100, gpv, GLOBE, 4, wrap=True)
        r, _ = block_mean(pr[m] / 10, gpr, GLOBE, 2, wrap=True)
        P.append(q8(p)); U.append(q8(u)); V.append(q8(v)); Rr.append(q8(r, 'sq'))
        if m in (0, 6):
            lat = 90 - (np.arange(g2['ny']) + 0.5) * 2
            w = np.cos(np.radians(lat))[:, None] * np.ones((1, g2['nx']))
            print(f'Mes {m + 1:2d}: presión {np.nanmin(p):.1f}–{np.nanmax(p):.1f} hPa (error máx. de cuantificación {np.abs(dq8(P[-1]) - p.ravel()).max():.2f}); '
                  f'viento u {np.nanmin(u):.1f}–{np.nanmax(u):.1f} m/s; precipitación máx. {np.nanmax(r):.0f} mm, media global {np.sum(r * w) / np.sum(w):.1f} mm')
    out.update({'nx': g2['nx'], 'ny': g2['ny'], 'lon0': -180, 'lat0': 90, 'res': 2, 'p': P, 'r': Rr,
                'w': g4, 'u': U, 'v': V})
    ann = sum(dq8(e).reshape(g2['ny'], g2['nx']) for e in Rr)
    lat = 90 - (np.arange(g2['ny']) + 0.5) * 2
    w = np.cos(np.radians(lat))[:, None]
    print(f'Precipitación anual media global: {np.sum(ann * w) / np.sum(w * np.ones_like(ann)):.0f} mm (Trenberth et al. 2007: ≈ 990 mm)')
    dst = pathlib.Path(a[2]) if len(a) > 2 else R / 'era5_clima.json'
    dst.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{dst}: {dst.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
