// Genera data/tema4/mareas.json: componentes armónicas de mareógrafos españoles y de puertos de referencia
// mundiales, tomadas de la base de datos abierta Neaps (TICON-4, Hart-Davis et al. 2025, y NOAA CO-OPS).
// Uso (con @neaps/tide-database instalado en la carpeta de trabajo):  node data/tema4/make_mareas.mjs salida.json
import * as db from '@neaps/tide-database';
import { writeFileSync } from 'node:fs';

const KEEP = new Set(['M2', 'S2', 'N2', 'K2', '2N2', 'MU2', 'NU2', 'L2', 'T2', 'K1', 'O1', 'P1', 'Q1', 'J1', 'OO1', '2Q1', 'RHO1', 'S1',
  'M4', 'MS4', 'MN4', 'M6', 'MK3', 'M3', 'S4', 'SA', 'SSA', 'MM', 'MF', 'LAM2', 'MSF', '2SM2']);
const ALIAS = { LAMBDA2: 'LAM2', RHO: 'RHO1' };
const ES = {
  alboran: 'Alborán', alcudia: 'Alcúdia', algeciras: 'Algeciras', 'alicante i': 'Alicante', almeria: 'Almería', arrecife: 'Arrecife', aviles: 'Avilés',
  barcelona: 'Barcelona', bilbao: 'Bilbao', bonanza: 'Bonanza (Sanlúcar de Barrameda)', cadiz: 'Cádiz', carboneras: 'Carboneras', cartagena: 'Cartagena',
  ceuta: 'Ceuta', 'colonia sant pere': 'Colònia de Sant Pere', coruna: 'A Coruña', 'la coruna': 'A Coruña', cruz: 'Santa Cruz de La Palma',
  'el hierro': 'El Hierro (La Estaca)', ferrol: 'Ferrol', formentera: 'Formentera (La Savina)', fuerteventura: 'Puerto del Rosario', gandia: 'Gandia',
  gijon: 'Gijón', gomera: 'San Sebastián de La Gomera', huelva: 'Huelva', ibiza: 'Eivissa', langosteira: 'Langosteira (A Coruña)', 'la palma': 'Santa Cruz de La Palma',
  'las palmas': 'Las Palmas de Gran Canaria', mahon: 'Maó', malaga: 'Málaga', marin: 'Marín', melilla: 'Melilla', motril: 'Motril', palma: 'Palma',
  'palmade mallorca': 'Palma', pasaia: 'Pasaia', pollensa: 'Pollença', sagunto: 'Sagunto', 'san cibrao': 'San Cibrao', santander: 'Santander',
  'sevilla': 'Sevilla (Guadalquivir)', tarifa: 'Tarifa', tarragona: 'Tarragona', tenerife: 'Tenerife', valencia: 'Valencia', vigo: 'Vigo',
  villagarcia: 'Vilagarcía de Arousa', 's cruz d palma': 'Santa Cruz de La Palma',
};
const TENERIFE = (s) => (s.longitude > -16.4 ? 'Santa Cruz de Tenerife' : s.latitude > 28.3 ? 'Puerto de la Cruz' : 'Los Cristianos');
const RANK = (id) => (/-ieo$/.test(id) ? 0 : /uhslc_rq$/.test(id) ? 1 : /uhslc_fd$/.test(id) ? 2 : /cmems$/.test(id) ? 3 : 4);
const WORLD = [
  ['ticon/saint_malo-410-fra-refmar', 'Saint-Malo (Francia)'], ['ticon/avonmouth-avo-gbr-bodc', 'Avonmouth, estuario del Severn (Reino Unido)'],
  ['ticon/spencers_island-242-can-meds', 'Spencers Island, bahía de Fundy (Canadá)'], ['noaa/9455920', 'Anchorage, Alaska (EE. UU.)'],
  ['ticon/broome-166-aus-uhslc_fd', 'Broome (Australia)'], ['ticon/brest-822-fra-uhslc_fd', 'Brest (Francia)'], ['ticon/cascais-209-prt-uhslc_fd', 'Cascais, Lisboa (Portugal)'],
  ['ticon/reykjavik-reyk-isl-icg', 'Reikiavik (Islandia)'], ['ticon/dakar-223-sen-uhslc_fd', 'Dakar (Senegal)'], ['ticon/callao-093-per-uhslc_fd', 'El Callao (Perú)'],
  ['noaa/9447130', 'Seattle (EE. UU.)'], ['noaa/1612340', 'Honolulu, Hawái (EE. UU.)'], ['ticon/manila-370-phl-uhslc_fd', 'Manila (Filipinas)'],
  ['noaa/8771450', 'Galveston, golfo de México (EE. UU.)'], ['ticon/hon_dau-650a-vnm-uhslc_rq', 'Hon Dau, golfo de Tonkín (Vietnam)'],
  ['ticon/marseille-524-fra-refmar', 'Marsella (Francia)'], ['ticon/stockholm-2069-swe-smhi', 'Estocolmo, mar Báltico (Suecia)'],
];
const km = (a, b) => Math.hypot((a.latitude - b.latitude) * 111, (a.longitude - b.longitude) * 111 * Math.cos(a.latitude * Math.PI / 180));
function pack(s, name, group) {
  const hc = [];
  for (const c of s.harmonic_constituents) { const n = ALIAS[c.name] || c.name; if (KEEP.has(n) && c.amplitude >= 0.003) hc.push([n, +c.amplitude.toFixed(4), +((c.phase % 360 + 360) % 360).toFixed(1)]); }
  hc.sort((a, b) => b[1] - a[1]);
  const d = s.datums || {}, msl = d.MSL != null && d.LAT != null ? +(d.MSL - d.LAT).toFixed(2) : null;
  const src = s.id.startsWith('noaa/') ? 'NOAA CO-OPS' : s.id.startsWith('kartverket/') ? 'Kartverket' : 'TICON-4';
  return { id: s.id, name, group, lat: +s.latitude.toFixed(3), lon: +s.longitude.toFixed(3), msl, src, lic: s.license?.type || '', hc };
}
const out = [];
// España: una estación por puerto (a menos de 8 km se consideran el mismo), con preferencia por las series más largas
const es = db.stations.filter((s) => s.country_code === 'ES' && s.type === 'reference' && s.harmonic_constituents.length)
  .sort((a, b) => RANK(a.id) - RANK(b.id));
const chosen = [];
for (const s of es) { if (chosen.some((c) => km(c, s) < 8)) continue; chosen.push(s); }
for (const s of chosen) {
  const key = s.name.toLowerCase().replace(/tg$/, '').trim();
  const name = key === 'tenerife' ? TENERIFE(s) : ES[key] || s.name;
  out.push(pack(s, name, 'es'));
}
for (const [id, name] of WORLD) { const s = db.stationsById.get(id); if (s) out.push(pack(s, name, 'mundo')); else console.error('falta', id); }
const json = { src: 'Constantes armónicas de TICON-4 (Hart-Davis, Dettmering y Seitz, 2025; SEANOE, doi:10.17882/109129; CC BY 4.0 y CC BY-NC 4.0) y NOAA CO-OPS (dominio público), vía la base de datos abierta Neaps (github.com/openwatersio/tide-database)', st: out };
writeFileSync(process.argv[2] || 'mareas.json', JSON.stringify(json));
console.log(out.length, 'estaciones;', out.filter((s) => s.group === 'es').length, 'españolas');
for (const s of out) console.log(s.group, s.name.padEnd(42), s.lat, s.lon, 'M2', s.hc.find((c) => c[0] === 'M2')?.[1], 'n', s.hc.length, 'msl', s.msl, s.src);
