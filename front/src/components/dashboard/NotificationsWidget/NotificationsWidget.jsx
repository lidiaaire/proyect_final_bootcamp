import styles from "@/styles/NotificationsWidget.module.css";
import Link from "next/link";

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    año: 31536000,
    mes: 2592000,
    día: 86400,
    hora: 3600,
    min: 60,
  };

  for (const key in intervals) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `hace ${value} ${key}${value > 1 ? "s" : ""}`;
    }
  }

  return "hace unos segundos";
}

const departamentoLabel = {
  DIRECCION_MEDICA: "Dirección médica",
  ASESORIA_JURIDICA: "Asesoría jurídica",
};

export default function NotificationsWidget({ actividad = [] }) {
  const notifications = actividad.slice(0, 3).map((item) => {
    let accion = "actualizó";

    if (item.estado === "AUTORIZADA") accion = "autorizó";
    if (item.estado === "RECHAZADA") accion = "rechazó";

    if (item.estado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
      accion = "solicitó documentación para";
    }

    return {
      id: item.solicitudId,
      paciente: item.paciente,
      prueba: item.prueba,
      departamento: departamentoLabel[item.usuario],
      accion,
      time: timeAgo(item.fecha),
    };
  });

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Notificaciones</h4>

      <div className={styles.timeline}>
        {notifications.map((n, i) => (
          <Link key={i} href={`/solicitudes/${n.id}`} className={styles.event}>
            <div className={styles.dot}></div>

            <div className={styles.content}>
              <p className={styles.text}>
                <strong>{n.departamento}</strong> {n.accion}{" "}
                <span className={styles.prueba}>{n.prueba}</span> de{" "}
                <span className={styles.paciente}>{n.paciente}</span>
              </p>

              <span className={styles.time}>{n.time}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        <Link href="/solicitudes">Ver todas</Link>
      </div>
    </div>
  );
}
