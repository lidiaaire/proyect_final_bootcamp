import styles from "@/styles/NotificationsWidget.module.css";
import Link from "next/link";
import { CheckCircle2, XCircle, FileText, Send, PlusCircle, History } from "lucide-react";

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

// Título + icono por tipo de evento real de historial (Sprint 1A) --
// vocabulario honesto de lo que ocurrió, no una reinterpretación.
const EVENTO_POR_ACCION = {
  AUTORIZAR: { titulo: "Solicitud autorizada", Icon: CheckCircle2, tone: "success" },
  RECHAZAR: { titulo: "Solicitud rechazada", Icon: XCircle, tone: "danger" },
  SOLICITAR_DOCUMENTACION: { titulo: "Documentación solicitada", Icon: FileText, tone: "info" },
  ENVIAR_DIRECCION_MEDICA: { titulo: "Derivada a Dirección médica", Icon: Send, tone: "neutral" },
  ENVIAR_ASESORIA_JURIDICA: { titulo: "Derivada a Asesoría jurídica", Icon: Send, tone: "neutral" },
  CREACION: { titulo: "Nueva solicitud creada", Icon: PlusCircle, tone: "neutral" },
};

export default function NotificationsWidget({ actividad = [] }) {
  const eventos = actividad.slice(0, 6);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h4 className={styles.title}>Actividad reciente</h4>
        <Link href="/solicitudes" className={styles.footerLink}>
          Ver todas
        </Link>
      </div>

      <div className={styles.timeline}>
        {eventos.map((item, i) => {
          const meta = EVENTO_POR_ACCION[item.accionCodigo] || { titulo: "Actualización", Icon: History, tone: "neutral" };
          const { Icon, tone, titulo } = meta;

          return (
            <Link key={i} href={`/solicitudes/${item.solicitudId}`} className={styles.event}>
              <span className={styles.iconDot} style={{ "--tone": `var(--${tone})`, "--tone-bg": `var(--${tone}-bg)` }}>
                <Icon size={14} strokeWidth={2} />
              </span>

              <div className={styles.content}>
                <span className={styles.action}>{titulo}</span>
                <span className={styles.subtitle}>
                  {item.numeroSolicitud} · {item.paciente}
                </span>
                <span className={styles.time}>{timeAgo(item.fecha)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
