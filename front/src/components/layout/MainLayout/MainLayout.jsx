import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../../styles/MainLayout.module.css";
import {
  HomeIcon,
  FolderIcon,
  CogIcon,
} from "@/components/ui/StatusBadge/icons";
export default function MainLayout({ children }) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRole(payload.role);
      } catch {
        setRole("");
      }
    }
  }, []);

  const isActive = (path) =>
    router.pathname === path || router.pathname.startsWith(path + "/");

  return (
    <div className={styles.layout}>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== Sidebar ===== */}
      {sidebarVisible && (
        <aside
          className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}
        >
          <div>
            <div className={styles.logo}>Flowly</div>

            <nav className={styles.nav}>
              <Link
                href="/"
                className={`${styles.navItem} ${
                  isActive("/") ? styles.active : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <HomeIcon className={styles.icon} />
                <span>Home</span>
              </Link>

              <Link
                href="/solicitudes"
                className={`${styles.navItem} ${
                  isActive("/solicitudes") ? styles.active : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <FolderIcon className={styles.icon} />
                <span>Solicitudes</span>
              </Link>

              <Link href="#" className={styles.navItem}>
                <CogIcon className={styles.icon} />
                <span>Ajustes</span>
              </Link>
            </nav>
          </div>

          <div className={styles.footer}>
            <div className={styles.userBox}>
              <div className={styles.avatar}>{role ? role.charAt(0) : "U"}</div>
              <div className={styles.userInfo}>
                <span>{role || "Usuario"}</span>
                <span>Activo</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ===== Main Area ===== */}
      <main
        className={`${styles.main} ${!sidebarVisible ? styles.fullWidth : ""}`}
      >
        {/* Top Header */}
        <div className={styles.topHeader}>
          {/* Botón ocultar sidebar */}
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            ☰
          </button>

          <div className={styles.searchBox}>
            <input type="text" placeholder="Buscar..." />
          </div>

          <div className={styles.topRight}>
            <span className={styles.iconCircle}>🔔</span>
            <span className={styles.iconCircle}>⚙️</span>

            <div className={styles.profileBox}>
              <div className={styles.avatarSmall}>
                {role ? role.charAt(0) : "U"}
              </div>
              <span className={styles.profileName}>Maria López</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>{children}</div>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
      </main>
    </div>
  );
}
