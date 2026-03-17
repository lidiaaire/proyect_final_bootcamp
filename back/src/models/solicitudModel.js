const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema(
  {
    numeroSolicitud: String,

    nombreCompleto: String,

    numeroPoliza: {
      type: String,
      required: true,
    },

    dni: String,

    nombrePrueba: String,

    especialidad: String,

    centroMedico: String,

    estadoInterno: String,

    currentDepartment: String,

    documentos: [],

    historial: [
      {
        estado: String,
        changedBy: String,
        fecha: Date,
        tipo: String,
        documentosSolicitados: [],
      },
    ],

    notas: [
      {
        text: String,
        author: String,
        date: Date,
      },
    ],
    autorizacionPdf: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Solicitud", solicitudSchema);
