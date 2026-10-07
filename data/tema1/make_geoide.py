#!/usr/bin/env python3
"""Ondulación del geoide EGM96 (NGA) en una rejilla de 1° → data/tema1/geoide.json (variable GEOIDE del Tema 1).

Fuente: la rejilla oficial de 15′ de la NGA (WW15MGH.DAC: 721 filas de 90° N a 90° S × 1440 columnas de 0° a 359,75° E,
enteros de 16 bits big-endian en centímetros). Se puede leer directamente ese archivo o el paquete de npm
egm96-universal, que lleva la misma rejilla en base64 (dist/egm96-universal.cjs.js); el script no ejecuta el paquete,
solo extrae los datos.

Salida: valores en los nodos de 1° (lat 90…−90, lon −180…179) en decímetros, codificados con un predictor 2D
(v − izquierda − arriba + arriba-izquierda), enteros de 16 bits little-endian, zlib y base64. Se añaden el mínimo y
el máximo de la rejilla de 15′ con su posición, y un recorte de la rejilla de 15′ para España (27°-44,5° N, 18,5° O-4,5° E),
para que el valor en el municipio no dependa de interpolar entre nodos separados 1° (más de 1 m de error en el interior).

Uso:  python3 data/tema1/make_geoide.py WW15MGH.DAC | egm96-universal.cjs.js  [salida.json]
"""
import base64, json, pathlib, re, sys, zlib
import numpy as np

R = pathlib.Path(__file__).parent


def read(path):
    p = pathlib.Path(path)
    if p.suffix.lower() == '.js':
        m = re.search(r'var data = "([A-Za-z0-9+/=]+)"', p.read_text())
        raw = base64.b64decode(m.group(1))
    else:
        raw = p.read_bytes()
    return np.frombuffer(raw, dtype='>i2').reshape(721, 1440).astype(float) / 100


def enc(g):
    """decímetros, predictor 2D, int16 little-endian, zlib, base64"""
    q = np.round(g * 10).astype(np.int32)
    pred = np.zeros_like(q)
    pred[1:, 1:] = q[1:, :-1] + q[:-1, 1:] - q[:-1, :-1]; pred[0, 1:] = q[0, :-1]; pred[1:, 0] = q[:-1, 0]
    return base64.b64encode(zlib.compress((q - pred).astype('<i2').tobytes(), 9)).decode()


def main(a):
    if not a:
        raise SystemExit(__doc__)
    g15 = read(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'geoide.json'
    lons = np.arange(-180, 180)
    g = g15[::4][:, (lons % 360) * 4]                      # nodos de 1°: 181 × 360
    z = enc(g)
    # recorte de 15′ para España
    j0, j1 = int((90 - 44.5) * 4), int((90 - 27) * 4) + 1
    cols = [int(((lo % 360) * 4)) for lo in np.arange(-18.5, 4.5001, 0.25)]
    es = g15[j0:j1][:, cols]
    jn, inn = np.unravel_index(g15.argmin(), g15.shape); jx, ix = np.unravel_index(g15.argmax(), g15.shape)
    lon = lambda i: ((i / 4 + 180) % 360) - 180
    out = {'src': 'EGM96 (NGA), rejilla de 15′ muestreada cada 1°', 'nx': 360, 'ny': 181, 'lon0': -180, 'lat0': 90, 'res': 1, 'scale': 0.1,
           'min': [round(float(g15.min()), 1), 90 - jn / 4, float(lon(inn))], 'max': [round(float(g15.max()), 1), 90 - jx / 4, float(lon(ix))],
           'z': z, 'es': {'nx': es.shape[1], 'ny': es.shape[0], 'lon0': -18.5, 'lat0': 44.5, 'res': 0.25, 'z': enc(es)}}
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'mínimo {out["min"]}, máximo {out["max"]}; España {es.shape[1]}×{es.shape[0]}; → {out_path} ({out_path.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main(sys.argv[1:])
