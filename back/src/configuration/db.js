// Este archivo se encarga de establecer la conexión con la base de datos MongoDB utilizando Mongoose.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};
console.log("MONGO URI SEED:", process.env.MONGO_URI);
module.exports = connectDB;
