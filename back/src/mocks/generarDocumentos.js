const { documentosPorPrueba } = require("./documentosPorPrueba");

function generarDocumentos(nombrePrueba) {
  const docs = documentosPorPrueba[nombrePrueba] || [];

  return docs.map((nombre) => ({
    nombre,
    tipo: nombre.replace(".pdf", ""),
    subidoPor: "ASEGURADO",
    fecha: new Date(),
    url: `/docs/${nombre}`,
  }));
}

module.exports = { generarDocumentos };
