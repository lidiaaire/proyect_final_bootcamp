// Tests de solicitudService.createSolicitud: RBAC, asegurado existente,
// generación de identificador, estado/departamento/historial iniciales
// y bloqueo de inyección de campos de sistema. Se simulan Policyholder,
// Solicitud.prototype.save y Counter -- sin base de datos real.
//
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const Solicitud = require("../src/models/solicitudModel");
const Policyholder = require("../src/models/policyholderModel").default;
const Counter = require("../src/models/counterModel");
const solicitudService = require("../src/services/solicitudService");
const { ESTADOS } = require("../src/core/solicitudFlowRules");
const { ForbiddenActionError } = require("../src/core/solicitudPermissions");
const { ValidationError } = require("../src/core/solicitudValidation");

const ASEGURADO = {
  id: "081473",
  name: "Debra Bogan",
  dni: "12345678A",
};

const PAYLOAD_VALIDO = {
  numeroPoliza: "081473",
  nombrePrueba: "Resonancia Magnética",
  especialidad: "Radiología",
  centroMedico: "Hospital Central",
};

function mockOk(t, { seq = 1, policyholder = ASEGURADO } = {}) {
  t.mock.method(Policyholder, "findOne", async (filtro) => {
    assert.deepEqual(filtro, { id: PAYLOAD_VALIDO.numeroPoliza });
    return policyholder;
  });
  t.mock.method(Counter, "findOneAndUpdate", async () => ({ seq }));
  t.mock.method(Solicitud.prototype, "save", async function () {
    return this;
  });
}

test("PRESTACIONES crea correctamente: estado, departamento, identificador e historial iniciales", async (t) => {
  mockOk(t, { seq: 7 });

  const solicitud = await solicitudService.createSolicitud(PAYLOAD_VALIDO, {
    role: "PRESTACIONES",
  });

  assert.equal(solicitud.numeroSolicitud, "SOL-10007");
  assert.equal(solicitud.estadoInterno, ESTADOS.PENDIENTE_GESTION);
  assert.equal(solicitud.currentDepartment, "PRESTACIONES");
  assert.equal(solicitud.nombreCompleto, ASEGURADO.name);
  assert.equal(solicitud.dni, ASEGURADO.dni);
  assert.equal(solicitud.numeroPoliza, ASEGURADO.id);

  assert.equal(solicitud.historial.length, 1);
  const evento = solicitud.historial[0];
  assert.equal(evento.estadoAnterior, null);
  assert.equal(evento.estado, ESTADOS.PENDIENTE_GESTION);
  assert.equal(evento.accion, "CREACION");
  assert.equal(evento.departamento, "PRESTACIONES");
  assert.equal(evento.changedBy, "PRESTACIONES");
  assert.ok(evento.fecha instanceof Date);

  assert.equal(solicitud.notas.length, 1);
  assert.equal(solicitud.notas[0].author, "PRESTACIONES");
});

test("el actor real queda registrado como changedBy/author, no un valor fijo", async (t) => {
  mockOk(t);
  // Nótese: solo PRESTACIONES puede crear (comprobado más abajo), pero el
  // campo se rellena dinámicamente desde `user.role`, no está hardcodeado.
  const solicitud = await solicitudService.createSolicitud(PAYLOAD_VALIDO, {
    role: "PRESTACIONES",
  });
  assert.equal(solicitud.historial[0].changedBy, "PRESTACIONES");
  assert.equal(solicitud.notas[0].author, "PRESTACIONES");
});

test("DIRECCION_MEDICA intenta crear: 403, no se toca la base de datos", async (t) => {
  let seFindOneLlamo = false;
  t.mock.method(Policyholder, "findOne", async () => {
    seFindOneLlamo = true;
    return ASEGURADO;
  });

  await assert.rejects(
    () => solicitudService.createSolicitud(PAYLOAD_VALIDO, { role: "DIRECCION_MEDICA" }),
    (err) => {
      assert.ok(err instanceof ForbiddenActionError);
      assert.equal(err.code, "SOLO_PRESTACIONES_CREA");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
  assert.equal(seFindOneLlamo, false, "no debería ni siquiera buscar al asegurado");
});

test("ASESORIA_JURIDICA intenta crear: 403", async () => {
  await assert.rejects(
    () => solicitudService.createSolicitud(PAYLOAD_VALIDO, { role: "ASESORIA_JURIDICA" }),
    (err) => {
      assert.equal(err.code, "SOLO_PRESTACIONES_CREA");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
});

test("ADMIN intenta crear: 403 (ADMIN tampoco tramita en la creación)", async () => {
  await assert.rejects(
    () => solicitudService.createSolicitud(PAYLOAD_VALIDO, { role: "ADMIN" }),
    (err) => {
      assert.equal(err.code, "SOLO_PRESTACIONES_CREA");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
});

test("rol ausente: 403, no se inventa identidad", async () => {
  await assert.rejects(
    () => solicitudService.createSolicitud(PAYLOAD_VALIDO, undefined),
    (err) => {
      assert.equal(err.code, "SOLO_PRESTACIONES_CREA");
      return true;
    },
  );
});

test("payload inválido: la validación se ejecuta antes de tocar la base de datos", async (t) => {
  let seFindOneLlamo = false;
  t.mock.method(Policyholder, "findOne", async () => {
    seFindOneLlamo = true;
    return ASEGURADO;
  });

  await assert.rejects(
    () => solicitudService.createSolicitud({}, { role: "PRESTACIONES" }),
    ValidationError,
  );
  assert.equal(seFindOneLlamo, false);
});

test("asegurado inexistente: 404 explícito, no 500, y no se genera numeroSolicitud", async (t) => {
  t.mock.method(Policyholder, "findOne", async () => null);
  let seGeneroNumero = false;
  t.mock.method(Counter, "findOneAndUpdate", async () => {
    seGeneroNumero = true;
    return { seq: 1 };
  });

  await assert.rejects(
    () => solicitudService.createSolicitud(PAYLOAD_VALIDO, { role: "PRESTACIONES" }),
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.equal(err.code, "ASEGURADO_NO_ENCONTRADO");
      return true;
    },
  );
  assert.equal(seGeneroNumero, false);
});

test("intento de inyectar estadoInterno/currentDepartment en el body: se ignora, nace igual que siempre", async (t) => {
  mockOk(t);

  const solicitud = await solicitudService.createSolicitud(
    {
      ...PAYLOAD_VALIDO,
      estadoInterno: "AUTORIZADA",
      currentDepartment: "ASESORIA_JURIDICA",
      historial: [{ estado: "AUTORIZADA", changedBy: "ATACANTE" }],
      numeroSolicitud: "SOL-0001",
      notas: [{ text: "inyectado", author: "ATACANTE" }],
    },
    { role: "PRESTACIONES" },
  );

  assert.equal(solicitud.estadoInterno, ESTADOS.PENDIENTE_GESTION);
  assert.equal(solicitud.currentDepartment, "PRESTACIONES");
  assert.equal(solicitud.historial.length, 1); // no las 2 que "envía" el cliente
  assert.notEqual(solicitud.numeroSolicitud, "SOL-0001"); // el del cliente se ignora
  assert.equal(solicitud.notas.length, 1);
  assert.equal(solicitud.notas[0].author, "PRESTACIONES"); // no "ATACANTE"
});
