#!/usr/bin/env python3
"""Convierte ciaran_era5.tif (gee/tema4_superficie.js) en data/tema4/ciaran.json (variable CIARAN del hub):
presión a nivel del mar (hPa) y viento a 10 m (u, v en m/s) de ERA5 cada 3 h del 1 al 3 de noviembre de 2023,
en una rejilla de 0,5° (40° O – 10° E, 35° – 62° N). Si en la carpeta hay también un CSV de oleaje de WAVEWATCH III
(ww3_ciaran.csv, con columnas time, latitude, longitude, Thgt o shgt), se añade la altura significativa (hs).

(ERDDAP de NOAA CoastWatch o de PacIOOS; también en dos archivos, ww3_ciaran_oeste.csv y ww3_ciaran_este.csv).

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
    # oleaje de WAVEWATCH III (NOAA) desde ERDDAP, si está: ww3_ciaran_oeste.csv (320-359,5° E) y ww3_ciaran_este.csv (0-10° E)
    ww = [d / 'ww3_ciaran_oeste.csv', d / 'ww3_ciaran_este.csv', d / 'ww3_ciaran.csv']
    if any(f.exists() for f in ww):
        nxw, nyw = 101, 55  # celdas centradas en −40…10° E y 62…35° N (0,5°)
        HS = np.full((nt, nyw, nxw), np.nan)
        tidx = {t: k for k, t in enumerate(times)}
        for f in ww:
            if not f.exists():
                continue
            rd = csv.reader(open(f, newline=''))
            head = next(rd); next(rd, None)  # la segunda fila de ERDDAP son las unidades
            ci = {h: i for i, h in enumerate(head)}
            hcol = 'Thgt' if 'Thgt' in ci else 'shgt'
            for r in rd:
                try:
                    tt = r[ci['time']][:13]; la = float(r[ci['latitude']]); lo = float(r[ci['longitude']]); hs = float(r[ci[hcol]])
                except (ValueError, KeyError, IndexError):
                    continue
                if tt not in tidx or hs != hs:
                    continue
                lo = ((lo + 540) % 360) - 180
                i, j = int(round((lo + 40) / 0.5)), int(round((62 - la) / 0.5))
                if 0 <= i < nxw and 0 <= j < nyw:
                    HS[tidx[tt], j, i] = hs
        out['hs'] = pack(list(np.clip(HS, 0, 20)), lo=0, step=0.1)
        out['hsG'] = {'nx': nxw, 'ny': nyw, 'lon0': -40.25, 'lat0': 62.25, 'res': 0.5}
        out['hsSrc'] = 'NOAA WAVEWATCH III (modelo global, 0,5°), vía ERDDAP'
        print(f'  Hs: máximo {np.nanmax(HS):.1f} m; {size_kb(out["hs"]):.0f} KB')
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
