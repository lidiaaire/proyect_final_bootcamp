const { policyholders } = require("../mocks/policyholders");

const getPolicyholders = (req, res) => {
  res.json(policyholders);
};

const getPolicyholderById = (req, res) => {
  const { id } = req.params;

  const policyholder = policyholders.find((p) => String(p.id) === String(id));

  if (!policyholder) {
    return res.status(404).json({ message: "Policyholder not found" });
  }

  res.json(policyholder);
};

module.exports = {
  getPolicyholders,
  getPolicyholderById,
};
