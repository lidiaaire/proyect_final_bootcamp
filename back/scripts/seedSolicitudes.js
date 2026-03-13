require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");

const MONGO_URI = process.env.MONGO_URI;

async function seedSolicitudes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo conectado");

    // limpiar colección
    await Solicitud.deleteMany({});
    console.log("Solicitudes eliminadas");

    const solicitudes = [];

    for (let i = 0; i < 500; i++) {
      const solicitud = new Solicitud({
        numeroSolicitud: `SOL-${1000 + i}`,

        nombreCompleto: faker.person.fullName(),
        numeroPoliza: faker.number
          .int({ min: 10000000, max: 99999999 })
          .toString(),
        dni: faker.string.alphanumeric(8).toUpperCase(),

        nombrePrueba: faker.helpers.arrayElement([
          "TAC",
          "Resonancia Magnética",
          "Ecografía",
          "Radiografía",
        ]),

        especialidad: faker.helpers.arrayElement([
          "Cardiología",
          "Traumatología",
          "Neurología",
          "Oncología",
        ]),

        centroMedico: faker.company.name(),

        estadoInterno: "PENDIENTE_INICIO_GESTION",
        currentDepartment: "PRESTACIONES",
        lastTechnicalDepartment: null,

        documentos: [
          {
            nombre: "informe_medico.pdf",
            tipo: "informe_medico",
            subidoPor: "ASEGURADO",
          },
          {
            nombre: "prescripcion_medica.pdf",
            tipo: "prescripcion_medica",
            subidoPor: "ASEGURADO",
          },
          {
            nombre: "historia_clinica.pdf",
            tipo: "historia_clinica",
            subidoPor: "ASEGURADO",
          },
        ],

        // HISTORIAL LIMPIO Y COHERENTE
        historial: [
          {
            estado: "PENDIENTE_INICIO_GESTION",
            changedBy: "PRESTACIONES",
            fecha: new Date(),
            tipo: "CREACION",
          },
        ],
      });

      solicitudes.push(solicitud);
    }

    await Solicitud.insertMany(solicitudes);

    console.log("500 solicitudes generadas correctamente");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedSolicitudes();
