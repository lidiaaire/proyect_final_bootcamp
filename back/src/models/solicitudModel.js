// Este archivo contiene el modelo de datos para las solicitudes en la aplicación. El modelo de datos define la estructura de los documentos que se almacenarán en la base de datos de MongoDB para representar cada solicitud. Cada solicitud tiene campos como numeroSolicitud, nombreCompleto, numeroPoliza, dni, nombrePrueba, especialidad, centroMedico, estadoInterno, currentDepartment, documentos, historial, notas y autorizacionPdf. Este modelo se utiliza para crear y gestionar los documentos de solicitudes en la base de datos, lo que permite almacenar y recuperar información sobre cada solicitud de manera eficiente y estructurada.
// La estructura del modelo de datos incluye los siguientes campos: numeroSolicitud (número de la solicitud), nombreCompleto (nombre completo del asegurado asociado a la solicitud), numeroPoliza (número de póliza del asegurado), dni (número de DNI del asegurado), nombrePrueba (nombre de la prueba médica solicitada), especialidad (especialidad médica relacionada con la prueba), centroMedico (centro médico donde se realizará la prueba), estadoInterno (estado interno de la solicitud, como "En revisión", "Aprobada", "Rechazada"), currentDepartment (departamento actual encargado de la solicitud, como "Departamento Médico", "Departamento de Prestaciones"), documentos (lista de documentos asociados a la solicitud), historial (registro de cambios en el estado de la solicitud, incluyendo quién realizó el cambio y cuándo), notas (notas internas asociadas a la solicitud) y autorizacionPdf (URL del PDF de autorización generado para la solicitud). Esta estructura permite organizar y gestionar la información de las solicitudes de manera efectiva en la base de datos y en la aplicación.

const mongoose = require("mongoose");
const { ESTADOS, ESTADOS_LEGACY } = require("../core/solicitudFlowRules");
const { ROLES_OPERATIVOS } = require("../core/solicitudPermissions");

// La solicitud puede llegar en un estado del modelo anterior (legacy) que
// todavía no ha pasado por scripts/migrateEstados.js. Se admite en el
// esquema para poder leerla y migrarla, pero la máquina de estados
// (core/solicitudFlowRules.js) la trata como no operable hasta migrarla.
const ESTADOS_ADMITIDOS_EN_ESQUEMA = [
  ...Object.values(ESTADOS),
  ...ESTADOS_LEGACY,
];

// currentDepartment solo puede ser uno de los 3 roles operativos que
// pueden ser responsables de un caso (ADMIN nunca lo es, ver
// core/solicitudPermissions.js). Se admiten además los valores en
// minúsculas del modelo anterior únicamente para poder leer y
// normalizar documentos ya existentes (scripts/migrateEstados.js);
// nunca se vuelve a escribir un valor fuera de ROLES_OPERATIVOS.
const DEPARTAMENTOS_LEGACY = ["direccionmedica", "asesoriajuridica", "prestaciones"];
const DEPARTAMENTOS_ADMITIDOS_EN_ESQUEMA = [
  ...ROLES_OPERATIVOS,
  ...DEPARTAMENTOS_LEGACY,
];

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

    estadoInterno: {
      type: String,
      enum: ESTADOS_ADMITIDOS_EN_ESQUEMA,
    },

    currentDepartment: {
      type: String,
      enum: DEPARTAMENTOS_ADMITIDOS_EN_ESQUEMA,
    },

    documentos: [],

    historial: [
      {
        // Estado antes y después de esta transición. `estadoAnterior`
        // puede faltar en entradas históricas anteriores a este sprint.
        estadoAnterior: String,
        estado: String,
        // Acción de negocio que provocó la transición (ver ACCIONES en
        // core/solicitudFlowRules.js), p. ej. "AUTORIZAR". La migración
        // de estados usa "MIGRACION_ESTADO".
        accion: String,
        departamento: String,
        changedBy: String,
        comentario: String,
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
