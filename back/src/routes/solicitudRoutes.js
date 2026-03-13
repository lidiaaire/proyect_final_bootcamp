const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const {
  createSolicitudController,
  changeStatusController,
  getSolicitudesController,
  getSolicitudByIdController,
} = require("../controllers/solicitudController");

const {
  solicitarDocumentacion,
} = require("../controllers/solicitarDocumentacionController");

const {
  rechazarSolicitud,
} = require("../controllers/rechazarSolicitudController");

const {
  autorizarSolicitud,
} = require("../controllers/autorizarSolicitudController");

/* ===============================
   CREAR SOLICITUD
================================ */

router.post(
  "/",
  verifyToken,
  authorizeRoles("PRESTACIONES", "ADMIN"),
  createSolicitudController,
);

/* ===============================
   LISTAR SOLICITUDES
================================ */

router.get("/", verifyToken, getSolicitudesController);

/* ===============================
   OBTENER SOLICITUD POR ID
================================ */

router.get("/:id", verifyToken, getSolicitudByIdController);

/* ===============================
   CAMBIAR ESTADO
================================ */

router.patch("/:id/status", verifyToken, changeStatusController);

/* ===============================
   SOLICITAR DOCUMENTACIÓN
================================ */

router.post(
  "/:id/solicitar-documentacion",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  solicitarDocumentacion,
);

/* ===============================
   RECHAZAR SOLICITUD
================================ */

router.post(
  "/:id/rechazar",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  rechazarSolicitud,
);

/* ===============================
   AUTORIZAR SOLICITUD
================================ */

router.post(
  "/:id/autorizar",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  autorizarSolicitud,
);

module.exports = router;
