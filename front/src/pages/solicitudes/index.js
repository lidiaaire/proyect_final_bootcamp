import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout/MainLayout";
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
    <MainLayout>
      <div className={styles.container}>
        <h2>Solicitudes</h2>

        <div className={styles.splitLayout}>
          {/* LISTA DE SOLICITUDES */}
          <div className={styles.listaSolicitudes}>
            <SolicitudesList
              solicitudes={solicitudes}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              solicitudSeleccionada={solicitudSeleccionada}
              setSolicitudSeleccionada={setSolicitudSeleccionada}
            />
          </div>

          {/* DETALLE DE SOLICITUD */}
          <div className={styles.detalleSolicitud}>
            {!solicitudSeleccionada && (
              <div className={styles.emptyState}>
                Selecciona una solicitud para ver el detalle
              </div>
            )}

            {solicitudSeleccionada && (
              <SolicitudPreview solicitud={solicitudSeleccionada} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
