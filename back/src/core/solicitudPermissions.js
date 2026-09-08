// solicitudPermissions.js
//
// Capa de autorización (RBAC) para las 5 acciones de negocio sobre una
// Solicitud. NO decide si una transición de estado es válida -- eso
// sigue siendo responsabilidad exclusiva de solicitudFlowRules.js. Esta
// capa decide, una vez que la transición ya es válida, si el rol que la
// pide tiene permiso para ejecutarla sobre ESTA solicitud en concreto.
//
// Regla derivada del workflow objetivo aprobado: las 5 acciones
// (solicitar documentación, derivar a Dirección Médica/Asesoría
// Jurídica, autorizar, rechazar) solo las puede ejecutar el
// departamento que tiene la responsabilidad actual del caso -- es
// decir, el rol cuyo nombre coincide con `solicitud.currentDepartment`.
// Esto es lo mismo que decir:
//   - PRESTACIONES actúa mientras el caso es suyo (currentDepartment
//     = PRESTACIONES): gestión inicial y casos con documentación
//     pendiente que ella misma pidió.
//   - DIRECCION_MEDICA actúa solo cuando el caso está bajo su
//     responsabilidad (currentDepartment = DIRECCION_MEDICA), incluida
//     una derivación cruzada hacia Asesoría Jurídica.
//   - ASESORIA_JURIDICA, simétrico.
//   - ADMIN nunca es responsable de un caso individual, así que
//     `currentDepartment` nunca vale "ADMIN" y por tanto ADMIN nunca
//     puede ejecutar ninguna de las 5 acciones.
//
// No se modela como una tabla rol->acción separada porque sería
// redundante con lo que ya expresa `currentDepartment`: quien tiene el
// caso puede actuar sobre él, quien no lo tiene no.

const ROLES = Object.freeze({
  PRESTACIONES: "PRESTACIONES",
  DIRECCION_MEDICA: "DIRECCION_MEDICA",
  ASESORIA_JURIDICA: "ASESORIA_JURIDICA",
  ADMIN: "ADMIN",
});

// Roles que pueden ser "responsables" de una solicitud, es decir, que
// pueden aparecer como currentDepartment. ADMIN queda fuera a propósito:
// no gestiona casos individuales (ver workflow objetivo aprobado).
const ROLES_OPERATIVOS = Object.freeze([
  ROLES.PRESTACIONES,
  ROLES.DIRECCION_MEDICA,
  ROLES.ASESORIA_JURIDICA,
]);

class ForbiddenActionError extends Error {
  constructor(message, { code, rol, accion, currentDepartment } = {}) {
    super(message);
    this.name = "ForbiddenActionError";
    this.code = code;
    this.rol = rol;
    this.accion = accion;
    this.currentDepartment = currentDepartment;
    this.statusCode = 403;
  }
}

/**
 * Lanza ForbiddenActionError si `rol` no tiene permiso para ejecutar
 * `accion` sobre una solicitud cuyo departamento responsable actual es
 * `currentDepartment`. No comprueba nada relativo al estado: de eso se
 * encarga solicitudFlowRules.getNextEstado, por separado.
 */
function assertPuedeEjecutar({ rol, accion, currentDepartment }) {
  if (rol === ROLES.ADMIN) {
    throw new ForbiddenActionError(
      `El rol ADMIN no tramita solicitudes individuales; no puede ejecutar "${accion}".`,
      { code: "ADMIN_NO_TRAMITA", rol, accion, currentDepartment },
    );
  }

  if (!ROLES_OPERATIVOS.includes(rol)) {
    throw new ForbiddenActionError(
      `El rol "${rol}" no está autorizado a ejecutar acciones sobre solicitudes.`,
      { code: "ROL_NO_OPERATIVO", rol, accion, currentDepartment },
    );
  }

  if (rol !== currentDepartment) {
    throw new ForbiddenActionError(
      `La solicitud está actualmente bajo la responsabilidad de "${currentDepartment}"; el rol "${rol}" no puede ejecutar "${accion}" sobre ella.`,
      { code: "FUERA_DE_RESPONSABILIDAD", rol, accion, currentDepartment },
    );
  }
}

/**
 * Solo PRESTACIONES puede crear una solicitud (es quien recibe la
 * petición del asegurado/centro médico y abre el caso, según el
 * workflow objetivo aprobado). No hay aquí ninguna noción de
 * "currentDepartment" -- la solicitud todavía no existe.
 */
function assertPuedeCrear(rol) {
  if (rol !== ROLES.PRESTACIONES) {
    throw new ForbiddenActionError(
      `Solo el rol PRESTACIONES puede crear solicitudes; "${rol}" no está autorizado.`,
      { code: "SOLO_PRESTACIONES_CREA", rol, accion: "CREAR" },
    );
  }
}

/** true/false sin lanzar, para usarlo en comprobaciones puntuales de lectura. */
function esResponsableDe(rol, currentDepartment) {
  return ROLES_OPERATIVOS.includes(rol) && rol === currentDepartment;
}

// --- Visibilidad de lectura ---------------------------------------------
//
// Deriva directamente del workflow objetivo aprobado:
//   - PRESTACIONES es el orquestador del caso: ve todas las solicitudes
//     (las gestiona directamente o hace seguimiento de las derivadas).
//   - ADMIN supervisa el sistema en modo auditoría: ve todas.
//   - DIRECCION_MEDICA y ASESORIA_JURIDICA solo ven las solicitudes que
//     están (o han estado, incluidas ya resueltas) bajo su
//     responsabilidad, es decir, cuyo currentDepartment coincide con su
//     rol. No se diseña aquí ninguna bandeja/UX, solo el filtro mínimo
//     de acceso a datos que exige el workflow.

/** Filtro de Mongoose a aplicar a una consulta de Solicitud según el rol. */
function getFiltroVisibilidad(rol) {
  if (rol === ROLES.DIRECCION_MEDICA || rol === ROLES.ASESORIA_JURIDICA) {
    return { currentDepartment: rol };
  }
  // PRESTACIONES y ADMIN: sin restricción.
  return {};
}

/** ¿Puede `rol` ver esta solicitud concreta (ya cargada) en modo lectura? */
function puedeVer(rol, solicitud) {
  if (rol === ROLES.DIRECCION_MEDICA || rol === ROLES.ASESORIA_JURIDICA) {
    return solicitud.currentDepartment === rol;
  }
  return true; // PRESTACIONES y ADMIN
}

class ForbiddenReadError extends Error {
  constructor(message, { code, rol, currentDepartment } = {}) {
    super(message);
    this.name = "ForbiddenReadError";
    this.code = code;
    this.rol = rol;
    this.currentDepartment = currentDepartment;
    this.statusCode = 403;
  }
}

module.exports = {
  ROLES,
  ROLES_OPERATIVOS,
  ForbiddenActionError,
  ForbiddenReadError,
  assertPuedeEjecutar,
  assertPuedeCrear,
  esResponsableDe,
  getFiltroVisibilidad,
  puedeVer,
};
