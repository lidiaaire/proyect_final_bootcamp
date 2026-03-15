import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { getSolicitudes } from "@/api/solicitudes";
import KpiResumen from "@/components/dashboard/KpiResumen/KpiResumen";
import styles from "@/styles/Home.module.css";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget/NotificationsWidget";
import TeamWidget from "@/components/dashboard/TeamWidget/TeamWidget";

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
        console.log("SOLICITUDES HOME:", data);
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

  /* -----------------------------
     Lógica de negocio del dashboard
  ----------------------------- */

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

  // ==============================
  // FILTRO DEL DASHBOARD
  // ==============================

  const solicitudesFiltradas =
    filtroEstado === "TODOS"
      ? solicitudes
      : solicitudes.filter((s) => s.estadoInterno === filtroEstado);

  // ==============================
  // ACTIVIDAD RECIENTE (desde historial)
  // ==============================

  // ==============================
  // ACTIVIDAD RECIENTE (desde historial)
  // ==============================

  const actividadReciente = solicitudes
    .flatMap((s) =>
      (s.historial || [])
        .filter((h) => h.changedBy)
        .map((h) => {
          let accion = "actualizó";

          if (h.estado === "AUTORIZADA") accion = "autorizó";
          if (h.estado === "RECHAZADA") accion = "rechazó";
          if (h.estado === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO")
            accion = "solicitó documentación para";

          return {
            solicitudId: s._id,
            paciente: s.nombreCompleto,
            prueba: s.nombrePrueba,
            accion,
            usuario: h.changedBy || h.usuario,
            fecha: h.fecha,
          };
        }),
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <div className={styles.dashboardGrid}>
      {/* COLUMNA IZQUIERDA */}
      <div className={styles.dashboardMain}>
        {/* SALUDO */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeText}>
            <h3>Hola María</h3>

            <p>
              Tienes <strong>{solicitudes.length}</strong> solicitudes activas.
              <br />
              Revisa el estado de las autorizaciones.
            </p>
          </div>

          <Image
            src="/illustrations/medical-team-2.png"
            alt="Equipo médico"
            width={320}
            height={220}
            priority
            className={styles.welcomeIllustration}
          />
        </div>

        {/* KPIs */}
        <div className={styles.dashboardCard}>
          <KpiResumen
            solicitudes={solicitudes}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            pendientesAntiguos={totalPendientesAntiguos}
          />
        </div>

        {/* ÚLTIMAS SOLICITUDES */}
        <div className={styles.recentBlock}>
          <div className={styles.recentHeader}>
            <h3>Últimas solicitudes</h3>
          </div>

          <table className={styles.recentTable}>
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {solicitudesFiltradas.slice(0, 5).map((s) => (
                <tr key={s._id}>
                  <td className={styles.idCell}>
                    <Link href={`/solicitudes/${s._id}`}>
                      {s.numeroSolicitud}
                    </Link>
                  </td>

                  <td>{s.nombreCompleto || "—"}</td>

                  <td>
                    <StatusBadge status={s.estadoInterno} />
                  </td>

                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDEBAR DERECHA */}
      <div className={styles.dashboardSide}>
        <NotificationsWidget actividad={actividadReciente} />

        <TeamWidget />
      </div>
    </div>
  );
}
