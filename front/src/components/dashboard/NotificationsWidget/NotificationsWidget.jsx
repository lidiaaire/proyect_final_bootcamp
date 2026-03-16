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
  PRESTACIONES: "Prestaciones",
  ADMIN: "Administración",
  SISTEMA: "Sistema",
};

export default function NotificationsWidget({ actividad = [] }) {
  const notifications = actividad.slice(0, 5).map((item) => {
    return {
      id: item.solicitudId,
      paciente: item.paciente,
      prueba: item.prueba,
      actor: departamentoLabel[item.usuario] || item.usuario || "Sistema",
      accion: item.accion,
      time: timeAgo(item.fecha),
    };
  });

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Actividad reciente</h4>

      <div className={styles.timeline}>
        {notifications.map((n, i) => (
          <Link key={i} href={`/solicitudes/${n.id}`} className={styles.event}>
            <div className={styles.dot}></div>

            <div className={styles.content}>
              <p className={styles.text}>
                <strong>{n.actor}</strong> {n.accion}{" "}
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
