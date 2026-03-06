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

export default function NotificationsWidget({ solicitudes = [] }) {
  const departmentMap = {
    PRESTACIONES: "Prestaciones",
    DIRECCION_MEDICA: "Dirección médica",
    ASESORIA_JURIDICA: "Asesoría jurídica",
    DOCUMENTACION: "Documentación",
  };

  const deptClass = {
    PRESTACIONES: styles.prestaciones,
    DIRECCION_MEDICA: styles.medica,
    ASESORIA_JURIDICA: styles.juridica,
    DOCUMENTACION: styles.documentacion,
  };

  const notifications = [...solicitudes]

    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    )

    .slice(0, 3)

    .map((s) => {
      let action = "actualizó la solicitud";

      if (s.estadoInterno === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
        action = "solicita documentación del asegurado";
      }

      if (s.estadoInterno === "PENDIENTE_DIRECCION_MEDICA") {
        action = "envió la solicitud a dirección médica";
      }

      if (s.estadoInterno === "PENDIENTE_ASESORIA_JURIDICA") {
        action = "envió la solicitud a asesoría jurídica";
      }

      if (s.estadoInterno === "AUTORIZADA") {
        action = "autorizó la solicitud";
      }

      if (s.estadoInterno === "RECHAZADA") {
        action = "rechazó la solicitud";
      }

      const department = s.currentDepartment || "PRESTACIONES";

      const actor = departmentMap[department];

      const initials = actor
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("");

      return {
        id: s._id,
        numero: s.numeroSolicitud || s._id,
        actor,
        action,
        initials,
        department,
        time: timeAgo(s.updatedAt || s.createdAt),
      };
    });
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h4>Actividad reciente</h4>
          <span className={styles.count}>{notifications.length}</span>
        </div>
      </div>

      <div className={styles.list}>
        {notifications.map((n, i) => (
          <Link key={i} href={`/solicitudes/${n.id}`} className={styles.item}>
            <div className={`${styles.avatar} ${deptClass[n.department]}`}>
              {n.initials}
            </div>

            <div className={styles.content}>
              <div className={styles.topRow}>
                <p className={styles.text}>
                  <strong>{n.actor}</strong> {n.action}
                </p>

                <span className={styles.time}>{n.time}</span>
              </div>

              <span className={styles.code}>Solicitud {n.numero}</span>
            </div>

            <span className={styles.dot}></span>
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        <Link href="/solicitudes">Ver todas</Link>
      </div>
    </div>
  );
}
