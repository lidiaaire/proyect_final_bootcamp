import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import Topbar from "@/components/layout/Topbar/Topbar";
import styles from "./AppShell.module.css";

// AppShell (Sprint 2B): estructura común de Flowly -- sidebar + topbar +
// área de contenido -- según la arquitectura aprobada en la auditoría
// UX/UI. Una sola implementación para los cuatro roles; Sidebar decide
// qué elementos de navegación les corresponden.
export default function AppShell({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <div className={styles.shell}>
      <Sidebar rol={user?.role} />

      <div className={styles.main}>
        <Topbar user={user} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
