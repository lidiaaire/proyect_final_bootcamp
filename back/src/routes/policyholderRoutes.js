const express = require("express");
const router = express.Router();

const { policyholders } = require("../mocks/policyholders");

router.get("/", (req, res) => {
  res.json(policyholders);
});

module.exports = router;
