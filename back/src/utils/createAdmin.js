const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../configuration/db");
const User = require("../models/userModel");

const createAdmin = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = new User({
      nombreCompleto: "Admin Principal",
      email: "admin@empresa.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    await admin.save();

    console.log("Admin creado correctamente");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
