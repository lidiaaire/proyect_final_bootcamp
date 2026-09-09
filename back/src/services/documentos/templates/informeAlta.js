// Plantilla INFORME_ALTA_HOSPITALARIA -- referencia visual:
// docs/design-references/documents/flowly-alta.png
//
// La referencia separa "Datos del ingreso" y "Datos del alta" con
// fecha/hora propias; el contenido clínico demo actual no modela un
// episodio de ingreso/alta con esas fechas concretas (solo
// motivoIngreso/diagnosticoPrincipal/procedimiento/evolución/tratamiento
// /recomendaciones) -- no se inventan fechas de ingreso/alta distintas
// de la propia solicitud, se usa `solicitud.createdAt` como única fecha
// del episodio y se omiten los campos que no existen en el dominio.

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

function construirDatosInformeAlta({ solicitud, policyholder, contenidoClinico }) {
  return {
    numeroInforme: `IH-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
    numeroSolicitud: solicitud.numeroSolicitud,
    fecha: formatearFecha(solicitud.createdAt),
    centroMedico: solicitud.centroMedico,
    especialidad: solicitud.especialidad,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    motivoIngreso: contenidoClinico?.motivoIngreso || null,
    diagnosticoPrincipal: contenidoClinico?.diagnosticoPrincipal || null,
    cie10: contenidoClinico?.cie10 || null,
    procedimientoRealizado: contenidoClinico?.procedimientoRealizado || null,
    hallazgosQuirurgicos: contenidoClinico?.hallazgosQuirurgicos || [],
    evolucionIngreso: contenidoClinico?.evolucionIngreso || null,
    tratamientoAlta: contenidoClinico?.tratamientoAlta || [],
    recomendacionesAlta: contenidoClinico?.recomendacionesAlta || [],
  };
}

function dibujarInformeAlta(doc, datos, { solicitud, policyholder }) {
  const left = PAGE.margin;
  const width = anchoContenido(doc);

  let y = pintarCabecera(doc, {
    eyebrow: "Servicio de Hospitalización",
    titulo: "Informe de alta hospitalaria",
    subtitulo: "Resumen del episodio asistencial",
    metadatos: [
      { label: "Nº de informe:", value: datos.numeroInforme },
      { label: "Nº de solicitud:", value: datos.numeroSolicitud },
      { label: "Fecha de alta:", value: datos.fecha },
      { label: "Servicio:", value: datos.especialidad },
      { label: "Centro:", value: datos.centroMedico },
    ],
  });

  const camposPaciente = construirCamposDatosPaciente({ solicitud, policyholder });
  y = asegurarEspacio(doc, y, calcularAltoDatosPaciente(camposPaciente));
  y = pintarDatosPaciente(doc, y, { campos: camposPaciente });

  const [colA, colB] = calcularColumnas(doc, 2);

  // --- Diagnóstico principal (destacado, + CIE-10) + Motivo de ingreso ---
  const textoDiagnostico = [datos.diagnosticoPrincipal, datos.cie10 ? `CIE-10: ${datos.cie10}` : null]
    .filter(Boolean)
    .join("\n");
  const seccionDiagnostico = {
    titulo: "Diagnóstico principal",
    tono: "destacado",
    contenido: { tipo: "texto", texto: textoDiagnostico || "—" },
  };
  const seccionMotivo = {
    titulo: "Motivo de ingreso",
    contenido: { tipo: "texto", texto: datos.motivoIngreso || "—" },
  };
  const altoPar1 = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionDiagnostico.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionMotivo.contenido),
  );
  y = asegurarEspacio(doc, y, altoPar1);
  const yA1 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionDiagnostico);
  const yB1 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionMotivo);
  y = Math.max(yA1, yB1);

  // --- Procedimiento realizado (+ Hallazgos quirúrgicos si existen) ---
  const seccionProcedimiento = {
    titulo: "Procedimiento realizado",
    contenido: { tipo: "texto", texto: datos.procedimientoRealizado || "—" },
  };

  if (datos.hallazgosQuirurgicos.length) {
    const seccionHallazgos = {
      titulo: "Hallazgos quirúrgicos",
      contenido: { tipo: "lista", items: datos.hallazgosQuirurgicos },
    };
    const altoPar2 = Math.max(
      calcularAltoBloqueSeccion(doc, colA.width, seccionProcedimiento.contenido),
      calcularAltoBloqueSeccion(doc, colB.width, seccionHallazgos.contenido),
    );
    y = asegurarEspacio(doc, y, altoPar2);
    const yA2 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionProcedimiento);
    const yB2 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionHallazgos);
    y = Math.max(yA2, yB2);
  } else {
    // Prestaciones sin cirugía (p. ej. ingreso médico por neumonía): el
    // procedimiento va a ancho completo, no hay hallazgos quirúrgicos
    // que inventar.
    y = asegurarEspacio(doc, y, calcularAltoBloqueSeccion(doc, width, seccionProcedimiento.contenido));
    y = pintarBloqueSeccion(doc, left, y, width, seccionProcedimiento);
  }

  // --- Evolución durante el ingreso + Tratamiento al alta ---
  const seccionEvolucion = {
    titulo: "Evolución durante el ingreso",
    contenido: { tipo: "texto", texto: datos.evolucionIngreso || "—" },
  };
  const seccionTratamiento = {
    titulo: "Tratamiento al alta",
    contenido: {
      tipo: "tabla",
      encabezados: ["Medicamento", "Pauta"],
      filas: datos.tratamientoAlta.length
        ? datos.tratamientoAlta.map((t) => [t.medicamento, t.pauta])
        : [["—", "—"]],
    },
  };
  const altoPar3 = Math.max(
    calcularAltoBloqueSeccion(doc, colA.width, seccionEvolucion.contenido),
    calcularAltoBloqueSeccion(doc, colB.width, seccionTratamiento.contenido),
  );
  y = asegurarEspacio(doc, y, altoPar3);
  const yA3 = pintarBloqueSeccion(doc, colA.x, y, colA.width, seccionEvolucion);
  const yB3 = pintarBloqueSeccion(doc, colB.x, y, colB.width, seccionTratamiento);
  y = Math.max(yA3, yB3);

  // --- Recomendaciones al alta, ancho completo ---
  if (datos.recomendacionesAlta.length) {
    const seccionRecomendaciones = {
      titulo: "Recomendaciones al alta",
      contenido: { tipo: "lista", items: datos.recomendacionesAlta },
    };
    y = asegurarEspacio(doc, y, calcularAltoBloqueSeccion(doc, width, seccionRecomendaciones.contenido));
    y = pintarBloqueSeccion(doc, left, y, width, seccionRecomendaciones);
  }

  y = asegurarEspacio(doc, y, 40);
  pintarBloqueFirma(doc, y, {
    nombreMedico: datos.medicoNombre || "—",
    especialidadLabel: datos.especialidad ? `Especialista en ${datos.especialidad}` : null,
    numeroColegiado: datos.medicoColegiado,
    centro: datos.centroMedico,
    fechaLabel: "Fecha de emisión",
    fechaValor: datos.fecha,
  });

  pintarPiesDeTodasLasPaginas(doc, pintarPiePagina, {
    numeroDocumento: datos.numeroInforme,
    tipoDocumentoLabel: "Informe de alta hospitalaria",
  });
}

function generarInformeAlta({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosInformeAlta({ solicitud, policyholder, contenidoClinico });
    const nombreArchivo = `informe-alta_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarInformeAlta(doc, datos, { solicitud, policyholder });

    doc.end();

    stream.on("finish", () => resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` }));
    stream.on("error", reject);
  });
}

module.exports = { generarInformeAlta, construirDatosInformeAlta };
