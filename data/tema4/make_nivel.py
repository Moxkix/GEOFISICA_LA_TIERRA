#!/usr/bin/env python3
"""Series del nivel del mar para la pestaña «Nivel del mar» → data/tema4/nivel.json (variable NIVEL). Usa lo que haya:

  epa-sea-level.csv            nivel medio global 1880-2013 (CSIRO, Church y White, 2011) y 1993-2023 (NOAA, altimetría),
                               en pulgadas, del indicador de la EPA (github.com/datasets/sea-level-rise)
  slr_sla_gbl_free_ref_90.csv  nivel medio global por altimetría, NOAA STAR (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6MF)
  rlr_annual.zip               medias anuales de los mareógrafos (PSMSL, «revised local reference»)
  spratt2016-noaa.txt          nivel del mar de los últimos 800.000 años (Spratt y Lisiecki, 2016; NOAA Paleoclimatología;
                               también vale spratt2016.txt)

Uso:  python3 data/tema4/make_nivel.py carpeta [salida.json]
"""
import csv, io, json, pathlib, re, sys, unicodedata, zipfile
import numpy as np

R = pathlib.Path(__file__).parent
# mareógrafos elegidos (nombre en el catálogo PSMSL → nombre en el hub)
# mareógrafos elegidos: (nombre en el catálogo PSMSL, nombre en el hub, nota sobre los movimientos del terreno o la serie)
GAUGES = [('SANTANDER I', 'Santander', ''), ('LA CORUNA I', 'A Coruña', ''), ('VIGO', 'Vigo', ''), ('CADIZ III', 'Cádiz', ''),
          ('MALAGA', 'Málaga', ''), ('ALICANTE 2', 'Alicante', ''), ('BARCELONA', 'Barcelona', ''), ('CEUTA', 'Ceuta', ''),
          ('LAS PALMAS D', 'Las Palmas', ''), ('BILBAO', 'Bilbao', ''),
          ('BREST', 'Brest (Francia)', ''), ('NEWLYN', 'Newlyn (Reino Unido)', ''),
          ('STOCKHOLM', 'Estocolmo (Suecia)', 'El nivel baja porque el suelo sube más deprisa que el mar: es el rebote isostático tras la fusión del manto de hielo escandinavo, que todavía levanta esta región unos 5 mm al año.'),
          ('GALVESTON II, PIER 21, TX', 'Galveston (EE. UU.)', 'Sube mucho más que la media porque el terreno se hunde: compactación de los sedimentos de la costa del golfo de México y extracción de agua subterránea, gas y petróleo.'),
          ('JUNEAU', 'Juneau, Alaska (EE. UU.)', 'El nivel baja muy deprisa porque el suelo sube: la corteza se recupera de la gran pérdida de hielo de los glaciares del sur de Alaska desde la Pequeña Edad de Hielo.'),
          ('HONOLULU', 'Honolulu (EE. UU.)', ''), ('SYDNEY, FORT DENISON 2', 'Sídney (Australia)', ''),
          ('SAN FRANCISCO', 'San Francisco (EE. UU.)', ''), ('MUMBAI / BOMBAY (APOLLO BANDAR)', 'Bombay (India)', '')]


def main(a):
    if not a:
        raise SystemExit(__doc__)
    d = pathlib.Path(a[0]); out_path = pathlib.Path(a[1]) if len(a) > 1 else R / 'nivel.json'
    out = json.loads(out_path.read_text()) if out_path.exists() else {}

    f = d / 'epa-sea-level.csv'
    if f.exists():
        rows = list(csv.DictReader(open(f)))
        cs = [(int(r['Year']), float(r['CSIRO Adjusted Sea Level']) * 25.4, float(r['Upper Error Bound']) * 25.4 - float(r['CSIRO Adjusted Sea Level']) * 25.4) for r in rows if r['CSIRO Adjusted Sea Level']]
        no = [(int(r['Year']), float(r['NOAA Adjusted Sea Level']) * 25.4) for r in rows if r['NOAA Adjusted Sea Level']]
        out['csiro'] = {'y': [c[0] for c in cs], 'v': [round(c[1], 1) for c in cs], 'e': [round(c[2], 1) for c in cs], 'src': 'CSIRO (Church y White, 2011), indicador de la EPA'}
        out['noaa'] = {'y': [c[0] for c in no], 'v': [round(c[1], 1) for c in no], 'src': 'NOAA, altimetría (medias anuales), indicador de la EPA'}
        print(f'  CSIRO {cs[0][0]}-{cs[-1][0]}: {cs[-1][1] - cs[0][1]:.0f} mm; NOAA {no[0][0]}-{no[-1][0]}: {no[-1][1] - no[0][1]:.0f} mm')

    f = d / 'slr_sla_gbl_free_ref_90.csv'
    if f.exists():
        txt = f.read_text(errors='replace').splitlines()
        t, v = [], []
        for line in txt:
            p = [x.strip() for x in line.split(',')]
            if len(p) < 2 or not re.match(r'^\d{4}\.\d+', p[0]):
                continue
            vals = [float(x) for x in p[1:] if re.match(r'^-?\d+(\.\d+)?$', x)]
            if vals:
                t.append(float(p[0])); v.append(float(np.mean(vals)))  # media de las misiones que coinciden
        t, v = np.array(t), np.array(v)
        o = np.argsort(t); t, v = t[o], v[o]
        # medias de 2 meses para aligerar
        tb, vb = [], []
        for k in np.unique(np.floor(t * 6)):
            m = np.floor(t * 6) == k
            tb.append(round(float(t[m].mean()), 3)); vb.append(round(float(v[m].mean()), 1))
        out['star'] = {'t': tb, 'v': vb, 'src': 'NOAA STAR, Laboratorio de Altimetría (sin ciclo estacional)'}
        A = np.vstack([t - 2000, np.ones_like(t)]).T
        print(f'  altimetría {t[0]:.2f}-{t[-1]:.2f}: tendencia {np.linalg.lstsq(A, v, rcond=None)[0][0]:.2f} mm/año')

    f = d / 'rlr_annual.zip'
    if f.exists():
        z = zipfile.ZipFile(f)
        names = z.namelist()
        fl = [n for n in names if n.endswith('filelist.txt')][0]
        cat = {}
        raw = z.read(fl)
        try:
            txt = raw.decode('utf-8')
        except UnicodeDecodeError:
            txt = raw.decode('latin-1')
        norm = lambda t: unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().upper().strip()  # noqa: E731
        for line in txt.splitlines():
            p = [x.strip() for x in line.split(';')]
            if len(p) >= 4:
                cat[norm(p[3])] = (int(p[0]), float(p[1]), float(p[2]))
        g = []
        for key, nm, note in GAUGES:
            hit = cat.get(norm(key)) or next((v for k, v in cat.items() if k.startswith(norm(key))), None)
            if not hit:
                print('  (no encontrado en PSMSL:', key, ')'); continue
            sid, la, lo = hit
            dn = [n for n in names if re.search(rf'(^|/){sid}\.rlrdata$', n)]
            if not dn:
                continue
            ys, vs = [], []
            for line in z.read(dn[0]).decode('latin-1').splitlines():
                p = [x.strip() for x in line.split(';')]
                if len(p) >= 2 and p[1] not in ('-99999', ''):
                    ys.append(int(float(p[0]))); vs.append(float(p[1]))
            if len(ys) < 20:
                continue
            ys, vs = np.array(ys), np.array(vs)
            ref = vs[(ys >= 1991) & (ys <= 2020)].mean() if ((ys >= 1991) & (ys <= 2020)).sum() >= 10 else vs.mean()
            k = ys >= 1900
            tr = np.polyfit(ys[k], vs[k], 1)[0] if k.sum() > 30 else np.polyfit(ys, vs, 1)[0]
            g.append({'id': sid, 'name': nm, 'lat': la, 'lon': lo, 'y0': int(ys[0]), 'y': ys.tolist(), 'v': [round(x - ref) for x in vs], 'tr': round(float(tr), 2), 'note': note})
            print(f'  {nm}: {ys[0]}-{ys[-1]} ({len(ys)} años), tendencia {tr:.2f} mm/año')
        out['gauges'] = g
        out['gsrc'] = 'PSMSL, medias anuales «revised local reference» (Holgate y otros, 2013)'

    # Spratt y Lisiecki (2016): spratt2016-noaa.txt (plantilla de NOAA, con cabecera y columnas con nombre) o spratt2016.txt
    f = next((d / n for n in ('spratt2016-noaa.txt', 'spratt2016.txt') if (d / n).exists()), None)
    if f:
        ages, sl, col = [], [], 1
        for line in f.read_text(errors='replace').splitlines():
            if line.startswith('#'):
                continue
            p = line.replace(',', ' ').split()
            if p and not re.match(r'^-?\d', p[0]):  # cabecera: la serie larga (0-800 ka) si existe
                names = [x.lower() for x in p]
                for want in ('sealev_longpc1', 'sealev_shortpc1'):
                    if want in names:
                        col = names.index(want); break
                continue
            if len(p) > col:
                try:
                    a_, v_ = float(p[0]), float(p[col])
                except ValueError:
                    continue
                if v_ == v_:
                    ages.append(a_); sl.append(v_)
        out['paleo'] = {'ka': ages, 'v': [round(x, 1) for x in sl], 'src': 'Spratt y Lisiecki (2016), primera componente principal (NOAA Paleoclimatología)'}
        print(f'  paleo ({f.name}, columna {col}): {len(ages)} puntos de {min(ages):.0f} a {max(ages):.0f} ka, mínimo {min(sl):.0f} m')

    out_path.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
    print(f'{out_path}: {out_path.stat().st_size / 1024:.0f} KB; partes: {list(out)}')


if __name__ == '__main__':
    main(sys.argv[1:])
