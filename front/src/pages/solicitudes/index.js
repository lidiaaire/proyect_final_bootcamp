import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout/MainLayout";
import SolicitudesList from "@/components/solicitudes/SolicitudesList/SolicitudesList";
import { getSolicitudes } from "@/api/solicitudes";
import styles from "@/styles/SolicitudesList.module.css";

export default function Solicitudes() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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

        <div className={styles.tableBlock}>
          <SolicitudesList solicitudes={solicitudes} />
        </div>
      </div>
    </MainLayout>
  );
}
