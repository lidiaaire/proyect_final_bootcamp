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
  const [docsSolicitados, setDocsSolicitados] = useState([]);
  const [comentarioDocs, setComentarioDocs] = useState("");

  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [comentarioDireccion, setComentarioDireccion] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
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
          docsSolicitados,
          comentarioDocs,
        }),
      });

      setDocsSolicitados([]);
      setComentarioDocs("");
      setShowDocModal(false);
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
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:4000/api/solicitudes/${id}/autorizar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchSolicitud();
  };

  const rechazarSolicitud = async () => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:4000/api/solicitudes/${id}/rechazar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchSolicitud();
  };

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <MainLayout>
      {/* HEADER */}
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

          {/* TIMELINE */}
          <div className={styles.timeline}>
            <div className={styles.timelineStep}>Inicio</div>
            <div className={styles.timelineStep}>Documentación</div>
            <div className={styles.timelineStep}>Dirección Médica</div>
            <div className={styles.timelineStep}>Asesoría Jurídica</div>
            <div className={styles.timelineStep}>Resolución</div>
          </div>
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Documentación aportada</div>
              <span className={styles.docCount}>
                {solicitud.documentos?.length || 0} archivos
              </span>
            </div>

            <div className={styles.docsList}>
              {solicitud.documentos?.map((doc, index) => (
                <div key={index} className={styles.docItem}>
                  <div className={styles.docInfo}>
                    <div className={styles.docName}>📄 {doc.nombre}</div>
                    <div className={styles.docMeta}>
                      {doc.subidoPor || "ASEGURADO"}
                    </div>
                  </div>

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

          {/* ACTIVIDAD */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Actividad del caso</div>

            <div className={styles.activityFeed}>
              {(solicitud.historial || [])
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityDot}></div>

                    <div className={styles.activityContent}>
                      <strong>{entry.changedBy}</strong> cambió el estado a{" "}
                      <b>{entry.estado}</b>
                      {entry.comentario && (
                        <div>
                          Comentario: <b>{entry.comentario}</b>
                        </div>
                      )}
                      <span className={styles.activityDate}>
                        {entry.fecha &&
                          new Date(entry.fecha).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className={styles.rightColumn}>
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

          {!["AUTORIZADA", "RECHAZADA"].includes(solicitud.estadoInterno) && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Acciones</div>

              <button
                className={`${styles.button} ${styles.buttonSuccess}`}
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
          )}
        </div>
      </div>
    </MainLayout>
  );
}
