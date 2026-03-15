import { useState } from "react";
import { useRouter } from "next/router";
import ModalSolicitarDocumentacion from "../ModalSolicitarDocumentacion/ModalSolicitarDocumentacion";
import ModalRechazarSolicitud from "../ModalRechazarSolicitud/ModalRechazarSolicitud";
import PDFViewer from "@/components/ui/PDFViewer/PDFViewer";
import ActivityTimeline from "@/components/ui/ActivityTimeLine/ActivityTimeLine";
import styles from "@/styles/SolicitudPreview.module.css";

export default function SolicitudPreview({ solicitud }) {
  const [mostrarModalDocs, setMostrarModalDocs] = useState(false);
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function autorizarSolicitud() {
    try {
      await fetch(
        `http://localhost:4000/api/solicitudes/${solicitud._id}/autorizar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Solicitud autorizada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error autorizando la solicitud");
    }
  }

  async function handleEnviarDocumentos(documentos) {
    try {
      await fetch(
        `http://localhost:4000/api/solicitudes/${solicitud._id}/solicitar-documentacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentosSolicitados: documentos,
          }),
        },
      );

      setMostrarModalDocs(false);
      alert("Documentación solicitada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error solicitando documentación");
    }
  }

  async function handleRechazarSolicitud(data) {
    try {
      await fetch(
        `http://localhost:4000/api/solicitudes/${solicitud._id}/rechazar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      setMostrarModalRechazo(false);
      alert("Solicitud rechazada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error rechazando solicitud");
    }
  }

  return (
    <div className={styles.previewContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{solicitud.nombreCompleto}</h2>

          <div className={styles.meta}>
            Póliza {solicitud.numeroPoliza} · {solicitud.nombrePrueba}
          </div>

          <span className={styles.estadoBadge}>{solicitud.estadoInterno}</span>
        </div>

        {/* BOTÓN ABRIR CASO COMPLETO */}
        <button
          className={styles.buttonOpen}
          onClick={() => router.push(`/solicitudes/${solicitud._id}`)}
        >
          Abrir caso completo
        </button>
      </div>

      {/* ACCIONES */}
      <div className={styles.actions}>
        <button onClick={autorizarSolicitud} className={styles.buttonPrimary}>
          Autorizar
        </button>

        <button
          onClick={() => setMostrarModalDocs(true)}
          className={styles.buttonSecondary}
        >
          Solicitar documentación
        </button>

        <button
          onClick={() => setMostrarModalRechazo(true)}
          className={styles.buttonDanger}
        >
          Rechazar
        </button>
      </div>

      {/* GRID INFO */}
      <div className={styles.grid}>
        {/* DOCUMENTOS */}
        <div className={styles.card}>
          <h3>Documentos</h3>

          {solicitud.documentos?.length === 0 && (
            <div>No hay documentos disponibles</div>
          )}

          {solicitud.documentos?.map((doc, index) => (
            <div key={index} className={styles.docItem}>
              <span>📄 {doc.nombre}</span>

              <button
                onClick={() => setDocumentoSeleccionado(doc.url)}
                className={styles.docButton}
              >
                Ver
              </button>
            </div>
          ))}
        </div>

        {/* ACTIVIDAD */}
        <div className={styles.card}>
          <h3>Actividad</h3>

          <ActivityTimeline historial={solicitud.historial || []} />
        </div>
      </div>

      {/* VISOR PDF */}
      {documentoSeleccionado && (
        <div className={styles.viewer}>
          <PDFViewer url={`http://localhost:4000${documentoSeleccionado}`} />
        </div>
      )}

      {/* MODALES */}
      <ModalSolicitarDocumentacion
        isOpen={mostrarModalDocs}
        onClose={() => setMostrarModalDocs(false)}
        onEnviar={handleEnviarDocumentos}
      />

      <ModalRechazarSolicitud
        isOpen={mostrarModalRechazo}
        onClose={() => setMostrarModalRechazo(false)}
        onConfirm={handleRechazarSolicitud}
      />
    </div>
  );
}
