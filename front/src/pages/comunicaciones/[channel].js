// Esta página representa la vista de un canal específico dentro de la sección de comunicaciones. Utiliza el hook useRouter de Next.js para obtener el nombre del canal desde la URL y luego muestra los mensajes asociados a ese canal utilizando el componente CommunicationsList. La página también incluye un encabezado que muestra el nombre del canal en un formato legible para el usuario, utilizando un mapeo de nombres de canales a títulos más amigables. Asegúrate de que los nombres de los canales en el mapeo coincidan con los nombres utilizados en la API para garantizar que se muestren correctamente los mensajes correspondientes a cada canal.
// La página utiliza el componente CommunicationsLayout para proporcionar una estructura común para todas las páginas de comunicaciones, lo que permite compartir la lógica de obtención de mensajes y estado del canal entre las diferentes vistas de canales. Dentro del layout, se muestra un mensaje indicando que no hay comunicados en el canal si la lista de mensajes está vacía, o se muestra el componente CommunicationsList con los mensajes correspondientes al canal actual. Asegúrate de que el componente CommunicationsList esté correctamente implementado para mostrar los mensajes de manera clara y organizada.

import { useRouter } from "next/router";
import styles from "../../styles/Communications.module.css";

import CommunicationsLayout from "@/components/comunicaciones/CommunicationsLayout/CommunicationsLayout";
import CommunicationsList from "@/components/comunicaciones/CommunicationsList/CommunicationsList.";

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
