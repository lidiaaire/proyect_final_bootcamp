// Este archivo contiene la lógica relacionada con los asegurados en la aplicación. Define las funciones getAllPolicyholders, getPolicyholderById y createPolicyholder, que se encargan de obtener la lista de todos los asegurados, obtener la información de un asegurado específico por su ID y crear un nuevo asegurado, respectivamente. Estas funciones interactúan con el modelo de datos de los asegurados para realizar las operaciones necesarias en la base de datos. La función getAllPolicyholders devuelve una lista de todos los asegurados registrados en la aplicación, mientras que getPolicyholderById devuelve la información de un asegurado específico basado en su ID. La función createPolicyholder toma los datos proporcionados para un nuevo asegurado, crea una instancia del modelo de asegurado y guarda esa información en la base de datos. Estas funciones son fundamentales para gestionar la información de los asegurados dentro de la aplicación, lo que es esencial para el manejo de pólizas, solicitudes y otras funcionalidades relacionadas con los asegurados.
// Importamos el modelo de datos de los asegurados para interactuar con la base de datos.

const Policyholder = require("../models/policyholderModel").default;
async function getAllPolicyholders() {
  return Policyholder.find();
}

async function getPolicyholderById(id) {
  return Policyholder.findOne({ id });
}

async function createPolicyholder(data) {
  const policyholder = new Policyholder(data);
  return policyholder.save();
}

module.exports = {
  getAllPolicyholders,
  getPolicyholderById,
  createPolicyholder,
};
