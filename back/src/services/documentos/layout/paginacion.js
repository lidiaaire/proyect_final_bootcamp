// Paginación compartida por los informes A4 (Paso 5): a diferencia de
// VOLANTE_MEDICO (siempre 1 página fija), estos 5 documentos tienen un
// número de secciones variable según la prestación y pueden no caber en
// una sola página A4. En vez de que cada plantilla reimplemente "cabe o
// no cabe", este helper centraliza el criterio.

const { PAGE } = require("./theme");
const { pintarFranjaMarca } = require("./cabecera");

// Hueco que se reserva siempre al final de la página para el pie.
// pintarPiePagina dibuja su línea divisoria en
// `page.height - PAGE.margin - 14` y el texto ~6px por debajo -- es
// decir, el pie necesita ~20px de esta zona. El valor anterior (50)
// reservaba más del doble de lo necesario en TODAS las páginas de los
// 5 informes A4, lo que hacía que secciones cortas (p. ej.
// "Recomendaciones" o "Conclusión") se empujaran a una segunda página
// casi vacía sin necesidad real. 24 dejan ~10px de aire visual entre el
// contenido y la línea del pie, suficiente sin desperdiciar página.
const MARGEN_INFERIOR_RESERVADO = 24;

function limiteInferior(doc) {
  return doc.page.height - PAGE.margin - MARGEN_INFERIOR_RESERVADO;
}

/**
 * Si el próximo bloque (de `alturaEstimada` de alto) no cabe antes del
 * límite inferior de la página actual, añade una página nueva
 * (repintando la franja de marca para mantener la identidad Braun
 * Medical Center en la continuación) y devuelve el Y de inicio en la
 * página nueva. Si cabe, devuelve `y` sin tocar nada.
 *
 * El PDFDocument debe crearse con `{ bufferPages: true }` para poder
 * numerar correctamente las páginas al final (ver
 * pintarPiesDeTodasLasPaginas).
 */
function asegurarEspacio(doc, y, alturaEstimada) {
  if (y + alturaEstimada <= limiteInferior(doc)) return y;
  doc.addPage();
  return pintarFranjaMarca(doc);
}

/**
 * Recorre TODAS las páginas ya dibujadas y pinta el pie con la
 * paginación real (página X de Y) en cada una. Se llama una única vez,
 * al final del documento, justo antes de `doc.end()`. Requiere que el
 * PDFDocument se haya creado con `{ bufferPages: true }`.
 *
 * @param {Function} piePaginaFn normalmente `pintarPiePagina` de piePagina.js.
 * @param {object} opcionesBase opciones fijas (numeroDocumento, tipoDocumentoLabel).
 */
function pintarPiesDeTodasLasPaginas(doc, piePaginaFn, opcionesBase) {
  const rango = doc.bufferedPageRange();
  for (let i = 0; i < rango.count; i++) {
    doc.switchToPage(rango.start + i);
    piePaginaFn(doc, { ...opcionesBase, pagina: i + 1, totalPaginas: rango.count });
  }
}

module.exports = { asegurarEspacio, pintarPiesDeTodasLasPaginas };
