import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../../styles/MainLayout.module.css";

export default function MainLayout({ children }) {
  const router = useRouter();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Solicitudes", path: "/solicitudes" },
    { name: "Asegurados", path: "/policyholders" },
    { name: "Comunicaciones", path: "/comunicaciones" },
  ];

  // 🔹 Canales con ID (clave para routing)
  const channels = [
    { id: "avisos-oficiales", name: "Avisos Oficiales" },
    { id: "prestaciones", name: "Prestaciones" },
    { id: "direccion-medica", name: "Dirección Médica" },
    { id: "asesoria-juridica", name: "Asesoría Jurídica" },
    { id: "general", name: "General" },
  ];

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {/* 🔹 Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logo}>Flowly</div>
          <div className={styles.subtitle}>
            Gestión de Autorizaciones Médicas
          </div>
        </div>

        {/* 🔹 Menú principal */}
        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={
                router.pathname === item.path ? styles.active : styles.link
              }
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 🔹 Canales SOLO en comunicaciones */}
        {router.pathname.startsWith("/comunicaciones") && (
          <>
            <div className={styles.sectionTitle}>CANALES</div>

            <div className={styles.channels}>
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => router.push(`/comunicaciones/${ch.id}`)}
                  className={`${styles.channel} ${
                    router.pathname === `/comunicaciones/${ch.id}`
                      ? styles.activeChannel
                      : ""
                  }`}
                >
                  # {ch.name}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 🔹 Accesos */}
        <div className={styles.sectionTitle}>ACCESOS DIRECTOS</div>

        <div className={styles.shortcuts}>
          <div className={styles.shortcut}>Mis Notificaciones</div>
          <div className={styles.shortcut}>Documentos</div>
          <div className={styles.shortcut}>Configuración</div>
        </div>
      </aside>

      {/* 🔹 Contenido principal */}
      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <input type="text" placeholder="Buscar..." />
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.icon}>🔔</span>
            <span className={styles.icon}>⚙️</span>

            <div className={styles.user}>
              <div className={styles.avatar}>P</div>
              <span>María López</span>

              <button onClick={handleLogout} className={styles.logoutButton}>
                Salir
              </button>
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
