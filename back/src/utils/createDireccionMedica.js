const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../configuration/db");
const User = require("../models/userModel");

const createUser = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = new User({
      nombreCompleto: "Usuario Direccion Medica",
      email: "direccionmedica@empresa.com",
      password: hashedPassword,
      role: "DIRECCION_MEDICA",
    });

    await user.save();

    console.log("Usuario Direccion Medica creado");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createUser();
