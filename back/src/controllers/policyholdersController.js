const { policyholders } = require("../mocks/policyholders");
const { notes } = require("../mocks/notes");

const getPolicyholders = (req, res) => {
  res.json(policyholders);
};

const getPolicyholderById = (req, res) => {
  const { id } = req.params;

  const policyholder = policyholders.find((p) => String(p.id) === String(id));

  if (!policyholder) {
    return res.status(404).json({ message: "Policyholder not found" });
  }

  // Filtrar notas del asegurado
  const policyholderNotes = notes.filter(
    (note) => String(note.policyholderId) === String(id),
  );

  res.json({
    ...policyholder,
    internalNotes: policyholderNotes,
  });
};

module.exports = {
  getPolicyholders,
  getPolicyholderById,
};
