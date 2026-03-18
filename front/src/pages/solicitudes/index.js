// Esta página representa la vista principal de la sección de solicitudes, donde se muestra una lista de todas las solicitudes registradas en el sistema. Utiliza el hook useEffect para cargar los datos de las solicitudes desde la API al montar el componente, y el hook useState para manejar el estado de las solicitudes, el filtro por estado, la solicitud seleccionada y la carga. La página también incluye un sistema de filtrado que permite a los usuarios filtrar las solicitudes por su estado (por ejemplo, "PENDIENTE", "EN PROCESO", "COMPLETADA"), lo que facilita a los usuarios encontrar rápidamente las solicitudes que están buscando. Asegúrate de que los campos utilizados en esta página coincidan con los campos definidos en el backend para garantizar una correcta visualización de la información de las solicitudes.
// La página utiliza estilos definidos en SolicitudesList.module.css para darle una apariencia atractiva y organizada a la lista de solicitudes. La información de cada solicitud se muestra en un formato claro y fácil de leer, con columnas para el número de póliza, el estado, la fecha de creación y un enlace para ver el detalle de la solicitud. Además, al hacer clic en una solicitud, se muestra un panel lateral con el detalle completo de la solicitud utilizando el componente SolicitudPreview. Asegúrate de que los estilos estén correctamente aplicados para mejorar la experiencia del usuario al navegar por la sección de solicitudes y facilitar la identificación rápida de cada solicitud en la lista.

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
        const data = await getSolicitudes(token);
        setSolicitudes(data);
      } catch {
        setErrorMessage("No se pudieron cargar las solicitudes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
