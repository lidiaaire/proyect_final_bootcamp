// Este archivo define las rutas relacionadas con las comunicaciones en la aplicación. Utiliza Express para crear un router que maneja las solicitudes GET para obtener los mensajes de un canal específico y POST para enviar un nuevo mensaje. Las rutas están asociadas con los controladores correspondientes, getMessagesController y sendMessageController, que se encargan de procesar las solicitudes de comunicaciones. Estas rutas permiten a los usuarios interactuar con el sistema de comunicaciones de la aplicación, lo que es fundamental para facilitar la comunicación entre los diferentes departamentos y usuarios dentro de la aplicación.
// Las rutas definidas en este archivo son: GET /communications/:channel para obtener los mensajes de un canal específico y POST /communications para enviar un nuevo mensaje. Estas rutas se utilizan en la interfaz de usuario para mostrar las comunicaciones relevantes para cada usuario y permitirles enviar mensajes dentro de la aplicación, lo que mejora la colaboración y la eficiencia en la gestión de las solicitudes y otras funcionalidades relacionadas.

const express = require("express");

const {
  getMessages,
  sendMessage,
} = require("../controllers/communications.controller");

const router = express.Router();

/* Rutas de comunicaciones */
router.get("/communications/:channel", getMessages);
router.post("/communications", sendMessage);

module.exports = router;
