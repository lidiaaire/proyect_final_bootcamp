import { useState } from "react";
import styles from "@/styles/SolicitudDetalle.module.css";

export default function ModalRechazarSolicitud({ isOpen, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!motivo) {
      alert("Debes seleccionar un motivo de rechazo");
      return;
    }

    onConfirm({
      motivo,
      comentario,
    });

    setMotivo("");
    setComentario("");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Motivo del rechazo</h3>

        <div className={styles.checkboxList}>
          <label>
            <input
              type="radio"
              name="motivo"
              value="NO_CUBIERTO_POLIZA"
              onChange={(e) => setMotivo(e.target.value)}
            />
            No cubierto por póliza
          </label>

          <label>
            <input
              type="radio"
              name="motivo"
              value="DOCUMENTACION_INSUFICIENTE"
              onChange={(e) => setMotivo(e.target.value)}
            />
            Documentación insuficiente
          </label>

          <label>
            <input
              type="radio"
              name="motivo"
              value="PRUEBA_NO_INDICADA"
              onChange={(e) => setMotivo(e.target.value)}
            />
            Prueba no indicada clínicamente
          </label>
        </div>

        <div style={{ marginTop: "15px" }}>
          <textarea
            placeholder="Comentario adicional (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancelar</button>

          <button onClick={handleConfirm}>Confirmar rechazo</button>
        </div>
      </div>
    </div>
  );
}
