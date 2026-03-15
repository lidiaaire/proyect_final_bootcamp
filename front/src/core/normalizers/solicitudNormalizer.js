export function normalizeSolicitud(apiSolicitud) {
  return {
    id: apiSolicitud.id || apiSolicitud._id,

    numeroSolicitud: apiSolicitud.numeroSolicitud,

    nombreCompleto: apiSolicitud.nombreCompleto,

    numeroPoliza: apiSolicitud.numeroPoliza,

    dni: apiSolicitud.dni,

    nombrePrueba: apiSolicitud.nombrePrueba,

    especialidad: apiSolicitud.especialidad,

    centroMedico: apiSolicitud.centroMedico,

    estadoInterno: apiSolicitud.estadoInterno,

    currentDepartment: apiSolicitud.currentDepartment,

    documentos: apiSolicitud.documentos || [],

    historial: apiSolicitud.historial || [],

    notas: apiSolicitud.notas || [],

    createdAt: apiSolicitud.createdAt,
  };
}
