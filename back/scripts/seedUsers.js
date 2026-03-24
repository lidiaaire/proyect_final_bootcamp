require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../src/models/userModel");

async function seedUsers() {
  try {
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
  } catch (error) {
    console.error("Error en seedUsers:", error);
    throw error;
  }
}

module.exports = seedUsers;
