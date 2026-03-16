require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");

const MONGO_URI = process.env.MONGO_URI;

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

const documentosIniciales = [
  "volante_solicitud.pdf",
  "informe_clinico.pdf",
  "prescripcion_medica.pdf",
];

const documentosRadiologia = [
  "radiografia_torax.pdf",
  "ecografia_abdominal.pdf",
  "tac_cervical.pdf",
  "resonancia_lumbar.pdf",
];

const notasEjemplo = [
  "Pendiente de validación médica antes de autorizar la prueba.",
  "Paciente contactado para aportar documentación adicional.",
  "Revisión administrativa realizada correctamente.",
  "Se requiere informe clínico complementario.",
  "Caso revisado por el departamento de prestaciones.",
];

function generarHistorial(prueba) {
  const ahora = new Date();

  return [
    {
      estado: "PENDIENTE_INICIO_GESTION",
      changedBy: "PRESTACIONES",
      fecha: faker.date.recent({ days: 5 }),
      tipo: "CREACION",
    },
    {
      estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      changedBy: "PRESTACIONES",
      fecha: faker.date.recent({ days: 4 }),
      tipo: "DOCUMENTACION_SOLICITADA",
    },
    {
      estado: "PENDIENTE_DIRECCION_MEDICA",
      changedBy: "PRESTACIONES",
      fecha: faker.date.recent({ days: 3 }),
      tipo: "REVISION_MEDICA",
    },
  ];
}

function generarDocumentos() {
  const docs = [];

  const base = faker.helpers.arrayElements(documentosIniciales, 2);
  const radio = faker.helpers.arrayElements(documentosRadiologia, 1);

  base.forEach((d) => docs.push({ nombre: d }));
  radio.forEach((d) => docs.push({ nombre: d }));

  return docs;
}

function generarNotas() {
  const total = faker.number.int({ min: 1, max: 3 });

  const notas = [];

  for (let i = 0; i < total; i++) {
    notas.push({
      text: faker.helpers.arrayElement(notasEjemplo),
      author: faker.helpers.arrayElement(["PRESTACIONES", "ADMIN", "SOPORTE"]),
      date: faker.date.recent({ days: 5 }),
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

    const total = 200;
    const solicitudes = [];

    for (let i = 0; i < total; i++) {
      const prueba = faker.helpers.arrayElement(pruebas);

      const solicitud = {
        numeroSolicitud: "SOL-" + faker.number.int({ min: 1000, max: 9999 }),
        nombreCompleto: faker.person.fullName(),
        numeroPoliza: faker.number.int({ min: 100000, max: 999999 }).toString(),
        dni: faker.string.alphanumeric(8).toUpperCase(),
        nombrePrueba: prueba.nombre,
        especialidad: prueba.especialidad,
        centroMedico: faker.helpers.arrayElement(centros),
        estadoInterno: "PENDIENTE_DIRECCION_MEDICA",
        currentDepartment: "DIRECCION_MEDICA",
        documentos: generarDocumentos(),
        historial: generarHistorial(prueba),
        notas: generarNotas(),
      };

      solicitudes.push(solicitud);
    }

    await Solicitud.insertMany(solicitudes);

    console.log("Solicitudes generadas:", solicitudes.length);

    await mongoose.disconnect();
    console.log("Mongo desconectado");
  } catch (error) {
    console.error("Error generando solicitudes:", error);
  }
}

seedSolicitudes();
