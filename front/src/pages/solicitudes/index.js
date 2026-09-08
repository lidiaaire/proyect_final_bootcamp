import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { getSolicitudes } from "@/api/solicitudes";
import buttonStyles from "@/styles/Button.module.css";

// Bandeja operativa de solicitudes (Sprint 2C). El backend ya filtra por
// rol (Sprint 1B): Prestaciones/Admin reciben todas, Dirección Médica y
// Asesoría Jurídica solo las de su departamento -- esta página no
// duplica esa lógica, solo la presenta. El detalle completo (con las
// acciones reales) vive en /solicitudes/[id]; esta pantalla ya no
// abre un panel dividido con una segunda implementación de las mismas
// acciones (ver auditoría UX/UI, sección 6).
export default function Solicitudes() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puedeCrear, setPuedeCrear] = useState(false);

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }
    setPuedeCrear(user?.role === "PRESTACIONES");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getSolicitudes();
        setSolicitudes(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle="Todas las solicitudes de autorización médica. Prioriza, revisa y da el siguiente paso."
        action={
          puedeCrear && (
            <Link href="/solicitudes/nueva">
              <button className={`${buttonStyles.btn} ${buttonStyles.primary}`}>
                + Nueva solicitud
              </button>
            </Link>
          )
        }
      />

      <SolicitudesList solicitudes={solicitudes} loading={loading} error={error} />
    </div>
  );
}
