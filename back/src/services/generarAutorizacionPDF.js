// Este archivo contiene la lógica para generar un PDF de autorización médica para una solicitud específica. Define la función generarAutorizacionPDF, que toma como parámetro una solicitud y genera un documento PDF con la información relevante de la solicitud, como el número de solicitud, el nombre del asegurado, el número de póliza, la prueba autorizada, el centro médico y la fecha de autorización. El PDF se guarda en una carpeta específica dentro del directorio público de la aplicación, y la función devuelve el nombre del archivo generado y su URL para que pueda ser accedido desde la interfaz de usuario. Esta función es fundamental para proporcionar a los usuarios una forma fácil y profesional de obtener una copia de la autorización médica relacionada con sus solicitudes.
// La función generarAutorizacionPDF utiliza la biblioteca PDFKit para crear el documento PDF, lo que permite un formato personalizado y profesional para la autorización médica. El PDF incluye un título, la información relevante de la solicitud y un mensaje indicando que el documento ha sido generado automáticamente por Flowly. La función maneja la creación del directorio si no existe y gestiona el proceso de escritura del archivo PDF, resolviendo con la información del archivo generado o rechazando en caso de error. Esta funcionalidad mejora la experiencia del usuario al proporcionar una forma clara y accesible de obtener la documentación relacionada con sus solicitudes dentro de la aplicación.
// Importamos los módulos necesarios para trabajar con el sistema de archivos, rutas y generación de PDFs.

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function generarAutorizacionPDF(solicitud) {
  return new Promise((resolve, reject) => {
    const carpeta = path.join(__dirname, "../../public/autorizaciones");

    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }

    const nombreArchivo = `autorizacion_${solicitud.numeroSolicitud}.pdf`;
    const rutaArchivo = path.join(carpeta, nombreArchivo);

    const doc = new PDFDocument();

    const stream = fs.createWriteStream(rutaArchivo);

    doc.pipe(stream);

    doc.fontSize(20).text("AUTORIZACIÓN MÉDICA", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).text(`Solicitud: ${solicitud.numeroSolicitud}`);
    doc.text(`Asegurado: ${solicitud.nombreCompleto}`);
    doc.text(`Póliza: ${solicitud.numeroPoliza}`);

    doc.moveDown();

    doc.text("Prueba autorizada:");
    doc.text(`${solicitud.nombrePrueba}`);

    doc.moveDown();

    doc.text("Centro médico:");
    doc.text(`${solicitud.centroMedico}`);

    doc.moveDown();

    doc.text(`Fecha autorización: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.text("Documento generado automáticamente por Flowly");

    doc.end();

    stream.on("finish", () => {
      resolve({
        nombre: nombreArchivo,
        url: `/autorizaciones/${nombreArchivo}`,
      });
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

module.exports = {
  generarAutorizacionPDF,
};
