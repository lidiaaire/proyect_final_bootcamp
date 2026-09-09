import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
  Users,
  ShieldCheck,
  User,
} from "lucide-react";
import styles from "../styles/LoginPage.module.css";

// Recuerda solo el email (no la sesión) para no interferir con cómo el
// resto de la app ya lee el token desde localStorage.
const REMEMBER_EMAIL_KEY = "flowly_remember_email";

const EMAIL_REGEX = /^[^\s@]+@empresa\.com$/;

const BENEFITS = [
  {
    icon: FileText,
    title: "Procesos más ágiles",
    description: "Menos tiempo, más foco en lo importante.",
  },
  {
    icon: Users,
    title: "Equipos conectados",
    description: "Toda la información en un mismo lugar.",
  },
  {
    icon: ShieldCheck,
    title: "Atención de calidad",
    description: "Decisiones más rápidas y seguras.",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRemember(true);
      }
    } catch {
      // localStorage no disponible (navegación privada, etc.): se ignora.
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
      return;
    }

    setLoading(true);

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

      try {
        if (remember) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // no crítico para el login
      }

      router.push("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    const demoEmail = "prestaciones@empresa.com";
    setEmail(demoEmail);
    setPassword("123456");
    setEmailError("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!EMAIL_REGEX.test(value)) {
      setEmailError("Debes usar un email corporativo (@empresa.com)");
    } else {
      setEmailError("");
    }
  };

  return (
    <main className={styles.container}>
      {/* LEFT PANEL — branding */}
      <div className={styles.leftPanel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- asset
            de marca oficial, servido tal cual desde /public/branding. */}
        <img
          src="/branding/flowly-logo.png"
          alt="Flowly · Gestión de autorizaciones médicas"
          width={2172}
          height={724}
          className={styles.brandLogo}
        />

        <div className={styles.leftContent}>
          <div>
            <p className={styles.eyebrow}>Más eficiencia. Mejor atención.</p>
            <h1 className={styles.headline}>
              Gestión de autorizaciones médicas,{" "}
              <span className={styles.headlineAccent}>más simple.</span>
            </h1>
            <p className={styles.description}>
              Una plataforma diseñada para conectar equipos, agilizar
              procesos y garantizar una atención de calidad.
            </p>
          </div>

          <ul className={styles.benefits}>
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <li key={title} className={styles.benefit}>
                <span className={styles.benefitIcon}>
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <span>
                  <strong className={styles.benefitTitle}>{title}</strong>
                  <span className={styles.benefitDescription}>
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL — acceso */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            {/* eslint-disable-next-line @next/next/no-img-element -- asset
                de marca oficial, servido tal cual desde /public/branding. */}
            <img
              src="/branding/flowly-logo.png"
              alt="Flowly · Gestión de autorizaciones médicas"
              width={2172}
              height={724}
              className={styles.logoImg}
            />
          </div>

          <h2 className={styles.title}>Bienvenida</h2>
          <p className={styles.subtitle}>Inicia sesión para acceder a Flowly</p>

          <form onSubmit={handleLogin} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="login-email">Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.icon} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Introduce tu email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              {emailError && (
                <p className={styles.fieldError}>{emailError}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.icon} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  Entrar <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>o</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Acceso demo */}
          <div className={styles.demoBlock}>
            <p className={styles.demoLabel}>Acceso demo</p>
            <div className={styles.demoRow}>
              <div className={styles.demoInfo}>
                <User size={16} className={styles.demoIcon} aria-hidden="true" />
                <div>
                  <p>Email: prestaciones@empresa.com</p>
                  <p>Contraseña: 123456</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemoUser}
                className={styles.demoButton}
              >
                Usar demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

Login.noLayout = true;
