import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@empresa\.com$/;

    if (!emailRegex.test(email)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreCompleto: name,
          email,
          password,
          role: "PRESTACIONES",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar");
      }

      router.push("/login");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@empresa\.com$/;

    if (!emailRegex.test(value)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
    } else {
      setEmailError("");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.logoText}>Flowly</h1>
          </div>

          <p className={styles.subtitle}>Crea tu cuenta para comenzar</p>

          <form onSubmit={handleRegister} className={styles.form}>
            {/* NOMBRE */}
            <div className={styles.field}>
              <label>Nombre</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>👤</span>
                <input
                  type="text"
                  placeholder="Introduce tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className={styles.field}>
              <label>Email</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>📧</span>
                <input
                  type="email"
                  placeholder="Introduce tu email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>

              {emailError && <p className={styles.error}>{emailError}</p>}
            </div>

            {/* PASSWORD */}
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
              Crear cuenta
            </button>
          </form>

          <p className={styles.registerText}>
            ¿Ya tienes cuenta?{" "}
            <span
              className={styles.registerLink}
              onClick={() => router.push("/login")}
            >
              Iniciar sesión
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}

Register.noLayout = true;
