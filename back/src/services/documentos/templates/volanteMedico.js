// Plantilla VOLANTE_MEDICO -- referencia visual:
// docs/design-references/documents/flowly-volante.png
//
// A propósito NO es un informe A4: conserva el carácter de
// formulario/volante (panel de color, campos en caja, casillas de
// selección) que muestra la referencia. Solo reutiliza del layout
// compartido lo que de verdad tiene la misma forma en los 6 documentos:
// franja de marca, bloque de firma y pie de página. El resto (panel de
// color, campos en caja, casillas, código de volante) es exclusivo de
// esta plantilla y vive aquí, no en layout/.
//
// DATOS: todo lo que se pinta viene de `solicitud`, `policyholder` y
// `contenidoClinico` (contenido demo de la prestación, ver
// scripts/seed/contenidoClinicoDemo.js#VOLANTE_MEDICO). Nada de
// paciente/póliza/solicitud/médico/centro/prestación está hardcodeado
// en este fichero.
//
// GAPS DE DOMINIO (señalados, no resueltos inventando campos nuevos --
// ver instrucciones del Paso 4):
//   - La referencia muestra en "Colectivo" el nombre de la aseguradora
//     (p. ej. "ASISA"). Policyholder no tiene ese dato, solo
//     `policyType` (POLIZA PRIVADA/COLECTIVO/FUNCIONARIO). Se usa ese
//     campo bajo la etiqueta honesta "Tipo de póliza" en vez de
//     inventar una aseguradora.
//   - La referencia muestra "Benef." (nº de beneficiario dentro de la
//     póliza). No existe ese concepto en el dominio actual -- se omite
//     el campo por completo, no se rellena con nada inventado.
//   - "Nº DE AUTORIZACIÓN" y "CÓDIGO ACTO" son, en la propia
//     referencia, casillas en blanco "a cumplimentar" por el asegurado
//     / el médico a posteriori -- se pintan vacías a propósito, no es
//     un dato que falte.

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  pintarFranjaMarca,
  pintarBloqueFirma,
  pintarPiePagina,
  formatearFecha,
  formatearSexo,
  COLORS,
  FONTS,
  SIZES,
} = require("../layout");

// Paleta del panel del volante -- exclusiva de esta plantilla (no forma
// parte de la identidad compartida de theme.js porque ningún otro
// documento usa este tono crema/dorado).
const VOLANTE_COLORS = {
  panelBg: "#FBF3D6",
  panelBorder: "#E3D496",
  fieldBorder: "#B9C3DC",
  accent: "#1B3E8F",
};

const CARPETA_SALIDA = path.join(__dirname, "../../../../public/documentos-clinicos");

// --- helpers exclusivos del volante (no se comparten con otras plantillas) ---

function dibujarCampoCaja(doc, x, y, width, { label, value, alto = 32, valorGrande = false }) {
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(VOLANTE_COLORS.accent)
    .text(label, x, y, { width, lineBreak: false });

  const cajaY = y + 13;
  doc.rect(x, cajaY, width, alto).fillAndStroke(COLORS.white, VOLANTE_COLORS.fieldBorder);

  doc
    .font(valorGrande ? FONTS.bold : FONTS.regular)
    .fontSize(valorGrande ? 12.5 : SIZES.meta)
    .fillColor(COLORS.text)
    .text(value || "—", x + 8, cajaY + (alto - (valorGrande ? 14 : 11)) / 2, {
      width: width - 16,
      height: alto - 6,
      ellipsis: true,
    });

  return cajaY + alto;
}

function dibujarCasillasVacias(doc, x, y, { titulo, etiqueta, celdas = 6, celdaAncho = 22, celdaAlto = 20 }) {
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(VOLANTE_COLORS.accent)
    .text(titulo, x, y, { lineBreak: false });

  doc
    .font(FONTS.bold)
    .fontSize(SIZES.label)
    .fillColor(COLORS.text)
    .text(etiqueta, x, y + 12, { lineBreak: false });

  const filaY = y + 12;
  const etiquetaWidth = doc.widthOfString(etiqueta) + 10;
  for (let i = 0; i < celdas; i++) {
    doc
      .rect(x + etiquetaWidth + i * celdaAncho, filaY, celdaAncho - 2, celdaAlto)
      .fillAndStroke(COLORS.white, VOLANTE_COLORS.fieldBorder);
  }

  return filaY + celdaAlto;
}

function dibujarCheckbox(doc, x, y, { label, marcado }) {
  const size = 10;
  doc.rect(x, y, size, size).fillAndStroke(COLORS.white, VOLANTE_COLORS.fieldBorder);
  if (marcado) {
    doc
      .strokeColor(VOLANTE_COLORS.accent)
      .lineWidth(1.3)
      .moveTo(x + 1.5, y + 5)
      .lineTo(x + 4, y + size - 2)
      .lineTo(x + size - 1.5, y + 1.5)
      .stroke();
  }
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.meta)
    .fillColor(COLORS.text)
    .text(label, x + size + 6, y - 1, { lineBreak: false });

  return x + size + 6 + doc.widthOfString(label);
}

/** Barras decorativas (NO es un código de barras real/escaneable) a partir de un texto, solo para dar la apariencia visual de la referencia. */
function dibujarBarrasDecorativas(doc, x, y, width, height, semilla) {
  let hash = 0;
  for (let i = 0; i < semilla.length; i++) {
    hash = (hash * 31 + semilla.charCodeAt(i)) >>> 0;
  }

  let cursorX = x;
  doc.fillColor(COLORS.text);
  while (cursorX < x + width) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const grosor = 1 + (hash % 3);
    if (hash % 5 !== 0) {
      doc.rect(cursorX, y, grosor, height).fill();
    }
    cursorX += grosor + 1;
  }
}

// --- construcción de datos a partir del dominio ---

/**
 * Traduce Solicitud + Policyholder + contenido clínico demo a los
 * campos que pinta la plantilla. Separado de `generarVolanteMedico`
 * para poder testear el mapeo de datos sin generar un PDF real.
 */
function construirDatosVolante({ solicitud, policyholder, contenidoClinico }) {
  const prioridad = contenidoClinico?.prioridad || "ORDINARIA";

  return {
    numeroSolicitud: solicitud.numeroSolicitud,
    tipoPoliza: policyholder?.policyType || null,
    numeroPoliza: solicitud.numeroPoliza,
    dni: solicitud.dni || policyholder?.dni || null,
    nombreCompleto: solicitud.nombreCompleto,
    fechaNacimiento: formatearFecha(policyholder?.fechaNacimiento),
    sexo: formatearSexo(policyholder?.sexo),
    atencionDe: solicitud.especialidad ? `Servicio de ${solicitud.especialidad}` : null,
    centroMedico: solicitud.centroMedico,
    impresionDiagnostica: contenidoClinico?.impresionDiagnostica || null,
    prestacion: solicitud.nombrePrueba,
    prioridad,
    medicoNombre: solicitud.medicoSolicitante?.nombre || null,
    medicoEspecialidadLabel: solicitud.especialidad ? `Especialista en ${solicitud.especialidad}` : null,
    medicoColegiado: solicitud.medicoSolicitante?.numeroColegiado || null,
    fechaPrescripcion: formatearFecha(solicitud.createdAt),
    // Identificador del volante: derivado de numeroSolicitud, no es un
    // campo nuevo de modelo -- solo formato de presentación.
    identificadorVolante: `VM-${solicitud.numeroSolicitud.replace("SOL-", "")}`,
  };
}

// --- dibujo del documento ---

function dibujarVolante(doc, datos) {
  const pageLeft = 40;
  const pageWidth = doc.page.width - pageLeft * 2;

  let y = pintarFranjaMarca(doc);

  const panelTop = y;
  const panelBottom = doc.page.height - 40 - 46; // deja hueco para pie + aviso de validez
  const panelHeight = panelBottom - panelTop;

  doc
    .roundedRect(pageLeft, panelTop, pageWidth, panelHeight, 6)
    .fillAndStroke(VOLANTE_COLORS.panelBg, VOLANTE_COLORS.panelBorder);

  const pad = 22;
  const innerLeft = pageLeft + pad;
  const innerWidth = pageWidth - pad * 2;

  // --- Título + casillas "a cumplimentar" (arriba a la derecha) ---
  const tituloY = panelTop + 20;
  doc
    .font(FONTS.bold)
    .fontSize(20)
    .fillColor(VOLANTE_COLORS.accent)
    .text("VOLANTE MÉDICO", innerLeft, tituloY, { lineBreak: false });
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.subtitle)
    .fillColor(COLORS.textMuted)
    .text("Solicitud de prestación sanitaria", innerLeft, tituloY + 24, { lineBreak: false });

  const casillasX = pageLeft + pageWidth - 260;
  let casillasY = dibujarCasillasVacias(doc, casillasX, tituloY - 2, {
    titulo: "A cumplimentar por el asegurado",
    etiqueta: "Nº DE AUTORIZACIÓN",
    celdas: 6,
  });
  dibujarCasillasVacias(doc, casillasX, casillasY + 10, {
    titulo: "A cumplimentar por el médico",
    etiqueta: "CÓDIGO ACTO",
    celdas: 6,
  });

  // --- Fila: tipo de póliza / número de póliza / DNI ---
  let filaY = tituloY + 56;
  const col3 = (innerWidth - 20) / 3;
  dibujarCampoCaja(doc, innerLeft, filaY, col3, { label: "Tipo de póliza", value: datos.tipoPoliza });
  dibujarCampoCaja(doc, innerLeft + col3 + 10, filaY, col3, { label: "Número de póliza", value: datos.numeroPoliza });
  dibujarCampoCaja(doc, innerLeft + (col3 + 10) * 2, filaY, col3, { label: "DNI / NIF", value: datos.dni });

  // --- Fila: nombre del paciente / fecha nacimiento / sexo ---
  filaY += 58;
  const nombreWidth = innerWidth * 0.56;
  const fechaWidth = innerWidth * 0.2;
  const sexoX = innerLeft + nombreWidth + fechaWidth + 24;

  dibujarCampoCaja(doc, innerLeft, filaY, nombreWidth, {
    label: "Nombre y apellidos del paciente",
    value: datos.nombreCompleto,
    valorGrande: true,
  });
  dibujarCampoCaja(doc, innerLeft + nombreWidth + 12, filaY, fechaWidth, {
    label: "Fecha de nacimiento",
    value: datos.fechaNacimiento,
  });

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(VOLANTE_COLORS.accent)
    .text("Sexo", sexoX, filaY, { lineBreak: false });
  dibujarCheckbox(doc, sexoX, filaY + 18, { label: "M", marcado: datos.sexo === "Masculino" });
  dibujarCheckbox(doc, sexoX + 40, filaY + 18, { label: "F", marcado: datos.sexo === "Femenino" });

  // --- Fila: a la atención de / centro de realización ---
  filaY += 60;
  const col2 = (innerWidth - 16) / 2;
  dibujarCampoCaja(doc, innerLeft, filaY, col2, { label: "A la atención de:", value: datos.atencionDe });
  dibujarCampoCaja(doc, innerLeft + col2 + 16, filaY, col2, {
    label: "Centro de realización (si procede)",
    value: datos.centroMedico,
  });

  // --- Impresión diagnóstica ---
  filaY += 58;
  dibujarCampoCaja(doc, innerLeft, filaY, innerWidth, {
    label: "Impresión diagnóstica (a cumplimentar por el médico)",
    value: datos.impresionDiagnostica,
    alto: 40,
  });

  // --- Para la práctica de / prioridad ---
  filaY += 66;
  const prestacionWidth = innerWidth * 0.6;
  dibujarCampoCaja(doc, innerLeft, filaY, prestacionWidth, {
    label: "Para la práctica de:",
    value: datos.prestacion ? datos.prestacion.toUpperCase() : null,
    valorGrande: true,
  });

  const prioridadX = innerLeft + prestacionWidth + 24;
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(VOLANTE_COLORS.accent)
    .text("Prioridad", prioridadX, filaY, { lineBreak: false });
  let checkX = prioridadX;
  [
    { valor: "ORDINARIA", label: "Ordinaria" },
    { valor: "PREFERENTE", label: "Preferente" },
    { valor: "URGENTE", label: "Urgente" },
  ].forEach(({ valor, label }) => {
    checkX = dibujarCheckbox(doc, checkX, filaY + 18, { label, marcado: datos.prioridad === valor }) + 16;
  });

  // --- Firma / fecha de prescripción / identificador de volante ---
  filaY += 64;
  const firmaWidth = innerWidth * 0.4;
  const fechaPrescripcionX = innerLeft + firmaWidth + 20;
  const fechaPrescripcionWidth = innerWidth * 0.24;
  const identificadorX = fechaPrescripcionX + fechaPrescripcionWidth + 20;
  const identificadorWidth = innerWidth - firmaWidth - fechaPrescripcionWidth - 40;

  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label)
    .fillColor(VOLANTE_COLORS.accent)
    .text("FIRMA Y SELLO DEL PROFESIONAL", innerLeft, filaY, { width: firmaWidth, lineBreak: false });

  pintarBloqueFirma(doc, filaY + 16, {
    nombreMedico: datos.medicoNombre || "—",
    especialidadLabel: datos.medicoEspecialidadLabel,
    numeroColegiado: datos.medicoColegiado,
    centro: datos.centroMedico,
    x: innerLeft,
    width: firmaWidth,
  });

  dibujarCampoCaja(doc, fechaPrescripcionX, filaY, fechaPrescripcionWidth, {
    label: "Fecha de la prescripción",
    value: datos.fechaPrescripcion,
  });

  doc
    .roundedRect(identificadorX, filaY + 13, identificadorWidth, 32, 3)
    .fillAndStroke(COLORS.white, VOLANTE_COLORS.fieldBorder);
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.label - 0.5)
    .fillColor(COLORS.textMuted)
    .text("Nº Identificador de Volante", identificadorX, filaY + 17, {
      width: identificadorWidth,
      align: "center",
      lineBreak: false,
    });
  doc
    .font(FONTS.bold)
    .fontSize(SIZES.meta)
    .fillColor(COLORS.text)
    .text(datos.identificadorVolante, identificadorX, filaY + 30, {
      width: identificadorWidth,
      align: "center",
      lineBreak: false,
    });
  dibujarBarrasDecorativas(doc, identificadorX + 10, filaY + 50, identificadorWidth - 20, 12, datos.identificadorVolante);

  // --- Aviso de validez (dentro del panel, franja inferior) ---
  const avisoY = panelBottom - 24;
  doc
    .font(FONTS.regular)
    .fontSize(SIZES.footer)
    .fillColor(COLORS.textMuted)
    .text(
      "Este volante tiene una validez de 6 meses desde la fecha de emisión. Para cualquier duda, contacte con su profesional médico.",
      innerLeft,
      avisoY,
      { width: innerWidth },
    );

  pintarPiePagina(doc, {
    numeroDocumento: datos.identificadorVolante,
    tipoDocumentoLabel: "Volante médico",
    pagina: 1,
    totalPaginas: 1,
  });
}

/**
 * Genera el PDF de VOLANTE_MEDICO para una solicitud concreta y lo
 * escribe en back/public/documentos-clinicos/. Devuelve
 * { nombre, url } igual que generarAutorizacionPDF, para que el
 * servicio que llama pueda construir la entrada de
 * Solicitud.documentos[] sin más traducción.
 */
function generarVolanteMedico({ solicitud, policyholder, contenidoClinico }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CARPETA_SALIDA)) {
      fs.mkdirSync(CARPETA_SALIDA, { recursive: true });
    }

    const datos = construirDatosVolante({ solicitud, policyholder, contenidoClinico });

    const nombreArchivo = `volante-medico_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(CARPETA_SALIDA, nombreArchivo);

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    dibujarVolante(doc, datos);

    doc.end();

    stream.on("finish", () => {
      resolve({ nombre: nombreArchivo, url: `/documentos-clinicos/${nombreArchivo}` });
    });
    stream.on("error", reject);
  });
}

module.exports = { generarVolanteMedico, construirDatosVolante };
