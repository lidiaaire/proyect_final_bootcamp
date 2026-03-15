const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const {
  getRequests,
  getRequestById,
  authorizeRequest,
  rejectRequest,
  requestDocumentation,
} = require("../controllers/requestController");

/* ===============================
   LISTAR SOLICITUDES
================================ */

router.get("/", getRequests);

/* ===============================
   OBTENER SOLICITUD POR ID
================================ */

router.get("/:id", getRequestById);

/* ===============================
   SOLICITAR DOCUMENTACIÓN
================================ */

router.post(
  "/:id/solicitar-documentacion",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  requestDocumentation,
);

/* ===============================
   RECHAZAR SOLICITUD
================================ */

router.post(
  "/:id/rechazar",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  rejectRequest,
);

/* ===============================
   AUTORIZAR SOLICITUD
================================ */

router.post(
  "/:id/autorizar",
  verifyToken,
  authorizeRoles("PRESTACIONES", "DIRECCION_MEDICA", "ADMIN"),
  authorizeRequest,
);

module.exports = router;
