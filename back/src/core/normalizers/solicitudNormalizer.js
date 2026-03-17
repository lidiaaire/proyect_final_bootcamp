// Este archivo contiene la función de normalización para las solicitudes. La función normalizeSolicitud toma una solicitud obtenida de la API y la transforma en un formato más adecuado para su uso en la aplicación, extrayendo solo los campos necesarios y renombrándolos según sea necesario. Esta función se utiliza en los controladores para asegurar que los datos de las solicitudes estén en el formato correcto antes de ser enviados a la interfaz de usuario o a otros servicios.
// La función normalizeSolicitud extrae los siguientes campos de la solicitud obtenida de la API: id, numeroSolicitud, estadoInterno (renombrado a estado), currentDepartment (renombrado a departamento) y nombreCompleto (renombrado a nombre). Esto permite que la aplicación trabaje con un formato de datos más limpio y consistente en toda la aplicación.

export function normalizeSolicitud(apiSolicitud) {
  return {
    id: apiSolicitud.id,
    numeroSolicitud: apiSolicitud.numeroSolicitud,
    estado: apiSolicitud.estadoInterno,
    departamento: apiSolicitud.currentDepartment,
    nombre: apiSolicitud.nombreCompleto,
  };
}
