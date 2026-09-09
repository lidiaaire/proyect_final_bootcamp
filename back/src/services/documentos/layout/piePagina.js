// Pie de página compartido por los 6 documentos clínicos: línea
// divisoria + 3 columnas (identificador del documento | identidad demo
// | paginación). El texto "Documento simulado · Flowly Demo" es fijo:
// es la identidad demo obligatoria en los 6 documentos (nunca "Flowly"
// a secas ni la aseguradora).

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const { anchoContenido } = require("./utils");

const TEXTO_IDENTIDAD_DEMO = "Documento simulado · Flowly Demo";

/**
 * @param {{numeroDocumento: string, tipoDocumentoLabel: string, pagina?: number, totalPaginas?: number}} opciones
 */
function pintarPiePagina(doc, { numeroDocumento, tipoDocumentoLabel, pagina = 1, totalPaginas = 1 } = {}) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);
  const y = doc.page.height - PAGE.margin - 14;

  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(left, y)
    .lineTo(left + width, y)
    .stroke();

  const textoY = y + 6;
  const columnWidth = width / 3;

  const identificador = [numeroDocumento, tipoDocumentoLabel].filter(Boolean).join("  |  ");

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.footer)
    .fillColor(COLORS.textFaint)
    .text(identificador, left, textoY, { width: columnWidth, align: "left", lineBreak: false });

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.footer)
    .fillColor(COLORS.textFaint)
    .text(TEXTO_IDENTIDAD_DEMO, left + columnWidth, textoY, {
      width: columnWidth,
      align: "center",
      lineBreak: false,
    });

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.footer)
    .fillColor(COLORS.textFaint)
    .text(`Página ${pagina} de ${totalPaginas}`, left + columnWidth * 2, textoY, {
      width: columnWidth,
      align: "right",
      lineBreak: false,
    });
}

module.exports = { pintarPiePagina, TEXTO_IDENTIDAD_DEMO };
