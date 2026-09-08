import { useState } from "react";
import styles from "./ActionModal.module.css";
import buttonStyles from "@/styles/Button.module.css";

// Modal único y reutilizable (Sprint 2D) para las 5 acciones de negocio
// sobre una solicitud -- sustituye a prompt()/alert() y a los dos
// modales antiguos (ModalSolicitarDocumentacion, ModalRechazarSolicitud,
// ya retirados por quedar obsoletos). No decide qué acción es válida:
// eso lo sigue haciendo exclusivamente core/permissions/accionesSolicitud.js
// (Sprint 2A) antes de que este modal pueda abrirse.
export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  motivos, // opcional: [{ value, label }] -- si se da, se pide elegir uno (p. ej. Rechazar)
  placeholder = "Comentario (opcional)",
  requireComentario = false,
  confirmLabel = "Confirmar",
  tone = "primary", // "primary" | "danger"
  submitting = false,
}) {
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (motivos && !motivo) {
      setErrorLocal("Selecciona un motivo.");
      return;
    }
    if (requireComentario && !comentario.trim()) {
      setErrorLocal("Este campo es obligatorio.");
      return;
    }

    const motivoLabel = motivos?.find((m) => m.value === motivo)?.label;
    const justificacion = [motivoLabel, comentario.trim()].filter(Boolean).join(": ") || comentario.trim();

    onConfirm({ justificacion, motivo, comentario: comentario.trim() });
  };

  const handleClose = () => {
    setMotivo("");
    setComentario("");
    setErrorLocal("");
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}

        {motivos && (
          <div className={styles.motivos}>
            {motivos.map((m) => (
              <label key={m.value} className={styles.motivoOption}>
                <input
                  type="radio"
                  name="motivo"
                  value={m.value}
                  checked={motivo === m.value}
                  onChange={() => setMotivo(m.value)}
                />
                {m.label}
              </label>
            ))}
          </div>
        )}

        <textarea
          className={styles.textarea}
          placeholder={placeholder}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        {errorLocal && <p className={styles.error}>{errorLocal}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${buttonStyles.btn} ${buttonStyles.secondary}`}
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`${buttonStyles.btn} ${tone === "danger" ? styles.dangerBtn : buttonStyles.primary}`}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Enviando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
