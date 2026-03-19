const seedUsers = require("./seedUsers");
const seedPolicyholders = require("./seedPolicyholders");
const seedSolicitudes = require("./seedSolicitudes_flow_realista");
const seedCommunications = require("./seedCommunicationsAdvanced");

async function runSeeds() {
  try {
    console.log("🌱 Iniciando seeds...");

    await seedUsers();
    await seedPolicyholders();
    await seedSolicitudes();
    await seedCommunications();

    console.log("✅ Todos los seeds ejecutados correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error ejecutando seeds:", error);
    process.exit(1);
  }
}

runSeeds();
