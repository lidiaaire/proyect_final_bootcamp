import styles from "@/styles/StatusBadge.module.css";
import { getEstadoLabel, getEstadoVariant } from "@/core/constants/estados";

// La variante semántica ("pendiente"/"documentacion"/"revision"/
// "autorizada"/"rechazada"/"default") se traduce a las clases YA
// existentes en StatusBadge.module.css. "revision" no tiene clase propia
// todavía -- se agrupa visualmente con "pendiente" (mismo criterio ya
// usado en Sprint 1C) para no crear un color nuevo en este sprint, que
// es exclusivamente de coherencia funcional, no de rediseño visual.
const VARIANT_TO_CLASS = {
  pendiente: "pendiente",
  documentacion: "documentacion",
  revision: "pendiente",
  autorizada: "autorizada",
  rechazada: "rechazada",
  default: "default",
};

export default function StatusBadge({ status }) {
  const variant = getEstadoVariant(status);
  const claseCss = styles[VARIANT_TO_CLASS[variant]] || styles.default;

  return <span className={`${styles.badge} ${claseCss}`}>{getEstadoLabel(status)}</span>;
}
