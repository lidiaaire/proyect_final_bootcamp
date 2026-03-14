function normalizeRequestMock(r) {
  return {
    id: r.id || r.numeroSolicitud,

    policyholderId: r.policyholderId,

    nombreCompleto: r.nombreCompleto || r.name || "",
    nombrePrueba: r.nombrePrueba || r.service || "",
    especialidad: r.especialidad || r.specialty || "Radiología",
    centroMedico: r.centroMedico || r.center || "Hospital Central",

    status: r.status || r.estadoInterno || "PENDIENTE",
    estadoInterno: r.estadoInterno || r.status || "PENDIENTE",

    date: r.date || r.createdAt || new Date(),
    createdAt: r.createdAt || r.date || new Date(),

    documentos: r.documentos || [],
    historial: r.historial || [],
  };
}

module.exports = normalizeRequestMock;
