import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { changeEstado } from "../../api/solicitudes";
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
  const [mensajeExito, setMensajeExito] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserRole(getRoleFromToken(token));
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchSolicitud = async () => {
      try {
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
      } catch (error) {
        console.error(error);
      }
    };

    fetchSolicitud();
  }, [id]);

  const handleCambio = async (nuevoEstado) => {
    const confirmacion = window.confirm(
      `¿Estás segura de que quieres marcar como ${nuevoEstado}?`,
    );

    if (!confirmacion) return;

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      const solicitudActualizada = await changeEstado(id, nuevoEstado, token);

      setSolicitud(solicitudActualizada);
      setMensajeExito("Estado actualizado correctamente");

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{solicitud.nombreCompleto}</h1>
          <div className={styles.meta}>
            Póliza {solicitud.numeroPoliza} · DNI {solicitud.dni}
          </div>
        </div>

        <div className={styles.estadoBox}>
          <span className={styles.estadoBadge}>{solicitud.estadoInterno}</span>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineStep}>
          <div
            className={`${styles.timelineCircle} ${
              solicitud.estadoInterno === "PENDIENTE_INICIO_GESTION"
                ? styles.timelineActive
                : ""
            }`}
          ></div>
          <span>Inicio</span>
        </div>

        <div className={styles.timelineStep}>
          <div
            className={`${styles.timelineCircle} ${
              solicitud.estadoInterno ===
              "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO"
                ? styles.timelineActive
                : ""
            }`}
          ></div>
          <span>Documentación</span>
        </div>

        <div className={styles.timelineStep}>
          <div
            className={`${styles.timelineCircle} ${
              solicitud.estadoInterno === "PENDIENTE_DIRECCION_MEDICA"
                ? styles.timelineActive
                : ""
            }`}
          ></div>
          <span>Dirección Médica</span>
        </div>

        <div className={styles.timelineStep}>
          <div
            className={`${styles.timelineCircle} ${
              solicitud.estadoInterno === "PENDIENTE_ASESORIA_JURIDICA"
                ? styles.timelineActive
                : ""
            }`}
          ></div>
          <span>Asesoría Jurídica</span>
        </div>

        <div className={styles.timelineStep}>
          <div
            className={`${styles.timelineCircle} ${
              solicitud.estadoInterno === "AUTORIZADA" ||
              solicitud.estadoInterno === "RECHAZADA"
                ? styles.timelineActive
                : ""
            }`}
          ></div>
          <span>Resolución</span>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className={styles.detailGrid}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.leftColumn}>
          {/* DOCUMENTACIÓN */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Documentación aportada</div>

              <span className={styles.docCount}>
                {solicitud.documentos?.length || 0} archivos
              </span>
            </div>

            {!solicitud.documentos || solicitud.documentos.length === 0 ? (
              <div className={styles.emptyDocs}>
                No hay documentación aportada todavía
              </div>
            ) : (
              <div className={styles.docsList}>
                {solicitud.documentos.map((doc, index) => (
                  <div key={index} className={styles.docItem}>
                    <div className={styles.docInfo}>
                      <div className={styles.docName}>📄 {doc.nombre}</div>

                      <div className={styles.docMeta}>
                        {doc.subidoPor || "Asegurado"} •{" "}
                        {doc.fecha &&
                          new Date(doc.fecha).toLocaleDateString("es-ES")}
                      </div>
                    </div>

                    <button
                      className={styles.docButton}
                      onClick={() => window.open(doc.url, "_blank")}
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            )}

            {solicitud.estadoInterno === "PENDIENTE_INICIO_GESTION" && (
              <div className={styles.docsActions}>
                <button
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() =>
                    handleCambio("PENDIENTE_DOCUMENTACION_DEL_ASEGURADO")
                  }
                >
                  Solicitar más documentación
                </button>

                <button
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={() => handleCambio("PENDIENTE_DIRECCION_MEDICA")}
                >
                  Enviar a Dirección Médica
                </button>
              </div>
            )}
          </div>

          {/* NOTAS */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Notas internas</div>

            <div className={styles.notesFeed}>
              {solicitud.notas?.length === 0 && (
                <div className={styles.emptyNotes}>No hay notas todavía</div>
              )}

              {solicitud.notas?.map((nota, index) => (
                <div key={index} className={styles.noteItem}>
                  <div className={styles.noteHeader}>
                    <strong>{nota.autor}</strong>

                    <span className={styles.noteDate}>
                      {new Date(nota.fecha).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  <div className={styles.noteText}>{nota.texto}</div>
                </div>
              ))}
            </div>

            <div className={styles.noteInputBox}>
              <input
                className={styles.noteInput}
                placeholder="Escribir nota interna..."
              />

              <button className={styles.buttonPrimary}>Añadir</button>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Actividad del caso</div>

            <div className={styles.activityFeed}>
              {[...solicitud.historial].reverse().map((entry, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityHeader}>
                      <strong>{entry.changedBy}</strong>
                      <span className={styles.activityDate}>
                        {new Date(entry.fecha).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className={styles.activityText}>
                      Cambió el estado a <strong>{entry.estado}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>{" "}
        {/* <-- Cierra leftColumn */}
        {/* COLUMNA DERECHA */}
        <div className={styles.rightColumn}>
          {/* ASEGURADO */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Información del asegurado</div>

            <div className={styles.row}>
              <strong>Nombre:</strong> {solicitud.nombreCompleto}
            </div>

            <div className={styles.row}>
              <strong>Póliza:</strong> {solicitud.numeroPoliza}
            </div>

            <div className={styles.row}>
              <strong>DNI:</strong> {solicitud.dni}
            </div>
          </div>

          {/* INFORMACIÓN MÉDICA */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Información médica</div>

            <div className={styles.row}>
              <strong>Prueba:</strong> {solicitud.nombrePrueba}
            </div>

            <div className={styles.row}>
              <strong>Especialidad:</strong> {solicitud.especialidad}
            </div>

            <div className={styles.row}>
              <strong>Centro:</strong> {solicitud.centroMedico}
            </div>
          </div>

          {/* ACCIONES */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Acciones</div>

            {mensajeExito && (
              <div className={styles.successMessage}>{mensajeExito}</div>
            )}

            {solicitud.currentDepartment === userRole &&
              solicitud.estadoInterno !== "AUTORIZADA" &&
              solicitud.estadoInterno !== "RECHAZADA" && (
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    onClick={() => handleCambio("AUTORIZADA")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Autorizar"}
                  </button>

                  <button
                    className={`${styles.button} ${styles.buttonDanger}`}
                    onClick={() => handleCambio("RECHAZADA")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Rechazar"}
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
