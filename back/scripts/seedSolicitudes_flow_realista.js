require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");

const MONGO_URI = process.env.MONGO_URI;

/*
ESTADOS QUE NECESITAMOS GENERAR

- PENDIENTE_INICIO_GESTION
- PENDIENTE_DOCUMENTACION_DEL_ASEGURADO
- PENDIENTE_DIRECCION_MEDICA
- PENDIENTE_ASESORIA_JURIDICA
- AUTORIZADA
- RECHAZADA

La idea es que muchas solicitudes se queden "a mitad del flujo"
para poder probar el sistema.
*/

const pruebas = [
  { nombre: "Ecografía", especialidad: "Radiología" },
  { nombre: "TAC", especialidad: "Radiología" },
  { nombre: "Resonancia", especialidad: "Radiología" },
  { nombre: "Prueba de esfuerzo", especialidad: "Cardiología" },
  { nombre: "Colonoscopia", especialidad: "Digestivo" },
];

const centros = [
  "Hospital Central",
  "Clínica Santa María",
  "Centro Médico Andalucía",
  "Hospital Costa del Sol",
  "Clínica Radiológica Sur",
];

function generarHistorialHastaEstado(createdAt, estadoObjetivo) {
  const t1 = faker.date.between({ from: createdAt, to: new Date() });
  const t2 = faker.date.between({ from: t1, to: new Date() });
  const t3 = faker.date.between({ from: t2, to: new Date() });
  const t4 = faker.date.between({ from: t3, to: new Date() });

  const historial = [
    {
      estado: "PENDIENTE_INICIO_GESTION",
      changedBy: "PRESTACIONES",
      fecha: createdAt,
      tipo: "CREACION",
    },
  ];

  if (estadoObjetivo === "PENDIENTE_INICIO_GESTION") {
    return historial;
  }

  historial.push({
    estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
    changedBy: "PRESTACIONES",
    fecha: t1,
    tipo: "DOCUMENTACION_SOLICITADA",
  });

  if (estadoObjetivo === "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO") {
    return historial;
  }

  historial.push({
    estado: "DOCUMENTACION_RECIBIDA",
    changedBy: "ASEGURADO",
    fecha: t2,
    tipo: "DOCUMENTO_SUBIDO",
  });

  historial.push({
    estado: "PENDIENTE_DIRECCION_MEDICA",
    changedBy: "PRESTACIONES",
    fecha: t3,
    tipo: "ENVIO_DIRECCION_MEDICA",
  });

  if (estadoObjetivo === "PENDIENTE_DIRECCION_MEDICA") {
    return historial;
  }

  if (estadoObjetivo === "PENDIENTE_ASESORIA_JURIDICA") {
    historial.push({
      estado: "PENDIENTE_ASESORIA_JURIDICA",
      changedBy: "DIRECCION_MEDICA",
      fecha: t4,
      tipo: "REVISION_JURIDICA",
    });

    return historial;
  }

  historial.push({
    estado: estadoObjetivo,
    changedBy: "DIRECCION_MEDICA",
    fecha: t4,
    tipo: "RESOLUCION",
  });

  return historial;
}

function generarDocumentos() {
  const posiblesDocs = [
    "consentimiento_genetico.pdf",
    "historia_clinica.pdf",
    "informe_medico.pdf",
    "prescripcion_medica.pdf",
  ];

  const total = Math.floor(Math.random() * 3) + 1;

  const documentos = [];

  for (let i = 0; i < total; i++) {
    documentos.push({
      nombre: posiblesDocs[Math.floor(Math.random() * posiblesDocs.length)],
    });
  }

  return documentos;
}

function generarNotas() {
  const ejemplos = [
    "Pendiente de validación médica antes de autorizar la prueba.",
    "Paciente contactado para aportar documentación adicional.",
    "Revisión administrativa realizada correctamente.",
    "Se requiere informe clínico complementario.",
  ];

  const total = faker.number.int({ min: 1, max: 2 });

  const notas = [];

  for (let i = 0; i < total; i++) {
    notas.push({
      text: faker.helpers.arrayElement(ejemplos),
      author: faker.helpers.arrayElement(["PRESTACIONES", "ADMIN"]),
      date: faker.date.recent({ days: 10 }),
    });
  }

  return notas;
}

async function seedSolicitudes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo conectado");

    await Solicitud.deleteMany({});
    console.log("Solicitudes eliminadas");

    const estadosDistribucion = [
      "PENDIENTE_INICIO_GESTION",
      "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      "PENDIENTE_DIRECCION_MEDICA",
      "PENDIENTE_ASESORIA_JURIDICA",
      "AUTORIZADA",
      "RECHAZADA",
    ];

    const total = 300;
    const solicitudes = [];

    for (let i = 0; i < total; i++) {
      const prueba = faker.helpers.arrayElement(pruebas);
      const createdAt = faker.date.past({ years: 1 });

      const estadoFinal = faker.helpers.arrayElement(estadosDistribucion);

      const historial = generarHistorialHastaEstado(createdAt, estadoFinal);

      const solicitud = {
        numeroSolicitud: "SOL-" + faker.number.int({ min: 1000, max: 9999 }),
        nombreCompleto: faker.person.fullName(),
        numeroPoliza: `POL-${faker.number.int({ min: 1000, max: 1119 })}`,
        dni: faker.string.alphanumeric(8).toUpperCase(),
        nombrePrueba: prueba.nombre,
        especialidad: prueba.especialidad,
        centroMedico: faker.helpers.arrayElement(centros),

        estadoInterno: estadoFinal,

        currentDepartment:
          estadoFinal === "PENDIENTE_DIRECCION_MEDICA"
            ? "DIRECCION_MEDICA"
            : estadoFinal === "PENDIENTE_ASESORIA_JURIDICA"
              ? "ASESORIA_JURIDICA"
              : "PRESTACIONES",

        documentos: generarDocumentos(),
        historial: historial,
        notas: generarNotas(),
        createdAt: createdAt,
      };

      solicitudes.push(solicitud);
    }

    await Solicitud.insertMany(solicitudes);

    console.log("Solicitudes generadas:", solicitudes.length);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error generando solicitudes:", error);
    process.exit(1);
  }
}

seedSolicitudes();
