import Solicitud from "../models/solicitudModel.js";
import { getNextTransition } from "../core/solicitudFlowRules.js";
import { createHistorialEvent } from "../core/createHistorialEvent.js";

export async function getSolicitudes() {
  return await Solicitud.find().sort({ createdAt: -1 });
}

export async function getSolicitudById(id) {
  return await Solicitud.findById(id);
}

async function applyAction({ solicitudId, accion, rol }) {
  const solicitud = await Solicitud.findById(solicitudId);
  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoAnterior = solicitud.estadoInterno;

  const transition = getNextTransition(solicitud.estadoInterno, rol, accion);

  if (!transition) {
    throw new Error("Transición no permitida para este rol o estado");
  }

  solicitud.estadoInterno = transition.nextEstado;
  solicitud.currentDepartment = transition.nextDepartment;

  const estadoNuevo = transition.nextEstado;

  const evento = createHistorialEvent({
    tipo: accion,
    estadoAnterior,
    estadoNuevo,
    changedBy: rol,
  });

  solicitud.historial.push(evento);

  await solicitud.save();

  return solicitud;
}

export async function requestDocumentation(id, rol = "prestaciones") {
  return applyAction({
    solicitudId: id,
    accion: "SOLICITAR_DOCUMENTACION",
    rol,
  });
}

export async function sendToMedicalDirection(id, rol = "prestaciones") {
  return applyAction({
    solicitudId: id,
    accion: "ENVIAR_DIRECCION_MEDICA",
    rol,
  });
}

export async function sendToLegalAdvisory(id, rol = "prestaciones") {
  return applyAction({
    solicitudId: id,
    accion: "ENVIAR_ASESORIA_JURIDICA",
    rol,
  });
}

export async function authorizeRequest(id, rol) {
  return applyAction({
    solicitudId: id,
    accion: "AUTORIZAR",
    rol,
  });
}

export async function rejectRequest(id, rol) {
  return applyAction({
    solicitudId: id,
    accion: "RECHAZAR",
    rol,
  });
}
