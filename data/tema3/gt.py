"""Utilidades comunes de los conversores del Tema 3: lectura de los GeoTIFF de Google Earth Engine,
promedio en celdas más gruesas y codificación compacta de rejillas para el navegador.

Codificación (la descodifica T3.dec en src/tema3/common3.js):
  · q8(arr)          → {q: base64 de uint8, o, s}          valor = o + s·q
  · q8(arr, 'sq')    → {q: base64 de uint8, s, f: 'sq'}    valor = s·q²   (precipitación: más detalle en valores bajos)
Las rejillas van por filas de norte a sur y, dentro de cada fila, de oeste a este; lon0/lat0 es la esquina
superior izquierda y las celdas están centradas.
"""
import base64, math
import numpy as np
import tifffile


def read_tif(path):
    """Devuelve (bandas × filas × columnas en float con NaN, (x0, y0, dx, dy) de la esquina superior izquierda)."""
    with tifffile.TiffFile(path) as tf:
        page = tf.pages[0]
        arr = tf.asarray()
        tags = {t.name: t.value for t in page.tags.values()}
        nb = page.samplesperpixel
        nodata = tags.get('GDAL_NODATA')
    scale = tags.get('ModelPixelScaleTag'); tie = tags.get('ModelTiepointTag')
    if scale is None or tie is None:
        raise SystemExit(f'{path}: el GeoTIFF no tiene georreferencia (ModelPixelScale/ModelTiepoint).')
    dx, dy = scale[0], scale[1]
    x0, y0 = tie[3] - tie[0] * dx, tie[4] + tie[1] * dy
    if arr.ndim == 2:
        arr = arr[None]
    elif arr.shape[0] != nb and arr.shape[2] == nb:
        arr = np.moveaxis(arr, 2, 0)
    out = arr.astype('float64')
    if np.issubdtype(arr.dtype, np.integer):
        out[arr == -32768] = np.nan
    if nodata not in (None, ''):
        try:
            out[arr == float(str(nodata).strip('\x00'))] = np.nan
        except ValueError:
            pass
    return out, (x0, y0, dx, dy)


def block_mean(band, geo, bbox, res, wrap=False):
    """Media de los píxeles cuyo centro cae en cada celda de `res` grados del recuadro bbox = [O, E, S, N]."""
    x0, y0, dx, dy = geo
    W, E, S, N = bbox
    NX, NY = int(round((E - W) / res)), int(round((N - S) / res))
    ny, nx = band.shape
    lats = y0 - (np.arange(ny) + 0.5) * dy
    lons = x0 + (np.arange(nx) + 0.5) * dx
    if wrap:
        lons = ((lons - W) % 360) + W
    ix = np.floor((lons - W) / res + 1e-9).astype(int)
    iy = np.floor((N - lats) / res + 1e-9).astype(int)
    okx = (ix >= 0) & (ix < NX)
    acc = np.zeros((NY, NX)); cnt = np.zeros((NY, NX))
    for j in range(ny):
        if not 0 <= iy[j] < NY:
            continue
        row = band[j]
        m = okx & np.isfinite(row)
        np.add.at(acc[iy[j]], ix[m], row[m])
        np.add.at(cnt[iy[j]], ix[m], 1)
    out = np.where(cnt > 0, acc / np.maximum(cnt, 1), np.nan)
    if np.isnan(out).any():  # rellena huecos con el vecino válido más próximo
        bad = np.argwhere(np.isnan(out)); good = np.argwhere(~np.isnan(out))
        if len(good):
            for j, i in bad:
                d = (good[:, 0] - j) ** 2 + (good[:, 1] - i) ** 2
                gj, gi = good[np.argmin(d)]
                out[j, i] = out[gj, gi]
    return out, {'nx': NX, 'ny': NY, 'lon0': W, 'lat0': N, 'res': res}


def q8(a, mode='lin'):
    a = np.asarray(a, dtype='float64').ravel()
    if mode == 'sq':
        mx = max(float(np.nanmax(a)), 0.01)
        s = float(f'{mx / 254 ** 2 * 1.0001:.4g}')
        q = np.clip(np.round(np.sqrt(np.clip(a, 0, None) / s)), 0, 255).astype('uint8')
        return {'q': base64.b64encode(q.tobytes()).decode(), 's': s, 'f': 'sq'}
    lo, hi = float(np.nanmin(a)), float(np.nanmax(a))
    o = math.floor(lo * 100) / 100
    s = float(f'{max(hi - o, 1e-3) / 254 * 1.0001:.4g}')
    q = np.clip(np.round((a - o) / s), 0, 255).astype('uint8')
    return {'q': base64.b64encode(q.tobytes()).decode(), 'o': o, 's': s}


def dq8(e):
    """Descodifica (para comprobar la pérdida de precisión)."""
    q = np.frombuffer(base64.b64decode(e['q']), dtype='uint8').astype('float64')
    return e['s'] * q * q if e.get('f') == 'sq' else e['o'] + e['s'] * q
