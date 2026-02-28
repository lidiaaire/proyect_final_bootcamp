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
      {/* Header del dashboard */}
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Buenos días</h2>
        <p className={styles.dashboardSubtitle}>
          {totalPendientesAntiguos > 0 ? (
            <>
              Tienes <strong>{solicitudes.length}</strong> solicitudes activas
            </>
          ) : (
            <>No tienes solicitudes bloqueadas. Buen ritmo de gestión.</>
          )}
        </p>
      </div>

      {/* Contenedor principal */}
      <div className={styles.dashboardWrapper}>
        {/* KPIs */}
        <div className={styles.kpiSection}>
          <KpiResumen
            solicitudes={solicitudes}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            pendientesAntiguos={totalPendientesAntiguos}
          />
        </div>

        {/* Grid principal */}
        <div className={styles.dashboardGrid}>
          {/* Tabla principal */}
          <div className={styles.tableBlock}>
            <SolicitudesList
              solicitudes={solicitudes}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
            />
          </div>

          {/* Panel derecho */}
          <div className={styles.rightPanel}>
            <button
              className={styles.quickBtn}
              onClick={() =>
                router.push("/solicitudes?estado=pendiente&area=mi")
              }
            >
              <span className={styles.btnIcon}>📥</span>
              Pendientes de mi área
            </button>

            <button
              className={styles.quickBtn}
              onClick={() => router.push("/solicitudes?hoy=true")}
            >
              <span className={styles.btnIcon}>🕒</span>
              En revisión hoy
            </button>

            <button
              className={styles.quickBtn}
              onClick={() => router.push("/solicitudes?tipo=gestionadas")}
            >
              <span className={styles.btnIcon}>📂</span>
              Solicitudes gestionadas
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
