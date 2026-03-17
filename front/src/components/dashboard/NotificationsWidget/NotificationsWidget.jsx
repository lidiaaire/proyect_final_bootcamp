import styles from "@/styles/NotificationsWidget.module.css";
import Link from "next/link";
import { ROLE_CONFIG } from "@/core/constants/roles";

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
const normalizeRole = (role) => {
  const map = {
    direccionmedica: "DIRECCION_MEDICA",
    prestaciones: "PRESTACIONES",
    asesoriajuridica: "ASESORIA_JURIDICA",
    admin: "ADMIN",
  };

  return map[role] || role;
};

const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function NotificationsWidget({ actividad = [] }) {
  const notifications = actividad.slice(0, 3).map((item) => {
    const role = normalizeRole(item.usuario);

    return {
      id: item.solicitudId,
      paciente: item.paciente,
      prueba: item.prueba,
      role,
      actor: ROLE_CONFIG[role]?.label || role,
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
            {/* DOT */}
            <div className={styles.dot}></div>

            {/* CONTENT */}
            <div className={styles.content}>
              {/* ROLE */}
              <span className={styles.role}>{n.actor}</span>

              {/* ACTION */}
              <p className={styles.text}>
                <span className={styles.action}>{capitalize(n.accion)}</span>{" "}
                <span className={styles.prueba}>{n.prueba}</span> de{" "}
                <span className={styles.paciente}>{n.paciente}</span>
              </p>

              {/* TIME */}
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
