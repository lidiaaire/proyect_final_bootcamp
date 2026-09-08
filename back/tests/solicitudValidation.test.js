// Tests de validación del payload de creación (sin base de datos).
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const { ValidationError, validateCreateSolicitudPayload } = require("../src/core/solicitudValidation");

const PAYLOAD_VALIDO = {
  numeroPoliza: "081473",
  nombrePrueba: "Resonancia Magnética",
  especialidad: "Radiología",
  centroMedico: "Hospital Central",
};

test("payload válido: se acepta y se devuelve limpio (trim aplicado)", () => {
  const resultado = validateCreateSolicitudPayload({
    ...PAYLOAD_VALIDO,
    numeroPoliza: "  081473  ",
    comentario: "  Paciente prioritario  ",
  });

  assert.deepEqual(resultado, {
    numeroPoliza: "081473",
    nombrePrueba: "Resonancia Magnética",
    especialidad: "Radiología",
    centroMedico: "Hospital Central",
    comentario: "Paciente prioritario",
  });
});

test("payload válido sin comentario: comentario queda como string vacío, no undefined", () => {
  const resultado = validateCreateSolicitudPayload(PAYLOAD_VALIDO);
  assert.equal(resultado.comentario, "");
});

test("campos obligatorios ausentes: lanza ValidationError listando cada uno", () => {
  assert.throws(
    () => validateCreateSolicitudPayload({}),
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.equal(err.statusCode, 400);
      assert.equal(err.errors.length, 4); // los 4 campos obligatorios
      return true;
    },
  );
});

test("strings vacíos (incluido solo espacios) se tratan como ausentes", () => {
  assert.throws(
    () =>
      validateCreateSolicitudPayload({
        ...PAYLOAD_VALIDO,
        nombrePrueba: "   ",
      }),
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.errors.some((e) => e.includes("nombrePrueba")));
      return true;
    },
  );
});

test("tipos incorrectos: un número o un objeto en un campo de texto se rechaza explícitamente", () => {
  assert.throws(
    () =>
      validateCreateSolicitudPayload({
        ...PAYLOAD_VALIDO,
        especialidad: 12345,
      }),
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.errors.some((e) => e.includes("especialidad") && e.includes("texto")));
      return true;
    },
  );

  assert.throws(() =>
    validateCreateSolicitudPayload({
      ...PAYLOAD_VALIDO,
      centroMedico: { nombre: "Hospital Central" },
    }),
  );
});

test("comentario con tipo incorrecto se rechaza aunque sea opcional", () => {
  assert.throws(
    () => validateCreateSolicitudPayload({ ...PAYLOAD_VALIDO, comentario: 42 }),
    (err) => {
      assert.ok(err instanceof ValidationError);
      assert.ok(err.errors.some((e) => e.includes("comentario")));
      return true;
    },
  );
});

test("propiedades de sistema inyectadas en el body no aparecen nunca en el resultado", () => {
  const resultado = validateCreateSolicitudPayload({
    ...PAYLOAD_VALIDO,
    estadoInterno: "AUTORIZADA",
    currentDepartment: "ADMIN",
    historial: [{ estado: "AUTORIZADA" }],
    numeroSolicitud: "SOL-1",
    _id: "000000000000000000000000",
  });

  const claves = Object.keys(resultado).sort();
  assert.deepEqual(claves, ["centroMedico", "comentario", "especialidad", "nombrePrueba", "numeroPoliza"]);
});

test("body no es un objeto (null, array, string): se trata como payload vacío, no explota", () => {
  for (const bodyInvalido of [null, undefined, [], "texto", 42]) {
    assert.throws(() => validateCreateSolicitudPayload(bodyInvalido), ValidationError);
  }
});
