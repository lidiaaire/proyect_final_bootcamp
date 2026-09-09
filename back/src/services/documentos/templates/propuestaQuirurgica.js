// Plantilla PROPUESTA_QUIRURGICA -- referencia visual:
// docs/design-references/documents/flowly-cirugia.png
//
// Informe A4 con secciones en paralelo (diagnóstico+antecedentes,
// procedimiento+técnica) -- usa `calcularColumnas` del layout
// compartido, ya pensado exactamente para este patrón.
//
// La referencia también muestra "Fecha prevista de intervención"; no
// existe ese dato en el dominio (ni en Solicitud ni en el contenido
// clínico demo) y no se inventa -- se omite ese bloque.

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  pintarCabecera,
  pintarDatosPaciente,
  calcularAltoDatosPaciente,
  pintarBloqueSeccion,
  calcularColumnas,
  calcularAltoBloqueSeccion,
  pintarBloqueFirma,
  pintarPiePagina,
  asegurarEspacio,
  pintarPiesDeTodasLasPaginas,
  formatearFecha,
  PAGE,
  anchoContenido,
} = require("../layout");
const { construirCamposDatosPaciente } = require("./datosComunes");

const CARPETA_SALIDA = path.join(__dirname, "../../../../public/documentos-clinicos");

function construirDatosPropuestaQuirurgica({ solicitud, policyholder, contenidoClinico }) {
  return {
    numeroInforme: `IQ-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
    numeroSolicitud: solicitud.numeroSolicitud,
    fecha: formatearFecha(solicitud.createdAt),
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,
    nombrePrueba: solicitud.nombrePrueba,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    diagnostico: contenidoClinico?.diagnostico || null,
    antecedentes: contenidoClinico?.antecedentes || [],
    justificacion: contenidoClinico?.justificacion || null,
    procedimiento: contenidoClinico?.procedimiento || null,
    tecnicaQuirurgica: contenidoClinico?.tecnicaQuirurgica || [],
    materialProtesico: contenidoClinico?.materialProtesico || [],
  };
}

function dibujarPropuestaQuirurgica(doc, datos, { solicitud, policyholder }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);

  let y = pintarCabecera(doc, {
    eyebrow: "Informe / Propuesta quirúrgica",
    titulo: "Propuesta quirúrgica",
    subtitulo: datos.procedimiento || datos.nombrePrueba,
    metadatos: [
      { label: "Nº de informe:", value: datos.numeroInforme },
      { label: "Nº de solicitud:", value: datos.numeroSolicitud },
      { label: "Fecha de emisión:", value: datos.fecha },
      { label: "Servicio:", value: datos.especialidad },
      { label: "Centro:", value: datos.centroMedico },
    ],
  });

  const camposPaciente = construirCamposDatosPaciente({ solicitud, policyholder });
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPaciente));
  y = pintarDatosPaciente(doc, y, { campos: camposPaciente });

  // --- Diagnóstico + Antecedentes, en paralelo ---
  const [colA, colB] = calcularColumnas(doc, 2);
  const seccionDiagnostico = {
    titulo: "Diagnóstico",
    tono: "destacado",
    contenido: { tipo: "texto", texto: datos.diagnostico || "—" },
  };
  const seccionAntecedentes = {
    titulo: "Antecedentes relevantes",
    contenido: { tipo: "lista", items: datos.antecedentes.length ? datos.antecedentes : ["—"] },
  };
  const altoParDiagAntecedentes = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionDiagnostico.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionAntecedentes.contenido),
  );
  y = asegurarEspacio(doc, y, altoParDiagAntecedentes);
  const yA1 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionDiagnostico);
  const yB1 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionAntecedentes);
  y = Math.max(yA1, yB1);

  // --- Justificación, ancho completo ---
  const seccionJustificacion = {
    titulo: "Justificación de la intervención",
    contenido: { tipo: "texto", texto: datos.justificacion || "—" },
  };
  y = asegurarEspacio(doc, y, calcularAltoBloqueSeccion(doc, width, seccionJustificacion.contenido));
  y = pintarBloqueSeccion(doc, left, y, width, seccionJustificacion);

  // --- Procedimiento propuesto + Técnica quirúrgica, en paralelo ---
  const seccionProcedimiento = {
    titulo: "Procedimiento propuesto",
    contenido: { tipo: "texto", texto: datos.procedimiento || "—" },
  };
  const seccionTecnica = {
    titulo: "Técnica quirúrgica prevista",
    contenido: { tipo: "lista", items: datos.tecnicaQuirurgica.length ? datos.tecnicaQuirurgica : ["—"] },
  };
  const altoParProcTecnica = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionProcedimiento.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionTecnica.contenido),
  );
  y = asegurarEspacio(doc, y, altoParProcTecnica);
  const yA2 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionProcedimiento);
  const yB2 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionTecnica);
  y = Math.max(yA2, yB2);

  // --- Material protésico requerido, ancho completo (solo si aplica) ---
  if (datos.materialProtesico.length) {
    const seccionMaterial = {
      titulo: "Material protésico requerido",
      contenido: {
        tipo: "tabla",
        encabezados: ["Descripción", "Lateralidad"],
        filas: datos.materialProtesico.map((m) => [m.descripcion, m.lateralidad || "—"]),
      },
    };
    y = asegurarEspacio(doc, y, calcularAltoBloqueSeccion(doc, width, seccionMaterial.contenido));
    y = pintarBloqueSeccion(doc, left, y, width, seccionMaterial);
  }

  y = asegurarEspacio(doc, y, 40);
  pintarBloqueFirma(doc, y, {
    nombreMedico: datos.medicoNombre || "—",
    especialidadLabel: datos.especialidad ? `Especialista en ${datos.especialidad}` : null,
    numeroColegiado: datos.medicoColegiado,
    centro: datos.centroMedico,
    fechaLabel: "Fecha de validación",
    fechaValor: datos.fecha,
  });

  pintarPiesDeTodasLasPaginas(doc, pintarPiePagina, {
    numeroDocumento: datos.numeroInforme,
    tipoDocumentoLabel: "Propuesta quirúrgica",
  });
}

function generarPropuestaQuirurgica({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosPropuestaQuirurgica({ solicitud, policyholder, contenidoClinico });
    const nombreArchivo = `propuesta-quirurgica_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarPropuestaQuirurgica(doc, datos, { solicitud, policyholder });

    doc.end();

    stream.on("finish", () => resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` }));
    stream.on("error", reject);
  });
}

module.exports = { generarPropuestaQuirurgica, construirDatosPropuestaQuirurgica };
