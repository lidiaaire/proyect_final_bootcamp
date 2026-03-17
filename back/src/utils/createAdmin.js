// Este archivo contiene la lógica para crear un usuario administrador en la base de datos. Define la función createAdmin, que se encarga de conectarse a la base de datos, crear un nuevo usuario con el rol de administrador y guardar esa información en la base de datos. La función utiliza bcrypt para hash de la contraseña del administrador antes de guardarla, asegurando que la contraseña se almacene de manera segura. Al ejecutar este archivo, se crea un usuario administrador con un correo electrónico específico y una contraseña predeterminada, lo que permite a los administradores acceder a las funcionalidades administrativas de la aplicación. Esta función es útil para configurar el sistema con un usuario administrador inicial que pueda gestionar otros usuarios y realizar tareas administrativas dentro de la aplicación.
// Importamos los módulos necesarios para trabajar con la base de datos, hashing de contraseñas y variables de entorno.

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
