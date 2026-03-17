// Este archivo contiene la lógica de autenticación para la aplicación. Define la función login, que se encarga de autenticar a un usuario utilizando su correo electrónico y contraseña. La función busca al usuario en la base de datos, verifica si la contraseña es correcta utilizando bcrypt, y si la autenticación es exitosa, genera un token JWT que incluye el ID del usuario y su rol. Este token se utiliza para controlar el acceso a las diferentes funcionalidades de la aplicación según el rol del usuario. La función login devuelve el token generado y la información básica del usuario, como su ID, nombre completo y rol, lo que permite a la interfaz de usuario gestionar la sesión del usuario de manera efectiva.
// La función login utiliza bcrypt para comparar la contraseña proporcionada por el usuario con la contraseña almacenada en la base de datos, lo que garantiza que las credenciales sean seguras. Si el usuario no se encuentra o si la contraseña es incorrecta, la función lanza un error con un mensaje adecuado. Si la autenticación es exitosa, el token JWT se firma utilizando una clave secreta definida en las variables de entorno y se establece una expiración de 8 horas para el token, lo que proporciona una capa adicional de seguridad para la sesión del usuario. Esta función es fundamental para controlar el acceso a la aplicación y garantizar que solo los usuarios autenticados puedan acceder a las funcionalidades según su rol.
// Importamos el modelo de usuario, bcrypt para la comparación de contraseñas y jsonwebtoken para la generación de tokens JWT.

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  return {
    token,
    user: {
      id: user._id,
      nombreCompleto: user.nombreCompleto,
      role: user.role,
    },
  };
};

module.exports = { login };
