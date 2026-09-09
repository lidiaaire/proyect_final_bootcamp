// Plantilla INFORME_URGENCIAS -- referencia visual:
// docs/design-references/documents/flowly-informeurgencias.png
//
// La referencia muestra también fecha/hora de llegada y alta y nivel de
// prioridad (triage); esos datos NO existen en el contenido clínico demo
// actual (solo motivo, exploración, pruebas, diagnóstico, tratamiento,
// evolución y destino) -- no se inventan, se omiten esos campos
// concretos y se mantiene el resto de la estructura.

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

function construirDatosInformeUrgencias({ solicitud, policyholder, contenidoClinico }) {
  return {
    numeroInforme: `IU-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
    numeroSolicitud: solicitud.numeroSolicitud,
    fecha: formatearFecha(solicitud.createdAt),
    centroMedico: solicitud.centroMedico,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    especialidad: solicitud.especialidad,
    motivoConsulta: contenidoClinico?.motivoConsulta || null,
    exploracionFisica: contenidoClinico?.exploracionFisica || [],
    pruebasComplementarias: contenidoClinico?.pruebasComplementarias || [],
    diagnostico: contenidoClinico?.diagnostico || null,
    cie10: contenidoClinico?.cie10 || null,
    tratamiento: contenidoClinico?.tratamiento || [],
    evolucion: contenidoClinico?.evolucion || null,
    destinoAlta: contenidoClinico?.destinoAlta || null,
  };
}

function dibujarInformeUrgencias(doc, datos, { solicitud, policyholder }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);

  let y = pintarCabecera(doc, {
    eyebrow: "Servicio de Urgencias",
    titulo: "Informe de urgencias",
    subtitulo: "Atención médica en servicio de urgencias",
    metadatos: [
      { label: "Nº de informe:", value: datos.numeroInforme },
      { label: "Nº de solicitud:", value: datos.numeroSolicitud },
      { label: "Fecha de atención:", value: datos.fecha },
      { label: "Servicio:", value: "Urgencias" },
      { label: "Centro:", value: datos.centroMedico },
    ],
  });

  const camposPaciente = construirCamposDatosPaciente({ solicitud, policyholder });
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPaciente));
  y = pintarDatosPaciente(doc, y, { campos: camposPaciente });

  // --- Motivo de consulta, ancho completo ---
  const seccionMotivo = { titulo: "Motivo de consulta", contenido: { tipo: "texto", texto: datos.motivoConsulta || "—" } };
  y = asegurarEspacio(doc, y, calcularAltoBloqueSeccion(doc, width, seccionMotivo.contenido));
  y = pintarBloqueSeccion(doc, left, y, width, seccionMotivo);

  // --- Exploración física + Pruebas complementarias, en paralelo ---
  const [colA, colB] = calcularColumnas(doc, 2);
  const seccionExploracion = {
    titulo: "Exploración física",
    contenido: { tipo: "lista", items: datos.exploracionFisica.length ? datos.exploracionFisica : ["—"] },
  };
  const seccionPruebas = {
    titulo: "Pruebas complementarias",
    contenido: { tipo: "lista", items: datos.pruebasComplementarias.length ? datos.pruebasComplementarias : ["—"] },
  };
  const altoPar1 = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionExploracion.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionPruebas.contenido),
  );
  y = asegurarEspacio(doc, y, altoPar1);
  const yA1 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionExploracion);
  const yB1 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionPruebas);
  y = Math.max(yA1, yB1);

  // --- Diagnóstico (destacado, + CIE-10) + Tratamiento en urgencias, en paralelo ---
  const textoDiagnostico = [datos.diagnostico, datos.cie10 ? `CIE-10: ${datos.cie10}` : null]
    .filter(Boolean)
    .join("\n");
  const seccionDiagnostico = {
    titulo: "Diagnóstico",
    tono: "destacado",
    contenido: { tipo: "texto", texto: textoDiagnostico || "—" },
  };
  const seccionTratamiento = {
    titulo: "Tratamiento en urgencias",
    contenido: { tipo: "lista", items: datos.tratamiento.length ? datos.tratamiento : ["—"] },
  };
  const altoPar2 = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionDiagnostico.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionTratamiento.contenido),
  );
  y = asegurarEspacio(doc, y, altoPar2);
  const yA2 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionDiagnostico);
  const yB2 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionTratamiento);
  y = Math.max(yA2, yB2);

  // --- Evolución + Destino al alta, en paralelo ---
  const seccionEvolucion = { titulo: "Evolución", contenido: { tipo: "texto", texto: datos.evolucion || "—" } };
  const seccionDestino = { titulo: "Destino al alta", contenido: { tipo: "texto", texto: datos.destinoAlta || "—" } };
  const altoPar3 = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionEvolucion.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionDestino.contenido),
  );
  y = asegurarEspacio(doc, y, altoPar3);
  const yA3 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionEvolucion);
  const yB3 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionDestino);
  y = Math.max(yA3, yB3);

  y = asegurarEspacio(doc, y, 40);
  pintarBloqueFirma(doc, y, {
    nombreMedico: datos.medicoNombre || "—",
    especialidadLabel: "Facultativo/a especialista en Medicina de Urgencias",
    numeroColegiado: datos.medicoColegiado,
    centro: datos.centroMedico,
    fechaLabel: "Fecha de validación",
    fechaValor: datos.fecha,
  });

  pintarPiesDeTodasLasPaginas(doc, pintarPiePagina, {
    numeroDocumento: datos.numeroInforme,
    tipoDocumentoLabel: "Informe de urgencias",
  });
}

function generarInformeUrgencias({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosInformeUrgencias({ solicitud, policyholder, contenidoClinico });
    const nombreArchivo = `informe-urgencias_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarInformeUrgencias(doc, datos, { solicitud, policyholder });

    doc.end();

    stream.on("finish", () => resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` }));
    stream.on("error", reject);
  });
}

module.exports = { generarInformeUrgencias, construirDatosInformeUrgencias };
