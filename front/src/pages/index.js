import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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

  const solicitudesUrgentes = solicitudes.filter(
    (s) =>
      s.estadoInterno === "PENDIENTE_INICIO_GESTION" ||
      s.estadoInterno === "PENDIENTE_REVISION_PRESTACIONES" ||
      s.estadoInterno === "PENDIENTE_DIRECCION_MEDICA",
  );

  const hoy = new Date();

  const pendientesAntiguos = solicitudes.filter((s) => {
    if (
      s.estadoInterno !== "PENDIENTE_REVISION_PRESTACIONES" &&
      s.estadoInterno !== "PENDIENTE_DIRECCION_MEDICA"
    ) {
      return false;
    }

    const fechaCreacion = new Date(s.createdAt);
    const diferenciaDias = (hoy - fechaCreacion) / (1000 * 60 * 60 * 24);

    return diferenciaDias > 5;
  });

  const totalPendientesAntiguos = pendientesAntiguos.length;

  const totalUrgentes = solicitudesUrgentes.length;

  return (
    <MainLayout>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Buenos días</h2>
        <p className={styles.dashboardSubtitle}>
          {totalPendientesAntiguos > 0 ? (
            <>
              Tienes <strong>{solicitudes.length}</strong> solicitudes
              registradas
            </>
          ) : (
            <>No tienes solicitudes bloqueadas. Buen ritmo de gestión.</>
          )}
        </p>
      </div>

      {/* PANEL ÚNICO */}
      <div className={styles.dashboardCard}>
        {/* KPIs */}
        <KpiResumen
          solicitudes={solicitudes}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          pendientesAntiguos={totalPendientesAntiguos}
        />

        {/* Tabla + filtros (ya vienen dentro de SolicitudesList) */}
        <SolicitudesList
          solicitudes={solicitudes}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
        />
      </div>
    </MainLayout>
  );
}
