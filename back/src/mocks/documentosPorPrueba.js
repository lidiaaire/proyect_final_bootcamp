// Este archivo contiene una base de datos simulada de documentos requeridos para cada tipo de prueba médica. Esta base de datos se utiliza para determinar qué documentos son necesarios para cada tipo de prueba, lo que es fundamental para la funcionalidad de solicitud de documentación en la aplicación. Cada tipo de prueba tiene una lista asociada de documentos requeridos, como informes médicos, prescripciones médicas, consentimientos genéticos e historiales clínicos. Esta base de datos simulada es útil para el desarrollo y las pruebas de la funcionalidad de solicitud de documentación antes de implementar una solución de almacenamiento real, como una base de datos o un servicio de gestión documental.
// La estructura de la base de datos es un objeto donde cada clave es el nombre de un tipo de prueba médica (por ejemplo, "Resonancia Magnética", "TAC", "Prueba genética") y el valor asociado es un array de strings que representan los nombres de los documentos requeridos para ese tipo de prueba. Esta estructura permite acceder fácilmente a la lista de documentos requeridos para cada tipo de prueba cuando se necesite solicitar documentación en la aplicación.

const documentosPorPrueba = {
  "Resonancia Magnética": [
    "informe_medico.pdf",
    "prescripcion_medica.pdf",
    "historia_clinica.pdf",
  ],

  TAC: ["informe_medico.pdf", "prescripcion_medica.pdf"],

  "Prueba genética": [
    "informe_medico.pdf",
    "consentimiento_genetico.pdf",
    "historia_clinica.pdf",
  ],
};

module.exports = { documentosPorPrueba };
