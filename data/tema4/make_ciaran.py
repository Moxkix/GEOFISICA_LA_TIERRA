#!/usr/bin/env python3
"""Convierte ciaran_era5.tif (gee/tema4_superficie.js) en data/tema4/ciaran.json (variable CIARAN del hub):
presión a nivel del mar (hPa) y viento a 10 m (u, v en m/s) de ERA5 cada 3 h del 1 al 3 de noviembre de 2023,
en una rejilla de 0,5° (40° O – 10° E, 35° – 62° N). Si en la carpeta hay también un CSV de oleaje de WAVEWATCH III
(ww3_ciaran.csv, con columnas time, latitude, longitude, Thgt o shgt), se añade la altura significativa (hs).

Uso:  python3 data/tema4/make_ciaran.py carpeta [salida.json]
"""
import csv, json, pathlib, sys
from datetime import datetime, timedelta
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import read_tif, cell_mean, pack, unpack, size_kb

R = pathlib.Path(__file__).parent
BBOX = [-40, 10, 35, 62]


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'ciaran.json'
    arr, geo = read_tif(d / 'ciaran_era5.tif')
    nt = arr.shape[0] // 3
    t0 = datetime(2023, 11, 1)
    times = [(t0 + timedelta(hours=3 * k)).strftime('%Y-%m-%dT%H') for k in range(nt)]
    P, U, V = [], [], []
    for k in range(nt):
        P.append(cell_mean(arr[3 * k] / 10, geo, BBOX, 0.5, wrap=False))
        U.append(cell_mean(arr[3 * k + 1] / 100, geo, BBOX, 0.5, wrap=False))
        V.append(cell_mean(arr[3 * k + 2] / 100, geo, BBOX, 0.5, wrap=False))
    pmin = [float(np.nanmin(p)) for p in P]
    k = int(np.argmin(pmin)); j, i = np.unravel_index(np.nanargmin(P[k]), P[k].shape)
    print(f'Presión mínima {pmin[k]:.1f} hPa el {times[k]} en {BBOX[3] - (j + 0.5) * 0.5:.2f}° N, {BBOX[0] + (i + 0.5) * 0.5:.2f}° E')
    ws = [np.hypot(u, v) for u, v in zip(U, V)]
    print(f'Viento medio máximo a 10 m: {max(float(np.nanmax(w)) for w in ws):.1f} m/s')
    out = {'src': 'ERA5 (Copernicus/ECMWF) horario vía Google Earth Engine', 'times': times,
           'nx': P[0].shape[1], 'ny': P[0].shape[0], 'lon0': BBOX[0], 'lat0': BBOX[3], 'res': 0.5,
           'p': pack(P, lo=940, step=0.4), 'u': pack(U, lo=-32, step=0.25), 'v': pack(V, lo=-32, step=0.25)}
    for key in ('p', 'u', 'v'):
        ref = {'p': P, 'u': U, 'v': V}[key]
        print(f'  {key}: {size_kb(out[key]):.0f} KB, error máx. {np.nanmax(np.abs(unpack(out[key]) - np.stack(ref).reshape(nt, -1))):.2f}')
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
