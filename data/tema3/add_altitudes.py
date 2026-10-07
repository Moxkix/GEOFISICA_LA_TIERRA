#!/usr/bin/env python3
"""Añade a data/mun.json la altitud (m) de cada municipio exportada por gee/altitud_municipios.js.
Cada municipio pasa de [nombre, provincia, lat, lon] a [nombre, provincia, lat, lon, altitud].

El script de GEE da tres candidatos a núcleo de población (columnas m1/alt1/lon1/lat1, m2…, m3…): se toma la altitud
del primero que tiene población o edificación y cae dentro del término municipal (polígonos de es-atlas, IGN); si
ninguno, la del centroide (alt0). También admite la versión anterior de la tabla (b/alt/lon/lat).

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
    stats = {'1': 0, '2': 0, '3': 0, 'centroide': 0, 'sin dato': 0}
    report = []
    for i, m in enumerate(d['m']):
        r = rows.get(i, {})
        alt0 = num(r.get('alt0'))
        cands = [(k, num(r.get('m' + k)), num(r.get('alt' + k)), num(r.get('lon' + k)), num(r.get('lat' + k))) for k in ('1', '2', '3')]
        if 'b' in r:  # tabla de la versión anterior
            cands = [('1', num(r.get('b')), num(r.get('alt')), num(r.get('lon')), num(r.get('lat')))]
        v = None
        for k, w, a_, lo, la in cands:
            if a_ is not None and w and w > 0 and lo is not None and ine[i] in polys and inside(polys[ine[i]], lo, la):
                v = a_; stats[k] += 1; break
        if v is None:
            if alt0 is not None:
                v = alt0; stats['centroide'] += 1
            else:
                stats['sin dato'] += 1
        del m[4:]
        m.append(None if v is None else max(0, round(v)))
        if alt0 is not None and v is not None and abs(v - alt0) > 400:
            report.append((m[0], round(alt0), round(v)))
    MUN.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('Altitud tomada del candidato:', ', '.join(f'{k}: {v}' for k, v in stats.items()))
    print(f'{len(report)} municipios cambian más de 400 m respecto al centroide, p. ej.:', ', '.join(f'{n} {a0}→{v}' for n, a0, v in report[:12]))
    for n in ('Madrid', 'Bilbao', 'Ávila', 'Soria', 'Cuenca', 'Cáceres', 'Teruel', 'Granada', 'Murcia', 'Badajoz', 'Espot', 'Trevélez', 'Benasque', 'Lorca', 'Navacerrada', 'Adeje'):
        m = next((m for m in d['m'] if m[0] == n), None)
        if m:
            print(f'  {n}: {m[4]} m')


if __name__ == '__main__':
    main(sys.argv[1:])
