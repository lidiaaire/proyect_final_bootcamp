const flowRules = {
  PENDIENTE_INICIO_GESTION: {
    next: [
      "PENDIENTE_DIRECCION_MEDICA",
      "PENDIENTE_ASESORIA_JURIDICA",
      "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
    ],
    department: "PRESTACIONES",
  },

  PENDIENTE_DIRECCION_MEDICA: {
    next: ["AUTORIZADA", "RECHAZADA", "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"],
    department: "DIRECCION_MEDICA",
  },

  PENDIENTE_ASESORIA_JURIDICA: {
    next: ["AUTORIZADA", "RECHAZADA"],
    department: "ASESORIA_JURIDICA",
  },

  PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: {
    next: ["PENDIENTE_REVISION_PRESTACIONES"],
    department: null,
  },

  PENDIENTE_REVISION_PRESTACIONES: {
    next: ["PENDIENTE_DIRECCION_MEDICA", "PENDIENTE_ASESORIA_JURIDICA"],
    department: "PRESTACIONES",
  },

  AUTORIZADA: {
    next: [],
    department: null,
  },

  RECHAZADA: {
    next: [],
    department: null,
  },
};

module.exports = flowRules;
