#!/usr/bin/env python3
"""Añade a data/mun.json la altitud (m) de cada municipio exportada por gee/altitud_municipios.js.
Cada municipio pasa de [nombre, provincia, lat, lon] a [nombre, provincia, lat, lon, altitud].

Para cada municipio se usa la altitud del punto con más superficie construida residencial cerca del centroide
(columna alt), siempre que ese punto caiga dentro del término municipal (polígonos de es-atlas, IGN); si no, o si
no hay superficie construida, la altitud del centroide (alt0).

Uso:  python3 data/tema3/add_altitudes.py altitud_municipios.csv es-atlas/package/es/municipalities.json
"""
import csv, json, pathlib, sys

R = pathlib.Path(__file__).resolve().parent
MUN = R.parent / 'mun.json'
sys.path.insert(0, str(R))
from gen_altitud_gee import topo_polygons  # noqa: E402


def inside(rings, lon, lat):
    """Regla par-impar sobre todos los anillos (exteriores y huecos)."""
    c = False
    for r in rings:
        for (x1, y1), (x2, y2) in zip(r, r[1:]):
            if (y1 > lat) != (y2 > lat) and lon < x1 + (lat - y1) * (x2 - x1) / (y2 - y1):
                c = not c
    return c


def main(a):
    if len(a) < 2:
        raise SystemExit(__doc__)
    d = json.loads(MUN.read_text(encoding='utf-8'))
    ine = json.loads((R / 'mun_ine.json').read_text())
    polys = topo_polygons(a[1])
    num = lambda x: float(x) if x not in (None, '') else None
    rows = {int(float(r['i'])): r for r in csv.DictReader(open(a[0], newline='', encoding='utf-8'))}
    n_town = n_cent = n_none = 0
    report = []
    for i, m in enumerate(d['m']):
        r = rows.get(i, {})
        alt0, alt, b, lon, lat = (num(r.get(k)) for k in ('alt0', 'alt', 'b', 'lon', 'lat'))
        v = None
        if alt is not None and b and b > 0 and lon is not None and ine[i] in polys and inside(polys[ine[i]], lon, lat):
            v = alt; n_town += 1
        elif alt0 is not None:
            v = alt0; n_cent += 1
        else:
            n_none += 1
        del m[4:]
        m.append(None if v is None else max(0, round(v)))
        if alt0 is not None and v is not None and abs(v - alt0) > 400:
            report.append((m[0], round(alt0), round(v)))
    MUN.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'Altitud del núcleo: {n_town}; del centroide (punto fuera del término o sin edificios): {n_cent}; sin dato: {n_none}')
    print(f'{len(report)} municipios cambian más de 400 m respecto al centroide, p. ej.:', ', '.join(f'{n} {a0}→{v}' for n, a0, v in report[:12]))
    for n in ('Madrid', 'Bilbao', 'Ávila', 'Soria', 'Cuenca', 'Cáceres', 'Teruel', 'Granada', 'Espot', 'Trevélez', 'Benasque', 'Lorca', 'Navacerrada'):
        m = next((m for m in d['m'] if m[0] == n), None)
        if m:
            print(f'  {n}: {m[4]} m')


if __name__ == '__main__':
    main(sys.argv[1:])
