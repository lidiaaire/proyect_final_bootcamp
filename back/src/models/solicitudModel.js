const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema(
  {
    numeroSolicitud: {
      type: String,
      required: true,
      unique: true,
    },

    nombreCompleto: {
      type: String,
      required: true,
    },

    numeroPoliza: {
      type: String,
      required: true,
    },

    dni: {
      type: String,
      required: true,
    },

    nombrePrueba: {
      type: String,
      required: true,
    },

    documentos: [
      {
        nombre: String,
        tipo: String,
        subidoPor: String,
        fecha: Date,
        url: String,
      },
    ],

    especialidad: {
      type: String,
      required: true,
    },

    centroMedico: {
      type: String,
      required: true,
    },

    estadoInterno: {
      type: String,
      enum: [
        "PENDIENTE_INICIO_GESTION",
        "PENDIENTE_DIRECCION_MEDICA",
        "PENDIENTE_ASESORIA_JURIDICA",
        "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
        "PENDIENTE_REVISION_PRESTACIONES",
        "AUTORIZADA",
        "RECHAZADA",
      ],
      default: "PENDIENTE_INICIO_GESTION",
    },

    currentDepartment: {
      type: String,
      enum: ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"],
      default: "PRESTACIONES",
    },

    lastTechnicalDepartment: {
      type: String,
      enum: ["DIRECCION_MEDICA", "ASESORIA_JURIDICA"],
      default: null,
    },
    historial: [
      {
        estado: String,
        changedBy: String,
        fecha: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Solicitud", solicitudSchema);
