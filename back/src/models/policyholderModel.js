// Este archivo contiene el modelo de datos para los asegurados en la aplicación. El modelo de datos define la estructura de los documentos que se almacenarán en la base de datos de MongoDB para representar a cada asegurado. Cada asegurado tiene campos como id, name, dni, telefono, email, direccion, policyType, policyStartDate e internalNotes. Este modelo se utiliza para crear y gestionar los documentos de asegurados en la base de datos, lo que permite almacenar y recuperar información sobre cada asegurado de manera eficiente y estructurada.
// La estructura del modelo de datos incluye los siguientes campos: id (identificador único del asegurado), name (nombre completo del asegurado), dni (número de DNI del asegurado), telefono (número de teléfono del asegurado), email (correo electrónico del asegurado), direccion (dirección del asegurado), policyType (tipo de póliza que tiene el asegurado, con opciones limitadas a "POLIZA PRIVADA", "POLIZA COLECTIVO" y "POLIZA FUNCIONARIO"), policyStartDate (fecha de inicio de la póliza del asegurado) e internalNotes (un array de notas internas asociadas al asegurado, donde cada nota incluye texto, autor y fecha). Esta estructura permite organizar y gestionar la información de los asegurados de manera efectiva en la base de datos y en la aplicación.

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
