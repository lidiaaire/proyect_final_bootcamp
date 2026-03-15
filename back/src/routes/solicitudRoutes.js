const express = require("express");
const router = express.Router();

const {
  getSolicitudes,
  getSolicitudById,
  authorizeSolicitud,
  rejectSolicitud,
  requestDocumentation,
} = require("../controllers/solicitudController");

router.get("/", getSolicitudes);

router.get("/:id", getSolicitudById);

router.post("/:id/autorizar", authorizeSolicitud);

router.post("/:id/rechazar", rejectSolicitud);

router.post("/:id/solicitar-documentacion", requestDocumentation);

module.exports = router;
