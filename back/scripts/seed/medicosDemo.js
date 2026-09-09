// Un médico solicitante demo por especialidad, para que
// Solicitud.medicoSolicitante sea coherente con Solicitud.especialidad
// (no tendría sentido que un traumatólogo prescriba una colonoscopia).
// Nombres y números de colegiado reutilizan, cuando coinciden, los ya
// usados en las referencias visuales aprobadas
// (docs/design-references/documents/) para que la demo se sienta como
// un único expediente coherente y no como datos sueltos.

const MEDICOS_POR_ESPECIALIDAD = {
  Digestivo: { nombre: "Dra. Elena Torres", numeroColegiado: "283746" },
  Radiología: { nombre: "Dr. Javier Molina", numeroColegiado: "284719" },
  Traumatología: { nombre: "Dra. Carmen Ibáñez", numeroColegiado: "291024" },
  "Cirugía General": { nombre: "Dr. Luis Herrera", numeroColegiado: "287654" },
  "Medicina Interna": { nombre: "Dr. Pedro Navarro", numeroColegiado: "275310" },
};

module.exports = { MEDICOS_POR_ESPECIALIDAD };
