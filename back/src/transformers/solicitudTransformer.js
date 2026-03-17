console.log("TRANSFORMER EJECUTANDO");

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

    // ✅ DOCUMENTOS NORMALIZADOS (CLAVE DEL BUG)
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

    // ✅ NOTAS NORMALIZADAS
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
