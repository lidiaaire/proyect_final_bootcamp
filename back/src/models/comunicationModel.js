const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema({
  canal: String,
  titulo: String,
  contenido: String,
  tipo: String,
  autor: String,
  departamento: String,
  createdAt: Date,
});

module.exports = mongoose.model("Communication", communicationSchema);
