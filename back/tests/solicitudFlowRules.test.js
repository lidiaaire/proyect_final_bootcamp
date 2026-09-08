// Tests de la máquina de estados pura (sin base de datos).
// Ejecutar con: node --test tests/

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ESTADOS,
  ESTADOS_FINALES,
  ACCIONES,
  TRANSICIONES,
  InvalidTransitionError,
  isEstadoValido,
  isEstadoLegacy,
  isEstadoFinal,
  getNextEstado,
  getDepartamentoPorEstado,
} = require("../src/core/solicitudFlowRules");

const TODAS_LAS_ACCIONES = Object.values(ACCIONES);

test("todas las transiciones válidas declaradas en TRANSICIONES se resuelven correctamente", () => {
  for (const [estado, acciones] of Object.entries(TRANSICIONES)) {
    for (const [accion, estadoEsperado] of Object.entries(acciones)) {
      const resultado = getNextEstado(estado, accion);
      assert.equal(
        resultado,
        estadoEsperado,
        `${estado} --${accion}--> se esperaba ${estadoEsperado}, se obtuvo ${resultado}`,
      );
    }
  }
});

test("transiciones inválidas: cualquier acción no listada para un estado lanza InvalidTransitionError", () => {
  for (const estado of Object.values(ESTADOS)) {
    const permitidas = new Set(Object.keys(TRANSICIONES[estado] || {}));
    for (const accion of TODAS_LAS_ACCIONES) {
      if (permitidas.has(accion)) continue;

      assert.throws(
        () => getNextEstado(estado, accion),
        InvalidTransitionError,
        `${estado} --${accion}--> debería ser inválida`,
      );
    }
  }
});

test("caso concreto: SOLICITAR_DOCUMENTACION no es válida si ya hay documentación pendiente", () => {
  assert.throws(
    () => getNextEstado(ESTADOS.DOCUMENTACION_PENDIENTE, ACCIONES.SOLICITAR_DOCUMENTACION),
    (err) => {
      assert.ok(err instanceof InvalidTransitionError);
      assert.equal(err.code, "TRANSICION_NO_PERMITIDA");
      assert.equal(err.statusCode, 409);
      return true;
    },
  );
});

test("estados finales no admiten ninguna acción", () => {
  for (const estadoFinal of ESTADOS_FINALES) {
    assert.ok(isEstadoFinal(estadoFinal));

    for (const accion of TODAS_LAS_ACCIONES) {
      assert.throws(
        () => getNextEstado(estadoFinal, accion),
        (err) => {
          assert.ok(err instanceof InvalidTransitionError);
          assert.equal(err.code, "ESTADO_FINAL");
          assert.equal(err.statusCode, 409);
          return true;
        },
        `${estadoFinal} --${accion}--> debería fallar por ser estado final`,
      );
    }
  }
});

test("un estado legacy del modelo anterior se detecta y no se trata como transición normal", () => {
  const legacyStates = [
    "PENDIENTE_INICIO_GESTION",
    "DOCUMENTACION_SOLICITADA",
    "EN_REVISION",
    "PENDIENTE_DIRECCION_MEDICA",
    "PENDIENTE_ASESORIA_JURIDICA",
    "DOCUMENTACION_RECIBIDA",
    "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
  ];

  for (const legacy of legacyStates) {
    assert.ok(isEstadoLegacy(legacy), `${legacy} debería reconocerse como legacy`);
    assert.equal(isEstadoValido(legacy), false);

    assert.throws(
      () => getNextEstado(legacy, ACCIONES.AUTORIZAR),
      (err) => {
        assert.ok(err instanceof InvalidTransitionError);
        assert.equal(err.code, "ESTADO_LEGACY_NO_MIGRADO");
        assert.equal(err.statusCode, 409);
        return true;
      },
    );
  }
});

test("un estado completamente desconocido (ni canónico ni legacy) se rechaza de forma explícita", () => {
  assert.equal(isEstadoValido("ESTADO_INVENTADO"), false);
  assert.equal(isEstadoLegacy("ESTADO_INVENTADO"), false);

  assert.throws(
    () => getNextEstado("ESTADO_INVENTADO", ACCIONES.AUTORIZAR),
    (err) => {
      assert.ok(err instanceof InvalidTransitionError);
      assert.equal(err.code, "ESTADO_DESCONOCIDO");
      assert.equal(err.statusCode, 409);
      return true;
    },
  );
});

test("estado vacío/indefinido también se trata como desconocido, no como crash", () => {
  assert.throws(() => getNextEstado(undefined, ACCIONES.AUTORIZAR), InvalidTransitionError);
  assert.throws(() => getNextEstado(null, ACCIONES.SOLICITAR_DOCUMENTACION), InvalidTransitionError);
});

test("derivaciones cruzadas entre revisión médica y jurídica están permitidas en ambos sentidos", () => {
  assert.equal(
    getNextEstado(ESTADOS.EN_REVISION_MEDICA, ACCIONES.ENVIAR_ASESORIA_JURIDICA),
    ESTADOS.EN_REVISION_JURIDICA,
  );
  assert.equal(
    getNextEstado(ESTADOS.EN_REVISION_JURIDICA, ACCIONES.ENVIAR_DIRECCION_MEDICA),
    ESTADOS.EN_REVISION_MEDICA,
  );
});

test("el departamento se deriva del estado siguiente para los estados que tienen dueño claro", () => {
  assert.equal(getDepartamentoPorEstado(ESTADOS.PENDIENTE_GESTION), "PRESTACIONES");
  assert.equal(getDepartamentoPorEstado(ESTADOS.EN_REVISION_MEDICA), "DIRECCION_MEDICA");
  assert.equal(getDepartamentoPorEstado(ESTADOS.EN_REVISION_JURIDICA), "ASESORIA_JURIDICA");
});

test("estados sin departamento propio (documentación pendiente / finales) no imponen uno", () => {
  assert.equal(getDepartamentoPorEstado(ESTADOS.DOCUMENTACION_PENDIENTE), undefined);
  assert.equal(getDepartamentoPorEstado(ESTADOS.AUTORIZADA), undefined);
  assert.equal(getDepartamentoPorEstado(ESTADOS.RECHAZADA), undefined);
});
