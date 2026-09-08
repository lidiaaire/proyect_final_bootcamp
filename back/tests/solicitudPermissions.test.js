// Tests del módulo RBAC puro (sin base de datos).
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const { ACCIONES } = require("../src/core/solicitudFlowRules");
const {
  ROLES,
  ForbiddenActionError,
  assertPuedeEjecutar,
  esResponsableDe,
  getFiltroVisibilidad,
  puedeVer,
} = require("../src/core/solicitudPermissions");

test("cada rol operativo puede ejecutar acciones sobre una solicitud que es responsabilidad suya", () => {
  for (const accion of Object.values(ACCIONES)) {
    assert.doesNotThrow(() =>
      assertPuedeEjecutar({ rol: ROLES.PRESTACIONES, accion, currentDepartment: "PRESTACIONES" }),
    );
    assert.doesNotThrow(() =>
      assertPuedeEjecutar({
        rol: ROLES.DIRECCION_MEDICA,
        accion,
        currentDepartment: "DIRECCION_MEDICA",
      }),
    );
    assert.doesNotThrow(() =>
      assertPuedeEjecutar({
        rol: ROLES.ASESORIA_JURIDICA,
        accion,
        currentDepartment: "ASESORIA_JURIDICA",
      }),
    );
  }
});

test("DIRECCION_MEDICA no puede actuar sobre un caso cuya responsabilidad es jurídica", () => {
  assert.throws(
    () =>
      assertPuedeEjecutar({
        rol: ROLES.DIRECCION_MEDICA,
        accion: ACCIONES.AUTORIZAR,
        currentDepartment: "ASESORIA_JURIDICA",
      }),
    (err) => {
      assert.ok(err instanceof ForbiddenActionError);
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      assert.equal(err.statusCode, 403);
      return true;
    },
  );
});

test("ASESORIA_JURIDICA no puede actuar sobre un caso cuya responsabilidad es médica", () => {
  assert.throws(
    () =>
      assertPuedeEjecutar({
        rol: ROLES.ASESORIA_JURIDICA,
        accion: ACCIONES.RECHAZAR,
        currentDepartment: "DIRECCION_MEDICA",
      }),
    (err) => {
      assert.ok(err instanceof ForbiddenActionError);
      assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
      return true;
    },
  );
});

test("PRESTACIONES no puede saltarse a un especialista: caso ya derivado a médica o jurídica", () => {
  for (const currentDepartment of ["DIRECCION_MEDICA", "ASESORIA_JURIDICA"]) {
    assert.throws(
      () =>
        assertPuedeEjecutar({
          rol: ROLES.PRESTACIONES,
          accion: ACCIONES.AUTORIZAR,
          currentDepartment,
        }),
      (err) => {
        assert.equal(err.code, "FUERA_DE_RESPONSABILIDAD");
        return true;
      },
    );
  }
});

test("ADMIN nunca puede tramitar una solicitud, sea cual sea la acción o el departamento", () => {
  for (const accion of Object.values(ACCIONES)) {
    for (const currentDepartment of ["PRESTACIONES", "DIRECCION_MEDICA", "ASESORIA_JURIDICA"]) {
      assert.throws(
        () => assertPuedeEjecutar({ rol: ROLES.ADMIN, accion, currentDepartment }),
        (err) => {
          assert.ok(err instanceof ForbiddenActionError);
          assert.equal(err.code, "ADMIN_NO_TRAMITA");
          assert.equal(err.statusCode, 403);
          return true;
        },
      );
    }
  }
});

test("un rol ausente o desconocido se rechaza explícitamente, sin inventar identidad", () => {
  for (const rolInvalido of [undefined, null, "", "ROL_INVENTADO"]) {
    assert.throws(
      () =>
        assertPuedeEjecutar({
          rol: rolInvalido,
          accion: ACCIONES.AUTORIZAR,
          currentDepartment: "PRESTACIONES",
        }),
      (err) => {
        assert.ok(err instanceof ForbiddenActionError);
        assert.equal(err.code, "ROL_NO_OPERATIVO");
        return true;
      },
    );
  }
});

test("esResponsableDe refleja la misma regla que assertPuedeEjecutar, sin lanzar", () => {
  assert.equal(esResponsableDe(ROLES.DIRECCION_MEDICA, "DIRECCION_MEDICA"), true);
  assert.equal(esResponsableDe(ROLES.DIRECCION_MEDICA, "ASESORIA_JURIDICA"), false);
  assert.equal(esResponsableDe(ROLES.ADMIN, "ADMIN"), false); // ADMIN nunca es "responsable"
});

test("filtro de visibilidad: PRESTACIONES y ADMIN sin restricción, especialistas solo su departamento", () => {
  assert.deepEqual(getFiltroVisibilidad(ROLES.PRESTACIONES), {});
  assert.deepEqual(getFiltroVisibilidad(ROLES.ADMIN), {});
  assert.deepEqual(getFiltroVisibilidad(ROLES.DIRECCION_MEDICA), { currentDepartment: "DIRECCION_MEDICA" });
  assert.deepEqual(getFiltroVisibilidad(ROLES.ASESORIA_JURIDICA), { currentDepartment: "ASESORIA_JURIDICA" });
});

test("puedeVer aplica la misma regla de visibilidad a una solicitud concreta", () => {
  const casoMedico = { currentDepartment: "DIRECCION_MEDICA" };
  const casoJuridico = { currentDepartment: "ASESORIA_JURIDICA" };

  assert.equal(puedeVer(ROLES.PRESTACIONES, casoMedico), true);
  assert.equal(puedeVer(ROLES.ADMIN, casoJuridico), true);
  assert.equal(puedeVer(ROLES.DIRECCION_MEDICA, casoMedico), true);
  assert.equal(puedeVer(ROLES.DIRECCION_MEDICA, casoJuridico), false);
  assert.equal(puedeVer(ROLES.ASESORIA_JURIDICA, casoMedico), false);
  assert.equal(puedeVer(ROLES.ASESORIA_JURIDICA, casoJuridico), true);
});
