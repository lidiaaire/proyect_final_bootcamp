// Tests del circuito de generación de documentos clínicos (dispatcher +
// mapeo de datos de las 6 familias clínicas + guarda de idempotencia).
// Sin base de datos ni PDFKit real -- se testea la lógica pura (mapeo
// de dominio -> campos de plantilla, dispatcher, idempotencia), no el
// dibujo del PDF en sí (eso se valida visualmente, ver
// scripts/dev/previewLayoutPdf.js y los PDFs representativos generados
// en el seed).
//
// Ejecutar con: node --test tests/

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generarDocumento,
  TipoDocumentoNoImplementadoError,
  GENERADORES_POR_TIPO,
  yaTieneDocumentoDeTipo,
} = require("../src/services/documentos/generarDocumento");
const { construirDatosVolante } = require("../src/services/documentos/templates/volanteMedico");
const { construirDatosInformeClinico } = require("../src/services/documentos/templates/informeClinico");
const { construirDatosInformeResultados } = require("../src/services/documentos/templates/informeResultados");
const { construirDatosPropuestaQuirurgica } = require("../src/services/documentos/templates/propuestaQuirurgica");
const { construirDatosInformeUrgencias } = require("../src/services/documentos/templates/informeUrgencias");
const { construirDatosInformeAlta } = require("../src/services/documentos/templates/informeAlta");

// --- dispatcher ---

test("generarDocumento: las 6 familias clínicas están implementadas (VOLANTE_AUTORIZACION queda fuera, es otro circuito)", () => {
  assert.deepEqual(
    new Set(Object.keys(GENERADORES_POR_TIPO)),
    new Set([
      "VOLANTE_MEDICO",
      "INFORME_CLINICO",
      "INFORME_RESULTADOS",
      "PROPUESTA_QUIRURGICA",
      "INFORME_URGENCIAS",
      "INFORME_ALTA_HOSPITALARIA",
    ]),
  );
});

test("generarDocumento: un tipo no implementado (VOLANTE_AUTORIZACION) falla de forma explícita y controlada", async () => {
  await assert.rejects(
    () => generarDocumento("VOLANTE_AUTORIZACION", {}),
    (error) => {
      assert.ok(error instanceof TipoDocumentoNoImplementadoError);
      assert.equal(error.tipo, "VOLANTE_AUTORIZACION");
      assert.match(error.message, /VOLANTE_AUTORIZACION/);
      return true;
    },
  );
});

test("generarDocumento: un tipo inexistente en el dominio también falla explícito (no genera nada en silencio)", async () => {
  await assert.rejects(() => generarDocumento("TIPO_QUE_NO_EXISTE", {}), TipoDocumentoNoImplementadoError);
});

// --- idempotencia ---

test("yaTieneDocumentoDeTipo: true si ya existe un documento de ese tipo", () => {
  const documentos = [{ tipo: "VOLANTE_MEDICO", nombre: "x.pdf" }];
  assert.equal(yaTieneDocumentoDeTipo(documentos, "VOLANTE_MEDICO"), true);
});

test("yaTieneDocumentoDeTipo: false si el array está vacío o no tiene ese tipo", () => {
  assert.equal(yaTieneDocumentoDeTipo([], "VOLANTE_MEDICO"), false);
  assert.equal(yaTieneDocumentoDeTipo([{ tipo: "INFORME_CLINICO" }], "VOLANTE_MEDICO"), false);
});

test("yaTieneDocumentoDeTipo: no explota si documentos es undefined/null", () => {
  assert.equal(yaTieneDocumentoDeTipo(undefined, "VOLANTE_MEDICO"), false);
  assert.equal(yaTieneDocumentoDeTipo(null, "VOLANTE_MEDICO"), false);
});

// --- mapeo de datos de dominio -> campos de VOLANTE_MEDICO ---

const SOLICITUD_FICTICIA = {
  numeroSolicitud: "SOL-10001",
  numeroPoliza: "818546",
  dni: "12345678X",
  nombreCompleto: "Asegurado de Prueba",
  especialidad: "Digestivo",
  centroMedico: "Braun Medical Center",
  nombrePrueba: "Colonoscopia diagnóstica",
  medicoSolicitante: { nombre: "Dra. Elena Torres", numeroColegiado: "283746" },
  createdAt: new Date(2026, 2, 10),
};

const POLICYHOLDER_FICTICIO = {
  policyType: "POLIZA PRIVADA",
  fechaNacimiento: new Date(1985, 4, 14),
  sexo: "MASCULINO",
};

const CONTENIDO_CLINICO_FICTICIO = {
  impresionDiagnostica: "R10.4 - Dolor abdominal, no especificado.",
  prioridad: "PREFERENTE",
};

test("construirDatosVolante: usa los datos reales de Solicitud/Policyholder/contenido clínico, nada hardcodeado", () => {
  const datos = construirDatosVolante({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: CONTENIDO_CLINICO_FICTICIO,
  });

  assert.equal(datos.numeroSolicitud, "SOL-10001");
  assert.equal(datos.tipoPoliza, "POLIZA PRIVADA");
  assert.equal(datos.numeroPoliza, "818546");
  assert.equal(datos.dni, "12345678X");
  assert.equal(datos.nombreCompleto, "Asegurado de Prueba");
  assert.equal(datos.fechaNacimiento, "14/05/1985");
  assert.equal(datos.sexo, "Masculino");
  assert.equal(datos.atencionDe, "Servicio de Digestivo");
  assert.equal(datos.centroMedico, "Braun Medical Center");
  assert.equal(datos.impresionDiagnostica, "R10.4 - Dolor abdominal, no especificado.");
  assert.equal(datos.prestacion, "Colonoscopia diagnóstica");
  assert.equal(datos.prioridad, "PREFERENTE");
  assert.equal(datos.medicoNombre, "Dra. Elena Torres");
  assert.equal(datos.medicoEspecialidadLabel, "Especialista en Digestivo");
  assert.equal(datos.medicoColegiado, "283746");
  assert.equal(datos.fechaPrescripcion, "10/03/2026");
  assert.equal(datos.identificadorVolante, "VM-10001");
});

test("construirDatosVolante: sin contenido clínico, la prioridad por defecto es ORDINARIA y no explota", () => {
  const datos = construirDatosVolante({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: undefined,
  });

  assert.equal(datos.prioridad, "ORDINARIA");
  assert.equal(datos.impresionDiagnostica, null);
});

test("construirDatosVolante: sin policyholder, los campos que dependen de él quedan null/— en vez de inventarse", () => {
  const datos = construirDatosVolante({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: null,
    contenidoClinico: CONTENIDO_CLINICO_FICTICIO,
  });

  assert.equal(datos.tipoPoliza, null);
  assert.equal(datos.fechaNacimiento, null);
  assert.equal(datos.sexo, "—");
  // El DNI de la solicitud sigue disponible aunque no haya policyholder
  // (Solicitud.dni ya se copia del asegurado en el momento de crear la
  // solicitud, ver solicitudService.createSolicitud).
  assert.equal(datos.dni, "12345678X");
});

test("construirDatosVolante: identificadorVolante se deriva de numeroSolicitud, no es un campo de modelo nuevo", () => {
  const datos = construirDatosVolante({
    solicitud: { ...SOLICITUD_FICTICIA, numeroSolicitud: "SOL-99999" },
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: CONTENIDO_CLINICO_FICTICIO,
  });

  assert.equal(datos.identificadorVolante, "VM-99999");
});

// --- mapeo de datos de dominio -> campos de los 5 informes A4 (Paso 5) ---

test("construirDatosInformeClinico: usa datos reales, prefijo IC- y listas vacías por defecto", () => {
  const datos = construirDatosInformeClinico({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: {
      motivoConsulta: "Motivo de prueba",
      antecedentes: ["Antecedente 1"],
      exploracionHallazgos: "Hallazgo de prueba",
      diagnostico: "Diagnóstico de prueba",
      recomendaciones: ["Recomendación 1"],
    },
  });

  assert.equal(datos.numeroInforme, "IC-10001");
  assert.equal(datos.medicoNombre, "Dra. Elena Torres");
  assert.equal(datos.motivoConsulta, "Motivo de prueba");
  assert.deepEqual(datos.antecedentes, ["Antecedente 1"]);
  assert.equal(datos.diagnostico, "Diagnóstico de prueba");
});

test("construirDatosInformeClinico: sin contenido clínico, no explota y las listas quedan vacías (no null)", () => {
  const datos = construirDatosInformeClinico({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: undefined,
  });

  assert.equal(datos.motivoConsulta, null);
  assert.deepEqual(datos.antecedentes, []);
  assert.deepEqual(datos.recomendaciones, []);
});

test("construirDatosInformeResultados: usa datos reales y prefijo IR-", () => {
  const datos = construirDatosInformeResultados({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: {
      indicacionClinica: "Indicación de prueba",
      tecnica: "Técnica de prueba",
      hallazgos: ["Hallazgo 1"],
      resultado: "Resultado de prueba",
      conclusion: "Conclusión de prueba",
    },
  });

  assert.equal(datos.numeroInforme, "IR-10001");
  assert.equal(datos.nombrePrueba, "Colonoscopia diagnóstica");
  assert.equal(datos.indicacionClinica, "Indicación de prueba");
  assert.deepEqual(datos.hallazgos, ["Hallazgo 1"]);
});

test("construirDatosPropuestaQuirurgica: usa datos reales, prefijo IQ- y material protésico por defecto vacío", () => {
  const datos = construirDatosPropuestaQuirurgica({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: {
      diagnostico: "Diagnóstico quirúrgico",
      justificacion: "Justificación de prueba",
      procedimiento: "Procedimiento de prueba",
      tecnicaQuirurgica: ["Paso 1"],
      materialProtesico: [{ descripcion: "Prótesis X", lateralidad: "Derecha" }],
    },
  });

  assert.equal(datos.numeroInforme, "IQ-10001");
  assert.equal(datos.procedimiento, "Procedimiento de prueba");
  assert.deepEqual(datos.materialProtesico, [{ descripcion: "Prótesis X", lateralidad: "Derecha" }]);
});

test("construirDatosPropuestaQuirurgica: sin material protésico (p. ej. no aplica), queda array vacío, no se inventa", () => {
  const datos = construirDatosPropuestaQuirurgica({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: { diagnostico: "X", justificacion: "Y", procedimiento: "Z" },
  });

  assert.deepEqual(datos.materialProtesico, []);
});

test("construirDatosInformeUrgencias: usa datos reales, prefijo IU- y CIE-10 del contenido demo", () => {
  const datos = construirDatosInformeUrgencias({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: {
      motivoConsulta: "Motivo urgente",
      diagnostico: "Apendicitis",
      cie10: "K35.8",
      tratamiento: ["Analgesia"],
      evolucion: "Buena evolución",
      destinoAlta: "Ingreso",
    },
  });

  assert.equal(datos.numeroInforme, "IU-10001");
  assert.equal(datos.diagnostico, "Apendicitis");
  assert.equal(datos.cie10, "K35.8");
  assert.equal(datos.destinoAlta, "Ingreso");
});

test("construirDatosInformeAlta: usa datos reales, prefijo IH- y hallazgosQuirurgicos vacío cuando no aplica (p. ej. ingreso médico)", () => {
  const datos = construirDatosInformeAlta({
    solicitud: SOLICITUD_FICTICIA,
    policyholder: POLICYHOLDER_FICTICIO,
    contenidoClinico: {
      motivoIngreso: "Neumonía",
      diagnosticoPrincipal: "Neumonía adquirida en la comunidad",
      cie10: "J18.9",
      procedimientoRealizado: "Tratamiento médico",
      evolucionIngreso: "Buena evolución",
      tratamientoAlta: [{ medicamento: "Amoxicilina", pauta: "8h" }],
      recomendacionesAlta: ["Reposo"],
    },
  });

  assert.equal(datos.numeroInforme, "IH-10001");
  assert.equal(datos.diagnosticoPrincipal, "Neumonía adquirida en la comunidad");
  assert.deepEqual(datos.hallazgosQuirurgicos, []);
  assert.deepEqual(datos.tratamientoAlta, [{ medicamento: "Amoxicilina", pauta: "8h" }]);
});
