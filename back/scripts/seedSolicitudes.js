// Seed de Solicitudes demo. Sustituye a seedSolicitudes_flow_realista.js
// (recuperado y renombrado al nombre que seedAll.cjs espera -- estaba
// desconectado del pipeline general, ver auditoría documental).
//
// A diferencia de la versión anterior (100 solicitudes idénticas, todas
// "TAC" / "Radiología" / "Hospital Central"), este seed:
//   - reparte las solicitudes entre el catálogo demo de prestaciones
//     (scripts/seed/catalogoPrestaciones.js), coherente con
//     especialidad y médico solicitante;
//   - usa el mismo generador atómico de numeroSolicitud que el backend
//     en caliente (core/numeroSolicitud.js), no un número aleatorio sin
//     control de colisión;
//   - calcula estadoInterno/currentDepartment/historial reutilizando la
//     máquina de estados real (scripts/seed/recorridosDemo.js), así que
//     ninguna solicitud demo puede quedar en una combinación
//     estado/departamento que el workflow real no permitiría.
//
// El contenido clínico (diagnóstico, hallazgos, etc.) NO se escribe
// aquí: vive en scripts/seed/contenidoClinicoDemo.js, indexado por
// prestación, listo para el paso de generación de documentos que se
// añadirá más adelante. Este seed todavía no genera ningún PDF ni
// documento.

require("dotenv").config();
const Solicitud = require("../src/models/solicitudModel");
const Policyholder = require("../src/models/policyholderModel").default;
const { generarNumeroSolicitud } = require("../src/core/numeroSolicitud");
const Counter = require("../src/models/counterModel");
const { CATALOGO_PRESTACIONES } = require("./seed/catalogoPrestaciones");
const { MEDICOS_POR_ESPECIALIDAD } = require("./seed/medicosDemo");
const { RECORRIDOS, construirHistorialDemo } = require("./seed/recorridosDemo");

const CENTRO_MEDICO_DEMO = "Braun Medical Center";

// Cuántas solicitudes se generan por cada prestación del catálogo. Con
// 10 prestaciones y 6 cada una salen 60 solicitudes: suficiente
// variedad para una demo de portfolio sin ser un volumen artificial.
const SOLICITUDES_POR_PRESTACION = 6;

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fecha de creación demo: en los últimos 90 días, para que el
// historial (que avanza +1 día por paso, ver recorridosDemo.js) quede
// siempre en el pasado.
function fechaCreacionAleatoria() {
  const diasAtras = Math.floor(Math.random() * 90) + 10;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  return fecha;
}

async function seedSolicitudes() {
  try {
    await Solicitud.deleteMany();
    // El contador atómico de numeroSolicitud debe arrancar de cero en
    // cada re-siembra, igual que se borran las Solicitudes -- si no, el
    // seed seguiría numerando a partir de la última ejecución.
    await Counter.deleteOne({ _id: "solicitud" });

    const policyholders = await Policyholder.find();

    if (!policyholders.length) {
      throw new Error("No hay policyholders. Ejecuta primero ese seed.");
    }

    const solicitudes = [];

    for (const prestacion of CATALOGO_PRESTACIONES) {
      const medico = MEDICOS_POR_ESPECIALIDAD[prestacion.especialidad];

      for (let i = 0; i < SOLICITUDES_POR_PRESTACION; i++) {
        const ph = pickRandom(policyholders);
        const recorrido = pickRandom(RECORRIDOS);
        const fechaCreacion = fechaCreacionAleatoria();

        const numeroSolicitud = await generarNumeroSolicitud();

        const { estadoInterno, currentDepartment, historial } = construirHistorialDemo({
          acciones: recorrido.acciones,
          fechaCreacion,
        });

        solicitudes.push({
          numeroSolicitud,
          nombreCompleto: ph.name,
          numeroPoliza: ph.id,
          dni: ph.dni,
          nombrePrueba: prestacion.nombrePrueba,
          especialidad: prestacion.especialidad,
          centroMedico: CENTRO_MEDICO_DEMO,
          medicoSolicitante: medico ? { ...medico } : undefined,
          estadoInterno,
          currentDepartment,
          documentos: [],
          historial,
          notas: [
            {
              text: "Solicitud creada (seed demo).",
              author: "PRESTACIONES",
              date: fechaCreacion,
            },
          ],
          createdAt: fechaCreacion,
        });
      }
    }

    await Solicitud.insertMany(solicitudes);
    console.log("Solicitudes creadas:", solicitudes.length);
  } catch (error) {
    console.error("Error en seedSolicitudes:", error);
    throw error;
  }
}

module.exports = seedSolicitudes;
