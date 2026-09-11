// Bloque de firma/médico responsable: línea de firma + nombre +
// especialidad + colegiado + centro (izquierda), fecha de
// validación/emisión (derecha). Es la única pieza del cuerpo del
// documento -- aparte de la franja de marca y el pie -- que
// VOLANTE_MEDICO también reutiliza tal cual (su "Firma y sello del
// profesional" tiene la misma forma: nombre, especialidad, colegiado,
// centro).
//
// `x`/`width` son opcionales (por defecto ocupan todo el ancho de
// contenido, como hasta ahora) para que VOLANTE_MEDICO pueda encajar
// este mismo bloque en una columna estrecha de su formulario en vez de
// a ancho completo -- sin duplicar la lógica de dibujo del bloque.

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const { anchoContenido } = require("./utils");

/**
 * @param {number} y
 * @param {{
 *   nombreMedico: string,
 *   especialidadLabel?: string,
 *   numeroColegiado?: string,
 *   centro?: string,
 *   fechaLabel?: string,
 *   fechaValor?: string,
 *   x?: number,
 *   width?: number,
 * }} opciones
 * @returns {number} Y donde termina el bloque.
 */
function pintarBloqueFirma(
  doc,
  y,
  {
    nombreMedico,
    especialidadLabel,
    numeroColegiado,
    centro,
    fechaLabel = "Fecha de emisión",
    fechaValor,
    x,
    width,
  },
) {
  const left = x ?? PAGE.margin;
  const totalWidth = width ?? anchoContenido(doc);
  const firmaWidth = fechaValor ? totalWidth * 0.55 : totalWidth;

  // Línea de firma (no hay imagen de firma real: un simple trazo sirve
  // de marcador visual, coherente con "documento simulado").
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(left, y)
    .lineTo(left + 150, y)
    .stroke();

  let cursorY = y + 8;
  doc
    .font(FONTS.bold)
    .fontSize(SIZES.meta)
    .fillColor(COLORS.text)
    .text(nombreMedico, left, cursorY, { width: firmaWidth, lineBreak: false });
  cursorY += 13;

  if (especialidadLabel) {
    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.textMuted)
      .text(especialidadLabel, left, cursorY, { width: firmaWidth, lineBreak: false });
    cursorY += 12;
  }

  if (numeroColegiado) {
    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.textMuted)
      .text(`Nº de colegiado: ${numeroColegiado}`, left, cursorY, { width: firmaWidth, lineBreak: false });
    cursorY += 12;
  }

  if (centro) {
    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.textMuted)
      .text(centro, left, cursorY, { width: firmaWidth, lineBreak: false });
    cursorY += 12;
  }

  if (fechaValor) {
    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.textMuted)
      .text(`${fechaLabel}: ${fechaValor}`, left + firmaWidth, y + 8, {
        width: totalWidth - firmaWidth,
        align: "right",
        lineBreak: false,
      });
  }

  return Math.max(cursorY, y + 20) + 4;
}

/**
 * Altura real que ocupará `pintarBloqueFirma` sin dibujar nada --
 * replica exactamente los mismos incrementos que el propio dibujo
 * (8 inicial + 13 de la línea de nombre + 12 por cada campo opcional
 * presente), para que quien compone una plantilla pueda reservar el
 * espacio justo en vez de una estimación fija que podía quedarse corta
 * (con los 3 campos opcionales presentes la altura real es ~57, no los
 * 40 que se reservaban antes) o sobrar página de más.
 */
function calcularAltoBloqueFirma({ especialidadLabel, numeroColegiado, centro }) {
  let altura = 8 + 13;
  if (especialidadLabel) altura += 12;
  if (numeroColegiado) altura += 12;
  if (centro) altura += 12;
  return Math.max(altura, 20) + 4;
}

module.exports = { pintarBloqueFirma, calcularAltoBloqueFirma };
