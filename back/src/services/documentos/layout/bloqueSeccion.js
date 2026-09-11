// Bloque de sección genérico: cabecera con título sobre fondo suave +
// cuerpo (párrafo, lista o tabla de 2 columnas). Es el primitivo que
// componen los 5 informes A4 para "Motivo de consulta", "Antecedentes",
// "Hallazgos", "Diagnóstico", "Material protésico", etc. -- cada
// plantilla decide cuántos bloques usa, en qué orden y a qué ancho (uno
// a ancho completo o dos en paralelo), este helper no lo impone.
//
// No se usa en VOLANTE_MEDICO: su información no se organiza en
// secciones con título, sino en un formulario de campos.

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const { anchoContenido } = require("./utils");

// Cabecera de sección, relleno interior y hueco tras el bloque --
// ajustados (sin tocar ningún tamaño de fuente) para que los informes
// A4 con varias secciones quepan en una página cuando el contenido real
// lo permite, en vez de dejar una segunda página con una sola sección
// suelta por un margen de aire innecesario entre bloques.
const ALTO_CABECERA = 16;
const PADDING = 9;
const HUECO_TRAS_BLOQUE = 8;

/**
 * Calcula X/ancho para `n` columnas iguales dentro del ancho de
 * contenido, con un hueco fijo entre ellas. Utilidad mínima para poder
 * poner secciones en paralelo (como en las referencias de resultados,
 * cirugía, urgencias y alta) sin que cada plantilla repita la
 * aritmética.
 */
function calcularColumnas(doc, n, gap = 14) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);
  const colWidth = (width - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: left + i * (colWidth + gap),
    width: colWidth,
  }));
}

function altoContenido(doc, width, contenido) {
  const innerWidth = width - PADDING * 2;
  doc.font(FONTS.regular).fontSize(SIZES.body);

  if (contenido.tipo === "lista") {
    return contenido.items.reduce(
      (acc, item) => acc + doc.heightOfString(item, { width: innerWidth - 12, lineGap: 2 }) + 6,
      0,
    );
  }

  if (contenido.tipo === "tabla") {
    const filaAlto = 18;
    return (contenido.encabezados ? filaAlto : 0) + contenido.filas.length * filaAlto;
  }

  // texto simple
  return doc.heightOfString(contenido.texto || "", { width: innerWidth, lineGap: 2 });
}

function pintarCuerpo(doc, x, y, width, contenido) {
  const innerX = x + PADDING;
  const innerWidth = width - PADDING * 2;

  if (contenido.tipo === "lista") {
    let cursorY = y;
    contenido.items.forEach((item) => {
      doc
        .font(FONTS.regular)
        .fontSize(SIZES.body)
        .fillColor(COLORS.text)
        .text("•", innerX, cursorY, { continued: false, width: 10 });
      doc
        .font(FONTS.regular)
        .fontSize(SIZES.body)
        .fillColor(COLORS.text)
        .text(item, innerX + 12, cursorY, { width: innerWidth - 12, lineGap: 2 });
      cursorY = doc.y + 6;
    });
    return cursorY;
  }

  if (contenido.tipo === "tabla") {
    const filaAlto = 18;
    const col2X = innerX + innerWidth * 0.55;
    let cursorY = y;

    if (contenido.encabezados) {
      doc
        .font(FONTS.bold)
        .fontSize(SIZES.label)
        .fillColor(COLORS.textMuted)
        .text(contenido.encabezados[0], innerX, cursorY, { width: innerWidth * 0.55 - 6, lineBreak: false });
      doc
        .font(FONTS.bold)
        .fontSize(SIZES.label)
        .fillColor(COLORS.textMuted)
        .text(contenido.encabezados[1], col2X, cursorY, { width: innerWidth * 0.45, lineBreak: false });
      cursorY += filaAlto;
    }

    contenido.filas.forEach(([c1, c2], i) => {
      if (i > 0) {
        doc
          .strokeColor(COLORS.borderLight)
          .lineWidth(0.5)
          .moveTo(innerX, cursorY - 4)
          .lineTo(innerX + innerWidth, cursorY - 4)
          .stroke();
      }
      doc
        .font(FONTS.regular)
        .fontSize(SIZES.body)
        .fillColor(COLORS.text)
        .text(c1, innerX, cursorY, { width: innerWidth * 0.55 - 6, lineBreak: false });
      doc
        .font(FONTS.regular)
        .fontSize(SIZES.body)
        .fillColor(COLORS.textMuted)
        .text(c2, col2X, cursorY, { width: innerWidth * 0.45, lineBreak: false });
      cursorY += filaAlto;
    });

    return cursorY;
  }

  // texto simple
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.body)
    .fillColor(COLORS.text)
    .text(contenido.texto || "", innerX, y, { width: innerWidth, lineGap: 2 });
  return doc.y;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {{
 *   titulo: string,
 *   tono?: "normal" | "destacado",
 *   contenido: { tipo: "texto", texto: string }
 *             | { tipo: "lista", items: string[] }
 *             | { tipo: "tabla", filas: [string, string][], encabezados?: [string, string] },
 * }} opciones
 * @returns {number} Y donde termina el bloque (para encadenar el siguiente).
 */
function pintarBloqueSeccion(doc, x, y, width, { titulo, tono = "normal", contenido }) {
  const bgCabecera = tono === "destacado" ? COLORS.highlightBg : COLORS.sectionBg;
  const alturaCuerpo = altoContenido(doc, width, contenido);
  const alturaCaja = alturaCuerpo + PADDING * 2;

  doc.rect(x, y, width, ALTO_CABECERA).fill(bgCabecera);
  doc
    .font(FONTS.bold)
    .fontSize(SIZES.sectionTitle)
    .fillColor(COLORS.text)
    .text(titulo, x + PADDING, y + 3, { width: width - PADDING * 2, lineBreak: false });

  const cajaY = y + ALTO_CABECERA;
  doc
    .rect(x, cajaY, width, alturaCaja)
    .strokeColor(tono === "destacado" ? COLORS.primary : COLORS.border)
    .lineWidth(tono === "destacado" ? 1.2 : 1)
    .stroke();
  if (tono === "destacado") {
    doc.rect(x, cajaY, width, alturaCaja).fillOpacity(0.35).fill(COLORS.highlightBg).fillOpacity(1);
  }

  pintarCuerpo(doc, x, cajaY + PADDING, width, contenido);

  return cajaY + alturaCaja + HUECO_TRAS_BLOQUE;
}

/**
 * Altura total que ocupará `pintarBloqueSeccion` (cabecera + caja +
 * margen inferior) SIN dibujar nada -- para que quien compone una
 * plantilla pueda decidir si el bloque cabe en lo que queda de página
 * antes de pintarlo (ver layout/paginacion.js#asegurarEspacio). Usa el
 * mismo cálculo interno que el propio dibujo, así que nunca puede
 * desincronizarse de la altura real.
 */
function calcularAltoBloqueSeccion(doc, width, contenido) {
  return ALTO_CABECERA + altoContenido(doc, width, contenido) + PADDING * 2 + HUECO_TRAS_BLOQUE;
}

module.exports = { pintarBloqueSeccion, calcularColumnas, calcularAltoBloqueSeccion };
