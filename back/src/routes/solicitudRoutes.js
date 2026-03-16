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

/* ==============================
GET /api/solicitudes
============================== */

router.get("/", getSolicitudes);

/* ==============================
GET /api/solicitudes/:id
============================== */

router.get("/:id", getSolicitudById);

/* ==============================
POST /api/solicitudes/:id/solicitar-documentacion
============================== */

router.post("/:id/solicitar-documentacion", requestDocumentation);

/* ==============================
POST /api/solicitudes/:id/enviar-direccion-medica
============================== */

router.post("/:id/enviar-direccion-medica", sendToDireccionMedica);

/* ==============================
POST /api/solicitudes/:id/enviar-asesoria-juridica
============================== */

router.post("/:id/enviar-asesoria-juridica", sendToAsesoriaJuridica);

/* ==============================
POST /api/solicitudes/:id/autorizar
============================== */

router.post("/:id/autorizar", authorizeSolicitud);

/* ==============================
POST /api/solicitudes/:id/rechazar
============================== */

router.post("/:id/rechazar", rejectSolicitud);

module.exports = router;
