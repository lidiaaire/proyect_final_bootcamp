const Solicitud = require("../models/solicitudModel");

const generateNumeroSolicitud = () => {
  const timestamp = Date.now();
  return `SOL-${timestamp}`;
};

const createSolicitud = async (data, user) => {
  const numeroSolicitud = generateNumeroSolicitud();

  const nuevaSolicitud = new Solicitud({
    numeroSolicitud,
    ...data,
    estadoInterno: "PENDIENTE_PRESTACIONES",
    currentDepartment: "PRESTACIONES",
    historial: [
      {
        estado: "PENDIENTE_PRESTACIONES",
        changedBy: user.id,
      },
    ],
  });

  await nuevaSolicitud.save();

  return nuevaSolicitud;
};

const changeStatus = async (solicitudId, nuevoEstado, user) => {
  const solicitud = await Solicitud.findById(solicitudId);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  // Validaciones básicas por rol
  if (user.role === "PRESTACIONES") {
    if (
      ![
        "PENDIENTE_DIRECCION_MEDICA",
        "AUTORIZADA",
        "PENDIENTE_DOCUMENTACION",
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
        "PENDIENTE_DOCUMENTACION",
        "PENDIENTE_ASESORIA_JURIDICA",
      ].includes(nuevoEstado)
    ) {
      throw new Error("Transición no permitida para DIRECCION_MEDICA");
    }
  }

  if (user.role === "ASESORIA_JURIDICA") {
    if (
      !["RECHAZADA", "AUTORIZADA", "PENDIENTE_DOCUMENTACION"].includes(
        nuevoEstado,
      )
    ) {
      throw new Error("Transición no permitida para ASESORIA_JURIDICA");
    }
  }

  // Actualizar estado
  solicitud.estadoInterno = nuevoEstado;

  // Actualizar departamento actual
  if (nuevoEstado === "PENDIENTE_DIRECCION_MEDICA") {
    solicitud.currentDepartment = "DIRECCION_MEDICA";
  }

  if (nuevoEstado === "PENDIENTE_ASESORIA_JURIDICA") {
    solicitud.currentDepartment = "ASESORIA_JURIDICA";
  }

  if (nuevoEstado === "AUTORIZADA" || nuevoEstado === "RECHAZADA") {
    solicitud.currentDepartment = null;
  }

  // Añadir historial
  solicitud.historial.push({
    estado: nuevoEstado,
    changedBy: user.id,
  });

  await solicitud.save();

  return solicitud;
};

const getSolicitudesByRole = async (user) => {
  if (user.role === "ADMIN") {
    return await Solicitud.find().sort({ createdAt: -1 });
  }

  return await Solicitud.find({
    currentDepartment: user.role,
  }).sort({ createdAt: -1 });
};

module.exports = { createSolicitud, changeStatus, getSolicitudesByRole };
