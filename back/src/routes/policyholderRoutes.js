// Este archivo define las rutas relacionadas con los asegurados en la aplicación. Utiliza Express para crear un router que maneja las solicitudes GET para obtener la lista de asegurados y para obtener la información de un asegurado específico por su ID. Las rutas están asociadas con los controladores correspondientes, getPolicyholders y getPolicyholderById, que se encargan de procesar las solicitudes relacionadas con los asegurados. Estas rutas permiten a los usuarios acceder a la información de los asegurados, lo que es fundamental para gestionar sus pólizas, solicitudes y otras funcionalidades relacionadas dentro de la aplicación.
// Las rutas definidas en este archivo son: GET /policyholders para obtener la lista de todos los asegurados y GET /policyholders/:id para obtener la información de un asegurado específico por su ID. Estas rutas se utilizan en la interfaz de usuario para mostrar la información relevante de los asegurados y permitir a los usuarios interactuar con los datos de los asegurados de manera efectiva, lo que mejora la gestión de las pólizas y solicitudes asociadas a cada asegurado.

const express = require("express");
const router = express.Router();

const controller = require("../controllers/policyholderController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, controller.getPolicyholders);
router.get("/:id", verifyToken, controller.getPolicyholderById);

module.exports = router;
