const Policyholder = require("../models/policyholderModel");

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
