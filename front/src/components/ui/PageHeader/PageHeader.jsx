import styles from "./PageHeader.module.css";

// Encabezado de página coherente con el AppShell (Sprint 2C). Título +
// subtítulo opcional + una acción principal a la derecha. Reutilizable
// en cualquier pantalla interna, no solo en Solicitudes.
// `size="lg"` (pasada visual del dashboard) solo añade una clase
// modificadora -- el resto de pantallas sigue usando el tamaño por
// defecto sin ningún cambio.
export default function PageHeader({ title, subtitle, action, size = "md" }) {
  return (
    <div className={`${styles.header} ${size === "lg" ? styles.lg : ""}`}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
