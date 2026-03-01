import styles from "@/styles/KpiResumen.module.css";
import { Folder, FileText, Stethoscope, Scale } from "lucide-react";

export default function KpiResumen({
  solicitudes = [],
  filtroEstado,
  setFiltroEstado,
}) {
  // =========================
  // Cálculo por fase del flujo
  // =========================

  const inicioGestion = solicitudes.filter(
    (s) => s.estadoInterno === "PENDIENTE_INICIO_GESTION",
  );

  const direccionMedica = solicitudes.filter(
    (s) => s.estadoInterno === "PENDIENTE_DIRECCION_MEDICA",
  );

  const documentacion = solicitudes.filter(
    (s) => s.estadoInterno === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
  );

  const asesoria = solicitudes.filter(
    (s) => s.estadoInterno === "PENDIENTE_ASESORIA_JURIDICA",
  );

  const isActive = (estado) => filtroEstado === estado;

  return (
    <div className={styles.container}>
      {/* Inicio gestión */}
      <div
        className={`${styles.card} ${styles.inicio} ${
          isActive("PENDIENTE_INICIO_GESTION") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_INICIO_GESTION")}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Folder size={16} />
          </div>
          <span className={styles.label}>Inicio gestión</span>
        </div>

        <span className={styles.number}>{inicioGestion.length}</span>
      </div>

      {/* Documentación */}
      <div
        className={`${styles.card} ${styles.doc} ${
          isActive("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO")}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <FileText size={16} />
          </div>
          <span className={styles.label}>Documentación</span>
        </div>

        <span className={styles.number}>{documentacion.length}</span>
      </div>

      {/* Dirección médica */}
      <div
        className={`${styles.card} ${styles.medica} ${
          isActive("PENDIENTE_DIRECCION_MEDICA") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_DIRECCION_MEDICA")}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Stethoscope size={16} />
          </div>
          <span className={styles.label}>Dirección médica</span>
        </div>

        <span className={styles.number}>{direccionMedica.length}</span>
      </div>

      {/* Asesoría jurídica */}
      <div
        className={`${styles.card} ${styles.juridica} ${
          isActive("PENDIENTE_ASESORIA_JURIDICA") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_ASESORIA_JURIDICA")}
      >
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Scale size={16} />
          </div>
          <span className={styles.label}>Asesoría jurídica</span>
        </div>

        <span className={styles.number}>{asesoria.length}</span>
      </div>
    </div>
  );
}
