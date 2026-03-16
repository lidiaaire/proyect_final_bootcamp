import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/SolicitudDetalle.module.css";

import {
  getRequest,
  requestMoreDocs,
  sendToMedicalDirection,
  authorizeRequest,
  rejectRequest,
} from "@/api/solicitudes";

function getRoleFromToken(token) {
  try {
    if (!token) return "";
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.role || payload.rol || payload.userRole || "";
  } catch {
    return "";
  }
}

export default function SolicitudDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);
  const [userRole, setUserRole] = useState("");

  const [showDocModal, setShowDocModal] = useState(false);
  const [comentarioDocs, setComentarioDocs] = useState("");

  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [comentarioDireccion, setComentarioDireccion] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(getRoleFromToken(token));
  }, []);

  const fetchSolicitud = async () => {
    try {
      const solicitudId = router.query.id;

      if (!solicitudId) return;

      const data = await getRequest(solicitudId);

      console.log("DATA API:", data);

      setSolicitud(data);
    } catch (error) {
      console.error("FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSolicitud();
  }, [router.isReady]);

  async function solicitarDocumentacion() {
    if (!comentarioDocs.trim()) {
      alert("Debes indicar el motivo de solicitud de documentación");
      return;
    }

    try {
      await requestMoreDocs(id, [comentarioDocs]);
      setShowDocModal(false);
      setComentarioDocs("");
      await fetchSolicitud();
    } catch (error) {
      console.error(error);
    }
  }

  async function enviarDireccionMedica() {
    if (!comentarioDireccion.trim()) {
      alert("Debes indicar un motivo para enviarlo a Dirección Médica");
      return;
    }

    try {
      await sendToMedicalDirection(id, comentarioDireccion);
      setComentarioDireccion("");
      setShowDireccionModal(false);
      await fetchSolicitud();
    } catch (error) {
      console.error(error);
    }
  }

  async function autorizarSolicitud() {
    const confirmar = window.confirm(
      "¿Estás seguro de que quieres autorizar esta solicitud?",
    );

    if (!confirmar) return;

    await authorizeRequest(id);
    await fetchSolicitud();

    alert(
      "Solicitud autorizada correctamente. Se ha enviado la autorización al asegurado.",
    );
  }

  async function rechazarSolicitud() {
    const motivo = prompt("Indica el motivo del rechazo");

    if (!motivo || motivo.trim() === "") {
      alert("Debes indicar el motivo del rechazo");
      return;
    }

    const confirmar = window.confirm(
      "¿Seguro que quieres rechazar esta solicitud?",
    );

    if (!confirmar) return;

    await rejectRequest(id, motivo);
    await fetchSolicitud();

    alert("Solicitud rechazada. Se ha enviado la notificación al asegurado.");
  }

  const documentoAutorizacion =
    solicitud?.documentos?.find((doc) => doc.tipo === "AUTORIZACION") || null;

  const rechazo = solicitud?.historial
    ?.slice()
    .reverse()
    .find((item) => item.estado === "RECHAZADA");

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{solicitud.nombreCompleto}</h1>

          <div className={styles.meta}>
            Solicitud {solicitud.numeroSolicitud} · Póliza{" "}
            {solicitud.numeroPoliza} · DNI {solicitud.dni}
          </div>

          <div className={styles.estadoBox}>
            <span className={styles.estadoBadge}>
              {solicitud.estadoInterno}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Documentación aportada</div>

            <div className={styles.docsList}>
              {solicitud.documentos?.map((doc, index) => (
                <div key={index} className={styles.docItem}>
                  <span>{doc.nombre}</span>

                  <button
                    className={styles.docButton}
                    onClick={() =>
                      window.open(`http://localhost:4000${doc.url}`, "_blank")
                    }
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.docsActions}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => setShowDocModal(true)}
              >
                Solicitar más documentación
              </button>

              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={() => setShowDireccionModal(true)}
              >
                Enviar a Dirección Médica
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Actividad del caso</div>

            <div className={styles.activityFeed}>
              {solicitud.historial
                ?.slice()
                .reverse()
                .map((item, index) => (
                  <div key={index} className={styles.activityItem}>
                    <strong>{item.changedBy}</strong> cambió el estado a{" "}
                    <b>{item.estado}</b>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Notas internas</div>

            <div className={styles.notesFeed}>
              {(solicitud.notas || [])
                .slice()
                .reverse()
                .map((nota, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteHeader}>{nota.author}</div>
                    <div className={styles.noteText}>{nota.text}</div>
                    <div className={styles.noteDate}>
                      {new Date(nota.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
