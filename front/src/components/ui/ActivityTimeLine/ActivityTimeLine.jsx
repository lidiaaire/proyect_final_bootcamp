import styles from "@/styles/SolicitudDetalle.module.css";

export default function ActivityTimeline({ historial = [] }) {
  if (!historial.length) {
    return <div>No hay actividad registrada</div>;
  }

  const historialOrdenado = [...historial].reverse();

  return (
    <div className={styles.timelineContainer}>
      {historialOrdenado.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineDot}></div>

          <div className={styles.timelineContent}>
            <strong>{item.estado}</strong>

            <div className={styles.timelineMeta}>
              {item.changedBy} · {new Date(item.fecha).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
