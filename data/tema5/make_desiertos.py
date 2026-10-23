#!/usr/bin/env python3
"""Datos de los ocho desiertos del ejercicio 5 del Tema 5 → data/tema5/desiertos.json.

Para cada desierto (punto central):
  · presión media a nivel del mar, anual, de enero y de julio (ERA5 1991-2020, data/tema3/era5_clima.json, rejilla de 2°);
  · precipitación anual: TerraClimate 1991-2020 si existe data/tema5/koppen_mundo.json (celda de 0,5°);
    si no, ERA5 (rejilla de 2°);
  · distancia al mar más próximo (celdas de mar de 1° de OISST, data/tema4/oceano.json);
  · anomalía de la temperatura del mar en la costa occidental a la misma latitud, respecto a la media de todo
    el océano en esa latitud (OISST 1991-2020): negativa donde hay corriente fría y afloramiento.

Uso:  python3 data/tema5/make_desiertos.py
"""
import base64, json, math, pathlib, sys
import numpy as np
R = pathlib.Path(__file__).parent
sys.path.insert(0, str(R.parent / 'tema4'))
from gt4 import unpack  # noqa: E402

DES = [  # clave, nombre, lat, lon
    ('gobi', 'Gobi', 43.0, 105.0), ('karakum', 'Karakum', 39.0, 60.0), ('victoria', 'Gran Desierto Victoria', -29.0, 127.0),
    ('arabia', 'Desierto Arábigo', 23.0, 47.0), ('sahara', 'Sahara', 23.0, 10.0), ('namib', 'Namib', -23.5, 15.0),
    ('mojave', 'Mojave', 35.0, -116.0), ('atacama', 'Atacama', -23.0, -69.8)]


def era5(e):
    q = np.frombuffer(base64.b64decode(e['q']), dtype='uint8').astype(float)
    return e['s'] * q ** 2 if e.get('f') == 'sq' else e.get('o', 0) + e['s'] * q


def hav(a, b, c, d):
    p1, p2 = math.radians(a), math.radians(c)
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def main():
    C = json.load(open(R.parent / 'tema3' / 'era5_clima.json'))
    nx, ny = int(C['nx']), int(C['ny'])
    P = np.array([era5(e) for e in C['p']]).reshape(12, ny, nx)
    Rr = np.array([era5(e) for e in C['r']]).reshape(12, ny, nx)
    O = json.load(open(R.parent / 'tema4' / 'oceano.json'))
    sst = np.nanmean(unpack(O['sst']), axis=0).reshape(180, 360)
    zon = np.nanmean(sst, axis=1)
    K = None
    kp = R / 'koppen_mundo.json'
    if kp.exists():
        K = json.load(open(kp))
    out = []
    for key, name, lat, lon in DES:
        j, i = int((90 - lat) / 2), int((lon + 180) / 2) % nx
        slp = P[:, j, i]
        pr = float(Rr[:, j, i].sum()); psrc = 'ERA5'
        if K and 'desiertos' in K:
            d = K['desiertos'].get(key)
            if d: pr, psrc = d['p'], 'TerraClimate'
        # mar más próximo
        best = (1e9, None)
        for jj in range(180):
            la = 89.5 - jj
            if abs(la - lat) > 25: continue
            for ii in range(360):
                if np.isfinite(sst[jj, ii]):
                    d = hav(lat, lon, la, -179.5 + ii)
                    if d < best[0]: best = (d, (la, -179.5 + ii))
        # costa occidental a la misma latitud
        jj = int(90 - lat); ii0 = int(lon + 180); west = None
        for k in range(1, 60):
            ii = (ii0 - k) % 360
            if np.isfinite(sst[jj, ii]):
                west = {'lon': round(-179.5 + ii, 1), 'km': round(hav(lat, lon, lat, -179.5 + ii)), 'sst': round(float(sst[jj, ii]), 1), 'anom': round(float(sst[jj, ii] - zon[jj]), 1)}
                break
        out.append({'k': key, 'name': name, 'lat': lat, 'lon': lon, 'slp': round(float(slp.mean()), 1), 'slp1': round(float(slp[0]), 1), 'slp7': round(float(slp[6]), 1),
                    'p': round(pr), 'psrc': psrc, 'sea': round(best[0]), 'west': west})
        print(name, out[-1])
    (R / 'desiertos.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))


if __name__ == '__main__':
    main()
