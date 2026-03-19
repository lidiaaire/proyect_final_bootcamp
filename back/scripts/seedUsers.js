require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../src/models/userModel");

async function seedUsers() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  await User.create([
    {
      nombreCompleto: "Usuario Prestaciones",
      email: "prestaciones@empresa.com",
      password: passwordHash,
      role: "PRESTACIONES",
    },
    {
      nombreCompleto: "Usuario Dirección Médica",
      email: "direccionmedica@empresa.com",
      password: passwordHash,
      role: "DIRECCION_MEDICA",
    },
    {
      nombreCompleto: "Usuario Asesoría Jurídica",
      email: "asesoriajuridica@empresa.com",
      password: passwordHash,
      role: "ASESORIA_JURIDICA",
    },
    {
      nombreCompleto: "Administrador",
      email: "admin@empresa.com",
      password: passwordHash,
      role: "ADMIN",
    },
  ]);

  console.log("Usuarios creados");
  await mongoose.disconnect();
}

module.exports = seedUsers;
