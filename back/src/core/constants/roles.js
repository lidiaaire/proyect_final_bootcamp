// Este archivo define los roles de usuario que se utilizan en la aplicación para controlar el acceso a diferentes funcionalidades y rutas según el rol asignado a cada usuario.
// Los roles definidos son: admin, prestaciones, dirección médica y asesoría jurídica. Estos roles se utilizan en los middlewares de autenticación y autorización para proteger las rutas y asegurar que solo los usuarios con el rol adecuado puedan acceder a ciertas funcionalidades.

const ROLES = {
  ADMIN: "admin",
  PRESTACIONES: "prestaciones",
  DIRECCIONMEDICA: "direccionmedica",
  ASESORIAJURIDICA: "asesoriajuridica",
};

module.exports = { ROLES };
