#!/usr/bin/env python3
"""Ensambla index.html autocontenido a partir de src/ y data/."""
import json, pathlib, re
R = pathlib.Path(__file__).parent
css = (R/'src/style.css').read_text()
data = "const LAND=" + (R/'data/land2.json').read_text() + ";\n" \
     + "const SHAPES=" + (R/'data/shapes.json').read_text() + ";\n" \
     + "const MUN=" + (R/'data/mun.json').read_text() + ";\n"
order = ['core.js', 'tab_inicio.js', 'tab_forma.js', 'tab_insolacion.js', 'tab_coordenadas.js', 'tab_hora.js',
         'tab_coriolis.js', 'tab_estaciones.js', 'tab_proyecciones.js', 'tab_escala.js', 'tab_relieve.js', 'tab_cuestionario.js']
js = data + "\n".join((R/'src'/f).read_text() for f in order if (R/'src'/f).exists()) + "\nH.start();\n"
html = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tema 1 · La Tierra planeta</title>
<meta name="description" content="Interactivos del Tema 1 de Geografía General I (Geografía Física, UNED): forma y movimientos de la Tierra y su representación cartográfica.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23cfe0ea' stroke='%231c2836' stroke-width='2'/%3E%3Cpath d='M2 16h28M16 2c-6 7-6 21 0 28M16 2c6 7 6 21 0 28' fill='none' stroke='%231c2836' stroke-width='1.5'/%3E%3C/svg%3E">
<style>{css}</style>
</head>
<body>
<header class="top">
  <div class="top-row">
    <div class="brand"><span class="kicker">Geografía General I · Geografía Física · UNED</span><span class="title">Tema 1 · La Tierra planeta. Movimientos y representación</span></div>
    <button class="place-pill" id="place-pill" type="button" title="Cambiar municipio"><span class="lbl">Municipio</span><b id="place-name">—</b><span class="chg">Cambiar</span></button>
  </div>
  <nav class="tabs" role="tablist" aria-label="Apartados del tema"></nav>
</header>
<main></main>
<script>
{js}
</script>
</body>
</html>
"""
(R/'index.html').write_text(html)
print('index.html', round(len(html.encode())/1024), 'KB')
