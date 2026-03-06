import styles from "@/styles/StatusBadge.module.css";

export default function StatusBadge({ status }) {
  const getClass = () => {
    if (!status) return styles.default;

    if (status === "AUTORIZADA") return styles.autorizada;
    if (status === "RECHAZADA") return styles.rechazada;

    if (status.includes("DOCUMENTACION")) return styles.documentacion;
    if (status.includes("PENDIENTE")) return styles.pendiente;

    return styles.default;
  };

  const labelMap = {
    PENDIENTE_INICIO_GESTION: "Inicio",
    PENDIENTE_DIRECCION_MEDICA: "Dir. Médica",
    PENDIENTE_ASESORIA_JURIDICA: "Jurídica",
    PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: "Documentación",
    PENDIENTE_REVISION_PRESTACIONES: "Revisión",
    AUTORIZADA: "Autorizada",
    RECHAZADA: "Rechazada",
  };

  return (
    <span className={`${styles.badge} ${getClass()}`}>
      {labelMap[status] || status || "—"}
    </span>
  );
}
