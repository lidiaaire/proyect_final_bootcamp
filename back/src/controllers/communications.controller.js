const mongoose = require("mongoose");
require("dotenv").config();

// Antes cada petición abría (`new MongoClient(uri); await client.connect()`)
// y cerraba su propia conexión a MongoDB Atlas -- una negociación TLS
// completa por cada carga de canal, en vez de reutilizar la conexión de
// Mongoose que la app ya mantiene abierta desde el arranque
// (configuration/db.js). Con 5 canales cargando en paralelo desde
// /comunicaciones (recuento de mensajes) más la navegación a un canal,
// esto podía tardar varios segundos o fallar de forma intermitente --
// causa real del bug "no puedo entrar en ningún canal". Se usa
// `mongoose.connection.db`, el mismo handle nativo de la conexión ya
// abierta, sin cambiar la forma de las consultas.

const channelMap = {
  "avisos-oficiales": "Avisos Oficiales",
  prestaciones: "Prestaciones",
  "direccion-medica": "Dirección Médica",
  "asesoria-juridica": "Asesoría Jurídica",
  general: "General",
};

async function getMessages(req, res) {
  try {
    const { channel } = req.params;

    // 🔹 Mapear slug → nombre real
    const canalReal = channelMap[channel];

    if (!canalReal) {
      return res.status(400).json({ error: "Canal no válido" });
    }

    const db = mongoose.connection.db;

    const communications = await db
      .collection("communications")
      .find({ canal: canalReal }) // 🔥 CAMBIO CLAVE
      .sort({ createdAt: -1 }) // 🔥 más reciente primero
      .toArray();

    res.json(communications);
  } catch (error) {
    console.error("ERROR LOADING COMMUNICATIONS:", error);
    res.status(500).json({ error: "Error loading communications" });
  }
}

async function sendMessage(req, res) {
  try {
    const db = mongoose.connection.db;

    const newCommunication = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db
      .collection("communications")
      .insertOne(newCommunication);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error sending communication" });
  }
}

module.exports = {
  getMessages,
  sendMessage,
};
