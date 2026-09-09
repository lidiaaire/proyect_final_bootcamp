// Fixture TEMPORAL de validación visual para el Paso 3 (infraestructura
// de layout documental). Genera un único PDF de ejemplo con datos
// ficticios controlados (NO datos reales de Solicitud/Policyholder, NO
// seed) para poder revisar a simple vista que los helpers de
// back/src/services/documentos/layout/ producen algo parecido a las
// referencias visuales.
//
// Este script NO se conecta a Mongo, NO escribe en Solicitud.documentos,
// NO se llama desde ningún seed ni desde generarDocumento (que todavía
// no existe). Es exclusivamente una herramienta de desarrollo para
// validar el layout aislado -- se puede borrar en cuanto el diseño de
// esta capa quede aprobado, o conservarse como fixture de desarrollo si
// se prefiere (no se ejecuta nunca en producción ni en el seed).
//
// Uso: node scripts/dev/previewLayoutPdf.js [ruta-de-salida.pdf]

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  pintarFranjaMarca,
  pintarTituloConMetadatos,
  pintarPiePagina,
  pintarDatosPaciente,
  pintarBloqueSeccion,
  calcularColumnas,
  pintarBloqueFirma,
  PAGE,
} = require("../../src/services/documentos/layout");

// Datos puramente ficticios de validación -- ningún dato real de
// asegurado ni de solicitud. Coherentes entre sí solo para que el PDF
// de prueba se lea bien (no representan a nadie).
const DATOS_FICTICIOS = {
  numeroInforme: "IC-2026-DEV-0001",
  numeroSolicitud: "SOL-DEV-0001",
  paciente: {
    nombre: "Paciente de Prueba",
    dni: "00000000T",
    fechaNacimiento: "01/01/1980 (46 años)",
    sexo: "Masculino",
    numeroPoliza: "000000",
    entidadAseguradora: "Aseguradora Demo",
  },
  medico: {
    nombre: "Dra. Prueba de Layout",
    especialidad: "Especialista en Validación Visual",
    numeroColegiado: "000000",
  },
};

function generarPdfPrueba(rutaSalida) {
  const doc = new PDFDocument({ size: PAGE.size, margin: PAGE.margin });
  const stream = fs.createWriteStream(rutaSalida);
  doc.pipe(stream);

  let y = pintarFranjaMarca(doc);
  y = pintarTituloConMetadatos(doc, y, {
    eyebrow: "Validación de layout",
    titulo: "Documento de prueba",
    subtitulo: "Fixture temporal -- Paso 3, no es una plantilla final",
    metadatos: [
      { label: "Nº de informe:", value: DATOS_FICTICIOS.numeroInforme },
      { label: "Nº de solicitud:", value: DATOS_FICTICIOS.numeroSolicitud },
      { label: "Fecha:", value: "01/01/2026" },
      { label: "Servicio:", value: "Validación" },
      { label: "Centro:", value: "Braun Medical Center" },
    ],
  });

  y = pintarDatosPaciente(doc, y, {
    campos: [
      { label: "Nombre y apellidos", value: DATOS_FICTICIOS.paciente.nombre },
      { label: "DNI", value: DATOS_FICTICIOS.paciente.dni },
      { label: "Fecha de nacimiento", value: DATOS_FICTICIOS.paciente.fechaNacimiento },
      { label: "Sexo", value: DATOS_FICTICIOS.paciente.sexo },
      { label: "Nº de póliza", value: DATOS_FICTICIOS.paciente.numeroPoliza },
      { label: "Entidad aseguradora", value: DATOS_FICTICIOS.paciente.entidadAseguradora },
    ],
  });

  // Dos secciones en paralelo (como en resultados/cirugía/urgencias/alta).
  const [colA, colB] = calcularColumnas(doc, 2);
  const yA = pintarBloqueSeccion(doc, colA.x, y, colA.width, {
    titulo: "Sección de ejemplo A",
    contenido: {
      tipo: "lista",
      items: [
        "Primer punto de validación del bloque de lista.",
        "Segundo punto, algo más largo para comprobar el salto de línea dentro de la columna.",
      ],
    },
  });
  const yB = pintarBloqueSeccion(doc, colB.x, y, colB.width, {
    titulo: "Sección de ejemplo B",
    contenido: {
      tipo: "tabla",
      encabezados: ["Descripción", "Valor"],
      filas: [
        ["Campo de prueba 1", "Valor 1"],
        ["Campo de prueba 2", "Valor 2"],
      ],
    },
  });
  y = Math.max(yA, yB);

  y = pintarBloqueSeccion(doc, PAGE.margin, y, doc.page.width - PAGE.margin * 2, {
    titulo: "Bloque destacado (diagnóstico/conclusión)",
    tono: "destacado",
    contenido: {
      tipo: "texto",
      texto: "Texto de ejemplo para comprobar el tono destacado, con fondo e interior más marcados que una sección normal.",
    },
  });

  pintarBloqueFirma(doc, y + 10, {
    nombreMedico: DATOS_FICTICIOS.medico.nombre,
    especialidadLabel: DATOS_FICTICIOS.medico.especialidad,
    numeroColegiado: DATOS_FICTICIOS.medico.numeroColegiado,
    centro: "Braun Medical Center",
    fechaValor: "01/01/2026",
  });

  pintarPiePagina(doc, {
    numeroDocumento: DATOS_FICTICIOS.numeroInforme,
    tipoDocumentoLabel: "Documento de prueba (layout)",
    pagina: 1,
    totalPaginas: 1,
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(rutaSalida));
    stream.on("error", reject);
  });
}

if (require.main === module) {
  const rutaSalida = process.argv[2] || path.join(__dirname, "preview-layout.pdf");
  generarPdfPrueba(rutaSalida)
    .then((ruta) => console.log("PDF de validación generado en:", ruta))
    .catch((error) => {
      console.error("Error generando el PDF de validación:", error);
      process.exit(1);
    });
}

module.exports = { generarPdfPrueba };
