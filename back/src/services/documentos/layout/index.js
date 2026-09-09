// Punto de entrada único de la infraestructura visual compartida de los
// 6 documentos clínicos de Braun Medical Center. Las plantillas
// concretas (paso posterior) importan de aquí, no de cada fichero suelto.

const { COLORS, FONTS, SIZES, PAGE } = require("./theme");
const {
  anchoContenido,
  formatearFecha,
  formatearFechaHora,
  calcularEdad,
  formatearSexo,
} = require("./utils");
const { IDENTIDAD_BRAUN, pintarFranjaMarca, pintarTituloConMetadatos, pintarCabecera } = require("./cabecera");
const { pintarPiePagina, TEXTO_IDENTIDAD_DEMO } = require("./piePagina");
const { pintarDatosPaciente, calcularAltoDatosPaciente } = require("./datosPaciente");
const { pintarBloqueSeccion, calcularColumnas, calcularAltoBloqueSeccion } = require("./bloqueSeccion");
const { pintarBloqueFirma } = require("./bloqueFirma");
const { asegurarEspacio, pintarPiesDeTodasLasPaginas } = require("./paginacion");

module.exports = {
  // theme
  COLORS,
  FONTS,
  SIZES,
  PAGE,
  // utils
  anchoContenido,
  formatearFecha,
  formatearFechaHora,
  calcularEdad,
  formatearSexo,
  // cabecera
  IDENTIDAD_BRAUN,
  pintarFranjaMarca,
  pintarTituloConMetadatos,
  pintarCabecera,
  // pie
  pintarPiePagina,
  TEXTO_IDENTIDAD_DEMO,
  // datos paciente
  pintarDatosPaciente,
  calcularAltoDatosPaciente,
  // secciones
  pintarBloqueSeccion,
  calcularColumnas,
  calcularAltoBloqueSeccion,
  // firma
  pintarBloqueFirma,
  // paginación (informes A4 que pueden ocupar más de una página)
  asegurarEspacio,
  pintarPiesDeTodasLasPaginas,
};
