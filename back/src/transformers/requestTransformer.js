function mapRequest(solicitud) {
  return {
    id: solicitud._id,

    numeroSolicitud: solicitud.numeroSolicitud,

    nombreCompleto: solicitud.nombreCompleto,
    poliza: solicitud.numeroPoliza,
    dni: solicitud.dni,

    nombrePrueba: solicitud.nombrePrueba,
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,

    estadoInterno: solicitud.estadoInterno,
    currentDepartment: solicitud.currentDepartment,

    documentos: solicitud.documentos || [],

    historial: solicitud.historial || [],

    createdAt: solicitud.createdAt,
  };
}

function mapRequests(solicitudes) {
  return solicitudes.map(mapRequest);
}

module.exports = {
  mapRequest,
  mapRequests,
};
