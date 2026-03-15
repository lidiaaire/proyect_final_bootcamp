require("dotenv").config();
const mongoose = require("mongoose");
const Policyholder = require("../src/models/policyholderModel");

const names = [
  "Juan Pérez",
  "María López",
  "Carlos Sánchez",
  "Ana Torres",
  "Lucía Ruiz",
  "David Gómez",
  "Laura Martín",
  "Javier Moreno",
  "Sara Navarro",
  "Pedro Díaz",
];

function generateDNI() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function seedPolicyholders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo conectado");

    await Policyholder.deleteMany({});
    console.log("Policyholders eliminados");

    const policyholders = [];

    for (let i = 0; i < 100; i++) {
      const numeroPoliza = (823000 + i).toString();

      const name = names[Math.floor(Math.random() * names.length)];

      policyholders.push({
        id: numeroPoliza,
        name,
        dni: generateDNI(),
        internalNotes: [],
      });
    }

    await Policyholder.insertMany(policyholders);

    console.log("Policyholders creados:", policyholders.length);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedPolicyholders();
