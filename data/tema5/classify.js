#!/usr/bin/env node
/* Clasifica celdas con el mismo motor que el navegador (src/tema5/koppen.js).
   Uso: node classify.js entrada.bin salida.bin
   entrada: Float32 little-endian, N registros de 25 valores (12 temperaturas °C, 12 precipitaciones mm, latitud); NaN = sin dato
   salida: Uint8, 8 capas de N códigos (KG.code; 0 = sin dato), una por combinación de criterios:
           índice = (C/D a 0 °C ? 4 : 0) + (s con 40 mm ? 2 : 0) + (umbral por tramos ? 1 : 0)  (= T5.combo) */
const fs = require('fs');
const path = require('path');
const KG = require(path.join(__dirname, '../../src/tema5/koppen.js'));
const [, , fin, fout] = process.argv;
const buf = fs.readFileSync(fin);
const a = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const N = a.length / 25;
const out = new Uint8Array(8 * N);
for (let c = 0; c < 8; c++) {
  const o = { cd: c & 4 ? 0 : -3, sMm: c & 2 ? 40 : 30, arid: c & 1 ? 'peel' : 'patton' };
  for (let i = 0; i < N; i++) {
    const b = i * 25;
    if (!(a[b] === a[b]) || !(a[b + 12] === a[b + 12])) continue;
    const T = Array.from(a.subarray(b, b + 12)), P = Array.from(a.subarray(b + 12, b + 24));
    out[c * N + i] = KG.code(KG.type(T, P, a[b + 24], o));
  }
}
fs.writeFileSync(fout, out);
