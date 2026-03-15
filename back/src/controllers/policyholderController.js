const {
  getAllPolicyholders,
  getPolicyholderById: _getPolicyholderById,
} = require("../services/policyholderService");

async function getPolicyholders(req, res) {
  try {
    const policyholders = await getAllPolicyholders();
    res.json(policyholders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching policyholders" });
  }
}

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
