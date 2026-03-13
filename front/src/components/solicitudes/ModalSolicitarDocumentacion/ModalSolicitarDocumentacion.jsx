import { useState } from "react";
import styles from "@/styles/SolicitudDetalle.module.css";

export default function ModalSolicitarDocumentacion({
  isOpen,
  onClose,
  onEnviar,
}) {
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);

  if (!isOpen) return null;

  const toggleDocumento = (doc) => {
    setDocumentosSeleccionados((prev) => {
      if (prev.includes(doc)) {
        return prev.filter((d) => d !== doc);
      }
      return [...prev, doc];
    });
  };

  const handleEnviar = () => {
    onEnviar(documentosSeleccionados);
    setDocumentosSeleccionados([]);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Solicitar documentación</h3>

        <p>Selecciona los documentos que faltan:</p>

        <div className={styles.checkboxList}>
          <label>
            <input
              type="checkbox"
              onChange={() => toggleDocumento("informe_medico")}
            />
            Informe médico
          </label>

          <label>
            <input
              type="checkbox"
              onChange={() => toggleDocumento("prescripcion_medica")}
            />
            Prescripción médica
          </label>

          <label>
            <input
              type="checkbox"
              onChange={() => toggleDocumento("historia_clinica")}
            />
            Historia clínica
          </label>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancelar</button>

          <button onClick={handleEnviar}>Enviar solicitud</button>
        </div>
      </div>
    </div>
  );
}
