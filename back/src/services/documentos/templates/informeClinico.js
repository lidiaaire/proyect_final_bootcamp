// Plantilla INFORME_CLINICO -- referencia visual:
// docs/design-references/documents/flowly-informeclinico.png
//
// Informe A4 estándar: reutiliza cabecera, datos del paciente, bloques
// de sección, firma y pie del layout compartido tal cual -- no necesita
// ningún bloque exclusivo propio (a diferencia de VOLANTE_MEDICO).
//
// DATOS: administrativos de `solicitud`/`policyholder`; contenido
// clínico exclusivamente de `contenidoClinico`
// (scripts/seed/contenidoClinicoDemo.js#INFORME_CLINICO). Nada
// hardcodeado.

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

function construirDatosInformeClinico({ solicitud, policyholder, contenidoClinico }) {
  return {
    numeroInforme: `IC-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
    numeroSolicitud: solicitud.numeroSolicitud,
    fecha: formatearFecha(solicitud.createdAt),
    especialidad: solicitud.especialidad,
    centroMedico: solicitud.centroMedico,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    motivoConsulta: contenidoClinico?.motivoConsulta || null,
    antecedentes: contenidoClinico?.antecedentes || [],
    exploracionHallazgos: contenidoClinico?.exploracionHallazgos || null,
    diagnostico: contenidoClinico?.diagnostico || null,
    recomendaciones: contenidoClinico?.recomendaciones || [],
  };
}

function dibujarInformeClinico(doc, datos, { solicitud, policyholder }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);

  let y = pintarCabecera(doc, {
    titulo: "Informe Clínico",
    subtitulo: "Consulta de Especialidad",
    metadatos: [
      { label: "Nº de informe:", value: datos.numeroInforme },
      { label: "Nº de solicitud:", value: datos.numeroSolicitud },
      { label: "Fecha:", value: datos.fecha },
      { label: "Servicio:", value: datos.especialidad },
      { label: "Centro:", value: datos.centroMedico },
    ],
  });

  const camposPaciente = construirCamposDatosPaciente({ solicitud, policyholder });
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPaciente));
  y = pintarDatosPaciente(doc, y, { campos: camposPaciente });

  const camposAsistenciales = [
    { label: "Centro", value: datos.centroMedico },
    { label: "Profesional responsable", value: datos.medicoNombre },
    { label: "Nº de colegiado", value: datos.medicoColegiado },
    { label: "Especialidad", value: datos.especialidad },
    { label: "Fecha de la consulta", value: datos.fecha },
  ];
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposAsistenciales));
  y = pintarDatosPaciente(doc, y, { titulo: "Datos asistenciales", campos: camposAsistenciales });

  const secciones = [
    { titulo: "Motivo de consulta", contenido: { tipo: "texto", texto: datos.motivoConsulta || "—" } },
    datos.antecedentes.length && {
      titulo: "Antecedentes relevantes",
      contenido: { tipo: "lista", items: datos.antecedentes },
    },
    { titulo: "Exploración y hallazgos", contenido: { tipo: "texto", texto: datos.exploracionHallazgos || "—" } },
    {
      titulo: "Diagnóstico",
      tono: "destacado",
      contenido: { tipo: "texto", texto: datos.diagnostico || "—" },
    },
    datos.recomendaciones.length && {
      titulo: "Recomendaciones",
      contenido: { tipo: "lista", items: datos.recomendaciones },
    },
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
    tipoDocumentoLabel: "Documento clínico",
  });
}

function generarInformeClinico({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosInformeClinico({ solicitud, policyholder, contenidoClinico });
    const nombreArchivo = `informe-clinico_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarInformeClinico(doc, datos, { solicitud, policyholder });

    doc.end();

    stream.on("finish", () => resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` }));
    stream.on("error", reject);
  });
}

module.exports = { generarInformeClinico, construirDatosInformeClinico };
