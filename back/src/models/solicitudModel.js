// Este archivo contiene el modelo de datos para las solicitudes en la aplicación. El modelo de datos define la estructura de los documentos que se almacenarán en la base de datos de MongoDB para representar cada solicitud. Cada solicitud tiene campos como numeroSolicitud, nombreCompleto, numeroPoliza, dni, nombrePrueba, especialidad, centroMedico, estadoInterno, currentDepartment, documentos, historial, notas y autorizacionPdf. Este modelo se utiliza para crear y gestionar los documentos de solicitudes en la base de datos, lo que permite almacenar y recuperar información sobre cada solicitud de manera eficiente y estructurada.
// La estructura del modelo de datos incluye los siguientes campos: numeroSolicitud (número de la solicitud), nombreCompleto (nombre completo del asegurado asociado a la solicitud), numeroPoliza (número de póliza del asegurado), dni (número de DNI del asegurado), nombrePrueba (nombre de la prueba médica solicitada), especialidad (especialidad médica relacionada con la prueba), centroMedico (centro médico donde se realizará la prueba), estadoInterno (estado interno de la solicitud, como "En revisión", "Aprobada", "Rechazada"), currentDepartment (departamento actual encargado de la solicitud, como "Departamento Médico", "Departamento de Prestaciones"), documentos (lista de documentos asociados a la solicitud), historial (registro de cambios en el estado de la solicitud, incluyendo quién realizó el cambio y cuándo), notas (notas internas asociadas a la solicitud) y autorizacionPdf (URL del PDF de autorización generado para la solicitud). Esta estructura permite organizar y gestionar la información de las solicitudes de manera efectiva en la base de datos y en la aplicación.

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
