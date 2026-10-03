#!/usr/bin/env python3
"""Convierte los GeoTIFF exportados por gee/era5_isotermas_tema2.js en data/tema2/era5_grid.json:
rejilla de 2° (media de las celdas finas) con enteros en décimas (base64, int16 little-endian).

Entradas admitidas (0,25° u otra resolución que divida la rejilla de 2°):
  · dos archivos: temperatura (12 bandas t01…t12) + altitud (1 banda elev), en cualquier orden;
  · un archivo de 13 bandas (t01…t12, elev).
Si los datos son enteros, la temperatura se interpreta en décimas de °C; si son reales, en °C.

Uso:  python3 data/tema2/make_grid.py era5_t2m_clim_1991_2020_025deg.tif etopo1_elev_025deg.tif
"""
import base64, json, pathlib, sys
import numpy as np
import tifffile

RES = 2.0  # resolución de salida (grados)
R = pathlib.Path(__file__).parent

def read(path):
    """Devuelve (bandas × filas × columnas en float, georreferencia, ¿enteros?)."""
    with tifffile.TiffFile(path) as tf:
        page = tf.pages[0]
        arr = tf.asarray()
        tags = {t.name: t.value for t in page.tags.values()}
        nb = page.samplesperpixel
    scale = tags.get('ModelPixelScaleTag'); tie = tags.get('ModelTiepointTag')
    if scale is None or tie is None:
        raise SystemExit(f'{path}: el GeoTIFF no tiene georreferencia (ModelPixelScale/ModelTiepoint).')
    dx, dy = scale[0], scale[1]
    x0, y0 = tie[3] - tie[0] * dx, tie[4] + tie[1] * dy  # esquina superior izquierda
    if arr.ndim == 2: arr = arr[None]
    elif arr.shape[0] != nb and arr.shape[2] == nb: arr = np.moveaxis(arr, 2, 0)
    is_int = np.issubdtype(arr.dtype, np.integer)
    out = arr.astype('float64')
    if is_int: out[arr == -32768] = np.nan
    return out, (x0, y0, dx, dy), is_int

def regrid(band, geo):
    """Promedia la banda en celdas de RES grados alineadas con -180/90."""
    x0, y0, dx, dy = geo
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
    temp = elev = None
    for path in sys.argv[1:]:
        arr, geo, is_int = read(path)
        n = arr.shape[0]
        if n in (12, 13):
            t = arr[:12] / 10 if is_int else arr[:12]
            temp = [regrid(b, geo) for b in t]
            if n == 13: elev = regrid(arr[12], geo)
        elif n == 1:
            elev = regrid(arr[0], geo)
        else:
            raise SystemExit(f'{path}: se esperaban 12, 13 o 1 bandas; hay {n}.')
        print(f'{path}: {n} banda(s), {arr.shape[2]} × {arr.shape[1]} px, {"enteros" if is_int else "reales"}')
    if temp is None or elev is None:
        raise SystemExit('Faltan datos: hacen falta las 12 bandas de temperatura y la de altitud.')
    jan, jul = temp[0], temp[6]
    print('Enero: mín %.1f · máx %.1f °C | Julio: mín %.1f · máx %.1f °C | altitud máx. %.0f m' % (
        np.nanmin(jan), np.nanmax(jan), np.nanmin(jul), np.nanmax(jul), np.nanmax(elev)))
    out = {'res': RES, 'nx': int(360 / RES), 'ny': int(180 / RES), 'lon0': -180, 'lat0': 90,
           'src': 'ERA5 (Copernicus/ECMWF), temperatura a 2 m, medias mensuales 1991-2020 '
                  '(julio-diciembre: 1991-2019); altitud de ETOPO1',
           't': [b64(x, 10) for x in temp], 'e': b64(elev, 1)}
    (R / 'era5_grid.json').write_text(json.dumps(out, separators=(',', ':')))
    print('era5_grid.json', round((R / 'era5_grid.json').stat().st_size / 1024), 'KB')

if __name__ == '__main__':
    main()
