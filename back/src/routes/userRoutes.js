const express = require("express");
const router = express.Router();

const { updateUser, deleteUser } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

module.exports = router;
