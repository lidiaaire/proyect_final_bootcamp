const Solicitud = require("../models/solicitudModel");
const solicitudFlowRules = require("../core/solicitudFlowRules");

const generateNumeroSolicitud = () => {
  const timestamp = Date.now();
  return `SOL-${timestamp}`;
};

const createSolicitud = async (data, user) => {
  const numeroSolicitud = generateNumeroSolicitud();

  const nuevaSolicitud = new Solicitud({
    numeroSolicitud,
    ...data,
    estadoInterno: "PENDIENTE_INICIO_GESTION",
    currentDepartment: "PRESTACIONES",
    lastTechnicalDepartment: null,
    historial: [
      {
        estado: "PENDIENTE_INICIO_GESTION",
        changedBy: user.id,
        fecha: new Date(),
        tipo: "CREACION",
      },
    ],
  });

  await nuevaSolicitud.save();
  return nuevaSolicitud;
};

const changeStatus = async (
  solicitudId,
  nuevoEstado,
  user,
  docsSolicitados = [],
  comentarioDocs = "",
) => {
  const solicitud = await Solicitud.findById(solicitudId);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoActual = solicitud.estadoInterno;

  const allowedNextStates = solicitudFlowRules[estadoActual];

  if (!allowedNextStates || !allowedNextStates.includes(nuevoEstado)) {
    throw new Error(
      `Transición no permitida de ${estadoActual} a ${nuevoEstado}`,
    );
  }

  if (estadoActual === "PENDIENTE_REVISION_PRESTACIONES") {
    const expectedState =
      solicitud.lastTechnicalDepartment === "DIRECCION_MEDICA"
        ? "PENDIENTE_DIRECCION_MEDICA"
        : "PENDIENTE_ASESORIA_JURIDICA";

    if (nuevoEstado !== expectedState) {
      throw new Error(
        "Solo puede devolverse al departamento técnico que solicitó la documentación",
      );
    }
  }

  if (user.role === "PRESTACIONES") {
    if (
      ![
        "PENDIENTE_DIRECCION_MEDICA",
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_REVISION_PRESTACIONES",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para PRESTACIONES");
    }
  }

  if (user.role === "DIRECCION_MEDICA") {
    if (
      ![
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para DIRECCION_MEDICA");
    }
  }

  if (user.role === "ASESORIA_JURIDICA") {
    if (
      ![
        "AUTORIZADA",
        "RECHAZADA",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para ASESORIA_JURIDICA");
    }
  }

  if (
    nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO" &&
    (user.role === "DIRECCION_MEDICA" ||
      user.role === "ASESORIA_JURIDICA" ||
      user.role === "PRESTACIONES")
  ) {
    solicitud.lastTechnicalDepartment = user.role;
  }

  solicitud.estadoInterno = nuevoEstado;

  solicitud.historial.push({
    estado: nuevoEstado,
    changedBy: user.role,
    fecha: new Date(),
    tipo:
      nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"
        ? "SOLICITUD_DOCUMENTACION"
        : "CAMBIO_ESTADO",
    documentosSolicitados:
      nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"
        ? docsSolicitados || []
        : [],
    comentario: comentarioDocs || "",
  });

  await solicitud.save();

  if (nuevoEstado === "PENDIENTE_INICIO_GESTION") {
    solicitud.currentDepartment = "PRESTACIONES";
  }

  if (nuevoEstado === "PENDIENTE_DIRECCION_MEDICA") {
    solicitud.currentDepartment = "DIRECCION_MEDICA";
  }

  if (nuevoEstado === "PENDIENTE_ASESORIA_JURIDICA") {
    solicitud.currentDepartment = "ASESORIA_JURIDICA";
  }

  if (nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
    solicitud.currentDepartment = null;
  }

  if (nuevoEstado === "PENDIENTE_REVISION_PRESTACIONES") {
    solicitud.currentDepartment = "PRESTACIONES";
  }

  if (nuevoEstado === "AUTORIZADA" || nuevoEstado === "RECHAZADA") {
    solicitud.currentDepartment = null;
  }

  // Registrar historial SIEMPRE
  solicitud.historial.push({
    estado: nuevoEstado,
    changedBy: user.role,
    fecha: new Date(),
    tipo:
      nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"
        ? "SOLICITUD_DOCUMENTACION"
        : "CAMBIO_ESTADO",
    documentosSolicitados:
      nuevoEstado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"
        ? docsSolicitados || []
        : [],
    comentario: comentarioDocs || "",
  });

  await solicitud.save();

  return solicitud;
};

const getSolicitudesByRole = async () => {
  return await Solicitud.find().sort({ createdAt: -1 });
};

module.exports = { createSolicitud, changeStatus, getSolicitudesByRole };
