// Este archivo contiene los middlewares de autenticación y autorización para proteger las rutas de la aplicación. El middleware verifyToken se encarga de verificar la validez del token JWT enviado en el encabezado de autorización de la solicitud, asegurándose de que el usuario esté autenticado antes de permitir el acceso a las rutas protegidas. El middleware authorizeRoles se encarga de verificar si el usuario tiene el rol necesario para acceder a una ruta específica, asegurando que solo los usuarios con los roles adecuados puedan acceder a ciertas funcionalidades de la aplicación.
// Estos middlewares se utilizan en las rutas de la aplicación para protegerlas y garantizar que solo los usuarios autorizados puedan acceder a ellas, lo que es fundamental para la seguridad de la aplicación y para controlar el acceso a diferentes funcionalidades según el rol de cada usuario.

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
