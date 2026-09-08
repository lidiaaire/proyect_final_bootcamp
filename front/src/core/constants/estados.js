// Fuente única de verdad del vocabulario de estados de una Solicitud en
// el frontend (Sprint 2A). Espejo intencional de
// back/src/core/solicitudFlowRules.js: mismos 6 nombres canónicos.
//
// Ningún otro archivo debe declarar su propio mapa estado→label o
// estado→color. Todos importan de aquí.

export const ESTADOS = Object.freeze({
  PENDIENTE_GESTION: "PENDIENTE_GESTION",
  DOCUMENTACION_PENDIENTE: "DOCUMENTACION_PENDIENTE",
  EN_REVISION_MEDICA: "EN_REVISION_MEDICA",
  EN_REVISION_JURIDICA: "EN_REVISION_JURIDICA",
  AUTORIZADA: "AUTORIZADA",
  RECHAZADA: "RECHAZADA",
});

export const ESTADOS_FINALES = Object.freeze([ESTADOS.AUTORIZADA, ESTADOS.RECHAZADA]);

// Para cada estado: label visible, significado semántico (para tooltips /
// mensajes) y variante visual. La variante no inventa clases CSS nuevas:
// se traduce a las clases ya existentes en StatusBadge.module.css
// (pendiente/documentacion/autorizada/rechazada/default) -- no es un
// rediseño de badge, solo el nombre semántico de qué familia de color usar.
export const ESTADO_META = Object.freeze({
  [ESTADOS.PENDIENTE_GESTION]: {
    label: "Pendiente de gestión",
    descripcion: "Caso recién creado o de vuelta a Prestaciones; a la espera de gestión o derivación.",
    variant: "pendiente",
  },
  [ESTADOS.DOCUMENTACION_PENDIENTE]: {
    label: "Documentación pendiente",
    descripcion: "A la espera de que el asegurado o el centro médico aporte documentación adicional.",
    variant: "documentacion",
  },
  [ESTADOS.EN_REVISION_MEDICA]: {
    label: "En revisión médica",
    descripcion: "Derivada a Dirección Médica; a la espera de dictamen clínico.",
    variant: "revision",
  },
  [ESTADOS.EN_REVISION_JURIDICA]: {
    label: "En revisión jurídica",
    descripcion: "Derivada a Asesoría Jurídica; a la espera de dictamen legal.",
    variant: "revision",
  },
  [ESTADOS.AUTORIZADA]: {
    label: "Autorizada",
    descripcion: "Resuelta favorablemente. Estado final: no admite más transiciones.",
    variant: "autorizada",
  },
  [ESTADOS.RECHAZADA]: {
    label: "Rechazada",
    descripcion: "Resuelta desfavorablemente. Estado final: no admite más transiciones.",
    variant: "rechazada",
  },
});

// Nombres del modelo anterior a Sprint 1A (o vistos en producción sin
// documentar) que pueden seguir apareciendo en entradas de HISTORIAL ya
// migradas -- nunca como estado vivo de una solicitud (eso ya lo impide
// el backend, ver core/solicitudFlowRules.js#ESTADOS_LEGACY). Se les da
// un label legible únicamente para que el timeline no muestre texto
// crudo de eventos antiguos.
const LABELS_LEGACY_HISTORIAL = Object.freeze({
  PENDIENTE_INICIO_GESTION: "Pendiente de gestión",
  DOCUMENTACION_SOLICITADA: "Documentación pendiente",
  EN_REVISION: "En revisión",
  PENDIENTE_DIRECCION_MEDICA: "En revisión médica",
  PENDIENTE_ASESORIA_JURIDICA: "En revisión jurídica",
  PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: "Documentación pendiente",
  DOCUMENTACION_RECIBIDA: "Documentación recibida",
  PENDIENTE_REVISION_PRESTACIONES: "En revisión",
});

/** Label humano para cualquier valor de estado que pueda aparecer (canónico,
 * legacy en historial, o completamente desconocido -- en cuyo caso se
 * devuelve tal cual en vez de fallar). */
export function getEstadoLabel(estado) {
  if (!estado) return "—";
  return ESTADO_META[estado]?.label || LABELS_LEGACY_HISTORIAL[estado] || estado;
}

/** Variante semántica para StatusBadge. "default" si no se reconoce. */
export function getEstadoVariant(estado) {
  return ESTADO_META[estado]?.variant || "default";
}

export function esEstadoFinal(estado) {
  return ESTADOS_FINALES.includes(estado);
}
