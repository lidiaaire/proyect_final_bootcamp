require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const Policyholder = require("../src/models/policyholderModel").default;

const POLICY_TYPES = [
  "POLIZA PRIVADA",
  "POLIZA COLECTIVO",
  "POLIZA FUNCIONARIO",
];

async function seedPolicyholders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado");

    await Policyholder.deleteMany({});
    console.log("Policyholders eliminados");

    const policyholders = [];

    for (let i = 0; i < 100; i++) {
      // 🔹 Generar entre 2 y 3 notas
      const notesCount = faker.number.int({ min: 2, max: 3 });

      const notes = Array.from({ length: notesCount }, () => ({
        text: faker.helpers.arrayElement([
          "Paciente con historial de pruebas recurrentes",
          "Revisión médica recomendada cada 6 meses",
          "Caso previamente autorizado sin incidencias",
          "Seguimiento activo por parte de prestaciones",
          "Paciente con patología crónica en seguimiento",
          "Se recomienda valoración por especialista",
          "Historial clínico con múltiples autorizaciones previas",
          "Caso derivado a dirección médica para revisión",
          "Pendiente de actualización de informes médicos",
          "Paciente con buena adherencia al tratamiento",
          "Sin incidencias destacables en revisiones anteriores",
          "Requiere control periódico según protocolo",
          "Caso con documentación completa y validada",
          "Seguimiento recomendado por evolución clínica favorable",
        ]),
        date: faker.date.recent({ days: 30 }),
        author: faker.helpers.arrayElement([
          "PRESTACIONES",
          "ADMIN",
          "DIRECCION_MEDICA",
        ]),
      }));

      policyholders.push({
        id: faker.string.numeric(6),
        name: faker.person.fullName(),
        dni: faker.string.alphanumeric(9),

        telefono: faker.phone.number(),
        email: faker.internet.email(),
        direccion: faker.location.streetAddress(),

        policyType: faker.helpers.arrayElement(POLICY_TYPES),
        policyStartDate: faker.date.past({ years: 10 }),

        internalNotes: notes,
      });
    }

    await Policyholder.insertMany(policyholders);

    console.log("Policyholders creados:", policyholders.length);

    await mongoose.disconnect();
    console.log("Mongo desconectado");
  } catch (error) {
    console.error("Error generando policyholders:", error);
    process.exit(1);
  }
}

seedPolicyholders();
