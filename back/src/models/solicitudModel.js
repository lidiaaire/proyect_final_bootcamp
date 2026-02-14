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

    especialidad: {
      type: String,
      required: true,
    },

    centroMedico: {
      type: String,
      required: true,
    },

    informeMedico: {
      type: String,
      required: true,
    },

    volanteMedico: {
      type: String,
      required: true,
    },

    estadoInterno: {
      type: String,
      enum: [
        "PENDIENTE_PRESTACIONES",
        "PENDIENTE_DIRECCION_MEDICA",
        "PENDIENTE_ASESORIA_JURIDICA",
        "PENDIENTE_DOCUMENTACION",
        "AUTORIZADA",
        "RECHAZADA",
      ],
      default: "PENDIENTE_PRESTACIONES",
    },

    currentDepartment: {
      type: String,
      enum: ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"],
      default: "PRESTACIONES",
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
