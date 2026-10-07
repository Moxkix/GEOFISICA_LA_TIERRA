#!/usr/bin/env python3
"""Añade a data/mun.json la altitud (m, modelo SRTM) de cada municipio exportada por gee/altitud_municipios.js.
Cada municipio pasa de [nombre, provincia, lat, lon] a [nombre, provincia, lat, lon, altitud].

Uso:  python3 data/tema3/add_altitudes.py altitud_municipios.csv
"""
import csv, json, pathlib, sys

MUN = pathlib.Path(__file__).parent.parent / 'mun.json'


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = json.loads(MUN.read_text(encoding='utf-8'))
    alt = {}
    for r in csv.DictReader(open(a[0], newline='', encoding='utf-8')):
        if r.get('alt') not in (None, ''):
            alt[int(float(r['i']))] = max(0, round(float(r['alt'])))
    miss = [m[0] for i, m in enumerate(d['m']) if i not in alt]
    for i, m in enumerate(d['m']):
        del m[4:]
        m.append(alt.get(i))
    MUN.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    hi = sorted(d['m'], key=lambda m: -(m[4] or 0))[:5]
    print(f'{len(alt)} altitudes de {len(d["m"])} municipios; sin dato: {len(miss)} {miss[:10]}')
    print('Más altos:', ', '.join(f'{m[0]} {m[4]} m' for m in hi))
    for n in ('Madrid', 'Bilbao', 'Ávila', 'Soria', 'Valencia', 'Teruel', 'Granada'):
        m = next((m for m in d['m'] if m[0] == n), None)
        if m:
            print(f'  {n}: {m[4]} m')


if __name__ == '__main__':
    main(sys.argv[1:])
