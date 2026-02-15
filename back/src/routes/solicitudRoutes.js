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

router.post(
  "/",
  verifyToken,
  authorizeRoles("PRESTACIONES", "ADMIN"),
  createSolicitudController,
);

router.get("/", verifyToken, getSolicitudesController);

router.get("/:id", verifyToken, getSolicitudByIdController);

router.patch("/:id/status", verifyToken, changeStatusController);

module.exports = router;
