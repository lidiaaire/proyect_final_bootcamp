// Reexporta los estados de Solicitud desde la fuente única de verdad
// (core/solicitudFlowRules.js) para no duplicar la lista de estados en
// dos sitios. Mantener este archivo solo por compatibilidad de import
// (`require("../core/constants/solicitudEstados")`) para quien ya lo use
// o lo use en el futuro.

const { ESTADOS } = require("../solicitudFlowRules");

module.exports = { ESTADOS };
