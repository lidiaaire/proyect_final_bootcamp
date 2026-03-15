const express = require("express");
const router = express.Router();

const controller = require("../controllers/policyholderController");

router.get("/", controller.getPolicyholders);
router.get("/:id", controller.getPolicyholderById);

module.exports = router;
