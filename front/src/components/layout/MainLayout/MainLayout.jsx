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

  const channels = [
    "Avisos Oficiales",
    "Prestaciones",
    "Dirección Médica",
    "Asesoría Jurídica",
    "General",
  ];

  // ✅ LOGOUT AQUÍ (global)
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>Flowly</div>
          <div className={styles.subtitle}>
            Gestión de Autorizaciones Médicas
          </div>
        </div>

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

        <div className={styles.sectionTitle}>CANALES</div>

        <div className={styles.channels}>
          {channels.map((channel) => (
            <div key={channel} className={styles.channel}>
              # {channel}
            </div>
          ))}
        </div>

        <div className={styles.sectionTitle}>ACCESOS DIRECTOS</div>

        <div className={styles.shortcuts}>
          <div className={styles.shortcut}>Mis Notificaciones</div>
          <div className={styles.shortcut}>Documentos</div>
          <div className={styles.shortcut}>Configuración</div>
        </div>
      </aside>

      <div className={styles.mainContent}>
        {/* 🔴 TOPBAR GLOBAL */}
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

              {/* ✅ LOGOUT AQUÍ */}
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
