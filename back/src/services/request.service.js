// Este archivo contiene la función updateRequestStatus, punto único por el
// que pasa cualquier cambio de estado de una Solicitud. Antes de tocar
// nada comprueba DOS condiciones independientes, en este orden:
//   1. RBAC (core/solicitudPermissions.js): ¿tiene este rol
//      responsabilidad actual sobre esta solicitud para ejecutar esta
//      acción? Si no, ForbiddenActionError (403) y no se modifica nada.
//   2. Máquina de estados (core/solicitudFlowRules.js): ¿es esta acción
//      una transición válida desde el estado actual? Si no,
//      InvalidTransitionError (409) y tampoco se modifica nada.
// Solo si ambas pasan se aplica el nuevo estado/departamento y se deja
// constancia completa en el historial (estado anterior, estado nuevo,
// acción, departamento, autor real y fecha).

const Solicitud = require("../models/solicitudModel");
const {
  getNextEstado,
  getDepartamentoPorEstado,
} = require("../core/solicitudFlowRules");
const { assertPuedeEjecutar } = require("../core/solicitudPermissions");

async function updateRequestStatus({ requestId, accion, user, comment }) {
  const request = await Solicitud.findById(requestId);

  if (!request) {
    const error = new Error("Solicitud no encontrada");
    error.statusCode = 404;
    throw error;
  }

  // RBAC primero: puede lanzar ForbiddenActionError (403). No depende del
  // estado, solo de quién es responsable del caso ahora mismo.
  assertPuedeEjecutar({
    rol: user?.role,
    accion,
    currentDepartment: request.currentDepartment,
  });

  const estadoAnterior = request.estadoInterno;

  // Puede lanzar InvalidTransitionError (409). Se calcula ANTES de tocar
  // el documento: si la transición no es válida, `request` no se modifica.
  const nextEstado = getNextEstado(estadoAnterior, accion);
  const nextDepartment = getDepartamentoPorEstado(nextEstado) ?? request.currentDepartment;

  request.estadoInterno = nextEstado;
  request.currentDepartment = nextDepartment;

  request.historial.push({
    estadoAnterior,
    estado: nextEstado,
    accion,
    departamento: nextDepartment,
    changedBy: user?.role || "DESCONOCIDO",
    comentario: comment || "",
    fecha: new Date(),
  });

  await request.save();

  return request;
}

module.exports = {
  updateRequestStatus,
};
