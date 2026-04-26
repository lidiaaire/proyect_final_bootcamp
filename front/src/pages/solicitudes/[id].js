import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import styles from "../../styles/SolicitudDetalle.module.css";
import PDFViewer from "@/components/ui/PDFViewer/PDFViewer";

import {
  getRequest,
  requestMoreDocs,
  sendToMedicalDirection,
  authorizeRequest,
  rejectRequest,
  sendToLegal,
} from "@/api/solicitudes";

function getEstadoLabel(estado) {
  const map = {
    PENDIENTE_INICIO_GESTION: "Pendiente de inicio de gestión",
    DOCUMENTACION_SOLICITADA: "Documentación solicitada",
    EN_REVISION: "En revisión",
    AUTORIZADA: "Autorizada",
    RECHAZADA: "Rechazada",
    PENDIENTE_ASESORIA_JURIDICA: "Pendiente asesoría jurídica",
  };
  return map[estado] || estado;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function SolicitudDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);
  const [nuevaNota, setNuevaNota] = useState("");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  // =========================
  // TIMELINE CONFIG (ANTES DE USEEFFECT)
  // =========================

  const timelineSteps = [
    "PENDIENTE_INICIO_GESTION",
    "DOCUMENTACION_SOLICITADA",
    "EN_REVISION",
    "AUTORIZADA",
    "RECHAZADA",
  ];

  const ESTADO_TIMELINE_MAP = {
    PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: "DOCUMENTACION_SOLICITADA",
    PENDIENTE_ASESORIA_JURIDICA: "EN_REVISION",
  };

  const estadoNormalizado = solicitud
    ? ESTADO_TIMELINE_MAP[solicitud.estadoInterno] || solicitud.estadoInterno
    : null;

  const currentStepIndex =
    estadoNormalizado !== null ? timelineSteps.indexOf(estadoNormalizado) : -1;

  // =========================
  // DATA
  // =========================

  const fetchSolicitud = useCallback(async () => {
    if (!id) return;
    const data = await getRequest(id);
    setSolicitud(data);
  }, [id]);

  // =========================
  // EFFECTS (TODOS ARRIBA)
  // =========================

  useEffect(() => {
    if (solicitud) {
      console.log("NOTAS SOLICITUD:", solicitud.notas);
    }
  }, [solicitud]);

  useEffect(() => {
    if (documentoSeleccionado) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [documentoSeleccionado]);

  // 📡 FETCH
  useEffect(() => {
    if (!router.isReady || !id) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    const loadSolicitud = async () => {
      const data = await getRequest(id);

      if (isMounted) {
        setSolicitud(data);
      }
    };

    loadSolicitud();

    return () => {
      isMounted = false;
    };
  }, [router, router.isReady, id]);

  //  DEBUG
  useEffect(() => {
    if (solicitud && estadoNormalizado) {
      if (!timelineSteps.includes(estadoNormalizado)) {
        console.warn(
          "⚠️ Estado no contemplado en timeline:",
          solicitud.estadoInterno,
        );
      }
    }
  }, [solicitud, estadoNormalizado]);

  // =========================
  // ACCIONES
  // =========================

  const handleSolicitarDoc = async () => {
    const motivo = prompt("¿Qué documentación necesitas?");
    if (!motivo) return;

    await requestMoreDocs(id, { justificacion: motivo });
    await fetchSolicitud();
  };

  const handleDireccionMedica = async () => {
    const motivo = prompt("Motivo Dirección Médica");
    if (!motivo) return;

    await sendToMedicalDirection(id, motivo);
    await fetchSolicitud();
  };

  const handleAsesoria = async () => {
    const motivo = prompt("Motivo Asesoría Jurídica");
    if (!motivo) return;

    await sendToLegal(id, motivo);
    await fetchSolicitud();
  };

  const handleAutorizar = async () => {
    try {
      const response = await authorizeRequest(id);
      setSolicitud(response.solicitud);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt("Motivo rechazo");
    if (!motivo) return;

    await rejectRequest(id, motivo);
    await fetchSolicitud();
  };

  const handleGuardarNota = async () => {
    if (!nuevaNota.trim()) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/solicitudes/${id}/notas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descripcion: nuevaNota,
        }),
      });

      setNuevaNota("");
      await fetchSolicitud();
    } catch (error) {
      console.error("Error guardando nota", error);
    }
  };

  // =========================
  // RENDER
  // =========================

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>{solicitud.nombreCompleto}</h1>
          <p>
            Solicitud {solicitud.numeroSolicitud} · Póliza{" "}
            {solicitud.numeroPoliza} · DNI {solicitud.dni}
          </p>

          <span className={styles.estadoBadge}>
            {getEstadoLabel(solicitud.estadoInterno)}
          </span>
        </div>
      </div>

      {/* TIMELINE */}
      <div className={styles.timeline}>
        {timelineSteps.map((step, i) => (
          <div key={step} className={styles.timelineStep}>
            <div
              className={`${styles.timelineCircle} ${
                solicitud.estadoInterno === "AUTORIZADA" ||
                solicitud.estadoInterno === "RECHAZADA"
                  ? timelineSteps[i] === estadoNormalizado
                    ? styles.timelineActive
                    : ""
                  : i <= currentStepIndex
                    ? styles.timelineActive
                    : ""
              }`}
            />
            <span>{getEstadoLabel(step)}</span>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className={styles.detailGrid}>
        {/* IZQUIERDA */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Documentación aportada</h3>
              <span className={styles.docCount}>
                {solicitud.documentos?.length || 0} documentos
              </span>
            </div>

            <div className={styles.docsList}>
              {solicitud.documentos?.map((doc, i) => (
                <div key={i} className={styles.docItem}>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.nombre}</span>
                    <span className={styles.docMeta}>
                      {doc.subidoPor !== "Usuario"
                        ? `Subido por ${doc.subidoPor}`
                        : "Documento adjunto"}
                    </span>
                  </div>

                  <button
                    className={styles.docButton}
                    onClick={() =>
                      setDocumentoSeleccionado(
                        documentoSeleccionado === doc.nombre
                          ? null
                          : doc.nombre,
                      )
                    }
                  >
                    {documentoSeleccionado === doc.nombre
                      ? "Cerrar documento"
                      : "Ver documento"}
                  </button>
                </div>
              ))}
            </div>

            {documentoSeleccionado && (
              <div className={styles.section} style={{ marginTop: "16px" }}>
                <PDFViewer
                  url={`${API_BASE}/docs/${documentoSeleccionado}`}
                />
              </div>
            )}
            <div className={styles.docsActions}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleSolicitarDoc}
              >
                Solicitar documentación
              </button>

              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleDireccionMedica}
              >
                Dirección Médica
              </button>

              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={handleAsesoria}
              >
                Asesoría Jurídica
              </button>
            </div>
          </div>

          {/* ACTIVIDAD */}
          <div className={styles.section}>
            <h3>Actividad del caso</h3>

            {solicitud.historial?.length === 0 && (
              <p className={styles.placeholder}>Sin actividad registrada</p>
            )}

            {solicitud.historial
              ?.slice()
              .reverse()
              .map((item, index) => {
                const estado = item.estadoNuevo || item.estado;
                const usuario = item.changedBy || item.usuario;

                return (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityDot}></div>

                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        <strong>{usuario}</strong> cambió el estado a{" "}
                        <b>{getEstadoLabel(estado)}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* DERECHA */}
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h3>Notas internas</h3>

            <div className={styles.notesFeed}>
              {(solicitud.notas || [])
                .slice()
                .reverse()
                .map((nota, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteHeader}>{nota.author}</div>
                    <div className={styles.noteText}>{nota.text}</div>
                    <div className={styles.noteDate}>
                      {nota.date
                        ? new Date(nota.date).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                ))}
            </div>

            <div className={styles.noteInputBox}>
              <textarea
                className={styles.noteInput}
                placeholder="Escribe una nota..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
              />
              <button
                onClick={handleGuardarNota}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Guardar
              </button>
            </div>
          </div>
          {!["AUTORIZADA", "RECHAZADA"].includes(solicitud.estadoInterno) && (
            <div className={styles.section}>
              <h3>Acciones</h3>

              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={handleAutorizar}
              >
                Autorizar
              </button>

              <button
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={handleRechazar}
              >
                Rechazar
              </button>
            </div>
          )}

          {solicitud.estadoInterno === "AUTORIZADA" &&
            solicitud.autorizacionPdf && (
              <div className={styles.docItem}>
                <div className={styles.docInfo}>
                  <span className={styles.docName}>
                    autorizacion_{solicitud.numeroSolicitud}.pdf
                  </span>
                  <span className={styles.docMeta}>
                    Documento generado automáticamente
                  </span>
                </div>

                <a
                  href={`${API_BASE}${solicitud.autorizacionPdf}`}
                  target="_blank"
                  className={styles.docButton}
                >
                  Ver
                </a>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
