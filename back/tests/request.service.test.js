// Tests de updateRequestStatus (back/src/services/request.service.js):
// ahora comprueba DOS condiciones independientes -- RBAC (403) y máquina
// de estados (409) -- en ese orden. Se simula el modelo de Mongoose (sin
// base de datos real) para poder comprobar, caso a caso, que un intento
// inválido no modifica nada.
//
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const Solicitud = require("../src/models/solicitudModel");
const { updateRequestStatus } = require("../src/services/request.service");
const { ESTADOS, ACCIONES, InvalidTransitionError } = require("../src/core/solicitudFlowRules");
const { ForbiddenActionError } = require("../src/core/solicitudPermissions");

function fakeSolicitud(overrides = {}) {
  return {
    _id: "sol-1",
    numeroSolicitud: "SOL-0001",
    estadoInterno: ESTADOS.PENDIENTE_GESTION,
    currentDepartment: "PRESTACIONES",
    historial: [],
    saveCalls: 0,
    async save() {
      this.saveCalls++;
      return this;
    },
    ...overrides,
  };
}

test("transición válida con rol responsable: actualiza estado, departamento e historial completo", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.PENDIENTE_GESTION, currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  const resultado = await updateRequestStatus({
    requestId: "sol-1",
    accion: ACCIONES.ENVIAR_DIRECCION_MEDICA,
    user: { role: "PRESTACIONES" },
    comment: "Requiere valoración clínica",
  });

  assert.equal(resultado.estadoInterno, ESTADOS.EN_REVISION_MEDICA);
  assert.equal(resultado.currentDepartment, "DIRECCION_MEDICA");
  assert.equal(resultado.saveCalls, 1);

  const evento = resultado.historial[0];
  assert.equal(evento.estadoAnterior, ESTADOS.PENDIENTE_GESTION);
  assert.equal(evento.estado, ESTADOS.EN_REVISION_MEDICA);
  assert.equal(evento.accion, ACCIONES.ENVIAR_DIRECCION_MEDICA);
  assert.equal(evento.departamento, "DIRECCION_MEDICA");
  assert.equal(evento.changedBy, "PRESTACIONES");
  assert.ok(evento.fecha instanceof Date);
});

test("RBAC bloquea ANTES que la máquina de estados: rol sin responsabilidad, aunque la transición en sí sería válida", async (t) => {
  // PENDIENTE_GESTION + AUTORIZAR es una transición perfectamente válida
  // según solicitudFlowRules -- pero este caso es responsabilidad de
  // PRESTACIONES, no de ASESORIA_JURIDICA.
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.PENDIENTE_GESTION, currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.AUTORIZAR,
        user: { role: "ASESORIA_JURIDICA" },
      }),
    (err) => {
      assert.ok(err instanceof ForbiddenActionError);
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );

  assert.equal(doc.estadoInterno, ESTADOS.PENDIENTE_GESTION);
  assert.equal(doc.historial.length, 0);
  assert.equal(doc.saveCalls, 0);
});

test("rol correcto pero transición inválida (estado final): 409, no 403, y no modifica nada", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.AUTORIZADA, currentDepartment: "DIRECCION_MEDICA" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.RECHAZAR,
        user: { role: "DIRECCION_MEDICA" }, // sí es responsable del caso
        comment: "intento tardío",
      }),
    (err) => {
      assert.ok(err instanceof InvalidTransitionError);
      assert.equal(err.code, "ESTADO_FINAL");
      assert.equal(err.statusCode, 409);
      return true;
    },
  );

  assert.equal(doc.estadoInterno, ESTADOS.AUTORIZADA);
  assert.equal(doc.historial.length, 0);
  assert.equal(doc.saveCalls, 0);
});

test("Dirección Médica intentando actuar sobre un caso jurídico: 403, no llega a evaluarse el estado", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.EN_REVISION_JURIDICA, currentDepartment: "ASESORIA_JURIDICA" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.AUTORIZAR,
        user: { role: "DIRECCION_MEDICA" },
      }),
    (err) => {
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
  assert.equal(doc.saveCalls, 0);
});

test("Asesoría Jurídica intentando actuar sobre un caso médico: 403", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.EN_REVISION_MEDICA, currentDepartment: "DIRECCION_MEDICA" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.RECHAZAR,
        user: { role: "ASESORIA_JURIDICA" },
      }),
    (err) => {
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
  assert.equal(doc.saveCalls, 0);
});

test("ADMIN intentando tramitar cualquier solicitud: siempre 403, sin importar el estado", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.PENDIENTE_GESTION, currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.AUTORIZAR,
        user: { role: "ADMIN" },
      }),
    (err) => {
      assert.equal(err.code, "ADMIN_NO_TRAMITA");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
  assert.equal(doc.saveCalls, 0);
});

test("transición inválida (no permitida desde el estado actual) con rol correcto: 409", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.DOCUMENTACION_PENDIENTE, currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.SOLICITAR_DOCUMENTACION, // ya está pendiente de documentación
        user: { role: "PRESTACIONES" },
      }),
    (err) => {
      assert.ok(err instanceof InvalidTransitionError);
      assert.equal(err.code, "TRANSICION_NO_PERMITIDA");
      assert.equal(err.statusCode, 409);
      return true;
    },
  );

  assert.equal(doc.historial.length, 0);
  assert.equal(doc.saveCalls, 0);
});

test("estado legacy sin migrar, con rol responsable: 409 explícito, sin modificar nada", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: "PENDIENTE_INICIO_GESTION", currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.AUTORIZAR,
        user: { role: "PRESTACIONES" },
      }),
    (err) => {
      assert.ok(err instanceof InvalidTransitionError);
      assert.equal(err.code, "ESTADO_LEGACY_NO_MIGRADO");
      assert.equal(err.statusCode, 409);
      return true;
    },
  );

  assert.equal(doc.estadoInterno, "PENDIENTE_INICIO_GESTION");
  assert.equal(doc.saveCalls, 0);
});

test("solicitud inexistente: 404 explícito, ni RBAC ni la máquina de estados llegan a evaluarse", async (t) => {
  t.mock.method(Solicitud, "findById", async () => null);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "no-existe",
        accion: ACCIONES.AUTORIZAR,
        user: { role: "PRESTACIONES" },
      }),
    (err) => {
      assert.equal(err.message, "Solicitud no encontrada");
      assert.equal(err.statusCode, 404);
      return true;
    },
  );
});

test("sin rol reconocible en la petición: 403, no se inventa una identidad ni se ejecuta la acción", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.PENDIENTE_GESTION, currentDepartment: "PRESTACIONES" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.AUTORIZAR,
        user: undefined,
      }),
    (err) => {
      assert.ok(err instanceof ForbiddenActionError);
      assert.equal(err.code, "ROL_NO_OPERATIVO");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );

  assert.equal(doc.saveCalls, 0);
});

test("derivación cruzada válida (jurídica -> médica), ejecutada por quien es responsable ahora mismo (Asesoría Jurídica)", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.EN_REVISION_JURIDICA, currentDepartment: "ASESORIA_JURIDICA" });
  t.mock.method(Solicitud, "findById", async () => doc);

  const resultado = await updateRequestStatus({
    requestId: "sol-1",
    accion: ACCIONES.ENVIAR_DIRECCION_MEDICA,
    user: { role: "ASESORIA_JURIDICA" },
    comment: "duda clínica",
  });

  assert.equal(resultado.estadoInterno, ESTADOS.EN_REVISION_MEDICA);
  assert.equal(resultado.currentDepartment, "DIRECCION_MEDICA");
  assert.equal(resultado.historial.at(-1).changedBy, "ASESORIA_JURIDICA");
});

test("esa misma derivación cruzada, intentada por Dirección Médica en vez de por quien tiene el caso: 403", async (t) => {
  const doc = fakeSolicitud({ estadoInterno: ESTADOS.EN_REVISION_JURIDICA, currentDepartment: "ASESORIA_JURIDICA" });
  t.mock.method(Solicitud, "findById", async () => doc);

  await assert.rejects(
    () =>
      updateRequestStatus({
        requestId: "sol-1",
        accion: ACCIONES.ENVIAR_DIRECCION_MEDICA,
        user: { role: "DIRECCION_MEDICA" },
      }),
    (err) => {
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      return true;
    },
  );
});
