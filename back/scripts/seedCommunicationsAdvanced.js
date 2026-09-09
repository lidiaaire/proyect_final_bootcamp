require("dotenv").config();
const mongoose = require("mongoose");

// El fichero real está mal escrito ("comunicationModel", sin la
// segunda "m") -- este seed apuntaba a "communicationModel" (correcto
// ortográficamente pero inexistente), lo que rompía `npm run seed` con
// MODULE_NOT_FOUND. Se corrige la ruta sin renombrar el modelo
// (fuera de alcance de este paso; no lo usa nada más que este seed).
const Communication = require("../src/models/comunicationModel");

// 🔹 CANALES
const channels = [
  "Avisos Oficiales",
  "Prestaciones",
  "Dirección Médica",
  "Asesoría Jurídica",
  "General",
];

// 🔹 AUTORES
const users = [
  { name: "Dirección", role: "Corporativo" },
  { name: "Laura Gómez", role: "Prestaciones" },
  { name: "Carlos Méndez", role: "Prestaciones" },
  { name: "Dra. Marta Ruiz", role: "Dirección Médica" },
  { name: "Luis Herrera", role: "Asesoría Jurídica" },
];

// 🔹 CONTENIDO BASE
const baseContent = {
  "Avisos Oficiales": [
    {
      titulo: "Nueva normativa",
      contenido: "Actualización normativa",
      tipo: "normativa",
    },
  ],
  Prestaciones: [
    {
      titulo: "Cambio documental",
      contenido: "Nuevo requisito",
      tipo: "actualizacion",
    },
  ],
  "Dirección Médica": [
    { titulo: "Protocolos", contenido: "Nuevos criterios", tipo: "protocolo" },
  ],
  "Asesoría Jurídica": [
    { titulo: "Cobertura", contenido: "Cambios legales", tipo: "legal" },
  ],
  General: [
    {
      titulo: "Uso plataforma",
      contenido: "Buenas prácticas",
      tipo: "informativo",
    },
  ],
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedCommunications() {
  try {
    await Communication.deleteMany();

    const communications = [];

    channels.forEach((channel) => {
      for (let i = 0; i < 20; i++) {
        const content = randomItem(baseContent[channel]);
        const author = randomItem(users);

        communications.push({
          canal: channel,
          titulo: content.titulo,
          contenido: content.contenido,
          tipo: content.tipo,
          autor: author.name,
          departamento: author.role,
          createdAt: new Date(),
        });
      }
    });

    await Communication.insertMany(communications);

    console.log("Communications creadas:", communications.length);
  } catch (error) {
    console.error("Error en seedCommunications:", error);
    throw error;
  }
}

module.exports = seedCommunications;
