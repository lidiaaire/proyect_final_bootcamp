import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

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

  return (
    <main className={styles.container}>
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h1 className={styles.logoText}>Registro</h1>

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button}>
              Crear cuenta
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

Register.noLayout = true;
