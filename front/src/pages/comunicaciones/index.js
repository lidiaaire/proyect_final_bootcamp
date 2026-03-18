// Esta página representa la vista principal de la sección de comunicaciones, donde se muestran los diferentes canales disponibles para los usuarios. Utiliza el hook useRouter de Next.js para manejar la navegación entre los diferentes canales y muestra una lista de canales con sus respectivos íconos y descripciones. Al hacer clic en un canal, el usuario es redirigido a la página específica de ese canal, donde se muestran los mensajes asociados a ese canal utilizando el componente CommunicationsList. Asegúrate de que los nombres de los canales en esta página coincidan con los nombres utilizados en la API para garantizar que se muestren correctamente los mensajes correspondientes a cada canal.
// La página utiliza estilos definidos en Communications.module.css para darle una apariencia atractiva y organizada a la lista de canales. Cada canal se muestra como una tarjeta con un ícono, un título y una descripción, lo que facilita a los usuarios identificar rápidamente el propósito de cada canal y elegir el que desean consultar. Asegúrate de que los estilos estén correctamente aplicados para mejorar la experiencia del usuario al navegar por la sección de comunicaciones.

import { useRouter } from "next/router";
import styles from "../../styles/Communications.module.css";

export default function CommunicationsHome() {
  const router = useRouter();

  const channels = [
    {
      id: "avisos-oficiales",
      name: "Avisos Oficiales",
      icon: "📢",
      description:
        "Normativa interna, acuerdos con hospitales y cambios corporativos.",
    },
    {
      id: "prestaciones",
      name: "Prestaciones",
      icon: "📋",
      description: "Gestión y cambios en autorizaciones médicas.",
    },
    {
      id: "direccion-medica",
      name: "Dirección Médica",
      icon: "🩺",
      description: "Criterios clínicos, protocolos y directrices médicas.",
    },
    {
      id: "asesoria-juridica",
      name: "Asesoría Jurídica",
      icon: "⚖️",
      description: "Aspectos legales, normativas y validaciones jurídicas.",
    },
    {
      id: "general",
      name: "General",
      icon: "👥",
      description: "Comunicación global entre todos los miembros.",
    },
  ];

  return (
    <div className={styles.selectorContainer}>
      <h1 className={styles.selectorTitle}>Canales</h1>

      <div className={styles.channelsGrid}>
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={styles.channelCard}
            onClick={() => router.push(`/comunicaciones/${channel.id}`)}
          >
            <div className={styles.cardIcon}>{channel.icon}</div>

            <div>
              <h3 className={styles.cardTitle}># {channel.name}</h3>
              <p className={styles.cardDescription}>{channel.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
