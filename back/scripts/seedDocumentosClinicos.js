// Seed de documentos clínicos. Se ejecuta después de seedSolicitudes --
// necesita que las solicitudes y sus asegurados ya existan.
//
// Paso 5: ya no genera solo VOLANTE_MEDICO -- para cada solicitud
// recorre TODOS los tipos documentales que tenga contenido demo según
// su prestación (nombrePrueba -> catalogoPrestaciones.js#clinicoKey) en
// contenidoClinicoDemo.js. No hay una matriz aparte hardcodeada aquí --
// qué tipos le tocan a cada solicitud lo decide únicamente qué claves
// tiene su entrada en CONTENIDO_CLINICO_DEMO, así que nunca puede
// desincronizarse de lo que ya se sembró en el Paso 2.
//
// IDEMPOTENCIA (por solicitud + tipo): antes de generar CADA tipo se
// comprueba si esa solicitud ya tiene un documento con ese tipo exacto
// en su array `documentos`; si lo tiene, se salta (no se regenera el
// PDF ni se duplica la entrada). Así puede ejecutarse este seed (o el
// general) varias veces sin acumular documentos duplicados, y añadir
// una familia nueva al contenido demo no obliga a regenerar las que ya
// existían para esa misma solicitud.

require("dotenv").config();
const Solicitud = require("../src/models/solicitudModel");
const Policyholder = require("../src/models/policyholderModel").default;
const { generarDocumento, yaTieneDocumentoDeTipo } = require("../src/services/documentos/generarDocumento");
const { CATALOGO_PRESTACIONES } = require("./seed/catalogoPrestaciones");
const { CONTENIDO_CLINICO_DEMO } = require("./seed/contenidoClinicoDemo");

const CLINICO_KEY_POR_PRESTACION = Object.fromEntries(
  CATALOGO_PRESTACIONES.map((p) => [p.nombrePrueba, p.clinicoKey]),
);

async function seedDocumentosClinicos() {
  const solicitudes = await Solicitud.find();

  let generadas = 0;
  let saltadasPorIdempotencia = 0;
  let sinAsegurado = 0;
  const generadasPorTipo = {};

  for (const solicitud of solicitudes) {
    const clinicoKey = CLINICO_KEY_POR_PRESTACION[solicitud.nombrePrueba];
    const contenidoPorTipo = clinicoKey ? CONTENIDO_CLINICO_DEMO[clinicoKey] : null;

    if (!contenidoPorTipo) {
      // Prestación fuera del catálogo demo (no debería ocurrir con los
      // datos del Paso 2, pero no es motivo para romper el seed).
      continue;
    }

    let policyholder = null; // se resuelve como mucho una vez por solicitud, solo si hace falta generar algo

    for (const [tipo, contenidoClinico] of Object.entries(contenidoPorTipo)) {
      if (yaTieneDocumentoDeTipo(solicitud.documentos, tipo)) {
        saltadasPorIdempotencia++;
        continue;
      }

      if (!policyholder) {
        policyholder = await Policyholder.findOne({ id: solicitud.numeroPoliza });
        if (!policyholder) {
          // No debería ocurrir (Solicitud.numeroPoliza siempre se crea a
          // partir de un Policyholder real, ver
          // solicitudService.createSolicitud), pero si pasara en datos
          // demo desincronizados, se señala y se salta esta solicitud
          // entera en vez de generar PDFs con datos a medias.
          console.warn(
            `seedDocumentosClinicos: no se encontró Policyholder para la solicitud ${solicitud.numeroSolicitud} (póliza ${solicitud.numeroPoliza}). Se omite.`,
          );
          sinAsegurado++;
          break;
        }
      }

      const { nombre, url } = await generarDocumento(tipo, {
        solicitud,
        policyholder,
        contenidoClinico,
      });

      solicitud.documentos.push({ tipo, nombre, url, fecha: new Date() });
      generadasPorTipo[tipo] = (generadasPorTipo[tipo] || 0) + 1;
      generadas++;
    }

    if (solicitud.isModified("documentos")) {
      await solicitud.save();
    }
  }

  console.log(
    `Documentos clínicos generados: ${generadas} ` +
      `(${Object.entries(generadasPorTipo)
        .map(([tipo, n]) => `${tipo}: ${n}`)
        .join(", ")}). ` +
      `Ya existentes (idempotencia): ${saltadasPorIdempotencia}.` +
      (sinAsegurado ? ` Sin asegurado encontrado: ${sinAsegurado}.` : ""),
  );

  return { generadas, generadasPorTipo, saltadasPorIdempotencia, sinAsegurado };
}

module.exports = seedDocumentosClinicos;
