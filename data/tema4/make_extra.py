#!/usr/bin/env python3
"""Datos del Tema 4 que salen de los temas anteriores (sin nuevas descargas):

  · data/tema4/vientos.json (variable VIENTOS): presión media a nivel del mar (2°) y viento a 10 m (4°), 12 meses,
    de data/tema3/era5_clima.json, recomprimidos con gt4.pack; para superponer los centros de acción y los vientos
    a las corrientes (fig. 4.8 del manual).
  · en data/tema4/oceano.json, la clave 'aire': medias zonales sobre el océano (rejilla de 2°) de la temperatura del
    mar (OISST) y del aire a 2 m (ERA5, data/tema2/era5_grid.json), anual, enero y julio, para comparar con el
    apartado 3.2 del manual (diferencia mar − aire según la latitud); 'dif': mapas de la diferencia mar − aire;
    't2a': anomalía de la temperatura del aire respecto a la media de su paralelo (anual, enero y julio).

Uso:  python3 data/tema4/make_extra.py   (después de make_oceano.py)
"""
import base64, json, pathlib, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import pack, unpack, size_kb

R = pathlib.Path(__file__).parent
D = R.parent


def dq8(e):
    q = np.frombuffer(base64.b64decode(e['q']), dtype='uint8').astype('float64')
    return e['s'] * q * q if e.get('f') == 'sq' else e['o'] + e['s'] * q


def main():
    c = json.loads((D / 'tema3/era5_clima.json').read_text())
    P = [dq8(e) for e in c['p']]; U = [dq8(e) for e in c['u']]; V = [dq8(e) for e in c['v']]
    out = {'src': c['src'], 'p': {k: c[k] for k in ('nx', 'ny', 'lon0', 'lat0', 'res')}, 'w': c['w'],
           'pr': pack(P, lo=960, step=0.4), 'u': pack(U, lo=-25, step=0.2), 'v': pack(V, lo=-25, step=0.2)}
    for k in ('pr', 'u', 'v'):
        print(f'  {k}: {size_kb(out[k]):.0f} KB')
    (R / 'vientos.json').write_text(json.dumps(out, separators=(',', ':')))
    print('vientos.json', round((R / 'vientos.json').stat().st_size / 1024), 'KB')

    # ---- mar − aire por latitudes ----
    g = json.loads((D / 'tema2/era5_grid.json').read_text())
    t2 = [np.frombuffer(base64.b64decode(s), dtype='<i2').astype(float).reshape(90, 180) / 10 for s in g['t']]
    oc = json.loads((R / 'oceano.json').read_text())
    sst = unpack(oc['sst']).reshape(12, 180, 360)
    # SST a 2°: media de las 4 celdas de 1° si al menos 3 son de mar
    s2 = np.full((12, 90, 180), np.nan)
    for m in range(12):
        b = sst[m].reshape(90, 2, 180, 2)
        n = np.isfinite(b).sum(axis=(1, 3))
        with np.errstate(all='ignore'):
            s2[m] = np.where(n >= 4, np.nanmean(b, axis=(1, 3)), np.nan)
    lat = 89 - 2 * np.arange(90)
    res = {'lat': lat.tolist()}
    for key, ms in (('ann', range(12)), ('ene', [0]), ('jul', [6])):
        ss = np.mean([s2[m] for m in ms], axis=0); aa = np.mean([t2[m] for m in ms], axis=0)
        ok = np.isfinite(ss) & ~((lat[:, None] < -60) & np.ones((1, 180), bool))
        zs, za = [], []
        for j in range(90):
            k = ok[j]
            if k.sum() >= 8:
                zs.append(round(float(ss[j][k].mean()), 2)); za.append(round(float(aa[j][k].mean()), 2))
            else:
                zs.append(None); za.append(None)
        res[key] = {'sst': zs, 't2m': za}
    oc['aire'] = res
    # mapas de la diferencia mar − aire (2°): anual, enero y julio
    difs = [np.mean(s2, axis=0) - np.mean(t2, axis=0), s2[0] - t2[0], s2[6] - t2[6]]
    oc['dif'] = pack([np.clip(d, -6, 10) for d in difs], lo=-6, step=0.1)
    oc['difG'] = {'nx': 180, 'ny': 90, 'lon0': -180, 'lat0': 90, 'res': 2}
    print(f"  dif: {size_kb(oc['dif']):.0f} KB")
    # anomalía de la temperatura del aire respecto a la media de su paralelo (2°): anual, enero y julio
    ta = [np.mean(t2, axis=0), t2[0], t2[6]]
    an = [np.clip(t - t.mean(axis=1, keepdims=True), -25, 25) for t in ta]
    oc['t2a'] = pack(an, lo=-25, step=0.2)
    print(f"  t2a: {size_kb(oc['t2a']):.0f} KB")
    (R / 'oceano.json').write_text(json.dumps(oc, separators=(',', ':'), ensure_ascii=False))
    for la in (49, 41, 29, 19, 9, 1, -11, -21, -41):
        j = int((89 - la) / 2); a = res['ann']
        if a['sst'][j] is not None:
            print(f'  {la:+3d}°: mar {a["sst"][j]:5.1f} °C, aire {a["t2m"][j]:5.1f} °C, diferencia {a["sst"][j] - a["t2m"][j]:+.1f}')


if __name__ == '__main__':
    main()
