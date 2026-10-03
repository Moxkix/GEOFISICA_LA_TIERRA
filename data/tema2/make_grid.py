#!/usr/bin/env python3
"""Convierte el GeoTIFF exportado por gee/era5_isotermas_tema2.js (13 bandas: t01…t12, elev; 1°)
en data/tema2/era5_grid.json: rejilla de 2° con enteros en décimas (base64, int16 little-endian).

Uso:  python3 data/tema2/make_grid.py ruta/era5_t2m_clim_1991_2020_1deg.tif
"""
import base64, json, pathlib, sys
import numpy as np
import tifffile

RES = 2.0  # resolución de salida (grados)
R = pathlib.Path(__file__).parent

def read(path):
    with tifffile.TiffFile(path) as tf:
        page = tf.pages[0]
        arr = tf.asarray()
        tags = {t.name: t.value for t in page.tags.values()}
    scale = tags.get('ModelPixelScaleTag'); tie = tags.get('ModelTiepointTag')
    if scale is None or tie is None:
        raise SystemExit('El GeoTIFF no tiene georreferencia (ModelPixelScale/ModelTiepoint).')
    dx, dy = scale[0], scale[1]
    x0, y0 = tie[3] - tie[0] * dx, tie[4] + tie[1] * dy  # esquina superior izquierda
    # ordenar a (bandas, filas, columnas)
    if arr.ndim != 3:
        raise SystemExit(f'Se esperaban 13 bandas; forma {arr.shape}')
    if arr.shape[0] == 13: pass
    elif arr.shape[2] == 13: arr = np.moveaxis(arr, 2, 0)
    else: raise SystemExit(f'Se esperaban 13 bandas; forma {arr.shape}')
    return arr.astype('float64'), x0, y0, dx, dy

def regrid(band, x0, y0, dx, dy):
    """Promedia la banda en celdas de RES grados alineadas con -180/90."""
    ny, nx = band.shape
    lats = y0 - (np.arange(ny) + 0.5) * dy
    lons = x0 + (np.arange(nx) + 0.5) * dx
    lons = ((lons + 180) % 360) - 180
    NX, NY = int(360 / RES), int(180 / RES)
    acc = np.zeros((NY, NX)); cnt = np.zeros((NY, NX))
    iy = np.clip(((90 - lats) // RES).astype(int), 0, NY - 1)
    ix = np.clip(((lons + 180) // RES).astype(int), 0, NX - 1)
    ok = np.isfinite(band) & (np.abs(band) < 1e5)
    for j in range(ny):
        m = ok[j]
        np.add.at(acc[iy[j]], ix[m], band[j, m])
        np.add.at(cnt[iy[j]], ix[m], 1)
    out = np.where(cnt > 0, acc / np.maximum(cnt, 1), np.nan)
    # rellena huecos (si los hubiera) con el vecino de la misma fila
    for j in range(NY):
        row = out[j]
        if np.isnan(row).any():
            good = np.where(~np.isnan(row))[0]
            if len(good): row[np.isnan(row)] = np.interp(np.where(np.isnan(row))[0], good, row[good], period=NX)
    return out

def b64(a, mult):
    q = np.clip(np.round(a * mult), -32768, 32767).astype('<i2')
    return base64.b64encode(q.tobytes()).decode()

def main():
    if len(sys.argv) < 2: raise SystemExit(__doc__)
    arr, x0, y0, dx, dy = read(sys.argv[1])
    t = [regrid(arr[m], x0, y0, dx, dy) for m in range(12)]
    e = regrid(arr[12], x0, y0, dx, dy)
    # comprobaciones de verosimilitud
    jan, jul = t[0], t[6]
    print('Enero: mín %.1f · máx %.1f °C | Julio: mín %.1f · máx %.1f °C | altitud máx. %.0f m' % (np.nanmin(jan), np.nanmax(jan), np.nanmin(jul), np.nanmax(jul), np.nanmax(e)))
    out = {'res': RES, 'nx': int(360 / RES), 'ny': int(180 / RES), 'lon0': -180, 'lat0': 90,
           'src': 'ERA5 (Copernicus/ECMWF), temperatura a 2 m, medias mensuales 1991-2020; altitud de ETOPO1',
           't': [b64(x, 10) for x in t], 'e': b64(e, 1)}
    (R / 'era5_grid.json').write_text(json.dumps(out, separators=(',', ':')))
    print('era5_grid.json', round((R / 'era5_grid.json').stat().st_size / 1024), 'KB')

if __name__ == '__main__':
    main()
