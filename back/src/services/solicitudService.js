// Este archivo contiene la lógica relacionada con las solicitudes en la aplicación. Define varias funciones para gestionar las solicitudes, como obtener todas las solicitudes, obtener una solicitud por ID, solicitar documentación adicional, enviar una solicitud a dirección médica o asesoría jurídica, autorizar una solicitud y rechazar una solicitud. Estas funciones interactúan con el modelo de datos de las solicitudes para realizar las operaciones necesarias en la base de datos y también utilizan otras funciones de servicios relacionados, como updateRequestStatus para actualizar el estado de una solicitud, generarAutorizacionPDF para generar un PDF de autorización médica y funciones de emailSimulationService para simular el envío de correos electrónicos a los asegurados. Estas funciones son fundamentales para gestionar el flujo de trabajo de las solicitudes dentro de la aplicación y proporcionar una experiencia completa a los usuarios.
// Importamos el modelo de datos de las solicitudes para interactuar con la base de datos, así como otras funciones de servicios relacionados para manejar la lógica de negocio asociada a las solicitudes.

const Solicitud = require("../models/solicitudModel");
const { updateRequestStatus } = require("./request.service");
const { generarAutorizacionPDF } = require("./generarAutorizacionPDF");
const {
  generarEmailSolicitudDocumentacion,
  enviarEmailSimulado,
} = require("./emailSimulationService");

/* ==============================
GET ALL
============================== */
async function getSolicitudes() {
  return await Solicitud.find().sort({ createdAt: -1 });
}

/* ==============================
GET BY ID
============================== */
async function getSolicitudById(id) {
  return await Solicitud.findById(id);
}

/* ==============================
GET BY POLICYHOLDER
============================== */
async function getSolicitudesByPolicyholder(numeroPoliza) {
  return await Solicitud.find({ numeroPoliza }).sort({ createdAt: -1 });
}

/* ==============================
SOLICITAR DOCUMENTACION
============================== */
async function requestDocumentation(id, user, justificacion) {
  try {
    const updated = await updateRequestStatus({
      requestId: id,
      newStatus: "DOCUMENTACION_SOLICITADA",
      user,
      comment: justificacion,
    });

    console.log("UPDATED:", updated);

    const solicitud = await Solicitud.findById(id);

    console.log("REHIDRATADA:", solicitud);

    if (!solicitud) {
      throw new Error("Solicitud no encontrada");
    }

    if (!solicitud.notas) {
      solicitud.notas = [];
    }

    solicitud.notas.push({
      text: `Se solicita documentación adicional: ${justificacion}`,
      author: "PRESTACIONES",
      date: new Date(),
    });

    console.log("ANTES SAVE");

    await solicitud.save();

    console.log("DESPUES SAVE");

    return solicitud;
  } catch (error) {
    console.error("ERROR REAL BACK:", error);
    throw error;
  }
}

/* ==============================
ENVIAR A DIRECCION MEDICA
============================== */
async function sendToMedicalDirection(id, user, justificacion) {
  const solicitud = await updateRequestStatus({
    requestId: id,
    newStatus: "EN_REVISION",
    newDepartment: "direccionmedica",
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Caso enviado a Dirección Médica: ${justificacion}`,
    author: "PRESTACIONES",
    date: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

/* ==============================
ENVIAR A ASESORIA JURIDICA
============================== */
async function sendToLegalAdvisory(id, user, justificacion) {
  const solicitud = await updateRequestStatus({
    requestId: id,
    newStatus: "EN_REVISION",
    newDepartment: "asesoriajuridica",
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Caso enviado a Asesoría Jurídica: ${justificacion}`,
    author: "PRESTACIONES",
    date: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

/* ==============================
AUTORIZAR
============================== */
async function authorizeRequest(id, user, justificacion) {
  await updateRequestStatus({
    requestId: id,
    newStatus: "AUTORIZADA",
    user,
    comment: justificacion,
  });

  const solicitud = await Solicitud.findById(id);

  solicitud.notas.push({
    text: `Solicitud autorizada: ${justificacion}`,
    author: "PRESTACIONES",
    date: new Date(),
  });

  // 🔹 GENERAR PDF
  const pdf = await generarAutorizacionPDF(solicitud);

  solicitud.autorizacionPdf = pdf.url;

  // 🔴 UN SOLO SAVE
  await solicitud.save();

  const email = {
    to: solicitud.nombreCompleto,
    subject: "Solicitud autorizada",
    body: `
Estimado/a ${solicitud.nombreCompleto},

Su solicitud ${solicitud.numeroSolicitud} ha sido AUTORIZADA.

Puede descargar su autorización aquí:
http://localhost:4000${pdf.url}

Atentamente,
Flowly
`,
  };

  enviarEmailSimulado(email);

  return await Solicitud.findById(id);
}

/* ==============================
RECHAZAR
============================== */
async function rejectRequest(id, user, justificacion) {
  const solicitud = await updateRequestStatus({
    requestId: id,
    newStatus: "RECHAZADA",
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Solicitud rechazada: ${justificacion}`,
    author: "PRESTACIONES",
    date: new Date(),
  });

  await solicitud.save();

  const email = {
    to: solicitud.nombreCompleto,
    subject: "Solicitud rechazada",
    body: `
Estimado/a ${solicitud.nombreCompleto},

Su solicitud ${solicitud.numeroSolicitud} ha sido RECHAZADA.

Motivo:
${justificacion}

Atentamente,
Flowly
`,
  };

  enviarEmailSimulado(email);

  return solicitud;
}

module.exports = {
  getSolicitudes,
  getSolicitudById,
  requestDocumentation,
  sendToMedicalDirection,
  sendToLegalAdvisory,
  authorizeRequest,
  rejectRequest,
  getSolicitudesByPolicyholder,
};
