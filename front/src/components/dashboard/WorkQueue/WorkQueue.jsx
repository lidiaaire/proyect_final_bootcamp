import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import buttonStyles from "@/styles/Button.module.css";
import { getAccionesDisponibles } from "@/core/permissions/accionesSolicitud";
import styles from "./WorkQueue.module.css";

function diasDesde(fecha) {
  if (!fecha) return null;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
}

function tiempoRelativo(fecha) {
  const dias = diasDesde(fecha);
  if (dias === null) return "—";
  if (dias < 1) return "hace unas horas";
  if (dias === 1) return "hace 1 día";
  return `hace ${dias} días`;
}

// Etiqueta del botón de fila: no ejecuta la acción in-situ (eso vive en
// el detalle, único lugar donde corre la máquina de estados real) --
// solo comunica, con el vocabulario ya existente de `accionesSolicitud`
// (Sprint 2A), qué hace falta hacer, y navega a la ficha para hacerlo.
function accionFila(rol, solicitud) {
  const acciones = getAccionesDisponibles({ rol, solicitud });
  if (acciones.length === 0) return { label: "Ver detalle", primary: false };
  if (acciones.includes("SOLICITAR_DOCUMENTACION") && solicitud.estadoInterno === "DOCUMENTACION_PENDIENTE")
    return { label: "Solicitar doc.", primary: true };
  return { label: "Revisar", primary: true };
}

export default function WorkQueue({
  title = "Tu bandeja de trabajo",
  tabs,
  activeTab,
  onTabChange,
  items,
  rol,
  sortValue,
  onSortChange,
  emptyText = "No hay solicitudes en esta vista.",
}) {
  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{title}</h3>
        {onSortChange && (
          <label className={styles.sortLabel}>
            Ordenar por
            <select className={styles.sortSelect} value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
              <option value="prioridad">Prioridad</option>
              <option value="recientes">Más recientes</option>
            </select>
          </label>
        )}
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label} <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.rowHead}`}>
            <span>Solicitud</span>
            <span>Asegurado</span>
            <span>Prestación</span>
            <span>Estado</span>
            <span>Actualizada</span>
            <span />
          </div>

          {items.map((s) => {
            const id = s._id || s.id;
            const accion = accionFila(rol, s);

            return (
              <div key={id} className={styles.row}>
                <Link href={`/solicitudes/${id}`} className={styles.numero}>
                  {s.numeroSolicitud || id}
                </Link>
                <span className={styles.cellPrimary}>{s.nombreCompleto}</span>
                <span className={styles.cellSecondary}>{s.nombrePrueba}</span>
                <span>
                  <StatusBadge status={s.estadoInterno} />
                </span>
                <span className={styles.cellFaint}>{tiempoRelativo(s.createdAt)}</span>
                <Link
                  href={`/solicitudes/${id}`}
                  className={
                    accion.primary
                      ? `${buttonStyles.btn} ${buttonStyles.primary} ${styles.rowAction}`
                      : `${buttonStyles.btn} ${buttonStyles.tertiary} ${styles.rowAction}`
                  }
                >
                  {accion.label}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <Link href="/solicitudes" className={styles.viewAllLink}>
          Ver todas las solicitudes →
        </Link>
      )}
    </div>
  );
}
