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

/* ==============================
MAPEO VISUAL DE ESTADOS
============================== */

function getEstadoLabel(estado) {
  const map = {
    PENDIENTE_INICIO_GESTION: "Pendiente de inicio de gestión",
    DOCUMENTACION_SOLICITADA: "Documentación solicitada",
    EN_REVISION: "En revisión",
    AUTORIZADA: "Autorizada",
    RECHAZADA: "Rechazada",
  };

  return map[estado] || estado;
}

function formatDocumento(doc) {
  const map = {
    historia_clinica: "Historia clínica",
    informe_especialista: "Informe especialista",
    resultado_pruebas: "Resultado de pruebas",
  };

  return map[doc] || doc;
}

export default function SolicitudDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);
  const [userRole, setUserRole] = useState("");

  const [showDocModal, setShowDocModal] = useState(false);
  const [docsSeleccionados, setDocsSeleccionados] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserRole(getRoleFromToken(token));
  }, []);

  const fetchSolicitud = async () => {
    try {
      if (!id) return;

      const data = await getRequest(id);

      if (!data) {
        alert("La solicitud ya no existe");
        router.push("/solicitudes");
        return;
      }

      setSolicitud(data);
    } catch (error) {
      console.error("FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchSolicitud();
  }, [router.isReady, id]);

  function toggleDocumento(doc) {
    setDocsSeleccionados((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc],
    );
  }

  /* ==============================
  SOLICITAR DOCUMENTACIÓN
  ============================== */

  /* REEMPLAZAR SOLO ESTA FUNCIÓN EN TU PAGE */

  async function confirmarSolicitudDocumentacion() {
    if (docsSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un documento");
      return;
    }

    const justificacion = `Solicitud de documentación: ${docsSeleccionados.join(", ")}`;

    try {
      await requestMoreDocs(id, {
        justificacion,
        documentosSolicitados: docsSeleccionados,
      });

      setShowDocModal(false);
      setDocsSeleccionados([]);
      await fetchSolicitud();
    } catch (error) {
      console.error(error);
    }
  }

  /* ==============================
  ENVIAR A DIRECCIÓN MÉDICA
  ============================== */

  async function enviarDireccionMedica() {
    const motivo = prompt("Indica el motivo para enviar a Dirección Médica");

    if (!motivo || motivo.trim() === "") {
      alert("Debes indicar un motivo");
      return;
    }

    try {
      await sendToMedicalDirection(id, motivo);
      await fetchSolicitud();
    } catch (error) {
      console.error(error);
    }
  }

  /* ==============================
  AUTORIZAR
  ============================== */

  async function autorizarSolicitud() {
    const motivo = prompt("Indica la justificación de la autorización");

    if (!motivo || motivo.trim() === "") {
      alert("Debes indicar un motivo");
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de que quieres autorizar esta solicitud?",
    );

    if (!confirmar) return;

    await authorizeRequest(id, motivo);
    await fetchSolicitud();

    alert(
      "Solicitud autorizada correctamente. Se ha enviado la autorización al asegurado.",
    );
  }

  /* ==============================
  RECHAZAR
  ============================== */

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

    alert("Solicitud rechazada.");
  }

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
              {getEstadoLabel(solicitud.estadoInterno)}
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
                      window.open(
                        `http://localhost:4000/docs/${doc.nombre}`,
                        "_blank",
                      )
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
                onClick={enviarDireccionMedica}
              >
                Enviar a Dirección Médica
              </button>
            </div>
          </div>

          {/* ACTIVIDAD DEL CASO */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Actividad del caso</div>

            <div className={styles.activityFeed}>
              {solicitud.historial
                ?.slice()
                .reverse()
                .map((item, index) => {
                  const estado =
                    item.estadoNuevo || item.estado || "Estado no disponible";

                  return (
                    <div key={index} className={styles.activityItem}>
                      <strong>{item.changedBy?.toUpperCase()}</strong> cambió el
                      estado a <b>{getEstadoLabel(estado)}</b>
                    </div>
                  );
                })}
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
                .map((nota, index) => {
                  const text = nota.text || nota.texto || "";
                  const author = nota.author || nota.autor || "";
                  const date = nota.date || nota.fecha;

                  return (
                    <div key={index} className={styles.noteItem}>
                      <div className={styles.noteHeader}>{author}</div>

                      <div className={styles.noteText}>
                        {text
                          .split(": ")
                          .map((part, i) =>
                            i === 1 ? formatDocumento(part) : part,
                          )
                          .join(": ")}
                      </div>

                      <div className={styles.noteDate}>
                        {date ? new Date(date).toLocaleDateString() : ""}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {solicitud.estadoInterno !== "AUTORIZADA" &&
            solicitud.estadoInterno !== "RECHAZADA" && (
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

      {showDocModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Solicitar documentación adicional</h3>

            <label>
              <input
                type="checkbox"
                onChange={() => toggleDocumento("historia_clinica")}
              />
              Historia clínica
            </label>

            <label>
              <input
                type="checkbox"
                onChange={() => toggleDocumento("informe_especialista")}
              />
              Informe especialista
            </label>

            <label>
              <input
                type="checkbox"
                onChange={() => toggleDocumento("resultado_pruebas")}
              />
              Resultado de pruebas
            </label>

            <div style={{ marginTop: 20 }}>
              <button onClick={() => setShowDocModal(false)}>Cancelar</button>

              <button onClick={confirmarSolicitudDocumentacion}>
                Solicitar documentación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
