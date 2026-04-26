// Este archivo es el punto de entrada principal de la aplicación backend. Configura el servidor Express, conecta a la base de datos MongoDB, define los middlewares necesarios y establece las rutas para manejar las solicitudes de autenticación, gestión de solicitudes, gestión de asegurados y comunicaciones. Además, sirve archivos estáticos para documentos PDF y proporciona una ruta protegida para verificar la autenticación de los usuarios. Al ejecutar este archivo, se inicia el servidor en el puerto especificado, permitiendo que la aplicación backend esté disponible para manejar las solicitudes entrantes y proporcionar los servicios necesarios para la aplicación frontend.
// Importamos los módulos necesarios para configurar el servidor, manejar las rutas y conectar a la base de datos.

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const connectDB = require("./configuration/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const solicitudRoutes = require("./routes/solicitudRoutes");
const policyholderRoutes = require("./routes/policyholderRoutes");
const communicationsRoutes = require("./routes/communications.routes");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://proyect-final-bootcamp.vercel.app",
  "https://flowly-medical.vercel.app",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
].map((origin) => origin.trim().replace(/\/$/, ""));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Conectar a Mongo
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Servir documentos PDF
app.use("/docs", express.static(path.join(process.cwd(), "public/docs")));
app.use(
  "/autorizaciones",
  express.static(path.join(process.cwd(), "public/autorizaciones")),
);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/solicitudes", solicitudRoutes);
app.use("/api/policyholders", policyholderRoutes);
app.use("/api", communicationsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Flowly funcionando" });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Ruta protegida OK", user: req.user });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
