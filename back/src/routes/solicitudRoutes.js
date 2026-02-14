const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createSolicitudController,
} = require("../controllers/solicitudController");
const {
  changeStatusController,
} = require("../controllers/solicitudController");
const {
  getSolicitudesController,
} = require("../controllers/solicitudController");

router.post(
  "/",
  verifyToken,
  authorizeRoles("PRESTACIONES", "ADMIN"),
  createSolicitudController,
);

router.get("/", verifyToken, getSolicitudesController);

router.patch("/:id/status", verifyToken, changeStatusController);

module.exports = router;
