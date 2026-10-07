"""Utilidades de los conversores del Tema 4: lectura de los GeoTIFF de Earth Engine, medias por celdas
y codificación comprimida de rejillas para el navegador.

Codificación «z» (la descodifica T4.unz en src/tema4/common4.js, con DecompressionStream('deflate')):
  {z: base64 de zlib(deltas), n: capas, o, s[, f]}
  · los valores se cuantifican en un byte (0-254; 255 = sin dato) → valor = o + s·q, o s·q² si f = 'sq',
    o t[q] si f = 'lut' (tabla t de 255 valores);
  · con f = 'i16' se guardan enteros de 16 bits (−32768 = sin dato) → valor = o + s·entero;
  · antes de comprimir se guarda la diferencia con el valor anterior (módulo 256 o 65536) y, si hay varias
    capas y p = 1, la de cada celda con la misma celda de la capa anterior: así se comprimen 3-4 veces más.
Las rejillas van por filas de norte a sur y, dentro de cada fila, de oeste a este; varias capas van seguidas.
"""
import base64, math, pathlib, sys, zlib
import numpy as np
import tifffile


def read_tif(path):
    """Devuelve (bandas × filas × columnas en float con NaN, (x0, y0, dx, dy)) con las filas de norte a sur.
    Admite la georreferencia por ModelPixelScale + ModelTiepoint y por ModelTransformation, también con las
    filas de sur a norte (como exporta Earth Engine MERRA-2 en su proyección nativa)."""
    with tifffile.TiffFile(path) as tf:
        page = tf.pages[0]
        arr = tf.asarray()
        tags = {t.name: t.value for t in page.tags.values()}
        nb = page.samplesperpixel
    if arr.ndim == 2:
        arr = arr[None]
    elif arr.shape[0] != nb and arr.shape[2] == nb:
        arr = np.moveaxis(arr, 2, 0)
    out = arr.astype('float64')
    if np.issubdtype(arr.dtype, np.integer):
        out[arr == -32768] = np.nan
    if 'ModelTransformationTag' in tags:
        m = tags['ModelTransformationTag']
        dx, sy, x0, y0 = m[0], m[5], m[3], m[7]
    elif 'ModelPixelScaleTag' in tags:
        sc, tie = tags['ModelPixelScaleTag'], tags['ModelTiepointTag']
        dx, sy = sc[0], -sc[1]
        x0, y0 = tie[3] - tie[0] * dx, tie[4] - tie[1] * sy
    else:
        raise SystemExit(f'{path}: el GeoTIFF no tiene georreferencia.')
    if sy > 0:  # filas de sur a norte: se invierten
        out = out[:, ::-1, :]
        y0 = y0 + sy * out.shape[1]
    return out, (x0, y0, dx, abs(sy))


def cell_mean(band, geo, bbox, res, wrap=True, min_frac=0.0):
    """Media de los píxeles válidos cuyo centro cae en cada celda de `res` grados (sin rellenar huecos).
    Devuelve NaN donde la fracción de píxeles válidos es menor que min_frac."""
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
    acc = np.zeros((NY, NX)); cnt = np.zeros((NY, NX)); tot = np.zeros((NY, NX))
    seen = set()
    for j in range(ny):
        if not 0 <= iy[j] < NY:
            continue
        row = band[j]
        m = okx & np.isfinite(row)
        np.add.at(acc[iy[j]], ix[m], row[m])
        np.add.at(cnt[iy[j]], ix[m], 1)
        np.add.at(tot[iy[j]], ix[okx], 1)
    out = np.where(cnt > 0, acc / np.maximum(cnt, 1), np.nan)
    if min_frac > 0:
        out[cnt < min_frac * np.maximum(tot, 1)] = np.nan
    return out


def _b64(b):
    return base64.b64encode(b).decode()


def pack(layers, mode='lin', lo=None, hi=None, table=None, dec=4, step=None):
    """Cuantifica y comprime una o varias capas (arrays del mismo tamaño). NaN → sin dato."""
    L = np.stack([np.asarray(a, dtype='float64') for a in (layers if isinstance(layers, (list, tuple)) else [layers])])
    a = L.ravel()
    nan = ~np.isfinite(a)
    out = {'n': int(L.shape[0])}
    if mode == 'i16':
        o = 0.0 if lo is None else lo
        s = 1.0 if hi is None else hi  # aquí hi hace de escala
        q = np.where(nan, -32768, np.clip(np.round((np.nan_to_num(a) - o) / s), -32767, 32767)).astype('int32')
        out.update({'z': _best(q, L[0].size, out, 0xFFFF, '<u2'), 'o': o, 's': s, 'f': 'i16'})
        return out
    if mode == 'lut':
        t = np.asarray(table, dtype='float64')
        # código del valor más cercano de la tabla
        idx = np.searchsorted(t, np.nan_to_num(a))
        idx = np.clip(idx, 1, len(t) - 1)
        q = np.where(np.abs(a - t[idx - 1]) <= np.abs(a - t[idx]), idx - 1, idx)
        q = np.where(nan, 255, q).astype('int32')
        out.update({'f': 'lut', 't': [float(f'{v:.{dec}g}') for v in t]})
    elif mode == 'sq':
        mx = max(float(np.nanmax(a)) if hi is None else hi, 1e-6)
        s = float(f'{mx / 254 ** 2 * 1.0001:.4g}')
        q = np.where(nan, 255, np.clip(np.round(np.sqrt(np.clip(np.nan_to_num(a), 0, None) / s)), 0, 254)).astype('int32')
        out.update({'s': s, 'f': 'sq'})
    else:
        lo = float(np.nanmin(a)) if lo is None else lo
        hi = (float(np.nanmax(a)) if np.isfinite(a).any() else lo + 1) if hi is None else hi
        o = math.floor(lo * 1000) / 1000
        s = step or float(f'{max(hi - o, 1e-6) / 254 * 1.0001:.{dec}g}')  # con step, cuantificación más gruesa (comprime más)
        q = np.where(nan, 255, np.clip(np.round((np.nan_to_num(a) - o) / s), 0, 254)).astype('int32')
        out.update({'o': o, 's': s})
    out['z'] = _best(q, L[0].size, out, 0xFF, 'uint8')
    return out


def _best(q, n1, out, mask, dt):
    """Diferencias con el valor anterior; si hay varias capas, prueba también a restar la misma celda de la capa
    anterior (p = 1: mejor cuando las capas son meses consecutivos) y se queda con lo que comprima más."""
    d = np.diff(q, prepend=0)
    z0 = zlib.compress((d & mask).astype(dt).tobytes(), 9)
    if q.size > n1:
        d1 = d.copy(); d1[n1:] = q[n1:] - q[:-n1]
        z1 = zlib.compress((d1 & mask).astype(dt).tobytes(), 9)
        if len(z1) < len(z0):
            out['p'] = 1
            return _b64(z1)
    return _b64(z0)


def unpack(e):
    """Descodifica (para comprobar la pérdida de precisión). Devuelve un array (capas × ...)."""
    b = zlib.decompress(base64.b64decode(e['z']))
    def undelta(d, mod):
        n1 = len(d) // e['n']
        q = np.empty_like(d); q[:n1] = np.cumsum(d[:n1]) % mod
        if e.get('p'):
            for k in range(1, e['n']):
                q[k * n1:(k + 1) * n1] = (q[(k - 1) * n1:k * n1] + d[k * n1:(k + 1) * n1]) % mod
        else:
            q = np.cumsum(d) % mod
        return q
    if e.get('f') == 'i16':
        d = np.frombuffer(b, dtype='<u2').astype('int64')
        q = undelta(d, 65536); q[q > 32767] -= 65536
        v = np.where(q == -32768, np.nan, e['o'] + e['s'] * q)
    else:
        d = np.frombuffer(b, dtype='uint8').astype('int64')
        q = undelta(d, 256)
        if e.get('f') == 'lut':
            t = np.array(e['t'] + [np.nan]); v = t[np.minimum(q, len(t) - 1)]
        elif e.get('f') == 'sq':
            v = e['s'] * q.astype(float) ** 2
        else:
            v = e['o'] + e['s'] * q
        v = np.where(q == 255, np.nan, v)
    return v.reshape(e['n'], -1)


def size_kb(e):
    return len(e['z']) / 1024
