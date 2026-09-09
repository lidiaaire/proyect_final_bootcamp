// Catálogo demo de prestaciones para poblar el entorno de portfolio con
// solicitudes variadas y clínicamente coherentes (asegurado -> solicitud
// -> prestación -> especialidad -> médico -> contenido clínico).
//
// IMPORTANTE: esto NO es una tabla de negocio del producto ni una regla
// rígida sobre qué familias documentales debe tener cada prestación --
// es solo el catálogo con el que se siembra la demo. La matriz
// orientativa prestación -> documentos vive en la auditoría/diseño, no
// aquí; este fichero solo fija qué prestaciones existen y con qué
// especialidad/contenido clínico van de la mano.
//
// `clinicoKey` referencia una entrada de contenidoClinicoDemo.js -- así
// el contenido clínico simulado no se duplica por cada solicitud
// generada, se reutiliza por prestación.

const CATALOGO_PRESTACIONES = [
  {
    nombrePrueba: "Colonoscopia diagnóstica",
    especialidad: "Digestivo",
    clinicoKey: "COLONOSCOPIA_DIAGNOSTICA",
  },
  {
    nombrePrueba: "Resonancia magnética lumbar",
    especialidad: "Radiología",
    clinicoKey: "RM_LUMBAR",
  },
  {
    nombrePrueba: "Resonancia magnética de rodilla",
    especialidad: "Radiología",
    clinicoKey: "RM_RODILLA",
  },
  {
    nombrePrueba: "Ecografía abdominal",
    especialidad: "Radiología",
    clinicoKey: "ECOGRAFIA_ABDOMINAL",
  },
  {
    nombrePrueba: "Artroplastia total de rodilla",
    especialidad: "Traumatología",
    clinicoKey: "ARTROPLASTIA_RODILLA",
  },
  {
    nombrePrueba: "Hernioplastia inguinal",
    especialidad: "Cirugía General",
    clinicoKey: "HERNIOPLASTIA_INGUINAL",
  },
  {
    nombrePrueba: "Apendicectomía urgente",
    especialidad: "Cirugía General",
    clinicoKey: "APENDICECTOMIA_URGENTE",
  },
  {
    nombrePrueba: "Consulta de Traumatología por dolor lumbar",
    especialidad: "Traumatología",
    clinicoKey: "CONSULTA_TRAUMATOLOGIA_LUMBAR",
  },
  {
    nombrePrueba: "Ingreso por neumonía",
    especialidad: "Medicina Interna",
    clinicoKey: "INGRESO_NEUMONIA",
  },
  {
    nombrePrueba: "Revisión de Digestivo",
    especialidad: "Digestivo",
    clinicoKey: "REVISION_DIGESTIVO",
  },
];

module.exports = { CATALOGO_PRESTACIONES };
