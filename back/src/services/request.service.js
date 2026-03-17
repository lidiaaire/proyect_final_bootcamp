// Este archivo contiene la lógica relacionada con las solicitudes en la aplicación. Define la función updateRequestStatus, que se encarga de actualizar el estado y el departamento actual de una solicitud específica, así como de agregar un nuevo registro al historial de la solicitud con la información del cambio realizado. La función toma como parámetros el ID de la solicitud, el nuevo estado, el nuevo departamento, el usuario que realiza el cambio y un comentario opcional. La función busca la solicitud en la base de datos, actualiza los campos correspondientes y guarda los cambios, devolviendo la solicitud actualizada. Esta función es fundamental para gestionar el flujo de trabajo de las solicitudes dentro de la aplicación, permitiendo a los usuarios realizar cambios en el estado y departamento de las solicitudes de manera efectiva y mantener un historial detallado de todas las modificaciones realizadas.
// La función updateRequestStatus maneja la lógica de actualización de las solicitudes, asegurándose de que los cambios se registren correctamente en el historial de la solicitud. El historial incluye información sobre el estado, el departamento, el usuario que realizó el cambio, cualquier comentario adicional y la fecha del cambio. Esta función es utilizada por los controladores de solicitudes para procesar las acciones de autorización, rechazo, solicitud de documentación adicional y envío a diferentes departamentos, lo que mejora la gestión y el seguimiento de las solicitudes dentro de la aplicación.
// Importamos el modelo de datos de las solicitudes para interactuar con la base de datos.

const Solicitud = require("../models/solicitudModel");

async function updateRequestStatus({
  requestId,
  newStatus,
  newDepartment,
  user,
  comment,
}) {
  const request = await Solicitud.findById(requestId);

  if (!request) {
    throw new Error("Solicitud no encontrada");
  }

  if (newStatus) request.estadoInterno = newStatus;
  if (newDepartment) request.currentDepartment = newDepartment;

  request.historial.push({
    estado: newStatus || request.estadoInterno,
    departamento: newDepartment || request.currentDepartment,
    changedBy: user?.role || "PRESTACIONES", //
    comentario: comment || "",
    fecha: new Date(),
  });

  await request.save();

  return request;
}

module.exports = {
  updateRequestStatus,
};
