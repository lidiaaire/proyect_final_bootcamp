import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import SolicitudPreview from "@/components/solicitudes/SolicitudPreview/SolicitudPreview";
import { getSolicitudes } from "@/api/solicitudes";
import styles from "@/styles/SolicitudesList.module.css";

export default function Solicitudes() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);

  const { estado, hoy, tipo, area } = router.query;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getSolicitudes(token, { estado, hoy, tipo, area });
        setSolicitudes(data);
      } catch {
        setErrorMessage("No se pudieron cargar las solicitudes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [estado, hoy, tipo, area, router]);

  if (isLoading) return <p>Cargando...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  return (
    <div className={styles.container}>
      <h2>Solicitudes</h2>

      <div
        className={
          solicitudSeleccionada ? styles.splitLayout : styles.fullLayout
        }
      >
        <div className={styles.listaSolicitudes}>
          <SolicitudesList
            solicitudes={solicitudes}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            solicitudSeleccionada={solicitudSeleccionada}
            setSolicitudSeleccionada={setSolicitudSeleccionada}
            selectedSolicitudId={selectedSolicitudId}
            setSelectedSolicitudId={setSelectedSolicitudId}
          />
        </div>

        {solicitudSeleccionada && (
          <div className={styles.detalleSolicitud}>
            <SolicitudPreview solicitud={solicitudSeleccionada} />
          </div>
        )}
      </div>
    </div>
  );
}
