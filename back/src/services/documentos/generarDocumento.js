// Dispatcher de generación de documentos clínicos. Punto de entrada
// único: quien necesite un PDF de un tipo documental concreto llama
// aquí, nunca a una plantilla directamente -- así añadir una familia
// nueva no obliga a tocar a los llamantes (seed, futuro servicio de
// re-generación, etc.), solo este mapa.
//
// Paso 5: soporta las 6 familias clínicas (VOLANTE_MEDICO del Paso 4 +
// las 5 de informe A4). VOLANTE_AUTORIZACION queda fuera a propósito --
// es un circuito distinto (lo emite el propio Flowly al autorizar, no
// el centro médico) que se aborda en un paso posterior. Pedir cualquier
// tipo no implementado falla de forma explícita y controlada (no genera
// un PDF vacío ni devuelve null en silencio) -- así una llamada a un
// tipo todavía no implementado se detecta en el momento, no como un
// documento "raro" en producción.

const { generarVolanteMedico } = require("./templates/volanteMedico");
const { generarInformeClinico } = require("./templates/informeClinico");
const { generarInformeResultados } = require("./templates/informeResultados");
const { generarPropuestaQuirurgica } = require("./templates/propuestaQuirurgica");
const { generarInformeUrgencias } = require("./templates/informeUrgencias");
const { generarInformeAlta } = require("./templates/informeAlta");

const GENERADORES_POR_TIPO = {
  VOLANTE_MEDICO: generarVolanteMedico,
  INFORME_CLINICO: generarInformeClinico,
  INFORME_RESULTADOS: generarInformeResultados,
  PROPUESTA_QUIRURGICA: generarPropuestaQuirurgica,
  INFORME_URGENCIAS: generarInformeUrgencias,
  INFORME_ALTA_HOSPITALARIA: generarInformeAlta,
};

class TipoDocumentoNoImplementadoError extends Error {
  constructor(tipo) {
    super(
      `No hay generador implementado todavía para el tipo documental "${tipo}". ` +
        `Tipos disponibles: ${Object.keys(GENERADORES_POR_TIPO).join(", ")}.`,
    );
    this.name = "TipoDocumentoNoImplementadoError";
    this.tipo = tipo;
  }
}

/**
 * @param {string} tipo Uno de Solicitud.TIPOS_DOCUMENTO.
 * @param {{ solicitud: object, policyholder: object, contenidoClinico?: object }} datos
 * @returns {Promise<{ nombre: string, url: string }>}
 */
function generarDocumento(tipo, datos) {
  const generador = GENERADORES_POR_TIPO[tipo];

  if (!generador) {
    return Promise.reject(new TipoDocumentoNoImplementadoError(tipo));
  }

  return generador(datos);
}

/**
 * Estrategia de idempotencia compartida por todos los seeds de
 * documentos (no solo VOLANTE_MEDICO): una solicitud nunca debe acabar
 * con dos documentos del mismo tipo por volver a ejecutar el seed. Pura
 * y sin Mongo para poder testearla aislada -- el llamante (p. ej.
 * scripts/seedDocumentosClinicos.js) decide con el resultado si generar
 * o saltar, esta función no toca la base de datos.
 *
 * @param {Array<{tipo: string}>} documentos Solicitud.documentos ya cargado.
 * @param {string} tipo
 * @returns {boolean}
 */
function yaTieneDocumentoDeTipo(documentos, tipo) {
  return (documentos || []).some((d) => d.tipo === tipo);
}

module.exports = {
  generarDocumento,
  TipoDocumentoNoImplementadoError,
  GENERADORES_POR_TIPO,
  yaTieneDocumentoDeTipo,
};
