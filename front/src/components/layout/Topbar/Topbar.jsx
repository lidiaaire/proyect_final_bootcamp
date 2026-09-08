import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import TestUser from "@/components/TestUser";
import { ROLE_CONFIG } from "@/core/constants/roles";
import styles from "./Topbar.module.css";

export default function Topbar({ user }) {
  const router = useRouter();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const searchRef = useRef(null);

  // Atajo real (no decorativo): Ctrl/Cmd+K enfoca el buscador. Se anuncia
  // en el propio input con el chip "Ctrl + K" -- que exista el chip
  // implica que el atajo funciona, así que debe funcionar de verdad.
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const inicial = user?.nombreCompleto ? user.nombreCompleto.charAt(0).toUpperCase() : "U";
  const rolLabel = user?.role ? ROLE_CONFIG[user.role]?.label : null;

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={16} strokeWidth={1.5} className={styles.searchIcon} />
        <input ref={searchRef} type="text" placeholder="Buscar por nº de solicitud, paciente, servicio..." />
        <kbd className={styles.searchHint}>Ctrl + K</kbd>
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.iconButton} aria-label="Notificaciones">
          <Bell size={19} strokeWidth={1.5} />
        </button>

        <button type="button" className={styles.iconButton} aria-label="Configuración">
          <Settings size={19} strokeWidth={1.5} />
        </button>

        <div className={styles.userArea}>
          <button
            type="button"
            className={styles.userInfo}
            onClick={() => setOpenUserMenu((v) => !v)}
          >
            <span className={styles.avatar}>{inicial}</span>
            <span className={styles.userText}>
              <span className={styles.userName}>{user?.nombreCompleto || "Usuario"}</span>
              {rolLabel && <span className={styles.userRole}>{rolLabel}</span>}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className={`${styles.chevron} ${openUserMenu ? styles.chevronOpen : ""}`}
            />
          </button>

          {openUserMenu && (
            <div className={styles.userDropdown}>
              <TestUser />
              <div className={styles.divider} />
              <button onClick={handleLogout} className={styles.logoutButton}>
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
