// Este archivo define las rutas relacionadas con las solicitudes en la aplicación. Utiliza Express para crear un router que maneja las solicitudes GET para obtener la lista de solicitudes, obtener la información de una solicitud específica por su ID, y POST para autorizar, rechazar, solicitar documentación adicional, enviar a dirección médica o enviar a asesoría jurídica una solicitud. Las rutas están asociadas con los controladores correspondientes, getSolicitudes, getSolicitudById, authorizeSolicitud, rejectSolicitud, requestDocumentation, sendToDireccionMedica y sendToAsesoriaJuridica, que se encargan de procesar las solicitudes relacionadas con las solicitudes. Estas rutas permiten a los usuarios gestionar las solicitudes de manera efectiva dentro de la aplicación, lo que es fundamental para el flujo de trabajo de aprobación y gestión de las solicitudes.
// Las rutas definidas en este archivo son: GET /api/solicitudes para obtener la lista de todas las solicitudes, GET /api/solicitudes/:id para obtener la información de una solicitud específica por su ID, POST /api/solicitudes/:id/autorizar para autorizar una solicitud, POST /api/solicitudes/:id/rechazar para rechazar una solicitud, POST /api/solicitudes/:id/solicitar-documentacion para solicitar documentación adicional para una solicitud, POST /api/solicitudes/:id/enviar-direccion-medica para enviar una solicitud a dirección médica y POST /api/solicitudes/:id/enviar-asesoria-juridica para enviar una solicitud a asesoría jurídica. Estas rutas se utilizan en la interfaz de usuario para mostrar la información relevante de las solicitudes y permitir a los usuarios interactuar con las solicitudes de manera efectiva, lo que mejora la gestión y el flujo de trabajo asociado a las solicitudes dentro de la aplicación.

const express = require("express");
const router = express.Router();

const {
  getSolicitudes,
  getSolicitudById,
  authorizeSolicitud,
  rejectSolicitud,
  requestDocumentation,
  sendToDireccionMedica,
  sendToAsesoriaJuridica,
  getSolicitudesByPolicyholder, // ✅ NUEVO
} = require("../controllers/solicitudController");

// 🔐 Middleware de autenticación
const { verifyToken } = require("../middlewares/authMiddleware");

/* ==============================
GET /api/solicitudes
============================== */
router.get("/", verifyToken, getSolicitudes);

/* ==============================
GET /api/solicitudes/policyholder/:numeroPoliza
============================== */
router.get("/policyholder/:numeroPoliza", getSolicitudesByPolicyholder);

/* ==============================
GET /api/solicitudes/:id
============================== */
router.get("/:id", verifyToken, getSolicitudById);

/* ==============================
POST /api/solicitudes/:id/solicitar-documentacion
============================== */
router.post("/:id/solicitar-documentacion", verifyToken, requestDocumentation);

/* ==============================
POST /api/solicitudes/:id/enviar-direccion-medica
============================== */
router.post("/:id/enviar-direccion-medica", verifyToken, sendToDireccionMedica);

/* ==============================
POST /api/solicitudes/:id/enviar-asesoria-juridica
============================== */
router.post(
  "/:id/enviar-asesoria-juridica",
  verifyToken,
  sendToAsesoriaJuridica,
);

/* ==============================
POST /api/solicitudes/:id/autorizar
============================== */
router.post("/:id/autorizar", verifyToken, authorizeSolicitud);

/* ==============================
POST /api/solicitudes/:id/rechazar
============================== */
router.post("/:id/rechazar", verifyToken, rejectSolicitud);

module.exports = router;
