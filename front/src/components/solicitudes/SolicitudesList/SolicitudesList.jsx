import { useEffect, useState } from "react";
import { getSolicitudes } from "../../../api/solicitudes";
import SolicitudItem from "../SolicitudItem/SolicitudItem";
import styles from "../../../styles/SolicitudesList.module.css";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroDepartamento, setFiltroDepartamento] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [ordenDesc, setOrdenDesc] = useState(true);

  const labelEstado = {
    PENDIENTE_INICIO_GESTION: "Inicio",
    PENDIENTE_DIRECCION_MEDICA: "Dir. Médica",
    PENDIENTE_ASESORIA_JURIDICA: "Jurídica",
    PENDIENTE_DOCUMENTACION_DEL_ASEGURADO: "Documentación",
    PENDIENTE_REVISION_PRESTACIONES: "Revisión",
    AUTORIZADA: "Autorizadas",
    RECHAZADA: "Rechazadas",
  };

  const ordenEstados = [
    "PENDIENTE_INICIO_GESTION",
    "PENDIENTE_DIRECCION_MEDICA",
    "PENDIENTE_ASESORIA_JURIDICA",
    "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
    "PENDIENTE_REVISION_PRESTACIONES",
    "AUTORIZADA",
    "RECHAZADA",
  ];

  const resumenEstados = solicitudes.reduce((acc, s) => {
    acc[s.estadoInterno] = (acc[s.estadoInterno] || 0) + 1;
    return acc;
  }, {});

  const resumenOrdenado = ordenEstados
    .filter((estado) => resumenEstados[estado])
    .map((estado) => [estado, resumenEstados[estado]]);

  const solicitudesFiltradas = solicitudes
    .filter((s) =>
      filtroEstado === "TODOS" ? true : s.estadoInterno === filtroEstado,
    )
    .filter((s) =>
      filtroDepartamento === "TODOS"
        ? true
        : s.currentDepartment === filtroDepartamento,
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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getSolicitudes(token);
        setSolicitudes(data);
      } catch {
        setErrorMessage("No se pudieron cargar las solicitudes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleKpiClick = (estado) => {
    if (filtroEstado === estado) {
      setFiltroEstado("TODOS");
    } else {
      setFiltroEstado(estado);
    }
  };

  if (isLoading) return <p>Cargando solicitudes...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;
  if (!isLoading && solicitudes.length === 0) {
    return <p>No hay solicitudes disponibles para tu rol.</p>;
  }

  return (
    <div>
      {/* Filtros */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className={styles.filterSelect}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="TODOS">Todos los estados</option>
          {ordenEstados.map((estado) => (
            <option key={estado} value={estado}>
              {labelEstado[estado]}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filtroDepartamento}
          onChange={(e) => setFiltroDepartamento(e.target.value)}
        >
          <option value="TODOS">Todos los departamentos</option>
          <option value="PRESTACIONES">Prestaciones</option>
          <option value="DIRECCION_MEDICA">Dirección médica</option>
          <option value="ASESORIA_JURIDICA">Asesoría jurídica</option>
        </select>
      </div>

      {/* KPI Dashboard */}
      <div className={styles.kpiContainer}>
        {resumenOrdenado.map(([estado, cantidad]) => (
          <div
            key={estado}
            onClick={() => handleKpiClick(estado)}
            className={`${styles.kpiCard} ${
              filtroEstado === estado ? styles.kpiActive : ""
            }`}
          >
            <span className={styles.kpiNumber}>{cantidad}</span>
            <span className={styles.kpiLabel}>{labelEstado[estado]}</span>
          </div>
        ))}
      </div>

      {/* Contador */}
      <div className={styles.counter}>
        Mostrando {solicitudesFiltradas.length}{" "}
        {solicitudesFiltradas.length === 1 ? "solicitud" : "solicitudes"}
      </div>

      {/* Tabla */}
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
