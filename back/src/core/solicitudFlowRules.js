// solicitudFlowRules.js
//
// Fuente única de verdad de la máquina de estados de una Solicitud.
// Nomenclatura y transiciones acordadas en el diseño de workflow objetivo
// (Sprint 1A). Ningún controlador ni servicio debe decidir por su cuenta
// si una transición es válida: todos delegan en este módulo.
//
// Estados:
//   PENDIENTE_GESTION       -> caso recién creado / de vuelta a Prestaciones
//   DOCUMENTACION_PENDIENTE -> a la espera de documentación adicional
//   EN_REVISION_MEDICA      -> derivado a Dirección Médica
//   EN_REVISION_JURIDICA    -> derivado a Asesoría Jurídica
//   AUTORIZADA              -> estado final
//   RECHAZADA               -> estado final
//
// Acciones: una por cada endpoint existente en solicitudRoutes.js. No se
// añade ninguna acción nueva en este sprint (p. ej. "documentación
// recibida" queda fuera de alcance — ver informe de Sprint 1A).

const ESTADOS = Object.freeze({
  PENDIENTE_GESTION: "PENDIENTE_GESTION",
  DOCUMENTACION_PENDIENTE: "DOCUMENTACION_PENDIENTE",
  EN_REVISION_MEDICA: "EN_REVISION_MEDICA",
  EN_REVISION_JURIDICA: "EN_REVISION_JURIDICA",
  AUTORIZADA: "AUTORIZADA",
  RECHAZADA: "RECHAZADA",
});

const ESTADOS_FINALES = Object.freeze([ESTADOS.AUTORIZADA, ESTADOS.RECHAZADA]);

// Estados del modelo anterior (o vistos en producción sin estar
// documentados) que ya no son válidos como estado "vivo". Una solicitud
// en uno de estos estados debe pasar por scripts/migrateEstados.js antes
// de admitir cualquier transición nueva.
const ESTADOS_LEGACY = Object.freeze([
  "PENDIENTE_INICIO_GESTION",
  "DOCUMENTACION_SOLICITADA",
  "EN_REVISION",
  "PENDIENTE_DIRECCION_MEDICA",
  "PENDIENTE_ASESORIA_JURIDICA",
  "DOCUMENTACION_RECIBIDA",
  // Detectado en los datos de demo reales al ejecutar la migración
  // (Sprint 1A), no documentado en la auditoría previa.
  "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
]);

const ACCIONES = Object.freeze({
  SOLICITAR_DOCUMENTACION: "SOLICITAR_DOCUMENTACION",
  ENVIAR_DIRECCION_MEDICA: "ENVIAR_DIRECCION_MEDICA",
  ENVIAR_ASESORIA_JURIDICA: "ENVIAR_ASESORIA_JURIDICA",
  AUTORIZAR: "AUTORIZAR",
  RECHAZAR: "RECHAZAR",
});

// estado actual -> { accion -> estado siguiente }
// Ausencia de una acción en el mapa de un estado = transición no permitida.
const TRANSICIONES = Object.freeze({
  [ESTADOS.PENDIENTE_GESTION]: Object.freeze({
    [ACCIONES.SOLICITAR_DOCUMENTACION]: ESTADOS.DOCUMENTACION_PENDIENTE,
    [ACCIONES.ENVIAR_DIRECCION_MEDICA]: ESTADOS.EN_REVISION_MEDICA,
    [ACCIONES.ENVIAR_ASESORIA_JURIDICA]: ESTADOS.EN_REVISION_JURIDICA,
    [ACCIONES.AUTORIZAR]: ESTADOS.AUTORIZADA,
    [ACCIONES.RECHAZAR]: ESTADOS.RECHAZADA,
  }),
  [ESTADOS.DOCUMENTACION_PENDIENTE]: Object.freeze({
    // Ya hay una petición de documentación en curso: no tiene sentido
    // pedirla otra vez sin que exista todavía una acción de "recibida"
    // (fuera de alcance de este sprint). Sí se puede derivar o decidir.
    [ACCIONES.ENVIAR_DIRECCION_MEDICA]: ESTADOS.EN_REVISION_MEDICA,
    [ACCIONES.ENVIAR_ASESORIA_JURIDICA]: ESTADOS.EN_REVISION_JURIDICA,
    [ACCIONES.AUTORIZAR]: ESTADOS.AUTORIZADA,
    [ACCIONES.RECHAZAR]: ESTADOS.RECHAZADA,
  }),
  [ESTADOS.EN_REVISION_MEDICA]: Object.freeze({
    [ACCIONES.SOLICITAR_DOCUMENTACION]: ESTADOS.DOCUMENTACION_PENDIENTE,
    // Derivación cruzada: Dirección Médica puede pasar el caso también
    // a Asesoría Jurídica si detecta un problema de cobertura.
    [ACCIONES.ENVIAR_ASESORIA_JURIDICA]: ESTADOS.EN_REVISION_JURIDICA,
    [ACCIONES.AUTORIZAR]: ESTADOS.AUTORIZADA,
    [ACCIONES.RECHAZAR]: ESTADOS.RECHAZADA,
  }),
  [ESTADOS.EN_REVISION_JURIDICA]: Object.freeze({
    [ACCIONES.SOLICITAR_DOCUMENTACION]: ESTADOS.DOCUMENTACION_PENDIENTE,
    // Derivación cruzada inversa.
    [ACCIONES.ENVIAR_DIRECCION_MEDICA]: ESTADOS.EN_REVISION_MEDICA,
    [ACCIONES.AUTORIZAR]: ESTADOS.AUTORIZADA,
    [ACCIONES.RECHAZAR]: ESTADOS.RECHAZADA,
  }),
  // Estados finales: sin transiciones salientes.
  [ESTADOS.AUTORIZADA]: Object.freeze({}),
  [ESTADOS.RECHAZADA]: Object.freeze({}),
});

// Departamento "dueño" de cada estado. Sustituye a los valores libres en
// minúsculas (p. ej. "direccionmedica") que no coincidían con el enum de
// rol de usuario (DIRECCION_MEDICA). Los estados que no aparecen aquí
// (DOCUMENTACION_PENDIENTE, AUTORIZADA, RECHAZADA) conservan el
// departamento que ya tuviera la solicitud.
const DEPARTAMENTO_POR_ESTADO = Object.freeze({
  [ESTADOS.PENDIENTE_GESTION]: "PRESTACIONES",
  [ESTADOS.EN_REVISION_MEDICA]: "DIRECCION_MEDICA",
  [ESTADOS.EN_REVISION_JURIDICA]: "ASESORIA_JURIDICA",
});

class InvalidTransitionError extends Error {
  constructor(message, { code, estadoActual, accion } = {}) {
    super(message);
    this.name = "InvalidTransitionError";
    this.code = code;
    this.estadoActual = estadoActual;
    this.accion = accion;
    this.statusCode = 409; // Conflict: la solicitud existe, la operación no es válida en su estado actual.
  }
}

function isEstadoValido(estado) {
  return Object.values(ESTADOS).includes(estado);
}

function isEstadoLegacy(estado) {
  return ESTADOS_LEGACY.includes(estado);
}

function isEstadoFinal(estado) {
  return ESTADOS_FINALES.includes(estado);
}

/**
 * Calcula el estado siguiente para (estadoActual, accion) o lanza
 * InvalidTransitionError si la transición no es válida. Nunca modifica
 * nada: solo calcula.
 */
function getNextEstado(estadoActual, accion) {
  if (!isEstadoValido(estadoActual)) {
    if (isEstadoLegacy(estadoActual)) {
      throw new InvalidTransitionError(
        `La solicitud tiene un estado heredado ("${estadoActual}") del modelo anterior. Debe migrarse antes de admitir nuevas transiciones (ver scripts/migrateEstados.js).`,
        { code: "ESTADO_LEGACY_NO_MIGRADO", estadoActual, accion },
      );
    }

    throw new InvalidTransitionError(
      `La solicitud tiene un estado desconocido ("${estadoActual}") que no pertenece a la máquina de estados actual.`,
      { code: "ESTADO_DESCONOCIDO", estadoActual, accion },
    );
  }

  if (isEstadoFinal(estadoActual)) {
    throw new InvalidTransitionError(
      `La solicitud está en un estado final ("${estadoActual}") y no admite más transiciones.`,
      { code: "ESTADO_FINAL", estadoActual, accion },
    );
  }

  const nextEstado = TRANSICIONES[estadoActual]?.[accion];

  if (!nextEstado) {
    throw new InvalidTransitionError(
      `La acción "${accion}" no es válida desde el estado "${estadoActual}".`,
      { code: "TRANSICION_NO_PERMITIDA", estadoActual, accion },
    );
  }

  return nextEstado;
}

/** Departamento que corresponde al estado siguiente, o `undefined` si ese
 * estado no cambia de departamento (el llamante debe conservar el actual). */
function getDepartamentoPorEstado(estado) {
  return DEPARTAMENTO_POR_ESTADO[estado];
}

module.exports = {
  ESTADOS,
  ESTADOS_FINALES,
  ESTADOS_LEGACY,
  ACCIONES,
  TRANSICIONES,
  DEPARTAMENTO_POR_ESTADO,
  InvalidTransitionError,
  isEstadoValido,
  isEstadoLegacy,
  isEstadoFinal,
  getNextEstado,
  getDepartamentoPorEstado,
};
