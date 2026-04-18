import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@empresa\.com$/;

    if (!emailRegex.test(email)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
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
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const fillDemoUser = () => {
    const demoEmail = "prestaciones@empresa.com";
    setEmail(demoEmail);
    setPassword("123456");

    const emailRegex = /^[^\s@]+@empresa\.com$/;
    if (!emailRegex.test(demoEmail)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      setEmailError("Formato de email no válido");
    } else {
      setEmailError("");
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
                  onChange={handleEmailChange}
                  required
                />
                {emailError && <p className={styles.error}>{emailError}</p>}
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
          <p className={styles.registerText}>
            ¿No tienes cuenta?{" "}
            <span
              className={styles.registerLink}
              onClick={() => router.push("/register")}
            >
              Crear cuenta
            </span>
          </p>

          {/* 🔓 BLOQUE DEMO */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#f5f5f5",
              fontSize: "14px",
            }}
          >
            <strong>Acceso demo</strong>
            <p>Email: prestaciones@empresa.com</p>
            <p>Contraseña: 123456</p>

            <button
              onClick={fillDemoUser}
              style={{
                marginTop: "10px",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Usar usuario demo
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

Login.noLayout = true;
