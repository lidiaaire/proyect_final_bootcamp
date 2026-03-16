import mongoose from "mongoose";

const policyholderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  dni: {
    type: String,
    required: true,
  },

  telefono: {
    type: String,
  },

  email: {
    type: String,
  },

  direccion: {
    type: String,
  },

  policyType: {
    type: String,
    enum: ["POLIZA PRIVADA", "POLIZA COLECTIVO", "POLIZA FUNCIONARIO"],
  },

  policyStartDate: {
    type: Date,
  },

  internalNotes: [
    {
      text: String,
      author: String,
      date: Date,
    },
  ],
});

const Policyholder = mongoose.model("Policyholder", policyholderSchema);

export default Policyholder;
