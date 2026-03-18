const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;

const channelMap = {
  "avisos-oficiales": "Avisos Oficiales",
  prestaciones: "Prestaciones",
  "direccion-medica": "Dirección Médica",
  "asesoria-juridica": "Asesoría Jurídica",
  general: "General",
};

async function getMessages(req, res) {
  let client;

  try {
    const { channel } = req.params;

    // 🔹 Mapear slug → nombre real
    const canalReal = channelMap[channel];

    if (!canalReal) {
      return res.status(400).json({ error: "Canal no válido" });
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    const communications = await db
      .collection("communications")
      .find({ canal: canalReal }) // 🔥 CAMBIO CLAVE
      .sort({ createdAt: -1 }) // 🔥 más reciente primero
      .toArray();

    res.json(communications);
  } catch (error) {
    console.error("ERROR LOADING COMMUNICATIONS:", error);
    res.status(500).json({ error: "Error loading communications" });
  } finally {
    if (client) await client.close();
  }
}

async function sendMessage(req, res) {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

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
  } finally {
    if (client) await client.close();
  }
}

module.exports = {
  getMessages,
  sendMessage,
};
