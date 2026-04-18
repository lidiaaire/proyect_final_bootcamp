// Controladores de autenticación (login y registro)
// Validación de email incluida para evitar formatos inválidos

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { login } = require("../services/authService");

// Función reutilizable de validación de email
const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@empresa\.com$/;
  return emailRegex.test(email);
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email antes de lógica de negocio
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Debes usar un email corporativo (@empresa.com)",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "La contraseña es obligatoria",
      });
    }

    const result = await login(email, password);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

const registerController = async (req, res) => {
  try {
    const { nombreCompleto, email, password, role } = req.body;

    // 1. Validar email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Debes usar un email corporativo (@empresa.com)",
      });
    }

    // 2. Validar password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // 3. Validar nombre
    if (!nombreCompleto) {
      return res.status(400).json({
        message: "El nombre es obligatorio",
      });
    }

    // 4. Comprobar si existe usuario
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Crear usuario
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
