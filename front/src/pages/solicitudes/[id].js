import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/SolicitudDetalle.module.css";

import {
  getRequest,
  requestMoreDocs,
  sendToMedicalDirection,
  authorizeRequest,
  rejectRequest,
} from "../../api/requestsApi";

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
    const data = await getRequest(id);
    console.log("DATA API:", data);
    setSolicitud(data);
  };

  useEffect(() => {
    if (!id) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSolicitud();
  }, [id]);

  const solicitarDocumentacion = async () => {
    if (!comentarioDocs.trim()) {
      alert("Debes indicar el motivo de solicitud de documentación");
      return;
    }

    try {
      await requestMoreDocs(id, comentarioDocs);

      setShowDocModal(false);
      setComentarioDocs("");
      await fetchSolicitud();
    } catch (error) {
      console.error(error);
    }
  };

  const enviarDireccionMedica = async () => {
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
  };

  const autorizarSolicitud = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que quieres autorizar esta solicitud?",
    );

    if (!confirmar) return;

    await authorizeRequest(id);

    await fetchSolicitud();

    alert(
      "Solicitud autorizada correctamente. Se ha enviado la autorización al asegurado.",
    );
  };

  const rechazarSolicitud = async () => {
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
  };

  const mensajesHistorial = {
    PENDIENTE_DOCUMENTACION_DEL_ASEGURADO:
      "solicitó documentación al asegurado:",
    PENDIENTE_DIRECCION_MEDICA: "envió el caso a Dirección Médica:",
  };

  const documentoAutorizacion =
    solicitud?.documentos?.find((doc) => doc.tipo === "AUTORIZACION") || null;

  const rechazo = solicitud?.historial
    ?.slice()
    .reverse()
    .find((item) => item.estado === "RECHAZADA");

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <>
      {showDocModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Solicitar documentación adicional</h3>

            <textarea
              placeholder="Indica el motivo o documentación requerida"
              value={comentarioDocs}
              onChange={(e) => setComentarioDocs(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setShowDocModal(false)}
              >
                Cancelar
              </button>

              <button
                className={styles.buttonPrimary}
                onClick={solicitarDocumentacion}
              >
                Solicitar documentación
              </button>
            </div>
          </div>
        </div>
      )}

      {showDireccionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Enviar a Dirección Médica</h3>

            <textarea
              placeholder="Indica el motivo de la consulta médica"
              value={comentarioDireccion}
              onChange={(e) => setComentarioDireccion(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setShowDireccionModal(false)}
              >
                Cancelar
              </button>

              <button
                className={styles.buttonPrimary}
                onClick={enviarDireccionMedica}
              >
                Enviar a Dirección Médica
              </button>
            </div>
          </div>
        </div>
      )}

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

      {documentoAutorizacion && (
        <div className={styles.autorizacionBox}>
          <div className={styles.autorizacionInfo}>
            📄 Documento de autorización disponible
          </div>

          <button
            className={styles.buttonPrimary}
            onClick={() =>
              window.open(
                `http://localhost:4000${documentoAutorizacion.url}`,
                "_blank",
              )
            }
          >
            Descargar autorización
          </button>
        </div>
      )}

      {rechazo && (
        <div className={styles.rechazoBox}>
          <div className={styles.rechazoTitle}>❌ Solicitud rechazada</div>

          <div className={styles.rechazoMotivo}>
            Motivo: &quot;{rechazo.comentario}&quot;
          </div>
        </div>
      )}

      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Documentación aportada</div>

            <div className={styles.docsList}>
              {solicitud.documentos?.map((doc, index) => {
                const fileMap = {
                  "Informe médico": "informe_medico.pdf",
                  "Solicitud médica": "prescripcion_medica.pdf",
                };

                const file = fileMap[doc.nombre];

                return (
                  <div key={index} className={styles.docItem}>
                    <span>{doc.nombre}</span>

                    <button
                      className={styles.docButton}
                      onClick={() =>
                        window.open(
                          `http://localhost:4000/docs/${file}`,
                          "_blank",
                        )
                      }
                    >
                      Ver
                    </button>
                  </div>
                );
              })}
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
                    <strong>{item.usuario}</strong> cambió el estado a{" "}
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
              {solicitud.notasInternas
                ?.slice()
                .reverse()
                .map((nota, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteHeader}>{nota.usuario}</div>

                    <div className={styles.noteText}>{nota.texto}</div>

                    <div className={styles.noteDate}>
                      {new Date(nota.fecha).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Información del asegurado</div>

            <div>
              <strong>Nombre:</strong> {solicitud.nombreCompleto}
            </div>

            <div>
              <strong>Póliza:</strong> {solicitud.poliza}
            </div>

            <div>
              <strong>DNI:</strong> {solicitud.dni}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Información médica</div>

            <div>
              <strong>Prueba:</strong> {solicitud.nombrePrueba}
            </div>

            <div>
              <strong>Especialidad:</strong> {solicitud.especialidad}
            </div>

            <div>
              <strong>Centro:</strong> {solicitud.centroMedico}
            </div>
          </div>

          {!["AUTORIZADA", "RECHAZADA"].includes(solicitud.estadoInterno) && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Acciones</div>

              <div className={styles.actions}>
                <button
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={autorizarSolicitud}
                >
                  Autorizar
                </button>

                <button
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={rechazarSolicitud}
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
