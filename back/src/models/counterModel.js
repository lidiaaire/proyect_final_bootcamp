// Contador atómico de propósito general (patrón estándar en MongoDB para
// generar identificadores legibles sin colisiones, ya que Mongo no tiene
// autoincremento nativo). Un único documento por "nombre" de secuencia;
// hoy solo se usa "solicitud" (ver core/numeroSolicitud.js).

const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
