// Tests de la generación del identificador de solicitud (Counter
// simulado, sin base de datos real).
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const Counter = require("../src/models/counterModel");
const { generarNumeroSolicitud } = require("../src/core/numeroSolicitud");

test("genera un identificador con el formato SOL-<numero> a partir del contador", async (t) => {
  t.mock.method(Counter, "findOneAndUpdate", async (_filter, _update) => ({ seq: 1 }));

  const numero = await generarNumeroSolicitud();
  assert.equal(numero, "SOL-10001");
});

test("arranca en 10000 para no colisionar por construcción con los IDs legacy de 4 dígitos (1000-9999)", async (t) => {
  t.mock.method(Counter, "findOneAndUpdate", async () => ({ seq: 1 }));
  const numero = await generarNumeroSolicitud();

  const parteNumerica = numero.replace("SOL-", "");
  assert.ok(Number(parteNumerica) >= 10000, "debe tener 5 dígitos, nunca 4");
});

test("cada llamada usa el $inc atómico sobre el mismo documento de contador ('solicitud')", async (t) => {
  const llamadas = [];
  t.mock.method(Counter, "findOneAndUpdate", async (filter, update, options) => {
    llamadas.push({ filter, update, options });
    return { seq: llamadas.length };
  });

  await generarNumeroSolicitud();
  await generarNumeroSolicitud();

  assert.equal(llamadas.length, 2);
  for (const llamada of llamadas) {
    assert.deepEqual(llamada.filter, { _id: "solicitud" });
    assert.deepEqual(llamada.update, { $inc: { seq: 1 } });
    assert.equal(llamada.options.upsert, true);
  }
});

test("secuencia creciente produce identificadores distintos y crecientes", async (t) => {
  let seq = 0;
  t.mock.method(Counter, "findOneAndUpdate", async () => {
    seq++;
    return { seq };
  });

  const numeros = [];
  for (let i = 0; i < 5; i++) numeros.push(await generarNumeroSolicitud());

  assert.deepEqual(numeros, ["SOL-10001", "SOL-10002", "SOL-10003", "SOL-10004", "SOL-10005"]);
  assert.equal(new Set(numeros).size, numeros.length); // todos distintos
});
