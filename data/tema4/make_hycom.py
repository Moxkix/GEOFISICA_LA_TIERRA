#!/usr/bin/env python3
"""Convierte las exportaciones de gee/tema4_hycom.js en data/tema4/perfiles.json (variable PERFILES del hub).
(La salinidad y las corrientes de superficie, hycom_salinidad_1deg.tif y hycom_corrientes_1deg.tif, las procesa make_oceano.py.)
Las rejillas de los mapas son las de HYCOM agrupadas (≈5°) y los cortes vienen en la resolución nativa (0,08°):
aquí se pasan a celdas de 5° y a tramos de 1° (Atlántico, ecuador) o 0,1° (Gibraltar) por coordenadas.

  hycom_perfiles_5deg.tif   → prof: temperatura y salinidad en 19 profundidades, febrero y agosto, rejilla de 5°
  hycom_atlantico_25W.tif   → atl: corte norte-sur a 25° O (80° S – 70° N, cada 1°), 40 profundidades, media anual
  hycom_gibraltar_36N.tif   → gib: corte oeste-este a 35,95° N (20° O – 0°, cada 0,1°), 40 profundidades
  hycom_ecuador_oeste.tif + hycom_ecuador_este.tif → eq: corte del Pacífico ecuatorial (120° E – 80° O), 0-500 m,
                              media 2014-2023 (T) y diciembre de 2015, El Niño (N)
Valores de HYCOM en bruto: temperatura y salinidad = bruto × 0,001 + 20.

Uso:  python3 data/tema4/make_hycom.py carpeta_con_los_tif [salida.json]
"""
import json, pathlib, sys, warnings
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import read_tif, cell_mean, pack, unpack, size_kb

R = pathlib.Path(__file__).parent
LEV = [0, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250, 300, 350,
       400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000]
LEV19 = [0, 10, 20, 30, 50, 70, 100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 4000, 5000]
LEVEQ = [z for z in LEV if z <= 500]
TS = lambda a: a * 0.001 + 20  # noqa: E731


def packTS(T, S):
    return {'T': pack([np.clip(t, -2.5, 33) for t in T], lo=-2.5, step=0.15), 'S': pack([np.clip(s, 30, 41.5) for s in S], lo=30, step=0.05)}


def report(name, e, ref):
    err = np.nanmax(np.abs(unpack(e) - np.stack(ref).reshape(len(ref), -1)))
    print(f'  {name}: {e["n"]} capas, {size_kb(e):.0f} KB, error máx. {err:.3f}')


def section(arr, geo, axis, n_levels, start, step, count):
    """Corte (bandas × puntos) de una imagen estrecha: se promedian las columnas (corte norte-sur, axis='lat') o las
    filas (corte oeste-este, axis='lon') y luego los píxeles cuyo centro cae en cada tramo de `step` grados
    centrado en start + i·step. Sirve tanto para la resolución nativa de HYCOM como para rejillas más gruesas."""
    x0, y0, dx, dy = geo
    tgt = start + np.arange(count) * step
    out = []
    for k in range(arr.shape[0]):
        b = arr[k]
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', RuntimeWarning)  # columnas o filas sin datos (tierra) → NaN
            v = np.nanmean(b, axis=1) if axis == 'lat' else np.nanmean(b, axis=0)
        coord = (y0 - (np.arange(len(v)) + 0.5) * dy) if axis == 'lat' else (x0 + (np.arange(len(v)) + 0.5) * dx)
        row = np.full(count, np.nan)
        for i, t in enumerate(tgt):
            m = (np.abs(coord - t) <= abs(step) / 2 + 1e-9) & np.isfinite(v)
            if m.any():
                row[i] = v[m].mean()
        out.append(row)
    return np.stack(out)  # bandas × puntos


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'perfiles.json'
    out = json.loads(out_path.read_text()) if out_path.exists() else {}
    out['src'] = 'HYCOM + NCODA (GOFS 3.1), análisis diario, medias 2014-2023, vía Google Earth Engine'

    f = d / 'hycom_perfiles_5deg.tif'
    if f.exists():
        arr, geo = read_tif(f)
        n = len(LEV19)
        lay = {}
        for mi, tag in enumerate(('02', '08')):
            T = [cell_mean(TS(arr[mi * 2 * n + k]), geo, [-180, 180, -90, 90], 5, wrap=True) for k in range(n)]
            S = [cell_mean(TS(arr[mi * 2 * n + n + k]), geo, [-180, 180, -90, 90], 5, wrap=True) for k in range(n)]
            lay[tag] = (T, S)
        out['prof'] = {'nx': 72, 'ny': 36, 'lon0': -180, 'lat0': 90, 'res': 5, 'z': LEV19,
                       'feb': packTS(*lay['02']), 'ago': packTS(*lay['08'])}
        report('perfiles T feb', out['prof']['feb']['T'], [np.clip(t, -2.5, 33) for t in lay['02'][0]])
        print(f'  ejemplo 37,5° N, 12,5° O, feb: T = {[round(float(t[10, 33]), 1) for t in lay["02"][0][:12]]}')

    f = d / 'hycom_atlantico_25W.tif'
    if f.exists():
        arr, geo = read_tif(f)
        sec = section(TS(arr), geo, 'lat', len(LEV), 69.5, -1, 150)
        T, S = sec[:len(LEV)], sec[len(LEV):]
        out['atl'] = {'lat0': 69.5, 'dlat': -1, 'n': 150, 'z': LEV, 'lon': -25, **packTS(list(T), list(S))}
        report('atlántico T', out['atl']['T'], [np.clip(t, -2.5, 33) for t in T])

    f = d / 'hycom_gibraltar_36N.tif'
    if f.exists():
        arr, geo = read_tif(f)
        sec = section(TS(arr), geo, 'lon', len(LEV), -19.95, 0.1, 200)
        T, S = sec[:len(LEV)], sec[len(LEV):]
        out['gib'] = {'lon0': -19.95, 'dlon': 0.1, 'n': 200, 'z': LEV, 'lat': 35.95, **packTS(list(T), list(S))}
        report('Gibraltar S', out['gib']['S'], [np.clip(s, 30, 41.5) for s in S])

    fw, fe = d / 'hycom_ecuador_oeste.tif', d / 'hycom_ecuador_este.tif'
    if fw.exists() and fe.exists():
        aw, gw = read_tif(fw); ae, ge = read_tif(fe)
        sw = section(TS(aw), gw, 'lon', 2 * len(LEVEQ), 120.5, 1, 60)
        se = section(TS(ae), ge, 'lon', 2 * len(LEVEQ), -179.5, 1, 100)
        sec = np.concatenate([sw, se], axis=1)  # 120,5° E … 80,5° O
        nl = len(LEVEQ)
        out['eq'] = {'lon0': 120.5, 'dlon': 1, 'n': 160, 'z': LEVEQ,
                     'T': pack([np.clip(t, -2.5, 33) for t in sec[:nl]], lo=-2.5, step=0.15),
                     'N': pack([np.clip(t, -2.5, 33) for t in sec[nl:]], lo=-2.5, step=0.15)}
        report('ecuador', out['eq']['T'], [np.clip(t, -2.5, 33) for t in sec[:nl]])

    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB; partes: {[k for k in out if k != "src"]}')


if __name__ == '__main__':
    main(sys.argv[1:])
