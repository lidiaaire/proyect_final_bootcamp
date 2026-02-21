import { useEffect, useState } from "react";
import { getSolicitudes } from "../../../api/solicitudes";
import SolicitudItem from "../SolicitudItem/SolicitudItem";
import styles from "../../../styles/SolicitudesList.module.css";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [ordenDesc, setOrdenDesc] = useState(true);

  const solicitudesFiltradas = solicitudes
    .filter((s) =>
      filtroEstado === "TODOS" ? true : s.estadoInterno === filtroEstado,
    )
    .filter((s) =>
      s.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()),
    )
    .sort((a, b) => {
      const fechaA = new Date(a.createdAt);
      const fechaB = new Date(b.createdAt);

      return ordenDesc ? fechaB - fechaA : fechaA - fechaB;
    });

  useEffect(() => {
    console.log("Fetching solicitudes");
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const data = await getSolicitudes(token);
        console.log("Solicitudes recibidas:", data);
        setSolicitudes(data);
      } catch (error) {
        setErrorMessage("No se pudieron cargar las solicitudes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p>Cargando solicitudes...</p>;

  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  if (!isLoading && solicitudes.length === 0) {
    return <p>No hay solicitudes disponibles para tu rol.</p>;
  }

  return (
    <div>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className={styles.counter}>
        Mostrando {solicitudesFiltradas.length}{" "}
        {solicitudesFiltradas.length === 1 ? "solicitud" : "solicitudes"}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Departamento</th>
            <th
              className={styles.sortable}
              onClick={() => setOrdenDesc(!ordenDesc)}
            >
              Creada {ordenDesc ? "↓" : "↑"}
            </th>
          </tr>
        </thead>
        <tbody>
          {solicitudesFiltradas.map((s) => (
            <SolicitudItem key={s._id} solicitud={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
