// Este archivo contiene el modelo de datos para los usuarios en la aplicación. El modelo de datos define la estructura de los documentos que se almacenarán en la base de datos de MongoDB para representar a cada usuario. Cada usuario tiene campos como nombreCompleto, email, password y role. Este modelo se utiliza para crear y gestionar los documentos de usuarios en la base de datos, lo que permite almacenar y recuperar información sobre cada usuario de manera eficiente y estructurada.
// La estructura del modelo de datos incluye los siguientes campos: nombreCompleto (nombre completo del usuario), email (correo electrónico del usuario, que debe ser único), password (contraseña del usuario) y role (rol del usuario, con opciones limitadas a "PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA" y "ADMIN"). Esta estructura permite organizar y gestionar la información de los usuarios de manera efectiva en la base de datos y en la aplicación, asociando cada usuario con su rol correspondiente para controlar el acceso a diferentes funcionalidades según su rol.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nombreCompleto: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA", "ADMIN"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
