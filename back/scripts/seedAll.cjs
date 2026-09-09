// Punto de entrada ÚNICO del seed general ("npm run seed").
// Pipeline: Usuarios -> Policyholders -> Solicitudes -> Documentos
// clínicos -> Communications. Solicitudes depende de que Policyholders
// ya exista (usa esos asegurados reales); Documentos clínicos depende
// de que Solicitudes ya exista (genera PDFs reales y los asocia a
// Solicitud.documentos[]); Communications es independiente.
//
// NOTA: antes de este cambio este fichero requería "./seedSolicitudes",
// un módulo que no existía (solo existía seedSolicitudes_flow_realista.js,
// desconectado del pipeline) -- `npm run seed` fallaba con
// MODULE_NOT_FOUND. Se ha resuelto creando scripts/seedSolicitudes.js.

require("dotenv").config();
const mongoose = require("mongoose");

const seedUsers = require("./seedUsers");
const seedPolicyholders = require("./seedPolicyholders");
const seedSolicitudes = require("./seedSolicitudes");
const seedDocumentosClinicos = require("./seedDocumentosClinicos");
const seedCommunications = require("./seedCommunicationsAdvanced");

async function runSeeds() {
  try {
    console.log("🌱 Iniciando seeds...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo conectado");

    await seedUsers();
    await seedPolicyholders();
    await seedSolicitudes();
    await seedDocumentosClinicos();
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
