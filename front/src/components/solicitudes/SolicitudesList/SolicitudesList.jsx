import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, FileText, CheckCircle2, XCircle, LayoutGrid, Calendar, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import SolicitudItem from "../SolicitudItem/SolicitudItem";
import styles from "../../../styles/SolicitudesList.module.css";
import { ESTADOS, getEstadoLabel, esEstadoFinal } from "@/core/constants/estados";
import { ROLE_CONFIG } from "@/core/constants/roles";

const DEPARTAMENTOS = ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"];
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

function getRolActual() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

// Tabs reales de la bandeja (referencia visual contractual): cada uno es
// un filtro sobre los estados canónicos de la solicitud (Sprint 1A), sin
// introducir ningún estado nuevo -- "Pendientes" agrupa dos estados
// reales (pendiente de gestión + documentación pendiente) como
// conveniencia de filtro, igual que ya hace la bandeja del dashboard.
function getTabsDef(rol) {
  const base = [
    { key: "todas", label: "Todas", icon: LayoutGrid, tone: "neutral", filtro: () => true },
  ];

  if (rol !== "ADMIN") {
    base.push({
      key: "atencion",
      label: "Requieren mi atención",
      icon: AlertTriangle,
      tone: "danger",
      filtro: (s) => !esEstadoFinal(s.estadoInterno) && s.currentDepartment === rol,
    });
  }

  base.push(
    {
      key: "revision",
      label: "En revisión",
      icon: Clock,
      tone: "warning",
      filtro: (s) => s.estadoInterno === ESTADOS.EN_REVISION_MEDICA || s.estadoInterno === ESTADOS.EN_REVISION_JURIDICA,
    },
    {
      key: "pendientes",
      label: "Pendientes",
      icon: FileText,
      tone: "info",
      filtro: (s) => s.estadoInterno === ESTADOS.PENDIENTE_GESTION || s.estadoInterno === ESTADOS.DOCUMENTACION_PENDIENTE,
    },
    {
      key: "autorizadas",
      label: "Autorizadas",
      icon: CheckCircle2,
      tone: "success",
      filtro: (s) => s.estadoInterno === ESTADOS.AUTORIZADA,
    },
    {
      key: "rechazadas",
      label: "Rechazadas",
      icon: XCircle,
      tone: "danger",
      filtro: (s) => s.estadoInterno === ESTADOS.RECHAZADA,
    },
  );

  return base;
}

function diasDesde(fecha) {
  if (!fecha) return 0;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
}

// Ventana de paginación con elipsis (1 2 3 4 5 … N) -- puramente de
// presentación sobre `totalPaginas`, ya calculado con datos reales.
function construirPaginas(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, 2, total - 1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

export default function SolicitudesList({ solicitudes = [], loading, error }) {
  // `rol` depende de localStorage, que no existe durante el render en
  // servidor: se lee en efecto para que la hidratación sea idéntica.
  const [rol, setRol] = useState(null);
  useEffect(() => {
    setRol(getRolActual());
  }, []);

  const tabsDef = useMemo(() => getTabsDef(rol), [rol]);
  const [activeTab, setActiveTab] = useState("todas");

  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroDepartamento, setFiltroDepartamento] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [pageSize, setPageSize] = useState(10);
  const [pagina, setPagina] = useState(1);

  // El filtro de departamento solo aporta algo a quien ve más de un
  // departamento a la vez (Prestaciones/Admin); Dirección Médica y
  // Asesoría Jurídica ya solo ven las suyas.
  const mostrarFiltroDepartamento = rol === "PRESTACIONES" || rol === "ADMIN";

  const labelEstado = Object.fromEntries(
    Object.values(ESTADOS).map((estado) => [estado, getEstadoLabel(estado)]),
  );

  const tabActivo = tabsDef.find((t) => t.key === activeTab) || tabsDef[0];

  const solicitudesFiltradas = solicitudes
    .filter(tabActivo.filtro)
    .filter((s) => (filtroEstado === "TODOS" ? true : s.estadoInterno === filtroEstado))
    .filter((s) =>
      !mostrarFiltroDepartamento || filtroDepartamento === "TODOS"
        ? true
        : s.currentDepartment === filtroDepartamento,
    )
    .filter((s) => {
      if (!fechaDesde) return true;
      return new Date(s.createdAt) >= new Date(fechaDesde);
    })
    .filter((s) => {
      if (!fechaHasta) return true;
      const fin = new Date(fechaHasta);
      fin.setHours(23, 59, 59, 999);
      return new Date(s.createdAt) <= fin;
    })
    .filter((s) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.nombreCompleto || "").toLowerCase().includes(q) ||
        (s.numeroSolicitud || "").toLowerCase().includes(q) ||
        (s.nombrePrueba || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (orden === "antiguas") return new Date(a.createdAt) - new Date(b.createdAt);
      if (orden === "prioridad") return diasDesde(b.createdAt) - diasDesde(a.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt); // recientes
    });

  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / pageSize));

  // Si un filtro/tab/orden deja la página actual fuera de rango, se
  // vuelve a la primera en vez de mostrar una tabla vacía por error.
  useEffect(() => {
    setPagina(1);
  }, [activeTab, filtroEstado, filtroDepartamento, busqueda, fechaDesde, fechaHasta, orden, pageSize]);

  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * pageSize;
  const solicitudesPagina = solicitudesFiltradas.slice(inicio, inicio + pageSize);

  const hayFiltrosActivos =
    filtroEstado !== "TODOS" || filtroDepartamento !== "TODOS" || busqueda !== "" || fechaDesde !== "" || fechaHasta !== "";

  function limpiarFiltros() {
    setFiltroEstado("TODOS");
    setFiltroDepartamento("TODOS");
    setBusqueda("");
    setFechaDesde("");
    setFechaHasta("");
  }

  return (
    <div className={styles.container}>
      {/* Tabs reales */}
      <div className={styles.tabs}>
        {tabsDef.map((tab) => {
          const count = solicitudes.filter(tab.filtro).length;
          const Icon = tab.icon;
          const activa = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${activa ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className={styles.tabIcon} style={!activa ? { color: `var(--${tab.tone})` } : undefined}>
                <Icon size={14} strokeWidth={2} />
              </span>
              {tab.label}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por paciente, prestación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {mostrarFiltroDepartamento && (
          <select
            className={styles.filterSelect}
            value={filtroDepartamento}
            onChange={(e) => setFiltroDepartamento(e.target.value)}
          >
            <option value="TODOS">Todos los departamentos</option>
            {DEPARTAMENTOS.map((dep) => (
              <option key={dep} value={dep}>
                {ROLE_CONFIG[dep]?.label || dep}
              </option>
            ))}
          </select>
        )}

        <select
          className={styles.filterSelect}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="TODOS">Todos los estados</option>
          {Object.values(ESTADOS).map((estado) => (
            <option key={estado} value={estado}>
              {labelEstado[estado]}
            </option>
          ))}
        </select>

        <div className={styles.dateRange}>
          <Calendar size={14} strokeWidth={1.75} className={styles.dateIcon} />
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} aria-label="Desde" />
          <span className={styles.dateSep}>–</span>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} aria-label="Hasta" />
        </div>

        <button
          type="button"
          className={styles.clearButton}
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
        >
          <RotateCcw size={14} strokeWidth={1.75} />
          Limpiar
        </button>
      </div>

      {/* Contador + orden */}
      <div className={styles.counterRow}>
        <span className={styles.counter}>
          {loading
            ? "Cargando solicitudes..."
            : `Mostrando ${solicitudesFiltradas.length === 0 ? 0 : inicio + 1}–${Math.min(inicio + pageSize, solicitudesFiltradas.length)} de ${solicitudesFiltradas.length} solicitudes`}
        </span>

        <label className={styles.sortLabel}>
          Ordenar por
          <select className={styles.sortSelect} value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="antiguas">Más antiguas</option>
            <option value="prioridad">Prioridad (más días)</option>
          </select>
        </label>
      </div>

      {/* Tabla */}
      <div className={styles.tableWrapper}>
        {error ? (
          <p className={styles.emptyState}>{error}</p>
        ) : loading ? (
          <p className={styles.emptyState}>Cargando solicitudes...</p>
        ) : solicitudesPagina.length === 0 ? (
          <p className={styles.emptyState}>No hay solicitudes que coincidan con los filtros.</p>
        ) : (
          <div className={styles.rows}>
            {solicitudesPagina.map((s) => (
              <SolicitudItem key={s._id || s.id} solicitud={s} rol={rol} />
            ))}
          </div>
        )}
      </div>

      {/* Paginación real */}
      {!loading && !error && solicitudesFiltradas.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageArrow}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaSegura === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          {construirPaginas(paginaSegura, totalPaginas).map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className={styles.pageDots}>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`${styles.pageNumber} ${p === paginaSegura ? styles.pageNumberActive : ""}`}
                onClick={() => setPagina(p)}
              >
                {p}
              </button>
            ),
          )}

          <button
            className={styles.pageArrow}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura === totalPaginas}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>

          <label className={styles.pageSizeLabel}>
            Mostrar
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            por página
          </label>
        </div>
      )}
    </div>
  );
}
