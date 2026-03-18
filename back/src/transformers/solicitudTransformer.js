// Este archivo contiene la lógica para transformar los datos de las solicitudes en un formato adecuado para ser consumido por la interfaz de usuario. Define las funciones mapSolicitud y mapSolicitudes, que se encargan de mapear una solicitud individual y una lista de solicitudes, respectivamente, a un formato estandarizado que incluye campos específicos como el ID, número de solicitud, nombre completo del asegurado, número de póliza, DNI, nombre de la prueba, especialidad, centro médico, estado interno, departamento actual, fecha de creación, documentos asociados, notas y el historial de cambios. Estas funciones son esenciales para garantizar que los datos de las solicitudes se presenten de manera consistente y clara en la interfaz de usuario, facilitando la comprensión y gestión de las solicitudes por parte de los usuarios.
// La función mapSolicitud toma una solicitud como entrada y devuelve un objeto con los campos mapeados, incluyendo la normalización de los documentos y notas asociados a la solicitud. La función mapSolicitudes simplemente aplica mapSolicitud a cada elemento de una lista de solicitudes, devolviendo una lista de solicitudes mapeadas. Estas funciones son utilizadas por los controladores de solicitudes para preparar los datos antes de enviarlos a la interfaz de usuario, lo que mejora la experiencia del usuario al mostrar información clara y estructurada sobre cada solicitud dentro de la aplicación.
// Importamos el modelo de datos de las solicitudes para interactuar con la base de datos.

function mapSolicitud(solicitud) {
  console.log("PDF EN TRANSFORMER:", solicitud.autorizacionPdf);
  return {
    id: solicitud._id,
    numeroSolicitud: solicitud.numeroSolicitud,
    nombreCompleto: solicitud.nombreCompleto,
    numeroPoliza: solicitud.numeroPoliza,
    dni: solicitud.dni,
    nombrePrueba: solicitud.nombrePrueba,
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,

    estadoInterno: solicitud.estadoInterno,
    currentDepartment: solicitud.currentDepartment,
    createdAt: solicitud.createdAt,

    documentos: (solicitud.documentos || []).map((doc) => ({
      nombre: doc.nombre || doc.nombreArchivo || doc.filename,

      subidoPor:
        doc.subidoPor ||
        doc.usuario ||
        doc.uploadedBy ||
        doc.user?.name ||
        doc.createdBy ||
        "Usuario",

      fecha: doc.createdAt || null,

      url: doc.url || doc.path || null,
    })),

    notas: (solicitud.notas || []).map((nota) => ({
      text: nota.text,
      author: nota.author,
      date: nota.date,
    })),

    historial: solicitud.historial || [],

    autorizacionPdf: solicitud.autorizacionPdf,
  };
}

function mapSolicitudes(solicitudes) {
  return solicitudes.map(mapSolicitud);
}

module.exports = {
  mapSolicitud,
  mapSolicitudes,
};
