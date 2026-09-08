import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Clock,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { getSolicitudes } from "@/api/solicitudes";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import MetricCard from "@/components/ui/MetricCard/MetricCard";
import WorkQueue from "@/components/dashboard/WorkQueue/WorkQueue";
import NextStepCard from "@/components/dashboard/NextStepCard/NextStepCard";
import NotificationsWidget from "@/components/dashboard/NotificationsWidget/NotificationsWidget";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import BarChart from "@/components/dashboard/charts/BarChart";
import buttonStyles from "@/styles/Button.module.css";
import styles from "@/styles/Home.module.css";
import { ESTADOS, esEstadoFinal } from "@/core/constants/estados";
import { ROLE_CONFIG } from "@/core/constants/roles";

const DEPARTAMENTOS = ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"];

// Mismo umbral que la bandeja de /solicitudes (Sprint 2C): un caso no
// final sin movimiento hace más de 5 días se considera prioritario.
const DIAS_URGENTE = 5;
// Umbral propio del KPI "sin movimiento" (Sprint 3A-dashboard): más
// laxo que el de prioridad alta, solo para agrupar visualmente -- no es
// una regla de negocio nueva, solo otra lectura del mismo `createdAt`.
const DIAS_SIN_MOVIMIENTO = 3;

function getRolActual() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

function diasDesde(fecha) {
  if (!fecha) return null;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
}

// Definición de tabs de la bandeja de trabajo por rol -- siempre sobre
// `solicitudes` (ya filtrada por visibilidad real en el backend, Sprint
// 1B). Ningún tab introduce una consulta ni un dato nuevo.
function getTabsDef(rol) {
  if (rol === "PRESTACIONES") {
    return [
      {
        key: "pendientes",
        label: "Mis pendientes",
        filtro: (s) => !esEstadoFinal(s.estadoInterno) && s.currentDepartment === rol,
      },
      { key: "revision", label: "En revisión", filtro: (s) => s.estadoInterno === ESTADOS.EN_REVISION_MEDICA },
      { key: "documentacion", label: "Documentación", filtro: (s) => s.estadoInterno === ESTADOS.DOCUMENTACION_PENDIENTE },
      { key: "derivadas", label: "Derivadas", filtro: (s) => s.estadoInterno === ESTADOS.EN_REVISION_JURIDICA },
    ];
  }

  // Dirección Médica / Asesoría Jurídica: ya solo ven sus propios casos.
  return [
    {
      key: "pendientes",
      label: "Pendientes",
      filtro: (s) => !esEstadoFinal(s.estadoInterno) && s.currentDepartment === rol,
    },
    { key: "autorizadas", label: "Autorizadas", filtro: (s) => s.estadoInterno === ESTADOS.AUTORIZADA },
    { key: "rechazadas", label: "Rechazadas", filtro: (s) => s.estadoInterno === ESTADOS.RECHAZADA },
  ];
}

export default function Home() {
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [rol, setRol] = useState(null);

  const [activeTab, setActiveTab] = useState("pendientes");
  const [sortValue, setSortValue] = useState("prioridad");
  // Por defecto "todo el histórico": los datos de demo tienen fecha de
  // creación real pero antigua, así que "últimos 30 días" mostraría un
  // 0 real pero poco útil como vista inicial. Sigue siendo una
  // agregación real, solo se elige la ventana temporal con más señal.
  const [chartsWindow, setChartsWindow] = useState("all");

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuth(true);
    setRol(getRolActual());

    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        setUserName(JSON.parse(stored)?.nombreCompleto || "");
      }
    } catch {
      // usuario corrupto, se ignora
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!isAuth) return;

    const fetchData = async () => {
      try {
        const data = await getSolicitudes();
        setSolicitudes(data);
      } catch {
        setErrorMessage("Error cargando solicitudes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuth]);

  const tabsDef = useMemo(() => getTabsDef(rol), [rol]);

  if (!isAuth) return null;
  if (loading) return <p>Cargando...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  // `solicitudes` ya viene filtrada por rol desde el backend (Sprint 1B):
  // Prestaciones y Admin reciben todas, Dirección Médica y Asesoría
  // Jurídica solo las de su departamento. El dashboard no repite ese
  // filtrado, solo lo presenta.

  const contar = (estado) => solicitudes.filter((s) => s.estadoInterno === estado).length;
  const autorizadas = contar(ESTADOS.AUTORIZADA);
  const rechazadas = contar(ESTADOS.RECHAZADA);
  const enCurso = solicitudes.filter((s) => !esEstadoFinal(s.estadoInterno)).length;

  const propiasDelRol = solicitudes.filter(
    (s) => !esEstadoFinal(s.estadoInterno) && s.currentDepartment === rol,
  );
  const urgentesTotal = propiasDelRol.filter((s) => (diasDesde(s.createdAt) ?? 0) > DIAS_URGENTE);
  const sinMovimientoTotal = propiasDelRol.filter((s) => (diasDesde(s.createdAt) ?? 0) > DIAS_SIN_MOVIMIENTO);
  const docsPendientesPropias = propiasDelRol.filter((s) => s.estadoInterno === ESTADOS.DOCUMENTACION_PENDIENTE);

  // ---- Actividad reciente (historial real, Sprint 1A) ----
  const actividadReciente = solicitudes
    .flatMap((s) =>
      (s.historial || [])
        .filter((h) => h.accion)
        .map((h) => ({
          solicitudId: s._id || s.id,
          numeroSolicitud: s.numeroSolicitud,
          paciente: s.nombreCompleto,
          prueba: s.nombrePrueba,
          accionCodigo: h.accion,
          usuario: h.changedBy,
          fecha: h.fecha,
        })),
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  // ---- "Siguiente paso": prioridad real, primer candidato con datos ----
  let nextStep = null;
  if (rol === "ADMIN") {
    nextStep = {
      Icon: ClipboardList,
      title: "Resumen operativo",
      description: `${enCurso} de ${solicitudes.length} solicitudes siguen en trámite ahora mismo.`,
      cta: "Ver todas las solicitudes",
      href: "/solicitudes",
    };
  } else if (urgentesTotal.length > 0) {
    nextStep = {
      Icon: AlertTriangle,
      title: `Revisa ${urgentesTotal.length} solicitud${urgentesTotal.length > 1 ? "es" : ""} de alta prioridad`,
      description: `Llevan más de ${DIAS_URGENTE} días sin movimiento en tu bandeja.`,
      cta: "Revisar ahora",
      href: "/solicitudes",
    };
  } else if (docsPendientesPropias.length > 0) {
    nextStep = {
      Icon: FileText,
      title: `Revisa la documentación de ${docsPendientesPropias.length} solicitud${docsPendientesPropias.length > 1 ? "es" : ""}`,
      description: "Tienes documentación pendiente de validar.",
      cta: "Ir a documentación",
      href: "/solicitudes",
    };
  } else if (propiasDelRol.length > 0) {
    nextStep = {
      Icon: ClipboardList,
      title: `Tienes ${propiasDelRol.length} solicitud${propiasDelRol.length > 1 ? "es" : ""} pendiente${propiasDelRol.length > 1 ? "s" : ""}`,
      description: "Continúa con tu bandeja de trabajo.",
      cta: "Ver bandeja",
      href: "/solicitudes",
    };
  }

  // ---- Bandeja de trabajo: tabs + orden, sobre datos ya visibles ----
  const tabs = tabsDef.map((t) => ({ key: t.key, label: t.label, count: solicitudes.filter(t.filtro).length }));
  const tabActivo = tabsDef.find((t) => t.key === activeTab) || tabsDef[0];
  let items = solicitudes.filter(tabActivo.filtro);
  items =
    sortValue === "recientes"
      ? [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // prioridad: más antiguas primero
  items = items.slice(0, 6);

  // ---- Gráficas inferiores: agregaciones reales, con ventana temporal ----
  const cutoff = chartsWindow === "30" ? Date.now() - 30 * 24 * 60 * 60 * 1000 : null;
  const solicitudesVentana = cutoff ? solicitudes.filter((s) => new Date(s.createdAt).getTime() >= cutoff) : solicitudes;
  const contarVentana = (estado) => solicitudesVentana.filter((s) => s.estadoInterno === estado).length;

  const segmentosEstado = [
    { label: "Autorizadas", value: contarVentana(ESTADOS.AUTORIZADA), tone: "success" },
    {
      label: "En revisión",
      value: contarVentana(ESTADOS.EN_REVISION_MEDICA) + contarVentana(ESTADOS.EN_REVISION_JURIDICA),
      tone: "warning",
    },
    { label: "Rechazadas", value: contarVentana(ESTADOS.RECHAZADA), tone: "danger" },
    {
      label: "Pendientes",
      value: contarVentana(ESTADOS.PENDIENTE_GESTION) + contarVentana(ESTADOS.DOCUMENTACION_PENDIENTE),
      tone: "neutral",
    },
  ];
  const totalVentana = solicitudesVentana.length;

  const barrasDepartamento = DEPARTAMENTOS.map((dep) => ({
    label: ROLE_CONFIG[dep]?.label || dep,
    value: solicitudesVentana.filter((s) => s.currentDepartment === dep).length,
  }));

  return (
    <div>
      <PageHeader
        title={`Hola, ${userName || "de nuevo"}.`}
        subtitle={
          rol === "ADMIN"
            ? `Hay ${enCurso} solicitudes en curso de ${solicitudes.length} totales.`
            : `Tienes ${propiasDelRol.length} solicitud${propiasDelRol.length === 1 ? "" : "es"} que requiere${propiasDelRol.length === 1 ? "" : "n"} tu atención hoy.`
        }
        action={
          rol === "PRESTACIONES" ? (
            <Link href="/solicitudes/nueva">
              <button className={`${buttonStyles.btn} ${buttonStyles.primary}`}>+ Nueva solicitud</button>
            </Link>
          ) : (
            <Link href="/solicitudes">
              <button className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
                {rol === "ADMIN" ? "Ver todas las solicitudes" : "Ver mi bandeja completa"}
              </button>
            </Link>
          )
        }
      />

      {/* KPIs -- distintos según lo que cada rol necesita decidir */}
      <div className={styles.metrics}>
        {rol === "ADMIN" ? (
          <>
            <MetricCard
              value={solicitudes.length}
              label="Total de solicitudes"
              sublabel="Todas las que gestiona Flowly"
              href="/solicitudes"
              icon={ClipboardList}
              tone="info"
            />
            <MetricCard value={enCurso} label="En curso" sublabel="Aún sin resolución" href="/solicitudes" icon={Clock} tone="warning" />
            <MetricCard
              value={autorizadas}
              label="Autorizadas"
              sublabel="Resueltas favorablemente"
              href="/solicitudes"
              icon={CheckCircle2}
              tone="success"
            />
            <MetricCard
              value={rechazadas}
              label="Rechazadas"
              sublabel="Resueltas desfavorablemente"
              href="/solicitudes"
              icon={XCircle}
              tone="danger"
            />
          </>
        ) : rol === "PRESTACIONES" ? (
          <>
            <MetricCard
              value={urgentesTotal.length}
              label="Alta prioridad"
              sublabel="Requieren tu revisión"
              href="/solicitudes"
              icon={AlertTriangle}
              tone="danger"
            />
            <MetricCard
              value={sinMovimientoTotal.length}
              label={`Sin movimiento > ${DIAS_SIN_MOVIMIENTO} días`}
              sublabel="Evita demoras"
              href="/solicitudes"
              icon={Clock}
              tone="warning"
            />
            <MetricCard
              value={contar(ESTADOS.DOCUMENTACION_PENDIENTE)}
              label="Documentación pendiente"
              sublabel="Revisa y continúa"
              href="/solicitudes"
              icon={FileText}
              tone="info"
            />
            <MetricCard
              value={contar(ESTADOS.PENDIENTE_GESTION)}
              label="Listas para derivar"
              sublabel="Pendientes de decisión"
              href="/solicitudes"
              icon={Send}
              tone="success"
            />
          </>
        ) : (
          <>
            <MetricCard
              value={propiasDelRol.length}
              label="Pendientes de mi revisión"
              sublabel="Requieren tu dictamen"
              href="/solicitudes"
              icon={Clock}
              tone="warning"
            />
            <MetricCard
              value={autorizadas + rechazadas}
              label="Resueltas por mí"
              sublabel="Historial de decisiones"
              href="/solicitudes"
              icon={CheckCircle2}
              tone="success"
            />
          </>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          {rol !== "ADMIN" && (
            <WorkQueue
              tabs={tabs}
              activeTab={tabActivo.key}
              onTabChange={setActiveTab}
              items={items}
              rol={rol}
              sortValue={sortValue}
              onSortChange={setSortValue}
              emptyText="No hay solicitudes en esta vista ahora mismo."
            />
          )}

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <h3 className={styles.chartTitle}>Estado de las solicitudes</h3>
                <select
                  className={styles.windowSelect}
                  value={chartsWindow}
                  onChange={(e) => setChartsWindow(e.target.value)}
                >
                  <option value="30">Últimos 30 días</option>
                  <option value="all">Todo el histórico</option>
                </select>
              </div>
              <div className={styles.donutRow}>
                <DonutChart segments={segmentosEstado} total={totalVentana} />
                <div className={styles.legend}>
                  {segmentosEstado.map((s) => (
                    <div key={s.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: `var(--${s.tone})` }} />
                      <span className={styles.legendLabel}>{s.label}</span>
                      <span className={styles.legendValue}>{s.value}</span>
                      <span className={styles.legendPercent}>
                        {totalVentana > 0 ? Math.round((s.value / totalVentana) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeaderRow}>
                <h3 className={styles.chartTitle}>Solicitudes por área</h3>
                <select
                  className={styles.windowSelect}
                  value={chartsWindow}
                  onChange={(e) => setChartsWindow(e.target.value)}
                >
                  <option value="30">Últimos 30 días</option>
                  <option value="all">Todo el histórico</option>
                </select>
              </div>
              <BarChart bars={barrasDepartamento} />
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <NextStepCard step={nextStep} />
          <NotificationsWidget actividad={actividadReciente} />
        </div>
      </div>
    </div>
  );
}
