#!/usr/bin/env python3
"""Reanálisis del Último Máximo Glaciar (LGMR; Osman y otros, 2021, Nature 599: 239-244) → data/tema5/lgmr.json.

Archivos de NOAA NCEI Paleoclimatology (https://www.ncei.noaa.gov/pub/data/paleo/reconstructions/osman2021/):
  LGMR_GMST_ens.nc   temperatura media global anual de los 500 miembros del conjunto, de 24.000 a 0 años BP cada 200 años
  LGMR_SAT_climo.nc  temperatura anual del aire en superficie (media del conjunto) por latitud y longitud

Salida:
  gmst  edad (años BP), percentiles 5, 50 y 95 de la temperatura global, como anomalía respecto al último intervalo
        (0-200 años BP, es decir, 1750-1950: la época preindustrial a efectos prácticos)
  map   diferencia entre el Último Máximo Glaciar (media de 19.000-23.000 años BP) y el último intervalo, remuestreada a 2°

Uso:  python3 data/tema5/make_lgmr.py LGMR_GMST_ens.nc LGMR_SAT_climo.nc
"""
import json, pathlib, sys
import numpy as np
import netCDF4
R = pathlib.Path(__file__).parent
sys.path.insert(0, str(R.parent / 'tema4'))
from gt4 import pack, size_kb  # noqa: E402


def var(ds, *names):
    for n in names:
        if n in ds.variables: return ds.variables[n]
    raise SystemExit(f'No encuentro ninguna de las variables {names}; hay: {list(ds.variables)}')


def main(a):
    if len(a) < 2: raise SystemExit(__doc__)
    fe = next(p for p in a if 'gmst' in p.lower()); fs = next(p for p in a if 'sat' in p.lower())
    # ---------- temperatura global ----------
    d = netCDF4.Dataset(fe)
    print('GMST:', {k: v.dimensions for k, v in d.variables.items()})
    age = np.asarray(var(d, 'age')[:], dtype=float)
    g = np.asarray(var(d, 'gmst')[:], dtype=float)
    dims = var(d, 'gmst').dimensions
    if dims[0] != 'age': g = g.T
    o = np.argsort(-age); age, g = age[o], g[o]          # de lo más antiguo a hoy
    base = g[age == age.min()].ravel() if g.ndim == 2 else g[age == age.min()]
    ga = g - (np.median(base) if np.ndim(base) else base)
    p5, p50, p95 = (np.percentile(ga, q, axis=1) for q in (5, 50, 95)) if ga.ndim == 2 else (ga, ga, ga)
    lgm = (age >= 19000) & (age <= 23000)
    dLGM = float(-np.mean(p50[lgm]))
    print(f'  {len(age)} edades de {age.max():.0f} a {age.min():.0f} BP; LGM {dLGM:.1f} °C más frío que el último intervalo')
    # ---------- mapa ----------
    s = netCDF4.Dataset(fs)
    print('SAT:', {k: v.dimensions for k, v in s.variables.items()})
    sa = np.asarray(var(s, 'age')[:], dtype=float); lat = np.asarray(var(s, 'lat')[:], dtype=float); lon = np.asarray(var(s, 'lon')[:], dtype=float)
    sat = np.asarray(var(s, 'sat')[:], dtype=float)
    dd = var(s, 'sat').dimensions
    sat = np.transpose(sat, [dd.index(x) for x in ('age', 'lat', 'lon')])
    dT = sat[(sa >= 19000) & (sa <= 23000)].mean(axis=0) - sat[sa == sa.min()].mean(axis=0)
    # remuestreo bilineal a 2° (filas de norte a sur, columnas de −180 a 180)
    if lat[0] < lat[-1]: lat, dT = lat[::-1], dT[::-1]
    lon = ((lon + 180) % 360) - 180; o = np.argsort(lon); lon, dT = lon[o], dT[:, o]
    LAT = 89 - 2 * np.arange(90); LON = -179 + 2 * np.arange(180)
    lonx = np.concatenate([lon - 360, lon, lon + 360]); dx = np.concatenate([dT, dT, dT], axis=1)
    rows = np.array([np.interp(LON, lonx, r) for r in dx])
    out = np.array([np.interp(-LAT, -lat, rows[:, i]) for i in range(180)]).T
    print(f'  ΔT del LGM: de {out.min():.1f} a {out.max():.1f} °C; media ponderada {np.average(out, weights=np.cos(np.radians(LAT))[:, None] * np.ones((1, 180))):.1f} °C')
    res = {'gmst': {'age': [int(x) for x in age], 'p5': [round(float(x), 2) for x in p5], 'p50': [round(float(x), 2) for x in p50], 'p95': [round(float(x), 2) for x in p95], 'dLGM': round(dLGM, 1), 'off': 0},
           'map': {'nx': 180, 'ny': 90, 'lon0': -180, 'lat0': 90, 'res': 2, 'ka': 21, 'lab': '19.000-23.000 años', 'd': pack(out, 'lin', lo=-45, hi=6, step=0.2)},
           'src': 'Last Glacial Maximum Reanalysis (Osman y otros, 2021), NOAA NCEI Paleoclimatology'}
    f = R / 'lgmr.json'; f.write_text(json.dumps(res, separators=(',', ':')))
    print(f'→ {f} ({f.stat().st_size / 1024:.0f} KB; mapa {size_kb(res["map"]["d"]):.0f} KB)')


if __name__ == '__main__':
    main(sys.argv[1:])
