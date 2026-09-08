// Tests de las restricciones de lectura por rol (back/src/services/
// solicitudService.js: getSolicitudes, getSolicitudById,
// getSolicitudesByPolicyholder). Se simula el modelo de Mongoose para no
// depender de datos reales.
//
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const Solicitud = require("../src/models/solicitudModel");
const solicitudService = require("../src/services/solicitudService");
const { ForbiddenReadError } = require("../src/core/solicitudPermissions");

test("getSolicitudes: PRESTACIONES no lleva ningún filtro de departamento", async (t) => {
  let filtroRecibido;
  t.mock.method(Solicitud, "find", (filtro) => {
    filtroRecibido = filtro;
    return { sort: () => [] };
  });

  await solicitudService.getSolicitudes("PRESTACIONES");
  assert.deepEqual(filtroRecibido, {});
});

test("getSolicitudes: ADMIN tampoco lleva filtro (supervisión/auditoría)", async (t) => {
  let filtroRecibido;
  t.mock.method(Solicitud, "find", (filtro) => {
    filtroRecibido = filtro;
    return { sort: () => [] };
  });

  await solicitudService.getSolicitudes("ADMIN");
  assert.deepEqual(filtroRecibido, {});
});

test("getSolicitudes: DIRECCION_MEDICA solo recibe las de su departamento", async (t) => {
  let filtroRecibido;
  t.mock.method(Solicitud, "find", (filtro) => {
    filtroRecibido = filtro;
    return { sort: () => [] };
  });

  await solicitudService.getSolicitudes("DIRECCION_MEDICA");
  assert.deepEqual(filtroRecibido, { currentDepartment: "DIRECCION_MEDICA" });
});

test("getSolicitudes: ASESORIA_JURIDICA solo recibe las de su departamento", async (t) => {
  let filtroRecibido;
  t.mock.method(Solicitud, "find", (filtro) => {
    filtroRecibido = filtro;
    return { sort: () => [] };
  });

  await solicitudService.getSolicitudes("ASESORIA_JURIDICA");
  assert.deepEqual(filtroRecibido, { currentDepartment: "ASESORIA_JURIDICA" });
});

test("getSolicitudesByPolicyholder combina numeroPoliza con el filtro de visibilidad del rol", async (t) => {
  let filtroRecibido;
  t.mock.method(Solicitud, "find", (filtro) => {
    filtroRecibido = filtro;
    return { sort: () => [] };
  });

  await solicitudService.getSolicitudesByPolicyholder("081473", "DIRECCION_MEDICA");
  assert.deepEqual(filtroRecibido, { numeroPoliza: "081473", currentDepartment: "DIRECCION_MEDICA" });
});

test("getSolicitudById: PRESTACIONES puede ver cualquier solicitud", async (t) => {
  t.mock.method(Solicitud, "findById", async () => ({ currentDepartment: "ASESORIA_JURIDICA" }));

  const solicitud = await solicitudService.getSolicitudById("sol-1", "PRESTACIONES");
  assert.ok(solicitud);
});

test("getSolicitudById: DIRECCION_MEDICA no puede ver una solicitud jurídica (403, no 404)", async (t) => {
  t.mock.method(Solicitud, "findById", async () => ({ currentDepartment: "ASESORIA_JURIDICA" }));

  await assert.rejects(
    () => solicitudService.getSolicitudById("sol-1", "DIRECCION_MEDICA"),
    (err) => {
      assert.ok(err instanceof ForbiddenReadError);
      assert.equal(err.code, "FUERA_DE_VISIBILIDAD");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
});

test("getSolicitudById: ASESORIA_JURIDICA no puede ver una solicitud médica", async (t) => {
  t.mock.method(Solicitud, "findById", async () => ({ currentDepartment: "DIRECCION_MEDICA" }));

  await assert.rejects(
    () => solicitudService.getSolicitudById("sol-1", "ASESORIA_JURIDICA"),
    (err) => {
      assert.equal(err.code, "FUERA_DE_VISIBILIDAD");
      return true;
    },
  );
});

test("getSolicitudById: una solicitud inexistente devuelve null (el 404 lo decide el controlador), sin llegar a comprobar visibilidad", async (t) => {
  t.mock.method(Solicitud, "findById", async () => null);

  const solicitud = await solicitudService.getSolicitudById("no-existe", "DIRECCION_MEDICA");
  assert.equal(solicitud, null);
});
