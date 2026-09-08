import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Copy,
  Check,
  Download,
  Eye,
  Activity,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import styles from "@/styles/SolicitudDetalle.module.css";
import buttonStyles from "@/styles/Button.module.css";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Timeline from "@/components/ui/Timeline/Timeline";
import Toast from "@/components/ui/Toast/Toast";
import ActionModal from "@/components/solicitudes/ActionModal/ActionModal";
import PDFViewer from "@/components/ui/PDFViewer/PDFViewer";
import { ESTADO_META, esEstadoFinal } from "@/core/constants/estados";
import { ACCIONES, getAccionesDisponibles, getMotivoSinAcciones } from "@/core/permissions/accionesSolicitud";
import { ROLE_CONFIG } from "@/core/constants/roles";
import { getPolicyholder } from "@/api/policyholders";

import {
  getRequest,
  requestMoreDocs,
  sendToMedicalDirection,
  authorizeRequest,
  rejectRequest,
  sendToLegal,
} from "@/api/solicitudes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Solo Prestaciones/Admin tienen acceso real a la ficha de asegurado
// (RBAC de policyholderRoutes, Sprint 2F) -- el resto de roles no ven
// ese bloque en vez de mostrar un dato al que no tienen derecho.
const ROLES_CON_ACCESO_ASEGURADO = ["PRESTACIONES", "ADMIN"];

const MENSAJE_SIN_ACCIONES = {
  final: "Expediente resuelto. Solo acciones de consulta.",
  admin: "El rol Admin no tramita solicitudes.",
  otro_departamento: (departamento) =>
    `Este caso está a cargo de ${ROLE_CONFIG[departamento]?.label || departamento}.`,
};

const HINT_SIN_ACCIONES = {
  final: "Este expediente ya está resuelto. Puedes consultarlo y añadir notas, pero no admite más transiciones.",
  admin: "Los administradores no tramitan solicitudes individuales, solo tienen visión global.",
  otro_departamento: (departamento) =>
    `Este caso está a cargo de ${ROLE_CONFIG[departamento]?.label || departamento} ahora mismo; no puedes actuar sobre él.`,
};

// Configuración de cada acción de negocio: qué pide el modal, qué
// endpoint invoca y con qué icono se representa (header + panel de
// acciones). No decide si la acción es válida -- eso lo sigue haciendo
// únicamente core/permissions/accionesSolicitud.js (Sprint 2A).
function getActionConfig(id) {
  return {
    [ACCIONES.SOLICITAR_DOCUMENTACION]: {
      label: "Solicitar documentación",
      tone: "primary",
      Icon: FileText,
      title: "Solicitar documentación",
      description: "Indica qué documentación adicional necesitas del asegurado.",
      placeholder: "¿Qué documentación necesitas?",
      requireComentario: true,
      confirmLabel: "Solicitar",
      run: (data) => requestMoreDocs(id, { justificacion: data.justificacion }),
    },
    [ACCIONES.ENVIAR_DIRECCION_MEDICA]: {
      label: "Derivar a Dirección Médica",
      tone: "primary",
      Icon: Send,
      title: "Derivar a Dirección Médica",
      description: "Explica brevemente el motivo clínico de la derivación.",
      placeholder: "Motivo de la derivación",
      requireComentario: true,
      confirmLabel: "Derivar",
      run: (data) => sendToMedicalDirection(id, data.justificacion),
    },
    [ACCIONES.ENVIAR_ASESORIA_JURIDICA]: {
      label: "Derivar a Asesoría Jurídica",
      tone: "primary",
      Icon: Send,
      title: "Derivar a Asesoría Jurídica",
      description: "Explica brevemente el motivo legal de la derivación.",
      placeholder: "Motivo de la derivación",
      requireComentario: true,
      confirmLabel: "Derivar",
      run: (data) => sendToLegal(id, data.justificacion),
    },
    [ACCIONES.AUTORIZAR]: {
      label: "Autorizar",
      tone: "primary",
      Icon: CheckCircle2,
      title: "Autorizar solicitud",
      description: "Puedes añadir una observación antes de autorizar (opcional).",
      placeholder: "Observaciones (opcional)",
      requireComentario: false,
      confirmLabel: "Autorizar",
      run: (data) => authorizeRequest(id, data.justificacion || undefined),
    },
    [ACCIONES.RECHAZAR]: {
      label: "Rechazar",
      tone: "danger",
      Icon: XCircle,
      title: "Rechazar solicitud",
      description: "Selecciona el motivo del rechazo.",
      motivos: [
        { value: "no_cubierto", label: "No cubierto por póliza" },
        { value: "doc_insuficiente", label: "Documentación insuficiente" },
        { value: "prueba_no_indicada", label: "Prueba no indicada clínicamente" },
      ],
      placeholder: "Comentario adicional (opcional)",
      requireComentario: false,
      confirmLabel: "Rechazar",
      run: (data) => rejectRequest(id, data.justificacion),
    },
  };
}

function getRolActual() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function tiempoRelativo(fecha) {
  if (!fecha) return null;
  const ms = Date.now() - new Date(fecha).getTime();
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (dias <= 0) {
    const horas = Math.max(1, Math.floor(ms / (1000 * 60 * 60)));
    return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
  }
  if (dias === 1) return "hace 1 día";
  return `hace ${dias} días`;
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

const ACTOR_LABEL = {
  SYSTEM_MIGRATION: "Sistema (migración)",
  ASEGURADO: "Asegurado",
};

function labelActor(actor) {
  return ROLE_CONFIG[actor]?.label || ACTOR_LABEL[actor] || actor;
}

export default function SolicitudDetallePage() {
  const router = useRouter();
  const { id } = router.query;

  const [status, setStatus] = useState("loading"); // loading | success | notfound | forbidden | error
  const [errorMessage, setErrorMessage] = useState("");

  const [solicitud, setSolicitud] = useState(null);
  const [asegurado, setAsegurado] = useState(null);
  const [nuevaNota, setNuevaNota] = useState("");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [filtroActor, setFiltroActor] = useState("TODOS");

  const [rol, setRol] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setRol(getRolActual());
  }, []);

  const acciones = getAccionesDisponibles({ rol, solicitud });
  const motivoSinAcciones = getMotivoSinAcciones({ rol, solicitud });
  const actionConfig = getActionConfig(id);
  const puedeVerAsegurado = ROLES_CON_ACCESO_ASEGURADO.includes(rol);

  const cargarSolicitud = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getRequest(id);

      if (data === null) {
        setStatus("notfound");
        return;
      }

      setSolicitud(data);
      setStatus("success");
    } catch (error) {
      if (error.status === 403) {
        setErrorMessage(error.message);
        setStatus("forbidden");
      } else {
        setErrorMessage(error.message || "Error obteniendo la solicitud");
        setStatus("error");
      }
    }
  }, [id]);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let isMounted = true;
    (async () => {
      if (isMounted) await cargarSolicitud();
    })();

    return () => {
      isMounted = false;
    };
  }, [router, router.isReady, id, cargarSolicitud]);

  // Ficha de asegurado (Sprint 2F): mismo dato real que /policyholders,
  // solo para los roles que tienen acceso real a esa ruta. Si falla (p.
  // ej. 403/404) se ignora -- el bloque simplemente no aparece.
  useEffect(() => {
    if (!solicitud?.numeroPoliza || !puedeVerAsegurado) {
      setAsegurado(null);
      return;
    }
    let activo = true;
    getPolicyholder(solicitud.numeroPoliza)
      .then((data) => {
        if (activo) setAsegurado(data);
      })
      .catch(() => {
        if (activo) setAsegurado(null);
      });
    return () => {
      activo = false;
    };
  }, [solicitud?.numeroPoliza, puedeVerAsegurado]);

  async function handleConfirmAction(data) {
    const config = actionConfig[modalAction];
    setSubmitting(true);

    try {
      await config.run(data);
      setModalAction(null);
      setToast({ type: "success", message: `${config.confirmLabel} realizado correctamente.` });
      await cargarSolicitud();
    } catch (error) {
      setToast({ type: "error", message: error.message || "No se pudo completar la acción." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuardarNota() {
    if (!nuevaNota.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/solicitudes/${id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descripcion: nuevaNota }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setToast({ type: "error", message: data.message || "Error guardando la nota" });
        return;
      }

      setNuevaNota("");
      await cargarSolicitud();
    } catch (error) {
      setToast({ type: "error", message: error.message || "Error guardando la nota" });
    }
  }

  async function copiarNumero() {
    try {
      await navigator.clipboard.writeText(solicitud.numeroSolicitud || id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // portapapeles no disponible -- se ignora sin romper la UI
    }
  }

  // =========================
  // RENDER — estados de carga/error
  // =========================

  if (status === "loading") {
    return <p className={styles.loadingText}>Cargando...</p>;
  }

  if (status === "notfound" || status === "forbidden" || status === "error") {
    const copy = {
      notfound: { title: "Solicitud no encontrada", body: "No existe ninguna solicitud con este identificador." },
      forbidden: { title: "Sin acceso a esta solicitud", body: errorMessage },
      error: { title: "No se pudo cargar la solicitud", body: errorMessage },
    }[status];

    return (
      <div className={styles.stateCard}>
        <h3>{copy.title}</h3>
        <p className={styles.placeholder}>{copy.body}</p>
        <Link href="/solicitudes" className={styles.backLink}>
          ← Volver a solicitudes
        </Link>
      </div>
    );
  }

  const responsable = ROLE_CONFIG[solicitud.currentDepartment];
  const estadoMeta = ESTADO_META[solicitud.estadoInterno];
  const ultimoEvento = solicitud.historial?.[solicitud.historial.length - 1];
  const accionPrincipal = acciones[0] ? actionConfig[acciones[0]] : null;
  const antiguedad = calcularAntiguedad(asegurado?.policyStartDate);

  const hint =
    acciones.length > 0
      ? "Tienes acciones disponibles sobre este expediente."
      : motivoSinAcciones === "otro_departamento"
        ? HINT_SIN_ACCIONES.otro_departamento(solicitud.currentDepartment)
        : HINT_SIN_ACCIONES[motivoSinAcciones] || null;

  const actoresHistorial = [
    ...new Set((solicitud.historial || []).map((h) => h.changedBy).filter(Boolean)),
  ];
  const historialFiltrado =
    filtroActor === "TODOS"
      ? solicitud.historial
      : (solicitud.historial || []).filter((h) => h.changedBy === filtroActor);

  return (
    <>
      <Link href="/solicitudes" className={styles.backLink}>
        <ArrowLeft size={14} strokeWidth={2} />
        Volver a Solicitudes
      </Link>

      {/* Cabecera */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{solicitud.nombreCompleto}</h1>
          <p className={styles.subtitle}>
            {solicitud.numeroSolicitud} · Póliza {solicitud.numeroPoliza} · DNI {solicitud.dni}
          </p>
          <div className={styles.statusRow}>
            <StatusBadge status={solicitud.estadoInterno} />
            {responsable && <span className={styles.departmentBadge}>A cargo de {responsable.label}</span>}
          </div>
        </div>

        <div className={styles.headerSide}>
          <div className={styles.headerMeta}>
            <span>Creada el {formatDate(solicitud.createdAt)}</span>
            {ultimoEvento && <span>Último movimiento {tiempoRelativo(ultimoEvento.fecha)}</span>}
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
                      copiarNumero();
                      setMenuAbierto(false);
                    }}
                  >
                    {copiado ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                    {copiado ? "Copiado" : "Copiar nº de solicitud"}
                  </button>
                </div>
              )}
            </div>

            {accionPrincipal && (
              <button
                className={`${buttonStyles.btn} ${buttonStyles.primary}`}
                onClick={() => setModalAction(acciones[0])}
              >
                <accionPrincipal.Icon size={15} strokeWidth={2} />
                {accionPrincipal.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asegurado + Prestación -- una sola card horizontal (referencia
          contractual de /solicitudes/[id]), no dos cards apiladas. La
          ficha de contacto/póliza solo aparece con datos reales y para
          los roles con acceso real a policyholders (Sprint 2F). */}
      <div className={styles.aseguradoCard}>
        <div className={`${styles.aseguradoTop} ${puedeVerAsegurado && asegurado ? "" : styles.aseguradoTopSolo}`}>
          <div className={styles.aseguradoIdentity}>
            <span className={styles.aseguradoAvatar}>
              {solicitud.nombreCompleto ? solicitud.nombreCompleto.charAt(0).toUpperCase() : "?"}
            </span>
            <div>
              <div className={styles.aseguradoLabel}>Asegurado</div>
              <div className={styles.aseguradoNombre}>{solicitud.nombreCompleto}</div>
              <div className={styles.aseguradoSub}>DNI {solicitud.dni} · Póliza {solicitud.numeroPoliza}</div>
              {puedeVerAsegurado && asegurado && (
                <Link href={`/policyholders/${solicitud.numeroPoliza}`} className={styles.verPolizaLink}>
                  <ExternalLink size={12} strokeWidth={1.75} />
                  Ver ficha completa
                </Link>
              )}
            </div>
          </div>

          {puedeVerAsegurado && asegurado && (
            <div className={styles.aseguradoContacto}>
              {asegurado.telefono && (
                <span>
                  <Phone size={13} strokeWidth={1.75} /> {asegurado.telefono}
                </span>
              )}
              {asegurado.email && (
                <span>
                  <Mail size={13} strokeWidth={1.75} /> {asegurado.email}
                </span>
              )}
              {asegurado.direccion && (
                <span>
                  <MapPin size={13} strokeWidth={1.75} /> {asegurado.direccion}
                </span>
              )}
            </div>
          )}

          {puedeVerAsegurado && asegurado && (asegurado.policyType || antiguedad !== null) && (
            <div className={styles.aseguradoFacts}>
              {asegurado.policyType && (
                <div className={styles.factChip}>
                  <span className={styles.factIcon}>
                    <ShieldCheck size={15} strokeWidth={1.75} />
                  </span>
                  <div>
                    <dt>Tipo de póliza</dt>
                    <dd>{asegurado.policyType}</dd>
                  </div>
                </div>
              )}
              {antiguedad !== null && (
                <div className={styles.factChip}>
                  <span className={styles.factIcon}>
                    <ShieldCheck size={15} strokeWidth={1.75} />
                  </span>
                  <div>
                    <dt>Antigüedad</dt>
                    <dd>{antiguedad} años</dd>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.aseguradoDivider} />

        <div className={styles.prestacionGrid}>
          <div className={styles.prestacionFact}>
            <span className={styles.factIcon}>
              <Activity size={16} strokeWidth={1.75} />
            </span>
            <div>
              <dt>Prueba</dt>
              <dd>{solicitud.nombrePrueba}</dd>
            </div>
          </div>
          <div className={styles.prestacionFact}>
            <span className={styles.factIcon}>
              <Stethoscope size={16} strokeWidth={1.75} />
            </span>
            <div>
              <dt>Especialidad</dt>
              <dd>{solicitud.especialidad}</dd>
            </div>
          </div>
          <div className={styles.prestacionFact}>
            <span className={styles.factIcon}>
              <Building2 size={16} strokeWidth={1.75} />
            </span>
            <div>
              <dt>Centro médico</dt>
              <dd>{solicitud.centroMedico}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* IZQUIERDA */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Documentación aportada</h3>
              <span className={styles.docCount}>{solicitud.documentos?.length || 0} documentos</span>
            </div>

            <div className={styles.docsList}>
              {solicitud.documentos?.map((doc, i) => (
                <div key={i} className={styles.docItem}>
                  <span className={styles.docIcon}>PDF</span>
                  <span className={styles.docName}>{doc.nombre}</span>
                  <div className={styles.docActions}>
                    <button
                      className={styles.docActionBtn}
                      onClick={() =>
                        setDocumentoSeleccionado(documentoSeleccionado === doc.nombre ? null : doc.nombre)
                      }
                      aria-label="Ver documento"
                    >
                      <Eye size={15} strokeWidth={1.75} />
                    </button>
                    <a
                      className={styles.docActionBtn}
                      href={`${API_BASE}/docs/${doc.nombre}`}
                      download
                      aria-label="Descargar documento"
                    >
                      <Download size={15} strokeWidth={1.75} />
                    </a>
                  </div>
                </div>
              ))}
              {(!solicitud.documentos || solicitud.documentos.length === 0) && (
                <p className={styles.placeholder}>No hay documentos disponibles.</p>
              )}
            </div>

            {documentoSeleccionado && (
              <div className={styles.pdfWrapper}>
                <PDFViewer url={`${API_BASE}/docs/${documentoSeleccionado}`} />
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Historial</h3>
              {actoresHistorial.length > 1 && (
                <select
                  className={styles.historialFilter}
                  value={filtroActor}
                  onChange={(e) => setFiltroActor(e.target.value)}
                >
                  <option value="TODOS">Todos los movimientos</option>
                  {actoresHistorial.map((actor) => (
                    <option key={actor} value={actor}>
                      {labelActor(actor)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Timeline eventos={historialFiltrado} />
          </div>
        </div>

        {/* DERECHA */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Estado actual</h3>
            <div className={styles.estadoActualRow}>
              <StatusBadge status={solicitud.estadoInterno} />
            </div>
            {estadoMeta?.descripcion && <p className={styles.estadoDescripcion}>{estadoMeta.descripcion}</p>}
            {hint && <div className={styles.hintBox}>{hint}</div>}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Acciones</h3>

            {acciones.length > 0 ? (
              <div className={styles.actionsList}>
                {acciones.map((accion) => {
                  const config = actionConfig[accion];
                  return (
                    <button
                      key={accion}
                      className={`${buttonStyles.btn} ${config.tone === "danger" ? styles.dangerBtn : buttonStyles.primary}`}
                      onClick={() => setModalAction(accion)}
                    >
                      <config.Icon size={15} strokeWidth={2} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              motivoSinAcciones && (
                <p className={styles.placeholder}>
                  {motivoSinAcciones === "otro_departamento"
                    ? MENSAJE_SIN_ACCIONES.otro_departamento(solicitud.currentDepartment)
                    : MENSAJE_SIN_ACCIONES[motivoSinAcciones]}
                </p>
              )
            )}

            {esEstadoFinal(solicitud.estadoInterno) && solicitud.autorizacionPdf && (
              <a
                href={`${API_BASE}${solicitud.autorizacionPdf}`}
                target="_blank"
                rel="noreferrer"
                className={`${buttonStyles.btn} ${buttonStyles.secondary} ${styles.pdfLink}`}
              >
                Ver autorización (PDF)
              </a>
            )}

            {puedeVerAsegurado && (
              <Link
                href={`/policyholders/${solicitud.numeroPoliza}`}
                className={`${buttonStyles.btn} ${buttonStyles.tertiary} ${styles.pdfLink}`}
              >
                <ShieldCheck size={14} strokeWidth={1.75} />
                Ver póliza
              </Link>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>
                Notas internas <span className={styles.docCount}>{solicitud.notas?.length || 0}</span>
              </h3>
            </div>

            <div className={styles.notesFeed}>
              {(solicitud.notas || []).length === 0 && (
                <p className={styles.placeholder}>Sin notas todavía.</p>
              )}
              {(solicitud.notas || [])
                .slice()
                .reverse()
                .map((nota, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteHeader}>{labelActor(nota.author)}</div>
                    <div className={styles.noteText}>{nota.text}</div>
                    <div className={styles.noteDate}>
                      {nota.date ? new Date(nota.date).toLocaleDateString("es-ES") : ""}
                    </div>
                  </div>
                ))}
            </div>

            <div className={styles.noteInputBox}>
              <textarea
                className={styles.noteInput}
                placeholder="Escribe una nota..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
              />
              <button
                onClick={handleGuardarNota}
                className={`${buttonStyles.btn} ${buttonStyles.primary}`}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalAction && (
        <ActionModal
          isOpen
          onClose={() => setModalAction(null)}
          onConfirm={handleConfirmAction}
          submitting={submitting}
          {...actionConfig[modalAction]}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
