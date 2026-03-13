import styles from "@/styles/SolicitudDetalle.module.css";

export default function PDFViewer({ url }) {
  if (!url) {
    return <div>No hay documento seleccionado</div>;
  }

  return (
    <div className={styles.pdfViewer}>
      <iframe
        src={url}
        title="Documento"
        width="100%"
        height="600px"
        style={{ border: "1px solid #ddd", borderRadius: "8px" }}
      />
    </div>
  );
}
