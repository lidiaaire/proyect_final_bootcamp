import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/SolicitudDetalle.module.css";
import MainLayout from "../../components/layout/MainLayout/MainLayout";

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
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:4000/api/solicitudes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    setSolicitud(data);
  };

  useEffect(() => {
    if (!id) return;
    fetchSolicitud();
  }, [id]);

  const solicitarDocumentacion = async () => {
    if (!comentarioDocs.trim()) {
      alert("Debes indicar el motivo de solicitud de documentación");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:4000/api/solicitudes/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nuevoEstado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
          comentarioDocs: comentarioDocs,
          docsSolicitados: [],
        }),
      });

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
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:4000/api/solicitudes/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nuevoEstado: "PENDIENTE_DIRECCION_MEDICA",
          comentario: comentarioDireccion,
        }),
      });

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
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:4000/api/solicitudes/${id}/autorizar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:4000/api/solicitudes/${id}/rechazar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comentario: motivo,
      }),
    });

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
    <MainLayout>
      {/* MODAL SOLICITAR DOCUMENTACIÓN */}
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

      {/* MODAL DIRECCIÓN MÉDICA */}
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
              {solicitud.historial
                ?.filter(
                  (item) => item.comentario && item.comentario.trim() !== "",
                )
                .slice()
                .reverse()
                .map((item, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteHeader}>{item.changedBy}</div>
                    <div className={styles.noteText}>
                      {mensajesHistorial[item.estado]}
                    </div>
                    <div className={styles.noteText}>
                      &quot;{item.comentario}&quot;
                    </div>
                    <div className={styles.noteDate}>
                      {new Date(item.fecha).toLocaleDateString()}
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
              <strong>Póliza:</strong> {solicitud.numeroPoliza}
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
    </MainLayout>
  );
}
