// Mantenido solo por compatibilidad de import (pages/index.js). La
// fuente única de verdad es ahora core/constants/estados.js (Sprint 2A).
// El objeto anterior definido aquí tenía claves que no correspondían a
// ningún estado real del backend (PENDIENTE_REVISION_PRESTACIONES,
// PENDIENTE_DIRECCION_MEDICA como si fuera el estado en vez del
// departamento, etc.) -- de ahí que los KPIs y la actividad reciente del
// dashboard llevaran desde Sprint 1A comparando contra valores que
// ninguna solicitud podía tener.
export { ESTADOS } from "./estados";
