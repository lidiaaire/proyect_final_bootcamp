import styles from "@/styles/KpiResumen.module.css";

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
      {/* Inicio */}
      <div
        className={`${styles.card} ${styles.inicio} ${
          isActive("PENDIENTE_INICIO_GESTION") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_INICIO_GESTION")}
      >
        <span className={styles.number}>{inicioGestion.length}</span>
        <span className={styles.label}>Inicio gestión</span>
      </div>

      {/* Documentación */}
      <div
        className={`${styles.card} ${styles.doc} ${
          isActive("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO")}
      >
        <span className={styles.number}>{documentacion.length}</span>
        <span className={styles.label}>Documentación</span>
      </div>

      {/* Dirección médica */}
      <div
        className={`${styles.card} ${styles.medica} ${
          isActive("PENDIENTE_DIRECCION_MEDICA") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_DIRECCION_MEDICA")}
      >
        <span className={styles.number}>{direccionMedica.length}</span>
        <span className={styles.label}>Dirección médica</span>
      </div>

      {/* Jurídica */}
      <div
        className={`${styles.card} ${styles.juridica} ${
          isActive("PENDIENTE_ASESORIA_JURIDICA") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_ASESORIA_JURIDICA")}
      >
        <span className={styles.number}>{asesoria.length}</span>
        <span className={styles.label}>Asesoría jurídica</span>
      </div>
    </div>
  );
}
