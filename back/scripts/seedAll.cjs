require("dotenv").config();
const mongoose = require("mongoose");

const seedUsers = require("./seedUsers");
const seedPolicyholders = require("./seedPolicyholders");
const seedSolicitudes = require("./seedSolicitudes");
const seedCommunications = require("./seedCommunicationsAdvanced");

async function runSeeds() {
  try {
    console.log("🌱 Iniciando seeds...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado");

    await seedUsers();
    await seedPolicyholders();
    await seedSolicitudes();
    await seedCommunications();

    await mongoose.disconnect();
    console.log("Mongo desconectado");

    console.log("✅ Seeds completados");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

runSeeds();
