import styles from "../../../styles/Communications.module.css";

const typeIcons = {
  normativa: "📢",
  legal: "⚖️",
  acuerdo: "🤝",
  protocolo: "🩺",
  actualizacion: "🔄",
  informativo: "ℹ️",
};
export default function CommunicationsList({ messages }) {
  return (
    <div className={styles.communicationsList}>
      {messages.map((msg, index) => {
        const formattedDate = msg.createdAt
          ? new Date(msg.createdAt).toLocaleDateString()
          : "Sin fecha";

        return (
          <div key={index} className={styles.communicationCard}>
            {/* 🔹 HEADER */}
            <div className={styles.communicationHeader}>
              <div className={styles.titleWrapper}>
                <span className={styles.icon}>
                  {typeIcons[msg.tipo] || "📄"}
                </span>

                <h2 className={styles.title}>{msg.titulo}</h2>
              </div>

              <span className={styles.date}>{formattedDate}</span>
            </div>

            {/* 🔹 META */}
            <div className={styles.meta}>
              <span className={`${styles.badge} ${styles[msg.tipo]}`}>
                {msg.tipo}
              </span>
            </div>

            {/* 🔹 CONTENIDO */}
            <p className={styles.content}>{msg.contenido}</p>

            {/* 🔹 AUTOR */}
            <div className={styles.author}>{msg.autor}</div>
          </div>
        );
      })}
    </div>
  );
}
