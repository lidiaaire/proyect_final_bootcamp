export function normalizeSolicitud(solicitud) {
  return {
    id: solicitud._id || solicitud.id,

    numeroSolicitud: solicitud.numeroSolicitud,
    nombreCompleto: solicitud.nombreCompleto,
    numeroPoliza: solicitud.numeroPoliza,
    dni: solicitud.dni,
    nombrePrueba: solicitud.nombrePrueba,
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,
    estadoInterno: solicitud.estadoInterno,
    currentDepartment: solicitud.currentDepartment,
    createdAt: solicitud.createdAt || solicitud.fecha || null,

    /* =========================
       DOCUMENTOS
    ========================= */
    documentos: (solicitud.documentos || []).map((doc) => ({
      nombre: doc.nombre || doc.nombreArchivo || doc.filename,

      subidoPor:
        doc.subidoPor ||
        doc.usuario ||
        doc.uploadedBy ||
        doc.user?.name ||
        doc.createdBy ||
        "Usuario",

      fecha: doc.fecha || doc.createdAt || null,

      url: doc.url || doc.path || null,
    })),

    /* =========================
       NOTAS
    ========================= */
    notas: (solicitud.notas || []).map((nota) => ({
      text: nota.text || nota.descripcion || "",
      author: nota.author || nota.autor || "Sistema",
      date: nota.date || nota.createdAt || null,
    })),

    /* =========================
       HISTORIAL (TIMELINE)
    ========================= */
    historial: (solicitud.historial || []).map((item) => ({
      estado: item.estadoNuevo || item.estado || item.status || "SIN_ESTADO",
      estadoAnterior: item.estadoAnterior || null,

      // `accion` y `comentario` los añadió Sprint 1A al historial real;
      // se preservan aquí para que el Timeline (Sprint 2D) pueda mostrar
      // "solicitó documentación" en vez de solo "cambió el estado a...".
      accion: item.accion || null,
      comentario: item.comentario || null,

      changedBy: item.changedBy || item.usuario || item.user || "Sistema",

      fecha: item.fecha || item.createdAt || null,
    })),
  };
}
