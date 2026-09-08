import { useState } from "react";
import Link from "next/link";
import { Activity, Copy, Check, MoreHorizontal } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import buttonStyles from "@/styles/Button.module.css";
import { getEstadoVariant } from "@/core/constants/estados";
import { getAccionesDisponibles } from "@/core/permissions/accionesSolicitud";
import { ROLE_CONFIG } from "@/core/constants/roles";
import styles from "./SolicitudItem.module.css";

// Acento lateral por fila -- mismo `getEstadoVariant` que StatusBadge
// (Sprint 2A), sin inventar ninguna variante nueva.
const TONE_BY_VARIANT = {
  pendiente: "warning",
  revision: "warning",
  documentacion: "info",
  autorizada: "success",
  rechazada: "danger",
  default: "neutral",
};

// Icono de la columna "Prestación": categorización puramente visual
// sobre el propio `nombrePrueba` real (no añade ningún dato). Cualquier
// prueba no reconocida cae en el icono genérico.
function iconoPrestacion() {
  return Activity;
}

function tiempoRelativo(fecha) {
  if (!fecha) return "—";
  const ms = Date.now() - new Date(fecha).getTime();
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Etiqueta de la acción de fila: no ejecuta nada in-situ -- solo indica,
// con el vocabulario ya existente de `accionesSolicitud` (Sprint 2A),
// si hace falta actuar, y enlaza a la ficha (único lugar donde corre la
// máquina de estados real).
function accionFila(rol, solicitud) {
  const acciones = getAccionesDisponibles({ rol, solicitud });
  if (acciones.length === 0) return { label: "Ver detalle", urgent: false };
  return { label: "Revisar", urgent: true };
}

export default function SolicitudItem({ solicitud, rol }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const {
    numeroSolicitud,
    nombreCompleto,
    dni,
    numeroPoliza,
    nombrePrueba,
    especialidad,
    estadoInterno,
    currentDepartment,
    createdAt,
  } = solicitud;

  const id = solicitud._id || solicitud.id;
  const Icon = iconoPrestacion();
  const tone = TONE_BY_VARIANT[getEstadoVariant(estadoInterno)] || "neutral";
  const responsable = ROLE_CONFIG[currentDepartment];
  const accion = accionFila(rol, solicitud);

  async function copiarNumero(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(numeroSolicitud || id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // portapapeles no disponible (permiso/entorno) -- se ignora, sin romper la UI
    }
    setMenuAbierto(false);
  }

  return (
    <div className={styles.row} style={{ "--row-accent": `var(--${tone})` }}>
      <Link href={`/solicitudes/${id}`} className={styles.numeroCol}>
        <span className={styles.numero}>{numeroSolicitud || `#${String(id).slice(-5)}`}</span>
        <span className={styles.fecha}>{createdAt ? formatDate(createdAt) : "—"}</span>
      </Link>

      <Link href={`/solicitudes/${id}`} className={styles.aseguradoCol}>
        <span className={styles.avatar}>{nombreCompleto ? nombreCompleto.charAt(0).toUpperCase() : "?"}</span>
        <span className={styles.aseguradoInfo}>
          <span className={styles.nombre}>{nombreCompleto}</span>
          <span className={styles.subdato}>
            {dni || "—"}
            {numeroPoliza ? ` · ${numeroPoliza}` : ""}
          </span>
        </span>
      </Link>

      <Link href={`/solicitudes/${id}`} className={styles.prestacionCol}>
        <span className={styles.prestacionIcon}>
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <span className={styles.prestacionInfo}>
          <span className={styles.prueba}>{nombrePrueba}</span>
          {especialidad && <span className={styles.subdato}>{especialidad}</span>}
        </span>
      </Link>

      <span className={styles.responsableCol}>
        {responsable && <span className={styles.departmentBadge}>{responsable.label}</span>}
      </span>

      <span className={styles.estadoCol}>
        <StatusBadge status={estadoInterno} />
      </span>

      <Link href={`/solicitudes/${id}`} className={styles.tiempoCol}>
        {tiempoRelativo(createdAt)}
      </Link>

      <div className={styles.accionesCol}>
        <Link
          href={`/solicitudes/${id}`}
          className={
            accion.urgent
              ? `${buttonStyles.btn} ${styles.actionUrgent}`
              : `${buttonStyles.btn} ${buttonStyles.tertiary}`
          }
        >
          {accion.label}
        </Link>

        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.menuTrigger}
            aria-label="Más acciones"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuAbierto((v) => !v);
            }}
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>

          {menuAbierto && (
            <div className={styles.menuDropdown} onClick={(e) => e.stopPropagation()}>
              <Link href={`/solicitudes/${id}`} className={styles.menuItem} onClick={() => setMenuAbierto(false)}>
                Ver detalle
              </Link>
              <button type="button" className={styles.menuItem} onClick={copiarNumero}>
                {copiado ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                {copiado ? "Copiado" : "Copiar nº de solicitud"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
