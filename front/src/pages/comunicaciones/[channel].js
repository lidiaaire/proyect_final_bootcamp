import { useRouter } from "next/router";
import styles from "../../styles/Communications.module.css";

import CommunicationsLayout from "@/components/comunicaciones/CommunicationsLayout/CommunicationsLayout";
import CommunicationsList from "@/components/comunicaciones/CommunicationsList/CommunicationsList";

export default function ChannelPage() {
  const router = useRouter();
  const { channel } = router.query;

  const channelMap = {
    "avisos-oficiales": "Avisos Oficiales",
    prestaciones: "Prestaciones",
    "direccion-medica": "Dirección Médica",
    "asesoria-juridica": "Asesoría Jurídica",
    general: "General",
  };

  return (
    <CommunicationsLayout>
      {({ messages, currentChannel }) => (
        <>
          <h1 className={styles.chatHeader}># {channelMap[channel]}</h1>

          <div className={styles.chatContainer}>
            {messages.length === 0 ? (
              <p>No hay comunicados en este canal</p>
            ) : (
              <CommunicationsList
                channel={currentChannel}
                messages={messages}
              />
            )}
          </div>
        </>
      )}
    </CommunicationsLayout>
  );
}
