// Este archivo contiene la lógica para crear un usuario administrador en la base de datos. Define la función createAdmin, que se encarga de conectarse a la base de datos, crear un nuevo usuario con el rol de administrador y guardar esa información en la base de datos. La función utiliza bcrypt para hash de la contraseña del administrador antes de guardarla. Al ejecutar este archivo, se crea un usuario administrador con un correo electrónico y una contraseña predefinidos, lo que permite acceder a las funcionalidades administrativas de la aplicación. Esta función es útil para configurar el sistema inicialmente y garantizar que haya un usuario con privilegios administrativos disponible para gestionar la aplicación.
// Importamos los módulos necesarios para trabajar con la base de datos, hashing de contraseñas y variables de entorno.

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
