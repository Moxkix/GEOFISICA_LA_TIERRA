#!/usr/bin/env python3
"""Convierte las exportaciones de gee/tema5_terraclimate.js en los datos de los Temas 5 y 6:

  data/tema5/koppen_mundo.json   rejilla de 0,5° (tierra firme entre 60° S y 84° N):
      T, P   temperatura y precipitación medias de cada mes, 1991-2020 (para el climograma de cualquier celda)
      K      tipo de Köppen de cada celda en 1991-2020 y 1961-1990, para las 8 combinaciones de criterios
      AI     índice de aridez P/ETP (1991-2020); Z altitud media de la celda
  data/tema5/koppen_espana.json  España a ≈4 km (península, Baleares, Ceuta, Melilla y Canarias):
      pen, can   tipo de Köppen de cada celda en los dos periodos (8 combinaciones)
      mun        temperatura y precipitación de cada mes en los 8.132 municipios, en los dos periodos, y ETP anual;
                 la temperatura se corrige con la diferencia entre la altitud del municipio (data/mun.json) y la
                 altitud media de la celda (−0,65 °C cada 100 m)

La clasificación la hace data/tema5/classify.js con el mismo motor que el navegador (src/tema5/koppen.js), y para el
periodo 1991-2020 del mapa mundial se aplica a los valores ya cuantificados que recibe el navegador: así el tipo del
mapa coincide siempre con el que da el clasificador al pulsar una celda.

Uso:
  python3 data/tema5/make_koppen.py tc_mundo_9120_TPZ.tif tc_mundo_9120_E.tif tc_mundo_6190_TP.tif \\
                                    tc_espana_peninsula.tif tc_espana_canarias.tif
  (los archivos se reconocen por el nombre; se pueden dar solo los del mundo o solo los de España)
  python3 data/tema5/make_koppen.py --prueba-era5     mapa mundial de prueba a 2° con ERA5 (no publicar)
"""
import base64, json, math, pathlib, subprocess, sys, tempfile
import numpy as np
R = pathlib.Path(__file__).parent
sys.path.insert(0, str(R.parent / 'tema4'))
from gt4 import read_tif, pack, unpack, size_kb  # noqa: E402

LAPSE = 0.0065
DES = {'gobi': (43.0, 105.0), 'karakum': (39.0, 60.0), 'victoria': (-29.0, 127.0), 'arabia': (23.0, 47.0), 'sahara': (23.0, 10.0),
       'namib': (-23.5, 15.0), 'mojave': (35.0, -116.0), 'atacama': (-23.0, -69.8)}


def classify(T, P, lat):
    """T, P: (N, 12); lat: (N,) → (8, N) códigos uint8"""
    N = T.shape[0]
    a = np.concatenate([T, P, lat[:, None]], axis=1).astype('<f4')
    with tempfile.TemporaryDirectory() as d:
        fi, fo = pathlib.Path(d) / 'in.bin', pathlib.Path(d) / 'out.bin'
        fi.write_bytes(a.tobytes())
        subprocess.run(['node', str(R / 'classify.js'), str(fi), str(fo)], check=True)
        return np.frombuffer(fo.read_bytes(), dtype='uint8').reshape(8, N)


def grid_classes(T, P, lats):
    """T, P: (12, ny, nx) → (8, ny, nx) con 255 donde no hay dato"""
    ny, nx = T.shape[1:]
    ok = np.isfinite(T[0]) & np.isfinite(P[0])
    jj, ii = np.nonzero(ok)
    codes = classify(T[:, jj, ii].T, P[:, jj, ii].T, lats[jj])
    K = np.full((8, ny, nx), np.nan)
    K[:, jj, ii] = codes
    return K


def kpack(K):
    return pack([k for k in K], 'lin', lo=0, hi=254, step=1)


def geo_meta(geo, shape):
    x0, y0, dx, dy = geo
    return {'nx': int(shape[-1]), 'ny': int(shape[-2]), 'lon0': round(x0, 6), 'lat0': round(y0, 6), 'res': round(dx, 8)}


def mundo(files):
    tpz, geo = read_tif(files['TPZ']); e, _ = read_tif(files['E']); tp61, _ = read_tif(files['61'])
    T91, P91, Z = tpz[:12] / 10, tpz[12:24] / 10, tpz[24]
    E91, T61, P61 = e[:12] / 10, tp61[:12] / 10, tp61[12:24] / 10
    m = geo_meta(geo, T91.shape); m['res'] = round(m['res'] * 24) / 24
    lats = m['lat0'] - (np.arange(m['ny']) + 0.5) * m['res']
    land = np.isfinite(T91[0]) & np.isfinite(P91[0])
    for a in (T91, P91, E91, T61, P61): a[:, ~land] = np.nan
    Z = np.where(land, Z, np.nan)
    print(f'Mundo: {m["nx"]}×{m["ny"]} celdas de {m["res"]}°, {land.sum()} de tierra; T 1991-2020 de {np.nanmin(T91):.1f} a {np.nanmax(T91):.1f} °C; P mensual máx. {np.nanmax(P91):.0f} mm')
    return build_mundo(m, lats, T91, P91, E91, T61, P61, Z, 'TerraClimate (Abatzoglou y otros, 2018) vía Google Earth Engine, normales 1991-2020 y 1961-1990; celdas de 0,5° (media de los píxeles de 1/24°)')


def build_mundo(m, lats, T91, P91, E91, T61, P61, Z, src, prueba=False):
    eT = pack([t for t in T91], 'i16', lo=0, hi=0.1)   # décimas de °C
    eP = pack([p for p in P91], 'lut', table=ptable())
    Tq, Pq = unpack(eT).reshape(T91.shape), unpack(eP).reshape(P91.shape)
    print(f'  cuantificación: T máx. error {np.nanmax(np.abs(Tq - T91)):.3f} °C; P máx. error relativo {np.nanmax(np.abs(Pq - P91) / np.maximum(P91, 1)) * 100:.1f} %')
    K91, K61 = grid_classes(Tq, Pq, lats), grid_classes(T61, P61, lats)
    with np.errstate(invalid='ignore', divide='ignore'):
        AI = np.nansum(P91, axis=0) / np.nansum(E91, axis=0)
    AI = np.where(np.isfinite(T91[0]) & (np.nansum(E91, axis=0) > 0), AI, np.nan)
    out = dict(m, src=src, T=eT, P=eP, K={'91': kpack(K91), '61': kpack(K61)},
               AI=pack(AI, 'lut', table=aitable()), Z=pack(Z, 'i16', lo=0, hi=1))
    if prueba: out['prueba'] = True
    # precipitación de los desiertos del Tema 5 (celda con datos más próxima)
    des = {}
    for k, (la, lo) in DES.items():
        j, i = int((m['lat0'] - la) / m['res']), int((lo - m['lon0']) / m['res'])
        best = None
        for r in range(0, 4):
            for jj in range(j - r, j + r + 1):
                for ii in range(i - r, i + r + 1):
                    if 0 <= jj < m['ny'] and np.isfinite(P91[0, jj, ii % m['nx']]):
                        best = (jj, ii % m['nx']); break
                if best: break
            if best: break
        if best: des[k] = {'p': int(round(float(np.nansum(P91[:, best[0], best[1]]))))}
    out['desiertos'] = des
    for k in ('T', 'P', 'AI', 'Z'): print(f'  {k}: {size_kb(out[k]):.0f} KB')
    print(f'  K: {size_kb(out["K"]["91"]) + size_kb(out["K"]["61"]):.0f} KB')
    return out


def ptable():
    """tabla de precipitación mensual (mm): décimas hasta 20 mm, luego pasos crecientes hasta 3.000"""
    t = list(np.round(np.arange(0, 20, 0.2), 1))                 # 100 valores
    t += list(np.round(np.arange(20, 100, 1.0), 1))              # 80
    v = 100.0
    while len(t) < 255:
        t.append(round(v)); v *= 1.0 + math.log(3000 / 100) / (255 - 180)
    return np.array(t[:255])


def aitable():
    return np.round(np.concatenate([np.linspace(0, 1, 201), np.linspace(1.025, 4.0, 54)]), 4)


def espana(files):
    MUN = json.load(open(R.parent / 'mun.json'))['m']
    regs, out = {}, {}
    for key in ('pen', 'can'):
        if key not in files: continue
        a, geo = read_tif(files[key])
        d = {'T91': a[0:12] / 10, 'P91': a[12:24] / 10, 'E91': a[24:36] / 10, 'T61': a[36:48] / 10, 'P61': a[48:60] / 10, 'Z': a[60]}
        m = geo_meta(geo, a.shape); m['res'] = round(m['res'] * 24) / 24
        land = np.isfinite(d['T91'][0])
        lats = m['lat0'] - (np.arange(m['ny']) + 0.5) * m['res']
        K91, K61 = grid_classes(d['T91'], d['P91'], lats), grid_classes(d['T61'], d['P61'], lats)
        regs[key] = (m, d, land)
        out[key] = dict(m, K={'91': kpack(K91), '61': kpack(K61)})
        print(f'España ({key}): {m["nx"]}×{m["ny"]} celdas, {land.sum()} de tierra; K {size_kb(out[key]["K"]["91"]) + size_kb(out[key]["K"]["61"]):.0f} KB')
    # municipios: media ponderada por la inversa de la distancia de las 4 celdas de tierra más próximas, con corrección por altitud
    n = len(MUN)
    V = {k: np.full((12, n), np.nan) for k in ('T91', 'P91', 'T61', 'P61')}
    E = np.full(n, np.nan); dz = np.full(n, np.nan)
    for idx, (name, prov, lat, lon, alt) in enumerate(MUN):
        key = 'can' if lat < 30 and lon < -12 else 'pen'
        if key not in regs: continue
        m, d, land = regs[key]
        fj, fi = (m['lat0'] - lat) / m['res'] - 0.5, (lon - m['lon0']) / m['res'] - 0.5
        cand = []
        for r in (1, 2, 3, 5):
            cand = []
            for jj in range(int(math.floor(fj)) - r + 1, int(math.floor(fj)) + r + 1):
                for ii in range(int(math.floor(fi)) - r + 1, int(math.floor(fi)) + r + 1):
                    if 0 <= jj < m['ny'] and 0 <= ii < m['nx'] and land[jj, ii]:
                        cand.append((math.hypot(jj - fj, (ii - fi) * math.cos(math.radians(lat))), jj, ii))
            if len(cand) >= 2: break
        if not cand: continue
        cand.sort(); cand = cand[:4]
        w = np.array([1 / max(c[0], 0.05) ** 2 for c in cand]); w /= w.sum()
        J, I = [c[1] for c in cand], [c[2] for c in cand]
        zc = float((d['Z'][J, I] * w).sum())
        corr = LAPSE * (zc - alt) if alt is not None else 0.0
        dz[idx] = zc - alt if alt is not None else np.nan
        for k in V:
            v = (d[k][:, J, I] * w).sum(axis=1)
            V[k][:, idx] = v + (corr if k.startswith('T') else 0)
        E[idx] = float((d['E91'][:, J, I].sum(axis=0) * w).sum())
    ok = np.isfinite(V['T91'][0])
    print(f'Municipios: {ok.sum()} de {n} con datos; diferencia de altitud municipio-celda: media {np.nanmean(-dz):.0f} m, '
          f'percentiles 5-95 {np.nanpercentile(-dz, 5):.0f} / {np.nanpercentile(-dz, 95):.0f} m')
    mun = {k: pack([v for v in V[k]], 'i16', lo=0, hi=0.1) for k in V}
    mun['E'] = pack(E, 'i16', lo=0, hi=1)
    out['mun'] = mun
    out['src'] = 'TerraClimate (Abatzoglou y otros, 2018) vía Google Earth Engine, normales 1991-2020 y 1961-1990 (≈4 km); municipios corregidos por altitud'
    print(f'  mun: {sum(size_kb(v) for v in mun.values()):.0f} KB')
    return out


def prueba_era5():
    g = json.load(open(R.parent / 'tema2' / 'era5_grid.json'))
    c = json.load(open(R.parent / 'tema3' / 'era5_clima.json'))
    nx, ny = int(g['nx']), int(g['ny'])
    dec16 = lambda s: np.frombuffer(base64.b64decode(s), dtype='<i2').astype(float)
    T = np.array([dec16(s) / 10 for s in g['t']]).reshape(12, ny, nx)
    Z = (dec16(g['e']) * 10).reshape(ny, nx)
    q = lambda e: np.frombuffer(base64.b64decode(e['q']), dtype='uint8').astype(float)
    P = np.array([e['s'] * q(e) ** 2 if e.get('f') == 'sq' else e.get('o', 0) + e['s'] * q(e) for e in c['r']]).reshape(12, ny, nx)
    O = json.load(open(R.parent / 'tema4' / 'oceano.json'))
    sst = np.nanmean(unpack(O['sst']), axis=0).reshape(180, 360)
    sea = np.isfinite(sst).reshape(90, 2, 180, 2).mean(axis=(1, 3)) > 0.5
    T[:, sea] = np.nan; P[:, sea] = np.nan; Z = np.where(sea, np.nan, Z)
    E = np.where(np.isfinite(T), np.maximum(T, 0) * 6 + 20, np.nan)
    lats = 90 - (np.arange(ny) + 0.5) * 2
    m = {'nx': nx, 'ny': ny, 'lon0': -180, 'lat0': 90, 'res': 2}
    out = build_mundo(m, lats, T, P, E, T - 0.5, P, Z, 'PRUEBA con ERA5 a 2° (no publicar)', prueba=True)
    (R / 'koppen_mundo.json').write_text(json.dumps(out, separators=(',', ':')))
    print('→ data/tema5/koppen_mundo.json (PRUEBA)')


def main(a):
    if not a: raise SystemExit(__doc__)
    if a[0] == '--prueba-era5': return prueba_era5()
    files = {}
    for p in a:
        n = pathlib.Path(p).name.lower()
        if 'tpz' in n: files['TPZ'] = p
        elif '9120_e' in n or n.startswith('tc_mundo_9120_e'): files['E'] = p
        elif '6190' in n: files['61'] = p
        elif 'peninsula' in n: files['pen'] = p
        elif 'canarias' in n: files['can'] = p
        else: raise SystemExit(f'No reconozco {p}')
    if {'TPZ', 'E', '61'} <= files.keys():
        out = mundo(files)
        f = R / 'koppen_mundo.json'; f.write_text(json.dumps(out, separators=(',', ':')))
        print(f'→ {f} ({f.stat().st_size / 1024:.0f} KB)')
    if 'pen' in files:
        out = espana(files)
        f = R / 'koppen_espana.json'; f.write_text(json.dumps(out, separators=(',', ':')))
        print(f'→ {f} ({f.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main(sys.argv[1:])
