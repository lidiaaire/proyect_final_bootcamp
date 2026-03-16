// solicitudFlowRules.js
// Versión simplificada para testing del backend de Flowly.
// Permite cualquier transición sin validar estado, rol o departamento.

export function getNextTransition(estadoActual, rol, accion) {
  const ACTION_MAP = {
    SOLICITAR_DOCUMENTACION: {
      nextEstado: "DOCUMENTACION_SOLICITADA",
      nextDepartment: "prestaciones",
    },

    ENVIAR_DIRECCION_MEDICA: {
      nextEstado: "EN_REVISION",
      nextDepartment: "direccionmedica",
    },

    ENVIAR_ASESORIA_JURIDICA: {
      nextEstado: "EN_REVISION",
      nextDepartment: "asesoriajuridica",
    },

    AUTORIZAR: {
      nextEstado: "AUTORIZADA",
      nextDepartment: rol || "admin",
    },

    RECHAZAR: {
      nextEstado: "RECHAZADA",
      nextDepartment: rol || "admin",
    },
  };

  return ACTION_MAP[accion] || null;
}
