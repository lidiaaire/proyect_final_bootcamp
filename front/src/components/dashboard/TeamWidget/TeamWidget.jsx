import { useState } from "react";
import styles from "@/styles/TeamWidget.module.css";
import { Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { Stethoscope, Briefcase, Scale } from "lucide-react";

const roleIcons = {
  DIRECCION_MEDICA: Stethoscope,
  PRESTACIONES: Briefcase,
  ASESORIA_JURIDICA: Scale,
};

export default function TeamWidget() {
  const [chatUser, setChatUser] = useState(null);

  const team = [
    {
      name: "Dr. Martin Pérez",
      role: "DIRECCION_MEDICA",
      label: "Dirección médica",
      email: "martin.perez@flowly.com",
    },
    {
      name: "Paula Vargas",
      role: "PRESTACIONES",
      label: "Responsable",
      email: "paula.vargas@flowly.com",
    },
    {
      name: "Alicia Torres",
      role: "ASESORIA_JURIDICA",
      label: "Asesoría jurídica",
      email: "alicia.torres@flowly.com",
    },
  ];

  return (
    <>
      <div className={styles.card}>
        <h4>Equipo</h4>
        <p className={styles.subtitle}>Gestores activos</p>

        <ul className={styles.list}>
          {team.map((person, i) => {
            const Icon = roleIcons[person.role];

            return (
              <li key={i} className={styles.member}>
                <div className={`${styles.avatar} ${styles[person.role]}`}>
                  {Icon && <Icon size={16} />}
                </div>

                <div className={styles.info}>
                  <p className={styles.name}>{person.name}</p>
                  <p className={styles.area}>{person.label}</p>
                </div>

                <div className={styles.actions}>
                  {/* CHAT */}
                  <MessageCircle
                    size={16}
                    style={{ cursor: "pointer" }}
                    onClick={() => setChatUser(person)}
                  />

                  {/* EMAIL */}
                  <a
                    href={`mailto:${person.email}`}
                    style={{ color: "#6b7280" }}
                  >
                    <Mail size={16} />
                  </a>

                  <MoreHorizontal size={16} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CHAT MODAL */}

      {chatUser && (
        <div className={styles.chatOverlay}>
          <div className={styles.chatBox}>
            <div className={styles.chatHeader}>
              Chat con {chatUser.name}
              <button
                className={styles.chatClose}
                onClick={() => setChatUser(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.chatMessages}>
              <p className={styles.placeholder}>
                Conversación iniciada con {chatUser.name}
              </p>
            </div>

            <input
              className={styles.chatInput}
              placeholder="Escribe un mensaje..."
            />
          </div>
        </div>
      )}
    </>
  );
}
