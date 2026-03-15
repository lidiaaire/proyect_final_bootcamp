const mongoose = require("mongoose");

const policyholderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  name: String,

  dni: String,

  internalNotes: [
    {
      text: String,
      author: String,
      date: Date,
    },
  ],
});

module.exports = mongoose.model("Policyholder", policyholderSchema);
