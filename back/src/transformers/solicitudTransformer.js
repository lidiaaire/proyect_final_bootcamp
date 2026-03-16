function mapSolicitud(solicitud) {
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
    documentos: solicitud.documentos,
    historial: solicitud.historial,
    notas: solicitud.notas,
    createdAt: solicitud.createdAt,
  };
}

function mapSolicitudes(solicitudes) {
  return solicitudes.map(mapSolicitud);
}

module.exports = {
  mapSolicitud,
  mapSolicitudes,
};
