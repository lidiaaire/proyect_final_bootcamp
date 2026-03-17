// Este archivo contiene la función para generar documentos simulados para cada tipo de prueba médica. La función generarDocumentos toma el nombre de una prueba médica como argumento y devuelve una lista de objetos que representan los documentos requeridos para esa prueba. Cada objeto de documento incluye información como el nombre del documento, su tipo (derivado del nombre), quién lo subió (en este caso, "ASEGURADO"), la fecha de subida y una URL simulada para acceder al documento. Esta función se utiliza en la funcionalidad de solicitud de documentación para proporcionar una lista de documentos simulados que se pueden mostrar en la interfaz de usuario o utilizar en las pruebas de la aplicación.
// La función generarDocumentos utiliza la base de datos simulada de documentosPorPrueba para obtener la lista de documentos requeridos para el tipo de prueba especificado. Si no se encuentra ningún documento para el tipo de prueba dado, la función devuelve una lista vacía. Esta función es útil para simular la generación de documentos en la aplicación antes de implementar una solución real de gestión documental.

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
