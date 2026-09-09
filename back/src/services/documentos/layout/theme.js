// Paleta e identidad visual compartida por los 6 documentos clínicos de
// Braun Medical Center (INFORME_CLINICO, VOLANTE_MEDICO,
// INFORME_RESULTADOS, PROPUESTA_QUIRURGICA, INFORME_URGENCIAS,
// INFORME_ALTA_HOSPITALARIA). Extraída de las referencias visuales en
// docs/design-references/documents/ -- las imágenes NO se usan nunca
// como fondo del PDF, solo determinaron estos valores.
//
// IMPORTANTE: esta identidad (Braun Medical Center) es la del CENTRO
// MÉDICO que emite la documentación clínica. VOLANTE_AUTORIZACION (el
// documento que emite el propio Flowly al autorizar, referencia
// flowly-autorizacion.png / marca "SaludZen") es un circuito distinto y
// NO debe usar nada de este fichero -- se aborda en un paso posterior.
//
// Se usan fuentes estándar de PDFKit (Helvetica / Helvetica-Bold): no
// hace falta añadir ninguna fuente como asset para una tipografía
// sobria y legible.

const COLORS = {
  // Verde de marca (logo/cruz, acentos, bordes de bloques destacados).
  primary: "#1F7A54",
  primaryDark: "#155C3F",
  // Fondo muy suave verde-grisáceo para cabeceras de sección.
  sectionBg: "#EEF4F0",
  // Fondo aún más suave para bloques "destacados" (diagnóstico, conclusión).
  highlightBg: "#E3F1E8",
  // Texto principal (títulos), azul marino oscuro -- no negro puro.
  text: "#16273D",
  // Texto secundario / etiquetas.
  textMuted: "#64748B",
  // Texto terciario (pie de página, datos poco relevantes).
  textFaint: "#94A3B8",
  border: "#DCE3DF",
  borderLight: "#E8ECEA",
  white: "#FFFFFF",
};

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  oblique: "Helvetica-Oblique",
};

const SIZES = {
  eyebrow: 9,
  title: 22,
  subtitle: 11.5,
  sectionTitle: 10.5,
  body: 9.5,
  label: 8.5,
  meta: 9,
  footer: 8,
};

// Página A4 con márgenes iguales en los 4 lados -- todos los helpers
// asumen este mismo margen para poder alinear bloques sin recalcularlo
// cada vez.
const PAGE = {
  size: "A4",
  margin: 40,
};

module.exports = { COLORS, FONTS, SIZES, PAGE };
