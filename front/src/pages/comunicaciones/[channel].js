import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import CommunicationsList from "@/components/comunicaciones/CommunicationsList/CommunicationsList";
import Toast from "@/components/ui/Toast/Toast";
import buttonStyles from "@/styles/Button.module.css";
import styles from "@/styles/CommunicationsChannel.module.css";
import { getChannelMessages, sendChannelMessage } from "@/api/communications";
import { getChannelById, TIPO_META } from "@/core/constants/channels";
import { ROLE_CONFIG } from "@/core/constants/roles";

const PAGE_SIZE = 6;

function getUsuarioActual() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user;
  } catch {
    return null;
  }
}

// Vista única reutilizable para los 5 canales (referencia visual
// contractual: flowly-comunicaciones-{general,prestaciones,direccion,
// asesoria,avisosoficiales}.png) -- lo único que cambia entre canales es
// la metadata (icono/nombre/descripción, core/constants/channels.js) y
// los mensajes reales que devuelve el backend; el layout es idéntico.
export default function CanalComunicaciones() {
  const router = useRouter();
  const { channel: channelId } = router.query;
  const channel = getChannelById(channelId);

  const [usuario, setUsuario] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [orden, setOrden] = useState("recientes");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const [composerAbierto, setComposerAbierto] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("informativo");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setUsuario(getUsuarioActual());
  }, []);

  const cargarMensajes = useCallback(async () => {
    if (!channel) return;
    setCargando(true);
    setError(null);
    try {
      const data = await getChannelMessages(channel.id);
      setMensajes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error obteniendo comunicaciones");
    } finally {
      setCargando(false);
    }
  }, [channel]);

  useEffect(() => {
    if (!router.isReady) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    cargarMensajes();
  }, [router, router.isReady, cargarMensajes]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo, orden, fechaDesde, fechaHasta]);

  if (router.isReady && !channel) {
    return (
      <div className={styles.emptyState}>
        <h3>Canal no encontrado</h3>
        <Link href="/comunicaciones" className={styles.backLink}>
          ← Volver a Comunicaciones
        </Link>
      </div>
    );
  }

  const tiposPresentes = [...new Set(mensajes.map((m) => m.tipo).filter(Boolean))];

  const mensajesFiltrados = mensajes
    .filter((m) => (filtroTipo === "TODOS" ? true : m.tipo === filtroTipo))
    .filter((m) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (m.titulo || "").toLowerCase().includes(q) || (m.contenido || "").toLowerCase().includes(q);
    })
    .filter((m) => (fechaDesde ? new Date(m.createdAt) >= new Date(fechaDesde) : true))
    .filter((m) => {
      if (!fechaHasta) return true;
      const fin = new Date(fechaHasta);
      fin.setHours(23, 59, 59, 999);
      return new Date(m.createdAt) <= fin;
    })
    .sort((a, b) =>
      orden === "antiguos" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt),
    );

  const totalPaginas = Math.max(1, Math.ceil(mensajesFiltrados.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * PAGE_SIZE;
  const mensajesPagina = mensajesFiltrados.slice(inicio, inicio + PAGE_SIZE);

  const hayFiltrosActivos = filtroTipo !== "TODOS" || busqueda !== "" || fechaDesde !== "" || fechaHasta !== "";

  function limpiarFiltros() {
    setFiltroTipo("TODOS");
    setBusqueda("");
    setFechaDesde("");
    setFechaHasta("");
  }

  const ultimaActualizacion = mensajes.reduce(
    (max, m) => (m.createdAt && new Date(m.createdAt) > max ? new Date(m.createdAt) : max),
    null,
  );

  async function handleEnviar() {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      setToast({ type: "error", message: "Título y contenido son obligatorios." });
      return;
    }

    setEnviando(true);
    try {
      await sendChannelMessage({
        canal: channel.nombreCanal,
        titulo: nuevoTitulo.trim(),
        contenido: nuevoContenido.trim(),
        tipo: nuevoTipo,
        autor: usuario?.nombreCompleto || "Usuario",
        departamento: ROLE_CONFIG[usuario?.role]?.label || usuario?.role || "—",
      });
      setNuevoTitulo("");
      setNuevoContenido("");
      setNuevoTipo("informativo");
      setComposerAbierto(false);
      setToast({ type: "success", message: "Comunicado publicado correctamente." });
      await cargarMensajes();
    } catch (err) {
      setToast({ type: "error", message: err.message || "No se pudo publicar el comunicado." });
    } finally {
      setEnviando(false);
    }
  }

  if (!channel) return null;

  return (
    <div>
      <Link href="/comunicaciones" className={styles.backLink}>
        <ArrowLeft size={14} strokeWidth={2} />
        Volver a Comunicaciones
      </Link>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>
            <channel.Icon size={22} strokeWidth={1.75} />
          </span>
          <div>
            <h1 className={styles.title}>{channel.label}</h1>
            <p className={styles.subtitle}>{channel.description}</p>
          </div>
        </div>

        <button
          type="button"
          className={`${buttonStyles.btn} ${buttonStyles.primary}`}
          onClick={() => setComposerAbierto((v) => !v)}
        >
          <Plus size={15} strokeWidth={2} />
          Nuevo comunicado
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={`Buscar en ${channel.label.toLowerCase()}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select className={styles.filterSelect} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="TODOS">Todos los tipos</option>
          {tiposPresentes.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_META[tipo]?.label || tipo}
            </option>
          ))}
        </select>

        <select className={styles.filterSelect} value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
        </select>
      </div>

      <div className={styles.layout}>
        <div>
          {composerAbierto && (
            <div className={`${styles.card} ${styles.composer}`}>
              <input
                className={styles.composerInput}
                type="text"
                placeholder="Título del comunicado"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
              />
              <div className={styles.composerRow}>
                <select className={styles.composerSelect} value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
                  {Object.entries(TIPO_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                <textarea
                  className={styles.composerTextarea}
                  placeholder="Contenido del comunicado"
                  value={nuevoContenido}
                  onChange={(e) => setNuevoContenido(e.target.value)}
                />
              </div>
              <div className={styles.composerActions}>
                <button
                  type="button"
                  className={`${buttonStyles.btn} ${buttonStyles.secondary}`}
                  onClick={() => setComposerAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${buttonStyles.btn} ${buttonStyles.primary}`}
                  onClick={handleEnviar}
                  disabled={enviando}
                >
                  {enviando ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          )}

          {cargando ? (
            <p className={styles.placeholder}>Cargando comunicados...</p>
          ) : error ? (
            <p className={styles.placeholder}>{error}</p>
          ) : (
            <>
              <CommunicationsList messages={mensajesPagina} />

              {mensajesFiltrados.length > 0 && totalPaginas > 1 && (
                <div className={styles.pagination}>
                  <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1}>
                    ‹ Anterior
                  </button>
                  <span className={styles.paginationLabel}>
                    Página {paginaSegura} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura === totalPaginas}
                  >
                    Siguiente ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Filtros</h3>
            <div className={styles.dateRange}>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} aria-label="Desde" />
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} aria-label="Hasta" />
            </div>
            <button type="button" className={styles.clearButton} onClick={limpiarFiltros} disabled={!hayFiltrosActivos}>
              Limpiar filtros
            </button>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Información del canal</h3>
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>Descripción</dt>
                <dd>{channel.description}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Comunicados en total</dt>
                <dd>{mensajes.length}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>Última actualización</dt>
                <dd>{ultimaActualizacion ? ultimaActualizacion.toLocaleDateString("es-ES") : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
