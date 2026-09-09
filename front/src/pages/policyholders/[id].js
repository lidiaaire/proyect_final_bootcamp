import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MoreHorizontal,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import styles from "@/styles/PolicyholderProfile.module.css";
import buttonStyles from "@/styles/Button.module.css";
import { resolverUrlDocumento } from "@/utils/documentoUrl";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const ROLES_PERMITIDOS = ["PRESTACIONES", "ADMIN"];
const HISTORIAL_PAGE_SIZE = 5;

// Mismo vocabulario que /policyholders (policyholderModel.js): no hay
// más tipos de póliza reales que estos tres.
const TIPO_META = {
  "POLIZA PRIVADA": { label: "Privada", tone: "info" },
  "POLIZA FUNCIONARIO": { label: "Funcionario", tone: "neutral" },
  "POLIZA COLECTIVO": { label: "Colectivo", tone: "warning" },
};

function getRolActual() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

function calcularAntiguedad(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const today = new Date();
  let years = today.getFullYear() - start.getFullYear();
  const monthDiff = today.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) years--;
  return years;
}

const TABS = [
  { key: "resumen", label: "Resumen" },
  { key: "solicitudes", label: "Solicitudes" },
  { key: "documentacion", label: "Documentación" },
  { key: "notas", label: "Notas internas" },
];

export default function PolicyholderProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [status, setStatus] = useState("loading"); // loading | success | forbidden | notfound | error
  const [errorMessage, setErrorMessage] = useState("");
  const [policyholder, setPolicyholder] = useState(null);
  const [requests, setRequests] = useState([]);
  const [puedeCrearSolicitud, setPuedeCrearSolicitud] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");
  const [historialPagina, setHistorialPagina] = useState(1);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const rol = getRolActual();
    if (!ROLES_PERMITIDOS.includes(rol)) {
      router.push("/");
      return;
    }
    setPuedeCrearSolicitud(rol === "PRESTACIONES");

    async function loadData() {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };

        const resPolicyholder = await fetch(
          `${API_BASE}/api/policyholders/${id}`,
          { headers: authHeader },
        );

        if (resPolicyholder.status === 403) {
          setStatus("forbidden");
          return;
        }
        if (resPolicyholder.status === 404) {
          setStatus("notfound");
          return;
        }
        if (!resPolicyholder.ok) {
          setErrorMessage("No se pudo cargar el asegurado.");
          setStatus("error");
          return;
        }

        const policyholderData = await resPolicyholder.json();

        const resRequests = await fetch(
          `${API_BASE}/api/solicitudes/policyholder/${policyholderData.id}`,
          { headers: authHeader },
        );
        const requestsData = await resRequests.json().catch(() => ({}));
        const requestsArray = Array.isArray(requestsData.solicitudes) ? requestsData.solicitudes : [];

        setPolicyholder(policyholderData);
        setRequests(requestsArray);
        setStatus("success");
      } catch {
        setErrorMessage("No se pudo cargar el asegurado.");
        setStatus("error");
      }
    }

    loadData();
  }, [router, router.isReady, id]);

  async function copiar(campo, valor) {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // portapapeles no disponible -- se ignora sin romper la UI
    }
  }

  if (status === "loading") return <p>Cargando...</p>;

  if (status === "forbidden" || status === "notfound" || status === "error") {
    const copy = {
      forbidden: { title: "Sin acceso", body: "Este rol no gestiona asegurados." },
      notfound: { title: "Asegurado no encontrado", body: "No existe ningún asegurado con este identificador." },
      error: { title: "No se pudo cargar el asegurado", body: errorMessage },
    }[status];

    return (
      <div className={styles.stateCard}>
        <h3>{copy.title}</h3>
        <p className={styles.placeholder}>{copy.body}</p>
        <Link href="/policyholders" className={styles.backLink}>
          ← Volver a asegurados
        </Link>
      </div>
    );
  }

  const antiguedad = calcularAntiguedad(policyholder.policyStartDate);
  const tipoMeta = TIPO_META[policyholder.policyType];

  // Documentos reales agregados desde cada solicitud del asegurado (no
  // hay un almacén de documentos propio del asegurado en el backend --
  // se derivan de los mismos documentos ya reales de sus solicitudes).
  const documentos = requests.flatMap((r) =>
    (r.documentos || []).map((doc) => ({ ...doc, solicitud: r })),
  );

  const totalPaginasHistorial = Math.max(1, Math.ceil(requests.length / HISTORIAL_PAGE_SIZE));
  const paginaHistorialSegura = Math.min(historialPagina, totalPaginasHistorial);
  const inicioHistorial = (paginaHistorialSegura - 1) * HISTORIAL_PAGE_SIZE;
  const requestsPagina = requests.slice(inicioHistorial, inicioHistorial + HISTORIAL_PAGE_SIZE);

  // Historial de solicitudes -- aparece tanto en "Resumen" (referencia
  // visual contractual: columna izquierda, bajo Datos del asegurado)
  // como en la tab "Solicitudes" dedicada. Misma tabla, mismos datos
  // reales y misma paginación -- se extrae aquí para no duplicar el JSX.
  const historialSolicitudes = (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Historial de solicitudes</h3>

      {requests.length === 0 ? (
        <p className={styles.placeholder}>Este asegurado no tiene solicitudes registradas.</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Prueba</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requestsPagina.map((r) => {
                  const requestId = r._id || r.id;
                  return (
                    <tr key={requestId}>
                      <td className={styles.mono}>{r.numeroSolicitud || `#${String(requestId).slice(-5)}`}</td>
                      <td>{r.nombrePrueba}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-ES") : "—"}</td>
                      <td>
                        <StatusBadge status={r.estadoInterno} />
                      </td>
                      <td>
                        <Link href={`/solicitudes/${requestId}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPaginasHistorial > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setHistorialPagina((p) => Math.max(1, p - 1))}
                disabled={paginaHistorialSegura === 1}
              >
                ‹ Anterior
              </button>
              <span className={styles.paginationLabel}>
                Página {paginaHistorialSegura} de {totalPaginasHistorial}
              </span>
              <button
                onClick={() => setHistorialPagina((p) => Math.min(totalPaginasHistorial, p + 1))}
                disabled={paginaHistorialSegura === totalPaginasHistorial}
              >
                Siguiente ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      <Link href="/policyholders" className={styles.backLink}>
        <ArrowLeft size={14} strokeWidth={2} />
        Volver a Asegurados
      </Link>

      {/* Hero de perfil -- avatar circular + nombre son el elemento
          dominante de la página (PERSONA). Cabecera y card de identidad
          anteriores se fusionan en una única superficie para dar más
          presencia vertical, sin añadir contenido nuevo. */}
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div className={styles.heroIdentity}>
            <span className={styles.avatar}>{(policyholder.name || "?").charAt(0).toUpperCase()}</span>
            <div>
              <span className={styles.kicker}>Asegurado</span>
              <h1 className={styles.title}>{policyholder.name}</h1>
              <p className={styles.subtitle}>
                DNI {policyholder.dni} · Póliza {policyholder.id}
                {antiguedad !== null ? ` · ${antiguedad} años de antigüedad` : ""}
              </p>
              {tipoMeta && (
                <span
                  className={styles.tipoBadge}
                  style={{ background: `var(--${tipoMeta.tone}-bg)`, color: `var(--${tipoMeta.tone})` }}
                >
                  {tipoMeta.label}
                </span>
              )}
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.menuWrap}>
              <button
                type="button"
                className={styles.menuTrigger}
                aria-label="Más acciones"
                onClick={() => setMenuAbierto((v) => !v)}
              >
                <MoreHorizontal size={18} strokeWidth={1.75} />
              </button>

              {menuAbierto && (
                <div className={styles.menuDropdown}>
                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      copiar("dni", policyholder.dni);
                      setMenuAbierto(false);
                    }}
                  >
                    {copiado === "dni" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                    {copiado === "dni" ? "Copiado" : "Copiar DNI"}
                  </button>
                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      copiar("poliza", policyholder.id);
                      setMenuAbierto(false);
                    }}
                  >
                    {copiado === "poliza" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                    {copiado === "poliza" ? "Copiado" : "Copiar nº de póliza"}
                  </button>
                </div>
              )}
            </div>

            {puedeCrearSolicitud && (
              <Link href={`/solicitudes/nueva?numeroPoliza=${policyholder.id}`}>
                <button className={`${buttonStyles.btn} ${buttonStyles.primary}`}>+ Nueva solicitud</button>
              </Link>
            )}
          </div>
        </div>

        <div className={styles.identityContacto}>
          {policyholder.telefono && (
            <span>
              <Phone size={13} strokeWidth={1.75} /> {policyholder.telefono}
            </span>
          )}
          {policyholder.email && (
            <span>
              <Mail size={13} strokeWidth={1.75} /> {policyholder.email}
            </span>
          )}
          {policyholder.direccion && (
            <span>
              <MapPin size={13} strokeWidth={1.75} /> {policyholder.direccion}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "resumen" && (
        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Datos del asegurado</h3>
              <dl className={styles.factGrid}>
                <div>
                  <dt>Nombre completo</dt>
                  <dd>{policyholder.name}</dd>
                </div>
                <div>
                  <dt>DNI</dt>
                  <dd>{policyholder.dni}</dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>{policyholder.telefono || "—"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{policyholder.email || "—"}</dd>
                </div>
                <div>
                  <dt>Dirección</dt>
                  <dd>{policyholder.direccion || "—"}</dd>
                </div>
                <div>
                  <dt>Nº de póliza</dt>
                  <dd>{policyholder.id}</dd>
                </div>
                {tipoMeta && (
                  <div>
                    <dt>Tipo de póliza</dt>
                    <dd>{tipoMeta.label}</dd>
                  </div>
                )}
                {policyholder.policyStartDate && (
                  <div>
                    <dt>Fecha de alta</dt>
                    <dd>{new Date(policyholder.policyStartDate).toLocaleDateString("es-ES")}</dd>
                  </div>
                )}
              </dl>
            </div>

            {historialSolicitudes}
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Notas internas</h3>
              {(policyholder.internalNotes || []).length === 0 ? (
                <p className={styles.placeholder}>Sin notas registradas.</p>
              ) : (
                <div className={styles.notesList}>
                  {policyholder.internalNotes.map((note, index) => (
                    <div key={index} className={styles.noteCard}>
                      <div className={styles.noteHeader}>
                        <span className={styles.noteAuthor}>{note.author || "Sistema"}</span>
                        <span className={styles.noteDate}>
                          {note.date ? new Date(note.date).toLocaleDateString("es-ES") : ""}
                        </span>
                      </div>
                      <div className={styles.noteText}>{note.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {puedeCrearSolicitud && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Acciones rápidas</h3>
                <Link
                  href={`/solicitudes/nueva?numeroPoliza=${policyholder.id}`}
                  className={`${buttonStyles.btn} ${buttonStyles.primary} ${styles.fullWidthBtn}`}
                >
                  + Nueva solicitud
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "solicitudes" && historialSolicitudes}

      {activeTab === "documentacion" && (
        <div className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>Documentación</h3>
            <span className={styles.docCount}>{documentos.length} documentos</span>
          </div>

          {documentos.length === 0 ? (
            <p className={styles.placeholder}>No hay documentos aportados en ninguna de sus solicitudes.</p>
          ) : (
            <div className={styles.docsList}>
              {documentos.map((doc, i) => (
                <div key={i} className={styles.docItem}>
                  <span className={styles.docIcon}>
                    <FileText size={15} strokeWidth={1.75} />
                  </span>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.nombre}</span>
                    <Link href={`/solicitudes/${doc.solicitud._id || doc.solicitud.id}`} className={styles.docSolicitud}>
                      {doc.solicitud.numeroSolicitud} · {doc.solicitud.nombrePrueba}
                    </Link>
                  </div>
                  <div className={styles.docActions}>
                    <a
                      className={styles.docActionBtn}
                      href={resolverUrlDocumento(doc)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Ver documento"
                    >
                      <Eye size={15} strokeWidth={1.75} />
                    </a>
                    <a
                      className={styles.docActionBtn}
                      href={resolverUrlDocumento(doc)}
                      download
                      aria-label="Descargar documento"
                    >
                      <Download size={15} strokeWidth={1.75} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notas" && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Notas internas</h3>
          {(policyholder.internalNotes || []).length === 0 ? (
            <p className={styles.placeholder}>Sin notas registradas.</p>
          ) : (
            <div className={styles.notesListFull}>
              {policyholder.internalNotes.map((note, index) => (
                <div key={index} className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <span className={styles.noteAuthor}>{note.author || "Sistema"}</span>
                    <span className={styles.noteDate}>
                      {note.date ? new Date(note.date).toLocaleDateString("es-ES") : ""}
                    </span>
                  </div>
                  <div className={styles.noteText}>{note.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
