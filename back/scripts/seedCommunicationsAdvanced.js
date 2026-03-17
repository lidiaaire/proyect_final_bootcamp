// Este script genera mensajes de comunicación más realistas y variados para la colección "communications".

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "flowly";

const channels = [
  "Avisos Oficiales",
  "Prestaciones",
  "Dirección Médica",
  "Asesoría Jurídica",
  "General",
];

const users = [
  { name: "Laura Gómez", role: "Prestaciones", avatar: "LG" },
  { name: "Carlos Méndez", role: "Prestaciones", avatar: "CM" },
  { name: "Dra. Marta Ruiz", role: "Dirección Médica", avatar: "MR" },
  { name: "Luis Herrera", role: "Asesoría Jurídica", avatar: "LH" },
  { name: "Ana Beltrán", role: "Prestaciones", avatar: "AB" },
];

const systemMessages = [
  "Solicitud SOL-4821 enviada a revisión médica.",
  "Solicitud SOL-3992 marcada como DOCUMENTACION_SOLICITADA.",
  "Solicitud SOL-5021 autorizada por Dirección Médica.",
  "Nueva prueba diagnóstica añadida al catálogo.",
  "Actualización del protocolo de autorizaciones.",
];

const normalMessages = [
  "Revisad por favor este caso cuando tengáis un momento.",
  "He actualizado la documentación en el expediente.",
  "¿Tenemos informe clínico para este caso?",
  "El hospital ha enviado el informe adicional.",
  "Este caso necesita revisión médica.",
  "Creo que ya podemos autorizar esta prueba.",
  "¿Alguien puede revisar esta solicitud hoy?",
  "He dejado notas internas en el expediente.",
  "Confirmado, procedemos con la autorización.",
  "Falta documentación del especialista.",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTime() {
  const h = Math.floor(Math.random() * 9) + 8;
  const m = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateMessages(count = 80) {
  const messages = [];

  for (let i = 0; i < count; i++) {
    const channel = randomItem(channels);

    let message;

    if (Math.random() < 0.2) {
      message = {
        channel,
        user: "Sistema",
        role: "Sistema",
        avatar: "SY",
        text: randomItem(systemMessages),
        time: randomTime(),
      };
    } else {
      const user = randomItem(users);

      message = {
        channel,
        user: user.name,
        role: user.role,
        avatar: user.avatar,
        text: randomItem(normalMessages),
        time: randomTime(),
      };
    }

    messages.push({
      ...message,
      createdAt: new Date(),
    });
  }

  return messages;
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("autorizaciones_db");

    const collection = db.collection("communications");

    console.log("Limpiando colección communications...");
    await collection.deleteMany({});

    const messages = generateMessages(80);

    await collection.insertMany(messages);

    console.log("Seed avanzado completado.");
    console.log("Mensajes creados:", messages.length);
  } catch (err) {
    console.error("Error ejecutando seed:", err);
  } finally {
    await client.close();
  }
}

seed();
