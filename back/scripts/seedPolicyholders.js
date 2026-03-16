require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Policyholder = require("../src/models/policyholderModel");

const MONGO_URI = process.env.MONGO_URI;

/*
  CONTRATO RESPETADO (NO CAMBIAR):
  Policyholder {
    id: String (numero de póliza)
    name: String
    dni: String
    internalNotes: [
      { text, author, date }
    ]
  }
*/

function generateSpanishDNI() {
  const number = faker.number.int({ min: 10000000, max: 99999999 });
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  const letter = letters[number % 23];
  return `${number}${letter}`;
}

function generatePolicyNumber(index) {
  return `POL-${1000 + index}`;
}

function generateInternalNotes() {
  const totalNotes = faker.number.int({ min: 1, max: 3 });
  const notes = [];

  for (let i = 0; i < totalNotes; i++) {
    const yearsAgo = faker.number.int({ min: 1, max: 8 });

    notes.push({
      text: faker.helpers.arrayElement([
        "Cliente con historial estable.",
        "Se solicita seguimiento administrativo.",
        "Revisión documental realizada correctamente.",
        "Cliente contactado para actualización de datos.",
        "Incidencia leve resuelta por soporte.",
        "Cliente con larga antigüedad en la compañía.",
      ]),
      author: faker.helpers.arrayElement([
        "ADMIN",
        "SOPORTE",
        "SISTEMA",
        "VALIDACION",
      ]),
      date: faker.date.past({ years: yearsAgo }),
    });
  }

  return notes;
}

async function seedPolicyholders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo conectado");

    await Policyholder.deleteMany({});
    console.log("Policyholders eliminados");

    const totalPolicyholders = 120;

    const policyholders = [];

    for (let i = 0; i < totalPolicyholders; i++) {
      const policyholder = {
        id: generatePolicyNumber(i),
        name: faker.person.fullName(),
        dni: generateSpanishDNI(),
        internalNotes: generateInternalNotes(),
      };

      policyholders.push(policyholder);
    }

    await Policyholder.insertMany(policyholders);

    console.log("Policyholders generados:", policyholders.length);

    await mongoose.disconnect();
    console.log("Mongo desconectado");
  } catch (error) {
    console.error("Error generando policyholders:", error);
    process.exit(1);
  }
}

seedPolicyholders();
