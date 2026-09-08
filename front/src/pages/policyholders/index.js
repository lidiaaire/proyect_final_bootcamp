import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { IdCard, FileText, User, Building2, Users, MoreHorizontal, Copy, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import buttonStyles from "@/styles/Button.module.css";
import styles from "@/styles/Policyholders.module.css";

const PAGE_SIZE = 15;
const ROLES_PERMITIDOS = ["PRESTACIONES", "ADMIN"];

// Único vocabulario de tipo de póliza real (policyholderModel.js): no
// hay más valores posibles que estos tres. El icono/tono es solo
// presentación -- no añade ningún dato.
const TIPO_META = {
  "POLIZA PRIVADA": { label: "Privada", Icon: User, tone: "info" },
  "POLIZA FUNCIONARIO": { label: "Funcionario", Icon: Building2, tone: "neutral" },
  "POLIZA COLECTIVO": { label: "Colectivo", Icon: Users, tone: "warning" },
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

function RowActions({ policyholder }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(null);

  async function copiar(campo, valor, e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // portapapeles no disponible -- se ignora sin romper la UI
    }
  }

  return (
    <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
      <Link href={`/policyholders/${policyholder.id}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
        Ver
      </Link>

      <div className={styles.menuWrap}>
        <button
          type="button"
          className={styles.menuTrigger}
          aria-label="Más acciones"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setAbierto((v) => !v);
          }}
        >
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </button>

        {abierto && (
          <div className={styles.menuDropdown}>
            <button type="button" className={styles.menuItem} onClick={(e) => copiar("dni", policyholder.dni, e)}>
              {copiado === "dni" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
              {copiado === "dni" ? "Copiado" : "Copiar DNI"}
            </button>
            <button type="button" className={styles.menuItem} onClick={(e) => copiar("poliza", policyholder.id, e)}>
              {copiado === "poliza" ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
              {copiado === "poliza" ? "Copiado" : "Copiar nº de póliza"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Bandeja de asegurados (Sprint 2F, rediseño visual sobre
// flowly-policyholders.png). Solo PRESTACIONES y ADMIN gestionan
// pólizas -- guard real respaldado por el backend (authorizeRoles).
export default function PolicyholdersPage() {
  const router = useRouter();

  const [status, setStatus] = useState("loading"); // loading | success | forbidden | error
  const [errorMessage, setErrorMessage] = useState("");
  const [policyholders, setPolicyholders] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [orden, setOrden] = useState("nombre_asc");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
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

    async function loadPolicyholders() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/policyholders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          setStatus("forbidden");
          return;
        }
        if (!res.ok) {
          setErrorMessage("No se pudieron cargar los asegurados.");
          setStatus("error");
          return;
        }

        const data = await res.json();
        setPolicyholders(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch {
        setErrorMessage("No se pudieron cargar los asegurados.");
        setStatus("error");
      }
    }

    loadPolicyholders();
  }, [router]);

  useEffect(() => {
    setPagina(1);
  }, [search, filtroTipo, orden]);

  if (status === "loading") return <p>Cargando...</p>;

  if (status === "forbidden" || status === "error") {
    return (
      <div className={styles.stateCard}>
        <h3>{status === "forbidden" ? "Sin acceso" : "No se pudo cargar el listado"}</h3>
        <p className={styles.placeholder}>
          {status === "forbidden" ? "Este rol no gestiona asegurados." : errorMessage}
        </p>
      </div>
    );
  }

  const tiposPresentes = [...new Set(policyholders.map((p) => p.policyType).filter(Boolean))];

  const filtered = policyholders
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.dni || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        String(p.id || "").toLowerCase().includes(q)
      );
    })
    .filter((p) => filtroTipo === "TODOS" || p.policyType === filtroTipo)
    .sort((a, b) => {
      if (orden === "nombre_desc") return (b.name || "").localeCompare(a.name || "");
      if (orden === "antiguedad_desc")
        return new Date(a.policyStartDate || 0) - new Date(b.policyStartDate || 0); // más antigua la póliza = fecha más temprana
      if (orden === "antiguedad_asc")
        return new Date(b.policyStartDate || 0) - new Date(a.policyStartDate || 0);
      return (a.name || "").localeCompare(b.name || ""); // nombre_asc
    });

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * PAGE_SIZE;
  const pagina_items = filtered.slice(inicio, inicio + PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Asegurados" subtitle={`${policyholders.length} en total`} />

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, email o nº de póliza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select className={styles.filterSelect} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="TODOS">Todos los tipos</option>
          {tiposPresentes.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_META[tipo]?.label || tipo}
            </option>
          ))}
        </select>

        <label className={styles.sortLabel}>
          Ordenar por
          <select className={styles.sortSelect} value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="nombre_asc">Nombre (A - Z)</option>
            <option value="nombre_desc">Nombre (Z - A)</option>
            <option value="antiguedad_desc">Antigüedad (más antigua)</option>
            <option value="antiguedad_asc">Antigüedad (más reciente)</option>
          </select>
        </label>
      </div>

      <div className={styles.counter}>
        Mostrando {filtered.length === 0 ? 0 : inicio + 1}–{Math.min(inicio + PAGE_SIZE, filtered.length)} de{" "}
        {filtered.length} asegurados
      </div>

      <div className={styles.tableWrapper}>
        {pagina_items.length === 0 ? (
          <p className={styles.emptyState}>No hay asegurados que coincidan con la búsqueda.</p>
        ) : (
          <div className={styles.rows}>
            <div className={`${styles.row} ${styles.rowHead}`}>
              <span>Asegurado</span>
              <span>DNI</span>
              <span>Póliza</span>
              <span>Tipo</span>
              <span />
            </div>

            {pagina_items.map((p) => {
              const tipoMeta = TIPO_META[p.policyType];
              const antiguedad = calcularAntiguedad(p.policyStartDate);

              return (
                <div key={p.id} className={styles.row} onClick={() => router.push(`/policyholders/${p.id}`)}>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{(p.name || "?").charAt(0).toUpperCase()}</div>
                    <div>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.email}>{p.email}</div>
                    </div>
                  </div>

                  <div className={styles.factCell}>
                    <span className={styles.factCellIcon}>
                      <IdCard size={15} strokeWidth={1.75} />
                    </span>
                    <div>
                      <dt>DNI</dt>
                      <dd>{p.dni}</dd>
                    </div>
                  </div>

                  <div className={styles.factCell}>
                    <span className={styles.factCellIcon}>
                      <FileText size={15} strokeWidth={1.75} />
                    </span>
                    <div>
                      <dt>Póliza</dt>
                      <dd>{p.id}</dd>
                    </div>
                  </div>

                  <div className={styles.tipoCell}>
                    {tipoMeta ? (
                      <>
                        <span className={styles.tipoIcon} style={{ color: `var(--${tipoMeta.tone})` }}>
                          <tipoMeta.Icon size={15} strokeWidth={1.75} />
                        </span>
                        <span
                          className={styles.tipoBadge}
                          style={{ background: `var(--${tipoMeta.tone}-bg)`, color: `var(--${tipoMeta.tone})` }}
                        >
                          {tipoMeta.label}
                        </span>
                      </>
                    ) : (
                      antiguedad !== null && <span className={styles.subdato}>{antiguedad} años</span>
                    )}
                  </div>

                  <RowActions policyholder={p} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
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
    </div>
  );
}
