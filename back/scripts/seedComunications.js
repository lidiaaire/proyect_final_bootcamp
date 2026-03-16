const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "flowly";

const seedMessages = [
  {
    channel: "Avisos Oficiales",
    user: "Dra. Marta Ruiz",
    role: "Dirección Médica",
    avatar: "MR",
    text: "Nueva indicación: a partir del 15 de abril las resonancias lumbares requieren informe previo del especialista.",
    time: "10:30",
  },
  {
    channel: "Prestaciones",
    user: "Carlos Méndez",
    role: "Prestaciones",
    avatar: "CM",
    text: "Actualizado el procedimiento en el sistema de autorizaciones.",
    time: "11:20",
  },
  {
    channel: "Prestaciones",
    user: "Laura Gómez",
    role: "Prestaciones",
    avatar: "LG",
    text: "Recordad revisar los casos pendientes de TAC abdominal esta semana.",
    time: "12:05",
  },
  {
    channel: "Dirección Médica",
    user: "Dra. Marta Ruiz",
    role: "Dirección Médica",
    avatar: "MR",
    text: "Reunión breve a las 15:00 para revisar nuevos criterios de autorización.",
    time: "09:10",
  },
  {
    channel: "Asesoría Jurídica",
    user: "Luis Herrera",
    role: "Asesoría Jurídica",
    avatar: "LH",
    text: "Recordatorio: consentimiento informado obligatorio para cirugías bariátricas.",
    time: "11:05",
  },
  {
    channel: "General",
    user: "Sistema",
    role: "Sistema",
    avatar: "SY",
    text: "Nueva prueba diagnóstica aprobada y añadida al catálogo.",
    time: "08:45",
  },
  {
    channel: "Dirección Médica",
    user: "Sistema",
    role: "Sistema",
    avatar: "SY",
    text: "Solicitud SOL-4821 enviada a revisión médica.",
    time: "13:10",
  },
  {
    channel: "Prestaciones",
    user: "Sistema",
    role: "Sistema",
    avatar: "SY",
    text: "Solicitud SOL-3920 marcada como DOCUMENTACION_SOLICITADA.",
    time: "14:22",
  },
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("communications");

    console.log("Limpiando colección communications...");
    await collection.deleteMany({});

    const documents = seedMessages.map((m) => ({
      ...m,
      createdAt: new Date(),
    }));

    await collection.insertMany(documents);

    console.log("Seed de comunicaciones insertado correctamente.");
    console.log("Mensajes creados:", documents.length);
  } catch (error) {
    console.error("Error ejecutando seed:", error);
  } finally {
    await client.close();
  }
}

seed();
