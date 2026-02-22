import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSolicitudes } from "@/api/solicitudes";
import MainLayout from "@/components/layout/MainLayout/MainLayout";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import KpiResumen from "@/components/dashboard/KpiResumen/KpiResumen";
import AccionInmediata from "@/components/dashboard/AccionInmediata/AccionInmediata";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

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
    <MainLayout>
      <div className={styles.dashboardWrapper}>
        <div className={styles.fullWidth}>
          <KpiResumen
            solicitudes={solicitudes}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
          />
        </div>

        {/* Tabla en columna principal */}
        <SolicitudesList
          solicitudes={solicitudes}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
        />

        {/* Acción inmediata en lateral */}
        <div className={styles.sideColumn}>
          <AccionInmediata solicitudes={solicitudes} />
        </div>
      </div>
    </MainLayout>
  );
}
