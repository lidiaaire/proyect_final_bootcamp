import Link from "next/link";
import styles from "../../../styles/SolicitudItem.module.css";
import { ESTADO_LABELS } from "@/utils/estadoLabels";

export default function SolicitudItem({ solicitud, onSelect, isSelected }) {
  const {
    _id,
    nombreCompleto,
    nombrePrueba,
    especialidad,
    centroMedico,
    estadoInterno,
    createdAt,
  } = solicitud;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "AUTORIZADA":
        return styles.autorizada;
      case "RECHAZADA":
        return styles.rechazada;
      default:
        return styles.pendiente;
    }
  };

  return (
    <tr
      onClick={onSelect}
      style={{
        cursor: "pointer",
        background: isSelected ? "#f3f6ff" : "transparent",
      }}
    >
      <td>
        <div className={styles.nameCell}>
          <span className={styles.idLabel}>#{_id.slice(-5)}</span>
          <span className={styles.nameLink}>{nombreCompleto}</span>
        </div>
      </td>

      <td>{nombrePrueba}</td>

      <td>{especialidad}</td>

      <td>{centroMedico}</td>

      <td>
        <span className={`${styles.badge} ${getEstadoClass(estadoInterno)}`}>
          {ESTADO_LABELS[estadoInterno] || estadoInterno}
        </span>
      </td>

      <td>{formatDate(createdAt)}</td>

      <td className={styles.actionsCell}>
        <button className={styles.actionsBtn}>⋯</button>
      </td>
    </tr>
  );
}
