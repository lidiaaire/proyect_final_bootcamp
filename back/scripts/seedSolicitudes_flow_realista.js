require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Solicitud = require("../src/models/solicitudModel");

const MONGO_URI = process.env.MONGO_URI;

/*
FLOW SIMULADO DEL SISTEMA

1 PRESTACIONES crea solicitud
2 PRESTACIONES solicita documentación
3 ASEGURADO aporta documentación
4 PRESTACIONES revisa documentación
5 DIRECCION_MEDICA analiza
6 Resultado final:
    - AUTORIZADA
    - RECHAZADA
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

const documentosIniciales = [
  "volante_solicitud.pdf",
  "prescripcion_medica.pdf",
];

const documentosPaciente = [
  "informe_clinico.pdf",
  "historia_clinica_resumida.pdf",
  "resultado_prueba_previa.pdf",
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

function generarHistorial(createdAt) {
  const t1 = faker.date.between({ from: createdAt, to: new Date() });
  const t2 = faker.date.between({ from: t1, to: new Date() });
  const t3 = faker.date.between({ from: t2, to: new Date() });
  const t4 = faker.date.between({ from: t3, to: new Date() });
  const t5 = faker.date.between({ from: t4, to: new Date() });

  const autorizado = Math.random() > 0.25;

  const historial = [
    {
      estado: "PENDIENTE_INICIO_GESTION",
      changedBy: "PRESTACIONES",
      fecha: createdAt,
      tipo: "CREACION",
    },
    {
      estado: "PENDIENTE_DOCUMENTACION_DEL_ASEGURADO",
      changedBy: "PRESTACIONES",
      fecha: t1,
      tipo: "DOCUMENTACION_SOLICITADA",
    },
    {
      estado: "DOCUMENTACION_RECIBIDA",
      changedBy: "ASEGURADO",
      fecha: t2,
      tipo: "DOCUMENTO_SUBIDO",
    },
    {
      estado: "PENDIENTE_DIRECCION_MEDICA",
      changedBy: "PRESTACIONES",
      fecha: t3,
      tipo: "ENVIO_DIRECCION_MEDICA",
    },
    {
      estado: autorizado ? "AUTORIZADA" : "RECHAZADA",
      changedBy: "DIRECCION_MEDICA",
      fecha: t5,
      tipo: "RESOLUCION",
    },
  ];

  return historial;
}

function generarDocumentos() {
  const docs = [];

  const base = faker.helpers.arrayElements(documentosIniciales, 2);
  const paciente = faker.helpers.arrayElements(documentosPaciente, 1);
  const radiologia = faker.helpers.arrayElements(documentosRadiologia, 1);

  [...base, ...paciente, ...radiologia].forEach((d) => {
    docs.push({
      nombre: d,
    });
  });

  return docs;
}

function generarNotas() {
  const total = faker.number.int({ min: 1, max: 3 });

  const notas = [];

  for (let i = 0; i < total; i++) {
    notas.push({
      text: faker.helpers.arrayElement(notasEjemplo),
      author: faker.helpers.arrayElement(["PRESTACIONES", "ADMIN", "SOPORTE"]),
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

    const total = 300;
    const solicitudes = [];

    for (let i = 0; i < total; i++) {
      const prueba = faker.helpers.arrayElement(pruebas);
      const createdAt = faker.date.past({ years: 1 });

      const historial = generarHistorial(createdAt);
      const estadoFinal = historial[historial.length - 1].estado;

      const solicitud = {
        numeroSolicitud: "SOL-" + faker.number.int({ min: 1000, max: 9999 }),
        nombreCompleto: faker.person.fullName(),
        numeroPoliza: faker.number.int({ min: 100000, max: 999999 }).toString(),
        dni: faker.string.alphanumeric(8).toUpperCase(),
        nombrePrueba: prueba.nombre,
        especialidad: prueba.especialidad,
        centroMedico: faker.helpers.arrayElement(centros),
        estadoInterno: estadoFinal,
        currentDepartment:
          estadoFinal === "AUTORIZADA" || estadoFinal === "RECHAZADA"
            ? "PRESTACIONES"
            : "DIRECCION_MEDICA",
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
    console.log("Mongo desconectado");
  } catch (error) {
    console.error("Error generando solicitudes:", error);
  }
}

seedSolicitudes();
