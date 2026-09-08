// Test de authorizeRoles (back/src/middlewares/authMiddleware.js).
// Existía desde Sprint 1B sin ningún test ni ruta que lo usara; Sprint 2F
// lo conecta por primera vez (policyholderRoutes.js). Se comprueba aquí
// de forma aislada, sin levantar Express.
//
// Ejecutar con: node --test

const test = require("node:test");
const assert = require("node:assert/strict");

const { authorizeRoles } = require("../src/middlewares/authMiddleware");

function fakeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return res;
}

test("permite continuar cuando el rol del usuario está en la lista permitida", () => {
  const middleware = authorizeRoles("PRESTACIONES", "ADMIN");
  const req = { user: { role: "PRESTACIONES" } };
  const res = fakeRes();
  let nextLlamado = false;

  middleware(req, res, () => {
    nextLlamado = true;
  });

  assert.equal(nextLlamado, true);
  assert.equal(res.statusCode, null);
});

test("bloquea con 403 cuando el rol no está en la lista permitida", () => {
  const middleware = authorizeRoles("PRESTACIONES", "ADMIN");

  for (const rol of ["DIRECCION_MEDICA", "ASESORIA_JURIDICA"]) {
    const req = { user: { role: rol } };
    const res = fakeRes();
    let nextLlamado = false;

    middleware(req, res, () => {
      nextLlamado = true;
    });

    assert.equal(nextLlamado, false);
    assert.equal(res.statusCode, 403);
    assert.ok(res.body.message);
  }
});

test("admite cualquier combinación de roles permitidos, no solo dos", () => {
  const middleware = authorizeRoles("ADMIN");
  const res1 = fakeRes();
  authorizeRoles("ADMIN")({ user: { role: "ADMIN" } }, res1, () => {});
  assert.equal(res1.statusCode, null);

  const res2 = fakeRes();
  middleware({ user: { role: "PRESTACIONES" } }, res2, () => {});
  assert.equal(res2.statusCode, 403);
});
