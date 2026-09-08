import { getEstadoLabel } from "@/core/constants/estados";
import styles from "./Timeline.module.css";

const ACCION_LABEL = {
  CREACION: "creó la solicitud",
  SOLICITAR_DOCUMENTACION: "solicitó documentación",
  ENVIAR_DIRECCION_MEDICA: "derivó a Dirección Médica",
  ENVIAR_ASESORIA_JURIDICA: "derivó a Asesoría Jurídica",
  AUTORIZAR: "autorizó la solicitud",
  RECHAZAR: "rechazó la solicitud",
  MIGRACION_ESTADO: "migró el estado",
  NORMALIZACION_DEPARTAMENTO: "normalizó el departamento",
};

// Tono del punto de la línea de tiempo -- deriva de la misma `accion`
// real del historial (Sprint 1A), no de una interpretación nueva:
// autorizar/rechazar destacan en verde/rojo, los eventos de sistema o
// sin acción reconocida quedan neutros, el resto (derivar/solicitar
// documentación) en azul informativo.
const TONE_BY_ACCION = {
  AUTORIZAR: "success",
  RECHAZAR: "danger",
  CREACION: "neutral",
  MIGRACION_ESTADO: "neutral",
  NORMALIZACION_DEPARTAMENTO: "neutral",
};

// Timeline genérico (Sprint 2D), pensado para el historial de una
// solicitud pero sin acoplarse a su forma exacta más allá de los campos
// que ya provee el backend (estadoAnterior, estado, accion, changedBy,
// comentario, fecha). Sustituye a ActivityTimeLine.
export default function Timeline({ eventos = [] }) {
  if (eventos.length === 0) {
    return <p className={styles.empty}>Sin actividad registrada.</p>;
  }

  const ordenados = [...eventos].reverse();

  return (
    <ol className={styles.timeline}>
      {ordenados.map((evento, index) => {
        const estado = evento.estado || evento.estadoNuevo;
        const autor = evento.changedBy || evento.usuario || "Sistema";
        const descripcion = ACCION_LABEL[evento.accion] || `cambió el estado a ${getEstadoLabel(estado)}`;
        const tone = TONE_BY_ACCION[evento.accion] || "info";

        return (
          <li key={index} className={styles.item}>
            <span className={styles.dot} style={{ background: `var(--${tone})` }} />
            <div className={styles.content}>
              <p className={styles.text}>
                <strong>{autor}</strong> {descripcion}
              </p>
              <p className={styles.meta}>
                {evento.fecha ? new Date(evento.fecha).toLocaleString("es-ES") : ""}
              </p>
            </div>
            {evento.comentario && <p className={styles.comment}>{evento.comentario}</p>}
          </li>
        );
      })}
    </ol>
  );
}
