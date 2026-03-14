const { policyholders } = require("../mocks/policyholders");

function mapSolicitud(solicitud) {
  const policyholder = policyholders.find(
    (p) => String(p.id) === String(solicitud.policyholderId),
  );

  return {
    numeroSolicitud: solicitud.id,
    policyholderId: solicitud.policyholderId,

    nombreCompleto: policyholder?.name || "",
    nombrePrueba: solicitud.service,

    especialidad: solicitud.specialty || "Radiología",
    centroMedico: solicitud.center || "Hospital Central",

    estadoInterno: solicitud.status,
    createdAt: solicitud.date,

    documentos: solicitud.documentos || [],
    historial: solicitud.historial || [],
  };
}

module.exports = mapSolicitud;
