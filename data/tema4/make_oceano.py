#!/usr/bin/env python3
"""Convierte las exportaciones de superficie de Earth Engine en data/tema4/oceano.json (variable OCEANO del hub).
Todas las rejillas son globales de 1° (360 × 180), con NaN en tierra; se usan los archivos que haya en la carpeta:

  oisst_clima_1deg.tif          → sst (12 meses, °C)
  oisst_hielo_1deg.tif          → ice (12 meses, % de concentración; días sin hielo = 0 %)
  oisst_anomalias_1deg.tif      → anom (5 meses señalados, °C respecto a 1991-2020; rejilla de 2°)
  modis_clorofila_05deg.tif     → chl (4 estaciones, DEF, MAM, JJA y SON; log10 de mg/m³)
  hycom_superficie_1deg.tif     → sss (12 meses, salinidad práctica), u y v (12 meses, m/s)
  merra2_evap_prec_nativa.tif   → e y p (12 meses, mm/día; de la rejilla de 0,625° × 0,5° de MERRA-2 a 1°)

Uso:  python3 data/tema4/make_oceano.py carpeta_con_los_tif [salida.json]
"""
import json, pathlib, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gt4 import read_tif, cell_mean, pack, unpack, size_kb

R = pathlib.Path(__file__).parent
GLOBE = [-180, 180, -90, 90]
MON = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']


def g1(band, geo, min_frac=0.0):
    return cell_mean(band, geo, GLOBE, 1, wrap=True, min_frac=min_frac)


def check(name, e, ref):
    err = np.nanmax(np.abs(unpack(e) - np.stack(ref).reshape(len(ref), -1)))
    print(f'  {name}: {e["n"]} capas, {size_kb(e):.0f} KB, error máx. de cuantificación {err:.3f}')


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'oceano.json'
    out = json.loads(out_path.read_text()) if out_path.exists() else {}
    out.update({'nx': 360, 'ny': 180, 'lon0': -180, 'lat0': 90, 'res': 1})
    src = out.get('srcs', {})

    f = d / 'oisst_clima_1deg.tif'
    if f.exists():
        arr, geo = read_tif(f)
        sst = [g1(arr[m] / 100, geo) for m in range(12)]
        out['sst'] = pack(sst, lo=-2, step=0.2); check('sst', out['sst'], sst)
        # (las bandas i03 e i09 de este archivo promedian solo los días con hielo: no se usan; ver oisst_hielo_1deg.tif)
        out.pop('ice', None); out.pop('iceOK', None)
        src['sst'] = 'NOAA OISST v2.1 (Huang y otros, 2021), medias 1991-2020'
        lat = 89.5 - np.arange(180)
        w = np.cos(np.radians(lat))[:, None]
        for m in (0, 7):
            s = sst[m]; ok = np.isfinite(s)
            print(f'  SST media del océano, {MON[m]}: {np.sum(np.where(ok, s, 0) * w) / np.sum(ok * w):.2f} °C')

    f = d / 'oisst_hielo_1deg.tif'
    if f.exists() and 'sst' in out:
        arr, geo = read_tif(f)
        sea = np.isfinite(unpack(out['sst'])[0].reshape(180, 360))
        ice = [np.where(sea, g1(arr[m], geo), np.nan) for m in range(12)]
        out['ice'] = pack(ice, lo=0, step=5); check('ice', out['ice'], ice); out['iceOK'] = True

    f = d / 'oisst_anomalias_1deg.tif'
    if f.exists():
        arr, geo = read_tif(f)
        an = [cell_mean(arr[k] / 100, geo, GLOBE, 2, wrap=True) for k in range(arr.shape[0])]
        out['anom'] = pack([np.clip(x, -5, 5) for x in an], lo=-5, step=0.1); check('anom', out['anom'], [np.clip(x, -5, 5) for x in an])
        out['anomG'] = {'nx': 180, 'ny': 90, 'lon0': -180, 'lat0': 90, 'res': 2}
        out['anomK'] = ['1997-12', '2010-12', '2015-12', '2023-12', '2023-08']

    f = d / 'modis_clorofila_05deg.tif'
    if f.exists():
        arr, geo = read_tif(f)
        mon = [arr[m] / 1000 for m in range(12)]
        # estaciones: diciembre-febrero, marzo-mayo, junio-agosto, septiembre-noviembre
        chl = []
        for ms in ((11, 0, 1), (2, 3, 4), (5, 6, 7), (8, 9, 10)):
            with np.errstate(all='ignore'):
                b = np.nanmean(np.stack([mon[m] for m in ms]), axis=0)
            chl.append(np.clip(g1(b, geo, min_frac=0.25), -2, 2))
        out['chl'] = pack(chl, lo=-2, step=0.04); check('chl', out['chl'], chl)
        src['chl'] = 'NASA OBPG, MODIS-Aqua L3 (clorofila a), medias 2003-2022'

    f = d / 'hycom_superficie_1deg.tif'
    if f.exists():
        arr, geo = read_tif(f)
        sss = [g1(arr[m] * 0.001 + 20, geo) for m in range(12)]
        u = [g1(arr[12 + m] * 0.001, geo) for m in range(12)]
        v = [g1(arr[24 + m] * 0.001, geo) for m in range(12)]
        out['sss'] = pack([np.clip(s, 28, 41) for s in sss], lo=28, hi=41); check('sss', out['sss'], [np.clip(s, 28, 41) for s in sss])
        out['u'] = pack([np.clip(x, -1.6, 1.6) for x in u], lo=-1.6, hi=1.6); check('u', out['u'], [np.clip(x, -1.6, 1.6) for x in u])
        out['v'] = pack([np.clip(x, -1.6, 1.6) for x in v], lo=-1.6, hi=1.6); check('v', out['v'], [np.clip(x, -1.6, 1.6) for x in v])
        src['hycom'] = 'HYCOM + NCODA (GOFS 3.1), análisis diario, medias 2014-2023'

    f = d / 'merra2_evap_prec_nativa.tif'
    if f.exists():
        arr, geo = read_tif(f)
        e = [g1(arr[m] / 100, geo) for m in range(12)]
        p = [g1(arr[12 + m] / 100, geo) for m in range(12)]
        out['e'] = pack(e, 'sq', hi=12); check('e', out['e'], e)
        out['p'] = pack(p, 'sq', hi=40); check('p', out['p'], p)
        src['merra2'] = 'NASA GMAO MERRA-2 (flujos de superficie), medias 1991-2020'

    out['srcs'] = src
    out_path.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB; campos: {[k for k in out if isinstance(out[k], dict) and "z" in out[k]]}')


if __name__ == '__main__':
    main(sys.argv[1:])
