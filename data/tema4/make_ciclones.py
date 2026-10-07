#!/usr/bin/env python3
"""Convierte ibtracs_1991_2020.csv (gee/tema4_relieve_ciclones.js) en data/tema4/ciclones.json (variable CICLONES):
posiciones cada 6 h de los ciclones tropicales 1991-2020 con viento de al menos 34 nudos (tormenta tropical),
ordenadas por ciclón y por fecha: latitud y longitud (décimas de grado), mes y categoría Saffir-Simpson (−1 = tormenta
tropical; 1-5 = huracán), más algunos datos de resumen por cuenca.

Uso:  python3 data/tema4/make_ciclones.py carpeta [salida.json]
"""
import csv, json, pathlib, sys
from collections import Counter, defaultdict
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import pack, size_kb

R = pathlib.Path(__file__).parent


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'ciclones.json'
    rows = list(csv.DictReader(open(d / 'ibtracs_1991_2020.csv', newline='', encoding='utf-8')))
    tracks = defaultdict(list)
    for r in rows:
        w = num(r.get('USA_WIND')) or num(r.get('WMO_WIND'))
        lat, lon = num(r.get('lat')), num(r.get('lon'))
        if w is None or w < 34 or lat is None or lon is None:
            continue
        if (r.get('NATURE') or 'TS') not in ('TS', 'NR', 'MX'):  # solo fase tropical
            continue
        cat = num(r.get('USA_SSHS'))
        tracks[r['SID']].append((r['ISO_TIME'], lat, ((lon + 540) % 360) - 180, int(r['ISO_TIME'][5:7]), int(cat) if cat is not None and cat >= 1 else 0, r.get('BASIN', ''), int(num(r.get('SEASON')) or 0), w))
    la, lo, mo, ca, start = [], [], [], [], []
    per_basin = Counter(); hurr = Counter(); maxw = []
    for sid, pts in sorted(tracks.items()):
        pts.sort()
        start.append(len(la))
        for t, y, x, m, c, b, s, w in pts:
            la.append(y); lo.append(x); mo.append(m); ca.append(c)
        b = Counter(p[5] for p in pts).most_common(1)[0][0]
        per_basin[b] += 1
        if max(p[7] for p in pts) >= 64:
            hurr[b] += 1
        maxw.append(max(p[7] for p in pts))
    years = sorted({p[6] for v in tracks.values() for p in v})
    ny = len(years)
    out = {'src': 'NOAA IBTrACS v4 (Knapp y otros, 2010), vía Google Earth Engine; trayectorias principales, cada 6 h', 'y0': years[0], 'y1': years[-1],
           'n': len(tracks), 'start': start,
           'lat': pack([np.array(la)], mode='i16', lo=0, hi=0.1), 'lon': pack([np.array(lo)], mode='i16', lo=0, hi=0.1),
           'mon': pack([np.array(mo, dtype=float)], lo=0, step=1), 'cat': pack([np.array(ca, dtype=float)], lo=0, step=1),
           'basins': {b: [round(per_basin[b] / ny, 1), round(hurr[b] / ny, 1)] for b in per_basin}}
    for k in ('lat', 'lon', 'mon', 'cat'):
        print(f'  {k}: {size_kb(out[k]):.0f} KB')
    print(f'{len(tracks)} ciclones ({len(tracks) / ny:.1f} al año), {len(la)} posiciones; por cuenca (al año, de ellos huracanes): {out["basins"]}')
    out_path.write_text(json.dumps(out, separators=(',', ':')))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1:])
