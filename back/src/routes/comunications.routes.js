const express = require("express");

const {
  getMessages,
  sendMessage,
} = require("../controllers/communications.controller");

const router = express.Router();

router.get("/communications/:channel", getMessages);
router.post("/communications", sendMessage);

module.exports = router;
