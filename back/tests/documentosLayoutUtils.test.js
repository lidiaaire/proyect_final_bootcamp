// Tests de las utilidades puras de la infraestructura de layout
// documental (sin PDFKit, sin base de datos). Ejecutar con: node --test tests/
//
// No se testea el resto de layout/ (cabecera, piePagina, datosPaciente,
// bloqueSeccion, bloqueFirma): son funciones de dibujo sobre un
// PDFDocument, la validación real es visual (ver
// scripts/dev/previewLayoutPdf.js), no tiene sentido una suite
// artificial de aserciones sobre coordenadas.

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  formatearFecha,
  formatearFechaHora,
  calcularEdad,
  formatearSexo,
} = require("../src/services/documentos/layout/utils");

test("formatearFecha: Date -> dd/mm/aaaa", () => {
  assert.equal(formatearFecha(new Date(1985, 4, 14)), "14/05/1985");
});

test("formatearFecha: string ISO -> dd/mm/aaaa", () => {
  assert.equal(formatearFecha("1985-05-14T00:00:00.000Z"), "14/05/1985");
});

test("formatearFecha: sin fecha -> null, no explota", () => {
  assert.equal(formatearFecha(null), null);
  assert.equal(formatearFecha(undefined), null);
});

test("formatearFecha: fecha inválida -> null", () => {
  assert.equal(formatearFecha("no-es-una-fecha"), null);
});

test("formatearFechaHora: incluye fecha y hora", () => {
  const fecha = new Date(2026, 1, 18, 14, 32);
  assert.equal(formatearFechaHora(fecha), "18/02/2026 · 14:32");
});

test("calcularEdad: cumpleaños ya pasado este año", () => {
  const nacimiento = new Date(1985, 4, 14); // 14/05/1985
  const referencia = new Date(2026, 5, 1); // 01/06/2026 -- ya cumplió
  assert.equal(calcularEdad(nacimiento, referencia), 41);
});

test("calcularEdad: cumpleaños todavía no llegado este año", () => {
  const nacimiento = new Date(1985, 4, 14); // 14/05/1985
  const referencia = new Date(2026, 2, 1); // 01/03/2026 -- todavía no
  assert.equal(calcularEdad(nacimiento, referencia), 40);
});

test("calcularEdad: mismo día del cumpleaños ya cuenta el año nuevo", () => {
  const nacimiento = new Date(1985, 4, 14);
  const referencia = new Date(2026, 4, 14);
  assert.equal(calcularEdad(nacimiento, referencia), 41);
});

test("calcularEdad: sin fecha de nacimiento -> null, no explota", () => {
  assert.equal(calcularEdad(null), null);
});

test("formatearSexo: valores semánticos de Policyholder.sexo a etiqueta visual", () => {
  assert.equal(formatearSexo("MASCULINO"), "Masculino");
  assert.equal(formatearSexo("FEMENINO"), "Femenino");
});

test("formatearSexo: valor ausente o desconocido no se inventa, se refleja tal cual o como guion", () => {
  assert.equal(formatearSexo(undefined), "—");
  assert.equal(formatearSexo(""), "—");
  assert.equal(formatearSexo("OTRO"), "OTRO");
});
