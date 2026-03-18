// Este módulo define la función normalizeSolicitud, que toma un objeto de solicitud sin normalizar y lo transforma en un formato estandarizado que puede ser utilizado por la aplicación. La función extrae y renombra campos específicos de la solicitud original, y también normaliza las estructuras de datos anidadas como documentos, notas e historial para garantizar una consistencia en el formato de los datos a lo largo de la aplicación. Asegúrate de que los campos utilizados en esta función coincidan con los campos definidos en el backend para garantizar una correcta normalización de los datos.
// La función normalizeSolicitud toma una solicitud como entrada y devuelve un objeto con los campos mapeados, incluyendo la normalización de los documentos, notas e historial asociados a la solicitud. Esta función es esencial para garantizar que los datos de las solicitudes se presenten de manera consistente y clara en la interfaz de usuario, facilitando la comprensión y gestión de las solicitudes por parte de los usuarios. Asegúrate de utilizar esta función en los lugares adecuados de tu aplicación para mantener la consistencia en el formato de los datos relacionados con las solicitudes.

export function normalizeSolicitud(solicitud) {
  return {
    id: solicitud._id || solicitud.id,

    numeroSolicitud: solicitud.numeroSolicitud,
    nombreCompleto: solicitud.nombreCompleto,
    numeroPoliza: solicitud.numeroPoliza,
    dni: solicitud.dni,

    estadoInterno: solicitud.estadoInterno,
    currentDepartment: solicitud.currentDepartment,

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

      changedBy: item.changedBy || item.usuario || item.user || "Sistema",

      fecha: item.fecha || item.createdAt || null,
    })),
  };
}
