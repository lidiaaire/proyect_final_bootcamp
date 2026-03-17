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
} = require("../controllers/solicitudController");

// 🔐 Middleware de autenticación
const { verifyToken } = require("../middlewares/authMiddleware");

/* ==============================
GET /api/solicitudes
============================== */
router.get("/", verifyToken, getSolicitudes);

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
