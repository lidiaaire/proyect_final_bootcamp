const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// UPDATE
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nombreCompleto, email },
      { new: true },
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// DELETE
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};

module.exports = {
  updateUser,
  deleteUser,
};
