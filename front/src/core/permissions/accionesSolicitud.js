// Lógica frontend única para decidir qué acciones de negocio mostrar
// sobre una solicitud (Sprint 2A). Es un espejo intencional de las
// reglas ya implementadas en backend:
//   - back/src/core/solicitudFlowRules.js (qué transición es válida
//     desde cada estado)
//   - back/src/core/solicitudPermissions.js (qué rol puede ejecutarla:
//     el rol responsable actual == currentDepartment; ADMIN nunca)
//
// IMPORTANTE: esto NO es una segunda capa de seguridad. El backend
// sigue siendo la única autoridad -- si esta lógica y el backend
// llegaran a divergir, manda el backend y la petición se rechaza igual
// (403/409). Esta función existe solo para que la interfaz no ofrezca
// botones que sabemos de antemano que van a fallar.
//
// Deuda conocida (documentada, no resuelta en este sprint): la tabla de
// transiciones está duplicada a mano aquí y en solicitudFlowRules.js.
// Si el workflow cambia, hay que actualizar los dos sitios.

import { ESTADOS, esEstadoFinal } from "@/core/constants/estados";

export const ACCIONES = Object.freeze({
  SOLICITAR_DOCUMENTACION: "SOLICITAR_DOCUMENTACION",
  ENVIAR_DIRECCION_MEDICA: "ENVIAR_DIRECCION_MEDICA",
  ENVIAR_ASESORIA_JURIDICA: "ENVIAR_ASESORIA_JURIDICA",
  AUTORIZAR: "AUTORIZAR",
  RECHAZAR: "RECHAZAR",
});

const ROLES_OPERATIVOS = ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"];

// Espejo de back/src/core/solicitudFlowRules.js#TRANSICIONES.
const TRANSICIONES = {
  [ESTADOS.PENDIENTE_GESTION]: [
    ACCIONES.SOLICITAR_DOCUMENTACION,
    ACCIONES.ENVIAR_DIRECCION_MEDICA,
    ACCIONES.ENVIAR_ASESORIA_JURIDICA,
    ACCIONES.AUTORIZAR,
    ACCIONES.RECHAZAR,
  ],
  [ESTADOS.DOCUMENTACION_PENDIENTE]: [
    ACCIONES.ENVIAR_DIRECCION_MEDICA,
    ACCIONES.ENVIAR_ASESORIA_JURIDICA,
    ACCIONES.AUTORIZAR,
    ACCIONES.RECHAZAR,
  ],
  [ESTADOS.EN_REVISION_MEDICA]: [
    ACCIONES.SOLICITAR_DOCUMENTACION,
    ACCIONES.ENVIAR_ASESORIA_JURIDICA,
    ACCIONES.AUTORIZAR,
    ACCIONES.RECHAZAR,
  ],
  [ESTADOS.EN_REVISION_JURIDICA]: [
    ACCIONES.SOLICITAR_DOCUMENTACION,
    ACCIONES.ENVIAR_DIRECCION_MEDICA,
    ACCIONES.AUTORIZAR,
    ACCIONES.RECHAZAR,
  ],
  // AUTORIZADA / RECHAZADA: sin entrada -> sin acciones (ver esEstadoFinal abajo).
};

/**
 * Acciones de negocio que `rol` puede ejecutar AHORA MISMO sobre
 * `solicitud`, según su estado y quién es responsable actual
 * (`solicitud.currentDepartment`). Devuelve [] si no hay ninguna --
 * incluyendo estado final, rol ADMIN, o rol distinto del responsable.
 */
export function getAccionesDisponibles({ rol, solicitud }) {
  if (!solicitud) return [];
  if (esEstadoFinal(solicitud.estadoInterno)) return [];
  if (!rol || !ROLES_OPERATIVOS.includes(rol)) return []; // incluye ADMIN y rol ausente
  if (rol !== solicitud.currentDepartment) return [];

  return TRANSICIONES[solicitud.estadoInterno] || [];
}

/** true si `rol` es quien tiene la responsabilidad actual del caso. */
export function esResponsableActual({ rol, solicitud }) {
  return !!solicitud && rol === solicitud?.currentDepartment;
}

/**
 * Motivo por el que no hay acciones disponibles, para mostrar un mensaje
 * en vez de simplemente no dibujar nada. Devuelve `null` si sí hay
 * acciones.
 */
export function getMotivoSinAcciones({ rol, solicitud }) {
  if (!solicitud) return null;
  if (esEstadoFinal(solicitud.estadoInterno)) return "final";
  if (rol === "ADMIN") return "admin";
  if (rol && solicitud.currentDepartment && rol !== solicitud.currentDepartment) return "otro_departamento";
  return null;
}
