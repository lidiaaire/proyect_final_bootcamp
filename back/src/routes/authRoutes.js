// Este archivo define las rutas de autenticación para la aplicación. Utiliza Express para crear un router que maneja las solicitudes POST para el inicio de sesión y el registro de usuarios. Las rutas están asociadas con los controladores correspondientes, loginController y registerController, que se encargan de procesar las solicitudes de autenticación. Estas rutas permiten a los usuarios iniciar sesión en la aplicación o registrarse para obtener una cuenta, lo que es fundamental para controlar el acceso a las funcionalidades de la aplicación según el rol del usuario.
// Las rutas definidas en este archivo son: POST /login para el inicio de sesión y POST /register para el registro de nuevos usuarios. Estas rutas se utilizan en la interfaz de usuario para enviar las solicitudes de autenticación al backend, lo que permite a los usuarios acceder a la aplicación de manera segura y gestionar sus cuentas según su rol.

const express = require("express");
const router = express.Router();

const {
  loginController,
  registerController,
} = require("../controllers/authController");

/* Rutas de autenticación */
router.post("/login", loginController);
router.post("/register", registerController);

module.exports = router;
