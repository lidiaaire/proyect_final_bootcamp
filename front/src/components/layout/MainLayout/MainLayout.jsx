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
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== Sidebar ===== */}
      {sidebarVisible && (
        <aside
          className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}
        >
          <div>
            {/* Logo */}
            <div className={styles.logoBlock}>
              <div className={styles.logoIcon}>F</div>
              <span className={styles.logoText}>Flowly</span>
            </div>

            <hr className={styles.divider} />

            {/* GENERAL */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>GENERAL</span>

              <Link
                href="/"
                className={`${styles.navItem} ${
                  isActive("/") ? styles.active : ""
                }`}
              >
                <HomeIcon className={styles.icon} />
                <span>Home</span>
              </Link>

              <Link
                href="/solicitudes"
                className={`${styles.navItem} ${
                  isActive("/solicitudes") ? styles.active : ""
                }`}
              >
                <FolderIcon className={styles.icon} />
                <span>Solicitudes</span>
                <span className={styles.badge}>80</span>
              </Link>
            </div>

            <hr className={styles.divider} />

            {/* GESTIÓN */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>GESTIÓN</span>

              <Link href="#" className={styles.navItem}>
                <FolderIcon className={styles.icon} />
                <span>Asegurados</span>
              </Link>

              <Link href="#" className={styles.navItem}>
                <FolderIcon className={styles.icon} />
                <span>Documentación</span>
              </Link>

              <Link href="#" className={styles.navItem}>
                <FolderIcon className={styles.icon} />
                <span>Análisis</span>
              </Link>
            </div>

            <hr className={styles.divider} />

            {/* CONFIGURACIÓN */}
            <div className={styles.section}>
              <span className={styles.sectionTitle}>CONFIGURACIÓN</span>

              <Link
                href="/ajustes"
                className={`${styles.navItem} ${
                  isActive("/ajustes") ? styles.active : ""
                }`}
              >
                <CogIcon className={styles.icon} />
                <span>Ajustes</span>
              </Link>
            </div>
          </div>

          {/* Footer usuario */}
          <div className={styles.sidebarFooter}>
            <div className={styles.userBox}>
              <div className={styles.avatar}>{role ? role.charAt(0) : "U"}</div>
              <div>
                <div className={styles.userName}>{role || "Usuario"}</div>
                <div className={styles.userRole}>Administración</div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ===== Main Area ===== */}
      <main
        className={`${styles.main} ${!sidebarVisible ? styles.fullWidth : ""}`}
      >
        <div className={styles.topHeader}>
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
              <span className={styles.profileName}>María López</span>
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
