// Este archivo contiene la función para crear un evento de historial. La función createHistorialEvent toma los parámetros necesarios para crear un evento de historial, como el tipo de evento, el estado anterior, el estado nuevo y el usuario que realizó el cambio. Esta función se utiliza en los servicios relacionados con las solicitudes para registrar cada acción realizada en el historial de cada solicitud, lo que permite un seguimiento completo del proceso de gestión de cada solicitud.
// La función createHistorialEvent devuelve un objeto con la información del evento de historial, incluyendo el tipo de evento, el nuevo estado (renombrado a estado para que el frontend lo entienda), el usuario que realizó el cambio y la fecha en que se realizó el cambio.

export function createHistorialEvent({
  tipo,
  estadoAnterior,
  estadoNuevo,
  changedBy,
}) {
  return {
    tipo,
    estado: estadoNuevo, // el frontend espera este campo
    changedBy,
    fecha: new Date(),
  };
}
