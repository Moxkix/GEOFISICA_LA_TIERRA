#!/usr/bin/env python3
"""Convierte oni.ascii.txt (NOAA CPC, índice oceánico de El Niño) en data/tema4/enso.json (variable ENSO):
t = año decimal del mes central de cada trimestre móvil, v = anomalía (°C) respecto a periodos base de 30 años
que se actualizan cada 5 años (método de CPC).

Uso:  python3 data/tema4/make_enso.py carpeta [salida.json]
"""
import json, pathlib, sys

R = pathlib.Path(__file__).parent
SEAS = ['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ']


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'enso.json'
    t, v = [], []
    for line in (d / 'oni.ascii.txt').read_text().splitlines():
        p = line.split()
        if len(p) >= 4 and p[0] in SEAS:
            m = SEAS.index(p[0])  # mes central: DJF → enero
            t.append(round(int(p[1]) + m / 12 + 1 / 24, 3)); v.append(float(p[3]))
    out = {'src': 'NOAA Climate Prediction Center, índice ONI (ERSST v5)', 't': t, 'v': v}
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    nino = [t[i] for i in range(len(v)) if v[i] >= 1.5]
    print(f'{len(t)} trimestres {t[0]:.0f}-{t[-1]:.2f}; máximo {max(v)} en {t[v.index(max(v))]:.2f}; mínimo {min(v)}')


if __name__ == '__main__':
    main(sys.argv[1:])
