// Plantilla INFORME_RESULTADOS -- referencia visual:
// docs/design-references/documents/flowly-resultados.png
//
// Informe A4 estándar, mismo patrón que informeClinico.js. La
// referencia incluye un panel de "Imágenes representativas" (cortes de
// RM) que se omite a propósito: no hay imágenes médicas reales que
// mostrar y generar imágenes falsas de diagnóstico por imagen no encaja
// con "documento simulado creíble" (ver Paso 6/10 del diseño
// aprobado) -- el resto de la estructura sí se reconstruye.

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  pintarCabecera,
  pintarDatosPaciente,
  calcularAltoDatosPaciente,
  pintarBloqueSeccion,
  calcularAltoBloqueSeccion,
  pintarBloqueFirma,
  calcularAltoBloqueFirma,
  pintarPiePagina,
  asegurarEspacio,
  pintarPiesDeTodasLasPaginas,
  formatearFecha,
  PAGE,
  anchoContenido,
} = require("../layout");
const { construirCamposDatosPaciente } = require("./datosComunes");

const CARPETA_SALIDA = path.join(__dirname, "../../../../public/documentos-clinicos");

function construirDatosInformeResultados({ solicitud, policyholder, contenidoClinico }) {
  return {
    numeroInforme: `IR-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
    numeroSolicitud: solicitud.numeroSolicitud,
    fecha: formatearFecha(solicitud.createdAt),
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,
    nombrePrueba: solicitud.nombrePrueba,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    indicacionClinica: contenidoClinico?.indicacionClinica || null,
    tecnica: contenidoClinico?.tecnica || null,
    hallazgos: contenidoClinico?.hallazgos || [],
    resultado: contenidoClinico?.resultado || null,
    conclusion: contenidoClinico?.conclusion || null,
  };
}

function dibujarInformeResultados(doc, datos, { solicitud, policyholder }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);

  let y = pintarCabecera(doc, {
    eyebrow: datos.especialidad ? `Servicio de ${datos.especialidad}` : null,
    titulo: "Informe de Resultados",
    subtitulo: datos.nombrePrueba,
    metadatos: [
      { label: "Nº de informe:", value: datos.numeroInforme },
      { label: "Nº de solicitud:", value: datos.numeroSolicitud },
      { label: "Fecha del informe:", value: datos.fecha },
      { label: "Servicio:", value: datos.especialidad },
      { label: "Centro:", value: datos.centroMedico },
    ],
  });

  const camposPaciente = construirCamposDatosPaciente({ solicitud, policyholder });
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPaciente));
  y = pintarDatosPaciente(doc, y, { campos: camposPaciente });

  const camposPrueba = [
    { label: "Fecha de realización", value: datos.fecha },
    { label: "Tipo de prueba", value: datos.nombrePrueba },
    { label: "Profesional responsable", value: datos.medicoNombre },
    { label: "Nº de colegiado", value: datos.medicoColegiado },
  ];
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPrueba));
  y = pintarDatosPaciente(doc, y, { titulo: "Datos de la prueba", campos: camposPrueba });

  const secciones = [
    { titulo: "Indicación clínica", contenido: { tipo: "texto", texto: datos.indicacionClinica || "—" } },
    { titulo: "Técnica", contenido: { tipo: "texto", texto: datos.tecnica || "—" } },
    datos.hallazgos.length && { titulo: "Hallazgos", contenido: { tipo: "lista", items: datos.hallazgos } },
    {
      titulo: "Resultado / impresión diagnóstica",
      tono: "destacado",
      contenido: { tipo: "texto", texto: datos.resultado || "—" },
    },
    { titulo: "Conclusión", contenido: { tipo: "texto", texto: datos.conclusion || "—" } },
  ].filter(Boolean);

  secciones.forEach((seccion) => {
    const alto = calcularAltoBloqueSeccion(doc, width, seccion.contenido);
    y = asegurarEspacio(doc, y, alto);
    y = pintarBloqueSeccion(doc, left, y, width, seccion);
  });

  const opcionesFirma = {
    nombreMedico: datos.medicoNombre || "—",
    especialidadLabel: datos.especialidad ? `Especialista en ${datos.especialidad}` : null,
    numeroColegiado: datos.medicoColegiado,
    centro: datos.centroMedico,
    fechaLabel: "Fecha de validación",
    fechaValor: datos.fecha,
  };
  y = asegurarEspacio(doc, y, calcularAltoBloqueFirma(opcionesFirma));
  pintarBloqueFirma(doc, y, opcionesFirma);

  pintarPiesDeTodasLasPaginas(doc, pintarPiePagina, {
    numeroDocumento: datos.numeroInforme,
    tipoDocumentoLabel: "Informe de resultados",
  });
}

function generarInformeResultados({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosInformeResultados({ solicitud, policyholder, contenidoClinico });
    const nombreArchivo = `informe-resultados_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarInformeResultados(doc, datos, { solicitud, policyholder });

    doc.end();

    stream.on("finish", () => resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` }));
    stream.on("error", reject);
  });
}

module.exports = { generarInformeResultados, construirDatosInformeResultados };
