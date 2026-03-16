import { useState } from "react";
import styles from "../../../styles/Comunicaciones.module.css";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!message) return;
    console.log("Mensaje enviado:", message);
    setMessage("");
  }

  return (
    <div className={styles.messageInputContainer}>
      <input
        className={styles.input}
        placeholder="Escribe un mensaje en el canal..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className={styles.sendButton} onClick={handleSend}>
        Enviar
      </button>
    </div>
  );
}
