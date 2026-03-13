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
  comentario = "",
) => {
  const solicitud = await Solicitud.findById(solicitudId);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.estadoInterno = nuevoEstado;

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

  if (["AUTORIZADA", "RECHAZADA"].includes(nuevoEstado)) {
    solicitud.currentDepartment = null;
  }

  console.log("comentario recibido:", comentario);
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
        ? docsSolicitados
        : [],
    comentario: comentario,
  });

  await solicitud.save();
  return solicitud;
};

const getSolicitudesByRole = async () => {
  return await Solicitud.find().sort({ createdAt: -1 });
};

module.exports = { createSolicitud, changeStatus, getSolicitudesByRole };
