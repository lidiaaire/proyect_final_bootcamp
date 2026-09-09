// Utilidades puras (sin PDFKit) compartidas por los helpers de layout y,
// más adelante, por las plantillas. Se separan del resto porque son las
// únicas piezas de esta carpeta con lógica real testeable de forma
// aislada (ver back/tests/documentosLayoutUtils.test.js).

const { PAGE } = require("./theme");

/** Ancho de contenido disponible en una página A4 con el margen estándar. */
function anchoContenido(doc) {
  return doc.page.width - PAGE.margin * 2;
}

/** "14/05/1985" a partir de un Date o de un string ISO. Sin dato -> null. */
function formatearFecha(fecha) {
  if (!fecha) return null;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/** "14/05/1985 · 10:30" -- fecha + hora, usado en episodios de urgencias/alta. */
function formatearFechaHora(fecha) {
  if (!fecha) return null;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;

  const horas = String(d.getHours()).padStart(2, "0");
  const minutos = String(d.getMinutes()).padStart(2, "0");
  return `${formatearFecha(d)} · ${horas}:${minutos}`;
}

/**
 * Edad en años cumplidos a fecha de referencia (por defecto hoy). Se usa
 * para el "(40 años)" que acompaña a la fecha de nacimiento en las 6
 * plantillas. Devuelve null si falta la fecha de nacimiento.
 */
function calcularEdad(fechaNacimiento, fechaReferencia = new Date()) {
  if (!fechaNacimiento) return null;
  const nacimiento = fechaNacimiento instanceof Date ? fechaNacimiento : new Date(fechaNacimiento);
  const referencia = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
  if (Number.isNaN(nacimiento.getTime())) return null;

  let edad = referencia.getFullYear() - nacimiento.getFullYear();
  const meses = referencia.getMonth() - nacimiento.getMonth();
  if (meses < 0 || (meses === 0 && referencia.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

/**
 * "MASCULINO"/"FEMENINO" (valores semánticos de Policyholder.sexo, ver
 * arquitectura documental aprobada) a la etiqueta visual que muestran
 * las plantillas ("Masculino"/"Femenino"). Cualquier otro valor (o
 * ausente) se devuelve tal cual / como guion, nunca se inventa un sexo.
 */
function formatearSexo(sexo) {
  if (sexo === "MASCULINO") return "Masculino";
  if (sexo === "FEMENINO") return "Femenino";
  return sexo || "—";
}

module.exports = {
  anchoContenido,
  formatearFecha,
  formatearFechaHora,
  calcularEdad,
  formatearSexo,
};
