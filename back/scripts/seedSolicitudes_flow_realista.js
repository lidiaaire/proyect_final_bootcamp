require("dotenv").config();
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");
const Policyholder = require("../src/models/policyholderModel").default;

async function seedSolicitudes() {
  try {
    await Solicitud.deleteMany();

    const policyholders = await Policyholder.find();

    if (!policyholders.length) {
      throw new Error("No hay policyholders. Ejecuta primero ese seed.");
    }

    const solicitudes = [];

    for (let i = 0; i < 100; i++) {
      const ph =
        policyholders[Math.floor(Math.random() * policyholders.length)];

      solicitudes.push({
        numeroSolicitud: "SOL-" + faker.number.int({ min: 1000, max: 9999 }),
        nombreCompleto: ph.name,
        numeroPoliza: ph.id,
        dni: ph.dni,
        nombrePrueba: "TAC",
        especialidad: "Radiología",
        centroMedico: "Hospital Central",
        estadoInterno: "PENDIENTE_INICIO_GESTION",
        currentDepartment: "PRESTACIONES",
        documentos: [],
        historial: [],
        notas: [],
      });
    }

    await Solicitud.insertMany(solicitudes);
    console.log("Solicitudes creadas:", solicitudes.length);
  } catch (error) {
    console.error("Error en seedSolicitudes:", error);
    throw error;
  }
}

module.exports = seedSolicitudes;
