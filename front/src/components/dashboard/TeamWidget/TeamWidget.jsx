import styles from "@/styles/TeamWidget.module.css";
import { Mail, MessageCircle, MoreHorizontal } from "lucide-react";

export default function TeamWidget() {
  const team = [
    { name: "Dr. Martin Pérez", area: "Dirección médica" },
    { name: "Paula Vargas", area: "Responsable" },
    { name: "Alicia Torres", area: "Asesoría jurídica" },
  ];

  return (
    <div className={styles.card}>
      <h4>Equipo</h4>
      <p className={styles.subtitle}>Gestores activos</p>

      <ul className={styles.list}>
        {team.map((person, i) => (
          <li key={i} className={styles.member}>
            <div className={styles.avatar}>{person.name.charAt(0)}</div>

            <div className={styles.info}>
              <p className={styles.name}>{person.name}</p>
              <p className={styles.area}>{person.area}</p>
            </div>

            {/* Acciones */}
            <div className={styles.actions}>
              <MessageCircle size={16} />
              <Mail size={16} />
              <MoreHorizontal size={16} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
