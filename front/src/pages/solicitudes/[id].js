import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { changeEstado } from "../../api/solicitudes";
import styles from "../../styles/SolicitudDetalle.module.css";
import MainLayout from "../../components/layout/MainLayout/MainLayout";

export default function SolicitudDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [solicitud, setSolicitud] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole(payload.role);
    } catch (error) {
      console.error("Token inválido");
      router.push("/login");
    }
  }, [router]);

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

  if (!solicitud) return <p>Cargando...</p>;

  const handleCambio = async (nuevoEstado) => {
    const confirmacion = window.confirm(
      `¿Estás segura de que quieres marcar como ${nuevoEstado}?`,
    );

    if (!confirmacion) return;

    try {
      setIsLoading(true);

      const solicitudActualizada = await changeEstado(id, nuevoEstado);

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

  return (
    <MainLayout>
      <h1>Detalle de Solicitud</h1>

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

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Estado actual</div>
        <div className={styles.row}>
          <strong>Estado:</strong> {solicitud.estadoInterno}
        </div>

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

      <h2>Historial de cambios</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Cambiado por</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {[...solicitud.historial].reverse().map((entry, index) => (
            <tr key={index}>
              <td>{entry.estado}</td>
              <td>{entry.changedBy}</td>
              <td>
                {new Date(entry.fecha).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
}
