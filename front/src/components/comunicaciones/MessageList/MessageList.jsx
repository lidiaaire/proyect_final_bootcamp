import styles from "../../../styles/Comunicaciones.module.css";

export default function MessageList({ channel, messages }) {
  return (
    <div className={styles.messagesContainer}>
      <div className={styles.channelHeader}>
        <span className={styles.hash}>#</span> {channel}
      </div>

      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <div className={styles.avatar}>{msg.avatar}</div>

            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <span className={styles.user}>{msg.user}</span>
                <span className={styles.badge}>{msg.role}</span>
                <span className={styles.time}>{msg.time}</span>
              </div>

              <div className={styles.text}>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
