// Esta página representa la vista de login de la aplicación, donde los usuarios pueden ingresar sus credenciales para acceder al sistema. Utiliza el hook useState para manejar el estado de los campos de email, contraseña y cualquier error que pueda ocurrir durante el proceso de login. La función handleLogin se encarga de enviar una solicitud POST a la API de autenticación con las credenciales ingresadas por el usuario, y maneja la respuesta para almacenar el token de autenticación en localStorage y redirigir al usuario al dashboard principal si el login es exitoso, o mostrar un mensaje de error si ocurre algún problema. Asegúrate de que los campos utilizados en esta página coincidan con los campos definidos en el backend para garantizar una correcta autenticación y manejo de errores.
// La página utiliza estilos definidos en Login.module.css para darle una apariencia atractiva y profesional a la vista de login. La estructura de la página se divide en dos paneles: el panel izquierdo con un mensaje de bienvenida y el panel derecho con el formulario de login. Asegúrate de que los estilos estén correctamente aplicados para mejorar la experiencia del usuario al ingresar sus credenciales y facilitar la navegación hacia el dashboard principal después de un login exitoso.

import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al hacer login");
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <main className={styles.container}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.overlay}>
          <h1>Gestiona autorizaciones médicas de forma ágil</h1>
          <p>Colabora entre departamentos en tiempo real</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          {/* HEADER NUEVO */}
          <div className={styles.header}>
            <h1 className={styles.logoText}>Flowly</h1>
          </div>

          <p className={styles.subtitle}>
            Optimiza la gestión de autorizaciones médicas
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>Email</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>📧</span>
                <input
                  type="email"
                  placeholder="Introduce tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Contraseña</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>🔒</span>
                <input
                  type="password"
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button}>
              Entrar
            </button>

            <p className={styles.forgotPassword}>¿Olvidaste tu contraseña?</p>
          </form>
        </div>
      </div>
    </main>
  );
}

Login.noLayout = true;
