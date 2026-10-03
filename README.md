# GEOFISICA_LA_TIERRA

**Interactivos de tutoría · Geografía General I (Geografía Física)**

Ver en línea: https://moxkix.github.io/GEOFISICA_LA_TIERRA/

Interactivos de apoyo a la tutoría de **Geografía General I (Geografía Física)**, Grado en Geografía e Historia, UNED.

La portada (`index.html`) enlaza un hub por tema. Cada hub es un único archivo `index.html` autocontenido (HTML + CSS + JavaScript sin dependencias ni llamadas externas) que funciona sin conexión; solo la geolocalización del navegador requiere permiso y HTTPS. El municipio elegido por el alumno se recuerda de un tema a otro.

## Tema 1 · La Tierra planeta. Movimientos y representación (`tema1/`)
1. Forma y dimensiones (Eratóstenes; esfera, elipsoide y geoide; la Luna)
2. Esfericidad e insolación (haz de rayos; mapa de insolación; distancia frente a inclinación)
3. Orientación y coordenadas (globo interactivo; longitud del grado; rosa de los vientos; reto)
4. Hora y husos horarios (día y noche; hora solar y oficial del municipio; cambio de fecha; ejercicios)
5. Efecto de Coriolis (plataforma giratoria; desviación según la latitud)
6. Traslación y estaciones (simulador de órbita e iluminación; gráficos anuales; zonas terrestres)
7. Proyecciones (10 proyecciones, indicatrices de Tissot, comparación de tamaños reales)
8. Escala (conversor; escala gráfica; medición sobre mapa; ordenación; ejercicios)
9. Curvas de nivel (mapa topográfico simulado; perfil; formas del relieve)
10. Cuestionario final (20 preguntas aleatorias de un banco de 25)

## Tema 2 · Elementos y factores climáticos I. La temperatura (`tema2/`)
1. Estructura vertical (columna de 0 a 120 km con perfiles tipo; composición del aire con valores actuales)
2. Propiedades del aire (laboratorio de humedad y punto de rocío; conversores; calor específico; densidad)
3. Balance energético (esquema del manual frente a valores actuales; modelo de efecto invernadero; espectros; ejercicios 3 y 5)
4. Tierras y mares (modelo de calentamiento; continentalidad y fachadas con estaciones reales)
5. Ciclo diario (insolación y temperatura en la estación más cercana al municipio; ejercicio 2; práctica)
6. Régimen térmico (ciclo anual, amplitud y retraso; comparador de 165 estaciones; práctica)
7. Isotermas (mapa mundial mes a mes, temperatura real o reducida al nivel del mar; ecuador térmico; corrientes; perfil por paralelos; ejercicio 4)
8. Cuestionario final (20 preguntas aleatorias de un banco de 28)

Los contenidos del factor cósmico (insolación, estaciones) enlazan con las pestañas correspondientes del Tema 1.

Cada pestaña incluye autoevaluación y, cuando procede, las correcciones respecto al texto de la Unidad Didáctica. La pestaña Inicio de cada tema las reúne en una tabla.

## Datos y licencias
- Líneas de costa: Natural Earth 1:110m (dominio público), vía el paquete `world-atlas`.
- Municipios (8.132, con coordenadas): paquete `spanish-cities-info` (licencia ISC), verificado con el INE.
- Normales climatológicas 1991–2020 (temperatura media, máxima y mínima mensual): OMM, distribuidas por NOAA NCEI (accesión 0253808, v6.6); 83 estaciones españolas y 82 del resto del mundo (`data/tema2/`).
- Temperatura en rejilla para las isotermas: reanálisis ERA5 1991–2020 (Copernicus/ECMWF; de julio a diciembre, 1991–2019, porque la serie mensual de Earth Engine termina en junio de 2020), con altitud de ETOPO1 (NOAA). Se exporta a 0,25° con Google Earth Engine (`gee/era5_isotermas_tema2.js`) y `data/tema2/make_grid.py` la promedia en celdas de 2° (`data/tema2/era5_grid.json`).
- Parámetros: elipsoide WGS84; oblicuidad 23,44°; constante solar 1.361 W/m²; posición solar con las fórmulas de baja precisión del *Astronomical Almanac*; Atmósfera Estándar de EE. UU. (1976) y perfiles tipo AFGL; balance energético de Trenberth, Fasullo y Kiehl (2009); presión de vapor de saturación con la fórmula de Magnus (OMM, 2018).
