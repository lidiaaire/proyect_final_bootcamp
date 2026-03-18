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
