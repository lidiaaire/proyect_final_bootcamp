// Generación del identificador legible de una Solicitud (formato
// "SOL-XXXX", ya usado por los datos de demo).
//
// DECISIÓN DE DISEÑO (Sprint 1C):
// Los scripts de seed generaban este número con
// `faker.number.int({ min: 1000, max: 9999 })` sin comprobar unicidad:
// vulnerable a colisión (9000 valores posibles repartidos entre cientos
// de documentos) y, si se hiciera "contar documentos + 1", vulnerable
// además a condiciones de carrera entre peticiones concurrentes y a huecos
// por borrados.
//
// Se usa en su lugar un contador atómico en Mongo
// (findOneAndUpdate + $inc, ver models/counterModel.js): una sola
// operación, atómica a nivel de base de datos, sin necesidad de
// transacciones ni reintentos. Es la forma estándar de conseguir un
// autoincremento fiable en MongoDB.
//
// Para no tener que comprobar contra los ~300 numeroSolicitud ya
// existentes (aleatorios, 4 dígitos, rango 1000-9999), los generados por
// esta función arrancan en 10000: por construcción nunca coinciden en
// longitud ni en valor con ninguno de los antiguos, así que no hace
// falta ninguna consulta adicional de unicidad.

const Counter = require("../models/counterModel");

const BASE = 10000;

async function generarNumeroSolicitud() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "solicitud" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `SOL-${BASE + counter.seq}`;
}

module.exports = { generarNumeroSolicitud };
