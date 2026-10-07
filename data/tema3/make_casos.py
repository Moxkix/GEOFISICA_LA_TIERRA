#!/usr/bin/env python3
"""Convierte las exportaciones de gee/era5_tema3_casos.js en las variables DANA y VSUR del hub:
  data/tema3/dana.json   DANA del 29-10-2024: presión en superficie, viento a 850 hPa, altura (aprox.) y
                         temperatura de 500 hPa, viento a 250 hPa (6 horas, rejilla de 0,5°) y precipitación
                         del día 29 (24 h y tramos de 6 h, rejilla nativa de 0,25°)
  data/tema3/vsur.json   viento sur en Bilbao, 23-26 de febrero de 2026: presión y viento a 10 m (21 horas,
                         0,5°), temperatura a 2 m y a 850 hPa en el norte peninsular (0,25°) y serie horaria en
                         cinco observatorios

La altura de 500 hPa no está en el catálogo de GEE: se calcula como z500 = z1000 + espesor 1000-500 hPa, con
z1000 = (Rd·Tv1000/g)·ln(PNM/1000). Sobre la Meseta, donde 1000 hPa queda bajo el suelo, el valor depende de la
extrapolación de ERA5 y puede desviarse unas decenas de metros del geopotencial oficial.

Uso:  python3 data/tema3/make_casos.py CARPETA_CON_LOS_ARCHIVOS [CARPETA_DE_SALIDA]
"""
import csv, json, math, pathlib, sys
from datetime import datetime, timedelta
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt import read_tif, block_mean, q8

R = pathlib.Path(__file__).parent
RD, G0 = 287.05, 9.80665

DANA_T = ['2024-10-28T12', '2024-10-29T00', '2024-10-29T06', '2024-10-29T12', '2024-10-29T18', '2024-10-30T00']
DANA_BB = [-20, 12, 26, 50]
VS_T = [(datetime(2026, 2, 23, 12) + timedelta(hours=h)).strftime('%Y-%m-%dT%H') for h in range(0, 61, 3)]
VS_BB = [-22, 8, 36, 57]
VS_FINE = [-10, 2, 40.5, 45.5]
SITES = ['Bilbao', 'Burgos', 'Vitoria', 'Donostia', 'Santander']


def need(d, name):
    f = d / name
    if not f.exists():
        alt = sorted(d.glob(name.replace('.tif', '*.tif')))
        if alt:
            return alt[0]
        raise SystemExit(f'Falta {name} en {d}')
    return f


def smooth(a, k=1):
    """Media móvil 3×3 (k pasadas) que respeta los bordes."""
    for _ in range(k):
        p = np.pad(a, 1, mode='edge')
        a = sum(p[1 + dj:1 + dj + a.shape[0], 1 + di:1 + di + a.shape[1]] for dj in (-1, 0, 1) for di in (-1, 0, 1)) / 9
    return a


def dana(d):
    sup, gs = read_tif(need(d, 'dana_superficie.tif'))
    alt, ga = read_tif(need(d, 'dana_altura.tif'))
    pre, gp = read_tif(need(d, 'dana_precip.tif'))
    n = len(DANA_T)
    assert sup.shape[0] == 3 * n, f'dana_superficie: {sup.shape[0]} bandas (se esperaban {3 * n})'
    assert alt.shape[0] == 10 * n, f'dana_altura: {alt.shape[0]} bandas (se esperaban {10 * n})'
    assert pre.shape[0] == 5, f'dana_precip: {pre.shape[0]} bandas (se esperaban 5)'
    F = {k: [] for k in ('p', 'u8', 'v8', 'z5', 't5', 'u2', 'v2')}
    grid = None
    for i, t in enumerate(DANA_T):
        p, grid = block_mean(sup[3 * i] / 10, gs, DANA_BB, 0.5)
        b = lambda k: block_mean(alt[10 * i + k], ga, DANA_BB, 0.5)[0]
        thk, tv, t5, u5, v5, u2, v2, t8, u8, v8 = (b(k) for k in range(10))
        z1000 = RD * (tv / 10 + 273.15) / G0 * np.log(p / 1000)
        z5 = smooth(z1000 + thk, 1)
        for k, a in (('p', p), ('u8', u8 / 100), ('v8', v8 / 100), ('z5', z5), ('t5', t5 / 10), ('u2', u2 / 100), ('v2', v2 / 100)):
            F[k].append(q8(a))
        j, ii = np.unravel_index(np.argmin(z5), z5.shape)
        print(f'DANA {t}: PNM mín. {p.min():.1f} hPa; z500 mín. {z5.min():.0f} m en {DANA_BB[3] - (j + .5) * .5:.1f}N {DANA_BB[0] + (ii + .5) * .5:.1f}E; '
              f'T500 en el núcleo {t5[j, ii] / 10:.1f} °C; chorro 250 hPa máx. {np.hypot(u2, v2).max() / 100 * 3.6:.0f} km/h')
    rain = {}
    for k, nm in enumerate(['r24', 'r6a', 'r6b', 'r6c', 'r6d']):
        r, rg = block_mean(pre[k] / 10, gp, DANA_BB, 0.25)
        rain[nm] = r
    sel = lambda a, g: a[int((g['lat0'] - 40.5) / g['res']):int((g['lat0'] - 38) / g['res']), int((-2 - g['lon0']) / g['res']):int((0.5 - g['lon0']) / g['res'])]
    print(f"DANA: precipitación del día 29 en ERA5, máximo en Valencia {sel(rain['r24'], rg).max():.0f} mm; suma de tramos de 6 h {sel(sum(rain[k] for k in ('r6a', 'r6b', 'r6c', 'r6d')), rg).max():.0f} mm")
    return {'src': 'ERA5 horario (Copernicus/ECMWF) vía Google Earth Engine', 'grid': grid, 'times': DANA_T, 'f': F,
            'rain': {'grid': rg, 'r24': q8(rain['r24'], 'sq'), 'r6': [q8(rain[k], 'sq') for k in ('r6a', 'r6b', 'r6c', 'r6d')],
                     't6': ['2024-10-29T06', '2024-10-29T12', '2024-10-29T18', '2024-10-30T00']}}


def series(path):
    rows = list(csv.DictReader(open(path, newline='', encoding='utf-8')))
    by = {s: [] for s in SITES}
    for r in rows:
        if r['sitio'] in by:
            by[r['sitio']].append(r)
    t0 = datetime(2026, 2, 23, 0)
    out = {}
    num = lambda x: float(x) if x not in ('', None) else float('nan')
    for s, rs in by.items():
        rs.sort(key=lambda r: r['hora_utc'])
        times = [datetime.strptime(r['hora_utc'], '%Y-%m-%d %H:%M') for r in rs]
        assert times and times[0] == t0, f'{s}: la serie no empieza el 23 a las 00 UTC'
        assert all((b - a).total_seconds() == 3600 for a, b in zip(times, times[1:])), f'{s}: faltan horas'
        col = lambda k: [num(r[k]) for r in rs]
        rnd = lambda a, n: [None if math.isnan(x) else round(x, n) for x in a]
        out[s] = {'T': rnd([x - 273.15 for x in col('temperature_2m')], 1),
                  'Td': rnd([x - 273.15 for x in col('dewpoint_temperature_2m')], 1),
                  'p': rnd([x / 100 for x in col('mean_sea_level_pressure')], 1),
                  'u': rnd(col('u_component_of_wind_10m'), 1), 'v': rnd(col('v_component_of_wind_10m'), 1),
                  'r': rnd([max(0, x) * 3600 for x in col('mean_total_precipitation_rate')], 2),
                  'c': rnd([x * 100 for x in col('total_cloud_cover')], 0), 'g': rnd(col('instantaneous_10m_wind_gust'), 1)}
        T = out[s]['T']; k = max(range(len(T)), key=lambda i: T[i])
        print(f"Serie {s}: {len(T)} horas; máxima {T[k]:.1f} °C el {(t0 + timedelta(hours=k)).strftime('%d %H')} UTC; racha máx. {max(out[s]['g']) * 3.6:.0f} km/h")
    return {'t0': '2026-02-23T00', 'sites': out}


def vsur(d):
    sup, gs = read_tif(need(d, 'vsur_superficie.tif'))
    alt, ga = read_tif(need(d, 'vsur_altura.tif'))
    n = len(VS_T)
    assert sup.shape[0] == 5 * n, f'vsur_superficie: {sup.shape[0]} bandas (se esperaban {5 * n})'
    assert alt.shape[0] == 3 * n, f'vsur_altura: {alt.shape[0]} bandas (se esperaban {3 * n})'
    F = {k: [] for k in ('p', 'u', 'v', 't', 't8')}
    g2 = {}
    for i, t in enumerate(VS_T):
        p, grid = block_mean(sup[5 * i] / 10, gs, VS_BB, 0.5)
        u = block_mean(sup[5 * i + 1] / 100, gs, VS_BB, 0.5)[0]
        v = block_mean(sup[5 * i + 2] / 100, gs, VS_BB, 0.5)[0]
        T, g2['t'] = block_mean(sup[5 * i + 3] / 10, gs, VS_FINE, 0.25)
        t8, g2['t8'] = block_mean(alt[3 * i] / 10, ga, VS_FINE, 0.25)
        for k, a in (('p', p), ('u', u), ('v', v), ('t', T), ('t8', t8)):
            F[k].append(q8(a))
        if i % 4 == 0:
            print(f'VSUR {t}: PNM {p.min():.1f}–{p.max():.1f} hPa; T2m norte peninsular {T.min():.1f}–{T.max():.1f} °C; T850 {t8.min():.1f}–{t8.max():.1f} °C')
    return {'src': 'ERA5 horario (Copernicus/ECMWF) vía Google Earth Engine', 'grid': grid, 'g2': g2, 'times': VS_T, 'f': F,
            'series': series(need(d, 'vsur_series.csv'))}


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); dst = pathlib.Path(a[1]) if len(a) > 1 else R
    for name, fn in (('dana.json', dana), ('vsur.json', vsur)):
        f = dst / name
        f.write_text(json.dumps(fn(d), separators=(',', ':'), allow_nan=False))
        print(f'{f}: {f.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
