// Este archivo contiene la lógica relacionada con las solicitudes en la aplicación. Define varias funciones para gestionar las solicitudes, como obtener todas las solicitudes, obtener una solicitud por ID, solicitar documentación adicional, enviar una solicitud a dirección médica o asesoría jurídica, autorizar una solicitud y rechazar una solicitud. Estas funciones interactúan con el modelo de datos de las solicitudes para realizar las operaciones necesarias en la base de datos y también utilizan otras funciones de servicios relacionados, como updateRequestStatus para actualizar el estado de una solicitud, generarAutorizacionPDF para generar un PDF de autorización médica y funciones de emailSimulationService para simular el envío de correos electrónicos a los asegurados. Estas funciones son fundamentales para gestionar el flujo de trabajo de las solicitudes dentro de la aplicación y proporcionar una experiencia completa a los usuarios.
// Importamos el modelo de datos de las solicitudes para interactuar con la base de datos, así como otras funciones de servicios relacionados para manejar la lógica de negocio asociada a las solicitudes.

const Solicitud = require("../models/solicitudModel");
const Policyholder = require("../models/policyholderModel").default;
const { updateRequestStatus } = require("./request.service");
const { generarAutorizacionPDF } = require("./generarAutorizacionPDF");
const { generarNumeroSolicitud } = require("../core/numeroSolicitud");
const { validateCreateSolicitudPayload } = require("../core/solicitudValidation");
const { ESTADOS, ACCIONES } = require("../core/solicitudFlowRules");
const {
  getFiltroVisibilidad,
  puedeVer,
  assertPuedeCrear,
  ForbiddenReadError,
} = require("../core/solicitudPermissions");
const {
  generarEmailSolicitudDocumentacion,
  enviarEmailSimulado,
} = require("./emailSimulationService");

/* ==============================
CREAR SOLICITUD
Único punto de entrada al workflow (Sprint 1C). El cliente solo puede
decidir los 4 campos de negocio (numeroPoliza, nombrePrueba, especialidad,
centroMedico) y opcionalmente un comentario inicial -- ver
core/solicitudValidation.js. Todo lo demás (estado, departamento,
historial, numeroSolicitud, autor, fechas) lo fija el servidor.
============================== */
async function createSolicitud(body, user) {
  // 1) RBAC: solo PRESTACIONES puede abrir un caso.
  assertPuedeCrear(user?.role);

  // 2) Validación explícita del payload (no se confía en Mongoose).
  const datos = validateCreateSolicitudPayload(body);

  // 3) El asegurado debe existir. numeroPoliza es el identificador de
  // negocio del asegurado (Policyholder.id), no un ObjectId de Mongo.
  const policyholder = await Policyholder.findOne({ id: datos.numeroPoliza });

  if (!policyholder) {
    const error = new Error(
      `No existe ningún asegurado con el número de póliza "${datos.numeroPoliza}".`,
    );
    error.statusCode = 404;
    error.code = "ASEGURADO_NO_ENCONTRADO";
    throw error;
  }

  // 4) Identificador legible, generado de forma atómica (ver
  // core/numeroSolicitud.js) -- nunca decidido por el cliente.
  const numeroSolicitud = await generarNumeroSolicitud();
  const fecha = new Date();
  const notaInicial = datos.comentario
    ? `Solicitud creada: ${datos.comentario}`
    : "Solicitud creada";

  const solicitud = new Solicitud({
    numeroSolicitud,
    // nombreCompleto/dni se toman del asegurado real, no de lo que
    // envíe el cliente, para que la solicitud siempre sea coherente con
    // el registro del asegurado.
    nombreCompleto: policyholder.name,
    numeroPoliza: policyholder.id,
    dni: policyholder.dni,
    nombrePrueba: datos.nombrePrueba,
    especialidad: datos.especialidad,
    centroMedico: datos.centroMedico,
    // Estado y departamento de nacimiento: fijados aquí, nunca por el
    // cliente (ver workflow objetivo aprobado).
    estadoInterno: ESTADOS.PENDIENTE_GESTION,
    currentDepartment: "PRESTACIONES",
    documentos: [],
    historial: [
      {
        estadoAnterior: null,
        estado: ESTADOS.PENDIENTE_GESTION,
        accion: "CREACION",
        departamento: "PRESTACIONES",
        changedBy: user.role,
        comentario: notaInicial,
        fecha,
      },
    ],
    notas: [{ text: notaInicial, author: user.role, date: fecha }],
  });

  await solicitud.save();

  return solicitud;
}

/* ==============================
GET ALL
Filtrado por rol (ver core/solicitudPermissions.js#getFiltroVisibilidad):
PRESTACIONES y ADMIN ven todas; DIRECCION_MEDICA y ASESORIA_JURIDICA solo
las que están (o han estado) bajo su responsabilidad.
============================== */
async function getSolicitudes(rol) {
  return await Solicitud.find(getFiltroVisibilidad(rol)).sort({ createdAt: -1 });
}

/* ==============================
GET BY ID
Misma regla de visibilidad que getSolicitudes, aplicada a una solicitud
ya cargada: si el rol no tiene acceso, se lanza 403 en vez de exponer el
contenido.
============================== */
async function getSolicitudById(id, rol) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) return null;

  if (!puedeVer(rol, solicitud)) {
    throw new ForbiddenReadError(
      `La solicitud está bajo la responsabilidad de "${solicitud.currentDepartment}"; el rol "${rol}" no tiene acceso de lectura.`,
      { code: "FUERA_DE_VISIBILIDAD", rol, currentDepartment: solicitud.currentDepartment },
    );
  }

  return solicitud;
}

/* ==============================
GET BY POLICYHOLDER
============================== */
async function getSolicitudesByPolicyholder(numeroPoliza, rol) {
  return await Solicitud.find({ numeroPoliza, ...getFiltroVisibilidad(rol) }).sort({
    createdAt: -1,
  });
}

/* ==============================
SOLICITAR DOCUMENTACION
============================== */
async function requestDocumentation(id, user, justificacion) {
  try {
    const solicitud = await updateRequestStatus({
      requestId: id,
      accion: ACCIONES.SOLICITAR_DOCUMENTACION,
      user,
      comment: justificacion,
    });

    if (!solicitud.notas) {
      solicitud.notas = [];
    }

    solicitud.notas.push({
      text: `Se solicita documentación adicional: ${justificacion}`,
      author: user?.role || "DESCONOCIDO",
      date: new Date(),
    });

    await solicitud.save();

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
    accion: ACCIONES.ENVIAR_DIRECCION_MEDICA,
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Caso enviado a Dirección Médica: ${justificacion}`,
    author: user?.role || "DESCONOCIDO",
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
    accion: ACCIONES.ENVIAR_ASESORIA_JURIDICA,
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Caso enviado a Asesoría Jurídica: ${justificacion}`,
    author: user?.role || "DESCONOCIDO",
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
    accion: ACCIONES.AUTORIZAR,
    user,
    comment: justificacion || "Autorización sin observaciones",
  });

  const solicitud = await Solicitud.findById(id);

  solicitud.notas.push({
    text: justificacion
      ? `Solicitud autorizada: ${justificacion}`
      : "Solicitud autorizada correctamente",
    author: user?.role || "DESCONOCIDO",
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
    accion: ACCIONES.RECHAZAR,
    user,
    comment: justificacion,
  });

  // 🔥 AÑADIR NOTA
  solicitud.notas.push({
    text: `Solicitud rechazada: ${justificacion}`,
    author: user?.role || "DESCONOCIDO",
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

/* ==============================
AÑADIR NOTA INTERNA
============================== */
async function addNota(id, user, descripcion) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  solicitud.notas.push({
    text: descripcion,
    author: user?.role || "PRESTACIONES",
    date: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

module.exports = {
  createSolicitud,
  getSolicitudes,
  getSolicitudById,
  requestDocumentation,
  sendToMedicalDirection,
  sendToLegalAdvisory,
  authorizeRequest,
  rejectRequest,
  getSolicitudesByPolicyholder,
  addNota,
};
