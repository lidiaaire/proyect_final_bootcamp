// Seed de comunicaciones tipo comunicados corporativos (Flowly - CORREGIDO)

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "flowly";

// 🔹 CANALES (deben coincidir con controller)
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
  { name: "Ana Beltrán", role: "Prestaciones" },
  { name: "Pedro Ruiz", role: "Prestaciones" },
  { name: "Dra. Marta Ruiz", role: "Dirección Médica" },
  { name: "Dr. Javier López", role: "Dirección Médica" },
  { name: "Dra. Elena Torres", role: "Dirección Médica" },
  { name: "Luis Herrera", role: "Asesoría Jurídica" },
  { name: "Lucía Torres", role: "Asesoría Jurídica" },
];

// 🔹 CONTENIDO BASE
const channelCommunications = {
  "Avisos Oficiales": [
    {
      titulo: "Nueva normativa en pruebas de alta complejidad",
      contenido:
        "Será obligatorio adjuntar informe clínico detallado en pruebas de alta complejidad.",
      tipo: "normativa",
    },
    {
      titulo: "Nuevo acuerdo hospitalario",
      contenido:
        "Acuerdo con Hospital San Juan para reducir tiempos de autorización.",
      tipo: "acuerdo",
    },
  ],

  Prestaciones: [
    {
      titulo: "Cambio en validación documental",
      contenido: "Se requiere copia certificada antes de revisión médica.",
      tipo: "actualizacion",
    },
    {
      titulo: "Campo obligatorio en solicitudes",
      contenido: "Centro Médico pasa a ser obligatorio.",
      tipo: "implementacion",
    },
  ],

  "Dirección Médica": [
    {
      titulo: "Actualización protocolos",
      contenido: "Nuevos criterios para intervenciones quirúrgicas.",
      tipo: "protocolo",
    },
    {
      titulo: "Nuevo criterio TAC",
      contenido: "Requiere informe previo del especialista.",
      tipo: "criterio",
    },
  ],

  "Asesoría Jurídica": [
    {
      titulo: "Normativa en rechazos",
      contenido: "Debe incluir justificación legal documentada.",
      tipo: "legal",
    },
    {
      titulo: "Cobertura internacional",
      contenido: "Actualización de condiciones fuera del país.",
      tipo: "legal",
    },
  ],

  General: [
    {
      titulo: "Uso de la plataforma",
      contenido: "Mantener expedientes actualizados diariamente.",
      tipo: "informativo",
    },
    {
      titulo: "Mejora de tiempos",
      contenido: "Reducción del 15% en autorizaciones.",
      tipo: "informativo",
    },
  ],
};

// 🔹 UTIL
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔹 GENERADOR
function generateCommunications() {
  const communications = [];

  channels.forEach((channel) => {
    const base = channelCommunications[channel];

    for (let i = 0; i < 20; i++) {
      const comm = randomItem(base);

      const possibleAuthors = users.filter((u) =>
        channel.includes(u.role.split(" ")[0]),
      );

      const author =
        possibleAuthors.length > 0
          ? randomItem(possibleAuthors)
          : randomItem(users);

      communications.push({
        canal: channel, // 🔒 DEBE coincidir con controller
        titulo: comm.titulo,
        contenido: comm.contenido,
        tipo: comm.tipo,
        autor: author.name,
        departamento: author.role,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000000000),
        ),
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

    const db = client.db(DB_NAME);
    const collection = db.collection("communications");

    console.log("🧹 Limpiando colección communications...");
    await collection.deleteMany({});

    const communications = generateCommunications();

    const result = await collection.insertMany(communications);

    console.log("✅ Seed completado");
    console.log("📦 Documentos insertados:", result.insertedCount);
  } catch (err) {
    console.error("❌ Error en seed:", err);
  } finally {
    await client.close();
  }
}

seed();
