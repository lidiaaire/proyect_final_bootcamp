const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { login } = require("../services/authService");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerController = async (req, res) => {
  try {
    const { nombreCompleto, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombreCompleto,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

module.exports = { loginController, registerController };
