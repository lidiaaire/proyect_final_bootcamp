require("dotenv").config();
const mongoose = require("mongoose");

const Communication = mongoose.model(
  "Communication",
  new mongoose.Schema({}, { strict: false }),
);

async function seedCommunications() {
  try {
    await Communication.deleteMany();

    const communications = [];

    for (let i = 0; i < 20; i++) {
      communications.push({
        canal: "Prestaciones",
        titulo: "Comunicado " + i,
        contenido: "Contenido de prueba",
        tipo: "informativo",
        autor: "Sistema",
        createdAt: new Date(),
      });
    }

    await Communication.insertMany(communications);
    console.log("Communications creadas:", communications.length);
  } catch (error) {
    console.error("Error en seedCommunications:", error);
    throw error;
  }
}

module.exports = seedCommunications;
