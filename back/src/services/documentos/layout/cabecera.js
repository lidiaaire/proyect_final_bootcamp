// Cabecera compartida por los 6 documentos clínicos de Braun Medical
// Center. Se divide en DOS piezas independientes a propósito:
//
//   - pintarFranjaMarca: el bloque de marca (logo + nombre + eslogan +
//     dirección + claim). Es idéntico en las 6 referencias visuales,
//     VOLANTE_MEDICO incluido -- así que es la única parte de la
//     cabecera que el volante también reutiliza.
//
//   - pintarTituloConMetadatos: la fila de "eyebrow + título grande +
//     subtítulo" a la izquierda y la caja de metadatos (Nº de informe,
//     fecha, servicio, centro...) a la derecha. Esto SOLO aparece en
//     los 5 informes A4 (INFORME_CLINICO, INFORME_RESULTADOS,
//     PROPUESTA_QUIRURGICA, INFORME_URGENCIAS,
//     INFORME_ALTA_HOSPITALARIA). VOLANTE_MEDICO tiene su propia fila
//     de cabecera (formulario de prescripción, no un título de
//     informe) y NO debe llamar a esta función -- se construye en su
//     propia plantilla (paso posterior).
//
// `pintarCabecera` es un atajo que encadena las dos para los 5 informes
// A4, para no repetir la misma llamada doble en cada plantilla.

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const { anchoContenido } = require("./utils");

// Identidad fija del centro médico demo -- no depende de ninguna
// solicitud, por eso vive aquí como constante y no como parámetro.
const IDENTIDAD_BRAUN = {
  nombre: "Braun",
  nombreLinea2: "Medical Center",
  eslogan: "Tu salud, nuestra prioridad",
  direccionLinea1: "Av. Diagonal 123, 08028 Barcelona",
  direccionLinea2: "Tel. 93 502 14 00  |  www.braunmedical.es",
  claimLinea1: "Comprometidos",
  claimLinea2: "con una medicina",
  claimLinea3: "más humana",
};

/** Cruz de logo dibujada vectorialmente (sin ningún asset de imagen). */
function dibujarLogo(doc, x, y, size = 26) {
  const brazo = size / 3;
  doc.save();
  doc.fillColor(COLORS.primary);
  // Cruz = dos rectángulos superpuestos, con las esquinas exteriores
  // redondeadas para que no se vea como una cruz "de farmacia" recta.
  doc.roundedRect(x + brazo, y, brazo, size, 3).fill();
  doc.roundedRect(x, y + brazo, size, brazo, 3).fill();
  doc.restore();
}

/**
 * Franja de marca superior: logo + wordmark + eslogan (izquierda),
 * dirección del centro (centro-derecha) y claim corporativo (derecha),
 * separados por una línea vertical fina. Devuelve el Y donde termina la
 * franja (antes de la línea divisoria inferior).
 */
function pintarFranjaMarca(doc) {
  const left = PAGE.margin;
  const top = PAGE.margin;
  const width = anchoContenido(doc);

  dibujarLogo(doc, left, top, 28);

  doc
    .fillColor(COLORS.text)
    .font(FONTS.bold)
    .fontSize(15)
    .text(IDENTIDAD_BRAUN.nombre, left + 36, top - 2, { lineBreak: false });
  doc
    .font(FONTS.bold)
    .fontSize(15)
    .fillColor(COLORS.text)
    .text(IDENTIDAD_BRAUN.nombreLinea2, left + 36, top + 13, { lineBreak: false });
  doc
    .font(FONTS.regular)
    .fontSize(8)
    .fillColor(COLORS.textMuted)
    .text(IDENTIDAD_BRAUN.eslogan, left + 36, top + 30, { lineBreak: false });

  // Dirección: centrada en el tercio central de la franja.
  const direccionX = left + width * 0.42;
  const direccionWidth = width * 0.32;
  doc
    .font(FONTS.bold)
    .fontSize(SIZES.meta)
    .fillColor(COLORS.text)
    .text(IDENTIDAD_BRAUN.direccionLinea1, direccionX, top, {
      width: direccionWidth,
      align: "left",
    });
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(COLORS.textMuted)
    .text(IDENTIDAD_BRAUN.direccionLinea2, direccionX, top + 13, {
      width: direccionWidth,
      align: "left",
    });

  // Separador vertical + claim, pegados al margen derecho.
  const claimWidth = width * 0.16;
  const claimX = left + width - claimWidth;
  const separadorX = claimX - 12;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(separadorX, top - 2)
    .lineTo(separadorX, top + 34)
    .stroke();

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(COLORS.textMuted)
    .text(`${IDENTIDAD_BRAUN.claimLinea1}\n${IDENTIDAD_BRAUN.claimLinea2}\n${IDENTIDAD_BRAUN.claimLinea3}`, claimX, top, {
      width: claimWidth,
      align: "left",
      lineGap: 1,
    });

  const bottom = top + 46;
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(left, bottom)
    .lineTo(left + width, bottom)
    .stroke();

  return bottom + 14;
}

/**
 * Fila de título del informe: eyebrow opcional + título + subtítulo a
 * la izquierda, caja de metadatos a la derecha. Exclusiva de los 5
 * informes A4 -- VOLANTE_MEDICO no la usa.
 *
 * @param {number} y Y de inicio (normalmente el valor devuelto por pintarFranjaMarca).
 * @param {{eyebrow?: string, titulo: string, subtitulo?: string, metadatos?: {label:string, value:string}[]}} opciones
 * @returns {number} Y donde termina el bloque, listo para la siguiente sección.
 */
function pintarTituloConMetadatos(doc, y, { eyebrow, titulo, subtitulo, metadatos = [] } = {}) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);
  const metaBoxWidth = 190;
  const tituloWidth = width - metaBoxWidth - 20;

  let cursorY = y;

  if (eyebrow) {
    doc
      .font(FONTS.bold)
      .fontSize(SIZES.eyebrow)
      .fillColor(COLORS.textMuted)
      .text(eyebrow.toUpperCase(), left, cursorY, { characterSpacing: 1.2, width: tituloWidth });
    cursorY += 16;
  }

  doc
    .font(FONTS.bold)
    .fontSize(SIZES.title)
    .fillColor(COLORS.text)
    .text(titulo, left, cursorY, { width: tituloWidth });
  cursorY = doc.y + 2;

  if (subtitulo) {
    doc
      .font(FONTS.regular)
      .fontSize(SIZES.subtitle)
      .fillColor(COLORS.textMuted)
      .text(subtitulo, left, cursorY, { width: tituloWidth });
    cursorY = doc.y;
  }

  // Caja de metadatos, alineada por arriba con el bloque de título.
  if (metadatos.length) {
    const boxX = left + width - metaBoxWidth;
    const boxY = y;
    const rowHeight = 15;
    const boxHeight = metadatos.length * rowHeight + 12;

    doc
      .roundedRect(boxX, boxY, metaBoxWidth, boxHeight, 4)
      .fillAndStroke(COLORS.white, COLORS.border);

    let filaY = boxY + 8;
    metadatos.forEach(({ label, value }) => {
      doc
        .font(FONTS.regular)
        .fontSize(SIZES.label)
        .fillColor(COLORS.textMuted)
        .text(label, boxX + 10, filaY, { width: 80, lineBreak: false });
      doc
        .font(FONTS.bold)
        .fontSize(SIZES.meta)
        .fillColor(COLORS.text)
        .text(value ?? "—", boxX + 92, filaY - 1, { width: metaBoxWidth - 100, lineBreak: false });
      filaY += rowHeight;
    });

    cursorY = Math.max(cursorY, boxY + boxHeight);
  }

  return cursorY + 16;
}

/** Atajo: franja de marca + título con metadatos, para los 5 informes A4. */
function pintarCabecera(doc, opciones) {
  const y = pintarFranjaMarca(doc);
  return pintarTituloConMetadatos(doc, y, opciones);
}

module.exports = {
  IDENTIDAD_BRAUN,
  pintarFranjaMarca,
  pintarTituloConMetadatos,
  pintarCabecera,
};
