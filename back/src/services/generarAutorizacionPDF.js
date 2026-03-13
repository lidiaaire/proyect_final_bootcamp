// src/services/generarAutorizacionPDF.js

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/*
Este servicio genera un PDF de autorización simulado.
Para simplificar la demo, generamos un archivo PDF básico usando
un pequeño script de Python (reportlab) que ya viene preparado
en el entorno del proyecto si se desea ampliar.

En la demo simplemente generamos un PDF placeholder.
*/

function generarAutorizacionPDF(solicitud) {
  const carpeta = path.join(__dirname, "../../public/autorizaciones");

  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }

  const nombreArchivo = `autorizacion_${solicitud.numeroSolicitud}.pdf`;
  const rutaArchivo = path.join(carpeta, nombreArchivo);

  const contenido = `
AUTORIZACIÓN MÉDICA

Solicitud: ${solicitud.numeroSolicitud}

Asegurado: ${solicitud.nombreCompleto}

Prueba autorizada:
${solicitud.nombrePrueba}

Centro médico:
${solicitud.centroMedico}

Estado: AUTORIZADA

Fecha: ${new Date().toLocaleDateString()}

---------------------------------------
Documento generado automáticamente
Sistema de autorizaciones
`;

  fs.writeFileSync(rutaArchivo, contenido);

  return {
    nombre: nombreArchivo,
    url: `/autorizaciones/${nombreArchivo}`,
  };
}

module.exports = {
  generarAutorizacionPDF,
};
