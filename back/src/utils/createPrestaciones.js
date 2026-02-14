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
      nombreCompleto: "Usuario Prestaciones",
      email: "prestaciones@empresa.com",
      password: hashedPassword,
      role: "PRESTACIONES",
    });

    await user.save();

    console.log("Usuario PRESTACIONES creado");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createUser();
