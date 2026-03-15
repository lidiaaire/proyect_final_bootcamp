const Solicitud = require("../models/solicitudModel");

const { generarAutorizacionPDF } = require("./generarAutorizacionPDF");

const {
  enviarEmailSimulado,
  generarEmailSolicitudDocumentacion,
} = require("./emailSimulationService");

/* ==============================
AUTORIZAR SOLICITUD
============================== */

async function authorizeRequest(id) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.estadoInterno = "AUTORIZADA";
  solicitud.currentDepartment = null;

  solicitud.historial.push({
    estado: "AUTORIZADA",
    changedBy: "DIRECCION_MEDICA",
    fecha: new Date(),
  });

  const pdf = generarAutorizacionPDF(solicitud);

  if (!solicitud.documentos) {
    solicitud.documentos = [];
  }

  solicitud.documentos.push({
    nombre: pdf.nombre,
    tipo: "AUTORIZACION",
    subidoPor: "SISTEMA",
    fecha: new Date(),
    url: pdf.url,
  });

  await solicitud.save();

  enviarEmailSimulado({
    to: solicitud.nombreCompleto,
    subject: "Autorización concedida",
    body: `Solicitud ${solicitud.numeroSolicitud} autorizada`,
  });

  return { solicitud, pdf };
}

/* ==============================
RECHAZAR SOLICITUD
============================== */

async function rejectRequest(id, comentario) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.estadoInterno = "RECHAZADA";
  solicitud.currentDepartment = null;

  solicitud.historial.push({
    estado: "RECHAZADA",
    changedBy: "PRESTACIONES",
    comentario,
    fecha: new Date(),
  });

  await solicitud.save();

  enviarEmailSimulado({
    to: solicitud.nombreCompleto,
    subject: "Solicitud rechazada",
    body: comentario,
  });

  return solicitud;
}

/* ==============================
SOLICITAR DOCUMENTACIÓN
============================== */

async function requestDocumentation(id, documentosSolicitados) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.estadoInterno = "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO";

  solicitud.currentDepartment = "PRESTACIONES";

  solicitud.historial.push({
    estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
    changedBy: "PRESTACIONES",
    documentosSolicitados,
    fecha: new Date(),
  });

  await solicitud.save();

  const email = generarEmailSolicitudDocumentacion(
    solicitud,
    documentosSolicitados,
  );

  enviarEmailSimulado(email);

  return solicitud;
}

module.exports = {
  authorizeRequest,
  rejectRequest,
  requestDocumentation,
};
