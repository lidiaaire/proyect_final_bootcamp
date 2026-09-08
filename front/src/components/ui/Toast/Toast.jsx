import { useEffect } from "react";
import styles from "./Toast.module.css";

// Feedback no bloqueante (Sprint 2D), sustituye a alert() en el flujo de
// acciones sobre una solicitud. Uso local a la página que lo necesite
// (sin contexto/portal global): basta para dejar de bloquear la UI con
// diálogos nativos del navegador.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${toast.type === "error" ? styles.error : styles.success}`}>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} className={styles.close} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}
