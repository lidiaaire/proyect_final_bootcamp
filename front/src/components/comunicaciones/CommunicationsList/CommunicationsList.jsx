import { useState } from "react";
import { Info, RefreshCw, FileWarning, Scale, ClipboardList, MoreHorizontal, Copy, Check, Eye } from "lucide-react";
import buttonStyles from "@/styles/Button.module.css";
import { TIPO_META } from "@/core/constants/channels";
import styles from "@/styles/CommunicationsChannel.module.css";

const ICON_POR_TIPO = {
  informativo: Info,
  actualizacion: RefreshCw,
  normativa: FileWarning,
  legal: Scale,
  protocolo: ClipboardList,
};

export function getTipoMeta(tipo) {
  return TIPO_META[tipo] || { label: tipo || "Comunicado", tone: "neutral" };
}

export function getIconoTipo(tipo) {
  return ICON_POR_TIPO[tipo] || Info;
}

function MessageMenu({ message }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(null);

  async function copiar(campo, valor) {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // portapapeles no disponible -- se ignora sin romper la UI
    }
  }

  return (
    <div className={styles.messageMenuWrap} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={styles.menuTrigger}
        aria-label="Más acciones"
        onClick={() => setAbierto((v) => !v)}
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>

      {abierto && (
        <div className={styles.menuDropdown}>
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              copiar("titulo", message.titulo);
              setAbierto(false);
            }}
          >
            {copiado === "titulo" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
            {copiado === "titulo" ? "Copiado" : "Copiar título"}
          </button>
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              copiar("contenido", message.contenido);
              setAbierto(false);
            }}
          >
            {copiado === "contenido" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
            {copiado === "contenido" ? "Copiado" : "Copiar contenido"}
          </button>
        </div>
      )}
    </div>
  );
}

// Muro de mensajes reales de un canal (GET /api/communications/:canal).
// `tipo` es el único vocabulario real (5 valores, communications.
// controller.js). Cada card es clicable (y tiene además el botón "Ver
// comunicado" explícito) para abrir el mismo mensaje ya cargado en el
// modal de lectura -- no hay una segunda petición ni un endpoint de
// detalle: el propio GET de listado ya trae el `contenido` completo.
export default function CommunicationsList({ messages, onSelect }) {
  if (messages.length === 0) {
    return <p className={styles.emptyState}>No hay comunicados que coincidan con los filtros.</p>;
  }

  return (
    <div className={styles.list}>
      {messages.map((msg, index) => {
        const meta = getTipoMeta(msg.tipo);
        const Icon = getIconoTipo(msg.tipo);
        const fecha = msg.createdAt
          ? new Date(msg.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
          : "Sin fecha";

        return (
          <div
            key={msg._id || index}
            className={styles.messageCard}
            onClick={() => onSelect?.(msg)}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
          >
            <span
              className={styles.messageIcon}
              style={{ background: `var(--${meta.tone}-bg)`, color: `var(--${meta.tone})` }}
            >
              <Icon size={17} strokeWidth={1.75} />
            </span>

            <div className={styles.messageBody}>
              <div className={styles.messageTop}>
                <div className={styles.messageTitleRow}>
                  <h4 className={styles.messageTitle}>{msg.titulo}</h4>
                  <span
                    className={styles.typeBadge}
                    style={{ background: `var(--${meta.tone}-bg)`, color: `var(--${meta.tone})` }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className={styles.messageDate}>{fecha}</span>
              </div>

              <p className={styles.messageContent}>{msg.contenido}</p>

              <div className={styles.messageAuthor}>
                {msg.autor}
                {msg.departamento ? ` · ${msg.departamento}` : ""}
              </div>
            </div>

            <div className={styles.messageActions} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={`${buttonStyles.btn} ${buttonStyles.secondary} ${styles.verBtn}`}
                onClick={() => onSelect?.(msg)}
              >
                <Eye size={14} strokeWidth={1.75} />
                Ver
              </button>
              <MessageMenu message={msg} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
