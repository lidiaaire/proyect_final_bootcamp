const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;

async function getMessages(req, res) {
  try {
    const { channel } = req.params;

    const client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const messages = await db
      .collection("communications")
      .find({ channel })
      .sort({ createdAt: 1 })
      .toArray();

    await client.close();

    res.json(messages);
  } catch (error) {
    console.error("ERROR LOADING MESSAGES:", error);
    res.status(500).json({ error: "Error loading messages" });
  }
}

async function sendMessage(req, res) {
  try {
    const client = new MongoClient(uri);

    await client.connect();

    const db = client.db();

    const newMessage = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection("communications").insertOne(newMessage);

    await client.close();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
}

module.exports = {
  getMessages,
  sendMessage,
};
