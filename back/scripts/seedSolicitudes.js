const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");
require("dotenv").config();

const estadosDistribucion = [
  "PENDIENTE_INICIO_GESTION",
  "PENDIENTE_DIRECCION_MEDICA",
  "PENDIENTE_ASESORIA_JURIDICA",
  "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
  "PENDIENTE_REVISION_PRESTACIONES",
  "AUTORIZADA",
  "RECHAZADA",
];

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

const generarSolicitudes = (cantidad) => {
  const solicitudes = [];

  for (let i = 0; i < cantidad; i++) {
    const estado = generarEstadoRealista();

    solicitudes.push({
      numeroSolicitud: `SOL-${faker.string.uuid()}`,
      nombreCompleto: faker.person.fullName(),
      numeroPoliza: faker.finance.accountNumber(8),
      dni: faker.string.alphanumeric(8).toUpperCase(),
      nombrePrueba: faker.helpers.arrayElement([
        "Resonancia Magnética",
        "TAC",
        "Ecografía",
        "Radiografía",
        "Prueba genética",
      ]),
      especialidad: faker.helpers.arrayElement([
        "Traumatología",
        "Neurología",
        "Cardiología",
        "Oncología",
      ]),
      centroMedico: faker.company.name(),
      informeMedico: "informe.pdf",
      volanteMedico: "volante.pdf",
      estadoInterno: estado,
      currentDepartment: generarDepartamento(estado),
      historial: [
        {
          estado,
          changedBy: "seed-script",
          fecha: faker.date.past(),
        },
      ],
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
  }

  return solicitudes;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");

    await Solicitud.deleteMany({});
    console.log("Base de datos limpiada");

    const solicitudes = generarSolicitudes(80);

    await Solicitud.insertMany(solicitudes);
    console.log("Solicitudes generadas correctamente");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
