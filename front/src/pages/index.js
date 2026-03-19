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
import { ESTADOS } from "@/core/constants/solicitudEstados";

export default function Home() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuth(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!isAuth) return;

    const fetchData = async () => {
      try {
        const data = await getSolicitudes();
        setSolicitudes(data);
      } catch (error) {
        setErrorMessage("Error cargando solicitudes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuth]);

  if (!isAuth) return null;

  if (loading) return <p>Cargando...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  const hoy = new Date();

  const pendientesAntiguos = solicitudes.filter((s) => {
    if (
      s.estadoInterno !== ESTADOS.PENDIENTE_REVISION_PRESTACIONES &&
      s.estadoInterno !== ESTADOS.PENDIENTE_DIRECCION_MEDICA
    ) {
      return false;
    }

    const fechaCreacion = new Date(s.createdAt);
    const diferenciaDias = (hoy - fechaCreacion) / (1000 * 60 * 60 * 24);

    return diferenciaDias > 5;
  });

  const totalPendientesAntiguos = pendientesAntiguos.length;

  const solicitudesFiltradas =
    filtroEstado === "TODOS"
      ? solicitudes
      : solicitudes.filter((s) => s.estadoInterno === filtroEstado);

  const actividadReciente = solicitudes
    .flatMap((s) => {
      const eventosHistorial = (s.historial || []).map((h) => {
        let accion = "actualizó";

        if (h.estado === ESTADOS.AUTORIZADA) accion = "autorizó";
        if (h.estado === ESTADOS.RECHAZADA) accion = "rechazó";
        if (h.estado === ESTADOS.PENDIENTE_DOCUMENTACION_DEL_ASEGURADO)
          accion = "solicitó documentación para";

        if (h.tipo === "DOCUMENTO_SUBIDO") {
          accion = "subió documentación para";
        }

        return {
          solicitudId: s._id,
          paciente: s.nombreCompleto,
          prueba: s.nombrePrueba,
          accion,
          usuario: h.changedBy,
          fecha: h.fecha,
        };
      });

      const eventoCreacion = {
        solicitudId: s._id,
        paciente: s.nombreCompleto,
        prueba: s.nombrePrueba,
        accion: "creó solicitud para",
        usuario: "SISTEMA",
        fecha: s.createdAt,
      };

      return [eventoCreacion, ...eventosHistorial];
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.dashboardMain}>
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

        <div className={styles.dashboardCard}>
          <KpiResumen
            solicitudes={solicitudes}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            pendientesAntiguos={totalPendientesAntiguos}
          />
        </div>

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

                  <td>
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString("es-ES")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.dashboardSide}>
        <NotificationsWidget actividad={actividadReciente} />
        <TeamWidget />
      </div>
    </div>
  );
}
