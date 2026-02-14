const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./configuration/db");
const authRoutes = require("./routes/authRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const solicitudRoutes = require("./routes/solicitudRoutes");

const app = express();

// Conectar a Mongo
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/solicitudes", solicitudRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Autorizaciones funcionando" });
});
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Ruta protegida OK", user: req.user });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
