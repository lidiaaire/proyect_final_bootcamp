export function normalizeSolicitud(apiSolicitud) {
  return {
    id: apiSolicitud.id,
    numeroSolicitud: apiSolicitud.numeroSolicitud,
    estado: apiSolicitud.estadoInterno,
    departamento: apiSolicitud.currentDepartment,
    nombre: apiSolicitud.nombreCompleto,
  };
}
