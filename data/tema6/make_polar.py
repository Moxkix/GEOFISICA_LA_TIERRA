"""Tema 6 · datos polares del hemisferio sur (TerraClimate no cubre la Antártida).
Toma del reanálisis ERA5 1991-2020 ya usado en los Temas 2 y 3:
  · la temperatura del mes más cálido al norte de 40° N y al sur de 40° S (rejilla de 2°, con el mar), para trazar
    las isotermas de 10 °C y 0 °C del mes más cálido que delimitan los climas polares;
  · la temperatura media mensual a 2 m al sur de 56° S (rejilla de 2°), para el mapa polar y las isotermas
    del mes más cálido;
  · la precipitación media mensual en el Polo Sur (fila de 88°-90° S), para el climograma del clima de hielo
    perpetuo: los pluviómetros no miden bien la nieve con viento, y la estación Amundsen-Scott no figura en las
    normales de la OMM de NOAA. La temperatura del climograma es la de la estación (normales 1991-2020 de
    pogoda.ru.net, recogidas en la Wikipedia), porque ERA5 es varios grados más cálido en el invierno polar.
Salida: data/tema6/polar.json (formato comprimido de data/tema4/gt4.py)."""
import json, base64, pathlib, sys
import numpy as np
R = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / 'tema4'))
import gt4

g = json.load(open(R / 'tema2' / 'era5_grid.json'))
nx, ny, res, lat0 = g['nx'], g['ny'], g['res'], g['lat0']
T = np.array([np.frombuffer(base64.b64decode(t), dtype='<i2').astype(float) / 10 for t in g['t']]).reshape(12, ny, nx)
c = json.load(open(R / 'tema3' / 'era5_clima.json'))
def dec(o):
    b = np.frombuffer(base64.b64decode(o['q']), dtype=np.uint8).astype(float)
    return o['s'] * b * b if o.get('f') == 'sq' else o.get('o', 0) + o['s'] * b
P = np.array([dec(o) for o in c['r']]).reshape(12, c['ny'], c['nx'])  # mm/mes
assert (c['nx'], c['ny'], c['res']) == (nx, ny, res)

j0 = int(round((lat0 - (-56)) / res))  # primera fila al sur de 56° S
sub = T[:, j0:, :]
# temperatura del mes más cálido en las dos zonas polares (al norte de 40° N y al sur de 40° S), con el mar:
# sirve para trazar las isotermas de 10 °C y 0 °C de forma continua sobre tierra y mar
jn = int(round((lat0 - 40) / res)); js = int(round((lat0 + 40) / res))
warmN, warmS = T[:, :jn, :].max(axis=0), T[:, js:, :].max(axis=0)
out = {'src': 'ERA5 (Copernicus/ECMWF), temperatura a 2 m y precipitación, medias mensuales 1991-2020 (julio-diciembre, 1991-2019)',
       'sh': {'nx': nx, 'ny': sub.shape[1], 'lon0': g['lon0'], 'lat0': lat0 - j0 * res, 'res': res,
              'T': gt4.pack(list(sub), 'lin', lo=-72, step=0.32)},
       'wn': {'nx': nx, 'ny': warmN.shape[0], 'lon0': g['lon0'], 'lat0': lat0, 'res': res, 'W': gt4.pack(warmN, 'lin', lo=-40, step=0.25)},
       'ws': {'nx': nx, 'ny': warmS.shape[0], 'lon0': g['lon0'], 'lat0': lat0 - js * res, 'res': res, 'W': gt4.pack(warmS, 'lin', lo=-40, step=0.25)},
       'polo': {'T': [-28.1, -40.7, -53.6, -57.4, -57.7, -58.1, -60.2, -59.7, -58.9, -50.9, -37.2, -27.3],
                'Tera5': [round(float(v), 1) for v in T[:, -1, :].mean(axis=1)], 'P': [round(float(v), 1) for v in P[:, -1, :].mean(axis=1)],
                'srcT': 'estación Amundsen-Scott (2.835 m), normales 1991-2020 (pogoda.ru.net)', 'srcP': 'reanálisis ERA5'}}
back = gt4.unpack(out['sh']['T']).reshape(sub.shape)
print('error máximo de cuantificación:', round(float(np.nanmax(np.abs(back - sub))), 2), '°C')
print('Polo Sur T (estación):', out['polo']['T'], '\nPolo Sur T (ERA5):', out['polo']['Tera5'], '\nPolo Sur P:', out['polo']['P'], 'total', round(sum(out['polo']['P'])))
print('mes más cálido en la fila 64-66° S:', np.round(T[:, int(round((lat0 + 64) / res)), ::15].max(axis=0), 1))
(R / 'tema6' / 'polar.json').write_text(json.dumps(out, separators=(',', ':')))
print('polar.json', round((R / 'tema6' / 'polar.json').stat().st_size / 1024, 1), 'KB')
