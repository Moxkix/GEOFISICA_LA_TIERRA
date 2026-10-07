#!/usr/bin/env python3
"""Ensambla los HTML autocontenidos: portada (index.html), tema1/, tema2/ y tema3/."""
import json, pathlib
R = pathlib.Path(__file__).parent
CSS = (R / 'src/common/style.css').read_text()
CORE = (R / 'src/common/core.js').read_text()
ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' "
        "fill='%23cfe0ea' stroke='%231c2836' stroke-width='2'/%3E%3Cpath d='M2 16h28M16 2c-6 7-6 21 0 28M16 2c6 7 6 21 0 28' fill='none' "
        "stroke='%231c2836' stroke-width='1.5'/%3E%3C/svg%3E")
KICKER = 'Geografía General I · Geografía Física · UNED'

def data_js(names):
    out = []
    for var, path in names:
        f = R / path
        if f.exists():
            out.append(f"const {var}={f.read_text().strip()};")
        else:
            out.append(f"const {var}=null;")
    return '\n'.join(out) + '\n'

def page(title, desc, header_title, body_js, home='../index.html'):
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{ICON}">
<style>{CSS}</style>
</head>
<body>
<header class="top">
  <div class="top-row">
    <div class="brand"><span class="kicker"><a class="home-link" href="{home}" title="Todos los temas">← Temas</a> · {KICKER}</span><span class="title">{header_title}</span></div>
    <button class="place-pill" id="place-pill" type="button" title="Cambiar municipio"><span class="lbl">Municipio</span><b id="place-name">—</b><span class="chg">Cambiar</span></button>
  </div>
  <nav class="tabs" role="tablist" aria-label="Apartados del tema"></nav>
</header>
<main></main>
<script>
{body_js}
</script>
</body>
</html>
"""

TEMAS = {
    'tema1': dict(
        title='Tema 1 · La Tierra planeta',
        desc='Interactivos del Tema 1 de Geografía General I (Geografía Física, UNED): forma y movimientos de la Tierra y su representación cartográfica.',
        header='Tema 1 · La Tierra planeta. Movimientos y representación',
        data=[('LAND', 'data/land2.json'), ('SHAPES', 'data/shapes.json'), ('MUN', 'data/mun.json')],
        files=['_config.js', 'tab_inicio.js', 'tab_forma.js', 'tab_insolacion.js', 'tab_coordenadas.js', 'tab_hora.js',
               'tab_coriolis.js', 'tab_estaciones.js', 'tab_proyecciones.js', 'tab_escala.js', 'tab_relieve.js', 'tab_cuestionario.js'],
    ),
    'tema2': dict(
        title='Tema 2 · La temperatura',
        desc='Interactivos del Tema 2 de Geografía General I (Geografía Física, UNED): la atmósfera, la insolación terrestre y la temperatura.',
        header='Tema 2 · Elementos y factores climáticos I. La temperatura',
        data=[('LAND', 'data/land2.json'), ('MUN', 'data/mun.json'), ('ST', 'data/tema2/stations.json'), ('GRID', 'data/tema2/era5_grid.json')],
        files=['_config.js', 'common2.js', 'tab_inicio.js', 'tab_estructura.js', 'tab_aire.js', 'tab_balance.js', 'tab_tierramar.js',
               'tab_diario.js', 'tab_anual.js', 'tab_isotermas.js', 'tab_cuestionario.js'],
    ),
    'tema3': dict(
        title='Tema 3 · La presión y la humedad',
        desc='Interactivos del Tema 3 de Geografía General I (Geografía Física, UNED): presión atmosférica, vientos y circulación general, humedad y precipitación.',
        header='Tema 3 · Elementos y factores climáticos II. La presión y la humedad atmosféricas',
        data=[('LAND', 'data/land2.json'), ('MUN', 'data/mun.json'), ('ST', 'data/tema2/stations.json'), ('COAST', 'data/tema3/coast_eu.json'),
              ('CLIMA', 'data/tema3/era5_clima.json'), ('DANA', 'data/tema3/dana.json'), ('VSUR', 'data/tema3/vsur.json')],
        files=['_config.js', '../tema2/common2.js', 'common3.js', 'casos.js', 'tab_inicio.js', 'tab_isobaras.js', 'tab_viento.js', 'tab_circulacion.js',
               'tab_adiabatico.js', 'tab_frentes.js', 'tab_precipitacion.js', 'tab_regimenes.js', 'tab_cuestionario.js'],
    ),
}

for key, t in TEMAS.items():
    src = R / 'src' / key
    js = data_js(t['data']) + CORE + '\n' + '\n'.join((src / f).read_text() for f in t['files'] if (src / f).exists()) + '\nH.start();\n'
    html = page(t['title'], t['desc'], t['header'], js)
    out = R / key / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(html)
    print(f'{key}/index.html', round(len(html.encode()) / 1024), 'KB')

# ---------- portada común ----------
portada = (R / 'src/portada.html').read_text().replace('/*CSS*/', CSS).replace('ICON_HREF', ICON)
(R / 'index.html').write_text(portada)
print('index.html (portada)', round(len(portada.encode()) / 1024), 'KB')
