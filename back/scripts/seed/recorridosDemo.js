// Recorridos de historial demo para el seed de Solicitudes.
//
// En vez de reimplementar la máquina de estados (riesgo de que el seed
// "invente" combinaciones estado/departamento inválidas y se desincronice
// de la lógica real), esta función reutiliza directamente
// core/solicitudFlowRules.js -- la misma fuente de verdad que usa
// request.service.js en producción -- para calcular, a partir de una
// secuencia de acciones, el estado final, el departamento final y el
// historial completo de una solicitud demo. Así el seed nunca puede
// generar una solicitud en un estado/departamento que el workflow real
// consideraría inválido.

const { ACCIONES, getNextEstado, getDepartamentoPorEstado, ESTADOS } = require("../../src/core/solicitudFlowRules");

// Un puñado de recorridos representativos (no exhaustivos): expedientes
// recién abiertos, resueltos directamente, con una vuelta a
// documentación, con derivación simple y con derivación cruzada.
const RECORRIDOS = [
  { nombre: "recien_creada", acciones: [] },
  { nombre: "autorizada_directa", acciones: [ACCIONES.AUTORIZAR] },
  { nombre: "rechazada_directa", acciones: [ACCIONES.RECHAZAR] },
  {
    nombre: "documentacion_luego_autorizada",
    acciones: [ACCIONES.SOLICITAR_DOCUMENTACION, ACCIONES.AUTORIZAR],
  },
  {
    nombre: "revision_medica_luego_autorizada",
    acciones: [ACCIONES.ENVIAR_DIRECCION_MEDICA, ACCIONES.AUTORIZAR],
  },
  {
    nombre: "revision_juridica_luego_rechazada",
    acciones: [ACCIONES.ENVIAR_ASESORIA_JURIDICA, ACCIONES.RECHAZAR],
  },
  {
    nombre: "derivacion_cruzada_medica_a_juridica",
    acciones: [ACCIONES.ENVIAR_DIRECCION_MEDICA, ACCIONES.ENVIAR_ASESORIA_JURIDICA, ACCIONES.AUTORIZAR],
  },
  {
    nombre: "documentacion_luego_revision_medica_rechazada",
    acciones: [ACCIONES.SOLICITAR_DOCUMENTACION, ACCIONES.ENVIAR_DIRECCION_MEDICA, ACCIONES.RECHAZAR],
  },
  // Expedientes "en curso" (estado NO final en reposo): sin ellos ningún
  // caso demo se queda visiblemente en DOCUMENTACION_PENDIENTE,
  // EN_REVISION_MEDICA o EN_REVISION_JURIDICA -- todos los recorridos de
  // arriba terminan en AUTORIZAR/RECHAZAR o se quedan en el estado de
  // creación. Necesarios para poder ver/probar acciones pendientes reales.
  {
    nombre: "documentacion_pendiente_en_curso",
    acciones: [ACCIONES.SOLICITAR_DOCUMENTACION],
  },
  {
    nombre: "revision_medica_en_curso",
    acciones: [ACCIONES.ENVIAR_DIRECCION_MEDICA],
  },
  {
    nombre: "revision_juridica_en_curso",
    acciones: [ACCIONES.ENVIAR_ASESORIA_JURIDICA],
  },
];

const COMENTARIO_POR_ACCION = {
  [ACCIONES.SOLICITAR_DOCUMENTACION]: "Se solicita documentación adicional (seed demo).",
  [ACCIONES.ENVIAR_DIRECCION_MEDICA]: "Caso derivado a Dirección Médica (seed demo).",
  [ACCIONES.ENVIAR_ASESORIA_JURIDICA]: "Caso derivado a Asesoría Jurídica (seed demo).",
  [ACCIONES.AUTORIZAR]: "Solicitud autorizada (seed demo).",
  [ACCIONES.RECHAZAR]: "Solicitud rechazada por criterio clínico (seed demo).",
};

/**
 * Construye { estadoInterno, currentDepartment, historial } para una
 * solicitud demo, aplicando `acciones` desde PENDIENTE_GESTION /
 * PRESTACIONES (nacimiento real de toda solicitud, ver
 * solicitudService.createSolicitud) con la misma máquina de estados que
 * usa el backend en caliente.
 */
function construirHistorialDemo({ acciones, fechaCreacion }) {
  let estadoActual = ESTADOS.PENDIENTE_GESTION;
  let departamentoActual = "PRESTACIONES";
  let fecha = new Date(fechaCreacion);

  const historial = [
    {
      estadoAnterior: null,
      estado: estadoActual,
      accion: "CREACION",
      departamento: departamentoActual,
      changedBy: "PRESTACIONES",
      comentario: "Solicitud creada (seed demo).",
      fecha: new Date(fecha),
    },
  ];

  for (const accion of acciones) {
    const estadoAnterior = estadoActual;
    const nextEstado = getNextEstado(estadoActual, accion);
    const nextDepartamento = getDepartamentoPorEstado(nextEstado) ?? departamentoActual;

    // El autor de la transición es quien tenía la responsabilidad ANTES
    // de ejecutarla (igual que exige solicitudPermissions.assertPuedeEjecutar
    // en producción).
    const changedBy = departamentoActual;

    fecha = new Date(fecha.getTime() + 1000 * 60 * 60 * 24); // +1 día por paso

    historial.push({
      estadoAnterior,
      estado: nextEstado,
      accion,
      departamento: nextDepartamento,
      changedBy,
      comentario: COMENTARIO_POR_ACCION[accion] || "",
      fecha: new Date(fecha),
    });

    estadoActual = nextEstado;
    departamentoActual = nextDepartamento;
  }

  return {
    estadoInterno: estadoActual,
    currentDepartment: departamentoActual,
    historial,
  };
}

module.exports = { RECORRIDOS, construirHistorialDemo };
