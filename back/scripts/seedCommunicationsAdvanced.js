// Este script genera comunicados de prueba para cada canal definido, con autores realistas y contenido relevante para cada departamento. Asegúrate de tener la colección "communications" vacía antes de ejecutar este seed para evitar duplicados.
// Para ejecutar: node back/scripts/seedCommunicationsAdvanced.js

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";

// 🔹 CANALES
const channels = [
  "Avisos Oficiales",
  "Prestaciones",
  "Dirección Médica",
  "Asesoría Jurídica",
  "General",
];

// 🔹 AUTORES (más realista)
const users = [
  { name: "Dirección", role: "Corporativo" },
  { name: "Laura Gómez", role: "Prestaciones" },
  { name: "Carlos Méndez", role: "Prestaciones" },
  { name: "Ana Beltrán", role: "Prestaciones" },
  { name: "Pedro Ruiz", role: "Prestaciones" },
  { name: "Dra. Marta Ruiz", role: "Dirección Médica" },
  { name: "Dr. Javier López", role: "Dirección Médica" },
  { name: "Dra. Elena Torres", role: "Dirección Médica" },
  { name: "Luis Herrera", role: "Asesoría Jurídica" },
  { name: "Lucía Torres", role: "Asesoría Jurídica" },
];

// 🔹 COMUNICADOS POR CANAL (estructura real)
const channelCommunications = {
  "Avisos Oficiales": [
    {
      titulo: "Nueva normativa en pruebas de alta complejidad",
      contenido:
        "A partir del próximo mes será obligatorio adjuntar informe clínico detallado en todas las solicitudes de pruebas de alta complejidad. Esta medida busca mejorar la validación médica previa.",
      tipo: "normativa",
    },
    {
      titulo: "Nuevo acuerdo con Hospital San Juan",
      contenido:
        "Se ha firmado un acuerdo estratégico con el Hospital San Juan para reducir los tiempos de autorización en pruebas diagnósticas.",
      tipo: "acuerdo",
    },
  ],

  Prestaciones: [
    {
      titulo: "Cambio en la validación documental",
      contenido:
        "Todos los expedientes deberán incluir copia certificada del documento original antes de avanzar a revisión médica.",
      tipo: "actualizacion",
    },
    {
      titulo: "Nuevo campo obligatorio en solicitudes",
      contenido:
        "Se incorpora el campo 'Centro Médico' como obligatorio en todas las nuevas solicitudes.",
      tipo: "implementacion",
    },
  ],

  "Dirección Médica": [
    {
      titulo: "Actualización de protocolos quirúrgicos",
      contenido:
        "Se han actualizado los protocolos de autorización para intervenciones quirúrgicas, priorizando casos oncológicos.",
      tipo: "protocolo",
    },
    {
      titulo: "Nuevo criterio en pruebas TAC",
      contenido:
        "Todas las solicitudes de TAC deberán incluir informe previo del especialista para su validación.",
      tipo: "criterio",
    },
  ],

  "Asesoría Jurídica": [
    {
      titulo: "Nueva normativa en rechazos",
      contenido:
        "Todos los rechazos deberán incluir justificación legal documentada para evitar posibles reclamaciones.",
      tipo: "legal",
    },
    {
      titulo: "Cobertura internacional actualizada",
      contenido:
        "Se actualizan las condiciones de cobertura para pruebas realizadas fuera del territorio nacional.",
      tipo: "legal",
    },
  ],

  General: [
    {
      titulo: "Recordatorio de uso de la plataforma",
      contenido:
        "Se recuerda a todos los usuarios la importancia de mantener los expedientes actualizados y revisar diariamente las solicitudes asignadas.",
      tipo: "informativo",
    },
    {
      titulo: "Mejora en tiempos de gestión",
      contenido:
        "Se han reducido los tiempos medios de autorización en un 15% durante el último mes.",
      tipo: "informativo",
    },
  ],
};

// 🔹 UTILIDAD
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔹 GENERADOR DE COMUNICADOS
function generateCommunications() {
  const communications = [];

  channels.forEach((channel) => {
    const baseCommunications = channelCommunications[channel];

    for (let i = 0; i < 20; i++) {
      const comm = randomItem(baseCommunications);

      const possibleAuthors = users.filter((u) =>
        channel.includes(u.role.split(" ")[0]),
      );

      const author =
        possibleAuthors.length > 0
          ? randomItem(possibleAuthors)
          : randomItem(users);

      communications.push({
        canal: channel,
        titulo: comm.titulo,
        contenido: comm.contenido,
        tipo: comm.tipo,
        autor: author.name,
        departamento: author.role,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000000000),
        ), // 🔥 fechas distintas
      });
    }
  });

  return communications;
}
// 🔹 SEED
async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("autorizaciones_db");
    const collection = db.collection("communications");

    console.log("Limpiando colección communications...");
    await collection.deleteMany({});

    const communications = generateCommunications();

    await collection.insertMany(communications);

    console.log("Seed de comunicados completado.");
    console.log("Comunicados creados:", communications.length);
  } catch (err) {
    console.error("Error ejecutando seed:", err);
  } finally {
    await client.close();
  }
}

seed();
