#!/usr/bin/env python3
"""Convierte el extracto de las normales OMM 1991-2020 (NCEI, accesión 0253808, v6.6)
en data/tema2/stations.json (compartido por los temas 2 y 3) con nombres en castellano
y una categoría de régimen.

Cada estación: [id, nombre, país, lat, lon, altitud, categoría, ta, tx, tn, pr, vp]
  ta, tx, tn: temperatura media, máxima y mínima (décimas de °C; 12 meses + año)
  pr: precipitación (décimas de mm; 12 meses + año), de data/tema3/wmo_prcp_raw.txt
  vp: tensión media de vapor (décimas de hPa), solo en las estaciones añadidas en el Tema 3
"""
import json, pathlib
R = pathlib.Path(__file__).parent
ES = {
 '8001':'A Coruña','8002':'A Coruña (aeropuerto de Alvedro)','8280':'Albacete (Los Llanos)','8359':'Alicante (ciudad)',
 '8360':'Alicante-Elche (aeropuerto)','8487':'Almería (aeropuerto)','8011':'Asturias (aeropuerto)','8210':'Ávila',
 '8330':'Badajoz (Talavera la Real)','8181':'Barcelona (aeropuerto)','8025':'Bilbao (aeropuerto)','8075':'Burgos (Villafría)',
 '8261':'Cáceres','8452':'Cádiz (observatorio)','8286':'Castellón (Almassora)','8348':'Ciudad Real','8219':'Colmenar Viejo',
 '8410':'Córdoba (aeropuerto)','8231':'Cuenca','8157':'Daroca','8080':'Vitoria-Gasteiz (Foronda)','60035':'Fuerteventura (aeropuerto)',
 '8184':'Girona (aeropuerto)','8419':'Granada (aeropuerto)','8420':'Granada (base aérea de Armilla)','60030':'Gran Canaria (aeropuerto)',
 '60001':'El Hierro (aeropuerto)','8029':'Hondarribia','8383':'Huelva','8094':'Huesca (aeropuerto)','8373':'Ibiza (es Codolar)',
 '60010':'Izaña (Tenerife, 2.371 m)','8417':'Jaén','8451':'Jerez de la Frontera (aeropuerto)','60040':'Lanzarote (aeropuerto)',
 '60005':'La Palma (aeropuerto)','8055':'León (Virgen del Camino)','8171':'Lleida','8084':'Logroño (aeropuerto)','8008':'Lugo (Rozas)',
 '8221':'Madrid (Barajas)','8223':'Madrid (Cuatro Vientos)','8224':'Getafe','8222':'Madrid (Retiro)','8227':'Torrejón de Ardoz',
 '8482':'Málaga (aeropuerto)','60338':'Melilla','8314':'Menorca (aeropuerto)','8232':'Molina de Aragón','8397':'Morón de la Frontera',
 '8430':'Murcia','8429':'Murcia (Alcantarilla)','8433':'Murcia (San Javier)','8215':'Puerto de Navacerrada (1.894 m)','8048':'Ourense',
 '8015':'Oviedo','8306':'Palma de Mallorca (aeropuerto)','8301':'Palma (puerto)','8085':'Pamplona (aeropuerto)','8053':'Ponferrada',
 '8044':'Pontevedra','8175':'Reus (aeropuerto)','8449':'Rota (base naval)','8202':'Salamanca (Matacán)','8027':'San Sebastián (Igueldo)',
 '8021':'Santander (aeropuerto)','8042':'Santiago de Compostela (aeropuerto)','8213':'Segovia','8391':'Sevilla (aeropuerto)','8148':'Soria',
 '60020':'Santa Cruz de Tenerife','60015':'Tenerife Norte (Los Rodeos)','60025':'Tenerife Sur','8235':'Teruel','8272':'Toledo',
 '8238':'Tortosa (Observatorio del Ebro)','8285':'València (ciudad)','8284':'València (aeropuerto)','8141':'Valladolid',
 '8140':'Valladolid (Villanubla)','8045':'Vigo (Peinador)','8130':'Zamora','8160':'Zaragoza (aeropuerto)'}
W = {
 '48698':('Singapur','Singapur','ecu'),'82191':('Belém','Brasil','ecu'),'82331':('Manaos','Brasil','ecu'),
 '21205791':('Bogotá (2.547 m)','Colombia','mon'),'96747':('Yakarta','Indonesia','ecu'),'65203':('Lagos','Nigeria','tro'),
 '61052':('Niamey','Níger','tro'),'94120':('Darwin','Australia','tro'),'83377':('Brasilia (1.161 m)','Brasil','tro'),
 '48455':('Bangkok','Tailandia','tro'),'62721':('Jartum','Sudán','des'),'78397':('Kingston','Jamaica','tro'),
 '62366':('El Cairo','Egipto','des'),'40438':('Riad','Arabia Saudí','des'),'94326':('Alice Springs','Australia','des'),
 '60630':('In Salah','Argelia','des'),'72278':('Phoenix','Estados Unidos','des'),'41194':('Dubái','Emiratos Árabes Unidos','des'),
 '85442':('Antofagasta','Chile','des'),'85418':('Iquique','Chile','des'),'16239':('Roma (Ciampino)','Italia','med'),
 '94608':('Perth','Australia','med'),'85577':('Santiago de Chile','Chile','med'),'72295':('Los Ángeles','Estados Unidos','med'),
 '72494':('San Francisco','Estados Unidos','med'),'7110':('Brest','Francia','oce'),'3969':('Dublín','Irlanda','oce'),
 '3953':('Valentia','Irlanda','oce'),'1317':('Bergen','Noruega','oce'),'94970':('Hobart','Australia','oce'),
 '93439':('Wellington','Nueva Zelanda','oce'),'72793':('Seattle','Estados Unidos','oce'),'4030':('Reikiavik','Islandia','sub'),
 '87938':('Ushuaia','Argentina','sub'),'71783':('Victoria','Canadá','oce'),'27612':('Moscú','Rusia','con'),
 '12375':('Varsovia','Polonia','con'),'33345':('Kiev','Ucrania','con'),'54511':('Pekín','China','con'),
 '72530':('Chicago','Estados Unidos','con'),'44292':('Ulán Bator (1.303 m)','Mongolia','con'),'72506':('Nueva York','Estados Unidos','con'),
 '10381':('Berlín','Alemania','con'),'26850':('Minsk','Bielorrusia','con'),'27595':('Kazán','Rusia','con'),
 '28698':('Omsk','Rusia','con'),'29430':('Tomsk','Rusia','con'),'30710':('Irkutsk','Rusia','con'),
 '31735':('Jabárovsk','Rusia','con'),'71155':('Edmonton','Canadá','con'),'71742':('Gander','Canadá','con'),
 '71508':('Toronto','Canadá','con'),'40754':('Teherán (1.191 m)','Irán','des'),'38457':('Taskent','Uzbekistán','con'),
 '47662':('Tokio','Japón','sbt'),'31960':('Vladivostok','Rusia','con'),'24959':('Yakutsk','Rusia','sba'),
 '24266':('Verjoyansk','Rusia','sba'),'24688':('Oymyakón (740 m)','Rusia','sba'),'70261':('Fairbanks','Estados Unidos','sba'),
 '31088':('Ojotsk','Rusia','sba'),'25913':('Magadán','Rusia','sba'),'32583':('Petropávlovsk-Kamchatski','Rusia','sba'),
 '70273':('Anchorage','Estados Unidos','sba'),'70026':('Utqiaġvik (Barrow)','Estados Unidos','pol'),'4202':('Pituffik (Thule)','Groenlandia','pol'),
 '71018':('Resolute','Canadá','pol'),'71355':('Alert','Canadá','pol'),'4250':('Nuuk','Groenlandia','sub'),
 '71321':('Iqaluit','Canadá','pol'),'1026':('Tromsø','Noruega','sub'),'88968':('Base Orcadas','Antártida','pol'),
 '88963':('Base Esperanza','Antártida','pol'),'89665':('Base Scott','Antártida','pol'),'89611':('Base Casey','Antártida','pol'),
 '89034':('Base Belgrano II','Antártida','pol'),'87585':('Buenos Aires','Argentina','sbt'),'68816':('Ciudad del Cabo','Sudáfrica','med'),
 '94768':('Sídney','Australia','sbt'),'85934':('Punta Arenas','Chile','sub'),'91182':('Honolulú','Estados Unidos','tro'),
 '36870':('Almaty (847 m)','Kazajistán','con')}
W.update({'65344': ('Cotonú', 'Benín', 'tro'), '65330': ('Parakou', 'Benín', 'tro'), '61099': ('Gaya', 'Níger', 'tro'),
 '61043': ('Tahoua', 'Níger', 'tro'), '61024': ('Agadez', 'Níger', 'des'), '61017': ('Bilma', 'Níger', 'des'),
 '64456': ('Makoua', 'República del Congo', 'ecu'), '43003': ('Bombay (Santacruz)', 'India', 'mzn'),
 '42515': ('Cherrapunji (1.313 m)', 'India', 'mzn')})
FIX = {'8430': (38.002, -1.171)}  # coordenadas erróneas en el fichero OMM; valores de la estación AEMET 7178I (Murcia)
def vecx(s):
    if not s: return None
    v = [int(x) if x != '' else None for x in s.split(',')]
    return None if any(x is None or x <= -9000 for x in v[:12]) else v
PR = {}
for l in (R.parent / 'tema3' / 'wmo_prcp_raw.txt').read_text().splitlines():
    i, lat, v, cs = l.split('|'); vv = [int(x) for x in v.split(',')]
    assert sum(vv) == int(cs), i
    PR[i] = None if any(x <= -900 for x in vv[:12]) else vv[:12] + [sum(vv[:12])]
out = []
for l in (R / 'wmo_9120_raw.txt').read_text().splitlines():
    p = l.split('|'); i = p[0]
    vec = lambda s: [int(x) if x != '' else None for x in s.split(',')] if s else None
    ta, tx, tn = vec(p[6]), vec(p[7]), vec(p[8])
    if tx and any(v is None for v in tx[:12]): tx = None
    if tn and any(v is None for v in tn[:12]): tn = None
    lat, lon = float(p[3]), float(p[4])
    if i in FIX: lat, lon = FIX[i]
    if p[2] == 'Spain':
        name, country, cat = ES[i], 'España', 'es'
    else:
        name, country, cat = W[i]
    out.append([i, name, country, round(lat, 3), round(lon, 3), int(float(p[5])), cat, ta, tx, tn, PR.get(i), None])
# estaciones añadidas en el Tema 3 (transecto de África occidental y ejemplos de regímenes)
for l in (R.parent / 'tema3' / 'wmo_extra_raw.txt').read_text().splitlines():
    p = l.split('|'); i = p[0]
    pr, ta, tx, tn, vp = (vecx(x) for x in p[6:11])
    prev = next((o for o in out if o[0] == i), None)
    if prev: prev[11] = vp; continue  # ya estaba (Niamey): solo se añade la tensión de vapor
    if ta is None and tx and tn: ta = [round((a + b) / 2) for a, b in zip(tx, tn)]
    name, country, cat = W[i]
    out.append([i, name, country, round(float(p[3]), 3), round(float(p[4]), 3), int(float(p[5])), cat, ta, tx, tn, pr, vp])
json.dump({'s': out}, open(R / 'stations.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'estaciones;', (R / 'stations.json').stat().st_size, 'bytes')
