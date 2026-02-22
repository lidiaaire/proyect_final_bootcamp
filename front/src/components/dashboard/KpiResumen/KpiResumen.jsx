import styles from "@/styles/KpiResumen.module.css";

export default function KpiResumen({
  solicitudes,
  filtroEstado,
  setFiltroEstado,
}) {
  const hoy = new Date();

  const pendientes = solicitudes.filter((s) =>
    s.estadoInterno.startsWith("PENDIENTE"),
  );

  const autorizadasHoy = solicitudes.filter(
    (s) =>
      s.estadoInterno === "AUTORIZADA" &&
      new Date(s.updatedAt).toDateString() === hoy.toDateString(),
  );

  const rechazadasHoy = solicitudes.filter(
    (s) =>
      s.estadoInterno === "RECHAZADA" &&
      new Date(s.updatedAt).toDateString() === hoy.toDateString(),
  );

  const enRevision = solicitudes.filter(
    (s) => s.estadoInterno === "PENDIENTE_REVISION_PRESTACIONES",
  );

  const isActive = (estado) => filtroEstado === estado;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${styles.principal} ${
          isActive("PENDIENTE_INICIO_GESTION") ? styles.active : ""
        }`}
        onClick={() => setFiltroEstado("PENDIENTE_INICIO_GESTION")}
      >
        <span className={styles.number}>{pendientes.length}</span>
        <span className={styles.label}>Pendientes</span>
      </div>

      <div
        className={`${styles.card} ${styles.success}`}
        onClick={() => setFiltroEstado("AUTORIZADA")}
      >
        <span className={styles.number}>{autorizadasHoy.length}</span>
        <span className={styles.label}>Autorizadas hoy</span>
      </div>

      <div
        className={`${styles.card} ${styles.danger}`}
        onClick={() => setFiltroEstado("RECHAZADA")}
      >
        <span className={styles.number}>{rechazadasHoy.length}</span>
        <span className={styles.label}>Rechazadas hoy</span>
      </div>

      <div
        className={`${styles.card} ${styles.info}`}
        onClick={() => setFiltroEstado("PENDIENTE_REVISION_PRESTACIONES")}
      >
        <span className={styles.number}>{enRevision.length}</span>
        <span className={styles.label}>En revisión</span>
      </div>
    </div>
  );
}
