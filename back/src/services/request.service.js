const Solicitud = require("../models/solicitudModel");
// 🔹 Cambio genérico de estado (BASE de todo)
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

  // 🔹 Actualizamos estado y departamento
  if (newStatus) request.estadoInterno = newStatus;
  if (newDepartment) request.currentDepartment = newDepartment;

  // 🔹 Historial (AUDITORÍA REAL)
  request.historial.push({
    estado: newStatus || request.estadoInterno,
    departamento: newDepartment || request.currentDepartment,
    changedBy: user?.role || "PRESTACIONES", // ✅ CORREGIDO
    comentario: comment || "",
    fecha: new Date(),
  });

  await request.save();

  return request;
}

module.exports = {
  updateRequestStatus,
};
