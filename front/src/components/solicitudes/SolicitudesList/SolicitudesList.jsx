import { useState } from "react";
import SolicitudItem from "../SolicitudItem/SolicitudItem";
import styles from "../../../styles/SolicitudesList.module.css";

export default function SolicitudesList({
  solicitudes = [],
  filtroEstado,
  setFiltroEstado,
}) {
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

  const ordenEstados = Object.keys(labelEstado);

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
      (s.nombreCompleto || "").toLowerCase().includes(busqueda.toLowerCase()),
    )
    .sort((a, b) => {
      const fechaA = new Date(a.createdAt);
      const fechaB = new Date(b.createdAt);
      return ordenDesc ? fechaB - fechaA : fechaA - fechaB;
    });

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

      {/* Contador */}
      <div className={styles.counter}>
        Mostrando {solicitudesFiltradas.length}{" "}
        {solicitudesFiltradas.length === 1 ? "solicitud" : "solicitudes"}
      </div>

      {/* Tabla */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Asegurado</th>
              <th>Prueba</th>
              <th>Especialidad</th>
              <th>Centro</th>
              <th>Estado</th>
              <th
                className={styles.sortable}
                onClick={() => setOrdenDesc(!ordenDesc)}
              >
                Creada {ordenDesc ? "↓" : "↑"}
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {solicitudesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyState}>
                  No hay solicitudes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              solicitudesFiltradas.map((s) => (
                <SolicitudItem key={s._id} solicitud={s} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className={styles.pagination}>
        <button>‹</button>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <button>›</button>
      </div>
    </div>
  );
}
