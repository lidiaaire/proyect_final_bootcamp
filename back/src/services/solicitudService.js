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
    console.error("ERROR REAL BACK:", error); // 👈 CLAVE
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
  const solicitud = await updateRequestStatus({
    requestId: id,
    newStatus: "AUTORIZADA",
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Solicitud autorizada: ${justificacion}`,
    author: "PRESTACIONES",
    date: new Date(),
  });

  await solicitud.save();

  // 🔹 GENERAR PDF
  const pdf = generarAutorizacionPDF(solicitud);

  // 🔹 GENERAR EMAIL
  const email = {
    to: solicitud.nombreCompleto,
    subject: "Solicitud autorizada",
    body: `
Estimado/a ${solicitud.nombreCompleto},

Su solicitud ${solicitud.numeroSolicitud} ha sido AUTORIZADA.

Puede descargar su autorización aquí:
${pdf.url}

Atentamente,
Flowly
`,
  };

  enviarEmailSimulado(email);

  return solicitud;
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
};
