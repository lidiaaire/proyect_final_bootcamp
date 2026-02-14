const { login } = require("../services/authService");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await login(email, password);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { loginController };
