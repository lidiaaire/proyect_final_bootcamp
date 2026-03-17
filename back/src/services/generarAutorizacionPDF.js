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
