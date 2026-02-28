import Link from "next/link";
import styles from "../../../styles/SolicitudItem.module.css";

export default function SolicitudItem({ solicitud }) {
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "AUTORIZADA":
        return styles.autorizada;
      case "RECHAZADA":
        return styles.rechazada;
      case "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO":
        return styles.documentacion;
      case "PENDIENTE_DIRECCION_MEDICA":
      case "PENDIENTE_ASESORIA_JURIDICA":
      case "PENDIENTE_REVISION_PRESTACIONES":
      case "PENDIENTE_INICIO_GESTION":
        return styles.pendiente;
      default:
        return styles.default;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const hoy = new Date();
  const fecha = new Date(solicitud.createdAt);
  const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
  const esAntigua = dias >= 5;

  return (
    <tr className={esAntigua ? styles.rowWarning : ""}>
      <td>
        <Link
          href={`/solicitudes/${solicitud._id}`}
          className={styles.nameLink}
        >
          {solicitud.nombreCompleto}
        </Link>

        <div className={styles.medicalInfo}>
          <span>
            <strong>Prueba:</strong> {solicitud.nombrePrueba}
          </span>
          <span>
            <strong>Especialidad:</strong> {solicitud.especialidad}
          </span>
          <span>
            <strong>Centro:</strong> {solicitud.centroMedico}
          </span>
        </div>
      </td>

      <td>
        <span
          className={`${styles.badge} ${getEstadoClass(
            solicitud.estadoInterno,
          )}`}
        >
          {solicitud.estadoInterno}
        </span>
      </td>

      <td>
        {solicitud.currentDepartment && (
          <span className={styles.departmentBadge}>
            {solicitud.currentDepartment}
          </span>
        )}
      </td>

      <td className={styles.dateCell}>
        <div className={styles.dateWrapper}>
          <span>{formatDate(solicitud.createdAt)}</span>

          {esAntigua && <span className={styles.urgencyBadge}>+5 días</span>}
        </div>
      </td>
    </tr>
  );
}
