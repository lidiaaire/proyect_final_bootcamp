const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");
const { generarDocumentos } = require("../src/mocks/generarDocumentos");
require("dotenv").config();

/* =================================
   GENERAR HISTORIAL REALISTA
================================= */

function generarHistorial(estadoFinal) {
  const ahora = Date.now();

  const historial = [
    {
      estado: "PENDIENTE_INICIO_GESTION",
      changedBy: "PRESTACIONES",
      fecha: new Date(ahora - faker.number.int({ min: 8, max: 12 }) * 86400000),
    },
    {
      estado: "PENDIENTE_DIRECCION_MEDICA",
      changedBy: "PRESTACIONES",
      fecha: new Date(ahora - faker.number.int({ min: 6, max: 8 }) * 86400000),
    },
  ];

  if (estadoFinal === "AUTORIZADA") {
    historial.push({
      estado: "AUTORIZADA",
      changedBy: "DIRECCION_MEDICA",
      fecha: new Date(ahora - faker.number.int({ min: 2, max: 4 }) * 86400000),
    });
  }

  if (estadoFinal === "RECHAZADA") {
    historial.push({
      estado: "PENDIENTE_ASESORIA_JURIDICA",
      changedBy: "DIRECCION_MEDICA",
      fecha: new Date(ahora - faker.number.int({ min: 3, max: 5 }) * 86400000),
    });

    historial.push({
      estado: "RECHAZADA",
      changedBy: "ASESORIA_JURIDICA",
      fecha: new Date(ahora - faker.number.int({ min: 1, max: 3 }) * 86400000),
    });
  }

  if (estadoFinal === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
    historial.push({
      estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      changedBy: "DIRECCION_MEDICA",
      fecha: new Date(ahora - faker.number.int({ min: 1, max: 3 }) * 86400000),
    });
  }

  return historial;
}

/* =================================
   ESTADOS REALISTAS
================================= */

const generarEstadoRealista = () => {
  const rand = Math.random();

  if (rand < 0.4) return "PENDIENTE_INICIO_GESTION";
  if (rand < 0.6) return "PENDIENTE_DIRECCION_MEDICA";
  if (rand < 0.75) return "PENDIENTE_ASESORIA_JURIDICA";
  if (rand < 0.85) return "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO";
  if (rand < 0.92) return "PENDIENTE_REVISION_PRESTACIONES";
  if (rand < 0.97) return "AUTORIZADA";

  return "RECHAZADA";
};

/* =================================
   DEPARTAMENTO SEGÚN ESTADO
================================= */

const generarDepartamento = (estado) => {
  if (estado === "AUTORIZADA" || estado === "RECHAZADA") {
    return null;
  }

  if (estado === "PENDIENTE_DIRECCION_MEDICA") {
    return "DIRECCION_MEDICA";
  }

  if (estado === "PENDIENTE_ASESORIA_JURIDICA") {
    return "ASESORIA_JURIDICA";
  }

  return "PRESTACIONES";
};

/* =================================
   GENERAR SOLICITUDES
================================= */

const generarSolicitudes = (cantidad) => {
  const solicitudes = [];

  for (let i = 0; i < cantidad; i++) {
    const estado = generarEstadoRealista();

    const nombrePrueba = faker.helpers.arrayElement([
      "Resonancia Magnética",
      "TAC",
      "Ecografía",
      "Radiografía",
      "Prueba genética",
    ]);

    solicitudes.push({
      numeroSolicitud: `SOL-${1000 + i}`,
      nombreCompleto: faker.person.fullName(),
      numeroPoliza: faker.finance.accountNumber(8),
      dni: faker.string.alphanumeric(8).toUpperCase(),

      nombrePrueba: nombrePrueba,

      especialidad: faker.helpers.arrayElement([
        "Traumatología",
        "Neurología",
        "Cardiología",
        "Oncología",
      ]),

      centroMedico: faker.company.name(),

      documentos: generarDocumentos(nombrePrueba),

      estadoInterno: estado,
      currentDepartment: generarDepartamento(estado),

      historial: generarHistorial(estado),

      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
    });
  }

  return solicitudes;
};

/* =================================
   SEED
================================= */

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");

    await Solicitud.deleteMany({});
    console.log("Base de datos limpiada");

    const solicitudes = generarSolicitudes(500);

    await Solicitud.insertMany(solicitudes);
    console.log("Solicitudes generadas correctamente");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
