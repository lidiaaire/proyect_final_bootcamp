import { useState } from "react";
import ModalSolicitarDocumentacion from "../ModalSolicitarDocumentacion/ModalSolicitarDocumentacion";
import ModalRechazarSolicitud from "../ModalRechazarSolicitud/ModalRechazarSolicitud";
import PDFViewer from "@/components/ui/PDFViewer/PDFViewer";
import ActivityTimeline from "@/components/ui/ActivityTimeLine/ActivityTimeLine";

export default function SolicitudPreview({ solicitud }) {
  const [mostrarModalDocs, setMostrarModalDocs] = useState(false);
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

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
    <div>
      <h2>{solicitud.nombreCompleto}</h2>

      <p>Póliza {solicitud.numeroPoliza}</p>

      <p>{solicitud.nombrePrueba}</p>

      <div>Estado: {solicitud.estadoInterno}</div>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button onClick={autorizarSolicitud}>Autorizar</button>

        <button onClick={() => setMostrarModalDocs(true)}>
          Solicitar documentación
        </button>

        <button onClick={() => setMostrarModalRechazo(true)}>Rechazar</button>
      </div>

      <h3 style={{ marginTop: "30px" }}>Documentos</h3>

      {solicitud.documentos?.length === 0 && (
        <div>No hay documentos disponibles</div>
      )}

      {solicitud.documentos?.map((doc, index) => (
        <div key={index} style={{ marginBottom: "8px" }}>
          📄 {doc.nombre}
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => setDocumentoSeleccionado(doc.url)}
          >
            Ver
          </button>
        </div>
      ))}

      {documentoSeleccionado && (
        <div style={{ marginTop: "20px" }}>
          <PDFViewer url={`http://localhost:4000${documentoSeleccionado}`} />
        </div>
      )}

      <h3 style={{ marginTop: "40px" }}>Actividad</h3>

      <ActivityTimeline historial={solicitud.historial} />

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
