import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import { getSolicitudes } from "@/api/solicitudes"; // Si tienes esta función para traer datos.
import styles from "@/styles/Solicitudes.module.css";

export default function Solicitudes() {
  const router = useRouter();

  // Estado para solicitudes y filtros
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Leer query params de la URL
  const { estado, hoy, tipo, area } = router.query;

  // Traer solicitudes filtradas según query params
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Aquí deberías ajustar tu función de API para traer las solicitudes
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

  // Si está cargando o hay error
  if (isLoading) return <p>Cargando...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  return (
    <div className={styles.container}>
      <h2>Solicitudes</h2>

      {/* Aquí pasas las solicitudes a tu componente que las mostrará */}
      <div className={styles.tableBlock}>
        <SolicitudesList solicitudes={solicitudes} />
      </div>
    </div>
  );
}
