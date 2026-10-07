# GEOFISICA_LA_TIERRA

**Interactivos de tutoría · Geografía General I (Geografía Física)**

Ver en línea: https://moxkix.github.io/GEOFISICA_LA_TIERRA/

Interactivos de apoyo a la tutoría de **Geografía General I (Geografía Física)**, Grado en Geografía e Historia, UNED.

La portada (`index.html`) enlaza un hub por tema. Cada hub es un único archivo `index.html` autocontenido (HTML + CSS + JavaScript sin dependencias ni llamadas externas) que funciona sin conexión; solo la geolocalización del navegador requiere permiso y HTTPS. El municipio elegido por el alumno se recuerda de un tema a otro.

## Autoría y licencia
© 2026 **Iñaki Moro**, profesor-tutor de la UNED, Centro Asociado de Vitoria-Gasteiz. Material de apoyo a la tutoría, **no oficial**: no procede del equipo docente de la asignatura ni de la UNED.

- **Contenidos** (textos, ilustraciones, figuras, cuestionarios y diseño de los interactivos): [Creative Commons Reconocimiento-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es). Texto completo en [`LICENSE-CONTENIDOS.txt`](LICENSE-CONTENIDOS.txt).
- **Código** (JavaScript, CSS y scripts de Python y de Google Earth Engine): [licencia MIT](LICENSE).
- **Datos de terceros**: conservan sus propias licencias y condiciones de cita (apartado *Datos y licencias*).
- Elaborado con ayuda de herramientas de inteligencia artificial (Claude, de Anthropic), bajo la dirección y supervisión del autor.

**Cómo citar:** Moro, I. (2026). *Interactivos de Geografía General I (Geografía Física)*. UNED, Centro Asociado de Vitoria-Gasteiz. https://moxkix.github.io/GEOFISICA_LA_TIERRA/

## Tema 1 · La Tierra planeta. Movimientos y representación (`tema1/`)
1. Forma y dimensiones (Eratóstenes; esfera, elipsoide y geoide con un corte por meridianos; el geoide en 3D con exageración variable y la altura del geoide en el municipio; la Luna)
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
6. Régimen térmico (ciclo anual, amplitud y retraso; comparador de 174 estaciones; práctica)
7. Isotermas (mapa mundial mes a mes, temperatura real o reducida al nivel del mar; ecuador térmico; corrientes; perfil por paralelos; ejercicio 4)
8. Cuestionario final (20 preguntas aleatorias de un banco de 28)

## Tema 3 · Elementos y factores climáticos II. La presión y la humedad atmosféricas (`tema3/`)
1. Isobaras (laboratorio de individuos isobáricos con práctica; viento sur de febrero de 2026; reducción al nivel del mar con la altitud del municipio; la DANA del 29 de octubre de 2024 en superficie y a 500 hPa)
2. El viento (fuerzas de gradiente, Coriolis y rozamiento; viento geostrófico y en superficie; convergencia y divergencia, ejercicios 3 y 5; ángulo real del viento con las isobaras sobre mar y tierra; escala de Beaufort)
3. Circulación general (presión y vientos medios mes a mes con ERA5, centros de acción y ZCIT; perfiles zonales; modelo de tres células y corrientes en chorro; ejercicio 4; zonas climáticas)
4. Ascenso y foehn (diagrama de ascenso con nivel de condensación y estabilidad; la fig. 3.16 con números actuales; corte del efecto foehn; foehn real en Bilbao, 24 de febrero de 2026)
5. Nubes y frentes (los diez géneros de nubes en ilustraciones propias, con juego; ciclo de vida de la borrasca noruega con corte y meteograma; meteograma real del paso del frente frío por Bilbao)
6. Distribución mundial (mapa de isoyetas anual y mensual de ERA5; 17 lugares extremos; perfil por latitudes; ciclo hidrológico; ejercicio 2, transecto del golfo de Guinea al Sáhara)
7. Regímenes (climograma de la estación más cercana al municipio; los seis regímenes del manual; práctica de clasificación; la lluvia tropical sigue al Sol)
8. Cuestionario final (20 preguntas aleatorias de un banco de 31)

Los contenidos del factor cósmico (insolación, estaciones) y el efecto de Coriolis enlazan con las pestañas correspondientes del Tema 1; los de humedad, con el Tema 2.

Cada pestaña incluye autoevaluación y, cuando procede, las correcciones respecto al texto de la Unidad Didáctica. La pestaña Inicio de cada tema las reúne en una tabla.

## Datos y licencias
- Reanálisis ERA5 (temas 2, 3 y 4): contiene información modificada del Servicio de Cambio Climático de Copernicus (2026). Ni la Comisión Europea ni el ECMWF son responsables del uso que se haga de esa información ni de los datos que contiene.
- Líneas de costa: Natural Earth 1:110m (dominio público), vía el paquete `world-atlas`.
- Municipios (8.132, con coordenadas): paquete `spanish-cities-info` (licencia ISC), verificado con el INE.
- Normales climatológicas 1991–2020 (temperatura media, máxima y mínima mensual): OMM, distribuidas por NOAA NCEI (accesión 0253808, v6.6); 83 estaciones españolas y 91 del resto del mundo (`data/tema2/`).
- Temperatura en rejilla para las isotermas: reanálisis ERA5 1991–2020 (Copernicus/ECMWF; de julio a diciembre, 1991–2019, porque la serie mensual de Earth Engine termina en junio de 2020), con altitud de ETOPO1 (NOAA). Se exporta a 0,25° con Google Earth Engine (`gee/era5_isotermas_tema2.js`) y `data/tema2/make_grid.py` la promedia en celdas de 2° (`data/tema2/era5_grid.json`).
- Precipitación 1991–2020 de las estaciones: normales de la OMM (NOAA NCEI, accesión 0253808, v6.6), con 9 estaciones añadidas para el Tema 3 (transecto del golfo de Guinea al Sáhara, Bombay, Cherrapunji); 174 estaciones en total (`data/tema2/stations.json`).
- Presión, viento y precipitación medios en rejilla: reanálisis ERA5 1991–2020 (`gee/era5_tema3_clima.js`; `data/tema3/make_clima.py` los promedia en celdas de 2° y 4°).
- Casos reales: ERA5 horario (Copernicus/ECMWF) en superficie de la DANA del 28–30 de octubre de 2024 y del viento sur del 23–26 de febrero de 2026 en Bilbao, con los niveles de 850, 500 y 250 hPa de MERRA-2 (NASA GMAO), porque la colección de ERA5 en niveles de presión de Earth Engine no tiene esas horas (`gee/era5_tema3_casos.js` elige la fuente automáticamente; `data/tema3/make_casos.py`); observaciones de AEMET citadas en el texto (efemérides de febrero de 2026).
- Altitud de los municipios: modelo digital SRTM de 1" (NASA/USGS) en el núcleo de población, localizado como el lugar con más población en su entorno (GHSL 2020, JRC) cerca del centroide del término y comprobado con los límites municipales del IGN (paquete `es-atlas`); si no se encuentra (un 5 % de los municipios), en el centroide. Script `gee/altitud_municipios.js`, generado por `data/tema3/gen_altitud_gee.py` y fusionado en `data/mun.json` con `data/tema3/add_altitudes.py`.
- Geoide: modelo EGM96 de la NGA (rejilla oficial de 15′, tomada del paquete `egm96-universal`), en nodos de 1° y, para España, en la rejilla de 15′ (`data/tema1/make_geoide.py` → `data/tema1/geoide.json`).
- Costas regionales de los mapas de la Península: Natural Earth 1:50m (dominio público). Ciclo hidrológico: Trenberth y otros (2007).
- Parámetros: elipsoide WGS84; oblicuidad 23,44°; constante solar 1.361 W/m²; posición solar con las fórmulas de baja precisión del *Astronomical Almanac*; Atmósfera Estándar de EE. UU. (1976) y perfiles tipo AFGL; balance energético de Trenberth, Fasullo y Kiehl (2009); presión de vapor de saturación con la fórmula de Magnus (OMM, 2018).
