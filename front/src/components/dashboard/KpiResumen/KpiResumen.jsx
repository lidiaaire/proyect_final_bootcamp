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
        className={`${styles.card} ${styles.inicio} ${isActive("PENDIENTE_INICIO_GESTION") ? styles.active : ""}`}
        onClick={() => setFiltroEstado("PENDIENTE_INICIO_GESTION")}
      >
        <div className={styles.number}>{inicioGestion.length}</div>

        <div className={styles.kpiInfo}>
          <span className={styles.label}>Inicio gestión</span>

          <button className={`${styles.btn} ${styles.btnInicio}`}>
            Ver pendientes
          </button>
        </div>
      </div>

      {/* Documentación */}
      <div
        className={`${styles.card} ${styles.doc}`}
        onClick={() => setFiltroEstado("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO")}
      >
        <div className={styles.number}>{documentacion.length}</div>

        <div className={styles.kpiInfo}>
          <span className={styles.label}>Documentación</span>

          <button className={`${styles.btn} ${styles.btnDoc}`}>
            Ver pendientes
          </button>
        </div>
      </div>

      {/* Dirección médica */}
      <div
        className={`${styles.card} ${styles.medica}`}
        onClick={() => setFiltroEstado("PENDIENTE_DIRECCION_MEDICA")}
      >
        <div className={styles.number}>{direccionMedica.length}</div>

        <div className={styles.kpiInfo}>
          <span className={styles.label}>Dirección médica</span>

          <button className={`${styles.btn} ${styles.btnMedica}`}>
            Ver pendientes
          </button>
        </div>
      </div>

      {/* Jurídico */}
      <div
        className={`${styles.card} ${styles.juridica}`}
        onClick={() => setFiltroEstado("PENDIENTE_ASESORIA_JURIDICA")}
      >
        <div className={styles.number}>{asesoria.length}</div>

        <div className={styles.kpiInfo}>
          <span className={styles.label}>Asesoría jurídica</span>

          <button className={`${styles.btn} ${styles.btnJuridica}`}>
            Ver pendientes
          </button>
        </div>
      </div>
    </div>
  );
}
