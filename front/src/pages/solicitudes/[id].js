import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/SolicitudDetalle.module.css";

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

export default function SolicitudDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);
  const [nuevaNota, setNuevaNota] = useState("");

  const fetchSolicitud = async () => {
    if (!id) return;
    const data = await getRequest(id);
    setSolicitud(data);
  };

  useEffect(() => {
    if (router.isReady) fetchSolicitud();
  }, [router.isReady, id]);

  /* =========================
     ACCIONES
  ========================= */

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
    const motivo = prompt("Motivo autorización");
    if (!motivo) return;

    await authorizeRequest(id, motivo);
    await fetchSolicitud();
  };

  const handleRechazar = async () => {
    const motivo = prompt("Motivo rechazo");
    if (!motivo) return;

    await rejectRequest(id, motivo);
    await fetchSolicitud();
  };

  if (!solicitud) return <p>Cargando...</p>;

  /* =========================
     TIMELINE VISUAL
  ========================= */

  const timelineSteps = [
    "PENDIENTE_INICIO_GESTION",
    "DOCUMENTACION_SOLICITADA",
    "EN_REVISION",
    "AUTORIZADA",
    "RECHAZADA",
  ];

  const currentStepIndex = timelineSteps.indexOf(
    solicitud.estadoInterno === "PENDIENTE_ASESORIA_JURIDICA"
      ? "EN_REVISION"
      : solicitud.estadoInterno,
  );

  async function handleGuardarNota() {
    if (!nuevaNota.trim()) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:4000/api/solicitudes/${id}/notas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descripcion: nuevaNota,
        }),
      });

      setNuevaNota(""); // limpiar input
      await fetchSolicitud(); // refrescar datos
    } catch (error) {
      console.error("Error guardando nota", error);
    }
  }
  console.log("NOTAS FRONT FINAL:", solicitud.notas);
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

      {/* TIMELINE VISUAL */}
      <div className={styles.timeline}>
        {timelineSteps.map((step, i) => (
          <div key={step} className={styles.timelineStep}>
            <div
              className={`${styles.timelineCircle} ${
                i <= currentStepIndex ? styles.timelineActive : ""
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
          {/* DOCUMENTOS */}
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

                  <button className={styles.docButton}>Ver documento</button>
                </div>
              ))}
            </div>

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

            {solicitud.historial
              ?.slice()
              .reverse()
              .map((item, index) => {
                const estado = item.estadoNuevo || item.estado;
                const usuario = item.changedBy || item.usuario;

                return (
                  <div key={index} className={styles.activityItem}>
                    <strong>{usuario}</strong> cambió el estado a{" "}
                    <b>{getEstadoLabel(estado)}</b>
                  </div>
                );
              })}
          </div>
        </div>

        {/* DERECHA */}
        <div className={styles.rightColumn}>
          {/* NOTAS */}
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

          {/* ACCIONES */}
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
        </div>
      </div>
    </>
  );
}
