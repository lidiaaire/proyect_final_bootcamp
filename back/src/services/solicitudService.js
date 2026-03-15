const Solicitud = require("../models/solicitudModel");

const ESTADOS = require("../core/constants/solicitudEstados");
const ROLES = require("../core/constants/roles");
const TIPOS = require("../core/constants/tiposHistorial");

/* ==============================
SOLICITAR DOCUMENTACION
============================== */

async function requestDocumentation(id, documentosSolicitados = []) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoAnterior = solicitud.estadoInterno;

  solicitud.estadoInterno = ESTADOS.DOCUMENTACION_SOLICITADA;
  solicitud.currentDepartment = ROLES.PRESTACIONES;

  solicitud.historial.push({
    tipo: TIPOS.SOLICITUD_DOCUMENTACION,
    estadoAnterior,
    estadoNuevo: ESTADOS.DOCUMENTACION_SOLICITADA,
    changedBy: ROLES.PRESTACIONES,
    documentosSolicitados,
    fecha: new Date(),
  });

  solicitud.notas.push({
    text: `Se solicita documentación: ${documentosSolicitados.join(", ")}`,
    author: "Sistema",
    date: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

/* ==============================
ENVIAR A DIRECCION MEDICA
============================== */

async function sendToDireccionMedica(id) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoAnterior = solicitud.estadoInterno;

  solicitud.estadoInterno = ESTADOS.EN_REVISION;
  solicitud.currentDepartment = ROLES.DIRECCION_MEDICA;

  solicitud.historial.push({
    tipo: TIPOS.REVISION_MEDICA,
    estadoAnterior,
    estadoNuevo: ESTADOS.EN_REVISION,
    changedBy: ROLES.PRESTACIONES,
    fecha: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

/* ==============================
ENVIAR A ASESORIA JURIDICA
============================== */

async function sendToAsesoriaJuridica(id) {
  const solicitud = await Solicitud.findById(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  const estadoAnterior = solicitud.estadoInterno;

  solicitud.estadoInterno = ESTADOS.EN_REVISION;
  solicitud.currentDepartment = ROLES.ASESORIA_JURIDICA;

  solicitud.historial.push({
    tipo: TIPOS.REVISION_JURIDICA,
    estadoAnterior,
    estadoNuevo: ESTADOS.EN_REVISION,
    changedBy: ROLES.PRESTACIONES,
    fecha: new Date(),
  });

  await solicitud.save();

  return solicitud;
}

module.exports = {
  requestDocumentation,
  sendToDireccionMedica,
  sendToAsesoriaJuridica,
};
