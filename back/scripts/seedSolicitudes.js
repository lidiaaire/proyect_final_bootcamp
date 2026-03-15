require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");

// IMPORTAR MOCKS
const { policyholders } = require("../src/mocks/policyholders");
const { notes } = require("../src/mocks/notes");

const MONGO_URI = process.env.MONGO_URI;

async function seedSolicitudes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo conectado");

    // limpiar colección
    await Solicitud.deleteMany({});
    console.log("Solicitudes eliminadas");

    const solicitudes = [];
    const totalSolicitudes = 500;

    for (let i = 0; i < totalSolicitudes; i++) {
      // asegurado rotativo
      const policyholder = policyholders[i % policyholders.length];

      // en tu mock la póliza es el identificador
      const poliza = String(policyholder.id);

      const policyholderNotes = notes.filter(
        (note) => note.policyholderId === poliza,
      );

      console.log("POLIZA:", poliza, "NOTAS:", policyholderNotes.length);
      const solicitud = new Solicitud({
        numeroSolicitud: `SOL-${1000 + i}`,

        nombreCompleto: policyholder.name,

        numeroPoliza: poliza,

        dni: policyholder.dni,

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

        notas: policyholderNotes.map((note) => ({
          text: note.text,
          author: note.author,
          date: new Date(note.date),
        })),

        historial: [
          {
            estado: "PENDIENTE_INICIO_GESTION",
            changedBy: "PRESTACIONES",
            fecha: new Date(),
            tipo: "CREACION",
            documentosSolicitados: [],
          },
        ],
      });
      solicitudes.push(solicitud);
    }

    await Solicitud.insertMany(solicitudes);

    console.log("500 solicitudes generadas correctamente con notas");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedSolicitudes();
