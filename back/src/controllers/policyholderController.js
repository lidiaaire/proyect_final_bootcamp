// Este archivo contiene los controladores para las rutas de policyholders (obtener todos los policyholders y obtener un policyholder por ID).
// Aquí se manejan las solicitudes entrantes, se validan los datos y se llaman a los servicios correspondientes para realizar la lógica de negocio relacionada con los policyholders.

const {
  getAllPolicyholders,
  getPolicyholderById: _getPolicyholderById,
} = require("../services/policyholderService");

/* ==============================
GET /policyholders
============================== */

async function getPolicyholders(req, res) {
  try {
    const policyholders = await getAllPolicyholders();
    res.json(policyholders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching policyholders" });
  }
}

/* ==============================
GET /policyholders/:id
============================== */

async function getPolicyholderById(req, res) {
  try {
    const policyholder = await _getPolicyholderById(req.params.id);

    if (!policyholder) {
      return res.status(404).json({ error: "Policyholder not found" });
    }

    res.json(policyholder);
  } catch (error) {
    res.status(500).json({ error: "Error fetching policyholder" });
  }
}

module.exports = {
  getPolicyholders,
  getPolicyholderById,
};
