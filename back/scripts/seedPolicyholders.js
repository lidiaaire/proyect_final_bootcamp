require("dotenv").config();
const { faker } = require("@faker-js/faker");
const Policyholder = require("../src/models/policyholderModel").default;

const POLICY_TYPES = [
  "POLIZA PRIVADA",
  "POLIZA COLECTIVO",
  "POLIZA FUNCIONARIO",
];

async function seedPolicyholders() {
  try {
    await Policyholder.deleteMany();

    const policyholders = [];

    for (let i = 0; i < 100; i++) {
      const notesCount = faker.number.int({ min: 2, max: 3 });

      const notes = Array.from({ length: notesCount }, () => ({
        text: faker.helpers.arrayElement([
          "Paciente con historial de pruebas recurrentes",
          "Revisión médica recomendada cada 6 meses",
          "Caso previamente autorizado sin incidencias",
          "Seguimiento activo por parte de prestaciones",
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
  } catch (error) {
    console.error("Error en seedPolicyholders:", error);
    throw error;
  }
}

module.exports = seedPolicyholders;
