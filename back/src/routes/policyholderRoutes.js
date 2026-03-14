const express = require("express");
const router = express.Router();

const {
  getPolicyholders,
  getPolicyholderById,
} = require("../controllers/policyholdersController");

router.get("/", getPolicyholders);
router.get("/:id", getPolicyholderById);

module.exports = router;
