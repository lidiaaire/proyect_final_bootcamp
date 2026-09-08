import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/SolicitudDetalle.module.css";
import buttonStyles from "@/styles/Button.module.css";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import { createSolicitud } from "@/api/solicitudes";
import { getPolicyholder } from "@/api/policyholders";

// Página mínima y funcional para que PRESTACIONES pueda dar de alta una
// solicitud real (Sprint 1C). Reutiliza las clases ya existentes de
// SolicitudDetalle.module.css (secciones, input de nota) y, desde
// Sprint 3A, `PageHeader`/`Button.module.css` como el resto de la app --
// antes usaba `.header`/`.button`/`.buttonPrimary` que ya no existían en
// SolicitudDetalle.module.css desde el rediseño de 2D (quedaba sin
// ningún estilo aplicado, algo que en el tema claro pasaba
// desapercibido y en el oscuro resultaba en controles nativos sin skin).
export default function NuevaSolicitud() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [numeroPoliza, setNumeroPoliza] = useState("");
  const [asegurado, setAsegurado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [errorAsegurado, setErrorAsegurado] = useState("");

  const [nombrePrueba, setNombrePrueba] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [centroMedico, setCentroMedico] = useState("");
  const [comentario, setComentario] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  // Autenticación + permiso: solo PRESTACIONES puede estar aquí. No es
  // solo un botón oculto en el menú -- si alguien llega por URL directa
  // sin ser PRESTACIONES, se le redirige (el backend igualmente
  // rechazaría la creación con 403).
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (user?.role !== "PRESTACIONES") {
      router.push("/solicitudes");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  // Si se llega desde la ficha de un asegurado (?numeroPoliza=XXXX), se
  // precarga y se busca automáticamente.
  useEffect(() => {
    if (!router.isReady) return;
    const { numeroPoliza: desdeQuery } = router.query;
    if (desdeQuery) {
      setNumeroPoliza(String(desdeQuery));
      buscarAsegurado(String(desdeQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  async function buscarAsegurado(valor) {
    const numero = (valor ?? numeroPoliza).trim();
    if (!numero) return;

    setBuscando(true);
    setErrorAsegurado("");
    setAsegurado(null);

    try {
      const encontrado = await getPolicyholder(numero);
      if (!encontrado) {
        setErrorAsegurado(`No existe ningún asegurado con la póliza "${numero}".`);
      } else {
        setAsegurado(encontrado);
      }
    } catch {
      setErrorAsegurado("Error buscando el asegurado.");
    } finally {
      setBuscando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorEnvio("");

    if (!asegurado) {
      setErrorEnvio("Busca y confirma un asegurado antes de continuar.");
      return;
    }
    if (!nombrePrueba.trim() || !especialidad.trim() || !centroMedico.trim()) {
      setErrorEnvio("Prueba, especialidad y centro médico son obligatorios.");
      return;
    }

    setEnviando(true);

    try {
      const creada = await createSolicitud({
        numeroPoliza: asegurado.id,
        nombrePrueba: nombrePrueba.trim(),
        especialidad: especialidad.trim(),
        centroMedico: centroMedico.trim(),
        comentario: comentario.trim(),
      });

      router.push(`/solicitudes/${creada.id}?creada=1`);
    } catch (error) {
      const detalle = error.details?.length ? ` (${error.details.join(" ")})` : "";
      setErrorEnvio(`${error.message}${detalle}`);
    } finally {
      setEnviando(false);
    }
  }

  if (checkingAuth) return <p>Cargando...</p>;

  return (
    <>
      <PageHeader
        title="Nueva solicitud"
        subtitle='Se crea con estado "Pendiente de gestión", a cargo de Prestaciones.'
      />

      <form onSubmit={handleSubmit} className={styles.section} style={{ maxWidth: 520 }}>
        <h3>Asegurado</h3>

        <div className={styles.noteInputBox}>
          <input
            className={styles.noteInput}
            type="text"
            placeholder="Número de póliza"
            value={numeroPoliza}
            onChange={(e) => setNumeroPoliza(e.target.value)}
          />
          <button
            type="button"
            className={`${buttonStyles.btn} ${buttonStyles.secondary}`}
            onClick={() => buscarAsegurado()}
            disabled={buscando}
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {errorAsegurado && (
          <p style={{ color: "red", marginTop: 8 }}>{errorAsegurado}</p>
        )}

        {asegurado && (
          <p className={styles.placeholder} style={{ marginTop: 8 }}>
            ✓ {asegurado.name} · DNI {asegurado.dni} · Póliza {asegurado.id}
          </p>
        )}

        <h3 style={{ marginTop: 20 }}>Datos de la prueba</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className={styles.noteInput}
            type="text"
            placeholder="Prueba (p. ej. Resonancia Magnética)"
            value={nombrePrueba}
            onChange={(e) => setNombrePrueba(e.target.value)}
          />
          <input
            className={styles.noteInput}
            type="text"
            placeholder="Especialidad (p. ej. Radiología)"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          />
          <input
            className={styles.noteInput}
            type="text"
            placeholder="Centro médico"
            value={centroMedico}
            onChange={(e) => setCentroMedico(e.target.value)}
          />
          <textarea
            className={styles.noteInput}
            placeholder="Comentario inicial (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        {errorEnvio && <p style={{ color: "red", marginTop: 12 }}>{errorEnvio}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            className={`${buttonStyles.btn} ${buttonStyles.secondary}`}
            onClick={() => router.push("/solicitudes")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`${buttonStyles.btn} ${buttonStyles.primary}`}
            disabled={enviando}
          >
            {enviando ? "Creando..." : "Crear solicitud"}
          </button>
        </div>
      </form>
    </>
  );
}
