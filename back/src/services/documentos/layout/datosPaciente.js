// Bloque "Datos del paciente": cabecera con icono + título sobre fondo
// suave, y debajo una caja con los pares etiqueta/valor en una rejilla
// de hasta 4 columnas -- igual en los 5 informes A4 (no en
// VOLANTE_MEDICO, que representa la identidad del paciente con su
// propio formulario de casillas y no con esta tarjeta).
//
// Recibe una lista de campos ya resueltos (no un Policyholder/Solicitud
// completos) para no acoplar el layout a la forma exacta de esos
// modelos -- esa traducción la hará la plantilla/servicio que llame a
// este helper, con datos reales de dominio.

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const { anchoContenido } = require("./utils");

const COLUMNAS = 4;
// Igual que en bloqueSeccion.js: cabecera, relleno superior y hueco
// tras el bloque ajustados (sin tocar tamaños de fuente) para que los
// informes A4 aprovechen mejor la página cuando el contenido real cabe.
const ALTO_CABECERA = 17;
const ALTO_FILA = 25;
const PADDING_X = 14;
const PADDING_SUPERIOR = 6;
const HUECO_TRAS_BLOQUE = 8;

/**
 * @param {number} y
 * @param {{titulo?: string, campos: {label: string, value: string}[]}} opciones
 * @returns {number} Y donde termina el bloque.
 */
function pintarDatosPaciente(doc, y, { titulo = "Datos del paciente", campos }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);
  const filas = Math.ceil(campos.length / COLUMNAS);
  const altoCaja = ALTO_CABECERA + filas * ALTO_FILA + PADDING_SUPERIOR;

  // Cabecera de sección (fondo suave + título).
  doc.rect(left, y, width, ALTO_CABECERA).fill(COLORS.sectionBg);
  doc
    .font(FONTS.bold)
    .fontSize(SIZES.sectionTitle)
    .fillColor(COLORS.text)
    .text(titulo, left + PADDING_X, y + 4, { lineBreak: false });

  // Caja de datos.
  const cajaY = y + ALTO_CABECERA;
  doc
    .rect(left, cajaY, width, altoCaja - ALTO_CABECERA)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  const colWidth = (width - PADDING_X * 2) / COLUMNAS;

  campos.forEach((campo, index) => {
    const fila = Math.floor(index / COLUMNAS);
    const columna = index % COLUMNAS;
    const campoX = left + PADDING_X + columna * colWidth;
    const campoY = cajaY + PADDING_SUPERIOR + fila * ALTO_FILA;

    doc
      .font(FONTS.regular)
      .fontSize(SIZES.label)
      .fillColor(COLORS.textMuted)
      .text(campo.label, campoX, campoY, { width: colWidth - 10, height: 10, ellipsis: true });
    doc
      .font(FONTS.bold)
      .fontSize(SIZES.meta)
      .fillColor(COLORS.text)
      // `lineBreak: false` NO evita que PDFKit parta un valor largo con
      // guion (p. ej. un apellido compuesto "Schuppe-Bogan") en una
      // segunda línea que solapa con la fila siguiente -- PDFKit trata
      // el guion como punto de corte válido incluso con lineBreak
      // desactivado. Forzar `height` + `ellipsis: true` sí impide
      // cualquier segunda línea: el valor se trunca con "…" en vez de
      // desbordar sobre el resto de la tarjeta.
      .text(campo.value || "—", campoX, campoY + 11, { width: colWidth - 10, height: 12, ellipsis: true });
  });

  return y + altoCaja + HUECO_TRAS_BLOQUE;
}

/** Altura que ocupará `pintarDatosPaciente` sin dibujar nada (ver bloqueSeccion.js#calcularAltoBloqueSeccion, mismo propósito). */
function calcularAltoDatosPaciente(campos) {
  const filas = Math.ceil(campos.length / COLUMNAS);
  return ALTO_CABECERA + filas * ALTO_FILA + PADDING_SUPERIOR + HUECO_TRAS_BLOQUE;
}

module.exports = { pintarDatosPaciente, calcularAltoDatosPaciente };
